"use client";

import React, { useState } from 'react';
import { 
  IoPersonOutline, 
  IoCardOutline, 
  IoConstructOutline, 
  IoBulbOutline, 
  IoBugOutline, 
  IoHelpCircleOutline,
  IoFlagOutline,
  IoWarningOutline
} from 'react-icons/io5';

interface CategorySelectionProps {
  onCategorySelect: (category: string) => void;
  onClose: () => void;
}

const categories = [
  {
    id: 'Account Issues',
    label: 'Account Issues',
    icon: IoPersonOutline,
    description: 'Login, profile, or account-related problems'
  },
  {
    id: 'Payment & Billing',
    label: 'Payment & Billing',
    icon: IoCardOutline,
    description: 'Payment methods, billing, or transaction issues'
  },
  {
    id: 'Technical Support',
    label: 'Technical Support',
    icon: IoConstructOutline,
    description: 'App bugs, technical difficulties, or performance issues'
  },
  {
    id: 'Feature Request',
    label: 'Feature Request',
    icon: IoBulbOutline,
    description: 'Suggestions for new features or improvements'
  },
  {
    id: 'Bug Report',
    label: 'Bug Report',
    icon: IoBugOutline,
    description: 'Report bugs or unexpected behavior'
  },
  {
    id: 'Report a Fan',
    label: 'Report a Fan',
    icon: IoFlagOutline,
    description: 'Report inappropriate behavior or content from a fan'
  },
  {
    id: 'Report a Creator',
    label: 'Report a Creator',
    icon: IoWarningOutline,
    description: 'Report inappropriate behavior or content from a creator'
  },
  {
    id: 'Other',
    label: 'Other',
    icon: IoHelpCircleOutline,
    description: 'Any other questions or concerns'
  }
];

export const CategorySelection: React.FC<CategorySelectionProps> = ({ 
  onCategorySelect, 
  onClose 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleSendMessage = () => {
    if (selectedCategory) {
      onCategorySelect(selectedCategory);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Select a category</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-3 mb-6">
          {categories.map((category) => {
            const IconComponent = category.icon;
            const isSelected = selectedCategory === category.id;
            
            return (
              <div
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-600 hover:border-gray-500 bg-gray-700/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    isSelected ? 'bg-blue-500' : 'bg-gray-600'
                  }`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{category.label}</h3>
                    <p className="text-sm text-gray-300">{category.description}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-400'
                  }`}>
                    {isSelected && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleSendMessage}
          disabled={!selectedCategory}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
        >
          Send Message
        </button>
      </div>
    </div>
  );
};
