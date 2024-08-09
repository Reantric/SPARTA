import Draggable from "./Draggable.js";
import p5 from "p5";
import { getDrawingCanvas } from "../sketch.js";
import NodeManager from "./NodeManager.js";

export enum Severity {
    NONE = 0,
    LOW = 2,
    MEDIUM = 5,
    HIGH = 8,
    CRITICAL = 10
}


export class Node extends Draggable {
    information: string;
    title: string;
    severity: number;
    children: Node[];
    drawn: number = 0;
    selected: number = 0;
    selectMode: boolean = false;
    nodeManager: NodeManager;


    constructor(title: string, information: string, pos: p5.Vector,p: p5=getDrawingCanvas()){ 
        super(pos, 120,p);
        this.title = title;
        this.information = information;
        this.coord = pos;
        this.severity = Severity.LOW;
        this.children = new Array<Node>();
    }

    public setNodeManager(nodeManager: NodeManager){
        this.nodeManager = nodeManager;
    }

    private internalResizeNode(){
        
    }

    public isSelected(){
        return this.selected > 0;
    }

    public unselect(){
        this.selected--;
        this.selected = Math.max(this.selected,0);
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
        let p = getDrawingCanvas();

        p.push();
        p.stroke(255, 0, 100); // cyan color

        if (Node1.isSelected()){
            p.strokeWeight(9);
            p.stroke(60,100,100);
        } else
            p.strokeWeight(5);

        // Calculate the top center of Node1
        let startX = Node1.coord.x;
        let startY = Node1.coord.y;

        // Calculate the bottom center of Node2
        let endX = Node2.coord.x;
        let endY = Node2.coord.y;

        // Draw the line
        p.line(startX, startY, endX, endY);
        p.pop();
    }

    private static getSeverityColor(severity: number): p5.Color {
         let p = getDrawingCanvas();

        if (severity == Severity.NONE){
            return p.color(0, 0, 35);
        }
        let cyan = p.color(180, 66, 59);
        let green = p.color(120, 66, 59);
        let yellow = p.color(60, 66, 59);
        let red = p.color(0, 66, 39);
        let purple = p.color(270, 66, 59);
        
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

    public getSeverity() {
        return this.severity;
    }

    public setSeverity(severity: number){
        this.severity = severity;
    }

    private label(){
        if (this.title.startsWith("SbD")){
            this.p.textSize(28);
            this.p.text(this.title, 0, -2);
            this.p.noStroke();
            this.p.fill(255,100,100);
            this.p.textSize(25);
            this.p.text(`(${this.severity})`, 0, 32);
        } else {   
            this.p.textSize(32);
            this.p.text(this.title, 0, 10); 
        }
    }

    public draw(){
      //  if (this.drawn >= 1){ // possibly undraw later?
       //     return;
     //   }
        this.drag();

        for (let child of this.children){
            Node.connectNodes(this, child);
            this.drawn = 1;
            if (child.drawn >= 1)
                continue;
            child.draw();
        }

        this.p.push();

        this.p.translate(this.coord.x, this.coord.y);
        this.p.fill(255);

        this.p.stroke(Node.getSeverityColor(this.severity));

        if (this.isSelected()){
            this.p.strokeWeight(10);
            this.p.stroke(300,100,100);
        } else
            this.p.strokeWeight(6);

       
        this.p.fill(255,0,75)
        this.p.ellipse(0, 0, this.radius, this.radius);
        this.p.fill(0);
        this.p.noStroke();
        this.label();

        this.p.pop();
        
    }

    public addChild(child: Node){
        this.children.push(child);
    }

    public handleMousePress(button: string = this.p.LEFT){
        if (!this.isMouseOver()){
            return false;
        }
        super.handleMousePress(button);
        
        if (this.selectMode){
            if (!this.isSelected()){
                this.select();
            } else
                this.unselect();
        }
        return true;
    }

    public handleKeyPress(key: string){
        if (key == 's'){
            this.selectMode = !this.selectMode;
        }
    }

    /**
     * Edit the title of a node.
     * @param {Node} node - The node to be edited.
     */
    public editTitle() {
        const newTitle = prompt("Enter new title:", this.title);
        if (newTitle) {
            this.title = newTitle;
        }
    }

    /**
     * 
     * @returns The information of the node.
     */

    public info(){
        console.log(this.information);
        return this.information;
    }

    /**
     * 
     * @param x x-coordinate of the context menu
     * @param y y-coordinate of the context menu
     */
    showContextMenu(x: number, y: number) {
        this.contextMenu.show(x, y, [
            { label: "Edit Title", action: this.editTitle.bind(this), icon: "uil uil-edit" },
            { label: "View information", action: this.info.bind(this), icon: "uil uil-info-circle" },
        { 
            label: "Delete Node", 
            action: () => this.nodeManager.deleteNode(this), // Use an anonymous function to preserve context
            icon: "uil uil-trash-alt" 
        }
        ]);
    }

}
