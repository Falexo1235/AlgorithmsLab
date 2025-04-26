import { Constants } from './ant-constants.js';

class ColonyRenderer {
    constructor(config = {}) {
                this.canvas = config.canvas;
        this.ctx = this.canvas.getContext('2d');
        
                this.mainObjectsCanvas = config.mainObjectsCanvas;
        this.mainObjectsCtx = this.mainObjectsCanvas.getContext('2d');
        
        this.pheromonesCanvas = config.pheromonesCanvas;
        this.pheromonesCtx = this.pheromonesCanvas.getContext('2d');
        
                this.pheromonesDrawingMode = config.pheromonesDrawingMode || 1;
        this.antsColor = config.antsColor || '#ff0000';
        this.antsRadius = config.antsRadius || Constants.Colony.AntsRadius;
        this.pheromonesRadius = config.pheromonesRadius || Constants.Colony.PheromonesRadius;
        this.minPheromoneValueForDrawing = config.minPheromoneValueForDrawing || Constants.Colony.MinPheromoneValueForDrawing;
        
                this.somethingChanged = true;
    }
    
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.mainObjectsCtx.clearRect(0, 0, this.mainObjectsCanvas.width, this.mainObjectsCanvas.height);
        this.pheromonesCtx.clearRect(0, 0, this.pheromonesCanvas.width, this.pheromonesCanvas.height);
    }
    
    renderMainObjects(grid) {
        if (!this.somethingChanged) {
            return;
        }
        
        this.mainObjectsCtx.clearRect(0, 0, this.mainObjectsCanvas.width, this.mainObjectsCanvas.height);
        
        for (let i = 0; i < grid.mainObjects.length; i++) {
            for (let j = 0; j < grid.mainObjects[i].length; j++) {
                const obj = grid.mainObjects[i][j];
                
                if (obj.notEmpty) {
                    if (obj.wall) {
                                                this.mainObjectsCtx.fillStyle = "#884535";
                        this.mainObjectsCtx.fillRect(
                            obj.x, 
                            obj.y, 
                            grid.pixelScale, 
                            grid.pixelScale
                        );
                    } else if (obj.food > 0 || obj.type === 'large_food') {
                                                if (obj.type === 'large_food') {
                            continue;
                        }
                        
                                                let colorHex;
                        if (obj.food < 16) {
                            colorHex = `#000${(obj.food).toString(16)}00`;
                        } else {
                            colorHex = `#00${(obj.food).toString(16)}00`;
                        }
                        
                        this.mainObjectsCtx.strokeStyle = colorHex;
                        this.mainObjectsCtx.fillStyle = colorHex;
                        this.mainObjectsCtx.beginPath();
                        this.mainObjectsCtx.arc(
                            obj.x + grid.pixelScale / 2, 
                            obj.y + grid.pixelScale / 2, 
                            grid.pixelScale / 2, 
                            0, 
                            Math.PI * 2, 
                            false
                        );
                        this.mainObjectsCtx.closePath();
                        this.mainObjectsCtx.fill();
                        this.mainObjectsCtx.stroke();
                    }
                }
            }
        }
        
        this.somethingChanged = false;
    }
    
    renderPheromones(grid) {
        this.pheromonesCtx.clearRect(0, 0, this.pheromonesCanvas.width, this.pheromonesCanvas.height);
        
                if (this.pheromonesDrawingMode === 0) {
            return;
        }
        
        for (let i = 0; i < grid.pheromones.length; i++) {
            for (let j = 0; j < grid.pheromones[i].length; j++) {
                const pheromone = grid.pheromones[i][j];
                
                if (pheromone.notEmpty) {
                    const totalPheromones = pheromone.toHomePheromones + pheromone.toFoodPheromones;
                    
                                        if (totalPheromones < this.minPheromoneValueForDrawing) {
                        continue;
                    }
                    
                                        if (this.pheromonesDrawingMode === 1) {
                                                if (pheromone.toHomePheromones && pheromone.toFoodPheromones) {
                            this.pheromonesCtx.fillStyle = "#ccee00";                         } else if (pheromone.toHomePheromones) {
                            this.pheromonesCtx.fillStyle = "orange";                         } else {
                            this.pheromonesCtx.fillStyle = "green";                         }
                    } else if (this.pheromonesDrawingMode === 2) {
                                                let toHomeColor, toFoodColor;
                        
                                                toHomeColor = Math.min(Math.floor(pheromone.toHomePheromones), 255);
                        toFoodColor = Math.min(Math.floor(pheromone.toFoodPheromones), 255);
                        
                                                toHomeColor = toHomeColor < 16 ? `0${toHomeColor.toString(16)}` : toHomeColor.toString(16);
                        toFoodColor = toFoodColor < 16 ? `0${toFoodColor.toString(16)}` : toFoodColor.toString(16);
                        
                                                this.pheromonesCtx.fillStyle = `#${toHomeColor}${toFoodColor}00`;
                    } else {
                        continue;
                    }
                    
                                        this.pheromonesCtx.beginPath();
                    this.pheromonesCtx.strokeStyle = "black";
                    this.pheromonesCtx.arc(
                        pheromone.x, 
                        pheromone.y, 
                        this.pheromonesRadius, 
                        0, 
                        Math.PI * 2, 
                        false
                    );
                    this.pheromonesCtx.closePath();
                    this.pheromonesCtx.fill();
                    this.pheromonesCtx.stroke();
                }
            }
        }
    }
    
    renderAnthill(anthill) {
        if (!anthill.isBuilt) {
            return;
        }
        
        this.mainObjectsCtx.beginPath();
        this.mainObjectsCtx.fillStyle = anthill.color;
        this.mainObjectsCtx.strokeStyle = anthill.borderColor;
        this.mainObjectsCtx.arc(
            anthill.x, 
            anthill.y, 
            anthill.radius, 
            0, 
            Math.PI * 2, 
            false
        );
        this.mainObjectsCtx.closePath();
        this.mainObjectsCtx.fill();
        this.mainObjectsCtx.stroke();
    }
    
    renderAnts(anthill) {
        if (!anthill.isBuilt) {
            return;
        }
        
        for (const ant of anthill.ants) {
            this.ctx.beginPath();
            this.ctx.fillStyle = this.antsColor;
            this.ctx.strokeStyle = "black";
            this.ctx.arc(
                ant.x, 
                ant.y, 
                this.antsRadius, 
                0, 
                Math.PI * 2, 
                false
            );
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
        }
    }
    
    renderLargeFoodSource(foodSource) {
        this.mainObjectsCtx.beginPath();
        
                        const nutritionRatio = Math.min(1, foodSource.nutrition / 50);
        const green = Math.floor(85 + (nutritionRatio * 170));
        const colorHex = `#00${green.toString(16).padStart(2, '0')}00`;
        
        this.mainObjectsCtx.fillStyle = colorHex;
        this.mainObjectsCtx.strokeStyle = 'black';
        this.mainObjectsCtx.arc(
            foodSource.x, 
            foodSource.y, 
            foodSource.radius, 
            0, 
            Math.PI * 2, 
            false
        );
        this.mainObjectsCtx.closePath();
        this.mainObjectsCtx.fill();
        this.mainObjectsCtx.stroke();
        
                this.mainObjectsCtx.fillStyle = 'white';
        this.mainObjectsCtx.font = '16px Arial';
        this.mainObjectsCtx.textAlign = 'center';
        this.mainObjectsCtx.textBaseline = 'middle';
        this.mainObjectsCtx.fillText(
            foodSource.nutrition.toString(), 
            foodSource.x, 
            foodSource.y
        );
    }
    
    render(grid, anthill, foodSources) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
                this.renderMainObjects(grid);
        this.renderAnthill(anthill);
        
                if (Array.isArray(foodSources)) {
            for (const foodSource of foodSources) {
                this.renderLargeFoodSource(foodSource);
            }
        }
        
        this.renderPheromones(grid);
        
                this.ctx.drawImage(this.pheromonesCanvas, 0, 0);
        this.ctx.drawImage(this.mainObjectsCanvas, 0, 0);
        
                this.renderAnts(anthill);
    }
    
    setPheromonesDrawingMode(mode) {
        this.pheromonesDrawingMode = mode;
    }
    
    setAntsColor(color) {
        this.antsColor = color;
    }
    
    setAntsRadius(radius) {
        this.antsRadius = radius;
    }
    
    markChanged() {
        this.somethingChanged = true;
    }
}

export default ColonyRenderer; 