/*
 * @Descripttion: 
 * @version: 
 * @Author: iwae
 * @Date: 2022-10-30 15:51:26
 * @LastEditors: iwae iwae@foxmail.com
 * @LastEditTime: 2022-11-14 07:47:31
 */

import { _decorator, Component, Node, director, Label } from 'cc';
import { PREVIEW, WECHAT } from 'cc/env';
import { WxPlatform } from '../ad/WxPlatform';
import { events, ui } from '../enum/Enums';
import { GameConfig } from '../GameConfig';
import { DataMgr } from '../manager/DataMgr';
import { Tools } from '../utils/Tools';
const { ccclass, property } = _decorator;

@ccclass('BuildCardView')
export class BuildCardView extends Component {

    @property(Node)
    newBtn: Node = null;
    @property(Node)
    editBtn: Node = null;
    @property(Node)
    playBtn: Node = null;
    @property(Node)
    shareBtn: Node = null;
    @property(Label)
    idLabel: Label = null;

    private cardIndex: number = null;


    async init(index: number) {

        this.cardIndex = index;

        if (index == -1) {

            this.newBtn.active = true;
            this.editBtn.active = false;
            this.playBtn.active = false;
            this.shareBtn.active = false;
            this.idLabel.string = "new";
        } else {
            this.newBtn.active = false;

            this.shareBtn.active = (WECHAT || PREVIEW) ? true : false;

            this.editBtn.active = true;
            this.playBtn.active = true;
            this.idLabel.string = DataMgr.getId(this.cardIndex);

        }

    }

    goBuild() {
        const data = DataMgr.MapData;
        const length = data.length;

        if (length > DataMgr.maxMaps) {
            return;
        } else {
            DataMgr.currentMap = length;
            DataMgr.MapData = { id: Tools.getDateId() };
        }

        director.emit(events.buildMap);
    }

    goEdit() {
        DataMgr.currentMap = this.cardIndex;
        director.emit(events.editMap, DataMgr.currentMap);
    }
    goPlay() {
        DataMgr.currentMap = this.cardIndex;

        director.emit(events.playMap, DataMgr.currentMap);
    }

    goShare() {

        const data = "map=" + JSON.stringify(DataMgr.MapData[this.cardIndex]) as string;

        const dataL = data.length;

        if (dataL <= (GameConfig.maxShareLength - 5)) {

            WxPlatform.ins.showShare(data);

        } else {
            const str = "地图长度：" + dataL + "最大长度：" + GameConfig.maxShareLength;
            director.emit(events.Toast, str);
        }


    }


}

