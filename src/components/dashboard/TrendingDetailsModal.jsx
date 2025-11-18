"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

export default function TrendingDetailsModal({ isOpen, trend, onClose }) {
  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !trend) return null;

  return (
    <>
      {/* Blurred Background */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header with Close Button */}
          <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-neutral-900">
              Trending Insight Details
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="h-6 w-6 text-neutral-600" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6">
            {/* Main Heading */}
            <div className="mb-8">
              <h3 className="text-3xl font-bold text-neutral-900 mb-2">
                {trend.label}
              </h3>
              <p className="text-neutral-500">
                Comprehensive trending analysis and performance metrics
              </p>
            </div>

            {/* Overview Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {/* Companies Card */}
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-neutral-600 mb-2">
                  Trending Company
                </p>
                <p className="text-xl font-semibold text-neutral-900">
                  {trend.companies}
                </p>
              </div>

              {/* Category Card */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-neutral-600 mb-2">
                  Industry Category
                </p>
                <p className="text-xl font-semibold text-neutral-900">
                  {trend.category}
                </p>
              </div>

              {/* Tier Card */}
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-neutral-600 mb-2">Popular Tier</p>
                <span className="inline-flex px-4 py-2 rounded-full text-sm font-semibold bg-orange-100 text-orange-800">
                  {trend.tiers}
                </span>
              </div>

              {/* Growth Card */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-neutral-600 mb-2">Growth Rate</p>
                <p className="text-xl font-semibold text-green-600">
                  {trend.growth}
                </p>
              </div>
            </div>

            {/* Detailed Information Section */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-neutral-900 mb-4">
                Performance Metrics
              </h4>
              <div className="space-y-4">
                {/* Market Position */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-neutral-700">
                      Market Position
                    </span>
                    <span className="text-sm font-semibold text-neutral-900">
                      Top Performer
                    </span>
                  </div>
                  <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 w-4/5 rounded-full"></div>
                  </div>
                </div>

                {/* Category Dominance */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-neutral-700">
                      Category Dominance
                    </span>
                    <span className="text-sm font-semibold text-neutral-900">
                      95%
                    </span>
                  </div>
                  <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 w-95 rounded-full"></div>
                  </div>
                </div>

                {/* Engagement Rate */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-neutral-700">
                      Engagement Rate
                    </span>
                    <span className="text-sm font-semibold text-neutral-900">
                      88%
                    </span>
                  </div>
                  <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-88 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-neutral-900 mb-4">
                Additional Information
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                  <span className="text-neutral-600">
                    Total Companies in {trend.category}
                  </span>
                  <span className="font-semibold text-neutral-900">247</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                  <span className="text-neutral-600">Active Users</span>
                  <span className="font-semibold text-neutral-900">12,450</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                  <span className="text-neutral-600">Monthly Revenue</span>
                  <span className="font-semibold text-neutral-900">$2.4M</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                  <span className="text-neutral-600">Market Share</span>
                  <span className="font-semibold text-neutral-900">23.5%</span>
                </div>
              </div>
            </div>

            {/* Summary Section */}
            <div className="p-4 bg-gradient-to-r from-orange-50 to-purple-50 border border-orange-200 rounded-lg">
              <h5 className="font-semibold text-neutral-900 mb-2">Summary</h5>
              <p className="text-sm text-neutral-700 leading-relaxed">
                {trend.label} is showing exceptional growth in the{" "}
                {trend.category} sector. With a {trend.growth} growth rate,{" "}
                {trend.companies} is demonstrating strong market performance in
                the {trend.tiers} tier. The category is gaining momentum and is
                expected to continue its upward trajectory in the coming
                quarters.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-8">
              <button className="flex-1 px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors">
                View Full Report
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-neutral-200 text-neutral-800 font-medium rounded-lg hover:bg-neutral-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
