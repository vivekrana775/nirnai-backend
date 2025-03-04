import { Request, Response, Router } from "express";
import { sendRes } from "../../../../types/response";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

export const getAllUserItems = router.get(
  "/user-item/:userId",
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      const userItems = await prisma.userItem.findMany({ where: { userId } });

      return sendRes({
        res,
        code: 200,
        success: true,
        message: "Fetched user items successfully.",
        data: userItems,
      });
    } catch (error) {
      console.error(error);
      return sendRes({
        res,
        code: 500,
        data: null,
        message: error.message || "Server error while fetching user items.",
      });
    }
  }
);

export const createUserItem = router.post(
  "/user-item",
  async (req: Request, res: Response) => {
    try {
      const { userId, title, description } = req.body;

      console.log("user", userId, title, description);

      if (!userId || !title) {
        return sendRes({
          res,
          code: 400,
          data: null,
          message: "All fields (userId, title, description) are required.",
        });
      }

      const userItem = await prisma.userItem.create({
        data: { userId, title, description },
      });

      return sendRes({
        res,
        code: 201,
        success: true,
        message: "User item created successfully.",
        data: userItem,
      });
    } catch (error) {
      console.error(error);
      return sendRes({
        res,
        code: 500,
        data: null,
        message: error.message || "Server error while creating user item.",
      });
    }
  }
);

export const getUserItem = router.get(
  "/user-item/:userId/:itemId",
  async (req: Request, res: Response) => {
    try {
      const { userId, itemId } = req.params;

      const userItem = await prisma.userItem.findFirst({
        where: { id: itemId, userId },
      });

      if (!userItem) {
        return sendRes({
          res,
          code: 404,
          data: null,
          message: "User item not found.",
        });
      }

      return sendRes({
        res,
        code: 200,
        success: true,
        message: "Fetched user item successfully.",
        data: userItem,
      });
    } catch (error) {
      console.error(error);
      return sendRes({
        res,
        code: 500,
        data: null,
        message: error.message || "Server error while fetching user item.",
      });
    }
  }
);

export const updateUserItem = router.patch(
  "/user-item",
  async (req: Request, res: Response) => {
    try {
      const { title, description, id } = req.body;

      const updatedItem = await prisma.userItem.update({
        where: { id },
        data: { title, description },
      });

      if (!updatedItem) {
        return sendRes({
          res,
          code: 404,
          data: null,
          message: "User item not found.",
        });
      }

      return sendRes({
        res,
        code: 200,
        success: true,
        message: "User item updated successfully.",
        data: updatedItem,
      });
    } catch (error) {
      console.error(error);
      return sendRes({
        res,
        code: 500,
        data: null,
        message: error.message || "Server error while updating user item.",
      });
    }
  }
);

export const deleteUserItem = router.delete(
  "/user-item",
  async (req: Request, res: Response) => {
    try {
      const { itemId } = req.body;

      const deletedItem = await prisma.userItem.delete({
        where: { id: itemId },
      });

      if (!deletedItem) {
        return sendRes({
          res,
          code: 404,
          data: null,
          message: "User item not found.",
        });
      }

      return sendRes({
        res,
        code: 200,
        success: true,
        message: "User item deleted successfully.",
      });
    } catch (error) {
      console.error(error);
      return sendRes({
        res,
        code: 500,
        data: null,
        message: error.message || "Server error while deleting user item.",
      });
    }
  }
);

export default router;
