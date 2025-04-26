import { Constants } from './ant-constants.js';

class ColonyGrid {
    constructor(config = {}) {
        this.width = config.width || 800;
        this.height = config.height || 600;
        this.pixelScale = config.pixelScale || Constants.Colony.MapPixelScale;
        this.pheromoneScale = config.pheromoneScale || Constants.Colony.MapPheromoneScale;
        
                this.mainObjects = Array(Math.ceil(this.width / this.pixelScale))
            .fill()
            .map(() => Array(Math.ceil(this.height / this.pixelScale))
                .fill()
                .map(() => this.createMainObject()));
        
                this.pheromones = Array(Math.ceil(this.width / this.pheromoneScale))
            .fill()
            .map(() => Array(Math.ceil(this.height / this.pheromoneScale))
                .fill()
                .map(() => this.createPheromone()));
        
                this.addBoundaryWalls();
    }
    
    createMainObject() {
        return {
            notEmpty: false,
            x: 0, 
            y: 0,
            food: 0,
            wall: false
        };
    }
    
    createPheromone() {
        return {
            notEmpty: false,
            x: 0,
            y: 0,
            toHomePheromones: 0,
            toFoodPheromones: 0
        };
    }
    
    initialize() {
                for (let i = 0; i < this.mainObjects.length; i++) {
            for (let j = 0; j < this.mainObjects[i].length; j++) {
                this.mainObjects[i][j].x = i * this.pixelScale;
                this.mainObjects[i][j].y = j * this.pixelScale;
            }
        }
        
        for (let i = 0; i < this.pheromones.length; i++) {
            for (let j = 0; j < this.pheromones[i].length; j++) {
                this.pheromones[i][j].x = i * this.pheromoneScale;
                this.pheromones[i][j].y = j * this.pheromoneScale;
            }
        }
    }
    
    addBoundaryWalls() {
                for (let i = 0; i < this.mainObjects.length; i++) {
            this.mainObjects[i][0].notEmpty = true;
            this.mainObjects[i][0].wall = true;
            
            this.mainObjects[i][this.mainObjects[i].length - 1].notEmpty = true;
            this.mainObjects[i][this.mainObjects[i].length - 1].wall = true;
        }
        
                for (let j = 0; j < this.mainObjects[0].length; j++) {
            this.mainObjects[0][j].notEmpty = true;
            this.mainObjects[0][j].wall = true;
            
            this.mainObjects[this.mainObjects.length - 1][j].notEmpty = true;
            this.mainObjects[this.mainObjects.length - 1][j].wall = true;
        }
    }
    
    reset() {
                for (let i = 0; i < this.mainObjects.length; i++) {
            for (let j = 0; j < this.mainObjects[i].length; j++) {
                this.mainObjects[i][j] = {
                    notEmpty: false,
                    wall: false,
                    food: 0,
                    type: null,
                    x: i * this.pixelScale,
                    y: j * this.pixelScale
                };
            }
        }
        
                for (let i = 0; i < this.pheromones.length; i++) {
            for (let j = 0; j < this.pheromones[i].length; j++) {
                this.pheromones[i][j] = {
                    notEmpty: false,
                    toHomePheromones: 0,
                    toFoodPheromones: 0,
                    x: i * this.pheromoneScale + this.pheromoneScale / 2,
                    y: j * this.pheromoneScale + this.pheromoneScale / 2
                };
            }
        }
    }
    
    addFood(x, y, radius, amount) {
        const centerI = Math.floor(x / this.pixelScale);
        const centerJ = Math.floor(y / this.pixelScale);
        const radiusInCells = Math.floor(radius / this.pixelScale);
        
        for (let i = Math.max(1, centerI - radiusInCells); i < Math.min(this.mainObjects.length - 1, centerI + radiusInCells); i++) {
            for (let j = Math.max(1, centerJ - radiusInCells); j < Math.min(this.mainObjects[i].length - 1, centerJ + radiusInCells); j++) {
                if (!this.mainObjects[i][j].wall) {
                    this.mainObjects[i][j].food = Math.min(255, this.mainObjects[i][j].food + amount);
                    this.mainObjects[i][j].notEmpty = true;
                }
            }
        }
    }
    
    addWall(x, y, radius) {
        const centerI = Math.floor(x / this.pixelScale);
        const centerJ = Math.floor(y / this.pixelScale);
        const radiusInCells = Math.floor(radius / this.pixelScale);
        
        for (let i = Math.max(1, centerI - radiusInCells); i < Math.min(this.mainObjects.length - 1, centerI + radiusInCells); i++) {
            for (let j = Math.max(1, centerJ - radiusInCells); j < Math.min(this.mainObjects[i].length - 1, centerJ + radiusInCells); j++) {
                this.mainObjects[i][j].wall = true;
                this.mainObjects[i][j].food = 0;
                this.mainObjects[i][j].notEmpty = true;
            }
        }
    }
    
    eraseAt(x, y, radius) {
        const centerI = Math.floor(x / this.pixelScale);
        const centerJ = Math.floor(y / this.pixelScale);
        const radiusInCells = Math.floor(radius / this.pixelScale);
        
        for (let i = Math.max(1, centerI - radiusInCells); i < Math.min(this.mainObjects.length - 1, centerI + radiusInCells); i++) {
            for (let j = Math.max(1, centerJ - radiusInCells); j < Math.min(this.mainObjects[i].length - 1, centerJ + radiusInCells); j++) {
                                this.mainObjects[i][j] = {
                    notEmpty: false,
                    wall: false,
                    food: 0,
                    type: null,
                    x: i * this.pixelScale,
                    y: j * this.pixelScale
                };
            }
        }
    }
    
    updatePheromones() {
        for (let i = 0; i < this.pheromones.length; i++) {
            for (let j = 0; j < this.pheromones[i].length; j++) {
                if (this.pheromones[i][j].notEmpty) {
                                        this.pheromones[i][j].toHomePheromones *= Constants.Colony.PheromonesDecreasingCoefficient;
                    this.pheromones[i][j].toFoodPheromones *= Constants.Colony.PheromonesDecreasingCoefficient;
                    
                                        if (this.pheromones[i][j].toHomePheromones < Constants.Colony.MinPheromoneValue) {
                        this.pheromones[i][j].toHomePheromones = 0;
                    }
                    
                    if (this.pheromones[i][j].toFoodPheromones < Constants.Colony.MinPheromoneValue) {
                        this.pheromones[i][j].toFoodPheromones = 0;
                    }
                    
                                        if (this.pheromones[i][j].toFoodPheromones === 0 && this.pheromones[i][j].toHomePheromones === 0) {
                        this.pheromones[i][j].notEmpty = false;
                    }
                }
            }
        }
    }
    
        resize(width, height) {
        const oldWidth = this.width;
        const oldHeight = this.height;
        
        this.width = width;
        this.height = height;
        
                if (width > oldWidth || height > oldHeight) {
            const newMainObjects = Array(Math.ceil(width / this.pixelScale))
                .fill()
                .map(() => Array(Math.ceil(height / this.pixelScale))
                    .fill()
                    .map(() => this.createMainObject()));
                    
            const newPheromones = Array(Math.ceil(width / this.pheromoneScale))
                .fill()
                .map(() => Array(Math.ceil(height / this.pheromoneScale))
                    .fill()
                    .map(() => this.createPheromone()));
            
                        for (let i = 0; i < this.mainObjects.length; i++) {
                for (let j = 0; j < this.mainObjects[i].length; j++) {
                    if (i < newMainObjects.length && j < newMainObjects[i].length) {
                        newMainObjects[i][j] = this.mainObjects[i][j];
                    }
                }
            }
            
            for (let i = 0; i < this.pheromones.length; i++) {
                for (let j = 0; j < this.pheromones[i].length; j++) {
                    if (i < newPheromones.length && j < newPheromones[i].length) {
                        newPheromones[i][j] = this.pheromones[i][j];
                    }
                }
            }
            
            this.mainObjects = newMainObjects;
            this.pheromones = newPheromones;
            
                        this.initialize();
            this.addBoundaryWalls();
        }
    }
    
        setResolution(pixelScale, pheromoneScale) {
        if (pixelScale === this.pixelScale && pheromoneScale === this.pheromoneScale) {
            return;
        }
        
        this.pixelScale = pixelScale;
        this.pheromoneScale = pheromoneScale;
        
                const newMainObjects = Array(Math.ceil(this.width / pixelScale))
            .fill()
            .map(() => Array(Math.ceil(this.height / pixelScale))
                .fill()
                .map(() => this.createMainObject()));
                
        const newPheromones = Array(Math.ceil(this.width / pheromoneScale))
            .fill()
            .map(() => Array(Math.ceil(this.height / pheromoneScale))
                .fill()
                .map(() => this.createPheromone()));
        
                for (let i = 0; i < newMainObjects.length; i++) {
            for (let j = 0; j < newMainObjects[i].length; j++) {
                newMainObjects[i][j].x = i * pixelScale;
                newMainObjects[i][j].y = j * pixelScale;
            }
        }
        
        for (let i = 0; i < newPheromones.length; i++) {
            for (let j = 0; j < newPheromones[i].length; j++) {
                newPheromones[i][j].x = i * pheromoneScale;
                newPheromones[i][j].y = j * pheromoneScale;
            }
        }
        
        this.mainObjects = newMainObjects;
        this.pheromones = newPheromones;
        
        this.addBoundaryWalls();
    }
}

export default ColonyGrid; 