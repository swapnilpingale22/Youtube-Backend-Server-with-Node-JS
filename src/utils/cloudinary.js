import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const uploadOnCloud = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    //upload the file
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: "Youtube DB Images",
    });
    //file uploaded
    // console.log("file uploaded on cloud", response.secure_url);
    fs.unlinkSync(localFilePath); //to remove local file on server
    return response;
  } catch (error) {
    console.log("Cloudinary Error: ", error);
    fs.unlinkSync(localFilePath); //to remove local file on server
    return null;
  }
};

export default uploadOnCloud;
