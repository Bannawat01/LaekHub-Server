import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { healthRoutes } from './routes/health.routes';
import { userRoutes } from './routes/user.routes';


const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const app = express();
const prisma = new PrismaClient({ adapter });
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get('/api/users', userRoutes(prisma));

app.use('/api/health', healthRoutes(prisma));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});