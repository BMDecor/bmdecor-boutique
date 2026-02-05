'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface ImageUploaderProps {
  onUploadComplete: (url: string) => void;
  folder: 'journal' | 'heroes' | 'branding';
  className?: string;
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export function ImageUploader({ onUploadComplete, folder, className = '' }: ImageUploaderProps) {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const uploadFile = async (file: File) => {
    setStatus('uploading');
    setError(null);
    setProgress(0);

    try {
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // Get presigned URL
      setProgress(10);
      let res;
      try {
        res = await fetch('/api/admin/upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            filename: file.name,
            fileType: file.type,
            folder,
            fileSize: file.size,
          }),
        });
      } catch (fetchErr) {
        throw new Error(`API request failed: ${fetchErr instanceof Error ? fetchErr.message : 'Network error'}`);
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `API error: ${res.status} ${res.statusText}`);
      }

      const { uploadUrl, publicUrl } = await res.json();
      setProgress(30);

      // Upload to S3
      let uploadRes;
      try {
        uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          mode: 'cors',
          headers: {
            'Content-Type': file.type,
          },
          body: file,
        });
      } catch (s3Err) {
        throw new Error(`S3 upload failed: ${s3Err instanceof Error ? s3Err.message : 'Network error'}`);
      }

      if (!uploadRes.ok) {
        const s3Text = await uploadRes.text().catch(() => '');
        throw new Error(`S3 error ${uploadRes.status}: ${s3Text.substring(0, 100)}`);
      }

      setProgress(100);
      setStatus('success');

      // Return public URL to parent
      onUploadComplete(publicUrl);

      // Reset after showing success
      setTimeout(() => {
        setStatus('idle');
        setProgress(0);
      }, 2000);

    } catch (err) {
      console.error('Upload error:', err);
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Upload failed');
      setPreview(null);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      uploadFile(file);
    }
  }, [folder]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/avif': ['.avif'],
      'image/gif': ['.gif'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: status === 'uploading',
  });

  const clearPreview = () => {
    setPreview(null);
    setStatus('idle');
    setError(null);
  };

  return (
    <div className={className}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
          ${isDragActive ? 'border-[#C9A86C] bg-[#C9A86C]/5' : 'border-[#2C2C2C]/15 hover:border-[#C9A86C]/50'}
          ${status === 'uploading' ? 'pointer-events-none opacity-70' : ''}
          ${status === 'error' ? 'border-red-300 bg-red-50' : ''}
          ${status === 'success' ? 'border-green-300 bg-green-50' : ''}
        `}
      >
        <input {...getInputProps()} />

        {status === 'idle' && !preview && (
          <div className="space-y-2">
            <Upload className="h-8 w-8 mx-auto text-[#2C2C2C]/30" />
            <p className="text-sm text-[#2C2C2C]/60">
              {isDragActive ? 'Drop image here...' : 'Drag & drop an image, or click to select'}
            </p>
            <p className="text-xs text-[#2C2C2C]/30">
              JPG, PNG, WebP, AVIF, GIF • Max 10MB
            </p>
          </div>
        )}

        {status === 'uploading' && (
          <div className="space-y-3">
            <Loader2 className="h-8 w-8 mx-auto text-[#C9A86C] animate-spin" />
            <p className="text-sm text-[#2C2C2C]/60">Uploading...</p>
            <div className="w-full bg-[#2C2C2C]/10 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-[#C9A86C] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-2">
            <CheckCircle2 className="h-8 w-8 mx-auto text-green-500" />
            <p className="text-sm text-green-600">Upload complete!</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-2">
            <AlertCircle className="h-8 w-8 mx-auto text-red-500" />
            <p className="text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearPreview();
              }}
              className="text-xs text-red-500 underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        )}
      </div>

      {/* Preview */}
      {preview && status !== 'error' && (
        <div className="relative mt-3">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-40 object-cover rounded-lg border border-[#2C2C2C]/10"
          />
          {status !== 'uploading' && (
            <button
              type="button"
              onClick={clearPreview}
              className="absolute top-2 right-2 p-1 bg-white/90 rounded-full shadow-sm hover:bg-white transition-colors"
            >
              <X className="h-4 w-4 text-[#2C2C2C]/60" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
