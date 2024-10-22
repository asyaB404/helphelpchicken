const D = 1;

const D2 = Math.sqrt(2);

function pathTo(node: GridNode): GridNode[] {
    var curr = node;
    var path: GridNode[] = [];
    while (curr.parent) {
        path.unshift(curr);
        curr = curr.parent;
    }
    return path;
}

export function buildGrid(width: number, height: number): number[][] {

    const gridIn: number[][] = [];

    for (var x = 0; x < width; x++) {
        gridIn[x] = [];
        for (var y = 0, row = gridIn[x]; y < height; y++) {
            /* mark all grids are walkable 1st*/
            row[y] = 1;
        }
    }
    return gridIn;
}

function cleanNode(node: GridNode) {
    node.f = 0;
    node.g = 0;
    node.h = 0;
    node.visited = false;
    node.closed = false;
    node.parent = null;
}

function getHeap() {
    return new BinaryHeap(function (node: GridNode): number {
        return node.f;
    });
}



export class Astar {
    /**
    * Perform an A* Search on a graph given a start and end node.
    * @param {Graph} graph
    * @param {GridNode} start
    * @param {GridNode} end
    * @param {Object} [options]
    * @param {bool} [options.closest] Specifies whether to return the
               path to the closest node if the target is unreachable.
    * @param {Function} [options.heuristic] Heuristic function (see
    *          astar.heuristics).
    */
    search(graph: Graph, start: GridNode, end: GridNode) {
        graph.cleanDirty();

        const closest = false;

        const openHeap = getHeap();
        var closestNode = start; // set the start node to be the closest if required

        start.h = this.manhattan(start, end);

        graph.markDirty(start);

        openHeap.push(start);


        while (openHeap.size() > 0) {

            // Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
            var currentNode = openHeap.pop() as GridNode;

            // End case -- result has been found, return the traced path.
            if (currentNode === end) {
                return pathTo(currentNode);
            }

            // Normal case -- move currentNode from open to closed, process each of its neighbors.
            currentNode.closed = true;

            // Find all neighbors for the current node.
            const neighbors = graph.neighbors(currentNode);

            for (var i = 0, il = neighbors.length; i < il; ++i) {
                var neighbor = neighbors[i];

                if (neighbor.closed || neighbor.isWall()) {
                    // Not a valid node to process, skip to next neighbor.
                    continue;
                }

                // The g score is the shortest distance from start to current node.
                // We need to check if the path we have arrived at this neighbor is the shortest one we have seen yet.
                var gScore = currentNode.g + neighbor.getCost(currentNode);
                var beenVisited = neighbor.visited;

                if (!beenVisited || gScore < neighbor.g) {

                    // Found an optimal (so far) path to this node.  Take score for node to see how good it is.
                    neighbor.visited = true;
                    neighbor.parent = currentNode;
                    neighbor.h = this.manhattan(neighbor, end);
                    neighbor.g = gScore;
                    neighbor.f = neighbor.g + neighbor.h;
                    graph.markDirty(neighbor);
                    if (closest) {
                        // If the neighbour is closer than the current closestNode or if it's equally close but has
                        // a cheaper path than the current closest node then it becomes the closest node
                        if (neighbor.h < closestNode.h || (neighbor.h === closestNode.h && neighbor.g < closestNode.g)) {
                            closestNode = neighbor;
                        }
                    }

                    if (!beenVisited) {
                        // Pushing to heap will put it in proper place based on the 'f' value.
                        openHeap.push(neighbor);
                    } else {
                        // Already seen the node, but since it has been rescored we need to reorder it in the heap
                        openHeap.rescoreElement(neighbor);
                    }
                }
            }
        }

        if (closest) {

            return pathTo(closestNode);
        }

        // No result was found - empty array signifies failure to find path.
        return [];
    }
    // See list of heuristics: http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html

    manhattan(pos0: GridNode, pos1: GridNode): number {
        const d1 = Math.abs(pos1.x - pos0.x);
        const d2 = Math.abs(pos1.y - pos0.y);
        return d1 + d2;
    }

    diagonal(pos0: GridNode, pos1: GridNode) {
        const d1 = Math.abs(pos1.x - pos0.x);
        const d2 = Math.abs(pos1.y - pos0.y);
        return (D * (d1 + d2)) + ((D2 - (2 * D)) * Math.min(d1, d2));
    }
}


/**
 * A graph memory structure
 * @param {Array} gridIn 2D array of input weights
 * @param {Object} [options]
 */
export class Graph {

    public nodes: GridNode[];
    private diagonal: boolean;
    public grid: GridNode[][];
    // mark the changed GridNode, which is dirty
    private dirtyNodes: GridNode[];

    //0 in gridIn means wall, 1 in gridIn means walkable
    constructor(gridIn: number[][], diagonal: boolean = true) {
        this.diagonal = diagonal;
        this.nodes = [];
        this.grid = [];
        this.dirtyNodes = [];

        for (var x = 0; x < gridIn.length; x++) {
            this.grid[x] = [];
            for (var y = 0, row = gridIn[x]; y < row.length; y++) {
                var node = new GridNode(x, y, row[y]);
                this.grid[x][y] = node;
                this.nodes.push(node);
            }
        }
    };

    //set node's weight 
    setWeight(pos: [number, number], weight: number) {
        const node = this.getNode(pos);
        node.weight = weight;
    }

    getNode(pos: [number, number]): GridNode {

        return this.grid[pos[0]][pos[1]];
    }
    clearNodes() {

        this.nodes.forEach((node) => {
            /* cleaned weight and dirty nodes */
            node.weight = 1;
        });

        this.cleanDirty();

    }

    cleanDirty() {
        for (var i = 0; i < this.dirtyNodes.length; i++) {
            cleanNode(this.dirtyNodes[i]);
        }
        this.dirtyNodes = [];
    };

    markDirty(node: GridNode) {
        this.dirtyNodes.push(node);
    };

    neighbors(node: GridNode): GridNode[] {
        const ret: GridNode[] = [];
        const x = node.x;
        const y = node.y;
        const grid = this.grid;
        /*
        *******North********
        ********************
        ********************
        **West**Node**East**
        ********************
        ********************
        *******South********
        */
        // West //Left
        if (grid[x - 1] && grid[x - 1][y]) {
            ret.push(grid[x - 1][y]);
        }

        // East //Right
        if (grid[x + 1] && grid[x + 1][y]) {
            ret.push(grid[x + 1][y]);
        }

        // South //Down
        if (grid[x] && grid[x][y - 1]) {
            ret.push(grid[x][y - 1]);
        }

        // North //Up
        if (grid[x] && grid[x][y + 1]) {
            ret.push(grid[x][y + 1]);
        }

        if (this.diagonal) {
            // Southwest
            if (grid[x - 1] && grid[x - 1][y - 1]) {
                ret.push(grid[x - 1][y - 1]);
            }

            // Southeast
            if (grid[x + 1] && grid[x + 1][y - 1]) {
                ret.push(grid[x + 1][y - 1]);
            }

            // Northwest
            if (grid[x - 1] && grid[x - 1][y + 1]) {
                ret.push(grid[x - 1][y + 1]);
            }

            // Northeast
            if (grid[x + 1] && grid[x + 1][y + 1]) {
                ret.push(grid[x + 1][y + 1]);
            }
        }

        return ret;
    };

    // for debug use
    toString() {
        const graphString: any = [];
        const nodes = this.grid;
        const nL = nodes.length;
        for (var x = 0; x < nL; x++) {
            var rowDebug: any = [];
            var row = nodes[x];
            const rL = row.length;
            for (var y = 0; y < rL; y++) {
                rowDebug.push(row[y].weight);
            }
            graphString.push(rowDebug.join(" "));
        }
        return graphString.join("\n");
    };

}

export class GridNode {
    public x: number;
    public y: number;
    public weight: number;
    public f: number;
    public g: number;
    public h: number;
    public visited: boolean;
    public closed: boolean;
    public parent: GridNode;

    constructor(x, y, weight) {
        this.x = x;
        this.y = y;
        this.f = 0;
        this.g = 0;
        this.h = 0;
        this.weight = weight;
        this.visited = false;
        this.closed = false;
        this.parent = null;
    }


    getCost(fromNeighbor) {
        // Take diagonal weight into consideration.
        if (fromNeighbor && fromNeighbor.x != this.x && fromNeighbor.y != this.y) {
            return this.weight * 1.41421;
        }
        return this.weight;
    };

    isWall() {
        return this.weight === 0;
    };


    // for debug use
    toString() {
        return "[" + this.x + " " + this.y + "]";
    };

}



function BinaryHeap(scoreFunction) {
    this.content = [];
    this.scoreFunction = scoreFunction;
}

BinaryHeap.prototype = {
    push: function (element) {
        // Add the new element to the end of the array.
        this.content.push(element);

        // Allow it to sink down.
        this.sinkDown(this.content.length - 1);
    },
    pop: function () {
        // Store the first element so we can return it later.
        const result = this.content[0];
        // Get the element at the end of the array.
        const end = this.content.pop();
        // If there are any elements left, put the end element at the
        // start, and let it bubble up.
        if (this.content.length > 0) {
            this.content[0] = end;
            this.bubbleUp(0);
        }
        return result;
    },
    remove: function (node: GridNode) {
        var i = this.content.indexOf(node);

        // When it is found, the process seen in 'pop' is repeated
        // to fill up the hole.
        const end = this.content.pop();

        if (i !== this.content.length - 1) {
            this.content[i] = end;

            if (this.scoreFunction(end) < this.scoreFunction(node)) {
                this.sinkDown(i);
            } else {
                this.bubbleUp(i);
            }
        }
    },
    size: function () {
        return this.content.length;
    },
    rescoreElement: function (node) {
        this.sinkDown(this.content.indexOf(node));
    },
    sinkDown: function (n) {
        // Fetch the element that has to be sunk.
        const element = this.content[n];

        // When at 0, an element can not sink any further.
        while (n > 0) {

            // Compute the parent element's index, and fetch it.
            let parentN = ((n + 1) >> 1) - 1;
            let parent = this.content[parentN];
            // Swap the elements if the parent is greater.
            if (this.scoreFunction(element) < this.scoreFunction(parent)) {
                this.content[parentN] = element;
                this.content[n] = parent;
                // Update 'n' to continue at the new position.
                n = parentN;
            }
            // Found a parent that is less, no need to sink any further.
            else {
                break;
            }
        }
    },
    bubbleUp: function (n) {
        // Look up the target element and its score.
        const length = this.content.length;
        const element = this.content[n];
        const elemScore = this.scoreFunction(element);

        while (true) {
            // Compute the indices of the child elements.
            let child2N = (n + 1) << 1;
            let child1N = child2N - 1;
            // This is used to store the new position of the element, if any.
            let swap: any = null;
            let child1Score;
            // If the first child exists (is inside the array)...
            if (child1N < length) {
                // Look it up and compute its score.
                let child1 = this.content[child1N];
                child1Score = this.scoreFunction(child1);

                // If the score is less than our element's, we need to swap.
                if (child1Score < elemScore) {
                    swap = child1N;
                }
            }

            // Do the same checks for the other child.
            if (child2N < length) {
                let child2 = this.content[child2N];
                let child2Score = this.scoreFunction(child2);
                if (child2Score < (swap === null ? elemScore : child1Score)) {
                    swap = child2N;
                }
            }

            // If the element needs to be moved, swap it, and continue.
            if (swap !== null) {
                this.content[n] = this.content[swap];
                this.content[swap] = element;
                n = swap;
            }
            // Otherwise, we are done.
            else {
                break;
            }
        }
    }
};