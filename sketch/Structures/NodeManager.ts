import { Node } from "./Node";

export default class NodeManager {
    nodes: Node[];

    constructor() {
        this.nodes = [];
    }

    addNode(node: Node) {
        this.nodes.push(node);
        node.setNodeManager(this);
    }

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
    public deleteNode(node: Node) {
        const index = this.nodes.indexOf(node);
        if (index > -1) {
            this.nodes.splice(index, 1);
        }
    }
}