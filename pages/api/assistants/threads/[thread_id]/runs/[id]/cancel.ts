import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import { Run } from "openai/resources/beta/threads/runs/runs";

// Make sure OPENAI_API_KEY is set in your .env.local file
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function validateRun(thread_id: string, run_id: string): Promise<Run | boolean> {
  const getRunResponse = await fetch(`https://api.openai.com/v1/threads/${thread_id}/runs/${run_id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'OpenAi-Beta': 'assistants=v1', // Add the OpenAi-Beta header
    },
  });

  const getRunData = await getRunResponse.json();

  if (getRunData.error) {
    console.error('Error getting run:', getRunData.error);
    return false;
  }

  // or the lazy way
  // const getRunData = await openai.beta.threads.runs.retrieve(thread_id, run_id);

  return getRunData;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
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

    // const cancelRunResponse = await fetch(`https://api.openai.com/v1/threads/${thread_id}/runs/${run_id}/cancel`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    //     'OpenAi-Beta': 'assistants=v1', // Add the OpenAi-Beta header
    //   },
    // });

    // const cancelRunData = await cancelRunResponse.json();

    // or the lazy way
    const cancelRunData = await openai.beta.threads.runs.cancel(thread_id as string, run_id as string);

    if (cancelRunData) {
      res.status(200).json(cancelRunData);
    } else {
      res.status(500).json({ error: 'Could not cancel run' });
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
}