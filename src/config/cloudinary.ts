import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


/**
 * Delete an image from Cloudinary
 * @param publicId The public ID of the image to delete
 * @returns Promise with deletion result
 */
export const deleteImageFromCloudinary = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

/**
 * Extract public ID from Cloudinary URL
 * @param url The Cloudinary image URL
 * @returns The public ID
*/
export const getPublicIdFromUrl = (url: string): string => {
  const matches = url.match(/upload\/(?:v\d+\/)?([^\.]+)/);
  if (!matches || matches.length < 2) {
    throw new Error('Invalid Cloudinary URL');
  }
  return matches[1];
};


export default cloudinary;