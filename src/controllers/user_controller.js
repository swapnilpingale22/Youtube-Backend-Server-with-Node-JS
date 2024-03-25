import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/user_model.js";
import uploadOnCloud from "../utils/cloudinary.js";
import bcryptjs from "bcryptjs";
import { ApiResponse } from "../utils/api_response.js";
import jwt from "jsonwebtoken";
import fs from "fs";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        username: user.username,
        fullname: user.fullname,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
      }
    );

    const refreshToken = jwt.sign(
      {
        _id: user._id,
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
      }
    );

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    return res.status(500).json({
      Error: `Error generating token: ${error}`,
    });
  }
};

const deleteTempImages = (req) => {
  // Delete temporary image files if they exist
  if (req.files) {
    if (Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
      const avatarLocalPath = req.files.avatar[0].path;
      fs.unlinkSync(avatarLocalPath);
    }
    if (
      Array.isArray(req.files.coverImage) &&
      req.files.coverImage.length > 0
    ) {
      const coverImageLocalPath = req.files.coverImage[0].path;
      fs.unlinkSync(coverImageLocalPath);
    }
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullname, password } = req.body;
  //check if any value is empty
  if (
    [username, email, fullname, password].some((field) => field?.trim() === "")
  ) {
    deleteTempImages(req);
    return res.status(400).json({
      Error: "All fields are required.",
    });
  }

  //check if a user is already registered
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  // console.log(existedUser);

  if (existedUser) {
    deleteTempImages(req);
    return res.status(400).json({
      Error: "User with this username or email already exists.",
    });
  }

  // const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  // check if avatar and cover image is not empty
  let avatarLocalPath;
  let coverImageLocalPath;

  if (req.files) {
    if (Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
      avatarLocalPath = req.files.avatar[0].path;
    }
    if (
      Array.isArray(req.files.coverImage) &&
      req.files.coverImage.length > 0
    ) {
      coverImageLocalPath = req.files.coverImage[0].path;
    }
  }
  // if (
  //   req.files &&
  //   Array.isArray(req.files.avatar) &&
  //   req.files.avatar.length > 0
  // ) {
  //   avatarLocalPath = req.files.avatar[0].path;
  // }

  // if (
  //   req.files &&
  //   Array.isArray(req.files.coverImage) &&
  //   req.files.coverImage.length > 0
  // ) {
  //   coverImageLocalPath = req.files.coverImage[0].path;
  // }

  if (!avatarLocalPath) {
    deleteTempImages(req);
    return res.status(400).json({
      Error: "Avatar file is required",
    });
  }

  const avatar = await uploadOnCloud(avatarLocalPath);
  const coverImage = await uploadOnCloud(coverImageLocalPath);

  if (!avatar) {
    return res.status(400).json({
      Error: "Avatar file could not be uploaded.",
    });
  }

  const hashedPassword = await bcryptjs.hash(password, 10);

  const user = await User.create({
    fullname,
    email,
    username,
    password: hashedPassword,
    avatar: avatar.secure_url,
    coverImage: coverImage ? coverImage.secure_url : "",
  });

  // console.log("User Created", user);

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    deleteTempImages(req);
    return res.status(500).json({
      Error: "Something went wrong while registering user",
    });
  }

  // console.log(createdUser);

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User created successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!(email || username)) {
    return res.status(400).json({
      Error: "Username or email is required.",
    });
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!existedUser) {
    return res.status(400).json({
      Error: "User does not exists.",
    });
  }

  const isPasswordValid = await bcryptjs.compare(
    password,
    existedUser.password
  );

  if (!isPasswordValid) {
    return res.status(401).json({
      Error: "Incorrect password.",
    });
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    existedUser._id
  );

  const loggedInUser = await User.findById(existedUser._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

export { registerUser, loginUser };
