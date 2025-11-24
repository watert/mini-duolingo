import React from 'react';
import { SessionRecord } from '../types';
import { getHistory } from '../services/storage';

interface HistoryListProps {
  onSelectRecord: (record: SessionRecord) => void;
  onBack: () => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ onSelectRecord, onBack }) => {
  const history = getHistory();

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm z-10 flex items-center border-b border-gray-200">
        <button onClick={onBack} className="mr-4 text-gray-500 hover:text-gray-800 text-xl font-bold">
          ←
        </button>
        <h2 className="text-lg font-bold text-gray-800">历史记录</h2>
        <div className="flex-1 text-right text-xs text-gray-400">
           最近 {history.length} 条
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <div className="text-4xl mb-2">📜</div>
            <p>暂无学习记录</p>
          </div>
        ) : (
          history.map((record) => {
            const accuracy = Math.round(((record.totalItems - record.mistakes.length) / record.totalItems) * 100);
            return (
              <button
                key={record.id}
                onClick={() => onSelectRecord(record)}
                className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-blue-300 transition-colors flex items-center justify-between text-left"
              >
                <div className="flex-1">
                  <div className="font-bold text-gray-800 mb-1">{record.courseTitle}</div>
                  <div className="text-xs text-gray-400">
                    {new Date(record.startTime).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    {' · '}
                    {Math.round(record.duration / 1000)}秒
                  </div>
                </div>
                
                <div className="text-right flex flex-col items-end">
                   <div className={`text-xl font-black ${accuracy >= 90 ? 'text-green-500' : accuracy >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
                     {accuracy}%
                   </div>
                   {record.mistakes.length > 0 && (
                     <div className="text-xs text-red-400 font-medium">
                       {record.mistakes.length} 个错误
                     </div>
                   )}
                </div>
                
                <div className="ml-3 text-gray-300">›</div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};