import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth";
import vetRoutes from "./routes/vet";
import appointmentRoutes from "./routes/appointment";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/vets", vetRoutes);
app.use("/api/appointments", appointmentRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Vet-Setu API is running",
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});