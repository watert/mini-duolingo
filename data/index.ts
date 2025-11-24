import { CourseGroup } from '../types';
import * as Grade1 from './pinyin-grade-1';
import * as Common from './pinyin-common';

export const courseGroups: CourseGroup[] = [
  {
    id: 'grade-1',
    title: '小学一年级',
    courses: [
      {
        id: 'g1-unit1',
        title: '第一单元',
        description: '天地人 你我他',
        data: Grade1.unit1
      },
      {
        id: 'g1-unit2',
        title: '第二单元',
        description: '爸妈大马 本学',
        data: Grade1.unit2
      },
      {
        id: 'g1-unit3',
        title: '第三单元',
        description: '花鸟虫鱼 听说读写',
        data: Grade1.unit3
      },
      {
        id: 'g1-unit4',
        title: '第四单元',
        description: '自然四季 瓜果蔬菜',
        data: Grade1.unit4
      },
      {
        id: 'g1-unit5',
        title: '第五单元',
        description: '秋气树叶 汉字偏旁',
        data: Grade1.unit5
      },
      {
        id: 'g1-unit6',
        title: '第六单元',
        description: '对歌风雨 学校生活',
        data: Grade1.unit6
      },
      {
        id: 'g1-unit7',
        title: '第七单元',
        description: '生活常识 亲属称呼',
        data: Grade1.unit7
      },
      {
        id: 'g1-unit8',
        title: '第八单元',
        description: '比尾巴 综合拼音',
        data: Grade1.unit8
      }
    ]
  },
  {
    id: 'common',
    title: '通用拼音学习',
    courses: [
      {
        id: 'common-lv1',
        title: '等级 1',
        description: '常见声母/单韵母',
        data: Common.level1
      },
      {
        id: 'common-lv2',
        title: '等级 2',
        description: '复韵母/声调组合',
        data: Common.level2
      },
      {
        id: 'common-lv3',
        title: '等级 3',
        description: '特殊规则音节',
        data: Common.level3
      },
      {
        id: 'common-lv4',
        title: '等级 4',
        description: '整体认读音节',
        data: Common.level4
      },
      {
        id: 'common-lv5',
        title: '等级 5',
        description: '进阶词汇',
        data: Common.level5
      },
      {
        id: 'common-lv6',
        title: '等级 6',
        description: '多音/多笔画',
        data: Common.level6
      },
      {
        id: 'common-lv7',
        title: '等级 7',
        description: '生动/复杂字',
        data: Common.level7
      }
    ]
  }
];
