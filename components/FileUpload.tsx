import { FileText, X } from 'lucide-react';
import { AttachedFile } from '@/hooks/useFileUpload';

interface FileUploadProps {
  attachedFiles: AttachedFile[];
  isUploading: boolean;
  onRemoveFile: (index: number) => void;
  onClearAllFiles?: () => void;
}

export const FileUpload = ({ 
  attachedFiles, 
  isUploading, 
  onRemoveFile, 
}: FileUploadProps) => {
  if (attachedFiles.length === 0) return null;

  return (
    <div className="mx-3 mt-2 flex flex-wrap gap-2">
      {attachedFiles.map((attachedFile, index) => (
        <div key={index} className="flex items-center gap-2 bg-gray-700 rounded-full px-3 py-2">
          <FileText size={16} className="text-gray-400" />
          <div className="flex flex-col">
            <span className="text-white text-sm font-medium">{attachedFile.path}</span>
            <span className="text-gray-400 text-xs">
              {isUploading ? 'Uploading...' : 'File'}
            </span>
          </div>
          <button
            onClick={() => onRemoveFile(index)}
            className="ml-2 p-1 rounded-full hover:bg-gray-600 transition-colors"
            aria-label="Remove file"
          >
            <X size={14} className="text-gray-400" />
          </button>
        </div>
      ))}
      
      {/* Clear all button */}
      
    </div>
  );
};
