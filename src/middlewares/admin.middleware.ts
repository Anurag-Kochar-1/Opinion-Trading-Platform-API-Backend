import { Request, Response, NextFunction } from 'express';

interface AdminRequest extends Request {
    body: {
        adminToken?: string;
    };
}



export function adminMiddleware(req: AdminRequest, res: Response, next: NextFunction): void {
    next();
    //     if (!process.env.ADMIN_TOKEN) {
    //         throw new Error("ADMIN TOKEN is not defined!")
    //     }
    //     if (req.body.adminToken !== process.env.ADMIN_TOKEN) {
    //         res.status(403).json({
    //             statusMessage: 'Access denied. Admin token is missing/wrong.',
    //             statusCode: 403,
    //             statusType: 'ERROR',
    //         });
    //     } else {
    //         next();
    // }
}
