"use client";

import React, { useState } from 'react';
import { CategorySelection } from './CategorySelection';

interface SupportFormProps {
  onSubmit: (data: { category: string; email: string; message: string }) => void;
  isSubmitting?: boolean;
}

export const SupportForm: React.FC<SupportFormProps> = ({ 
  onSubmit, 
  isSubmitting = false 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !email || !message) return;
    
    onSubmit({
      category: selectedCategory,
      email,
      message
    });
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setShowCategoryModal(false);
  };

  const resetForm = () => {
    setSelectedCategory("");
    setEmail("");
    setMessage("");
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h2 className="text-2xl font-semibold mb-6 text-white">Send us a Message</h2>
      <p className="text-gray-300 mb-6">
        Your message will be sent to our support team and you&apos;ll be redirected to the support chat page to continue the conversation.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium mb-2 text-white">Category</label>
          <button
            type="button"
            onClick={() => setShowCategoryModal(true)}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-left text-white hover:bg-gray-600 transition-colors"
          >
            {selectedCategory ? (
              <span className="text-white">{selectedCategory}</span>
            ) : (
              <span className="text-gray-400">Select a category</span>
            )}
          </button>
          {selectedCategory && (
            <button
              type="button"
              onClick={() => setSelectedCategory("")}
              className="mt-2 text-sm text-red-400 hover:text-red-300"
            >
              Clear selection
            </button>
          )}
        </div>

        {/* Email Input */}
        <div>
          <label className="block text-sm font-medium mb-2 text-white">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
            placeholder="your.email@example.com"
            required
          />
        </div>

        {/* Message Input */}
        <div>
          <label className="block text-sm font-medium mb-2 text-white">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none text-white placeholder-gray-400"
            placeholder="Describe your issue or question in detail..."
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !selectedCategory || !message || !email}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSubmitting ? "Sending..." : "Send Message"}
        </button>
      </form>

      {/* Category Selection Modal */}
      {showCategoryModal && (
        <CategorySelection
          onCategorySelect={handleCategorySelect}
          onClose={() => setShowCategoryModal(false)}
        />
      )}
    </div>
  );
};
