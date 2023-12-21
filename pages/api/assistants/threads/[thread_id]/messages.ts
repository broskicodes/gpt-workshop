import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

// Make sure OPENAI_API_KEY is set in your .env.local file
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { thread_id } = req.query;

    // List messages for a thread
    const getMessagesResponse = await fetch(`https://api.openai.com/v1/threads/${thread_id}/messages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'OpenAi-Beta': 'assistants=v1', // Add the OpenAi-Beta header
      },
    });

    const getMessagesData = await getMessagesResponse.json();

    if (getMessagesData.error) {
      console.error('Error getting run:', getMessagesData.error);
      return false;
    }

    // or the lazy way
    // const getMessagesData = await openai.beta.threads.messages.list(thread_id as string);

    // Only returns the most recent message
    res.status(200).json(getMessagesData.data[0]);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
}