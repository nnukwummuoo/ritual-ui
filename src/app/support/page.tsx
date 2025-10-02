"use client";

import React, { useState } from "react";
import { FaAngleLeft, FaQuestionCircle, FaEnvelope, FaPhone, FaClock } from "react-icons/fa";
import { useRouter } from "next/navigation";

const SupportPage: React.FC = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const categories = [
    { id: "account", label: "Account Issues", icon: "👤" },
    { id: "payment", label: "Payment & Billing", icon: "💳" },
    { id: "technical", label: "Technical Support", icon: "🔧" },
    { id: "feature", label: "Feature Request", icon: "💡" },
    { id: "bug", label: "Bug Report", icon: "🐛" },
    { id: "other", label: "Other", icon: "❓" },
  ];

  const faqs = [
    {
      section: "🔑 Getting Started",
      questions: [
        {
          question: "How do I create an account?",
          answer: "Sign up with a username and password. You will also be given a unique 12-secret-phrase for recovery."
        },
        {
          question: "What is the 12-secret-phrase?",
          answer: "It's your backup key. If you forget your password or lose access, you can use the 12-secret-phrase to recover your account."
        },
        {
          question: "What if I lose my 12-secret-phrase?",
          answer: "If you forget your password and lose your 12-secret-phrase, your account cannot be recovered. Keep it safe."
        },
        {
          question: "Can I be both a Fan and a Creator?",
          answer: "Yes ✅. You can switch roles anytime in your account settings."
        }
      ]
    },
    {
      section: "💳 Payments & Earnings",
      questions: [
        {
          question: "How do Fan Meet / Fan Date payments work?",
          answer: "Fans pay transport fare upfront. The money is held in a pending account until the fan taps \"Mark as Complete.\" Once confirmed, the payment is instantly released to the Creator."
        },
        {
          question: "How does Fan Call payment work?",
          answer: "Fans are charged per minute, and the money is transferred live to the Creator's account during the call."
        },
        {
          question: "Do Creators keep 100% of their money?",
          answer: "Yes 💯. Creators always keep 100% of their earnings."
        }
      ]
    },
    {
      section: "🚫 Safety & Rules",
      questions: [
        {
          question: "Can I post explicit content?",
          answer: "No ❌. One offense = permanent ban. No warnings, no second chances."
        },
        {
          question: "What if a fan/creator breaks the rules?",
          answer: "Use the Report button. Our team will review immediately and take action."
        },
        {
          question: "What happens if a fan doesn't mark a meet/date as complete?",
          answer: "Contact support within 24 hours with evidence (Screenshots, photo, video or chat logs) and our support team will review the case. If valid, the payment will still be released to the Creator."
        }
      ]
    },
    {
      section: "🛠 Account & Access",
      questions: [
        {
          question: "How do I log in?",
          answer: "Use your username and password."
        },
        {
          question: "How do I recover my account?",
          answer: "Enter your 12-secret-phrase. It will reset your access and let you set a new password."
        },
        {
          question: "Can I change my 12-secret-phrase?",
          answer: "No. It is fixed. Protect it carefully."
        }
      ]
    },
    {
      section: "💬 Contact Support",
      questions: [
        {
          question: "For disputes, bugs, or urgent help:",
          answer: "📩 Open a Support Ticket inside the app.\n🕒 Response Time: within 24 hours."
        }
      ]
    },
    {
      section: "⚠ Reminder",
      questions: [
        {
          question: "Username + Password = Daily Access.",
          answer: "12-Secret-Phrase = Your only backup key."
        }
      ]
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !message || !email) return;

    setIsSubmitting(true);
    
    // Format the complete message with all details
    const fullMessage = `📧 Support Request Details:
Category: ${selectedCategory}
Email: ${email}
Message: ${message}
Timestamp: ${new Date().toLocaleString()}`;

    // Store the message in localStorage to show in support chat
    localStorage.setItem("supportMessage", fullMessage);
    
    // Reset form
    setSelectedCategory("");
    setEmail("");
    setMessage("");
    
    // Redirect to support chat page
    window.location.href = "/message/supportchat";
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen mb-24 bg-[#0e0f2a] text-white">
      <div className="w-full max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <FaAngleLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold">Support Center</h1>
            <p className="text-gray-400">Get help with your account and app</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FaEnvelope className="w-5 h-5 text-blue-400" />
                Contact Us
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FaEnvelope className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">support@mmeko.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaPhone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaClock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">24/7 Support</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FaQuestionCircle className="w-5 h-5 text-green-400" />
                Quick Actions
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => router.push("/profile")}
                  className="w-full text-left p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  View My Profile
                </button>
                <button
                  onClick={() => router.push("/settings")}
                  className="w-full text-left p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Account Settings
                </button>
                <button
                  onClick={() => router.push("/messages/supportchat")}
                  className="w-full text-left p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Mmeko support
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* FAQ Section */}
            <div className="bg-gray-800 rounded-xl p-6 mb-6">
              <h2 className="text-2xl font-semibold mb-6">🙋 Help & Support (FAQ)</h2>
              <div className="space-y-8">
                {faqs.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="border-b border-gray-700 pb-6 last:border-b-0">
                    <h3 className="text-xl font-semibold mb-4 text-blue-400">{section.section}</h3>
              <div className="space-y-4">
                      {section.questions.map((faq, faqIndex) => (
                        <div key={faqIndex} className="bg-gray-700 rounded-lg p-4">
                          <h4 className="font-semibold text-lg mb-2 text-white">{faq.question}</h4>
                          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Support Form */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-2xl font-semibold mb-6">Send us a Message</h2>
              <p className="text-gray-300 mb-6">Your message will be sent to our support team and you'll be redirected to the support chat page to continue the conversation.</p>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="your.email@example.com"
                    required
                  />
            </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                    placeholder="Describe your issue or question in detail..."
                    required
                  />
                </div>

            <button
                  type="submit"
                  disabled={isSubmitting || !selectedCategory || !message || !email}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
            </button> 
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;