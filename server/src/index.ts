import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth";
import vetRoutes from "./routes/vet";
import appointmentRoutes from "./routes/appointment";
import reviewRoutes from "./routes/review";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/vets", vetRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/reviews", reviewRoutes);
import { errorHandler } from "./middleware/errorHandler";

app.get("/", (req, res) => {
  res.json({
    message: "Vet-Setu API is running",
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});