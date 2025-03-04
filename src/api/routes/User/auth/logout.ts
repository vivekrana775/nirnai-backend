import { Request, Response, Router } from "express";
import dotenv from "dotenv";
import { sendRes } from "../../../../../types/response";
import { PrismaClient } from "@prisma/client";

dotenv.config();
const router = Router();
const prisma = new PrismaClient();

export const logoutUser = router.post(
  "/logout",
  async (req: Request, res: Response) => {
    try {
      const { userId, tokenId } = req.body;

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return sendRes({
          res: res,
          code: 400,
          data: null,
          message: `User not found.`,
        });
      }

      // Deleting the token
      const deleteToken = await prisma.token.delete({
        where: { id: tokenId },
      });

      if (!deleteToken) {
        return sendRes({
          res: res,
          code: 404,
          data: null,
          message: `Token not found.`,
        });
      }

      return sendRes({
        success: true,
        res: res,
        code: 202,
        message: `Logout Successfully`,
        data: {
          deleteToken,
        },
      });
    } catch (error) {
      console.error(error);
      sendRes({
        res: res,
        code: 500,
        data: null,
        message: error.message || "An error occurred during logout.",
      });
    }
  }
);

export default logoutUser;
