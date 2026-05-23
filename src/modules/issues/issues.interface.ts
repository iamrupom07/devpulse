import { UserRole } from '../auth/auth.interface';

// ── Issue ────────────────────────────────────────────────────────────────────

export type IssueType = 'bug' | 'feature_request';
export type IssueStatus = 'open' | 'in_progress' | 'resolved';

export interface Issue {
  id: number;
  title: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  reporter_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface IssueReporter {
  id: number;
  name: string;
  role: UserRole;
}

export interface IssueWithReporter extends Omit<Issue, 'reporter_id'> {
  reporter: IssueReporter;
}

// ── Request Bodies ───────────────────────────────────────────────────────────

export interface CreateIssueBody {
  title: string;
  description: string;
  type: IssueType;
}

export interface UpdateIssueBody {
  title?: string;
  description?: string;
  type?: IssueType;
  status?: IssueStatus;
}

// ── Query Filters ────────────────────────────────────────────────────────────

export interface IssueFilters {
  sort?: string;
  type?: string;
  status?: string;
}
