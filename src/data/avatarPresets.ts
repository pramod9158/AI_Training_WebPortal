import { Bot, Cpu, Sparkles, Terminal, Code2, Flame, LucideIcon } from 'lucide-react';

export interface AvatarPreset {
  id: string;
  label: string;
  icon: LucideIcon;
  gradient: string;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  { id: 'ai-architect', label: 'AI Architect', icon: Bot, gradient: 'from-cyan-500 to-blue-600' },
  { id: 'neural-coder', label: 'Neural Coder', icon: Cpu, gradient: 'from-purple-500 to-indigo-600' },
  { id: 'prompt-engineer', label: 'Prompt Craftsman', icon: Sparkles, gradient: 'from-amber-500 to-orange-600' },
  { id: 'cyber-dev', label: 'Cyber Systems', icon: Terminal, gradient: 'from-emerald-500 to-teal-600' },
  { id: 'fullstack-ai', label: 'Full-Stack Dev', icon: Code2, gradient: 'from-rose-500 to-pink-600' },
  { id: 'master-researcher', label: 'Lead Researcher', icon: Flame, gradient: 'from-violet-500 to-fuchsia-600' },
];

export function getAvatarPreset(id?: string): AvatarPreset {
  return AVATAR_PRESETS.find(p => p.id === id) || AVATAR_PRESETS[0];
}
