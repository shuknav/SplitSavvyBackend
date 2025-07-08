import express from "express";
import cors from "cors";
import waitlistRoutes from "./routes/waitlistRoutes.js";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use("/waitlist", waitlistRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
