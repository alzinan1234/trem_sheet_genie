"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getMyProfile } from "@/services/user.service";
import { logout } from "@/services/auth.service";
import { User } from "@/types";
import toast from "react-hot-toast";

interface InvestorTopbarProps {
  onBellClick?: () => void;
  isCollapsed: boolean;
}

export default function InvestorTopbar({ onBellClick, isCollapsed }: InvestorTopbarProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Try localStorage first for instant display
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        try { setUser(JSON.parse(stored)); } catch {}
      }
    }
    // Then fetch fresh data
    getMyProfile()
      .then((res) => {
        if (res.success) {
          setUser(res.data);
          localStorage.setItem("user", JSON.stringify(res.data));
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
    : "U";

  return (
    <header
      className={`fixed top-0 right-0 h-20 bg-white px-6 border-b border-[#D6D6D6] z-40
        transition-all duration-300 ease-in-out flex items-center justify-end gap-4
        ${isCollapsed ? "left-20" : "left-72"} max-lg:left-0`}
    >
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-3 hover:bg-gray-50 rounded-xl px-3 py-2 transition-all"
        >
          {/* Avatar */}
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[#2D60FF] flex items-center justify-center shadow-sm">
            {user?.avatar ? (
              <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-bold text-sm">{initials}</span>
            )}
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full" />
          </div>
          {/* Name */}
          <div className="hidden md:block text-left">
            <p className="text-sm font-bold text-[#101828] leading-tight">
              {user ? `${user.firstName} ${user.lastName}` : "Loading..."}
            </p>
            <p className="text-xs text-[#667085]">{user?.email || ""}</p>
          </div>
          <svg className="w-4 h-4 text-[#667085] hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showDropdown && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
            <div className="absolute right-0 top-14 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-4 border-b border-gray-100">
                <p className="font-bold text-sm text-[#101828]">{user ? `${user.firstName} ${user.lastName}` : ""}</p>
                <p className="text-xs text-[#667085] mt-0.5">{user?.email || ""}</p>
              </div>
              <div className="p-2">
                <button onClick={() => { router.push("/investor-admin/settings"); setShowDropdown(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[#344054] hover:bg-gray-50 rounded-xl transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><circle cx="12" cy="12" r="3" /></svg>
                  Settings
                </button>
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  Sign out
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
