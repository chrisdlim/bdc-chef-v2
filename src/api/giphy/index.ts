import axios from "axios";
import { Gif } from "./types";
import { URL } from "url";
import { getConfig } from "../../config";

const config = getConfig();
const giphyBaseUrl = "https://api.giphy.com/v1/gifs/";
const giphySearchUrl = new URL("search", giphyBaseUrl);

export const getGiphyBySearch = (term: string): Promise<Gif[]> => {
  return axios
    .get(giphySearchUrl.toString(), {
      params: {
        lang: "en",
        q: term,
        api_key: config.giphyApiKey,
      },
    })
    .then(({ data }) => data.data);
};
