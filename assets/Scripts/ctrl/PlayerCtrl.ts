/*
 * @Descripttion: 
 * @version: 
 * @Author: iwae
 * @Date: 2022-11-03 10:13:54
 * @LastEditors: iwae iwae@foxmail.com
 * @LastEditTime: 2022-11-11 14:55:37
 */
import { _decorator, Component, Collider2D, IPhysics2DContact, Contact2DType, Sprite, Color, director, Animation } from 'cc';
import texts, { anms, Clips, collisions, events, Key } from '../enum/Enums';
import { Global } from '../Global';
import { AudioMgr } from '../manager/AudioMgr';
const { ccclass, property } = _decorator;

const hurtColor = new Color(247, 20, 101, 255);

@ccclass('PlayerCtrl')
export class PlayerCtrl extends Component {

    @property(Collider2D)
    collider: Collider2D = null;

    @property(Animation)
    anm: Animation = null;

    @property(Sprite)
    sp: Sprite = null;

    private isDead = false;

    set Color(v: Color) {
        this.sp.color = v;
    }

    onEnable() {
        this.unschedule(this.fail);
        this.isDead = false;
        this.idle();
        director.on(events.gameWin, this.win, this);
        this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);

    }

    onDisable() {
        director.off(events.gameWin, this.win, this);
        this.collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    }

    win() {
        this.Color = Color.WHITE;
        this.anm.play(anms.happy);

    }

    hurt() {
        if (Global.start) {
            this.Color = hurtColor;
            director.emit(Key.Timer, 0);
        }
        AudioMgr.ins.playSound(Clips.hurt);
        this.anm.play(anms.hurt);
        this.isDead = true;
        this.scheduleOnce(this.fail, 1.);
    }

    fail() {
        this.Color = Color.WHITE;
        if (!Global.start) return;
        Global.start = false;
        this.anm.play(anms.cry);
        director.emit(events.Toast, texts.gameText.game.fail);

        this.scheduleOnce(() => {
            director.emit(events.restartGame);
        }, 1)
    }


    idle() {
        this.Color = Color.WHITE;
        this.anm.play(anms.idle);

    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {

        if (this.isDead) return;

        if (otherCollider.group == collisions.trap || otherCollider.group == collisions.water || otherCollider.group == collisions.enemy) {
            this.hurt();
        }
    }



}

