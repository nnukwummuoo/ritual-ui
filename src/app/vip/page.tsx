/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { upgradeToVip, checkVipStatus, clearVipError, cancelVip } from "@/store/vip";
import { toast } from "material-react-toastify";
import { URL as API_URL } from "@/api/config";
import { useRouter } from "next/navigation";

const VIPPage = () => {
  
  const dispatch = useDispatch();
  const router = useRouter();
  
  // Get user data from Redux
  const loggedInUserId = useSelector((state: RootState) => state.register.userID);
  const vipStatus = useSelector((state: RootState) => state.vip.vipStatus);
  const upgradeLoading = useSelector((state: RootState) => state.vip.upgradeLoading);
  const upgradeError = useSelector((state: RootState) => state.vip.upgradeError);
  const profile = useSelector((state: RootState) => state.profile);
  const goldBalance = vipStatus?.goldBalance || Number(profile.balance) || 0;
  
  // Debug gold balance
  console.log("🔍 [VIP PAGE] Gold Balance Debug:", {
    vipStatusGoldBalance: vipStatus?.goldBalance,
    profileBalance: profile.balance,
    convertedBalance: Number(profile.balance),
    finalGoldBalance: goldBalance,
    vipStatus: vipStatus
  });
  
  // Track if we've already shown a toast to prevent duplicates
  const [hasShownToast, setHasShownToast] = React.useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = React.useState(false);
  const [showInsufficientGoldModal, setShowInsufficientGoldModal] = React.useState(false);
  
  // Get user ID from localStorage if not in Redux
  const getUserId = () => {
    try {
      const raw = localStorage.getItem("login");
      if (raw) {
        const data = JSON.parse(raw);
        return data?.userID || "";
      }
    } catch (error) {
      console.error("Error getting user ID from localStorage:", error);
    }
    return "";
  };

  const userId = loggedInUserId || getUserId();



  // Continue VIP (re-enable auto-renewal)
  const continueVip = async () => {
    if (!userId) {
      toast.error("Please log in to continue VIP");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/vip/continue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userid: userId })
      });

      const data = await response.json();
      
      if (data.ok) {
        toast.success("VIP auto-renewal enabled!");
        // Refresh VIP status to get updated auto-renewal state
        dispatch(checkVipStatus(userId) as any);
      } else {
        toast.error(data.message || "Failed to continue VIP");
      }
    } catch (error) {
      console.error("Continue VIP error:", error);
      toast.error("Failed to continue VIP");
    }
  };


  // Check VIP status on component mount
  useEffect(() => {
    if (userId) {
      dispatch(checkVipStatus(userId) as any);
    }
  }, [userId, dispatch]);

  // Reset toast state when component mounts
  useEffect(() => {
    setHasShownToast(false);
    // Clear any existing errors
    dispatch(clearVipError());
  }, [dispatch]);



  // Handle upgrade to VIP
  const handleUpgrade = async () => {
    if (!userId) {
      toast.error("Please log in to upgrade to VIP");
      return;
    }

    // Check if user has sufficient gold balance
    if (goldBalance < 250) {
      setShowInsufficientGoldModal(true);
      return;
    }

    try {
      const result = await dispatch(upgradeToVip({ userid: userId, duration: 30 }) as any);
      
      // Only show success toast if the action was fulfilled (not rejected)
      if (result.type.endsWith('/fulfilled')) {
        if (!hasShownToast) {
          toast.success("Successfully upgraded to VIP!");
          setHasShownToast(true);
          // Reset the toast flag after a delay
          setTimeout(() => {
            setHasShownToast(false);
          }, 2000);
        }
      }
    } catch  {
      // Don't show error toast here - let the error handler below handle it
    }
  };

  // Handle cancel VIP
  const handleCancelVip = async () => {
    if (!userId) {
      toast.error("Please log in to cancel VIP");
      return;
    }

    try {
      const result = await dispatch(cancelVip(userId) as any);
      
      if (result.type.endsWith('/fulfilled')) {
        toast.success("VIP subscription cancelled successfully!");
        setShowCancelConfirm(false);
        // Refresh VIP status
        dispatch(checkVipStatus(userId) as any);
      } else {
        toast.error("Failed to cancel VIP subscription. Please try again.");
      }
    } catch  {
      toast.error("Failed to cancel VIP subscription. Please try again.");
    }
  };

  // Handle upgrade error
  useEffect(() => {
    if (upgradeError && !hasShownToast) {
      toast.error(upgradeError);
      setHasShownToast(true);
      // Clear the error after showing the toast
      setTimeout(() => {
        dispatch(clearVipError());
        setHasShownToast(false);
      }, 100);
    }
  }, [upgradeError, dispatch, hasShownToast]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/vip-bg.jpg')"
        }}
      />
      
      {/* Dark Overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-40" />
      
      {/* Content */}
      <div className="relative z-0 min-h-screen flex flex-col justify-center px-6 py-12">
        {/* Back Button */}
      
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Upgrade to Vip
            </h1>
            <p className=" md:text-xl text-white opacity-90">
              Your experience. Your standards. Your choice.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Badge Benefits */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white mb-1">Badge Benefits</h2>
              
              <div className="space-y-2">
                <div className="flex items-start space-x-3">
                  <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Verified Lion Badge</h3>
                    <p className="text-white opacity-80 text-xs">Appears on your profile, messages</p>
                    <p className="text-white opacity-80 text-xs">comments and requests</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Priority Messaging</h3>
                    <p className="text-white opacity-80 text-xs">Your chats rise to the top</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Exclusive Lion Effect */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white mb-4">Exclusive Lion Effect</h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Golden Lion Animation</h3>
                    <p className="text-white opacity-80 text-xs">appears when you enter</p>
                    <p className="text-white opacity-80 text-xs"> VIP profiles & chats — your</p>
                    <p className="text-white opacity-80 text-xs"> presence roars with status</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dedicated Support Benefits */}
          <div className="mb-12">
            <h2 className="text-xl font-bold text-white mb-6">Dedicated Support Benefits</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start space-x-3">
                <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-white">1-on-1 Support Concierge</h3>
                  <p className="text-white opacity-80 text-xs">Real human support</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-white">Dispute Protection</h3>
                  <p className="text-white opacity-80 text-xs">We intervene if expectations aren&apos;t met</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-white">Legacy-Safe Archiving</h3>
                  <p className="text-white opacity-80 text-xs">You choose what stays, what fades</p>
                </div>
              </div>
            </div>
          </div>

          {/* VIP Status Display */}
          {vipStatus?.isVip && (
            <div className="mb-8 p-4 bg-green-600 bg-opacity-20 border border-green-500 rounded-lg">
              <div className="text-center">
                <h3 className="text-xl font-bold text-green-400 mb-2">🎉 You&apos;re a VIP Member!</h3>
                <p className="text-green-300 mb-2">
                  {vipStatus.daysRemaining > 0 
                    ? `${vipStatus.daysRemaining} days remaining`
                    : "VIP Status Active"
                  }
                </p>
                <p className="text-green-300 text-sm">
                  Auto-renewal: {vipStatus.autoRenewal ? "Enabled" : "Disabled"}
                </p>
              </div>
            </div>
          )}


          {/* Pricing and CTA */}
          <div className="flex flex-row md:flex-row items-center mb-24 justify-between">
            <div className="flex flex-col justify-center items-center md:mb-0">
              <div className="text-1xl font-bold text-white mb-2">250 Gold/month</div>
              <p className="text-white opacity-80">Cancel anytime</p>
            </div>
           
            {vipStatus?.isVip ? (
              // VIP is active - show Continue or Cancel based on auto-renewal
              vipStatus.autoRenewal ? (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="w-1/2 py-4 px-3 rounded-lg transition-colors duration-300 transform hover:scale-105 font-bold bg-red-500 hover:bg-red-600 text-white"
                >
                  Cancel Auto-Renewal
                </button>
              ) : (
                <button
                  onClick={continueVip}
                  className="w-1/2 py-4 px-3 rounded-lg transition-colors duration-300 transform hover:scale-105 font-bold bg-green-500 hover:bg-green-600 text-white"
                >
                  Continue VIP
                </button>
              )
            ) : (
              // VIP is not active - show upgrade button
              <button
                onClick={handleUpgrade}
                disabled={upgradeLoading}
                className={`w-1/2 py-4 px-3 rounded-lg transition-colors duration-300 transform hover:scale-105 font-bold ${
                  upgradeLoading
                    ? "bg-gray-500 text-white cursor-not-allowed"
                    : "bg-orange-500 hover:bg-orange-600 text-white"
                }`}
              >
                {upgradeLoading ? "Processing..." : "Upgrade"}
              </button>
            )}
          </div>

          {/* Cancel Confirmation Modal */}
          {showCancelConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-4">
                <h3 className="text-xl font-bold text-white mb-4">Cancel VIP Auto-Renewal</h3>
                <p className="text-gray-300 mb-6">
                  Are you sure you want to cancel VIP auto-renewal? Your VIP will remain active until it expires, but it won&apos;t automatically renew.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Keep Auto-Renewal
                  </button>
                  <button
                    onClick={handleCancelVip}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Yes, Cancel Auto-Renewal
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Insufficient Gold Modal */}
          {showInsufficientGoldModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-4">
                <h3 className="text-xl font-bold text-white mb-4">Insufficient Gold Balance</h3>
                <p className="text-gray-300 mb-6">
                  You need 250 gold to upgrade to VIP. You currently have {goldBalance} gold.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowInsufficientGoldModal(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowInsufficientGoldModal(false);
                      router.push('/buy-gold');
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Purchase Gold
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VIPPage;
