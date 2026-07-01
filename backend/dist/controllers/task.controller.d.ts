import { Response } from 'express';
import { AuthRequest } from '../middleware/authenticate';
export declare function getTasks(req: AuthRequest, res: Response): Promise<void>;
export declare function createTask(req: AuthRequest, res: Response): Promise<void>;
export declare function updateTask(req: AuthRequest, res: Response): Promise<void>;
export declare function deleteTask(req: AuthRequest, res: Response): Promise<void>;
//# sourceMappingURL=task.controller.d.ts.map