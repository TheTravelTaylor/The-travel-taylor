const fs = require('fs');
const path = require('path');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function collectReviewFiles() {
  const rootFiles = fs.readdirSync(__dirname)
    .filter(file => file.endsWith('.article'))
    .map(file => path.join(__dirname, file));

  const reviewsDir = path.join(__dirname, 'reviews');
  let newFiles = [];
  if (fs.existsSync(reviewsDir)) {
    newFiles = fs.readdirSync(reviewsDir)
      .filter(file => file.endsWith('.json'))
      .map(file => path.join(reviewsDir, file));
  }
  return [...rootFiles, ...newFiles];
}

const site = readJson(path.join(__dirname, 'homepage.page'));
const sections = {
  stay: readJson(path.join(__dirname, 'stay.page')),
  eat: readJson(path.join(__dirname, 'eat.page')),
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
