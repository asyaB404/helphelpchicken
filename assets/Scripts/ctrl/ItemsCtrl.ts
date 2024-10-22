import { _decorator, Component, Node, director, LabelComponent, Game, Label } from 'cc';
import { AdMgr } from '../ad/AdMgr';
import { events, Key } from '../enum/Enums';
import { GameConfig } from '../GameConfig';
import { Global } from '../Global';
import { GameMgr } from '../manager/GameMgr';
import { load, save } from '../utils/Tools';
import { AdCtrl } from './AdCtrl';
const { ccclass, property } = _decorator;

@ccclass('ItemsCtrl')
export class ItemsCtrl extends Component {
    @property(Node)
    freezeBg: Node = null;
    @property(Node)
    undoBtn: Node = null;
    @property(Node)
    shuffleBtn: Node = null;
    @property(Node)
    freezeBtn: Node = null;

    private undoLabel: Label = null;
    private shuffleLabel: Label = null;
    private frostLabel: Label = null;

    onEnable() {

        let star = Number(load(Key.Star));
        if (!star) {
            save(Key.Star, 0);
            star = 0;
        }

        this._registerBtns();
        this._initData();
    }

    private _initData() {
        this.shuffleLabel = this.shuffleBtn.getComponentInChildren(Label);
        let shuffle = Number(load(Key.Shuffle));
        if (!shuffle) {
            shuffle = GameConfig.startShuffle;
            save(Key.Shuffle, shuffle);
        }
        this.shuffleLabel.string = "" + shuffle;
        this.undoLabel = this.undoBtn.getComponentInChildren(Label);
        let undo = Number(load(Key.Undo));
        if (!undo) {
            undo = GameConfig.startUndo;
            save(Key.Undo, undo);
        }
        this.undoLabel.string = "" + undo;
        this.frostLabel = this.freezeBtn.getComponentInChildren(Label);
        let frost = Number(load(Key.Frost));
        if (!frost) {
            frost = GameConfig.startFrost;
            save(Key.Frost, frost);
        }
        this.frostLabel.string = "" + frost;
    }

    private _registerBtns() {

        this.shuffleBtn.on(Node.EventType.TOUCH_END, (() => {
            this.shuffle();
        }), this);
        this.undoBtn.on(Node.EventType.TOUCH_END, (() => {
            this.undo();
        }), this);
    }



    undo() {
        if (!Global.start) return;
        let undo = Number(load(Key.Undo));
        if (!undo || undo <= 0) {
            // if (GameMgr.ins.botSteps.length <= 0) {
            //     director.emit(events.Toast, "没有可以撤销的操作");
            //     return;
            // }

            AdMgr.showVideo(() => {
                undo = GameConfig.startUndo;
                save(Key.Undo, undo);
                this.undoBtn.getChildByName("videoBtn").active = false;
                this.undoLabel.string = "" + undo;

            })
        } else {
            undo--;
            save(Key.Undo, undo);
            this.undoLabel.string = "" + undo;
            if (undo <= 0) this.undoBtn.getChildByName("videoBtn").active = true;
        }
    }
    shuffle() {
        if (!Global.start) return;

        let shuffle = Number(load(Key.Shuffle));
        if (!shuffle || shuffle <= 0) {

            AdMgr.showVideo(() => {
                shuffle = GameConfig.startShuffle;
                save(Key.Shuffle, shuffle);
                this.shuffleBtn.getChildByName("videoBtn").active = false;
                this.shuffleLabel.string = "" + shuffle;

            })

        } else {
            shuffle--;
            save(Key.Shuffle, shuffle);
            this.shuffleLabel.string = "" + shuffle;
            if (shuffle <= 0) this.shuffleBtn.getChildByName("videoBtn").active = true;

        }

    }

}

