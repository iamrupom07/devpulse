import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.route';
import issuesRoutes from './modules/issues/issues.route';
import { errorHandler, notFound } from './middleware/error.middleware';

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issuesRoutes);

// 404 + global error handler
app.use(notFound);
app.use(errorHandler);

export default app;
