"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BuildingStorefrontIcon,
  MapPinIcon,
  PhoneIcon,
  GlobeAltIcon,
  SparklesIcon,
  TagIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  CheckBadgeIcon,
  CurrencyRupeeIcon,
  ShieldCheckIcon,
  ClockIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";

// ===================================
// ENHANCED SUPPLIER CARD COMPONENT
// ===================================
export function SupplierCard({ supplier, index }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Helper function to safely get supplier data
  const getSupplierValue = (keys) => {
    for (const key of keys) {
      if (supplier[key] !== undefined && supplier[key] !== null && supplier[key] !== "") {
        return supplier[key];
      }
    }
    return null;
  };

  // Get normalized values
  const name = getSupplierValue(["Name", "name"]) || "Supplier";
  const type = getSupplierValue(["Type", "Category", "category", "Sub Category"]) || "Materials";
  const district = getSupplierValue(["District", "district"]);
  const location = getSupplierValue(["Location", "city", "Area"]);
  const address = getSupplierValue(["Address", "address"]);
  const phone = getSupplierValue(["Phone", "phone", "phone_number", "Contact"]);
  const website = getSupplierValue(["Website", "website", "URL"]);
  const rating = getSupplierValue(["Rating", "rating", "Review", "Stars"]);
  const products = getSupplierValue(["Products", "products", "PRODUCTS", "Specialization"]);
  const priceRange = getSupplierValue(["PriceRange", "priceRange"]) || "Contact for pricing";
  const description = getSupplierValue(["Description", "description"]) || "Trusted supplier of quality construction materials.";
  const ratingCount = getSupplierValue(["RatingCount", "ratingCount", "Rating Count"]);
  const brand = getSupplierValue(["Brand", "brand"]) || name;
  const pinCode = getSupplierValue(["PinCode", "pinCode", "Pin Code", "PIN"]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.05,
        duration: 0.4,
        type: "spring",
        stiffness: 120,
      }}
      className="relative bg-gradient-to-br from-gray-800/70 via-gray-900/70 to-gray-800/70 backdrop-blur-2xl border border-gray-700/60 rounded-3xl p-6 hover:border-blue-500/70 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 group overflow-hidden"
    >
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>

      {/* Header Section */}
      <div className="flex items-start justify-between mb-5 relative z-10">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative">
            {/* Icon Container with Pulse Effect */}
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 flex items-center justify-center shadow-2xl shadow-blue-500/50 group-hover:shadow-blue-500/70 transition-shadow duration-300"
            >
              <BuildingStorefrontIcon className="w-6 h-6 text-white" />
            </motion.div>
            {/* Verified Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full border-2 border-gray-900 flex items-center justify-center shadow-lg"
            >
              <CheckBadgeIcon className="w-3 h-3 text-white" />
            </motion.div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-black text-lg text-white mb-1.5 truncate group-hover:text-blue-400 transition-colors duration-300">
              {name}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 bg-blue-500/20 px-2.5 py-1 rounded-lg border border-blue-500/30">
                <TagIcon className="w-3 h-3 text-blue-400" />
                <p className="text-xs text-blue-300 font-semibold truncate">
                  {type}
                </p>
              </div>
              {products && (
                <div className="flex items-center gap-1.5 bg-purple-500/20 px-2.5 py-1 rounded-lg border border-purple-500/30">
                  <ShieldCheckIcon className="w-3 h-3 text-purple-400" />
                  <p className="text-xs text-purple-300 font-semibold truncate max-w-[120px]">
                    {products}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rating Badge with Animation */}
        {rating && (
          <motion.div
            whileHover={{ scale: 1.05, rotate: 2 }}
            className="flex items-center gap-1 bg-gradient-to-br from-yellow-500/30 to-orange-500/30 px-3 py-2 rounded-xl border border-yellow-500/50 shadow-lg backdrop-blur-sm"
          >
            <StarSolidIcon className="w-4 h-4 text-yellow-300" />
            <span className="font-black text-sm text-yellow-300">
              {rating}
            </span>
            {ratingCount && (
              <span className="text-xs text-yellow-200/80 font-medium">
                ({ratingCount})
              </span>
            )}
          </motion.div>
        )}
      </div>

      {/* Location & Info Grid with Hover Effects */}
      <div className="grid grid-cols-2 gap-2 mb-4 relative z-10">
        {district && (
          <motion.div
            whileHover={{ scale: 1.02, x: 3 }}
            className="flex items-center gap-2 text-sm text-gray-200 bg-gradient-to-r from-gray-800/60 to-gray-700/60 rounded-lg p-2 border border-gray-700/40 hover:border-blue-500/40 transition-all duration-300 backdrop-blur-sm group/item"
          >
            <div className="p-1 bg-blue-500/20 rounded-lg group-hover/item:scale-110 transition-transform">
              <MapPinIcon className="w-3 h-3 text-blue-400" />
            </div>
            <span className="font-semibold truncate text-xs">
              {district}
            </span>
          </motion.div>
        )}

        {location && (
          <motion.div
            whileHover={{ scale: 1.02, x: 3 }}
            className="flex items-center gap-2 text-sm text-gray-200 bg-gradient-to-r from-gray-800/60 to-gray-700/60 rounded-lg p-2 border border-gray-700/40 hover:border-green-500/40 transition-all duration-300 backdrop-blur-sm group/item"
          >
            <div className="p-1 bg-green-500/20 rounded-lg group-hover/item:scale-110 transition-transform">
              <BuildingOfficeIcon className="w-3 h-3 text-green-400" />
            </div>
            <span className="font-semibold truncate text-xs">
              {location}
            </span>
          </motion.div>
        )}

        {priceRange && priceRange !== "Contact for pricing" && (
          <motion.div
            whileHover={{ scale: 1.02, x: 3 }}
            className="flex items-center gap-2 text-sm text-gray-200 bg-gradient-to-r from-gray-800/60 to-gray-700/60 rounded-lg p-2 border border-gray-700/40 hover:border-purple-500/40 transition-all duration-300 backdrop-blur-sm group/item col-span-2"
          >
            <div className="p-1 bg-purple-500/20 rounded-lg group-hover/item:scale-110 transition-transform">
              <CurrencyRupeeIcon className="w-3 h-3 text-purple-400" />
            </div>
            <span className="font-semibold text-xs">{priceRange}</span>
          </motion.div>
        )}
      </div>

      {/* Description with Gradient */}
      {description && description !== "Trusted supplier of quality construction materials." && (
        <div className="mb-4 relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1 bg-purple-500/20 rounded-lg">
              <DocumentTextIcon className="w-3 h-3 text-purple-400" />
            </div>
            <span className="text-xs font-bold text-purple-300">About</span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed line-clamp-2 bg-gray-800/30 p-2 rounded-lg border border-gray-700/30">
            {description}
          </p>
        </div>
      )}

      {/* Action Buttons with Glow Effect */}
      <div className="flex gap-2 mb-3 relative z-10">
        {phone && (
          <motion.a
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            href={`tel:${phone}`}
            className="flex items-center justify-center gap-1 flex-1 px-3 py-2.5 bg-gradient-to-r from-green-600/40 to-green-500/40 hover:from-green-600/60 hover:to-green-500/60 border border-green-500/50 rounded-lg text-xs text-green-200 font-bold transition-all duration-300 shadow-lg shadow-green-500/20 hover:shadow-green-500/40 backdrop-blur-sm group/btn relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform -translate-x-full group-hover/btn:translate-x-full transition-transform duration-500"></div>
            <div className="p-1 bg-green-500/30 rounded-lg group-hover/btn:scale-110 transition-transform relative z-10">
              <PhoneIcon className="w-3 h-3 text-green-200" />
            </div>
            <span className="relative z-10">Call</span>
          </motion.a>
        )}
        {website && (
          <motion.a
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 flex-1 px-3 py-2.5 bg-gradient-to-r from-blue-600/40 to-purple-600/40 hover:from-blue-600/60 hover:to-purple-600/60 border border-blue-500/50 rounded-lg text-xs text-blue-200 font-bold transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 backdrop-blur-sm group/btn relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform -translate-x-full group-hover/btn:translate-x-full transition-transform duration-500"></div>
            <div className="p-1 bg-blue-500/30 rounded-lg group-hover/btn:scale-110 transition-transform relative z-10">
              <GlobeAltIcon className="w-3 h-3 text-blue-200" />
            </div>
            <span className="relative z-10">Website</span>
          </motion.a>
        )}
      </div>

      {/* Expandable Details with Smooth Animation */}
      {(address || pinCode || brand) && (
        <div className="relative z-10">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-center gap-1 py-2 text-xs text-blue-300 hover:text-blue-200 font-semibold transition-all duration-300 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg border border-blue-500/30 hover:border-blue-500/50 backdrop-blur-sm group/expand"
          >
            <span>
              {isExpanded ? "Less Details" : "More Details"}
            </span>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3, type: "spring" }}
              className="group-hover/expand:scale-110 transition-transform"
            >
              {isExpanded ? (
                <ChevronUpIcon className="w-3 h-3" />
              ) : (
                <ChevronDownIcon className="w-3 h-3" />
              )}
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0, y: -5 }}
                animate={{ height: "auto", opacity: 1, y: 0 }}
                exit={{ height: 0, opacity: 0, y: -5 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="mt-3 pt-3 border-t border-gray-700/50 space-y-2">
                  {brand && (
                    <motion.div
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="flex items-center justify-between p-2 bg-gradient-to-r from-orange-500/10 to-orange-600/10 rounded-lg border border-orange-500/30 backdrop-blur-sm hover:border-orange-500/50 transition-all duration-300"
                    >
                      <div className="flex items-center gap-2">
                        <TagIcon className="w-3 h-3 text-orange-400" />
                        <span className="text-xs text-gray-400 font-medium">
                          Brand
                        </span>
                      </div>
                      <span className="text-white font-bold text-xs">
                        {brand}
                      </span>
                    </motion.div>
                  )}
                  {address && (
                    <motion.div
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="p-2 bg-gradient-to-r from-red-500/10 to-red-600/10 rounded-lg border border-red-500/30 backdrop-blur-sm hover:border-red-500/50 transition-all duration-300"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <MapPinIcon className="w-3 h-3 text-red-400" />
                        <span className="text-xs text-gray-400 font-bold">
                          Address
                        </span>
                      </div>
                      <p className="text-white text-xs leading-relaxed font-medium">
                        {address}
                      </p>
                    </motion.div>
                  )}
                  {pinCode && (
                    <motion.div
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center justify-between p-2 bg-gradient-to-r from-purple-500/10 to-purple-600/10 rounded-lg border border-purple-500/30 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300"
                    >
                      <div className="flex items-center gap-2">
                        <ClockIcon className="w-3 h-3 text-purple-400" />
                        <span className="text-xs text-gray-400 font-medium">
                          PIN
                        </span>
                      </div>
                      <span className="text-white font-black text-xs bg-purple-500/30 px-2 py-1 rounded border border-purple-500/40">
                        {pinCode}
                      </span>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Bottom Shine Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
    </motion.div>
  );
}

// ===================================
// SUPPLIER LIST CONTAINER - UPDATED FOR TOP LOADING
// ===================================
export function SuppliersList({ suppliers, aiInsight, timestamp }) {
  const containerRef = useRef(null);

  // Auto-scroll to top when new content loads
  useEffect(() => {
    if (containerRef.current && suppliers && suppliers.length > 0) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [suppliers]);

  if (!suppliers || !Array.isArray(suppliers)) {
    return (
      <div className="w-full max-w-4xl">
        <div className="bg-gradient-to-br from-gray-900/60 via-gray-800/60 to-gray-900/60 backdrop-blur-2xl rounded-2xl p-6 border border-gray-800/70 shadow-2xl text-center">
          <BuildingStorefrontIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-400 mb-2">No Suppliers Found</h3>
          <p className="text-gray-500 text-sm">Please check your search criteria or try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full max-w-4xl space-y-4 overflow-y-auto">
      {/* AI Insight Card - Now appears first */}
      {aiInsight && <AIInsightCard insight={aiInsight} />}

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-gradient-to-br from-gray-900/60 via-gray-800/60 to-gray-900/60 backdrop-blur-2xl rounded-2xl p-5 border border-gray-800/70 shadow-2xl"
      >
        {/* Header with Stats - More compact */}
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="p-2 bg-gradient-to-br from-blue-500/30 to-purple-600/30 rounded-xl border border-blue-500/40 shadow-lg backdrop-blur-sm"
            >
              <BuildingStorefrontIcon className="w-5 h-5 text-blue-400" />
            </motion.div>
            <div>
              <h3 className="font-black text-lg text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Top Suppliers
              </h3>
              <p className="text-xs text-gray-400 font-medium mt-0.5">
                {suppliers.length} verified suppliers found
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="px-3 py-1.5 bg-gradient-to-r from-green-500/30 to-green-600/30 rounded-lg border border-green-500/40 shadow-lg backdrop-blur-sm"
            >
              <span className="text-xs text-green-300 font-black flex items-center gap-1">
                <CheckBadgeIcon className="w-3 h-3" />
                {suppliers.length}
              </span>
            </motion.div>
          </div>
        </div>

        {/* Suppliers Grid - Now loads from top */}
        <div className="grid gap-4">
          <AnimatePresence>
            {suppliers.map((supplier, idx) => (
              <SupplierCard key={idx} supplier={supplier} index={idx} />
            ))}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {timestamp && (
          <div className="flex items-center justify-between text-xs text-gray-500 mt-4 pt-3 border-t border-gray-800/50">
            <div className="flex items-center gap-1">
              <CheckBadgeIcon className="w-3 h-3 text-green-500" />
              <span className="font-medium">
                Verified • Real-time
              </span>
            </div>
            <div className="flex items-center gap-1">
              <ClockIcon className="w-3 h-3" />
              {new Date(timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ===================================
// AI INSIGHT CARD - UPDATED FOR TOP POSITION
// ===================================
function AIInsightCard({ insight }) {
  if (!insight) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, type: "spring" }}
      className="relative overflow-hidden bg-gradient-to-br from-purple-900/40 via-blue-900/40 to-purple-900/40 backdrop-blur-2xl border border-purple-500/50 rounded-2xl p-5 shadow-2xl shadow-purple-500/20 hover:shadow-purple-500/30 transition-all duration-400 group"
    >
      {/* Animated Top Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"></div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-2xl"></div>
      </div>

      <div className="flex items-start gap-4 relative z-10">
        <motion.div
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 0.5 }}
          className="p-3 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-xl border border-purple-500/40 shadow-lg backdrop-blur-sm flex-shrink-0"
        >
          <SparklesIcon className="w-5 h-5 text-purple-300" />
        </motion.div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-black text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
              AI Insights
            </h3>
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="px-2 py-1 bg-purple-500/30 rounded border border-purple-500/40 shadow-lg"
            >
              <span className="text-xs text-purple-200 font-black">
                PRO TIPS
              </span>
            </motion.div>
          </div>
          <div className="text-sm text-gray-100 leading-relaxed space-y-2">
            {insight
              .split("\n")
              .filter((line) => line.trim())
              .map((line, index) => (
                <motion.p
                  key={index}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.08 }}
                  className="flex items-start gap-2 p-2 bg-gray-900/30 rounded-lg border border-gray-700/30 hover:border-purple-500/30 transition-all duration-300 backdrop-blur-sm group/line"
                >
                  <span className="text-purple-400 mt-0.5 flex-shrink-0 text-sm group-hover/line:scale-110 transition-transform">
                    ✨
                  </span>
                  <span className="font-medium text-xs">{line}</span>
                </motion.p>
              ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ===================================
// ENHANCED SUPPLIER PARSER
// ===================================
export function parseSuppliers(rawData) {
  if (!Array.isArray(rawData)) return [];

  return rawData
    .filter(item => item !== null && item !== undefined)
    .map((item) => {
      if (typeof item === "object") {
        return {
          Name: item.Name || item.name || "Unknown Supplier",
          Type: item.Type || item.Category || item.category || item["Sub Category"] || "Construction Materials",
          District: item.District || item.district || "Thrissur",
          Location: item.Location || item.City || item.city || item.Area || "",
          Address: item.Address || item.address || "",
          Phone: item.Phone || item.phone || item.phone_number || item.Contact || "",
          Website: item.Website || item.website || item.URL || "",
          Rating: item.Rating || item.rating || item.Review || item.Stars || "",
          Products: item.Products || item.products || item.PRODUCTS || item.Specialization || "",
          PriceRange: item.PriceRange || item.priceRange || "Contact for pricing",
          Description: item.Description || item.description || "Trusted supplier of quality construction materials.",
          RatingCount: item.RatingCount || item.ratingCount || item["Rating Count"] || "",
          Brand: item.Brand || item.brand || item.Name || item.name,
          PinCode: item.PinCode || item.pinCode || item["Pin Code"] || item.PIN || "",
        };
      }

      if (typeof item === "string") {
        const parts = item.split("|").map(p => p.trim()).filter(p => p);
        
        return {
          Name: parts[0] || "Construction Supplier",
          Type: "Construction Materials",
          District: "Thrissur",
          Location: parts.find(p => p.includes("Thrissur")) || "Thrissur",
          Address: parts.find(p => p.includes("Rd") || p.includes("Road") || p.includes("Near")) || "",
          Phone: parts.find(p => /^\d{10,}$/.test(p.replace(/[\s-]/g, ""))) || "",
          Website: parts.find(p => /^https?:\/\//i.test(p)) || "",
          Rating: parts.find(p => !isNaN(parseFloat(p)) && parseFloat(p) <= 5) || "",
          Products: parts.find(p => /(cement|steel|tiles|hardware)/i.test(p)) || "",
          PriceRange: "Contact for pricing",
          Description: "Trusted supplier of quality construction materials.",
          Brand: parts[0] || "Construction Supplier",
        };
      }

      return item;
    })
    .filter(supplier => supplier.Name && supplier.Name !== "Unknown Supplier");
}

// ===================================
// SCROLL TO TOP COMPONENT
// ===================================
export function ScrollToTopButton() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-2xl border border-blue-400/50 backdrop-blur-sm"
    >
      <ChevronUpIcon className="w-5 h-5 text-white" />
    </motion.button>
  );
}