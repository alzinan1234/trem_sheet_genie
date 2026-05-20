"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Users,
  Lightbulb,
  Target,
  Calculator,
  FileText,
  Settings,
  Flag,
  ChevronDown,
  X,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  hasDropdown?: boolean;
  subItems?: SubNavItem[];
  isModal?: boolean; // New property to identify modal items
}

interface SubNavItem {
  name: string;
  href: string;
  icon?: React.ElementType;
}

interface SidebarProps {
  isOpen: boolean;      // Mobile sliding state
  setIsOpen: (isOpen: boolean) => void;
  isCollapsed: boolean;   // Desktop width state
  setIsCollapsed: (isCollapsed: boolean) => void;
  onSimulatorClick?: () => void; // Optional prop for simulator modal
}

const navItems: NavItem[] = [
  { name: "My Funds", href: "/investor-admin/my-funds", icon: Briefcase },
  { name: "Limited Partners", href: "/investor-admin/limited-partners", icon: Users },
  { name: "Startups", href: "/investor-admin/startups", icon: Lightbulb },
  { name: "Investment Pipeline", href: "/investor-admin/investment-pipeline", icon: Target },
  { name: "Simulator", href: "#", icon: Calculator, isModal: true }, // Changed to modal
  { name: "Documents", href: "/investor-admin/documents", icon: FileText },
  {
    name: "Settings",
    href: "/investor-admin/settings",
    icon: Settings,
  },
  { name: "Report an Issue", href: "/investor-admin/report-issue", icon: Flag },
];

const InvestorSidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  setIsOpen, 
  isCollapsed, 
  setIsCollapsed,
  onSimulatorClick 
}) => {
  const pathname = usePathname();
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSettingsClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (isCollapsed) {
      setIsCollapsed(false);
      setTimeout(() => setIsSettingsOpen(true), 150);
    } else {
      setIsSettingsOpen(!isSettingsOpen);
    }
  };

  const handleSimulatorClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (onSimulatorClick) {
      onSimulatorClick();
    }
  };

  const isActiveRoute = (href: string): boolean => {
    if (href === "/investor-admin") return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  if (!mounted) return null;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white border-r border-[#D6D6D6] z-50
          transition-all duration-300 ease-in-out shadow-sm
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0 
          ${isCollapsed ? "w-20" : "w-72"}
        `}
      >
        <div className="flex flex-col h-full">
          
          {/* Header */}
          <div className={`flex items-center h-20 px-4 border-b border-[#D6D6D6] ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!isCollapsed ? (
              <div className="w-42 transition-all duration-300">
                 <img src="/logo/TermSheetGenie.png" alt="Logo" className="object-contain" />
              </div>
            ) : (
              <div className="w-10 h-10 text-black rounded-lg flex items-center justify-center font-bold text-sm">
              </div>
            )}

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
            >
              {isCollapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
            </button>

            <button onClick={() => setIsOpen(false)} className="lg:hidden p-1">
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Nav Items - Scrollbar hidden here */}
          <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-1 scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.href);

              if (item.hasDropdown && item.name === "Settings") {
                const isParentActive = isActive || pathname.startsWith("/investor-admin/settings");
                return (
                  <div key={item.name} className="relative">
                    <Link
                      href="#"
                      onClick={handleSettingsClick}
                      className={`
                        flex items-center min-h-[50px] transition-all relative group
                        ${isCollapsed ? "justify-center px-0" : "gap-3 px-6"}
                        ${isParentActive ? "text-[#2D60FF]" : "text-gray-500 hover:text-gray-900"}
                      `}
                    >
                      {isParentActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-[6px] bg-[#2D60FF] rounded-r-md transition-all" />
                      )}
                      <Icon className={`w-5 h-5 ${isParentActive ? "text-[#2D60FF]" : "text-gray-400"}`} strokeWidth={isParentActive ? 2.5 : 1.5} />
                      {!isCollapsed && (
                        <>
                          <span className={`text-sm flex-1 ${isParentActive ? "font-semibold" : "font-medium"}`}>{item.name}</span>
                          <ChevronDown className={`w-4 h-4 transition-transform ${isSettingsOpen ? "rotate-180" : ""}`} />
                        </>
                      )}
                    </Link>

                    {!isCollapsed && isSettingsOpen && (
                      <div className="bg-gray-50/50 py-1 transition-all">
                        {item.subItems?.map((sub) => (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            className={`flex items-center h-10 pl-14 pr-4 text-sm transition-colors ${pathname === sub.href ? "text-[#2D60FF] font-semibold" : "text-gray-500 hover:text-gray-900"}`}
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              // Handle Simulator modal item
              if (item.isModal && item.name === "Simulator") {
                return (
                  <Link
                    key={item.name}
                    href="#"
                    onClick={handleSimulatorClick}
                    className={`
                      flex items-center min-h-[50px] transition-all relative group
                      ${isCollapsed ? "justify-center px-0" : "gap-3 px-6"}
                      text-gray-500 hover:text-gray-900
                    `}
                  >
                    <Icon 
                      className="w-5 h-5 transition-colors text-gray-400 group-hover:text-gray-600" 
                      strokeWidth={1.5} 
                    />
                    {!isCollapsed && (
                      <span className="text-sm font-medium">
                        {item.name}
                      </span>
                    )}
                  </Link>
                );
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center min-h-[50px] transition-all relative group
                    ${isCollapsed ? "justify-center px-0" : "gap-3 px-6"}
                    ${isActive ? "text-[#2D60FF]" : "text-gray-500 hover:text-gray-900"}
                  `}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-[6px] bg-[#2D60FF] rounded-r-md transition-all" />
                  )}
                  <Icon 
                    className={`w-5 h-5 transition-colors ${isActive ? "text-[#2D60FF]" : "text-gray-400 group-hover:text-gray-600"}`} 
                    strokeWidth={isActive ? 2.5 : 1.5} 
                  />
                  {!isCollapsed && (
                    <span className={`text-sm ${isActive ? "font-semibold" : "font-medium"}`}>
                      {item.name}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
          
          {!isCollapsed && (
             <div className="p-6 text-[10px] uppercase tracking-widest text-gray-400 border-t border-[#D6D6D6]">
               © 2024 TermSheetGenie
             </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default InvestorSidebar;
