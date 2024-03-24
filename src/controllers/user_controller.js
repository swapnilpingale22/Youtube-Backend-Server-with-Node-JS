import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/user_model.js";
import uploadOnCloud from "../utils/cloudinary.js";
import bcryptjs from "bcryptjs";
import { ApiResponse } from "../utils/api_response.js";

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullname, password } = req.body;
  //check if any value is empty
  if (
    [username, email, fullname, password].some((field) => field?.trim() === "")
  ) {
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
    return res.status(400).json({
      Error: "User with this username or email already exists.",
    });
  }

  // const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  // check if avatar and cover image is not empty
  let avatarLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.avatar) &&
    req.files.avatar.length > 0
  ) {
    avatarLocalPath = req.files.avatar[0].path;
  }

  let coverImageLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
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
    return res.status(500).json({
      Error: "Something went wrong while registering user",
    });
  }

  console.log(createdUser);

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User created successfully"));
});

export { registerUser };
