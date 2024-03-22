import * as fs from "node:fs";
import { dirname } from "node:path";

export async function createAndWriteFile(filePath: string, content: string): Promise<void> {
    try {
        fs.mkdirSync(dirname(filePath), { recursive: true }); // Ensure the directory exists
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`File was created and written successfully at ${filePath}`);
    } catch (error) {
        console.error('Error creating or writing file:', error);
    }
}