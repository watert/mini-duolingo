
import { PinyinItem, CardState } from '../types';

export const generateCardsForGroup = (group: PinyinItem[]): CardState[] => {
  // Create Hanzi Cards
  const wordCards: CardState[] = group.map(item => ({
    id: `hanzi-${item.word}-${item.pinyin}`,
    word: item.word,
    display: item.word,
    type: 'hanzi',
    status: 'idle'
  }));

  // Create Pinyin Cards
  const pinyinCards: CardState[] = group.map(item => ({
    id: `pinyin-${item.word}-${item.pinyin}`,
    word: item.word,
    display: item.pinyin,
    type: 'pinyin',
    status: 'idle'
  }));

  // Shuffle independently
  const shuffledWords = [...wordCards].sort(() => Math.random() - 0.5);
  const shuffledPinyins = [...pinyinCards].sort(() => Math.random() - 0.5);

  // Randomize column layout (Words on left OR Pinyin on left)
  const wordsOnLeft = Math.random() > 0.5;
  const leftCol = wordsOnLeft ? shuffledWords : shuffledPinyins;
  const rightCol = wordsOnLeft ? shuffledPinyins : shuffledWords;

  // Interleave for display grid
  const combinedCards: CardState[] = [];
  for (let i = 0; i < 4; i++) {
    if (leftCol[i]) combinedCards.push(leftCol[i]);
    if (rightCol[i]) combinedCards.push(rightCol[i]);
  }

  return combinedCards;
};
