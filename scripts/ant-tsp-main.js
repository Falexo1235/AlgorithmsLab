import TspSimulation from './ant-tsp-simulation.js';

window.addEventListener("load", function onWindowLoad() {
        const canvas = document.getElementById("myCanvas");
    const mainButton = document.getElementById("mainButton");
    const vertexNumberOutput = document.getElementById("vertexNumberId");
    const bestPathOutput = document.getElementById("bestPathId");
    const iterationOutput = document.getElementById("iterationId");
    
        const graphicsSettings = {
        townColor: '#000000',
        otherEdgesOpacity: 0.15,
        otherEdgesColor: '#999999',
        otherEdgesWidth: 2,
        mainEdgesColor: '#ffff00',
        mainEdgesOpacity: 1,
        mainEdgesWidth: 4,
        resultEdgesColor: '#00ff00',
        resultEdgesOpacity: 1,
        resultEdgesWidth: 4
    };
    
        const simulation = new TspSimulation({
        canvas: canvas,
        mainButton: mainButton,
        vertexNumberOutput: vertexNumberOutput,
        bestPathOutput: bestPathOutput,
        iterationOutput: iterationOutput,
        ...graphicsSettings
    });
    
        setupSettingsControls(simulation);
    setupGraphicsControls(simulation, graphicsSettings);
});

function setupSettingsControls(simulation) {
    const showSettingsButton = document.getElementById("showSettingsModalWindow");
    const saveSettingsButton = document.getElementById("saveSettings");
    
    if (showSettingsButton) {
        showSettingsButton.addEventListener('click', function() {
            const maxCitiesInput = document.getElementById("maxCitiesNumberInputId");
            const maxCitiesOutput = document.getElementById("maxCitiesNumberOutputId");
            
            if (maxCitiesInput && maxCitiesOutput) {
                maxCitiesInput.value = simulation.maxCities;
                maxCitiesOutput.value = simulation.maxCities;
            }
            
            window.location.href = '#shadowSettings';
        });
    }
    
    if (saveSettingsButton) {
        saveSettingsButton.addEventListener('click', function() {
            const maxCitiesInput = document.getElementById("maxCitiesNumberInputId");
            
            if (maxCitiesInput) {
                simulation.setMaxCities(parseInt(maxCitiesInput.value, 10));
            }
            
            window.location.href = '#';
        });
    }
}

function setupGraphicsControls(simulation, settings) {
    const showGraphicsButton = document.getElementById("showGraphicsModalWindow");
    const saveGraphicsButton = document.getElementById("saveGraphics");
    
    if (showGraphicsButton) {
        showGraphicsButton.addEventListener('click', function() {
                        document.getElementById("citiesColorId").value = settings.townColor;
            document.getElementById("otherEdgesColorId").value = settings.otherEdgesColor;
            document.getElementById("mainEdgesColorId").value = settings.mainEdgesColor;
            document.getElementById("resultEdgesColorId").value = settings.resultEdgesColor;
            document.getElementById("otherEdgesOpacityInputId").value = settings.otherEdgesOpacity.toString();
            document.getElementById("otherEdgesOpacityOutputId").value = settings.otherEdgesOpacity.toString();
            
            window.location.href = '#shadowGraphics';
        });
    }
    
    if (saveGraphicsButton) {
        saveGraphicsButton.addEventListener('click', function() {
                        settings.townColor = document.getElementById("citiesColorId").value;
            settings.otherEdgesColor = document.getElementById("otherEdgesColorId").value;
            settings.mainEdgesColor = document.getElementById("mainEdgesColorId").value;
            settings.resultEdgesColor = document.getElementById("resultEdgesColorId").value;
            settings.otherEdgesOpacity = Number(document.getElementById("otherEdgesOpacityInputId").value);
            
                        simulation.setGraphicsSettings(settings);
            
            window.location.href = '#';
        });
    }
} 