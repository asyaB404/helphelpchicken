import { _decorator, Node, Vec3, director, RigidBody2D, Vec2, ERaycast2DType, RaycastResult2D, PhysicsSystem2D, math } from "cc";
import { GridCtrl } from "../ctrl/GridCtrl";
import { collisions, events } from "../enum/Enums";
import { GameConfig } from "../GameConfig";
import { Global } from "../Global";
import FSM from "../libs/FSM";
import { PathFindMgr } from "../manager/PathFindMgr";
import { GridConfig } from "../MapEditor/GridConfig";
import { Tools } from "../utils/Tools";

const rad = 3.1415926 / 180;

const rayMask = collisions.DEFAULT;

const { ccclass, property } = _decorator;

const STATE = {
    Forward: "Forward",
    Idle: "Idle",
    Atk: "Atk",
}

@ccclass("EnemyAI")
export default class EnemyAI extends FSM {

    private speed: number = 10;

    static STATE = STATE;

    atk: number
    rndTime = 0.5;
    target = new Node;
    roleAngel = 0;

    cd = 1

    skip = 0;

    private rigid: RigidBody2D;

    private path: [number, number][] = [];

    private targetPos: [number, number] = [0, 0];

    private lineRigid: RigidBody2D = null;

    private _forward = new Vec2();

    private _speed = new Vec2();

    private _moveNext = false;

    private pos1 = new Vec2();
    private pos2 = new Vec2();



    onEnable() {
        director.on(events.gameWin, this.stopAI, this);
    }


    onDisable() {
        director.off(events.gameWin, this.stopAI, this);
        /* paused FSM */

        this.stopAI();
    }

    stopAI() {
        this.paused = true;

        this.RemoveAllState();

        this._speed.x = this._speed.y = 0;

        this.rigid.linearVelocity = Vec2.ZERO;

        this.path.length = 0;

        this.target = null;
    }

    initFSM() {
        this.addStates(STATE);
        this.speed = GameConfig.enemySpeed;
        if (!this.rigid) {
            this.rigid = this.node.getComponent(RigidBody2D);
        }
        this.target = Tools.getCloestNode(this.node, Global.players);
        this.path.length = 0;
        this.paused = false;
        this.changeState(STATE.Forward);
    }

    targetPlayer() {

        if (!this.target) this.target = Tools.getCloestNode(this.node, Global.players);

        this.targetPos = [this.target.position.x, this.target.position.y];
        const dis = Tools.getDistance(this.node.position, this.targetPos)

        if (dis > GridConfig.size * 2) {
            this.path = PathFindMgr.ins.getPath(this.node.position, this.target.position);

            if (this.path.length > 0) {
                this.targetPos = this.path.shift();
            }
        }
        this.rotateRole(this.targetPos);


    }

    checkPath() {
        if (this.path.length > 0) {
            if (this._moveNext) {
                this.targetPos = this.path.shift();
                this._moveNext = false;
            }
            this.rotateRole(this.targetPos);

        } else {
            this.targetPlayer();

        }

    }

    onForwardEnter() {
        if (!Global.start) return
        this.rigid.wakeUp();

        this.cd = 0.25 + Math.random() * 0.4;

        this.checkPath();

    }


    onForwardUpdate() {
        if (!Global.start) return

        if (!this.targetPos) {
            this.changeState(STATE.Forward);

        }
        const dis = Tools.getDistance(this.node.position, this.targetPos)

        if (dis < 8) {
            this._moveNext = true;
            this.changeState(STATE.Forward);
        }

        this.skip++;
        if (this.skip > 3) {
            this.rotateRole(this.targetPos);
            this.skip = 0;
        }

        this.run(this.dt, this.speed);

    }


    run(dt: number, speed: number) {

        this.pos1.set(this.node.worldPosition.x, this.node.worldPosition.y);
        Vec2.multiplyScalar(this._speed, this._forward, speed * dt * 60)
        /* set the length of the ray */
        this.pos2.x = this.pos1.x + this._speed.x * GameConfig.pullRange;
        this.pos2.y = this.pos1.y + this._speed.y * GameConfig.pullRange;
        const result = this.checkRay(this.pos1, this.pos2);
        if (result) {
            /* pulseX for the line, which shake the line in x diretion */
            const pulseX = GameConfig.pullStrenth * (-3 + 6 * Math.random());
            /* pulseY for the line, which upper the line in y direction */
            const pulseY = GameConfig.pullStrenth * (1 + Math.random())
            /* pulled the line */
            this._speed.set(pulseX, pulseY);
            this.lineRigid.applyLinearImpulseToCenter(this._speed, true);
            if (this.duration > this.cd) {
                this.changeState(STATE.Atk);
                return;
            }

            // this.rigid.linearVelocity = Vec2.ZERO;
        } else {
            this.rigid.linearVelocity = this._speed;

        }


    }

    onAtkEnter() {
        if (!Global.start) return
        // this.target = Tools.getRandomTarget(Global.players);
        this.rigid.wakeUp();
        this.rigid.linearVelocity = Vec2.ZERO;
        this.rotateRole([this.target.position.x, this.target.position.y])
        this._speed.x = -(300 * Math.random() + 100) * this._forward.x;
        this._speed.y = -(300 * Math.random() + 100) * this._forward.y;
        this.rigid.applyForceToCenter(this._speed, true);
        this.cd = 0.08 + 0.08 * Math.random();
    }
    onAtkUpdate() {
        if (!Global.start) return

        // this.runAtk(this.dt,1,distance)
        if (this.duration >= this.cd) {
            this.target = Tools.getCloestNode(this.node, Global.players);
            this.rotateRole([this.target.position.x, this.target.position.y])
            this._speed.x = 200 * this._forward.x * (0.7 + Math.random() * 0.3);
            this._speed.y = 200 * this._forward.y * (0.7 + Math.random() * 0.3);
            this.rigid.applyForceToCenter(this._speed, true);
            this.changeState(STATE.Forward);
        }
    }


    /* check physic hit */
    checkRay(p0: math.IVec2Like, p1: math.IVec2Like): boolean {
        /* use ray to detect the inter of line between this point and last point */
        const result = PhysicsSystem2D.instance.raycast(p0, p1, ERaycast2DType.Closest, rayMask) as RaycastResult2D[];
        if (result.length == 0) {
            return false;
        } else {
            if (!this.lineRigid) {
                this.lineRigid = result[0].collider.node.getComponent(RigidBody2D);
            }
            return true;
        }

    }

    rotateRole(pos: [number, number]) {

        this._forward.set(pos[0] - this.node.position.x, pos[1] - this.node.position.y).normalize().multiplyScalar(Global.scale);
        this.roleAngel = (Math.atan2(this._forward.x, this._forward.y) / rad);
        this.node.angle = this.roleAngel;
    }


}