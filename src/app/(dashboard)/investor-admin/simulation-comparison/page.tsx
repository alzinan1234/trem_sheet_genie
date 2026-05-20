"use client";

import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import SimulationComparison from '@/components/InvestorAdmin/Simulator/SimulationComparison/SimulationComparison';
import { PageLoader } from '@/components/shared/LoadingSpinner';

function SimulationComparisonContent() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/investor-admin/simulation-results');
  };

  return <SimulationComparison onBack={handleBack} />;
}

export default function SimulationComparisonPage() {
  return (
    <Suspense fallback={<PageLoader text="Loading comparison..." />}>
      <SimulationComparisonContent />
    </Suspense>
  );
}
