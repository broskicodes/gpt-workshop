import { NextApiRequest, NextApiResponse } from "next";
import { Run } from "openai/resources/beta/threads/runs/runs";

async function validateRun(thread_id: string, run_id: string): Promise<Run | boolean> {
  // TODO: Retrieve the run with the given run ID
  // TODO Return the run object

  throw new Error('Not implemented');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { thread_id, id: run_id } = req.query;
    const run = await validateRun(thread_id as string, run_id as string);

    if (!run) {
      res.status(400).json({ error: 'Invalid run_id' });
      return;
    }

    res.status(200).json(run);
  } catch (error) {
    res.status(500).json({ error: error });
  }
}