export const RANKING = {
  rickey: 90, // Rickey
  chad: 88,
  lazerspewpew7: 86,
  "21": 74,
  Kev: 68, // Kev
  Yi: 66, // Yi
  "G-Sing": 64, // Jeb
  halfnhalf: 62, // Zach
  ironman: 60, // Alan
  timtim: 54, // Tim
  eric: 54, // Eric
  Josh: 50, // Josh
  "Stephen Kim": 44, // Stephen
  crazykrnkid: 36, // Dennis
  Mashiro: 32, // Ben
};

const rankMap = new Map<string, number>(Object.entries(RANKING));

export const getRank = (user: string) => {
  return rankMap.get(user) || 0;
};

export const ELO_DIFFERENTIAL = 7;
