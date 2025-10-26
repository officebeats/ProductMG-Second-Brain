import { GoogleGenAI, Type } from "@google/genai";
import { Task, TaskStatus, TaskType, TaskPriority, FeatureRequestEntry } from '../types';

if (!process.env.API_KEY) {
  // A real app would have more robust error handling or configuration.
  console.warn("API_KEY environment variable not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const isGeminiEnabled = () => !!process.env.API_KEY;

export const generateTaskContent = async (taskTitle: string): Promise<string> => {
  if (!isGeminiEnabled() || !taskTitle) {
    return Promise.resolve("AI functionality is disabled or title is missing.");
  }
  
  try {
    const fullPrompt = `As a world-class product manager, generate a succinct description for a task titled "${taskTitle}".
The description should be professional, actionable, and use bullet points for clarity where appropriate.
Focus on the key objectives and outcomes.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error generating content with Gemini:", error);
    return "There was an error generating content. Please try again.";
  }
};


export const suggestTaskDetails = async (title: string, description: string): Promise<{ status: TaskStatus; type: TaskType; priority: TaskPriority } | null> => {
    if (!isGeminiEnabled() || !title || !description) {
        return Promise.resolve(null);
    }

    try {
        const prompt = `Analyze the following task details and suggest the most appropriate status, type, and priority.
            
        Title: "${title}"
        Description: "${description}"
        
        Return a single JSON object with the keys "status", "type", and "priority".
        
        Possible values for "status": ${Object.values(TaskStatus).join(', ')}
        Possible values for "type": ${Object.values(TaskType).join(', ')}
        Possible values for "priority": ${Object.values(TaskPriority).join(', ')}
        `;

        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                status: { type: Type.STRING, enum: Object.values(TaskStatus) },
                type: { type: Type.STRING, enum: Object.values(TaskType) },
                priority: { type: Type.STRING, enum: Object.values(TaskPriority) },
            },
            required: ['status', 'type', 'priority'],
        };
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const jsonString = response.text.trim();
        const suggestedDetails = JSON.parse(jsonString);

        if (Object.values(TaskStatus).includes(suggestedDetails.status) &&
            Object.values(TaskType).includes(suggestedDetails.type) &&
            Object.values(TaskPriority).includes(suggestedDetails.priority)) {
            return suggestedDetails;
        } else {
            console.error("Gemini returned invalid suggestion:", suggestedDetails);
            return null;
        }

    } catch (error) {
        console.error("Error suggesting task details with Gemini:", error);
        return null;
    }
};

const formatCommentsForPrompt = (task: Task): string => {
    if (!task.comments || task.comments.length === 0) return 'No comments.';
    return task.comments.map(c => `- ${c.author.name} at ${new Date(c.createdAt).toLocaleString()}: "${c.content}"`).join('\n');
};

export const summarizeComments = async (task: Task): Promise<string> => {
    if (!isGeminiEnabled() || !task.comments || task.comments.length === 0) {
        return "No comments to summarize or AI is disabled.";
    }

    const formattedComments = formatCommentsForPrompt(task);
    const prompt = `Task Title: "${task.title}"
Task Description: "${task.description}"

Activity Log:
${formattedComments}

Based on the activity log for this task, provide a concise summary of the key discussion points, decisions made, and any action items. Use bullet points.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error summarizing comments:", error);
        return "Failed to generate summary.";
    }
};

export const generateUpdatedDescription = async (task: Task): Promise<string> => {
    if (!isGeminiEnabled()) {
        return "AI is disabled.";
    }

    const formattedComments = formatCommentsForPrompt(task);
    const prompt = `Please act as a product manager. Your goal is to update a task's description based on the latest activity.
    
Original Task Title: "${task.title}"
Original Task Description:
---
${task.description}
---

Recent Activity & Comments:
---
${formattedComments}
---

Based on the comments and activity, rewrite the original task description to be a comprehensive, up-to-date source of truth for this task. The new description should incorporate all relevant updates and decisions from the comments. Do not just summarize the comments; integrate their substance into a new, standalone description.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating updated description:", error);
        return task.description; // Return original on error
    }
};

export const analyzeFeatureRequest = async (rawRequest: string): Promise<Partial<Pick<FeatureRequestEntry, 'painPoint' | 'businessContext' | 'value'>> | null> => {
    if (!isGeminiEnabled() || !rawRequest) {
        return Promise.resolve(null);
    }

    try {
        const prompt = `Analyze the following user feature request. Your goal is to break it down into a simpler depiction for a product manager.
        
        Raw Request: "${rawRequest}"
        
        Extract the following information and return it as a single JSON object:
        1. "painPoint": What is the core problem or frustration the user is experiencing? Be concise.
        2. "businessContext": What is the broader business or operational context of this problem? Why does it matter to them or their company?
        3. "value": What is the potential value or benefit of solving this problem? What outcome are they hoping for?

        Keep the answers professional and focused on product management insights.
        `;

        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                painPoint: { type: Type.STRING, description: "The core problem or frustration the user is experiencing." },
                businessContext: { type: Type.STRING, description: "The broader business context of the problem." },
                value: { type: Type.STRING, description: "The potential value or benefit of solving this problem." },
            },
            required: ['painPoint', 'businessContext', 'value'],
        };
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const jsonString = response.text.trim();
        const analysis = JSON.parse(jsonString);

        return {
            painPoint: analysis.painPoint || 'Analysis failed.',
            businessContext: analysis.businessContext || 'Analysis failed.',
            value: analysis.value || 'Analysis failed.'
        };

    } catch (error) {
        console.error("Error analyzing feature request with Gemini:", error);
        return null;
    }
};
