import express, { Request, Response } from "express";
import { sendRes } from "../types/response";

import dotenv from "dotenv";
import { UserMiddleware } from "./api/shared/middleware/verifyToken";
import { getPdfData } from "./api/routes/transactions/createTransactionsByParsingPdf";
import { getTransactions } from "./api/routes/transactions/getTransactions";
import { deleteTransactions } from "./api/routes/transactions/deleteTransactions";
import rateLimit from "express-rate-limit";

dotenv.config();

const API = "/api";

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 uploads per hour
  message: "Too many file uploads from this IP, please try again later",
});

export const endpoints = async (app: express.Application) => {
  app.use(`${API}/transactions/upload`, uploadLimiter);

  app.use(API, getPdfData);
  app.use(API, getTransactions);
  app.use(API, deleteTransactions);
  // app.use(API, UserMiddleware);

  app.get("/", async (req: Request, res: Response) => {
    return sendRes({
      res: res,
      code: 200,
      data: null,
      success: true,
      message: `Server is up and running!.`,
    });
  });
};
