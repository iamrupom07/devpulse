import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { sendSuccess, sendError } from '../../utils/response';
import {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
  VALID_TYPES,
  VALID_STATUSES,
} from './issues.service';
import { CreateIssueBody, UpdateIssueBody } from './issues.interface';

// ── POST /api/issues ──────────────────────────────────────────────────────────

export const createIssueHandler = async (
  req: Request<object, object, CreateIssueBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { title, description, type } = req.body;

    if (!title || !description || !type) {
      sendError(res, StatusCodes.BAD_REQUEST, 'title, description, and type are required.');
      return;
    }
    if (title.length > 150) {
      sendError(res, StatusCodes.BAD_REQUEST, 'title must not exceed 150 characters.');
      return;
    }
    if (description.length < 20) {
      sendError(res, StatusCodes.BAD_REQUEST, 'description must be at least 20 characters.');
      return;
    }
    if (!VALID_TYPES.includes(type)) {
      sendError(res, StatusCodes.BAD_REQUEST, 'type must be bug or feature_request.');
      return;
    }

    const issue = await createIssue({ title, description, type }, req.user!.id);
    sendSuccess(res, StatusCodes.CREATED, 'Issue created successfully', issue);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'REPORTER_NOT_FOUND') {
      sendError(res, StatusCodes.BAD_REQUEST, 'Reporter user not found.');
      return;
    }
    next(err);
  }
};

// ── GET /api/issues ───────────────────────────────────────────────────────────

export const getAllIssuesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { sort, type, status } = req.query as { sort?: string; type?: string; status?: string };

    if (type && !(VALID_TYPES as string[]).includes(type)) {
      sendError(res, StatusCodes.BAD_REQUEST, 'type must be bug or feature_request.');
      return;
    }
    if (status && !(VALID_STATUSES as string[]).includes(status)) {
      sendError(res, StatusCodes.BAD_REQUEST, 'status must be open, in_progress, or resolved.');
      return;
    }

    const issues = await getAllIssues({ sort, type, status });
    sendSuccess(res, StatusCodes.OK, 'Issues retrived successfully', issues);
  } catch (err) {
    next(err);
  }
};

// ── GET /api/issues/:id ───────────────────────────────────────────────────────

export const getIssueByIdHandler = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      sendError(res, StatusCodes.BAD_REQUEST, 'Invalid issue id.');
      return;
    }

    const issue = await getIssueById(id);
    sendSuccess(res, StatusCodes.OK, 'Issue retrived successfully', issue);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'ISSUE_NOT_FOUND') {
      sendError(res, StatusCodes.NOT_FOUND, 'Issue not found.');
      return;
    }
    next(err);
  }
};

// ── PATCH /api/issues/:id ─────────────────────────────────────────────────────

export const updateIssueHandler = async (
  req: Request<{ id: string }, object, UpdateIssueBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      sendError(res, StatusCodes.BAD_REQUEST, 'Invalid issue id.');
      return;
    }

    const { title, description, type, status } = req.body;

    if (title !== undefined && title.length > 150) {
      sendError(res, StatusCodes.BAD_REQUEST, 'title must not exceed 150 characters.');
      return;
    }
    if (description !== undefined && description.length < 20) {
      sendError(res, StatusCodes.BAD_REQUEST, 'description must be at least 20 characters.');
      return;
    }
    if (type !== undefined && !VALID_TYPES.includes(type)) {
      sendError(res, StatusCodes.BAD_REQUEST, 'type must be bug or feature_request.');
      return;
    }
    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      sendError(res, StatusCodes.BAD_REQUEST, 'status must be open, in_progress, or resolved.');
      return;
    }

    const updated = await updateIssue(id, req.body, req.user!);
    sendSuccess(res, StatusCodes.OK, 'Issue updated successfully', updated);
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === 'ISSUE_NOT_FOUND') {
        sendError(res, StatusCodes.NOT_FOUND, 'Issue not found.');
        return;
      }
      if (err.message === 'FORBIDDEN_NOT_OWNER') {
        sendError(res, StatusCodes.FORBIDDEN, 'Contributors can only update their own issues.');
        return;
      }
      if (err.message === 'FORBIDDEN_NOT_OPEN') {
        sendError(res, StatusCodes.CONFLICT, 'Contributors can only update issues with open status.');
        return;
      }
      if (err.message === 'FORBIDDEN_STATUS_CHANGE') {
        sendError(res, StatusCodes.FORBIDDEN, 'Contributors cannot change issue status.');
        return;
      }
      if (err.message === 'NO_FIELDS') {
        sendError(res, StatusCodes.BAD_REQUEST, 'No valid fields provided for update.');
        return;
      }
    }
    next(err);
  }
};

// ── DELETE /api/issues/:id ────────────────────────────────────────────────────

export const deleteIssueHandler = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      sendError(res, StatusCodes.BAD_REQUEST, 'Invalid issue id.');
      return;
    }

    await deleteIssue(id);
    sendSuccess(res, StatusCodes.OK, 'Issue deleted successfully');
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'ISSUE_NOT_FOUND') {
      sendError(res, StatusCodes.NOT_FOUND, 'Issue not found.');
      return;
    }
    next(err);
  }
};
