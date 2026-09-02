import imageKit from "../config/imagekit";

export const generateImageKitAuth = () => {
  return imageKit.helper.getAuthenticationParameters();
};