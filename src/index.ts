import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { endpoints } from "./endpoints";
import { Server } from "socket.io";
import { createServer } from "node:http";
import { CustomRequest } from "./api/shared/middleware/verifyToken";
import session from "express-session";

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;
const server = createServer(app);

const io = new Server(server, { cors: { origin: "*" } });

// Increase the limit
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(
  cors({
    origin: "*",
  })
);

app.use((req: CustomRequest, res, next) => {
  req.io = io;
  return next();
});

endpoints(app);

server.listen(port, () => {
  console.log(`Server listening on port http://localhost:${port}`);
});
