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
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.send("Hello World!");
});

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

import userRouter from "./routes/user.routes.js";
import captainRouter from "./routes/captain.routes.js";

app.use("/api/users", userRouter);
app.use("/api/captains", captainRouter);

export default app;