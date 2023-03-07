const getRandomElement = <T>(list: any[]): T =>
  list[Math.floor(Math.random() * list.length)];

export default getRandomElement;
