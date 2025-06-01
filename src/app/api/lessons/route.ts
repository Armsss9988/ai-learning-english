import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    const prompt = `You are a JSON API. You must respond with valid JSON only, no other text.
    Generate a comprehensive English lesson for topic: "${topic}".

    The lesson should include:
    1. A clear and detailed title.
    2. A theory section structured as follows:
       - start with **Definition:**.
       - **Definition**: Provide a concise definition of the topic.
       - **Usage**: Explain when and how the topic is used, with examples.
       - **Formulas/Rules**: If applicable, include formulas or grammatical rules.
       - **Examples**: Provide multiple examples to illustrate the topic.
       - **Common Mistakes**: Highlight common errors and how to avoid them.
       - **Tips**: Offer practical tips for mastering the topic.
       - **Real-world Applications**: Explain how the topic can be applied in everyday situations or professional contexts.
    3. Practice questions appropriate for the skill being taught.

    For practice questions:
   Requirements:
- Include 15+ practice questions, covering all 4 skills: Listening, Speaking, Reading, Writing.
- Ensure a balanced distribution:
  - Listening: 4+ questions with "audioText" (simulate listening).
  - Speaking: 4+ speaking/essay questions with evaluationCriteria, the speaking evaluationCriteria will ignore Pronunciation and Intonation criteria.
  - Reading: 4+ reading comprehension questions.
  - Writing: 4+ essay questions.
- Include a variety of question types: multiple_choice, essay, speaking, categorization.
- Use "audioText" for questions that simulate audio input (text only).
- For speaking and writing, provide detailed "evaluationCriteria" (grammar, vocabulary, structure, pronunciation/coherence). A Question must present a specific real-life situation where the user is required to respond based on what they have learned in the Theory section, using at least 5 sentences. 
- For multiple-choice questions, ensure that options are represented using keys like "A", "B", "C", "D", etc., and the correctAnswer field should match the corresponding key (e.g., "A").
- Each question must have:
  - question
  - type
  - options (only if needed)
  - correctAnswer
  - explanation
  - evaluationCriteria (only for speaking and essay)
  - audioText (must have at least 5 sentences for Listening)
  - imageUrl (optional)
  - timeLimit (optional)

    You must respond with a JSON object in this exact format:
    {
      "title": string,
      "theory": string,
      "questions": [
        {
          "question": string,
          "type": only in "multiple_choice" | "essay" | "speaking" | "categorization",
          "options": JSON (for multiple_choice, categorization only),
          "correctAnswer": string,
          "explanation": string,
          "evaluationCriteria": string[] (for essay and speaking),
          "audioText": String?,
          "imageUrl": String?,
          "timeLimit": Int?,
        }
      ]
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
    console.log(data);
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
      const lesson = JSON.parse(jsonContent);
      console.log(lesson);
      return NextResponse.json(lesson);
    } catch {
      console.error("Invalid JSON response:", content);
      throw new Error("Invalid JSON response from Gemini");
    }
  } catch (error) {
    console.error("Error generating lesson:", error);
    return NextResponse.json(
      { error: "Failed to generate lesson: " + error },
      { status: 500 }
    );
  }
}
