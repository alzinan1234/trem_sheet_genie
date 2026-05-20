"use client";
import React from "react";

const page = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9fafb]">
      <div className="text-center">
        <h1 className="text-3xl md:text-6xl font-semibold text-gray-900 mb-2 animate-fadeIn">
          Entrepreneur Dashboard
        </h1>

        <p className="text-gray-500 text-4xl  animate-pulseSoft">
          Coming soon...
        </p>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 1.2s ease-out forwards;
        }

        @keyframes pulseSoft {
          0% {
            opacity: 0.4;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.4;
          }
        }

        .animate-pulseSoft {
          animation: pulseSoft 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default page;
