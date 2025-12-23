import { useState, useRef } from 'react';
import { Upload, FileText, X } from 'lucide-react';

interface FilePickerProps {
  onFileSelect: (file: File) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function FilePicker({ onFileSelect, onClose, isOpen }: FilePickerProps) {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    // Check if file is PDF or DOCX
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    
    const fileExtension = file.name.toLowerCase().split('.').pop();
    const isAllowedType = allowedTypes.includes(file.type) || 
                         ['pdf', 'docx', 'doc'].includes(fileExtension || '');

    if (isAllowedType) {
      onFileSelect(file);
      onClose();
    } else {
      alert('Please select a PDF or DOCX file.');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
   <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
  <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 w-96 max-w-full mx-4 shadow-2xl ring-1 ring-white/10">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-white text-xl font-semibold tracking-wide select-none">Select Document</h3>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
        aria-label="Close modal"
      >
        <X size={22} />
      </button>
    </div>

    <div
      className={`
        border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors duration-300 relative overflow-hidden
        ${dragOver ? 'border-blue-500 bg-blue-900/30' : 'border-gray-700 hover:border-gray-500'}
        group
      `}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Upload size={56} className="mx-auto text-gray-400 mb-5 transition-colors group-hover:text-blue-400" />
      <p className="text-white text-xl mb-3 font-semibold">Drop your file here</p>
      <p className="text-gray-400 text-sm mb-5">or click to browse</p>
      <p className="text-gray-500 text-xs select-none">Supports PDF, DOCX, DOC files</p>

      {/* Animated shimmering border on dragOver */}
      {dragOver && (
        <span
          className="animate-shimmer absolute inset-0 rounded-2xl border border-blue-400 pointer-events-none"
          aria-hidden="true"
        />
      )}
    </div>

    {/* Hidden file input */}
    <input
      ref={fileInputRef}
      type="file"
      accept=".pdf,.docx,.doc"
      onChange={handleFileInputChange}
      className="hidden"
    />

    <div className="mt-6 flex justify-end gap-3">
      <button
        onClick={onClose}
        className="px-5 py-2 text-gray-400 hover:text-white transition-colors rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Cancel
      </button>
    </div>
  </div>

  <style jsx>{`
    @keyframes shimmer {
      0% {
        background-position: -200%;
      }
      100% {
        background-position: 200%;
      }
    }
    .animate-shimmer {
      background: linear-gradient(
        90deg,
        rgba(59,130,246,0) 0%,
        rgba(59,130,246,0.4) 50%,
        rgba(59,130,246,0) 100%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s linear infinite;
      z-index: 10;
    }
  `}</style>
</div>

  );
}
