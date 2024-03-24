export function extractNumberFromText(text: string, regex: RegExp): number | null {
    // Define the regular expression pattern

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