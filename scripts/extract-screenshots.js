const fs = require('fs');
const path = require('path');

const projectsPath = path.join(__dirname, '..', 'data', 'projects.json');
const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));

const outDir = path.join(__dirname, '..', 'public', 'images', 'projects');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

let extractedCount = 0;
let totalSavedBytes = 0;

projects.forEach(project => {
  if (Array.isArray(project.screenshots)) {
    project.screenshots = project.screenshots.map((s, idx) => {
      if (typeof s === 'string' && s.startsWith('data:image/')) {
        const match = s.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
        if (match) {
          let ext = match[1].toLowerCase();
          if (ext === 'jpeg') ext = 'jpg';
          const buffer = Buffer.from(match[2], 'base64');
          const filename = `${project.id}-${idx + 1}.${ext}`;
          const filePath = path.join(outDir, filename);
          fs.writeFileSync(filePath, buffer);
          extractedCount++;
          totalSavedBytes += buffer.length;
          return `/images/projects/${filename}`;
        }
      }
      return s;
    });
  }
});

fs.writeFileSync(projectsPath, JSON.stringify(projects, null, 2), 'utf8');

const newStats = fs.statSync(projectsPath);
console.log(JSON.stringify({
  extractedCount,
  totalSavedImagesMB: (totalSavedBytes / (1024 * 1024)).toFixed(2),
  newProjectsJsonSizeKB: (newStats.size / 1024).toFixed(2)
}, null, 2));
