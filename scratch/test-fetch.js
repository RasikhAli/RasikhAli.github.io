const sheetUrl = "https://docs.google.com/spreadsheets/d/15c2MNMjv95H0-_m5Q4zSGvfSIXL25CywZq71jEoqjcY/edit?usp=sharing";

function cleanGithubUrl(text) {
  if (!text) return { url: null, username: null };
  const match = text.match(/(https?:\/\/(www\.)?github\.com\/([a-zA-Z0-9-_]+))/i);
  if (match) {
    const username = match[3];
    return {
      url: `https://github.com/${username}`,
      username: username
    };
  }
  const wordMatch = text.trim().match(/^([a-zA-Z0-9-_]+)$/);
  if (wordMatch && !['yes', 'no', 'true', 'false', 'connected'].includes(wordMatch[1].toLowerCase())) {
    return {
      url: `https://github.com/${wordMatch[1]}`,
      username: wordMatch[1]
    };
  }
  return { url: null, username: null };
}

function parseCSV(csvText) {
  const result = [];
  let row = [];
  let curr = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          curr += '"';
          i++; // Skip next quote
        } else {
          inQuotes = false;
        }
      } else {
        curr += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(curr.trim());
        curr = '';
      } else if (char === '\n' || char === '\r') {
        row.push(curr.trim());
        curr = '';
        if (row.length > 0 && (row.length > 1 || row[0] !== '')) {
          result.push(row);
        }
        row = [];
        if (char === '\r' && nextChar === '\n') {
          i++; // Skip \n in \r\n
        }
      } else {
        curr += char;
      }
    }
  }

  if (curr || row.length > 0) {
    row.push(curr.trim());
    result.push(row);
  }

  return result;
}

const sheetIdMatch = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
const sheetId = sheetIdMatch[1];
const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

fetch(csvUrl)
  .then(res => res.text())
  .then(text => {
    const rows = parseCSV(text);
    console.log("Headers:", rows[0]);
    const headers = rows[0].map(h => h.toLowerCase().trim());
    const idxName = headers.findIndex(h => h.includes('name'));
    const idxGithub = headers.findIndex(h => h.includes('github'));
    const idxLinkedin = headers.findIndex(h => h.includes('linkedin'));
    const idxProgram = headers.findIndex(h => h.includes('program'));
    const idxSession = headers.findIndex(h => h.includes('session'));
    const idxCourse = headers.findIndex(h => h.includes('course name'));
    
    console.log(`Indexes - Name: ${idxName}, Github: ${idxGithub}, Linkedin: ${idxLinkedin}, Program: ${idxProgram}, Session: ${idxSession}, Course: ${idxCourse}`);
    
    for (let i = 1; i < Math.min(rows.length, 10); i++) {
      const row = rows[i];
      console.log(`\nRow ${i}:`);
      console.log(`  Name: ${row[idxName]}`);
      console.log(`  Program: ${row[idxProgram]}`);
      console.log(`  Session: ${row[idxSession]}`);
      console.log(`  Course: ${row[idxCourse]}`);
      console.log(`  GitHub Input: "${row[idxGithub]}"`);
      console.log(`  GitHub Cleaned:`, cleanGithubUrl(row[idxGithub]));
      console.log(`  LinkedIn Input: "${row[idxLinkedin]}"`);
    }
  })
  .catch(err => console.error(err));
