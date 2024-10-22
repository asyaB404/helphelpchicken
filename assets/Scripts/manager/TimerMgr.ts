/*
 * @Descripttion: 
 * @version: 
 * @Author: iwae
 * @Date: 2022-11-09 21:57:00
 * @LastEditors: iwae iwae@foxmail.com
 * @LastEditTime: 2022-11-14 08:52:15
 */

import { _decorator, Component, Node, director, UIOpacity, Animation, Label } from 'cc';
import { Clips, events, Key } from '../enum/Enums';
import { Global } from '../Global';
import { AudioMgr } from './AudioMgr';
const { ccclass, property } = _decorator;

@ccclass('TimerMgr')
export class TimerMgr extends Component {

    private _op: UIOpacity = null;

    private _anm: Animation = null;

    @property(Label)
    text: Label = null;


    start() {
        this._op = this.node.getComponent(UIOpacity);
        this._anm = this.node.getComponent(Animation);
        director.on(Key.Timer, this.setTimer, this);
        director.on(Key.Pause, this.pause, this);
        this._op.opacity = 0;
    }

    /* when watching ad, call this */
    pause(isPause: boolean) {
        if (this._op.opacity == 0) return;

        if (isPause) {
            this.unschedule(this.timer);
        } else {
            this.schedule(this.timer, 1);
        }
    }

    /**
     * @description: if time = 0, stop it;
     * @return {*}
     */
    setTimer(time: number) {
        this._anm.stop();
        if (time == 0) {
            if (this._op.opacity == 0) return;
            this.unschedule(this.timer)
            this._op.opacity = 0;
        } else {
            Global.time = time;
            this._op.opacity = 255;
            this.text.string = time + "";
            this.schedule(this.timer, 1)
        }


    }
    /**
     * @description: game wins
     * @return {*}
     */
    gameWin() {
        this._op.opacity = 0;
        Global.start = false;
        this.unschedule(this.timer);
        this.scheduleOnce(() => {
            AudioMgr.ins.playSound(Clips.happy);
        }, 0.2)
        director.emit(events.paperOcacity, 15, 0);

        director.emit(events.gameWin);
        this.scheduleOnce(() => {
            director.emit(events.showResult);
        }, 1.5)
    }

    timer() {
        Global.time;
        Global.time--;
        this.text.string = Global.time + "";
        if (Global.time < 5 && Global.time > 0) {
            if (Global.time == 4) this._anm.play();
            AudioMgr.ins.playSound(Clips.counter);
        }
        if (Global.time <= 0) {
            this._anm.stop();
            this.node.angle = 0;
            this.gameWin();

        }
    }
}

