"use client";

import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const CompanyHeader = ({ companyName }: { companyName: string }) => {
  const router = useRouter();

  return (
    <div className=" px-8 py-5 sticky top-0 z-30 ">
      <div className="flex items-center justify-between  mx-auto">
        <div className="flex items-center gap-5">
          {/* Back Button */}
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-50 rounded-lg border border-gray-100 transition-all text-[#667085]"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="">
            <div>
              <div className="">
                {/* Updated: Same font, size, and color as other titles */}
                <h1 className="text-2xl font-semibold text-[#101828]">{companyName}</h1>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyHeader;
