import type { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { createItem, getAllItems, getMyItems } from "../controller/item.controller";

export const itemRoutes = (prisma: PrismaClient) => {
    const router = Router();
    router.post('/',authenticate,createItem(prisma));
    router.get('/',authenticate,getAllItems(prisma));
    router.get('/me',authenticate,getMyItems(prisma));

    return router;
}