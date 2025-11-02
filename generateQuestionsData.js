// generateQuestionsData.js
// Run this with: node generateQuestionsData.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// For __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Folder containing all question images
const folderPath = path.join(__dirname, 'public', 'questions');

// Get all files in folder
const files = fs.readdirSync(folderPath);

// Prepare question objects
const questions = [];

// Helper to get the answer image name from question image
function getAnswerImage(fileName) {
  const ext = path.extname(fileName);
  const base = path.basename(fileName, ext);
  if (base.endsWith('-ms')) return fileName; // already an answer
  const answerFile = `${base}-ms${ext}`;
  // Check if file exists
  return files.includes(answerFile) ? `/questions/${answerFile}` : null;
}

// Iterate over files
files.forEach((file, index) => {
  if (!file.endsWith('.jpg') && !file.endsWith('.png')) return; // only images

  const ext = path.extname(file);
  const base = path.basename(file, ext);

  // Skip answer images (-ms)
  if (base.endsWith('-ms')) return;

  // Split filename: <book>-<year>-<paperSet>-<paperNumber>-<unit>-<topic>-<questionNumber>-<type(s)>
  const parts = base.split('-');

  const typePart = parts.pop(); // last part: type(s)
  const questionNumber = parts.pop(); // second last part: question number (can be 17a)
  const [book, year, paperSet, paper, unit, topic] = parts.map(p => isNaN(p) ? p : Number(p));

  // Handle multiple types
  const types = typePart.split('_').map(t => Number(t));

  questions.push({
    id: index + 1,
    name: base,
    book,
    year,
    paperSet,
    paper,
    unit,
    topic,
    questionNumber,
    types,
    image: `/questions/${file}`,
    answerImage: getAnswerImage(file),
  });
});

// Write to src/questionsData.js
const output = `const allQuestions = ${JSON.stringify(questions, null, 2)};\n\nexport default allQuestions;\n`;
fs.writeFileSync(path.join(__dirname, 'src', 'questionsData.js'), output);

console.log('questionsData.js generated successfully!');
