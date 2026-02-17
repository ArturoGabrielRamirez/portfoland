
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testGemini() {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    console.log('Testing Gemini with API Key:', apiKey ? 'FOUND' : 'MISSING');

    if (!apiKey) return;

    const google = createGoogleGenerativeAI({ apiKey });

    const modelId = 'gemini-2.0-flash';
    console.log(`Testing model: ${modelId}...`);
    try {
        const { text } = await generateText({
            model: google(modelId) as any,
            prompt: 'Confirm model works.',
        });
        console.log(`SUCCESS [${modelId}]:`, text);
    } catch (error: any) {
        console.error(`FAILURE [${modelId}]:`, error.message);
    }
}

testGemini();
