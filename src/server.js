import dotenv from "dotenv";
import app from "./app.js";
import http from "http";
import { connectDB } from "./db/index.js";
dotenv.config({
  path: "./.env",
});

const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

connectDB();

server.listen(PORT, () => {
  console.log(`Server started on port http://localhost:${PORT}`);
});