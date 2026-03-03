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
                swiperId_targetItemId: {
                    swiperId: swiperId,
                    targetItemId: targetItemId
                }
            },
            create: {
                swiperId: swiperId,
                targetItemId: targetItemId,
                action: action
            },
            update: {
                action: action
            }
        })

        let isMatch = false;
        if (action === 'LIKE') {
            console.log(`กำลังเช็ค Match: หาว่า User ${targetItem.ownerId} เคย Like ของ User ${swiperId} หรือไม่?`);
            const reverseSwipe = await prisma.swipe.findFirst({
                where: {
                    swiperId: targetItem.ownerId,
                    targetItemId: swiperId,
                    action: 'LIKE'
                }
            })
            if (reverseSwipe) {
                isMatch = true;
            }
        }

        res.status(200).json({
            message: 'Swipe recorded successfully',
            swipe: swipe,
            isMatch: isMatch
        });

    }catch (error) {
        console.error('Error recording swipe:', error);
        res.status(500).json({message: "Internal server error"});
    }
}