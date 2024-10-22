/*
 * @Descripttion: 
 * @version: 
 * @Author: iwae
 * @Date: 2022-11-13 23:14:30
 * @LastEditors: iwae iwae@foxmail.com
 * @LastEditTime: 2022-11-14 14:46:37
 */
import { _decorator, Component, Node, Label, director } from 'cc';
import { events, ui } from '../enum/Enums';
import { Global } from '../Global';

import ResMgr from '../manager/ResMgr';
import { BaseView } from './BaseView';
import { GameView } from './GameView';
const { ccclass, property } = _decorator;

@ccclass('CustomView')
export class CustomView extends BaseView {


    @property(Label)
    playLable: Label = null


    private mapData: any = null;



    async play() {


        this.playLable.string = null;

        Global.time = 9;

        director.emit(events.startCustom);

        const view = await ResMgr.ins.getUI(ui.GameView);

        view.getComponent(GameView).init(1, this.mapData);


        this.closePanel();

    }

    init(data) {

        this.mapData = data;


        const id = data.id;

        this.playLable.string = "开始好友关卡： " + id;
    }




    closePanel() {


        super.close();

    }

}


