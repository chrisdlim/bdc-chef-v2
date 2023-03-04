export const bold = (text: string) => `**${text}**`;
export const italicize = (text: string) => `*${text}*`;
export const numberedList = (values: string[]) => values.map((value, index) => `${index + 1}. ${value}`).join('\n');
export const bulletedList = (values: string[]) => values.map((value) => `- ${value}`).join('\n');