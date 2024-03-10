import { exec } from "child_process";
import * as fs from "node:fs";
import { join } from "path";

// Function to execute a shell command and return its output as a promise
const execPromise = (cmd: string, cwd: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    console.log(`Running command in: ${cwd}`);
    exec(cmd, { cwd }, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      if (stderr) {
        reject(stderr);
        return;
      }
      resolve(stdout);
    });
  });
};

// Recursive function to navigate through directories and run the command
const navigateAndRunCommand = async (dir: string): Promise<void> => {
  try {
    const files = fs.readdirSync(dir, {
      recursive: false,
    });

    for (const file of files as string[]) {
      const ontologyPath = join(dir, file);
      // Run the command in the current directory
      await execPromise(
        "tonto-cli import ontology.json -d tonto-model",
        ontologyPath
      );
    }
  } catch (error) {
    console.error(`Error processing directory ${dir}: ${error}`);
  }
};

// Example usage: replace 'yourFolderPath' with the path of your selected folder
navigateAndRunCommand("./models").then(() => console.log("Done!"));
