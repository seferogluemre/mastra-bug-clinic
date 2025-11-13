import { openai } from '@ai-sdk/openai';

export const openaiModel = (modelName: string = 'gpt-4o') => {
  return openai(modelName, {
    apiKey: process.env.OPENAI_API_KEY,
  });
};

export const clinicModel = openaiModel('gpt-4o');