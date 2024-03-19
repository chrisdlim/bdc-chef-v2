import { decryptValue, encryptValue } from "./anonymize";

type ListOptions = {
  anonymize?: boolean;
  time?: number;
};

const getListValue = (value: string, { anonymize, time }: ListOptions = {}) => {
  if (anonymize && !!time) {
    return encryptValue(value, time);
  }
  return value;
};

const getValue = (value: string, { anonymize, time }: ListOptions = {}) => {
  if (anonymize && !!time) {
    return decryptValue(value);
  }
  return value;
};

export const numberedList = (values: string[], options: ListOptions = {}) => {
  return values
    .map((value, index) => {
      return `${index + 1}. ${getListValue(value, options)}`;
    })
    .join("\n");
};

export const anonymousList = (values: string[]) => {
  return values
    .map((_, index) => {
      return `${index + 1}. Player ${index + 1}`;
    })
    .join("\n");
};

/**
 * @description Converts a numbered list string back to a list of strings
 * i.e. input:
 * 1. value1
 * 2. value2
 * 3. value3
 *
 * output:
 * [value1, value2, value3]]
 *
 */
export const denumberList = (
  numberedListAsStr: string,
  { anonymize = false }: ListOptions = {}
) => {
  const values = numberedListAsStr.split("\n");
  return values.map((valueWithNumber: string) => {
    const value = valueWithNumber.split(" ")[1];
    return anonymize ? (decryptValue(value) as string) : value;
  });
};
export const bulletedList = (values: string[]) =>
  values.map((value) => `- ${value}`).join("\n");

export const getRoleMention = (id: string) => `<@&${id}>`;
