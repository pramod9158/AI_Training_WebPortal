'use client';

import React from 'react';
import { OnboardingTour } from '@/components/OnboardingTour';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-100/80 dark:bg-[#0B0F19] flex items-center justify-center p-4">
      <OnboardingTour isOpen={true} onClose={() => router.push('/curriculum')} />
    </div>
  );
}
