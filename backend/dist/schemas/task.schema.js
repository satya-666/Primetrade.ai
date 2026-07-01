"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTaskSchema = exports.createTaskSchema = void 0;
const zod_1 = require("zod");
exports.createTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required').max(200, 'Title too long'),
    description: zod_1.z.string().max(1000, 'Description too long').optional().default(''),
    status: zod_1.z.enum(['todo', 'in_progress', 'done']).optional().default('todo'),
    dueDate: zod_1.z.string().datetime().optional().nullable(),
});
exports.updateTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
    description: zod_1.z.string().max(1000, 'Description too long').optional(),
    status: zod_1.z.enum(['todo', 'in_progress', 'done']).optional(),
    dueDate: zod_1.z.string().datetime().optional().nullable(),
});
//# sourceMappingURL=task.schema.js.map