import { Router } from "express";
import { body } from "express-validator";
import upload from "../middlewares/multer.middleware.js";
import { verifyUserJWT } from "../middlewares/user.auth.middleware.js";
import {
    registerUser,
    loginUser,
    logoutUser,
    getUserProfile
} from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(
    upload.single("profile"),
    [
        body("email").isEmail().withMessage("Invalid Email"),
        body("fullName.firstName").isLength({ min: 3 }).withMessage("First name must be at least 3 characters long"),
        body("fullName.lastName").optional().isLength({ min: 3 }).withMessage("Last name must be at least 3 characters long"),
        body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
        body("phoneNumber").isLength({ min: 10 }).withMessage("Phone number must be at least 10 characters long"),
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
    getUserProfile
)

export default router;