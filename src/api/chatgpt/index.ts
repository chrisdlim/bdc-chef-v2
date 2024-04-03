import {
  ChatCompletionRequestMessage,
  Configuration,
  CreateChatCompletionResponse,
  CreateCompletionResponse,
  OpenAIApi,
} from "openai";
import { getConfig } from "../../config";

type ChatOptions = {
  model?: string;
  role?: ChatCompletionRequestMessage["role"];
  temperature?: number;
  maxTokens?: number;
  choiceSize?: number;
};

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
  const {
    model = "gpt-3.5-turbo",
    role = "system",
    temperature = .8,
    maxTokens = 1000,
    choiceSize = 1,
  } = options;
  return api
    .createChatCompletion({
      messages: [{ role, content: prompt }],
      model,
      temperature,
      max_tokens: maxTokens,
      top_p: choiceSize,
    })
    .then(({ data }) => {
      console.log("Received ChatGpt response...");
      data.choices.forEach((choice) => {
        console.log("Choice: ", JSON.stringify(choice));
      });
      return data;
    });
};

export const getFirstPromptResponse = (
  data: CreateChatCompletionResponse,
  defaultResponse: string
): string => data.choices.pop()?.message?.content || defaultResponse;

export const askChatGpt = async (openai: OpenAIApi, message: string) => {
  const defaultResponse = `Oops, I'm not sure how to reply, but go f yourself, shitter. Back in the kitchen please!`;
  const reply = await getPromptAnswer(openai, message)
    .then((data) => getFirstPromptResponse(data, defaultResponse))
    .catch((error) => {
      console.log("Error from OpenAI", error);
      // Error in case of rate limit or weird openai error response
      return defaultResponse;
    });

  return reply;
};
