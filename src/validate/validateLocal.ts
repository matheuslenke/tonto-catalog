import * as fs from "node:fs";
import path, { join } from "node:path";
import { validateCommandLocal } from "tonto-cli";
import { createAndWriteFile } from "../utils/createAndWriteFile.js";
import { ModelResult, RunCommandOpts, ValidationResult } from "./validateAPI.js";

export const navigateAndRunCommandFromCLI = async (opts: RunCommandOpts): Promise<ValidationResult | undefined> => {
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

                const tontoModelFiles = fs.readdirSync(path.join(ontologyPath, "tonto-model"))
                if (tontoModelFiles.length === 0) {
                    console.log("Empty model")
                }

                // Run the command in the current directory
                const response = await validateCommandLocal(ontologyPath)
                if (!response) {
                    continue
                }
                const result = {
                    modelName: file,
                    totalErrors: response.length
                } as ModelResult
                results.push(result)
                if (response.length === 0) {
                    correctModels += 1
                }
                const finalFile = path.join(opts.outDir, `${file}.txt`)

                const str = response.reduce((previous, item) => `${previous}\n${item.message}`, "")

                createAndWriteFile(finalFile, `${response.length}\n${str}`)
            }
            catch (error) {
                console.log(error)
                continue;
            }
        }

        // Final Results
        const finalString = `
        // These results are from Tonto local verification, without ontouml-js API and using Tonto Project
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
}