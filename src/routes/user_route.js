import { Router } from "express";
import {
  registerUser,
  loginUser,
  logOutUser,
} from "../controllers/user_controller.js";
import { upload } from "../middlewares/multer.js";

const router = Router();

// register user
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

// log in user
router.route("/login").post(loginUser);

//log  out user
router.route("/logout").post(logOutUser);

export default router;
