/*
 * @Descripttion: 
 * @version: 
 * @Author: iwae
 * @Date: 2022-11-03 10:13:54
 * @LastEditors: iwae
 * @LastEditTime: 2022-11-03 11:29:37
 */

import { _decorator, Component, Sprite } from 'cc';
import { Global } from '../Global';
import { Tools } from '../utils/Tools';
const { ccclass, property } = _decorator;

@ccclass('LoadCtrl')
export class LoadCtrl extends Component {

    @property(Sprite)
    load: Sprite = null;

    private isload = true;

    closeLoad() {
        this.isload = false;
        Tools.clearUI(this.node);
    }


    update(deltaTime: number) {
        if (!this.isload) return;

        this.load.fillRange = Global.LoadingRate;
        if (Global.LoadingRate >= 0.99) {
            this.closeLoad();
        }

    }
}

