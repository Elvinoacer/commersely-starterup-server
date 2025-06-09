"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicIdFromUrl = exports.deleteImageFromCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
/**
 * Delete an image from Cloudinary
 * @param publicId The public ID of the image to delete
 * @returns Promise with deletion result
 */
const deleteImageFromCloudinary = (publicId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield cloudinary_1.v2.uploader.destroy(publicId);
        return result;
    }
    catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        throw error;
    }
});
exports.deleteImageFromCloudinary = deleteImageFromCloudinary;
/**
 * Extract public ID from Cloudinary URL
 * @param url The Cloudinary image URL
 * @returns The public ID
*/
const getPublicIdFromUrl = (url) => {
    const matches = url.match(/upload\/(?:v\d+\/)?([^\.]+)/);
    if (!matches || matches.length < 2) {
        throw new Error('Invalid Cloudinary URL');
    }
    return matches[1];
};
exports.getPublicIdFromUrl = getPublicIdFromUrl;
exports.default = cloudinary_1.v2;
