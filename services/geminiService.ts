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

    【核心交互规则 - 重要】：
    1. **用户主导计算**：所有的逻辑推导和数值计算步骤，必须设计为选择题 (\`type: 'question'\`)。
    2. **禁止剧透**：\`instruction\` (引导语) 只能提供解题思路、方向或公式提示（例如：“这里我们需要算出总共有多少个苹果，你知道怎么算吗？”），**严禁**在引导语中直接包含计算结果或具体的数字运算过程（如“3乘以5”）。
    3. **选项设计**：\`options\` 必须包含正确的计算结果或逻辑结论，并提供2-3个合理的干扰项。
    4. **Inference 类型**：仅用于纯文字的最终总结或简单的过渡，不包含具体计算任务。

    【核心禁令】：
    - 严禁生成内容雷同的步骤。每个步骤必须代表解题过程中的一个“新里程碑”。
    - 严禁使用 LaTeX 或 $ 符号。
    - 严禁生成任何示意图、字符画或图形。只通过纯文字逻辑引导。
    - 使用 Unicode 数学符号：乘号用 "×"，除号用 "÷"，等号用 "="。
    - 计算必须 100% 准确。

    【步骤逻辑】：
    - 第一步：引导用户剥离“干扰项”，找准核心数据。
    - 中间步：引导用户分步建立逻辑，让用户自己选择正确的计算结果。
    - 最后步：引导用户得出最终结论。

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
                type: { type: Type.STRING, description: "question (for calculations) or inference (for summary)" },
                instruction: { type: Type.STRING, description: "阿奇的提示性引导语，不含结果" },
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
                explanation: { type: Type.STRING, description: "用户答对后的详细解析与鼓励" }
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
    当前那句提示语: "${currentInstruction}"
    
    任务：请换一种非常通俗、生动、直白的方式重新解释这句话，帮助他理解应该往哪个方向思考。
    要求：
    1. 使用生活中的比喻（例如：吃披萨、分糖果、排队等）。
    2. 语气要超级可爱、亲切，像是在跟朋友聊天。
    3. 解释要短，控制在 60 字以内。
    4. 不要直接给答案，而是给提示。`
  });
  return response.text || "哎呀，网络开小差了，再试一次看看？";
}