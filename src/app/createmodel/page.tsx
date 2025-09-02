import Link from "next/link";

export default function CreateModelPage() { 
return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#18192600] p-4 sm:p-6 text-white text-center">
      {/* SVG Icon for visual appeal */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="mx-auto h-20 w-20 text-indigo-400 mb-6 sm:mb-8 animate-pulse"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
        <path d="M12 10l-2 2h4l-2 2" />
      </svg>

      <h1 className="text-3xl sm:text-4xl font-bold mb-3 font-sans">
        Application Pending
      </h1>

      <p className="text-base sm:text-lg leading-relaxed font-sans max-w-lg">
        Thank you for submitting your application. We are currently reviewing your information and will get back to you as soon as possible.
      </p>

      <p className="text-sm mt-4 font-sans max-w-lg">
        This process may take up to 2-3 business days. We appreciate your patience.
      </p>

      {/* Optional call-to-action or information section */}
      <div className="mt-8">
        <Link
          href={"/"}
          className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-full font-semibold shadow-md hover:bg-indigo-700 transition-colors duration-300"
        >
          Continue to homepage
        </Link>
      </div>
    </div>
  );
}