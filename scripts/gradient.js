class GradientAnimator {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.context = this.canvas.getContext('2d');

        this.t = 0;
        this.baseSpeed = 0.02;
        this.speed = this.baseSpeed;
        this.monochrome = false;
    }

    col(x, y, r, g, b) {
        this.context.fillStyle = `rgb(${r},${g},${b})`;
        this.context.fillRect(x, y, 1, 1);
    }

    calculateR(x, y, t) {
        return Math.floor(192 + 64 * Math.cos((x * x - y * y) / 300 + t));
    }

    calculateG(x, y, t) {
        return Math.floor(192 + 64 * Math.sin((x * x * Math.cos(t / 4) + y * y * Math.sin(t / 3)) / 300));
    }

    calculateB(x, y, t) {
        return Math.floor(192 + 64 * Math.sin(5 * Math.sin(t / 9) + ((x - 16) * (x - 16) + (y - 16) * (y - 16)) / 1100));
    }

    setSpeed(newSpeed) {
        this.speed = newSpeed;
    }

    toggleMonochrome() {
        //this.monochrome = !this.monochrome;

        this.speed = 0.1;

        setTimeout(() => {
            this.speed = this.baseSpeed;
        }, 7000);
    }


    run() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let x = 0; x < 32; x++) {
            for (let y = 0; y < 32; y++) {
                let r = this.calculateR(x, y, this.t);
                let g = this.calculateG(x, y, this.t);
                let b = this.calculateB(x, y, this.t);

                if (this.monochrome) {
                    const avg = (r + g + b) / 3;
                    r = g = b = avg;
                }

                this.col(x, y, r, g, b);
            }
        }

        this.t += this.speed;
        window.requestAnimationFrame(this.run.bind(this));
    }

    start() {
        this.run();
    }
}

const animator = new GradientAnimator('gradient-canvas');
animator.start();
