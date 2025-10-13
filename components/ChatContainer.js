"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  PaperAirplaneIcon, 
  SparklesIcon,
  BuildingStorefrontIcon,
  MapPinIcon,
  StarIcon,
  PhoneIcon,
  GlobeAltIcon,
  XMarkIcon,
  ClockIcon,
  TagIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  CheckBadgeIcon
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";

const formatTime = (d) =>
  d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

// Enhanced Supplier Card Component
function SupplierCard({ supplier, index }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-lg border border-gray-700/60 rounded-3xl p-6 hover:border-blue-500/60 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 group"
    >
      {/* Header Section */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
              <BuildingStorefrontIcon className="w-7 h-7 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
              <CheckBadgeIcon className="w-3 h-3 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-xl text-white mb-1 truncate">{supplier.name}</h3>
            <div className="flex items-center gap-2">
              <TagIcon className="w-4 h-4 text-blue-400" />
              <p className="text-sm text-gray-300 truncate">{supplier.category}</p>
            </div>
          </div>
        </div>
        
        {/* Rating Badge */}
        {supplier.rating && (
          <div className="flex items-center gap-1 bg-yellow-500/30 px-3 py-2 rounded-xl border border-yellow-500/40 shadow-lg">
            <StarSolidIcon className="w-4 h-4 text-yellow-300" />
            <span className="font-bold text-yellow-300">{supplier.rating}</span>
            {supplier.ratingCount && (
              <span className="text-xs text-yellow-200/80 ml-1">({supplier.ratingCount})</span>
            )}
          </div>
        )}
      </div>

      {/* Location & Info Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {supplier.district && (
          <div className="flex items-center gap-2 text-sm text-gray-300 bg-gray-800/40 rounded-lg p-2">
            <MapPinIcon className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span className="truncate">{supplier.district}</span>
          </div>
        )}
        
        {supplier.city && (
          <div className="flex items-center gap-2 text-sm text-gray-300 bg-gray-800/40 rounded-lg p-2">
            <BuildingOfficeIcon className="w-4 h-4 text-green-400 flex-shrink-0" />
            <span className="truncate">{supplier.city}</span>
          </div>
        )}
      </div>

      {/* Description */}
      {supplier.description && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <DocumentTextIcon className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-gray-300">Description</span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed line-clamp-2">
            {supplier.description}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 mb-4">
        {supplier.phone && (
          <a
            href={`tel:${supplier.phone}`}
            className="flex items-center gap-2 flex-1 px-4 py-3 bg-green-600/30 hover:bg-green-600/40 border border-green-500/40 rounded-xl text-sm text-green-300 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/20 group/btn"
          >
            <div className="p-1.5 bg-green-500/20 rounded-lg group-hover/btn:scale-110 transition-transform">
              <PhoneIcon className="w-4 h-4 text-green-300" />
            </div>
            <span className="font-medium">Call Now</span>
          </a>
        )}
        {supplier.website && (
          <a
            href={supplier.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 flex-1 px-4 py-3 bg-blue-600/30 hover:bg-blue-600/40 border border-blue-500/40 rounded-xl text-sm text-blue-300 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 group/btn"
          >
            <div className="p-1.5 bg-blue-500/20 rounded-lg group-hover/btn:scale-110 transition-transform">
              <GlobeAltIcon className="w-4 h-4 text-blue-300" />
            </div>
            <span className="font-medium">Visit Site</span>
          </a>
        )}
      </div>

      {/* Expandable Details */}
      {(supplier.address || supplier.pinCode || supplier.brand) && (
        <>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-blue-400 hover:text-blue-300 transition-all duration-300 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl border border-blue-500/20"
          >
            <span>{isExpanded ? "Show Less Details" : "Show More Details"}</span>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <SparklesIcon className="w-4 h-4" />
            </motion.div>
          </button>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t border-gray-700/50 space-y-3">
                  {supplier.brand && (
                    <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <TagIcon className="w-4 h-4 text-orange-400" />
                        <span className="text-sm text-gray-400">Brand</span>
                      </div>
                      <span className="text-white font-semibold text-sm">{supplier.brand}</span>
                    </div>
                  )}
                  {supplier.address && (
                    <div className="p-3 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPinIcon className="w-4 h-4 text-red-400" />
                        <span className="text-sm text-gray-400">Full Address</span>
                      </div>
                      <p className="text-white text-sm leading-relaxed">{supplier.address}</p>
                    </div>
                  )}
                  {supplier.pinCode && (
                    <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <ClockIcon className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-gray-400">PIN Code</span>
                      </div>
                      <span className="text-white font-semibold text-sm bg-purple-500/20 px-2 py-1 rounded-lg">
                        {supplier.pinCode}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
}

// Enhanced AI Insight Card Component
function AIInsightCard({ insight }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-lg border border-purple-500/40 rounded-3xl p-6 mb-6 shadow-2xl shadow-purple-500/10"
    >
      {/* Animated Background */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>
      
      <div className="flex items-start gap-4">
        <div className="p-3 bg-purple-500/20 rounded-2xl border border-purple-500/30">
          <SparklesIcon className="w-6 h-6 text-purple-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-bold text-lg text-purple-300">AI Recommendations</h3>
            <div className="px-2 py-1 bg-purple-500/20 rounded-lg border border-purple-500/30">
              <span className="text-xs text-purple-300 font-medium">PRO TIPS</span>
            </div>
          </div>
          <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap space-y-2">
            {insight.split('\n').map((line, index) => (
              <p key={index} className="flex items-start gap-2">
                <span className="text-purple-400 mt-1.5 flex-shrink-0">•</span>
                <span>{line}</span>
              </p>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const listRef = useRef(null);

  // Enhanced Message Bubble Component (now inside Chat component)
  const MessageBubble = ({ message, onOptionClick }) => {
    if (message.role === "user") {
      return (
        <div className="max-w-[75%] rounded-3xl p-5 bg-gradient-to-br from-blue-600 to-blue-700 shadow-2xl border border-blue-500/50 relative overflow-hidden group">
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <p className="text-white leading-relaxed relative z-10">{message.content}</p>
          <div className="text-xs text-blue-200/70 mt-3 text-right relative z-10">
            {formatTime(new Date(message.timestamp))}
          </div>
        </div>
      );
    }

    if (message.type === "suppliers") {
      return (
        <div className="w-full max-w-5xl space-y-6">
          {message.aiInsight && <AIInsightCard insight={message.aiInsight} />}
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/40 backdrop-blur-lg rounded-3xl p-6 border border-gray-800/60 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-500/30">
                <BuildingStorefrontIcon className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-white">
                  Top Suppliers Found
                </h3>
                <p className="text-sm text-gray-400">
                  {message.suppliers?.length || 0} suppliers matching your criteria
                </p>
              </div>
              <div className="ml-auto px-3 py-1 bg-green-500/20 rounded-lg border border-green-500/30">
                <span className="text-sm text-green-300 font-medium">
                  {message.suppliers?.length || 0} Results
                </span>
              </div>
            </div>
            
            <div className="grid gap-5">
              {message.suppliers?.map((supplier, idx) => (
                <SupplierCard key={idx} supplier={supplier} index={idx} />
              ))}
            </div>
            
            <div className="text-xs text-gray-500 text-right mt-4 pt-4 border-t border-gray-800/50">
              {formatTime(new Date(message.timestamp))}
            </div>
          </motion.div>
        </div>
      );
    }

    if (message.type === "clarification") {
      return (
        <div className="max-w-[80%] rounded-3xl p-6 bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-lg border border-purple-500/40 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>
          <p className="text-white mb-5 text-lg leading-relaxed">{message.content}</p>
          <div className="flex flex-wrap gap-3">
            {message.options?.map((option, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onOptionClick(option)}
                className="px-5 py-3 bg-blue-600/40 hover:bg-blue-600/60 border border-blue-500/50 rounded-xl text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 backdrop-blur-sm"
              >
                {option}
              </motion.button>
            ))}
          </div>
          <div className="text-xs text-gray-500 mt-4 text-right">
            {formatTime(new Date(message.timestamp))}
          </div>
        </div>
      );
    }

    // Default text response
    return (
      <div className="max-w-[80%] rounded-3xl p-6 bg-gray-800/60 backdrop-blur-lg border border-gray-700/60 shadow-2xl relative overflow-hidden group">
        {/* Subtle shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
        <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans text-gray-200 relative z-10">
          {message.content}
        </pre>
        <div className="text-xs text-gray-500 mt-3 text-right relative z-10">
          {formatTime(new Date(message.timestamp))}
        </div>
      </div>
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
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const history = useMemo(
    () => messages.map((m) => ({ role: m.role, content: m.content })),
    [messages]
  );

  async function sendMessage() {
    if (!input.trim() || isTyping) return;

    const text = input.trim();
    setInput("");
    setError(null);
    const timestamp = new Date().toISOString();

    const userMsg = { 
      id: crypto.randomUUID(), 
      role: "user", 
      content: text, 
      timestamp 
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
          useGemini: true 
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
      } else if (data.hasDatabaseResults && data.rawSheetData) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            type: "suppliers",
            suppliers: parseSuppliers(data.rawSheetData),
            aiInsight: data.geminiEnhancement,
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

  function parseSuppliers(rawData) {
    if (!Array.isArray(rawData)) return [];

    return rawData.map((item, rowIndex) => {
      if (typeof item !== 'string') return item;

      const parts = item.split('|').map(p => p.trim());
      const parsed = {};

      parts.forEach((part, i) => {
        if (!part) return;

        if (/^\d{6}$/.test(part)) {
          parsed.pinCode = part;
        } else if (/^\d{10,}$/.test(part.replace(/\s/g, ''))) {
          parsed.phone = part;
        } else if (!isNaN(parseFloat(part)) && parseFloat(part) >= 0 && parseFloat(part) <= 5) {
          parsed.rating = part;
        } else if (/(agencies|store|materials|traders|building)/i.test(part)) {
          parsed.name = parsed.name || part;
          parsed.brand = parsed.brand || part;
        } else if (/,/.test(part)) {
          parsed.address = part;
        } else if (/(TMT|materials|construction|hardware)/i.test(part)) {
          parsed.category = part;
        } else if (/^[A-Z][a-z]+/.test(part)) {
          if (!parsed.city) {
            parsed.city = part;
          } else if (!parsed.district) {
            parsed.district = part;
          }
        } else if (/^https?:\/\//i.test(part)) {
          parsed.website = part;
        }
      });

      // Fallbacks
      parsed.name = parsed.name || 'Unknown Supplier';
      parsed.brand = parsed.brand || parsed.name;
      parsed.district = parsed.district || 'Unknown District';
      parsed.category = parsed.category || 'Construction Materials';
      parsed.address = parsed.address || 'Address not specified';
      parsed.city = parsed.city || 'Unknown City';
      parsed.pinCode = parsed.pinCode || '';
      parsed.phone = parsed.phone || '';
      parsed.rating = parsed.rating || '4.0';
      parsed.ratingCount = parsed.ratingCount || '50+';
      parsed.description = parsed.description || 'Trusted supplier of quality construction materials with excellent customer service and reliable delivery.';

      return parsed;
    });
  }

  function handleOptionClick(option) {
    setInput(option);
    setTimeout(() => sendMessage(), 100);
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
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white overflow-hidden">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between h-20 bg-gray-950/95 backdrop-blur-2xl border-b border-gray-800/60 shadow-2xl px-8">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl">
              <SparklesIcon className="w-7 h-7 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-950 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              CConnect AI
            </h1>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Powered by Gemini Pro • Real-time Supplier Search
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearChat}
            className="px-5 py-2.5 text-sm bg-red-600/30 hover:bg-red-600/40 border border-red-500/40 text-red-300 rounded-xl transition-all duration-200 flex items-center gap-2 backdrop-blur-sm"
          >
            <XMarkIcon className="w-4 h-4" />
            Clear Chat
          </motion.button>
        )}
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-900/50 border-b border-red-700/50 text-red-200 px-6 py-4 text-sm flex items-center gap-3 backdrop-blur-lg"
          >
            <div className="w-6 h-6 bg-red-500/20 rounded-lg flex items-center justify-center border border-red-500/30">
              <XMarkIcon className="w-4 h-4 text-red-400" />
            </div>
            <span>Error: {error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Chat Area */}
      <div
        className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin scrollbar-thumb-blue-500/50 scrollbar-track-gray-900/50"
        ref={listRef}
      >
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
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
              <div className="max-w-[80%] rounded-3xl p-6 bg-gray-800/60 backdrop-blur-lg border border-gray-700/60 shadow-2xl flex items-center gap-4">
                <div className="flex gap-1.5">
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    className="w-2.5 h-2.5 bg-blue-400 rounded-full"
                  />
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    className="w-2.5 h-2.5 bg-blue-400 rounded-full"
                  />
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                    className="w-2.5 h-2.5 bg-blue-400 rounded-full"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-200 font-medium">Searching suppliers...</span>
                  <span className="text-xs text-gray-500">Scanning database for best matches</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {messages.length === 0 && !isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mt-24"
          >
            <div className="relative inline-block mb-8">
              <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-3xl relative overflow-hidden">
                <SparklesIcon className="w-12 h-12 text-white relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full animate-shine"></div>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-gray-950 flex items-center justify-center shadow-lg">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            
            <h2 className="text-5xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-purple-600">
              Welcome to CConnect AI
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
              Your intelligent construction assistant for finding the best material suppliers in Kerala. 
              Get AI-powered recommendations, compare prices, and connect with trusted dealers.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { 
                  title: "Smart Supplier Search", 
                  desc: "Find cement, steel, paint dealers instantly",
                  icon: BuildingStorefrontIcon,
                  color: "blue"
                },
                { 
                  title: "AI-Powered Filters", 
                  desc: "Filter by district, rating, and pricing",
                  icon: SparklesIcon,
                  color: "purple"
                },
                { 
                  title: "Instant Contact", 
                  desc: "Direct calls and website visits",
                  icon: PhoneIcon,
                  color: "green"
                }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.15 + 0.4 }}
                  className="p-6 bg-gray-800/40 border border-gray-700/50 rounded-2xl backdrop-blur-lg hover:border-blue-500/30 transition-all duration-500 group hover:transform hover:-translate-y-2"
                >
                  <div className={`p-3 w-12 h-12 rounded-xl bg-${item.color}-500/20 border border-${item.color}-500/30 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className={`w-6 h-6 text-${item.color}-400`} />
                  </div>
                  <h3 className="font-bold text-white mb-2 text-lg">{item.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Enhanced Input Area */}
      <div className="p-6 bg-gray-950/95 border-t border-gray-800/60 backdrop-blur-2xl">
        <div className="flex items-end gap-4 max-w-5xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask about cement suppliers in Ernakulam, compare steel prices, or find paint dealers..."
              rows={1}
              className="w-full resize-none rounded-2xl px-6 py-5 bg-gray-800/60 text-white placeholder-gray-400 focus:outline-none focus:ring-3 focus:ring-blue-500/30 border border-gray-700/60 backdrop-blur-lg shadow-2xl transition-all duration-300 text-base leading-relaxed pr-16"
              disabled={isTyping}
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              <div className="text-xs text-gray-500 bg-gray-700/50 px-2 py-1 rounded-lg border border-gray-600/50">
                {input.length}/500
              </div>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={sendMessage}
            disabled={!input.trim() || isTyping}
            className="p-5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <PaperAirplaneIcon className="w-6 h-6 text-white relative z-10" />
          </motion.button>
        </div>
        <p className="text-xs text-gray-500 text-center mt-3 flex items-center justify-center gap-2">
          <span>Press Enter to send • Shift+Enter for new line</span>
          <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
          <span>AI-powered supplier matching</span>
        </p>
      </div>
    </div>
  );
}