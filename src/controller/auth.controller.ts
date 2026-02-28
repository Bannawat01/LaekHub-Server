import {  PrismaClient } from "@prisma/client";
import type { Request, Response } from "express";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const register = (prisma: PrismaClient) => async (req: Request,res: Response): Promise<void> => {
    try {
        const { phoneNumber, password, displayName } = req.body; //ตรงนี้เอาไว้เวลาเรารับข้อมูลมาจาก postman/bruno หรือ client ว่าเราจะรับข้อมูลอะไรบ้าง ชื่อไม่ต้องตรงกับใน database แต่ต้องตรงกับที่ client ส่งมา

        const existingUser = await prisma.user.findFirst({
            where: { phoneNumber: phoneNumber }
        });
        if (existingUser) {
           res.status(400).json({ message: 'User already exists' });
           return;
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = await prisma.user.create({ //ตรงนี้เอาไว้สร้าง user ใหม่ใน database โดยใช้ข้อมูลที่เรารับมาจาก client และ password ที่เราได้ทำการ hash แล้ว
            data : {
                phoneNumber: phoneNumber,
                passWordHash: hashedPassword,
                displayName: displayName,
            }
        });

        res.status(201).json({
            message: "register successfully!",
            user: {
                id: newUser.id,
                phoneNumber: newUser.phoneNumber,
                displayName: newUser.displayName
            }
        });

    }catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const login = (prisma: PrismaClient) => async (req: Request, res: Response): Promise<void> => {
    try {
        const { phoneNumber, password } = req.body;

        const user = await prisma.user.findFirst({
            where: { phoneNumber: phoneNumber }
        })

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.passWordHash); //ตรงนี้เอาไว้เปรียบเทียบ password ที่ client ส่งมาว่าตรงกับ password ที่เราเก็บใน database ไหม โดยใช้ bcrypt ในการเปรียบเทียบ
        if (!isPasswordValid) {
            res.status(401).json({ message: 'Invalid password' });
            return;
        }

        const secretKey = process.env.JWT_SECRET || 'fallback_secret';
        const token = jwt.sign({
            userId: user.id,
            phoneNumber: user.phoneNumber
        }, secretKey, { expiresIn: '7d' });

        res.status(200).json({
            message: 'Login successful',
            token: token,
            user: {
                displayName: user.displayName
            }
        })

    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}