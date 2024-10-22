import { Node, Vec3, instantiate, Vec2, Input, input, Vec4, EventTouch, UITransform, Material, Sprite, Graphics, Color, Touch, director } from "cc";
import { GameConfig } from "../../Scripts/GameConfig";
import { Tools } from "../../Scripts/utils/Tools";
import texts, { events } from "../enum/Enums";
import { GridConfig } from "./GridConfig";
import { MapItem } from "./MapItem";

const v2_0 = new Vec2();
const v2_1 = new Vec2();
const v3_0 = new Vec3();
const v4_0 = new Vec4();


export class EditorMgr {

    public item: MapItem = null!;

    public gridmap: Node[][] = [];
    /* map to store map data only */
    public mapData: Map<Node, Array<number>> = new Map();

    public outPut: Node = null!;

    /* the line points stored, which is used for guide line */
    public points: any[] = [];

    public gc: Graphics = null;

    private line: Node = null;

    private gizmo: Node = null;
    private trans: UITransform = null;
    private touchID = null;
    private gridMat: Material = null;

    /* may to store collder, the first 4 slots for grid info, the last one for node info*/
    private colliderMap: Array<any>[] = [];
    /* to save data */
    private lineLength = GameConfig.tutorialLineLength / GameConfig.timeScale;
    private dis = 40;

    private isEnd = false;
    private isPlayer = false;


    public init(gizmo: Node, grid: Material, trans: UITransform, outPut: Node) {

        this.gizmo = gizmo;
        this.gridMat = grid;
        this.trans = trans;
        this.outPut = outPut;

        this.line = new Node("line");

        // this.line.layer = Layers.Enum.UI_2D;

        this.line.parent = this.outPut.parent;

        this.gc = this.line.addComponent(Graphics);

        this.gc.lineJoin = 2;

        this.gc.lineCap = 0;
        this.gc.strokeColor = Color.BLACK;

        this.gc.lineWidth = 14;

        /* reg keys inputs */

        for (var i = 0; i < GridConfig.x; i++) {
            this.colliderMap[i] = [];
        }
    }

    registerEvents() {
        /* reg touch inputs */
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);

    }


    unRegisterEvents() {
        /* reg touch inputs */
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.off(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);

    }

    clear() {
        this.mapData.clear();
        this.clearLine();

        for (var i = 0; i < GridConfig.x; i++) {
            this.colliderMap[i] = [];
        }
        this.outPut.destroyAllChildren();

    }


    setGridSelect(pos?: Vec3, range?: number[]) {

        /* if no pos passed, just clear the grid */
        if (!pos) {
            this.gridMat.setProperty("warn", Vec4.ZERO);
            this.gridMat.setProperty("select", Vec4.ZERO);
            return;
        }

        /* if odd, the xx or yy shold be 1 */
        const xx = Math.ceil(range[0] % 2);
        const yy = Math.ceil(range[1] % 2);

        /* roughly calcuted grid size */
        const x = (xx == 1) ? Math.floor(GridConfig.x * 0.5 + (pos.x) / GridConfig.size) : Math.round(GridConfig.x * 0.5 + (pos.x) / GridConfig.size);
        const y = (yy == 1) ? Math.floor(GridConfig.y * 0.5 + (pos.y) / GridConfig.size) : Math.round(GridConfig.y * 0.5 + (pos.y) / GridConfig.size);

        /* actually postion of x&y, which added with the offset, based on if the x/y is odd */
        this.gizmo.setPosition((x + (xx - GridConfig.x) * 0.5) * GridConfig.size, (y + (yy - GridConfig.y) * 0.5) * GridConfig.size);

        const width = Math.floor(range[0] / 2);
        const height = Math.floor(range[1] / 2);

        /* v4.xy for x boundries */
        v4_0.set((x - width), (x + width + 1 * xx), (y - height), (y + height + 1 * yy));

        /* the side boundries of this game */
        const boarder = (v4_0.x < 0 || v4_0.y > GridConfig.x);
        /* if inter with borader show warn and return */
        if (boarder) {
            this.gridMat.setProperty("warn", v4_0.multiplyScalar(0.1));
            this.gridMat.setProperty("select", Vec4.ZERO);
            return;
        }

        /* check if the grids inter with others */
        const result = this.checkCollider();

        if (result) {
            /* detect collider map */

            if (this.item.isDelete) {
                this.deleteItem(result);
                this.gridMat.setProperty("warn", v4_0.set(result[0], result[1], result[2], result[3]).multiplyScalar(0.1));
            } else if (this.item.isRotate) {
                if (this.isEnd) {
                    this.rotateItem(result);
                }
                this.gridMat.setProperty("warn", Vec4.ZERO);

            } else {
                this.gridMat.setProperty("warn", v4_0.multiplyScalar(0.1));
            }
            this.gridMat.setProperty("select", v4_0.set(result[0], result[1], result[2], result[3]).multiplyScalar(0.1));

            return;
        }
        /* instantiate new node,if the brick can be brushed while move or in touch end */
        if ((this.item.isBrush || this.isEnd) && !this.item.isDelete && !this.item.isRotate) {
            const item = instantiate(this.item.sp.node);
            this.buildItem(this.gizmo.position, v4_0, item);
        }
        this.gridMat.setProperty("select", v4_0.multiplyScalar(0.1));
        /* clear warn */
        this.gridMat.setProperty("warn", Vec4.ZERO);

    }

    rotateItem(result) {

        const width = result[1] - result[0];
        const height = result[3] - result[2];
        const item = result[4] as Node;

        if (item) {
            v3_0.set(item.scale);
            if (width >= height) {
                v3_0.x *= -1;
            } else {
                v3_0.y *= -1;
            }
            item.setScale(v3_0);
        }

    }

    deleteItem(result) {
        v4_0.set(result[0], result[1], result[2], result[3]);
        /* clear the collider map */
        for (var i = v4_0.x; i < v4_0.y; i++) {
            for (var j = v4_0.z; j < v4_0.w; j++) {
                this.colliderMap[i][j] = null;
            }
        }
        const item = result[4] as Node;

        if (item) {
            this.mapData.delete(item);
            item.destroy()
        }
    }


    setItem(data: any[], item: Node) {
        /*  instantiate the new item */
        item.parent = this.outPut;

        GameConfig.setMapItem(data, item);

        v4_0.set(data[1], data[2], data[3], data[4]);

        this.mapData.set(item, [v4_0.x, v4_0.y, v4_0.z, v4_0.w]);
        /* fill the each tileset of collider map */
        for (var x = v4_0.x; x < v4_0.y; x++) {
            for (var y = v4_0.z; y < v4_0.w; y++) {
                this.colliderMap[x][y] = [v4_0.x, v4_0.y, v4_0.z, v4_0.w, item];
            }
        }
    }
    buildItem(pos: Vec3, grids: Vec4, item: Node, scale = [1, 1]) {
        /*  instantiate the new item */
        item.setScale(scale[0], scale[1]);
        item.parent = this.outPut;
        let offset = this.isPlayer ? GameConfig.playerOffset : 0;
        item.setPosition(pos.x, pos.y + offset);
        this.mapData.set(item, [grids.x, grids.y, grids.z, grids.w]);
        /* fill the each tileset of collider map */
        for (var i = grids.x; i < grids.y; i++) {
            for (var j = grids.z; j < grids.w; j++) {
                this.colliderMap[i][j] = [grids.x, grids.y, grids.z, grids.w, item];
            }
        }
    }

    /* check if the grids are all empty */
    checkCollider() {
        for (var i = v4_0.x; i < v4_0.y; i++) {
            for (var j = v4_0.z; j < v4_0.w; j++) {
                const result = this.colliderMap[i][j];
                if (result) {
                    return result;
                    break;
                }
            }
        }
        return null;
    }

    onTouchStart(event: EventTouch): void {
        const touch = event.touch;

        const id = touch.getID();

        /* only the 1st available touch id could draw line */
        if (this.touchID != null) {
            return;
        } else {
            this.touchID = id;
        }

        this.isEnd = false;
        event.getUILocation(v2_0);

        const pos = this.getUIpos(v2_0);

        if (this.item.isDraw) {

            this.dis = this.lineLength;

            this.clearLine();

            return;

        }

        /* if it is player, it gives a offset, makes player coloser to the ground, to increase the difficulty */
        this.isPlayer = (this.item.name.indexOf("player") != -1) ? true : false;

        const halfHeight = GridConfig.safeY * GridConfig.size * 0.5;

        /* check the boundary */
        if (pos.y < halfHeight && pos.y > - halfHeight + 75) {

            if (this.item.isDraw) {

                this.dis = this.lineLength;

                this.clearLine();

                return;

            }

            this.changeGizmo();

            this.setGridSelect(pos, this.item.grid);
        } else {
            /* cleared */

            director.emit(events.Toast, texts.gameText.map.outMap);
            this.setGridSelect();
        }

    }

    onTouchMove(event: EventTouch): void {
        const touch = event.touch;

        const id = touch.getID();

        if (id != this.touchID) {
            return;
        }

        event.getUILocation(v2_0);

        const pos = this.getUIpos(v2_0);


        const halfHeight = GridConfig.safeY * GridConfig.size * 0.5;

        /* check the boundary */
        if (pos.y < halfHeight && pos.y > - halfHeight + 75) {

            if (this.item.isDraw) {
                this.drawLine(touch, pos);
                return;
            }

            this.setGridSelect(pos, this.item.grid);

        } else {
            /* cleared */
            this.setGridSelect();
        }


    }

    onTouchEnd(event: EventTouch): void {
        const touch = event.touch;

        const id = touch.getID();

        if (id != this.touchID) {
            return;
        }

        this.touchID = null;

        this.isEnd = true;

        if (this.item.isDraw) {
            return;
        }
        event.getUILocation(v2_0);
        const pos = this.getUIpos(v2_0);

        const halfHeight = GridConfig.safeY * GridConfig.size * 0.5;

        if (pos.y < halfHeight && pos.y > - halfHeight + 75) {
            this.setGridSelect(pos, this.item.grid);
        }
        /* cleared */
        this.gizmo.setPosition(-1000, -1000);
        this.setGridSelect();

    }

    drawLine(touch: Touch, pos: Vec3) {
        touch.getDelta(v2_1);
        this.dis += Math.abs(v2_1.x) + Math.abs(v2_1.y);

        if (this.dis > this.lineLength) {

            if (this.points.length == 0) {
                this.gc.moveTo(pos.x, pos.y);

            } else {
                this.gc.lineTo(pos.x, pos.y);
                this.gc.stroke();
            }

            const point = [Tools.fixedTo(pos.x), Tools.fixedTo(pos.y)];

            this.points.push(point);

            this.dis = 0;
        }

    }

    /* get UI pos from world pos */
    getUIpos(pos: Vec2): Vec3 {
        v3_0.set(pos.x, pos.y)
        this.trans.convertToNodeSpaceAR(v3_0, v3_0);
        return v3_0;
    }

    changeGizmo() {
        /* change the sf of the gizmo */
        const sprite = this.gizmo.getComponent(Sprite);
        sprite.color = this.item.sp.color;
        sprite.spriteFrame = this.item.sp.spriteFrame;
        this.gizmo.getComponent(UITransform).setContentSize(this.item.size);
    }

    clearLine() {

        this.gc.clear();
        this.points.length = 0;
    }




    // public undo() {
    //     if (GridConfig.actions.length > 0) {
    //         const action: actionStep = GridConfig.actions.pop();

    //         if (!action.name) {
    //             const item = this.gridmap[action.y][action.x];
    //             if (item) {
    //                 item.destroy();
    //                 this.gridmap[action.y][action.x] = null;
    //             }

    //         }

    //     }
    // }





}