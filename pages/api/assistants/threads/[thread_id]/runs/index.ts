import { NextApiRequest, NextApiResponse } from 'next';
import { config } from 'dotenv';
import { Message } from '@/types/chat';
import { Assistant } from 'openai/resources/beta/assistants/assistants';
import { Thread } from 'openai/resources/beta/threads/threads';
import { ThreadMessage } from 'openai/resources/beta/threads/messages/messages';

config(); // Load environment variables from .env.local file

async function validateAssistant(assistant_id: string): Promise<Assistant | boolean> {
  // TODO: Retrieve the assistant with the given assistant ID
  // TODO Return the assistant object

  throw new Error('Not implemented');
}

async function validateThread(thread_id: string): Promise<Thread | boolean> {
  // TODO: Retrieve the thread with the given thread ID
  // TODO Return the thread object

  throw new Error('Not implemented');
}

async function createMessage(thread_id: string, message: Message): Promise<ThreadMessage | boolean> {
  // TODO: Create a new message in the given thread with the given message data
  // TODO Return the message object

  throw new Error('Not implemented');
}
        
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    let { message, assistant_id } = req.body;
    let { thread_id } = req.query;
    
    // Check if assistant_id exists
    const assistant = await validateAssistant(assistant_id);
    const thread = await validateThread(thread_id as string);

    if (!assistant) {
      res.status(400).json({ error: 'Invalid assistant_id' });
      return;
    }

    if (!thread) {
      res.status(400).json({ error: 'Invalid thread_id' });
      return;
    }

    message && await createMessage(thread_id as string, message);

    // TODO: Call OpenAI API to create a new run on the given thread
    // TODO: Respond with created run object

    res.status(500).send('Not implemented');
  } catch (error) {
    res.status(500).json({ error: error });
  }
}