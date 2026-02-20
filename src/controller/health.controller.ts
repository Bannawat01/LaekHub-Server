import { PrismaClient } from '@prisma/client';
import type { Request, Response } from 'express';

export const getHealth = (prisma: PrismaClient) => async (req: Request, res: Response) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({
            status: 'OK',
        database: 'CONNECTED',
        timestamp: new Date().toISOString(),
        });
    } catch (error) {        
        res.status(500).json({
            status: 'ERROR',
            database: 'DISCONNECTED',
            timestamp: new Date().toISOString(),
        });
    }
};