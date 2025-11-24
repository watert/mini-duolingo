import React, { useState } from 'react';
import { Course, CourseGroup } from '../types';
import { courseGroups } from '../data/index';
import { getMistakes } from '../services/storage';

interface CourseSelectionProps {
  onSelect: (course: Course) => void;
  onMistakeSelect: () => void;
  onHistorySelect: () => void;
}

export const CourseSelection: React.FC<CourseSelectionProps> = ({ onSelect, onMistakeSelect, onHistorySelect }) => {
  const [selectedGroupId, setSelectedGroupId] = useState<string>(courseGroups[0].id);
  const mistakes = getMistakes();
  const hasMistakes = mistakes.length > 0;

  const activeGroup = courseGroups.find(g => g.id === selectedGroupId) || courseGroups[0];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white p-6 border-b border-gray-200 shadow-sm sticky top-0 z-10 flex justify-between items-center shrink-0">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-green-600 tracking-tight">
            Pinyin<span className="text-amber-500">Match</span>
          </h1>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Master Chinese Pinyin</p>
        </div>
        <button 
          onClick={onHistorySelect}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
          title="历史记录"
        >
          <span className="text-2xl">📜</span>
        </button>
      </div>

      {/* Group Tabs */}
      <div className="flex px-4 pt-4 space-x-2 overflow-x-auto no-scrollbar bg-white/50 backdrop-blur-sm sticky top-[88px] z-10 pb-2 shrink-0">
        {courseGroups.map(group => (
          <button
            key={group.id}
            onClick={() => setSelectedGroupId(group.id)}
            className={`whitespace-nowrap px-6 py-2 rounded-full text-sm font-bold transition-all ${
              selectedGroupId === group.id
                ? 'bg-green-600 text-white shadow-md scale-105'
                : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            {group.title}
          </button>
        ))}
      </div>

      {/* Course List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 overscroll-contain">
        {/* Mistake Button (Always Visible at top if exists) */}
        {hasMistakes && (
          <button
            onClick={onMistakeSelect}
            className="w-full group relative flex items-center p-4 bg-white border-2 border-red-100 border-b-4 rounded-2xl hover:bg-red-50 hover:border-red-200 active:border-b-2 active:translate-y-[2px] transition-all mb-6"
          >
             <div className="h-12 w-12 bg-red-100 rounded-xl flex items-center justify-center text-2xl mr-4 group-hover:scale-110 transition-transform shadow-sm">
               💔
            </div>
            <div className="text-left flex-1">
              <h3 className="font-bold text-red-600 text-lg">错题练习</h3>
              <p className="text-xs text-red-400 font-medium">
                {mistakes.length} 个待复习
              </p>
            </div>
            <div className="text-red-300 text-2xl">→</div>
          </button>
        )}

        <div className="space-y-3 pb-8">
          {activeGroup.courses.map((course, idx) => (
            <button
              key={course.id}
              onClick={() => onSelect(course)}
              className="w-full group relative flex items-center p-4 bg-white border-2 border-gray-100 border-b-4 rounded-2xl hover:bg-white hover:border-green-300 active:border-b-2 active:translate-y-[2px] transition-all"
            >
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-xl mr-4 font-bold shadow-sm transition-transform group-hover:scale-110 ${
                idx % 2 === 0 ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
              }`}>
                 {idx + 1}
              </div>
              <div className="text-left flex-1">
                <h3 className="font-bold text-gray-800 text-lg">{course.title}</h3>
                <p className="text-xs text-gray-400 font-medium line-clamp-1">{course.description}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-green-50 group-hover:text-green-500 transition-colors">
                ▶
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};