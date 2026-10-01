const fs = require('fs');
const path = require('path');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function buildImagesFromBase64() {
  const dataDir = path.join(__dirname, 'image-data');
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(dataDir)) return;

  fs.mkdirSync(uploadsDir, { recursive: true });
  const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.txt'));
  const groups = new Map();

  for (const file of files) {
    const match = file.match(/^(.*\.(?:jpg|jpeg|png))\.part(\d+)\.txt$/i);
    if (!match) continue;
    const [, outName, part] = match;
    if (!groups.has(outName)) groups.set(outName, []);
    groups.get(outName).push({ part: Number(part), file });
  }

  for (const [outName, parts] of groups) {
    parts.sort((a, b) => a.part - b.part);
    const b64 = parts
      .map(p => fs.readFileSync(path.join(dataDir, p.file), 'utf8').trim())
      .join('');
    fs.writeFileSync(path.join(uploadsDir, outName), Buffer.from(b64, 'base64'));
    console.log(`Built image ${outName} from ${parts.length} chunks.`);
  }
}

function collectJsonFiles(dirName) {
  const dir = path.join(__dirname, dirName);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(file => file.endsWith('.json'))
    .map(file => path.join(dir, file));
}

function collectReviewFiles() {
  const rootFiles = fs.readdirSync(__dirname)
    .filter(file => file.endsWith('.article'))
    .map(file => path.join(__dirname, file));

  return [
    ...rootFiles,
    ...collectJsonFiles('reviews'),
    ...collectJsonFiles('safari')
  ];
}

buildImagesFromBase64();

const site = readJson(path.join(__dirname, 'homepage.page'));
const sections = {
  stay: readJson(path.join(__dirname, 'stay.page')),
  eat: readJson(path.join(__dirname, 'eat.page')),
  safari: readJson(path.join(__dirname, 'safari.page')),
  cruise: readJson(path.join(__dirname, 'cruise.page')),
  about: readJson(path.join(__dirname, 'about.page'))
};

const articles = collectReviewFiles()
  .map(file => readJson(file))
  .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
  .map(article => {
    const clean = { ...article };
    delete clean.order;
    clean.scores = (clean.scores || []).map(s =>
      Array.isArray(s) ? s.slice(0, 3) : [s.category, s.score, s.comment]
    );
    return clean;
  });

fs.writeFileSync(
  path.join(__dirname, 'content.json'),
  JSON.stringify({ site, sections, articles }, null, 2) + '\n'
);

console.log(`Built content.json with ${articles.length} articles.`);
