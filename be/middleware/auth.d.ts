import type { Request, Response, NextFunction } from 'express';
interface AdminPayload {
    id: number;
    role: string;
    email: string;
}
interface UserPayload {
    id: number;
    email: string;
}
export interface AuthRequest extends Request {
    admin?: AdminPayload;
    user?: UserPayload;
}
export declare const verifyToken: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const verifyUserToken: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const checkRole: (roles: string[]) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export {};
//# sourceMappingURL=auth.d.ts.map