import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import userRouter from "./routes/userRouter.js";
import applicationRouter from "./routes/applicationRouter.js";
import jobRouter from "./routes/jobRouter.js";
import { dbConnection } from "./database/dbConnection.js";
import { errorMiddleware } from "./middlewares/error.js";
import cron from "node-cron";
import axios from "axios";

const app = express();
dotenv.config({ path: "./config/config.env" });

app.use(
  cors({
    origin: [process.env.FRONTEND_URL, "http://localhost:5173"],
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

app.use("/api/v1/user", userRouter);
app.use("/api/v1/application", applicationRouter);
app.use("/api/v1/job", jobRouter);

dbConnection();

app.use(errorMiddleware);

// 🔥 CRON JOB TO KEEP SERVER ALIVE 🔥
cron.schedule("*/10 * * * *", async () => {
  try {
    const serverUrl = process.env.SERVER_URL || "https://jobdekho-wkbb.onrender.com";
    await axios.get(`${serverUrl}/api/v1/job/getall`);
    console.log(`[CRON] Server pinged at: ${new Date().toLocaleString()}`);
  } catch (error) {
    console.error("[CRON] Server ping failed:", error.message);
  }
});

export default app;
