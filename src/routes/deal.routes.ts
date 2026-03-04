import type { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { acceptDeal, getMyDeals, rejectDeal } from "../controller/deal.controller";

export const dealRoutes = (prisma: PrismaClient) => {
    const router = Router();

    router.get('/',authenticate,getMyDeals(prisma));
    router.patch('/:dealId/accept', authenticate, acceptDeal(prisma));
    router.patch('/:dealId/reject', authenticate, rejectDeal(prisma));

    return router;

}