import p5 from 'p5';
import { Node } from '../Structures/Node.js';
import { getDrawingCanvas } from '../sketch.js';

let p: p5;
export namespace Methods {
    export function init() {
        p = getDrawingCanvas();
    }
}

export function BELOW(obj: { coord: p5.Vector, radius: number }): p5.Vector;
export function BELOW(obj: p5.Vector, distance: number): p5.Vector;
export function BELOW(obj: { coord: p5.Vector, radius: number }, distance: number): p5.Vector;
export function BELOW(obj: any, distance: number = 20): p5.Vector {
    if ('coord' in obj) {
        return p.createVector(obj.coord.x, obj.coord.y + obj.radius + distance);
    } else {
        return p.createVector(obj.x, obj.y + distance);
    }
}

export function ABOVE(obj: { coord: p5.Vector, radius: number }): p5.Vector;
export function ABOVE(obj: p5.Vector, distance: number): p5.Vector;
export function ABOVE(obj: { coord: p5.Vector, radius: number }, distance: number): p5.Vector;
export function ABOVE(obj: any, distance: number = 20): p5.Vector {
    if ('coord' in obj) {
        return p.createVector(obj.coord.x, obj.coord.y - obj.radius - distance);
    } else {
        return p.createVector(obj.x, obj.y - distance);
    }
}

export function LEFT(obj: { coord: p5.Vector, radius: number }): p5.Vector;
export function LEFT(obj: p5.Vector, distance: number): p5.Vector;
export function LEFT(obj: { coord: p5.Vector, radius: number }, distance: number): p5.Vector;
export function LEFT(obj: any, distance: number = 20): p5.Vector {
    if ('coord' in obj) {
        return p.createVector(obj.coord.x - obj.radius - distance, obj.coord.y);
    } else {
        return p.createVector(obj.x - distance, obj.y);
    }
}

export function RIGHT(obj: { coord: p5.Vector, radius: number }): p5.Vector;
export function RIGHT(obj: p5.Vector, distance: number): p5.Vector;
export function RIGHT(obj: { coord: p5.Vector, radius: number }, distance: number): p5.Vector;
export function RIGHT(obj: any, distance: number = 20): p5.Vector {
    if ('coord' in obj) {
        return p.createVector(obj.coord.x + obj.radius + distance, obj.coord.y);
    } else {
        return p.createVector(obj.x + distance, obj.y);
    }
}

export function findNodeWithMaxY(nodes: Node[]): Node {
    return nodes.reduce((minNode, currentNode) => {
        return currentNode.coord.y > minNode.coord.y ? currentNode : minNode;
    });
}

export function findNodeWithMinX(nodes: Node[]): Node {
    return nodes.reduce((minNode, currentNode) => {
        return currentNode.coord.x < minNode.coord.x ? currentNode : minNode;
    });
}
