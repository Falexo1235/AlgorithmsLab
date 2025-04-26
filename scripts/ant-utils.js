
export function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

export function calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

export function getRandomDirection() {
    const r1 = Math.random() * 2 - 1;
    const r2 = Math.random() * 2 - 1;
    return { x: r1, y: r2 };
}

export function normalizeVector(vx, vy) {
    const length = Math.sqrt(vx * vx + vy * vy);
    return {
        x: vx / length,
        y: vy / length
    };
} 