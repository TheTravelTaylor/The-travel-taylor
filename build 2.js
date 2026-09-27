const fs = require('fs');
const path = require('path');

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, file), 'utf8'));
}

const site = readJson('homepage.page');
const sections = {
  stay: readJson('stay.page'),
  eat: readJson('eat.page'),
  cruise: readJson('cruise.page'),
  about: readJson('about.page')
};

const articles = fs.readdirSync(__dirname)
  .filter(file => file.endsWith('.article'))
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

const output = { site, sections, articles };
fs.writeFileSync(
  path.join(__dirname, 'content.json'),
  JSON.stringify(output, null, 2) + '\n'
);
console.log(`Built content.json with ${articles.length} articles.`);
