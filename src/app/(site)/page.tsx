import CTASection from "@/components/home/CTASection";
import Features from "@/components/home/Features";
import TermSheetGenieHero from "@/components/home/TermSheetGenieHero";
import Image from "next/image";

export default function Home() {
  return (
    <div className="">
                 <TermSheetGenieHero />
                 <Features />
                 <CTASection />
                 
    </div>
  );
}
