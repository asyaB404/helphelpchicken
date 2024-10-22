/*
 * @Author: error: git config user.name && git config user.email & please set dead value or install git
 * @Date: 2022-09-19 00:19:54
 * @LastEditors: iwae
 * @LastEditTime: 2022-11-13 23:57:09
 * @FilePath: /yangyang/assets/Scripts/manager/LevelMgr.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

import { _decorator, Node, Vec3, tween, director, Component } from 'cc';
import texts, { Clips, events, Key, topStates } from '../enum/Enums';
import { GameConfig } from '../GameConfig';
import { Global } from '../Global';
import { load, Tools } from '../utils/Tools';
import { EnergyMgr } from './EnergyMgr';
import { PoolMgr } from './PoolMgr';
import ResMgr from './ResMgr';

const v = /* as temp Vec3 */new Vec3();

export class LevelMgr extends Component {

    private static _ins: LevelMgr = null;

    private data = []


    public static get ins() {
        if (!this._ins) {
            this._ins = new LevelMgr();
        }
        return this._ins;
    }


    loadLevel(data?) {
        Global.players = [];

        if (data) {
            this.data = data;
            this.initLevel(data);
            GameConfig.setStrenth(12);

        } else {

            data = LevelMgr.loadLevel();

            GameConfig.setStrenth(Global.level);

            if (data) {
                this.data = data;
                this.initLevel(data);
            }

        }

    }


    restartGame() {

        if (this.data) {
            this.initLevel(this.data);
        }

    }
    initLevel(json) {

        director.emit(events.changeTop, topStates.hideStore);

        director.emit(events.clearMap)

        director.emit(Key.Timer, 0);

        const mapData = json.mapData;
        // const config = json.config;

        if (!mapData) return;

        const L = mapData.length;

        if (L > 0) {


            for (var i = 0; i < L; i++) {

                const data = mapData[i];

                const name = data[0] as string;

                const node = PoolMgr.ins.getNode(name);

                this.setItem(data, node);

            }
            const lineL = json.points.length;

            if (lineL > 0) {

                Global.tutorialPoints = json.points;


            }
            else {
                Global.tutorialPoints.length = 0;
            }

            this.scheduleOnce(() => {
                Global.isDraw = false;
                Global.drawEnd = false;
                Global.start = true;
                director.emit(events.initTrap, Tools.getOne());

            })
            // director.emit(events.Toast, "加载关卡成功", 1);

        } else {
            director.emit(events.Toast, texts.gameText.map.loadFail, 1);
        }
    }


    /* load level from json parsed */
    static loadLevel(): object {

        let level = Global.level;

        if (level > Global.maxLevel) {

            level = Global.maxLevel;

        }

        Global.time = GameConfig.getTimer(level);

        director.emit(events.Toast, texts.gameText.map.currentLevel + level)

        const data = ResMgr.ins.getJson("" + level) as object;

        return data;

        /* Game Starts */


    }


    setItem(data: number[], item: Node) {
        /*  instantiate the new item */

        if (item.name.indexOf("player") != -1) {
            item.parent = Global.playersLayer;
            Global.players.push(item);
        } else {
            item.parent = Global.bricksLayer;
        }
        GameConfig.setMapItem(data, item, true);

    }





}

