"use client"
import React, { useState, JSX } from "react";
import { FaRegEyeSlash } from "react-icons/fa";
import { IoEyeOutline } from "react-icons/io5";
import { FaAngleLeft } from "react-icons/fa";
import { ToastContainer, toast } from "material-react-toastify";
import PacmanLoader from "react-spinners/ClockLoader";
import { useRouter } from "next/navigation";
import { changePassword } from "@/lib/service/changePassword"; // Import the updated changePassword function
import { useSelector } from "react-redux"; // Re-enable Redux for userID

const ChangePasswordPage = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [color] = useState("#d49115");
  const userID = useSelector((state: any) => state.register.userID); // Get userID from Redux

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prevState) => !prevState);
  };

  const handleChangePassword = async () => {
    if (!userID) {
      toast.error("User ID not found. Please log in again.");
      router.push("/");
      return;
    }

    if (!password || !confirmPassword) {
      toast.info("Please fill in both password fields");
      return;
    }

    if (password.toLowerCase() !== confirmPassword.toLowerCase()) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        id: userID,
        password: password,
        isuser: true, // Assuming the user is authenticated, set isuser to true
      };
      const response = await changePassword(payload);
      if (response.ok) {
        toast.success("Password changed successfully");
        router.push("/settings/account");
      } else {
        toast.error(response.message || "Failed to change password");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-3 mx-auto mt-16 text-white sm:w-11/12 md:w-10/12 lg:w-9/12 xl:w-8/12 md:mt-4 md:px-0">
      <div className="flex flex-col w-full">
        <ToastContainer position="top-center" theme="dark" />
        {/* Header */}
        <header className="flex items-center gap-4">
          <FaAngleLeft
            color="white"
            size={30}
            onClick={() => {
              router.push("/settings/account");
            }}
          />
          <h4 className="text-lg font-bold text-white">
            PASSWORD SECURITY AND SAFETY
          </h4>
        </header>

        {loading && (
          <div className="relative z-10 flex flex-col items-center w-full mt-16 top-3/4">
            <PacmanLoader
              color={color}
              loading={loading}
              size={30}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
            <p className="font-bold text-yellow-500 jost">wait a moment...</p>
          </div>
        )}

        {/* Form */}
        <div className="w-full max-w-md mt-10 space-y-6">
          {/* New Password Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                disabled={loading}
                className="w-full px-4 py-4 text-white bg-inherit border border-gray-600 rounded-md"
                onChange={(e) => setPassword(e.currentTarget.value)}
              />
              <ToggleVisibilityBtn
                toggleFn={togglePasswordVisibility}
                isShow={showPassword}
              />
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                disabled={loading}
                className="w-full px-4 py-4 text-white bg-inherit border border-gray-600 rounded-md"
                onChange={(e) => setConfirmPassword(e.currentTarget.value)}
              />
              <ToggleVisibilityBtn
                toggleFn={toggleConfirmPasswordVisibility}
                isShow={showConfirmPassword}
              />
            </div>
          </div>

          {/* Change Password Button */}
          <button
            className="w-full max-w-md px-4 py-3 mt-6 font-medium text-black bg-white rounded-lg hover:bg-gray-500"
            onClick={handleChangePassword}
            disabled={loading}
          >
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
};

function ToggleVisibilityBtn({
  toggleFn,
  isShow,
}: {
  toggleFn: () => void;
  isShow: boolean;
}): JSX.Element {
  return (
    <button
      type="button"
      onClick={toggleFn}
      className="absolute inset-y-0 flex items-center text-gray-400 right-4 hover:text-white"
    >
      {isShow ? <FaRegEyeSlash size={20} /> : <IoEyeOutline size={20} />}
    </button>
  );
}

export default ChangePasswordPage;