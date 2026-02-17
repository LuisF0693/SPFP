import fs from 'fs';

console.log("Syncing IDE with Gemini...");

const filesAndDirs = [
  '.gemini/rules.md',
  '.gemini/rules/AIOS/agents',
  '.gemini/commands',
];

filesAndDirs.forEach(path => {
  if (fs.existsSync(path)) {
    console.log(`Found: ${path}`);
  } else {
    console.log(`Missing: ${path}`);
  }
});
