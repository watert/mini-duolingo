import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { FillBlanksViewProps } from '../types';

const ItemTypes = {
  WORD: 'word',
};

// Data structure for the item being dragged
interface DragItem {
  id: string;
  text: string;
  origin: 'pool' | 'slot';
  index?: number; // Only present if origin is 'slot'
}

// --- Sub-components for DnD ---

interface DraggableOptionProps {
  id: string;
  text: string;
  disabled: boolean;
  isUsed: boolean;
  onSelect: () => void; // Fallback for click
}

const DraggableOption: React.FC<DraggableOptionProps> = ({ id, text, disabled, isUsed, onSelect }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.WORD,
    item: { id, text, origin: 'pool' } as DragItem,
    canDrag: !disabled && !isUsed,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [id, text, disabled, isUsed]);

  drag(ref);

  // Placeholder state for used items
  if (isUsed) {
    return (
      <div 
        className="px-4 py-3 border-2 border-transparent text-lg font-bold opacity-0 pointer-events-none select-none"
        aria-hidden="true"
      >
        {text}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      onClick={!disabled ? onSelect : undefined}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className={`
        px-4 py-3 bg-white border-2 border-b-4 rounded-xl text-lg font-bold transition-all shadow-sm touch-manipulation select-none
        ${disabled 
          ? 'border-gray-100 text-gray-300 cursor-default border-b-2 transform-none' 
          : 'border-gray-200 text-gray-700 active:border-b-2 active:translate-y-[2px] cursor-grab active:cursor-grabbing'
        }
      `}
    >
      {text}
    </div>
  );
};

interface DroppableSlotProps {
  index: number;
  text: string | null;
  isCorrect: boolean | null;
  onDrop: (item: DragItem) => void;
  onClick: () => void;
}

const DroppableSlot: React.FC<DroppableSlotProps> = ({ index, text, isCorrect, onDrop, onClick }) => {
  const ref = useRef<HTMLDivElement>(null);

  // Make slot droppable (Target)
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.WORD,
    drop: (item: DragItem) => onDrop(item),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }), [text, onDrop]);

  // Make slot draggable (Source) if it has text
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.WORD,
    item: { id: `slot-${index}`, text: text || '', origin: 'slot', index } as DragItem,
    canDrag: !!text,
    end: (item, monitor) => {
      // Support dragging outside to remove
      if (!monitor.didDrop()) {
        onClick();
      }
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [text, index, onClick]);

  // Initialize drag and drop refs
  drag(drop(ref));

  let statusClass = 'border-gray-300 bg-gray-50';
  
  if (isOver) {
    statusClass = 'border-blue-400 bg-blue-100 scale-105';
  } else if (text) {
    if (isCorrect === false) statusClass = 'border-red-400 bg-red-50 text-red-600 animate-shake';
    else if (isCorrect === true) statusClass = 'border-green-400 bg-green-50 text-green-600';
    else statusClass = 'border-blue-400 bg-blue-50 text-blue-600 cursor-grab active:cursor-grabbing';
  }

  return (
    <div
      ref={ref}
      onClick={text ? onClick : undefined}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className={`
        min-w-[80px] h-[48px] px-3 mx-1 border-b-4 rounded-lg transition-all text-xl font-bold flex items-center justify-center select-none
        ${statusClass}
      `}
    >
      {text}
    </div>
  );
};

// --- Main Component ---

interface OptionState {
  id: string;
  text: string;
  isUsed: boolean;
}

export const FillBlanksView: React.FC<FillBlanksViewProps> = ({ 
  item, 
  onSuccess, 
  onError, 
  onNext 
}) => {
  const [filledSlots, setFilledSlots] = useState<(string | null)[]>([]);
  // Store all options with their usage state
  const [options, setOptions] = useState<OptionState[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Parse question to find segments
  const segments = useMemo(() => {
    return item.question.split('__');
  }, [item.question]);

  const blankCount = segments.length - 1;

  useEffect(() => {
    setFilledSlots(new Array(blankCount).fill(null));
    // Initialize options with stable IDs
    setOptions(item.options.map((opt, i) => ({ 
      id: `opt-${i}`, 
      text: opt, 
      isUsed: false 
    })));
    setIsCorrect(null);
    setIsProcessing(false);
  }, [item, blankCount]);

  // Core Logic for Drop
  const handleDrop = (dragItem: DragItem, targetIndex: number) => {
    if (isProcessing) return;
    
    // Determine Source
    const sourceIndex = dragItem.origin === 'slot' ? dragItem.index : undefined;
    
    // If dropping on itself, ignore
    if (sourceIndex === targetIndex) return;

    const newSlots = [...filledSlots];
    const targetText = newSlots[targetIndex]; // What's currently in the target slot?
    let newOptions = [...options];

    const sourceText = dragItem.text;

    // 1. Update Options Usage
    
    // If dragging from pool, mark that option as used
    if (dragItem.origin === 'pool') {
      const optIdx = newOptions.findIndex(o => o.id === dragItem.id);
      if (optIdx !== -1) {
        newOptions[optIdx] = { ...newOptions[optIdx], isUsed: true };
      }
    } 

    // If target slot was occupied, we need to return that word to the pool (mark as unused)
    if (targetText) {
      // Find a used option with matching text to free up
      const freeIdx = newOptions.findIndex(o => o.text === targetText && o.isUsed);
      if (freeIdx !== -1) {
        newOptions[freeIdx] = { ...newOptions[freeIdx], isUsed: false };
      }
    }

    // 2. Update Slots
    
    // If source was a slot, it receives the targetText (Swap)
    if (sourceIndex !== undefined) {
      newSlots[sourceIndex] = targetText; 
    }

    // Set target to new value
    newSlots[targetIndex] = sourceText;

    // 3. Update State
    setFilledSlots(newSlots);
    setOptions(newOptions);

    // 4. Check for Completion
    if (newSlots.every(s => s !== null)) {
       checkAnswer(newSlots);
    }
  };

  // Click to Clear or Select
  const handleDirectFill = (text: string, sourceId: string) => {
    if (isProcessing) return;
    // Find first empty slot
    const targetIndex = filledSlots.findIndex(s => s === null);
    if (targetIndex !== -1) {
       handleDrop({ id: sourceId, text, origin: 'pool' }, targetIndex);
    }
  };

  const handleSlotClear = (index: number) => {
    if (isProcessing || !filledSlots[index]) return;
    const text = filledSlots[index]!;
    
    // Mark one instance of 'text' as unused in options
    setOptions(prev => {
      const idx = prev.findIndex(o => o.text === text && o.isUsed);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], isUsed: false };
        return next;
      }
      return prev;
    });

    const newSlots = [...filledSlots];
    newSlots[index] = null;
    
    setFilledSlots(newSlots);
  };

  const checkAnswer = (finalSlots: (string | null)[]) => {
    setIsProcessing(true);
    
    const correct = finalSlots.every((slot, i) => slot === item.answers[i]);
    setIsCorrect(correct);

    if (correct) {
      onSuccess(item);
      setTimeout(() => {
        onNext();
      }, 1000);
    } else {
      onError(item);
      
      setTimeout(() => {
        setIsCorrect(null);
        setFilledSlots(new Array(blankCount).fill(null));
        // Reset all options to unused
        setOptions(prev => prev.map(o => ({ ...o, isUsed: false })));
        setIsProcessing(false);
      }, 1200);
    }
  };

  const poolRef = useRef<HTMLDivElement>(null);
  // Drop Target for the Pool (Dragging a slot back to pool clears it)
  const [{ isOverPool }, dropToPool] = useDrop(() => ({
    accept: ItemTypes.WORD,
    drop: (item: DragItem) => {
      if (item.origin === 'slot' && item.index !== undefined) {
        handleSlotClear(item.index);
      }
    },
    collect: (m) => ({ isOverPool: !!m.isOver() })
  }));

  dropToPool(poolRef);

  return (
    <div className="w-full max-w-sm flex flex-col items-center animate-fade-in h-full">
      
      {/* Question Area */}
      <div className="w-full flex-1 bg-white border-2 border-b-4 border-gray-200 rounded-3xl p-6 mb-4 shadow-sm flex flex-col justify-center">
          <div className="flex flex-wrap items-center justify-center gap-y-4">
            {segments.map((seg, i) => (
              <React.Fragment key={i}>
                {/* Text Segment */}
                {seg && <span className="text-2xl font-bold text-gray-800 mx-1">{seg}</span>}
                
                {/* Blank Slot */}
                {i < segments.length - 1 && (
                  <DroppableSlot 
                    index={i}
                    text={filledSlots[i]}
                    isCorrect={isCorrect}
                    onDrop={(item) => handleDrop(item, i)}
                    onClick={() => handleSlotClear(i)}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
      </div>

      {/* Options Pool */}
      <div 
        ref={poolRef}
        className={`
          w-full min-h-[160px] rounded-2xl p-4 border transition-colors
          ${isOverPool ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'}
        `}
      >
        <div className={`text-xs font-bold mb-3 uppercase tracking-wider text-center ${isOverPool ? 'text-red-400' : 'text-gray-400'}`}>
          {isOverPool ? '松手移除' : '拖拽或点击填空'}
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {options.map((opt) => (
            <DraggableOption
              key={opt.id}
              id={opt.id}
              text={opt.text}
              disabled={isProcessing}
              isUsed={opt.isUsed}
              onSelect={() => handleDirectFill(opt.text, opt.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
