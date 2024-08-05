import { Node } from "./Node";

export default class NodeManager {
    nodes: Node[];

    constructor() {
        this.nodes = [];
    }

    addNode(node: Node) {
        this.nodes.push(node);
    }

    removeNode(node: Node) {
        this.nodes = this.nodes.filter(n => n !== node);
    }

    drawNodes() {
        for (let node of this.nodes) {
            node.draw();
        }
    }

    handleMousePress() {
        for (let node of this.nodes) {
            node.handleMousePress();
        }
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
}