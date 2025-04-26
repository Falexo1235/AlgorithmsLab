import Ant from './ant.js';
import { Constants } from './ant-constants.js';
import { getRandomDirection, normalizeVector } from './ant-utils.js';

class ColonyAnt extends Ant {
    constructor(config = {}) {
        super(config);
        
                const dir = getRandomDirection();
        this.vx = dir.x;
        this.vy = dir.y;
        
                const anthill = config.anthill;
        const norm = normalizeVector(this.vx, this.vy);
        this.x = anthill.x + (norm.x * (anthill.radius + Constants.Colony.FirstStepLength));
        this.y = anthill.y + (norm.y * (anthill.radius + Constants.Colony.FirstStepLength));
        
                this.it = 0;
        this.itStayedInObject = 0;
        this.distanceFromHome = 1;
        this.distanceFromFood = 1;
        this.chosenPheromoneI = -1;
        this.chosenPheromoneJ = -1;
        this.food = 0;
        this.stepLength = Constants.Colony.AntStepLength;
        this.disabled = false;
        this.foodX = 0;
        this.foodY = 0;
        this.timeInSameArea = 0;
        this.lastGridI = -1;
        this.lastGridJ = -1;
        this.followingPheromones = false;
    }
    
    reset(anthill) {
                const dir = getRandomDirection();
        this.vx = dir.x;
        this.vy = dir.y;
        
                const norm = normalizeVector(this.vx, this.vy);
        this.x = anthill.x + (norm.x * (anthill.radius + Constants.Colony.FirstStepLength));
        this.y = anthill.y + (norm.y * (anthill.radius + Constants.Colony.FirstStepLength));
        
                this.it = 0;
        this.itStayedInObject = 0;
        this.distanceFromHome = 1;
        this.distanceFromFood = 1;
        this.chosenPheromoneI = -1;
        this.chosenPheromoneJ = -1;
        this.food = 0;
    }
    
    update(mainObjects, pheromones, anthill) {
        this.it = (this.it + 1) % 1000000;
        
                if (this.isStuckOrOutOfBounds(anthill)) {
            this.reset(anthill);
            return;
        }
        
                const i = Math.floor(this.x / Constants.Colony.MapPixelScale);
        const j = Math.floor(this.y / Constants.Colony.MapPixelScale);
        if (i >= 0 && j >= 0 && i < mainObjects.length && j < mainObjects[0].length && 
            mainObjects[i][j].notEmpty && mainObjects[i][j].wall) {
            this.reset(anthill);
            return;
        }
        
                if (this.checkAnthillCollision(anthill)) {
            return;
        }
        
                this.handleObjectCollisions(mainObjects, pheromones);
        
                        const randomX = (Math.random() - 0.5);
        const randomY = (Math.random() - 0.5);
        
                const newX = this.x + randomX + (this.vx * this.stepLength) / Math.sqrt(this.vx ** 2 + this.vy ** 2);
        const newY = this.y + randomY + (this.vy * this.stepLength) / Math.sqrt(this.vx ** 2 + this.vy ** 2);
        
                const newI = Math.floor(newX / Constants.Colony.MapPixelScale);
        const newJ = Math.floor(newY / Constants.Colony.MapPixelScale);
        
                if (newI >= 0 && newJ >= 0 && 
            newI < mainObjects.length && newJ < mainObjects[0].length &&
            !(mainObjects[newI][newJ].notEmpty && mainObjects[newI][newJ].wall)) {
            this.x = newX;
            this.y = newY;
        } else {
                        this.vx *= -1;
            this.vy *= -1;
        }
    }
    
    isStuckOrOutOfBounds(anthill) {
        return (
            this.itStayedInObject > 10 || 
            this.x < 0 || 
            this.y < 0 || 
            this.x > window.innerWidth || 
            this.y > window.innerHeight || 
            (Math.sqrt((this.x - anthill.x) ** 2 + (this.y - anthill.y) ** 2) - anthill.radius < 0)
        );
    }
    
    checkAnthillCollision(anthill) {
        const distance = Math.sqrt((this.x - anthill.x) ** 2 + (this.y - anthill.y) ** 2);
        
        if (distance - anthill.radius <= Constants.Colony.MinDistanceToAnthill) {
                        this.vx *= -1;
            this.vy *= -1;
            
                        if (this.food) {
                this.distanceFromHome = 1;
                this.distanceFromFood = 1;
                this.chosenPheromoneI = -1;
                this.chosenPheromoneJ = -1;
            }
            
                        this.x += (Math.random() - 0.5) + (this.vx * this.stepLength * 2) / Math.sqrt(this.vx ** 2 + this.vy ** 2);
            this.y += (Math.random() - 0.5) + (this.vy * this.stepLength * 2) / Math.sqrt(this.vx ** 2 + this.vy ** 2);
            this.food = 0;
            
            return true;
        }
        
        return false;
    }
    
    handleObjectCollisions(mainObjects, pheromones) {
        const i = Math.floor(this.x / Constants.Colony.MapPixelScale);
        const j = Math.floor(this.y / Constants.Colony.MapPixelScale);
        
                if (i < 0 || j < 0 || i >= mainObjects.length || j >= mainObjects[0].length) {
            return;
        }
        
                if (this.food > 0 && this.isStuckInCorner(mainObjects, i, j)) {
            this.escapeFromCorner(mainObjects, i, j);
            return;
        }
        
        if (mainObjects[i][j].notEmpty) {
                        this.itStayedInObject++;
            
                        if (mainObjects[i][j].type === 'large_food' && this.food === 0) {
                this.collectFood(mainObjects, i, j);
                
                                                this.findReturnPath(pheromones, mainObjects);
            }
            
                        if (mainObjects[i][j].wall) {
                                if (window.anthill) {
                    this.reset(window.anthill);
                }
                return;
            }
            
                        this.deflectFromObject(mainObjects, i, j);
        } else {
            this.itStayedInObject = 0;
            
                        if (this.it % Constants.Colony.HowOftenToUpdateDirection === 0) {
                this.updateDirectionBasedOnPheromones(pheromones, mainObjects);
            }
            
                        if (this.it % Constants.Colony.HowOftenToLeavePheromones === 0) {
                this.leavePheromones(pheromones, mainObjects);
            }
        }
    }
    
    collectFood(mainObjects, i, j) {
        this.distanceFromHome = 1;
        this.distanceFromFood = 1;
        this.chosenPheromoneI = -1;
        this.chosenPheromoneJ = -1;
        
                if (mainObjects[i][j].type === 'large_food') {
                        this.food = mainObjects[i][j].nutrition || 10;
            const sourceId = mainObjects[i][j].sourceId;
            
                        if (!mainObjects[i][j].unlimited && window.colonySimulation) {
                window.colonySimulation.decreaseFoodSourceNutrition(sourceId, 1);
            }
        }
    }
    
    deflectFromObject(mainObjects, i, j) {
                const isWall = mainObjects[i][j].wall;
        
                if (isWall) {
                        this.chosenPheromoneI = -1;
            this.chosenPheromoneJ = -1;
            
                        const angle = Math.random() * Math.PI * 2;             this.vx = Math.cos(angle) * 2.5;
            this.vy = Math.sin(angle) * 2.5;
            
                        const norm = Math.sqrt(this.vx ** 2 + this.vy ** 2);
            this.x += (this.vx / norm) * this.stepLength * 3;
            this.y += (this.vy / norm) * this.stepLength * 3;
            
                        if (this.food > 0) {
                                this.distanceFromFood = this.distanceFromFood * 0.9;
            }
            
            return;
        }
        
                        
                let x = this.x + (this.vx * (-1) * this.stepLength) / Math.sqrt(this.vx ** 2 + this.vy ** 2);
        let y = this.y + (this.vy * this.stepLength) / Math.sqrt(this.vx ** 2 + this.vy ** 2);
        let newI = Math.floor(x / Constants.Colony.MapPixelScale);
        let newJ = Math.floor(y / Constants.Colony.MapPixelScale);
        
        if (newI >= 0 && newJ >= 0 && 
            newI < mainObjects.length && newJ < mainObjects[0].length && 
            !mainObjects[newI][newJ].notEmpty) {
            this.vx *= -1;
            return;
        }
        
                x = this.x + (this.vx * this.stepLength) / Math.sqrt(this.vx ** 2 + this.vy ** 2);
        y = this.y + (this.vy * (-1) * this.stepLength) / Math.sqrt(this.vx ** 2 + this.vy ** 2);
        newI = Math.floor(x / Constants.Colony.MapPixelScale);
        newJ = Math.floor(y / Constants.Colony.MapPixelScale);
        
        if (newI >= 0 && newJ >= 0 && 
            newI < mainObjects.length && newJ < mainObjects[0].length && 
            !mainObjects[newI][newJ].notEmpty) {
            this.vy *= -1;
            return;
        }
        
                this.vx *= -1;
        this.vy *= -1;
    }
    
    updateDirectionBasedOnPheromones(pheromones, mainObjects) {
        const i = Math.floor(this.x / Constants.Colony.MapPheromoneScale);
        const j = Math.floor(this.y / Constants.Colony.MapPheromoneScale);
        
                if (i < 0 || j < 0 || i >= pheromones.length || j >= pheromones[0].length) {
            return;
        }
        
                this.avoidNearbyWalls(mainObjects);
        
                let iBestPheromone = -1, jBestPheromone = -1;
        let bestPheromoneValue = 0;
        
        const searchRadius = Constants.Colony.RadiusOfAntsEyes;
        
        for (let ii = i - searchRadius; ii < i + searchRadius; ii++) {
            for (let jj = j - searchRadius; jj < j + searchRadius; jj++) {
                if (ii < 0 || jj < 0 || ii >= pheromones.length || jj >= pheromones[0].length) {
                    continue;
                }
                
                if (pheromones[ii][jj].notEmpty) {
                                        if ((Math.abs(this.vx / this.vy) > 1 && i * ii > 0) || 
                        (Math.abs(this.vy / this.vx) > 1 && j * jj > 0)) {
                        
                                                if (this.food > 0) {
                            if (pheromones[ii][jj].toHomePheromones > bestPheromoneValue) {
                                iBestPheromone = ii;
                                jBestPheromone = jj;
                                bestPheromoneValue = pheromones[ii][jj].toHomePheromones;
                            }
                        } else {
                            if (pheromones[ii][jj].toFoodPheromones > bestPheromoneValue) {
                                iBestPheromone = ii;
                                jBestPheromone = jj;
                                bestPheromoneValue = pheromones[ii][jj].toFoodPheromones;
                            }
                        }
                    }
                }
            }
        }
        
                if (iBestPheromone !== -1 && bestPheromoneValue > Constants.Colony.MinPheromoneValue * 10) {
                        if (!(Math.abs(iBestPheromone - this.chosenPheromoneI) < 5 && 
                  Math.abs(jBestPheromone - this.chosenPheromoneJ) < 5) || Math.random() < 0.2) {
                
                if (Math.random() < Constants.Colony.HowOftenToChooseGoodPath) {
                                        const targetX = (iBestPheromone + 0.5) * Constants.Colony.MapPheromoneScale;
                    const targetY = (jBestPheromone + 0.5) * Constants.Colony.MapPheromoneScale;
                    
                    if (this.isPathClear(this.x, this.y, targetX, targetY, mainObjects)) {
                        this.vx = targetX - this.x;
                        this.vy = targetY - this.y;
                        this.chosenPheromoneI = iBestPheromone;
                        this.chosenPheromoneJ = jBestPheromone;
                    }
                }
            }
        }
        
                if (this.food > 0) {
            this.updateDirectionTowardsAnthill(mainObjects);
        } else {
            this.updateDirectionTowardsFood(mainObjects);
        }
    }
    
        isPathClear(x1, y1, x2, y2, mainObjects) {
                const pixelScale = Constants.Colony.MapPixelScale;
        
                const directDistance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        
                if (directDistance < pixelScale) {
            const i2 = Math.floor(x2 / pixelScale);
            const j2 = Math.floor(y2 / pixelScale);
            
            if (i2 < 0 || j2 < 0 || i2 >= mainObjects.length || j2 >= mainObjects[0].length ||
               (mainObjects[i2][j2].notEmpty && mainObjects[i2][j2].wall)) {
                return false;
            }
            return true;
        }
        
                const stepsCount = Math.max(20, Math.ceil(directDistance / (pixelScale * 0.5)));
        
                for (let step = 1; step < stepsCount; step++) {
                        const t = step / stepsCount;
            const x = x1 + (x2 - x1) * t;
            const y = y1 + (y2 - y1) * t;
            
                        const i = Math.floor(x / pixelScale);
            const j = Math.floor(y / pixelScale);
            
                        if (i < 0 || j < 0 || i >= mainObjects.length || j >= mainObjects[0].length ||
               (mainObjects[i][j].notEmpty && mainObjects[i][j].wall)) {
                return false;
            }
            
                        if (step > 0 && step < stepsCount - 1) {
                                const checkDiagonalCorners = [
                    { di: -1, dj: 0 },                     { di: 1, dj: 0 },                      { di: 0, dj: -1 },                     { di: 0, dj: 1 }                   ];
                
                for (const corner of checkDiagonalCorners) {
                    const ni = i + corner.di;
                    const nj = j + corner.dj;
                    
                    if (ni >= 0 && nj >= 0 && ni < mainObjects.length && nj < mainObjects[0].length &&
                        mainObjects[ni][nj].notEmpty && mainObjects[ni][nj].wall) {
                        
                                                const wallCenterX = (ni + 0.5) * pixelScale;
                        const wallCenterY = (nj + 0.5) * pixelScale;
                        const distToWall = Math.sqrt((x - wallCenterX) ** 2 + (y - wallCenterY) ** 2);
                        
                                                if (distToWall < pixelScale * 0.8) {
                            return false;
                        }
                    }
                }
            }
        }
        
        return true;     }
    
        avoidNearbyWalls(mainObjects) {
        const i = Math.floor(this.x / Constants.Colony.MapPixelScale);
        const j = Math.floor(this.y / Constants.Colony.MapPixelScale);
        const radius = 2;         
        let nearbyWallFound = false;
        let avoidanceVectorX = 0;
        let avoidanceVectorY = 0;
        
                for (let di = -radius; di <= radius; di++) {
            for (let dj = -radius; dj <= radius; dj++) {
                                if (di === 0 && dj === 0) continue;
                
                const ni = i + di;
                const nj = j + dj;
                
                                if (ni < 0 || nj < 0 || ni >= mainObjects.length || nj >= mainObjects[0].length) {
                    continue;
                }
                
                if (mainObjects[ni][nj].wall) {
                                        const wallX = (ni + 0.5) * Constants.Colony.MapPixelScale;
                    const wallY = (nj + 0.5) * Constants.Colony.MapPixelScale;
                    
                    const dx = this.x - wallX;
                    const dy = this.y - wallY;
                    
                                        const distance = Math.max(1, Math.sqrt(dx * dx + dy * dy));
                    const weight = 1 / (distance * distance);
                    
                    avoidanceVectorX += dx * weight;
                    avoidanceVectorY += dy * weight;
                    nearbyWallFound = true;
                }
            }
        }
        
                if (nearbyWallFound) {
            const avoidanceMagnitude = Math.sqrt(avoidanceVectorX * avoidanceVectorX + avoidanceVectorY * avoidanceVectorY);
            
            if (avoidanceMagnitude > 0) {
                                const currentMagnitude = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                
                if (currentMagnitude > 0) {
                    this.vx = 0.7 * this.vx + 0.3 * (avoidanceVectorX / avoidanceMagnitude) * currentMagnitude;
                    this.vy = 0.7 * this.vy + 0.3 * (avoidanceVectorY / avoidanceMagnitude) * currentMagnitude;
                }
            }
        }
    }
    
    updateDirectionTowardsAnthill(mainObjects) {
                const anthill = { x: window.anthill.x, y: window.anthill.y, radius: window.anthill.radius };
        const distance = Math.sqrt((this.x - anthill.x) ** 2 + (this.y - anthill.y) ** 2);
        
                if (distance - anthill.radius < Constants.Colony.MapPixelScale * 3) {
            if (this.isPathClear(this.x, this.y, anthill.x, anthill.y, mainObjects)) {
                this.vx = anthill.x - this.x;
                this.vy = anthill.y - this.y;
                const norm = Math.sqrt(this.vx ** 2 + this.vy ** 2);
                if (norm > 0) {
                    this.vx = (this.vx / norm) * 2;
                    this.vy = (this.vy / norm) * 2;
                }
                return;
            }
        }
        
                if (distance - anthill.radius < Constants.Colony.RadiusOfAntsEyes * Constants.Colony.MapPixelScale) {
                        const pathsToCheck = 12;             let bestPaths = [];
            
            for (let i = 0; i < pathsToCheck; i++) {
                const angle = (Math.PI * 2 * i) / pathsToCheck;
                
                                const targetX = anthill.x + Math.cos(angle) * anthill.radius;
                const targetY = anthill.y + Math.sin(angle) * anthill.radius;
                
                                if (this.isPathClear(this.x, this.y, targetX, targetY, mainObjects)) {
                    const pathDistance = Math.sqrt((this.x - targetX) ** 2 + (this.y - targetY) ** 2);
                    
                                        let openSpaceValue = this.evaluatePathOpenness(this.x, this.y, targetX, targetY, mainObjects);
                    
                    bestPaths.push({
                        x: targetX,
                        y: targetY,
                        distance: pathDistance,
                        openSpace: openSpaceValue
                    });
                }
            }
            
                        if (bestPaths.length > 0 && Math.random() < Constants.Colony.HowOftenToChooseGoodPath) {
                                bestPaths.sort((a, b) => {
                                        const scoreA = a.openSpace * 2 - a.distance / Constants.Colony.MapPixelScale;
                    const scoreB = b.openSpace * 2 - b.distance / Constants.Colony.MapPixelScale;
                    return scoreB - scoreA;
                });
                
                                const pathIndex = Math.floor(Math.random() * Math.min(3, bestPaths.length));
                const chosenPath = bestPaths[pathIndex];
                
                this.vx = chosenPath.x - this.x;
                this.vy = chosenPath.y - this.y;
                
                                const norm = Math.sqrt(this.vx ** 2 + this.vy ** 2);
                if (norm > 0) {
                                        const speedFactor = Math.min(1.5, chosenPath.distance / (Constants.Colony.MapPixelScale * 2));
                    this.vx = (this.vx / norm) * (1 + speedFactor);
                    this.vy = (this.vy / norm) * (1 + speedFactor);
                }
            }
        }
    }
    
        evaluatePathOpenness(x1, y1, x2, y2, mainObjects) {
        const pixelScale = Constants.Colony.MapPixelScale;
        const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const steps = Math.ceil(distance / pixelScale);
        
        let totalOpenness = 0;
        const checkPoints = Math.min(10, steps);
        
                for (let step = 1; step <= checkPoints; step++) {
            const t = step / checkPoints;
            const x = x1 + (x2 - x1) * t;
            const y = y1 + (y2 - y1) * t;
            
            const i = Math.floor(x / pixelScale);
            const j = Math.floor(y / pixelScale);
            
                        let localOpenness = 0;
            for (let di = -1; di <= 1; di++) {
                for (let dj = -1; dj <= 1; dj++) {
                    const ni = i + di;
                    const nj = j + dj;
                    
                    if (ni >= 0 && nj >= 0 && ni < mainObjects.length && nj < mainObjects[0].length &&
                        !(mainObjects[ni][nj].notEmpty && mainObjects[ni][nj].wall)) {
                        localOpenness++;
                    }
                }
            }
            
                        totalOpenness += localOpenness * (0.5 + 0.5 * t);
        }
        
                return totalOpenness / checkPoints;
    }
    
    updateDirectionTowardsFood(mainObjects) {
                const i = Math.floor(this.x / Constants.Colony.MapPixelScale);
        const j = Math.floor(this.y / Constants.Colony.MapPixelScale);
        
        let iBestFood = -1, jBestFood = -1;
        let bestFoodValue = 0;
        let bestDistance = Number.MAX_VALUE;
        
                let visibleFoodCells = [];
        
                if (window.foodSources && window.foodSources.length > 0) {
            for (const foodSource of window.foodSources) {
                const distance = Math.sqrt((this.x - foodSource.x) ** 2 + (this.y - foodSource.y) ** 2);
                
                                if (distance <= Constants.Colony.RadiusOfAntsEyes * Constants.Colony.MapPixelScale) {
                    if (this.isPathClear(this.x, this.y, foodSource.x, foodSource.y, mainObjects)) {
                                                visibleFoodCells.push({
                            i: -1,                             j: -1,
                            food: foodSource.nutrition * 2,                             distance: distance,
                            isFoodSource: true,
                            x: foodSource.x,
                            y: foodSource.y,
                            sourceId: foodSource.id
                        });
                    }
                }
            }
        }
        
                for (let ii = Math.max(0, i - Constants.Colony.RadiusOfAntsEyes); ii < Math.min(mainObjects.length, i + Constants.Colony.RadiusOfAntsEyes); ii++) {
            for (let jj = Math.max(0, j - Constants.Colony.RadiusOfAntsEyes); jj < Math.min(mainObjects[0].length, j + Constants.Colony.RadiusOfAntsEyes); jj++) {
                                if (ii < 0 || jj < 0 || ii >= mainObjects.length || jj >= mainObjects[0].length || 
                    mainObjects[ii][jj].type !== 'large_food') {
                    continue;
                }
                
                                const foodX = (ii + 0.5) * Constants.Colony.MapPixelScale;
                const foodY = (jj + 0.5) * Constants.Colony.MapPixelScale;
                
                if (this.isPathClear(this.x, this.y, foodX, foodY, mainObjects)) {
                    const distance = Math.sqrt((this.x - foodX) ** 2 + (this.y - foodY) ** 2);
                    
                                        const foodValue = mainObjects[ii][jj].nutrition;
                    
                    visibleFoodCells.push({
                        i: ii,
                        j: jj,
                        food: foodValue,
                        distance: distance,
                        isFoodSource: false,
                        x: foodX,
                        y: foodY,
                        sourceId: mainObjects[ii][jj].sourceId
                    });
                }
            }
        }
        
                if (visibleFoodCells.length === 0) {
            return;
        }
        
                for (const cell of visibleFoodCells) {
                                    const score = cell.food * 10 - cell.distance;
            
            if (iBestFood === -1 || score > bestFoodValue) {
                iBestFood = cell.i;
                jBestFood = cell.j;
                bestFoodValue = score;
                bestDistance = cell.distance;
                
                                if (cell.isFoodSource || cell.i === -1) {
                    this.foodSourceX = cell.x;
                    this.foodSourceY = cell.y;
                }
            }
        }
        
        if (iBestFood !== -1) {
            if (Math.random() < Constants.Colony.HowOftenToChooseGoodPath) {
                                if (iBestFood === -1 && jBestFood === -1) {
                    this.vx = this.foodSourceX - this.x;
                    this.vy = this.foodSourceY - this.y;
                } else {
                    this.vx = (iBestFood + 0.5) * Constants.Colony.MapPixelScale - this.x;
                    this.vy = (jBestFood + 0.5) * Constants.Colony.MapPixelScale - this.y;
                }
                
                                const norm = Math.sqrt(this.vx ** 2 + this.vy ** 2);
                if (norm > 0) {
                                        const speedFactor = Math.min(1.0, bestDistance / (Constants.Colony.MapPixelScale * 3));
                    this.vx = (this.vx / norm) * (1 + speedFactor);
                    this.vy = (this.vy / norm) * (1 + speedFactor);
                }
            }
        }
    }
    
    leavePheromones(pheromones, mainObjects) {
        const i = Math.floor(this.x / Constants.Colony.MapPheromoneScale);
        const j = Math.floor(this.y / Constants.Colony.MapPheromoneScale);
        
                if (i < 0 || j < 0 || i >= pheromones.length || j >= pheromones[0].length) {
            return;
        }
        
                const mainObjI = Math.floor(this.x / Constants.Colony.MapPixelScale);
        const mainObjJ = Math.floor(this.y / Constants.Colony.MapPixelScale);
        
        if (mainObjI < 0 || mainObjJ < 0 || 
            mainObjI >= mainObjects.length || mainObjJ >= mainObjects[0].length || 
            mainObjects[mainObjI][mainObjJ].notEmpty) {
            return;
        }
        
                if (this.food > 0 && this.distanceFromFood > 0.000001) {
                        const baseValue = 1.5 * (this.food ** 2) * this.distanceFromFood;
            
            pheromones[i][j].toFoodPheromones = Math.min(
                100000, 
                pheromones[i][j].toFoodPheromones * 0.7 + baseValue * Constants.Colony.PheromoneImportanceFactor
            );
            
                        this.distanceFromFood *= 0.95;
        } else if (!this.food && this.distanceFromHome > 0.000001) {
                        pheromones[i][j].toHomePheromones = Math.min(
                100000, 
                pheromones[i][j].toHomePheromones * 0.7 + 1.5 * Constants.Colony.ConstForDistanceFromHome * this.distanceFromHome
            );
            
                        this.distanceFromHome *= 0.95;
        }
        
                pheromones[i][j].notEmpty = true;
        
                this.reinforceAdjacentPheromones(pheromones, i, j, mainObjects);
    }
    
        reinforceAdjacentPheromones(pheromones, i, j, mainObjects) {
        for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
                                if ((di === 0 && dj === 0) || (Math.abs(di) === 1 && Math.abs(dj) === 1)) {
                    continue;
                }
                
                const ni = i + di;
                const nj = j + dj;
                
                                if (ni < 0 || nj < 0 || ni >= pheromones.length || nj >= pheromones[0].length) {
                    continue;
                }
                
                                const mainNi = Math.floor((ni * Constants.Colony.MapPheromoneScale) / Constants.Colony.MapPixelScale);
                const mainNj = Math.floor((nj * Constants.Colony.MapPheromoneScale) / Constants.Colony.MapPixelScale);
                
                if (mainNi < 0 || mainNj < 0 || 
                    mainNi >= mainObjects.length || mainNj >= mainObjects[0].length ||
                    (mainObjects[mainNi][mainNj].notEmpty && mainObjects[mainNi][mainNj].wall)) {
                    continue;
                }
                
                                if (this.food > 0) {
                    pheromones[ni][nj].toFoodPheromones = Math.max(
                        pheromones[ni][nj].toFoodPheromones,
                        pheromones[i][j].toFoodPheromones * 0.5                     );
                } else {
                    pheromones[ni][nj].toHomePheromones = Math.max(
                        pheromones[ni][nj].toHomePheromones,
                        pheromones[i][j].toHomePheromones * 0.5                     );
                }
                
                if (pheromones[ni][nj].toFoodPheromones > 0 || pheromones[ni][nj].toHomePheromones > 0) {
                    pheromones[ni][nj].notEmpty = true;
                }
            }
        }
    }
    
        isStuckInCorner(mainObjects, i, j) {
                if (this.food <= 0) {
            return false;
        }
        
                let wallCount = 0;
        
                const directions = [
            {di: -1, dj: 0},             {di: 1, dj: 0},              {di: 0, dj: -1},             {di: 0, dj: 1}           ];
        
        for (const dir of directions) {
            const ni = i + dir.di;
            const nj = j + dir.dj;
            
            if (ni < 0 || nj < 0 || ni >= mainObjects.length || nj >= mainObjects[0].length ||
               (mainObjects[ni][nj].notEmpty && mainObjects[ni][nj].wall)) {
                wallCount++;
            }
        }
        
                const currentAreaHash = `${i}-${j}`;
        if (!this.lastPositionAreaHash) {
            this.lastPositionAreaHash = currentAreaHash;
            this.timeInSameArea = 0;
        } else if (this.lastPositionAreaHash === currentAreaHash) {
            this.timeInSameArea++;
        } else {
            this.lastPositionAreaHash = currentAreaHash;
            this.timeInSameArea = 0;
        }
        
                                return (wallCount >= 3) || (this.timeInSameArea > 40);
    }
    
        escapeFromCorner(mainObjects, currentI, currentJ) {
                this.followingPheromones = false;
        this.timeInSameArea = 0;
        
                const randomAngle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(randomAngle);
        this.vy = Math.sin(randomAngle);
        
                const radius = 5;
        const nearestEmpty = this.findNearestEmptyCell(mainObjects, currentI, currentJ, radius);
        
        if (nearestEmpty) {
                        const targetX = nearestEmpty.i * Constants.Colony.MapPixelScale + Constants.Colony.MapPixelScale / 2;
            const targetY = nearestEmpty.j * Constants.Colony.MapPixelScale + Constants.Colony.MapPixelScale / 2;
            
                        const dirX = targetX - this.x;
            const dirY = targetY - this.y;
            
                        const length = Math.sqrt(dirX * dirX + dirY * dirY);
            if (length > 0) {
                this.vx = dirX / length;
                this.vy = dirY / length;
            }
        }
    }
    
        findNearestEmptyCell(mainObjects, centerI, centerJ, radius) {
        let bestDist = Infinity;
        let bestCell = null;
        
                for (let di = -radius; di <= radius; di++) {
            for (let dj = -radius; dj <= radius; dj++) {
                const i = centerI + di;
                const j = centerJ + dj;
                
                                if (i < 0 || j < 0 || i >= mainObjects.length || j >= mainObjects[0].length) {
                    continue;
                }
                
                                if (di === 0 && dj === 0) {
                    continue;
                }
                
                                if (!mainObjects[i][j].wall) {
                                        const dist = di * di + dj * dj;
                    
                                        if (dist < bestDist) {
                        bestDist = dist;
                        bestCell = { i, j };
                    }
                }
            }
        }
        
        return bestCell;
    }
    
        detectCrowding(mainObjects) {
        if (!window.allAnts) {
            return false;
        }
        
        let nearbyAnts = 0;
        const crowdingRadius = Constants.Colony.MapPixelScale * 5;
        
                for (const ant of window.allAnts) {
                        if (ant === this) continue;
            
                        if (ant.food <= 0) continue;
            
            const distance = Math.sqrt((this.x - ant.x) ** 2 + (this.y - ant.y) ** 2);
            if (distance < crowdingRadius) {
                nearbyAnts++;
                
                                if (nearbyAnts >= 3) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
        findReturnPath(pheromones, mainObjects) {
        const i = Math.floor(this.x / Constants.Colony.MapPheromoneScale);
        const j = Math.floor(this.y / Constants.Colony.MapPheromoneScale);
        
                let bestHomePhI = -1, bestHomePhJ = -1;
        let bestHomePhValue = 0;
        
                const searchRadius = Math.floor(Constants.Colony.RadiusOfAntsEyes * 1.5);
        
        for (let ii = i - searchRadius; ii <= i + searchRadius; ii++) {
            for (let jj = j - searchRadius; jj <= j + searchRadius; jj++) {
                if (ii < 0 || jj < 0 || ii >= pheromones.length || jj >= pheromones[0].length) {
                    continue;
                }
                
                                if (pheromones[ii][jj].notEmpty && pheromones[ii][jj].toHomePheromones > 0) {
                                        const phX = (ii + 0.5) * Constants.Colony.MapPheromoneScale;
                    const phY = (jj + 0.5) * Constants.Colony.MapPheromoneScale;
                    
                    if (this.isPathClear(this.x, this.y, phX, phY, mainObjects)) {
                                                const distance = Math.sqrt((phX - this.x) ** 2 + (phY - this.y) ** 2);
                        const score = pheromones[ii][jj].toHomePheromones / Math.max(1, distance * 0.3);
                        
                        if (bestHomePhI === -1 || score > bestHomePhValue) {
                            bestHomePhI = ii;
                            bestHomePhJ = jj;
                            bestHomePhValue = score;
                        }
                    }
                }
            }
        }
        
                if (bestHomePhI !== -1 && bestHomePhValue > Constants.Colony.MinPheromoneValue * 10) {
            const targetX = (bestHomePhI + 0.5) * Constants.Colony.MapPheromoneScale;
            const targetY = (bestHomePhJ + 0.5) * Constants.Colony.MapPheromoneScale;
            
                        this.vx = targetX - this.x;
            this.vy = targetY - this.y;
            
                        const norm = Math.sqrt(this.vx ** 2 + this.vy ** 2);
            if (norm > 0) {
                this.vx = (this.vx / norm) * this.stepLength * 1.5;
                this.vy = (this.vy / norm) * this.stepLength * 1.5;
            }
            
                        this.chosenPheromoneI = bestHomePhI;
            this.chosenPheromoneJ = bestHomePhJ;
        }
    }
    
    move(pheromones, mainObjects, vars) {
        if (this.disabled) return;
        
                const i = Math.floor(this.x / Constants.Colony.MapPixelScale);
        const j = Math.floor(this.y / Constants.Colony.MapPixelScale);
        
                this.updateAreaTracking(i, j);
        
                this.updatePheromones(pheromones, i, j, vars);
        
                this.checkIfStuck(mainObjects, i, j);
        
                if (!this.followingPheromones) {
            this.findPheromoneToFollow(pheromones, i, j, vars);
        }
        
                const randomDeviationScale = 0.3;
        const randomX = (Math.random() - 0.5) * randomDeviationScale;
        const randomY = (Math.random() - 0.5) * randomDeviationScale;
        
                let newX = this.x + (this.vx + randomX) * Constants.Colony.AntStepLength;
        let newY = this.y + (this.vy + randomY) * Constants.Colony.AntStepLength;
        
                const newI = Math.floor(newX / Constants.Colony.MapPixelScale);
        const newJ = Math.floor(newY / Constants.Colony.MapPixelScale);
        
                if (!this.isPositionValid(newI, newJ, mainObjects)) {
                        this.vx = -this.vx + (Math.random() - 0.5);
            this.vy = -this.vy + (Math.random() - 0.5);
            
                        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (speed > 0) {
                this.vx = this.vx / speed;
                this.vy = this.vy / speed;
            }
            
                        newX = this.x + this.vx * Constants.Colony.AntStepLength;
            newY = this.y + this.vy * Constants.Colony.AntStepLength;
            
                        const revalidatedI = Math.floor(newX / Constants.Colony.MapPixelScale);
            const revalidatedJ = Math.floor(newY / Constants.Colony.MapPixelScale);
            
                        if (!this.isPositionValid(revalidatedI, revalidatedJ, mainObjects)) {
                this.escapeFromCorner(mainObjects, i, j);
                return;             }
        }
        
                this.x = newX;
        this.y = newY;
        
                const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 0) {
            this.vx = this.vx / speed;
            this.vy = this.vy / speed;
        }
        
                this.updateDistances(vars);
    }
    
    updateAreaTracking(i, j) {
                if (this.lastGridI !== i || this.lastGridJ !== j) {
            this.lastGridI = i;
            this.lastGridJ = j;
            this.timeInSameArea = 0;
        } else {
                        this.timeInSameArea++;
        }
    }
    
    updatePheromones(pheromones, i, j, vars) {
                if (i >= 0 && i < pheromones.length && j >= 0 && j < pheromones[0].length) {
            pheromones[i][j].notEmpty = true;
            
                        if (this.food > 0) {
                pheromones[i][j].toHomeStrength = Math.min(
                    100000, 
                    pheromones[i][j].toHomeStrength * 0.5 + 
                    2.0 * this.distanceFromFood * (this.food ? 1 : 0.5)
                );
            } else {
                pheromones[i][j].toFoodStrength = Math.min(
                    100000, 
                    pheromones[i][j].toFoodStrength * 0.5 + 
                    2.0 * vars.distanceFromHome * this.distanceFromHome
                );
            }
        }
    }
    
    checkIfStuck(mainObjects, i, j) {
                const stuckThreshold = 20;
        if (this.timeInSameArea > stuckThreshold) {
            this.escapeFromCorner(mainObjects, i, j);
        }
    }
    
    findPheromoneToFollow(pheromones, i, j, vars) {
                const radius = Constants.Colony.RadiusOfAntsEyes;
        let bestPheromoneValue = 0;
        let bestI = -1;
        let bestJ = -1;
        
                for (let ii = i - radius; ii <= i + radius; ii++) {
            for (let jj = j - radius; jj <= j + radius; jj++) {
                                if (ii < 0 || jj < 0 || ii >= pheromones.length || jj >= pheromones[0].length) {
                    continue;
                }
                
                                if (!pheromones[ii][jj].notEmpty) {
                    continue;
                }
                
                                let currentPheromoneValue = this.food > 0 
                    ? pheromones[ii][jj].toHomeStrength 
                    : pheromones[ii][jj].toFoodStrength;
                
                                if (currentPheromoneValue > bestPheromoneValue) {
                    bestPheromoneValue = currentPheromoneValue;
                    bestI = ii;
                    bestJ = jj;
                }
            }
        }
        
                if (bestI !== -1 && bestJ !== -1) {
                        this.followingPheromones = true;
            
                        const targetX = bestI * Constants.Colony.MapPixelScale + Constants.Colony.MapPixelScale / 2;
            const targetY = bestJ * Constants.Colony.MapPixelScale + Constants.Colony.MapPixelScale / 2;
            
                        const dirX = targetX - this.x;
            const dirY = targetY - this.y;
            
                        const length = Math.sqrt(dirX * dirX + dirY * dirY);
            if (length > 0) {
                                this.vx = dirX / length * 0.8 + this.vx * 0.2;
                this.vy = dirY / length * 0.8 + this.vy * 0.2;
                
                                const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                if (speed > 0) {
                    this.vx = this.vx / speed;
                    this.vy = this.vy / speed;
                }
            }
        } else {
                        if (Math.random() < 0.05) {
                const angle = Math.random() * Math.PI * 2;
                this.vx = Math.cos(angle);
                this.vy = Math.sin(angle);
            }
        }
    }
    
    updateDistances(vars) {
                this.distanceFromHome = Math.sqrt(
            (this.x - vars.homeX) ** 2 + (this.y - vars.homeY) ** 2
        ) / Constants.Colony.MapPixelScale;
        
                if (this.food > 0) {
            this.distanceFromFood = Math.sqrt(
                (this.x - this.foodX) ** 2 + (this.y - this.foodY) ** 2
            ) / Constants.Colony.MapPixelScale;
        }
    }
    
        isPositionValid(i, j, mainObjects) {
                if (i < 0 || j < 0 || i >= mainObjects.length || j >= mainObjects[0].length) {
            return false;
        }
        
                return !mainObjects[i][j].wall;
    }
}

export default ColonyAnt; 