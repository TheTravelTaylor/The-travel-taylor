
async function load(){
  const res = await fetch('content.json',{cache:'no-store'});
  const data = await res.json();
  window.DATA=data;
  render();
}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function hero(kicker,headline,intro,bodyClass=''){
  return `<section class="hero"><div class="kicker">${esc(kicker)}</div><h1>${esc(headline)}</h1><p class="${bodyClass}">${esc(intro)}</p><div class="rule"></div></section>`;
}
function card(a){
  return `<article class="card">
    ${a.hero?`<img src="${esc(a.hero)}" alt="" class="card-img">`:`<div class="image-placeholder">PHOTO TO MIGRATE</div>`}
    <div class="card-meta"><span>${esc(a.location)}</span><span>${esc(a.scoreLabel||'THE TAYLOR SCALE')}</span></div>
    <h2>${esc(a.title)}</h2>
    <p>${esc(a.summary)}</p>
    <a class="read-link" href="?article=${encodeURIComponent(a.slug)}">${a.section==='cruise'?'READ THE STORY':'READ THE REVIEW'} ↗</a>
  </article>`;
}
function renderHome(d){
  const featured=d.articles.slice(0,4).map(card).join('');
  return hero(d.site.homeKicker,d.site.homeHeadline,d.site.homeIntro)+`<section class="list">${featured}</section>`;
}
function renderSection(d,key){
  if(key==='about'){
    const s=d.sections.about;
    return `<section class="hero"><div class="kicker">${esc(s.label)}</div><h1>${esc(s.headline)}</h1><p class="about-copy">${esc(s.body)}</p></section>`;
  }
  const s=d.sections[key];
  const cards=d.articles.filter(a=>a.section===key).map(card).join('');
  return hero(s.label,s.headline,s.intro)+`<section class="list">${cards}</section>`;
}
function renderArticle(d,slug){
  const a=d.articles.find(x=>x.slug===slug);
  if(!a) return `<section class="hero"><h1>Not found.</h1></section>`;
  const body=(a.body||[]).map(b=>b.type==='heading'?`<h2>${esc(b.text)}</h2>`:`<p>${esc(b.text)}</p>`).join('');
  const scores=(a.scores||[]).map(s=>`<div class="score-row"><div><div class="score-name">${esc(s[0])}</div><div class="score-number">${esc(s[1])}/10</div></div><div class="score-note">${esc(s[2])}</div></div>`).join('');
  return `<article class="article">
    <div class="article-location">${esc(a.location)}</div>
    <h1 class="article-title">${esc(a.title)}</h1>
    <p class="article-lead">${esc(a.summary)}</p>
    <div class="article-body">${body || '<p>Full review copy will be migrated next.</p>'}</div>
    ${scores?`<section class="score-block"><div class="score-title">THE TRAVEL TAYLOR SCORE</div>${scores}
      <div class="overall"><div class="score-title">OVERALL TRAVEL TAYLOR SCORE</div><p class="about-copy">${esc(a.overall||'')}</p><div class="number">${esc(a.score)}/10</div></div>
      <h2>WOULD I GO BACK?</h2><p class="about-copy">${esc(a.wouldGoBack||'')}</p></section>`:''}
    <a class="read-link" href="?view=${encodeURIComponent(a.section)}">MORE ${a.section==='eat'?'TABLES WORTH TRAVELLING FOR':a.section.toUpperCase()} →</a>
  </article>`;
}
function render(){
  const d=window.DATA;
  const q=new URLSearchParams(location.search);
  const article=q.get('article');
  const view=q.get('view');
  document.querySelector('#app').innerHTML = article ? renderArticle(d,article) : (view ? renderSection(d,view) : renderHome(d));
  window.scrollTo(0,0);
}
load();
