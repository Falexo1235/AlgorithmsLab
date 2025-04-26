import {NeuralNetwork} from "./neuralNetwork.js";

class CanvasPainter extends EventTarget
{
    constructor()
    {
        super();
        
        this.initializeProperties();
        this.setupCanvas();
        this.initializeEventListeners();
    }

    initializeProperties()
    {
        this.canvas = document.getElementById("mainCanvas");
        this.context = this.canvas.getContext("2d", {
            willReadFrequently: true,
            imageSmoothingEnabled: false
        });

        this.gridCanvas = document.getElementById("gridCanvas");
        this.gridContext = this.gridCanvas.getContext("2d", {
            imageSmoothingEnabled: false
        });

        this.gridSize = 50;                 this.neuralInputSize = 28;          this.cellSize = 15;
        this.size = this.gridSize * this.cellSize;
        this.paintSize = 3;
        this.gridLineColor = "lightgray";
        this.gridLineWidth = 1;

        this.isDrawing = false;
        this.isErasing = false;
        
        this.updatedEvent = new Event("updated")
    }

    setupCanvas()
    {
        this.canvas.width = this.size;
        this.canvas.height = this.size;

        this.gridCanvas.width = this.size;
        this.gridCanvas.height = this.size;

        this.drawGrid();
        this.fillCanvas();
    }

    initializeEventListeners()
    {
        this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
        this.canvas.addEventListener("mouseup", this.handleMouseUp.bind(this));
        this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));

        document.getElementById("clear").addEventListener("click", this.handleClear.bind(this));
        document.getElementById("eraser").addEventListener("click", this.handleEraser.bind(this));
        document.getElementById("pen").addEventListener("click", this.handlePen.bind(this));
    }

    handleMouseDown(event)
    {
        this.isDrawing = true;
        this.draw(event);
    }

    handleMouseUp()
    {
        this.isDrawing = false;
    }

    handleMouseMove(event)
    {
        if (this.isDrawing)
        {
            this.draw(event);
        }
    }

    handleClear()
    {
        this.clear();
    }

    handleEraser()
    {
        this.isErasing = true;
    }

    handlePen()
    {
        this.isErasing = false;
    }

    draw(event)
    {
        const color = this.isErasing ? "white" : "black";
        const coordinates = this.getGridCoordinates(event);
        
        this.fillCell(coordinates.x, coordinates.y, color);
        
        this.dispatchEvent(this.updatedEvent);
    }

    getGridCoordinates(event)
    {
        const rect = this.canvas.getBoundingClientRect();
        const canvasX = (event.clientX - rect.x) * (this.canvas.width / rect.width);
        const canvasY = (event.clientY - rect.y) * (this.canvas.height / rect.height);

        return {
            x: Math.floor(canvasX / this.cellSize),
            y: Math.floor(canvasY / this.cellSize)
        };
    }

    fillCell(x, y, color)
    {
        this.context.fillStyle = color;
        this.context.fillRect(
            x * this.cellSize - this.cellSize,
            y * this.cellSize - this.cellSize,
            this.cellSize * this.paintSize,
            this.cellSize * this.paintSize
        );
    }

    drawGrid()
    {
        this.gridContext.fillStyle = this.gridLineColor;

        for (let i = 1; i < this.gridSize; i++)
        {
            const y = i * this.cellSize;
            this.gridContext.fillRect(0, y, this.size, this.gridLineWidth);
        }

        for (let i = 1; i < this.gridSize; i++)
        {
            const x = i * this.cellSize;
            this.gridContext.fillRect(x, 0, this.gridLineWidth, this.size);
        }
    }

    fillCanvas()
    {
        this.context.fillStyle = "white";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.fillStyle = undefined;
    }

    clear()
    {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.fillCanvas();
        
        this.dispatchEvent(this.updatedEvent);
    }

    getImageData()
    {
                const originalGrid = new Array(this.gridSize);
        for (let i = 0; i < this.gridSize; i++) {
            originalGrid[i] = new Array(this.gridSize).fill(0);
        }
        
        const canvasData = this.context.getImageData(0, 0, this.size, this.size).data;
        const cellPixelCount = (this.cellSize ** 2) * 3;         
                for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                let sum = 0;

                for (let y = i * this.cellSize; y < (i + 1) * this.cellSize; y++) {
                    for (let x = j * this.cellSize; x < (j + 1) * this.cellSize; x++) {
                        const index = (y * this.size + x) * 4;
                        
                        sum += canvasData[index];
                        sum += canvasData[index + 1];
                        sum += canvasData[index + 2];
                    }
                }

                const average = sum / cellPixelCount;
                const value = 255 - average;
                
                originalGrid[i][j] = value;
            }
        }
        
                const scaledGrid = new Array(this.neuralInputSize);
        for (let i = 0; i < this.neuralInputSize; i++) {
            scaledGrid[i] = new Array(this.neuralInputSize).fill(0);
        }
        
        const scaleRatio = this.gridSize / this.neuralInputSize;
        
        for (let i = 0; i < this.neuralInputSize; i++) {
            for (let j = 0; j < this.neuralInputSize; j++) {
                let sum = 0;
                let count = 0;
                
                                const startY = Math.floor(i * scaleRatio);
                const endY = Math.floor((i + 1) * scaleRatio);
                const startX = Math.floor(j * scaleRatio);
                const endX = Math.floor((j + 1) * scaleRatio);
                
                                for (let y = startY; y < endY; y++) {
                    for (let x = startX; x < endX; x++) {
                        if (y < this.gridSize && x < this.gridSize) {
                            sum += originalGrid[y][x];
                            count++;
                        }
                    }
                }
                
                                const average = count > 0 ? sum / count : 0;
                scaledGrid[i][j] = average;
            }
        }
        
                        let minX = this.neuralInputSize;
        let minY = this.neuralInputSize;
        let maxX = 0;
        let maxY = 0;
        let hasContent = false;
        
        for (let i = 0; i < this.neuralInputSize; i++) {
            for (let j = 0; j < this.neuralInputSize; j++) {
                if (scaledGrid[i][j] > 20) {                     hasContent = true;
                    minX = Math.min(minX, j);
                    minY = Math.min(minY, i);
                    maxX = Math.max(maxX, j);
                    maxY = Math.max(maxY, i);
                }
            }
        }
        
                if (!hasContent) {
            return new Array(this.neuralInputSize * this.neuralInputSize).fill(0);
        }
        
                const width = maxX - minX + 1;
        const height = maxY - minY + 1;
        const centerX = Math.floor(this.neuralInputSize / 2);
        const centerY = Math.floor(this.neuralInputSize / 2);
        
        const offsetX = centerX - Math.floor((minX + maxX) / 2);
        const offsetY = centerY - Math.floor((minY + maxY) / 2);
        
                const finalGrid = new Array(this.neuralInputSize * this.neuralInputSize).fill(0);
        
        for (let i = minY; i <= maxY; i++) {
            for (let j = minX; j <= maxX; j++) {
                const newY = i + offsetY;
                const newX = j + offsetX;
                
                                if (newY >= 0 && newY < this.neuralInputSize && newX >= 0 && newX < this.neuralInputSize) {
                    finalGrid[(this.neuralInputSize * newY) + newX] = scaledGrid[i][j];
                }
            }
        }
        
        return finalGrid;
    }
}

const painter = new CanvasPainter();

const inputNodes = 784; const hiddenNodes = Math.round(inputNodes / 20);
const outputNodes = 10;

const network = new NeuralNetwork(inputNodes, hiddenNodes, outputNodes);

await network.importWeights("../data/weights.json");

painter.addEventListener("updated", () =>
{
    const result = network.query(painter.getImageData());
    
        result.forEach((confidence, digit) => {
        const percentage = Math.round(confidence * 100);
        const sliderFill = document.getElementById(`confidence-${digit}`);
        const valueDisplay = document.getElementById(`value-${digit}`);
        
        sliderFill.style.width = `${percentage}%`;
        valueDisplay.innerText = `${percentage}%`;
    });
});