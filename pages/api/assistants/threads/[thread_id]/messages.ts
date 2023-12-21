import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { thread_id } = req.query;

    // TODO: Call OpenAI API to list messages for a thread
    // TODO: Respond with the recent message object (index 0)

    res.status(500).send('Not implemented');
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
}