
import React, { useState, useEffect } from 'react';
import { SolvingStep, StepType } from '../types';

interface StepSolverProps {
  steps: SolvingStep[];
}

const StepSolver: React.FC<StepSolverProps> = ({ steps }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isWrong, setIsWrong] = useState(false);

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
    } else {
      setIsWrong(true);
      setTimeout(() => setIsWrong(false), 500);
    }
  };

  const nextStep = () => {
    setCurrentStepIndex(prev => Math.min(prev + 1, steps.length - 1));
  };

  const isLastStep = currentStepIndex === steps.length - 1;
  const isCorrect = selectedOption !== null && selectedOption === correctIdx;
  const canProceed = currentStep.type === StepType.INFERENCE || isCorrect;

  return (
    <div className="bg-white rough-box shadow-[10px_10px_0px_#e2e8f0] overflow-hidden mb-12 transform -rotate-1">
      <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center text-white border-b-4 border-slate-900">
        <h3 className="handwritten text-2xl tracking-wide">✏️ 数学笔记 - 思路梳理</h3>
        <span className="handwritten text-lg font-bold">
          第 {currentStepIndex + 1} 步 / 共 {steps.length} 步
        </span>
      </div>

      <div className="p-8 paper-bg">
        {/* 手绘感进度条 */}
        <div className="flex gap-4 mb-10">
          {steps.map((_, idx) => (
            <div 
              key={idx}
              className={`h-4 flex-1 transition-all duration-500 rough-box ${
                idx < currentStepIndex ? 'bg-emerald-400' : 
                idx === currentStepIndex ? 'bg-indigo-500 shadow-[0_5px_15px_rgba(99,102,241,0.4)]' : 'bg-white'
              }`}
            />
          ))}
        </div>

        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* 指导语 */}
          <div className="bg-yellow-50 rough-box p-6 shadow-sm transform rotate-1">
            <h4 className="handwritten text-indigo-600 text-xl mb-2">哥哥引导：</h4>
            <p className="handwritten text-2xl text-slate-800 leading-relaxed">
              {currentStep.instruction}
            </p>
          </div>

          {currentStep.type === StepType.QUESTION && currentStep.options && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentStep.options.map((option, idx) => {
                  const isThisSelected = selectedOption === idx;
                  const isThisActuallyCorrect = idx === correctIdx;
                  
                  let colorClass = 'bg-white border-slate-300';
                  if (isThisSelected) {
                    colorClass = isThisActuallyCorrect 
                      ? 'bg-emerald-100 border-emerald-500' 
                      : 'bg-red-100 border-red-500';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionClick(idx)}
                      disabled={isCorrect && !isThisSelected}
                      className={`group p-6 rough-box text-left transition-all duration-200 hover:scale-[1.02] active:scale-95 ${colorClass} ${isWrong && isThisSelected ? 'animate-shake' : ''}`}
                    >
                      <div className="flex items-center gap-4">
                        <span className={`handwritten w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 ${
                          isThisSelected 
                            ? (isThisActuallyCorrect ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-red-500 text-white border-red-600')
                            : 'bg-white border-slate-400 text-slate-500 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-700'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="handwritten text-2xl text-slate-800">{option}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* 反馈卡片 */}
              {selectedOption !== null && currentStep.optionExplanations && (
                <div className={`p-6 rough-box transform -rotate-1 shadow-md animate-in zoom-in-95 duration-300 ${
                  isCorrect ? 'bg-emerald-50 border-emerald-300' : 'bg-orange-50 border-orange-300'
                }`}>
                  <h5 className="handwritten text-2xl mb-2 flex items-center gap-2">
                    {isCorrect ? '🌟 哇！思路完全正确！' : '🧩 哎呀，这里有个小陷阱：'}
                  </h5>
                  <p className="handwritten text-xl text-slate-700 leading-relaxed">
                    {currentStep.optionExplanations[selectedOption]}
                  </p>
                </div>
              )}
            </div>
          )}

          {currentStep.type === StepType.INFERENCE && (
            <div className="rough-box p-8 bg-indigo-50 border-indigo-200 shadow-md transform -rotate-1">
              <h4 className="handwritten text-indigo-900 text-2xl mb-3">🧐 哥哥的思考推导：</h4>
              <p className="handwritten text-3xl text-indigo-700 italic font-bold">
                {currentStep.aiConclusion}
              </p>
            </div>
          )}

          {canProceed && (
            <div className="mt-12 pt-8 border-t-4 border-dashed border-slate-200 animate-in fade-in zoom-in-95 duration-700">
              <div className="bg-slate-100 rough-box p-6 mb-8 transform rotate-1">
                <span className="handwritten text-indigo-600 text-2xl block mb-2">💡 划重点：</span>
                <p className="handwritten text-2xl text-slate-800">{currentStep.explanation}</p>
              </div>
              
              {!isLastStep ? (
                <button
                  onClick={nextStep}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white handwritten py-6 rounded-xl shadow-[6px_6px_0px_#1e1b4b] transition-all transform hover:-translate-y-1 active:translate-y-1 flex items-center justify-center gap-4 text-3xl"
                >
                  继续下一步思路
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <div className="bg-indigo-600 text-white p-10 rough-box text-center shadow-2xl animate-bounce-slow">
                  <div className="text-6xl mb-6">🏆</div>
                  <h4 className="handwritten text-4xl mb-4">挑战圆满成功！</h4>
                  <p className="handwritten text-2xl opacity-90 font-bold">这一题你已经完全吃透啦，下次遇到同样的坑肯定能跳过去！</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px) rotate(-1deg); }
          75% { transform: translateX(8px) rotate(1deg); }
        }
        .animate-shake {
          animation: shake 0.3s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0) rotate(-1deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default StepSolver;
