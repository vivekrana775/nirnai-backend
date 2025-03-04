import { Request, Response, Router } from "express";
import { sendRes } from "../../../../types/response";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

/**
 * Get all saved lists for a user
 */
export const getAllSavedList = router.get(
  "/saved-list/:userId",
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      const savedLists = await prisma.savedList.findMany({ where: { userId } });

      return sendRes({
        res,
        code: 200,
        success: true,
        message: "Fetched saved lists successfully.",
        data: savedLists,
      });
    } catch (error) {
      console.error(error);
      return sendRes({
        res,
        code: 500,
        data: null,
        message: error.message || "Server error while fetching saved lists.",
      });
    }
  }
);

/**
 * Create a new saved list
 */
export const createSavedList = router.post(
  "/saved-list",
  async (req: Request, res: Response) => {
    try {
      const { userId, name, responseCodes } = req.body;

      if (!userId || !name || !responseCodes) {
        return sendRes({
          res,
          code: 400,
          data: null,
          message: "All fields (userId, name, responseCodes) are required.",
        });
      }

      const savedList = await prisma.savedList.create({
        data: { userId, name, responseCodes },
      });

      return sendRes({
        res,
        code: 201,
        success: true,
        message: "Saved list created successfully.",
        data: savedList,
      });
    } catch (error) {
      console.error(error);
      return sendRes({
        res,
        code: 500,
        data: null,
        message: error.message || "Server error while creating saved list.",
      });
    }
  }
);

/**
 * Get a single saved list by ID
 */
export const getSavedList = router.get(
  "/saved-list/:userId/:listId",
  async (req: Request, res: Response) => {
    try {
      const { userId, listId } = req.params;

      const savedList = await prisma.savedList.findFirst({
        where: { id: listId, userId },
      });

      if (!savedList) {
        return sendRes({
          res,
          code: 404,
          data: null,
          message: "Saved list not found.",
        });
      }

      return sendRes({
        res,
        code: 200,
        success: true,
        message: "Fetched saved list successfully.",
        data: savedList,
      });
    } catch (error) {
      console.error(error);
      return sendRes({
        res,
        code: 500,
        data: null,
        message: error.message || "Server error while fetching saved list.",
      });
    }
  }
);

/**
 * Update a saved list
 */
export const updateSavedList = router.patch(
  "/saved-list",
  async (req: Request, res: Response) => {
    try {
      const { responseCodes, listId } = req.body;

      const updatedList = await prisma.savedList.update({
        where: { id: listId },
        data: { responseCodes },
      });

      if (!updatedList) {
        return sendRes({
          res,
          code: 404,
          data: null,
          message: "Saved list not found.",
        });
      }

      return sendRes({
        res,
        code: 200,
        success: true,
        message: "Saved list updated successfully.",
        data: updatedList,
      });
    } catch (error) {
      console.error(error);
      return sendRes({
        res,
        code: 500,
        data: null,
        message: error.message || "Server error while updating saved list.",
      });
    }
  }
);

/**
 * Delete a saved list
 */
export const deleteSavedList = router.delete(
  "/saved-list",
  async (req: Request, res: Response) => {
    try {
      const { listId } = req.body;

      const deletedList = await prisma.savedList.delete({
        where: { id: listId },
      });

      if (!deletedList) {
        return sendRes({
          res,
          code: 404,
          data: null,
          message: "Saved list not found.",
        });
      }

      return sendRes({
        res,
        code: 200,
        success: true,
        message: "Saved list deleted successfully.",
      });
    } catch (error) {
      console.error(error);
      return sendRes({
        res,
        code: 500,
        data: null,
        message: error.message || "Server error while deleting saved list.",
      });
    }
  }
);

export default router;
