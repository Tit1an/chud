/*
 * Main game logic for the Slavic clicker game. This file defines
 * global constants, data structures and functions that drive the
 * gameplay. It manages the player character, enemies, production
 * buildings, heroes, pets, mounts, skills, map nodes, achievements
 * and more. All visual elements are updated through the DOM and
 * persistent progress is stored using localStorage. To run the game
 * simply include this script in index.html and ensure the `sprites`
 * directory exists next to the HTML file.
 */

(function () {
  'use strict';

  // Key used for saving game progress. If you change this you will
  // break compatibility with existing saves.
  const SAVE_KEY = 'slavic_clicker_save_v1';

  // Constants controlling game pacing.
  const WAVE_DURATION = 240; // seconds per wave
  const ENEMIES_PER_WAVE = 60; // number of enemies in a normal wave

  // Cooldown definitions for each skill. Times are in seconds.
  const SKILL_CONFIG = {
    flower: { cd: 1800, duration: 0 },   // Цветик-семицветик
    wand:   { cd: 1800, duration: 60 },  // Палочка-выручалочка
    boots:  { cd: 1800, duration: 60 },  // Сапоги-скороходы
    hat:    { cd: 1800, duration: 0 },   // Шапка-невидимка
    comb:   { cd: 1800, duration: 0 },   // Волшебный гребень
    ball:   { cd: 0,    duration: 0 }    // Волшебный клубочек (карта)
  };

  // Cooldown for the attack click (меч-кладенец) in seconds.
  const ATTACK_CLICK_CD = 5;

  /*
   * SPRITES object contains definitions for all image assets used in
   * the game. Each entry is an object describing available options
   * for character customization (bodies, heads, armors, weapons),
   * mounts, pets and backgrounds. When adding new sprites to the
   * project ensure they are referenced here so the game can load
   * them.
   */
  const SPRITES = {
    // Male body variants (torsos) for the main character. Names are
    // descriptive and correspond to files in the sprites directory.
    maleBodies: [
      {
        id: 'male_body_1',
        name: 'Мужской торс 1',
        src: 'sprites/кастомизация основного персонажа/Мужской базовый персонаж/Мужской базовый торс вариант 1.png'
      },
      {
        id: 'male_body_2',
        name: 'Мужской торс 2',
        src: 'sprites/кастомизация основного персонажа/Мужской базовый персонаж/Мужской базовый торс вариант 2.png'
      },
      {
        id: 'male_body_3',
        name: 'Мужской торс 3',
        src: 'sprites/кастомизация основного персонажа/Мужской базовый персонаж/Мужской базовый торс вариант 3.png'
      }
    ],
    // Female body variants (torsos) for the main character.
    femaleBodies: [
      {
        id: 'female_body_1',
        name: 'Женский торс 1',
        src: 'sprites/кастомизация основного персонажа/Женский базовый персонаж/Женский базовый торс вариант 1.png'
      },
      {
        id: 'female_body_2',
        name: 'Женский торс 2',
        src: 'sprites/кастомизация основного персонажа/Женский базовый персонаж/Женский базовый торс вариант 2.png'
      },
      {
        id: 'female_body_3',
        name: 'Женский торс 3',
        src: 'sprites/кастомизация основного персонажа/Женский базовый персонаж/Женский базовый торс вариант 3.png'
      }
    ],
    // Heads for both sexes. There are male and female heads. The game
    // uses the gender to select the appropriate subset.
    heads: [
      // Male heads
      {
        id: 'male_head_1',
        name: 'Мужская голова 1',
        src: 'sprites/кастомизация основного персонажа/Мужской базовый персонаж/Мужская голова вариант 1.png'
      },
      {
        id: 'male_head_2',
        name: 'Мужская голова 2',
        src: 'sprites/кастомизация основного персонажа/Мужской базовый персонаж/Мужская голова вариант 2.png'
      },
      {
        id: 'male_head_3',
        name: 'Мужская голова 3',
        src: 'sprites/кастомизация основного персонажа/Мужской базовый персонаж/Мужская голова вариант 3.png'
      },
      {
        id: 'male_head_4',
        name: 'Мужская голова 4',
        src: 'sprites/кастомизация основного персонажа/Мужской базовый персонаж/Мужская голова вариант 4.png'
      },
      {
        id: 'male_head_5',
        name: 'Мужская голова 5',
        src: 'sprites/кастомизация основного персонажа/Мужской базовый персонаж/Мужская голова вариант 5.png'
      },
      // Female heads
      {
        id: 'female_head_1',
        name: 'Женская голова 1',
        src: 'sprites/кастомизация основного персонажа/Женский базовый персонаж/Женская голова вариант 1.png'
      },
      {
        id: 'female_head_2',
        name: 'Женская голова 2',
        src: 'sprites/кастомизация основного персонажа/Женский базовый персонаж/Женская голова вариант 2.png'
      },
      {
        id: 'female_head_3',
        name: 'Женская голова 3',
        src: 'sprites/кастомизация основного персонажа/Женский базовый персонаж/Женская голова вариант 3.png'
      },
      {
        id: 'female_head_4',
        name: 'Женская голова 4',
        src: 'sprites/кастомизация основного персонажа/Женский базовый персонаж/Женская голова вариант 4.png'
      }
    ],
    // Male armors (three levels).
    maleArmors: [
      {
        id: 'male_armor_1',
        name: 'Молодецкий доспех',
        src: 'sprites/кастомизация основного персонажа/Броня/Мужская броня/1 уровень Молодецкий доспех.png'
      },
      {
        id: 'male_armor_2',
        name: 'Железный доспех',
        src: 'sprites/кастомизация основного персонажа/Броня/Мужская броня/2 уровень Железный доспех.png'
      },
      {
        id: 'male_armor_3',
        name: 'Богатырский доспех',
        src: 'sprites/кастомизация основного персонажа/Броня/Мужская броня/3 уровень Богатырский доспех.png'
      }
    ],
    // Female armors (three levels).
    femaleArmors: [
      {
        id: 'female_armor_1',
        name: 'Молодецкий подол',
        src: 'sprites/кастомизация основного персонажа/Броня/Женская броня/1 уровень Молодецкий подол.png'
      },
      {
        id: 'female_armor_2',
        name: 'Железный подол',
        src: 'sprites/кастомизация основного персонажа/Броня/Женская броня/2 уровень Железный подол.png'
      },
      {
        id: 'female_armor_3',
        name: 'Доспех Богатырши',
        src: 'sprites/кастомизация основного персонажа/Броня/Женская броня/3 уровень Доспех Богатырши.png'
      }
    ],
    // Weapons available in the game. Each weapon has a unique id and
    // descriptive name.
    weapons: [
      {
        id: 'weapon_bryn',
        name: 'Брынькалка',
        src: 'sprites/кастомизация основного персонажа/Оружие/Брынькалка.png'
      },
      {
        id: 'weapon_bulava',
        name: 'Булава',
        src: 'sprites/кастомизация основного персонажа/Оружие/Булава.png'
      },
      {
        id: 'weapon_feather',
        name: 'Клинок из пера Жар-птицы',
        src: 'sprites/кастомизация основного персонажа/Оружие/Клинок из пера жар птицы.png'
      },
      {
        id: 'weapon_kolun',
        name: 'Колун',
        src: 'sprites/кастомизация основного персонажа/Оружие/Колун.png'
      },
      {
        id: 'weapon_kopyo',
        name: 'Копьё',
        src: 'sprites/кастомизация основного персонажа/Оружие/Копье.png'
      },
      {
        id: 'weapon_metelka',
        name: 'Метёлка',
        src: 'sprites/кастомизация основного персонажа/Оружие/Метелка.png'
      },
      {
        id: 'weapon_mech',
        name: 'Меч булатный',
        src: 'sprites/кастомизация основного персонажа/Оружие/Меч булатный.png'
      },
      {
        id: 'weapon_palochka',
        name: 'Палочка-выручалочка',
        src: 'sprites/кастомизация основного персонажа/Оружие/Палочка-выручалочка.png'
      }
    ],
    // Mounts available to the player. Each mount has a rank, base
    // damage bonus, speed bonus and levels skip bonus per hour.
    mountSamples: [
      {
        id: 'mount_konek',
        name: 'Конёк-Горбунок',
        src: 'sprites/Ездовые животные/Ранг 3 М/Конек-горбунок.png',
        rank: 'М',
        bonusDmg: 0.20,
        bonusSpeed: 0.15,
        skipLevels: 3
      },
      {
        id: 'mount_ship',
        name: 'Летучий корабль',
        src: 'sprites/Ездовые животные/Ранг 4 Б/Летучий корабль.png',
        rank: 'Б',
        bonusDmg: 0.25,
        bonusSpeed: 0.20,
        skipLevels: 4
      },
      {
        id: 'mount_carpet',
        name: 'Ковер-самолёт',
        src: 'sprites/Ездовые животные/Ранг 5 В/Ковер самолет.png',
        rank: 'В',
        bonusDmg: 0.30,
        bonusSpeed: 0.25,
        skipLevels: 5
      },
      {
        id: 'mount_stupa',
        name: 'Ступа Бабы Яги',
        src: 'sprites/Ездовые животные/Ранг 5 В/ступа бабы Яги.png',
        rank: 'В',
        bonusDmg: 0.35,
        bonusSpeed: 0.30,
        skipLevels: 5
      },
      {
        id: 'mount_kid',
        name: 'Детёныш Чудо-Юдо рыбы-кита',
        src: 'sprites/Ездовые животные/Ранг 6 Л/Детеныш чудо-юдо рыбы кит.png',
        rank: 'Л',
        bonusDmg: 0.45,
        bonusSpeed: 0.35,
        skipLevels: 6
      }
    ],
    // Pets available to the player. Each pet provides a bonus when
    // active. The baseBonus typically affects currency or DPS.
    petSamples: [
      {
        id: 'pet_juchka',
        name: 'Жучка',
        src: 'sprites/Питомцы/Ранг 1 Ж/Жучка.png',
        rank: 'Ж',
        type: 'gold',
        baseBonus: 0.05
      },
      {
        id: 'pet_corvus',
        name: 'Черный ворон',
        src: 'sprites/Питомцы/Ранг 1 Ж/Черный ворон.png',
        rank: 'Ж',
        type: 'gold',
        baseBonus: 0.05
      },
      {
        id: 'pet_whiterfish',
        name: 'Белая рыба',
        src: 'sprites/Питомцы/Ранг 2 П/Белая рыба.png',
        rank: 'П',
        type: 'gold',
        baseBonus: 0.08
      },
      {
        id: 'pet_bunny',
        name: 'Зайчик-побегайчик',
        src: 'sprites/Питомцы/Ранг 2 П/Зайчик-побегайчик.png',
        rank: 'П',
        type: 'gold',
        baseBonus: 0.08
      },
      {
        id: 'pet_rooster',
        name: 'Петушок-золотой гребешок',
        src: 'sprites/Питомцы/Ранг 2 П/Петушок-золотой гребешок.png',
        rank: 'П',
        type: 'gold',
        baseBonus: 0.08
      },
      {
        id: 'pet_mishka',
        name: 'Мишка',
        src: 'sprites/Питомцы/Ранг 3 М/Мишка.png',
        rank: 'М',
        type: 'gold',
        baseBonus: 0.12
      },
      {
        id: 'pet_wolf',
        name: 'Серый волк',
        src: 'sprites/Питомцы/Ранг 4 Б/Серый волк.png',
        rank: 'Б',
        type: 'gold',
        baseBonus: 0.15
      },
      {
        id: 'pet_firebird',
        name: 'Жар-птица',
        src: 'sprites/Питомцы/Ранг 5 В/Жар-птица.png',
        rank: 'В',
        type: 'gold',
        baseBonus: 0.20
      },
      {
        id: 'pet_semargl',
        name: 'Семаргл',
        src: 'sprites/Питомцы/Ранг 6 Л/Семаргл.png',
        rank: 'Л',
        type: 'gold',
        baseBonus: 0.30
      }
    ],
    // Background images for the battle area. Cycle through these
    // depending on the current range of days.
    backgrounds: {
      day1: 'sprites/Фоны/Фон прохождения дня 1.png',
      day2: 'sprites/Фоны/Фон прохождения дня 2.png'
    }
  };

  /*
   * BODY_HEAD_ANCHORS defines how to align the head relative to the
   * torso for each body sprite. Each entry defines the offset to
   * apply to the head image so it sits naturally on the shoulders.
   */
  const BODY_HEAD_ANCHORS = {
    male_body_1: { headOffsetX: 0, headOffsetY: -40 },
    male_body_2: { headOffsetX: 0, headOffsetY: -40 },
    male_body_3: { headOffsetX: 0, headOffsetY: -40 },
    female_body_1: { headOffsetX: 0, headOffsetY: -36 },
    female_body_2: { headOffsetX: 0, headOffsetY: -36 },
    female_body_3: { headOffsetX: 0, headOffsetY: -36 }
  };

  /*
   * ENEMY_SPRITES maps each zone to an array of enemy sprite paths.
   * Each array includes both regular enemies and bosses for that zone.
   * Bosses may appear multiple times in the list. The game picks
   * randomly from the array when spawning enemies in that zone.
   */
  const ENEMY_SPRITES = {
    1: [
      'sprites/Противники/1 уровень Злой лес/Аушка Босс вариант 1.png',
      'sprites/Противники/1 уровень Злой лес/Злой пень 1 вариант.png',
      'sprites/Противники/1 уровень Злой лес/Злой пень 2 вариант.png',
      'sprites/Противники/1 уровень Злой лес/Злой пень 3 вариант.png',
      'sprites/Противники/1 уровень Злой лес/Лихо одноглазое Босс вариант 2.png',
      'sprites/Противники/1 уровень Злой лес/Мавка Босс вариант 3.png'
    ],
    2: [
      'sprites/Противники/2 уровень Лиходеи/Лиходей.png',
      'sprites/Противники/2 уровень Лиходеи/Соловей разбойник Босс.png'
    ],
    3: [
      'sprites/Противники/3 уровень Бусурмане/Бусурманин.png',
      'sprites/Противники/3 уровень Бусурмане/Тугарин Змей Босс.png'
    ],
    4: [
      'sprites/Противники/4 уровень Иноземцы/Иноземец вариант 1.png',
      'sprites/Противники/4 уровень Иноземцы/Иноземец вариант 2.png',
      'sprites/Противники/4 уровень Иноземцы/Иноземец Босс.png'
    ],
    5: [
      'sprites/Противники/5 уровень Мертвяки/Мертвяк вариант 1.png',
      'sprites/Противники/5 уровень Мертвяки/Мертвяк вариант 2.png',
      'sprites/Противники/5 уровень Мертвяки/Кощей Босс.png'
    ],
    6: [
      'sprites/Противники/6 уровень Нечисть/Сила нечистая 1 вариант.png',
      'sprites/Противники/6 уровень Нечисть/Сила нечистая 2 вариант.png',
      'sprites/Противники/6 уровень Нечисть/Сила нечистая 3 вариант.png',
      'sprites/Противники/6 уровень Нечисть/Мара Босс.png'
    ],
    7: [
      'sprites/Противники/7 уровень Черти/Чертенок вариант 1.png',
      'sprites/Противники/7 уровень Черти/Чертенок вариант 2.png',
      'sprites/Противники/7 уровень Черти/Черт Босс.png'
    ],
    8: [
      'sprites/Противники/8-10 уровни Случайные боссы/Алконост.png',
      'sprites/Противники/8-10 уровни Случайные боссы/Великий полоз.png',
      'sprites/Противники/8-10 уровни Случайные боссы/Верлиока.png',
      'sprites/Противники/8-10 уровни Случайные боссы/Жердяй.png',
      'sprites/Противники/8-10 уровни Случайные боссы/Идолище поганное.png',
      'sprites/Противники/8-10 уровни Случайные боссы/Корочун.png',
      'sprites/Противники/8-10 уровни Случайные боссы/Полудница.png',
      'sprites/Противники/8-10 уровни Случайные боссы/Черномор.png'
    ]
  };

  /*
   * HERO_DEFS defines the available battle heroes that can be hired by
   * the player. Ideally these would be loaded dynamically from the
   * sprites/Боевые герои directories but for simplicity they are
   * explicitly enumerated. Each hero has an id, name, rank, base DPS
   * and base hire cost in Ag (серебро).
   */
  const HERO_DEFS = [
    { id: 'hero_baba_yaga', name: 'Баба-Яга', rank: 'Ж', baseDps: 50, baseCost: 200 },
    { id: 'hero_leshy', name: 'Леший', rank: 'Ж', baseDps: 60, baseCost: 250 },
    { id: 'hero_ivan_durak', name: 'Иван-дурак', rank: 'Ж', baseDps: 70, baseCost: 300 },
    { id: 'hero_gamajun', name: 'Гамаюн', rank: 'П', baseDps: 150, baseCost: 800 },
    { id: 'hero_kolobok', name: 'Колобок', rank: 'П', baseDps: 180, baseCost: 900 },
    { id: 'hero_bulat', name: 'Булат-молодец', rank: 'М', baseDps: 250, baseCost: 1600 },
    { id: 'hero_ivan_tsarevich', name: 'Иван Царевич', rank: 'М', baseDps: 300, baseCost: 2000 },
    { id: 'hero_sadko', name: 'Садко', rank: 'М', baseDps: 280, baseCost: 1800 },
    { id: 'hero_anika', name: 'Аника', rank: 'Б', baseDps: 450, baseCost: 4000 },
    { id: 'hero_vas_miku', name: 'Василиса Микулишна', rank: 'Б', baseDps: 500, baseCost: 4500 },
    { id: 'hero_volga', name: 'Вольга Святославович', rank: 'Б', baseDps: 520, baseCost: 4800 },
    { id: 'hero_nastasya_kor', name: 'Настасья Королевична', rank: 'Б', baseDps: 480, baseCost: 4600 },
    { id: 'hero_nastasya_mik', name: 'Настасья Микулишна', rank: 'Б', baseDps: 460, baseCost: 4400 },
    { id: 'hero_33_bogatyrs', name: 'Тридцать три богатыря', rank: 'Б', baseDps: 600, baseCost: 6000 },
    { id: 'hero_feenist', name: 'Финист ясный сокол', rank: 'Б', baseDps: 580, baseCost: 5500 },
    { id: 'hero_alyosha', name: 'Алёша Попович', rank: 'В', baseDps: 800, baseCost: 10000 },
    { id: 'hero_belomor', name: 'Голова Беломора', rank: 'В', baseDps: 820, baseCost: 11000 },
    { id: 'hero_dobrynya', name: 'Добрыня Никитич', rank: 'В', baseDps: 900, baseCost: 12000 },
    { id: 'hero_ilya_muromets', name: 'Илья Муромец', rank: 'В', baseDps: 950, baseCost: 12500 },
    { id: 'hero_marya', name: 'Марья Моревна', rank: 'В', baseDps: 880, baseCost: 11800 },
    { id: 'hero_mikula', name: 'Микула Селянович', rank: 'В', baseDps: 870, baseCost: 11600 },
    { id: 'hero_svyatogor', name: 'Святогор', rank: 'В', baseDps: 920, baseCost: 12200 },
    { id: 'hero_tzar_morskoy', name: 'Царь морской', rank: 'В', baseDps: 940, baseCost: 12400 },
    { id: 'hero_zmey', name: 'Змей Горыныч', rank: 'Л', baseDps: 1400, baseCost: 20000 },
    { id: 'hero_morozko', name: 'Морозко', rank: 'Л', baseDps: 1350, baseCost: 19500 },
    { id: 'hero_perun', name: 'Перун', rank: 'Л', baseDps: 1500, baseCost: 21000 },
    { id: 'hero_svarozhich', name: 'Сварожич', rank: 'Л', baseDps: 1450, baseCost: 20500 },
    { id: 'hero_stribog', name: 'Стрибог', rank: 'Л', baseDps: 1420, baseCost: 20200 },
    { id: 'hero_troyan', name: 'Троян', rank: 'Л', baseDps: 1380, baseCost: 19800 }
  ];

  /*
   * BUILDING_DEFS defines the production lines available in the game.
   * Each line corresponds loosely to the levels of production described
   * in the game design (Люд, Сказочные рыболовы, etc.). Each object
   * contains base incomes and base costs. Additional lines can be
   * added here but must have unique IDs.
   */
  const BUILDING_DEFS = [
    {
      id: 'b1',
      name: 'Люд',
      baseIncomeCu: 2,
      baseIncomeAg: 0,
      baseCostCu: 50
    },
    {
      id: 'b2',
      name: 'Сказочные рыболовы',
      baseIncomeCu: 8,
      baseIncomeAg: 0,
      baseCostCu: 150
    },
    {
      id: 'b3',
      name: 'Сказочные животные',
      baseIncomeCu: 25,
      baseIncomeAg: 1,
      baseCostCu: 600
    },
    {
      id: 'b4',
      name: 'Сказочное жильё',
      baseIncomeCu: 60,
      baseIncomeAg: 4,
      baseCostCu: 1500
    },
    {
      id: 'b5',
      name: 'Мастера',
      baseIncomeCu: 200,
      baseIncomeAg: 20,
      baseCostCu: 5000
    },
    {
      id: 'b6',
      name: 'Молодо-зелено',
      baseIncomeCu: 400,
      baseIncomeAg: 50,
      baseCostCu: 20000
    }
  ];

  /*
   * UPGRADE_DEFS defines the temporary upgrades that players can
   * purchase using Cu and Ag. Each upgrade has a description and
   * per-level effect. Upgrades persist until pererogdenie (rebirth).
   */
  const UPGRADE_DEFS = [
    {
      id: 'up_dmg_all',
      name: 'Сила дружины',
      desc: '+5% урона всем героям',
      baseCostCu: 1000,
      baseCostAg: 0,
      dmgAllPerLevel: 0.05
    },
    {
      id: 'up_dmg_main',
      name: 'Сила главного героя',
      desc: '+10% урона главному герою',
      baseCostCu: 0,
      baseCostAg: 500,
      dmgMainPerLevel: 0.10
    },
    {
      id: 'up_speed',
      name: 'Скорость дружины',
      desc: '+3% скорости атаки',
      baseCostCu: 800,
      baseCostAg: 200,
      atkSpeedPerLevel: 0.03
    },
    {
      id: 'up_cu',
      name: 'Жадность к меди',
      desc: '+10% добычи меди',
      baseCostCu: 500,
      baseCostAg: 0,
      cuPerLevel: 0.10
    },
    {
      id: 'up_ag',
      name: 'Жадность к серебру',
      desc: '+10% добычи серебра',
      baseCostCu: 0,
      baseCostAg: 500,
      agPerLevel: 0.10
    },
    {
      id: 'up_enemy_hp',
      name: 'Слабость врагов',
      desc: '-5% здоровья врагов',
      baseCostCu: 1500,
      baseCostAg: 500,
      enemyHpPerLevel: -0.05
    },
    {
      id: 'up_build_cost',
      name: 'Умелые строители',
      desc: '-3% стоимости построек',
      baseCostCu: 2000,
      baseCostAg: 800,
      buildingCostPerLevel: -0.03
    }
  ];

  /*
   * SHOP_ITEMS defines items available in the shop. Items are
   * purchased with Au (gold). Loot chests yield cards for heroes.
   */
  const SHOP_ITEMS = [
    {
      id: 'shop_chest_common',
      name: 'Обычный сундук',
      desc: 'Карты героев низких рангов',
      costAu: 10,
      type: 'chest_common'
    },
    {
      id: 'shop_chest_rare',
      name: 'Сказочный сундук',
      desc: 'Карты героев средних рангов',
      costAu: 50,
      type: 'chest_rare'
    },
    {
      id: 'shop_chest_legend',
      name: 'Легендарный сундук',
      desc: 'Карты героев высших рангов',
      costAu: 150,
      type: 'chest_legend'
    }
  ];

  /*
   * ACHIEVEMENT_DEFS defines achievements with conditions (check
   * functions) and rewards. When a check returns true, the
   * achievement is marked complete and reward is given.
   */
  const ACHIEVEMENT_DEFS = [
    {
      id: 'ach_day10',
      name: 'Первые шаги',
      desc: 'Достигнуть дня 10',
      check: (s) => s.maxDay >= 10,
      reward: { au: 5 }
    },
    {
      id: 'ach_day100',
      name: 'Сотня дней',
      desc: 'Достигнуть дня 100',
      check: (s) => s.maxDay >= 100,
      reward: { au: 20 }
    },
    {
      id: 'ach_cu1000',
      name: 'Тысяча меди',
      desc: 'Накопить 1000 меди',
      check: (s) => s.currencies.cuTotal >= 1000,
      reward: { au: 3 }
    }
  ];

  /*
   * State object holds all runtime data. Persistent fields are saved
   * to localStorage on each update. Many nested properties track
   * currencies, hero configurations, global multipliers, etc.
   */
  const state = {
    // Currency values and totals earned.
    currencies: {
      cu: 0,
      ag: 0,
      au: 0,
      by: 0,
      pd: 0,
      gr: 0,
      cuTotal: 0,
      agTotal: 0
    },
    // Main hero appearance and configuration.
    heroConfig: {
      name: '',
      gender: 'male',
      bodyId: null,
      armorId: null,
      headId: null,
      weaponId: null
    },
    // Base stats for the main hero (DPS and attack speed multipliers).
    heroStats: {
      baseDps: 1,
      dmgMult: 1,
      atkSpeed: 1
    },
    // Global multipliers affecting all heroes and production.
    globalMult: {
      dmgAll: 1,
      dmgMain: 1,
      atkSpeed: 1,
      cuIncome: 1,
      agIncome: 1,
      enemyHp: 1,
      buildingCost: 1
    },
    // Wave state: current day, maximum day reached and enemy list.
    day: 1,
    maxDay: 1,
    wave: {
      timeLeft: WAVE_DURATION,
      enemies: [],
      isBoss: false
    },
    // Arrays to hold hero instances, building instances, upgrade
    // instances, pets, mounts, map nodes and achievements.
    heroes: [],
    buildings: [],
    upgrades: [],
    pets: [],
    activePets: [],
    mounts: [],
    activeMountId: null,
    mapNodes: [],
    achievements: [],
    // Skill state tracks cooldown and active durations for each skill.
    skillState: {
      flower: { cdLeft: 0, activeUntil: 0 },
      wand: { cdLeft: 0, activeUntil: 0 },
      boots: { cdLeft: 0, activeUntil: 0 },
      hat: { cdLeft: 0, activeUntil: 0 },
      comb: { cdLeft: 0, activeUntil: 0 },
      ball: { cdLeft: 0, activeUntil: 0 }
    },
    // Cooldown for attack click (меч). When >0, cannot click again.
    attackClickCdLeft: 0,
    // Last timestamp used for delta time calculation.
    lastTimestamp: null,
    // Merchant: time until next spawn and active flag.
    merchant: {
      timeToNext: 180,
      active: false
    }
  };

  // DOM references object to hold frequently accessed elements.
  const dom = {};

  /*
   * cacheDom populates the `dom` object with references to HTML
   * elements. This reduces repeated document.getElementById calls.
   */
  function cacheDom() {
    dom.splashScreen = document.getElementById('splash-screen');
    dom.startGameBtn = document.getElementById('start-game-btn');
    dom.cuAmount = document.getElementById('cu-amount');
    dom.agAmount = document.getElementById('ag-amount');
    dom.auAmount = document.getElementById('au-amount');
    dom.dayNumber = document.getElementById('day-number');
    dom.maxDay = document.getElementById('max-day');
    dom.waveLabel = document.getElementById('wave-label');
    dom.waveTimer = document.getElementById('wave-timer');
    dom.cpValue = document.getElementById('cp-value');
    dom.battleBg = document.getElementById('battle-background');
    dom.enemiesArea = document.getElementById('enemies-area');
    dom.clickGoldBtn = document.getElementById('click-gold-btn');
    dom.clickAttackBtn = document.getElementById('click-attack-btn');
    dom.attackClickCd = document.getElementById('attack-click-cd');

    dom.heroBody = document.getElementById('hero-body');
    dom.heroArmor = document.getElementById('hero-armor');
    dom.heroHead = document.getElementById('hero-head');
    dom.heroWeapon = document.getElementById('hero-weapon');
    dom.mountSprite = document.getElementById('mount-sprite');

    dom.tabButtons = document.querySelectorAll('.tab-btn');
    dom.tabPanes = document.querySelectorAll('.tab-pane');

    dom.gatheringList = document.getElementById('gathering-list');
    dom.heroesList = document.getElementById('heroes-list');
    dom.upgradesList = document.getElementById('upgrades-list');
    dom.rebirthInfo = document.getElementById('rebirth-info');
    dom.rebirthBtn = document.getElementById('rebirth-btn');
    dom.shopList = document.getElementById('shop-list');
    dom.petsSection = document.getElementById('pets-section');
    dom.mountsSection = document.getElementById('mounts-section');
    dom.mapInfo = document.getElementById('map-info');
    dom.mapGrid = document.getElementById('map-grid');
    dom.achievementsList = document.getElementById('achievements-list');

    // Character creation modal
    dom.ccBackdrop = document.getElementById('character-creation');
    dom.ccNameInput = document.getElementById('hero-name-input');
    dom.ccBodySelect = document.getElementById('hero-body-select');
    dom.ccArmorSelect = document.getElementById('hero-armor-select');
    dom.ccHeadSelect = document.getElementById('hero-head-select');
    dom.ccWeaponSelect = document.getElementById('hero-weapon-select');
    dom.ccPreviewBody = document.getElementById('cc-body');
    dom.ccPreviewArmor = document.getElementById('cc-armor');
    dom.ccPreviewHead = document.getElementById('cc-head');
    dom.ccPreviewWeapon = document.getElementById('cc-weapon');
    dom.ccConfirmBtn = document.getElementById('cc-confirm-btn');
    dom.ccGenderInputs = document.querySelectorAll('input[name="hero-gender"]');

    // Generic modal
    dom.genericBackdrop = document.getElementById('generic-modal-backdrop');
    dom.genericTitle = document.getElementById('generic-modal-title');
    dom.genericContent = document.getElementById('generic-modal-content');
    dom.genericClose = document.getElementById('generic-modal-close');

    // Victory modal
    dom.victoryBackdrop = document.getElementById('victory-modal-backdrop');
    dom.victoryText = document.getElementById('victory-text');
    dom.victoryClose = document.getElementById('victory-close-btn');

    // Merchant modal
    dom.merchantBackdrop = document.getElementById('merchant-modal-backdrop');
    dom.merchantText = document.getElementById('merchant-text');
    dom.merchantAccept = document.getElementById('merchant-accept-btn');
    dom.merchantDecline = document.getElementById('merchant-decline-btn');
    dom.merchantFloat = document.getElementById('merchant-float');

    // Skill buttons
    dom.skillFlower = document.getElementById('skill-flower');
    dom.skillWand = document.getElementById('skill-wand');
    dom.skillBoots = document.getElementById('skill-boots');
    dom.skillHat = document.getElementById('skill-hat');
    dom.skillComb = document.getElementById('skill-comb');
    dom.skillBall = document.getElementById('skill-ball');
    dom.skillOverlays = document.querySelectorAll('.cooldown-overlay');
  }

  /*
   * setupEventListeners registers all necessary DOM event handlers. It
   * binds click events to buttons, changes on selects for character
   * creation, and ensures the game saves before the page unloads.
   */
  function setupEventListeners() {
    dom.startGameBtn.addEventListener('click', onStartGame);
    dom.clickGoldBtn.addEventListener('click', onGoldClick);
    dom.clickAttackBtn.addEventListener('click', onAttackClick);

    dom.tabButtons.forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    dom.rebirthBtn.addEventListener('click', onRebirthClick);

    // Character creation listeners
    dom.ccConfirmBtn.addEventListener('click', onConfirmCharacter);
    dom.ccGenderInputs.forEach(inp => {
      inp.addEventListener('change', () => {
        state.heroConfig.gender = inp.value;
        refreshCharacterCreationOptions();
        updateCharacterPreview();
      });
    });
    dom.ccBodySelect.addEventListener('change', updateCharacterPreview);
    dom.ccArmorSelect.addEventListener('change', updateCharacterPreview);
    dom.ccHeadSelect.addEventListener('change', updateCharacterPreview);
    dom.ccWeaponSelect.addEventListener('change', updateCharacterPreview);

    // Generic modal close
    dom.genericClose.addEventListener('click', () => hideElement(dom.genericBackdrop));

    // Victory modal close
    dom.victoryClose.addEventListener('click', () => hideElement(dom.victoryBackdrop));

    // Merchant modal buttons
    dom.merchantAccept.addEventListener('click', onMerchantAccept);
    dom.merchantDecline.addEventListener('click', onMerchantDecline);
    dom.merchantFloat.addEventListener('click', onMerchantFound);

    // Skill buttons
    dom.skillFlower.addEventListener('click', () => useSkill('flower'));
    dom.skillWand.addEventListener('click', () => useSkill('wand'));
    dom.skillBoots.addEventListener('click', () => useSkill('boots'));
    dom.skillHat.addEventListener('click', () => useSkill('hat'));
    dom.skillComb.addEventListener('click', () => useSkill('comb'));
    dom.skillBall.addEventListener('click', () => useSkill('ball'));

    // Save before leaving page
    window.addEventListener('beforeunload', saveGameThrottled);
  }

  // Switch active tab in the bottom panel.
  function switchTab(tabId) {
    dom.tabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    dom.tabPanes.forEach(pane => {
      pane.classList.toggle('active', pane.id === 'tab-' + tabId);
    });
  }

  // Show/hide helper functions for modals.
  function showElement(el) {
    el.classList.remove('hidden');
  }
  function hideElement(el) {
    el.classList.add('hidden');
  }

  function showSplash() {
    showElement(dom.splashScreen);
  }

  function hideSplash() {
    hideElement(dom.splashScreen);
  }

  // Convert large numbers to formatted string with suffixes.
  function formatNumber(n) {
    if (n < 1000) return n.toFixed(0);
    const suffixes = ['', 'k', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
    let i = 0;
    let val = n;
    while (val >= 1000 && i < suffixes.length - 1) {
      val /= 1000;
      i++;
    }
    // Keep 3 significant digits if possible
    const digits = Math.max(0, 3 - Math.floor(Math.log10(val)) - 1);
    return val.toFixed(digits) + suffixes[i];
  }

  // ===== Character creation =====

  // Open character creation modal and populate options.
  function openCharacterCreation() {
    hideSplash();
    refreshCharacterCreationOptions();
    updateCharacterPreview();
    showElement(dom.ccBackdrop);
  }

  // Rebuild select elements based on current gender.
  function refreshCharacterCreationOptions() {
    const gender = state.heroConfig.gender || 'male';
    const bodies = gender === 'male' ? SPRITES.maleBodies : SPRITES.femaleBodies;
    const armors = gender === 'male' ? SPRITES.maleArmors : SPRITES.femaleArmors;

    fillSelect(dom.ccBodySelect, bodies);
    fillSelect(dom.ccArmorSelect, armors);
    fillSelect(dom.ccHeadSelect, SPRITES.heads);
    fillSelect(dom.ccWeaponSelect, SPRITES.weapons);
  }

  // Helper to fill a <select> element with options from items array.
  function fillSelect(selectEl, items) {
    const prevValue = selectEl.value;
    selectEl.innerHTML = '';
    items.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item.id;
      opt.textContent = item.name;
      selectEl.appendChild(opt);
    });
    // Keep previous selection if it exists in new list
    if (items.length > 0) {
      if (prevValue && items.some(i => i.id === prevValue)) {
        selectEl.value = prevValue;
      } else {
        selectEl.selectedIndex = 0;
      }
    }
  }

  // Find an item by id in a list.
  function findById(list, id) {
    return list.find(item => item.id === id) || null;
  }

  // Update the preview hero in the character creation modal.
  function updateCharacterPreview() {
    const gender = getSelectedGender();
    const bodies = gender === 'male' ? SPRITES.maleBodies : SPRITES.femaleBodies;
    const armors = gender === 'male' ? SPRITES.maleArmors : SPRITES.femaleArmors;

    const bodyId = dom.ccBodySelect.value || (bodies[0] && bodies[0].id);
    const armorId = dom.ccArmorSelect.value || (armors[0] && armors[0].id);
    const headId = dom.ccHeadSelect.value || (SPRITES.heads[0] && SPRITES.heads[0].id);
    const weaponId = dom.ccWeaponSelect.value || (SPRITES.weapons[0] && SPRITES.weapons[0].id);

    const bodyObj = findById(bodies, bodyId);
    const armorObj = findById(armors, armorId);
    const headObj = findById(SPRITES.heads, headId);
    const weaponObj = findById(SPRITES.weapons, weaponId);

    if (bodyObj) dom.ccPreviewBody.src = bodyObj.src;
    if (armorObj) dom.ccPreviewArmor.src = armorObj.src;
    if (headObj) dom.ccPreviewHead.src = headObj.src;
    if (weaponObj) dom.ccPreviewWeapon.src = weaponObj.src;

    // Position the head on the body correctly
    const anchor = BODY_HEAD_ANCHORS[bodyObj ? bodyObj.id : 'male_body_1'] || { headOffsetX: 0, headOffsetY: -40 };
    dom.ccPreviewBody.style.left = '50%';
    dom.ccPreviewBody.style.bottom = '0';
    dom.ccPreviewArmor.style.left = '50%';
    dom.ccPreviewArmor.style.bottom = '0';
    dom.ccPreviewHead.style.left = '50%';
    dom.ccPreviewHead.style.bottom = '0';
    dom.ccPreviewHead.style.transform = 'translateX(-50%) translateY(' + anchor.headOffsetY + 'px)';
    dom.ccPreviewWeapon.style.left = '50%';
    dom.ccPreviewWeapon.style.bottom = '0';

    // Update state heroConfig
    state.heroConfig.gender = gender;
    state.heroConfig.bodyId = bodyId;
    state.heroConfig.armorId = armorId;
    state.heroConfig.headId = headId;
    state.heroConfig.weaponId = weaponId;
  }

  // Get currently selected gender from radio buttons.
  function getSelectedGender() {
    let gender = 'male';
    dom.ccGenderInputs.forEach(inp => {
      if (inp.checked) gender = inp.value;
    });
    return gender;
  }

  // Handle confirm button in character creation modal.
  function onConfirmCharacter() {
    const name = (dom.ccNameInput.value || '').trim() || 'Иван';
    state.heroConfig.name = name;
    // Player chooses final appearance; apply sprites now.
    hideElement(dom.ccBackdrop);
    hideSplash();
    applyHeroSprites();
    startNewWave();
    saveGameThrottled();
  }

  function onStartGame() {
    openCharacterCreation();
  }

  // Apply the main hero sprites to the battle screen using the
  // current heroConfig. Also updates mount sprites.
  function applyHeroSprites() {
    const gender = state.heroConfig.gender || 'male';
    const bodies = gender === 'male' ? SPRITES.maleBodies : SPRITES.femaleBodies;
    const armors = gender === 'male' ? SPRITES.maleArmors : SPRITES.femaleArmors;

    const bodyObj = findById(bodies, state.heroConfig.bodyId) || bodies[0];
    const armorObj = findById(armors, state.heroConfig.armorId) || armors[0];
    const headObj = findById(SPRITES.heads, state.heroConfig.headId) || SPRITES.heads[0];
    const weaponObj = findById(SPRITES.weapons, state.heroConfig.weaponId) || SPRITES.weapons[0];

    if (bodyObj) {
      dom.heroBody.src = bodyObj.src;
      dom.heroBody.dataset.bodyId = bodyObj.id;
    }
    if (armorObj) dom.heroArmor.src = armorObj.src;
    if (headObj) dom.heroHead.src = headObj.src;
    if (weaponObj) dom.heroWeapon.src = weaponObj.src;

    const anchor = BODY_HEAD_ANCHORS[bodyObj ? bodyObj.id : 'male_body_1'] || { headOffsetX: 0, headOffsetY: -40 };
    dom.heroBody.style.left = '50%';
    dom.heroBody.style.bottom = '0';
    dom.heroArmor.style.left = '50%';
    dom.heroArmor.style.bottom = '0';
    dom.heroHead.style.left = '50%';
    dom.heroHead.style.bottom = '0';
    dom.heroHead.style.transform = 'translateX(-50%) translateY(' + anchor.headOffsetY + 'px)';
    dom.heroWeapon.style.left = '50%';
    dom.heroWeapon.style.bottom = '0';

    // Display mount
    const mount = state.mounts.find(m => m.id === state.activeMountId);
    dom.mountSprite.innerHTML = '';
    if (mount) {
      const img = document.createElement('img');
      img.src = mount.src;
      dom.mountSprite.appendChild(img);
    }
  }

  // ===== Wave and enemies =====

  // Determine zone (set of enemies) based on day number.
  function getZoneForDay(day) {
    if (day <= 100) return 1;
    if (day <= 200) return 2;
    if (day <= 300) return 3;
    if (day <= 400) return 4;
    if (day <= 500) return 5;
    if (day <= 600) return 6;
    if (day <= 700) return 7;
    if (day <= 1000) return 8;
    const d = ((day - 1) % 700) + 1;
    return getZoneForDay(d);
  }

  // Update the battle background based on current day.
  function updateBackgroundForDay() {
    const d = state.day;
    const bg = d <= 300 ? SPRITES.backgrounds.day1 : d <= 600 ? SPRITES.backgrounds.day2 : (state.day % 2 === 0 ? SPRITES.backgrounds.day1 : SPRITES.backgrounds.day2);
    dom.battleBg.style.backgroundImage = bg ? 'url(' + bg + ')' : 'none';
  }

  // Create an enemy instance with HP and sprite for current day.
  function createEnemy() {
    const day = state.day;
    const isBoss = (day % 100 === 0);
    const zone = getZoneForDay(day);
    const spriteList = ENEMY_SPRITES[zone] || [];
    const sprite = spriteList.length ? spriteList[Math.floor(Math.random() * spriteList.length)] : '';

    const hpBase = 10 * Math.pow(1.10, day - 1);
    const hp = hpBase * (isBoss ? 50 : 1) * state.globalMult.enemyHp;

    const enemyEl = document.createElement('div');
    enemyEl.className = 'enemy';
    const enemySprite = document.createElement('div');
    enemySprite.className = 'enemy-sprite';
    if (sprite) {
      enemySprite.style.backgroundImage = 'url(' + sprite + ')';
    }
    const hpBar = document.createElement('div');
    hpBar.className = 'hp-bar';
    const hpBarInner = document.createElement('div');
    hpBarInner.className = 'hp-bar-inner';
    hpBar.appendChild(hpBarInner);
    enemyEl.appendChild(hpBar);
    enemyEl.appendChild(enemySprite);

    const width = dom.enemiesArea.clientWidth || 600;
    const x = 80 + Math.random() * (width - 120);
    enemyEl.style.left = x + 'px';
    const approach = Math.max(60, x - 20);
    enemyEl.style.setProperty('--approach-x', `-${approach}px`);
    const duration = 6 + Math.random() * 6;
    enemyEl.style.setProperty('--approach-duration', `${duration}s`);

    return {
      hp: hp,
      maxHp: hp,
      zone: zone,
      isBoss: isBoss,
      sprite: sprite,
      el: enemyEl,
      hpBarInner: hpBarInner
    };
  }

  // Start a new wave/day. Resets timer and spawns enemies.
  function startNewWave() {
    state.wave.timeLeft = WAVE_DURATION;
    state.wave.enemies = [];
    state.wave.isBoss = (state.day % 100 === 0);
    dom.enemiesArea.innerHTML = '';
    const count = state.wave.isBoss ? 1 : ENEMIES_PER_WAVE;
    for (let i = 0; i < count; i++) {
      const enemy = createEnemy();
      state.wave.enemies.push(enemy);
      dom.enemiesArea.appendChild(enemy.el);
    }
    updateBackgroundForDay();
    updateWaveUI();
  }

  // When wave is cleared, reward the player and advance to next day.
  function onWaveSuccess() {
    const day = state.day;
    const isBoss = (day % 100 === 0);
    // Calculate base rewards
    const baseCu = 20 * Math.pow(1.08, day - 1);
    const baseAg = day > 20 ? 1 * Math.pow(1.05, day - 20) : 0;
    gainCu(baseCu);
    gainAg(baseAg);
    if (isBoss) {
      const pdGain = Math.max(1, Math.floor(Math.pow(day, 1.05) / 80));
      state.currencies.pd += pdGain;
      showVictoryModal('Вы сокрушили босса дня ' + day + '! Получено подвигов: ' + pdGain);
    }
    state.day++;
    if (state.day > state.maxDay) state.maxDay = state.day;
    startNewWave();
  }

  // When time runs out and there are still enemies, reduce day.
  function onWaveFail() {
    if (state.day > 1) state.day--;
    startNewWave();
  }

  // Update wave-related UI elements.
  function updateWaveUI() {
    dom.dayNumber.textContent = state.day;
    dom.maxDay.textContent = state.maxDay;
    dom.waveLabel.textContent = state.wave.isBoss ? 'Босс' : state.day;
  }

  // ===== Damage and combat =====

  // Calculate DPS of main hero.
  function getHeroDps() {
    return state.heroStats.baseDps * state.heroStats.dmgMult * state.globalMult.dmgAll * state.globalMult.dmgMain;
  }

  // Calculate DPS of hired heroes.
  function getHeroesDps() {
    let total = 0;
    state.heroes.forEach(h => {
      if (!h.unlocked) return;
      const starsMult = 1 + 0.5 * h.stars;
      const dps = h.baseDps * Math.pow(1.10, h.level - 1) * starsMult;
      total += dps;
    });
    return total * state.globalMult.dmgAll;
  }

  // Sum DPS from main hero and all heroes, including pet bonuses.
  function getTotalDps() {
    let total = getHeroDps() + getHeroesDps();
    state.activePets.forEach(p => {
      if (p.type === 'gold') {
        total *= 1 + p.baseBonus;
      }
    });
    return total;
  }

  // Apply continuous DPS damage to first enemy.
  function applyContinuousDamage(dt) {
    const enemies = state.wave.enemies;
    if (!enemies.length) return;
    const dps = getTotalDps();
    if (dps <= 0) return;
    const dmg = dps * dt;
    const enemy = enemies[0];
    enemy.hp -= dmg;
    if (enemy.hp <= 0) {
      killEnemy(enemy);
      enemies.shift();
      if (enemy.el.parentNode === dom.enemiesArea) {
        dom.enemiesArea.removeChild(enemy.el);
      }
      if (!enemies.length) onWaveSuccess();
    } else {
      const ratio = enemy.hp / enemy.maxHp;
      enemy.hpBarInner.style.width = Math.max(0, Math.min(1, ratio)) * 100 + '%';
    }
  }

  // Kill enemy and reward the player. Regular enemies give Cu/Ag.
  function killEnemy(enemy) {
    const day = state.day;
    const baseCu = 5 * Math.pow(1.06, day - 1);
    const baseAg = day > 10 ? 0.5 * Math.pow(1.03, day - 10) : 0;
    gainCu(baseCu);
    gainAg(baseAg);
  }

  // ===== Currency helpers =====

  function gainCu(amount) {
    const val = amount * state.globalMult.cuIncome;
    state.currencies.cu += val;
    state.currencies.cuTotal += val;
  }
  function gainAg(amount) {
    const val = amount * state.globalMult.agIncome;
    state.currencies.ag += val;
    state.currencies.agTotal += val;
  }
  function gainAu(amount) {
    state.currencies.au += amount;
  }

  // ===== Click actions =====

  function onGoldClick() {
    const baseClick = 10;
    gainCu(baseClick);
  }

  function onAttackClick() {
    if (state.attackClickCdLeft > 0) return;
    const enemies = state.wave.enemies;
    if (!enemies.length) return;
    const enemy = enemies[0];
    const bonus = getTotalDps() * 1.5;
    enemy.hp -= bonus;
    if (enemy.hp <= 0) {
      killEnemy(enemy);
      enemies.shift();
      if (enemy.el.parentNode === dom.enemiesArea) {
        dom.enemiesArea.removeChild(enemy.el);
      }
      if (!enemies.length) onWaveSuccess();
    } else {
      const ratio = enemy.hp / enemy.maxHp;
      enemy.hpBarInner.style.width = Math.max(0, Math.min(1, ratio)) * 100 + '%';
    }
    state.attackClickCdLeft = ATTACK_CLICK_CD;
  }

  // ===== Production (buildings) =====

  function initBuildings() {
    state.buildings = BUILDING_DEFS.map(def => ({
      id: def.id,
      name: def.name,
      baseIncomeCu: def.baseIncomeCu,
      baseIncomeAg: def.baseIncomeAg,
      baseCostCu: def.baseCostCu,
      level: 0
    }));
    renderBuildings();
  }

  // Calculate income of a building based on level and multipliers.
  function getBuildingIncome(building) {
    if (building.level <= 0) return { cu: 0, ag: 0 };
    const mult = Math.pow(1.05, building.level - 1);
    return {
      cu: building.baseIncomeCu * building.level * mult * state.globalMult.cuIncome,
      ag: building.baseIncomeAg * building.level * mult * state.globalMult.agIncome
    };
  }

  // Purchase building levels in quantities. Deduct cost and update level.
  function buyBuilding(buildingId, count) {
    const b = state.buildings.find(x => x.id === buildingId);
    if (!b) return;
    for (let i = 0; i < count; i++) {
      const cost = b.baseCostCu * Math.pow(1.15, b.level) * state.globalMult.buildingCost;
      if (state.currencies.cu < cost) break;
      state.currencies.cu -= cost;
      b.level += 1;
    }
    renderBuildings();
  }

  // Render list of production buildings in the Sobiрательство tab.
  function renderBuildings() {
    const container = dom.gatheringList;
    container.innerHTML = '';
    state.buildings.forEach(b => {
      const line = document.createElement('div');
      line.className = 'list-item';
      const left = document.createElement('div');
      left.className = 'list-item-left';
      const income = getBuildingIncome(b);
      const info = document.createElement('div');
      info.innerHTML = '<strong>' + b.name + '</strong><br>Уровень: ' + b.level + ' | Доход/с: ' + formatNumber(income.cu) + ' Cu, ' + formatNumber(income.ag) + ' Ag';
      left.appendChild(info);
      const right = document.createElement('div');
      const btn1 = document.createElement('button');
      btn1.className = 'small-btn';
      btn1.textContent = '+1';
      btn1.addEventListener('click', () => buyBuilding(b.id, 1));
      const btn10 = document.createElement('button');
      btn10.className = 'small-btn';
      btn10.textContent = '+10';
      btn10.addEventListener('click', () => buyBuilding(b.id, 10));
      const btn100 = document.createElement('button');
      btn100.className = 'small-btn';
      btn100.textContent = '+100';
      btn100.addEventListener('click', () => buyBuilding(b.id, 100));
      right.appendChild(btn1);
      right.appendChild(btn10);
      right.appendChild(btn100);
      line.appendChild(left);
      line.appendChild(right);
      container.appendChild(line);
    });
  }

  // Apply production income per frame.
  function applyBuildingsIncome(dt) {
    state.buildings.forEach(b => {
      const inc = getBuildingIncome(b);
      if (inc.cu > 0) gainCu(inc.cu * dt);
      if (inc.ag > 0) gainAg(inc.ag * dt);
    });
  }

  // ===== Heroes =====

  function initHeroes() {
    state.heroes = HERO_DEFS.map((def, idx) => ({
      id: def.id,
      name: def.name,
      rank: def.rank,
      baseDps: def.baseDps,
      baseCost: def.baseCost,
      level: idx === 0 ? 1 : 0,
      unlocked: idx === 0,
      stars: 0,
      cards: 0
    }));
    renderHeroes();
  }

  function getHeroRankCostMult(rank) {
    switch (rank) {
      case 'Ж': return 1;
      case 'П': return 1.2;
      case 'М': return 1.5;
      case 'Б': return 2;
      case 'В': return 3;
      case 'Л': return 4;
      default: return 1;
    }
  }

  function getHeroLevelCost(hero) {
    const rankMult = getHeroRankCostMult(hero.rank);
    const base = hero.baseCost * rankMult;
    const lvl = Math.max(1, hero.level);
    return base * Math.pow(1.15, lvl - 1);
  }

  function hireHero(heroId) {
    const h = state.heroes.find(x => x.id === heroId);
    if (!h || h.unlocked) return;
    const cost = getHeroLevelCost({ ...h, level: 1 });
    if (state.currencies.ag < cost) return;
    state.currencies.ag -= cost;
    h.unlocked = true;
    h.level = 1;
    renderHeroes();
  }

  function levelUpHero(heroId) {
    const h = state.heroes.find(x => x.id === heroId);
    if (!h || !h.unlocked) return;
    const cost = getHeroLevelCost(h);
    if (state.currencies.ag < cost) return;
    state.currencies.ag -= cost;
    h.level += 1;
    renderHeroes();
  }

  function renderHeroes() {
    const container = dom.heroesList;
    container.innerHTML = '';
    state.heroes.forEach(h => {
      const line = document.createElement('div');
      line.className = 'list-item';
      const left = document.createElement('div');
      left.className = 'list-item-left';
      const info = document.createElement('div');
      const dps = h.unlocked ? h.baseDps * Math.pow(1.10, h.level - 1) * (1 + 0.5 * h.stars) : 0;
      info.innerHTML = '<strong>' + h.name + '</strong> [' + h.rank + ']<br>' + (h.unlocked ? 'Ур: ' + h.level + ' | Звёзды: ' + h.stars + ' | DPS: ' + formatNumber(dps) : 'Не нанят');
      left.appendChild(info);
      const right = document.createElement('div');
      if (!h.unlocked) {
        const btnHire = document.createElement('button');
        btnHire.className = 'small-btn';
        btnHire.textContent = 'Нанять (' + formatNumber(getHeroLevelCost({ ...h, level: 1 })) + ' Ag)';
        btnHire.addEventListener('click', () => hireHero(h.id));
        right.appendChild(btnHire);
      } else {
        const btnUp = document.createElement('button');
        btnUp.className = 'small-btn';
        btnUp.textContent = 'Улучшить (' + formatNumber(getHeroLevelCost(h)) + ' Ag)';
        btnUp.addEventListener('click', () => levelUpHero(h.id));
        right.appendChild(btnUp);
      }
      line.appendChild(left);
      line.appendChild(right);
      container.appendChild(line);
    });
  }

  // ===== Upgrades (temporaries) =====

  function initUpgrades() {
    state.upgrades = UPGRADE_DEFS.map(def => ({
      id: def.id,
      name: def.name,
      desc: def.desc,
      baseCostCu: def.baseCostCu,
      baseCostAg: def.baseCostAg,
      level: 0
    }));
    renderUpgrades();
  }

  function getUpgradeCost(up) {
    const lvl = up.level;
    const mult = Math.pow(1.2, lvl);
    return {
      cu: up.baseCostCu * mult,
      ag: up.baseCostAg * mult
    };
  }

  function buyUpgrade(id) {
    const up = state.upgrades.find(x => x.id === id);
    if (!up) return;
    const cost = getUpgradeCost(up);
    if (state.currencies.cu < cost.cu || state.currencies.ag < cost.ag) return;
    state.currencies.cu -= cost.cu;
    state.currencies.ag -= cost.ag;
    up.level += 1;
    recalcGlobalMultipliers();
    renderUpgrades();
  }

  // Recalculate global multipliers based on upgrade levels.
  function recalcGlobalMultipliers() {
    state.globalMult.dmgAll = 1;
    state.globalMult.dmgMain = 1;
    state.globalMult.atkSpeed = 1;
    state.globalMult.cuIncome = 1;
    state.globalMult.agIncome = 1;
    state.globalMult.enemyHp = 1;
    state.globalMult.buildingCost = 1;
    state.upgrades.forEach(up => {
      const lvl = up.level;
      if (!lvl) return;
      const def = UPGRADE_DEFS.find(d => d.id === up.id);
      if (!def) return;
      if (def.dmgAllPerLevel) {
        state.globalMult.dmgAll *= 1 + def.dmgAllPerLevel * lvl;
      }
      if (def.dmgMainPerLevel) {
        state.globalMult.dmgMain *= 1 + def.dmgMainPerLevel * lvl;
      }
      if (def.atkSpeedPerLevel) {
        state.globalMult.atkSpeed *= 1 + def.atkSpeedPerLevel * lvl;
      }
      if (def.cuPerLevel) {
        state.globalMult.cuIncome *= 1 + def.cuPerLevel * lvl;
      }
      if (def.agPerLevel) {
        state.globalMult.agIncome *= 1 + def.agPerLevel * lvl;
      }
      if (def.enemyHpPerLevel) {
        state.globalMult.enemyHp *= 1 + def.enemyHpPerLevel * lvl;
      }
      if (def.buildingCostPerLevel) {
        state.globalMult.buildingCost *= 1 + def.buildingCostPerLevel * lvl;
      }
    });
  }

  function renderUpgrades() {
    const container = dom.upgradesList;
    container.innerHTML = '';
    state.upgrades.forEach(up => {
      const line = document.createElement('div');
      line.className = 'list-item';
      const left = document.createElement('div');
      left.className = 'list-item-left';
      const info = document.createElement('div');
      const def = UPGRADE_DEFS.find(d => d.id === up.id);
      info.innerHTML = '<strong>' + up.name + '</strong><br>' + up.desc + '<br>Уровень: ' + up.level;
      left.appendChild(info);
      const right = document.createElement('div');
      const cost = getUpgradeCost(up);
      const btn = document.createElement('button');
      btn.className = 'small-btn';
      btn.textContent = 'Купить (' + formatNumber(cost.cu) + ' Cu, ' + formatNumber(cost.ag) + ' Ag)';
      btn.addEventListener('click', () => buyUpgrade(up.id));
      right.appendChild(btn);
      line.appendChild(left);
      line.appendChild(right);
      container.appendChild(line);
    });
  }

  // ===== Rebirth =====

  function calcRebirthGain() {
    const maxDay = state.maxDay;
    if (maxDay < 10) return 0;
    return Math.floor(Math.pow(maxDay, 1.2) / 50);
  }

  function renderRebirthInfo() {
    const gain = calcRebirthGain();
    dom.rebirthInfo.innerHTML = 'Максимальный достигнутый день: <strong>' + state.maxDay + '</strong><br>' + 'Подвигов сейчас: <strong>' + state.currencies.pd.toFixed(0) + '</strong><br>' + 'Если переродиться сейчас, вы получите ещё <strong>' + gain + '</strong> подвигов.';
  }

  function onRebirthClick() {
    const gain = calcRebirthGain();
    if (!confirm('Переродиться и начать путь заново? Вы получите подвигов: ' + gain)) {
      return;
    }
    state.currencies.pd += gain;
    // Reset Cu and Ag but keep Au, By and Gr
    state.currencies.cu = 0;
    state.currencies.ag = 0;
    state.day = 1;
    // Reset buildings
    state.buildings.forEach(b => (b.level = 0));
    // Reset hero levels but keep unlocks and stars
    state.heroes.forEach(h => {
      if (h.unlocked) h.level = 1;
    });
    // Reset temporary upgrades
    state.upgrades.forEach(u => (u.level = 0));
    recalcGlobalMultipliers();
    if (state.day > state.maxDay) state.maxDay = state.day;
    startNewWave();
    renderBuildings();
    renderHeroes();
    renderUpgrades();
    renderRebirthInfo();
    saveGameThrottled();
  }

  // ===== Shop =====

  function initShop() {
    renderShop();
  }

  function renderShop() {
    const container = dom.shopList;
    container.innerHTML = '';
    SHOP_ITEMS.forEach(item => {
      const line = document.createElement('div');
      line.className = 'list-item';
      const left = document.createElement('div');
      left.className = 'list-item-left';
      const info = document.createElement('div');
      info.innerHTML = '<strong>' + item.name + '</strong><br>' + item.desc + '<br>Цена: ' + item.costAu + ' Au';
      left.appendChild(info);
      const right = document.createElement('div');
      const btn = document.createElement('button');
      btn.className = 'small-btn';
      btn.textContent = 'Купить';
      btn.addEventListener('click', () => buyShopItem(item));
      right.appendChild(btn);
      line.appendChild(left);
      line.appendChild(right);
      container.appendChild(line);
    });
  }

  function buyShopItem(item) {
    if (state.currencies.au < item.costAu) return;
    state.currencies.au -= item.costAu;
    if (item.type === 'chest_common') {
      grantHeroCardsRandom(20);
    } else if (item.type === 'chest_rare') {
      grantHeroCardsRandom(50);
    } else if (item.type === 'chest_legend') {
      grantHeroCardsRandom(100);
    }
  }

  // Award a random hero cards count to a random hero.
  function grantHeroCardsRandom(count) {
    if (!state.heroes.length) return;
    const idx = Math.floor(Math.random() * state.heroes.length);
    const hero = state.heroes[idx];
    hero.cards = (hero.cards || 0) + count;
    showGenericModal('Сундук', 'Герой ' + hero.name + ' получил ' + count + ' карт.');
  }

  // ===== Pets and mounts =====

  function initPetsAndMounts() {
    // Initialize pets from definitions
    state.pets = SPRITES.petSamples.map(p => ({
      id: p.id,
      name: p.name,
      src: p.src,
      rank: p.rank,
      type: p.type,
      baseBonus: p.baseBonus,
      stars: 0,
      cards: 0,
      unlocked: true
    }));
    // Initialize mounts
    state.mounts = SPRITES.mountSamples.map(m => ({
      id: m.id,
      name: m.name,
      src: m.src,
      rank: m.rank,
      bonusDmg: m.bonusDmg,
      bonusSpeed: m.bonusSpeed,
      skipLevels: m.skipLevels,
      stars: 0,
      cards: 0,
      unlocked: true
    }));
    // Set defaults
    if (state.mounts.length) state.activeMountId = state.mounts[0].id;
    if (state.pets.length) state.activePets = [state.pets[0]];
    applyMountBonuses();
    renderPetsAndMounts();
  }

  // Render pets and mounts selection UI.
  function renderPetsAndMounts() {
    const petCont = dom.petsSection;
    petCont.innerHTML = '<h3>Боевые питомцы</h3>';
    state.pets.forEach(p => {
      const line = document.createElement('div');
      line.className = 'list-item';
      const left = document.createElement('div');
      left.className = 'list-item-left';
      if (p.src) {
        const img = document.createElement('img');
        img.className = 'icon';
        img.src = p.src;
        left.appendChild(img);
      }
      const info = document.createElement('div');
      const isActive = state.activePets.some(ap => ap.id === p.id);
      info.innerHTML = '<strong>' + p.name + '</strong><br>Ранг: ' + p.rank + ' | Бонус: +' + (p.baseBonus * 100) + '% к урону/золоту<br>Статус: ' + (isActive ? 'В бою' : 'Неактивен');
      left.appendChild(info);
      const right = document.createElement('div');
      const btn = document.createElement('button');
      btn.className = 'small-btn';
      btn.textContent = isActive ? 'Убрать' : 'Назначить';
      btn.addEventListener('click', () => togglePetActive(p.id));
      right.appendChild(btn);
      line.appendChild(left);
      line.appendChild(right);
      petCont.appendChild(line);
    });
    const mountCont = dom.mountsSection;
    mountCont.innerHTML = '<h3>Ездовые животные</h3>';
    state.mounts.forEach(m => {
      const line = document.createElement('div');
      line.className = 'list-item';
      const left = document.createElement('div');
      left.className = 'list-item-left';
      if (m.src) {
        const img = document.createElement('img');
        img.className = 'icon';
        img.src = m.src;
        left.appendChild(img);
      }
      const info = document.createElement('div');
      const isActive = (state.activeMountId === m.id);
      info.innerHTML = '<strong>' + m.name + '</strong><br>Ранг: ' + m.rank + ' | Урон +' + (m.bonusDmg * 100) + '% | Скорость +' + (m.bonusSpeed * 100) + '%<br>Статус: ' + (isActive ? 'Осёдлан' : 'Неактивен');
      left.appendChild(info);
      const right = document.createElement('div');
      const btn = document.createElement('button');
      btn.className = 'small-btn';
      btn.textContent = isActive ? 'Снять' : 'Оседлать';
      btn.addEventListener('click', () => setActiveMount(m.id));
      right.appendChild(btn);
      line.appendChild(left);
      line.appendChild(right);
      mountCont.appendChild(line);
    });
  }

  // Toggle pet active state. Up to 3 pets can be active simultaneously.
  function togglePetActive(id) {
    const pet = state.pets.find(p => p.id === id);
    if (!pet) return;
    const idx = state.activePets.findIndex(ap => ap.id === id);
    if (idx >= 0) {
      state.activePets.splice(idx, 1);
    } else {
      if (state.activePets.length >= 3) {
        state.activePets.shift();
      }
      state.activePets.push(pet);
    }
    renderPetsAndMounts();
  }

  // Set a mount as active or deactivate if it is currently active.
  function setActiveMount(id) {
    if (state.activeMountId === id) {
      state.activeMountId = null;
    } else {
      state.activeMountId = id;
    }
    applyMountBonuses();
    applyHeroSprites();
    renderPetsAndMounts();
  }

  // Apply bonuses from the currently active mount to hero stats.
  function applyMountBonuses() {
    let dmgMult = 1;
    let speedMult = 1;
    const m = state.mounts.find(mm => mm.id === state.activeMountId);
    if (m) {
      dmgMult *= 1 + m.bonusDmg;
      speedMult *= 1 + m.bonusSpeed;
    }
    state.heroStats.dmgMult = dmgMult;
    state.heroStats.atkSpeed = 1 * speedMult;
  }

  // ===== Map =====

  function initMap() {
    state.mapNodes = [];
    let idCounter = 1;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 14; c++) {
        const cost = 5 + r * 2 + c;
        const types = ['prod', 'hero', 'skill', 'pet', 'bless'];
        const type = types[Math.floor(Math.random() * types.length)];
        state.mapNodes.push({
          id: 'node_' + (idCounter++),
          row: r,
          col: c,
          open: false,
          costBy: cost,
          type: type
        });
      }
    }
    renderMap();
  }

  function renderMap() {
    dom.mapInfo.textContent = 'Открыто зон: ' + state.mapNodes.filter(n => n.open).length + ' из ' + state.mapNodes.length + '. Былины: ' + state.currencies.by.toFixed(0);
    const grid = dom.mapGrid;
    grid.innerHTML = '';
    state.mapNodes.forEach(node => {
      const cell = document.createElement('div');
      cell.className = 'map-cell' + (node.open ? ' open' : '');
      const inner = document.createElement('div');
      inner.className = 'map-cell-inner';
      inner.textContent = node.open ? '★' : node.costBy;
      cell.appendChild(inner);
      cell.addEventListener('click', () => onMapCellClick(node.id));
      grid.appendChild(cell);
    });
  }

  function onMapCellClick(id) {
    const node = state.mapNodes.find(n => n.id === id);
    if (!node || node.open) return;
    if (state.currencies.by < node.costBy) return;
    state.currencies.by -= node.costBy;
    node.open = true;
    applyMapNodeEffect(node);
    renderMap();
  }

  function applyMapNodeEffect(node) {
    if (node.type === 'prod') {
      state.globalMult.cuIncome *= 1.05;
      state.globalMult.agIncome *= 1.05;
    } else if (node.type === 'hero') {
      state.globalMult.dmgAll *= 1.03;
    } else if (node.type === 'skill') {
      SKILL_CONFIG.wand.cd = Math.max(600, SKILL_CONFIG.wand.cd - 60);
    } else if (node.type === 'pet') {
      state.currencies.by += 5;
    } else if (node.type === 'bless') {
      state.currencies.gr += 1;
    }
  }

  // ===== Skills =====

  function useSkill(id) {
    const cfg = SKILL_CONFIG[id];
    if (!cfg) return;
    const s = state.skillState[id];
    if (s.cdLeft > 0) return;
    const now = performance.now() / 1000;
    s.cdLeft = cfg.cd;
    s.activeUntil = cfg.duration ? now + cfg.duration : 0;
    // Execute specific effects
    if (id === 'flower') {
      useSkillFlower();
    } else if (id === 'wand') {
      useSkillWand();
    } else if (id === 'boots') {
      useSkillBoots();
    } else if (id === 'hat') {
      useSkillHat();
    } else if (id === 'comb') {
      openCharacterCreation();
    } else if (id === 'ball') {
      switchTab('map');
    }
  }

  function useSkillFlower() {
    const options = [
      { text: 'Золото', action: () => gainAu(5 + Math.floor(Math.random() * 15)) },
      { text: 'Карты героев', action: () => grantHeroCardsRandom(50) },
      { text: 'Былины', action: () => (state.currencies.by += 30) },
      { text: 'Подвиги', action: () => (state.currencies.pd += 2) },
      { text: 'Благодать', action: () => (state.currencies.gr += 2) },
      { text: 'Всё понемногу', action: () => { gainAu(3); state.currencies.by += 10; state.currencies.pd += 1; } }
    ];
    const prize = options[Math.floor(Math.random() * options.length)];
    prize.action();
    showGenericModal('Цветик-семицветик', 'Выпало: <strong>' + prize.text + '</strong>.');
  }

  function useSkillWand() {
    state.globalMult.dmgAll *= 3;
    state.globalMult.cuIncome *= 5;
    state.globalMult.agIncome *= 5;
    showGenericModal('Палочка-выручалочка', 'На короткое время ваш урон и добыча возросли во много раз!');
  }

  function useSkillBoots() {
    state.globalMult.atkSpeed *= 1.5;
    showGenericModal('Сапоги-скороходы', 'Герои побежали быстрее!');
  }

  function useSkillHat() {
    const enemies = state.wave.enemies;
    if (!enemies.length) return;
    const toRemove = Math.floor(enemies.length * 0.3);
    for (let i = 0; i < toRemove; i++) {
      const e = enemies.shift();
      if (!e) break;
      killEnemy(e);
      if (e.el.parentNode === dom.enemiesArea) {
        dom.enemiesArea.removeChild(e.el);
      }
    }
    if (!state.wave.enemies.length) onWaveSuccess();
  }

  function updateSkills(dt) {
    const now = performance.now() / 1000;
    for (const id in state.skillState) {
      const s = state.skillState[id];
      if (!s) continue;
      if (s.cdLeft > 0) {
        s.cdLeft = Math.max(0, s.cdLeft - dt);
      }
      if (s.activeUntil && s.activeUntil <= now) {
        s.activeUntil = 0;
      }
    }
    dom.skillOverlays.forEach(ov => {
      const skill = ov.dataset.skill;
      const cfg = SKILL_CONFIG[skill];
      const st = state.skillState[skill];
      if (!cfg || !st || !cfg.cd) {
        ov.style.transform = 'scaleY(0)';
        return;
      }
      const ratio = st.cdLeft / cfg.cd;
      ov.style.transform = 'scaleY(' + Math.max(0, Math.min(1, ratio)) + ')';
    });
    if (state.attackClickCdLeft > 0) {
      state.attackClickCdLeft = Math.max(0, state.attackClickCdLeft - dt);
    }
    const r = state.attackClickCdLeft / ATTACK_CLICK_CD;
    dom.attackClickCd.style.transform = 'scaleY(' + Math.max(0, Math.min(1, r)) + ')';
  }

  // ===== Merchant =====

  function updateMerchant(dt) {
    if (state.merchant.active) return;
    state.merchant.timeToNext -= dt;
    if (state.merchant.timeToNext <= 0) {
      state.merchant.active = true;
      state.merchant.timeToNext = 0;
      showElement(dom.merchantFloat);
    }
  }

  function onMerchantFound() {
    if (!state.merchant.active) return;
    hideElement(dom.merchantFloat);
    showElement(dom.merchantBackdrop);
    dom.merchantText.textContent = 'Заморский купец появился и ждёт вашего решения.';
  }

  function onMerchantAccept() {
    giveMerchantReward();
    closeMerchant();
  }

  function onMerchantDecline() {
    closeMerchant();
  }

  function closeMerchant() {
    state.merchant.active = false;
    state.merchant.timeToNext = 180;
    hideElement(dom.merchantBackdrop);
    hideElement(dom.merchantFloat);
  }

  function giveMerchantReward() {
    const roll = Math.random();
    if (roll < 0.3) {
      const hourly = 1000;
      gainCu(hourly * 0.05);
      showGenericModal('Заморский купец', 'Купец подарил вам пригоршню медных монет.');
    } else if (roll < 0.6) {
      const hourly = 100;
      gainAg(hourly * 0.05);
      showGenericModal('Заморский купец', 'Купец одарил вас серебром.');
    } else if (roll < 0.75) {
      gainAu(1 + Math.floor(Math.random() * 3));
      showGenericModal('Заморский купец', 'Купец подарил несколько золотых монет.');
    } else if (roll < 0.85) {
      grantHeroCardsRandom(30);
    } else if (roll < 0.9) {
      state.currencies.by += 20;
      showGenericModal('Заморский купец', 'Купец рассказал вам былины — вы вдохновились.');
    } else {
      state.currencies.pd += 2;
      showGenericModal('Заморский купец', 'Купец поведал о подвигах — вы обрели новые подвиги.');
    }
  }

  // ===== Achievements =====

  function initAchievements() {
    state.achievements = ACHIEVEMENT_DEFS.map(a => ({
      id: a.id,
      name: a.name,
      desc: a.desc,
      completed: false,
      rewarded: false
    }));
    renderAchievements();
  }

  function checkAchievements() {
    let updated = false;
    state.achievements.forEach(a => {
      if (a.completed) return;
      const def = ACHIEVEMENT_DEFS.find(d => d.id === a.id);
      if (!def) return;
      if (def.check(state)) {
        a.completed = true;
        applyAchievementReward(def);
        updated = true;
      }
    });
    if (updated) renderAchievements();
  }

  function applyAchievementReward(def) {
    const r = def.reward || {};
    if (r.au) gainAu(r.au);
    if (r.cu) gainCu(r.cu);
    if (r.ag) gainAg(r.ag);
    if (r.by) state.currencies.by += r.by;
    if (r.pd) state.currencies.pd += r.pd;
  }

  function renderAchievements() {
    const container = dom.achievementsList;
    container.innerHTML = '';
    state.achievements.forEach(a => {
      const def = ACHIEVEMENT_DEFS.find(d => d.id === a.id);
      const line = document.createElement('div');
      line.className = 'list-item';
      if (a.completed) line.classList.add('achievement-complete');
      const left = document.createElement('div');
      left.className = 'list-item-left';
      const info = document.createElement('div');
      info.innerHTML = '<strong>' + a.name + '</strong><br>' + a.desc + '<br>Статус: ' + (a.completed ? 'Выполнено' : 'Не выполнено');
      left.appendChild(info);
      line.appendChild(left);
      container.appendChild(line);
    });
  }

  // ===== Generic modals =====

  function showGenericModal(title, html) {
    dom.genericTitle.textContent = title;
    dom.genericContent.innerHTML = html;
    showElement(dom.genericBackdrop);
  }

  function showVictoryModal(text) {
    dom.victoryText.textContent = text;
    showElement(dom.victoryBackdrop);
  }

  // ===== Saving and loading =====

  function getSaveObject() {
    return {
      currencies: state.currencies,
      heroConfig: state.heroConfig,
      heroStats: state.heroStats,
      globalMult: state.globalMult,
      day: state.day,
      maxDay: state.maxDay,
      heroes: state.heroes,
      buildings: state.buildings,
      upgrades: state.upgrades,
      pets: state.pets,
      activePets: state.activePets.map(p => p.id),
      mounts: state.mounts,
      activeMountId: state.activeMountId,
      mapNodes: state.mapNodes,
      achievements: state.achievements
    };
  }

  function saveGame() {
    try {
      const obj = getSaveObject();
      localStorage.setItem(SAVE_KEY, JSON.stringify(obj));
    } catch (e) {
      console.error('Не удалось сохранить игру:', e);
    }
  }

  let saveCooldown = 0;
  function saveGameThrottled() {
    if (saveCooldown > 0) return;
    saveCooldown = 2;
    saveGame();
    setTimeout(() => { saveCooldown = 0; }, 2000);
  }

  function loadGame() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;
      const obj = JSON.parse(raw);
      if (!obj || typeof obj !== 'object') return;
      Object.assign(state.currencies, obj.currencies || {});
      Object.assign(state.heroConfig, obj.heroConfig || {});
      Object.assign(state.heroStats, obj.heroStats || {});
      Object.assign(state.globalMult, obj.globalMult || {});
      state.day = obj.day || 1;
      state.maxDay = obj.maxDay || state.day;
      initHeroes();
      if (Array.isArray(obj.heroes)) {
        obj.heroes.forEach(saved => {
          const h = state.heroes.find(x => x.id === saved.id);
          if (h) Object.assign(h, saved);
        });
      }
      initBuildings();
      if (Array.isArray(obj.buildings)) {
        obj.buildings.forEach(saved => {
          const b = state.buildings.find(x => x.id === saved.id);
          if (b) Object.assign(b, saved);
        });
      }
      initUpgrades();
      if (Array.isArray(obj.upgrades)) {
        obj.upgrades.forEach(saved => {
          const u = state.upgrades.find(x => x.id === saved.id);
          if (u) Object.assign(u, saved);
        });
      }
      initPetsAndMounts();
      if (Array.isArray(obj.pets)) {
        obj.pets.forEach(saved => {
          const p = state.pets.find(x => x.id === saved.id);
          if (p) Object.assign(p, saved);
        });
      }
      if (Array.isArray(obj.mounts)) {
        obj.mounts.forEach(saved => {
          const m = state.mounts.find(x => x.id === saved.id);
          if (m) Object.assign(m, saved);
        });
      }
      if (obj.activeMountId) state.activeMountId = obj.activeMountId;
      state.activePets = [];
      if (Array.isArray(obj.activePets)) {
        obj.activePets.forEach(id => {
          const p = state.pets.find(pp => pp.id === id);
          if (p) state.activePets.push(p);
        });
      }
      initMap();
      if (Array.isArray(obj.mapNodes)) {
        obj.mapNodes.forEach(saved => {
          const n = state.mapNodes.find(nn => nn.id === saved.id);
          if (n) Object.assign(n, saved);
        });
      }
      initAchievements();
      if (Array.isArray(obj.achievements)) {
        obj.achievements.forEach(saved => {
          const a = state.achievements.find(aa => aa.id === saved.id);
          if (a) Object.assign(a, saved);
        });
      }
      recalcGlobalMultipliers();
      renderBuildings();
      renderHeroes();
      renderUpgrades();
      renderRebirthInfo();
      renderShop();
      renderPetsAndMounts();
      renderMap();
      renderAchievements();
      if (state.heroConfig.name) {
        applyHeroSprites();
        hideSplash();
        startNewWave();
      } else {
        showSplash();
      }
    } catch (e) {
      console.error('Не удалось загрузить игру:', e);
    }
  }

  // ===== UI updates =====

  function updateTopUI() {
    dom.cuAmount.textContent = formatNumber(state.currencies.cu);
    dom.agAmount.textContent = formatNumber(state.currencies.ag);
    dom.auAmount.textContent = formatNumber(state.currencies.au);
    dom.cpValue.textContent = formatNumber(getTotalDps());
    const t = state.wave.timeLeft;
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    dom.waveTimer.textContent = (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
  }

  // ===== Main loop =====

  function gameLoop(ts) {
    if (!state.lastTimestamp) state.lastTimestamp = ts;
    const dt = (ts - state.lastTimestamp) / 1000;
    state.lastTimestamp = ts;
    state.wave.timeLeft -= dt;
    if (state.wave.timeLeft <= 0) {
      if (state.wave.enemies.length) {
        onWaveFail();
      } else {
        onWaveSuccess();
      }
    }
    applyContinuousDamage(dt);
    applyBuildingsIncome(dt);
    updateSkills(dt);
    updateMerchant(dt);
    updateTopUI();
    updateWaveUI();
    checkAchievements();
    requestAnimationFrame(gameLoop);
  }

  // ===== Initialization =====

  function init() {
    cacheDom();
    setupEventListeners();
    initBuildings();
    initHeroes();
    initUpgrades();
    initPetsAndMounts();
    initMap();
    initAchievements();
    initShop();
    renderBuildings();
    renderHeroes();
    renderUpgrades();
    renderRebirthInfo();
    renderPetsAndMounts();
    renderMap();
    renderAchievements();
    renderShop();
    loadGame();
    state.lastTimestamp = performance.now();
    requestAnimationFrame(gameLoop);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
