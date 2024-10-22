/*
 * @Descripttion: 
 * @version: 
 * @Author: iwae
 * @Date: 2022-10-29 09:49:04
 * @LastEditors: iwae iwae@foxmail.com
 * @LastEditTime: 2022-11-14 14:47:43
 */

import { _decorator, Component, director, UIOpacity, view, Node } from 'cc';
import { events, topStates, ui } from '../../Scripts/enum/Enums';
import { Global } from '../../Scripts/Global';
import { DataMgr } from '../../Scripts/manager/DataMgr';
import { PoolMgr } from '../../Scripts/manager/PoolMgr';
import ResMgr from '../../Scripts/manager/ResMgr';
import { BaseView } from '../../Scripts/view/BaseView';
import { BuildCardView } from '../../Scripts/view/BuildCardView';
import { GameView } from '../view/GameView';
import { EditorView } from './EditorView';
const { ccclass, property } = _decorator;

@ccclass('BuildView')
export class BuildView extends BaseView {

    @property(Node)
    cardLayout: Node = null;


    async onEnable() {
        director.emit(events.paperOcacity, 90);
        director.on(events.startCustom, this.onClose, this);
        director.on(events.buildMap, this.goBuild, this);
        director.on(events.editMap, this.goEdit, this);
        director.on(events.playMap, this.goPlay, this);

        director.emit(events.changeTop, topStates.hideAll);

        const data = DataMgr.MapData;
        const length = data.length;

        const k = (length >= DataMgr.maxMaps) ? 0 : -1

        for (var i = k; i < length; i++) {
            const card = await ResMgr.ins.getUI(ui.BuildCardView, this.cardLayout);
            card.getComponent(BuildCardView).init(i);
        }


    }

    onDisable() {
        director.off(events.startCustom, this.onClose, this);

        director.off(events.buildMap, this.goBuild, this);
        director.off(events.editMap, this.goEdit, this);
        director.off(events.playMap, this.goPlay, this);

        const l = this.cardLayout.children.length;

        for (var i = l - 1; i >= 0; i--) {
            PoolMgr.ins.putNode(this.cardLayout.children[0]);
        }
    }

    async goPlay(id: number) {
        super.close();

        const view = await ResMgr.ins.getUI(ui.GameView);
        const data = DataMgr.MapData[id];
        view.getComponent(GameView).init(1, data);

    }

    async goBuild() {
        super.close();
        const view = await ResMgr.ins.getUI(ui.EditorView);
        view.getComponent(EditorView).init();
    }

    async goEdit(id: number) {
        const view = await ResMgr.ins.getUI(ui.EditorView);
        const data = DataMgr.MapData[id];
        view.getComponent(EditorView).editMap(data);
    }


    onClose() {
        super.close();

    }
    goBack() {
        super.close();
        PoolMgr.ins.getNode("HomeView", Global.layer[1]);

    }



}

