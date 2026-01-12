
import React from 'react';
import { ProblemAnalysis, SegmentType } from '../types';

interface AnalysisDisplayProps {
  analysis: ProblemAnalysis;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis }) => {
  const getSegmentStyles = (type: SegmentType) => {
    switch (type) {
      case SegmentType.USELESS :
        return 'text-slate-400 line-through decoration-slate-300 decoration-2';
      case SegmentType.MISLEADING:
        return 'bg-orange-100 text-orange-800 border-b-2 border-orange-300 font-semibold px-1';
      case SegmentType.USEFUL:
        return 'bg-emerald-100 text-emerald-900 border-b-2 border-emerald-300 font-bold px-1';
      default:
        return '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-800">题目结构拆解</h3>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
            <span className="w-3 h-3 rounded-sm bg-emerald-500"></span> 有用信息
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
            <span className="w-3 h-3 rounded-sm bg-orange-500"></span> 干扰信息
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
            <span className="w-3 h-3 rounded-sm bg-slate-300"></span> 无用信息
          </div>
        </div>
      </div>
      
      <div className="p-8">
        <div className="text-xl leading-relaxed whitespace-pre-wrap text-slate-800 font-medium">
          {analysis.segments.map((seg, idx) => (
            <span 
              key={idx} 
              className={`${getSegmentStyles(seg.type as SegmentType)} transition-colors mr-1 cursor-help relative group rounded-sm`}
            >
              {seg.text}
              {seg.explanation && (
                <span className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-800 text-white text-sm p-3 rounded-lg shadow-xl z-10 text-center font-normal pointer-events-none">
                  {seg.explanation}
                  <svg className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 text-slate-800 w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21l-12-18h24z" />
                  </svg>
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalysisDisplay;
