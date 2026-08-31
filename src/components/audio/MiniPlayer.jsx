import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Play, Pause, SkipBack, SkipForward, X } from 'lucide-react';
import { useAudioPlayer, formatTime } from '../../context/AudioPlayerContext';

const MiniPlayer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const barRef = useRef(null);
  const {
    hasTrack,
    courseId,
    courseTitle,
    currentLesson,
    isPlaying,
    currentTime,
    duration,
    hasNext,
    hasPrev,
    togglePlay,
    next,
    prev,
    seek,
    stop,
  } = useAudioPlayer();

  // Show only when something's loaded and we're not on the full player (which has its own controls).
  const visible = hasTrack && !location.pathname.startsWith('/course-player');

  // Reserve space at the bottom of the page so the fixed bar never covers page content.
  useEffect(() => {
    if (!visible) return undefined;
    const height = barRef.current?.offsetHeight || 64;
    const previous = document.body.style.paddingBottom;
    document.body.style.paddingBottom = `${height}px`;
    return () => {
      document.body.style.paddingBottom = previous;
    };
  }, [visible, currentLesson]);

  if (!visible) return null;

  return (
    <div
      ref={barRef}
      className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]"
    >
      {/* Seek bar sits flush along the top edge of the bar */}
      <input
        type="range"
        min="0"
        max={duration || 0}
        value={currentTime}
        onChange={(e) => seek(parseFloat(e.target.value))}
        aria-label="Seek"
        className="w-full h-1 accent-primary-600 cursor-pointer align-top"
      />

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 flex items-center gap-3">
        {/* Title — tap to return to the course */}
        <button
          type="button"
          onClick={() => navigate(`/course-player/${courseId}`)}
          className="flex-1 min-w-0 text-left"
        >
          <p className="text-sm font-medium text-gray-900 truncate">{currentLesson?.title}</p>
          <p className="text-xs text-gray-500 truncate">{courseTitle}</p>
        </button>

        <span className="hidden sm:block text-xs text-gray-500 tabular-nums whitespace-nowrap">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => prev()}
            disabled={!hasPrev}
            aria-label="Previous lesson"
            className="p-2 text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:hover:text-gray-500"
          >
            <SkipBack size={18} />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="p-2.5 bg-primary-600 text-white rounded-full hover:bg-primary-700"
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>

          <button
            type="button"
            onClick={() => next()}
            disabled={!hasNext}
            aria-label="Next lesson"
            className="p-2 text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:hover:text-gray-500"
          >
            <SkipForward size={18} />
          </button>

          <button
            type="button"
            onClick={stop}
            aria-label="Close player"
            className="p-2 ml-1 text-gray-400 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MiniPlayer;
