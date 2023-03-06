export const getQueueTitle = (size: number, currentQueueSize: number) => {
  if (size === currentQueueSize) {
    return `OOOOORDER UP, WE GOT ALL ${size} CHEFS`;
  }
  return `Lookin' for ${size - currentQueueSize} gamer(s)`;
}

export const getQueueSizeFromString = (value: string): number => +value.replace(/[^0-9]/g, "");