export const getRandomNumberWithMaxVal = (maxValue: number) => {
    return Math.floor(Math.random() * maxValue) + 1;
}

export const getRandomNumber = () => {
    return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
}