import { navigateAndRunCommandFromCLI } from "./src/validate/validateLocal.js";

/**
 * Validation with Tonto API using Tonto Project itself
 */
// try {
//     const result = await navigateAndRunCommand({
//         dir: "./models",
//         command: "tonto-cli validate ./tonto-model",
//         outDir: "./results-api"
//     });
//     if (result)
//         console.log(`Total of ${result.totalModels} models with ${result.correctModels} correct`)
// } catch (err) {
//     console.log(err)
// }
/**
 * Validation using Tonto local validators
 */
try {
    const result = await navigateAndRunCommandFromCLI({
        dir: "./models",
        command: "tonto-cli validate ./tonto-model --local",
        outDir: "./results-local"
    });
    if (result)
        console.log(`Total of ${result.totalModels} models with ${result.correctModels} correct`)
} catch (err) {
    console.log(err)
}

/**
 * Validation using ontouml-server API and ontology.json file
 */
// try {
//     const result = await navigateAndRunCommandFromJSON({
//         dir: "./models",
//         outDir: "./results-json"
//     });
//     if (result)
//         console.log(`Total of ${result.totalModels} models with ${result.correctModels} correct`)
// } catch (err) {
//     console.log(err)
// }

