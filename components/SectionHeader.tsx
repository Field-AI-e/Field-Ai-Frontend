interface SectionHeaderProps {
  title: string;
  showViewAll?: boolean;
  onViewAll?: () => void;
}

export function SectionHeader({ title, showViewAll = false, onViewAll }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-white font-semibold text-lg">{title}</h2>
      {showViewAll && (
        <button 
          onClick={onViewAll}
          className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
        >
          View All
        </button>
      )}
    </div>
  );
}
