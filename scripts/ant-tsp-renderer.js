import { Constants } from './ant-constants.js';

class TspRenderer {
    constructor(config = {}) {
        this.canvas = config.canvas;
        this.ctx = this.canvas.getContext('2d');
        
                this.townColor = config.townColor || '#000000';
        this.townRadius = config.townRadius || Constants.TSP.TownRadius;
        this.otherEdgesOpacity = config.otherEdgesOpacity || 0.15;
        this.otherEdgesColor = config.otherEdgesColor || '#999999';
        this.otherEdgesWidth = config.otherEdgesWidth || 2;
        this.mainEdgesColor = config.mainEdgesColor || '#ffff00';
        this.mainEdgesOpacity = config.mainEdgesOpacity || 1;
        this.mainEdgesWidth = config.mainEdgesWidth || 4;
        this.resultEdgesColor = config.resultEdgesColor || '#00ff00';
        this.resultEdgesOpacity = config.resultEdgesOpacity || 1;
        this.resultEdgesWidth = config.resultEdgesWidth || 4;
    }
    
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawTowns(coordinates) {
        for (let i = 0; i < coordinates.x.length; i++) {
            this.ctx.lineCap = "round";
            this.ctx.strokeStyle = this.townColor;
            this.ctx.lineWidth = 15;
            this.ctx.beginPath();
            this.ctx.arc(coordinates.x[i], coordinates.y[i], this.townRadius, 0, Math.PI * 2, false);
            this.ctx.closePath();
            this.ctx.stroke();
        }
    }
    
    drawAllEdges(coordinates) {
        for (let i = 0; i < coordinates.x.length; i++) {
            for (let j = i + 1; j < coordinates.x.length; j++) {
                this.drawEdge(
                    coordinates.x[i], coordinates.y[i], 
                    coordinates.x[j], coordinates.y[j],
                    this.otherEdgesWidth, this.otherEdgesOpacity, this.otherEdgesColor
                );
            }
        }
    }
    
    drawEdge(x1, y1, x2, y2, width, opacity, color) {
        this.ctx.lineWidth = width;
        this.ctx.globalAlpha = opacity;
        this.ctx.strokeStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
        this.ctx.strokeStyle = 'black';
        this.ctx.globalAlpha = 1;
    }
    
    drawPath(path, coordinates, width, opacity, color) {
        for (let i = 0; i < path.length - 1; i++) {
            const from = path[i];
            const to = path[i + 1];
            this.drawEdge(
                coordinates.x[from], coordinates.y[from],
                coordinates.x[to], coordinates.y[to],
                width, opacity, color
            );
        }
    }
    
    renderInitialState(coordinates) {
        this.clear();
        this.drawTowns(coordinates);
        this.drawAllEdges(coordinates);
    }
    
    renderIteration(result, coordinates) {
        this.clear();
        this.drawTowns(coordinates);
        
                this.drawAllEdges(coordinates);
        
                if (result.currentPath) {
            this.drawPath(
                result.currentPath, 
                coordinates, 
                this.mainEdgesWidth, 
                this.mainEdgesOpacity, 
                this.mainEdgesColor
            );
        }
        
                if (result.bestPath && result.bestPath !== result.currentPath) {
            this.drawPath(
                result.bestPath, 
                coordinates, 
                this.resultEdgesWidth, 
                this.resultEdgesOpacity, 
                this.resultEdgesColor
            );
        }
    }
    
    renderFinalResult(path, coordinates) {
        this.clear();
        this.drawTowns(coordinates);
        
                this.drawAllEdges(coordinates);
        
                if (path) {
            this.drawPath(
                path, 
                coordinates, 
                this.resultEdgesWidth, 
                this.resultEdgesOpacity, 
                this.resultEdgesColor
            );
        }
    }
    
        drawTown(x, y) {
        this.ctx.lineCap = "round";
        this.ctx.strokeStyle = this.townColor;
        this.ctx.lineWidth = 15;
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.townRadius, 0, Math.PI * 2, false);
        this.ctx.closePath();
        this.ctx.stroke();
    }
}

export default TspRenderer; 