export type UserRole = 'USER' | 'ADMIN';

export type QuestionType =
  | 'MULTIPLE_CHOICE'
  | 'CHECKBOXES'
  | 'SHORT_ANSWER'
  | 'LONG_ANSWER'
  | 'DROPDOWN'
  | 'LINEAR_SCALE'
  | 'DATE'
  | 'TIME'
  | 'DATETIME'
  | 'FILE_UPLOAD'
  | 'RICH_TEXT';

export type FormStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  createdAt: string;
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  userId: string;
  status: FormStatus;
  shareableUrl: string;
  password?: string;
  expiresAt?: string;
  responseLimit?: number;
  allowMultiple: boolean;
  allowMultipleConfigured?: boolean;
  collectEmail: boolean;
  showProgress: boolean;
  confirmationMsg?: string;
  theme?: {
    colors?: {
      primary?: string;
      secondary?: string;
      background?: string;
    };
    fonts?: {
      heading?: string;
      body?: string;
    };
    backgroundImage?: string;
  };
  settings?: {
    captcha?: boolean;
    customDomain?: string;
  };
  version: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  questions?: Question[];
  _count?: {
    responses: number;
    questions: number;
  };
}

export interface Question {
  id: string;
  formId: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  order: number;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
  options?: {
    choices?: string[];
    min?: number;
    max?: number;
    step?: number;
    labels?: {
      left?: string;
      right?: string;
    };
  };
  settings?: {
    randomize?: boolean;
    allowOther?: boolean;
  };
  conditional?: {
    questionId: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value: any;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Response {
  id: string;
  formId: string;
  userId?: string;
  email?: string;
  startedAt: string;
  completedAt?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
  answers?: Answer[];
}

export interface Answer {
  id: string;
  responseId: string;
  questionId: string;
  value: any;
  fileUrl?: string;
  createdAt: string;
  question?: Question;
}

export interface Analytics {
  formId: string;
  totalResponses: number;
  completedResponses: number;
  completionRate: number;
  averageCompletionTime: number;
  questionAnalytics: QuestionAnalytics[];
  trends: Trend[];
}

export interface QuestionAnalytics {
  questionId: string;
  questionTitle: string;
  questionType: QuestionType;
  responseCount: number;
  choiceDistribution?: Array<{
    choice: string;
    count: number;
    percentage: number;
  }>;
  scaleDistribution?: Array<{
    value: number;
    count: number;
    percentage: number;
  }>;
  average?: number;
}

export interface Trend {
  date: string;
  count: number;
}
