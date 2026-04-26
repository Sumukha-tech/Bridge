export type UserRole = 'student' | 'teacher';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  avatar?: string;
}

export interface Note {
  id: string;
  title: string;
  description: string;
  subject: string;
  teacherId: string;
  teacherName: string;
  fileUrl: string;
  createdAt: any;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  subject: string;
  deadline: any;
  teacherId: string;
  teacherName: string;
  createdAt: any;
}

export interface Doubt {
  id: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  question: string;
  answer?: string;
  status: 'pending' | 'answered';
  subject: string;
  createdAt: any;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: any;
  location: string;
  attendees: string[];
  createdAt: any;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  content: string;
  fileUrl?: string;
  submittedAt: any;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}
