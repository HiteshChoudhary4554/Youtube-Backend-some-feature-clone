import { v2 as cloudinary } from 'cloudinary';
import { apiError } from './apiError.js';

async function removeCloudImage(url) {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    if (!url) {
      throw new apiError(404, 'please give valid url');
    }

    // Step 1: "upload/" ke baad ka part nikalo
    const afterUpload = url.split('/upload/')[1];

    // Step 2: Version (v12345/) hatado
    const withoutVersion = afterUpload.substring(afterUpload.indexOf('/') + 1);

    // Step 3: Extension (.png, .jpg, .jpeg, .webp...) hatado
    const publicId = withoutVersion.substring(
      0,
      withoutVersion.lastIndexOf('.')
    );
    
    const result = await cloudinary.uploader.destroy(publicId);

    return result;
  } catch (error) {
    return false;
  }
}

export { removeCloudImage };
