import { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";
import { IncomingForm } from 'formidable';
import { createReadStream, readFileSync, renameSync } from "fs";

export const config = {
  api: {
    bodyParser: false, // Disable built-in body parsing
  },
};

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function validateAssistant(assistant_id: string): Promise<string | boolean> {
  // Check if assistant_id is valid
  const getAssistantResponse = await fetch(`https://api.openai.com/v1/assistants/${assistant_id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'OpenAi-Beta': 'assistants=v1', // Add the OpenAi-Beta header
    },
  });

  const getAssistantData = await getAssistantResponse.json();

  if (getAssistantData.error) {
    console.error('Error getting assistant:', getAssistantData.error);
    return false;
  }

  return getAssistantData.id;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
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

    const form = new IncomingForm();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Error parsing the form data.' });
        return;
      }

      const jsonFile = files['jsonFile']![0];
      const filepath = 'user_data.json';
      renameSync(jsonFile.filepath, filepath);

      console.log(readFileSync(filepath).toString());

      const file = await openai.files.create({
        file: createReadStream(filepath),
        purpose: "assistants"
      });

      const assistantFile = await openai.beta.assistants.files.create(
        assistant_id as string,
        {
          file_id: file.id,
        }
      );

      res.status(200).json({ assistantFile });
    });
    
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
}