import type { Request, Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
export declare const writeAdminLog: (adminId: number, action: string, module?: string, description?: string, ipAddress?: string, userAgent?: string) => Promise<void>;
export declare const getAdminStats: (req: Request, res: Response) => Promise<void>;
export declare const getAdminProfile: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateAdminProfile: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateAdminPassword: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getTodaySales: (req: Request, res: Response) => Promise<void>;
export declare const getNewOrdersToday: (req: Request, res: Response) => Promise<void>;
export declare const getTotalRevenue: (req: Request, res: Response) => Promise<void>;
export declare const getReviews: (req: Request, res: Response) => Promise<void>;
export declare const getAdminLogs: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=adminController.d.ts.map