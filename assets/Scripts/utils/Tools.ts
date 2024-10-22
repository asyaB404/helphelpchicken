
import { _decorator, Sprite, SpriteFrame, Texture2D, ImageAsset, Node, screen, tween, UIMeshRenderer, Layers, Vec3, sys, UITransform, Widget, view, PolygonCollider2D } from 'cc';
import { PREVIEW } from 'cc/env';
import { Global } from '../Global';
import { GridNode } from '../libs/Astar';
import { PoolMgr } from '../manager/PoolMgr';
import ResMgr from '../manager/ResMgr';
import { VecPool } from '../manager/VecPool';
import { GridConfig } from '../MapEditor/GridConfig';

/**
 * @description: save data into localstorage
 * @return {*}
 */
export function save(key: string, val: string | number | any) {
    if (typeof val === "number") {
        val = "" + val as string;
    }
    sys.localStorage.setItem(key, val || '')
}


/**
 * @description: load localstorage data,
 * @return {*}
 */
export function load(key: string, type: 0 | 1 | 2 = 1) {
    let res: any = sys.localStorage.getItem(key);
    if (res) {
        switch (type) {
            case 0:
                break;
            case 1:
                res = Number(res);
                break;
            case 2:
                res = JSON.parse(res);
                break;
        }
        return res;
    } else {
        return null;
    }
}


const ONE = new Vec3(1, 1, 1);

const ZERO = new Vec3(0, 0, 0);

export class Tools {

    static getDay() {
        return Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    }

    static createUI(name: string = "uiNode", layer: number = Layers.Enum.UI_2D): Node {
        const size = view.getVisibleSize();
        const node = new Node(name)
        const transfrom = node.addComponent(UITransform);
        transfrom.setContentSize(size);
        const widget = node.addComponent(Widget);
        widget.isAlignLeft = widget.isAlignTop = widget.isAlignTop = widget.isAlignBottom = true;
        widget.right = widget.left = widget.top = widget.bottom = 0;
        node.layer = layer;
        return node;
    }

    /**
     * @description: generate a random data;
     * @return {*}
     */
    static getDateId(): string {

        let d = new Date();

        let dates = d.getDay().toString() + d.getHours().toString() + d.getMinutes().toString() + d.getSeconds().toString();

        let result = Math.floor(Number(dates) + Math.floor(Math.random() * (500000 * Math.random() + 50000)) * 0.1);

        return result.toString();
    }


    /**
     * @description: get the sys language
     * @return {*}
     */
    static isEn(): boolean {
        return (navigator.language.indexOf("zh") != -1) ? false : true;
    }


    /**
     * @description: get pos in grid
     * @return {[number,number]} grid pos
     */
    static getGridPos(pos: Vec3): [number, number] {

        const x = Math.floor(GridConfig.x * 0.5 + (pos.x) / GridConfig.size);
        const y = Math.floor(GridConfig.y * 0.5 + (pos.y) / GridConfig.size);
        const gridPos: [number, number] = [x, y];
        return gridPos;
    }


    /**
     * @description: get local space pos from grid
     * @return {[number,number]} local space pos
     */
    static getLocalPos(node: GridNode, showGizmo = false): [number, number] {
        const x = (node.x - GridConfig.x * 0.5 + 0.5) * GridConfig.size;
        const y = (node.y - GridConfig.y * 0.5 + 0.5) * GridConfig.size;
        if (showGizmo) {
            this.showGizmo(x, y);
        }
        return [x, y];
    }

    static showGizmo(x, y) {
        if (!PREVIEW) return;
        const point = PoolMgr.ins.getNode("gPoint", Global.layer[7]);
        point.setPosition(x, y);
    }


    /**
     * @description: Clear UI node, and realse sprite's memory based on needs
     * @param {Node} node
     * @param {*} clear
     * @return {*}
     */
    static clearUI(node: Node, clear = true) {

        if (clear) {
            const sp = node.getComponent(Sprite);
            sp && Tools.clearSprite(sp);
            const sps = node.getComponentsInChildren(Sprite);
            if (sps.length > 0) {
                sps.forEach((v) => {
                    /* Release mem */
                    Tools.clearSprite(v);
                })
            }

        }
        node.destroy();
    }
    /**
     * @Date: 2022-03-04 17:26:21
     * @LastEditors: iwae
     * @description: unity vector组件移植
     * @param {Vec3} current 当前坐标
     * @param {Vec3} target 目标点坐标
     * @param {number} maxDistanceDelta 速度
     */
    MoveTowards(current: Vec3, target: [number, number], maxDistanceDelta: number) {
        // avoid vector ops because current scripting backends are terrible at inlining
        const toVector_x = target[0] - current.x;
        const toVector_y = target[1] - current.y;
        const sqdist = toVector_x * toVector_x + toVector_y * toVector_y;
        if (sqdist == 0 || (maxDistanceDelta >= 0 && sqdist <= maxDistanceDelta * maxDistanceDelta)) {
            current.set(target[0], target[1]);
            return true;
        }
        const dist = Math.sqrt(sqdist);

        current.x = + toVector_x / dist * maxDistanceDelta;
        current.y = + toVector_y / dist * maxDistanceDelta;

        return false;
    }


    /**
     * @description: get the screen ratio
     * @return {*}
     */
    static setRatio() {

        const screenSize = screen.windowSize;

        const designSize = view.getDesignResolutionSize();
        Global.screenRatio = (screenSize.height / screenSize.width) / (designSize.height / designSize.width);


        if (Global.screenRatio < 1) Global.screenRatio = 1
        console.log("size==", screenSize, Global.screenRatio);

    }

    /* node fade In */
    static fadeIn(node: Node, dura = 0.2) {
        tween(node).set({ scale: Vec3.ZERO }).to(dura, { scale: ONE }).start();
    }

    static fixedTo(num: number, precision = 2) {

        const perc = 10 ^ precision;

        num = Math.floor(num * perc) / perc;

        return num;

    }

    /**
     * @description: get a random target from targets
     * @return {*}
     */
    static getRandomTarget(targets: Node[]): Node {

        let target: Node;

        const L = targets.length;

        if (L > 0) {

            target = targets[Math.floor(L * Math.random())];

        } else {

            target = null;
        }


        return target;
    }


    /**
     * @description: get the closet nodes
     * @return {*}
     */
    static getCloestNode(self: Node, targets: Node[]): Node {

        let closestNode: Node;

        const L = targets.length;

        if (L > 0) {

            let dis = -0.1;

            for (var i = 0; i < L; i++) {

                const _node = targets[i];

                const _dis = this.getNodesDis(_node, self);

                if (_dis > dis) {

                    dis = _dis;

                    closestNode = _node;
                }

            }

        } else {

            closestNode = null;
        }


        return closestNode;
    }

    /**
     * @description: get node's mahatton dis to the target
     * @return {*}
     */
    static getNodesDis(start: Node, end: Node): number {
        return this.getDistance(start.position, [end.position.x, end.position.y]);
    }

    static getOne(): 1 | -1 {
        return (Math.random() > 0.5) ? 1 : -1;
    }

    static getDistance(p1: Vec3, p2: [number, number]): number {
        /* we use Manhattan dis for better performance */
        const d = (Math.abs(p2[0] - p1.x) + Math.abs(p2[1] - p1.y));
        return d;
    }


    /* node fade In */
    static fadeOut(node: Node, cb?) {
        tween(node).to(0.2, { scale: ZERO }, { easing: 'elasticOut' }).call(() => {
            cb && cb();
        }).start();
    }

    /**
     * @description: Clear sprite and release memory
     * @param {Sprite} sp
     * @return {*}
     */
    static clearSprite(sp: Sprite) {
        const sf = sp.spriteFrame as SpriteFrame;
        if (sf) {
            sp.spriteFrame = null;
            if (sf && sf.refCount > 0) {
                sf.decRef();
                const tex = sf.texture as Texture2D;
                this.clearTex(tex)
            }
        }
    }

    /**
     * @description: Clear texture2D and release memory
     * @param {Texture2D} tex
     * @return {*}
     */
    static clearTex(tex: Texture2D) {

        if (tex && tex.refCount > 0) {
            tex.decRef();
            const image = tex.image as ImageAsset;
            if (image && image.refCount > 0) {
                image.decRef();
            }
        }
    }

    /* convert from 3D to UI node with uimesh Renderer, if flase, revert it */

    static convertUI(node: Node, is2D = true) {

        if (is2D) {
            node.addComponent(UIMeshRenderer);

            node.layer = Layers.Enum.UI_2D;

            node.setScale(42, 42, 42)

        } else {
            node.setScale(0.5, 0.5, 0.5)

            node.layer = Layers.Enum.DEFAULT;

            let ui = node.getComponent(UIMeshRenderer);

            ui && ui.destroy();

            let prefab = ResMgr.ins.getPrefab("")
        }
    }

    static clearPoly(poly: PolygonCollider2D) {
        const L = poly.points.length;
        if (L > 0) {
            for (var v = L - 1; v >= 0; v--) {
                VecPool.ins.Vec2 = poly.points.shift();
                if (v == 0) {
                    poly.points.length = 0;
                    poly.apply();
                }
            }
        }

    }





}

