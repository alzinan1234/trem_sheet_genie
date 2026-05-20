import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div 
        className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-[15px] font-bold text-[#1e293b]">{title}</h3>
        {isOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
      </div>
      {isOpen && (
        <div className="px-6 pb-6 border-t border-gray-50 pt-5 animate-in fade-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  );
};

export default SectionCard;