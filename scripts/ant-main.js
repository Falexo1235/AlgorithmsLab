import ColonySimulation from './ant-colony-simulation.js';
import { Constants } from './ant-constants.js';

document.getElementById('changeAlgorithm').addEventListener('click', function() {
    const tspSection = document.getElementById('tspSection');
    const colonySection = document.getElementById('colonySection');
    
    if (tspSection.classList.contains('active')) {
        tspSection.classList.remove('active');
        colonySection.classList.add('active');
        this.textContent = 'Стандартный алгоритм';
        
        document.getElementById('tspSettings').style.display = 'none';
        document.getElementById('colonySettings').style.display = 'block';
        document.getElementById('tspGraphics').style.display = 'none';
        document.getElementById('colonyGraphics').style.display = 'block';
    } else {
        colonySection.classList.remove('active');
        tspSection.classList.add('active');
        this.textContent = 'Продвинутый алгоритм';
        
        document.getElementById('tspSettings').style.display = 'block';
        document.getElementById('colonySettings').style.display = 'none';
        document.getElementById('tspGraphics').style.display = 'block';
        document.getElementById('colonyGraphics').style.display = 'none';
    }
});

document.getElementById('colonySettings').style.display = 'none';
document.getElementById('colonyGraphics').style.display = 'none';

window.addEventListener("load", function () {
    if (!document.getElementById('colonySection').classList.contains('active')) {
        return;
    }

    const mainCanvas = document.getElementById('myCanvas2');
    const mainObjectsCanvas = document.getElementById('extraCanvas1');
    const pheromonesCanvas = document.getElementById('extraCanvas2');

    window.anthill = { x: -1, y: -1, radius: 20, isBuilt: false };

        const foodNutritionInput = document.getElementById('foodNutrition');
    const initialNutrition = foodNutritionInput ? parseInt(foodNutritionInput.value, 10) : 100;

        const simulation = new ColonySimulation({
        mainCanvas: mainCanvas,
        mainObjectsCanvas: mainObjectsCanvas,
        pheromonesCanvas: pheromonesCanvas,
        pixelScale: Constants.Colony.MapPixelScale,
        pheromoneScale: Constants.Colony.MapPheromoneScale,
        anthillColor: '#303030',
        antsColor: '#696969',
        antsRadius: Constants.Colony.AntsRadius,
        pheromonesDrawingMode: 1,
        antCount: 300,
        brushWidth: 20,
        defaultFoodNutrition: initialNutrition
    });

    simulation.start();

    window.colonySimulation = simulation;
    
        const foodNutritionOutput = document.getElementById('foodNutritionOutput');
    
    if (foodNutritionInput && foodNutritionOutput) {
                foodNutritionOutput.textContent = foodNutritionInput.value;
        
                foodNutritionInput.addEventListener('input', (e) => {
            if (foodNutritionOutput) {
                foodNutritionOutput.textContent = e.target.value;
            }
            
                        const nutritionValue = parseInt(e.target.value, 10);
            simulation.defaultFoodNutrition = nutritionValue;
        });
        
                foodNutritionInput.addEventListener('change', (e) => {
            const nutritionValue = parseInt(e.target.value, 10);
            simulation.defaultFoodNutrition = nutritionValue;
        });
    }
});

document.getElementById('changeAlgorithm').addEventListener('click', function () {
    const colonySection = document.getElementById('colonySection');

    if (colonySection.classList.contains('active') && !window.colonySimulation) {
        const mainCanvas = document.getElementById('myCanvas2');
        const mainObjectsCanvas = document.getElementById('extraCanvas1');
        const pheromonesCanvas = document.getElementById('extraCanvas2');

        window.anthill = { x: -1, y: -1, radius: 20, isBuilt: false };

                const foodNutritionInput = document.getElementById('foodNutrition');
        const initialNutrition = foodNutritionInput ? parseInt(foodNutritionInput.value, 10) : 100;

        const simulation = new ColonySimulation({
            mainCanvas: mainCanvas,
            mainObjectsCanvas: mainObjectsCanvas,
            pheromonesCanvas: pheromonesCanvas,
            pixelScale: Constants.Colony.MapPixelScale,
            pheromoneScale: Constants.Colony.MapPheromoneScale,
            anthillColor: '#303030',
            antsColor: '#696969',
            antsRadius: Constants.Colony.AntsRadius,
            pheromonesDrawingMode: 1,
            antCount: 300,
            brushWidth: 20,
            defaultFoodNutrition: initialNutrition
        });

        simulation.start();
        window.colonySimulation = simulation;
        
                const foodNutritionOutput = document.getElementById('foodNutritionOutput');
        if (foodNutritionInput && foodNutritionOutput) {
            foodNutritionOutput.textContent = foodNutritionInput.value;
        }
    }
});