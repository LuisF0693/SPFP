import fs from 'fs';

console.log("Validating Gemini Sync...");

const filesAndDirs = [
  '.gemini/rules.md',
  '.gemini/rules/AIOS/agents',
  '.gemini/commands',
];

let allFound = true;

filesAndDirs.forEach(path => {
  if (fs.existsSync(path)) {
    console.log(`Found: ${path}`);
  } else {
    console.error(`Missing: ${path}`);
    allFound = false;
  }
});

if (!allFound) {
  console.error("Gemini Sync validation failed!");
  process.exit(1);
}

console.log("Gemini Sync validation passed!");
