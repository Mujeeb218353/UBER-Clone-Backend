import express from "express";
import { body } from "express-validator";
import upload from "../middlewares/multer.middleware.js";
import { verifyUserJWT } from "../middlewares/user.auth.middleware.js";
import {
    registerUser,
    loginUser,
    logoutUser,
    userProfile
} from "../controllers/user.controller.js";

const router = express.Router();

router.route("/register").post(
    upload.single("profile"),
    [
        body("email").isEmail().withMessage("Invalid Email"),
        body("firstName").isLength({ min: 3 }).withMessage("First name must be at least 3 characters long"),
        body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    ],
    registerUser
)

router.route("/login").post(
    [
        body("email").isEmail().withMessage("Invalid Email"),
        body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    ],
    loginUser
);

router.route("/logout").get(
    verifyUserJWT,
    logoutUser
)

router.route("/profile").get(
    verifyUserJWT,
    userProfile
)

export default router;