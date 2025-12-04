import React, { useState } from "react";
import { Upload, X, Loader, Image as ImageIcon, Check } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export const GalleryUpload = () => {
  const { user } = useUser();
  const uploadGalleryImages = useMutation(api.gallery.uploadImages);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e) => {
    if (e.target.files) {
      const remainingSlots = 10 - files.length;
      if (remainingSlots <= 0) {
        toast.warning("Maximum 10 images allowed per upload");
        return;
      }

      const selectedFiles = Array.from(e.target.files).slice(0, remainingSlots);
      const validFiles = selectedFiles.filter((file) => {
        if (file.size > 5 * 1024 * 1024) {
          toast.warning(`${file.name} exceeds 5MB limit`);
          return false;
        }
        if (!["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
          toast.warning(`${file.name} is not a supported format`);
          return false;
        }
        return true;
      });

      setFiles([...files, ...validFiles]);
      validFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) =>
          setPreviewUrls((prev) => [...prev, e.target.result]);
        reader.readAsDataURL(file);
      });
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
    setPreviewUrls(previewUrls.filter((_, i) => i !== index));
  };

  const uploadImageToCloudinary = async (file) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", "gallery");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();
    return {
      url: data.secure_url,
      publicId: data.public_id,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (files.length === 0) {
      toast.error("Please select at least one image");
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      let uploadedImages = [];
      const toastId = toast.loading(`Uploading images...`);

      for (let i = 0; i < files.length; i++) {
        const uploaded = await uploadImageToCloudinary(files[i]);
        uploadedImages.push(uploaded);
        const progress = Math.round(((i + 1) / files.length) * 100);
        setUploadProgress(progress);
        toast.message(`Uploaded ${i + 1}/${files.length}`, { id: toastId });
      }

      toast.success("All images uploaded to Cloudinary!", { id: toastId });

      const saveToastId = toast.loading("Saving to gallery...");
      const result = await uploadGalleryImages({
        images: uploadedImages,
        uploadedBy: user.id,
      });

      if (result?.success) {
        toast.success("Images added to gallery successfully!", {
          id: saveToastId,
        });
        setFiles([]);
        setPreviewUrls([]);
        setUploadProgress(0);
      } else {
        throw new Error(result?.error || "Failed to save images to gallery");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error uploading images");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setPreviewUrls([]);
    setUploadProgress(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-indigo-100 p-3 rounded-lg">
              <ImageIcon className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Gallery Image Upload
              </h2>
              <p className="text-gray-600 text-sm">
                Upload images to the public gallery
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-indigo-300 rounded-xl p-8 text-center hover:border-indigo-500 transition-colors">
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif"
                multiple
                onChange={handleFileChange}
                disabled={loading}
                className="hidden"
                id="gallery-upload"
              />
              <label
                htmlFor="gallery-upload"
                className="cursor-pointer block"
              >
                <Upload className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Drag & drop images or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  JPG, PNG, or GIF up to 5MB each (Max 10 images)
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  {files.length}/10 images selected
                </p>
              </label>
            </div>

            {/* Preview Grid */}
            {previewUrls.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Selected Images ({previewUrls.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {previewUrls.map((url, index) => (
                    <div
                      key={index}
                      className="relative group rounded-lg overflow-hidden border-2 border-gray-200 hover:border-indigo-400 transition-colors"
                    >
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        disabled={loading}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {loading && uploadProgress > 0 && (
              <div className="bg-indigo-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-indigo-700">
                    Uploading...
                  </span>
                  <span className="text-sm font-bold text-indigo-700">
                    {uploadProgress}%
                  </span>
                </div>
                <div className="w-full bg-indigo-200 rounded-full h-2.5">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || files.length === 0}
                className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Upload to Gallery
                  </>
                )}
              </button>

              {files.length > 0 && !loading && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};