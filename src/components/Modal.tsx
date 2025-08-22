"use client";

type ModalProps = {
  show: boolean;
  message: string;
};

const Modal = ({ show, message }: ModalProps) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex md:items-center md:justify-start items-end justify-center w-full z-50">
      <div
        className="
          p-6 bg-white rounded-t-2xl md:rounded-lg shadow-lg md:ml-40 
          w-full md:w-4/5 
          transform transition-transform duration-300 ease-out
          translate-y-0
          animate-slideUp
        "
      >
        <p className="font-semibold text-center text-orange-500">{message}</p>
      </div>
    </div>
  );
};

export default Modal;

