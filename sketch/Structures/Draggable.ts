import { getDrawingCanvas } from '../sketch.js';
import p5 from "p5";
import { ContextMenu } from './ContextMenu.js';
export default abstract class Draggable {
    coord: p5.Vector;
    radius: number;
    dragging: boolean = false;
    rollover: boolean = false;
    offset: p5.Vector
    p: p5;
    contextMenu: ContextMenu; // New field for the context menu
    isDeleted: boolean = false;
    static isDraggingNode: boolean = false; // New static flag to track if a node is being dragged

    constructor(pos: p5.Vector, radius: number, p: p5 = getDrawingCanvas()) {
        this.p = p;
        this.coord = pos;
        this.radius = radius;
        this.offset = this.p.createVector(0, 0);
        this.contextMenu = new ContextMenu(); // Initialize context menu
    }

    public isMouseOver() {
        // Is mouse over the circle
        let d = this.p.dist(this.p.transformedMouseX,this.p.transformedMouseY, this.coord.x, this.coord.y);
        this.rollover = d < this.radius/2;
        return this.rollover;
    }
    

    drag() {
        // If the object is pressed, drag it
        this.isMouseOver();
        this.update();
        this.p.stroke(0);
        // Different fill based on state
        if (this.dragging) {
            this.p.fill(50);
        } else if (this.rollover) {
            this.p.fill(75);
        } else {
            this.p.fill(100);
        }
        
    }

    draw(){
        this.drag();
        this.p.ellipse(this.coord.x , this.coord.y, this.radius);
    }

    update() {

        // Adjust location if being dragged
        if (this.dragging) {
          this.coord.x = this.p.transformedMouseX + this.offset.x;
          this.coord.y = this.p.transformedMouseY + this.offset.y;
        }
    
      }

      handleMousePress(button: string = this.p.LEFT) {
        if (button === this.p.RIGHT) {
            if (this.isMouseOver()) {
                this.showContextMenu(this.p.transformedMouseX, this.p.transformedMouseY);
                return false; // Prevent default context menu
            }
        } else if (button === this.p.LEFT) {
            if (this.isMouseOver()) {
                Draggable.isDraggingNode = true; // Set the dragging flag
                this.dragging = true;
                this.offset.x = this.coord.x - this.p.transformedMouseX;
                this.offset.y = this.coord.y - this.p.transformedMouseY;
            }
        }
        return true;
    }

    released() {
        // Quit dragging
        this.dragging = false;
        Draggable.isDraggingNode = false; // Set the dragging flag
      }
    
    /**
     * 
     * @param x x-coordinate of the context menu
     * @param y y-coordinate of the context menu
     */
    abstract showContextMenu(x: number, y: number);
    // this.contextMenu.show();
    
    /**
     * Mark the node as deleted.
     */
    public markForDeletion() {
        this.isDeleted = true;
    }

    /**
     * Check if the node is marked for deletion.
     */
    public deleted() {
        return this.isDeleted;
    }

    public center() {
        const camera = this.p.camera2D;
        const zoom = camera.getScale();
    
        // Get the node's coordinates, adjusted by the zoom factor
        const centerX = this.coord.x - (this.p.width / 2) / zoom;
        const centerY = this.coord.y - (this.p.height / 2) / zoom;
    
        // Set the camera's position, also considering the zoom
        camera.setPosition(-centerX * zoom, -centerY * zoom);
    }
}
