const daySlider = document.getElementById('day-slider');
const enemyContainer = document.getElementById('enemies');
const enemyCountEl = document.getElementById('enemy-count');
const waveTimerEl = document.getElementById('wave-timer');
const heroEl = document.getElementById('hero');
const tabContent = document.getElementById('tab-content');

const currencyEls = {
  Cu: document.getElementById('cu-value'),
  Ag: document.getElementById('ag-value'),
  Au: document.getElementById('au-value'),
  By: document.getElementById('by-value'),
  Pd: document.getElementById('pd-value')
};

const enemySprites = {
  '1 уровень Злой лес': 'sprites/Противники/1 уровень Злой лес/Злой пень 1 вариант.png',
  '2 уровень Лиходеи': 'sprites/Противники/2 уровень Лиходеи/Лиходей.png',
  '3 уровень Бусурмане': 'sprites/Противники/3 уровень Бусурмане/Бусурманин.png',
  '4 уровень Иноземцы': 'sprites/Противники/4 уровень Иноземцы/Иноземец вариант 1.png',
  '5 уровень Мертвяки': 'sprites/Противники/5 уровень Мертвяки/Мертвяк вариант 1.png',
  '6 уровень Нечисть': 'sprites/Противники/6 уровень Нечисть/Кикимора Босс вариант 2.png',
  '7 уровень Черти': 'sprites/Противники/7 уровень Черти/Чертенок вариант 2.png',
  '8-10 уровни Случайные боссы': 'sprites/Противники/8-10 уровни Случайные боссы/Горыныч вариант 2.png'
};

const state = {
  day: 1,
  enemiesTotal: 60,
  enemiesLeft: 60,
  waveDuration: 4 * 60,
  heroDamage: 1,
  heroAttackSpeed: 0.5, // 1 hit per 2s
  currencies: { Cu: 0, Ag: 0, Au: 0, By: 0, Pd: 0 },
  timers: {},
  cooldowns: {
    wand: 0,
    boots: 0,
    hat: 0,
    comb: 0,
    flower: 0
  }
};

const biomes = [
  { range: [1, 100], name: 'Злой лес', folder: '1 уровень Злой лес' },
  { range: [101, 200], name: 'Лиходеи', folder: '2 уровень Лиходеи' },
  { range: [201, 300], name: 'Бусурмане', folder: '3 уровень Бусурмане' },
  { range: [301, 400], name: 'Иноземцы', folder: '4 уровень Иноземцы' },
  { range: [401, 500], name: 'Мертвяки', folder: '5 уровень Мертвяки' },
  { range: [501, 600], name: 'Нечисть', folder: '6 уровень Нечисть' },
  { range: [601, 700], name: 'Черти', folder: '7 уровень Черти' },
  { range: [701, 800], name: 'Смешанные', folder: '8-10 уровни Случайные боссы' },
  { range: [801, 1000], name: 'Боссы', folder: '8-10 уровни Случайные боссы' }
];

const gathering = [
  { id: 'peasant', name: 'Люд', line: '1 уровень Люд', sprite: 'sprites/Производственные персонажи/1 уровень Люд/1 уровень Тот кто кричал волк.png', baseCu: 1, baseAg: 0, level: 0 },
  { id: 'fishers', name: 'Рыболовы', line: '2 уровень Сказочные рыболовы', sprite: 'sprites/Производственные персонажи/2 уровень Сказочные рыболовы/1 уровень Старик с неводом .png', baseCu: 0.5, baseAg: 0.2, level: 0 },
  { id: 'beasts', name: 'Животные', line: '3 уровень Сказочные животные', sprite: 'sprites/Производственные персонажи/3 уровень Сказочные животные/1 уровень заяц.png', baseCu: 2, baseAg: 0, level: 0 },
  { id: 'smiths', name: 'Мастера', line: '5 уровень Мастера', sprite: 'sprites/Производственные персонажи/5 уровень Мастера/1 уровень Данила мастер.png', baseCu: 3, baseAg: 1, level: 0 },
  { id: 'artifacts', name: 'Сказочные предметы', line: '8 уровень Сказочные предметы', sprite: 'sprites/Производственные персонажи/8 уровень Сказочные предметы/1 уровень Блюдечко с яблочком.png', baseCu: 0, baseAg: 5, level: 0 }
];

const heroRoster = [
  { id: 'anika', name: 'Аника', rank: 'Б', baseDps: 1.5, attackSpeed: 0.5, sprite: 'sprites/Боевые герои/4 Ранг Б/ Аника.png', level: 1, stars: 0 },
  { id: 'dobrynya', name: 'Добрыня Никитич', rank: 'В', baseDps: 2.5, attackSpeed: 0.6, sprite: 'sprites/Боевые герои/5 Ранг В/Добрыня Никитич.png', level: 1, stars: 0 },
  { id: 'baba', name: 'Баба-Яга', rank: 'Ж', baseDps: 1, attackSpeed: 0.4, sprite: 'sprites/Боевые герои/1 Ранг Ж/Баба-Яга Костяная нога.png', level: 1, stars: 0 }
];

function formatNumber(n) {
  if (n < 1000) return n.toFixed(0);
  const suffixes = ['k', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
  let i = -1;
  while (n >= 1000 && i < suffixes.length - 1) {
    n /= 1000;
    i++;
  }
  return `${n.toFixed(2)}${suffixes[i] ?? ''}`;
}

function updateCurrencies() {
  Object.entries(currencyEls).forEach(([key, el]) => {
    el.textContent = formatNumber(state.currencies[key]);
  });
}

function setupDaySlider() {
  const fragment = document.createDocumentFragment();
  for (let i = 1; i <= 20; i++) {
    const node = document.createElement('span');
    node.className = 'day-node';
    if (i % 10 === 0) node.textContent = '☠';
    fragment.appendChild(node);
  }
  daySlider.appendChild(fragment);
}

function getBiome(day) {
  return biomes.find((b) => day >= b.range[0] && day <= b.range[1]) ?? biomes[0];
}

function spawnEnemies() {
  enemyContainer.innerHTML = '';
  const biome = getBiome(state.day);
  const sprite = enemySprites[biome.folder];
  const visible = 8;
  for (let i = 0; i < visible; i++) {
    const enemy = document.createElement('div');
    enemy.className = 'enemy';
    enemy.dataset.hp = computeEnemyHp();
    enemy.style.transform = `translateX(${-i * 24}px)`;
    const img = document.createElement('img');
    img.src = sprite;
    img.alt = 'enemy';
    enemy.appendChild(img);
    enemyContainer.appendChild(enemy);
  }
  state.enemiesLeft = state.enemiesTotal;
  enemyCountEl.textContent = `ВРАГИ ${state.enemiesLeft}/${state.enemiesTotal}`;
}

function computeEnemyHp() {
  const baseHp = 10;
  return Math.round(baseHp * Math.pow(1.25, state.day));
}

function computeHeroDps(hero) {
  return hero.baseDps * Math.pow(1.08, hero.level - 1) * (1 + 0.5 * hero.stars);
}

function autoAttack() {
  const heroesDps = heroRoster.reduce((acc, h) => acc + computeHeroDps(h) * h.attackSpeed, 0);
  const totalDps = state.heroDamage * state.heroAttackSpeed + heroesDps;
  applyDamage(totalDps / 2); // tick half-second resolution
}

function applyDamage(amount) {
  let remaining = amount;
  const enemyNodes = Array.from(enemyContainer.children);
  for (const enemy of enemyNodes) {
    let hp = Number(enemy.dataset.hp);
    if (hp <= 0) continue;
    const dmg = Math.min(hp, remaining);
    hp -= dmg;
    remaining -= dmg;
    enemy.dataset.hp = hp;
    if (hp <= 0) {
      enemy.classList.add('jump');
      setTimeout(() => enemy.remove(), 450);
      state.enemiesLeft -= 1;
      state.currencies.Cu += 0.5;
      state.currencies.Ag += 0.2;
      if (state.enemiesLeft <= 0) {
        completeWave();
        break;
      }
    }
    if (remaining <= 0) break;
  }
  enemyCountEl.textContent = `ВРАГИ ${Math.max(state.enemiesLeft, 0)}/${state.enemiesTotal}`;
  updateCurrencies();
}

function completeWave() {
  state.day += 1;
  resetWave();
}

function failWave() {
  state.day = Math.max(1, state.day - 1);
  resetWave();
}

function resetWave() {
  clearInterval(state.timers.waveTimer);
  state.waveDuration = 4 * 60;
  spawnEnemies();
  renderTabContent(activeTab);
  startTimers();
}

function startTimers() {
  state.timers.waveTimer = setInterval(() => {
    state.waveDuration -= 1;
    if (state.waveDuration <= 0) {
      failWave();
      return;
    }
    updateTimerUi();
    autoAttack();
    moveEnemies();
  }, 1000);
}

function updateTimerUi() {
  const minutes = String(Math.floor(state.waveDuration / 60)).padStart(2, '0');
  const seconds = String(state.waveDuration % 60).padStart(2, '0');
  waveTimerEl.textContent = `${minutes}:${seconds}`;
}

function moveEnemies() {
  const heroX = heroEl.getBoundingClientRect().left + heroEl.offsetWidth / 2;
  const enemies = Array.from(enemyContainer.children);
  enemies.forEach((enemy, idx) => {
    const rect = enemy.getBoundingClientRect();
    const dist = rect.left - heroX;
    const offset = Math.max(-200, dist - 120 - idx * 10);
    enemy.style.transform = `translateX(${offset}px)`;
    if (dist <= 40) {
      enemy.classList.add('jump');
    }
  });
}

function handleClickLarchik() {
  const incomeCu = 0.05 * (state.currencies.Cu + 1);
  const incomeAg = 0.02 * (state.currencies.Ag + 1);
  state.currencies.Cu += incomeCu;
  state.currencies.Ag += incomeAg;
  updateCurrencies();
}

function handleClickSword() {
  applyDamage(5 * state.heroDamage);
}

function setupTabs() {
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      activeTab = btn.dataset.tab;
      renderTabContent(activeTab);
    });
  });
}

function renderGathering() {
  const container = document.createElement('div');
  container.className = 'card-list';
  gathering.forEach((bld) => {
    const card = document.createElement('div');
    card.className = 'card';
    const img = document.createElement('img');
    img.src = bld.sprite;
    img.alt = bld.name;
    const body = document.createElement('div');
    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = `${bld.name} — ур. ${bld.level}`;
    const meta = document.createElement('div');
    meta.className = 'meta';
    const prodCu = bld.baseCu * bld.level;
    const prodAg = bld.baseAg * bld.level;
    meta.textContent = `${formatNumber(prodCu)} Cu/s · ${formatNumber(prodAg)} Ag/s`;
    const buy = document.createElement('button');
    buy.textContent = 'Купить x10';
    buy.addEventListener('click', () => {
      const costCu = Math.pow(1.15, bld.level) * 10;
      if (state.currencies.Cu >= costCu) {
        state.currencies.Cu -= costCu;
        bld.level += 10;
        updateCurrencies();
        renderTabContent('gathering');
      }
    });
    body.appendChild(title);
    body.appendChild(meta);
    card.appendChild(img);
    card.appendChild(body);
    card.appendChild(buy);
    container.appendChild(card);
  });
  return container;
}

function renderHeroes() {
  const container = document.createElement('div');
  container.className = 'card-list';
  heroRoster.forEach((hero) => {
    const card = document.createElement('div');
    card.className = 'card';
    const img = document.createElement('img');
    img.src = hero.sprite;
    const body = document.createElement('div');
    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = `${hero.name} ${hero.rank} — ур. ${hero.level}`;
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = `DPS: ${computeHeroDps(hero).toFixed(1)} · Скорость: ${hero.attackSpeed.toFixed(2)} уд/с`;
    const button = document.createElement('button');
    button.textContent = 'Повысить x10 (Ag)';
    button.addEventListener('click', () => {
      const cost = Math.pow(1.12, hero.level) * 50;
      if (state.currencies.Ag >= cost) {
        state.currencies.Ag -= cost;
        hero.level += 10;
        updateCurrencies();
        renderTabContent('heroes');
      }
    });
    body.appendChild(title);
    body.appendChild(meta);
    card.appendChild(img);
    card.appendChild(body);
    card.appendChild(button);
    container.appendChild(card);
  });
  return container;
}

function renderUpgrades() {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `<p>Временные усиления за Cu/Ag до перерождения. Пример: +20% к производству, -10% стоимости зданий.</p>`;
  return wrapper;
}

function renderRebirth() {
  const div = document.createElement('div');
  const pdGain = Math.floor(Math.pow(state.day, 1.2) / 10);
  div.innerHTML = `<h3>Возврат к истокам</h3><p>Максимальный день: ${state.day}</p><p>Подвигов за перерождение: ${pdGain}</p><button id="do-rebirth">Переродиться</button>`;
  div.querySelector('#do-rebirth').addEventListener('click', () => {
    state.currencies.Pd += pdGain;
    state.day = 1;
    state.heroDamage = 1;
    state.heroAttackSpeed = 0.5;
    gathering.forEach((b) => (b.level = 0));
    heroRoster.forEach((h) => (h.level = 1));
    resetWave();
    updateCurrencies();
    renderTabContent(activeTab);
  });
  return div;
}

function renderShop() {
  const div = document.createElement('div');
  div.innerHTML = `
    <div class="card-list">
      <div class="card"><img src="sprites/Кнопка для игры в рулетку/Цветик семицветик.png"><div><div class="title">Цветик-семицветик</div><div class="meta">Золото, карты, Былины, Подвиги</div></div><button>Купить за Au</button></div>
      <div class="card"><img src="sprites/Питомцы/Ранг 1 Ж/1.png"><div><div class="title">Котомка со зверем</div><div class="meta">Выпадают карты питомцев и ездовых</div></div><button>100 Au</button></div>
      <div class="card"><img src="sprites/Фреймы/Фрейм доски победы дня.png"><div><div class="title">Вечные усиления</div><div class="meta">Шанс золота, шанс Подвигов, сила активок</div></div><button>Разное</button></div>
    </div>`;
  return div;
}

function renderPets() {
  const div = document.createElement('div');
  div.innerHTML = `<p>Боевые и ездовые питомцы: бонусы к добыче, урону и скорости перемещения. Карточки усиливают до 5★.</p>`;
  return div;
}

function renderTabContent(tab) {
  tabContent.innerHTML = '';
  switch (tab) {
    case 'gathering':
      tabContent.appendChild(renderGathering());
      break;
    case 'heroes':
      tabContent.appendChild(renderHeroes());
      break;
    case 'upgrades':
      tabContent.appendChild(renderUpgrades());
      break;
    case 'rebirth':
      tabContent.appendChild(renderRebirth());
      break;
    case 'shop':
      tabContent.appendChild(renderShop());
      break;
    case 'pets':
      tabContent.appendChild(renderPets());
      break;
    default:
      tabContent.textContent = 'Вкладка строится...';
  }
}

function setupInteractions() {
  document.getElementById('btn-larchik').addEventListener('click', handleClickLarchik);
  document.getElementById('btn-sword').addEventListener('click', handleClickSword);
  ['wand', 'boots', 'hat', 'comb', 'flower'].forEach((key) => {
    const el = document.getElementById(`btn-${key === 'flower' ? 'flower' : key}`);
    el.addEventListener('click', () => triggerCooldown(key, el));
  });
}

function triggerCooldown(key, el) {
  if (state.cooldowns[key] > 0) return;
  state.cooldowns[key] = 30 * 60; // 30 минут
  const badge = document.createElement('div');
  badge.className = 'cooldown';
  badge.textContent = '30:00';
  el.appendChild(badge);
  const timer = setInterval(() => {
    state.cooldowns[key] -= 1;
    const min = String(Math.floor(state.cooldowns[key] / 60)).padStart(2, '0');
    const sec = String(state.cooldowns[key] % 60).padStart(2, '0');
    badge.textContent = `${min}:${sec}`;
    if (state.cooldowns[key] <= 0) {
      clearInterval(timer);
      badge.remove();
    }
  }, 1000);
}

let activeTab = 'gathering';
setupDaySlider();
spawnEnemies();
setupTabs();
renderTabContent(activeTab);
setupInteractions();
startTimers();
updateCurrencies();
