import { _decorator, Component, Node, director, Animation, Vec3 } from 'cc';
import { events } from '../enum/Enums';
import { GameConfig } from '../GameConfig';
import { Global } from '../Global';
import { PoolMgr } from '../manager/PoolMgr';
import EnemyAI from './EnemyAI';
const { ccclass, property } = _decorator;

/* we put this into ui ,which will be preloaded */
const enemyPrefab = "BlackChick";

@ccclass('EnemyMgr')
export class EnemyMgr extends Component {

    anm: Animation;

    private index = 0;

    private pos = new Vec3();

    start() {
        this.anm = this.getComponent(Animation)
    }


    onEnable() {
        director.on(events.finishDraw, this.initEnemies, this);

    }

    onDisable() {
        director.off(events.finishDraw, this.initEnemies, this);
        this.unschedule(this.stopAnm);
        this.anm.pause();
    }

    initEnemies() {

        this.anm.play();

        const time = 0.1 * GameConfig.levelEnemies;

        this.scheduleOnce(this.stopAnm, time);

        this.schedule(this.spawnEnemy, 0.1, GameConfig.levelEnemies);

    }

    stopAnm() {
        this.anm.stop();
    }

    getIndexPos() {
        if (this.index > 3) this.index = 0;

        const pos = this.node.position;


        const x = (this.index % 2) * 60 - 30 + pos.x;

        const y = Math.floor(this.index / 2) * 60 - 30 + pos.y;

        this.pos.set(x, y);

        this.index++;

        return this.pos;

    }

    spawnEnemy() {

        const enemy = PoolMgr.ins.getNode(enemyPrefab, Global.bricksLayer, this.getIndexPos());

        enemy.getComponent(EnemyAI).initFSM();

    }


}

