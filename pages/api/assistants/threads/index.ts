import { NextApiRequest, NextApiResponse } from 'next';
import { config } from 'dotenv';
import { Message } from '@/types/chat';
import OpenAI from 'openai';

config();
        
// Make sure OPENAI_API_KEY is set in your .env.local file
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {  
    const { messages } = req.body;

    if (messages && (!Array.isArray(messages) || messages.length === 0 || messages.some((message: Message) => !message.role || !message.content))) {
      res.status(400).json({ error: 'Invalid messages format' });
      return;
    }

    const createThreadResponse = await fetch(`https://api.openai.com/v1/threads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'OpenAi-Beta': 'assistants=v1', // Add the OpenAi-Beta header
      },
      body: JSON.stringify({
        messages: messages ?? undefined,
      }),
    });

    const createThreadData = await createThreadResponse.json();

    if (createThreadData.error) {
      console.error('Error creating thread:', createThreadData.error);
      return false;
    }

    // or the lazy way
    // const createThreadData = await openai.beta.threads.create({
    //   messages: messages ?? undefined,
    // });

    res.status(200).json(createThreadData.id);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
}