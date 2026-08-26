"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadYouTubeIframeApi } from "./youtubeIframeApi";

// How close (in seconds) the player's own reported position has to be to a seek
// target before we trust it again. seekTo() is asynchronous, so for a window
// after calling it, getCurrentTime() still reports the pre-seek position.
const SEEK_SETTLE_EPSILON = 0.75;
// Safety net: if the player never reports catching up (a glitch, a dropped
// event), stop overriding real updates forever instead of freezing the UI.
const SEEK_SETTLE_TIMEOUT_MS = 4000;
// How often we ask the player for its real position. Kept low-frequency on
// purpose - see the rAF loop below, which interpolates every frame in between
// these polls so the progress bar glides instead of stepping every 200ms.
const PROGRESS_POLL_MS = 200;
const CONTROLS_HIDE_MS = 3000;
// Rapid clicks on skip back/forward accumulate into one seek instead of
// firing seekTo() per click - each seekTo() forces YouTube into BUFFERING,
// and issuing several in quick succession is what made back-and-forth
// skipping look like it was jumping instead of skipping smoothly.
const SKIP_DEBOUNCE_MS = 220;

export function formatPlayerTime(seconds) {
  if (!seconds || Number.isNaN(seconds)) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/**
 * Shared engine behind every custom YouTube-backed player on the site.
 *
 * Handles: on-demand player creation, the poster/loading/playing/buffering
 * state machine, smooth progress tracking, and seeking (skip buttons + scrubber
 * drag) without the UI flickering back to a stale position - seekTo() is async,
 * so naively polling getCurrentTime() right after a seek reads the pre-seek
 * value and fights whatever the user just did. This hook tracks seeks with a
 * generation counter + pending target instead of a blind timeout: a poll tick
 * only trusts the player's reported time once it actually matches (or is close
 * to) the most recent seek we issued, and a newer seek immediately supersedes
 * an older one so rapid clicking accumulates instead of collapsing.
 *
 * `containerRef` is owned by the consuming component (it's the element that
 * also wraps the controls UI) and is only used here as the fullscreen target.
 */
export function useYouTubePlayer({ videoId, containerRef, initialVolume = 80 }) {
  const playerMountRef = useRef(null);
  const playerInstanceRef = useRef(null);
  const progressRafRef = useRef(null);
  const lastPollRef = useRef(0);
  // Anchor point the rAF loop interpolates from between real polls: the last
  // trusted (time, performance.now()) pair. Elapsed wall-clock time since the
  // anchor is added to it every frame, so the bar moves at 60fps instead of
  // snapping every PROGRESS_POLL_MS.
  const anchorTimeRef = useRef(0);
  const anchorTimestampRef = useRef(0);
  const hideControlsTimeoutRef = useRef(null);

  const isSeekingRef = useRef(false);
  const seekGenerationRef = useRef(0);
  const pendingSeekRef = useRef(null); // { generation, targetTime, issuedAt }
  const skipDebounceRef = useRef(null);
  const skipAccumulatorRef = useRef(null); // target time while skip clicks are still accumulating

  // Mirrors of the state below, kept in sync at every write site (not via a
  // useEffect mirror, which would lag a render behind) so imperative code -
  // the poll interval, YT event callbacks - never reads a stale closure value.
  const durationRef = useRef(0);
  const currentTimeRef = useRef(0);
  const volumeRef = useRef(initialVolume);
  const isMutedRef = useRef(false);

  const [playerState, setPlayerState] = useState("poster");
  const [currentTime, setCurrentTimeState] = useState(0);
  const [duration, setDurationState] = useState(0);
  const [progress, setProgress] = useState(0);
  const [volume, setVolumeState] = useState(initialVolume);
  const [isMuted, setIsMutedState] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // True while we're waiting on a seek we issued ourselves to settle. YouTube
  // reports BUFFERING for every seek, not just real network stalls; consumers
  // use this to avoid showing a "loading" spinner over a seek we already know
  // the outcome of - that spinner popping on every skip was the main cause of
  // seeking feeling like it jumped instead of playing smoothly.
  const [isSeekPending, setIsSeekPending] = useState(false);

  const setDuration = useCallback((d) => { durationRef.current = d; setDurationState(d); }, []);
  const setCurrentTime = useCallback((t) => { currentTimeRef.current = t; setCurrentTimeState(t); }, []);
  const setVolume = useCallback((v) => { volumeRef.current = v; setVolumeState(v); }, []);
  const setIsMuted = useCallback((m) => { isMutedRef.current = m; setIsMutedState(m); }, []);

  const isPlaying = playerState === "playing";
  const isPaused = playerState === "paused";
  const isBuffering = playerState === "buffering";
  const isLoading = playerState === "loading";
  const hasStarted = playerState !== "poster";
  // Buffering happens on every seek (skip button or scrubber drag) and briefly
  // on natural network hiccups. Once real playback has started we never want
  // the static thumbnail to reappear over it - that flash is what made
  // seeking feel broken - so buffering is deliberately excluded here.
  const showThumbnailOverlay = ["poster", "loading", "paused", "ended"].includes(playerState);

  const stopProgressTracking = useCallback(() => {
    if (progressRafRef.current) {
      cancelAnimationFrame(progressRafRef.current);
      progressRafRef.current = null;
    }
  }, []);

  // Sets the point the interpolation loop measures from "now" onward. Call
  // this any time currentTime is set from a source of truth (a real poll, a
  // seek, a drag) so the next frame's interpolation continues from there
  // instead of the previous (now stale) anchor.
  const setAnchor = useCallback((time) => {
    anchorTimeRef.current = time;
    anchorTimestampRef.current = performance.now();
  }, []);

  const startProgressTracking = useCallback(() => {
    stopProgressTracking();
    lastPollRef.current = 0; // force an immediate real poll on the first frame

    const tick = () => {
      const player = playerInstanceRef.current;
      const now = performance.now();

      if (player?.getCurrentTime && !isSeekingRef.current) {
        if (now - lastPollRef.current >= PROGRESS_POLL_MS) {
          lastPollRef.current = now;

          const raw = player.getCurrentTime();
          const dur = player.getDuration() || durationRef.current;
          if (dur > 0 && dur !== durationRef.current) setDuration(dur);

          const pending = pendingSeekRef.current;
          let trustRealPosition = true;
          if (pending) {
            if (pending.generation !== seekGenerationRef.current) {
              pendingSeekRef.current = null; // superseded by a newer seek
            } else if (Math.abs(raw - pending.targetTime) < SEEK_SETTLE_EPSILON) {
              pendingSeekRef.current = null; // player caught up with our seek
            } else if (now - pending.issuedAt < SEEK_SETTLE_TIMEOUT_MS) {
              trustRealPosition = false; // still catching up - keep our own target this tick
            } else {
              pendingSeekRef.current = null; // safety net, see constant comment above
            }
          }

          if (trustRealPosition) {
            setAnchor(raw);
            setCurrentTime(raw);
            if (dur > 0) setProgress((raw / dur) * 100);
          }
        } else if (!pendingSeekRef.current) {
          // Between real polls: extrapolate from the anchor so the bar moves
          // every frame instead of holding still for PROGRESS_POLL_MS at a time.
          const dur = durationRef.current;
          const elapsed = (now - anchorTimestampRef.current) / 1000;
          const interpolated = dur > 0
            ? Math.min(anchorTimeRef.current + elapsed, dur)
            : anchorTimeRef.current + elapsed;
          setCurrentTime(interpolated);
          if (dur > 0) setProgress((interpolated / dur) * 100);
        }
      }

      progressRafRef.current = requestAnimationFrame(tick);
    };

    progressRafRef.current = requestAnimationFrame(tick);
  }, [setAnchor, setCurrentTime, setDuration, stopProgressTracking]);

  const initializePlayer = useCallback(() => {
    if (playerInstanceRef.current || !playerMountRef.current) return;

    loadYouTubeIframeApi().then((YT) => {
      // the mount point (or the whole component) can be gone by the time the
      // API finishes loading
      if (!playerMountRef.current || playerInstanceRef.current) return;
      try {
        playerInstanceRef.current = new YT.Player(playerMountRef.current, {
          videoId,
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            enablejsapi: 1,
            fs: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            showinfo: 0,
            origin: window.location.origin,
            widget_referrer: window.location.origin,
          },
          events: {
            onReady: (event) => {
              const player = event.target;
              try {
                const dur = player.getDuration();
                if (dur > 0) setDuration(dur);
                player.setVolume(volumeRef.current);
                if (isMutedRef.current) player.mute();
                else player.unMute();
                setPlayerState("ready");
              } catch (error) {
                console.error("Error in YouTube onReady:", error);
              }
            },
            onStateChange: (event) => {
              const YTState = window.YT.PlayerState;
              switch (event.data) {
                case YTState.UNSTARTED:
                  setPlayerState("ready");
                  break;
                case YTState.ENDED:
                  setPlayerState("ended");
                  setIsSeekPending(false);
                  stopProgressTracking();
                  break;
                case YTState.PLAYING: {
                  setPlayerState("playing");
                  // A self-issued seek is only really "done" once the player
                  // has come back out of BUFFERING - getCurrentTime() can
                  // report the seek target while data for that position is
                  // still loading, so relying on time alone (see the poll
                  // loop above) clears the flag too early and lets the
                  // spinner flash for the buffering that follows.
                  setIsSeekPending(false);
                  startProgressTracking();
                  const player = playerInstanceRef.current;
                  if (player) {
                    try {
                      const dur = player.getDuration();
                      if (dur > 0 && dur !== durationRef.current) setDuration(dur);
                    } catch (e) {}
                  }
                  break;
                }
                case YTState.PAUSED:
                  setPlayerState("paused");
                  setIsSeekPending(false);
                  stopProgressTracking();
                  break;
                case YTState.BUFFERING:
                  setPlayerState("buffering");
                  break;
                case YTState.CUED:
                  setPlayerState("ready");
                  break;
              }
            },
            onError: (event) => {
              console.error("YouTube Player Error:", event.data);
              setPlayerState("poster");
            },
          },
        });
      } catch (error) {
        console.error("Error initializing YouTube player:", error);
        setPlayerState("poster");
      }
    });
  }, [videoId, setDuration, startProgressTracking, stopProgressTracking]);

  useEffect(() => {
    return () => {
      stopProgressTracking();
      if (hideControlsTimeoutRef.current) clearTimeout(hideControlsTimeoutRef.current);
      if (skipDebounceRef.current) clearTimeout(skipDebounceRef.current);
      if (playerInstanceRef.current) {
        try { playerInstanceRef.current.destroy(); } catch (e) {}
        playerInstanceRef.current = null;
      }
    };
  }, [stopProgressTracking]);

  const play = useCallback(() => {
    if (playerState === "poster") {
      setPlayerState("loading");
      initializePlayer();
    } else {
      playerInstanceRef.current?.playVideo();
    }
  }, [playerState, initializePlayer]);

  const pause = useCallback(() => {
    playerInstanceRef.current?.pauseVideo();
  }, []);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, play, pause]);

  const applySeek = useCallback((targetTime) => {
    const player = playerInstanceRef.current;
    if (!player) return;
    const dur = player.getDuration() || durationRef.current;
    const clamped = Math.max(0, Math.min(dur, targetTime));
    seekGenerationRef.current += 1;
    pendingSeekRef.current = {
      generation: seekGenerationRef.current,
      targetTime: clamped,
      issuedAt: Date.now(),
    };
    setIsSeekPending(true);
    player.seekTo(clamped, true);
    setAnchor(clamped);
    setCurrentTime(clamped);
    if (dur > 0) setProgress((clamped / dur) * 100);
  }, [setAnchor, setCurrentTime]);

  // Skip clicks only update the UI instantly; the real seekTo() call is
  // debounced so clicking back/forth several times fast issues one seek
  // instead of one per click. Each seekTo() forces YouTube into BUFFERING,
  // so firing several in a row is what made rapid skipping look like it was
  // jumping around instead of moving smoothly.
  const skip = useCallback((deltaSeconds) => {
    const player = playerInstanceRef.current;
    if (!player) return;
    const dur = player.getDuration() || durationRef.current;

    const base = skipAccumulatorRef.current != null
      ? skipAccumulatorRef.current
      : (player.getCurrentTime ? player.getCurrentTime() : currentTimeRef.current);
    const target = Math.max(0, Math.min(dur, base + deltaSeconds));
    skipAccumulatorRef.current = target;

    setAnchor(target);
    setCurrentTime(target);
    if (dur > 0) setProgress((target / dur) * 100);

    if (skipDebounceRef.current) clearTimeout(skipDebounceRef.current);
    skipDebounceRef.current = setTimeout(() => {
      skipDebounceRef.current = null;
      const finalTarget = skipAccumulatorRef.current;
      skipAccumulatorRef.current = null;
      if (finalTarget != null) applySeek(finalTarget);
    }, SKIP_DEBOUNCE_MS);
  }, [applySeek, setAnchor, setCurrentTime]);

  const beginScrub = useCallback(() => {
    isSeekingRef.current = true;
  }, []);

  // Visual-only update while dragging - no real seekTo() per pixel of drag,
  // that would flood YouTube with requests and stutter badly. The real seek
  // happens once, in commitScrub, on release.
  const scrub = useCallback((fractionPercent) => {
    const dur = durationRef.current;
    const time = (fractionPercent / 100) * dur;
    setProgress(fractionPercent);
    setAnchor(time);
    setCurrentTime(time);
  }, [setAnchor, setCurrentTime]);

  const commitScrub = useCallback((fractionPercent) => {
    const dur = durationRef.current;
    isSeekingRef.current = false;
    applySeek((fractionPercent / 100) * dur);
  }, [applySeek]);

  const setVolumeLevel = useCallback((next) => {
    const clamped = Math.max(0, Math.min(100, next));
    setVolume(clamped);
    setIsMuted(clamped === 0);
    const player = playerInstanceRef.current;
    if (player) {
      player.setVolume(clamped);
      if (clamped > 0) player.unMute();
    }
  }, [setVolume, setIsMuted]);

  const toggleMute = useCallback(() => {
    const player = playerInstanceRef.current;
    if (!player) return;
    if (isMutedRef.current) {
      const vol = volumeRef.current || 50;
      player.unMute();
      player.setVolume(vol);
      setVolume(vol);
      setIsMuted(false);
    } else {
      player.mute();
      setIsMuted(true);
    }
  }, [setVolume, setIsMuted]);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef?.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen();
    }
  }, [containerRef]);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimeoutRef.current) clearTimeout(hideControlsTimeoutRef.current);
    if (isPlaying) {
      hideControlsTimeoutRef.current = setTimeout(() => setShowControls(false), CONTROLS_HIDE_MS);
    }
  }, [isPlaying]);

  // For onMouseLeave: hide immediately instead of waiting out the auto-hide delay.
  const hideControls = useCallback(() => {
    if (hideControlsTimeoutRef.current) clearTimeout(hideControlsTimeoutRef.current);
    if (isPlaying) setShowControls(false);
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      if (hideControlsTimeoutRef.current) clearTimeout(hideControlsTimeoutRef.current);
    }
  }, [isPlaying]);

  return {
    playerMountRef,
    playerState,
    isPlaying,
    isPaused,
    isBuffering,
    isLoading,
    isSeekPending,
    hasStarted,
    showThumbnailOverlay,
    currentTime,
    duration,
    progress,
    volume,
    isMuted,
    showControls,
    isFullscreen,
    play,
    pause,
    togglePlayPause,
    skip,
    beginScrub,
    scrub,
    commitScrub,
    setVolumeLevel,
    toggleMute,
    toggleFullscreen,
    resetControlsTimer,
    hideControls,
  };
}
