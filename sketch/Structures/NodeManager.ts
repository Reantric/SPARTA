import { getDrawingCanvas, getMenu } from "../sketch.js";
import { Node } from "./Node.js";

export default class NodeManager {
    nodes: Node[];

    constructor() {
        this.nodes = [];
    }

    addNode(node: Node) {
        this.nodes.push(node);
        node.setNodeManager(this);
    }

    /*
    /**
     * Lazily load nodes that are within the visible area.
     
    drawNodes() {
        let p = getDrawingCanvas();
        // Get the camera's position and zoom level
        const camera = p.camera2D;
        const camPos = camera.getPosition();
        const camZoom = camera.getScale();
    
        // Calculate the visible area accounting for zoom
        const halfWidth = p.width * 1.25;
        const halfHeight = p.height * 1.25;
    
        const visibleMinX = (-camPos.x - halfWidth)/camZoom;
        const visibleMaxX = (-camPos.x + halfWidth)/camZoom;
        const visibleMinY = (-camPos.y - halfHeight)/camZoom;
        const visibleMaxY = (-camPos.y + halfHeight)/camZoom;
    
        // Draw a red rectangle showing the visible area for debugging purposes
        p.push();
        p.noFill();
        p.stroke(190, 255, 255); // Light blue color for the border
        p.strokeWeight(4);
        p.rect(visibleMinX, visibleMinY, visibleMaxX - visibleMinX, visibleMaxY - visibleMinY);
        p.pop();
    
        // Only draw nodes within the visible area
        for (let i = this.nodes.length - 1; i >= 0; i--) {
            const node = this.nodes[i];
            const nodeX = node.coord.x;
            const nodeY = node.coord.y;
    
            // Check if the node is within the visible area
            if (nodeX >= visibleMinX && nodeX <= visibleMaxX &&
                nodeY >= visibleMinY && nodeY <= visibleMaxY) {
                node.draw(); // Draw only if the node is visible
            }
        }
    } */

    /**
     * 
     * Regular draw (keep this for now since the lazy load only applies to SbD's, which is fine for certain use cases)
     */
    drawNodes() {
        for (let i = this.nodes.length - 1; i >= 0; i--) {
            this.nodes[i].draw();
        }
    }   
    
    

    handleMousePress() {
        let isOverANode = false;
        for (let node of this.nodes) {
            isOverANode = node.handleMousePress();
            if (isOverANode) {
                break;
            }
        }
        return isOverANode;
    }

    handleMouseRelease() {
        for (let node of this.nodes) {
            node.released();
        }
    }

    handleKeyPress(key: string) {
        for (let node of this.nodes) {
            node.handleKeyPress(key);
        }
    }

    /**
     * Delete a node.
     * @param {Node} node - The node to be deleted.
     */
    public deleteNode(node: Node) { // Bug when deleting child, because it doesn't delete it from the parent's children array.
        const index = this.nodes.indexOf(node);
        if (index > -1) {
            node.markForDeletion();
            getMenu().removeFromSearchIndex(node);
            this.nodes.splice(index, 1);
        }
    }
}