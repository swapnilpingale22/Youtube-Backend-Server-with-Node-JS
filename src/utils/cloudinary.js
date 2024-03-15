import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECET,
});

uploadOnCloud = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    //upload the file
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: "Youtube DB Images",
    });
    //file uploaded
    console.log("file uploaded on cloud", response.secure_url);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); //to remove local file on server
    return null;
  }
};

export default uploadOnCloud;
