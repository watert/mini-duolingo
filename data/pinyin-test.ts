
import { PinyinItem } from '../types';

export const mixedTest: PinyinItem[] = [
  // 1. Simple Quiz
  { type: "QUIZ", word: "测试", pinyin: "cè shì", level: 1, options: ["cè shi", "chè shì", "cè sì"] },
  { type: "QUIZ", word: "快乐", pinyin: "kuài lè", level: 1, options: ["kuài le", "kuài luè", "guài lè"] },

  // 2. Match Group
  {
    type: "MATCH",
    items: [
      { word: "红色", pinyin: "hóng sè", level: 1 },
      { word: "蓝色", pinyin: "lán sè", level: 1 },
      { word: "绿色", pinyin: "lǜ sè", level: 1 },
      { word: "白色", pinyin: "bái sè", level: 1 }
    ]
  },

  // 3. Fill in the Blanks
  {
    type: "FILL",
    question: "我是 __ 国 __",
    answers: ["中", "人"],
    options: ["中", "人", "美", "大", "小"],
    level: 1
  },
  {
    type: "FILL",
    question: "天 __ 地 __",
    answers: ["上", "下"],
    options: ["上", "下", "左", "右"],
    level: 1
  }
];
