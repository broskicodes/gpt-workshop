import { ToolCall } from '@/types/assistant';
import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { RunSubmitToolOutputsParams } from 'openai/resources/beta/threads/runs/runs';

import Chats from '../../../../chats.json';

// export const runtime = 'edge';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    // return new Response('Method not allowed', { status: 405 });
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { run_id, thread_id, assistant_id, tool_calls  } = req.body;

    const toolOutputs: RunSubmitToolOutputsParams.ToolOutput[] = await Promise.all(tool_calls.map(async (tool_call: ToolCall) => {
      const { id: call_id, function: funcCall } = tool_call;
      const args = JSON.parse(funcCall.arguments);
      // console.log(funcCall.name, args);

      switch (funcCall.name) {
        case 'send_gc_link': {
          const chatName: string = args.chat_name;
          // @ts-ignore
          const { description, link } = Chats[chatName];

          return {
            tool_call_id: call_id,
            output: link && description ? `link: ${link}, description: ${description}` : "There was an error. No chat could be found matching the user's interests."
          }
        }
        case 'add_personality': {
          const response = await fetch('https://interests-api.sparkpods.xyz/interests', {
            method: 'POST',
            body: JSON.stringify({
              name: args.name,
              interest: args.personality,
              id: thread_id
            }),
            headers: {
              'Content-Type': 'application/json',
            },
          });
          

          if (response.ok) {
            return {
              tool_call_id: call_id,
              output: "User interests have been successfully recorded."
            }
          } else {
            return {
              tool_call_id: call_id,
              output: "An error occurred while recording user interests."
            }
          }
        }
        case "update_user_data": {
          const formData = new FormData();
          formData.append('jsonFile', new Blob([JSON.stringify(args, null, 12)], { type: 'application/json' }), 'user_data.json');

          const origin = req.headers.origin;

          const response = await fetch(`${origin}/api/assistant/${assistant_id}/update_user`, {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            return {
              tool_call_id: call_id,
              output: "User data has been successfully updated."
            }
          } else {
            return {
              tool_call_id: call_id,
              output: "An error occurred while updating user data."
            }
          }
        }
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