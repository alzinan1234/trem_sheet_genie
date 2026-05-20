"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Link from 'next/link';

// --- Modal Component ---
const DemoModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />

          {/* Modal Content */}
          <div className="fixed inset-0 flex items-center justify-center z-[70] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-[500px] rounded-[24px] shadow-2xl relative"
            >
              {/* Close Button */}
              <button 
                onClick={onClose}
                className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>

              <div className="p-8">
                <h2 className="text-2xl font-bold text-[#1A1C1E] mb-8">Request a Demo</h2>
                
                <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Name *</label>
                    <input 
                      type="text" 
                      placeholder="Your name" 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0A2A99] focus:ring-1 focus:ring-[#0A2A99] outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Email *</label>
                    <input 
                      type="email" 
                      placeholder="your@email.com" 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0A2A99] focus:ring-1 focus:ring-[#0A2A99] outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Company</label>
                    <input 
                      type="text" 
                      placeholder="Your company" 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0A2A99] focus:ring-1 focus:ring-[#0A2A99] outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Message</label>
                    <textarea 
                      rows={4}
                      placeholder="Tell us about your needs..." 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0A2A99] focus:ring-1 focus:ring-[#0A2A99] outline-none transition-all resize-none"
                    />
                  </div>

                  <button className="w-full bg-[#0A2A99] text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-800 transition-all active:scale-[0.98] mt-2">
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

// --- Main CTA Section Component ---
const CTASection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="px-8 max-w-7xl mx-auto py-20 bg-[#ffffff]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className=" mx-auto bg-[#0A2A99] rounded-[40px] py-20 px-8 text-center text-white shadow-2xl shadow-blue-900/20"
      >
        <h2 className="text-[36px] md:text-[52px] font-bold mb-6 tracking-tight leading-tight">
          Ready to streamline your investment process?
        </h2>

        <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto mb-12 opacity-90 leading-relaxed">
          Join leading venture capital firms using TermSheetGenie to make better 
          investment decisions.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* Trigger Button */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-white text-[#0A2A99] px-10 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all active:scale-95 min-w-[210px]"
          >
            Request a Demo
          </button>

          <Link href="/signup" className="bg-transparent text-white border-2 border-white px-10 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition-all active:scale-95 min-w-[210px]">
            Sign Up Free
          </Link>

          
        </div>
      </motion.div>

      {/* Modal Component Call */}
      <DemoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
};

export default CTASection;