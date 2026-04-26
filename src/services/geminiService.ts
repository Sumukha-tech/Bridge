import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const geminiService = {
  async askAssistant(prompt: string, context?: string, history: { role: 'user' | 'assistant', content: string }[] = []) {
    try {
      const systemInstruction = `
        You are a highly capable AI Assistant for a "School Management Platform".
        You serve both Students and Teachers.
        
        Capabilities:
        - Answer student doubts based on uploaded notes and assignments (if context is provided).
        - Summarize complex educational notes.
        - Suggest improvements for assignment drafts.
        - Help teachers generate new assignment ideas and lesson notes.
        - Provide clear, concise explanations of academic topics.
        
        Tone: Professional, encouraging, and clear.
        
        User Context: ${context || "A member of the school portal."}
      `;

      // Convert history to Gemini format
      const contents = history.map(h => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }]
      }));

      // Add current prompt
      contents.push({
        role: 'user',
        parts: [{ text: prompt }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents,
        config: {
          systemInstruction
        }
      });

      return response.text || "I'm sorry, I couldn't generate a response.";
    } catch (error) {
      console.error("Gemini Assistant Error:", error);
      throw error;
    }
  },

  async generateContent(type: 'questions' | 'notes' | 'rubric', topic: string, additionalContext?: string) {
    try {
      const systemInstruction = `
        You are an expert Educational Content Generator.
        Your goal is to help teachers create high-quality, professional, and clear materials.
        Format your response in clean Markdown.
      `;

      let prompt = '';
      if (type === 'questions') {
        prompt = `Generate 5 challenging but fair assessment questions for the topic: "${topic}". Include a brief answer key. ${additionalContext || ''}`;
      } else if (type === 'notes') {
        prompt = `Create comprehensive but concise study notes for the topic: "${topic}". Use headings, bullet points, and highlight key terms. ${additionalContext || ''}`;
      } else if (type === 'rubric') {
        prompt = `Create a professional grading rubric for an assignment on: "${topic}". Include criteria like Content, Accuracy, Presentation, and Critical Thinking. ${additionalContext || ''}`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { systemInstruction }
      });

      return response.text || "Failed to generate content.";
    } catch (error) {
      console.error("Gemini Generation Error:", error);
      throw error;
    }
  }
};
