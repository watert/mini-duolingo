import React, { useState, useEffect, useMemo } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  useDraggable, 
  useDroppable, 
  DragStartEvent, 
  DragEndEvent,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { FillBlanksViewProps } from '../types';

// Data types for DnD
interface DragItemData {
  id: string;
  text: string;
  origin: 'pool' | 'slot';
  index?: number; // Only if origin is slot
}
interface OptionState {
  id: string;
  text: string;
  isUsed: boolean;
}
// --- Visual Components ---

const WordChip: React.FC<{
  text: string;
  isDragging?: boolean;
  status?: 'idle' | 'used' | 'correct' | 'error' | 'selected';
  disabled?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}> = ({ text, isDragging, status = 'idle', disabled, onClick, style }) => {
  let classes = "px-4 py-3 rounded-xl text-lg font-bold transition-all shadow-sm touch-manipulation select-none border-2 ";
  
  if (status === 'used') {
    classes += "border-transparent opacity-0 pointer-events-none";
  } else if (disabled) {
    classes += "border-gray-100 text-gray-300 cursor-default border-b-2 bg-white";
  } else if (status === 'correct') {
    classes += "border-green-400 bg-green-50 text-green-600 border-b-4";
  } else if (status === 'error') {
    classes += "border-red-400 bg-red-50 text-red-600 border-b-4 animate-shake";
  } else if (status === 'selected') {
    classes += "border-blue-400 bg-blue-50 text-blue-600 border-b-4";
  } else {
    // Idle / Draggable
    classes += "bg-white border-gray-200 border-b-4 text-gray-700 active:border-b-2 active:translate-y-[2px] cursor-grab active:cursor-grabbing";
  }

  if (isDragging) {
    classes += " opacity-50";
  }

  return (
    <div 
      style={style}
      className={classes}
      onClick={!disabled && status !== 'used' ? onClick : undefined}
    >
      {text}
    </div>
  );
};

// --- Draggable Wrapper ---

const DraggableWord: React.FC<{
  id: string;
  text: string;
  origin: 'pool' | 'slot';
  index?: number;
  disabled: boolean;
  isUsed?: boolean;
  onTap: () => void;
}> = ({ id, text, origin, index, disabled, isUsed, onTap }) => {
  const { attributes, listeners, setNodeRef, isDragging, transform } = useDraggable({
    id: id,
    data: { id, text, origin, index } as DragItemData,
    disabled: disabled || isUsed,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes}
      {...listeners}
    >
      <WordChip 
        text={text} 
        isDragging={isDragging} 
        status={isUsed ? 'used' : 'idle'} 
        disabled={disabled}
        onClick={!disabled && !isUsed ? onTap : undefined}
      />
    </div>
  );
};

// --- Droppable Slot ---

const DroppableSlot: React.FC<{
  index: number;
  text: string | null;
  isCorrect: boolean | null;
  onClear: () => void;
  disabled: boolean;
}> = ({ index, text, isCorrect, onClear, disabled }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `slot-${index}`,
  });

  let statusClass = 'border-gray-300 bg-gray-50';
  if (isOver && !disabled) {
    statusClass = 'border-blue-400 bg-blue-100 scale-105';
  } else if (text) {
     // If text exists, it's occupied. The DraggableWord inside determines visual mostly, 
     // but we handle success/error container styles here.
     if (isCorrect === true) statusClass = 'border-green-400 bg-green-50';
     else if (isCorrect === false) statusClass = 'border-red-400 bg-red-50';
  }

  return (
    <div
      ref={setNodeRef}
      className={`
        min-w-[80px] h-[56px] px-1 mx-1 border-b-4 rounded-lg transition-all flex items-center justify-center select-none z-0
        ${statusClass}
      `}
    >
      {text ? (
        <DraggableWord
          id={`slot-item-${index}`}
          text={text}
          origin="slot"
          index={index}
          disabled={disabled}
          onTap={onClear}
        />
      ) : null}
    </div>
  );
};

// --- Main Component ---

export const FillBlanksView: React.FC<FillBlanksViewProps> = ({ 
  item, 
  onSuccess, 
  onError, 
  onNext 
}) => {
  const [filledSlots, setFilledSlots] = useState<(string | null)[]>([]);
  const [options, setOptions] = useState<OptionState[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeDragItem, setActiveDragItem] = useState<DragItemData | null>(null);

  // Sensors configuration
  const sensors = useSensors(
    useSensor(MouseSensor, {
      // Require movement to trigger drag, allowing click events to pass through for Tap logic
      activationConstraint: {
        distance: 8, 
      },
    }),
    useSensor(TouchSensor, {
      // Require movement to trigger drag, allowing click events to pass through for Tap logic
      activationConstraint: {
        distance: 8, 
      },
    })
  );

  // Parse segments
  const segments = useMemo(() => {
    return item.question.split('__');
  }, [item.question]);

  const blankCount = segments.length - 1;

  useEffect(() => {
    setFilledSlots(new Array(blankCount).fill(null));
    setOptions(item.options.map((opt, i) => ({ 
      id: `opt-${i}`, 
      text: opt, 
      isUsed: false 
    })));
    setIsCorrect(null);
    setIsProcessing(false);
  }, [item, blankCount]);

  // --- Logic ---

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
        setOptions(prev => prev.map(o => ({ ...o, isUsed: false })));
        setIsProcessing(false);
      }, 1200);
    }
  };

  const handleFill = (text: string, sourceId: string, origin: 'pool' | 'slot', sourceIndex?: number, targetIndex?: number) => {
    // 修复：检查 targetIndex 是否为 undefined，而不是是否为 falsy
    if (targetIndex === undefined) return; // Should not happen if logic is correct
    
    const newSlots = [...filledSlots];
    const targetText = newSlots[targetIndex];
    let newOptions = [...options];

    // 1. Mark Option as Used (if from pool)
    if (origin === 'pool') {
      const optIdx = newOptions.findIndex(o => o.id === sourceId);
      if (optIdx !== -1) {
        newOptions[optIdx] = { ...newOptions[optIdx], isUsed: true };
      }
    }

    // 2. Return target slot text to pool (if occupied)
    if (targetText) {
      const freeIdx = newOptions.findIndex(o => o.text === targetText && o.isUsed);
      if (freeIdx !== -1) {
        newOptions[freeIdx] = { ...newOptions[freeIdx], isUsed: false };
      }
    }

    // 3. Update Slots
    if (sourceIndex !== undefined && origin === 'slot') {
      // Swap logic: Put target text into source slot
      newSlots[sourceIndex] = targetText;
    }
    
    newSlots[targetIndex] = text;

    setFilledSlots(newSlots);
    setOptions(newOptions);

    if (newSlots.every(s => s !== null)) {
      checkAnswer(newSlots);
    }
  };

  const handleClear = (index: number) => {
    if (isProcessing || !filledSlots[index]) return;
    const text = filledSlots[index]!;
    
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

  // --- DnD Event Handlers ---

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragItem(event.active.data.current as DragItemData);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragItem(null);

    if (!over) {
      // Dropped outside - if from slot, clear it
      if (active.data.current?.origin === 'slot') {
        handleClear(active.data.current.index);
      }
      return;
    }

    const source = active.data.current as DragItemData;
    const targetId = over.id as string;

    // Dropped back to pool
    if (targetId === 'pool') {
      if (source.origin === 'slot') {
        handleClear(source.index!);
      }
      return;
    }

    // Dropped on a slot
    if (targetId.startsWith('slot-')) {
      const targetIndex = parseInt(targetId.replace('slot-', ''), 10);
      
      // If dropped on self, ignore
      if (source.origin === 'slot' && source.index === targetIndex) return;

      handleFill(source.text, source.id, source.origin, source.index, targetIndex);
    }
  };

  // Tap handlers (Click to fill/clear)
  const handleOptionTap = (text: string, id: string) => {
    if (isProcessing) return;
    // Find first empty slot
    const emptyIndex = filledSlots.findIndex(s => s === null);
    if (emptyIndex !== -1) {
      handleFill(text, id, 'pool', undefined, emptyIndex);
    }
  };

  return (
    <DndContext 
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="w-full max-w-sm flex flex-col items-center animate-fade-in h-full">
        
        {/* Question Area */}
        <div className="w-full flex-1 bg-white border-2 border-b-4 border-gray-200 rounded-3xl p-6 mb-4 shadow-sm flex flex-col justify-center">
          <div className="flex flex-wrap items-center justify-center gap-y-4 leading-loose">
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
                    onClear={() => handleClear(i)}
                    disabled={isProcessing}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Options Pool */}
        <PoolArea options={options} isProcessing={isProcessing} onOptionTap={handleOptionTap} />

      </div>

      <DragOverlay>
        {activeDragItem ? (
          <WordChip 
            text={activeDragItem.text} 
            status="selected"
            style={{ cursor: 'grabbing' }}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

// Extracted Pool Component to use useDroppable cleanly
const PoolArea: React.FC<{
  options: OptionState[];
  isProcessing: boolean;
  onOptionTap: (text: string, id: string) => void;
}> = ({ options, isProcessing, onOptionTap }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'pool',
  });

  return (
    <div 
      ref={setNodeRef}
      className={`
        w-full min-h-[160px] rounded-2xl p-4 border transition-colors
        ${isOver ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'}
      `}
    >
      <div className={`text-xs font-bold mb-3 uppercase tracking-wider text-center ${isOver ? 'text-red-400' : 'text-gray-400'}`}>
        {isOver ? '松手移除' : '拖拽或点击填空'}
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {options.map((opt) => (
          <DraggableWord
            key={opt.id}
            id={opt.id}
            text={opt.text}
            origin="pool"
            disabled={isProcessing}
            isUsed={opt.isUsed}
            onTap={() => onOptionTap(opt.text, opt.id)}
          />
        ))}
      </div>
    </div>
  );
};
