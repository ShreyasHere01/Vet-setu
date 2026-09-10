import "dotenv/config";
import bcrypt from "bcrypt";
import prisma from "../src/lib/prisma";

async function main() {
  const password = await bcrypt.hash("password123", 10);

  const farmer = await prisma.user.create({
    data: {
      name: "Ravi Farmer",
      email: "farmer@test.com",
      password,
      role: "FARMER",
    },
  });

  const vetUser = await prisma.user.create({
    data: {
      name: "Dr. Meera",
      email: "vet@test.com",
      password,
      role: "VET",
    },
  });

  const vet = await prisma.vet.create({
    data: {
      userId: vetUser.id,
      specialty: "Large Animal Medicine",
      verified: true,
    },
  });

  await prisma.slot.createMany({
    data: [
      {
        vetId: vet.id,
        startTime: new Date("2026-09-15T09:00:00+05:30"),
        endTime: new Date("2026-09-15T09:30:00+05:30"),
      },
      {
        vetId: vet.id,
        startTime: new Date("2026-09-15T10:00:00+05:30"),
        endTime: new Date("2026-09-15T10:30:00+05:30"),
      },
    ],
  });

  console.log("Seed data created successfully");
  console.log({
    farmerId: farmer.id,
    vetUserId: vetUser.id,
    vetId: vet.id,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });