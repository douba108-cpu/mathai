
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
    <div className="max-w-5xl mx-auto px-6 py-12">
      <header className="text-center mb-16">
        <h1 className="text-5xl font-bold text-slate-800 mb-4 tracking-tight">
          MathGuide AI
        </h1>
        <p className="text-slate-500 text-xl font-medium max-w-2xl mx-auto">
          智能解析应用题，剥离干扰信息，培养逻辑思维。
        </p>
      </header>

      {!analysis && (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-10">
            <label className="block text-lg font-bold text-slate-700 mb-4">
              请输入数学题目
            </label>
            <textarea
              className="w-full h-56 p-6 text-lg border border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all resize-none bg-slate-50 text-slate-700 placeholder-slate-400"
              placeholder="在这里粘贴或输入数学应用题..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>
          
          <div className="px-10 pb-10">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !inputText.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-5 rounded-lg shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-3 text-xl tracking-wide"
            >
              {isAnalyzing ? (
                <>
                  <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  正在深度分析...
                </>
              ) : (
                '开始智能分析'
              )}
            </button>

            {error && (
              <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 flex items-center gap-3 font-medium">
                <svg className="w-6 h-6 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}
          </div>

          <div className="bg-slate-50 px-10 py-8 border-t border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard 
                icon="🧠" 
                title="深度逻辑推演" 
                desc="Pro 级模型分步推理，确保解题思路严谨清晰。"
              />
              <FeatureCard 
                icon="🎯" 
                title="识别干扰陷阱" 
                desc="自动过滤无效信息，精准提取核心关键数据。"
              />
              <FeatureCard 
                icon="💡" 
                title="启发式教学" 
                desc="不直接给答案，而是通过引导让你自己领悟。"
              />
            </div>
          </div>
        </div>
      )}

      {analysis && (
        <div className="space-y-12 animate-in fade-in duration-500">
          <div className="flex justify-between items-center bg-white p-5 rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-green-500 rounded-full"></div>
              <span className="text-xl font-bold text-slate-800">解析完成</span>
              <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="ml-4 text-sm bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-md transition-colors font-medium"
              >
                {isAnalyzing ? '刷新中...' : '重新生成'}
              </button>
            </div>
            <button 
              onClick={reset}
              className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-2 px-4 py-2 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              分析新题目
            </button>
          </div>
          
          <AnalysisDisplay analysis={analysis} />
          
          <StepSolver steps={analysis.steps} problemText={inputText} />
        </div>
      )}

      <footer className="mt-24 text-center text-slate-400 font-medium">
        © 2024 MathGuide AI • Powered by Gemini 3 Pro
      </footer>
    </div>
  );
};

const FeatureCard: React.FC<{icon: string, title: string, desc: string}> = ({ icon, title, desc }) => (
  <div className="flex gap-4 items-start">
    <div className="text-3xl bg-white p-3 rounded-lg shadow-sm border border-slate-100">{icon}</div>
    <div>
      <h4 className="font-bold text-slate-800 mb-1">{title}</h4>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
  </div>
);

export default App;
