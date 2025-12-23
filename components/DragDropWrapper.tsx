import { ReactNode } from 'react';

interface DragDropWrapperProps {
  children: ReactNode;
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

export const DragDropWrapper = ({
  children,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop
}: DragDropWrapperProps) => {
  return (
    <div
      className={`relative h-full flex flex-col transition-colors duration-200 ${
        isDragOver ? 'bg-blue-900/20' : ''
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {children}
      
      {/* Drag overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-blue-500/10 border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center z-50">
          <div className="text-center">
            <div className="text-blue-400 text-2xl mb-2">📁</div>
            <div className="text-blue-400 text-lg font-semibold">Drop files here</div>
            <div className="text-blue-300 text-sm">Files will be processed</div>
          </div>
        </div>
      )}
    </div>
  );
};
