import { Response, NextFunction } from 'express';
import { AuthRequest } from './authenticate';
export declare function authorize(...roles: string[]): (req: AuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=authorize.d.ts.map