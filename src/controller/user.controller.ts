import { PrismaClient } from '@prisma/client';
import type { Request, Response } from 'express';

export const getAllUsers = (prisma: PrismaClient) => async (req: Request, res: Response) => {
     try {
            const users = await prisma.user.findMany(); 
            res.json(users);
        }catch (error) {
            res.status(500).json({ error: 'Something went wrong!' });
        }
};