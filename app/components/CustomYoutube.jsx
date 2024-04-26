"use client";

import React, { useEffect, useRef, useState } from "react";
import MoreVideos from "./MoreVideos";
import Link from "next/link";

export default function CustomYoutubePlayer({
  videoUrl,
  videoId,
  onClose,
  style,
  customOverlayStyle,
}) {
  const playerRef = useRef(null);
  const volumeControlRef = useRef(null);

  const pauseOverlayRef = useRef(null);
  const pauseContainerRef = useRef(null);
  const customOverlayRef = useRef(null);

  const [player, setPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(50);

  let interval;

  let customOverlayTimeout;

  function formatTime(timeInSeconds) {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  }

  useEffect(() => {
    const loadPlayer = () => {
      if (player) {
        // Cue the new video by ID and update duration
        player.cueVideoById({videoId: videoId});
        setTimeout(() => {
          const newDuration = player.getDuration();
          if (newDuration > 0) {
            setDuration(newDuration);
          } else {
            console.log("Waiting for duration after cueing video...");
            // Attempt to fetch duration again if not initially set
            setTimeout(() => {
              const retryDuration = player.getDuration();
              if (retryDuration > 0) {
                setDuration(retryDuration);
              }
            }, 1000);
          }
        }, 500); // Check half a second later to see if metadata is loaded
      } else {
        // Initialize the YouTube Player
        const newPlayer = new window.YT.Player(playerRef.current, {
          videoId: videoId,
          playerVars: {
            controls: 0,
            rel: 0,
            origin: window.location.origin,
          },
          events: {
            onStateChange: (event) => {
              if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
              } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.CUED) {
                setIsPlaying(false);
              }
            },
            onReady: (event) => {
              setPlayer(event.target);
              event.target.unMute();
              // Initially fetch duration if available
              setDuration(event.target.getDuration());
            },
          },
          suggestedQuality: "hd720",
        });
        setPlayer(newPlayer);
      }
    };

    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = loadPlayer;
    } else {
      loadPlayer();
    }

    return () => {
      if (player && typeof player.stopVideo === "function") {
        player.stopVideo();
      }
    };
  }, [videoId]); // This effect runs every time videoId changes

  
  useEffect(() => {
    if (player && typeof player.getCurrentTime === "function") {
      const interval = setInterval(() => {
        const currentTime = player.getCurrentTime();
        setCurrentTime(currentTime);
        const newProgress = (currentTime / duration) * 100;
        setProgress(newProgress);

        const isPaused =
          player.getPlayerState() === window.YT.PlayerState.PAUSED;
        const posterElement = document.querySelector(".v-poster");

        if (posterElement) {
          posterElement.style.display = isPaused ? "block" : "none";
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [player, duration]);

  const togglePlayPause = () => {
    if (player && typeof player.getPlayerState === "function") {
      const playerState = player.getPlayerState();

      if (playerState === window.YT.PlayerState.PLAYING) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
    }
  };

  const handleFullscreenToggle = () => {
    const videoContainer = document.querySelector(".video-container");

    if (document.fullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    } else {
      if (videoContainer.requestFullscreen) {
        videoContainer.requestFullscreen();
      } else if (videoContainer.mozRequestFullScreen) {
        videoContainer.mozRequestFullScreen();
      } else if (videoContainer.webkitRequestFullscreen) {
        videoContainer.webkitRequestFullscreen();
      } else if (videoContainer.msRequestFullscreen) {
        videoContainer.msRequestFullscreen();
      }
    }
  };

  const handleVideoOverlayClick = () => {
    togglePlayPause();
  };

  const handleSeek = (e) => {
    const seekToTime = (e.target.value / 100) * duration;

    if (player && typeof player.seekTo === "function") {
      player.seekTo(seekToTime, true);
    }

    setCurrentTime(seekToTime);

    const newProgress = (seekToTime / duration) * 100;
    setProgress(newProgress);

    updateSliderThumbWidth(newProgress);
  };

  const updateSliderThumbWidth = (progress) => {
    const rangeInput = volumeControlRef.current;
    const thumb =
      rangeInput && rangeInput.querySelector("::-webkit-slider-thumb");

    if (thumb) {
      // Calculate the new width of the thumb
      const thumbWidth = 50 + progress * 0.5; // Adjust the multiplier as needed

      // Apply the new width to the thumb
      thumb.style.width = `${thumbWidth}px`;
    }
  };

  const handleOverlayClick = (e) => {
    const targetClassList = e.target.classList;

    if (
      !targetClassList.contains("v-vlite") &&
      !targetClassList.contains("v-paused")
    ) {
      onClose();
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value, 10);

    if (player && typeof player.setVolume === "function") {
      player.setVolume(newVolume);
    }

    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (
      player &&
      typeof player.isMuted === "function" &&
      typeof player.unMute === "function"
    ) {
      if (isMuted) {
        // Unmute and set volume to the previous non-zero volume
        const previousVolume = volume === 0 ? 50 : volume;
        player.unMute();
        player.setVolume(previousVolume);
        setVolume(previousVolume);
      } else {
        // Mute and set volume to 0
        player.mute();
        setVolume(0);
      }
      setIsMuted(!isMuted);
    }
  };

  const rewind = (seconds) => {
    if (player && typeof player.seekTo === "function") {
      const newTime = currentTime - seconds;
      const seekToTime = newTime < 0 ? 0 : newTime;
      player.seekTo(seekToTime, true);
    }
  };

  const forward = (seconds) => {
    if (player && typeof player.seekTo === "function") {
      const newTime = currentTime + seconds;
      const seekToTime = newTime > duration ? duration : newTime;
      player.seekTo(seekToTime, true);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case " ": // Space key for play/pause
          e.preventDefault(); // Prevent default space key behavior (scrolling)
          togglePlayPause();
          break;
        case "ArrowLeft": // Left arrow for rewinding
          e.preventDefault(); // Prevent default arrow key behavior
          rewind(5); // Rewind by 5 seconds (adjust as needed)
          break;
        case "ArrowRight": // Right arrow for forwarding
          e.preventDefault(); // Prevent default arrow key behavior
          forward(5); // Forward by 5 seconds (adjust as needed)
          break;
        case "f": // F key for full-screen toggle
          handleFullscreenToggle();
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [togglePlayPause, rewind, forward, handleFullscreenToggle]);

  useEffect(() => {
    const handlePauseOverlay = (event) => {
      const playerState = event.data;

      // Check if the player is ready
      if (player && playerState !== undefined) {
        if (playerState === window.YT.PlayerState.PAUSED) {
          // Show your custom overlay immediately
          pauseOverlayRef.current.style.opacity = "0";
          pauseContainerRef.current.style.zIndex = "0";
          customOverlayRef.current.style.display = "block";
        } else {
          // Hide your custom overlay after a delay when playing
          setTimeout(() => {
            pauseOverlayRef.current.style.opacity = "1";
            pauseContainerRef.current.style.zIndex = "41";
            customOverlayRef.current.style.display = "none";
          }, 1000); // Adjust the delay time (in milliseconds) as needed
        }
      }
    };

    // Add an event listener only if the player is available
    if (player) {
      player.addEventListener("onStateChange", handlePauseOverlay);
    }

    return () => {
      // Clear the timeout when the component is unmounted
      clearTimeout(customOverlayTimeout);

      // Remove the event listener when the component is unmounted
      if (player && typeof player.removeEventListener === "function") {
        player.removeEventListener("onStateChange", handlePauseOverlay);
      }
    };
  }, [player]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div
        className="video-container js-media-container js-video-container"
        style={{
          ...style,
          boxShadow: "10px 10px 30px 10px #767676",
        }}
      >
        <div
          className="custom-overlay"
          ref={customOverlayRef}
          style={customOverlayStyle}
        >
          <div className="flex flex-row justify-between pr-5 pt-5">
            <Link href='https://www.youtube.com/playlist?list=PL8wF1aEA4P8NJZUazilLH7ES-T-RQd3Cy' target='_blank' className="flex flex-col items-center">
              <img src="/images/test.png" className="" />
            </Link>

            <MoreVideos />
          </div>
        </div>
        <div className="v-pause-overlay" ref={pauseOverlayRef}></div>
        <div className="v-pause-container" ref={pauseContainerRef}></div>
        <div className="v-vlite v-paused" tabIndex="0">
          <div
            ref={playerRef}
            className="vlite-js js-yt-player rounded-lg"
            data-youtube-id={videoId}
            onClick={handleOverlayClick}
          ></div>
          <div
            className="v-overlayVideo"
            data-v-toggle-play-pause=""
            onClick={handleVideoOverlayClick}
          >
            <div
              className="v-poster"
              data-v-toggle-play-pause=""
              style={{
                backgroundImage:
                  "https://img.youtube.com/vi/qUYkBG488B0/maxresdefault.jpg",
              }}
            ></div>
          </div>
          <div className="v-loader">
            <div className="v-loaderContent">
              <div className="v-loaderBounce1"></div>
              <div className="v-loaderBounce2"></div>
              <div className="v-loaderBounce3"></div>
            </div>
          </div>

          {!isPlaying && (
            <div
              className="v-bigPlayButton"
              data-v-toggle-play-pause=""
              onClick={handleVideoOverlayClick}
            >
              <span className="v-playerIcon v-iconBigPlay">
                <img
                  src="/images/play.png"
                  alt="playbutton"
                  width={500}
                  height={500}
                />
              </span>
            </div>
          )}

          <div className="v-controlBar">
            <div className="v-progressBar">
              <div
                className="v-progressSeek"
                style={{ width: `${progress}%` }}
              ></div>
              <input
                type="range"
                className="v-progressInput"
                min="0"
                max="100"
                step="0.01"
                value={progress}
                onChange={handleSeek}
                onMouseDown={() => clearInterval(interval)}
                orient="horizontal"
              />
            </div>
            <div className="v-controlBarContent">
              <div
                className="v-playPauseButton"
                data-v-toggle-play-pause=""
                onClick={togglePlayPause}
              >
                {isPlaying ? (
                  <span className="v-playerIcon v-iconPause">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8.5 3H5.5C4.67157 3 4 3.57563 4 4.28571V19.7143C4 20.4244 4.67157 21 5.5 21H8.5C9.32843 21 10 20.4244 10 19.7143V4.28571C10 3.57563 9.32843 3 8.5 3Z"
                        fill="white"
                      />
                      <path
                        d="M18.5 3H15.5C14.6716 3 14 3.57563 14 4.28571V19.7143C14 20.4244 14.6716 21 15.5 21H18.5C19.3284 21 20 20.4244 20 19.7143V4.28571C20 3.57563 19.3284 3 18.5 3Z"
                        fill="white"
                      />
                    </svg>
                  </span>
                ) : (
                  <span className="v-playerIcon v-iconPlay">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6.05163 3.10005C5.94589 3.03564 5.82544 3.00113 5.70252 3.00003C5.5796 2.99892 5.45859 3.03127 5.35177 3.09377C5.24496 3.15627 5.15615 3.24671 5.09436 3.35589C5.03258 3.46507 5.00002 3.58911 5 3.7154V20.2846C5.00002 20.4109 5.03258 20.5349 5.09436 20.6441C5.15615 20.7533 5.24496 20.8437 5.35177 20.9062C5.45859 20.9687 5.5796 21.0011 5.70252 21C5.82544 20.9989 5.94589 20.9644 6.05163 20.9L19.6589 12.6154C19.7629 12.552 19.849 12.462 19.9088 12.3541C19.9686 12.2462 20 12.1242 20 12C20 11.8758 19.9686 11.7538 19.9088 11.6459C19.849 11.538 19.7629 11.448 19.6589 11.3846L6.05163 3.10005Z"
                        fill="white"
                        stroke="white"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </span>
                )}
              </div>
              <div className="v-time">
                <span className="v-currentTime">{formatTime(currentTime)}</span>
                &nbsp;/&nbsp;
                <span className="v-duration">{formatTime(duration)}</span>
              </div>
              <div className="v-volume">
                <span
                  className={`v-playerIcon ${
                    isMuted ? "v-iconVolumeMute" : "v-iconVolumeHigh"
                  }`}
                  onClick={toggleMute}
                >
                  {isMuted ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                      <path d="M13 30a1 1 0 0 1-.707-.293L4.586 22H1a1 1 0 0 1-1-1V11a1 1 0 0 1 1-1h3.586l7.707-7.707A1 1 0 0 1 14 3v26a1.002 1.002 0 0 1-1 1z"></path>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 32">
                      <path d="M27.814 28.814a1.5 1.5 0 0 1-1.061-2.56C29.492 23.515 31 19.874 31 16.001s-1.508-7.514-4.247-10.253a1.5 1.5 0 1 1 2.121-2.121C32.179 6.932 34 11.327 34 16.001s-1.82 9.069-5.126 12.374a1.495 1.495 0 0 1-1.061.439zm-5.329-2.829a1.5 1.5 0 0 1-1.061-2.56c4.094-4.094 4.094-10.755 0-14.849a1.5 1.5 0 1 1 2.121-2.121c2.55 2.55 3.954 5.94 3.954 9.546s-1.404 6.996-3.954 9.546a1.495 1.495 0 0 1-1.061.439zm-5.328-2.828a1.5 1.5 0 0 1-1.061-2.56 6.508 6.508 0 0 0 0-9.192 1.5 1.5 0 1 1 2.121-2.121c3.704 3.704 3.704 9.731 0 13.435a1.495 1.495 0 0 1-1.061.439zM13 30a1 1 0 0 1-.707-.293L4.586 22H1a1 1 0 0 1-1-1V11a1 1 0 0 1 1-1h3.586l7.707-7.707A1 1 0 0 1 14 3v26a1.002 1.002 0 0 1-1 1z"></path>
                    </svg>
                  )}
                </span>
                <input
                  ref={volumeControlRef}
                  type="range"
                  className="v-volumeInput"
                  min="0"
                  max="100"
                  step="1"
                  value={volume}
                  onChange={handleVolumeChange}
                  orient="horizontal"
                />
              </div>

              <div className="v-fullscreen " onClick={handleFullscreenToggle}>
                <span className="v-playerIcon v-iconFullscreen">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1 6V3C1 2.46957 1.21071 1.96086 1.58579 1.58579C1.96086 1.21071 2.46957 1 3 1H6M17 12V15C17 15.5304 16.7893 16.0391 16.4142 16.4142C16.0391 16.7893 15.5304 17 15 17H12M12 1H15C15.5304 1 16.0391 1.21071 16.4142 1.58579C16.7893 1.96086 17 2.46957 17 3V6M6 17H3C2.46957 17 1.96086 16.7893 1.58579 16.4142C1.21071 16.0391 1 15.5304 1 15V12"
                      stroke="white"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
                <span className="v-playerIcon v-iconShrink">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                    <path d="M24.586 27.414L29.172 32 32 29.172l-4.586-4.586L32 20H20v12zM0 12h12V0L7.414 4.586 2.875.043.047 2.871l4.539 4.543zm0 17.172L2.828 32l4.586-4.586L12 32V20H0l4.586 4.586zM20 12h12l-4.586-4.586 4.547-4.543L29.133.043l-4.547 4.543L20 0z"></path>
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}