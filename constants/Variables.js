import * as FileSystem from "expo-file-system";

const imageDirectory = FileSystem.documentDirectory + "assets";

export default {
  productImageDirectory: imageDirectory,
  directory: async function (directoryPath) {
    try {
      let fileInfo = await FileSystem.getInfoAsync(directoryPath);
      if (!fileInfo.exists) {
        await FileSystem.makeDirectoryAsync(directoryPath, {
          intermediates: true,
        });
        console.log("Directory created!!");
        return directoryPath;
      } else {
        console.log("Directory already exists!");
        return true;
      }
    } catch (error) {
      console.error("Error ensuring directory exists: ", error);
    }
  },
  saveImage: async function (uri) {
    if (uri == null) return null;
    let fileExtension = uri.slice(((uri.lastIndexOf(".") - 1) >>> 0) + 2);
    let fileName = String(Date.now());
    let newPath = `${imageDirectory}/${fileName}.${fileExtension}`;
    try {
      await FileSystem.copyAsync({
        from: uri,
        to: newPath,
      });
      console.log("Image saved to assets folder!: " + newPath);
      return newPath;
    } catch (error) {
      console.error("Error saving image: ", error);
    }
  },

  deleteDirectory: async function () {
    try {
      await FileSystem.deleteAsync(imageDirectory, { idempotent: true });
      console.log("Directory deleted successfully!");
    } catch (error) {
      console.error("Error deleting directory: ", error);
    }
  },
};
