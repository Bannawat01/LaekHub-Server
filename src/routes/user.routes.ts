import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { editProfile, getAllUsers } from '../controller/user.controller';
import { authenticate } from '../middlewares/auth.middleware';

export const userRoutes = (prisma: PrismaClient) => {
    const router = Router();
    router.get('/', getAllUsers(prisma));
    router.put('/edit/:userId',authenticate, editProfile(prisma));
    return router;
}