"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = adminMiddleware;
function adminMiddleware(req, res, next) {
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
//# sourceMappingURL=admin.middleware.js.map