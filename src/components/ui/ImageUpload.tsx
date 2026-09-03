"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Camera, Link as LinkIcon, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ImageUploadProps {
  label?: string;
  helperText?: string;
  value: string;
  onChange: (value: string) => void;
  shape?: "circle" | "rounded";
  placeholderIcon?: React.ReactNode;
}

/**
 * Resizes and compresses an image file using an off-screen HTML5 canvas.
 * Produces a lightweight JPEG base64 Data URL (~30-80KB) ideal for profile avatars
 * and service photos without requiring cloud storage bucket configuration.
 */
function compressImage(file: File, maxDimension = 600, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function ImageUpload({
  label = "Artisan Photo",
  helperText = "Upload a clear photo to help customers recognize you.",
  value,
  onChange,
  shape = "rounded",
  placeholderIcon,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (JPEG, PNG, WebP).");
      return;
    }

    try {
      setIsCompressing(true);
      const dataUrl = await compressImage(file);
      onChange(dataUrl);
    } catch (err) {
      console.error("Failed to process image:", err);
      alert("Could not process this image. Please try another one.");
    } finally {
      setIsCompressing(false);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    // reset input so the same file can be re-selected if deleted
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <div className="space-y-2 text-left">
      {label && (
        <label className="block text-sm font-semibold text-slate-800">
          {label}
        </label>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="sr-only"
        onChange={onInputChange}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/90">
        {/* Image Preview Container */}
        <div
          className={`relative h-24 w-24 shrink-0 bg-white border border-slate-200 shadow-xs flex items-center justify-center overflow-hidden transition-all ${
            shape === "circle" ? "rounded-full" : "rounded-2xl"
          } ${dragOver ? "ring-2 ring-[#ea580c] border-transparent" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          {isCompressing ? (
            <div className="flex flex-col items-center justify-center text-slate-400 gap-1">
              <Loader2 className="h-6 w-6 animate-spin text-[#ea580c]" />
              <span className="text-[9px] font-bold">Optimizing...</span>
            </div>
          ) : value ? (
            <>
              <Image
                src={value}
                alt="Uploaded photo"
                fill
                className="object-cover"
                unoptimized
              />
              <button
                type="button"
                onClick={() => onChange("")}
                title="Remove photo"
                className="absolute top-1 right-1 p-1 rounded-full bg-slate-950/70 text-white hover:bg-red-600 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-300">
              {placeholderIcon || <User className="h-10 w-10 text-slate-300" />}
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-1 space-y-2 w-full">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs font-bold gap-1.5 border-slate-300 hover:border-[#ea580c] hover:text-[#ea580c]"
              onClick={() => fileInputRef.current?.click()}
              disabled={isCompressing}
            >
              {value ? <Camera className="h-3.5 w-3.5" /> : <Upload className="h-3.5 w-3.5 text-[#ea580c]" />}
              <span>{value ? "Change Photo" : "Upload Photo"}</span>
            </Button>

            {value && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => onChange("")}
              >
                Remove
              </Button>
            )}

            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="text-[11px] text-slate-400 hover:text-slate-600 font-medium ml-auto flex items-center gap-1"
            >
              <LinkIcon className="h-3 w-3" />
              <span>{showUrlInput ? "Hide URL" : "Or use URL"}</span>
            </button>
          </div>

          {/* Optional Direct URL Input */}
          {showUrlInput && (
            <div className="pt-1">
              <input
                type="url"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="https://example.com/artisan-photo.jpg"
                className="w-full text-xs px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#ea580c]"
              />
            </div>
          )}

          {helperText && (
            <p className="text-xs text-slate-500 leading-relaxed">
              {helperText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
