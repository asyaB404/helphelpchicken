import { Component, Vec3 } from 'cc';
import { PREVIEW } from 'cc/env';
import { GridNode, Astar, Graph } from '../libs/Astar';
import { Tools } from '../utils/Tools';

export class PathFindMgr extends Component {

    private static _ins: PathFindMgr = null;
    public static get ins() {
        if (!this._ins) {
            this._ins = new PathFindMgr();
        }

        return this._ins;
    }

    private graph: Graph;

    init(grid: number[][]) {
        this.graph = new Graph(grid);
    }

    //set graph's node's weight (default value is wall) 
    setNode(pos: [number, number], weight: number = 0) {
        this.graph.setWeight(pos, weight);
    }

    clear() {
        this.graph.clearNodes();
    }

    /**
     * @description: search the graph and get the path
     * @return {*}
     */
    getGridPath(star: GridNode, end: GridNode) {
        var astar = new Astar();
        const gridPath = astar.search(this.graph, star, end);
        astar = null;
        return gridPath;
    }

    /**
     * @description: get path from pos1 to pos2
     * @return {*}
     */
    getPath(pos1: Vec3, pos2: Vec3) {
        var startP = Tools.getGridPos(pos1);
        var endP = Tools.getGridPos(pos2);
        var start = this.graph.getNode(startP);
        var end = this.graph.getNode(endP);
        var gridPath = this.getGridPath(start, end);
        const path = this.stringPull(gridPath);
        return path;
    }

    /* simeple pulled the line into pos */
    stringPull(gridPath: GridNode[]) {

        const pos = [];
        gridPath.forEach((v) => {
            pos.push(Tools.getLocalPos(v, false))
        })

        gridPath.length = 0;
        return pos;

    }



}

