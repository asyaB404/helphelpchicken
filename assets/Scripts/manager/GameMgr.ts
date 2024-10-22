/*
 * @Descripttion: 
 * @version: 
 * @Author: iwae
 * @Date: 2022-09-19 23:18:17
 * @LastEditors: iwae iwae@foxmail.com
 * @LastEditTime: 2022-11-14 15:28:45
 */
import { _decorator, EventTouch, Touch, Vec2, Vec3, Node, Component, input, Input, Graphics, UITransform, Color, RigidBody2D, PolygonCollider2D, PhysicsSystem2D, ERaycast2DType, RaycastResult2D, __private, PhysicsGroup, Collider2D, director, ERigidBody2DType, Animation } from 'cc';
import { collisions, events, Key, topStates, ui } from '../enum/Enums';
import { GameConfig } from '../GameConfig';
import { Global } from '../Global';
import { buildGrid } from '../libs/Astar';
import { lineLogic } from '../logic/lineLogic';
import { GridConfig } from '../MapEditor/GridConfig';
import { Tools } from '../utils/Tools';
import { PathFindMgr } from './PathFindMgr';
import { PoolMgr } from './PoolMgr';
import ResMgr from './ResMgr';
const v2_0 = new Vec2();
const v2_1 = new Vec2();
const v2_2 = new Vec2();
const v3_0 = new Vec3();

const rayMask = collisions.trap + collisions.player + collisions.brick;


/* its a component for main game logic */
export class GameMgr extends Component {

    public tutorGc: Graphics = null;

    private gc: Graphics = null;
    /* for 1st touch on screen, get its id and store */
    private touchID = null;

    private dis = 0;

    private line: Node = null;

    private trans: UITransform = null;

    private rigid: RigidBody2D = null;

    private polys: PolygonCollider2D[] = [];

    private points: [number, number][] = [];

    private lineLength = GameConfig.gameLineLength / GameConfig.timeScale;

    private _inited = false;

    private Physics: PhysicsSystem2D;

    private static _ins: GameMgr = null;


    public static get ins() {
        if (!this._ins) {
            this._ins = new GameMgr();
        }
        return this._ins;
    }


    init() {

        if (!this._inited) {

            PathFindMgr.ins.init(buildGrid(GridConfig.x, GridConfig.y));

            this.Physics = PhysicsSystem2D.instance;

            this.trans = Global.layer[1].getComponent(UITransform);

            this.initTutorialLine();

            this.initGameLine();

            this._inited = true;

        }

        this.changePen(Global.currentPen)

        this.regEnvents();
        this.resetLine();

    }


    /**
     * @description: change the game drawing line's color and mat
     * @return {*}
     */
    changePen(index) {

        const penConfig = GameConfig.penConfigs[index];

        const matName = penConfig.penName;

        const mat = ResMgr.ins.getMat(matName);

        this.gc.material = mat;

        this.gc.strokeColor = penConfig.penColor;

    }

    /**
     * @description: init the game drawing line
     * @return {*}
     */
    initGameLine() {

        this.line = new Node("lineNodeLayer");

        this.lineLength *= Global.screenRatio;


        this.line.parent = Global.layer[2];

        this.rigid = this.line.addComponent(RigidBody2D);

        this.rigid.type = ERigidBody2DType.Dynamic;

        // this.rigid.bullet = true;

        this.rigid.gravityScale = 2;

        /* only the graphic line use Default group */

        this.rigid.linearDamping = 0.2;

        this.rigid.angularDamping = 0.2;

        this.rigid.group = PhysicsGroup.DEFAULT;

        this.gc = this.line.addComponent(Graphics);

        this.gc.lineJoin = 0;

        this.gc.lineCap = 0;

        this.gc.lineWidth = GameConfig.lineWidth;

    }

    /**
     * @description: init the game tutorial line , you can change the stroke color.
     * @return {*}
     */
    initTutorialLine() {

        const tutorialLine = new Node("tutoriallineNodeLayer");

        tutorialLine.parent = Global.layer[2];

        this.tutorGc = tutorialLine.addComponent(Graphics);

        this.tutorGc.lineJoin = 0;
        this.tutorGc.lineCap = 0;

        this.tutorGc.strokeColor = Color.CYAN;

        this.tutorGc.lineWidth = GameConfig.lineWidth;

    }


    regEnvents() {

        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);

        director.on(events.changePen, this.changePen, this);

    }

    unRegEvents() {
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.off(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        director.off(events.changePen, this.changePen, this);

        this.rigid.sleep();
    }

    getUIpos(pos: Vec2): Vec3 {

        v3_0.set(pos.x, pos.y);

        this.trans.convertToNodeSpaceAR(v3_0, v3_0);

        return v3_0;
    }

    resetLine() {
        this.Physics.gravity = v2_0.set(0, 0);
        Global.isDraw = false;

        if (this.points.length == 0 && this.polys.length == 0) {
            return;
        }
        this.rigid.linearVelocity = Vec2.ZERO;
        this.rigid.angularVelocity = 0;
        this.rigid.sleep();
        this.points.length = 0;
        this.line.setPosition(Vec3.ZERO);
        this.line.angle = 0;

        const L = this.polys.length;
        if (L > 0) {
            for (var i = 0; i < L; i++) {
                if (i < 120) {
                    const poly = this.polys[i];
                    Tools.clearPoly(poly);
                } else {
                    const poly = this.polys.pop();
                    Tools.clearPoly(poly);
                    poly.destroy();
                }
            }
        }
        this.gc.clear();



    };


    /* touch logic while on Touch */

    onTouchStart(event?: EventTouch) {
        if (!Global.start || Global.drawEnd) return;

        const touch = event.touch as Touch;

        const id = touch.getID();

        if (this.touchID != null) {
            if (id != this.touchID) {
                return;
            }
        } else {

            this.touchID = id;
        }

        if (Global.isDraw) return;
        director.emit(events.startDraw, true);

        Global.isDraw = true;

        this.resetLine();

        touch.getUILocation(v2_0);

        const pos = this.getUIpos(v2_0);

        this.showTouch(pos);

        this.dis = this.lineLength;

    }



    /* touch logic while moving */
    onTouchMove(event?: EventTouch) {
        if (!Global.start || Global.drawEnd) return;

        const touch = event.touch as Touch;

        const id = touch.getID();

        if (id != this.touchID) {
            return;
        }

        touch.getDelta(v2_0);

        this.dis += Math.abs(v2_0.x) + Math.abs(v2_0.y);

        if (this.dis >= this.lineLength) {

            touch.getUILocation(v2_1);
            const pos = this.getUIpos(v2_1);
            const L = this.points.length;
            if (L == 0) {
                /* if the 1st point, just check point,else check Ray */

                if (!this.checkPoint(v2_1)) {
                    this.gc.moveTo(pos.x, pos.y);
                    this.storePoint(pos);
                }

            } else {
                /* if line interacted with colliders(except for water), end the draw */
                if (this.checkRay(v2_1, v2_2)) {
                    this.onTouchEnd(event);
                } else {
                    this.gc.lineTo(pos.x, pos.y);
                    this.gc.stroke();
                    this.storePoint(pos);

                }
            }


        }

    }

    storePoint(pos) {

        v2_2.set(v2_1);
        lineLogic.pushPoints(this.points, [pos.x, pos.y]);
        this.dis = 0;

    }

    onTouchEnd(event?: EventTouch) {
        if (!Global.start || Global.drawEnd) return;
        const touch = event.touch as Touch;

        const id = touch.getID();

        if (id != this.touchID) {
            return;
        }

        this.touchID = null;

        touch.getUILocation(v2_1);

        const pos = this.getUIpos(v2_1);

        this.showTouch(pos);

        this.drawPhysic();

    }



    drawPhysic() {

        const pL = this.points.length;

        if (pL <= 1) {
            director.emit(events.startDraw, false);

            Global.isDraw = false;
            return;
        }

        // Global.start = false;
        Global.drawEnd = true;

        let k = 0;

        for (var i = 0; i < pL - 1; i++) {

            if (i == 0) {
                k = 1
            }
            else if (i == (pL - 2)) {
                k = 2;
            }
            else {
                k = 0;
            }

            if (!this.polys[i]) {

                const poly = this.line.addComponent(PolygonCollider2D)

                /* clear pre created 4 vec2 points */

                this.polys[i] = poly;

            }
            const p1 = this.points[i];
            const p2 = this.points[i + 1];

            lineLogic.setPolyBox(this.polys[i], p1, p2, k);

        }

        if (Global.isTutorial) {
            Global.isTutorial = false;
            this.tutorGc.clear();

        }

        this.scheduleOnce(() => {
            this.rigid.wakeUp();

            PhysicsSystem2D.instance.gravity = v2_1.set(0, GameConfig.gravity * GameConfig.timeScale);

            director.emit(events.finishDraw);

            director.emit(Key.Timer, Global.time);

        })

    }

    /* show touch eff */
    public async showTouch(pos: Vec3 | [number, number]) {
        const touch = await ResMgr.ins.getUI(ui.TouchView);

        if (!pos[0]) {
            touch.setPosition(pos as Vec3);
        } else {
            touch.setPosition(pos[0], pos[1]);
        }

        touch.getComponent(Animation).play();

        this.scheduleOnce(() => {
            PoolMgr.ins.putNode(touch);
        }, 1)

    }


    /* check physic hit */
    checkPoint(p0: Vec2): boolean {
        /* if no points stored here, we just need to check the point */

        const result = this.Physics.testPoint(p0) as Collider2D[];

        if (result.length == 0) {
            return false;
        } else {
            /* except the water, the 1st point could start in water */
            if (result[0].group == collisions.water) {
                return false;
            } else {
                return true;
            }
        }
    }

    /* check physic hit */
    checkRay(p0: Vec2, p1: Vec2): boolean {
        /* use ray to detect the inter of line between this point and last point */
        const result = this.Physics.raycast(p1, p0, ERaycast2DType.Closest, rayMask) as RaycastResult2D[];

        return (result.length == 0) ? false : true;
    }

}




