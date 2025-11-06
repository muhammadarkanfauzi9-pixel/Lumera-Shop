import type { Request, Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
export declare const getAdminStats: (req: Request, res: Response) => Promise<void>;
export declare const getAdminProfile: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateAdminProfile: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateAdminPassword: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getTodaySales: (req: Request, res: Response) => Promise<void>;
export declare const getNewOrdersToday: (req: Request, res: Response) => Promise<void>;
export declare const getTotalRevenue: (req: Request, res: Response) => Promise<void>;
export declare const getReviews: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=adminController.d.ts.map