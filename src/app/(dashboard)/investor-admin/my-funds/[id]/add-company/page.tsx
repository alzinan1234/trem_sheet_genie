"use client";
import React, { use } from "react";
import { useRouter } from "next/navigation";
import Simulator from "@/components/InvestorAdmin/Simulator/Simulator";

interface Props { params: Promise<{ id: string }>; }

// This page routes directly into the simulator flow for adding a portfolio company
export default function AddCompanyPage({ params }: Props) {
  const router = useRouter();
  const resolvedParams = use(params);
  const fundId = resolvedParams.id;

  return <Simulator />;
}
