import { PinyinItem } from './types';

// Level definitions based on prompt:
// Lv 1: Simple initials/finals (e.g., Ba, Lu)
// Lv 2: Compound vowels (e.g., Hai, Chun)
// Lv 3: Special rules (e.g., Ju, Qu)
// Lv 4: Whole syllable recognition (e.g., Zhi, Yun)

export const pinyin1: PinyinItem[] = [
  { word: "天", pinyin: "tiān", level: 2, options: ["tián", "qiān", "tān"] },
  { word: "地", pinyin: "dì", level: 1, options: ["tì", "de", "bì"] },
  { word: "人", pinyin: "rén", level: 2, options: ["réng", "lén", "rěn"] },
  { word: "你", pinyin: "nǐ", level: 1, options: ["lǐ", "nī", "mǐ"] },
  { word: "我", pinyin: "wǒ", level: 1, options: ["wò", "ǒ", "wǔ"] },
  { word: "他", pinyin: "tā", level: 1, options: ["dā", "tuō", "tá"] },
  { word: "一", pinyin: "yī", level: 4, options: ["yì", "yí", "lī"] },
  { word: "二", pinyin: "èr", level: 3, options: ["è", "rè", "ér"] },
  { word: "三", pinyin: "sān", level: 2, options: ["shān", "sāng", "shāng"] },
  { word: "四", pinyin: "sì", level: 4, options: ["shì", "sī", "xì"] },
  { word: "五", pinyin: "wǔ", level: 4, options: ["wú", "ǔ", "hǔ"] },
  { word: "上", pinyin: "shàng", level: 2, options: ["sàng", "shàn", "shāng"] },
  { word: "下", pinyin: "xià", level: 2, options: ["xiǎ", "shà", "jià"] },
  { word: "口", pinyin: "kǒu", level: 2, options: ["kóu", "ǒu", "kě"] },
  { word: "耳", pinyin: "ěr", level: 3, options: ["rě", "ér", "ě"] },
  { word: "目", pinyin: "mù", level: 1, options: ["nù", "mò", "wù"] },
];

export const pinyin2: PinyinItem[] = [
  { word: "手", pinyin: "shǒu", level: 2, options: ["sǒu", "shóu", "rǒu"] },
  { word: "足", pinyin: "zú", level: 1, options: ["zhú", "cú", "zū"] },
  { word: "站", pinyin: "zhàn", level: 4, options: ["zàn", "zhàng", "chàn"] },
  { word: "坐", pinyin: "zuò", level: 2, options: ["zhuò", "zuò", "zòu"] },
  { word: "日", pinyin: "rì", level: 4, options: ["yì", "rè", "lì"] },
  { word: "月", pinyin: "yuè", level: 4, options: ["yè", "ruè", "üè"] },
  { word: "山", pinyin: "shān", level: 2, options: ["sān", "shāng", "shàn"] },
  { word: "川", pinyin: "chuān", level: 2, options: ["cuān", "chuāng", "chān"] },
  { word: "水", pinyin: "shuǐ", level: 2, options: ["suǐ", "shuí", "ruǐ"] },
  { word: "火", pinyin: "huǒ", level: 2, options: ["hǒu", "fǔ", "hě"] },
  { word: "田", pinyin: "tián", level: 2, options: ["dián", "tiān", "tán"] },
  { word: "禾", pinyin: "hé", level: 1, options: ["hú", "kē", "é"] },
  { word: "六", pinyin: "liù", level: 2, options: ["liú", "niù", "lù"] },
  { word: "七", pinyin: "qī", level: 3, options: ["pī", "xī", "jí"] },
  { word: "八", pinyin: "bā", level: 1, options: ["pā", "bá", "dā"] },
  { word: "九", pinyin: "jiǔ", level: 2, options: ["jiu", "xiǔ", "jǔ"] },
  { word: "十", pinyin: "shí", level: 4, options: ["sí", "shì", "chí"] },
];