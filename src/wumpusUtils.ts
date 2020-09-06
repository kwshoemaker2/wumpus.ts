
/**
 * Get a random number between min and max such that min <= n < max.
 * @param min The lower bound (inclusive).
 * @param max The upper bound (exclusive).
 */
export function getRandomIntBetween(min: number, max: number): number { 
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}
