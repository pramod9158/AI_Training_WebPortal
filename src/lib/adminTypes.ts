// Waynautic Academy - Admin & Barcode Payment Management Types

export interface CandidateRecord {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: 'candidate' | 'admin' | 'instructor';
  plan: 'free' | 'pro' | 'enterprise';
  accountStatus: 'active' | 'suspended';
  selectedPath: string;
  createdAt: string;
  lastActiveAt: string;
  streakDays: number;
  completedTopicsCount: number;
  totalTopicsCount: number;
  progressPercent: number;
  quizzesAttempted: number;
  averageQuizScore: number;
  totalSpent: number;
  paymentCount: number;
}

export interface CandidateModuleBreakdown {
  moduleSlug: string;
  title: string;
  totalTopics: number;
  completedTopics: number;
  progressPercent: number;
}

export interface CandidateQuizDetail {
  id: string;
  topicId: string;
  topicTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  attemptedAt: string;
}

export interface CandidateDetailRecord extends CandidateRecord {
  moduleProgress: CandidateModuleBreakdown[];
  completedTopicIds: string[];
  quizAttempts: CandidateQuizDetail[];
  payments: PaymentRecord[];
}

export interface PaymentRecord {
  id: string;
  userId?: string;
  userEmail: string;
  userName?: string;
  amount: number;
  currency: string;
  paymentMethod: 'barcode_qr' | 'upi' | 'cash' | 'card' | 'bank_transfer';
  transactionReference: string;
  barcodeId: string;
  status: 'pending' | 'verified' | 'rejected';
  proofUrl?: string;
  notes?: string;
  rejectionReason?: string;
  planGranted: 'free' | 'pro' | 'enterprise';
  verifiedAt?: string;
  verifiedBy?: string;
  createdAt: string;
}

export interface BarcodePaymentConfig {
  id: string;
  title: string;
  upiId: string;
  payeeName: string;
  amount: number;
  currency: string;
  qrImageUrl?: string;
  description: string;
  isActive: boolean;
  notes?: string;
}

export interface AdminMetrics {
  totalCandidates: number;
  activeToday: number;
  proCandidates: number;
  totalRevenue: number;
  pendingVerifications: number;
  averageProgress: number;
  overallQuizPassRate: number;
  totalQuizzesTaken: number;
}

export interface TopicDiagnostic {
  topicId: string;
  topicTitle: string;
  moduleTitle: string;
  completionCount: number;
  completionRate: number;
  averageQuizScore: number;
  attemptsCount: number;
}
