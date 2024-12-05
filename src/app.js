import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

const corsOptions = {
  origin: [process.env.CORS_ORIGIN, "http://localhost:5173"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.get("/health", (req, res) => {
  res.send("Hello World!");
});

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

import userRouter from "./routers/user.router.js";

app.use("/api/users", userRouter);

export default app;