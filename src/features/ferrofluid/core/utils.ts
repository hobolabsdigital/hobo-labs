export const mapRange = (value: number, min1: number, max1: number, min2: number, max2: number) => {
    return min2 + (max2 - min2) * (value - min1) / (max1 - min1);
}

export const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

export const easeInOutExpo = (x: number) => {
    return x === 0
    ? 0
    : x === 1
    ? 1
    : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2
    : (2 - Math.pow(2, -20 * x + 10)) / 2;
}

export const easeInOutCubic = (x: number) => {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export const easeInExpo = (x: number) => {
    return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
}

export const easeOutQuint = (x: number) => {
    return 1 - Math.pow(1 - x, 5);
}