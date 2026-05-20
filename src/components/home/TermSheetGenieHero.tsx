"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from 'lucide-react';
import Link from "next/link";

// --- Shared Modal Component ---
const DemoModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          <div className="fixed inset-0 flex items-center justify-center z-[110] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-[500px] rounded-[24px] shadow-2xl relative overflow-hidden"
            >
              <button 
                onClick={onClose}
                className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>

              <div className="p-8">
                <h2 className="font-['Sen'] text-2xl font-bold text-[#1b1e28] mb-8">Request a Demo</h2>
                
                <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                  <div className="space-y-1.5">
                    <label className="font-['Public_Sans'] text-sm font-semibold text-gray-700">Name *</label>
                    <input 
                      type="text" 
                      placeholder="Your name" 
                      className="font-['Public_Sans'] w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0A32B6] focus:ring-1 focus:ring-[#0A32B6] outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-['Public_Sans'] text-sm font-semibold text-gray-700">Email *</label>
                    <input 
                      type="email" 
                      placeholder="your@email.com" 
                      className="font-['Public_Sans'] w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0A32B6] focus:ring-1 focus:ring-[#0A32B6] outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-['Public_Sans'] text-sm font-semibold text-gray-700">Company</label>
                    <input 
                      type="text" 
                      placeholder="Your company" 
                      className="font-['Public_Sans'] w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0A32B6] focus:ring-1 focus:ring-[#0A32B6] outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-['Public_Sans'] text-sm font-semibold text-gray-700">Message</label>
                    <textarea 
                      rows={4}
                      placeholder="Tell us about your needs..." 
                      className="font-['Public_Sans'] w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0A32B6] focus:ring-1 focus:ring-[#0A32B6] outline-none transition-all resize-none"
                    />
                  </div>

                  <button className="font-['Public_Sans'] w-full bg-[#0A32B6] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#082994] transition-all active:scale-[0.98] mt-2">
                    Send Request
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

const TermSheetGenieHero = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="bg-white w-full pt-20">
      <div className="max-w-7xl mx-auto px-8 py-24 text-center flex flex-col items-center">
        
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-['Sen'] font-bold text-[40px] md:text-[56px] text-[#1b1e28] leading-[1.1] tracking-[-1.68px] mb-6"
        >
          Simulate and manage investment
          <br className="hidden md:block" />
          {" "}rounds with precision and ease
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="font-['Public_Sans'] text-[#6b7280] text-[18px] md:text-[20px] max-w-[700px] mx-auto leading-relaxed mb-12"
        >
          TermSheetGenie helps venture capital firms and startups model investment
          scenarios, manage cap tables, and understand the real impact of term
          sheet decisions.
        </motion.p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#0A32B6] text-white px-10 py-4 rounded-full font-['Public_Sans'] font-semibold text-base hover:bg-[#082994] transition-all shadow-lg shadow-blue-900/10 min-w-[210px]"
          >
            Request a Demo
          </button>
       <Link href="/signup" className="bg-white text-[#0A32B6] border-[1px] border-[#0A32B6] px-10 py-4 rounded-full font-['Public_Sans'] font-semibold text-base hover:bg-blue-50 transition-all min-w-[210px]">
            Get Started Now
          </Link>
        </div>

       
      </div>

      {/* Reusable Modal Component */}
      <DemoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
};

export default TermSheetGenieHero;