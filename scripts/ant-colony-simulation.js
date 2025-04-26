import Anthill from "./ant-colony-anthill.js";
import ColonyGrid from "./ant-colony-grid.js";
import ColonyRenderer from "./ant-colony-renderer.js";
import {Constants} from "./ant-constants.js";

const DrawingMode = {
    LARGE_FOOD: "large_food",
    WALL: "wall",
    ANTHILL: "anthill",
    ERASE: "erase"
};

class ColonySimulation
{
    constructor(config = {})
    {
        this.mainCanvas = config.mainCanvas;
        this.mainObjectsCanvas = config.mainObjectsCanvas;
        this.pheromonesCanvas = config.pheromonesCanvas;

        this.grid = new ColonyGrid({
            width: this.mainCanvas.width,
            height: this.mainCanvas.height,
            pixelScale: config.pixelScale || Constants.Colony.MapPixelScale,
            pheromoneScale: config.pheromoneScale || Constants.Colony.MapPheromoneScale
        });

        this.anthill = new Anthill({
            antCount: config.antCount || 300,
            color: config.anthillColor || "#ff4411"
        });

        this.foodSources = [];
        this.defaultFoodNutrition = config.defaultFoodNutrition || 100;
        this.infiniteFoodSources = false;
        this.renderer = new ColonyRenderer({
            canvas: this.mainCanvas,
            mainObjectsCanvas: this.mainObjectsCanvas,
            pheromonesCanvas: this.pheromonesCanvas,
            pheromonesDrawingMode: config.pheromonesDrawingMode || 0,
            antsColor: config.antsColor || "#ff0000",
            antsRadius: config.antsRadius || Constants.Colony.AntsRadius
        });

        this.drawingMode = DrawingMode.LARGE_FOOD;
        this.brushWidth = config.brushWidth || 20;
        this.paused = false;
        this.modalWindowMode = false;
        this.driveMode = false;
        this.iteration = 0;
        this.activeFoodSourceId = null;

        this.animationId = null;

        this.grid.initialize();
        this.setupEventListeners();
    }

    setupEventListeners()
    {
        const largeFoodButton = document.getElementById("large-food");
        const wallsButton = document.getElementById("walls");
        const antsButton = document.getElementById("ants");
        const eraseButton = document.getElementById("erase");
        const clearButton = document.getElementById("clear");
        const brushWidthInput = document.getElementById("brushWidth");

        if (largeFoodButton)
        {
            largeFoodButton.addEventListener("click", () =>
            {
                this.drawingMode = DrawingMode.LARGE_FOOD;
            });
        }

        if (wallsButton)
        {
            wallsButton.addEventListener("click", () =>
            {
                this.drawingMode = DrawingMode.WALL;
            });
        }

        if (antsButton)
        {
            antsButton.addEventListener("click", () =>
            {
                this.drawingMode = DrawingMode.ANTHILL;
            });
        }

        if (eraseButton)
        {
            eraseButton.addEventListener("click", () =>
            {
                this.drawingMode = DrawingMode.ERASE;
            });
        }

        if (clearButton)
        {
            clearButton.addEventListener("click", () =>
            {
                this.reset();
            });
        }

        if (brushWidthInput)
        {
            brushWidthInput.addEventListener("input", (e) =>
            {
                this.brushWidth = parseInt(e.target.value, 10);
            });

            brushWidthInput.value = this.brushWidth;
        }

        if (this.mainCanvas)
        {
            this.mainCanvas.addEventListener("mousedown", this.handleCanvasClick.bind(this));
            this.mainCanvas.addEventListener("mousemove", this.handleCanvasMove.bind(this));
        }

        this.mainCanvas.addEventListener("click", this.handleFoodSourceSelection.bind(this));

        this.setupSettingsControls();
        this.setupGraphicsControls();

        const foodNutritionInput = document.getElementById("foodNutrition");
        const foodNutritionOutput = document.getElementById("foodNutritionOutput");

        if (foodNutritionInput && foodNutritionOutput)
        {
            foodNutritionOutput.textContent = foodNutritionInput.value;

            foodNutritionInput.addEventListener("input", (e) =>
            {
                if (foodNutritionOutput)
                {
                    foodNutritionOutput.textContent = e.target.value;
                }

                const nutritionValue = parseInt(e.target.value, 10);
                this.defaultFoodNutrition = nutritionValue;
            });

            foodNutritionInput.addEventListener("change", (e) =>
            {
                const nutritionValue = parseInt(e.target.value, 10);
                this.defaultFoodNutrition = nutritionValue;
            });
        }

    }

    setupSettingsControls()
    {
        const showSettingsButton = document.getElementById("showSettingsModalWindow");
        const closeSettingsButton = document.getElementById("closeSettingsModalWindow");
        const saveSettingsButton = document.getElementById("saveSettings");

        if (showSettingsButton)
        {
            showSettingsButton.addEventListener("click", () =>
            {
                this.modalWindowMode = true;

                const colonyInput = document.getElementById("colonyInputId");
                const colonyOutput = document.getElementById("colonyOutputId");
                const antsEyesRadiusInput = document.getElementById("antsEyesRadiusInputId");
                const antsEyesRadiusOutput = document.getElementById("antsEyesRadiusOutputId");
                const mapPheromoneScaleInput = document.getElementById("mapPheromoneScaleInputId");
                const mapPixelScaleInput = document.getElementById("mapPixelScaleInputId");
                const infiniteFoodCheckbox = document.getElementById("infiniteFoodId");

                if (colonyInput && colonyOutput)
                {
                    colonyInput.value = this.anthill.antCount;
                    colonyOutput.value = this.anthill.antCount;
                }

                if (antsEyesRadiusInput && antsEyesRadiusOutput)
                {
                    antsEyesRadiusInput.value = Constants.Colony.RadiusOfAntsEyes;
                    antsEyesRadiusOutput.value = Constants.Colony.RadiusOfAntsEyes;
                }

                if (mapPheromoneScaleInput)
                {
                    mapPheromoneScaleInput.value = this.grid.pheromoneScale;
                }

                if (mapPixelScaleInput)
                {
                    mapPixelScaleInput.value = this.grid.pixelScale;
                }

                if (infiniteFoodCheckbox)
                {
                    infiniteFoodCheckbox.checked = this.infiniteFoodSources;
                }

                window.location.href = "#shadowSettings";
            });
        }

        if (closeSettingsButton)
        {
            closeSettingsButton.addEventListener("click", () =>
            {
                this.modalWindowMode = false;
                window.location.href = "#";
            });
        }

        if (saveSettingsButton)
        {
            saveSettingsButton.addEventListener("click", () =>
            {
                this.modalWindowMode = false;

                const colonyInput = document.getElementById("colonyInputId");
                const antsEyesRadiusInput = document.getElementById("antsEyesRadiusInputId");
                const mapPheromoneScaleInput = document.getElementById("mapPheromoneScaleInputId");
                const mapPixelScaleInput = document.getElementById("mapPixelScaleInputId");
                const infiniteFoodCheckbox = document.getElementById("infiniteFoodId");

                if (colonyInput)
                {
                    this.anthill.setAntCount(parseInt(colonyInput.value, 10));
                }

                if (antsEyesRadiusInput)
                {
                    Constants.Colony.RadiusOfAntsEyes = parseInt(antsEyesRadiusInput.value, 10);
                }

                if (infiniteFoodCheckbox)
                {
                    this.infiniteFoodSources = infiniteFoodCheckbox.checked;

                    this.updateAllFoodSources();
                }

                if (mapPheromoneScaleInput && mapPixelScaleInput)
                {
                    const newPheromoneScale = parseInt(mapPheromoneScaleInput.value, 10);
                    const newPixelScale = parseInt(mapPixelScaleInput.value, 10);

                    if (newPheromoneScale !== this.grid.pheromoneScale ||
                        newPixelScale !== this.grid.pixelScale)
                    {

                        this.grid.setResolution(newPixelScale, newPheromoneScale);
                        this.reset();
                    }
                }

                window.location.href = "#";
            });
        }
    }

    setupGraphicsControls()
    {
        const showGraphicsButton = document.getElementById("showGraphicsModalWindow");
        const closeGraphicsButton = document.getElementById("closeGraphicsModalWindow");
        const saveGraphicsButton = document.getElementById("saveGraphics");

        if (showGraphicsButton)
        {
            showGraphicsButton.addEventListener("click", () =>
            {
                this.modalWindowMode = true;

                const anthillColorInput = document.getElementById("anthillColorId");
                const antsColorInput = document.getElementById("antsColorId");
                const antsRadiusInput = document.getElementById("antsRadiusInputId");
                const antsRadiusOutput = document.getElementById("antsRadiusOutputId");
                const pheromonesDrawingModeInput = document.getElementById("pheromonesDrawingModeInputId");
                const pheromonesDrawingModeOutput = document.getElementById("pheromonesDrawingModeOutputId");
                const howOftenToUpdateColorInput = document.getElementById("howOftenToUpdateColorInputId");
                const howOftenToUpdateColorOutput = document.getElementById("howOftenToUpdateColorOutputId");

                if (anthillColorInput)
                {
                    anthillColorInput.value = this.anthill.color;
                }

                if (antsColorInput)
                {
                    antsColorInput.value = this.renderer.antsColor;
                }

                if (antsRadiusInput && antsRadiusOutput)
                {
                    antsRadiusInput.value = this.renderer.antsRadius;
                    antsRadiusOutput.value = this.renderer.antsRadius;
                }

                if (pheromonesDrawingModeInput && pheromonesDrawingModeOutput)
                {
                    pheromonesDrawingModeInput.value = this.renderer.pheromonesDrawingMode;
                    pheromonesDrawingModeOutput.value = this.renderer.pheromonesDrawingMode;
                }

                if (howOftenToUpdateColorInput && howOftenToUpdateColorOutput)
                {
                    howOftenToUpdateColorInput.value = Constants.Colony.HowOftenToUpdateColor;
                    howOftenToUpdateColorOutput.value = Constants.Colony.HowOftenToUpdateColor;
                }

                window.location.href = "#shadowGraphics";
            });
        }

        if (closeGraphicsButton)
        {
            closeGraphicsButton.addEventListener("click", () =>
            {
                this.modalWindowMode = false;
                window.location.href = "#";
            });
        }

        if (saveGraphicsButton)
        {
            saveGraphicsButton.addEventListener("click", () =>
            {
                this.modalWindowMode = false;

                const anthillColorInput = document.getElementById("anthillColorId");
                const antsColorInput = document.getElementById("antsColorId");
                const antsRadiusInput = document.getElementById("antsRadiusInputId");
                const pheromonesDrawingModeInput = document.getElementById("pheromonesDrawingModeInputId");
                const howOftenToUpdateColorInput = document.getElementById("howOftenToUpdateColorInputId");

                if (anthillColorInput)
                {
                    this.anthill.color = anthillColorInput.value;
                    this.renderer.markChanged();
                }

                if (antsColorInput)
                {
                    this.renderer.setAntsColor(antsColorInput.value);
                }

                if (antsRadiusInput)
                {
                    this.renderer.setAntsRadius(parseInt(antsRadiusInput.value, 10));
                }

                if (pheromonesDrawingModeInput)
                {
                    this.renderer.setPheromonesDrawingMode(parseInt(pheromonesDrawingModeInput.value, 10));
                }

                if (howOftenToUpdateColorInput)
                {
                    Constants.Colony.HowOftenToUpdateColor = parseInt(howOftenToUpdateColorInput.value, 10);
                }

                window.location.href = "#";
            });
        }
    }

    handleFoodSourceSelection(e)
    {
        if (this.modalWindowMode || e.buttons !== 0 || this.drawingMode !== DrawingMode.LARGE_FOOD)
        {
            return;
        }

        const x = e.offsetX;
        const y = e.offsetY;

        if (x < 0 || y < 0 || x >= this.mainCanvas.width || y >= this.mainCanvas.height)
        {
            return;
        }

        for (let i = 0; i < this.foodSources.length; i++)
        {
            const foodSource = this.foodSources[i];
            const dx = x - foodSource.x;
            const dy = y - foodSource.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= foodSource.radius)
            {
                this.activeFoodSourceId = foodSource.id;
                return;
            }
        }

        this.activeFoodSourceId = null;
    }

    findFoodSourceById(id)
    {
        for (let i = 0; i < this.foodSources.length; i++)
        {
            if (this.foodSources[i].id === id)
            {
                return this.foodSources[i];
            }
        }
        return null;
    }

    handleCanvasClick(e)
    {
        if (this.modalWindowMode)
        {
            return;
        }

        const x = e.offsetX;
        const y = e.offsetY;

        if (x < 0 || y < 0 || x >= this.mainCanvas.width || y >= this.mainCanvas.height)
        {
            return;
        }

        switch (this.drawingMode)
        {
            case DrawingMode.ANTHILL:
                if (!this.anthill.isBuilt)
                {
                    if (this.canPlaceAnthillAt(x, y))
                    {
                        this.anthill.build(x, y);
                        this.renderer.markChanged();
                    }
                }
                break;

            case DrawingMode.LARGE_FOOD:
                if (this.canPlaceFoodSourceAt(x, y))
                {
                    this.addFoodSource(x, y);
                    this.renderer.markChanged();
                }
                break;

            default:
                this.handleCanvasMove(e);
                break;
        }
    }

    handleCanvasMove(e)
    {
        if (this.modalWindowMode || e.buttons !== 1)
        {
            return;
        }

        const x = e.offsetX;
        const y = e.offsetY;

        if (x < 0 || y < 0 || x >= this.mainCanvas.width || y >= this.mainCanvas.height)
        {
            return;
        }

        switch (this.drawingMode)
        {
            case DrawingMode.WALL:
                this.grid.addWall(x, y, this.brushWidth);
                this.renderer.markChanged();
                break;

            case DrawingMode.ERASE:
                for (let i = this.foodSources.length - 1; i >= 0; i--)
                {
                    const foodSource = this.foodSources[i];
                    const dx = x - foodSource.x;
                    const dy = y - foodSource.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance <= foodSource.radius + this.brushWidth)
                    {
                        this.removeFoodSource(i);
                        if (this.activeFoodSourceId === foodSource.id)
                        {
                            this.activeFoodSourceId = null;
                        }
                    }
                }

                this.grid.eraseAt(x, y, this.brushWidth);
                this.renderer.markChanged();
                break;
        }
    }

    canPlaceFoodSourceAt(x, y)
    {
        const radius = 30;
        const minDistance = radius * 2;
        if (x < minDistance || y < minDistance ||
            x > this.mainCanvas.width - minDistance ||
            y > this.mainCanvas.height - minDistance)
        {
            return false;
        }

        if (this.anthill.isBuilt)
        {
            const dx = x - this.anthill.x;
            const dy = y - this.anthill.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.anthill.radius + radius)
            {
                return false;
            }
        }

        for (const foodSource of this.foodSources)
        {
            const dx = x - foodSource.x;
            const dy = y - foodSource.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < foodSource.radius + radius)
            {
                return false;
            }
        }

        const i1 = Math.floor((x - radius) / this.grid.pixelScale);
        const j1 = Math.floor((y - radius) / this.grid.pixelScale);
        const i2 = Math.floor((x + radius) / this.grid.pixelScale);
        const j2 = Math.floor((y + radius) / this.grid.pixelScale);

        for (let i = Math.max(0, i1); i <= Math.min(this.grid.mainObjects.length - 1, i2); i++)
        {
            for (let j = Math.max(0, j1); j <= Math.min(this.grid.mainObjects[i].length - 1, j2); j++)
            {
                if (this.grid.mainObjects[i][j].notEmpty && this.grid.mainObjects[i][j].wall)
                {
                    return false;
                }
            }
        }

        return true;
    }

    addFoodSource(x, y)
    {

        const foodNutritionInput = document.getElementById("foodNutrition");

        if (foodNutritionInput && foodNutritionOutput)
        {
            const radius = 30;
            const nutrition = parseInt(foodNutritionInput.value, 10);
            const id = Date.now();
            const foodSource = {
                id: id,
                x: x,
                y: y,
                radius: radius,
                nutrition: nutrition,
                initialNutrition: nutrition
            };

            this.foodSources.push(foodSource);
            this.activeFoodSourceId = id;

            this.updateFoodSourceInGrid(foodSource);
        }
    }

    removeFoodSource(index)
    {
        const foodSource = this.foodSources[index];

        this.clearFoodSourceFromGrid(foodSource);

        this.foodSources.splice(index, 1);
        this.renderer.markChanged();
    }

    updateFoodSourceInGrid(foodSource)
    {
        const x = foodSource.x;
        const y = foodSource.y;
        const radius = foodSource.radius;

        const i1 = Math.floor((x - radius) / this.grid.pixelScale);
        const j1 = Math.floor((y - radius) / this.grid.pixelScale);
        const i2 = Math.floor((x + radius) / this.grid.pixelScale);
        const j2 = Math.floor((y + radius) / this.grid.pixelScale);

        for (let i = Math.max(0, i1); i <= Math.min(this.grid.mainObjects.length - 1, i2); i++)
        {
            for (let j = Math.max(0, j1); j <= Math.min(this.grid.mainObjects[i].length - 1, j2); j++)
            {
                const centerX = (i + 0.5) * this.grid.pixelScale;
                const centerY = (j + 0.5) * this.grid.pixelScale;
                const dx = centerX - x;
                const dy = centerY - y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance <= radius)
                {
                    this.grid.mainObjects[i][j] = {
                        type: "large_food",
                        notEmpty: true,
                        nutrition: foodSource.nutrition,
                        unlimited: this.infiniteFoodSources,
                        sourceId: foodSource.id,
                        x: i * this.grid.pixelScale,
                        y: j * this.grid.pixelScale
                    };
                }
            }
        }
    }

    clearFoodSourceFromGrid(foodSource)
    {
        const x = foodSource.x;
        const y = foodSource.y;
        const radius = foodSource.radius;

        const i1 = Math.floor((x - radius) / this.grid.pixelScale);
        const j1 = Math.floor((y - radius) / this.grid.pixelScale);
        const i2 = Math.floor((x + radius) / this.grid.pixelScale);
        const j2 = Math.floor((y + radius) / this.grid.pixelScale);

        for (let i = Math.max(0, i1); i <= Math.min(this.grid.mainObjects.length - 1, i2); i++)
        {
            for (let j = Math.max(0, j1); j <= Math.min(this.grid.mainObjects[i].length - 1, j2); j++)
            {
                if (this.grid.mainObjects[i][j].sourceId === foodSource.id)
                {
                    this.grid.mainObjects[i][j] = {
                        notEmpty: false,
                        wall: false,
                        food: 0,
                        type: null,
                        x: i * this.grid.pixelScale,
                        y: j * this.grid.pixelScale
                    };
                }
            }
        }
    }

    updateFoodSourceNutrition(id, nutrition)
    {
        const foodSource = this.findFoodSourceById(id);
        if (!foodSource)
        {
            return;
        }

        foodSource.nutrition = nutrition;

        const x = foodSource.x;
        const y = foodSource.y;
        const radius = foodSource.radius;

        const i1 = Math.floor((x - radius) / this.grid.pixelScale);
        const j1 = Math.floor((y - radius) / this.grid.pixelScale);
        const i2 = Math.floor((x + radius) / this.grid.pixelScale);
        const j2 = Math.floor((y + radius) / this.grid.pixelScale);

        for (let i = Math.max(0, i1); i <= Math.min(this.grid.mainObjects.length - 1, i2); i++)
        {
            for (let j = Math.max(0, j1); j <= Math.min(this.grid.mainObjects[i].length - 1, j2); j++)
            {
                if (this.grid.mainObjects[i][j].sourceId === id)
                {
                    this.grid.mainObjects[i][j].nutrition = nutrition;
                }
            }
        }

        this.renderer.markChanged();
    }

    canPlaceAnthillAt(x, y)
    {
        const minDistance = this.anthill.radius * 2;
        if (x < minDistance || y < minDistance ||
            x > this.mainCanvas.width - minDistance ||
            y > this.mainCanvas.height - minDistance)
        {
            return false;
        }

        for (const foodSource of this.foodSources)
        {
            const dx = x - foodSource.x;
            const dy = y - foodSource.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.anthill.radius + foodSource.radius)
            {
                return false;
            }
        }

        const radius = this.anthill.radius;
        const i1 = Math.floor((x - radius) / this.grid.pixelScale);
        const j1 = Math.floor((y - radius) / this.grid.pixelScale);
        const i2 = Math.floor((x + radius) / this.grid.pixelScale);
        const j2 = Math.floor((y + radius) / this.grid.pixelScale);

        for (let i = Math.max(0, i1); i <= Math.min(this.grid.mainObjects.length - 1, i2); i++)
        {
            for (let j = Math.max(0, j1); j <= Math.min(this.grid.mainObjects[i].length - 1, j2); j++)
            {
                if (this.grid.mainObjects[i][j].notEmpty)
                {
                    return false;
                }
            }
        }

        return true;
    }

    start()
    {
        if (this.animationId === null)
        {
            this.paused = false;
            this.animationId = requestAnimationFrame(this.animate.bind(this));

            window.renderer = this.renderer;

            window.allAnts = this.anthill.ants;

            window.anthill = this.anthill;
            window.foodSources = this.foodSources;
            window.colonySimulation = this;
        }
    }

    animate()
    {
        if (this.paused || this.modalWindowMode)
        {
            this.animationId = requestAnimationFrame(this.animate.bind(this));
            return;
        }

        if (this.iteration % Constants.Colony.HowOftenToRedrawPheromones === 0)
        {
            this.grid.updatePheromones();
        }

        this.anthill.updateAnts(this.grid);

        if (this.driveMode && this.iteration % Constants.Colony.HowOftenToUpdateColor === 0)
        {
            this.updateColorInDriveMode();
        }

        this.renderer.render(this.grid, this.anthill, this.foodSources);

        this.iteration = (this.iteration + 1) % 1000000;
        this.animationId = requestAnimationFrame(this.animate.bind(this));
    }

    stop()
    {
        if (this.animationId)
        {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    reset()
    {
        this.grid.reset();
        this.anthill.reset();

        this.removeAllFoodSources();

        this.renderer.markChanged();
        this.renderer.clear();
    }

    pause()
    {
        this.paused = true;
    }

    resume()
    {
        this.paused = false;
    }

    toggleDriveMode()
    {
        this.driveMode = !this.driveMode;

        const audioElement = document.getElementById("myAudioId");

        if (this.driveMode && audioElement)
        {
            audioElement.play();

            document.getElementById("wave1").style.display = "flex";
            document.getElementById("wave2").style.display = "flex";
            document.getElementById("wave3").style.display = "flex";
        }
        else if (audioElement)
        {
            audioElement.pause();
            audioElement.currentTime = 0;

            document.getElementById("wave1").style.display = "none";
            document.getElementById("wave2").style.display = "none";
            document.getElementById("wave3").style.display = "none";
        }
    }

    updateColorInDriveMode()
    {
        let color = this.renderer.antsColor;

        if (color.startsWith("#"))
        {
            color = color.slice(1);
        }

        let colorValue = parseInt(color, 16);

        if (colorValue >= 0xeeeeee)
        {
            this.antsColorIsGrowing = false;
        }
        else if (colorValue <= 0x111111)
        {
            this.antsColorIsGrowing = true;
        }

        if (this.antsColorIsGrowing)
        {
            colorValue += 74565;
        }
        else
        {
            colorValue -= 74565;
        }

        this.renderer.setAntsColor("#" + colorValue.toString(16).padStart(6, "0"));
    }

    resize(width, height)
    {
        this.mainCanvas.width = width;
        this.mainCanvas.height = height;
        this.mainObjectsCanvas.width = width;
        this.mainObjectsCanvas.height = height;
        this.pheromonesCanvas.width = width;
        this.pheromonesCanvas.height = height;

        this.grid.resize(width, height);

        this.renderer.markChanged();
    }

    updateAllFoodSources()
    {
        for (const foodSource of this.foodSources)
        {
            this.updateFoodSourceInGrid(foodSource);
        }
        this.renderer.markChanged();
    }

    decreaseFoodSourceNutrition(sourceId, amount)
    {
        if (this.infiniteFoodSources)
        {
            return;
        }
        const foodSource = this.findFoodSourceById(sourceId);
        if (!foodSource)
        {
            return;
        }

        foodSource.nutrition = Math.max(0, foodSource.nutrition - amount);

        this.updateFoodNutritionInGrid(foodSource);

        if (foodSource.nutrition <= 0)
        {
            const index = this.foodSources.findIndex(fs => fs.id === sourceId);
            if (index >= 0)
            {
                this.removeFoodSource(index);
                if (this.activeFoodSourceId === sourceId)
                {
                    this.activeFoodSourceId = null;
                }
            }
        }
        else
        {
            this.renderer.markChanged();
        }
    }

    updateFoodNutritionInGrid(foodSource)
    {
        const x = foodSource.x;
        const y = foodSource.y;
        const radius = foodSource.radius;

        const i1 = Math.floor((x - radius) / this.grid.pixelScale);
        const j1 = Math.floor((y - radius) / this.grid.pixelScale);
        const i2 = Math.floor((x + radius) / this.grid.pixelScale);
        const j2 = Math.floor((y + radius) / this.grid.pixelScale);

        for (let i = Math.max(0, i1); i <= Math.min(this.grid.mainObjects.length - 1, i2); i++)
        {
            for (let j = Math.max(0, j1); j <= Math.min(this.grid.mainObjects[i].length - 1, j2); j++)
            {
                if (this.grid.mainObjects[i][j].sourceId === foodSource.id)
                {
                    this.grid.mainObjects[i][j].nutrition = foodSource.nutrition;
                }
            }
        }
    }

    removeAllFoodSources()
    {
        for (let i = this.foodSources.length - 1; i >= 0; i--)
        {
            this.removeFoodSource(i);
        }
        this.activeFoodSourceId = null;
    }
}

export default ColonySimulation; 