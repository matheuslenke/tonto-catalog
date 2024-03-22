import * as fs from "node:fs";
import path, { join } from "node:path";
import { createAndWriteFile } from "../utils/createAndWriteFile.js";
import { delay } from "../utils/delay.js";
import { ModelResult, RunOpts, ValidationResult } from "./validateAPI.js";

interface ResultObject {
    code: string;
    title: string;
    description: string;
    severity: string;
}
interface ResultResponse {
    result: ResultObject[]
}
export const navigateAndRunCommandFromJSON = async (opts: RunOpts): Promise<ValidationResult | undefined> => {
    let correctModels = 0
    let totalModels = 0
    try {
        const files = fs.readdirSync(opts.dir, {
            recursive: false,
        }).filter(item => item !== "./models");

        const results: ModelResult[] = []

        for (const file of files as string[]) {
            try {
                if (file === "mgic-antt2011") {
                    continue
                }
                totalModels += 1;
                const ontologyPath = join(opts.dir, file);
                // Get JSON Data from ontology.json
                const jsonData = fs.readFileSync(path.join(ontologyPath, "ontology.json"), { encoding: "utf-8" })
                const jsonProject = JSON.parse(jsonData)
                const body = JSON.stringify({
                    project: jsonProject
                })

                const response = await fetch("http://localhost:80/v1/verify", {
                    headers: {
                        "content-type": "application/json"
                    },
                    body: body,
                    method: "post"
                })

                const jsonResult: ResultResponse = await JSON.parse(await response.text())
                const result = {
                    modelName: file,
                    totalErrors: jsonResult.result.length
                }
                results.push(result)
                if (jsonResult.result.length === 0) {
                    correctModels += 1
                }
                const finalFile = path.join(opts.outDir, `${file}.txt`)

                createAndWriteFile(finalFile, `Total Errors: ${jsonResult.result.length}\n ${formatApiResults(jsonResult)}`)
            }
            catch (error) {
                console.log(error)
                continue;
            } finally {
                delay(7000)
            }
        }

        // Final Results
        const finalString = results.reduce((previous, item) => previous + `${item.modelName}: ${item.totalErrors}\n`, "")
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

const formatApiResults = (results: ResultResponse): string => {
    return results.result.reduce((previous, item) => {
        return `${previous}\n[${item.severity}]: ${item.title}`
    }, "")
}