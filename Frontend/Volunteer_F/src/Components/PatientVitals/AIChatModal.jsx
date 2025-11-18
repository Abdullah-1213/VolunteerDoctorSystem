import { motion } from "framer-motion";
import ChatWithAI from "./ChatWithAI";

export default function AIChatModal({ open, onClose }) {
  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white w-full max-w-3xl rounded-2xl shadow-xl p-4"
      >
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold text-blue-700">
            AI Assistant
          </h2>
          <button onClick={onClose} className="text-gray-600 text-xl">✖</button>
        </div>

        <ChatWithAI />
      </motion.div>
    </motion.div>
  );
}
