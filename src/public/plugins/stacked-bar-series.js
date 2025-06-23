// stacked-bar-series.js
class StackedBarSeriesPaneView {
    constructor(options) {
        this._data = [];
        this._options = options;
    }

    update(data) {
        this._data = data;
    }

    renderer() {
        return {
            draw: (ctx, pixelRatio, isHovered) => {
                ctx.scale(pixelRatio, pixelRatio);
                
                this._data.forEach(item => {
                    const x = item.time;
                    const totalHeight = item.asistencia + item.falta + item.retardo;
                    
                    // Dibujar retardo (naranja)
                    ctx.fillStyle = this._options.colors.retardo;
                    ctx.fillRect(x - 10, 0, 20, item.retardo);
                    
                    // Dibujar falta (rojo)
                    ctx.fillStyle = this._options.colors.falta;
                    ctx.fillRect(x - 10, item.retardo, 20, item.falta);
                    
                    // Dibujar asistencia (verde)
                    ctx.fillStyle = this._options.colors.asistencia;
                    ctx.fillRect(x - 10, item.retardo + item.falta, 20, item.asistencia);
                });
            }
        };
    }
}

class StackedBarSeries {
    constructor(options) {
        this._options = options;
    }

    paneView() {
        return new StackedBarSeriesPaneView(this._options);
    }
}