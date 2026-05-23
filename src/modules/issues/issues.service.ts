import { queryOne, queryMany, query } from '../../utils/db.helpers';
import { JwtPayload } from '../auth/auth.interface';
import {
  Issue,
  IssueWithReporter,
  IssueReporter,
  CreateIssueBody,
  UpdateIssueBody,
  IssueFilters,
  IssueType,
  IssueStatus,
} from './issues.interface';

// ── Constants ────────────────────────────────────────────────────────────────

export const VALID_TYPES: IssueType[] = ['bug', 'feature_request'];
export const VALID_STATUSES: IssueStatus[] = ['open', 'in_progress', 'resolved'];

// ── Helpers ───────────────────────────────────────────────────────────────────

const attachReporters = async (issues: Issue[]): Promise<IssueWithReporter[]> => {
  if (issues.length === 0) return [];

  const reporterIds = [...new Set(issues.map((i) => i.reporter_id))];
  const reporters = await queryMany<IssueReporter>(
    `SELECT id, name, role FROM users WHERE id = ANY($1::int[])`,
    [reporterIds],
  );

  const reporterMap = new Map(reporters.map((r) => [r.id, r]));

  return issues.map(({ reporter_id, ...rest }) => ({
    ...rest,
    reporter: reporterMap.get(reporter_id) ?? { id: reporter_id, name: 'Unknown', role: 'contributor' },
  }));
};

// ── Create Issue ──────────────────────────────────────────────────────────────

export const createIssue = async (
  body: CreateIssueBody,
  reporterId: number,
): Promise<Issue> => {
  const { title, description, type } = body;

  const reporter = await queryOne<{ id: number }>('SELECT id FROM users WHERE id = $1', [reporterId]);
  if (!reporter) {
    throw new Error('REPORTER_NOT_FOUND');
  }

  const issue = await queryOne<Issue>(
    `INSERT INTO issues (title, description, type, reporter_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [title, description, type, reporterId],
  );

  return issue!;
};

// ── Get All Issues ────────────────────────────────────────────────────────────

export const getAllIssues = async (filters: IssueFilters): Promise<IssueWithReporter[]> => {
  const { sort = 'newest', type, status } = filters;

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (type) {
    params.push(type);
    conditions.push(`type = $${params.length}`);
  }

  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const order = sort === 'oldest' ? 'ASC' : 'DESC';

  const issues = await queryMany<Issue>(
    `SELECT * FROM issues ${where} ORDER BY created_at ${order}`,
    params,
  );

  return attachReporters(issues);
};

// ── Get Issue By ID ───────────────────────────────────────────────────────────

export const getIssueById = async (id: number): Promise<IssueWithReporter> => {
  const issue = await queryOne<Issue>('SELECT * FROM issues WHERE id = $1', [id]);
  if (!issue) {
    throw new Error('ISSUE_NOT_FOUND');
  }

  const [issueWithReporter] = await attachReporters([issue]);
  return issueWithReporter;
};

// ── Update Issue ──────────────────────────────────────────────────────────────

export const updateIssue = async (
  id: number,
  body: UpdateIssueBody,
  user: JwtPayload,
): Promise<Issue> => {
  const issue = await queryOne<Issue>('SELECT * FROM issues WHERE id = $1', [id]);
  if (!issue) {
    throw new Error('ISSUE_NOT_FOUND');
  }

  if (user.role === 'contributor') {
    if (issue.reporter_id !== user.id) {
      throw new Error('FORBIDDEN_NOT_OWNER');
    }
    if (issue.status !== 'open') {
      throw new Error('FORBIDDEN_NOT_OPEN');
    }
    if (body.status !== undefined) {
      throw new Error('FORBIDDEN_STATUS_CHANGE');
    }
  }

  const { title, description, type, status } = body;

  const updates: string[] = [];
  const params: unknown[] = [];

  if (title !== undefined) { params.push(title); updates.push(`title = $${params.length}`); }
  if (description !== undefined) { params.push(description); updates.push(`description = $${params.length}`); }
  if (type !== undefined) { params.push(type); updates.push(`type = $${params.length}`); }
  if (status !== undefined) { params.push(status); updates.push(`status = $${params.length}`); }

  if (updates.length === 0) {
    throw new Error('NO_FIELDS');
  }

  updates.push(`updated_at = NOW()`);
  params.push(id);

  const updated = await queryOne<Issue>(
    `UPDATE issues SET ${updates.join(', ')} WHERE id = $${params.length} RETURNING *`,
    params,
  );

  return updated!;
};

// ── Delete Issue ──────────────────────────────────────────────────────────────

export const deleteIssue = async (id: number): Promise<void> => {
  const issue = await queryOne<{ id: number }>('SELECT id FROM issues WHERE id = $1', [id]);
  if (!issue) {
    throw new Error('ISSUE_NOT_FOUND');
  }

  await query('DELETE FROM issues WHERE id = $1', [id]);
};
