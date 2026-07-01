import dotenv from 'dotenv';
dotenv.config();

process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
});

import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import prisma from './utils/prisma';
import { swaggerSpec } from './swagger';
import authRoutes from './routes/auth.routes';
import taskRoutes from './routes/task.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ success: true, message: 'OK' }));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/api/debug/db', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1 AS ok`;
    const count = await prisma.task.count();
    res.json({ success: true, dbConnected: true, taskCount: count });
  } catch (e: any) {
    res.status(500).json({ success: false, message: 'DB error', error: e.message, stack: e.stack?.split('\n').slice(0, 3) });
  }
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger docs at http://localhost:${PORT}/api/docs`);
});

export default app;
