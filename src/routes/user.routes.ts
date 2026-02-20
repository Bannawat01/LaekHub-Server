import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { getAllUsers } from '../controller/user.controller';

export const userRoutes = (prisma: PrismaClient) => {
    const router = Router();
    router.get('/', getAllUsers(prisma));
    return router;
}