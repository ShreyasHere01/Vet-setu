-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "appointmentType" TEXT NOT NULL DEFAULT 'CLINIC',
ADD COLUMN     "visitAddress" TEXT,
ADD COLUMN     "visitLatitude" DOUBLE PRECISION,
ADD COLUMN     "visitLocationName" TEXT,
ADD COLUMN     "visitLongitude" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Slot" ADD COLUMN     "appointmentAddress" TEXT,
ADD COLUMN     "appointmentLatitude" DOUBLE PRECISION,
ADD COLUMN     "appointmentLocationName" TEXT,
ADD COLUMN     "appointmentLongitude" DOUBLE PRECISION,
ADD COLUMN     "appointmentType" TEXT NOT NULL DEFAULT 'CLINIC';
