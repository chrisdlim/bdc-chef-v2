import { Configuration, CreateCompletionResponse, OpenAIApi } from "openai";
import { getConfig } from "../../config";

type ChatOptions = {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  choiceSize?: number;
};

const defaultModel = "text-davinci-003";
const defaultTemperature = 0.5;
const defaultMaxTokens = 1000;
const defaultChoiceSize = 1;

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
  const { model, temperature, maxTokens, choiceSize } = options;
  return api
    .createCompletion({
      model: model || defaultModel,
      prompt,
      temperature: temperature || defaultTemperature,
      max_tokens: maxTokens || defaultMaxTokens,
      n: choiceSize || defaultChoiceSize,
    })
    .then((response) => {
      console.log("Received ChatGpt response...");
      response.data.choices.forEach((choice) => {
        console.log("Choice: ", JSON.stringify(choice));
      });
      return response;
    });
};

export const getFirstPromptResponse = (
  response: CreateCompletionResponse,
  defaultResponse: string
): string => response.choices.pop()?.text || defaultResponse;
