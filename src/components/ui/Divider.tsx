interface DividerProps {
  text?: string;
  bgColor?: string;
}

export function Divider({ text = "or", bgColor = "bg-[#e8f4e5]" }: DividerProps) {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-300"></div>
      </div>
      <div className="relative flex justify-center text-sm">
        <span className={`${bgColor} px-2 text-gray-600`}>{text}</span>
      </div>
    </div>
  );
}
