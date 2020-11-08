/**
 * Get a random number between min and max such that min <= n < max.
 * @param min The lower bound (inclusive).
 * @param max The upper bound (exclusive).
 */
export type RandomRangeFunction = (min: number, max: number) => number;


export function setRandomRangeFunction(func: RandomRangeFunction): void {
    getRandomIntBetweenImp = func;
}

let defaultRandomRange: RandomRangeFunction = function(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

let getRandomIntBetweenImp: RandomRangeFunction = defaultRandomRange;

export let getRandomIntBetween: RandomRangeFunction = (min: number, max: number): number => { 
    return getRandomIntBetweenImp(min, max);
}
