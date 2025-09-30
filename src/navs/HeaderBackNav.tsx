import { useRouter } from 'next/navigation';
import React from 'react';
import { IoArrowBack } from 'react-icons/io5';
// import { useNavigate } from 'react-router-dom';

const HeaderBackNav = ({ title }: { title: string }) => {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <header className="flex items-center justify-between px-0 pt-1  shadow-sm sm:hidden ">
      <div className="w-10">
        <button
          onClick={handleBack}
          className="p-2 rounded-full  text-white cursor-pointer"
          aria-label="Go back"
        >
          <IoArrowBack size={30} />
        </button>
      </div>
      
      <div className="flex-1 text-center">
        {title && <h1 className="text-lg font-bold text-white">{title}</h1>}
      </div>
      
      {/* Empty div to balance the layout */}
      <div className="w-10"></div>
    </header>
  );
};
export default HeaderBackNav; 