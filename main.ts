import chalk from "chalk";
import { exec } from "child_process";
import * as fs from "node:fs";
import path, { join } from "path";
import { createAndWriteFile } from "./src/utils/createAndWriteFile.js";
import { extractNumberFromText } from "./src/utils/extractNumberFromText.js";

const willValidateLargeModel = false
const willGenerateAsync = false

// Function to execute a shell command and return its output as a promise
export const execPromise = (cmd: string, cwd: string): Promise<string> => {
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

interface Result {
    originalElements: number;
    createdElements: number;
    percentageDiff: number;
}
// Recursive function to navigate through directories and run the command
const navigateAndRunCommand = async (dir: string): Promise<void> => {
    try {
        const files = fs.readdirSync(dir, {
            recursive: false,
        });
        let results: Result[] = []
        for (const file of files as string[]) {
            if (file === "mgic-antt2011" && !willValidateLargeModel) {
                continue;
            }
            const ontologyPath = join(dir, file);
            // Run the command in the current directory
            const response = await execPromise(
                "tonto-cli import ontology.json -d tonto-model",
                ontologyPath
            );
            const originalNumberOfElements = extractNumberFromText(response, /- Number of elements in Project: (\d+)/);
            const createdElements = extractNumberFromText(response, /- Number of elements in Tonto: (\d+)/);
            const percentage: number = Number((100 - (createdElements ?? 0) / (originalNumberOfElements ?? 1) * 100).toFixed(2));
            if (originalNumberOfElements !== createdElements) {
                console.log(chalk.red.bold(`Created ${createdElements} elements from ${originalNumberOfElements} original amount. ${percentage}% difference.`))
            } else {
                console.log(chalk.green(`Created the same amount of elements than original project: ${originalNumberOfElements}`))
            }
            results.push({
                originalElements: originalNumberOfElements,
                createdElements: createdElements,
                percentageDiff: percentage
            } as Result)
        }
        /**
         * Write final results to file
         */
        const finalDir = path.join(path.dirname(dir), "creation-results.csv");
        const header = `Original Elements; Created Elements; Percentage difference;\n`
        const finalFileContent: string = results.reduce((previous, item) => {
            return previous + `${item.originalElements};${item.createdElements};${item.percentageDiff};\n`
        }, "")
        createAndWriteFile(finalDir, header.concat(finalFileContent))
    } catch (error) {
        console.error(`Error processing directory ${dir}: ${error}`);
    }
};

const navigateAndRunCommandPromises = async (dir: string): Promise<void> => {
    try {
        const files = fs.readdirSync(dir, {
            recursive: false,
        });
        const promises: Promise<string>[] = []

        for (const file of files as string[]) {
            if (file === "mgic-antt2011" && !willValidateLargeModel) {
                continue;
            }
            const ontologyPath = join(dir, file);
            // Run the command in the current directory
            promises.push(execPromise(
                "tonto-cli import ontology.json -d tonto-model",
                ontologyPath
            ));
        }

        await Promise.all(promises);
    } catch (error) {
        console.error(`Error processing directory ${dir}: ${error}`);
    }
}

if (willGenerateAsync) {
    navigateAndRunCommandPromises("./models").then(() => console.log(chalk.green("Done!")));
} else {
    navigateAndRunCommand("./models").then(() => console.log(chalk.green("Done!")));
}
