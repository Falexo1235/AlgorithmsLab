import Ant from './ant.js';
import { Constants } from './ant-constants.js';
import { getRandomInt } from './ant-utils.js';

class TspAnt extends Ant {
    constructor(config = {}) {
        super(config);
        this.path = [];
        this.unvisitedCities = [...config.cities || []]; 
        this.pathLength = 0;
    }
    
    startJourney() {
                const startCityIndex = getRandomInt(0, this.unvisitedCities.length);
        this.path.push(this.unvisitedCities[startCityIndex]);
        this.unvisitedCities.splice(startCityIndex, 1);
    }
    
    makeFullJourney(lengthMatrix, pheromoneMatrix) {
                this.startJourney();
        
                while (this.unvisitedCities.length > 0) {
            const nextCity = this.selectNextCity(lengthMatrix, pheromoneMatrix);
            this.visitCity(nextCity, lengthMatrix);
        }
        
                const startCity = this.path[0];
        const lastCity = this.path[this.path.length - 1];
        this.pathLength += lengthMatrix[lastCity][startCity];
        this.path.push(startCity);         
        return {
            path: [...this.path],
            length: this.pathLength
        };
    }
    
    selectNextCity(lengthMatrix, pheromoneMatrix) {
        const currentCity = this.path[this.path.length - 1];
        const probabilities = [];
        let probabilitySum = 0;
        
                for (const city of this.unvisitedCities) {
            const pheromone = Math.pow(pheromoneMatrix[currentCity][city], Constants.TSP.Alpha);
            const distance = Math.pow(Constants.TSP.PathLengthConst / lengthMatrix[currentCity][city], Constants.TSP.Beta);
            const probability = pheromone * distance;
            
            probabilitySum += probability;
            probabilities.push({ city, probability });
        }
        
                for (const item of probabilities) {
            item.probability /= probabilitySum;
        }
        
                let cumulativeProbability = 0;
        for (const item of probabilities) {
            cumulativeProbability += item.probability;
            item.cumulativeProbability = cumulativeProbability;
        }
        
                const r = Math.random();
        const selectedCity = probabilities.find(item => item.cumulativeProbability >= r)?.city 
            || probabilities[probabilities.length - 1].city;
            
        return selectedCity;
    }
    
    visitCity(city, lengthMatrix) {
        const currentCity = this.path[this.path.length - 1];
        
                this.pathLength += lengthMatrix[currentCity][city];
        
                this.path.push(city);
        this.unvisitedCities.splice(this.unvisitedCities.indexOf(city), 1);
    }
}

export default TspAnt; 