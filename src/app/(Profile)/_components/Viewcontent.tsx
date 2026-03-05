import React from 'react';
import cancelIcon from '../../icons/closeIcon.svg'; 
import { AnimatePresence, motion } from 'framer-motion';

export default function Viewcontent({ photo, phototype, onClose }: { photo: string, phototype: string, onClose: ()=> void }){
  const showContent = () => {
    if (phototype === 'video') {
      return (
        <video
          src={photo}
          className="object-contain w-full h-auto max-h-[80vh] max-w-[80vw] mx-auto"
          autoPlay
          controls
        />
      );
    }
    // Default to image for phototype === 'image' or undefined
    return (
      <img
        src={photo}
        alt="displaycontent"
        className="object-contain w-full h-auto max-h-[90vh] max-w-[90vw] mx-auto"
      />
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <div
          className="relative bg-transparent"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="absolute top-4 right-4 text-white"
            onClick={onClose}
          >
            <img src={cancelIcon} alt="Close" className="w-6 h-6" />
          </button>
          {showContent()}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};