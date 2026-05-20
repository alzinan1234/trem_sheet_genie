// Disable static generation for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import Simulator from '@/components/InvestorAdmin/Simulator/Simulator';

export default function SimulatorPage() {
  return <Simulator />;
}