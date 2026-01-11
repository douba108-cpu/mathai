
import React from 'react';
import { ProblemAnalysis, SegmentType } from '../types';

interface AnalysisDisplayProps {
  analysis: ProblemAnalysis;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis }) => {
  const getSegmentStyles = (type: SegmentType) => {
    switch (type) {
      case SegmentType.USELESS :
        return 'text-gray-400 line-through decoration-red-300';
      case SegmentType.MISLEADING:
        return 'bg-orange-100 text-orange-800 border-b-2 border-orange-400 px-1 rounded-sm font-medium';
      case SegmentType.USEFUL:
        return 'bg-emerald-50 text-emerald-900 border-b-2 border-emerald-400 px-1 rounded-sm font-semibold';
      default:
        return '';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <span className="w-2 h-6 bg-indigo-600 rounded-full"></span>
        题目深度解析
      </h3>
      
      <div className="text-lg leading-relaxed mb-6 whitespace-pre-wrap">
        {analysis.segments.map((seg, idx) => (
          <span 
            key={idx} 
            className={`${getSegmentStyles(seg.type as SegmentType)} transition-all duration-300 mr-1 cursor-help group relative`}
          >
            {seg.text}
            {seg.explanation && (
              <span className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-800 text-white text-xs p-2 rounded shadow-lg z-10 text-center">
                {seg.explanation}
              </span>
            )}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 mt-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
          <span className="w-3 h-3 rounded-full bg-emerald-400"></span> 关键数据 (Useful)
        </div>
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
          <span className="w-3 h-3 rounded-full bg-orange-400"></span> 误导陷阱 (Misleading)
        </div>
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
          <span className="w-3 h-3 rounded-full bg-gray-300"></span> 无关修饰 (Useless)
        </div>
      </div>
    </div>
  );
};

export default AnalysisDisplay;
