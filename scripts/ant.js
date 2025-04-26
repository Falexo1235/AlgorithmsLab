class Ant {
    constructor(config = {}) {
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.stepLength = config.stepLength || 1;
        this.vx = config.vx || 0;
        this.vy = config.vy || 0;
    }

    move() {
        this.x += (this.vx * this.stepLength) / Math.sqrt(this.vx ** 2 + this.vy ** 2);
        this.y += (this.vy * this.stepLength) / Math.sqrt(this.vx ** 2 + this.vy ** 2);
    }

    setDirection(x, y) {
        this.vx = x - this.x;
        this.vy = y - this.y;
    }
}

export default Ant;
