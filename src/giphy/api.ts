import axios from "axios";
import { Gif } from "./types";
import { URL } from "url";

const apiToken = process.env.GIPHY_TOKEN;
const giphyBaseUrl = "https://api.giphy.com/v1/gifs/";
const giphySearchUrl = new URL("search", giphyBaseUrl);

if (!apiToken) {
  throw new Error("Giphy token required!");
}

export const getGiphyBySearch = (term: string): Promise<Gif[]> => {
  return axios
    .get(giphySearchUrl.toString(), {
      params: {
        lang: "en",
        q: term,
        api_key: apiToken,
      },
    })
    .then(({ data }) => data.data);
};
