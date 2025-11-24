import { PinyinItem } from './types';

// Level definitions based on prompt:
// Lv 1: Simple initials/finals (e.g., Ba, Lu)
// Lv 2: Compound vowels (e.g., Hai, Chun)
// Lv 3: Special rules (e.g., Ju, Qu)
// Lv 4: Whole syllable recognition (e.g., Zhi, Yun)

export const pinyin1: PinyinItem[] = [
  { word: "天", pinyin: "tiān", level: 2 },
  { word: "地", pinyin: "dì", level: 1 },
  { word: "人", pinyin: "rén", level: 2 },
  { word: "你", pinyin: "nǐ", level: 1 },
  { word: "我", pinyin: "wǒ", level: 1 },
  { word: "他", pinyin: "tā", level: 1 },
  { word: "一", pinyin: "yī", level: 4 }, // 整体认读 generally, though sometimes treated simply
  { word: "二", pinyin: "èr", level: 3 },
  { word: "三", pinyin: "sān", level: 2 },
  { word: "四", pinyin: "sì", level: 4 }, // 整体认读 implies z,c,s + i
  { word: "五", pinyin: "wǔ", level: 4 }, // 整体认读
  { word: "上", pinyin: "shàng", level: 2 },
  { word: "下", pinyin: "xià", level: 2 },
  { word: "口", pinyin: "kǒu", level: 2 },
  { word: "耳", pinyin: "ěr", level: 3 },
  { word: "目", pinyin: "mù", level: 1 },
];

export const pinyin2: PinyinItem[] = [
  { word: "手", pinyin: "shǒu", level: 2 },
  { word: "足", pinyin: "zú", level: 1 },
  { word: "站", pinyin: "zhàn", level: 4 }, // Zh is retroflex
  { word: "坐", pinyin: "zuò", level: 2 },
  { word: "日", pinyin: "rì", level: 4 }, // 整体认读
  { word: "月", pinyin: "yuè", level: 4 }, // 整体认读
  { word: "山", pinyin: "shān", level: 2 },
  { word: "川", pinyin: "chuān", level: 2 }, // Ch is retroflex
  { word: "水", pinyin: "shuǐ", level: 2 },
  { word: "火", pinyin: "huǒ", level: 2 },
  { word: "田", pinyin: "tián", level: 2 },
  { word: "禾", pinyin: "hé", level: 1 },
  { word: "六", pinyin: "liù", level: 2 },
  { word: "七", pinyin: "qī", level: 3 }, // q is somewhat special
  { word: "八", pinyin: "bā", level: 1 },
  { word: "九", pinyin: "jiǔ", level: 2 },
  { word: "十", pinyin: "shí", level: 4 }, // 整体认读
];
