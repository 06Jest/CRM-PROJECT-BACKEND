import imageKit from "../config/imagekit";

export const generateImageKitAuth = () => {
  return imageKit.helper.getAuthenticationParameters();
};

export const deleteImageKitFile = async (
  fileId: string
): Promise<void> => {
  await imageKit.files.delete(fileId);
};