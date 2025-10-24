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
          className="max-w-[90%] sm:max-w-[80%] md:max-w-[75%] rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 shadow-lg sm:shadow-2xl shadow-blue-500/30 border border-blue-500/50 relative overflow-hidden group"
        >
          {/* Animated Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

          <p className="text-white leading-relaxed relative z-10 font-medium text-sm sm:text-base">
            {message.content}
          </p>
          <div className="text-xs text-blue-200/70 mt-2 sm:mt-3 text-right relative z-10 font-semibold flex items-center justify-end gap-1 sm:gap-2">
            <ClockIcon className="w-3 h-3" />
            {formatTime(new Date(message.timestamp))}
          </div>

          {/* Corner Accent */}
          <div className="absolute top-0 right-0 w-12 h-12 sm:w-20 sm:h-20 bg-white/5 rounded-bl-full"></div>
        </motion.div>
      );
    }

    if (message.type === "suppliers") {
      return (
        <div className="w-full max-w-full">
          <SuppliersList
            suppliers={message.suppliers}
            // aiInsight={message.aiInsight}
            timestamp={message.timestamp}
          />
        </div>
      );
    }

    if (message.type === "clarification") {
      return (
        <motion.div
          initial={{ opacity: 0, x: -20, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="max-w-[95%] sm:max-w-[90%] md:max-w-[85%] rounded-2xl sm:rounded-3xl p-5 sm:p-7 bg-gradient-to-br from-purple-900/50 via-blue-900/50 to-purple-900/50 backdrop-blur-2xl border border-purple-500/50 shadow-lg sm:shadow-2xl shadow-purple-500/20 relative overflow-hidden"
        >
          {/* Animated Top Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 animate-pulse"></div>

          {/* Message Content */}
          <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="p-2 sm:p-3 bg-purple-500/30 rounded-xl border border-purple-500/40 flex-shrink-0">
              <ChatBubbleBottomCenterTextIcon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-300" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-purple-300 mb-1 sm:mb-2">
                Quick Question
              </h4>
              <p className="text-white text-base sm:text-lg leading-relaxed font-medium break-words">
                {message.content}
              </p>
            </div>
          </div>

          {/* Options with Auto-Submit */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {message.options?.map((option, idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onOptionClick(option)}
                className="px-4 py-2.5 sm:px-6 sm:py-3.5 bg-gradient-to-r from-blue-600/50 to-purple-600/50 hover:from-blue-600/70 hover:to-purple-600/70 border border-blue-500/60 rounded-lg sm:rounded-xl text-white font-bold transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 backdrop-blur-sm relative overflow-hidden group/opt text-sm sm:text-base flex-1 min-w-[120px] sm:min-w-0"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full group-hover/opt:translate-x-full transition-transform duration-700"></div>
                <span className="relative z-10 break-words">{option}</span>
              </motion.button>
            ))}
          </div>

          <div className="text-xs text-gray-500 mt-3 sm:mt-5 text-right flex items-center justify-end gap-1 sm:gap-2">
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
        className="max-w-[95%] sm:max-w-[90%] md:max-w-[85%] rounded-2xl sm:rounded-3xl p-5 sm:p-7 bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-2xl border border-gray-700/70 shadow-lg sm:shadow-2xl relative overflow-hidden group"
      >
        {/* Subtle Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

        <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans text-gray-100 relative z-10 font-medium break-words">
          {message.content}
        </pre>
        <div className="text-xs text-gray-500 mt-3 sm:mt-4 text-right relative z-10 flex items-center justify-end gap-1 sm:gap-2 font-semibold">
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
    } else {
      // ONLY add ONE message with the AI response
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
        <div className="absolute top-0 left-1/4 w-48 h-48 sm:w-96 sm:h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-48 h-48 sm:w-96 sm:h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      {/* Enhanced Header with Glass Effect */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="relative z-10 flex items-center justify-between h-16 sm:h-20 md:h-24 bg-gray-950/95 backdrop-blur-2xl border-b border-gray-800/70 shadow-2xl px-4 sm:px-6 md:px-8"
      >
        <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
          <div className="relative">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 10 }}
              className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 flex items-center justify-center shadow-2xl shadow-blue-500/50"
            >
              <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-green-500 rounded-full border-2 sm:border-3 border-gray-950 flex items-center justify-center shadow-lg"
            >
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 bg-white rounded-full"></div>
            </motion.div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 leading-tight">
              CConnect AI
            </h1>
            <p className="text-xs text-gray-400 flex items-center gap-1 sm:gap-2 mt-0.5">
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"
              ></motion.span>
              <span className="font-semibold text-xs sm:text-sm">
                Powered by Gemini 2.0 Flash
              </span>
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearChat}
            className="px-3 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-3 text-xs sm:text-sm bg-gradient-to-r from-red-600/40 to-red-500/40 hover:from-red-600/60 hover:to-red-500/60 border border-red-500/50 text-red-200 rounded-lg sm:rounded-xl transition-all duration-300 flex items-center gap-1 sm:gap-2 backdrop-blur-sm shadow-lg shadow-red-500/20 hover:shadow-red-500/40 font-bold"
          >
            <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Clear Chat</span>
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
            className="relative z-10 bg-gradient-to-r from-red-900/60 to-red-800/60 border-b border-red-700/60 text-red-200 px-4 sm:px-6 py-3 sm:py-5 text-xs sm:text-sm flex items-center gap-2 sm:gap-3 backdrop-blur-lg shadow-lg"
          >
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-500/30 rounded-lg sm:rounded-xl flex items-center justify-center border border-red-500/40 flex-shrink-0">
              <XMarkIcon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-red-400" />
            </div>
            <span className="font-semibold break-words flex-1">Error: {error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Chat Area with Custom Scrollbar */}
      <div
        className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 md:space-y-8 scrollbar-thin scrollbar-thumb-blue-500/60 scrollbar-track-gray-900/50 hover:scrollbar-thumb-blue-500/80 transition-all relative z-10"
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
              <div className="max-w-[95%] sm:max-w-[90%] md:max-w-[85%] rounded-2xl sm:rounded-3xl p-5 sm:p-7 bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-2xl border border-gray-700/70 shadow-lg sm:shadow-2xl flex items-center gap-3 sm:gap-4 md:gap-5">
                <div className="flex gap-1.5 sm:gap-2">
                  <motion.span
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [1, 0.5, 1],
                    }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                    className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full shadow-lg"
                  />
                  <motion.span
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [1, 0.5, 1],
                    }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full shadow-lg"
                  />
                  <motion.span
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [1, 0.5, 1],
                    }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full shadow-lg"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-100 font-bold">
                    Searching suppliers...
                  </span>
                  <span className="text-xs text-gray-400 font-medium mt-0.5 sm:mt-1">
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
            className="text-center mt-16 sm:mt-24 md:mt-32 px-4"
          >
            <div className="relative inline-block mb-6 sm:mb-8 md:mb-10">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 mx-auto rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 flex items-center justify-center shadow-3xl relative overflow-hidden"
              >
                <SparklesIcon className="w-8 h-8 sm:w-10 sm:h-10 md:w-16 md:h-16 text-white relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 transform -translate-x-full animate-shine"></div>
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-green-500 rounded-full border-2 sm:border-3 md:border-4 border-gray-950 flex items-center justify-center shadow-xl"
              >
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 bg-white rounded-full"></div>
              </motion.div>
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-5 md:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 leading-tight"
            >
              Welcome to CConnect AI
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-gray-400 text-base sm:text-lg md:text-xl max-w-2xl sm:max-w-3xl mx-auto mb-8 sm:mb-12 md:mb-16 leading-relaxed font-medium"
            >
              Your intelligent construction assistant for finding the best
              material suppliers in Kerala. Get AI-powered recommendations,
              compare prices, and connect with trusted dealers instantly.
            </motion.p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-4xl sm:max-w-5xl mx-auto">
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
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="p-4 sm:p-6 md:p-8 bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/60 rounded-xl sm:rounded-2xl md:rounded-3xl backdrop-blur-2xl hover:border-blue-500/50 transition-all duration-500 group relative overflow-hidden shadow-lg sm:shadow-xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className={`p-3 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${item.gradient} mb-4 sm:mb-6 group-hover:shadow-2xl transition-all duration-300 relative z-10`}
                  >
                    <item.icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                  </motion.div>

                  <h3 className="font-black text-white mb-2 sm:mb-3 text-lg sm:text-xl md:text-xl relative z-10">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-medium relative z-10">
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
        className="relative z-10 p-4 sm:p-5 md:p-6 bg-gray-950/98 border-t border-gray-800/70 backdrop-blur-2xl shadow-2xl"
      >
        <div className="flex items-end gap-3 sm:gap-4 max-w-5xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask about cement suppliers in Ernakulam, compare steel prices, or find paint dealers..."
              rows={1}
              className="w-full resize-none rounded-xl sm:rounded-2xl px-4 py-3 sm:px-5 sm:py-4 md:px-7 md:py-5 bg-gradient-to-br from-gray-800/80 to-gray-900/80 text-white placeholder-gray-400 focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-blue-500/40 border border-gray-700/70 backdrop-blur-2xl shadow-lg sm:shadow-2xl transition-all duration-300 text-sm sm:text-base leading-relaxed pr-16 sm:pr-20 font-medium"
              disabled={isTyping}
              style={{ minHeight: "50px", maxHeight: "120px" }}
            />
            <div className="absolute right-3 sm:right-4 bottom-3 sm:bottom-4 flex items-center gap-2">
              <div className="text-xs text-gray-500 bg-gray-700/70 px-2 py-1 sm:px-3 sm:py-1.5 rounded border border-gray-600/60 font-semibold">
                {input.length}/500
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => sendMessage()}
            disabled={!input.trim() || isTyping}
            className="p-3 sm:p-4 md:p-5 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 rounded-xl sm:rounded-2xl hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg sm:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 relative overflow-hidden group disabled:hover:scale-100 flex-shrink-0"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <PaperAirplaneIcon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white relative z-10" />
          </motion.button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-3 sm:mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3 font-medium">
          <span className="flex items-center gap-1 sm:gap-2">
            <kbd className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-gray-800 rounded border border-gray-700 text-[10px] sm:text-xs">
              Enter
            </kbd>
            <span className="text-xs">to send</span>
          </span>
          <span className="w-1 h-1 bg-gray-600 rounded-full hidden sm:block"></span>
          <span className="flex items-center gap-1 sm:gap-2">
            <kbd className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-gray-800 rounded border border-gray-700 text-[10px] sm:text-xs">
              Shift+Enter
            </kbd>
            <span className="text-xs">for new line</span>
          </span>
          <span className="w-1 h-1 bg-gray-600 rounded-full hidden sm:block"></span>
          <span className="flex items-center gap-1">
            <ShieldCheckIcon className="w-3 h-3 text-green-400" />
            <span className="text-xs">AI-powered supplier matching</span>
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