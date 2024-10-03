import SetCoverer from "./SetCoverer/setCover.js";
import { Node, Severity } from "./Structures/Node.js";
import NodeManager from "./Structures/NodeManager.js";
import { LEFT, Methods, findNodeWithMinX, BELOW, findNodeWithMaxY } from "./Util/Methods.js";
import { ContextMenu } from "./Structures/ContextMenu.js";
import { Camera as Camera2D} from "./Structures/Camera.js";
import Draggable from "./Structures/Draggable.js";
import { Menu } from "./WebUtil/Menu.js";
import { Loader } from "./Util/Loader.js";

declare global {
    namespace p5 {
        interface p5InstanceExtensions {
            transformedMouseX: number;
            transformedMouseY: number;
            camera2D: Camera2D;
        }
    }
} 

let dc: p5;

/**
 * Sets the global p5 instance to the provided instance.
 * @param {p5} p - The p5 instance to be set as the global drawing canvas.
 */
export function setDrawingCanvas(p: p5) {
    dc = p;
}

/**
 * Retrieves the global p5 instance.
 * @returns {p5} - The global p5 instance.
 */
export function getDrawingCanvas() {
    return dc;
}

/**
 * Retrieves the left menu instance.
 */
export function getMenu() {
    return leftMenu;
}

const nodeManager = new NodeManager();
const universeSize = 8;
const sets = [
    [0, 1, 2], // Set {1, 2, 3}
    [3],    // Set {2, 4}
    [0 ,2 ,4],    // Set {3, 4}
    [3, 4],     // Set {4, 5}
    [0, 1],       // Set {1, 2}
    [2, 3, 4],    // Set {3, 4, 5}
    [1, 4, 5],    // Set {2, 5, 6}
    [3, 6],       // Set {4, 7}
    [0, 2, 6]     // Set {1, 3, 7}
];

const setWeights = [];
const universeNodes = [];
const setNodes = [];

let leftMenu: Menu;
/**
 * Main sketch function for p5 instance mode.
 * @param {p5} p - The p5 instance.
 */
function sketch(p: p5) {
    p.transformedMouseX = 0;
    p.transformedMouseY = 0;
    /**
     * Updates the transformed mouse coordinates based on the camera's position and zoom level.
     */
    function updateTransformedMouseCoords() {
        const camera = p.camera2D;
        let camPos = camera.getPosition();
        p.transformedMouseX = (p.mouseX - camPos.x) / camera.getScale();
        p.transformedMouseY = (p.mouseY - camPos.y) / camera.getScale();
    }

    setDrawingCanvas(p);  // Set the global p5 instance
    Methods.init();

    /**
     * Handles window resizing to adjust the canvas size.
     */
    p.windowResized = function() {
        p.resizeCanvas(p.windowWidth - document.getElementById('menu').offsetWidth, p.windowHeight);
    }

    /**
     * Initializes the nodes and sets up their positions and relationships.
     */
    function init() {
        // Create universe nodes (CWE)
        const UPSHIFT = 180;
        for (let i = 0; i < universeSize; i++) {
            const x = p.map(i, 0, universeSize - 1, 150, p.width - 150);
            const y = UPSHIFT;
            const node = new Node(`CWE ${i}`, `Element ${i}`, p.createVector(x, y));
            node.setSeverity(Severity.NONE);
            universeNodes.push(node);
            node.setNodeManager(nodeManager);
            nodeManager.addNode(node);
        }

        // Create set nodes
        for (let i = 0; i < sets.length; i++) {
            const x = p.map(i, 0, sets.length - 1, 225, p.width - 225);
            const y = UPSHIFT + 350;
            const node = new Node(`SbD ${i}`, `SbD ${i}`, p.createVector(x, y));
            node.setSbDStatus();
            let v = randint(1, 10);
            setWeights.push(v);
            node.setSeverity(v);
            node.setNodeManager(nodeManager);
            nodeManager.addNode(node);
            setNodes.push(node);
        }
    
        // Connect set nodes to corresponding universe nodes
        sets.forEach((set, i) => {
            set.forEach(element => {
                setNodes[i].addChild(universeNodes[element]);
            });
        });
    }
    

    /**
     * Sets up the p5 sketch, including canvas creation and event listeners.
     */
    p.setup = function() {
    let loader = new Loader();
    loader.loadSPARTAData('sketch/data/spartadata.xlsx')
    .then(spartaData => {
        console.log(spartaData);
        // Now you can use spartaData in your sketch initialization
    })
    .catch(error => {
        console.error('Error loading SPARTA data:', error);
    });
        
        const menuWidth = document.getElementById('menu').offsetWidth;
        const canvasContainer = document.getElementById('canvas-container');
        
        // Adjust canvas size to leave space for the menu
        const canvas = p.createCanvas(p.windowWidth - menuWidth, p.windowHeight, p.P2D);
        canvas.parent('canvas-container');

        p.textFont('Lato');
        p.textAlign(p.CENTER);
        p.colorMode(p.HSB);

        init();
        p.camera2D = new Camera2D(p); // Initialize the camera
        leftMenu = new Menu(universeSize, sets, setWeights, nodeManager, setNodes, p);
        
        const menu = document.getElementById('menu');
        const resizeObserver = new ResizeObserver(() => {
            p.windowResized();
        });
        resizeObserver.observe(menu);

        // Listen for context menu option selection events
        window.addEventListener('contextmenuoption', (event: CustomEvent) => {
            console.log("FIRE!");
            const { eventName } = event.detail;
            handleContextMenuOption(eventName);
        });
    }

    /**
     * Initializes the drawing setup.
     */
    function drawInit() {
        p.textAlign(p.CENTER);
        p.background(235, 21, 21);
        updateTransformedMouseCoords();
    }

    /**
     * Main draw function for the p5 sketch.
     */
    p.draw = function() {
       // console.log(this.mouseX,this.mouseY,this.transformedMouseX, this.transformedMouseY);
        drawInit();

        p.push();
        p.camera2D.applyTransformations();  // Apply camera transformations

        p.fill(255);
        nodeManager.drawNodes();
        
        p.pop();  // Reset transformations for UI elements

        p.noStroke();
        p.fill(255);
        p.textAlign(p.LEFT);
        p.textSize(36);

        leftMenu.update(); // Handles a lot of the menu stuff, zooming, highlighting, etc.

        // Combine static and dynamic info
        let combinedInfoText = leftMenu.getCombinedText();
        
        // TODO: Wrap this in a function later
        const paddingCITextY = -100;  // Adjust padding as needed
        const paddingCITextX = 30;  // Adjust padding as needed
        const lines = combinedInfoText.split('\n');
        const textHeight = lines.length * (p.textAscent() + p.textDescent());
        p.text(combinedInfoText, paddingCITextX, p.height - paddingCITextY - textHeight);
    }

    /**
     * Handles mouse press events.
     */
    p.mousePressed = function() {
        const contextMenu = new ContextMenu();
        nodeManager.handleMousePress();

        if (p.mouseButton === p.RIGHT) {
            const clickedNode = nodeManager.nodes.find(node => node.isMouseOver());
            if (clickedNode) {
                // Handle right-click on the node
                clickedNode.handleMousePress(p.RIGHT);
            } else {
                // Handle right-click on the canvas (outside nodes)
                contextMenu.show(p.mouseX, p.mouseY, [
                    { label: "Preview", action: preview, icon: "uil uil-eye" },
                    // Add other default menu items here
                ]);
            }
            return false; // Prevent default context menu
        }

        // Handle left-clicks or other mouse actions if needed
    }

    /**
     * Handles mouse drag events for panning the camera.
     */
    let isPanning = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    p.mouseDragged = function() {
        if (this.mouseX < 0 || this.mouseX > this.width || this.mouseY < 0 || this.mouseY > this.height) 
            return;

        if (p.mouseButton === p.LEFT && !isPanning && !Draggable.isDraggingNode) {
            // Handle dragging the camera
            isPanning = true;
            lastMouseX = p.mouseX;
            lastMouseY = p.mouseY;
        } else if (isPanning) {
            const dx = p.mouseX - lastMouseX;
            const dy = p.mouseY - lastMouseY;
            p.camera2D.pan(dx, dy);
            lastMouseX = p.mouseX;
            lastMouseY = p.mouseY;
        }
    }

    p.mouseReleased = function() {
        isPanning = false;
        nodeManager.handleMouseRelease();
    }

    /**
     * Handles mouse wheel events for zooming the camera.
     */
    p.mouseWheel = function(event: WheelEvent) {
        const centerX = p.width / 2;
        const centerY = p.height / 2;
        const factor = event.deltaY > 0 ? 0.95 : 1.05;
        this.camera2D.zoom(factor, centerX, centerY);
        return false;  // Prevent page scroll
    }

    /**
     * Handles key press events.
     */
    p.keyPressed = function() {
        nodeManager.handleKeyPress(p.key);
    }

    /**
     * Handles context menu option selection.
     * @param {string} optionName - The name of the selected option.
     */
    function handleContextMenuOption(optionName: string) {
        console.log(`Context menu option selected: ${optionName}`);
        // Handle different context menu options here
        if (optionName === 'option1') {
            // Example: Select all nodes
            nodeManager.nodes.forEach(node => node.select());
        }
    }

    /**
     * Generates a random integer between two values.
     * @param {number} arg0 - The lower bound.
     * @param {number} arg1 - The upper bound.
     * @returns {number} - A random integer between arg0 and arg1.
     */
    function randint(arg0, arg1) {
        return Math.floor(Math.random() * (arg1 - arg0 + 1)) + arg0;
    }

    /**
     * Example function for the context menu option.
     */
    function preview() {
        console.log("Preview option selected");
        // Implement the action for the Preview option
    }

}

// @ts-ignore
new p5(sketch, "canvas-container");
