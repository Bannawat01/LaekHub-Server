import type { PrismaClient } from "@prisma/client";
import type { Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware";

export const handleSwipe = (prisma: PrismaClient) =>async (req: AuthRequest,res: Response): Promise<void> => {
    try {
        const swiperId = req.user?.userId;
        const {targetItemId,action} = req.body;

        if(!swiperId) {
            res.status(401).json({message: "Unauthorized"});
            return;
        }

        const targetItem = await prisma.item.findUnique({
            where: {
                id: targetItemId
            }
        })

        if (!targetItem) {
            res.status(404).json({message: "Target item not found"});
            return;
        }

        if(targetItem.ownerId === swiperId) {
            res.status(400).json({message: "Cannot swipe on your own item"});
            return;
        }

        const swipe = await prisma.swipe.upsert({
            where: {
                swiperId_targetItemId: { swiperId, targetItemId }
            },
            update: { action },
            create: { swiperId, targetItemId, action }
        })

        let isMatch = false;
        let deal = null;

        if (action === 'LIKE') {
            const reverseSwipe = await prisma.swipe.findFirst({
                where: {
                    swiperId: targetItem.ownerId,
                    targetItem: {
                        ownerId: swiperId
                    },
                    action: 'LIKE'
                }
            })
            if (reverseSwipe) {
                isMatch = true;

                deal = await prisma.deal.create({
                    data: {
                        requesterId: swiperId,
                        receiverId: targetItem.ownerId,
                        requesterItemId: targetItemId,
                        receiverItemId: targetItemId,
                        status: 'PENDING' //สถานะรอตอบรับ
                    }
                })

                await prisma.item.updateMany({
                    where: { id: { in: [targetItemId, reverseSwipe.targetItemId] } },
                    data: {status: 'SWAPPING'}
                })
            }
        }

        res.status(200).json({
            message: 'Swipe recorded successfully',
            isMatch: isMatch,
            swipe: swipe,
            deal: deal
        });

    }catch (error) {
        console.error('Error recording swipe:', error);
        res.status(500).json({message: "Internal server error"});
    }
}