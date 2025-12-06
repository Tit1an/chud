const daySlider = document.getElementById('day-slider');
const enemyContainer = document.getElementById('enemies');
const enemyCountEl = document.getElementById('enemy-count');
const waveTimerEl = document.getElementById('wave-timer');
const heroEl = document.getElementById('hero');
const tabContent = document.getElementById('tab-content');
const creatorOverlay = document.getElementById('character-creator');
const previewHero = document.getElementById('preview-hero');
const heroNameInput = document.getElementById('hero-name');
const dayInfoEl = document.getElementById('day-info');
const biomeEl = document.getElementById('biome');
const mapOverlay = document.getElementById('map-overlay');
const mapGrid = document.getElementById('map-grid');
const mapTooltip = document.getElementById('map-tooltip');

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

const biomeBackgrounds = [
  'sprites/Фоны/Фон прохождения дня 1.png',
  'sprites/Фоны/Фон прохождения дня 2.png'
];

const state = {
  day: 1,
  enemiesTotal: 60,
  enemiesLeft: 60,
  waveDuration: 4 * 60,
  heroDamage: 1,
  heroAttackSpeed: 0.5, // 1 hit per 2s
  heroAppearance: {
    gender: 'male',
    head: 0,
    torso: 0,
    armor: 0,
    weapon: 0,
    name: 'Иван'
  },
  gameActive: false,
  currencies: { Cu: 0, Ag: 0, Au: 0, By: 0, Pd: 0 },
  timers: {},
  cooldowns: {
    wand: 0,
    boots: 0,
    hat: 0,
    comb: 0,
    flower: 0
  },
  sliderStart: 1,
  ownedHeroes: [],
  ownedPets: [],
  ownedMounts: [],
  mapUnlocked: new Set(['village'])
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
  {
    id: 'people',
    name: 'Люд',
    unlockDay: 1,
    stages: [
      'sprites/Производственные персонажи/1 уровень Люд/1 уровень Тот кто кричал волк.png',
      'sprites/Производственные персонажи/1 уровень Люд/4 уровень Жница.png',
      'sprites/Производственные персонажи/1 уровень Люд/8 уровень Барин.png'
    ],
    baseCu: 1.5,
    baseAg: 0.1,
    level: 0
  },
  {
    id: 'fishers',
    name: 'Сказочные рыболовы',
    unlockDay: 20,
    stages: [
      'sprites/Производственные персонажи/2 уровень Сказочные рыболовы/1 уровень Старик с неводом .png',
      'sprites/Производственные персонажи/2 уровень Сказочные рыболовы/2 уровень Золотая рыбка .png',
      'sprites/Производственные персонажи/2 уровень Сказочные рыболовы/5 уровень Русалка на ветке дерева.png'
    ],
    baseCu: 0.5,
    baseAg: 0.6,
    level: 0
  },
  {
    id: 'beasts',
    name: 'Сказочные животные',
    unlockDay: 40,
    stages: [
      'sprites/Производственные персонажи/3 уровень Сказочные животные/1 уровень заяц.png',
      'sprites/Производственные персонажи/3 уровень Сказочные животные/3 уровень котенок баюн.png',
      'sprites/Производственные персонажи/3 уровень Сказочные животные/5 уровень Белка что орешки все грызет.png'
    ],
    baseCu: 2,
    baseAg: 0,
    level: 0
  },
  {
    id: 'houses',
    name: 'Сказочное жилье',
    unlockDay: 60,
    stages: [
      'sprites/Производственные персонажи/4 уровень Сказочное жилье/1 уровень Яйцо избушки на курьих ножках.png',
      'sprites/Производственные персонажи/4 уровень Сказочное жилье/2 уровень Избушка на курьих ножках.png',
      'sprites/Производственные персонажи/4 уровень Сказочное жилье/4 уровень Хоромы на курьих ножках.png'
    ],
    baseCu: 1.2,
    baseAg: 1.1,
    level: 0
  },
  {
    id: 'masters',
    name: 'Мастера',
    unlockDay: 80,
    stages: [
      'sprites/Производственные персонажи/5 уровень Мастера/1 уровень Данила мастер.png',
      'sprites/Производственные персонажи/5 уровень Мастера/2 уровень Владычица медной горы.png'
    ],
    baseCu: 3,
    baseAg: 1.6,
    level: 0
  },
  {
    id: 'youth',
    name: 'Молодо-зелено',
    unlockDay: 100,
    stages: [
      'sprites/Производственные персонажи/6 уровень Молодо-зелено/1 уровень Молодильное яблочко.png',
      'sprites/Производственные персонажи/6 уровень Молодо-зелено/2 уровень Росток молодильного дерева.png',
      'sprites/Производственные персонажи/6 уровень Молодо-зелено/3 уровень Молодильная яблонька.png'
    ],
    baseCu: 0.6,
    baseAg: 2.2,
    level: 0
  },
  {
    id: 'families',
    name: 'Сказочные семьи',
    unlockDay: 120,
    stages: [
      'sprites/Производственные персонажи/7 уровень Сказочные семьи/1 уровень Три поросенка.png',
      'sprites/Производственные персонажи/7 уровень Сказочные семьи/2 уровень Три медведя.png',
      'sprites/Производственные персонажи/7 уровень Сказочные семьи/3 уровень Семеро козлят с матушкой.png'
    ],
    baseCu: 2.8,
    baseAg: 0.8,
    level: 0
  },
  {
    id: 'items',
    name: 'Сказочные предметы',
    unlockDay: 150,
    stages: [
      'sprites/Производственные персонажи/8 уровень Сказочные предметы/1 уровень Блюдечко с яблочком.png',
      'sprites/Производственные персонажи/8 уровень Сказочные предметы/2 уровень Гусли самогуды.png',
      'sprites/Производственные персонажи/8 уровень Сказочные предметы/3 уровень Скатерть самобранка.png'
    ],
    baseCu: 0.3,
    baseAg: 4.5,
    level: 0
  },
  {
    id: 'maidens',
    name: 'Сказочные прелестницы',
    unlockDay: 180,
    stages: [
      'sprites/Производственные персонажи/9 уровень Сказочные прелестницы/1 уровень Василиса премудрая.png',
      'sprites/Производственные персонажи/9 уровень Сказочные прелестницы/2 уровень Елена прекрасная.png',
      'sprites/Производственные персонажи/9 уровень Сказочные прелестницы/3 уровень Марья Искусница.png'
    ],
    baseCu: 1.8,
    baseAg: 2.8,
    level: 0
  },
  {
    id: 'domovoi',
    name: 'Семейство домовых',
    unlockDay: 220,
    stages: [
      'sprites/Производственные персонажи/10 уровень семейство домовых/1 уровень Кикимора болотная.png',
      'sprites/Производственные персонажи/10 уровень семейство домовых/3 уровень Домовенок.png',
      'sprites/Производственные персонажи/10 уровень семейство домовых/5 уровень Домовой.png'
    ],
    baseCu: 3.5,
    baseAg: 1.5,
    level: 0
  },
  {
    id: 'royal',
    name: 'Царская кровь',
    unlockDay: 260,
    stages: [
      'sprites/Производственные персонажи/11 уровеньЦарская кровь/1 уровень Царевна лебедь.png',
      'sprites/Производственные персонажи/11 уровеньЦарская кровь/2 уровень Царевна лягушка.png',
      'sprites/Производственные персонажи/11 уровеньЦарская кровь/3 уровень Царь батюшка.png'
    ],
    baseCu: 0.9,
    baseAg: 5,
    level: 0
  },
  {
    id: 'waters',
    name: 'Сказочные воды',
    unlockDay: 300,
    stages: [
      'sprites/Производственные персонажи/12 уровень Сказочные воды/1 уровень Колодец мертвой воды.png',
      'sprites/Производственные персонажи/12 уровень Сказочные воды/2 уровень Колодец живой воды.png'
    ],
    baseCu: 1.5,
    baseAg: 5.5,
    level: 0
  },
  {
    id: 'founders',
    name: 'Начинатели',
    unlockDay: 360,
    stages: [
      'sprites/Производственные персонажи/13 уровень Начинатели/1 уровень Сварог.png',
      'sprites/Производственные персонажи/13 уровень Начинатели/3 уровень Велес.png',
      'sprites/Производственные персонажи/13 уровень Начинатели/5 уровень Мокошь.png'
    ],
    baseCu: 6,
    baseAg: 6,
    level: 0
  }
];


const customizationSets = {
  male: {
    heads: [
      'sprites/кастомизация основного персонажа/Мужской базовый персонаж/Мужская голова вариант 1.png',
      'sprites/кастомизация основного персонажа/Мужской базовый персонаж/Мужская голова вариант 2.png',
      'sprites/кастомизация основного персонажа/Мужской базовый персонаж/Мужская голова вариант 3.png',
      'sprites/кастомизация основного персонажа/Мужской базовый персонаж/Мужская голова вариант 4.png',
      'sprites/кастомизация основного персонажа/Мужской базовый персонаж/Мужская голова вариант 5.png'
    ],
    torsos: [
      'sprites/кастомизация основного персонажа/Мужской базовый персонаж/Мужской базовый торс вариант 1.png',
      'sprites/кастомизация основного персонажа/Мужской базовый персонаж/Мужской базовый торс вариант 2.png',
      'sprites/кастомизация основного персонажа/Мужской базовый персонаж/Мужской базовый торс вариант 3.png'
    ],
    armors: [
      'sprites/кастомизация основного персонажа/Броня/Мужская броня/1 уровень Молодецкий доспех.png',
      'sprites/кастомизация основного персонажа/Броня/Мужская броня/2 уровень Железный доспех.png',
      'sprites/кастомизация основного персонажа/Броня/Мужская броня/3 уровень Богатырский доспех.png'
    ]
  },
  female: {
    heads: [
      'sprites/кастомизация основного персонажа/Женский базовый персонаж/Женская голова вариант 1.png',
      'sprites/кастомизация основного персонажа/Женский базовый персонаж/Женская голова вариант 2.png',
      'sprites/кастомизация основного персонажа/Женский базовый персонаж/Женская голова вариант 3.png',
      'sprites/кастомизация основного персонажа/Женский базовый персонаж/Женская голова вариант 4.png'
    ],
    torsos: [
      'sprites/кастомизация основного персонажа/Женский базовый персонаж/Женский базовый торс вариант 1.png',
      'sprites/кастомизация основного персонажа/Женский базовый персонаж/Женский базовый торс вариант 2.png',
      'sprites/кастомизация основного персонажа/Женский базовый персонаж/Женский базовый торс вариант 3.png'
    ],
    armors: [
      'sprites/кастомизация основного персонажа/Броня/Женская броня/1 уровень Молодецкий подол.png',
      'sprites/кастомизация основного персонажа/Броня/Женская броня/2 уровень Железный подол.png',
      'sprites/кастомизация основного персонажа/Броня/Женская броня/3 уровень Доспех Богатырши.png'
    ]
  },
  weapons: [
    'sprites/кастомизация основного персонажа/Оружие/Брынькалка.png',
    'sprites/кастомизация основного персонажа/Оружие/Булава.png',
    'sprites/кастомизация основного персонажа/Оружие/Клинок из пера жар птицы.png',
    'sprites/кастомизация основного персонажа/Оружие/Копье.png',
    'sprites/кастомизация основного персонажа/Оружие/Колун.png',
    'sprites/кастомизация основного персонажа/Оружие/Метелка.png',
    'sprites/кастомизация основного персонажа/Оружие/Меч булатный.png',
    'sprites/кастомизация основного персонажа/Оружие/Палочка-выручалочка.png'
  ]
};

const heroPool = [
  { id: 'ivan', name: 'Иван-дурак', rank: 'Ж', baseDps: 1.1, attackSpeed: 0.45, sprite: 'sprites/Боевые герои/1 Ранг Ж/Иван дурак.png', level: 1, stars: 0, owned: false },
  { id: 'baba', name: 'Баба-Яга', rank: 'Ж', baseDps: 1, attackSpeed: 0.4, sprite: 'sprites/Боевые герои/1 Ранг Ж/Баба-Яга Костяная нога.png', level: 1, stars: 0, owned: false },
  { id: 'anika', name: 'Аника', rank: 'Б', baseDps: 1.5, attackSpeed: 0.5, sprite: 'sprites/Боевые герои/4 Ранг Б/ Аника.png', level: 1, stars: 0, owned: false },
  { id: 'dobrynya', name: 'Добрыня Никитич', rank: 'В', baseDps: 2.5, attackSpeed: 0.6, sprite: 'sprites/Боевые герои/5 Ранг В/Добрыня Никитич.png', level: 1, stars: 0, owned: false },
  { id: 'gorynych', name: 'Горыныч', rank: 'Л', baseDps: 4, attackSpeed: 0.8, sprite: 'sprites/Боевые герои/6 Ранг Л/Горыныч.png', level: 1, stars: 0, owned: false }
];

const petPool = [
  { id: 'bug', name: 'Жучка', rank: 'Ж', sprite: 'sprites/Питомцы/Ранг 1 Ж/ Жучка.png', effect: '+10% Cu', owned: false },
  { id: 'raven', name: 'Черный ворон', rank: 'Ж', sprite: 'sprites/Питомцы/Ранг 1 Ж/Черный ворон.png', effect: '+шанс крита', owned: false },
  { id: 'semargl', name: 'Семаргл', rank: 'Л', sprite: 'sprites/Питомцы/Ранг 6 Л/Семаргл.png', effect: '+урон по боссам', owned: false }
];

const mountPool = [
  { id: 'konek', name: 'Конёк-горбунок', rank: 'М', sprite: 'sprites/Ездовые животные/Ранг 3 М/Конек-горбунок.png', owned: false },
  { id: 'stupa', name: 'Ступа Бабы Яги', rank: 'В', sprite: 'sprites/Ездовые животные/Ранг 5 В/ступа бабы Яги.png', owned: false },
  { id: 'carpet', name: 'Ковер-самолет', rank: 'В', sprite: 'sprites/Ездовые животные/Ранг 5 В/Ковер самолет.png', owned: false },
  { id: 'fish', name: 'Детёныш чудо-юдо', rank: 'Л', sprite: 'sprites/Ездовые животные/Ранг 6 Л/Детеныш чудо-юдо рыбы кит.png', owned: false },
  { id: 'ship', name: 'Летучий корабль', rank: 'Б', sprite: 'sprites/Ездовые животные/Ранг 4 Б/Летучий корабль.png', owned: false }
];

const mapNodes = [
  { id: 'village', name: 'Деревня', icon: 'sprites/Фреймы/Фрейм доски.png', desc: 'Стартовый лагерь, бонус +5% к добыче.', unlocked: true },
  { id: 'forest', name: 'Лесная тропа', icon: 'sprites/Фреймы/Фрейм доски победы дня.png', desc: '+5% Cu линии Люд', unlocked: false, requires: 'Былины 1' },
  { id: 'river', name: 'Речной брод', icon: 'sprites/Кнопка для путешествий/Волшебный клубочек.png', desc: 'Открывает рыбаков и +5% Ag', unlocked: false, requires: 'Былины 2' },
  { id: 'mount', name: 'Звериная стоянка', icon: 'sprites/Ездовые животные/Ранг 3 М/Конек-горбунок.png', desc: 'Разблокирует Конька-горбунка', unlocked: false, requires: 'Клетка лесной тропы' },
  { id: 'hut', name: 'Избушка', icon: 'sprites/Производственные персонажи/4 уровень Сказочное жилье/2 уровень Избушка на курьих ножках.png', desc: 'Снижает цену зданий -3%', unlocked: false, requires: 'День 50' },
  { id: 'altar', name: 'Алтарь подвигов', icon: 'sprites/Для благодати/Алконост.png', desc: '+10% к подвигам при перерождении', unlocked: false, requires: 'Былины 5' }
];

function formatNumber(n) {
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

function labelFromPath(path) {
  return path.split('/').pop().replace('.png', '');
}

function updateHeroVisuals() {
  const set = customizationSets[state.heroAppearance.gender];
  const weapon = customizationSets.weapons[state.heroAppearance.weapon];
  const target = heroEl;
  const preview = previewHero;
  const torsoSrc = set.torsos[state.heroAppearance.torso];
  const headSrc = set.heads[state.heroAppearance.head];
  const armorSrc = set.armors[state.heroAppearance.armor];

  [target, preview].forEach((node) => {
    if (!node) return;
    node.querySelector('.torso').src = torsoSrc;
    node.querySelector('.head').src = headSrc;
    node.querySelector('.armor').src = armorSrc;
    node.querySelector('.weapon').src = weapon;
  });

  document.getElementById('head-name').textContent = labelFromPath(headSrc);
  document.getElementById('torso-name').textContent = labelFromPath(torsoSrc);
  document.getElementById('armor-name').textContent = labelFromPath(armorSrc);
  document.getElementById('weapon-name').textContent = labelFromPath(weapon);
}

function setupDaySlider() {
  daySlider.innerHTML = '';
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < 20; i++) {
    const node = document.createElement('span');
    node.className = 'day-node';
    fragment.appendChild(node);
  }
  daySlider.appendChild(fragment);
  document.getElementById('day-prev').addEventListener('click', () => {
    state.sliderStart = Math.max(1, state.sliderStart - 20);
    updateDaySlider();
  });
  document.getElementById('day-next').addEventListener('click', () => {
    state.sliderStart += 20;
    updateDaySlider();
  });
}

function updateDaySlider() {
  const nodes = Array.from(daySlider.children);
  const windowEnd = state.sliderStart + nodes.length - 1;
  if (state.day < state.sliderStart || state.day > windowEnd) {
    state.sliderStart = Math.max(1, state.day - nodes.length + 1);
  }
  nodes.forEach((node, idx) => {
    const dayNumber = state.sliderStart + idx;
    node.dataset.day = dayNumber;
    node.textContent = dayNumber % 100 === 0 ? '☠' : dayNumber;
    node.title = `День ${dayNumber}`;
    node.classList.toggle('active', dayNumber === state.day);
  });
}

function getBiome(day) {
  const cycleDay = ((day - 1) % 1000) + 1;
  return biomes.find((b) => cycleDay >= b.range[0] && cycleDay <= b.range[1]) ?? biomes[0];
}

function updateBattleBackground(biome) {
  const bg = document.querySelector('.battle-bg');
  const idx = biomes.indexOf(biome) % biomeBackgrounds.length;
  bg.style.backgroundImage = `url('${biomeBackgrounds[idx]}')`;
}

function updateDayInfo() {
  const biome = getBiome(state.day);
  const progressInSet = ((state.day - 1) % 100) + 1;
  const toBoss = 100 - progressInSet;
  dayInfoEl.textContent = `День ${state.day} • до босса ${toBoss}`;
  biomeEl.textContent = `Враги: ${biome.name}`;
}

function spawnEnemies() {
  enemyContainer.innerHTML = '';
  const biome = getBiome(state.day);
  const sprite = enemySprites[biome.folder];
  updateBattleBackground(biome);
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

function grantRandomFromPool(pool, ownedKey) {
  const owned = state[ownedKey];
  const available = pool.filter((item) => !owned.includes(item.id));
  const source = available.length ? available : pool;
  const pick = source[Math.floor(Math.random() * source.length)];
  if (!owned.includes(pick.id)) owned.push(pick.id);
  return pick;
}

function autoAttack() {
  const heroesDps = heroPool
    .filter((h) => state.ownedHeroes.includes(h.id))
    .reduce((acc, h) => acc + computeHeroDps(h) * h.attackSpeed, 0);
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
  updateDaySlider();
  updateDayInfo();
  if (state.gameActive) startTimers();
}

function startTimers() {
  if (state.timers.waveTimer) clearInterval(state.timers.waveTimer);
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
    const wiggle = Math.sin(Date.now() / 280 + idx) * 6;
    const offset = Math.max(-220, dist - 120 - idx * 10 + wiggle);
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
    const stageIndex = Math.min(bld.stages.length - 1, Math.floor(bld.level / 500));
    img.src = bld.stages[stageIndex];
    img.alt = bld.name;
    const body = document.createElement('div');
    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = `${bld.name} — ур. ${bld.level}`;
    const meta = document.createElement('div');
    meta.className = 'meta';
    const prodCu = bld.baseCu * bld.level;
    const prodAg = bld.baseAg * bld.level;
    const locked = state.day < bld.unlockDay;
    meta.textContent = locked
      ? `Откроется с дня ${bld.unlockDay}`
      : `${formatNumber(prodCu)} Cu/s · ${formatNumber(prodAg)} Ag/s`;
    const buy = document.createElement('button');
    buy.textContent = locked ? 'Закрыто' : 'Купить x10';
    buy.disabled = locked;
    buy.addEventListener('click', () => {
      const costCu = Math.pow(1.15, bld.level) * 10;
      if (locked || state.currencies.Cu < costCu) return;
      state.currencies.Cu -= costCu;
      bld.level += 10;
      updateCurrencies();
      renderTabContent('gathering');
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
  heroPool.forEach((hero) => {
    const owned = state.ownedHeroes.includes(hero.id);
    const card = document.createElement('div');
    card.className = 'card';
    const img = document.createElement('img');
    img.src = hero.sprite;
    const body = document.createElement('div');
    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = `${hero.name} (${hero.rank}) — ур. ${owned ? hero.level : '—'}`;
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = owned
      ? `DPS: ${computeHeroDps(hero).toFixed(1)} · Скорость: ${hero.attackSpeed.toFixed(2)} уд/с`
      : 'Выпадает из лутбоксов за Au и Цветика-семицветика';
    const button = document.createElement('button');
    button.textContent = owned ? 'Повысить x10 (Ag)' : 'Открыть магазин';
    button.addEventListener('click', () => {
      if (!owned) {
        activeTab = 'shop';
        document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
        document.querySelector('[data-tab="shop"]').classList.add('active');
        renderTabContent('shop');
        return;
      }
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
    heroPool.forEach((h) => (h.level = 1));
    resetWave();
    updateCurrencies();
    renderTabContent(activeTab);
  });
  return div;
}

function renderShop() {
  const div = document.createElement('div');
  const list = document.createElement('div');
  list.className = 'card-list';

  const heroCard = document.createElement('div');
  heroCard.className = 'card';
  heroCard.innerHTML = `<img src="sprites/Кнопка для игры в рулетку/Цветик семицветик.png" alt="Лутбокс героев"><div><div class="title">Лутбокс героев</div><div class="meta">Случайный герой из всех рангов</div></div>`;
  const heroBtn = document.createElement('button');
  heroBtn.textContent = '10 Au';
  heroBtn.addEventListener('click', () => {
    if (state.currencies.Au < 10) return;
    state.currencies.Au -= 10;
    const pick = grantRandomFromPool(heroPool, 'ownedHeroes');
    updateCurrencies();
    renderTabContent('heroes');
    heroBtn.textContent = `Выпал ${pick.name}!`;
    setTimeout(() => (heroBtn.textContent = '10 Au'), 1500);
  });
  heroCard.appendChild(heroBtn);

  const petCard = document.createElement('div');
  petCard.className = 'card';
  petCard.innerHTML = `<img src="sprites/Питомцы/Ранг 1 Ж/ Жучка.png" alt="Котомка со зверем"><div><div class="title">Котомка со зверем</div><div class="meta">Боевые питомцы и ездовые</div></div>`;
  const petBtn = document.createElement('button');
  petBtn.textContent = '8 Au';
  petBtn.addEventListener('click', () => {
    if (state.currencies.Au < 8) return;
    state.currencies.Au -= 8;
    const rollMount = Math.random() < 0.35;
    const pick = rollMount
      ? grantRandomFromPool(mountPool, 'ownedMounts')
      : grantRandomFromPool(petPool, 'ownedPets');
    updateCurrencies();
    renderTabContent('pets');
    petBtn.textContent = `Найден ${pick.name}!`;
    setTimeout(() => (petBtn.textContent = '8 Au'), 1500);
  });
  petCard.appendChild(petBtn);

  const eternalCard = document.createElement('div');
  eternalCard.className = 'card';
  eternalCard.innerHTML = `<img src="sprites/Фреймы/Фрейм доски победы дня.png" alt="Вечные усиления"><div><div class="title">Вечные усиления</div><div class="meta">Шанс золота, сила активных кнопок, подвиги</div></div>`;
  const eternalBtn = document.createElement('button');
  eternalBtn.textContent = 'Просмотр';
  eternalBtn.addEventListener('click', () => {
    eternalBtn.textContent = 'В разработке';
    setTimeout(() => (eternalBtn.textContent = 'Просмотр'), 1200);
  });
  eternalCard.appendChild(eternalBtn);

  list.appendChild(heroCard);
  list.appendChild(petCard);
  list.appendChild(eternalCard);
  div.appendChild(list);
  return div;
}

function renderPets() {
  const div = document.createElement('div');
  const section = document.createElement('div');
  section.className = 'card-list';

  petPool.forEach((pet) => {
    const owned = state.ownedPets.includes(pet.id);
    const card = document.createElement('div');
    card.className = 'card';
    const img = document.createElement('img');
    img.src = pet.sprite;
    const body = document.createElement('div');
    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = `${pet.name} (${pet.rank})`;
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = owned ? pet.effect : 'Карточки из котомки за Au';
    const btn = document.createElement('button');
    btn.textContent = owned ? 'Активен' : 'Открыть магазин';
    btn.addEventListener('click', () => {
      if (!owned) {
        activeTab = 'shop';
        document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
        document.querySelector('[data-tab="shop"]').classList.add('active');
        renderTabContent('shop');
      }
    });
    body.appendChild(title);
    body.appendChild(meta);
    card.appendChild(img);
    card.appendChild(body);
    card.appendChild(btn);
    section.appendChild(card);
  });

  const mountsTitle = document.createElement('h4');
  mountsTitle.textContent = 'Ездовые звери';
  const mountList = document.createElement('div');
  mountList.className = 'card-list';
  mountPool.forEach((mount) => {
    const owned = state.ownedMounts.includes(mount.id);
    const card = document.createElement('div');
    card.className = 'card';
    const img = document.createElement('img');
    img.src = mount.sprite;
    const body = document.createElement('div');
    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = `${mount.name} (${mount.rank})`;
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = owned ? 'Готов к седлу' : 'Нужен дроп из котомки/карты';
    const btn = document.createElement('button');
    btn.textContent = owned ? 'Выбрать' : 'Открыть карту';
    btn.addEventListener('click', () => {
      if (owned) return;
      openMap();
    });
    body.appendChild(title);
    body.appendChild(meta);
    card.appendChild(img);
    card.appendChild(body);
    card.appendChild(btn);
    mountList.appendChild(card);
  });

  div.appendChild(section);
  div.appendChild(mountsTitle);
  div.appendChild(mountList);
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

function changePicker(type, dir) {
  const step = dir === 'next' ? 1 : -1;
  if (type === 'weapon') {
    const length = customizationSets.weapons.length;
    state.heroAppearance.weapon = (state.heroAppearance.weapon + step + length) % length;
    return;
  }
  const pool = customizationSets[state.heroAppearance.gender];
  const prop = type;
  const length = pool[`${prop}s`].length;
  state.heroAppearance[prop] = (state.heroAppearance[prop] + step + length) % length;
}

function setupCreator() {
  heroNameInput.value = state.heroAppearance.name;
  document.querySelectorAll('input[name="gender"]').forEach((input) => {
    input.addEventListener('change', (e) => {
      state.heroAppearance.gender = e.target.value;
      state.heroAppearance.head = 0;
      state.heroAppearance.torso = 0;
      state.heroAppearance.armor = 0;
      updateHeroVisuals();
    });
  });

  document.querySelectorAll('.picker-row').forEach((row) => {
    const type = row.dataset.picker;
    row.querySelectorAll('.picker-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        changePicker(type, btn.dataset.dir);
        updateHeroVisuals();
      });
    });
  });

  document.getElementById('creator-confirm').addEventListener('click', () => {
    const name = heroNameInput.value.trim();
    state.heroAppearance.name = name.length ? name : 'Безымянный герой';
    creatorOverlay.classList.add('hidden');
    state.gameActive = true;
    updateHeroVisuals();
    startTimers();
  });

  updateHeroVisuals();
  creatorOverlay.classList.remove('hidden');
}

function openCharacterCreator() {
  if (state.timers.waveTimer) {
    clearInterval(state.timers.waveTimer);
    state.timers.waveTimer = null;
  }
  creatorOverlay.classList.remove('hidden');
}

function renderMapGrid() {
  mapGrid.innerHTML = '';
  mapNodes.forEach((node) => {
    const unlocked = node.unlocked || state.mapUnlocked.has(node.id);
    const cell = document.createElement('div');
    cell.className = 'map-node';
    if (node.id === 'village') cell.classList.add('start');
    if (!unlocked) cell.classList.add('locked');
    const img = document.createElement('img');
    img.src = node.icon;
    const label = document.createElement('div');
    label.className = 'label';
    label.textContent = node.name;
    cell.appendChild(img);
    cell.appendChild(label);
    cell.addEventListener('mouseenter', () => {
      mapTooltip.textContent = `${node.desc}${node.requires ? ' — Требуется: ' + node.requires : ''}`;
    });
    cell.addEventListener('mouseleave', () => {
      mapTooltip.textContent = 'Наведи на клетку, чтобы увидеть бонус.';
    });
    cell.addEventListener('click', () => {
      if (unlocked) return;
      state.mapUnlocked.add(node.id);
      if (node.id === 'mount') {
        grantRandomFromPool([mountPool.find((m) => m.id === 'konek')], 'ownedMounts');
      } else if (node.id === 'forest') {
        const target = gathering.find((g) => g.id === 'people');
        if (target) target.baseCu *= 1.05;
      } else if (node.id === 'river') {
        const target = gathering.find((g) => g.id === 'fishers');
        if (target) target.baseAg *= 1.05;
      } else if (node.id === 'hut') {
        gathering.forEach((g) => {
          g.baseCu *= 1.03;
          g.baseAg *= 1.03;
        });
      } else if (node.id === 'altar') {
        state.currencies.Pd += 1;
        updateCurrencies();
      }
      renderMapGrid();
    });
    mapGrid.appendChild(cell);
  });
  mapTooltip.textContent = 'Наведи на клетку, чтобы увидеть бонус.';
}

function openMap() {
  renderMapGrid();
  mapOverlay.classList.remove('hidden');
}

function setupInteractions() {
  document.getElementById('btn-larchik').addEventListener('click', handleClickLarchik);
  document.getElementById('btn-sword').addEventListener('click', handleClickSword);
  ['wand', 'boots', 'hat', 'comb', 'flower'].forEach((key) => {
    const el = document.getElementById(`btn-${key === 'flower' ? 'flower' : key}`);
    el.addEventListener('click', () => {
      const started = triggerCooldown(key, el);
      if (key === 'comb' && started) openCharacterCreator();
    });
  });
  document.getElementById('btn-ball').addEventListener('click', openMap);
  document.getElementById('map-close').addEventListener('click', () => mapOverlay.classList.add('hidden'));
  mapOverlay.addEventListener('click', (e) => {
    if (e.target === mapOverlay) mapOverlay.classList.add('hidden');
  });
}

function triggerCooldown(key, el) {
  if (state.cooldowns[key] > 0) return false;
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
  return true;
}

let activeTab = 'gathering';
setupDaySlider();
spawnEnemies();
setupTabs();
renderTabContent(activeTab);
setupInteractions();
setupCreator();
updateHeroVisuals();
updateCurrencies();
updateDaySlider();
updateDayInfo();
