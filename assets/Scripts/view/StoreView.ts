/*
 * @Descripttion: 
 * @version: 
 * @Author: iwae
 * @Date: 2022-11-09 23:43:19
 * @LastEditors: iwae iwae@foxmail.com
 * @LastEditTime: 2022-11-11 01:33:42
 */
import { _decorator, Component, Node, SpriteFrame, Color, Sprite, instantiate, director, Prefab, color, tween } from 'cc';
import { Clips, events, Key } from '../enum/Enums';
import { GameConfig } from '../GameConfig';
import { Global } from '../Global';
import { AudioMgr } from '../manager/AudioMgr';
import { EnergyMgr } from '../manager/EnergyMgr';
import { save } from '../utils/Tools';
import { BaseView } from './BaseView';
const { ccclass, property } = _decorator;


const ColorIkun = new Color(160, 200, 240, 255);

@ccclass('StoreView')
export class StoreView extends BaseView {
    @property(Node)
    row1: Node = null;
    @property(Node)
    row2: Node = null;

    @property(Prefab)
    penItem: Prefab = null;



    private penSPs: Sprite[] = []

    private penL: number;

    private inited = false;

    private _red = 0;

    private _self: StoreView;

    private _isDraw = false;

    set red(index: number) {
        index = Math.floor(index % this.penL);
        if (index == this._red) return;
        this.penSPs[this._red].color = Color.WHITE;
        this.penSPs[index].color = Color.RED;
        this._red = index;

    }

    get red() {
        return this._red;
    }


    onEnable() {

        this.initPens();
        director.emit(events.Toast, "你不喜欢彩笔么～");

    }

    initPens() {
        if (!this.inited) {
            this._self = this.node.getComponent(StoreView);
            this.inited = true
            const L = this.penL = GameConfig.penConfigs.length;
            if (L >= 1) {
                for (var i = 0; i < L; i++) {
                    const pen = instantiate(this.penItem);
                    /* for drawing effects, the 2nd row starts from right to left, which is reversed */
                    pen.parent = i > 3 ? this.row2 : this.row1;
                    this.setPen(pen, i);
                }
            }
        }

        this.setPens();

    }

    setPens() {
        this.penSPs.forEach((v, i) => {

            if (i == Global.currentPen) {
                v.color = Color.YELLOW;
            } else if (Global.pens[i] == 0) {
                v.color = ColorIkun;
            } else {
                v.color = Color.WHITE;

            }

        })
    }



    changePen(index) {
        if (Global.pens[index] == 0) {
            director.emit(events.Toast, "这个彩笔还没有喔～")
            return;
        }
        Global.currentPen = index;
        this.setPens();
        save(Key.CurrentPen, index);
        director.emit(events.changePen, Global.currentPen)
    }

    setPen(node: Node, index: number) {
        node.on(Node.EventType.TOUCH_END, () => {
            this.changePen(index);
        }, this);
        const sp = node.getComponent(Sprite);
        this.penSPs.push(sp);
        const penColor = node.getChildByName("penColor").getComponent(Sprite);
        penColor.spriteFrame = GameConfig.penConfigs[index].penSF;
        penColor.color = GameConfig.penConfigs[index].penColor;

    }


    getReward() {
        if (this._isDraw) return

        super.showVideo(() => {
            this.giveReward();
        })


    }

    giveReward() {
        this._isDraw = true;
        let index = Math.floor((this.penL) * Math.random() - (this.penL * 0.3 * Math.random()) + 1);

        if (index > this.penL - 1) index = this.penL - 1;
        if (index < 0) index = 0;

        let drawIndex = index + this.penL * 4;

        this._red = 0;

        this.penSPs.forEach((v) => {
            v.color = Color.WHITE;
        })


        tween(this._self).to(3, { red: drawIndex }).call(() => {

            this.getPen(index);

        }).start();


    }

    getPen(index) {

        if (Global.pens[index] == 1) {
            director.emit(events.Toast, "有这个彩笔啦，给你鸡蛋！");
            EnergyMgr.ins.changeEnergy(true)

        } else {
            director.emit(events.Toast, "获得了新的彩笔！");
            Global.pens[index] = 1;
            let pens = JSON.stringify(Global.pens)
            save(Key.Pens, pens)
        }

        this.scheduleOnce(() => {
            this.setPens();
            this._isDraw = false;
        }, 0.65)


        AudioMgr.ins.playSound(Clips.reward);

    }




    closePanel() {
        if (this._isDraw) return

        super.close();

    }

}


