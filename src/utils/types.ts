// Re-export all types from module interfaces for backwards compatibility

export type {
  UserRole,
  User,
  PublicUser,
  JwtPayload,
  SignupBody,
  LoginBody,
  LoginResult,
} from '../modules/auth/auth.interface';

export type {
  IssueType,
  IssueStatus,
  Issue,
  IssueReporter,
  IssueWithReporter,
  CreateIssueBody,
  UpdateIssueBody,
  IssueFilters,
} from '../modules/issues/issues.interface';
