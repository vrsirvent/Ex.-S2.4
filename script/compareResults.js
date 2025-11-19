import fs from 'fs';
import Logger from 'js-logger';

Logger.useDefaults();

const normalizeJson = (jsonString) => {
  try {
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed, Object.keys(parsed).sort());
  } catch (e) {
    Logger.error(`Error normalizing JSON: ${jsonString}`);
    return jsonString;
  }
};

const compareJsonArrays = (arr1, arr2) => {
  if (arr1.length !== arr2.length) {
    return { match: false, mismatch: `🔢 Different result lengths: \n- **Expected:** ${arr2.length}\n- **Got:** ${arr1.length}\n` };
  }

  for (let i = 0; i < arr1.length; i++) {
    const normalized1 = normalizeJson(arr1[i]);
    const normalized2 = normalizeJson(arr2[i]);
    if (normalized1 !== normalized2) {
      return {
        match: false,
        mismatch: `🧩 Mismatch at position ${i}:\n- **Expected:** ${normalized2}\n- **Actual:** ${normalized1}\n`
      };
    }
  }

  return { match: true };
};

const parseQueriesFromLines = (lines) => {
  const queries = {};
  let currentQuery = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') && !trimmed.startsWith('//EOQ')) {
      currentQuery = parseInt(trimmed.replace('//', ''), 10);
      queries[currentQuery] = [];
    } else if (trimmed === '//EOQ') {
      currentQuery = null;
    } else if (currentQuery !== null && trimmed !== '') {
      queries[currentQuery].push(trimmed);
    }
  }

  return queries;
};

const fileContentExpected = fs.readFileSync('./result/expected.json', 'utf-8');
const fileContentResult = fs.readFileSync('./result/myResult.json', 'utf-8');

const queriesExpected = parseQueriesFromLines(fileContentExpected.split('\n'));
const queriesResult = parseQueriesFromLines(fileContentResult.split('\n'));

const mdFile = 'docs/resultReport.md';

function logToMarkdown(numberQuery, ok = true) {
  const mdMsg = ok
    ? `---\n- ✔️ OK - Query **[ ${numberQuery} ]**\n`
    : `---\n- ❌ MISMATCH - Query **[ ${numberQuery} ]** Result does not match expected output.\n`;
  fs.appendFileSync(mdFile, mdMsg + `\n`);
}

if (fs.existsSync(mdFile)) {
  fs.unlinkSync(mdFile); 
}
fs.appendFileSync(mdFile, `# 📊 Query Expected Result Report\n\n`);

for (const numberQuery of Object.keys(queriesResult).map(Number).sort((a, b) => a - b)) {
  const resultQuery = queriesResult[numberQuery];
  const expectedQuery = queriesExpected[numberQuery] || [];

  try {
    const comparison = compareJsonArrays(resultQuery, expectedQuery);
    if (comparison.match) {
      Logger.info(`---\n✔️ OK - Query [ ${numberQuery} ]\nThe query returned the expected results.\n`);
      logToMarkdown(numberQuery, true);
    } else {
      Logger.error(`---\n❌ MISMATCH - Query [ ${numberQuery} ]\nResult does not match expected output.\n`);
      Logger.error(comparison.mismatch); // Aquí se muestra justo después
      logToMarkdown(numberQuery, false);
      fs.appendFileSync(mdFile, `\n${comparison.mismatch}\n`);
    }
  } catch (e) {
    Logger.error(`❌ ERROR processing Query [ ${numberQuery} ]: ${e.message}`);
    fs.appendFileSync(mdFile, `- ❌ ERROR - Query **[ ${numberQuery} ]** Error processing results.\n---\n`);
  }
}