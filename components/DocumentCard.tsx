import { FileText, BarChart3, Image, Plus, Download, Upload, Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';

interface DocumentCardProps {
  title: string;
  description: string;
  lastModified: string;
  icon?: 'document' | 'chart' | 'image' | 'plus';
  isAddCard?: boolean;
  fileUrl?: string;
  isLoading?: boolean;
  onClick?: () => void;
  onDownload?: () => void;
  onFileSelect?: () => void;
  onFileReplace?: (file: File) => void;
}

export function DocumentCard({ 
  title, 
  description, 
  lastModified, 
  icon = 'document',
  isAddCard = false,
  fileUrl,
  isLoading = false,
  onClick,
  onDownload,
  onFileSelect,
  onFileReplace
}: DocumentCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const getIcon = () => {
    if (isAddCard) return <Plus size={24} className="text-gray-400" />;
    
    const iconColor = fileUrl ? 'text-green-400' : 'text-gray-400';
    
    switch (icon) {
      case 'chart':
        return <BarChart3 size={20} className={iconColor} />;
      case 'image':
        return <Image size={20} className={iconColor} />;
      default:
        return <FileText size={20} className={iconColor} />;
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
        setIsUploading(true);
        try {
          if (onFileReplace) {
            await onFileReplace(file);
          }
        } finally {
          setIsUploading(false);
        }
      } else {
        alert('Please select a PDF or DOCX file.');
      }
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isUploading || isLoading) return; // Prevent clicks during upload
    
    if (isAddCard && onFileSelect) {
      onFileSelect();
    } else if (!fileUrl && onFileReplace) {
      // If no file URL, open file picker for upload
      fileInputRef.current?.click();
    } else if (onClick) {
      onClick();
    }
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDownload) {
      onDownload();
    }
  };

  return (
    <div 
      className={` rounded-xl p-5 border transition-all duration-300 shadow-xl relative select-none
 ${
        isAddCard 
      ? 'bg-gradient-to-br from-white/5 to-gray-800 border-dashed border-gray-600 hover:border-purple-500 hover:bg-gradient-to-tr hover:from-purple-900/10 hover:to-purple-500/10'
          : fileUrl 
        ? 'bg-gradient-to-br from-green-900/40 to-green-900 border-green-700 hover:border-green-400 hover:shadow-2xl'
        : 'bg-gradient-to-br from-white/5 to-gray-800 border-gray-700 hover:border-blue-400 hover:shadow-2xl'}
      } ${(isUploading || isLoading) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.025] cursor-pointer'}`}
      onClick={handleCardClick}
    >
        <div className="pointer-events-none absolute inset-0 rounded-xl overflow-hidden">
    <span className="absolute left-[-80%] top-0 w-2/3 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform skew-x-[-18deg] blur-md opacity-0 group-hover:opacity-100 group-hover:animate-shine" />
  </div>

      <div className="flex items-start gap-4 relative z-10">
    <div className={`${isAddCard ? 'bg-gradient-to-br from-purple-600/30 to-indigo-600/20' : fileUrl ? 'bg-green-900/70' : 'bg-gray-700/60'} w-11 h-11 flex items-center justify-center rounded-lg shadow-inner`}>
      {getIcon()}
    </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className={`font-medium text-sm mb-1 truncate ${fileUrl ? 'text-green-100' : 'text-white'}`}>{title}</h3>
              {!isAddCard && (
                <>
                  <p className={`text-xs mb-2 line-clamp-2 ${fileUrl ? 'text-green-200' : 'text-gray-400'}`}>{description}</p>
                  <p className={`text-xs ${fileUrl ? 'text-green-300' : 'text-gray-500'}`}>Edited {lastModified}</p>
                </>
              )}
              {isAddCard && (
                <p className="text-gray-400 text-sm">Add to Favorites</p>
              )}
            </div>
            {!isAddCard && fileUrl && !isUploading && !isLoading && (
              <button
                onClick={handleDownloadClick}
                className="ml-2 p-1 text-gray-400 hover:text-white transition-colors"
                title="Download file"
              >
                <Download size={14} />
              </button>
            )}
            {!isAddCard && !fileUrl && !isUploading && !isLoading && (
              <div className="ml-2 p-1 text-gray-400" title="Click to upload file">
                <Upload size={14} />
              </div>
            )}
            {(isUploading || isLoading) && (
              <div className="ml-2 p-1 text-gray-400" title="Uploading...">
                <Loader2 size={14} className="animate-spin" />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc"
        onChange={handleFileInputChange}
        className="hidden"
      />
        <style jsx>{`
    @keyframes shine {
      0% { left: -80%; opacity: 0; }
      35% { opacity: 1; }
      80% { left: 110%; opacity: 0.1; }
      100% { left: 110%; opacity: 0; }
    }
    .group-hover\\:animate-shine:hover span {
      animation: shine 1s linear forwards;
    }
  `}</style>
    </div>
  );
}
