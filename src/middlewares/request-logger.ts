import morgan from 'morgan';
import { logger } from "../config/logger";
import { Request, Response, NextFunction } from 'express';

const stream = {
    write: (message: string) => {
        logger.info(message.trim());
    },
};

morgan.token('body', (req: Request) => JSON.stringify(req.body));

const requestLogger = morgan(
    ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :body',
    { stream }
);

const errorLogger = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    logger.error('Error:', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        body: req.body,
    });
    next(err);
};

export { requestLogger, errorLogger };