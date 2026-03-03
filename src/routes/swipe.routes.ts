import type { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { handleSwipe } from "../controller/swipe.controller";

export const swipeRoutes = (prisma: PrismaClient) => {
    const router = Router();
    router.post('/',authenticate,handleSwipe(prisma));
    return router;
}