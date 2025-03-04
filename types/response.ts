import { Response } from "express-serve-static-core";

interface ResponseArgs {
  res: Response;
  code: number;
  message: any;
  data?: any;
  success?: boolean;
}

export const sendRes = (success: ResponseArgs) => {
  success.res.status(success.code).json({
    success: success.success || false,
    message: success.message || "",
    data: success.data || null,
  });
};
