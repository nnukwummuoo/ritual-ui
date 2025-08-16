import React from "react";
import { FaAngleLeft } from "react-icons/fa";
import Head from "../../components/Head";


 const AccountinfoPage = () => {

  return (
    <div className="sm:w-11/12 md:w-10/12 lg:w-9/12 xl:w-8/12 mx-auto">
      
      <div className='w-full flex flex-col'>
      <Head heading="ACCOUNT INFO" />
      <div className="w-full max-w-md space-y-6 mt-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">Email</label>
          <input
            type="text"
            value="user@example.com"
            disabled
            className="w-full px-4 py-4 bg-inherit text-white border border-gray-600 rounded-md"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">Joined</label>
          <input
            type="text"
            value="20/08/2024"
            disabled
            className="w-full px-4 py-4 bg-inherit text-white border border-gray-600 rounded-md"
          />
        </div>
      </div>

      {/* Logout Button */}
      <button className="mt-6 w-full max-w-md px-4 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-500">
        Log out all devices and accounts
      </button>
      </div>
     
    </div>
  );
};

export default AccountinfoPage