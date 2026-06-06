"use client";

import React, { useState, useRef, useEffect } from "react";
import { Upload, X, Star, Loader2 } from "lucide-react";

export interface PendingFile {
  fileName: string;
  base64Content: string;
  dataUrl: string;
}

interface ScreenshotUploaderProps {
  screenshots: string[];
  onChange: (updatedScreenshots: string[]) => void;
  pendingFiles: PendingFile[];
  onAddPending: (file: PendingFile) => void;
  onRemovePending: (fileName: string) => void;
  isUploading: boolean;
}

export function ScreenshotUploader({
  screenshots,
  onChange,
  pendingFiles,
  onAddPending,
  onRemovePending,
  isUploading,
}: ScreenshotUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed.");
      return;
    }

    const cleanName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64 = reader.result as string;
      onAddPending({
        fileName: cleanName,
        base64Content: base64,
        dataUrl: base64, // data URL for local preview
      });
    };
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const removeScreenshot = (index: number, isPending: boolean, fileName?: string) => {
    if (isPending && fileName) {
      onRemovePending(fileName);
    } else {
      const updated = [...screenshots];
      updated.splice(index, 1);
      onChange(updated);
    }
  };

  const setAsCover = (index: number) => {
    const updated = [...screenshots];
    const item = updated.splice(index, 1)[0];
    updated.unshift(item);
    onChange(updated);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getImageUrl = (src: string, pendingUrl?: string) => {
    if (pendingUrl) return pendingUrl; // Local preview for pending files
    if (src.startsWith("http")) return src;
    return `/${src}`;
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-neutral-300">
        Screenshots & Media Gallery
      </label>

      {/* Drag and Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all duration-300 ${
          dragActive
            ? "border-indigo-500 bg-indigo-500/5"
            : "border-neutral-800 bg-neutral-900/40 hover:border-neutral-700 hover:bg-neutral-900/60"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            <p className="text-sm font-medium text-neutral-300">Uploading screenshot to repository...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center gap-2">
            <div className="p-3 bg-neutral-800 rounded-lg text-neutral-400">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-neutral-300">
              <span className="text-indigo-400">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-neutral-500">Supports PNG, JPG, JPEG, WEBP. Files are uploaded when you save the project.</p>
          </div>
        )}
      </div>

      {/* Screenshots Grid */}
      {(screenshots.length > 0 || pendingFiles.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
          {/* Already uploaded screenshots */}
          {screenshots.map((src, index) => (
            <div
              key={src}
              className="relative group aspect-video rounded-lg overflow-hidden border border-neutral-800 bg-neutral-950"
            >
              <img
                src={getImageUrl(src)}
                alt={`Screenshot ${index + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Badge for Cover */}
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow">
                  <Star className="w-2.5 h-2.5 fill-white" /> Cover
                </div>
              )}

              {/* Actions Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => setAsCover(index)}
                    className="p-1.5 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
                    title="Set as cover image"
                  >
                    <Star className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeScreenshot(index, false)}
                  className="p-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  title="Remove screenshot"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          {/* Pending (not yet uploaded) screenshots */}
          {pendingFiles.map((pending, index) => (
            <div
              key={pending.fileName}
              className="relative group aspect-video rounded-lg overflow-hidden border border-yellow-600/50 bg-neutral-950"
            >
              <img
                src={pending.dataUrl}
                alt={`Pending ${index + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Pending badge */}
              <div className="absolute top-2 left-2 bg-yellow-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                Pending
              </div>

              {/* Actions Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => removeScreenshot(index, true, pending.fileName)}
                  className="p-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  title="Remove screenshot"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}