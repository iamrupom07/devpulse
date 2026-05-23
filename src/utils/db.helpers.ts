import pool from '../config/db';
import { QueryResult, QueryResultRow } from 'pg';

export const query = async <T extends QueryResultRow>(
  sql: string,
  params?: unknown[],
): Promise<QueryResult<T>> => {
  return pool.query<T>(sql, params);
};

export const queryOne = async <T extends QueryResultRow>(
  sql: string,
  params?: unknown[],
): Promise<T | null> => {
  const result = await pool.query<T>(sql, params);
  return result.rows[0] ?? null;
};

export const queryMany = async <T extends QueryResultRow>(
  sql: string,
  params?: unknown[],
): Promise<T[]> => {
  const result = await pool.query<T>(sql, params);
  return result.rows;
};
