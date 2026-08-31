import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  X,
  Plus,
  Edit,
  Trash2,
  GripVertical,
  Music,
  Eye,
  EyeOff,
  Clock,
} from 'lucide-react';
import { notify } from '../../../services/utils/authUtils';
import AddLessonModal from './AddLessonModal';
import DeleteConfirmationModal from '../../ui/DeleteConfirmationModal';
import { addLesson, updateLesson, deleteLesson } from '../../../store/slices/courseSlice';

const LessonManagement = ({ isOpen, onClose, course }) => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.course);

  const [addLessonModalOpen, setAddLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState(null);
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    if (course?.lessons) {
      // Sort lessons by order_index
      const sortedLessons = [...course.lessons].sort((a, b) => a.orderIndex - b.orderIndex);
      setLessons(sortedLessons);
    }
  }, [course]);

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const handleLessonSubmit = async (lessonData, audioFile) => {
    try {
      if (editingLesson) {
        const updated = await dispatch(
          updateLesson({
            lessonId: editingLesson.id,
            lessonData,
            audioFile,
          })
        ).unwrap();

        notify.success('Lesson updated successfully!');
        setLessons((prev) =>
          prev.map((l) => (l.id === editingLesson.id ? { ...l, ...updated } : l))
        );
      } else {
        await dispatch(
          addLesson({
            courseId: course.id,
            lessonData,
            audioFile,
          })
        ).unwrap();

        notify.success('Lesson added successfully!');
      }

      handleCloseLessonModal();
    } catch (error) {
      notify.error(
        error.message ||
          (editingLesson ? 'Failed to update lesson. Please try again.' : 'Failed to add lesson. Please try again.')
      );
    }
  };

  const handleEditLesson = (lesson) => {
    setEditingLesson(lesson);
    setAddLessonModalOpen(true);
  };

  const handleOpenAddLesson = () => {
    setEditingLesson(null);
    setAddLessonModalOpen(true);
  };

  const handleCloseLessonModal = () => {
    setAddLessonModalOpen(false);
    setEditingLesson(null);
  };

  const handleDeleteLesson = (lesson) => {
    setLessonToDelete(lesson);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!lessonToDelete) return;

    try {
      await dispatch(deleteLesson(lessonToDelete.id)).unwrap();
      notify.success(`Lesson "${lessonToDelete.title}" deleted successfully!`);
      setDeleteModalOpen(false);
      setLessonToDelete(null);

      setLessons(lessons.filter((l) => l.id !== lessonToDelete.id));
    } catch (error) {
      notify.error('Failed to delete lesson. Please try again.');
    }
  };

  const handleTogglePreview = async (lesson) => {
    try {
      await dispatch(
        updateLesson({
          lessonId: lesson.id,
          lessonData: {
            isPreview: !lesson.isPreview,
          },
        })
      ).unwrap();

      notify.success(
        lesson.isPreview ? 'Lesson removed from preview' : 'Lesson set as preview!'
      );

      setLessons(
        lessons.map((l) =>
          l.id === lesson.id ? { ...l, isPreview: !l.isPreview } : l
        )
      );
    } catch (error) {
      notify.error('Failed to update lesson. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-primary-600 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Manage Lessons</h2>
                <p className="text-sm text-primary-100 mt-1">{course?.title}</p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-primary-100 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Stats */}
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="text-sm">
                  <span className="text-gray-500">Total Lessons:</span>{' '}
                  <span className="font-semibold text-gray-900">{lessons.length}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Preview Lessons:</span>{' '}
                  <span className="font-semibold text-gray-900">
                    {lessons.filter((l) => l.isPreview).length}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Total Duration:</span>{' '}
                  <span className="font-semibold text-gray-900">
                    {formatDuration(lessons.reduce((sum, l) => sum + (l.durationSeconds || 0), 0))}
                  </span>
                </div>
              </div>
              <button
                onClick={handleOpenAddLesson}
                className="flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 transition-colors"
              >
                <Plus size={16} className="mr-2" />
                Add Lesson
              </button>
            </div>

            {/* Lessons List */}
            <div className="flex-1 overflow-y-auto p-6">
              {lessons.length === 0 ? (
                <div className="text-center py-12">
                  <Music size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No lessons yet</h3>
                  <p className="text-gray-500 mb-4">
                    Start by adding your first audio lesson to this course
                  </p>
                  <button
                    onClick={handleOpenAddLesson}
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700"
                  >
                    <Plus size={16} className="mr-2" />
                    Add First Lesson
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start">
                        {/* Drag Handle */}
                        <div className="flex-shrink-0 mr-3 mt-1 cursor-move text-gray-400 hover:text-gray-600">
                          <GripVertical size={20} />
                        </div>

                        {/* Lesson Number */}
                        <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold text-sm mr-4">
                          {index + 1}
                        </div>

                        {/* Lesson Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-base font-semibold text-gray-900 mb-1">
                                {lesson.title}
                              </h4>
                              {lesson.description && (
                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                  {lesson.description}
                                </p>
                              )}
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span className="flex items-center">
                                  <Clock size={14} className="mr-1" />
                                  {formatDuration(lesson.durationSeconds)}
                                </span>
                                {lesson.fileSizeBytes && (
                                  <span>{formatFileSize(lesson.fileSizeBytes)}</span>
                                )}
                                {lesson.isPreview && (
                                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                    Preview
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-2 ml-4">
                              <button
                                onClick={() => handleTogglePreview(lesson)}
                                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                                title={lesson.isPreview ? 'Remove from preview' : 'Set as preview'}
                              >
                                {lesson.isPreview ? <Eye size={16} /> : <EyeOff size={16} />}
                              </button>
                              <button
                                onClick={() => handleEditLesson(lesson)}
                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Edit lesson"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteLesson(lesson)}
                                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Delete lesson"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Lesson Modal */}
      <AddLessonModal
        isOpen={addLessonModalOpen}
        onClose={handleCloseLessonModal}
        onSubmit={handleLessonSubmit}
        courseTitle={course?.title}
        courseIsFree={!Number(course?.basePrice) && !Number(course?.ngnPrice)}
        isLoading={isLoading}
        lesson={editingLesson}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Lesson"
        message="This will permanently delete the lesson and its audio file. This action cannot be undone."
        itemName={lessonToDelete?.title}
        isLoading={isLoading}
      />
    </>
  );
};

export default LessonManagement;
