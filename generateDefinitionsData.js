// generateDefinitionsData.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read from both folders
const lughaveePath = path.join(__dirname, 'public', 'definitions', 'lughavee');
const isthilaaheePath = path.join(__dirname, 'public', 'definitions', 'isthilaahee');

const definitions = [];

function processFolder(folderPath, type) {
  if (!fs.existsSync(folderPath)) {
    console.log(`⚠️  Folder not found: ${folderPath}`);
    return;
  }

  const files = fs.readdirSync(folderPath);
  
  console.log(`\nProcessing ${type} definitions from: ${folderPath}`);
  
  files.forEach((file, index) => {
    if (!file.endsWith('.png') && !file.endsWith('.jpg')) return;

    const ext = path.extname(file);
    const base = path.basename(file, ext);
    
    console.log(`Processing: ${file}`);

    // Extract name, book, unit from format: "Vari-9-3"
    const parts = base.split('-');
    
    if (parts.length >= 3) {
      const [name, book, unit] = parts;
      
      const definition = {
        id: (type === 'lughavee' ? 2000 : 3000) + index + 1, // Different ID ranges for each type
        name: name,
        book: parseInt(book),
        unit: parseInt(unit),
        type: type,
        image: `/definitions/${type}/${file}`,
        // No answerImage needed for definitions
        isDefinition: true,
        // For filtering compatibility
        year: 2025,
        paper: 1,
        topic: 0,
        questionNumber: "1",
        types: [1] // Type 1 = Thaaraf for definitions
      };

      if (!isNaN(definition.book) && !isNaN(definition.unit)) {
        definitions.push(definition);
        console.log(`  ✓ ${name} - ${type} - Book ${book}, Unit ${unit}`);
      } else {
        console.log(`  ✗ Skipped - invalid numbers in: ${file}`);
      }
    } else {
      console.log(`  ✗ Skipped - incorrect format. Expected: Name-Book-Unit: ${base}`);
    }
  });
}

// Process both folders
processFolder(lughaveePath, 'lughavee');
processFolder(isthilaaheePath, 'isthilaahee');

// Sort by type, then book, then unit, then name
definitions.sort((a, b) => {
  if (a.type !== b.type) return a.type.localeCompare(b.type);
  if (a.book !== b.book) return a.book - b.book;
  if (a.unit !== b.unit) return a.unit - b.unit;
  return a.name.localeCompare(b.name);
});

// Write to file
const output = `const definitionsData = ${JSON.stringify(definitions, null, 2)};\n\nexport default definitionsData;\n`;
fs.writeFileSync(path.join(__dirname, 'src', 'definitionsData.js'), output);

console.log(`\n✅ Generated ${definitions.length} total definitions!`);
console.log(`   - Lughavee: ${definitions.filter(d => d.type === 'lughavee').length}`);
console.log(`   - Isthilaahee: ${definitions.filter(d => d.type === 'isthilaahee').length}`);