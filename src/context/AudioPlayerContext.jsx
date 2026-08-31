import React, { createContext, useContext, useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  getCourseProgress,
  updatePlaybackPosition,
  markLessonComplete,
} from '../store/slices/courseProgressSlice';
import courseService from '../services/api/courseService';
import { notify } from '../services/utils/authUtils';

const AudioPlayerContext = createContext(null);

export const useAudioPlayer = () => {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  return ctx;
};

// Seconds → "1:02" or "1:32:07"; hours only appear past the 60-minute mark.
export const formatTime = (seconds) => {
  if (!seconds || Number.isNaN(seconds)) return '0:00';
  const total = Math.floor(seconds);
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const AudioPlayerProvider = ({ children }) => {
  const dispatch = useDispatch();
  const audioRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const intervalRef = useRef(null);
  // Lessons already sent to the backend as complete this session — avoids duplicate calls/toasts.
  const markedRef = useRef(new Set());
  // The lesson the element is genuinely meant to be playing (survives teardown/error races).
  const activeLessonRef = useRef(null);
  // Last known playback position, used to resume after an error/URL refresh.
  const lastPositionRef = useRef(0);
  // Guards against re-entrant stream-URL recovery.
  const recoveringRef = useRef(false);

  const [courseId, setCourseId] = useState(null);
  const [courseTitle, setCourseTitle] = useState('');
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [completedIds, setCompletedIds] = useState(new Set());

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);

  const hasTrack = Boolean(currentLesson);

  // Persist the current position to the backend (debounced, or immediately on demand).
  const savePosition = useCallback(
    (immediate = false) => {
      const audio = audioRef.current;
      if (!audio || !currentLesson || !courseId) return;
      const positionSeconds = Math.floor(audio.currentTime);
      const doSave = () =>
        dispatch(updatePlaybackPosition({ courseId: Number(courseId), lessonId: currentLesson.id, positionSeconds }));
      clearTimeout(saveTimeoutRef.current);
      if (immediate) doSave();
      else saveTimeoutRef.current = setTimeout(doSave, 2000);
    },
    [dispatch, courseId, currentLesson]
  );

  const markComplete = useCallback(
    (lessonId) => {
      if (!lessonId || !courseId || markedRef.current.has(lessonId)) return;
      markedRef.current.add(lessonId);
      dispatch(markLessonComplete({ courseId: Number(courseId), lessonId })).then((result) => {
        if (result.meta.requestStatus === 'fulfilled') {
          setCompletedIds((prev) => new Set(prev).add(lessonId));
          dispatch(getCourseProgress(courseId));
        } else {
          markedRef.current.delete(lessonId);
        }
      });
    },
    [dispatch, courseId]
  );

  // Point the audio element at a lesson's stream and (optionally) start playing.
  const loadLesson = useCallback(
    async (lesson, startPosition = 0, autoplay = false) => {
      if (!lesson) return;
      try {
        setIsBuffering(true);
        setIsPlaying(false);
        const response = await courseService.getLessonStreamUrl(lesson.id);
        const url = response.data.streamUrl;
        activeLessonRef.current = lesson;
        lastPositionRef.current = startPosition || 0;
        recoveringRef.current = false;
        setCurrentLesson(lesson);
        setCurrentTime(startPosition || 0);

        const audio = audioRef.current;
        if (!audio) return;
        // Attach the handler before load() so a fast (cached) metadata event isn't missed.
        audio.onloadedmetadata = () => {
          if (startPosition > 0 && startPosition < audio.duration) {
            audio.currentTime = startPosition;
          }
          setDuration(audio.duration || 0);
          setIsBuffering(false);
          if (autoplay) {
            audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
          }
        };
        audio.src = url;
        audio.load();
      } catch (error) {
        setIsBuffering(false);
        notify.error('Failed to load lesson. Please try again.');
      }
    },
    []
  );

  // Start (or resume) a course. If the same course is already loaded we leave playback untouched,
  // so navigating back into the course never restarts what's already playing.
  const playCourse = useCallback(
    ({ courseId: id, courseTitle: title, lessons: list, startLesson, startPosition = 0, completedLessonIds = [] }) => {
      const sameCourse = String(id) === String(courseId) && currentLesson;
      setCourseId(id);
      setCourseTitle(title || '');
      setLessons(list || []);
      setCompletedIds(new Set(completedLessonIds));
      if (sameCourse) return;
      markedRef.current = new Set(completedLessonIds);
      if (startLesson) loadLesson(startLesson, startPosition, false);
    },
    [courseId, currentLesson, loadLesson]
  );

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentLesson) return;
    if (audio.paused) {
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, [currentLesson]);

  const seek = useCallback(
    (seconds) => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.currentTime = seconds;
      lastPositionRef.current = seconds;
      setCurrentTime(seconds);
      savePosition(true);
    },
    [savePosition]
  );

  const skip = useCallback((delta) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(Math.max(audio.currentTime + delta, 0), audio.duration || 0);
  }, []);

  const currentIndex = currentLesson ? lessons.findIndex((l) => l.id === currentLesson.id) : -1;
  const hasNext = currentIndex >= 0 && currentIndex < lessons.length - 1;
  const hasPrev = currentIndex > 0;

  const next = useCallback(
    (autoplay = true) => {
      if (hasNext) loadLesson(lessons[currentIndex + 1], 0, autoplay);
    },
    [hasNext, lessons, currentIndex, loadLesson]
  );

  const prev = useCallback(
    (autoplay = true) => {
      if (hasPrev) loadLesson(lessons[currentIndex - 1], 0, autoplay);
    },
    [hasPrev, lessons, currentIndex, loadLesson]
  );

  const setVolume = useCallback((v) => {
    const audio = audioRef.current;
    setVolumeState(v);
    if (audio) {
      audio.volume = v;
      audio.muted = v === 0;
    }
    setIsMuted(v === 0);
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const next = !audio.muted;
    audio.muted = next;
    setIsMuted(next);
  }, []);

  const stop = useCallback(() => {
    // Save BEFORE teardown — removing src resets currentTime to 0.
    savePosition(true);
    activeLessonRef.current = null;
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
    setIsPlaying(false);
    setCurrentLesson(null);
    setLessons([]);
    setCourseId(null);
    setCourseTitle('');
    setCurrentTime(0);
    setDuration(0);
  }, [savePosition]);

  const isCompleted = useCallback((lessonId) => completedIds.has(lessonId), [completedIds]);

  // Keep the completed set in step with the backend (progress can resolve after the course loads,
  // e.g. on a hard refresh). Also seeds markedRef so already-done lessons aren't re-submitted.
  const syncCompleted = useCallback((ids) => {
    if (!ids) return;
    setCompletedIds(new Set(ids));
    ids.forEach((id) => markedRef.current.add(id));
  }, []);

  // --- Audio element event handlers ---
  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentTime(audio.currentTime);
    lastPositionRef.current = audio.currentTime;
    if (audio.duration > 0) setDuration(audio.duration);
    if (currentLesson && audio.duration > 0) {
      const pct = (audio.currentTime / audio.duration) * 100;
      if (pct >= 95 && !completedIds.has(currentLesson.id)) markComplete(currentLesson.id);
    }
  };

  // A presigned stream URL expires after ~1h, so a media error on an active lesson usually just
  // means the link went stale. Fetch a fresh URL once and resume where we were.
  const handleError = () => {
    const lesson = activeLessonRef.current;
    const audio = audioRef.current;
    if (!lesson || !audio || recoveringRef.current) return;
    if (!audio.src && !audio.currentSrc) return; // benign error from teardown (no source)
    recoveringRef.current = true;
    const resumeAt = lastPositionRef.current;
    const wasPlaying = isPlaying;
    courseService
      .getLessonStreamUrl(lesson.id)
      .then((response) => {
        if (activeLessonRef.current?.id !== lesson.id) {
          recoveringRef.current = false;
          return;
        }
        audio.onloadedmetadata = () => {
          if (resumeAt > 0 && resumeAt < audio.duration) audio.currentTime = resumeAt;
          if (wasPlaying) audio.play().catch(() => {});
          recoveringRef.current = false;
        };
        audio.src = response.data.streamUrl;
        audio.load();
      })
      .catch(() => {
        recoveringRef.current = false;
      });
  };

  const handleEnded = () => {
    if (currentLesson) markComplete(currentLesson.id);
    savePosition(true);
    if (hasNext) {
      next(true); // Auto-advance into the next lesson.
    } else {
      setIsPlaying(false);
      notify.success('You finished the last lesson in this course.');
    }
  };

  // Auto-save position every 5 minutes while playing.
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => savePosition(), 300000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, savePosition]);

  // Flush position if the tab is closed mid-lesson.
  useEffect(() => {
    const handler = () => savePosition(true);
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [savePosition]);

  const value = {
    audioRef,
    courseId,
    courseTitle,
    lessons,
    currentLesson,
    completedIds,
    isPlaying,
    isMuted,
    volume,
    currentTime,
    duration,
    isBuffering,
    hasTrack,
    hasNext,
    hasPrev,
    playCourse,
    loadLesson,
    togglePlay,
    seek,
    skip,
    next,
    prev,
    setVolume,
    toggleMute,
    markComplete,
    stop,
    isCompleted,
    syncCompleted,
  };

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
      {/* Single global audio element — lives above the router so playback survives navigation. */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onError={handleError}
      >
        <track kind="captions" />
      </audio>
    </AudioPlayerContext.Provider>
  );
};

export default AudioPlayerContext;
