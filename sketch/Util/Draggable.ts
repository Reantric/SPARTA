
export default class Draggable {
    coord: p5.Vector;
    radius: number;
    dragging: boolean = false;
    rollover: boolean = false;
    offset: p5.Vector

    constructor(pos: p5.Vector, radius: number) {
        this.coord = pos;
        this.radius = radius;
        this.offset = createVector(0, 0);
    }

    public isMouseOver() {
        // Is mouse over the circle
        let d = dist(mouseX - windowWidth/2,mouseY-windowHeight/2, this.coord.x, this.coord.y);
        this.rollover = d < 0.5*this.radius;
    }
    

    drag() {
        // If the object is pressed, drag it
        this.isMouseOver();
        this.update();
        stroke(0);
        // Different fill based on state
        if (this.dragging) {
            fill(50);
        } else if (this.rollover) {
            fill(75);
        } else {
            fill(100);
        }
        
    }

    draw(){
        this.drag();
        ellipse(this.coord.x , this.coord.y, this.radius);
    }

    update() {

        // Adjust location if being dragged
        if (this.dragging) {
          this.coord.x = mouseX-windowWidth/2 + this.offset.x;
          this.coord.y = mouseY-windowHeight/2 + this.offset.y;
        }
    
      }

    handleMousePress() {
        // Did I click on the circle?
        let d = dist(mouseX-windowWidth/2, mouseY-windowHeight/2, this.coord.x, this.coord.y);
        if (d < this.radius) {
            this.dragging = true;
            // If so, keep track of relative location of click to center of circle
            this.offset.x = this.coord.x - (mouseX-windowWidth/2);
            this.offset.y = this.coord.y - (mouseY-windowHeight/2);
        }
    }

    released() {
        // Quit dragging
        this.dragging = false;
      }
}
