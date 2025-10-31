"use client";

import React, { useState } from "react";
import { FaAngleLeft, FaQuestionCircle, FaEnvelope, FaPhone, FaClock } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { SupportForm } from "../../components/support/SupportForm";

// Types
interface RootState {
  register: {
    userID: string;
    logedin: boolean;
    refreshtoken: string;
  };
}

const SupportPage: React.FC = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Get user ID from Redux
  const reduxUserid = useSelector((state: RootState) => state.register.userID);

  // Helper function to get current user ID with localStorage fallback
  const getCurrentUserId = () => {
    let currentUserId = reduxUserid;
    
    // If userid is not available from Redux, try to get it from localStorage as fallback
    if (!currentUserId) {
      try {
        const stored = localStorage.getItem("login");
        if (stored) {
          const data = JSON.parse(stored);
          currentUserId = data?.userID || data?.userid || data?.id || "";
        }
      } catch (error) {
        console.error('Error getting userid from localStorage:', error);
      }
    }
    
    return currentUserId;
  };


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
      section: "✨ How to Become a Creator",
      questions: [
        {
          question: "Step 1: Apply",
          answer: "🪪 Fill out the Creator Application Form with your details:\n\n• Full name, date of birth, email, and location\n• A photo of you holding a handwritten note\n• A clear photo of your valid ID\n\nOnce submitted, your application will be reviewed by our team."
        },
        {
          question: "Step 2: Get Approved",
          answer: "✅ Our team checks every application to make sure all creators are real and verified.\nOnce approved, you'll receive a success notification and your \"Become a Creator\" button will automatically change to \"Create Portfolio.\""
        },
        {
          question: "Step 3: Create Your Portfolio",
          answer: "🎨 Your portfolio is what fans will see on your public profile.\nAfter creating it, your button changes to \"My Portfolio.\"\nIf you delete it, it switches back to \"Create Portfolio.\""
        },
        {
          question: "Step 4: Start Earning",
          answer: "💡 Once your portfolio is live, you can start receiving Fan Meets, Fan Dates, and Fan Calls — and earn Gold that you can withdraw in USDT (BEP20)."
        },
        {
          question: "Important Note",
          answer: "🔒 Verification is done to keep the platform safe, fair, and authentic for both creators and fans.\nIncomplete or unclear applications may be rejected, so double-check your details before submitting."
        }
      ]
    },
    {
      section: "🤝 Fan Meet & Fan Date",
      questions: [
        {
          question: "What are Fan Meet and Fan Date for?",
          answer: "🤝 Fan Meet – A short, casual meeting where you can greet your favorite creator, chat, and even take a selfie. It's about making a quick personal connection - limited to 30 minutes maximum for safety and fairness.\n\n🍽 Fan Date – A slightly more relaxed session where you spend time together in a safe public place — like grabbing coffee, eating, or walking — but still limited to 30 minutes maximum for safety and fairness."
        }
      ]
    },
    {
      section: "🚌 Transport Fare",
      questions: [
        {
          question: "Why do I have to pay for transport fare?",
          answer: "💡 Creators give their time to meet fans. To keep it fair and safe, fans cover their travel costs so creators don't lose money when showing up."
        },
        {
          question: "How is the transport fare decided?",
          answer: "🚌 It's calculated based on distance, transportation rates, and local conditions. The exact fare is displayed before you confirm the request."
        },
        {
          question: "Do I still pay if the creator cancels?",
          answer: "❌ No. If the creator cancels, you'll get your transport fare refunded."
        },
        {
          question: "Do I get a refund if I cancel?",
          answer: "✅ Yes, if you cancel before the creator accepts your request → full refund.\n⚠ No, you can't cancel after the creator accepts your request → transport fare is non-refundable."
        },
        {
          question: "Is this safe?",
          answer: "🛡 Yes. All Fan Meet and Fan Date sessions are limited to 30 minutes maximum, must take place in a public location, and transport fare ensures the creator can arrive and return safely."
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
      section: "❓ FAQ – Fan Meet / Fan Date Expiration",
      questions: [
        {
          question: "What happens if the meet or date doesn't happen within 7 days?",
          answer: "🕒 If 7 days pass and the fan didn't marks it as complete, the system automatically refunds the fan's transport fare (unless a creator complaint was filed)."
        },
        {
          question: "What if the creator didn't show up?",
          answer: "🚫 The fan will automatically receive a refund after 7 days if the meet/date was not completed and no creator complaint was made."
        },
        {
          question: "What if the fan didn't show up?",
          answer: "❌ If the creator reports that the fan didn't show, the platform will investigate before the payment will be released to the creator."
        },
        {
          question: "Why 7 days?",
          answer: "📅 Seven days gives both sides enough time to reschedule once while keeping requests active and organized."
        }
      ]
    },
    {
      section: "❓ FAQ – Fan Call Expiration",
      questions: [
        {
          question: "What happens if my Fan Call request isn't answered or started?",
          answer: "🕒 If your Fan Call doesn't start within 48 hours after acceptance, it expires automatically.\nNo money is deducted, and you can always send a new request later."
        },
        {
          question: "Will I lose any gold or balance if it expires?",
          answer: "💰 No. Fan Call payments are only deducted during the live call, not before."
        },
        {
          question: "Why is there a 48-hour limit?",
          answer: "⏳ This helps fans and creators stay active and ensures requests don't pile up or get forgotten."
        }
      ]
    },
    {
      section: "❓ FAQ: Attendance & No-Show Policy",
      questions: [
        {
          question: "What if a fan doesn't show up for a Fan Meet or Fan Date?",
          answer: "🚫 If a fan fails to show up at the agreed time and location, the transport fare is automatically sent to the creator to cover her time and travel.\nNo refund will be issued to the fan once the creator has already arrived or waited at the meeting spot."
        },
        {
          question: "What if a creator doesn't show up for a Fan Meet or Fan Date?",
          answer: "⚠ If a creator fails to appear or cancels last-minute, the fan will receive a full refund of the transport fare.\nRepeated no-shows by creators may result in account suspension or removal from the Fan Meet/Fan Date program."
        },
        {
          question: "How do both sides stay protected?",
          answer: "🛡 The platform tracks confirmations, time logs, and attendance reports to ensure fairness.\nWe recommend both sides take a quick photo or check-in proof at the public venue for verification if needed."
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
      section: "💰 FAQ – Gold & Payments",
      questions: [
        {
          question: "What is Gold?",
          answer: "⭐ Gold is the in-app currency used for all paid features such as Fan Call, Fan Meet, and Fan Experience.\n1 Gold = $0.04 USD."
        },
        {
          question: "How do I buy Gold?",
          answer: "🪙 You can buy Gold using USDT (BEP20 - Binance Smart Chain).\nYour Gold balance will appear instantly after payment is confirmed."
        },
        {
          question: "Is Gold refundable?",
          answer: "🚫 No. All Gold purchases are non-refundable, as they are converted digital credits used within the platform."
        },
        {
          question: "Can I transfer Gold to another user?",
          answer: "🔒 No. For security reasons, Gold is non-transferable and linked only to your account."
        },
        {
          question: "What happens if I don't use my Gold?",
          answer: "💎 Your Gold never expires. You can use it anytime for calls, meets, or dates."
        },
        {
          question: "Why is there a small gas fee during payment?",
          answer: "⚙ Gas fees are blockchain network fees, not platform charges.\nWe only collect the exact amount your wallet sends."
        },
        {
          question: "What if my payment fails but funds are deducted?",
          answer: "📨 Contact Support immediately with your transaction hash (TXID).\nWe'll verify and credit your account manually."
        },
        {
          question: "How do creators earn from Gold?",
          answer: "👑 When fans spend Gold on Fan Calls, Meets, or Dates, the full value goes directly to the creator's earnings dashboard.\nCreators can withdraw anytime in USDT (BEP20) to their connected wallet."
        }
      ]
    },
    {
      section: "💬 FAQ – Withdrawal Fees",
      questions: [
        {
          question: "Why is there a $1 deduction on my withdrawal?",
          answer: "🪙 This is a fixed network transaction fee that covers blockchain gas costs and keeps payouts fast.\nSince gas fees change depending on Binance Smart Chain activity, we apply a standard $1 processing fee for stability."
        },
        {
          question: "Does the platform profit from this fee?",
          answer: "⚙ No. The fee only covers blockchain and processing expenses — not a platform charge."
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

  const handleFormSubmit = async (data: { category: string; email: string; message: string }) => {
    setIsSubmitting(true);
    
    // Format the complete message with all details
    const fullMessage = `📧 Support Request Details:
Category: ${data.category}
Email: ${data.email}
Message: ${data.message}
Timestamp: ${new Date().toLocaleString()}`;

    // Store the message in localStorage to show in support chat
    localStorage.setItem("supportMessage", fullMessage);
    
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
                  onClick={() => {
                    const currentUserId = getCurrentUserId();
                    if (currentUserId) {
                      router.push(`/Profile/${currentUserId}`);
                    } else {
                      router.push("/Profile");
                    }
                  }}
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
                  onClick={() => router.push("/message/supportchat")}
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
            <SupportForm 
              onSubmit={handleFormSubmit}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;