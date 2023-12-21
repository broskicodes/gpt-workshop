import { ToolCall } from '@/types/assistant';
import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { RunSubmitToolOutputsParams } from 'openai/resources/beta/threads/runs/runs';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { run_id, thread_id, tool_calls  } = req.body;

    const toolOutputs: RunSubmitToolOutputsParams.ToolOutput[] = tool_calls.map((tool_call: ToolCall) => {
      return {
        tool_call_id: tool_call.id,
        output: `Tool call failed.`
      }
    });

    const runData = await openai.beta.threads.runs.submitToolOutputs(
      thread_id,
      run_id,
      {
        tool_outputs: toolOutputs
      }
    )

    res.status(200).json(runData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
}