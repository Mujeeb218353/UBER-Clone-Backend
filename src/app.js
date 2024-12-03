import express from "express";
import cors from "cors";

const app = express();

const corsOptions = {
  origin: [process.env.CORS_ORIGIN, "http://localhost:5173"],
  credentials: true,
};

app.use(cors(corsOptions));

app.get("/health", (req, res) => {
  res.send("Hello World!");
});

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

export default app;