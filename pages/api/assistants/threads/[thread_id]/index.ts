import { NextApiRequest, NextApiResponse } from "next";
import { Thread } from "openai/resources/beta/threads/threads";


async function validateThread(thread_id: string): Promise<Thread | boolean> {
  // TODO: Retrieve the thread with the given thread ID
  // TODO Return the thread object

  throw new Error('Not implemented');
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
    res.status(500).json({ error: error });
  }
}