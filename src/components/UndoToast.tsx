import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { RotateCcw, X } from "lucide-react";

interface UndoToastProps {
  message: string;
  isVisible: boolean;
  onUndo: () => void;
  onDismiss: () => void;
}

export default function UndoToast({ message, isVisible, onUndo, onDismiss }: UndoToastProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          id="undo-toast"
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-lg border border-slate-800"
        >
          <span className="text-sm font-semibold">{message}</span>
          <button
            id="undo-toast-btn"
            type="button"
            onClick={onUndo}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Undo
          </button>
          <button
            id="dismiss-toast-btn"
            type="button"
            onClick={onDismiss}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
