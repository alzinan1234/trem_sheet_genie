"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, FileText, Users } from 'lucide-react';

const features = [
  {
    title: "Advanced Simulations",
    description: "Model multiple investment scenarios and understand the impact on ownership, dilution, and returns.",
    icon: <BarChart3 size={24} className="text-[#0A32B6]" />,
  },
  {
    title: "Clear Projections",
    description: "Visualize future funding rounds and their effects on your cap table with precision and clarity.",
    icon: <FileText size={24} className="text-[#0A32B6]" />,
  },    
  {
    title: "Efficient Management",
    description: "Manage your portfolio and term sheets in one place, built for the venture capital ecosystem.",
    icon: <Users size={24} className="text-[#0A32B6]" />,
  }
];

const Features = () => {
  return (
    <section className="bg-white w-full relative">
      <div className="max-w-7xl mx-auto px-8 pb-16 pt-6 md:pb-24 md:pt-10">
        
        <h2 className="font-['Sen'] text-[32px] md:text-[40px] font-bold text-center text-[#1b1e28] mb-10 md:mb-16">
          Key Features
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:-mt-8 relative z-10">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-10 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="w-12 h-12 bg-[#EEF2FF] rounded-xl flex items-center justify-center mb-8">
                {feature.icon}
              </div>
              <h3 className="font-['Sen'] text-xl font-bold text-[#1b1e28] mb-4">
                {feature.title}
              </h3>
              <p className="font-['Public_Sans'] text-[#6b7280] leading-relaxed text-[16px]">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
