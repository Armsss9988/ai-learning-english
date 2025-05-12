import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { verify } from 'jsonwebtoken';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
    const learningPaths = await prisma.learningPath.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        lessons: true,
      },
    });

    return NextResponse.json(learningPaths);
  } catch (error) {
    console.error('Fetch learning paths error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { startLevel, targetLevel } = await request.json();

    const prompt = `You are a JSON API. You must respond with valid JSON only, no other text.
    Generate a detailed English learning path from level ${startLevel} to ${targetLevel}. 
    Focus on essential English language skills and practical communication abilities.
    
    For each main topic, create specific lesson parts. For example:
    - If a topic has 5 lessons, create 5 specific parts
    - If a topic has 10 lessons, create 10 specific parts
    
    Include the following information:
    1. Total number of lessons needed
    2. Main topics with specific lesson parts (each part should be a complete lesson topic)
    3. Estimated time for each topic
    4. Key skills to develop
    
    You must respond with a JSON object in this exact format:
    {
      "title": string,
      "description": string,
      "totalLessons": number,
      "topics": string[],
      "estimatedTime": string,
      "keySkills": string[]
    }
    
    Example of how to structure topics with parts:
    [
      "Expanding Vocabulary: Everyday situations, work, travel (Part 1/10) - Basic workplace vocabulary",
      "Expanding Vocabulary: Everyday situations, work, travel (Part 2/10) - Travel-related terms",
      "Grammar Fundamentals: Tenses, articles, prepositions (Part 1/5) - Present Simple and Continuous",
      "Grammar Fundamentals: Tenses, articles, prepositions (Part 2/5) - Past Simple and Past Continuous",
      "Pronunciation Practice: Sound discrimination, stress patterns (Part 1/5) - Vowel sounds and minimal pairs",
      "Reading Comprehension: Articles, stories, and reports (Part 1/10) - Skimming and scanning techniques",
      "Writing Skills: Emails, essays, and descriptions (Part 1/10) - Formal email writing",
      "Listening Practice: Conversations and interviews (Part 1/10) - Understanding main ideas",
      "Speaking Skills: Role-playing and discussions (Part 1/10) - Self-introduction and greetings"
    ]
    
    Each topic part should be specific and focused on a particular aspect of the main topic.
    Make sure to include the part number and total parts in each topic name (e.g., "Part 1/10").
    
    Example key skills:
    - Expressing ideas clearly in English
    - Understanding native speakers
    - Writing grammatically correct sentences
    - Using appropriate vocabulary in context
    - Speaking with correct pronunciation
    - Reading and understanding various texts
    - Listening and responding appropriately
    
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

      const learningPath = JSON.parse(jsonContent);
      return NextResponse.json(learningPath);
    } catch {
      console.error("Invalid JSON response:", content);
      throw new Error("Invalid JSON response from Gemini");
    }
  } catch (error) {
    console.error("Error generating learning path:", error);
    return NextResponse.json(
      { error: "Failed to generate learning path: " + error },
      { status: 500 }
    );
  }
}
