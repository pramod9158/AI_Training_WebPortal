import type { Metadata } from 'next';
import { ProgramCurriculumView } from '@/components/ProgramCurriculumView';

export const metadata: Metadata = {
  title: 'Performance Testing Curriculum | 4-Week Performance Engineering & 3-Month Internship | Waynautic Academy',
  description: 'Detailed 4-week Performance Testing & Engineering curriculum covering Apache JMeter, LoadRunner, K6, AppDynamics, Grafana, Datadog, mock interviews, and guaranteed 3-month industry internship.',
  keywords: [
    'Performance Testing Curriculum',
    'Apache JMeter',
    'LoadRunner',
    'Grafana K6',
    'AppDynamics',
    'Datadog',
    'SRE Training',
    'Performance Engineering',
    'Waynautic Academy',
    '3 Month Internship',
  ],
  openGraph: {
    title: 'Performance Testing Curriculum | Waynautic Academy',
    description: 'Master JMeter, LoadRunner, K6, AppDynamics & Datadog with enterprise projects and a 3-month industry internship.',
    url: 'https://waynautic-academy.com/curriculum/performance-testing',
    siteName: 'Waynautic Academy',
    type: 'website',
  },
};

export default function PerformanceTestingCurriculumPage() {
  return <ProgramCurriculumView currentProgramId="performance-testing" />;
}
