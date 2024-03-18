import { spawn } from "child_process";
import * as fs from "node:fs";
import path, { dirname, join } from "path";
import { validateCommandLocal } from "tonto-cli";

// Function to execute a shell command and return its output as a promise
const execPromise = (cmd: string, cwd: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Example: Using the full path to the command
      const fullPathToCommand = 'tonto-cli';
      const args = ['validate', './tonto-model', '--local'];
      const child = spawn(fullPathToCommand, args, {
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

interface ValidationResult {
  totalModels: number;
  correctModels: number;
}

async function createAndWriteFile(filePath: string, content: string): Promise<void> {
  try {
    fs.mkdirSync(dirname(filePath), { recursive: true }); // Ensure the directory exists
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`File was created and written successfully at ${filePath}`);
  } catch (error) {
    console.error('Error creating or writing file:', error);
  }
}

interface RunCommandOpts {
  dir: string;
  command: string;
  outDir: string;
}

function extractNumberFromText(text: string): number | null {
  // Define the regular expression pattern
  const regex = /Total of errors: (\d+)/;

  // Attempt to match the pattern in the given text
  const matches = text.match(regex);

  // If matches are found, the first group (\d+) represents the number
  if (matches && matches[1]) {
    // Convert the matched number string to an actual number and return it
    return parseInt(matches[1], 10);
  }

  // If no matches are found, return null
  return null;
}


// Recursive function to navigate through directories and run the command
const navigateAndRunCommand = async (opts: RunCommandOpts): Promise<ValidationResult | undefined> => {
  let correctModels = 0
  let totalModels = 0
  try {
    const files = fs.readdirSync(opts.dir, {
      recursive: false,
    }).filter(item => item !== "./models");

    const results: ModelResult[] = []

    for (const file of files as string[]) {
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
};

interface ModelResult {
  modelName: string
  totalErrors: number
}

const navigateAndRunCommandFromCLI = async (opts: RunCommandOpts): Promise<ValidationResult | undefined> => {
  let correctModels = 0
  let totalModels = 0
  try {
    const files = fs.readdirSync(opts.dir, {
      recursive: false,
    }).filter(item => item !== "./models");

    const results: ModelResult[] = []

    for (const file of files as string[]) {
      try {
        totalModels += 1;
        const ontologyPath = join(opts.dir, file);
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

        createAndWriteFile(finalFile, `${response.length}`)
      }
      catch (error) {
        console.log(error)
        continue;
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

try {
  const result = await navigateAndRunCommand({
    dir: "./models",
    command: "tonto-cli validate ./tonto-model",
    outDir: "./results-api"
  });
  if (result)
    console.log(`Total of ${result.totalModels} models with ${result.correctModels} correct`)
} catch (err) {
  console.log(err)
}

