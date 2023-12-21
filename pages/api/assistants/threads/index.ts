import { NextApiRequest, NextApiResponse } from 'next';
import { config } from 'dotenv';
import { Message } from '@/types/chat';

config();
        
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

    // TODO: Call OpenAI API to create a new thread
    // TODO: Respond with the thread_id (only id, not object)

    res.status(500).send('Not implemented');
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
}