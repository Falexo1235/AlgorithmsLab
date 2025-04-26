import TspAnt from './ant-tsp.js';
import { Constants } from './ant-constants.js';

class TspColony {
    constructor(config = {}) {
        this.cities = config.cities || [];         this.cityCoordinates = config.cityCoordinates || { x: [], y: [] };
        
                const cityCount = this.cityCoordinates.x.length;
        if (cityCount <= 3) {
            this.antCount = Math.min(10, Math.pow(cityCount, 2));
        } else if (cityCount <= 10) {
            this.antCount = Math.min(100, Math.pow(cityCount, 2));
        } else {
            this.antCount = Math.min(Math.pow(cityCount, 2), 1000);
        }
        
        this.lengthMatrix = [];
        this.pheromoneMatrix = [];
        this.extraPheromones = [];
        this.iteration = 0;
        this.iterationsWithoutImprovement = 0;
        this.bestPath = null;
        this.bestPathLength = Infinity;
        
        this.initMatrices();
    }
    
    initMatrices() {
        const cityCount = this.cityCoordinates.x.length;
        
                this.lengthMatrix = Array(cityCount).fill().map(() => Array(cityCount).fill(0));
        for (let i = 0; i < cityCount; i++) {
            for (let j = 0; j < cityCount; j++) {
                if (i === j) {
                    this.lengthMatrix[i][j] = -Infinity;                 } else {
                    this.lengthMatrix[i][j] = Math.sqrt(
                        Math.pow(this.cityCoordinates.x[i] - this.cityCoordinates.x[j], 2) + 
                        Math.pow(this.cityCoordinates.y[i] - this.cityCoordinates.y[j], 2)
                    );
                }
            }
        }
        
                this.pheromoneMatrix = Array(cityCount).fill().map(() => 
            Array(cityCount).fill(Constants.TSP.InitialPheromone)
        );
        
                this.extraPheromones = Array(cityCount).fill().map(() => 
            Array(cityCount).fill(0)
        );
    }
    
    runIteration() {
        this.iteration++;
        this.clearExtraPheromones();
        
        const ants = this.createAnts();
        let minPathLength = Infinity;
        let minPath = null;
        
                for (const ant of ants) {
            const result = ant.makeFullJourney(this.lengthMatrix, this.pheromoneMatrix);
            
                        this.updateExtraPheromones(result.path, result.length);
            
                        if (result.length < minPathLength) {
                minPathLength = result.length;
                minPath = result.path;
            }
        }
        
                if (minPathLength < this.bestPathLength) {
            this.bestPathLength = minPathLength;
            this.bestPath = minPath;
            this.iterationsWithoutImprovement = 0;
        } else {
            this.iterationsWithoutImprovement++;
        }
        
                this.updatePheromones();
        
        return {
            bestPath: this.bestPath,
            bestPathLength: this.bestPathLength,
            iteration: this.iteration,
            currentPath: minPath,
            currentPathLength: minPathLength,
            noImprovement: this.iterationsWithoutImprovement
        };
    }
    
    createAnts() {
        const ants = [];
        const cityCount = this.cityCoordinates.x.length;
        
        for (let i = 0; i < this.antCount; i++) {
                        const cities = [...Array(cityCount).keys()];
            ants.push(new TspAnt({ cities }));
        }
        return ants;
    }
    
    clearExtraPheromones() {
        for (let i = 0; i < this.extraPheromones.length; i++) {
            for (let j = 0; j < this.extraPheromones[i].length; j++) {
                this.extraPheromones[i][j] = 0;
            }
        }
    }
    
    updateExtraPheromones(path, pathLength) {
                for (let i = 0; i < path.length - 1; i++) {
            const cityFrom = path[i];
            const cityTo = path[i + 1];
            const pheromoneAmount = Constants.TSP.PheromoneConst / this.lengthMatrix[cityFrom][cityTo];
            
            this.extraPheromones[cityFrom][cityTo] += pheromoneAmount;
            this.extraPheromones[cityTo][cityFrom] += pheromoneAmount;         }
    }
    
    updatePheromones() {
        for (let i = 0; i < this.pheromoneMatrix.length; i++) {
            for (let j = 0; j < this.pheromoneMatrix[i].length; j++) {
                                this.pheromoneMatrix[i][j] = this.pheromoneMatrix[i][j] * Constants.TSP.RemainingPheromones;
                                this.pheromoneMatrix[i][j] += this.extraPheromones[i][j];
            }
        }
    }
    
    isFinished() {
        const cityCount = this.cityCoordinates.x.length;
        
                if (cityCount <= 5) {
            return this.iteration >= 50 || this.iterationsWithoutImprovement >= 20;
        }
        
                if (cityCount <= 15) {
            return this.iteration >= 1000 || this.iterationsWithoutImprovement >= 100;
        }
        
                return this.iteration >= Constants.TSP.MaxIterations || 
               this.iterationsWithoutImprovement >= Constants.TSP.MaxWithoutImprovement;
    }
}

export default TspColony; 