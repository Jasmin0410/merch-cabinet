import { CheckCircle2 } from "lucide-react";

export default function Toast({ message }) {
  if (!message) return null;

  return (
    <div className="fixed top-5 left-4 right-4 z-[70] flex justify-center pointer-events-none">
      <div className="pointer-events-none bg-wood-deep text-[#fdf8f1] rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.35)] px-4 py-2.5 flex items-center gap-2 max-w-[440px] animate-[mc-rise_0.22s_ease_both]">
        <CheckCircle2 size={16} className="flex-shrink-0" />
        <span className="text-sm">{message}</span>
      </div>
    </div>
  );
}
