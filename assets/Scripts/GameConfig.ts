/*
 * @Descripttion: 
 * @version: 
 * @Author: iwae
 * @Date: 2022-11-09 21:57:00
 * @LastEditors: iwae iwae@foxmail.com
 * @LastEditTime: 2022-11-14 15:33:17
 */

import { Node, Vec4, _decorator } from 'cc';
import { penConfig } from './enum/Enums';
import { Global } from './Global';
import { PathFindMgr } from './manager/PathFindMgr';
import { GridConfig } from './MapEditor/GridConfig';
/* the half size of width & height */
const halfX = GridConfig.x * GridConfig.size * 0.5;
const halfY = GridConfig.y * GridConfig.size * 0.5;

export class GameConfig {


    static maxShareLength = 2048;

    /* AI configs */
    static pullRange = 2;

    static pullStrenth = 2;

    static levelEnemies = 2;

    static enemySpeed = 8.5;

    static penConfigs: penConfig[];


    static lineWidth = 18;

    /* game gravity */

    static gravity = -500;

    static timeScale = 1;

    /* the tutorial line length should be much shorter than normal, to reduce the level config's data size */

    static tutorialLineLength = 40;

    /* game line length, the smaller, more smooth */

    static gameLineLength = 16;

    static skinList = ["cat"]

    /* amount for energy added */
    static addEnergy = 20;

    static levelEnergy = 5;

    /* 300s recovery 1 egg,which is 5mins */
    static recoveryEnergyTime = 300;

    /* start energy, and also for daily energy recovery */
    static startEnergy = 25;

    /* max levels, for demo is 10 */
    static maxLevel = 10;

    static playerOffset = -22;

    static startShuffle = 2;

    static startFrost = 1;

    static startUndo = 3;

    static setMapItem(data: number[], item: Node, runtime: boolean = false) {


        const isPlayer = (item.name.indexOf("player") != -1);
        const isEnemy = (item.name.indexOf("enemy") != -1);

        if (runtime && !isPlayer && !isEnemy) {
            /* fill the each tileset of collider map */
            for (var x = data[1]; x < data[2]; x++) {
                for (var y = data[3]; y < data[4]; y++) {
                    PathFindMgr.ins.setNode([x, y]);
                }
            }
        }

        item.setScale(data[5], data[6]);
        item.angle = 0;
        /* if player closer to the ground */
        const offset = isPlayer ? this.playerOffset : 0;

        const xPos = (data[1] + data[2]) * 0.5 * GridConfig.size - halfX;
        const yPos = (data[3] + data[4]) * 0.5 * GridConfig.size - halfY;
        item.setPosition(xPos, yPos + offset);
    }

    /* caculate the total time for each level, use the math below */
    static getTimer(level: number) {
        let time = 6 + Math.floor(level / 3) + Math.floor(level / 5);
        if (time > 14) time = 14
        return time;
    }


    /* set AI strenth */
    static setStrenth(level: number) {
        this.pullStrenth = 0.95 + Math.floor(level / 3) * 0.4 + Math.floor(level / 11) * 1.4;
        if (this.pullStrenth > 13) this.pullStrenth = 13;

        this.pullRange = 2 + Math.floor(level / 4) * 0.3 + Math.floor(level / 10) * 0.5;

        if (this.pullRange > 12) this.pullRange = 12;

        this.levelEnemies = 1 + Math.floor(level / 6) + Math.floor(level / 15);

        // this.levelEnemies = 0;
        if (this.levelEnemies > 10) this.levelEnemies = 10;

    }

    /* get level ranks, which is the stars, use remaining time devided by 5 */
    static getRank() {
        let rank = Math.floor(Global.time / 5);
        if (rank > 3) rank = 3;
        return rank;
    }

}

