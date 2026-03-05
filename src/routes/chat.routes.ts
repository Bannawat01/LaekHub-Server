import type { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { authenticate} from "../middlewares/auth.middleware";
import { getChatHistory, sendMessage } from "../controller/chat.controller";
import { Server } from "socket.io";

export const chatRoutes = (prisma: PrismaClient, io: Server) => {
    const router = Router();
    router.post('/send', authenticate, sendMessage(prisma, io));
    router.get("/:dealId", authenticate, getChatHistory(prisma));

    return router;

}

