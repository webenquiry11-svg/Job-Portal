-- CreateTable
CREATE TABLE "Employer" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "gstNumber" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "trustScore" INTEGER NOT NULL DEFAULT 100,
    "responseRate" DOUBLE PRECISION NOT NULL DEFAULT 100.0,

    CONSTRAINT "Employer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "postedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "slaDeadline" INTEGER NOT NULL DEFAULT 72,
    "employerId" TEXT NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "candidateName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Applied',
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL,
    "jobId" TEXT NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Employer_gstNumber_key" ON "Employer"("gstNumber");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "Employer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
