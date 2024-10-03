import Draggable from "./Draggable.js";
import p5 from "p5";
import { getDrawingCanvas, getMenu } from "../sketch.js";
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
    SbD: boolean = false;
    hidden: boolean = false; 

    constructor(title: string, information: string, pos: p5.Vector,p: p5=getDrawingCanvas()){ 
        super(pos, 120,p);
        this.title = title;
        this.information = information;
        this.coord = pos;
        this.severity = Severity.LOW;
        this.children = new Array<Node>();
        this.internalResizeNode();
    }

    public setNodeManager(nodeManager: NodeManager){
        this.nodeManager = nodeManager;
    }

    private internalResizeNode() {
        this.p.textSize(32);
        // Get the width of the text
        const textWidth = this.p.textWidth(this.title);
    
        // Set a base size and adjust it based on the text width
        const padding = 20; // Add some padding
        this.radius = textWidth + padding;
    
        // Ensure the node is at least a certain size
        const minSize = 50;
        this.radius = Math.max(this.radius, minSize);
    }

    public setSbDStatus(){
        this.SbD = true;
    }

    public unsetSbDStatus(){
        this.SbD = false;
    }

    public isSelected(){
        return this.selected > 0;
    }

    public unselect(){
        this.selected--;
        this.selected = Math.max(this.selected,0);
        if (this.selected == 0)
            this.nodeManager.unselectNode(this);
        for (let child of this.children){
            child.unselect();
        }
    }

    public select(){
        this.selected++;
        this.nodeManager.selectNode(this);
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
        if (this.SbD){
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

        this.children = this.children.filter(child => {
            if (child.deleted()) {
                return false; // Exclude this child from the array
            }
            
            if (!this.hidden)
                Node.connectNodes(this, child);
            this.drawn = 1;
            
            if (child.drawn >= 1) {
                return true; // Keep the child in the array
            }
            
            child.draw();
            return true; // Keep the child in the array
        });

        if (this.nodeManager.currentParentNode == this && this.nodeManager.isAddingChild && this.nodeManager.currentChildLine) {
            this.p.push();
            this.p.stroke(120, 255, 255); // Green line
            this.p.strokeWeight(this.isSelected() ? 9 : 5);
            this.p.line(this.nodeManager.currentChildLine.startX, this.nodeManager.currentChildLine.startY, this.p.transformedMouseX, this.p.transformedMouseY);
            this.p.pop();
        }
        

        this.p.push();

        this.p.translate(this.coord.x, this.coord.y);

        if (this.isHidden()) {
            this.p.fill(255,0,32,20);
            let col = Node.getSeverityColor(this.severity);
            col.setAlpha(0);
            this.p.stroke(col);
        } else {
            this.p.fill(255,0,75)
            this.p.stroke(Node.getSeverityColor(this.severity));
        }

        if (this.isSelected()){
            this.p.strokeWeight(10);
            if (this.hidden)
                this.p.stroke(200,100,100);
            else
                this.p.stroke(300,100,100);
        } else
            this.p.strokeWeight(6);

       
        
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

        if (this.nodeManager.isAddingChild) {
            if (!this.SbD && !this.nodeManager.currentParentNode.children.includes(this)) {
                // Connect this node as a child
                this.nodeManager.currentParentNode.addChild(this);
                this.nodeManager.isAddingChild = false;
                this.nodeManager.currentChildLine = null;  // Reset the line
                this.nodeManager.currentParentNode = null; // Reset the parent
            }
            return true;
        }
        
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
            getMenu().updateSearchIndex(this);
            this.internalResizeNode();
        }
    }

    /**
     * 
     * @returns The information of the node.
     * TODO: This is buggy and incorrect. Needs to be fixed.
     */
    public info() {
        console.log(this.p.transformedMouseX, this.p.transformedMouseY, this.coord.x, this.coord.y);
        const ephemeralWindow = document.createElement('div');
        ephemeralWindow.id = 'ephemeral-window';
        ephemeralWindow.innerHTML = `<strong>${this.title}</strong><br>${this.information}`;
        
        // Add the window to the body
        document.body.appendChild(ephemeralWindow);
        
        // Position the window near the node (this.coord)
        const posX = this.p.mouseX; // Adjust these to fit your needs
        const posY = this.p.mouseY;
        
        ephemeralWindow.style.left = `${posX}px`;
        ephemeralWindow.style.top = `${posY}px`;
        // Show the window
        setTimeout(() => {
            ephemeralWindow.classList.add('show');
        }, 10); // Slight delay to trigger the transition
    
        // Hide the window after ? seconds or on user click (ideally on user click?)
        setTimeout(() => {
            ephemeralWindow.classList.remove('show');
            setTimeout(() => ephemeralWindow.remove(), 300); // Wait for the transition to complete before removing
        }, 30000);
    
        // Optional: Close on click
        ephemeralWindow.addEventListener('click', () => {
            ephemeralWindow.classList.remove('show');
            setTimeout(() => ephemeralWindow.remove(), 300);
        });

        console.log(this.information);
        return this.information
    }

    /**
     * Draw a line from the node to the cursor until a child is added.
     */
    startAddingChild() { // Maybe this is better as a method in NodeManager?
        this.nodeManager.isAddingChild = true;
        this.nodeManager.currentChildLine = { startX: this.coord.x, startY: this.coord.y };
        this.nodeManager.currentParentNode = this;
    }

    public hideNode() {
        this.hidden = true;
    }

    // New method to show the node
    public showNode() {
        this.hidden = false;
    }
    
    public isHidden() {
        return this.hidden;
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
            { label: "Center on this", action: this.center.bind(this), icon: "uil uil-crosshair" },
        { 
            label: "Delete Node", 
            action: () => this.nodeManager.deleteNode(this), // Use an anonymous function to preserve context
            icon: "uil uil-trash-alt" 
        },
        {
            label: this.hidden ? "Show" : "Hide",
            action: this.hidden ? this.showNode.bind(this) : this.hideNode.bind(this),
            icon: this.hidden ? "uil uil-eye" : "uil uil-eye-slash"
        },
        {
            label: "Add Child", 
            action: this.startAddingChild.bind(this),  // Call a function to start adding a child
            icon: "uil uil-plus-circle"
        }
        ]);
    }
}
