import { Request, Response, Router } from "express";
import dotenv from "dotenv";
import { sendRes } from "../../../../types/response";
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
dotenv.config();
const router = Router();

export const getTransactions = router.get(
  "/transactions",
  async (req: Request, res: Response) => {
    try {
      // Extract query parameters
      const {
        buyer,
        seller,
        houseNumber,
        surveyNumber,
        documentNumber,
        propertyType,
        minValue,
        maxValue,
        startDate,
        endDate,
        page = 1,
        limit = 10,
      } = req.query;

      // Prepare filter conditions
      const where: any = {};

      // Text-based filters
      if (buyer) {
        where.executants = {
          contains: buyer.toString(),
          mode: "insensitive",
        };
      }
      if (seller) {
        where.claimants = {
          contains: seller.toString(),
          mode: "insensitive",
        };
      }
      if (documentNumber) {
        where.docNoAndYear = {
          contains: documentNumber.toString(),
          mode: "insensitive",
        };
      }
      if (propertyType) {
        where.propertyType = {
          contains: propertyType.toString(),
          mode: "insensitive",
        };
      }

      // Numeric filters
      if (houseNumber) {
        where.plotNo = {
          contains: houseNumber.toString(),
          mode: "insensitive",
        };
      }
      if (surveyNumber) {
        where.surveyNo = {
          contains: surveyNumber.toString(),
          mode: "insensitive",
        };
      }
      if (minValue || maxValue) {
        where.OR = [
          {
            considerationValue: {
              gte: minValue ? Number(minValue) : undefined,
              lte: maxValue ? Number(maxValue) : undefined,
            },
          },
          {
            marketValue: {
              gte: minValue ? Number(minValue) : undefined,
              lte: maxValue ? Number(maxValue) : undefined,
            },
          },
        ];
      }

      // Date range filter
      if (startDate || endDate) {
        where.executionDate = {
          gte: startDate ? new Date(startDate.toString()) : undefined,
          lte: endDate ? new Date(endDate.toString()) : undefined,
        };
      }

      // Calculate pagination
      const pageNumber = Number(page);
      const pageSize = Number(limit);
      const skip = (pageNumber - 1) * pageSize;

      // Get transactions with filters
      const [transactions, totalCount] = await Promise.all([
        prisma.transaction.findMany({
          where,
          skip,
          take: pageSize,
        }),
        prisma.transaction.count({ where }),
      ]);

      return sendRes({
        success: true,
        res,
        code: 200,
        message: "Transactions fetched successfully.",
        data: {
          transactions,
          pagination: {
            total: totalCount,
            page: pageNumber,
            pageSize,
            totalPages: Math.ceil(totalCount / pageSize),
          },
        },
      });
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return sendRes({
        res,
        code: 500,
        data: null,
        message: "An error occurred while fetching the transactions.",
      });
    }
  }
);
