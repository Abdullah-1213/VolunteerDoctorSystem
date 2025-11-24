import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function ChatWithAI() {
  const [query, setQuery] = useState("");
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, loading]);

  const handleSend = async () => {
    if (!query.trim()) return;

    const newChats = [...chats, { sender: "Doctor", text: query }];
    setChats(newChats);
    setQuery("");
    setLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent([{ text: query }]);
      const aiResponse = result.response.text();

      setChats((prev) => [...prev, { sender: "AI", text: aiResponse }]);
    } catch (err) {
      console.error("❌ Gemini API Error:", err);
      setChats((prev) => [
        ...prev,
        { sender: "AI", text: "⚠️ Error: Unable to get response. Try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Component for long text with "Read More"
  const LongText = ({ text }) => {
    const [expanded, setExpanded] = useState(false);
    const preview = text.slice(0, 300);
    const isLong = text.length > 300;

    return (
      <div className="break-words">
        <p className="text-sm whitespace-pre-line">
          {expanded || !isLong ? text : preview + "..."}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-blue-500 text-xs mt-1 hover:underline"
          >
            {expanded ? "Show Less" : "Read More"}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[75vh] w-full max-w-3xl mx-auto p-2 sm:p-4 bg-white rounded-2xl shadow-lg border border-gray-200">
      {/* Header */}
      <h2 className="text-2xl font-bold text-center text-blue-700 mb-4 flex items-center justify-center space-x-2">
        <span>💬</span>
        <span>AI Assistant</span>
      </h2>

      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-gray-50 rounded-lg border border-gray-200">

        <AnimatePresence>
          {chats.map((chat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={`max-w-[85%] sm:max-w-[80%] p-3 rounded-xl break-words overflow-hidden shadow ${
                chat.sender === "Doctor"
                  ? "bg-blue-500 text-white self-start"
                  : "bg-gray-200 text-gray-900 self-end"
              }`}
            >
              <strong>{chat.sender}:</strong>{" "}
              {chat.sender === "AI" ? <LongText text={chat.text} /> : chat.text}
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-500 italic"
          >
            🤖 AI is thinking...
          </motion.p>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="mt-4 flex space-x-2">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your question..."
          disabled={loading}
          className="flex-1 p-2 sm:p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 resize-none h-12 text-sm sm:text-base"        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
