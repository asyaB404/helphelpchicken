/*
 * @Descripttion: 
 * @version: 
 * @Author: iwae
 * @Date: 2022-10-29 09:49:05
 * @LastEditors: iwae iwae@foxmail.com
 * @LastEditTime: 2022-11-14 14:46:47
 */

import { _decorator, Component, Node, director } from 'cc';
import texts, { events, topStates, ui } from '../enum/Enums';
import { EnergyMgr } from '../manager/EnergyMgr';
import ResMgr from '../manager/ResMgr';
import { BaseView } from './BaseView';
import { GameView } from './GameView';
const { ccclass, property } = _decorator;

@ccclass('HomeView')
export class HomeView extends BaseView {

    start() {
        director.on(events.gameStart, this.showBtn, this);
        director.on(events.startCustom, this.closeHome, this);

    }


    onEnable() {
        director.off(events.startCustom, this.closeHome, this);
        director.emit(events.changeTop, topStates.showAll);

    }


    async showBtn() {
        director.off(events.gameStart, this.showBtn, this);
        const btns = await ResMgr.ins.getUI(ui.HomeBtnView, this.node);

        const buildBtn = btns.getChildByName("buildBtn");
        buildBtn.on(Node.EventType.TOUCH_END, this.goBuild, this);
        const moreBtn = btns.getChildByName("moreBtn");
        moreBtn.on(Node.EventType.TOUCH_END, this.moreGame, this);

        const startBtn = btns.getChildByName("startBtn");
        startBtn.on(Node.EventType.TOUCH_END, this.goGame, this);

        const chickBtn = btns.getChildByName("chickBtn");
        chickBtn.on(Node.EventType.TOUCH_END, this.goGame, this);


    }

    async goGame() {

        const energy = EnergyMgr.ins.changeEnergy(false);

        if (!energy) return;

        const view = await ResMgr.ins.getUI(ui.GameView);

        view.getComponent(GameView).init(0);

        super.close();

    }

    closeHome() {
        super.close();

    }

    async goBuild() {
        await ResMgr.ins.getUI(ui.BuildView);

        super.close();

    }

    moreGame() {
        director.emit(events.Toast, texts.gameText.home.moreGame);
    }


}

