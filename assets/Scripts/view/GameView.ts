import { _decorator, Node, director, PhysicsSystem2D, Vec2, RigidBody2D } from 'cc';
import texts, { events, Key, topStates, ui } from '../enum/Enums';
import { Global } from '../Global';
import { GameMgr } from '../manager/GameMgr';
import { LevelMgr } from '../manager/LevelMgr';
import { PathFindMgr } from '../manager/PathFindMgr';
import { PoolMgr } from '../manager/PoolMgr';
import ResMgr from '../manager/ResMgr';
import { BaseView } from './BaseView';
import { ResultView } from './ResultView';
const { ccclass, property } = _decorator;

@ccclass('GameView')
export class GameView extends BaseView {

    @property(Node)
    bricksLayer: Node = null;

    @property(Node)
    playersLayer: Node = null;

    @property(Node)
    btnsLayer: Node = null;

    /* tutorial line's length */
    private pIndex = 0;

    public source: number = 0;

    public static ins: GameView = null;

    start() {
        GameView.ins = this;

    }

    onEnable() {
        Global.bricksLayer = this.bricksLayer;
        Global.playersLayer = this.playersLayer;
        director.emit(events.changeTop, topStates.showClock);
        director.on(events.showResult, this.GameResult);
        director.on(events.restartGame, this.restartGame, this);
        director.on(events.clearMap, this.clearMap, this);
        director.on(events.startDraw, this.hideBtns, this)
        director.on(events.closeGame, this.goBack, this)

    }

    async GameResult() {

        const view = await ResMgr.ins.getUI(ui.ResultView);

        view.getComponent(ResultView).init();
    }

    onDisable() {
        director.off(events.startDraw, this.hideBtns, this)
        director.off(events.clearMap, this.clearMap, this);
        director.off(events.showResult, this.GameResult);
        director.off(events.restartGame, this.restartGame, this);
        // Global.layer[7].destroyAllChildren()
        director.off(events.closeGame, this.goBack, this)

        /* clear timer */
        director.emit(Key.Timer, 0);
        GameMgr.ins.resetLine();
        GameMgr.ins.unRegEvents();

        if (Global.isTutorial) {
            Global.isTutorial = false;
            GameMgr.ins.tutorGc.clear();
        }
        Global.start = false;
        Global.isDraw = false;
        this.clearMap();
        director.emit(Key.Timer, 0);

    }

    /* source 0 for home,1 for build view, where it comes from */
    init(source: 0 | 1, data?) {

        this.source = source;

        if (source == 1) {
            Global.time = 9;
        }

        PhysicsSystem2D.instance.gravity = Vec2.ZERO;

        GameMgr.ins.init();

        PathFindMgr.ins.clear();

        LevelMgr.ins.loadLevel(data);


    }

    /**
     * @description: hide the btns while game starts
     * @return {*}
     */
    hideBtns(visible: boolean) {
        this.btnsLayer.active = !visible;
    }


    restartGame() {

        LevelMgr.ins.restartGame();

    }

    skipLevelBtn() {

        super.showVideo(() => {
            this.GameResult();
        })


    }



    private lineL = 0;
    lineTipBtn() {

        if (Global.isDraw) return;

        this.lineL = Global.tutorialPoints.length;
        if (this.lineL == 0) {

            director.emit(events.Toast, texts.gameText.game.noTutorial);
            return;
        } else {

            super.showVideo(() => {
                this.showTutorial();
            })
                ;
        }

    }

    /**
     * @description: show tutorial lines
     * @return {*}
     */
    showTutorial() {
        Global.start = false;
        Global.isTutorial = true;
        GameMgr.ins.resetLine();
        this.pIndex = 0;
        this.unschedule(this.drawLine);
        this.schedule(this.drawLine, 0.06, this.lineL)

    }

    drawLine() {

        const pos = Global.tutorialPoints[this.pIndex];
        /* tutorGC and game's line are diff */

        if (this.pIndex == 0) {
            GameMgr.ins.tutorGc.moveTo(pos[0], pos[1]);

            GameMgr.ins.showTouch(pos);

        } else {
            GameMgr.ins.tutorGc.lineTo(pos[0], pos[1]);
            GameMgr.ins.tutorGc.stroke();
        }

        this.pIndex++;

        if (this.pIndex == this.lineL) {
            Global.start = true;
            GameMgr.ins.showTouch(pos);
            this.unschedule(this.drawLine);
        }

    }



    clearMap() {
        director.emit(events.paperOcacity, 55);

        GameMgr.ins.resetLine();
        const bL = this.bricksLayer.children.length;
        for (var i = bL - 1; i >= 0; i--) {
            const node = this.bricksLayer.children[0];
            const rigid = node.getComponent(RigidBody2D);
            if (rigid) {
                rigid.linearVelocity = Vec2.ZERO;
                rigid.angularVelocity = 0;
            }

            PoolMgr.ins.putNode(node);
        }
        const cL = this.playersLayer.children.length;
        for (var i = cL - 1; i >= 0; i--) {
            const node = this.playersLayer.children[0];
            const rigid = node.getComponent(RigidBody2D);
            if (rigid) {
                rigid.linearVelocity = Vec2.ZERO;
                rigid.angularVelocity = 0;
            }
            PoolMgr.ins.putNode(node);
        }
        this.btnsLayer.active = true;

    }

    goBack() {
        super.close();
        director.emit(Key.Timer, 0);
        if (this.source == 0) {
            PoolMgr.ins.getNode("HomeView", Global.layer[1]);
        } else {
            ResMgr.ins.getUI(ui.BuildView);
        }

    }



}

