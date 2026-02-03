"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";

/**
 * Custom Video Player with YouTube backend
 * 
 * Strategy for seamless experience:
 * 1. POSTER STATE: Show thumbnail + custom play button (no YouTube visible)
 * 2. LOADING STATE: Show thumbnail + spinner (YouTube loads invisibly behind)
 * 3. PLAYING STATE: Show YouTube + transparent click overlay + our controls
 * 4. PAUSED STATE: Show dark overlay hiding YouTube suggestions + play button
 * 
 * This approach hides YouTube's "More videos" panel that appears on pause
 * by covering it with our branded overlay - like Netflix does.
 */

export default function NewsVideoPlayer({ videoId }) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const playerInstanceRef = useRef(null);
  const progressInterval = useRef(null);
  const hideControlsTimeout = useRef(null);

  // Player states
  const [playerState, setPlayerState] = useState('poster'); // poster, loading, ready, playing, paused, ended, buffering
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);

  // YouTube thumbnail URLs (try maxres first, fallback to hq)
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  const fallbackThumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  const [thumbnailSrc, setThumbnailSrc] = useState(thumbnailUrl);

  // Derived states
  const isPlaying = playerState === 'playing';
  const isPaused = playerState === 'paused';
  const isBuffering = playerState === 'buffering';
  const isLoading = playerState === 'loading';
  const hasStarted = playerState !== 'poster';
  // Only show thumbnail overlay when NOT playing (so video is visible when playing)
  // Show overlay for: poster, loading, paused, ended, buffering
  // DON'T show for: playing, ready (when ready, video should be visible)
  const showThumbnailOverlay = ['poster', 'loading', 'paused', 'ended', 'buffering'].includes(playerState);

  // Format time display
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Load YouTube IFrame API
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScript = document.getElementsByTagName('script')[0];
      firstScript.parentNode.insertBefore(tag, firstScript);
    }

    return () => {
      stopProgressTracking();
      if (playerInstanceRef.current) {
        try {
          playerInstanceRef.current.destroy();
        } catch (e) {}
        playerInstanceRef.current = null;
      }
    };
  }, []);

  // Initialize player when user clicks play
  const initializePlayer = useCallback(() => {
    if (playerInstanceRef.current || !playerRef.current) {
      return;
    }

    const checkAndInit = () => {
      if (window.YT && window.YT.Player) {
        try {
          playerInstanceRef.current = new window.YT.Player(playerRef.current, {
            videoId: videoId,
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
              onReady: handlePlayerReady,
              onStateChange: handleStateChange,
              onError: handleError,
            },
          });
        } catch (error) {
          console.error('Error initializing YouTube player:', error);
          setPlayerState('poster');
        }
      } else {
        setTimeout(checkAndInit, 100);
      }
    };

    // Wait for API to be ready
    if (window.YT && window.YT.Player) {
      checkAndInit();
    } else {
      window.onYouTubeIframeAPIReady = checkAndInit;
      checkAndInit();
    }
  }, [videoId]);

  const handlePlayerReady = (event) => {
    const player = event.target;
    try {
      const dur = player.getDuration();
      if (dur && dur > 0) {
        setDuration(dur);
      }
      player.setVolume(volume);
      if (!isMuted) {
        player.unMute();
      } else {
        player.mute();
      }
      // Player will auto-play due to autoplay: 1
      setPlayerState('ready');
    } catch (error) {
      console.error('Error in handlePlayerReady:', error);
    }
  };

  const handleStateChange = (event) => {
    const state = event.data;
    
    switch (state) {
      case window.YT.PlayerState.UNSTARTED:
        setPlayerState('ready');
        break;
      case window.YT.PlayerState.ENDED:
        setPlayerState('ended');
        stopProgressTracking();
        break;
      case window.YT.PlayerState.PLAYING:
        setPlayerState('playing');
        startProgressTracking();
        // Update duration if not set
        if (playerInstanceRef.current) {
          try {
            const dur = playerInstanceRef.current.getDuration();
            if (dur > 0 && dur !== duration) {
              setDuration(dur);
            }
          } catch (e) {
            console.error('Error getting duration:', e);
          }
        }
        break;
      case window.YT.PlayerState.PAUSED:
        setPlayerState('paused');
        stopProgressTracking();
        break;
      case window.YT.PlayerState.BUFFERING:
        setPlayerState('buffering');
        break;
      case window.YT.PlayerState.CUED:
        setPlayerState('ready');
        break;
    }
  };

  const handleError = (event) => {
    console.error('YouTube Player Error:', event.data);
    setPlayerState('poster');
  };

  // Progress tracking
  const startProgressTracking = () => {
    stopProgressTracking();
    progressInterval.current = setInterval(() => {
      if (playerInstanceRef.current?.getCurrentTime) {
        const time = playerInstanceRef.current.getCurrentTime();
        const dur = playerInstanceRef.current.getDuration() || duration;
        setCurrentTime(time);
        if (dur > 0 && !isSeeking) {
          setProgress((time / dur) * 100);
        }
      }
    }, 200);
  };

  const stopProgressTracking = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };

  // Control handlers
  const handlePlay = () => {
    if (playerState === 'poster') {
      setPlayerState('loading');
      initializePlayer();
    } else if (playerInstanceRef.current) {
      playerInstanceRef.current.playVideo();
    }
  };

  const handlePause = () => {
    if (playerInstanceRef.current) {
      playerInstanceRef.current.pauseVideo();
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  };

  const handleSeekStart = () => {
    setIsSeeking(true);
  };

  const handleSeek = (e) => {
    const value = parseFloat(e.target.value);
    setProgress(value);
    const seekTime = (value / 100) * duration;
    setCurrentTime(seekTime);
  };

  const handleSeekEnd = (e) => {
    const value = parseFloat(e.target.value);
    const seekTime = (value / 100) * duration;
    if (playerInstanceRef.current?.seekTo) {
      playerInstanceRef.current.seekTo(seekTime, true);
    }
    setIsSeeking(false);
  };

  const skipTime = (seconds) => {
    if (!playerInstanceRef.current) return;
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    playerInstanceRef.current.seekTo(newTime, true);
    setCurrentTime(newTime);
    setProgress((newTime / duration) * 100);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value, 10);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (playerInstanceRef.current) {
      playerInstanceRef.current.setVolume(newVolume);
      if (newVolume > 0) playerInstanceRef.current.unMute();
    }
  };

  const toggleMute = () => {
    if (!playerInstanceRef.current) return;
    if (isMuted) {
      const vol = volume || 50;
      playerInstanceRef.current.unMute();
      playerInstanceRef.current.setVolume(vol);
      setVolume(vol);
      setIsMuted(false);
    } else {
      playerInstanceRef.current.mute();
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  // Fullscreen change listener
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // Auto-hide controls when playing
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
    if (isPlaying) {
      hideControlsTimeout.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
    }
  }, [isPlaying]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't capture if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skipTime(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          skipTime(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleVolumeChange({ target: { value: Math.min(100, volume + 10) } });
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleVolumeChange({ target: { value: Math.max(0, volume - 10) } });
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'Escape':
          if (isFullscreen) {
            document.exitFullscreen();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, volume, currentTime, duration, isMuted, isFullscreen]);

  return (
    <div
      ref={containerRef}
      className="relative rounded-2xl overflow-hidden bg-black select-none"
      style={{ boxShadow: '0 25px 50px -12px rgba(71, 79, 122, 0.35)' }}
      onMouseMove={resetControlsTimer}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Aspect ratio container */}
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        
        {/* YouTube Player Container - Always present, YouTube will inject iframe here */}
        <div
          ref={playerRef}
          className="absolute inset-0 w-full h-full"
          style={{ 
            zIndex: 1,
            minHeight: '100%',
            minWidth: '100%',
            backgroundColor: 'transparent'
          }}
        />

        {/* 
          THUMBNAIL OVERLAY - Shows thumbnail when not playing
          This hides YouTube's UI during poster/loading/paused states
          IMPORTANT: Only show when NOT playing, so video is visible
        */}
        {showThumbnailOverlay && !isPlaying && (
          <div
            className="absolute inset-0 transition-opacity duration-300"
            style={{ zIndex: 10 }}
          >
            {/* Thumbnail background */}
            <Image
              src={thumbnailSrc}
              alt="Video thumbnail"
              fill
              className="object-cover"
              priority
              onError={() => setThumbnailSrc(fallbackThumbnail)}
            />
            
            {/* Gradient overlays for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />
            
            {/* Dark overlay when paused (hides YouTube suggestions) */}
            {(isPaused || playerState === 'ended') && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
            )}
          </div>
        )}

        {/* Click area for play/pause (above overlay, below controls) */}
        {hasStarted && (
          <div
            className="absolute inset-0 cursor-pointer"
            style={{ zIndex: 15, bottom: '52px' }}
            onClick={togglePlayPause}
            onDoubleClick={toggleFullscreen}
          />
        )}

        {/* Center content: Play button / Loading spinner */}
        {(showThumbnailOverlay || (!isPlaying && showControls && hasStarted)) && (
          <div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300"
            style={{ zIndex: 20 }}
          >
          {/* Loading spinner */}
          {isLoading || isBuffering ? (
            <div className="relative">
              <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full border-4 border-white/20 border-t-[#AD88C6] animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-[#AD88C6]/20" />
              </div>
            </div>
          ) : !isPlaying ? (
            /* Play button */
              <button
                className="pointer-events-auto w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-[#AD88C6] 
                          flex items-center justify-center shadow-2xl shadow-[#AD88C6]/40
                          hover:bg-[#9B7BB4] hover:scale-110 active:scale-95
                          hover:shadow-[0_0_30px_rgba(173,136,198,0.8)] hover:ring-4 hover:ring-[#AD88C6]/30
                          transition-all duration-200"
                onClick={handlePlay}
              >
              <svg className="w-8 h-8 lg:w-10 lg:h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
            ) : null}
          </div>
        )}

        {/* Duration badge (poster state only) */}
        {playerState === 'poster' && duration > 0 && (
          <div 
            className="absolute bottom-4 right-4 px-2.5 py-1 bg-black/80 rounded-md text-white text-sm font-medium"
            style={{ zIndex: 25 }}
          >
            {formatTime(duration)}
          </div>
        )}

        {/* Control bar */}
        {hasStarted && (
          <div
            className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${
              showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
            }`}
            style={{ zIndex: 30 }}
            onMouseEnter={() => setShowControls(true)}
          >
            {/* Progress bar */}
            <div className="relative h-1.5 group/progress cursor-pointer bg-white/20 hover:h-2 transition-all hover:bg-white/30">
              {/* Played progress */}
              <div
                className="absolute top-0 left-0 h-full bg-[#AD88C6] transition-all group-hover/progress:bg-[#9B7BB4] group-hover/progress:shadow-[0_0_8px_rgba(173,136,198,0.6)]"
                style={{ width: `${progress}%` }}
              />
              
              {/* Scrubber thumb */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg
                          scale-0 group-hover/progress:scale-100 transition-transform
                          group-hover/progress:shadow-[0_0_12px_rgba(173,136,198,0.8)] group-hover/progress:ring-2 group-hover/progress:ring-[#AD88C6]/50"
                style={{ left: `calc(${progress}% - 8px)` }}
              />
              
              {/* Invisible range input */}
              <input
                type="range"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                min="0"
                max="100"
                step="0.1"
                value={progress}
                onMouseDown={handleSeekStart}
                onTouchStart={handleSeekStart}
                onChange={handleSeek}
                onMouseUp={handleSeekEnd}
                onTouchEnd={handleSeekEnd}
              />
            </div>

            {/* Controls row */}
            <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-gradient-to-t from-black/95 via-black/80 to-transparent">
              {/* Play/Pause */}
              <button
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#AD88C6]/20 hover:border hover:border-[#AD88C6]/40 transition-all group/play"
                onClick={togglePlayPause}
              >
                {isPlaying ? (
                  <svg className="w-6 h-6 text-white group-hover/play:text-[#AD88C6] transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-white group-hover/play:text-[#AD88C6] transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* Skip back */}
              <button
                className="hidden sm:flex w-10 h-10 items-center justify-center rounded-full hover:bg-[#AD88C6]/20 hover:border hover:border-[#AD88C6]/40 transition-all group/skip"
                onClick={() => skipTime(-10)}
              >
                <svg className="w-5 h-5 text-white group-hover/skip:text-[#AD88C6] transition-colors" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.5 3C17.15 3 21.08 6.03 22.47 10.22L20.1 11C19.05 7.81 16.04 5.5 12.5 5.5C10.54 5.5 8.77 6.22 7.38 7.38L10 10H3V3L5.6 5.6C7.45 4 9.85 3 12.5 3M10 12V22H8V14H6V12H10M18 14V20C18 21.11 17.11 22 16 22H14C12.9 22 12 21.11 12 20V14C12 12.9 12.9 12 14 12H16C17.11 12 18 12.9 18 14M14 14V20H16V14H14Z"/>
                </svg>
              </button>

              {/* Skip forward */}
              <button
                className="hidden sm:flex w-10 h-10 items-center justify-center rounded-full hover:bg-[#AD88C6]/20 hover:border hover:border-[#AD88C6]/40 transition-all group/skip"
                onClick={() => skipTime(10)}
              >
                <svg className="w-5 h-5 text-white group-hover/skip:text-[#AD88C6] transition-colors" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.5 3C6.85 3 2.92 6.03 1.53 10.22L3.9 11C4.95 7.81 7.96 5.5 11.5 5.5C13.46 5.5 15.23 6.22 16.62 7.38L14 10H21V3L18.4 5.6C16.55 4 14.15 3 11.5 3M10 12V22H8V14H6V12H10M18 14V20C18 21.11 17.11 22 16 22H14C12.9 22 12 21.11 12 20V14C12 12.9 12.9 12 14 12H16C17.11 12 18 12.9 18 14M14 14V20H16V14H14Z"/>
                </svg>
              </button>

              {/* Time */}
              <div className="text-[#AD88C6] text-xs sm:text-sm font-medium tabular-nums px-2">
                <span className="text-[#AD88C6]/90">{formatTime(currentTime)}</span>
                <span className="mx-1 text-[#AD88C6]/50">/</span>
                <span className="text-[#AD88C6]/70">{formatTime(duration)}</span>
              </div>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Volume */}
              <div className="hidden sm:flex items-center gap-2 group/vol">
                <button
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#AD88C6]/20 hover:border hover:border-[#AD88C6]/40 transition-all flex-shrink-0 group/volbtn"
                  onClick={toggleMute}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? (
                    <svg className="w-5 h-5 text-white group-hover/volbtn:text-[#AD88C6] transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                    </svg>
                  ) : volume < 50 ? (
                    <svg className="w-5 h-5 text-white group-hover/volbtn:text-[#AD88C6] transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M5 9v6h4l5 5V4L9 9H5zm11.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-white group-hover/volbtn:text-[#AD88C6] transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                    </svg>
                  )}
                </button>
                <div className="w-0 group-hover/vol:w-24 overflow-hidden transition-all duration-300 ease-out">
                  <div className="flex items-center gap-2 px-1">
                    <input
                      type="range"
                      className="w-20 h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer
                                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5
                                [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-white
                                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg
                                [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-all
                                [&::-webkit-slider-thumb]:hover:scale-125
                                [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5
                                [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0
                                [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer
                                [&::-moz-range-track]:bg-white/20 [&::-moz-range-track]:rounded-full
                                [&::-moz-range-progress]:bg-white/40 [&::-moz-range-progress]:rounded-full"
                      style={{
                        background: `linear-gradient(to right, white 0%, white ${volume}%, rgba(255,255,255,0.2) ${volume}%, rgba(255,255,255,0.2) 100%)`
                      }}
                      min="0"
                      max="100"
                      step="1"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                    />
                    <span className="text-white text-xs font-medium tabular-nums min-w-[2.5rem] text-right">
                      {isMuted ? 0 : volume}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Fullscreen */}
              <button
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#AD88C6]/20 hover:border hover:border-[#AD88C6]/40 transition-all group/fs"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? (
                  <svg className="w-5 h-5 text-white group-hover/fs:text-[#AD88C6] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white group-hover/fs:text-[#AD88C6] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CSS to ensure YouTube iframe is visible and hide unwanted elements */}
      <style jsx global>{`
        /* Ensure YouTube iframe is visible when playing */
        iframe[src*="youtube.com"] {
          display: block !important;
          opacity: 1 !important;
          visibility: visible !important;
        }
        
        /* Hide YouTube UI elements we don't want */
        .ytp-chrome-top,
        .ytp-chrome-bottom,
        .ytp-watermark,
        .ytp-show-cards-title,
        .ytp-pause-overlay,
        .ytp-gradient-top,
        .ytp-gradient-bottom,
        .annotation,
        .iv-branding,
        .ytp-ce-element,
        .ytp-endscreen-content,
        .ytp-impression-link {
          display: none !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
      `}</style>
    </div>
  );
}
