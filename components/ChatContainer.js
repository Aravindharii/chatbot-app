"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PaperAirplaneIcon,
  SparklesIcon,
  BuildingStorefrontIcon,
  PhoneIcon,
  XMarkIcon,
  ClockIcon,
  ShieldCheckIcon,
  ChatBubbleBottomCenterTextIcon,
} from "@heroicons/react/24/outline";
import { SuppliersList, parseSuppliers } from "./SupplierCard";

const formatTime = (d) =>
  d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

// ===================================
// MAIN CHAT COMPONENT
// ===================================
export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const listRef = useRef(null);

  // ===================================
  // MESSAGE BUBBLE COMPONENT
  // ===================================
  const MessageBubble = ({ message, onOptionClick }) => {
    if (message.role === "user") {
      return (
        <motion.div
          initial={{ opacity: 0, x: 20, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.4, type: "spring" }}
          className="max-w-[75%] rounded-3xl p-6 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 shadow-2xl shadow-blue-500/30 border border-blue-500/50 relative overflow-hidden group"
        >
          {/* Animated Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

          <p className="text-white leading-relaxed relative z-10 font-medium text-base">
            {message.content}
          </p>
          <div className="text-xs text-blue-200/70 mt-3 text-right relative z-10 font-semibold flex items-center justify-end gap-2">
            <ClockIcon className="w-3 h-3" />
            {formatTime(new Date(message.timestamp))}
          </div>

          {/* Corner Accent */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-bl-full"></div>
        </motion.div>
      );
    }

    if (message.type === "suppliers") {
      return (
        <SuppliersList
          suppliers={message.suppliers}
          aiInsight={message.aiInsight}
          timestamp={message.timestamp}
        />
      );
    }

    if (message.type === "clarification") {
      return (
        <motion.div
          initial={{ opacity: 0, x: -20, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="max-w-[85%] rounded-3xl p-7 bg-gradient-to-br from-purple-900/50 via-blue-900/50 to-purple-900/50 backdrop-blur-2xl border border-purple-500/50 shadow-2xl shadow-purple-500/20 relative overflow-hidden"
        >
          {/* Animated Top Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 animate-pulse"></div>

          {/* Message Content */}
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-purple-500/30 rounded-xl border border-purple-500/40">
              <ChatBubbleBottomCenterTextIcon className="w-6 h-6 text-purple-300" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-purple-300 mb-2">
                Quick Question
              </h4>
              <p className="text-white text-lg leading-relaxed font-medium">
                {message.content}
              </p>
            </div>
          </div>

          {/* Options with Auto-Submit */}
          <div className="flex flex-wrap gap-3">
            {message.options?.map((option, idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.08, y: -3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onOptionClick(option)}
                className="px-6 py-3.5 bg-gradient-to-r from-blue-600/50 to-purple-600/50 hover:from-blue-600/70 hover:to-purple-600/70 border border-blue-500/60 rounded-xl text-white font-bold transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 backdrop-blur-sm relative overflow-hidden group/opt"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full group-hover/opt:translate-x-full transition-transform duration-700"></div>
                <span className="relative z-10">{option}</span>
              </motion.button>
            ))}
          </div>

          <div className="text-xs text-gray-500 mt-5 text-right flex items-center justify-end gap-2">
            <ClockIcon className="w-3 h-3" />
            {formatTime(new Date(message.timestamp))}
          </div>
        </motion.div>
      );
    }

    // Default text response
    return (
      <motion.div
        initial={{ opacity: 0, x: -20, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.4, type: "spring" }}
        className="max-w-[85%] rounded-3xl p-7 bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-2xl border border-gray-700/70 shadow-2xl relative overflow-hidden group"
      >
        {/* Subtle Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

        <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans text-gray-100 relative z-10 font-medium">
          {message.content}
        </pre>
        <div className="text-xs text-gray-500 mt-4 text-right relative z-10 flex items-center justify-end gap-2 font-semibold">
          <ClockIcon className="w-3 h-3" />
          {formatTime(new Date(message.timestamp))}
        </div>
      </motion.div>
    );
  };

  // Load previous messages
  useEffect(() => {
    const saved = sessionStorage.getItem("cconnect-chat");
    if (saved) {
      try {
        const parsedMessages = JSON.parse(saved);
        setMessages(Array.isArray(parsedMessages) ? parsedMessages : []);
      } catch (err) {
        console.error("Failed to load chat history:", err);
        setMessages([]);
      }
    }
  }, []);

  // Save messages
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem("cconnect-chat", JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isTyping]);

  const history = useMemo(
    () => messages.map((m) => ({ role: m.role, content: m.content })),
    [messages]
  );

  async function sendMessage(messageText = null) {
    const text = messageText || input.trim();
    if (!text || isTyping) return;

    if (!messageText) setInput("");
    setError(null);
    const timestamp = new Date().toISOString();

    const userMsg = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: text,
          history,
          useGemini: true,
          usePDF: true,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (data.needsClarification) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            type: "clarification",
            content: data.answer,
            options: data.options,
            questionType: data.questionType,
            timestamp: new Date().toISOString(),
          },
        ]);
      } else if (
        data.rawSheetData &&
        Array.isArray(data.rawSheetData) &&
        data.rawSheetData.length > 0
      ) {
        // Parse suppliers from rawSheetData
        const suppliers = parseSuppliers(data.rawSheetData);

        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            type: "suppliers",
            suppliers: suppliers,
            aiInsight: data.answer,
            content: data.answer,
            timestamp: new Date().toISOString(),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            type: "text",
            content: data.answer || "Sorry, I couldn't generate a response.",
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setError(error.message);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          type: "error",
          content: "⚠️ Sorry, I encountered an error. Please try again.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  // AUTO-SUBMIT when option is clicked
  function handleOptionClick(option) {
    sendMessage(option);
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function clearChat() {
    setMessages([]);
    setError(null);
    sessionStorage.removeItem("cconnect-chat");
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      {/* Enhanced Header with Glass Effect */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="relative z-10 flex items-center justify-between h-24 bg-gray-950/95 backdrop-blur-2xl border-b border-gray-800/70 shadow-2xl px-8"
      >
        <div className="flex items-center gap-5">
          <div className="relative">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 10 }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 flex items-center justify-center shadow-2xl shadow-blue-500/50"
            >
              <SparklesIcon className="w-8 h-8 text-white" />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-gray-950 flex items-center justify-center shadow-lg"
            >
              <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
            </motion.div>
          </div>
          <div>
            <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              CConnect AI
            </h1>
            <p className="text-xs text-gray-400 flex items-center gap-2 mt-1">
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-2 h-2 bg-green-500 rounded-full"
              ></motion.span>
              <span className="font-semibold">
                Powered by Gemini 2.0 Flash • Real-time Supplier Intelligence
              </span>
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearChat}
            className="px-6 py-3 text-sm bg-gradient-to-r from-red-600/40 to-red-500/40 hover:from-red-600/60 hover:to-red-500/60 border border-red-500/50 text-red-200 rounded-xl transition-all duration-300 flex items-center gap-2 backdrop-blur-sm shadow-lg shadow-red-500/20 hover:shadow-red-500/40 font-bold"
          >
            <XMarkIcon className="w-5 h-5" />
            Clear Chat
          </motion.button>
        )}
      </motion.div>

      {/* Error Display with Animation */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative z-10 bg-gradient-to-r from-red-900/60 to-red-800/60 border-b border-red-700/60 text-red-200 px-6 py-5 text-sm flex items-center gap-3 backdrop-blur-lg shadow-lg"
          >
            <div className="w-8 h-8 bg-red-500/30 rounded-xl flex items-center justify-center border border-red-500/40">
              <XMarkIcon className="w-5 h-5 text-red-400" />
            </div>
            <span className="font-semibold">Error: {error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Chat Area with Custom Scrollbar */}
      <div
        className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin scrollbar-thumb-blue-500/60 scrollbar-track-gray-900/50 hover:scrollbar-thumb-blue-500/80 transition-all relative z-10"
        ref={listRef}
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(59, 130, 246, 0.6) rgba(17, 24, 39, 0.5)",
        }}
      >
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <MessageBubble message={m} onOptionClick={handleOptionClick} />
            </motion.div>
          ))}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-start"
            >
              <div className="max-w-[85%] rounded-3xl p-7 bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-2xl border border-gray-700/70 shadow-2xl flex items-center gap-5">
                <div className="flex gap-2">
                  <motion.span
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [1, 0.5, 1],
                    }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                    className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full shadow-lg"
                  />
                  <motion.span
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [1, 0.5, 1],
                    }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full shadow-lg"
                  />
                  <motion.span
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [1, 0.5, 1],
                    }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                    className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full shadow-lg"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-100 font-bold">
                    Searching suppliers...
                  </span>
                  <span className="text-xs text-gray-400 font-medium mt-1">
                    Scanning database for best matches
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {messages.length === 0 && !isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="text-center mt-32"
          >
            <div className="relative inline-block mb-10">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 flex items-center justify-center shadow-3xl relative overflow-hidden"
              >
                <SparklesIcon className="w-16 h-16 text-white relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 transform -translate-x-full animate-shine"></div>
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-3 -right-3 w-10 h-10 bg-green-500 rounded-full border-4 border-gray-950 flex items-center justify-center shadow-xl"
              >
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </motion.div>
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-6xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"
            >
              Welcome to CConnect AI
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-gray-400 text-xl max-w-3xl mx-auto mb-16 leading-relaxed font-medium"
            >
              Your intelligent construction assistant for finding the best
              material suppliers in Kerala. Get AI-powered recommendations,
              compare prices, and connect with trusted dealers instantly.
            </motion.p>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  title: "Smart Supplier Search",
                  desc: "Find cement, steel, paint dealers instantly with AI-powered matching",
                  icon: BuildingStorefrontIcon,
                  color: "blue",
                  gradient: "from-blue-500 to-blue-600",
                },
                {
                  title: "AI-Powered Filters",
                  desc: "Filter by district, rating, pricing and get personalized results",
                  icon: SparklesIcon,
                  color: "purple",
                  gradient: "from-purple-500 to-purple-600",
                },
                {
                  title: "Instant Contact",
                  desc: "Direct calls, website visits, and verified supplier information",
                  icon: PhoneIcon,
                  color: "green",
                  gradient: "from-green-500 to-green-600",
                },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.2 + 0.7, type: "spring" }}
                  whileHover={{ y: -10, scale: 1.05 }}
                  className="p-8 bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/60 rounded-3xl backdrop-blur-2xl hover:border-blue-500/50 transition-all duration-500 group relative overflow-hidden shadow-xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.2 }}
                    transition={{ duration: 0.6 }}
                    className={`p-4 w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} mb-6 group-hover:shadow-2xl transition-all duration-300 relative z-10`}
                  >
                    <item.icon className="w-8 h-8 text-white" />
                  </motion.div>

                  <h3 className="font-black text-white mb-3 text-xl relative z-10">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed font-medium relative z-10">
                    {item.desc}
                  </p>

                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Enhanced Input Area with Floating Effect */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="relative z-10 p-6 bg-gray-950/98 border-t border-gray-800/70 backdrop-blur-2xl shadow-2xl"
      >
        <div className="flex items-end gap-4 max-w-5xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask about cement suppliers in Ernakulam, compare steel prices, or find paint dealers..."
              rows={1}
              className="w-full resize-none rounded-2xl px-7 py-5 bg-gradient-to-br from-gray-800/80 to-gray-900/80 text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/40 border border-gray-700/70 backdrop-blur-2xl shadow-2xl transition-all duration-300 text-base leading-relaxed pr-20 font-medium"
              disabled={isTyping}
              style={{ minHeight: "60px", maxHeight: "150px" }}
            />
            <div className="absolute right-5 bottom-5 flex items-center gap-3">
              <div className="text-xs text-gray-500 bg-gray-700/70 px-3 py-1.5 rounded-lg border border-gray-600/60 font-semibold">
                {input.length}/500
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.08, rotate: 5 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => sendMessage()}
            disabled={!input.trim() || isTyping}
            className="p-5 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 rounded-2xl hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 relative overflow-hidden group disabled:hover:scale-100"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <PaperAirplaneIcon className="w-7 h-7 text-white relative z-10" />
          </motion.button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4 flex items-center justify-center gap-3 font-medium">
          <span className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700 text-[10px]">
              Enter
            </kbd>
            <span>to send</span>
          </span>
          <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
          <span className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700 text-[10px]">
              Shift+Enter
            </kbd>
            <span>for new line</span>
          </span>
          <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
          <span className="flex items-center gap-1">
            <ShieldCheckIcon className="w-3 h-3 text-green-400" />
            AI-powered supplier matching
          </span>
        </p>
      </motion.div>

      {/* CSS for shine animation */}
      <style jsx>{`
        @keyframes shine {
          0% {
            transform: translateX(-100%) skewX(-12deg);
          }
          100% {
            transform: translateX(100%) skewX(-12deg);
          }
        }
        .animate-shine {
          animation: shine 3s infinite;
        }
      `}</style>
    </div>
  );
}
