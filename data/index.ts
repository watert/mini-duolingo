
import { CourseGroup, PinyinItem, QuizItem } from '../types';
import * as Grade1 from './pinyin-grade-1';
import * as Grade1_2 from './pinyin-grade-1-2';
import * as Common from './pinyin-common';

// Helper to transform specific Pinyin format to generic Quiz format
const mapPinyinToQuiz = (items: PinyinItem[]): QuizItem[] => {
  return items.map(item => ({
    question: item.word,
    answer: item.pinyin,
    level: item.level,
    options: item.options || []
  }));
};

export const courseGroups: CourseGroup[] = [
  {
    id: 'grade-1',
    title: '一年级(上)',
    category: 'pinyin',
    courses: [
      {
        id: 'g1-unit1',
        title: '第一单元',
        description: '天地人 你我他',
        data: mapPinyinToQuiz(Grade1.unit1)
      },
      {
        id: 'g1-unit2',
        title: '第二单元',
        description: '爸妈大马 本学',
        data: mapPinyinToQuiz(Grade1.unit2)
      },
      {
        id: 'g1-unit3',
        title: '第三单元',
        description: '花鸟虫鱼 听说读写',
        data: mapPinyinToQuiz(Grade1.unit3)
      },
      {
        id: 'g1-unit4',
        title: '第四单元',
        description: '自然四季 瓜果蔬菜',
        data: mapPinyinToQuiz(Grade1.unit4)
      },
      {
        id: 'g1-unit5',
        title: '第五单元',
        description: '秋气树叶 汉字偏旁',
        data: mapPinyinToQuiz(Grade1.unit5)
      },
      {
        id: 'g1-unit6',
        title: '第六单元',
        description: '对歌风雨 学校生活',
        data: mapPinyinToQuiz(Grade1.unit6)
      },
      {
        id: 'g1-unit7',
        title: '第七单元',
        description: '生活常识 亲属称呼',
        data: mapPinyinToQuiz(Grade1.unit7)
      },
      {
        id: 'g1-unit8',
        title: '第八单元',
        description: '比尾巴 综合拼音',
        data: mapPinyinToQuiz(Grade1.unit8)
      }
    ]
  },
  {
    id: 'grade-1-2',
    title: '一年级(下)',
    category: 'pinyin',
    courses: [
      {
        id: 'g1-2-unit1',
        title: '第一单元',
        description: '春夏秋冬 姓氏歌',
        data: mapPinyinToQuiz(Grade1_2.unit1)
      },
      {
        id: 'g1-2-unit2',
        title: '第二单元',
        description: '吃水不忘挖井人',
        data: mapPinyinToQuiz(Grade1_2.unit2)
      },
      {
        id: 'g1-2-unit3',
        title: '第三单元',
        description: '小公鸡和小鸭子',
        data: mapPinyinToQuiz(Grade1_2.unit3)
      },
      {
        id: 'g1-2-unit4',
        title: '第四单元',
        description: '静夜思 端午粽',
        data: mapPinyinToQuiz(Grade1_2.unit4)
      },
      {
        id: 'g1-2-unit5',
        title: '第五单元',
        description: '动物儿歌 操场上',
        data: mapPinyinToQuiz(Grade1_2.unit5)
      },
      {
        id: 'g1-2-unit6',
        title: '第六单元',
        description: '古诗二首 荷叶圆圆',
        data: mapPinyinToQuiz(Grade1_2.unit6)
      },
      {
        id: 'g1-2-unit7',
        title: '第七单元',
        description: '文具的家 一分钟',
        data: mapPinyinToQuiz(Grade1_2.unit7)
      },
      {
        id: 'g1-2-unit8',
        title: '第八单元',
        description: '棉花姑娘 小壁虎',
        data: mapPinyinToQuiz(Grade1_2.unit8)
      }
    ]
  },
  {
    id: 'common',
    title: '通用拼音学习',
    category: 'pinyin',
    courses: [
      {
        id: 'common-lv1',
        title: '等级 1',
        description: '常见声母/单韵母',
        data: mapPinyinToQuiz(Common.level1)
      },
      {
        id: 'common-lv2',
        title: '等级 2',
        description: '复韵母/声调组合',
        data: mapPinyinToQuiz(Common.level2)
      },
      {
        id: 'common-lv3',
        title: '等级 3',
        description: '特殊规则音节',
        data: mapPinyinToQuiz(Common.level3)
      },
      {
        id: 'common-lv4',
        title: '等级 4',
        description: '整体认读音节',
        data: mapPinyinToQuiz(Common.level4)
      },
      {
        id: 'common-lv5',
        title: '等级 5',
        description: '进阶词汇',
        data: mapPinyinToQuiz(Common.level5)
      },
      {
        id: 'common-lv6',
        title: '等级 6',
        description: '多音/多笔画',
        data: mapPinyinToQuiz(Common.level6)
      },
      {
        id: 'common-lv7',
        title: '等级 7',
        description: '生动/复杂字',
        data: mapPinyinToQuiz(Common.level7)
      },
      {
        id: 'common-lv8',
        title: '等级 8',
        description: '专业术语/跨学科',
        data: mapPinyinToQuiz(Common.level8)
      },
      {
        id: 'common-lv9',
        title: '等级 9',
        description: '古汉语/生僻字',
        data: mapPinyinToQuiz(Common.level9)
      }
    ]
  }
];
