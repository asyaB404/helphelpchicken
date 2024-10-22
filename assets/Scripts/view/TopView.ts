/*
 * @Descripttion: 
 * @version: 
 * @Author: iwae
 * @Date: 2022-10-30 11:27:41
 * @LastEditors: iwae iwae@foxmail.com
 * @LastEditTime: 2022-11-10 19:03:11
 */
import { _decorator, Component, Node, director, Sprite, Color } from 'cc';
import { events, Key, topStates, ui } from '../enum/Enums';
import { Global } from '../Global';
import { AudioMgr } from '../manager/AudioMgr';
import ResMgr from '../manager/ResMgr';
import { save } from '../utils/Tools';

const { ccclass, property } = _decorator;

@ccclass('TopView')
export class TopView extends Component {

    @property(Node)
    setting: Node = null;

    @property(Node)
    eggs: Node = null;

    @property(Node)
    store: Node = null;

    @property(Sprite)
    sound: Sprite = null;

    @property(Sprite)
    bgm: Sprite = null;

    start() {
        director.on(events.changeTop, this.changeState, this);
    }

    showStore() {
        ResMgr.ins.getUI(ui.StoreView);
    }


    changeState(state: string) {

        switch (state) {
            case topStates.showAll:
                this.setting.active = true;
                this.eggs.active = true;
                this.store.active = true
                break;
            case topStates.hideAll:
                this.setting.active = false;
                this.eggs.active = false;
                this.store.active = false
                break;
            case topStates.showStore:
                this.setting.active = false;
                this.eggs.active = true;
                this.store.active = true;
                break;
            case topStates.hideStore:
                this.setting.active = false;
                this.eggs.active = true;
                this.store.active = false
                break;
            case topStates.showClock:
                this.setting.active = false;
                this.eggs.active = true;
                this.store.active = false
                break;
            case topStates.showHome:
                this.setting.active = true;
                this.eggs.active = true;
                break;
        }

    }

    showSettings() {

        const settings = this.setting.getChildByName("settings");

        settings.active = !settings.active;


        this.sound.color = Global.sound == 1 ? Color.WHITE : Color.GRAY;
        this.bgm.color = Global.bgm == 1 ? Color.WHITE : Color.GRAY;


    }

    changeBgm() {

        Global.bgm *= -1;

        this.bgm.color = Global.bgm == 1 ? Color.WHITE : Color.GRAY;

        if (!Global.bgm) AudioMgr.ins.stopMusic();

        save(Key.Bgm, Global.bgm);


    }
    changeSound() {
        Global.sound *= -1;
        this.sound.color = Global.sound == 1 ? Color.WHITE : Color.GRAY;

        save(Key.Sound, Global.sound);


    }



}

