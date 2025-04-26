import ColonySimulation from './ant-colony-simulation.js';
import { Constants } from './ant-constants.js';

window.addEventListener("load", function onWindowLoad() {
        const mainCanvas = document.getElementById('myCanvas');
    const mainObjectsCanvas = document.getElementById('extraCanvas1');
    const pheromonesCanvas = document.getElementById('extraCanvas2');
    
        window.anthill = { x: -1, y: -1, radius: 20, isBuilt: false };
    
        const simulation = new ColonySimulation({
        mainCanvas: mainCanvas,
        mainObjectsCanvas: mainObjectsCanvas,
        pheromonesCanvas: pheromonesCanvas,
        pixelScale: Constants.Colony.MapPixelScale,
        pheromoneScale: Constants.Colony.MapPheromoneScale,
        anthillColor: '#ff4411',
        antsColor: '#ff0000',
        antsRadius: Constants.Colony.AntsRadius,
        pheromonesDrawingMode: 0,
        antCount: 300,
        brushWidth: 20
    });
    
        window.renderer = simulation.renderer;
    
        const driveButton = document.getElementById('driveId');
    if (driveButton) {
        driveButton.addEventListener('click', function() {
            simulation.toggleDriveMode();
            
            if (simulation.driveMode) {
                driveButton.textContent = 'Остыть';
            } else {
                driveButton.textContent = 'Еще драйва!';
            }
        });
    }
    
        const audioElement = document.getElementById('myAudioId');
    if (audioElement) {
        audioElement.addEventListener('ended', function() {
            audioElement.currentTime = 0;
            audioElement.play();
        });
    }
    
        simulation.start();
    
        window.addEventListener('resize', function() {
                if (window.innerWidth > mainCanvas.width || window.innerHeight > mainCanvas.height) {
            simulation.resize(window.innerWidth, window.innerHeight);
        }
    });
    
        const originalBuild = simulation.anthill.build;
    simulation.anthill.build = function(x, y) {
        const result = originalBuild.call(simulation.anthill, x, y);
        if (result) {
            window.anthill.x = x;
            window.anthill.y = y;
            window.anthill.radius = simulation.anthill.radius;
            window.anthill.isBuilt = true;
        }
        return result;
    };
    
    const originalReset = simulation.anthill.reset;
    simulation.anthill.reset = function() {
        originalReset.call(simulation.anthill);
        window.anthill.isBuilt = false;
    };
}); 