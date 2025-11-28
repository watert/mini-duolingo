
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSessionStore } from '../store/sessionStore';
import { MistakeItem } from '../types';

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

export const SessionReport: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { lastSessionRecord } = useSessionStore();
  const record = lastSessionRecord;

  // Redirect if no record exists
  useEffect(() => {
    if (!record) {
      navigate('/', { replace: true });
    }
  }, [record, navigate]);

  if (!record) return null;

  const handleClose = () => {
    // If we came from history, go back to history.
    // If we came from game, go back to menu.
    if (location.state?.from === 'history') {
      navigate('/history');
    } else {
      navigate('/');
    }
  };

  const accuracy = Math.round(((record.totalItems - record.mistakes.length) / record.totalItems) * 100);
  
  // Dedup mistakes for display just in case, though logic usually sends unique
  const uniqueMistakes: MistakeItem[] = Array.from(new Map(record.mistakes.map(item => [item.question, item] as [string, MistakeItem])).values()) as any;

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm z-10 flex items-center justify-between shrink-0">
        <h2 className="text-lg font-bold text-gray-800">学习报告</h2>
        <button onClick={handleClose} className="text-gray-500 active:text-gray-800 text-sm font-bold p-2">
          关闭
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 overscroll-contain">
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
              <div className="text-xs text-gray-400">总题数</div>
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
                <div key={`${item.question}-${idx}`} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center w-full">
                  {/* Red Dot Indicator */}
                  <div className="w-2 h-2 rounded-full bg-red-500 mr-4 shrink-0 shadow-sm" />
                  
                  {/* Content */}
                  <div className="flex flex-col flex-1">
                    <span className="text-sm text-gray-400 font-medium leading-none mb-1">{item.answer}</span>
                    <span className="text-xl font-bold text-gray-800 leading-none">{item.question}</span>
                  </div>
                  
                  {/* Level Badge */}
                  <div className="ml-4">
                    <div className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full whitespace-nowrap">
                      Lv.{item.level}
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
      <div className="p-4 bg-white border-t border-gray-200 shrink-0">
         <button 
           onClick={handleClose}
           className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-transform"
         >
           返回
         </button>
      </div>
    </div>
  );
};
