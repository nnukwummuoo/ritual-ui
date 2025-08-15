"use client";

const Modal = ({ show, message }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center md:justify-start w-[90%] mx-auto md:w-4/5 z-50">
      <div className="p-6 bg-white rounded-lg shadow-lg md:ml-40">
        <p className="font-semibold text-center text-orange-500">{message}</p>
      </div>
    </div>
  );
};

export default Modal;
