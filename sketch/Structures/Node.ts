export enum Severity {
    NONE = 0,
    LOW = 2,
    MEDIUM = 5,
    HIGH = 8,
    CRITICAL = 10
}


export class Node {
    information: string;
    title: string;
    coord: p5.Vector;
    severity: number;
    children: Node[];
    drawn: number = 0;
    selected: number = 0;

    radius: number = 120;


    constructor(title: string, information: string, pos: p5.Vector){ 
        this.title = title;
        this.information = information;
        this.coord = pos;
        this.severity = Severity.LOW;

        this.children = new Array<Node>();
    }

    private internalResizeNode(){
        
    }

    public isSelected(){
        return this.selected > 0;
    }

    public unselect(){
        this.selected--;
        for (let child of this.children){
            child.unselect();
        }
    }

    public select(){
        this.selected++;
        for (let child of this.children){
            child.select();
        }
    }

    private static connectNodes(Node1: Node, Node2: Node) {
        push();
        stroke(255, 0, 100); // cyan color

        if (Node1.isSelected()){
            strokeWeight(9);
            stroke(60,100,100);
        } else
            strokeWeight(5);

        // Calculate the top center of Node1
        let startX = Node1.coord.x;
        let startY = Node1.coord.y;

        // Calculate the bottom center of Node2
        let endX = Node2.coord.x;
        let endY = Node2.coord.y;

        // Draw the line
        line(startX, startY, endX, endY);
        pop();
    }

    private static getSeverityColor(severity: number): p5.Color {
        if (severity == Severity.NONE){
            return color(0, 0, 35);
        }
        let cyan = color(180, 66, 59);
        let green = color(120, 66, 59);
        let yellow = color(60, 66, 59);
        let red = color(0, 66, 39);
        let purple = color(270, 66, 59);
        
        if (severity < Severity.LOW) {
            return cyan;
        } else if (severity < Severity.MEDIUM) {
           return green;
        } else if (severity < Severity.HIGH) {
            return yellow;
        } else if (severity < Severity.CRITICAL) {
            return red;
        } else {
            return purple;
        }
    }

    public setSeverity(severity: number){
        this.severity = severity;
    }

    private label(){
        if (this.title.startsWith("SbD")){
            textSize(28);
            text(this.title, 0, -2);
            noStroke();
            fill(255,100,100);
            textSize(25);
            text(`(${this.severity})`, 0, 32);
        } else {   
            textSize(32);
            text(this.title, 0, 10); 
        }
    }

    public draw(){
      //  if (this.drawn >= 1){ // possibly undraw later?
       //     return;
     //   }

        for (let child of this.children){
            Node.connectNodes(this, child);
            this.drawn = 1;
            if (child.drawn >= 1)
                continue;
            child.draw();
        }

        push();

        translate(this.coord.x, this.coord.y);
        fill(255);

        stroke(Node.getSeverityColor(this.severity));

        if (this.isSelected()){
            strokeWeight(10);
            stroke(300,100,100);
        } else
            strokeWeight(6);

       
        fill(255,0,75)
        ellipse(0, 0, this.radius, this.radius);
        fill(0);
        noStroke();
        this.label();

        pop();
        
    }

    public addChild(child: Node){
        this.children.push(child);
    }

    public handleMouseClick(){
        if (!this.isMouseOver()){
            return;
        }
        
        if (!this.isSelected()){
            this.select();
        } else
            this.unselect();
    }

    private isMouseOver() {
        let d = dist(mouseX-windowWidth/2,mouseY-windowHeight/2, this.coord.x, this.coord.y);
        return d < this.radius / 2;
    }

}
