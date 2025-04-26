import TspColony from "./ant-tsp-colony.js";
import TspRenderer from "./ant-tsp-renderer.js";
import {Constants} from "./ant-constants.js";

const SimulationState = {
    PRESTART: "prestart",
    MAP_BUILDING: "mapBuilding",
    PATH_FINDING: "pathFinding"
};

class TspSimulation
{
    constructor(config = {})
    {
        this.canvas = config.canvas;
        this.ctx = this.canvas.getContext("2d");
        this.cityCoordinates = {x: [], y: []};
        this.state = SimulationState.PRESTART;
        this.maxCities = config.maxCities || Constants.TSP.MaxCities;

        this.mainButton = config.mainButton;
        this.vertexNumberOutput = config.vertexNumberOutput;
        this.bestPathOutput = config.bestPathOutput;
        this.iterationOutput = config.iterationOutput;

        this.renderer = new TspRenderer({
            canvas: this.canvas,
            townColor: config.townColor,
            townRadius: config.townRadius,
            otherEdgesOpacity: config.otherEdgesOpacity,
            otherEdgesColor: config.otherEdgesColor,
            otherEdgesWidth: config.otherEdgesWidth,
            mainEdgesColor: config.mainEdgesColor,
            mainEdgesOpacity: config.mainEdgesOpacity,
            mainEdgesWidth: config.mainEdgesWidth,
            resultEdgesColor: config.resultEdgesColor,
            resultEdgesOpacity: config.resultEdgesOpacity,
            resultEdgesWidth: config.resultEdgesWidth
        });

        this.colony = null;
        this.animationId = null;

        this.init();
    }

    init()
    {
        this.setupEventListeners();
        this.updateUI();
    }

    setupEventListeners()
    {
        this.canvas.addEventListener("mousedown", this.handleCanvasClick.bind(this));

        if (this.mainButton)
        {
            this.mainButton.addEventListener("click", this.nextState.bind(this));
        }
    }

    handleCanvasClick(e)
    {
        if (this.state !== SimulationState.MAP_BUILDING ||
            e.buttons !== 1 ||
            this.cityCoordinates.x.length >= this.maxCities)
        {
            return;
        }

        const x = e.offsetX;
        const y = e.offsetY;

        if (x >= 0 && y >= 0 && x <= this.canvas.width && y <= this.canvas.height)
        {
            for (let i = 0; i < this.cityCoordinates.x.length; i++)
            {
                if (this.cityCoordinates.x[i] === x && this.cityCoordinates.y[i] === y)
                {
                    return;
                }
            }

            this.cityCoordinates.x.push(x);
            this.cityCoordinates.y.push(y);

            if (this.vertexNumberOutput)
            {
                this.vertexNumberOutput.textContent = this.cityCoordinates.x.length.toString();
            }

            this.renderer.drawTown(x, y);

            for (let i = 0; i < this.cityCoordinates.x.length - 1; i++)
            {
                this.renderer.drawEdge(
                    this.cityCoordinates.x[i], this.cityCoordinates.y[i],
                    x, y,
                    this.renderer.otherEdgesWidth,
                    this.renderer.otherEdgesOpacity,
                    this.renderer.otherEdgesColor
                );
            }
        }
    }

    nextState()
    {
        switch (this.state)
        {
            case SimulationState.PRESTART:
                this.startMapBuilding();
                break;
            case SimulationState.MAP_BUILDING:
                if (this.cityCoordinates.x.length > 0)
                {
                    this.startPathFinding();
                }
                break;
            case SimulationState.PATH_FINDING:
                this.stopPathFinding();
                break;
        }
    }

    startMapBuilding()
    {
        this.state = SimulationState.MAP_BUILDING;
        this.cityCoordinates = {x: [], y: []};

        this.renderer.clear();

        this.updateUI();
    }

    startPathFinding()
    {
        if (this.cityCoordinates.x.length === 0)
        {
            return;
        }

        this.state = SimulationState.PATH_FINDING;
        this.updateUI();

        this.colony = new TspColony({
            cityCoordinates: this.cityCoordinates
        });

        this.runSimulation();
    }

    stopPathFinding()
    {
        this.state = SimulationState.PRESTART;

        if (this.animationId)
        {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        if (this.colony && this.colony.bestPath)
        {
            this.renderer.renderFinalResult(this.colony.bestPath, this.cityCoordinates);
        }

        this.cityCoordinates = {x: [], y: []};

        this.updateUI();
    }

    runSimulation()
    {
        if (!this.colony || this.state !== SimulationState.PATH_FINDING)
        {
            return;
        }

        const result = this.colony.runIteration();

        if (this.bestPathOutput)
        {
            this.bestPathOutput.textContent = Math.floor(result.bestPathLength).toString();
        }

        if (this.iterationOutput)
        {
            this.iterationOutput.textContent = result.iteration.toString();
        }

        if (result.bestPath)
        {
            this.renderer.renderIteration(result, this.cityCoordinates);
        }

        if (!this.colony.isFinished())
        {
            this.animationId = requestAnimationFrame(this.runSimulation.bind(this));
        }
        else
        {
            this.renderer.renderFinalResult(this.colony.bestPath, this.cityCoordinates);
            this.stopPathFinding();
        }
    }

    updateUI()
    {
        if (!this.mainButton)
        {
            return;
        }

        switch (this.state)
        {
            case SimulationState.PRESTART:
                this.mainButton.textContent = "Начать";
                if (this.vertexNumberOutput)
                {
                    this.vertexNumberOutput.textContent = "Вершины";
                }
                if (this.bestPathOutput)
                {
                    this.bestPathOutput.textContent = "Длина";
                }
                if (this.iterationOutput)
                {
                    this.iterationOutput.textContent = "Итерация";
                }
                break;
            case SimulationState.MAP_BUILDING:
                this.mainButton.textContent = "Найти путь";
                break;
            case SimulationState.PATH_FINDING:
                this.mainButton.textContent = "Прервать";
                break;
        }
    }

    setMaxCities(maxCities)
    {
        this.maxCities = maxCities;
    }

    setGraphicsSettings(settings)
    {
        Object.assign(this.renderer, settings);

        if (this.state === SimulationState.MAP_BUILDING)
        {
            this.renderer.renderInitialState(this.cityCoordinates);
        }
    }
}

export default TspSimulation; 