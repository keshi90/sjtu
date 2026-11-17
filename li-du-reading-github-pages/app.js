const { li, du, pairs } = window.poetryData;
const byId = id => document.getElementById(id);
const themes = [
  { name: '月', terms: ['月', '明月'], title: '月光落在哪里', scores: [7902, 8207],
    text: '从「秋月照白璧」读到「皓如山阴雪」，月光把山、水与雪的清亮带进同一幅夜景。另一组的「湖月照我影」紧接着「送我至剡溪」，月亮又像是梦中一路相送的同行者。' },
  { name: '山与云', terms: ['云', '山', '白云', '青山'], title: '游山的最后一眼', scores: [9282],
    text: '《游泰山六首》其六以「明晨坐相失，但见五云飞」收尾。「但见」写眼前所余，「飞」让收尾仍然有动势。可以从这里体会李白如何用一个字写出眼前景物的神气。' },
  { name: '酒与醉', terms: ['酒', '醉'], title: '醉中有谁相伴', scores: [7889, 8039],
    text: '「我醉君复乐」前有「曲尽河星稀」，后有「陶然共忘机」。从夜深曲尽读到一个「共」字，酒意落在宾主相得的时刻，透着一股自在。' },
  { name: '江与远行', terms: ['江', '黄河', '长江'], title: '送别诗里的万里长江', scores: [8656],
    text: '「长江万里情」前承「黄鹤西楼月」，后接「空忆武昌城」。「万里」把这一晚的景色拉向远处，也给「情」添上了距离。' },
];
const number = value => value.toLocaleString('zh-CN');
const line = (corpus, id, index) => corpus[id][1][index];
const featured = themes.map(theme => theme.scores.map(score =>
  pairs.find(pair => pair[4] === score && ({
    7902: '秋月照白璧，', 8207: '湖月照我影，', 9282: '但见五云飞。',
    7889: '我醉君复乐，', 8039: '且醉习家池，', 8656: '长江万里情。',
  })[score] === line(li, pair[0], pair[1]))
));
const notes = {
  7902: '左边接「皓如山阴雪」，右边承「夜深经战场」。沿着「照」字读下去，月光照见的是山水的清亮与战场留下的白骨。',
  8207: '「照我影」后是梦中远行，「照我膝」前是夜深静坐。两首诗用相近的句式写出了动与静。',
  9282: '「但见」接在泰山游历的结尾，「还见」承接昭陵的松柏路。两句都把视线收在飞云上。',
  7889: '李白接着写「陶然共忘机」，杜甫以「吾醉亦长歌」作结。两句分别把醉写进相伴与歌唱。',
  8039: '两句都把醉意写进「习池」这个地点。李白说「且醉」，杜甫说「日有」，读来一个落在当下，一个带出日常。',
  8656: '李白从「长江万里情」写到「空忆武昌城」，杜甫从「万里长江边」写到「邂逅一相遇」。',
};
let themeIndex = 0;
let page = 0;
let matches = [];
const pageSize = 8;
const entries = pairs.map(pair => {
  const [a, i, b, j] = pair;
  const left = line(li, a, i);
  const right = line(du, b, j);
  return { pair, left, right, searchable: [li[a][0], left, du[b][0], right].join(' ').toLowerCase() };
});

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function button(label, action, pressed) {
  const node = element('button', label);
  node.type = 'button';
  node.addEventListener('click', action);
  if (pressed !== undefined) node.setAttribute('aria-pressed', String(pressed));
  return node;
}

function poemCard(name, corpus, id, index) {
  const [title, lines] = corpus[id];
  const card = element('div', undefined, 'poem');
  card.append(element('p', name, 'author'), element('blockquote', lines[index]), element('p', '《' + title + '》', 'poem-title'));
  const context = element('details');
  context.append(element('summary', '展开原诗'));
  const body = element('div', undefined, 'poem-body');
  for (const [key, text] of Object.entries(lines)) {
    body.append(element('p', text, Number(key) === index ? 'current-line' : ''));
  }
  context.addEventListener('toggle', () => {
    if (context.open) {
      const selected = body.querySelector('.current-line');
      body.scrollTop = selected.offsetTop - body.clientHeight / 3;
    }
  });
  context.append(body);
  card.append(context);
  return card;
}

function showPair(pair, moveFocus = false) {
  const [a, i, b, j, score] = pair;
  for (const control of byId('featured').children) {
    control.setAttribute('aria-pressed', String(control.dataset.pair === pair.join(',')));
  }
  const spread = byId('spread');
  const poems = element('div', undefined, 'poems');
  poems.append(poemCard('李白', li, a, i), poemCard('杜甫', du, b, j));
  const caption = element('div', undefined, 'caption');
  const note = featured.some(group => group.includes(pair)) ? notes[score] : '';
  if (note) caption.append(element('p', note));
  caption.append(element('span', '相似度 ' + score, 'muted'));
  spread.replaceChildren(poems, caption);
  if (moveFocus) {
    spread.tabIndex = -1;
    spread.focus();
  }
}

function showTheme(index) {
  themeIndex = index;
  const theme = themes[index];
  for (const [position, control] of Array.from(byId('themes').children).entries()) {
    control.setAttribute('aria-pressed', String(position === index));
  }
  const [id, sentence] = featured[index][0];
  byId('essay-title').textContent = theme.title;
  byId('essay-line').textContent = line(li, id, sentence);
  byId('essay-source').textContent = '李白《' + li[id][0] + '》';
  byId('essay-text').textContent = theme.text;
  const scale = Math.max(...theme.terms.map(term => window.poetryData.counts[term]));
  byId('stats').replaceChildren(...theme.terms.map(term => {
    const count = window.poetryData.counts[term];
    const row = element('div', undefined, 'stat');
    const bar = element('span', undefined, 'bar');
    bar.setAttribute('aria-hidden', 'true');
    bar.style.setProperty('--share', 100 * count / scale + '%');
    row.append(element('span', term), bar, element('span', number(count) + ' 句'));
    return row;
  }));
  byId('reading-theme').textContent = '当前主题 · ' + theme.name;
  byId('featured').replaceChildren(...featured[index].map(pair => {
    const control = button(line(li, pair[0], pair[1]).replace(/[，。]$/, ''), () => showPair(pair), false);
    control.dataset.pair = pair.join(',');
    return control;
  }));
  showPair(featured[index][0]);
  filterResults();
}

function filterResults() {
  const query = byId('query').value.trim().toLowerCase();
  const all = byId('scope').value === 'all';
  const { terms } = themes[themeIndex];
  matches = entries.filter(({ left, right, searchable }) =>
    searchable.includes(query) &&
    (all || (terms.some(term => left.includes(term)) && terms.some(term => right.includes(term))))
  );
  page = 0;
  renderResults();
}

function renderResults() {
  const pages = Math.ceil(matches.length / pageSize);
  byId('results-count').textContent = matches.length
    ? number(matches.length) + ' 条配对 · 按相似度从高到低'
    : '没有找到配对。可以更换关键词，或把范围切换到全部配对。';
  byId('results').replaceChildren(...matches.slice(page * pageSize, (page + 1) * pageSize).map(({ pair, left, right }) => {
    const row = button('', () => showPair(pair, true));
    row.className = 'result';
    row.append(element('span', left), element('span', right), element('span', String(pair[4]), 'muted'));
    return row;
  }));
  byId('pager').hidden = pages < 2;
  byId('page').textContent = (page + 1) + ' / ' + pages;
  byId('previous').disabled = page === 0;
  byId('next').disabled = page + 1 >= pages;
}

byId('corpus').textContent = number(window.poetryData.liCount) + ' 句 · ' + number(Object.keys(li).length) + ' 个诗作 ID';
byId('themes').append(...themes.map((theme, index) => button(theme.name, () => showTheme(index), false)));
byId('browse').addEventListener('submit', event => {
  event.preventDefault();
  filterResults();
});
byId('scope').addEventListener('change', filterResults);
byId('previous').addEventListener('click', () => { page--; renderResults(); });
byId('next').addEventListener('click', () => { page++; renderResults(); });
showTheme(0);
