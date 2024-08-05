import SetCoverer from "./SetCoverer/setCover.js";
import { Node, Severity } from "./Structures/Node.js";
import NodeManager from "./Structures/NodeManager.js";
import Draggable from "./Util/Draggable.js";
import { BELOW, findNodeWithMaxY } from "./Util/Methods.js";

declare global {
    interface Window { 
        setup: () => void;
        draw: () => void;
        // Add your new attributes here
        newAttribute1: string;
        newAttribute2: number;
        newFunction: () => void;
    }
}

let CWE: Node[] = new Array();
let SbD: Node[] = new Array();

const nodeManager = new NodeManager();

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

const universeSize = 5;
const sets = [
    [0, 1, 2], // Set {1, 2, 3}
    [3],    // Set {2, 4}
    [0 ,2 ,4],    // Set {3, 4}
    [3, 4]     // Set {4, 5}
];
const setWeights = [];

const universeNodes: Node[] = [];
const setNodes: Node[] = [];

let drag: Node;

function init(){
    // Create universe nodes
    const UPSHIFT = 180;
    for (let i = 0; i < universeSize; i++) {
        const x = map(i, 0, universeSize - 1, -windowWidth / 2 + 250, windowWidth / 2 - 250);
        const y = -windowHeight / 2 + UPSHIFT;
        const node = new Node(`CWE ${i}`, `Element ${i}`, createVector(x, y));
        //node.radius = 80;
        universeNodes.push(node);
        node.setSeverity(Severity.NONE);
        nodeManager.addNode(node);
    }

    // Create set nodes
    for (let i = 0; i < sets.length; i++) {
        const x = 125 + map(i, 0, universeSize - 1, -windowWidth / 2 + 250, windowWidth / 2 - 250);
        const y = -windowHeight / 2 + UPSHIFT+300;
        const node = new Node(`SbD ${i}`, `SbD ${i}`, createVector(x, y));
        let v = randint(1, 10);
        setWeights.push(v);
        node.setSeverity(v);
        nodeManager.addNode(node);
        setNodes.push(node);    
    }

    // Connect set nodes to corresponding universe nodes
    for (let i = 0; i < sets.length; i++) {
        const set = sets[i];
        for (const element of set) {
            setNodes[i].addChild(universeNodes[element]);
        }
    }

}

let highlightButton: p5.Element;
let isHighlightedUnitary: boolean = false;
function setup() {
    createCanvas(windowWidth, windowHeight,P2D);
    textFont('Lato');
    textAlign(CENTER);
    colorMode(HSB);

    init();

    highlightButton = createButton('Highlight Optimal Set Cover');
    highlightButton.position(windowWidth / 2 - 75, BELOW(findNodeWithMaxY(setNodes)).y + windowHeight/2);
    highlightButton.style('background-color', '#007BFF');
    highlightButton.style('color', '#FFFFFF');
    highlightButton.style('border', 'none');
    highlightButton.style('padding', '10px 20px');
    highlightButton.style('font-size', '24px');
    highlightButton.style('border-radius', '5px');
    highlightButton.style('cursor', 'pointer');

    highlightButton.mousePressed(() => highlightOptimalSetCover(universeSize,sets,setWeights,nodeManager,setNodes));
}

function highlightOptimalSetCover(universeSize: number, sets: number[][], setWeights: number[], nodes: NodeManager, setNodes: Node[]) {
    if (isHighlightedUnitary){
        for (let node of nodeManager.nodes){
            node.selected = 0;
        }
        highlightButton.html('Highlight Optimal Set Cover');
        infoText = '';
    } else {
        const setCoverer = new SetCoverer(universeSize, sets, setWeights);
        const result = setCoverer.findMinSetCover();
        
        // Deselect all nodes first
        nodeManager.nodes.forEach(node => {
            node.selected = 0;
        });

        // Highlight the optimal set cover
        result.selectedSets.forEach(set => {
            const setIndex = sets.indexOf(set);
            if (setIndex !== -1) {
                setNodes[setIndex].select();
            }
        });
        highlightButton.html('Unhighlight Optimal Set Cover');

        const minSetCount = result.selectedSets.length;
        const minWeight = result.minSetWeight;
        displayInfo(minSetCount, minWeight);

    }
    isHighlightedUnitary = !isHighlightedUnitary;
}

let infoText = '';

function displayInfo(minSetCount: number, minWeight: number) {
    infoText = `Minimum number of SbD's needed to cover all CWE's: ${minSetCount}\nMinimum SbD utility: ${minWeight}`;
}

function drawInit(){
    textAlign(CENTER);
    translate(windowWidth/2, windowHeight/2);
    background(235,21,21);
   
   // funny:
    highlightButton.position(windowWidth / 2 - 75, BELOW(findNodeWithMaxY(setNodes)).y + windowHeight/2);

}

function draw() {
    drawInit();

    fill(255);
    nodeManager.drawNodes();
    
    noStroke();
    fill(255);
    textAlign(LEFT);
    textSize(36);

    let hbpos: any = highlightButton.position(); // bruh
    let posInfoText = BELOW(createVector(- windowWidth/2 + 200,hbpos.y - windowHeight/2), 120);
    text(infoText, posInfoText.x, posInfoText.y);

}

  
function mousePressed() {
    nodeManager.handleMousePress();
}

function mouseReleased() {
    nodeManager.handleMouseRelease();
}

function keyPressed() {
    nodeManager.handleKeyPress(key);
}

window.setup = setup;
window.draw = draw;
window.mousePressed = mousePressed;
window.mouseReleased = mouseReleased;
window.keyPressed = keyPressed;
window.windowResized = windowResized;

function randint(arg0: number, arg1: number): number {
    return Math.floor(Math.random() * (arg1 - arg0 + 1)) + arg0;
}
