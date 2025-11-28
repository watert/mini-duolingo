
import { Course, PinyinItem } from '../types';

const vowelTraps: PinyinItem[] = [
  // Existing
  { type: "QUIZ", word: "狗", pinyin: "gǒu", level: 2, options: ["guǒ", "gǒ", "gòu"] },
  { type: "QUIZ", word: "鸟", pinyin: "niǎo", level: 3, options: ["nǎo", "niǎ", "liǎo"] },
  { type: "QUIZ", word: "丢", pinyin: "diū", level: 2, options: ["duī", "dōu", "diōu"] },
  { type: "QUIZ", word: "略", pinyin: "lüè", level: 3, options: ["luè", "liè", "lü"] },
  
  // New Mistakes Integration (Vowels, Syllable Structure)
  { type: "QUIZ", word: "口", pinyin: "kǒu", level: 2, options: ["kuǒ", "ǒu", "kě"] },
  { type: "QUIZ", word: "手", pinyin: "shǒu", level: 2, options: ["shuǒ", "sǒu", "rǒu"] },
  { type: "QUIZ", word: "地", pinyin: "dì", level: 1, options: ["diè", "de", "tì"] },
  { type: "QUIZ", word: "你", pinyin: "nǐ", level: 1, options: ["ně", "lǐ", "mǐ"] },
  { type: "QUIZ", word: "他", pinyin: "tā", level: 1, options: ["tiā", "tuō", "dā"] },
  { type: "QUIZ", word: "五", pinyin: "wǔ", level: 3, options: ["wǎ", "ǔ", "hǔ"] },
  { type: "QUIZ", word: "耳", pinyin: "ěr", level: 3, options: ["rě", "ér", "ě"] },
  { type: "QUIZ", word: "六", pinyin: "liù", level: 2, options: ["lò", "luì", "liú"] },
  { type: "QUIZ", word: "弟", pinyin: "dì", level: 1, options: ["dè", "tì", "bì"] },
  { type: "QUIZ", word: "会", pinyin: "huì", level: 2, options: ["hiù", "kuì", "guì"] },
  { type: "QUIZ", word: "白", pinyin: "bái", level: 2, options: ["bá", "pái", "dái"] },
  { type: "QUIZ", word: "原", pinyin: "yuán", level: 4, options: ["yán", "ruán", "luán"] },
  { type: "QUIZ", word: "级", pinyin: "jí", level: 2, options: ["jé", "qí", "xí"] },
  { type: "QUIZ", word: "学", pinyin: "xué", level: 3, options: ["xié", "shué", "xuě"] },
  { type: "QUIZ", word: "写", pinyin: "xiě", level: 3, options: ["xuě", "xě", "qiě"] },
  { type: "QUIZ", word: "夜", pinyin: "yè", level: 4, options: ["yuè", "yiè", "rè"] },
  { type: "QUIZ", word: "果", pinyin: "guǒ", level: 2, options: ["gǒu", "gǒ", "kuǒ"] },

  // Match Groups
  {
    type: "MATCH",
    items: [
      { pinyin: "gǒu", word: "狗", level: 2 },
      { pinyin: "guǒ", word: "果", level: 2 },
      { pinyin: "hóu", word: "猴", level: 2 },
      { pinyin: "huǒ", word: "火", level: 1 }
    ]
  },
  {
    type: "MATCH",
    items: [
      { pinyin: "xiě", word: "写", level: 3 },
      { pinyin: "xuě", word: "雪", level: 3 },
      { pinyin: "yuè", word: "月", level: 4 },
      { pinyin: "yè", word: "夜", level: 4 }
    ]
  }
];

const detailFocus: PinyinItem[] = [
  // Existing
  { type: "QUIZ", word: "春", pinyin: "chūn", level: 2, options: ["cūn", "chuēng", "chūng"] },
  { type: "QUIZ", word: "昨", pinyin: "zuó", level: 2, options: ["zhuó", "zó", "zuò"] },
  { type: "QUIZ", word: "正", pinyin: "zhèng", level: 2, options: ["zhèn", "zèng", "zhìng"] },
  { type: "QUIZ", word: "村", pinyin: "cūn", level: 2, options: ["chūn", "cōng", "cuēn"] },

  // New Mistakes Integration (Consonants, Nasals)
  { type: "QUIZ", word: "上", pinyin: "shàng", level: 4, options: ["shàn", "sàng", "shāng"] },
  { type: "QUIZ", word: "本", pinyin: "běn", level: 2, options: ["běng", "pěn", "bǐn"] },
  { type: "QUIZ", word: "字", pinyin: "zì", level: 4, options: ["zè", "zhì", "cí"] },
  { type: "QUIZ", word: "桌", pinyin: "zhuō", level: 2, options: ["zuō", "zhōu", "chuō"] },
  { type: "QUIZ", word: "川", pinyin: "chuān", level: 2, options: ["cuān", "chān", "chuāng"] },
  { type: "QUIZ", word: "水", pinyin: "shuǐ", level: 2, options: ["suǐ", "shuí", "ruǐ"] },
  { type: "QUIZ", word: "十", pinyin: "shí", level: 4, options: ["shé", "sí", "shì"] },

  // Match Groups
  {
    type: "MATCH",
    items: [
      { pinyin: "sì", word: "四", level: 1 },
      { pinyin: "shí", word: "十", level: 4 },
      { pinyin: "zǐ", word: "子", level: 4 },
      { pinyin: "zhǐ", word: "纸", level: 3 }
    ]
  },
  {
    type: "MATCH",
    items: [
      { pinyin: "chuán", word: "船", level: 2 },
      { pinyin: "chuáng", word: "床", level: 2 },
      { pinyin: "jīn", word: "金", level: 2 },
      { pinyin: "jīng", word: "京", level: 2 }
    ]
  }
];

export const specialCourses: Course[] = [
  {
    id: 'special-vowel-traps',
    title: '韵母陷阱',
    description: 'ou/uo, ie/ue 与常见音节结构错误',
    data: vowelTraps
  },
  {
    id: 'special-detail-focus',
    title: '魔鬼细节',
    description: '平翘舌 z/c/s, 前后鼻音 n/ng',
    data: detailFocus
  }
];
