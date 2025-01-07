import { Router } from "express";
import { body } from "express-validator";
import upload from "../middlewares/multer.middleware.js";
import { verifyCaptainJWT } from "../middlewares/captain.auth.middleware.js";
import {
    registerCaptain,
    loginCaptain,
    logoutCaptain,
    getCaptainProfile,
} from "../controllers/captain.controller.js";

const router = Router();

router.route("/register").post(
    upload.single("profile"),
    [
        body("email").isEmail().withMessage("Invalid Email"),
        body("fullName.firstName").isLength({ min: 3 }).withMessage("First name must be at least 3 characters long"),
        body("fullName.lastName").optional().isLength({ min: 3 }).withMessage("First name must be at least 3 characters long"),
        body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
        body("phoneNumber").isLength({ min: 10 }).withMessage("Phone number must be at least 10 characters long"),
        body("vehicle.color").isLength({ min: 3 }).withMessage("Color must be at least 3 characters long"),
        body("vehicle.plate").isLength({ min: 3 }).withMessage("Plate must be at least 3 characters long"),
        body("vehicle.capacity").isLength({ min: 1 }).withMessage("Capacity must be at least 1"),
        body("vehicle.vehicleType").isIn([ "car", "motorcycle", "rikshaw" ]).withMessage("Invalid vehicle"),
    ],
    registerCaptain
);

router.route("/login").post(
    [
        body("email").isEmail().withMessage("Invalid Email"),
        body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    ],
    loginCaptain
);

router.route("/logout").get(
    verifyCaptainJWT,
    logoutCaptain
);

router.route("/profile").get(
    verifyCaptainJWT,
    getCaptainProfile
);

export default router;