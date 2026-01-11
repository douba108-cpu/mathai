
import React, { useState } from 'react';
import { analyzeMathProblem } from './services/geminiService';
import { ProblemAnalysis } from './types';
import AnalysisDisplay from './components/AnalysisDisplay';
import StepSolver from './components/StepSolver';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ProblemAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);
    
    try {
      const result = await analyzeMathProblem(inputText);
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || '分析过程中出现错误，请检查网络或重试');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setAnalysis(null);
    setInputText('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
          Math<span className="text-indigo-600">Guide</span> AI
        </h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          不仅仅是给出答案，我们帮你剥离干扰，通过深度逻辑推导，培养你的解题思维。
        </p>
      </header>

      {!analysis && (
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
              请输入数学应用题
            </label>
            <textarea
              className="w-full h-48 p-5 text-lg border-2 border-slate-100 rounded-xl focus:border-indigo-500 focus:ring-0 transition-all resize-none bg-slate-50"
              placeholder="例如：小明去超市买苹果。今天天气特别好，他骑着那辆去年生日买的红色自行车（价值500元）。他买了3斤苹果，每斤5元，还买了2斤香蕉。超市老板今天心情不错，多给了他1个塑料袋。请问小明买苹果花了多少钱？"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>
          
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !inputText.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 text-lg"
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                正在进行深度思考与逻辑校验...
              </>
            ) : (
              '开始智能分析'
            )}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard 
              icon="🧠" 
              title="深度推演" 
              desc="使用 Pro 级模型进行逻辑推导，确保解题步骤严谨无误。"
            />
            <FeatureCard 
              icon="🎯" 
              title="精准纠错" 
              desc="识别题目中的无关信息与陷阱，帮你精准定位核心变量。"
            />
            <FeatureCard 
              icon="🤝" 
              title="交互解题" 
              desc="通过引导式问答，像真人老师一样带你理清思路。"
            />
          </div>
        </div>
      )}

      {analysis && (
        <div className="space-y-8 animate-in fade-in duration-700">
          <div className="flex justify-between items-center bg-indigo-50 p-4 rounded-xl border border-indigo-100">
            <div className="flex items-center gap-2">
              <span className="text-indigo-800 font-medium">✨ 已为您完成逻辑拆解</span>
              <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-2 py-1 rounded transition-colors"
                title="如果发现选项有误，请点击重新生成"
              >
                {isAnalyzing ? '刷新中...' : '发现错误？重新生成'}
              </button>
            </div>
            <button 
              onClick={reset}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-bold flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              分析另一道题
            </button>
          </div>
          
          <AnalysisDisplay analysis={analysis} />
          
          <StepSolver steps={analysis.steps} />
        </div>
      )}

      <footer className="mt-20 text-center text-slate-400 text-sm border-t border-slate-100 pt-8">
        © 2024 MathGuide AI • 使用 Gemini 3 Pro 深度推演
      </footer>
    </div>
  );
};

const FeatureCard: React.FC<{icon: string, title: string, desc: string}> = ({ icon, title, desc }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-100 hover:border-indigo-100 transition-colors shadow-sm">
    <div className="text-3xl mb-3">{icon}</div>
    <h4 className="font-bold text-slate-800 mb-2">{title}</h4>
    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
  </div>
);

export default App;
