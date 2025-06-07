import { Request, Response, Router } from "express";
import dotenv from "dotenv";
import { sendRes } from "../../../../types/response";
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
dotenv.config();
const router = Router();

export const deleteTransactions = router.delete(
  "/transactions",
  async (_req: Request, res: Response) => {
    try {
      const transactions = await prisma.transaction.deleteMany({});

      return sendRes({
        success: true,
        res,
        code: 200,
        message: "Transactions Deleted successfully.",
        data: transactions,
      });
    } catch (error) {
      console.error("Error Deleting transactions:", error);
      return sendRes({
        res,
        code: 500,
        data: null,
        message: "An error occurred while Deleting the transactions.",
      });
    }
  }
);
