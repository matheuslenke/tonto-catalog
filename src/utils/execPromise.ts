import { spawn } from "node:child_process";

// Function to execute a shell command and return its output as a promise
export const execPromise = (cmd: string, args: string, cwd: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        try {
            const child = spawn(cmd, args.split(" "), {
                cwd
            })

            let validationString = ""

            child.stdout.on('data', (data) => {
                validationString += data
            });

            child.stderr.on('data', (data) => {
            });

            child.on('close', (code) => {
                if (code !== 0) {
                    reject()
                }
                resolve(validationString)
            });

            child.on('error', (error) => {
                console.error(`[Error]: ${error}`);
                reject()
            });
        } catch (error) {
            console.log(error)
            reject()
        }
        console.log(`Running command in: ${cwd}`);
    });
};