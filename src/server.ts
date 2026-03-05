import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { healthRoutes } from './routes/health.routes';
import { userRoutes } from './routes/user.routes';
import { authRoutes } from './routes/auth.routes';
import { itemRoutes } from './routes/item.routes';
import { swipeRoutes } from './routes/swipe.routes';
import { dealRoutes } from './routes/deal.routes';
import { createServer } from 'http';
import { Server } from "socket.io";
import { chatRoutes } from './routes/chat.routes';


const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const app = express();
const httpServer = createServer(app);
const prisma = new PrismaClient({ adapter });
const PORT = 3000;
export const io = new Server(httpServer, {
    cors: {
        origin: "*",
    }
})

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join_deal", (dealId: string) => {
    socket.join(dealId);
    console.log(`User joined deal room: ${dealId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});




app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes(prisma));
app.use('/api/health', healthRoutes(prisma));
app.use('/api/auth', authRoutes(prisma));
app.use('/api/items', itemRoutes(prisma));
app.use('/api/swipes', swipeRoutes(prisma));
app.use('/api/deals', dealRoutes(prisma));
app.use('/api/chats', chatRoutes(prisma, io));


httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});