import chalk from "chalk";
import * as fs from "node:fs";
import path from "path";
import { Result, createTontoFromJson, navigateAndRunCommandPromises } from "./src/create-tonto-from-json.js";
import { createAndWriteFile } from "./src/utils/createAndWriteFile.js";
export { navigateAndTransform } from "./src/generate-gufo.js";


// Recursive function to navigate through directories and run the command
const navigateAndRunCommand = async (dir: string): Promise<void> => {
    try {
        const files = fs.readdirSync(dir, {
            recursive: false,
        });
        let results: Result[] = []
        for (const file of files as string[]) {
            const result = await createTontoFromJson(dir, file)
            if (result)
                results.push(result)
        }
        writeResultsToFile(dir, results)
    } catch (error) {
        console.error(`Error processing directory ${dir}: ${error}`);
    }
};

/**
 * Write final results to file
 */
const writeResultsToFile = (dir: string, results: Result[]): void => {
    const finalDir = path.join(path.dirname(dir), "creation-results.csv");
    const header = `Original Elements; Created Elements; Percentage difference;\n`
    const finalFileContent: string = results.reduce((previous, item) => {
        return previous + `${item.originalElements};${item.createdElements};${item.percentageDiff};\n`
    }, "")
    createAndWriteFile(finalDir, header.concat(finalFileContent))
}

const willGenerateAsync = false

if (willGenerateAsync) {
    navigateAndRunCommandPromises("./models").then(() => console.log(chalk.green("Done!")));
} else {
    navigateAndRunCommand("./models").then(() => console.log(chalk.green("Done!")));
}
