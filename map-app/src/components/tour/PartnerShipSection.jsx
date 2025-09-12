"use client";
import { motion } from "framer-motion";
import { Building2, TrendingUp, Package, Star } from "lucide-react";
import { tourDetailData } from "../utils/mockTourData";

const PartnershipSection = () => {
  // 올바른 데이터 접근 - tourDetailData에서 직접 가져오기
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

      {/* 통계 요약 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
          <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 bg-blue-600 rounded-lg">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {partnershipStats.totalPartners}
          </div>
          <div className="text-sm text-gray-600">Partners</div>
        </div>

        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
          <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 bg-green-600 rounded-lg">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl font-bold text-green-600">
            {partnershipStats.averageGrowth}
          </div>
          <div className="text-sm text-gray-600">Avg Growth</div>
        </div>

        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
          <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 bg-purple-600 rounded-lg">
            <Package className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {partnershipStats.activeCampaigns}
          </div>
          <div className="text-sm text-gray-600">Active Campaigns</div>
        </div>

        <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
          <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 bg-orange-600 rounded-lg">
            <Star className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl font-bold text-orange-600">
            {partnershipStats.upcomingLaunches}
          </div>
          <div className="text-sm text-gray-600">Upcoming</div>
        </div>
      </div>

      {/* 파트너 카드 그리드 */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {partnershipData.map((partner, index) => (
          <motion.div
            key={partner.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
          >
            {/* 상태 배지 */}
            <div className="absolute top-4 right-4">
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  partner.status === "진행중"
                    ? "bg-green-100 text-green-600"
                    : partner.status === "런칭예정"
                    ? "bg-orange-100 text-orange-600"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                {partner.status === "진행중"
                  ? "Active"
                  : partner.status === "런칭예정"
                  ? "Coming Soon"
                  : "In Progress"}
              </span>
            </div>

            <div className="text-center">
              {/* 로고 */}
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white shadow-md flex items-center justify-center group-hover:shadow-lg transition-shadow">
                {partner.logo ? (
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="h-10 w-auto"
                  />
                ) : (
                  <div className="text-2xl font-bold text-gray-400">
                    {partner.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* 파트너 정보 */}
              <h3 className="font-bold text-gray-900 mb-1">{partner.name}</h3>
              <p className="text-sm text-gray-500 mb-3">{partner.category}</p>

              {/* 통계 */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Products</span>
                  <span className="font-semibold">{partner.products}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Revenue</span>
                  <span className="font-bold text-purple-600">
                    {partner.revenue}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Growth</span>
                  <span className="font-bold text-green-600">
                    {partner.growth}
                  </span>
                </div>
              </div>

              {/* 설명 */}
              <p className="text-xs text-gray-500 mb-3">
                {partner.description}
              </p>

              {/* 혜택 목록 */}
              {partner.benefits && (
                <div className="space-y-1">
                  {partner.benefits.slice(0, 2).map((benefit, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-left bg-gray-50 rounded-lg px-2 py-1"
                    >
                      • {benefit}
                    </div>
                  ))}
                  {partner.benefits.length > 2 && (
                    <div className="text-xs text-gray-400">
                      +{partner.benefits.length - 2} more benefits
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* 추가 정보 */}
      <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
        <h3 className="font-bold text-gray-900 mb-2">
          🎉 Special Benefits for Tour Participants
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          Tour participants receive exclusive discount coupons and limited
          edition merchandise from all our partner companies!
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
            Netflix Photo Cards Included
          </span>
          <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
            Nongshim Cup Noodle Discount
          </span>
          <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
            Photoism Free Photo Session
          </span>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
            Tour Partner Certificate
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default PartnershipSection;
