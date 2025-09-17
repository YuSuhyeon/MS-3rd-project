"use client";
import { motion } from "framer-motion";
import { Building2, TrendingUp, Package, Star } from "lucide-react";
import { tourDetailData } from "../utils/mockTourData";
import { useState, useEffect } from "react";

const PartnershipSection = () => {
  const partnershipData = tourDetailData.partnershipData;
  const partnershipStats = tourDetailData.partnershipStats;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
      className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 mb-8"
    >
      {/* 헤더 섹션 */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Building2 className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Partnership Benefits
          </h2>
          <p className="text-gray-600">
            Special collaborations with K-Pop Demon Hunters
          </p>
        </div>
      </div>

      {/* 캐러셀 효과로 넘어가게 */}
      <div className="w-full overflow-hidden">
        <motion.div
          className="flex gap-8"
          animate={{
            x: [0, -1680],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 15,
              ease: "linear",
            },
          }}
          style={{ width: "fit-content" }}
        >
          {Array(3)
            .fill(partnershipData)
            .flat()
            .map((partner, index) => (
              <motion.div
                key={`partner-card-${index}`}
                whileHover={{ scale: 1.1, y: -5 }}
                className="flex-shrink-0 w-40 text-center group"
                style={{ minWidth: "160px" }}
              >
                {/* 로고만 깔끔하게 */}
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-black/10 group-hover:shadow-xl group-hover:shadow-purple-500/20 group-hover:scale-110 transition-all duration-300 border border-gray-100">
                  {partner.logo ? (
                    <img
                      src={partner.logo}
                      alt={partner.name || partner.category}
                      className="max-w-14 max-h-14 object-contain"
                      style={{
                        filter: "brightness(1.2) contrast(1.1)",
                        objectFit: "contain",
                      }}
                    />
                  ) : (
                    <div className="text-white font-bold text-2xl">
                      {(partner.name || partner.category || "P")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}
                </div>

                {/* 텍스트만 깔끔하게 */}
                <h3 className="font-bold text-gray-900 mb-1 text-lg group-hover:text-purple-600 transition-colors duration-300">
                  {partner.name || partner.category}
                </h3>
                <p className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors duration-300">
                  {partner.category}
                </p>
              </motion.div>
            ))}
        </motion.div>

        {/* 페이드 효과 */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white/90 to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white/90 to-transparent pointer-events-none z-10" />
      </div>
    </motion.div>
  );
};

export default PartnershipSection;
