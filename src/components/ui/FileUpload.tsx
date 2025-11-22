import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { ImageIcon, UploadIcon } from 'lucide-react';

interface FileUploadProps {
  onChange: (files: File[]) => void;
  value?: FileList | null;
  error?: string;
  preview?: string | null;
  onImageError?: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onChange,
  error,
  preview,
  onImageError
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onChange(acceptedFiles);
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 transition-colors duration-200 ease-in-out cursor-pointer
          ${isDragActive ? 'border-[#FF5226] bg-orange-50' : 'border-gray-300 hover:border-[#FF5226]'}
          ${error ? 'border-red-500' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-3 text-center">
          {preview ? (
            <div className="relative w-full">
              <img
                src={preview}
                alt="Preview"
                className="object-cover w-full h-48 rounded-lg"
                onError={onImageError}
              />
              <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-200 bg-black rounded-lg opacity-0 hover:opacity-50">
                <UploadIcon className="w-8 h-8 text-white" />
              </div>
            </div>
          ) : (
            <>
              <ImageIcon className="w-12 h-12 text-gray-400" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">
                  {isDragActive ? "Solte a imagem aqui" : "Arraste e solte a imagem aqui, ou clique para selecionar"}
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG ou JPEG (máx. 5MB)
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}; 