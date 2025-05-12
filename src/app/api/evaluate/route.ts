import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { answer, criteria, questionType } = await req.json();
    const prompt = `You are a JSON API. You must respond with valid JSON only, no other text.
    Evaluate the following ${questionType} response based on the given criteria.
    
    ${answer && `Response: ${answer}`}
    
    Evaluation Criteria:
    ${criteria.map((c: string) => `- ${c}`).join("\n")}
    
    Evaluate the response and provide:
    1. A score from 1-5 (where 5 is excellent)
    2. Detailed feedback explaining the score and suggesting improvements
    
    You must respond with a JSON object in this exact format:
    {
      "score": number,
      "feedback": string
    }
    
    Do not include any text before or after the JSON object.`;

    const response = await fetch(process.env.VITE_GEMINI_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;

    if (!content) {
      throw new Error("No content received from Gemini");
    }

    try {
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      if (!jsonMatch) {
        throw new Error("No JSON code block found in response");
      }
      const jsonContent = jsonMatch[1];
      const evaluation = JSON.parse(jsonContent);
      return NextResponse.json(evaluation);
    } catch {
      console.error("Invalid JSON response:", content);
      throw new Error("Invalid JSON response from Gemini");
    }
  } catch (error) {
    console.error("Error evaluating response:", error);
    return NextResponse.json(
      { error: "Failed to evaluate response: " + error },
      { status: 500 }
    );
  }
}
