import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  List,
  X,
  User,
} from 'lucide-react';
import { getCourseById } from '../../store/slices/courseSlice';
import { getCourseProgress } from '../../store/slices/courseProgressSlice';
import { useAudioPlayer, formatTime } from '../../context/AudioPlayerContext';

const CoursePlayer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedCourse, isLoading } = useSelector((state) => state.course);
  const { currentProgress } = useSelector((state) => state.courseProgress);

  const {
    currentLesson,
    isPlaying,
    isMuted,
    volume,
    currentTime,
    duration,
    isBuffering,
    completedIds,
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
    isCompleted,
    syncCompleted,
  } = useAudioPlayer();

  const [isLessonListOpen, setIsLessonListOpen] = useState(false);
  const [progressReady, setProgressReady] = useState(false);
  const initializedRef = useRef(null);

  // Fetch course + progress on mount. progressReady flips once the progress request settles
  // (loaded or empty) so init below can rely on a final progress value, even on a hard refresh.
  useEffect(() => {
    if (!courseId) return;
    setProgressReady(false);
    dispatch(getCourseById(courseId));
    dispatch(getCourseProgress(courseId)).finally(() => setProgressReady(true));
  }, [courseId, dispatch]);

  // Hand the course to the global player once it and its progress are ready. Guarded so returning
  // to a course that's already playing never restarts it.
  useEffect(() => {
    if (!selectedCourse?.lessons?.length || !progressReady) return;
    if (initializedRef.current === String(courseId)) return;
    initializedRef.current = String(courseId);

    const lessonsList = selectedCourse.lessons;
    const completed = new Set(currentProgress?.completedLessonIds || []);
    // Prefer resuming the exact lesson last played; otherwise the first unfinished one.
    const savedLesson = currentProgress?.currentLessonId
      ? lessonsList.find((l) => l.id === currentProgress.currentLessonId)
      : null;
    const firstUncompleted = lessonsList.find((l) => !completed.has(l.id));
    const startLesson = savedLesson || firstUncompleted || lessonsList[lessonsList.length - 1];
    const startPosition = savedLesson ? currentProgress?.currentPositionSeconds || 0 : 0;

    playCourse({
      courseId,
      courseTitle: selectedCourse.title,
      lessons: lessonsList,
      startLesson,
      startPosition,
      completedLessonIds: currentProgress?.completedLessonIds || [],
    });
  }, [selectedCourse, currentProgress, progressReady, courseId, playCourse]);

  // Keep completion state in sync with the backend whenever progress (re)loads — including on refresh.
  useEffect(() => {
    if (currentProgress?.completedLessonIds) {
      syncCompleted(currentProgress.completedLessonIds);
    }
  }, [currentProgress, syncCompleted]);

  // Thin adapters so the markup stays declarative.
  const isLessonCompleted = (lessonId) => isCompleted(lessonId);
  const handleSeek = (e) => seek(parseFloat(e.target.value));
  const handleVolumeChange = (e) => setVolume(parseFloat(e.target.value));
  const handleMarkComplete = () => currentLesson && markComplete(currentLesson.id);
  const openLesson = (lesson) => {
    loadLesson(lesson, 0, true);
    setIsLessonListOpen(false);
  };

  // Stats
  const totalLessons = selectedCourse?.lessonCount || 0;
  const completedCount = completedIds.size;
  const completionPercentage = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

  if (isLoading || !selectedCourse) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading course...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-gray-600 hover:text-primary-600 transition-colors font-medium"
            >
              <ChevronLeft size={20} className="mr-1" />
              Back to Dashboard
            </button>

            <button
              onClick={() => setIsLessonListOpen(!isLessonListOpen)}
              className="lg:hidden flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <List size={20} className="mr-2" />
              Lessons
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Progress Stats */}
        {currentProgress && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-sm text-gray-500 mb-1">Total lessons</p>
              <p className="text-2xl font-semibold text-gray-900">{totalLessons}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-sm text-gray-500 mb-1">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">{completedCount}</p>
            </div>

            <div className="col-span-2 md:col-span-1 bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-sm text-gray-500 mb-1">Progress</p>
              <p className="text-2xl font-semibold text-gray-900">{Math.round(completionPercentage)}%</p>
              <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-600 rounded-full transition-all"
                  style={{ width: `${Math.round(completionPercentage)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Player Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {/* Course Info */}
              <div className="bg-primary-700 p-6 text-white">
                <h1 className="text-2xl font-bold">{selectedCourse.title}</h1>
                {selectedCourse.instructor && (
                  <p className="text-primary-100 flex items-center text-sm mt-1">
                    <User size={16} className="mr-2" />
                    by {selectedCourse.instructor}
                  </p>
                )}
              </div>

              {/* Current Lesson Info */}
              {currentLesson && (
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900">{currentLesson.title}</h2>
                      {currentLesson.description && (
                        <p className="text-gray-600 mt-1">{currentLesson.description}</p>
                      )}
                    </div>
                    {isLessonCompleted(currentLesson.id) && (
                      <span className="inline-flex items-center gap-1 text-sm text-green-600 whitespace-nowrap">
                        <CheckCircle size={16} />
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Audio Player */}
              <div className="p-6">
                {/* Progress Bar */}
                <div className="mb-6">
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    aria-label="Seek"
                    className="w-full h-3 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-primary-600 hover:accent-primary-700 transition-all"
                    style={{
                      background: `linear-gradient(to right, rgb(79, 70, 229) 0%, rgb(79, 70, 229) ${(currentTime / duration) * 100 || 0}%, rgb(209, 213, 219) ${(currentTime / duration) * 100 || 0}%, rgb(209, 213, 219) 100%)`,
                    }}
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-2 font-medium">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Player Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => prev()}
                      className="p-2.5 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                      disabled={!hasPrev}
                      aria-label="Previous lesson"
                    >
                      <SkipBack size={22} className="text-gray-700" />
                    </button>

                    <button
                      onClick={() => skip(-10)}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      aria-label="Back 10 seconds"
                    >
                      <ChevronLeft size={20} className="text-gray-700" />
                    </button>

                    <button
                      onClick={togglePlay}
                      disabled={isBuffering}
                      className="p-4 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors disabled:opacity-50"
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isBuffering ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      ) : isPlaying ? (
                        <Pause size={26} />
                      ) : (
                        <Play size={26} className="ml-0.5" />
                      )}
                    </button>

                    <button
                      onClick={() => skip(10)}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      aria-label="Forward 10 seconds"
                    >
                      <ChevronRight size={20} className="text-gray-700" />
                    </button>

                    <button
                      onClick={() => next()}
                      className="p-2.5 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                      disabled={!hasNext}
                      aria-label="Next lesson"
                    >
                      <SkipForward size={22} className="text-gray-700" />
                    </button>
                  </div>

                  {/* Volume Controls */}
                  <div className="flex items-center space-x-2">
                    <button onClick={toggleMute} className="p-2 rounded-full hover:bg-gray-100" aria-label="Mute">
                      {isMuted || volume === 0 ? (
                        <VolumeX size={20} className="text-gray-700" />
                      ) : (
                        <Volume2 size={20} className="text-gray-700" />
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                      aria-label="Volume"
                      className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    />
                  </div>
                </div>

                {/* Mark Complete */}
                {currentLesson && (
                  <div className="mt-5 pt-4 border-t">
                    <label
                      className={`inline-flex items-center gap-2 text-sm ${
                        isLessonCompleted(currentLesson.id)
                          ? 'text-gray-500'
                          : 'text-gray-700 cursor-pointer'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isLessonCompleted(currentLesson.id)}
                        onChange={handleMarkComplete}
                        disabled={isLessonCompleted(currentLesson.id)}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      {isLessonCompleted(currentLesson.id) ? 'Completed' : 'Mark as complete'}
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Lesson List — static column on desktop, right-side drawer on mobile */}
          <div
            className={`fixed inset-y-0 right-0 z-50 w-80 max-w-[85vw] transform transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:w-auto lg:max-w-none lg:transform-none lg:transition-none ${
              isLessonListOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
            }`}
          >
            <div className="flex h-full flex-col overflow-hidden bg-white shadow-xl lg:h-auto lg:rounded-2xl">
              <div className="p-5 bg-gray-900 text-white flex items-center justify-between">
                <h3 className="font-bold text-lg flex items-center">
                  <List size={20} className="mr-2" />
                  Course Lessons
                </h3>
                <button
                  onClick={() => setIsLessonListOpen(false)}
                  className="lg:hidden text-white hover:text-gray-300"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto lg:max-h-[700px] lg:flex-none">
                {selectedCourse.lessons?.map((lesson, index) => (
                  <button
                    key={lesson.id}
                    onClick={() => openLesson(lesson)}
                    className={`w-full p-4 text-left border-b hover:bg-gray-50 transition-all ${
                      currentLesson?.id === lesson.id
                        ? 'bg-primary-50 border-l-4 border-l-primary-600'
                        : 'border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="text-xs font-bold text-white bg-gray-600 rounded-full w-6 h-6 flex items-center justify-center mr-2">
                            {index + 1}
                          </span>
                          <h4 className="font-semibold text-sm text-gray-900 line-clamp-2">
                            {lesson.title}
                          </h4>
                        </div>
                        {lesson.durationSeconds && (
                          <div className="flex items-center text-xs text-gray-500 ml-8">
                            <Clock size={14} className="mr-1" />
                            {formatTime(lesson.durationSeconds)}
                          </div>
                        )}
                      </div>
                      {isLessonCompleted(lesson.id) && (
                        <CheckCircle size={18} className="ml-2 flex-shrink-0 text-green-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Lesson List Overlay */}
      {isLessonListOpen && (
        <button
          type="button"
          aria-label="Close lesson list"
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsLessonListOpen(false)}
        />
      )}
    </div>
  );
};

export default CoursePlayer;
