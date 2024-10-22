/*
 * @Author: error: git config user.name && git config user.email & please set dead value or install git
 * @Date: 2022-09-21 13:56:53
 * @LastEditors: iwae iwae@foxmail.com
 * @LastEditTime: 2022-11-14 14:50:38
 * @FilePath: /yangyang/assets/Scripts/view/ResultView.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { _decorator, director, Sprite, Texture2D, view, Node, Toggle } from 'cc';
import texts, { Clips, events, Key, topStates } from '../enum/Enums';
import { GameConfig } from '../GameConfig';
import { Global } from '../Global';
import { AudioMgr } from '../manager/AudioMgr';
import { EnergyMgr } from '../manager/EnergyMgr';
import { LevelMgr } from '../manager/LevelMgr';
import { CamShot } from '../utils/CamShot';
import { save, Tools } from '../utils/Tools';
import { BaseView } from './BaseView';
import { GameView } from './GameView';
const { ccclass, property } = _decorator;

@ccclass('ResultView')
export class ResultView extends BaseView {

    @property(Sprite)
    sp: Sprite = null;
    @property(Node)
    videoNode: Node = null;
    @property(Toggle)
    videoToggle: Toggle = null;

    isWatchAd: Boolean = false;

    start() {

        this.videoToggle.node.on(Toggle.EventType.TOGGLE, this.changeVideoState, this);
    }

    onEnable() {
        director.on(events.startCustom, this.returnHome, this);

    }
    onDisable() {

        director.off(events.startCustom, this.returnHome, this);

    }


    /* not set yet, you can use time to do with score? */
    init() {
        // EnergyMgr.ins.changeStar(r)
        Global.level++;
        if (Global.level > GameConfig.maxLevel) Global.level = GameConfig.maxLevel;
        save(Key.Level, Global.level);
        director.emit(events.Toast, texts.gameText.game.win)
        this.capture();
        director.emit(events.changeTop, topStates.showStore);

        /* 30% to show video */
        if (Global.level > 2 && Math.random() > 0.7) {
            this.isWatchAd = this.videoToggle.isChecked = this.videoNode.active = true;

        } else {
            this.isWatchAd = this.videoToggle.isChecked = this.videoNode.active = false;

        }

    }

    /* go next LEvel */
    async next() {


        if (this.isWatchAd) {

            this.isWatchAd = this.videoToggle.isChecked = this.videoNode.active = false;


            /* give videos reward */
            super.showVideo(() => {

                this.giveVideoReward();

                this.loadLevel();

            })



        } else {
            const energy = EnergyMgr.ins.changeEnergy(false);

            if (!energy) return;
            this.loadLevel();

        }





        // if (EnergyMgr.ins.changeEnergy()) {
        //     // await LevelMgr.ins.loadLevel(Global.level);
        //     super.close();
        // }
    }

    loadLevel() {

        LevelMgr.ins.loadLevel();
        super.close();
    }

    returnHome() {
        director.emit(events.closeGame);
        super.close();

    }

    giveVideoReward() {
        EnergyMgr.ins.changeEnergy(true);
    }

    capture() {
        this.clear();
        CamShot.ins.copyRenderTex(this.sp, this.getPlayersOffset());
        AudioMgr.ins.playSound(Clips.photo);
        this.scheduleOnce(() => {
            AudioMgr.ins.playSound(Clips.win);
        }, 0.8);
        Tools.fadeIn(this.sp.node.parent);
    }

    getPlayersOffset(): [number, number] {

        const players = Global.players;

        const L = players.length;

        let y = 0, x = 0;

        if (L > 0) {
            const playerSize = 90;

            x = Math.round(players[0].position.x);
            y = Math.round(players[0].position.y) + playerSize * 0.4;

            const quaterHeight = Math.round((view.getVisibleSize().height - 720) * 0.5);

            if (y > quaterHeight) y = quaterHeight;
            if (y < -quaterHeight) y = -quaterHeight;

            /* screen width - cam screenshot's width, and devived by 2 */

            if (x > 50) x = 50;
            if (x < -50) x = -50;

        }

        return [x, y];
    }


    clear() {
        let sf = this.sp.spriteFrame;
        if (sf) {
            let tex = sf.texture as Texture2D;
            if (tex) {
                const imageData = tex.image;
                if (imageData) {
                    imageData.destroy();
                    tex.image = null;
                }
                if (sf.texture) {
                    tex = null;
                }
                // sf.texture = null;
            }
            sf = null;
        }
    }


    changeVideoState(toggle: Toggle) {

        const state = toggle.isChecked;

        this.isWatchAd = state;

        this.videoNode.active = state;


    }




}

