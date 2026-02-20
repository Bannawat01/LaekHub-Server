import { Router } from 'express';
import { getHealth } from '../controller/health.controller';
import { PrismaClient } from '@prisma/client';

export const healthRoutes = (prisma: PrismaClient) => {
    const router = Router();
    router.get('/', getHealth(prisma));
    return router;
}