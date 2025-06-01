# Environment Setup

## Required Environment Variables

Add these to your `.env.local` file:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ai_learning_english"
DIRECT_URL="postgresql://username:password@localhost:5432/ai_learning_english"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-here"

# Google Gemini API (for AI Chatbot - FREE!)
GOOGLE_API_KEY="your-google-api-key-here"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-here"
```

## Google Gemini API Key Setup (FREE)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key
5. Add it to your `.env.local` file as `GOOGLE_API_KEY`

## Why Gemini API?

- **Completely FREE**: No credit card required
- **High quality**: Powered by Google's latest Gemini Pro model
- **Vietnamese support**: Better Vietnamese language understanding
- **No rate limits**: Generous free tier for development

## Features Enabled with Gemini Integration

- **Lesson-Aware AI Chatbot**: AI can analyze lesson content and answer questions
- **Context-Aware Responses**: AI understands current lesson context
- **IELTS-Focused Conversations**: AI filters non-relevant questions
- **Vietnamese Language Support**: Native Vietnamese responses
- **Intelligent Response Generation**: Powered by LangChain and Gemini Pro

## API Comparison

| Feature         | Gemini API    | OpenAI API           |
| --------------- | ------------- | -------------------- |
| Cost            | **FREE**      | Paid                 |
| Setup           | Simple        | Requires payment     |
| Vietnamese      | **Excellent** | Good                 |
| IELTS Knowledge | **Excellent** | Good                 |
| Rate Limits     | **Generous**  | Limited on free tier |
