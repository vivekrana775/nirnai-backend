import { Request, Response, Router } from "express";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient, UserType } from "@prisma/client";
import { sendRes } from "../../../../../types/response";

dotenv.config();
const router = Router();
const prisma = new PrismaClient();

export enum Type {
  USER = "USER",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
}

export interface UserCreateArgs {
  password: string;
  email: string;
  type?: UserType;
  status?: string;
  firstName: string;
}

// Register User Endpoint
export const registerUser = router.post(
  "/register",
  async (req: Request, res: Response) => {
    try {
      const userCreateArgs: UserCreateArgs = req.body;

      if (!userCreateArgs.password || userCreateArgs.password.length < 6) {
        return sendRes({
          res: res,
          code: 400,
          data: null,
          message:
            "Please provide a valid password to create a user. Password must be at least 6 characters long.",
        });
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: userCreateArgs.email },
      });

      if (existingUser) {
        return sendRes({
          res: res,
          code: 400,
          data: null,
          message: "User already exists!",
        });
      }

      const encryptedPassword = await bcrypt.hash(userCreateArgs.password, 10);

      const user = await prisma.user.create({
        data: {
          email: userCreateArgs.email,
          password: encryptedPassword,
          firstName: userCreateArgs?.firstName,
        },
      });

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET as string,
        { expiresIn: "90d" }
      );

      return sendRes({
        success: true,
        res: res,
        code: 200,
        message: `User created successfully.`,
        data: { user, token },
      });
    } catch (error) {
      console.error(error);
      return sendRes({
        res: res,
        code: 500,
        data: null,
        message: error.message || "An error occurred during user registration.",
      });
    }
  }
);

// Login User Endpoint
export const loginUser = router.post(
  "/login",
  async (req: Request, res: Response) => {
    try {
      const userCreateArgs: { username: string; password: string } = req.body;

      if (!userCreateArgs.password || userCreateArgs.password.length < 6) {
        return sendRes({
          res: res,
          code: 400,
          data: null,
          message: "Please provide a valid password to sign in.",
        });
      }

      userCreateArgs.username = userCreateArgs.username.toLowerCase();

      const user = await prisma.user.findUnique({
        where: { email: userCreateArgs.username },
      });

      if (!user) {
        return sendRes({
          res: res,
          code: 400,
          data: null,
          message: `User with this username: ${userCreateArgs?.username} not found.`,
        });
      }

      const today = new Date();

      await prisma.user.update({
        where: { id: user.id },
        data: { lastSignedIn: today },
      });

      if (await bcrypt.compare(userCreateArgs.password, user.password)) {
        const token = jwt.sign(
          { userId: user.id },
          process.env.JWT_SECRET as string,
          { expiresIn: "90d" }
        );

        await prisma.token.create({
          data: {
            userId: user.id,
            token: token,
          },
        });

        return sendRes({
          success: true,
          res: res,
          code: 200,
          message: "Signed in successfully.",
          data: { user, token },
        });
      } else {
        return sendRes({
          res: res,
          code: 401,
          data: null,
          message: "Failed to authenticate user",
        });
      }
    } catch (error) {
      console.error(error);
      return sendRes({
        res: res,
        code: 500,
        data: null,
        message: error.message || "An error occurred",
      });
    }
  }
);

export default router;
