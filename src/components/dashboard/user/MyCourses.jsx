import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getMyCourses } from '../../../store/slices/courseProgressSlice';
import { GraduationCap, Play, CheckCircle, Clock } from 'lucide-react';

const MyCourses = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { myCourses, isLoading, error } = useSelector((state) => state.courseProgress);

  useEffect(() => {
    dispatch(getMyCourses());
  }, [dispatch]);

  const formatCategory = (category) => {
    if (!category) return '';
    return category
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Calculate course statistics
  const totalCourses = myCourses?.length || 0;
  const completedCourses = myCourses?.filter((p) => p.isCompleted).length || 0;
  const inProgressCourses = myCourses?.filter((p) => !p.isCompleted && p.completionPercentage > 0).length || 0;

  const handleStartCourse = (courseId) => {
    navigate(`/course-player/${courseId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button
          onClick={() => dispatch(getMyCourses())}
          className="mt-2 text-red-600 hover:text-red-700 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
        <p className="text-gray-600 mt-1">Continue your learning journey</p>
      </div>

      {/* Statistics Section - Moved to Top */}
      {myCourses && myCourses.length > 0 && (
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-primary-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium mb-1">Enrolled Courses</p>
                <p className="text-3xl font-bold">{totalCourses}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <GraduationCap size={32} />
              </div>
            </div>
          </div>

          <div className="bg-yellow-500 rounded-xl shadow-lg p-6 text-black">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-black/70 text-sm font-medium mb-1">Completed Courses</p>
                <p className="text-3xl font-bold">{completedCourses}</p>
              </div>
              <div className="bg-black/10 p-3 rounded-lg">
                <CheckCircle size={32} />
              </div>
            </div>
          </div>

          <div className="bg-primary-700 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium mb-1">In Progress</p>
                <p className="text-3xl font-bold">{inProgressCourses}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Clock size={32} />
              </div>
            </div>
          </div>
        </div>
      )}

      {!myCourses || myCourses.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <div className="mx-auto h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <GraduationCap size={32} className="text-primary-600" />
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No courses yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Start learning by purchasing a course from our E-Store
          </p>
          <div className="mt-6">
            <a
              href="/estore"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Browse Courses
            </a>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myCourses.map((progress) => {
            const course = progress.course;
            const completionPercentage = progress.completionPercentage || 0;
            const isCompleted = progress.isCompleted;
            const hasStarted = progress.currentLessonId != null || completionPercentage > 0;

            return (
              <div
                key={progress.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Course Thumbnail */}
                <div className="relative h-48 bg-primary-600">
                  {course.thumbnailUrl ? (
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <GraduationCap size={64} className="text-white opacity-50" />
                    </div>
                  )}

                  {/* Completion Badge */}
                  {isCompleted && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                      <CheckCircle size={14} className="mr-1" />
                      Completed
                    </div>
                  )}

                  {/* Category Badge */}
                  {course.category && (
                    <div className="absolute bottom-3 left-3 bg-white bg-opacity-90 px-3 py-1 rounded-full text-xs font-semibold text-primary-700">
                      {formatCategory(course.category)}
                    </div>
                  )}
                </div>

                {/* Course Details */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
                    {course.title}
                  </h3>

                  {course.instructor && (
                    <p className="text-sm text-gray-600 mb-3">by {course.instructor}</p>
                  )}

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-gray-700">Progress</span>
                      <span className="text-xs font-semibold text-primary-600">
                        {Math.round(completionPercentage)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${completionPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Course Stats */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Clock size={14} className="mr-1" />
                      <span>{course.lessonCount || 0} lessons</span>
                    </div>
                    {progress.lastAccessedAt && (
                      <span className="text-gray-400">
                        Last accessed{' '}
                        {new Date(progress.lastAccessedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    )}
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleStartCourse(course.id)}
                    className={`w-full flex items-center justify-center px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                      isCompleted
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : hasStarted
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    <Play size={16} className="mr-2" />
                    {isCompleted
                      ? 'Review Course'
                      : hasStarted
                      ? 'Continue Learning'
                      : 'Start Course'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyCourses;
