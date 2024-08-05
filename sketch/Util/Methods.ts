import p5 from 'p5';
import { Node } from '../Structures/Node';

export function BELOW(obj: { coord: p5.Vector, radius: number }): p5.Vector;
export function BELOW(obj: p5.Vector, distance: number): p5.Vector;
export function BELOW(obj: { coord: p5.Vector, radius: number }, distance: number): p5.Vector;
export function BELOW(obj: any, distance: number = 20): p5.Vector {
    if ('coord' in obj) {
        return createVector(obj.coord.x, obj.coord.y + obj.radius + distance);
    } else {
        return createVector(obj.x, obj.y + distance);
    }
}

export function ABOVE(obj: { coord: p5.Vector, radius: number }, distance: number = 20): p5.Vector {
    return createVector(obj.coord.x, obj.coord.y - obj.radius - distance);
}

export function LEFT(obj: { coord: p5.Vector, radius: number }, distance: number = 20): p5.Vector {
    return createVector(obj.coord.x - obj.radius - distance, obj.coord.y);
}

export function RIGHT(obj: { coord: p5.Vector, radius: number }, distance: number = 20): p5.Vector {
    return createVector(obj.coord.x + obj.radius + distance, obj.coord.y);
}

export function findNodeWithMaxY(nodes: Node[]): Node {
    return nodes.reduce((minNode, currentNode) => {
        return currentNode.coord.y > minNode.coord.y ? currentNode : minNode;
    });
}