import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { 
  PaperAirplaneIcon, 
  SparklesIcon, 
  UserCircleIcon, 
  TrashIcon,
  ChatBubbleLeftRightIcon
} from "@heroicons/react/24/outline";

export default function ChatWithAI() {
  const [query, setQuery] = useState("");
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, loading]);

  // Auto-resize textarea
  const handleInputResize = (e) => {
    setQuery(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const handleSend = async () => {
    if (!query.trim()) return;

    const userMessage = { sender: "Doctor", text: query, timestamp: new Date() };
    const newChats = [...chats, userMessage];
    setChats(newChats);
    setQuery("");
    setLoading(true);
    
    // Reset textarea height
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent([{ text: query }]);
      const aiResponse = result.response.text();

      setChats((prev) => [
        ...prev, 
        { sender: "AI", text: aiResponse, timestamp: new Date() }
      ]);
    } catch (err) {
      console.error("Gemini API Error:", err);
      setChats((prev) => [
        ...prev,
        { sender: "AI", text: "⚠️ I encountered an error. Please try again.", isError: true },
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

  const clearChat = () => {
    if(window.confirm("Are you sure you want to clear the conversation?")) {
      setChats([]);
    }
  };

  const QuickPrompt = ({ text }) => (
    <button 
      onClick={() => setQuery(text)}
      className="text-xs sm:text-sm text-left p-3 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 hover:shadow-sm transition-all duration-200"
    >
      {text}
    </button>
  );

  return (
    <div className="flex flex-col h-[80vh] w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
      
      {/* Header */}
      <div className="bg-white border-b border-slate-100 p-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <SparklesIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-lg">Medical AI Assistant</h2>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Online • Powered by Gemini
            </p>
          </div>
        </div>
        {chats.length > 0 && (
          <button 
            onClick={clearChat}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
            title="Clear Chat"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 space-y-6">
        
        {/* Empty State / Welcome Screen */}
        {chats.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-80 mt-[-50px]">
 
            <h3 className="text-xl font-bold text-slate-700 mb-2">How can I help you, Doctor?</h3>
            <p className="text-slate-500 text-center max-w-md mb-8">
              I can assist with drug interactions, symptom analysis, or summarizing medical notes.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
              <QuickPrompt text="What are the side effects of Aspirin?" />
              <QuickPrompt text="Summarize the symptoms of Type 2 Diabetes." />
              <QuickPrompt text="Check for interactions between Warfarin and Ibuprofen." />
              <QuickPrompt text="Draft a patient follow-up email." />
            </div>
          </div>
        )}

        <AnimatePresence>
          {chats.map((chat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex w-full ${chat.sender === "Doctor" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex max-w-[85%] sm:max-w-[75%] ${chat.sender === "Doctor" ? "flex-row-reverse" : "flex-row"} items-end gap-2`}>
                
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  chat.sender === "Doctor" ? "bg-blue-600 text-white" : "bg-emerald-600 text-white"
                }`}>
                  {chat.sender === "Doctor" ? <UserCircleIcon className="w-5 h-5" /> : <SparklesIcon className="w-5 h-5" />}
                </div>

                {/* Message Bubble */}
                <div className={`p-4 rounded-2xl shadow-sm text-sm sm:text-base leading-relaxed whitespace-pre-wrap ${
                  chat.sender === "Doctor" 
                    ? "bg-blue-600 text-white rounded-br-none" 
                    : chat.isError 
                      ? "bg-red-50 text-red-600 border border-red-200 rounded-bl-none"
                      : "bg-white text-slate-700 border border-slate-200 rounded-bl-none"
                }`}>
                  {chat.text}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="flex w-full justify-start"
          >
            <div className="flex items-center gap-2 max-w-[75%]">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-bl-none shadow-sm flex items-center space-x-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-0"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-300"></div>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="relative flex items-end gap-2 bg-slate-50 border border-slate-300 rounded-3xl px-4 py-2 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all duration-200">
          <textarea
            ref={textareaRef}
            value={query}
            onChange={handleInputResize}
            onKeyDown={handleKeyPress}
            placeholder="Ask anything..."
            disabled={loading}
            rows={1}
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-3 max-h-32 text-slate-700 placeholder:text-slate-400"
          />
          <button
            onClick={handleSend}
            disabled={loading || !query.trim()}
            className={`mb-2 p-2 rounded-full transition-all duration-200 ${
              loading || !query.trim() 
                ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-md transform hover:scale-105"
            }`}
          >
            <PaperAirplaneIcon className="w-5 h-5 -ml-0.5 mt-0.5 transform -rotate-45" />
          </button>
        </div>
        <p className="text-center text-xs text-slate-400 mt-2">
          AI can make mistakes. Please verify critical medical information.
        </p>
      </div>
    </div>
  );
}