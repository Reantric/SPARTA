import SetCoverer from "./SetCoverer/setCover.js";
import { Node, Severity } from "./Structures/Node.js";

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
let nodes: Node[] = new Array();


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
        nodes.push(node);
    }

    // Create set nodes
    for (let i = 0; i < sets.length; i++) {
        const x = 125 + map(i, 0, universeSize - 1, -windowWidth / 2 + 250, windowWidth / 2 - 250);
        const y = -windowHeight / 2 + UPSHIFT+300;
        const node = new Node(`SbD ${i}`, `SbD ${i}`, createVector(x, y));
        let v = randint(1, 10);
        setWeights.push(v);
        node.setSeverity(v);
        nodes.push(node);
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
    console.log("Helssosss!");
    createCanvas(windowWidth, windowHeight,P2D);
    textFont('Lato');
    textAlign(CENTER);
    colorMode(HSB);

    init();

    highlightButton = createButton('Highlight Optimal Set Cover');
    highlightButton.position(windowWidth / 2 - 75, windowHeight - 375);
    highlightButton.style('background-color', '#007BFF');
    highlightButton.style('color', '#FFFFFF');
    highlightButton.style('border', 'none');
    highlightButton.style('padding', '10px 20px');
    highlightButton.style('font-size', '24px');
    highlightButton.style('border-radius', '5px');
    highlightButton.style('cursor', 'pointer');
    highlightButton.mousePressed(() => highlightOptimalSetCover(universeSize,sets,setWeights,nodes,setNodes));
}

function highlightOptimalSetCover(universeSize: number, sets: number[][], setWeights: number[], nodes: Node[], setNodes: Node[]) {
    if (isHighlightedUnitary){
        for (let node of nodes){
            node.selected = 0;
        }
        highlightButton.html('Highlight Optimal Set Cover');
        infoText = '';
    } else {
        const setCoverer = new SetCoverer(universeSize, sets, setWeights);
        const result = setCoverer.findMinSetCover();
        
        // Deselect all nodes first
        nodes.forEach(node => {
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
}

function draw() {
    drawInit();
    
    fill(255);
    for (let node of nodes) {
        node.draw();
    }
    
    noStroke();
    fill(255);
    textAlign(LEFT);
    textSize(36);
    text(infoText, -windowWidth / 2 + 40, windowHeight / 2 - 220);

}

function mousePressed() {
    for (let node of nodes) {
        node.handleMouseClick();
    }
}

function keyPressed(){
    //highlightOptimalSetCover(universeSize, sets, nodes, nodes.filter(node => node.title.startsWith("Set")));
}

window.setup = setup;
window.draw = draw;
window.mousePressed = mousePressed;

function randint(arg0: number, arg1: number): number {
    return Math.floor(Math.random() * (arg1 - arg0 + 1)) + arg0;
}
