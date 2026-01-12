
import { GoogleGenAI, Type } from "@google/genai";
import { ProblemAnalysis, SegmentType, StepType } from "../types";

export async function analyzeMathProblem(problemText: string): Promise<ProblemAnalysis> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `你是一位叫“阿奇”的AI数学伙伴。请分析以下数学应用题。

    【角色设定】：
    - 名字：阿奇
    - 性格：超级亲切、幽默、充满活力，像一只聪明的边境牧羊犬。
    - 听众：12岁的孩子。
    - 语言风格：通俗易懂，像讲故事，多用鼓励性语言。
    - 绝对不要在文字中夹杂 LaTeX 符号（如 $...$），直接使用纯文本。

    【核心禁令】：
    - 严禁生成内容雷同的步骤。每个步骤必须代表解题过程中的一个“新里程碑”。
    - 严禁使用 LaTeX 或 $ 符号。
    - 严禁生成任何示意图、字符画或图形。只通过纯文字逻辑引导。
    - 使用 Unicode 数学符号：乘号用 "×"，除号用 "÷"，等号用 "="。
    - 计算必须 100% 准确。

    【步骤逻辑】：
    - 第一步：剥离“干扰项”，找准核心数据。
    - 中间步：分步建立逻辑，计算中间结果。
    - 最后步：得出结论并检查单位。

    待分析题目: "${problemText}"`,
    config: {
      thinkingConfig: { thinkingBudget: 32768 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          segments: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                type: { type: Type.STRING, description: "useful, useless, or misleading" },
                explanation: { type: Type.STRING }
              },
              required: ["text", "type"]
            }
          },
          keyVariables: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                value: { type: Type.STRING }
              }
            }
          },
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.NUMBER },
                type: { type: Type.STRING, description: "question 或 inference" },
                instruction: { type: Type.STRING, description: "阿奇对12岁孩子的引导语" },
                options: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING }
                },
                optionExplanations: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                correctOptionIndex: { 
                  type: Type.INTEGER 
                },
                aiConclusion: { type: Type.STRING },
                explanation: { type: Type.STRING, description: "阿奇的总结与鼓励" }
              },
              required: ["id", "type", "instruction", "explanation"]
            }
          }
        },
        required: ["segments", "steps", "keyVariables"]
      }
    }
  });

  try {
    const text = response.text;
    if (!text) throw new Error("AI 返回内容为空");
    const data = JSON.parse(text);
    
    if (data.steps) {
      data.steps = data.steps.map((step: any, index: number) => ({
        ...step,
        id: index + 1,
        correctOptionIndex: typeof step.correctOptionIndex === 'number' ? step.correctOptionIndex : 0
      }));
    }
    
    return data as ProblemAnalysis;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("生成解题路径时格式错误，请尝试重新生成。");
  }
}

export async function getSimplerExplanation(problemText: string, currentInstruction: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview", 
    contents: `你是一位叫“阿奇”的数学伙伴。学生（12岁）对解题步骤中的这句话感到困惑。
    
    题目背景: "${problemText}"
    当前那句看不懂的话: "${currentInstruction}"
    
    任务：请换一种非常通俗、生动、直白的方式重新解释这句话的意思。
    要求：
    1. 使用生活中的比喻（例如：吃披萨、分糖果、排队等）。
    2. 语气要超级可爱、亲切，像是在跟朋友聊天。
    3. 解释要短，控制在 60 字以内。
    4. 不要讲公式，讲逻辑。`
  });
  return response.text || "哎呀，网络开小差了，再试一次看看？";
}
