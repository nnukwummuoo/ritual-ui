"use client";

import React, { useState } from "react";
import { FaAngleLeft, FaRocket, FaStar, FaBug, FaCog, FaHeart, FaComments, FaShield } from "react-icons/fa";
import { useRouter } from "next/navigation";

const WhatsNewPage: React.FC = () => {
  const router = useRouter();
  const [selectedVersion, setSelectedVersion] = useState<string>("latest");

  const versions = [
    {
      id: "latest",
      version: "v2.1.0",
      date: "December 2024",
      status: "current",
      features: [
        {
          icon: <FaComments className="w-5 h-5 text-blue-400" />,
          title: "Enhanced Messaging System",
          description: "Real-time messaging with improved UI, message reactions, and better notification system.",
          type: "feature"
        },
        {
          icon: <FaHeart className="w-5 h-5 text-red-400" />,
          title: "Improved Profile Pages",
          description: "Redesigned profile layout with better stats display, enhanced following system, and modern UI.",
          type: "feature"
        },
        {
          icon: <FaShield className="w-5 h-5 text-green-400" />,
          title: "Enhanced Security",
          description: "Improved authentication system with better password requirements and account protection.",
          type: "security"
        },
        {
          icon: <FaBug className="w-5 h-5 text-yellow-400" />,
          title: "Bug Fixes",
          description: "Fixed issues with message delivery, profile loading, and following functionality.",
          type: "fix"
        }
      ]
    },
    {
      id: "v2.0.0",
      version: "v2.0.0",
      date: "November 2024",
      status: "previous",
      features: [
        {
          icon: <FaRocket className="w-5 h-5 text-purple-400" />,
          title: "Major UI Overhaul",
          description: "Complete redesign of the user interface with modern design principles and improved user experience.",
          type: "feature"
        },
        {
          icon: <FaCog className="w-5 h-5 text-gray-400" />,
          title: "Settings Improvements",
          description: "Enhanced settings page with better organization and more customization options.",
          type: "feature"
        },
        {
          icon: <FaStar className="w-5 h-5 text-yellow-400" />,
          title: "New Following System",
          description: "Improved following and followers functionality with better user discovery.",
          type: "feature"
        }
      ]
    },
    {
      id: "v1.5.0",
      version: "v1.5.0",
      date: "October 2024",
      status: "previous",
      features: [
        {
          icon: <FaComments className="w-5 h-5 text-blue-400" />,
          title: "Basic Messaging",
          description: "Initial implementation of the messaging system with basic chat functionality.",
          type: "feature"
        },
        {
          icon: <FaHeart className="w-5 h-5 text-red-400" />,
          title: "Profile System",
          description: "Basic profile pages with user information and stats display.",
          type: "feature"
        }
      ]
    }
  ];

  const getFeatureTypeColor = (type: string) => {
    switch (type) {
      case "feature":
        return "border-blue-500 bg-blue-500/10";
      case "security":
        return "border-green-500 bg-green-500/10";
      case "fix":
        return "border-yellow-500 bg-yellow-500/10";
      default:
        return "border-gray-500 bg-gray-500/10";
    }
  };

  const getFeatureTypeLabel = (type: string) => {
    switch (type) {
      case "feature":
        return "New Feature";
      case "security":
        return "Security Update";
      case "fix":
        return "Bug Fix";
      default:
        return "Update";
    }
  };

  const currentVersion = versions.find(v => v.id === selectedVersion) || versions[0];

  return (
    <div className="min-h-screen bg-[#0e0f2a] text-white">
      <div className="w-full max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <FaAngleLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold">What's New</h1>
            <p className="text-gray-400">Stay updated with the latest features and improvements</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Version Selector */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Versions</h2>
              <div className="space-y-2">
                {versions.map((version) => (
                  <button
                    key={version.id}
                    onClick={() => setSelectedVersion(version.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedVersion === version.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{version.version}</span>
                      {version.status === "current" && (
                        <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">{version.date}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{currentVersion.version}</h2>
                  <p className="text-gray-400">{currentVersion.date}</p>
                </div>
                {currentVersion.status === "current" && (
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Latest Version
                  </span>
                )}
              </div>

              <div className="space-y-6">
                {currentVersion.features.map((feature, index) => (
                  <div
                    key={index}
                    className={`border-l-4 p-4 rounded-r-lg ${getFeatureTypeColor(feature.type)}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{feature.title}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full border ${getFeatureTypeColor(feature.type)}`}>
                            {getFeatureTypeLabel(feature.type)}
                          </span>
                        </div>
                        <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Call to Action */}
              {currentVersion.status === "current" && (
                <div className="mt-8 p-6 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-lg border border-blue-500/30">
                  <h3 className="text-lg font-semibold mb-2">Enjoying the new features?</h3>
                  <p className="text-gray-300 mb-4">
                    We're constantly working to improve your experience. Have feedback or suggestions?
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => router.push("/support")}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Send Feedback
                    </button>
                    <button
                      onClick={() => router.push("/profile")}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Explore Features
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsNewPage;
