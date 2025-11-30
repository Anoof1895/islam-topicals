// generatePredictedQuestionsData.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const folderPath = path.join(__dirname, 'public', 'predicted');
const files = fs.existsSync(folderPath) ? fs.readdirSync(folderPath) : [];
const questions = [];

function getAnswerImage(fileName) {
  const ext = path.extname(fileName);
  const base = path.basename(fileName, ext);
  if (base.endsWith('-ms')) return `/predicted/${fileName}`;
  const answerFile = `${base}-ms${ext}`;
  return files.includes(answerFile) ? `/predicted/${answerFile}` : null;
}

console.log('Processing files in predicted folder:');
files.forEach((file, index) => {
  if (!file.endsWith('.png')) return;

  const ext = path.extname(file);
  const base = path.basename(file, ext);
  if (base.endsWith('-ms')) return;

  console.log(`Processing: ${file}`);

  // NEW: Extract the actual book number from the original format (after the dot)
  // Example: "1.9-4-1-5" -> we want book=9, not book=1
  const parts = base.split('.');
  
  if (parts.length >= 2) {
    // The actual data is in the part after the dot
    const dataPart = parts[1]; // This gives us "9-4-1-5"
    const dataParts = dataPart.split('-');
    
    if (dataParts.length >= 4) {
      const [book, unit, topic, type] = dataParts;
      
      const question = {
        id: 1000 + index + 1,
        name: `predicted-${base}`,
        book: parseInt(book),
        year: 2025,
        paperSet: 3,
        paper: 1,
        unit: parseInt(unit),
        topic: topic,
        questionNumber: "1",
        types: [parseInt(type)],
        image: `/predicted/${file}`,
        answerImage: getAnswerImage(file),
        isPredicted: true
      };

      if (!isNaN(question.book) && !isNaN(question.unit)) {
        questions.push(question);
        console.log(`  ✓ Book ${question.book}, Unit ${question.unit}, Topic ${question.topic}, Type ${question.types[0]}`);
        console.log(`    File: ${file} → Book ${book}, Unit ${unit}, Topic ${topic}, Type ${type}`);
      } else {
        console.log(`  ✗ Skipped - invalid numbers in: ${file}`);
      }
    } else {
      console.log(`  ✗ Skipped - not enough data parts: ${dataPart}`);
    }
  } else {
    console.log(`  ✗ Skipped - no dot separator found: ${base}`);
  }
});

// Write to file
const output = `const predictedQuestions = ${JSON.stringify(questions, null, 2)};\n\nexport default predictedQuestions;\n`;
fs.writeFileSync(path.join(__dirname, 'src', 'predictedQuestionsData.js'), output);

console.log(`\n✅ Generated ${questions.length} predicted questions!`);