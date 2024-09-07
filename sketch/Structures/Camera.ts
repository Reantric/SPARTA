export class Camera {
    private pos: p5.Vector;
    private scaleFactor: number;
    private p: p5;

    constructor(p: p5) {
        this.p = p;
        this.pos = this.p.createVector(0, 0);
        this.scaleFactor = 1;
    }

    public getPosition() {
        return this.pos;
    }

    public setPosition(x: number, y: number) {
        this.pos.x = x;
        this.pos.y = y;
    }

    pan(dx: number, dy: number) {
        this.pos.x += dx;
        this.pos.y += dy;
    }

    zoom(factor: number, centerX: number, centerY: number) {
        const newZoomLevel = this.scaleFactor * factor;

        // Adjust the camera position based on the zoom factor and center of zoom
        this.pos.x = centerX - (centerX - this.pos.x) * factor;
        this.pos.y = centerY - (centerY - this.pos.y) * factor;

        this.scaleFactor = newZoomLevel;
    }

    setZoom(zoomLevel: number) {
        this.scaleFactor = zoomLevel;
    }

    applyTransformations() {
        this.p.translate(this.pos.x, this.pos.y);
        this.p.scale(this.scaleFactor);
    }

    reset() {
        this.pos.x = 0;
        this.pos.y = 0;
        this.scaleFactor = 1;
    }

    getScale() {
        return this.scaleFactor;
    }
}
