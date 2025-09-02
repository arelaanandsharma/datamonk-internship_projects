import express from "express";
import cors from "cors";
import usersRouter from "./routes/users.js";

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Route mount
app.use("/api/users", usersRouter);

app.listen(5000, () => {
  console.log("Backend running on port 5000");
});

