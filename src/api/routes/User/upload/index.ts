import multer from "multer";

export const documentUpload = multer({
  storage: multer.memoryStorage(),
});

export const imageUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
      // upload only png and jpg format
      return cb(new Error("Please upload an Image. (png|jpg|jpeg)"));
    }
    cb(undefined, true);
  },
});
