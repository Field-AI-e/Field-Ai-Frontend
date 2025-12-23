interface TopBarProps {
  title: string;
}

export function TopBar({ title }: TopBarProps) {
  return (
    <div className="h-14 bg-[#212121] flex items-center px-4 justify-between border-b border-b-[#303030]">
      <div className="font-semibold">{title}</div>
      <div className="text-xs text-gray-500"></div>
    </div>
  );
}
