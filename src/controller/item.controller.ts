import { PrismaClient } from '@prisma/client';
import type { Request, Response } from 'express'
;import type { AuthRequest } from '../middlewares/auth.middleware';

export const createItem = (prisma: PrismaClient) => async (req: AuthRequest,res: Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const {title,description} = req.body;

        if (!title || !description) {
            res.status(400).json({ message: 'Title and description are required' });
            return;
        }
        if (!description ||description.trim() === '') {
            res.status(400).json({ message: 'Description is required' });
            return;
        }

        const newItem = await prisma.item.create({
            data: {
                title: title,
                description: description,
                ownerId: userId // ผูก item กับ user ผ่าน ownerId
            
            }
        });

        res.status(201).json({
            message: 'Item created successfully',
            item: newItem
        });

    }catch (error) {
        console.error('Error creating item:', error);
        res.status(500).json({ message: 'Error creating item' });
    }
}

export const getAllItems = (prisma: PrismaClient) => async (req: Request, res: Response): Promise<void> => {    try {

        const  items =await prisma.item.findMany({
            where: {
                status: 'AVAILABLE'
            },
            include: {
                owner: { //ขอมูลเจ้าของ item ด้วย
                    select: {
                        displayName: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc' // จากใหม่สุดไปเก่าสุด
            }
        });

        res.status(200).json({
            message: 'Items fetched successfully',
            total: items.length, // จำนวน item ที่ได้
            items: items
        });

    }catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ message: 'Error fetching items' });
    }
}