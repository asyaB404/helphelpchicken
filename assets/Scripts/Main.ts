
import { _decorator, Component, Node, game, director, Canvas, instantiate, EPhysics2DDrawFlags, sys, view, CCInteger } from 'cc';
import { DEBUG, WECHAT } from 'cc/env';
import { WxPlatform } from './ad/WxPlatform';
import { GridCtrl } from './ctrl/GridCtrl';
import { adConfig, Assets, events, Key, penConfig, Props, shareConfig, topStates, ui } from './enum/Enums';
import { GameConfig } from './GameConfig';
import { Global } from './Global';
import { LevelMgr } from './manager/LevelMgr';
import ResMgr from './manager/ResMgr';
import { CamShot } from './utils/CamShot';
import { load, save, Tools } from './utils/Tools';
import { CustomView } from './view/CustomView';
const { ccclass, property } = _decorator;



@ccclass('Main')
export class Main extends Component {
    @property({ tooltip: "add Energy Set up", group: Props.Setting, displayOrder: 0 })
    addEnergy = 6;
    @property({ type: CCInteger, tooltip: "max Energy", group: Props.Setting, displayOrder: 0 })
    maxEnergy = 25;
    @property({ type: CCInteger, tooltip: "max Level Set up", group: Props.Setting, displayOrder: 0 })
    maxLevel = 10;
    @property({ type: adConfig, tooltip: "Id for banner", group: Props.AdConfig, displayOrder: 1 })
    Platforms: adConfig[] = [];
    @property({ type: shareConfig, tooltip: "Id for Share", group: Props.ShareConfig, displayOrder: 1 })
    Shares: shareConfig[] = [];

    @property({ type: penConfig, tooltip: "pen items config", group: Props.Setting, displayOrder: 1 })
    penConfigs: penConfig[] = [];

    @property({ type: GridCtrl, group: Props.Comps })
    grid: GridCtrl = null;

    @property(Node)
    HomeView: Node = null;

    public static ins: Main = null;
    public level: LevelMgr = null;
    public canvas: Node = null;

    /**
   * @layer {0} for baseUI
   * @layer {1} for popWin
   * @layer {2} for globalToast
   */
    private layer: Node[] = [];

    private isFirst = true;

    onLoad() {
        if (!DEBUG) {
            if (sys.platform == sys.Platform.DESKTOP_BROWSER) {
                view.setResolutionPolicy(3);
            }
        }
        Tools.setRatio();

        GameConfig.timeScale = (game.frameRate == 30) ? 2 : 1;

        this.setting();
        /* detect language environment */
        Main.ins = this;

    }

    async start() {
        this.loadData();
        await this.loadRes();
        this.initUI();
        this.initWechat();

    }



    /**
     * @description: load the game datas
     * @return {*}
     */
    loadData() {
        GameConfig.penConfigs = this.penConfigs;
        Global.maxLevel = this.maxLevel;
        let level = load(Key.Level);
        if (!level) {
            level = 1;
            save(Key.Level, level)
        }
        Global.level = level;

        let energy = load(Key.Energy);
        if (!energy) {
            energy = GameConfig.startEnergy;
            save(Key.Level, energy)
        }

        let currentPen = load(Key.CurrentPen);
        if (!currentPen) {
            currentPen = Global.currentPen;
            save(Key.CurrentPen, currentPen)
        } else {
            Global.currentPen = currentPen;
        }
        let pens = load(Key.Pens, 2);
        if (!pens) {
            pens = JSON.stringify(Global.pens)
            save(Key.Pens, pens)
        } else {
            Global.pens = pens;
        }
        let sound = load(Key.Sound);
        if (!sound) {
            sound = Global.sound;
            save(Key.Sound, sound)
        } else {
            Global.sound = sound;
        }
        let bgm = load(Key.Bgm);
        if (!bgm) {
            bgm = Global.bgm;
            save(Key.Bgm, bgm)
        } else {
            Global.bgm = bgm;
        }

    }


    /**
     * @description: init game UI layers
     * @return {*}
     */
    initUI() {
        // PhysicsSystem2D.instance.debugDrawFlags = EPhysics2DDrawFlags.Aabb;
        const scene = director.getScene();
        this.canvas = scene.getComponentInChildren(Canvas).node;
        for (var i = 0; i <= 7; i++) {
            /* if layer0 exist, we clone it, otherwise create a new one */
            const node = this.layer[0] ? instantiate(this.layer[0]) : Tools.createUI();
            node.name = "layer" + i;
            node.parent = this.canvas;
            Global.layer[i] = this.layer[i] = node;
        }
        ResMgr.ins.getUI(ui.TopView);
        ResMgr.ins.getUI(ui.ToastView);
        director.emit(events.gameStart);
        director.emit(events.changeTop, topStates.showAll);
        CamShot.ins.initCam();
    }


    /* load game res */
    async loadRes() {
        await ResMgr.ins.loadBundle(1, 0.15);
        await ResMgr.ins.loadRes(1, Assets.UiPrefab, 0.2);
        await ResMgr.ins.loadRes(1, Assets.BrickPrefab, 0.3);
        await ResMgr.ins.loadRes(1, Assets.Sound, 0.2);
        await ResMgr.ins.loadRes(1, Assets.Json, 0.1);
        await ResMgr.ins.loadRes(1, Assets.Material, 0.05);

    }

    /* init setting */
    setting() {
        game.frameRate = 60;
        // if (sys.platform == sys.Platform.IOS || Global.radio < 1.1) {
        //     /* set normal performance */
        //     game.frameRate = 30;
        // } else {
        //     game.frameRate = 60;
        // }
        Global.isEn = Tools.isEn();
        Global.runtime = true;
        GameConfig.maxLevel = this.maxEnergy;
        GameConfig.addEnergy = this.addEnergy;
        GameConfig.maxLevel = this.maxLevel;
    }

    /* init level,game,audio managers */
    async initWechat() {

        if (WECHAT) {
            window.wx.onShow((res) => {
                if (res.query) {
                    this.loadWechatData(res.query);
                }

            })
            const query = WxPlatform.ins.getLaunchOption();

            this.loadWechatData(query);



        }


    }

    async loadWechatData(query) {
        /* we only add base mapdata into the query, if you want need to shader with username, you need
                to get user's authentication token */
        const data = query.map;

        if (!data) return;

        const json = JSON.parse(data);


        if (json && json.id) {

            const custom = await ResMgr.ins.getUI(ui.CustomView);

            custom.getComponent(CustomView).init(json);

        }
    }


}

