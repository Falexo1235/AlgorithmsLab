import ColonyAnt from './ant-colony.js';
import { Constants } from './ant-constants.js';

class Anthill {
    constructor(config = {}) {
                this.x = config.x || -1;
        this.y = config.y || -1;
        this.radius = config.radius || 20;
        
                this.color = config.color || '#696969';
        this.borderColor = config.borderColor || '#161712';
        
                this.isBuilt = false;
        
                this.ants = [];
        this.antCount = config.antCount || Constants.Colony.DefaultAntCount || 300;
    }
    
    build(x, y) {
        if (this.isBuilt) {
            return false;
        }
        
        this.x = x;
        this.y = y;
        this.isBuilt = true;
        this.initializeAnts();
        
        return true;
    }
    
    initializeAnts() {
        this.ants = [];
        
        for (let i = 0; i < this.antCount; i++) {
            this.ants.push(new ColonyAnt({
                anthill: this
            }));
        }
    }
    
    updateAnts(grid) {
        if (!this.isBuilt) {
            return;
        }
        
        for (const ant of this.ants) {
            ant.update(grid.mainObjects, grid.pheromones, this);
        }
    }
    
    resetAnts() {
        if (!this.isBuilt) {
            return;
        }
        
        for (const ant of this.ants) {
            ant.reset(this);
        }
    }
    
    setAntCount(count) {
        this.antCount = count;
        
        if (this.isBuilt) {
            this.initializeAnts();
        }
    }
    
    reset() {
        this.isBuilt = false;
        this.ants = [];
    }
}

export default Anthill; 