
import React, { useState, useEffect, useMemo } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { TouchBackend } from 'react-dnd-touch-backend';
import { FillBlanksViewProps } from '../types';

const ItemTypes = {
  WORD: 'word',
};

// --- Sub-components for DnD ---

interface DraggableOptionProps {
  id: string;
  text: string;
  disabled: boolean;
  onSelect: () => void; // Fallback for click
}

const DraggableOption: React.FC<DraggableOptionProps> = ({ id, text, disabled, onSelect }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.WORD,
    item: { id, text },
    canDrag: !disabled,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
      handlerId: monitor.getHandlerId(),
    }),
  }), [id, text, disabled]);

  return (
    <div
      ref={drag}
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
  onDrop: (item: { id: string; text: string }) => void;
  onClick: () => void;
}

const DroppableSlot: React.FC<DroppableSlotProps> = ({ index, text, isCorrect, onDrop, onClick }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.WORD,
    drop: (item: { id: string; text: string }) => onDrop(item),
    canDrop: () => text === null, // Only allow drop if empty
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }), [text, onDrop]);

  let statusClass = 'border-gray-300 bg-gray-50';
  if (isOver) {
    statusClass = 'border-blue-400 bg-blue-100 scale-105';
  } else if (text) {
    if (isCorrect === false) statusClass = 'border-red-400 bg-red-50 text-red-600 animate-shake';
    else if (isCorrect === true) statusClass = 'border-green-400 bg-green-50 text-green-600';
    else statusClass = 'border-blue-400 bg-blue-50 text-blue-600';
  }

  return (
    <div
      ref={drop}
      onClick={text ? onClick : undefined} // Only click to clear if has text
      className={`
        min-w-[80px] h-[48px] px-3 mx-1 border-b-4 rounded-lg transition-all text-xl font-bold flex items-center justify-center cursor-pointer select-none
        ${statusClass}
      `}
    >
      {text}
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
  // Store options as object to track usage
  const [availableOptions, setAvailableOptions] = useState<{id: string, text: string}[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Parse question to find segments
  const segments = useMemo(() => {
    return item.question.split('__');
  }, [item.question]);

  const blankCount = segments.length - 1;

  useEffect(() => {
    setFilledSlots(new Array(blankCount).fill(null));
    setAvailableOptions(item.options.map((opt, i) => ({ id: `opt-${i}`, text: opt })));
    setIsCorrect(null);
    setIsProcessing(false);
  }, [item, blankCount]);

  // Handle DnD Drop or Click Selection
  const handleFill = (text: string, sourceId: string, slotIndex?: number) => {
    if (isProcessing) return;

    // Determine target slot
    let targetIndex = slotIndex;
    
    // If no specific slot (click mode), find first empty
    if (targetIndex === undefined) {
      targetIndex = filledSlots.findIndex(s => s === null);
    }

    // If still no slot or invalid, ignore
    if (targetIndex === undefined || targetIndex === -1 || filledSlots[targetIndex] !== null) return;

    // Update slots
    const newSlots = [...filledSlots];
    newSlots[targetIndex] = text;
    setFilledSlots(newSlots);

    // Remove from available
    setAvailableOptions(prev => prev.filter(o => o.id !== sourceId));

    // Check completion
    if (newSlots.every(s => s !== null)) {
       checkAnswer(newSlots);
    }
  };

  const handleSlotClear = (index: number) => {
    if (isProcessing || !filledSlots[index]) return;

    const text = filledSlots[index]!;
    
    // Return to pool
    setAvailableOptions(prev => [...prev, { id: `returned-${Date.now()}`, text }]);

    // Clear slot
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
        setAvailableOptions(item.options.map((opt, i) => ({ id: `opt-${i}`, text: opt })));
        setIsProcessing(false);
      }, 1200);
    }
  };

  // DnD Backend options: Enable mouse events for desktop testing compatibility
  const backendOptions = {
    enableMouseEvents: true,
    enableTouchEvents: true,
  };

  return (
    <DndProvider backend={TouchBackend} options={backendOptions}>
      <div className="w-full max-w-sm flex flex-col items-center animate-fade-in h-full">
        
        {/* Question Area */}
        {/* Changed layout to items-center for better vertical alignment of text and inputs */}
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
                     onDrop={(item) => handleFill(item.text, item.id, i)}
                     onClick={() => handleSlotClear(i)}
                   />
                 )}
               </React.Fragment>
             ))}
           </div>
        </div>

        {/* Options Pool */}
        {/* Fixed height container to prevent layout jumping when options are removed */}
        <div className="w-full min-h-[160px] bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <div className="text-xs text-gray-400 font-bold mb-3 uppercase tracking-wider text-center">
            {availableOptions.length > 0 ? '拖拽或点击填空' : '...'}
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {availableOptions.map((opt) => (
              <DraggableOption
                key={opt.id}
                id={opt.id}
                text={opt.text}
                disabled={isProcessing}
                onSelect={() => handleFill(opt.text, opt.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </DndProvider>
  );
};
