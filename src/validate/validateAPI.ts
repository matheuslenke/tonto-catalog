import * as fs from "node:fs";
import path, { join } from "node:path";
import { createAndWriteFile } from "../utils/createAndWriteFile.js";
import { execPromise } from "../utils/execPromise.js";
import { extractNumberFromText } from "../utils/extractNumberFromText.js";

export interface ValidationResult {
    totalModels: number;
    correctModels: number;
}

export interface RunOpts {
    dir: string;
    outDir: string;
}

export interface RunCommandOpts extends RunOpts {
    command: string;
}

export interface ModelResult {
    modelName: string
    totalErrors: number
}

// Recursive function to navigate through directories and run the command
export const navigateAndRunCommand = async (opts: RunCommandOpts): Promise<ValidationResult | undefined> => {
    let correctModels = 0
    let totalModels = 0
    try {
        const files = fs.readdirSync(opts.dir, {
            recursive: false,
        }).filter(item => item !== "./models");

        const results: ModelResult[] = []

        for (const file of files as string[]) {
            if (file === "mgic-antt2011") {
                continue
            }
            try {
                totalModels += 1;
                const ontologyPath = join(opts.dir, file);
                // Run the command in the current directory
                const response = await execPromise(
                    opts.command,
                    ontologyPath
                );
                // Add Result to Final Array
                const totalErrors = extractNumberFromText(response)
                const result = {
                    modelName: file,
                    totalErrors: totalErrors
                } as ModelResult
                results.push(result)

                // Compare if it is correct

                if (totalErrors === 0) {
                    correctModels += 1
                }
                const finalFile = path.join(opts.outDir, `${file}.txt`)
                createAndWriteFile(finalFile, response)
            }
            catch (error) {
                console.log(error)
                continue;
            }
        }

        const finalString = `

        // These results are using Tonto Project with ontouml-js API to validate
        ${results.reduce((previous, item) => previous + `${item.modelName}: ${item.totalErrors}\n`, "")}
        `
        createAndWriteFile(path.join(opts.outDir, "finalResults.txt"), finalString)

        return {
            totalModels,
            correctModels
        } as ValidationResult
    } catch (error) {
        console.error(`Error processing directory ${opts.dir}: ${error}`);
    }
    return undefined
};