
import React, { useState, useEffect } from 'react';
import { SolvingStep, StepType } from '../types';
import { getSimplerExplanation } from '../services/geminiService';
// @ts-ignore
import confetti from 'canvas-confetti';

interface StepSolverProps {
  steps: SolvingStep[];
  problemText: string;
}

const StepSolver: React.FC<StepSolverProps> = ({ steps, problemText }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isWrong, setIsWrong] = useState(false);
  
  // State for simple explanations
  const [simpleExplanations, setSimpleExplanations] = useState<Record<number, string>>({});
  const [isExplaining, setIsExplaining] = useState(false);

  const currentStep = steps[currentStepIndex];
  const correctIdx = typeof currentStep.correctOptionIndex === 'number' ? currentStep.correctOptionIndex : -1;

  useEffect(() => {
    setSelectedOption(null);
    setIsWrong(false);
  }, [currentStepIndex]);

  const handleOptionClick = (index: number) => {
    setSelectedOption(index);
    if (index === correctIdx) {
      setIsWrong(false);
      // Fire fireworks!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#10b981', '#f59e0b', '#ef4444']
      });
    } else {
      setIsWrong(true);
      setTimeout(() => setIsWrong(false), 500);
    }
  };

  const nextStep = () => {
    setCurrentStepIndex(prev => Math.min(prev + 1, steps.length - 1));
  };

  const handleExplainSimply = async () => {
    if (isExplaining) return;
    setIsExplaining(true);
    try {
      const text = await getSimplerExplanation(problemText, currentStep.instruction);
      setSimpleExplanations(prev => ({
        ...prev,
        [currentStep.id]: text
      }));
    } catch (e) {
      console.error(e);
      alert("请检查网络连接");
    } finally {
      setIsExplaining(false);
    }
  };

  const isLastStep = currentStepIndex === steps.length - 1;
  const isCorrect = selectedOption !== null && selectedOption === correctIdx;
  const canProceed = currentStep.type === StepType.INFERENCE || isCorrect;

  return (
    <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden mb-12">
      {/* Header */}
      <div className="bg-slate-800 text-white px-8 py-5 flex justify-between items-center">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <span className="bg-indigo-500 p-1.5 rounded text-sm">Step {currentStepIndex + 1}</span>
          跟阿奇学数学
        </h3>
        <span className="text-slate-300 font-medium">
           {currentStepIndex + 1} / {steps.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-2">
        <div 
          className="bg-indigo-500 h-2 transition-all duration-500 ease-out"
          style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
        ></div>
      </div>

      <div className="p-8 md:p-10">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Instruction Card */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-6 relative">
            <div className="flex justify-between items-start gap-6">
              <div>
                <h4 className="text-indigo-800 font-bold mb-2 uppercase text-xs tracking-wider">阿奇的引导</h4>
                <p className="text-xl text-slate-800 font-medium leading-relaxed">
                  {currentStep.instruction}
                </p>
              </div>
              
              {!simpleExplanations[currentStep.id] && (
                <button 
                  onClick={handleExplainSimply}
                  disabled={isExplaining}
                  className="shrink-0 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm font-bold py-2 px-4 rounded-lg transition-all shadow-sm flex items-center gap-2"
                >
                  {isExplaining ? (
                    <span className="animate-pulse">思考中...</span>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      看不懂？换个讲法
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Simple Explanation Expandable */}
            {simpleExplanations[currentStep.id] && (
              <div className="mt-4 pt-4 border-t border-indigo-200/50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-start gap-3">
                  <div className="bg-yellow-100 p-1.5 rounded text-yellow-700 mt-1">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <span className="block text-yellow-800 font-bold text-sm mb-1">通俗解释</span>
                    <p className="text-slate-700 text-lg leading-relaxed">
                      {simpleExplanations[currentStep.id]}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Options Area */}
          {currentStep.type === StepType.QUESTION && currentStep.options && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentStep.options.map((option, idx) => {
                  const isThisSelected = selectedOption === idx;
                  const isThisActuallyCorrect = idx === correctIdx;
                  
                  let colorClass = 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-md';
                  if (isThisSelected) {
                    colorClass = isThisActuallyCorrect 
                      ? 'bg-emerald-50 border-emerald-500 shadow-md ring-1 ring-emerald-500' 
                      : 'bg-red-50 border-red-500 shadow-md ring-1 ring-red-500';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionClick(idx)}
                      disabled={isCorrect && !isThisSelected}
                      className={`group p-6 text-left border rounded-lg transition-all duration-200 ${colorClass} ${isWrong && isThisSelected ? 'animate-shake' : ''}`}
                    >
                      <div className="flex items-center gap-4">
                        <span className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold border ${
                          isThisSelected 
                            ? (isThisActuallyCorrect ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-red-500 text-white border-red-500')
                            : 'bg-slate-100 text-slate-500 border-slate-200 group-hover:bg-indigo-500 group-hover:text-white group-hover:border-indigo-500 transition-colors'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-xl text-slate-800 font-medium">{option}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Feedback Message */}
              {selectedOption !== null && currentStep.optionExplanations && (
                <div className={`p-5 rounded-lg border flex gap-4 animate-in zoom-in-95 duration-200 ${
                  isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-orange-50 border-orange-200 text-orange-900'
                }`}>
                  <div className={`text-2xl ${isCorrect ? 'text-emerald-500' : 'text-orange-500'}`}>
                    {isCorrect ? '✓' : '!'}
                  </div>
                  <div>
                    <h5 className="font-bold mb-1">
                      {isCorrect ? '回答正确！' : '再思考一下'}
                    </h5>
                    <p className="text-lg leading-relaxed opacity-90">
                      {currentStep.optionExplanations[selectedOption]}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Inference Step Display */}
          {currentStep.type === StepType.INFERENCE && (
            <div className="bg-indigo-50 border-l-4 border-indigo-500 p-6 rounded-r-lg shadow-sm">
              <h4 className="text-indigo-800 font-bold mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                逻辑推导
              </h4>
              <p className="text-xl text-indigo-900 font-bold">
                {currentStep.aiConclusion}
              </p>
            </div>
          )}

          {/* Proceed Section */}
          {canProceed && (
            <div className="mt-8 pt-8 border-t border-slate-200 animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-slate-50 rounded-lg p-6 mb-8 border border-slate-200">
                <span className="text-indigo-600 font-bold block mb-2 text-sm uppercase tracking-wider">本步总结</span>
                <p className="text-xl text-slate-800 font-medium">{currentStep.explanation}</p>
              </div>
              
              {!isLastStep ? (
                <button
                  onClick={nextStep}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 text-xl"
                >
                  下一步
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <div className="bg-emerald-600 text-white p-8 rounded-lg text-center shadow-xl">
                  <div className="text-5xl mb-4">🏆</div>
                  <h4 className="text-3xl font-bold mb-2">挑战成功！</h4>
                  <p className="text-xl opacity-90">这道题你已经完全掌握了！</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.3s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
};

export default StepSolver;
