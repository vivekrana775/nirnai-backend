import express, { Request, Response } from "express";
import { sendRes } from "../types/response";
import { registerUser } from "./api/routes/User/auth/register";
import { loginUser } from "./api/routes/User/auth/login";
import { logoutUser } from "./api/routes/User/auth/logout";
import dotenv from "dotenv";
import {
  AdminMiddleware,
  UserMiddleware,
} from "./api/shared/middleware/verifyToken";
import {
  createUserItem,
  deleteUserItem,
  getAllUserItems,
  getUserItem,
  updateUserItem,
} from "./api/routes/UserItem/userItemRoute";

dotenv.config();

const API = "";

export const endpoints = async (app: express.Application) => {
  // await sendTestEmail();

  app.use(API, registerUser);
  app.use(API, loginUser);
  app.use(API, logoutUser);

  app.use(API, UserMiddleware);

  //Saved List
  app.use(API, getAllUserItems);
  app.use(API, createUserItem);
  app.use(API, getUserItem);
  app.use(API, updateUserItem);
  app.use(API, deleteUserItem);

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
