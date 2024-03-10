import { promises as fs } from "fs";
import path from "path";

const cleanGeneratedFolders = async (
  dir: string,
  deleteName: string
): Promise<void> => {
  if (!dir) throw new Error("Folder path must be provided");
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const currentPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === deleteName) {
        await fs.rm(currentPath, { recursive: true, force: true });
        console.log(`Deleted: ${currentPath}`);
      } else {
        await cleanGeneratedFolders(currentPath, deleteName);
      }
    }
  }
};

const startPath = "./models";
const deleteName = "tonto-model"; // Change for the name that you defined

cleanGeneratedFolders(startPath, deleteName);
