import { ToolCall } from '@/types/assistant';
import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { RunSubmitToolOutputsParams } from 'openai/resources/beta/threads/runs/runs';

// export const runtime = 'edge';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    // return new Response('Method not allowed', { status: 405 });
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

    // return new Response(JSON.stringify(runData), { status: 200 });
    res.status(200).json(runData);
  } catch (error) {
    console.error('Error:', error);
    // return new Response('An error occurred', { status: 500 });
    res.status(500).json({ error: 'An error occurred' });
  }
}