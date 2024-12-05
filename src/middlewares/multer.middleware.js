import multer from "multer";
import path from "path";

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const dir = path.resolve("public/temp");
      cb(null, dir);
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg', 'image/webp', 'image/avif'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Only JPEG, PNG, JPG, WebP, AVIF and GIF images are allowed.'));
    }
    cb(null, true);
  },
});

export default upload;