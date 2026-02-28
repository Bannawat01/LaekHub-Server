import type { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { login, register } from "../controller/auth.controller";
import { authenticate, type AuthRequest } from "../middlewares/auth.middleware";

export const authRoutes = (prisma: PrismaClient) => {
    const router = Router();
    router.post('/register',register(prisma));
    router.post('/login',login(prisma));
    router.get('/me', authenticate, async (req: AuthRequest,res) => {
        const userId = req.user?.userId;

        const userProfile = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, displayName: true, phoneNumber: true, status: true } // ดึงมาแค่บางส่วน ไม่ดึงรหัสผ่าน
        })
        res.status(200).json({  
            message: "User profile retrieved successfully",
            profile: userProfile
        });
    }) 

    return router;
}
