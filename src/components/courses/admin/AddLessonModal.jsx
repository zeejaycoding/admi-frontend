import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Upload, Music } from 'lucide-react';
import FormInput from '../../forms/FormInput';
import FormTextarea from '../../forms/FormTextarea';

const AddLessonModal = ({ isOpen, onClose, onSubmit, courseTitle, courseIsFree = false, isLoading, lesson = null }) => {
  const isEditMode = Boolean(lesson);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      durationSeconds: '',
      isPreview: false,
    },
    mode: 'onChange',
  });

  // Turn raw seconds into something readable, e.g. 5557 → "1h 32m 37s".
  const formatDuration = (totalSeconds) => {
    const s = Math.floor(Number(totalSeconds));
    if (!Number.isFinite(s) || s <= 0) return '';
    const hours = Math.floor(s / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const seconds = s % 60;
    return [hours && `${hours}h`, minutes && `${minutes}m`, seconds && `${seconds}s`]
      .filter(Boolean)
      .join(' ');
  };

  const durationLabel = formatDuration(watch('durationSeconds'));

  const [audioFile, setAudioFile] = useState(null);
  const [audioFileName, setAudioFileName] = useState('');
  const [fileSizeError, setFileSizeError] = useState('');

  // Prefill form when editing an existing lesson
  useEffect(() => {
    if (isOpen && lesson) {
      reset({
        title: lesson.title || '',
        description: lesson.description || '',
        durationSeconds: lesson.durationSeconds ?? '',
        isPreview: lesson.isPreview || false,
      });
      setAudioFile(null);
      setAudioFileName('');
      setFileSizeError('');
    }
  }, [isOpen, lesson, reset]);

  const handleAudioFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('audio/')) {
        setFileSizeError('Please select a valid audio file');
        return;
      }

      // Check file size (max 500MB) — must stay in step with the backend multipart limit.
      const maxSize = 500 * 1024 * 1024; // 500MB
      if (file.size > maxSize) {
        setFileSizeError('File size must be less than 500MB');
        return;
      }

      setAudioFile(file);
      setAudioFileName(file.name);
      setFileSizeError('');
      detectDuration(file);
    }
  };

  // Read the clip length from the file's metadata. Many MP3s report `Infinity` on the first
  // metadata event (a browser quirk) — seeking to the end forces the real duration to resolve.
  const detectDuration = (file) => {
    const audio = new Audio();
    const objectUrl = URL.createObjectURL(file);

    const finish = (seconds) => {
      if (Number.isFinite(seconds) && seconds > 0) {
        setValue('durationSeconds', Math.floor(seconds));
      }
      URL.revokeObjectURL(objectUrl);
    };

    audio.addEventListener('loadedmetadata', () => {
      if (audio.duration === Infinity || Number.isNaN(audio.duration)) {
        // Nudge to the end so the browser computes the true length, then read it back.
        audio.currentTime = 1e101;
        audio.addEventListener('timeupdate', function onSeeked() {
          if (audio.duration !== Infinity && !Number.isNaN(audio.duration)) {
            audio.removeEventListener('timeupdate', onSeeked);
            finish(audio.duration);
          }
        });
      } else {
        finish(audio.duration);
      }
    });

    audio.addEventListener('error', () => URL.revokeObjectURL(objectUrl));
    audio.src = objectUrl;
  };

  const handleFormSubmit = async (data) => {
    // Audio is required when creating, optional when editing
    if (!isEditMode && !audioFile) {
      setFileSizeError('Please select an audio file');
      return;
    }

    // Duration is auto-detected; if detection didn't resolve, send 0 rather than an empty string.
    const parsedDuration = parseInt(data.durationSeconds, 10);
    const payload = {
      ...data,
      durationSeconds: Number.isFinite(parsedDuration) ? parsedDuration : 0,
    };

    await onSubmit(payload, audioFile);

    // Reset form after successful submission
    reset();
    setAudioFile(null);
    setAudioFileName('');
    setFileSizeError('');
  };

  const handleClose = () => {
    reset();
    setAudioFile(null);
    setAudioFileName('');
    setFileSizeError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{isEditMode ? 'Edit Lesson' : 'Add New Lesson'}</h2>
              <p className="text-sm text-gray-500 mt-1">
                {isEditMode ? 'Update lesson details for ' : 'Add an audio lesson to '}
                <span className="font-semibold">{courseTitle}</span>
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isLoading}
            >
              <X size={24} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
            {/* Audio File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Audio File {isEditMode ? (
                  <span className="text-gray-400 font-normal">(optional — leave empty to keep current audio)</span>
                ) : (
                  <span className="text-red-500">*</span>
                )}
              </label>
              <div className="mt-1">
                <label
                  htmlFor="audio-upload"
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    audioFile
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {audioFile ? (
                      <>
                        <Music className="w-10 h-10 mb-3 text-green-500" />
                        <p className="mb-2 text-sm text-gray-700 font-medium">{audioFileName}</p>
                        <p className="text-xs text-gray-500">Click to change file</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-10 h-10 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-600">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">MP3, WAV, M4A (MAX. 100MB)</p>
                      </>
                    )}
                  </div>
                  <input
                    id="audio-upload"
                    type="file"
                    className="hidden"
                    accept="audio/*"
                    onChange={handleAudioFileChange}
                    disabled={isLoading}
                  />
                </label>
                {fileSizeError && <p className="mt-1 text-sm text-red-600">{fileSizeError}</p>}
              </div>
            </div>

            {/* Lesson Title */}
            <FormInput
              name="title"
              control={control}
              rules={{
                required: 'Lesson title is required',
                minLength: { value: 3, message: 'Minimum 3 characters' },
              }}
              label="Lesson Title"
              placeholder="Enter lesson title"
              required
              errors={errors}
            />

            {/* Description */}
            <FormTextarea
              name="description"
              control={control}
              label="Description"
              placeholder="Enter lesson description"
              rows={3}
              errors={errors}
            />

            {/* Duration */}
            {/* Duration is read from the audio file's metadata; we store seconds but show a readable label. */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Duration</label>
              <div className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-100 text-gray-600">
                {durationLabel || 'Detected once you select an audio file'}
              </div>
            </div>

            {/* Preview toggle — only meaningful for paid courses (free courses are already open to all) */}
            {!courseIsFree && (
              <div className="flex items-center">
                <input
                  id="is-preview"
                  key={lesson?.id || 'new'}
                  type="checkbox"
                  defaultChecked={lesson?.isPreview || false}
                  onChange={(e) => setValue('isPreview', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  disabled={isLoading}
                />
                <label htmlFor="is-preview" className="ml-2 block text-sm text-gray-700">
                  Make this a preview lesson (free access for all users)
                </label>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isValid || (!isEditMode && !audioFile) || isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {isEditMode ? 'Saving...' : 'Uploading...'}
                  </>
                ) : (
                  isEditMode ? 'Save changes' : 'Add Lesson'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddLessonModal;
