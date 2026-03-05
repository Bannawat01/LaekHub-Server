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
export const editProfile = (prisma: PrismaClient) => async (req: Request, res: Response) => {
    try {
        const { userId } = req.params; // รับ userId จาก URL
        const { displayName, phoneNumber } = req.body; // รับข้อมูลใหม่จาก body

        // ตรวจสอบว่ามี userId หรือไม่
        if (!userId) {
            res.status(400).json({ error: 'User ID is required' });
            return;
        }
        const updatedUser = await prisma.user.update({
            where: { id: userId as string },
            data: { displayName, phoneNumber },
        });

        res.json(updatedUser);
        
        
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong!' });
    }
}