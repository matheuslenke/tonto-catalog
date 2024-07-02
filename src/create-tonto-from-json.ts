import chalk from "chalk";
import * as fs from "node:fs";
import { join } from "path";
import { execPromise } from "./utils/execPromise.js";
import { extractNumberFromText } from "./utils/extractNumberFromText.js";

const willValidateLargeModel = true

export interface Result {
    originalElements: number;
    createdElements: number;
    percentageDiff: number;
}

export const createTontoFromJson = async (dir: string, file: string): Promise<Result | undefined> => {
    if (file === "mgic-antt2011" && !willValidateLargeModel) {
        return;
    }
    const ontologyPath = join(dir, file);
    // Run the command in the current directory
    const response = await execPromise(
        "tonto-cli import ontology.json -d tonto-model",
        "",
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
    return {
        originalElements: originalNumberOfElements,
        createdElements: createdElements,
        percentageDiff: percentage
    } as Result
}

export const navigateAndRunCommandPromises = async (dir: string): Promise<void> => {
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
                "",
                ontologyPath
            ));
        }

        await Promise.all(promises);
    } catch (error) {
        console.error(`Error processing directory ${dir}: ${error}`);
    }
}