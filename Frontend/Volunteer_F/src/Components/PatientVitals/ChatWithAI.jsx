import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function ChatWithAI() {
  const [query, setQuery] = useState("");
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, loading]);

  const handleSend = async () => {
    if (!query.trim()) return;

    setChats((prev) => [...prev, { sender: "Doctor", text: query }]);
    const userQuery = query;
    setQuery("");
    setLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent([{ text: userQuery }]);
      const aiText = result.response.text();

      setChats((prev) => [...prev, { sender: "AI", text: aiText }]);
    } catch (error) {
      setChats((prev) => [
        ...prev,
        { sender: "AI", text: "⚠️ AI Error. Please try again." },
      ]);
    }

    setLoading(false);
  };

  const handleEnter = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[70vh]">

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 bg-gray-50 rounded-xl border">
        <AnimatePresence>
          {chats.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-xl max-w-[80%] mb-2 shadow ${
                msg.sender === "Doctor"
                  ? "bg-blue-500 text-white self-start"
                  : "bg-gray-200 text-gray-800 self-end"
              }`}
            >
              <strong>{msg.sender}: </strong>
              {msg.text}
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <p className="text-center text-gray-500 italic">🤖 Thinking...</p>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="mt-3 flex gap-2">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleEnter}
          placeholder="Ask AI anything about diagnosis..."
          className="flex-1 border rounded-xl p-3 h-14 resize-none"
        />

        <button
          onClick={handleSend}
          disabled={loading}
          className="px-5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
