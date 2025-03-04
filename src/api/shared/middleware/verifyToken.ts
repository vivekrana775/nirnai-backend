import { Request, Response, NextFunction } from "express";
import { sendRes } from "../../../../types/response";
import jwt from "jsonwebtoken";
import env from "dotenv";
import { PrismaClient } from "@prisma/client";

env.config();
const prisma = new PrismaClient();

// Define a custom interface to extend the Request type
export interface CustomRequest extends Request {
  io: any;
  user: any;
}

// Middleware to decode and verify JWT token
const verifyToken = (req: CustomRequest, res: Response) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) {
    sendRes({
      res,
      code: 401,
      data: null,
      success: false,
      message: "Unauthorized.",
    });
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    return decoded;
  } catch (error) {
    sendRes({
      res,
      code: 401,
      data: null,
      success: false,
      message: error.message || "Invalid token.",
    });
    return null;
  }
};

// Common function to get user by ID
const getUserById = async (userId: string, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    sendRes({
      res,
      code: 401,
      data: null,
      success: false,
      message: "User not found.",
    });
    return null;
  }
  return user;
};

// User Middleware
export const UserMiddleware = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const decoded = verifyToken(req, res);
  if (!decoded) return;

  const user = await getUserById(decoded["userId"], res);
  if (!user) return;

  req.user = user;
  next();
};

// Admin Middleware
export const AdminMiddleware = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const decoded = verifyToken(req, res);
  if (!decoded) return;

  const user = await getUserById(decoded["user"]["id"], res);
  if (!user) return;

  if (user.type !== "ADMIN") {
    return sendRes({
      res,
      code: 401,
      data: null,
      success: false,
      message: "You don't have admin access rights!",
    });
  }

  req.user = user;
  next();
};
