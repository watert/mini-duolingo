import React from 'react';
import { SessionRecord, PinyinItem } from '../types';

interface SessionReportProps {
  record: SessionRecord;
  onClose: () => void;
}

const getLevelDescription = (level: number): string => {
  switch (level) {
    case 1: return "声母/单韵母";
    case 2: return "复韵母/声调";
    case 3: return "特殊规则";
    case 4: return "整体认读";
    case 5: return "进阶词汇";
    case 6: return "多音/多笔画";
    case 7: return "生动/复杂字";
    default: return "基础";
  }
};

const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}分 ${remainingSeconds}秒`;
};

const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString('zh-CN', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

export const SessionReport: React.FC<SessionReportProps> = ({ record, onClose }) => {
  const accuracy = Math.round(((record.totalItems - record.mistakes.length) / record.totalItems) * 100);
  
  // Dedup mistakes for display just in case, though logic usually sends unique
  const uniqueMistakes = Array.from(new Map(record.mistakes.map(item => [item.word, item])).values());

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm z-10 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">学习报告</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-sm font-bold">
          关闭
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Score Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="text-gray-400 text-sm font-medium mb-1">{record.courseTitle}</div>
          <div className={`text-6xl font-black mb-2 ${accuracy >= 90 ? 'text-green-500' : accuracy >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
            {accuracy}%
          </div>
          <div className="text-sm text-gray-400 font-medium">准确率</div>
          
          <div className="grid grid-cols-3 gap-4 w-full mt-6 pt-6 border-t border-gray-100">
            <div>
              <div className="text-xl font-bold text-gray-800">{record.totalItems}</div>
              <div className="text-xs text-gray-400">总字数</div>
            </div>
            <div>
              <div className="text-xl font-bold text-red-500">{uniqueMistakes.length}</div>
              <div className="text-xs text-gray-400">错题</div>
            </div>
            <div>
              <div className="text-xl font-bold text-blue-500">{formatDuration(record.duration)}</div>
              <div className="text-xs text-gray-400">耗时</div>
            </div>
          </div>
        </div>

        {/* Time Details */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-sm text-gray-500 flex justify-between">
          <span>开始: {formatDate(record.startTime)}</span>
          <span>结束: {formatDate(record.endTime)}</span>
        </div>

        {/* Mistakes List */}
        {uniqueMistakes.length > 0 ? (
          <div>
            <h3 className="text-gray-700 font-bold mb-3 px-1">需加强 ({uniqueMistakes.length})</h3>
            <div className="space-y-3">
              {uniqueMistakes.map((item, idx) => (
                <div key={`${item.word}-${idx}`} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col items-center justify-center w-12 bg-red-50 rounded-lg py-1 border border-red-100">
                      <span className="text-xs text-gray-500">{item.pinyin}</span>
                      <span className="text-xl font-bold text-gray-800">{item.word}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full inline-block">
                      Lv.{item.level}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {getLevelDescription(item.level)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-green-50 rounded-2xl p-6 text-center border border-green-100">
            <div className="text-4xl mb-2">🌟</div>
            <div className="font-bold text-green-700">完美通关!</div>
            <div className="text-green-600 text-sm">没有出现错误，继续保持!</div>
          </div>
        )}
      </div>

      {/* Footer Action */}
      <div className="p-4 bg-white border-t border-gray-200">
         <button 
           onClick={onClose}
           className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-transform"
         >
           返回
         </button>
      </div>
    </div>
  );
};