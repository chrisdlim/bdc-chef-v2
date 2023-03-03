import { RANKING, getRank, ELO_DIFFERENTIAL } from "../constants/ranking";

export const inhouseMatchmaking = (participants: string[]) => {
  let t1_lvl = 0,
    t2_lvl = 0;

  do {
    participants = shuffleArray(participants);
    t1_lvl = getTotalLvl(participants.slice(0, 6)) / 5;
    t2_lvl = getTotalLvl(participants.slice(5)) / 5;
  } while (Math.abs(t1_lvl - t2_lvl) > ELO_DIFFERENTIAL);

  return participants;
};

const getTotalLvl = (participants: string[]): number => {
  let level = 0;
  participants.forEach((i) => (level += getRank(i)));
  return level;
};

// For testing
export const generateRandomParticipants = (members: number) => {
  return shuffleArray(Object.keys(RANKING)).slice(0, members);
};

const shuffleArray = <T>(items: T[]) => {
  for (var i = items.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = items[i];
    items[i] = items[j];
    items[j] = temp;
  }
  return items;
};
