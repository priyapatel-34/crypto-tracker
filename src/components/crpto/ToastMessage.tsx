import { X, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "../../lib/utils";
import { useEffect } from "react";

interface ToastMessageProps {
  message: string;
  type: "success" | "error";
  toastId: string;
  visible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function ToastMessage({
  message,
  type,
  visible,
  onClose,
  duration = 3000,
}: ToastMessageProps) {
  const isSuccess = type === "success";

  useEffect(() => {
    if (visible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 transition-all duration-300 ease-in-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
      )}
    >
      <div
        className={cn(
          "max-w-sm w-full text-white shadow-lg rounded-lg pointer-events-auto flex items-center p-4 space-x-3 border-l-4 transform transition-transform duration-300",
          isSuccess
            ? "bg-gray-800 border-green-500"
            : "bg-gray-800 border-red-500"
        )}
      >
        {isSuccess ? (
          <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
        ) : (
          <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
        )}

        <span className="flex-1 text-sm font-medium">{message}</span>

        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors duration-200 p-1 rounded-full hover:bg-white/10"
          aria-label="Close toast"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
