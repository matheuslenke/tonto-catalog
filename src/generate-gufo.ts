import chalk from "chalk";
import { exec } from "node:child_process";
import * as fs from "node:fs";
import { join } from "node:path";

const execPromise = (cmd: string, cwd: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        console.log(`Running command in: ${cwd}`);
        exec(cmd, { cwd }, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            if (stderr) {
                resolve(stderr)
                return;
            }
            resolve(stdout);
        });
    });
};

export const navigateAndTransform = async (dir: string): Promise<void> => {
    try {
        const files = fs.readdirSync(dir, {
            recursive: false,
        });
        let results: string[] = []
        for (const file of files as string[]) {
            const result = await createGufoFromTonto(dir, file)
            // if (result)
            //     results.push(result)
        }
        // writeResultsToFile(dir, results)
    } catch (error) {
        console.error(`Error processing directory ${dir}: ${error}`);
    }
};

async function createGufoFromTonto(dir: string, file: string): Promise<string> {
    const ontologyPath = join(dir, file, "tonto-model");
    // Run the command in the current directory
    await execPromise(
        "tonto-cli transform-local .",
        ontologyPath
    );
    return "response"
}

navigateAndTransform("./models").then(() => console.log(chalk.green("Done!")));