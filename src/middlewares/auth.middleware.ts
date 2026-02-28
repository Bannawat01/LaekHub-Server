import type { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        phoneNumber: string;
    }
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.header('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Unauthorized: Missing or invalid authorization header' });
            return;
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            res.status(401).json({ message: 'Unauthorized: Missing token' });
            return;
        }

        const secretKey = process.env.JWT_SECRET || 'fallback_secret';

        const decoded = jwt.verify(token, secretKey) as jwt.JwtPayload;

        req.user = {
            userId: decoded.userId,
            phoneNumber: decoded.phoneNumber
        };

        next();

    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ message: 'Unauthorized: Invalid token' });
        } else if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({ message: 'Unauthorized: Token expired' });
        } else {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
}