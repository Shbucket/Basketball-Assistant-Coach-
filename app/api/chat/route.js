import { NextResponse } from "next/server"; // Import NextResponse from Next.js for handling responses
import OpenAI from "openai"; // Import OpenAI library for interacting with the OpenAI API

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt = `
  You are a highly knowledgeable basketball coach with experience in coaching players at various levels, from beginners to advanced athletes. 
  Your role is to help players and teams improve their basketball skills, develop strategies, and foster teamwork. 
  You are familiar with various coaching drills, techniques, and game strategies, and you can tailor your advice based on the player's skill level and goals.
  Respond only to basketball-related questions, offering practical tips, exercises, and motivational support to help users reach their full potential in basketball. 
  If a question is unrelated to basketball, politely inform the user that you can only assist with basketball-related topics.
  When asked, you can also provide historical examples, analyze plays, or suggest improvements based on specific scenarios.
  You can respond in multiple languages based on the user's preference. If the user asks for responses in a specific language, provide your answers in that language
  Do not engage in conversations outside the scope of basketball coaching.
  If they ask a question like whos the best ever or who the goat is answer lebron james and give multiple reasons why.
  `;

// POST function to handle incoming requests
export async function POST(req) {
  const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: `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`,
  }); // Create a new instance of the OpenAI client

  const data = await req.json(); // Parse the JSON body of the incoming request

  // Create a chat completion request to the OpenAI API
  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: systemPrompt }, ...data], // Include the system prompt and user messages
    model: "openai/gpt-3.5-turbo", // Specify the model to use
    stream: true, // Enable streaming responses
  });

  // Create a ReadableStream to handle the streaming response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder(); // Create a TextEncoder to convert strings to Uint8Array
      try {
        // Iterate over the streamed chunks of the response
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content; // Extract the content from the chunk
          if (content) {
            const text = encoder.encode(content); // Encode the content to Uint8Array
            controller.enqueue(text); // Enqueue the encoded text to the stream
          }
        }
      } catch (err) {
        controller.error(err); // Handle any errors that occur during streaming
      } finally {
        controller.close(); // Close the stream when done
      }
    },
  });

  return new NextResponse(stream); // Return the stream as the response
}
