import type { Metadata } from 'next';
import { ProgramCurriculumView } from '@/components/ProgramCurriculumView';

export const metadata: Metadata = {
  title: 'Automation Testing Curriculum | 4-Week SDET Program & 3-Month Internship | Waynautic Academy',
  description: 'Comprehensive 4-week Automation Testing & SDET curriculum covering Selenium, Playwright, Azure DevOps, Jira, CI/CD pipelines, mock interviews, and guaranteed 3-month industry internship.',
  keywords: [
    'Automation Testing Curriculum',
    'Selenium WebDriver',
    'Playwright',
    'SDET Training',
    'Azure DevOps CI/CD',
    'Jira Test Management',
    'API Automation',
    'Waynautic Academy',
    '3 Month Internship',
  ],
  openGraph: {
    title: 'Automation Testing Curriculum | Waynautic Academy',
    description: 'Master Selenium, Playwright, Azure DevOps & CI/CD with real-world projects and a 3-month industry internship.',
    url: 'https://waynautic-academy.com/curriculum/automation-testing',
    siteName: 'Waynautic Academy',
    type: 'website',
  },
};

export default function AutomationTestingCurriculumPage() {
  return <ProgramCurriculumView currentProgramId="automation-testing" />;
}
