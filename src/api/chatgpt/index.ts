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

export const askChatGpt = async (openai: OpenAIApi, message: string) => {
  const defaultResponse = `Oops, I'm not sure how to reply, but go f yourself, shitter. Back in the kitchen please!`;
  const reply = await getPromptAnswer(openai, message)
    .then(({ data }) => getFirstPromptResponse(data, defaultResponse))
    .catch(() => {
      // Error in case of rate limit or weird openai error response
      return defaultResponse;
    });

  return reply;
};
