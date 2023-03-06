import { Configuration, CreateCompletionResponse, OpenAIApi } from "openai";
import { getConfig } from "../../config";

type ChatOptions = {
  model?: string;
  temperature?: number;
};

const DEFAULT_CHAT_MODEL = "text-davinci-003";
const config = getConfig();

const configuration = new Configuration({
  apiKey: config.openaiApiKey,
});

const openai = new OpenAIApi(configuration);

export const getOpenAI = (): OpenAIApi => openai;

export const getPromptAnswer = (
  api: OpenAIApi,
  prompt: string,
  options: ChatOptions = {}
) => {
  const { model, temperature } = options;
  return api.createCompletion({
    model: model || DEFAULT_CHAT_MODEL,
    prompt,
    temperature: temperature || 0,
  });
};

export const getFirstPromptResponse = (
  response: CreateCompletionResponse,
  defaultResponse: string
): string => response.choices.pop()?.text || defaultResponse;
