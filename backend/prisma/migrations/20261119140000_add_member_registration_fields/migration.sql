-- AlterTable
ALTER TABLE "Member"
ADD COLUMN "ufuEmail" TEXT,
ADD COLUMN "birthDate" TEXT,
ADD COLUMN "phone" TEXT,
ADD COLUMN "cpf" TEXT,
ADD COLUMN "ufuRegistration" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Member_ufuEmail_key" ON "Member"("ufuEmail");

-- CreateIndex
CREATE UNIQUE INDEX "Member_cpf_key" ON "Member"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Member_ufuRegistration_key" ON "Member"("ufuRegistration");
