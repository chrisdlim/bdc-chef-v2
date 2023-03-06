export const bold = (text: string) => `**${text}**`;
export const italicize = (text: string) => `*${text}*`;
export const numberedList = (values: string[]) =>
  values.map((value, index) => `${index + 1}. ${value}`).join("\n");

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
export const denumberList = (numberedListAsStr: string) => {
  const values = numberedListAsStr.split("\n");
  return values.map((valueWithNumber: string) => valueWithNumber.split(" ")[1]);
};
export const bulletedList = (values: string[]) =>
  values.map((value) => `- ${value}`).join("\n");

export const getRoleMention = (id: string) => `<@&${id}>`;
