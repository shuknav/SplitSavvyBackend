import express from "express";
import cors from "cors";
import waitlistRoutes from "./routes/waitlistRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use("/waitlist", waitlistRoutes);
app.use("/auth", authRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
