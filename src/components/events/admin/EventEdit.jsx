import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { updateEvent, clearError, clearSuccess } from "../../../store/slices/eventSlice";
import { notify } from "../../../services/utils/authUtils";
import { FormInput, FormTextarea, FormSelect } from "../../forms";
import FileUpload from "../../ui/FileUpload";
import { CURRENCIES, DEFAULT_CURRENCY } from "../../../constants/currencies";

const EventEdit = ({ event, onSuccess, onCancel }) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.event);

  const [thumbnailFile, setThumbnailFile] = useState(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      title: event?.title || "",
      description: event?.description || "",
      module: event?.module || "",
      eventDate: event?.eventDate || "",
      timeEstimate: event?.timeEstimate || "",
      ticketType: event?.ticketType || "FREE",
      ticketCurrency: event?.ticketCurrency || DEFAULT_CURRENCY,
      ticketPrice: event?.ticketPrice != null ? event.ticketPrice : "",
      location: event?.location || "",
      isActive: event?.isActive != null ? event.isActive : true,
    },
    mode: "onChange",
  });

  const ticketType = watch("ticketType");

  const onSubmit = async (data) => {
    try {
      const eventData = {
        title: data.title,
        description: data.description,
        module: data.module,
        eventDate: data.eventDate || null,
        timeEstimate: data.timeEstimate,
        ticketType: data.ticketType,
        ticketCurrency: data.ticketCurrency,
        ticketPrice: data.ticketType === "PAID" && data.ticketPrice ? data.ticketPrice : null,
        location: data.location,
        isActive: data.isActive,
      };

      await dispatch(updateEvent({ id: event.id, updateData: eventData, thumbnailFile })).unwrap();

      notify.success("Event updated successfully!");
      dispatch(clearSuccess());
      onSuccess();
    } catch (err) {
      notify.error(err.message || "Failed to update event");
    }
  };

  const categories = [
    { code: "POWER_BIBLE_SCHOOL", name: "Power Bible School" },
    { code: "MENTORSHIP_ACADEMY", name: "Mentorship Academy" },
    { code: "DISCIPLESHIP", name: "Discipleship" },
  ];

  return (
    <div className="min-h-screen w-full bg-[#F5F6FA] flex flex-col">
      <div className="bg-white border-b px-6 py-4">
        <h1 className="text-xl font-bold text-gray-800">Edit Event</h1>
        <p className="text-sm text-gray-500">Update event details and save changes</p>
      </div>

      <div className="flex-1 p-6">
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <FormInput
            name="title"
            control={control}
            rules={{ required: "Title is required" }}
            label={<span className="font-bold">Event Title</span>}
            placeholder="e.g,Annual Tech 2026"
            errors={errors}
          />

          <FormTextarea
            name="description"
            control={control}
            rules={{ required: "Description is required" }}
            label={<span className="font-bold">Description</span>}
            placeholder="Enter Description"
            className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-[#011A5A]"
            style={{ color: "#000" }}
            errors={errors}
          />

          <div>
            <label className="block font-bold text-gray-700 mb-2">Event Banner</label>
            <FileUpload
              accept="image/*"
              maxSize={5 * 1024 * 1024}
              onFileSelect={setThumbnailFile}
              value={thumbnailFile}
              showPreview
            />
            {event?.thumbnailUrl && !thumbnailFile && (
              <p className="text-xs text-gray-400 mt-1">
                Current banner is kept unless you upload a new one.
              </p>
            )}
          </div>

          <FormSelect
            name="module"
            control={control}
            rules={{ required: "Module is required" }}
            label={<span className="font-bold">Module</span>}
            options={categories}
            placeholder="Select module"
            optionValue="code"
            optionLabel={(c) => c.name}
            errors={errors}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-2">Event Date</label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-[#011A5A]"
                style={{ color: "#000" }}
                {...control.register("eventDate")}
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-2">Time Estimate</label>
              <input
                type="text"
                placeholder="e.g. 2 hours, 3 days"
                className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-[#011A5A]"
                style={{ color: "#000" }}
                {...control.register("timeEstimate")}
              />
            </div>
          </div>

          <div className="bg-[#F9FAFB] rounded-lg p-4 space-y-4">
            <p className="font-bold text-gray-800">Ticket Pricing</p>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="FREE"
                  {...control.register("ticketType")}
                  className="accent-[#011A5A]"
                />
                <span className="text-sm font-medium text-gray-700">Free</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="PAID"
                  {...control.register("ticketType")}
                  className="accent-[#011A5A]"
                />
                <span className="text-sm font-medium text-gray-700">Paid</span>
              </label>
            </div>

            {ticketType === "PAID" && (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Ticket Price</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="e.g. 49.99"
                      className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-[#011A5A]"
                      style={{ color: "#000" }}
                      {...control.register("ticketPrice", {
                        required: ticketType === "PAID" ? "Price is required for paid events" : false,
                      })}
                    />
                    {errors.ticketPrice && (
                      <p className="text-red-500 text-xs mt-1">{errors.ticketPrice.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Currency</label>
                    <select
                      className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-[#011A5A] bg-white"
                      style={{ color: "#000" }}
                      {...control.register("ticketCurrency")}
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code} ({c.symbol}) - {c.displayName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-2">Location</label>
            <input
              type="text"
              placeholder="e.g. Online, Main Auditorium"
              className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-[#011A5A]"
              style={{ color: "#000" }}
              {...control.register("location")}
            />
          </div>

          <div className="bg-[#F0F1F0] rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-800">Active Status</p>
              <p className="text-sm text-gray-500">Inactive events are saved as drafts</p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                {...control.register("isActive")}
              />
              <div className="w-11 h-6 bg-gray-300 peer-checked:bg-[#011A5A] rounded-full peer transition"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5"></div>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              onClick={onCancel}
              type="button"
              className="px-5 py-2 rounded bg-gray-100 hover:bg-gray-200 text-sm font-medium"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit(onSubmit)}
              disabled={!isValid || isLoading}
              className="px-6 py-2 rounded bg-[#011A5A] text-white text-sm font-medium disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventEdit;
