"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 border-b border-[#E5E7EB] transition-all duration-300 ${
      isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-white py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <img src="/logo/TermSheetGenie.png" alt="Logo" className="h-8" />
        </Link>

        <div className="hidden md:flex items-center gap-10">
          <Link href="/login" className="font-['Public_Sans'] text-[#1b1e28] font-semibold hover:opacity-70 transition-opacity">
            Log in
          </Link>
          <Link href="/signup" className="bg-[#0A32B6] text-white px-8 py-3 rounded-full font-['Public_Sans'] font-semibold hover:bg-[#082994] transition-all active:scale-95 shadow-lg shadow-blue-900/10">
            Sign up
          </Link>
        </div>

        <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>
    </nav>
  );
};
export default Navbar;