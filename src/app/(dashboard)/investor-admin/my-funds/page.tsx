"use client";
import CreateNewFund from "@/components/InvestorAdmin/InvestorOverview/CreateNewFund";
import LimitedPartnersView from "@/components/InvestorAdmin/InvestorOverview/LimitedPartnersView";
import MyFundsTable from "@/components/InvestorAdmin/InvestorOverview/MyFundsTable";
import SimulationSection from "@/components/InvestorAdmin/InvestorOverview/SimulationSection";
import React, { useState } from "react";

export default function InvestorDashboard() {
  const [view, setView] = useState<"table" | "create" | "lp">("table");

  return (
    <div>
      {/* Table View */}
      {view === "table" && (
        <MyFundsTable onAddNew={() => setView("create")} />
      )}
      
      {/* Create Fund View */}
      {view === "create" && (
        <CreateNewFund 
          onCancel={() => setView("table")} 
          onEditLPs={() => setView("lp")} 
        />
      )}

      {/* Limited Partners View */}
      {view === "lp" && (
        <LimitedPartnersView onBack={() => setView("create")} />
      )}

      {/* LOGIC: Show SimulationSection ONLY when not in 'create' view.
          This ensures it hides when "Creating a New Fund" is open.
      */}
      {view !== "create" && <SimulationSection />}
    </div>
  );
}