"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export interface AIWorkoutPlan {
  planName: string;
  goal: string;
  level: string;
  duration: string;
  days: AIWorkoutDay[];
  summary: string;
  tips: string[];
}

export interface AIWorkoutDay {
  dayName: string;
  exercises: AIWorkoutExercise[];
}

export interface AIWorkoutExercise {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  notes: string;
}

export const generateWorkoutPlan = async (
  userProfile: any,
  preferences: {
    goal: string;
    level: string;
    equipment: string[];
    daysPerWeek: number;
    durationMinutes: number;
    injuries?: string;
    availableExercises: string[];
  }
): Promise<AIWorkoutPlan> => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please add GEMINI_API_KEY to your environment variables.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
    You are an expert certified fitness coach. Design a personalized weekly workout plan based on the following user profile and preferences.
    
    **User Profile:**
    - Age: ${userProfile?.age || 'Not specified'}
    - Gender: ${userProfile?.gender || 'Not specified'}
    - Weight: ${userProfile?.weight || 'Not specified'}
    
    **Preferences:**
    - Goal: ${preferences.goal}
    - Experience Level: ${preferences.level}
    - Equipment Available: ${preferences.equipment.join(', ')}
    - Frequency: ${preferences.daysPerWeek} days per week
    - Session Duration: ${preferences.durationMinutes} minutes
    - Injuries/Restrictions: ${preferences.injuries || 'None'}
    
    **Instructions:**
    1. Create a balanced, evidence-based plan that fits the user's goal and constraints.
    2. Use progressive overload principles.
    3. Include warm-up and cool-down suggestions in the notes or as separate items if essential.
    4. Prioritize using exercises from this list if appropriate: ${preferences.availableExercises.slice(0, 100).join(', ')}. If a necessary exercise is missing, you may suggest standard fitness exercises.
    5. STRICTLY output valid JSON in the structure defined below. Do not include markdown formatting like \`\`\`json.
    
    **Output JSON Structure:**
    {
      "planName": "string (e.g., 'Intermediate Hypertrophy Split')",
      "goal": "string (matches input)",
      "level": "string (matches input)",
      "duration": "string (matches input)",
      "summary": "string (brief overview of the methodology)",
      "tips": ["string", "string"],
      "days": [
        {
          "dayName": "string (e.g., 'Day 1: Upper Body Push')",
          "exercises": [
            {
              "name": "string (Exercise Name - try to match provided list exactly if possible)",
              "sets": "string or number",
              "reps": "string or number",
              "rest": "string (e.g. '90s')",
              "notes": "string (form cues, tempo, etc.)"
            }
          ]
        }
      ]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("Gemini Raw Response length:", text.length);

    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    
    if (firstBrace === -1 || lastBrace === -1) {
        throw new Error("Invalid response format: No JSON found");
    }

    const jsonString = text.substring(firstBrace, lastBrace + 1);
    const data = JSON.parse(jsonString);
    return data as AIWorkoutPlan;
  } catch (error) {
    console.error("Gemini Plan Generation Error:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate plan: ${error.message}`);
    }
    throw new Error("Failed to generate workout plan. Please try again.");
  }
};
