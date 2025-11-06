import type { Request, Response } from 'express';
export declare const createOrder: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getUserOrders: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getAllOrders: (req: Request, res: Response) => Promise<void>;
export declare const updatePaymentStatus: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const cancelOrder: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=orderController.d.ts.map