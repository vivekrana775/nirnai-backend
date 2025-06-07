import express, { Request, Response } from "express";
import { sendRes } from "../types/response";

import dotenv from "dotenv";
import {
  AdminMiddleware,
  UserMiddleware,
} from "./api/shared/middleware/verifyToken";
import { getPdfData } from "./api/routes/transactions/parsePdf";

dotenv.config();

const API = "/api";

export const endpoints = async (app: express.Application) => {
  // await sendTestEmail();

  app.use(API, getPdfData);
  app.use(API, UserMiddleware);

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
