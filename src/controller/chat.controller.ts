import type { PrismaClient } from "@prisma/client";
import type { AuthRequest } from "../middlewares/auth.middleware";
import type { Response } from "express";
import { Server } from "socket.io"

export const sendMessage = (prisma: PrismaClient,io: Server) => async (req: AuthRequest,res: Response) => {
    try {
        const senderId = req.user?.userId
        const {dealId,content} = req.body

        if (!senderId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        if(!content) {
            res.status(400).json({ message: 'Content is required' });
            return;
        }

        
        if(typeof dealId !== 'string') return res.status(400).json({
            message: "Invalid Deal ID"
        })

        const deal  = await prisma.deal.findUnique({
            where: { id: dealId }
        })

        if(!deal) {
            res.status(404).json({ message: 'Deal not found' });
            return;
        }

        if(deal.requesterId !== senderId && deal.receiverId !== senderId) {
            res.status(403).json({ message: 'Forbidden' });
            return;
        }

        const newMessage = await prisma.message.create({
            data: {
                dealId,
                senderId,
                content
            },
            include: {
                sender:{select:{displayName:true}}
            }
        })

        io.to(dealId).emit("new_message", newMessage)
        
        res.status(201).json({ message: 'Message sent successfully', data: newMessage });

    }catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const getChatHistory = (prisma: PrismaClient) => async (req: AuthRequest,res: Response) => {
    try {
        const userId = req.user?.userId
        const {dealId} = req.params

        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        if(typeof dealId !== 'string') return res.status(400).json({
            message: "Invalid Deal ID"
        })

        const deal = await prisma.deal.findUnique({
            where: { id: dealId }
        })

        if(!deal) {
            res.status(404).json({ message: 'Deal not found' });
            return;
        }

        if(deal.requesterId !== userId && deal.receiverId !== userId) {
            res.status(403).json({ message: 'Forbidden: You are not part of this deal' });
            return;
        }

        const messages = await prisma.message.findMany({
            where: { dealId },
            orderBy: { createdAt: 'asc' },
            include:{
                sender: {select: { displayName: true }}
            }
        })

        res.status(200).json({ messages });
    }catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}