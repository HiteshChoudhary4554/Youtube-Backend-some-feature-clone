import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

const uploadOnCloudinary = async (localFilePath) => {
  try {

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    if (!localFilePath) return null;
    // upload file on cloudinary

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto',
    });

    // delete local file after successful upload
    fs.unlinkSync(localFilePath);

    // file has been uploaded successfull
    console.log('file is uploaded on cloudinary ', response.url);
    return response;
  } catch (error) {
    console.log('Cloudinary upload failed:', error.message);

    // ❗ Usually: do NOT delete local file on failure
    // but agar aapko forcefully delete karna ho:
    fs.unlinkSync(localFilePath);

    return null;
  }
};

export { uploadOnCloudinary };
