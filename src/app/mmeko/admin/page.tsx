import React from "react";
import { FaHourglassHalf } from "react-icons/fa";

const AdminHome = () => {
  return (
    <div className="w-screen sm:w-11/12 md:w-10/12 lg:w-9/12 xl:w-8/12 mx-auto min-h-screen">
        <div className="w-[90%] mx-auto md:w-3/5 text-white  p-4 md:mr-auto md:ml-0 flex items-center justify-center min-h-[80vh]">    
            <div className="text-center space-y-4">
                <div className="flex justify-center">
                <FaHourglassHalf size={60} className="text-orange-600 animate-pulse" />
                </div>
                <h1 className="text-3xl font-bold">Coming Soon</h1>
                <p className="text-gray-400">We're working hard to bring this page to life. Stay tuned</p>
            </div>
        </div>
    </div>
  );
};

export default AdminHome;
