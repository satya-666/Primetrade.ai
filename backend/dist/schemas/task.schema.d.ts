import { z } from 'zod';
export declare const createTaskSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    status: z.ZodDefault<z.ZodOptional<z.ZodEnum<["todo", "in_progress", "done"]>>>;
    dueDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    status: "todo" | "in_progress" | "done";
    title: string;
    description: string;
    dueDate?: string | null | undefined;
}, {
    title: string;
    status?: "todo" | "in_progress" | "done" | undefined;
    description?: string | undefined;
    dueDate?: string | null | undefined;
}>;
export declare const updateTaskSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["todo", "in_progress", "done"]>>;
    dueDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    status?: "todo" | "in_progress" | "done" | undefined;
    title?: string | undefined;
    description?: string | undefined;
    dueDate?: string | null | undefined;
}, {
    status?: "todo" | "in_progress" | "done" | undefined;
    title?: string | undefined;
    description?: string | undefined;
    dueDate?: string | null | undefined;
}>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
//# sourceMappingURL=task.schema.d.ts.map