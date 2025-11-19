import fs from 'fs';

const inputFile = './query/queries.js';
const outputFile = './query/execute.js';

const input = fs.readFileSync(inputFile, 'utf8');
const lines = input.split('\n');


const formatedQueries = lines
  .map(line => line.trim())
  .filter(line => line.startsWith('db.restaurants.'))
  .map((query, index) => {
    // Buscar el comentario anterior que contiene el número de query
    const queryIndex = lines.indexOf(query);
    const commentLine = lines[queryIndex - 1].trim();
    
    // Extraer el número de query del comentario (ejemplo: "// 1. Mostrar...")
    const queryNumberMatch = commentLine.match(/^\/\/\s*(\d+)\./);
    const queryNumber = queryNumberMatch ? queryNumberMatch[1] : index + 1;
    
    const clean = query.replace(/;$/, '');
    return `print('//${queryNumber}');\n${clean}.sort({restaurant_id: 1 }).forEach(doc => print(JSON.stringify(doc)));\nprint('//EOQ');`;
  });

const finalOutput = formatedQueries.join('\n\n');

fs.writeFileSync(outputFile, finalOutput, 'utf8');

console.log(`Formatted file saved as "${outputFile}"`);