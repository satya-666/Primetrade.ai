"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTasks = getTasks;
exports.createTask = createTask;
exports.updateTask = updateTask;
exports.deleteTask = deleteTask;
const prisma_1 = __importDefault(require("../utils/prisma"));
async function getTasks(req, res) {
    const userId = req.user.userId;
    const role = req.user.role;
    const where = role === 'admin' ? {} : { ownerId: userId };
    const tasks = await prisma_1.default.task.findMany({
        where,
        include: { owner: { select: { id: true, email: true } } },
        orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, message: 'Tasks fetched', data: tasks });
}
async function createTask(req, res) {
    const userId = req.user.userId;
    const { title, description, status, dueDate } = req.body;
    const task = await prisma_1.default.task.create({
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
async function updateTask(req, res) {
    const userId = req.user.userId;
    const role = req.user.role;
    const { id } = req.params;
    const existing = await prisma_1.default.task.findUnique({ where: { id } });
    if (!existing) {
        res.status(404).json({ success: false, message: 'Task not found', errors: [] });
        return;
    }
    if (role !== 'admin' && existing.ownerId !== userId) {
        res.status(403).json({ success: false, message: 'Not authorized to update this task', errors: [] });
        return;
    }
    const { title, description, status, dueDate } = req.body;
    const task = await prisma_1.default.task.update({
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
async function deleteTask(req, res) {
    const userId = req.user.userId;
    const role = req.user.role;
    const { id } = req.params;
    const existing = await prisma_1.default.task.findUnique({ where: { id } });
    if (!existing) {
        res.status(404).json({ success: false, message: 'Task not found', errors: [] });
        return;
    }
    if (role !== 'admin' && existing.ownerId !== userId) {
        res.status(403).json({ success: false, message: 'Not authorized to delete this task', errors: [] });
        return;
    }
    await prisma_1.default.task.delete({ where: { id } });
    res.json({ success: true, message: 'Task deleted', data: null });
}
//# sourceMappingURL=task.controller.js.map