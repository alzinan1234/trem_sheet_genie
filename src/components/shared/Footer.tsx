"use client";

import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="w-full bg-[#ffffff] border-t border-gray-100 py-10  md:px-12">
      <div className="max-w-[1280px] px-8 mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Logo Section */}
       <Link href="/" className="flex items-center gap-2 group">
          
            <div>
                <img src="/logo/TermSheetGenie.png" alt="" />
            </div>
        
        </Link>

        {/* Navigation Links */}
        <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500 font-medium text-[14px]">
          <Link href="/privacy" className="hover:text-[#0A2A99] transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-[#0A2A99] transition-colors">
            Terms of Service
          </Link>
          <Link href="/contact" className="hover:text-[#0A2A99] transition-colors">
            Contact
          </Link>
        </div>

      </div>
      
    
    </footer>
  );
};

export default Footer;