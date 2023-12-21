import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import { Thread } from "openai/resources/beta/threads/threads";

// Make sure OPENAI_API_KEY is set in your .env.local file
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function validateThread(thread_id: string): Promise<Thread | boolean> {
  const getThreadResponse = await fetch(`https://api.openai.com/v1/threads/${thread_id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'OpenAi-Beta': 'assistants=v1', // Add the OpenAi-Beta header
    },
  });

  const getThreadData = await getThreadResponse.json();

  if (getThreadData.error) {
    console.error('Error getting thread:', getThreadData.error);
    return false;
  }

  // or the lazy way
  // const getThreadData = await openai.beta.threads.retrieve(thread_id);

  return getThreadData;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { id: thread_id } = req.query;
    const thread = await validateThread(thread_id as string);

    if (!thread) {
      res.status(400).json({ error: 'Invalid thread_id' });
      return;
    }

    res.status(200).json(thread);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
}