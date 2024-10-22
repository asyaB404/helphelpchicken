/*
 * @Descripttion: 
 * @version: 
 * @Author: iwae
 * @Date: 2022-10-29 09:49:04
 * @LastEditors: iwae iwae@foxmail.com
 * @LastEditTime: 2022-11-10 09:57:45
 */
import { _decorator, Component, Material, Sprite, Color, tween, director, Tween } from 'cc';
import { events } from '../enum/Enums';
const { ccclass, property } = _decorator;

const color = new Color();

@ccclass('GridCtrl')
export class GridCtrl extends Component {

    @property(Sprite)
    private sprite: Sprite = null;
    public mat: Material = null;

    @property({ slide: true, min: 1, max: 255 })
    set opacity(v: number) {
        color.set(this.sprite.color);
        color.a = v;
        this.sprite.color = color;
    }
    get opacity(): number {
        return this.sprite.color.a;
    }


    start() {
        this.mat = this.sprite.customMaterial;

        director.on(events.paperOcacity, this.tweenOpacity, this);
        this.tweenOpacity(90);
    }


    tweenOpacity(v: number, t?: number) {
        if (this.opacity == v) return;
        if (!t) {
            t = Math.abs(v - this.opacity) * 0.02;
        }
        const self = this.getComponent(GridCtrl);

        tween(self).to(t, { opacity: v }).start();
    }


}

