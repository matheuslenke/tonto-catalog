import * as fs from "node:fs";
import { join } from "path";
import { execPromise } from "./main";
import { extractNumberFromText } from "./src/utils/extractNumberFromText.js";

// Recursive function to navigate through directories and run the command
export const navigateAndRunCommand = async (dir: string): Promise<void> => {
    try {
        const files = fs.readdirSync(dir, {
            recursive: false,
        });

        for (const file of files as string[]) {
            const ontologyPath = join(dir, file);
            // Run the command in the current directory
            const response = await execPromise(
                "tonto-cli import ontology.json -d tonto-model",
                ontologyPath
            );
            console.log(response);
            extractNumberFromText(response, /- Number of elements in Project: (\d+)/);
        }
    } catch (error) {
        console.error(`Error processing directory ${dir}: ${error}`);
    }
};
