import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authenticate';

export async function getTasks(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const role = req.user!.role;

  const where = role === 'admin' ? {} : { ownerId: userId };

  const tasks = await prisma.task.findMany({
    where,
    include: { owner: { select: { id: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ success: true, message: 'Tasks fetched', data: tasks });
}

export async function createTask(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const { title, description, status, dueDate } = req.body;

  const task = await prisma.task.create({
    data: {
      title,
      description: description || '',
      status: status || 'todo',
      dueDate: dueDate ? new Date(dueDate) : null,
      ownerId: userId,
    },
    include: { owner: { select: { id: true, email: true } } },
  });

  res.status(201).json({ success: true, message: 'Task created', data: task });
}

export async function updateTask(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const role = req.user!.role;
  const { id } = req.params;

  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ success: false, message: 'Task not found', errors: [] });
    return;
  }

  if (role !== 'admin' && existing.ownerId !== userId) {
    res.status(403).json({ success: false, message: 'Not authorized to update this task', errors: [] });
    return;
  }

  const { title, description, status, dueDate } = req.body;
  const task = await prisma.task.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(status !== undefined && { status }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
    },
    include: { owner: { select: { id: true, email: true } } },
  });

  res.json({ success: true, message: 'Task updated', data: task });
}

export async function deleteTask(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const role = req.user!.role;
  const { id } = req.params;

  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ success: false, message: 'Task not found', errors: [] });
    return;
  }

  if (role !== 'admin' && existing.ownerId !== userId) {
    res.status(403).json({ success: false, message: 'Not authorized to delete this task', errors: [] });
    return;
  }

  await prisma.task.delete({ where: { id } });
  res.json({ success: true, message: 'Task deleted', data: null });
}
