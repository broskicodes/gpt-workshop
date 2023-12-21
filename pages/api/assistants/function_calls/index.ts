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
    const { run_id, thread_id, assistant_id, tool_calls  } = req.body;

    const toolOutputs: RunSubmitToolOutputsParams.ToolOutput[] = await Promise.all(tool_calls.map(async (tool_call: ToolCall) => {
      const { id: call_id, function: funcCall } = tool_call;
      const args = JSON.parse(funcCall.arguments);

      switch (funcCall.name) {
        // EXTENSION: Implement handling for your custom functions here
        default:
          return {
            tool_call_id: call_id,
            output: "Error: Unhandled function call."
          }
      }
    }));

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
    console.error(error);
    // return new Response('Internal Server Error', { status: 500 });
    res.status(500).json({ error: 'An error occurred' });
  }
}