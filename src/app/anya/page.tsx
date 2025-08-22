"use client";

import anyaLogo from '@/icons/Anya.png';
import { toast } from "react-toastify";
// import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react"; // fallback icon if your animated one isn’t ready yet
import Image from 'next/image';

export default function AnyaButton() {

    const handleClick = () => {
        toast.info("👁️ The Eye is watching... Anya is not awake yet. Unlocking soon.", {
          position: "bottom-center",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
          theme: "dark",
        });
    };

  return (
    <section className="w-full min-h-screen flex flex-col items-center justify-center">
        <button
      className="flex flex-col items-center justify-center"
      onClick={handleClick}
    >
      {/* Replace with your animated eye component */}
      <Image src={anyaLogo} alt="Anya" className='size-24'/>
      <span className="text-xs text-gray-400">Anya</span>
    </button>
    </section>
  );
}