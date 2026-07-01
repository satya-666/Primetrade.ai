import { Response } from 'express';
import { AuthRequest } from '../middleware/authenticate';
export declare function register(req: AuthRequest, res: Response): Promise<void>;
export declare function login(req: AuthRequest, res: Response): Promise<void>;
export declare function refresh(req: AuthRequest, res: Response): Promise<void>;
export declare function logout(_req: AuthRequest, res: Response): Promise<void>;
//# sourceMappingURL=auth.controller.d.ts.map