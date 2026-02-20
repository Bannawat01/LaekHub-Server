# LaekHub Server

Backend API สำหรับแอพพลิเคชัน LaekHub — แพลตฟอร์มแลกเปลี่ยนสิ่งของแบบ peer-to-peer

## Tech Stack

- **Runtime:** [Bun](https://bun.sh/)
- **Framework:** Express 5
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Language:** TypeScript

## โครงสร้างโปรเจค

```
src/
├── server.ts           # Entry point
├── controller/         # Request handlers
├── routes/             # Route definitions
├── middlewares/        # Express middlewares
├── services/           # Business logic
├── types/              # TypeScript types
└── utils/              # Utility functions
prisma/
└── schema.prisma       # Database schema
```

## การติดตั้งและรันโปรเจค

### 1. ติดตั้ง Bun

```bash
# macOS / Linux
curl -fsSL https://bun.sh/install | bash

# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"
```

ตรวจสอบว่าติดตั้งสำเร็จ:

```bash
bun --version
```

### 2. Clone โปรเจค

```bash
git clone <repository-url>
cd LaekHub-Server
```

### 3. ติดตั้ง Dependencies

```bash
bun install
```

### 4. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` ที่ root ของโปรเจค:

```bash
cp .env.example .env
```

> หากไม่มีไฟล์ `.env.example` ให้สร้างไฟล์ `.env` เองแล้วใส่ค่าดังนี้:

```env
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<database>"
```

ติดต่อเพื่อนในทีมเพื่อขอ `DATABASE_URL` ที่ถูกต้อง เนื่องจากไฟล์ `.env` ไม่ได้ถูก commit ขึ้น Git

### 5. Generate Prisma Client

```bash
bunx prisma generate
```

### 6. รัน Development Server

```bash
bun dev
```

Server จะรันที่ `http://localhost:3000`

## API Endpoints

| Method | Path          | Description                      |
|--------|---------------|----------------------------------|
| GET    | `/api/health` | ตรวจสอบสถานะ server และ database  |
| GET    | `/api/users`  | ดึงข้อมูล users ทั้งหมด            |

### ตัวอย่าง Response: GET /api/health

```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-02-21T00:00:00.000Z"
}
```

## Database Schema

โปรเจคนี้ใช้ Prisma ORM กับ PostgreSQL โดยมี model หลักดังนี้:

| Model    | Description                                |
|----------|--------------------------------------------|
| `User`   | ผู้ใช้งาน (phone-based auth)               |
| `Item`   | สิ่งของที่ต้องการแลกเปลี่ยน                 |
| `Swipe`  | การ Like/Pass สิ่งของ (คล้าย Tinder)        |
| `Block`  | การบล็อกผู้ใช้                              |
| `Report` | การรีพอร์ตผู้ใช้                            |

สามารถดู schema ทั้งหมดได้ที่ `prisma/schema.prisma`

## คำสั่งที่ใช้บ่อย

```bash
# รัน dev server พร้อม hot reload
bun dev

# ดู database ผ่าน Prisma Studio
bunx prisma studio

# Sync schema กับ database (ระวัง: อาจลบข้อมูล)
bunx prisma db push

# Generate Prisma Client หลังแก้ schema
bunx prisma generate
```

## หมายเหตุ

- ไฟล์ `.env` **ไม่ได้อยู่ใน Git** — ต้องสร้างเองทุกครั้งที่ clone
- ใช้ **Bun** เป็น runtime ไม่ใช่ Node.js — ต้องติดตั้ง Bun ก่อน
- หากเจอปัญหา Prisma Client ให้รัน `bunx prisma generate` ก่อนเสมอ
