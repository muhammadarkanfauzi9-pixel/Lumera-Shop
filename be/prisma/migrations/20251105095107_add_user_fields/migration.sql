-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "activeModules" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "averageActiveTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "lastPasswordChange" TIMESTAMP(3),
ADD COLUMN     "passwordChanges" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "profileImageUrl" TEXT;

-- CreateTable
CREATE TABLE "AdminLog" (
    "id" SERIAL NOT NULL,
    "adminId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "module" TEXT,
    "description" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AdminLog" ADD CONSTRAINT "AdminLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
