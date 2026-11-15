CREATE TYPE "CompetitionStatus" AS ENUM ('DRAFT', 'OPEN', 'CLOSED', 'ARCHIVED');
CREATE TYPE "NominationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED');
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'EDITOR');

CREATE TABLE "Competition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "status" "CompetitionStatus" NOT NULL DEFAULT 'DRAFT',
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Competition_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Nominee" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "biography" TEXT,
    "photoUrl" TEXT,
    "status" "NominationStatus" NOT NULL DEFAULT 'PENDING',
    "votes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Nominee_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "NominationSubmission" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "nomineeName" TEXT NOT NULL,
    "biography" TEXT,
    "photoUrl" TEXT,
    "submitterName" TEXT NOT NULL,
    "submitterEmail" TEXT,
    "submitterPhone" TEXT,
    "consent" BOOLEAN NOT NULL DEFAULT false,
    "status" "NominationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NominationSubmission_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "nomineeId" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "voteQuantity" INTEGER NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "checkoutRequestId" TEXT,
    "merchantRequestId" TEXT,
    "providerReceipt" TEXT,
    "accountReference" TEXT NOT NULL,
    "rawCallback" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "VoteLedger" (
    "id" TEXT NOT NULL,
    "nomineeId" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "votes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VoteLedger_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'EDITOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Competition_slug_key" ON "Competition"("slug");
CREATE UNIQUE INDEX "Category_competitionId_slug_key" ON "Category"("competitionId", "slug");
CREATE UNIQUE INDEX "Nominee_categoryId_slug_key" ON "Nominee"("categoryId", "slug");
CREATE INDEX "Nominee_categoryId_status_votes_idx" ON "Nominee"("categoryId", "status", "votes");
CREATE UNIQUE INDEX "Payment_checkoutRequestId_key" ON "Payment"("checkoutRequestId");
CREATE UNIQUE INDEX "Payment_providerReceipt_key" ON "Payment"("providerReceipt");
CREATE UNIQUE INDEX "Payment_accountReference_key" ON "Payment"("accountReference");
CREATE UNIQUE INDEX "VoteLedger_paymentId_key" ON "VoteLedger"("paymentId");
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

ALTER TABLE "Category" ADD CONSTRAINT "Category_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Nominee" ADD CONSTRAINT "Nominee_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_nomineeId_fkey" FOREIGN KEY ("nomineeId") REFERENCES "Nominee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "VoteLedger" ADD CONSTRAINT "VoteLedger_nomineeId_fkey" FOREIGN KEY ("nomineeId") REFERENCES "Nominee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "VoteLedger" ADD CONSTRAINT "VoteLedger_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
