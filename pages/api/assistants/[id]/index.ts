import { NextApiRequest, NextApiResponse } from "next";
import { Assistant } from "openai/resources/beta/assistants/assistants";

async function validateAssistant(assistant_id: string): Promise<Assistant | boolean> {
  // TODO: Retrieve the assistant with the given assistant ID
  // TODO Return the assistant object

  throw new Error('Not implemented');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { id: assistant_id } = req.query;
    const assistant = await validateAssistant(assistant_id as string);

    if (!assistant) {
      res.status(400).json({ error: 'Invalid assistant_id' });
      return;
    }

    res.status(200).json(assistant);
  } catch (error) {
    res.status(500).json({ error: error });
  }
}