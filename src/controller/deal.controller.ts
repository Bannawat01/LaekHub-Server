import type { PrismaClient } from "@prisma/client";
import type { AuthRequest } from "../middlewares/auth.middleware";
import type { Response } from "express";

export const getMyDeals = (prisma: PrismaClient) => async (req:AuthRequest,res: Response) => {
    try {
        const userId = req.user?.userId;

        if(!userId) {
            res.status(401).json({message: "Unauthorized"});
            return;
        }

        const deals = await prisma.deal.findMany({
            where: {
                OR: [
                    { requesterId: userId },
                    { receiverId: userId }
                ]
            },
            include: {
                requesterItem: true,
                receiverItem: true,
                requester: {
                    select: {
                        displayName: true
                    }
                },
                receiver: {
                    select: {
                        displayName: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        
        })
        res.json(deals);
    }catch (error) {
        console.error("Error fetching deals:", error);
        res.status(500).json({message: "Internal server error"});
    }
}

export const acceptDeal = (prisma: PrismaClient) => async (req:AuthRequest,res: Response) => {
    try {
        const userId = req.user?.userId;
        const {dealId} = req.params;

        if(!userId) {
            res.status(401).json({message: "Unauthorized"});
            return;
        }

        if (!dealId || typeof dealId !== 'string') {
            res.status(400).json({ message: "Invalid Deal ID" });
            return;
        }

        const deal = await prisma.deal.findUnique({
            where: { id: dealId }
        });

        if (!deal) {
            res.status(404).json({ message: "Deal not found" });
            return;
        }

        if (deal.receiverId !== userId) {
            res.status(403).json({ message: "Forbidden: You are not the receiver of this deal" });
            return;
        }

        const updateDeal = await prisma.deal.update({
            where: { id: dealId },
            data: { status: 'ACCEPTED' }
        });
        res.status(200).json({
            message: "Deal accepted successfully",
            deal: updateDeal
        })
    }catch (error) {
        console.error("Error accepting deal:", error);
        res.status(500).json({message: "Internal server error"});
    }
}

export const rejectDeal = (prisma: PrismaClient) => async (req:AuthRequest,res: Response) => {
    try {
        const userId = req.user?.userId;
        const {dealId} = req.params;
        
        if(!userId) {
            res.status(401).json({message: "Unauthorized"});
            return;
        }

        if (!dealId || typeof dealId !== 'string') {
            res.status(400).json({ message: "Invalid Deal ID" });
            return;
        }

        const deal = await prisma.deal.findUnique({
            where: { id: dealId }
        });

        if (!deal) {
            res.status(404).json({ message: "Deal not found" });
            return;
        }

        if (deal.receiverId !== userId && deal.requesterId !== userId) {
            res.status(403).json({ message: "Forbidden: You are not part of this deal" });
            return;
        }

       const [updatedDeal] = await prisma.$transaction([
            prisma.deal.update({
                where: { id: dealId },
                data: { status: 'REJECTED' }
            }),
            prisma.item.updateMany({
                where: {
                    id: { in: [deal.requesterItemId, deal.receiverItemId] }
                },
                data: { status: 'AVAILABLE' }
            })
        ]);

        res.status(200).json({
            message: "Deal rejected and items are now available again",
            deal: updatedDeal
        });
    }catch (error) {
        console.error("Error rejecting deal:", error);
        res.status(500).json({message: "Internal server error"});
    }
}