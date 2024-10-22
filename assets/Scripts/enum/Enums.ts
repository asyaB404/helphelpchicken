
import { AudioClip, CCString, Color, JsonAsset, Material, Prefab, SpriteAtlas, SpriteFrame, _decorator, __private } from "cc";
const { ccclass, property } = _decorator;

@ccclass('adConfig')
export class adConfig {
    @property
    platform = "platform";
    @property
    id = 0
    @property({ type: CCString })
    bannerId: string[] = [];
    @property({ type: CCString })
    intersitialId: string[] = [];
    @property({ type: CCString })
    videoId: string[] = [];
    @property({ type: CCString })
    customId: string[] = [];
}
@ccclass('shareContent')
export class shareContent {
    @property
    shareId: string = "";
    @property
    shareLink: string = "";
    @property
    shareText: string = "分享标题";
}

@ccclass('penConfig')
export class penConfig {
    @property
    penName = "default";
    @property(SpriteFrame)
    penSF: SpriteFrame = null;
    @property(Color)
    penColor: Color = new Color();
}

@ccclass('shareConfig')
export class shareConfig {
    @property
    platform = "platform";
    @property({ type: shareContent })
    sharePics: shareContent[] = [];
}
export const collisions = {
    DEFAULT: 1,
    player: 2,
    trap: 4,
    water: 8,
    brick: 16,
    enemy: 32,

}
/* for ui prefabs config */
export const ui = ({
    HomeBtnView: { name: 'HomeBtnView', layer: 0, clear: false },
    EditorView: { name: 'EditorView', layer: 0, clear: true },
    BuildView: { name: 'BuildView', layer: 0, clear: true },
    GameView: { name: 'GameView', layer: 3, clear: false },
    BuildCardView: { name: 'BuildCardView', layer: 1, clear: false },
    TopView: { name: 'TopView', layer: 4, clear: false },
    ResultView: { name: 'ResultView', layer: 3, clear: false },
    HomeView: { name: 'HomeView', layer: 0, clear: false },
    TouchView: { name: 'TouchView', layer: 5, clear: false },
    StoreView: { name: 'StoreView', layer: 4, clear: false },
    MoneyView: { name: 'MoneyView', layer: 5, clear: false },
    CustomView: { name: 'CustomView', layer: 5, clear: true },
    AdView: { name: 'AdView', layer: 5, clear: false },
    ToastView: { name: 'ToastView', layer: 6, clear: false },
})


export const events = {
    startCustom: "startCustom",

    restartGame: "restartGame",
    gameStart: "gameStart",
    initTrap: "initTrap",
    clearMap: "clearMap",
    changePen: "changePen",
    closeGame: "closeGame",

    initLevel: "initLevel",
    gameWin: "gameWin",
    startDraw: "startDraw",

    finishDraw: "finishDraw",
    showResult: "showResult",

    buildMap: "buildMap",
    paperOcacity: "paperOcacity",
    editMap: "editMap",
    playMap: "playMap",
    rollBg: "rollBg",
    changeTop: "changeTop",
    catWatch: "catWatch",
    Toast: "toast",
    Anm: "anm",
}
export const topStates = {
    showHome: "showHome",
    showSetting: "showSetting",
    showEgg: "showEgg",
    showClock: "showClock",
    showStore: "showStore",
    hideStore: "hideStore",

    showAll: "showAll",
    hideAll: "hideAll",
}
export const anms = {
    cry: "cry",
    idle: "idle",
    hurt: "hurt",
    happy: "happy",

}

export function gameText() {

    return

}

export default class texts {

    static get gameText(): any {
        return this.cn;
    }
    static cn = {
        map: {
            saveFile: "保存文件成功，文件名：",
            currentItem: "当前物件 ",
            currentLevel: "当前关卡 ",
            saveFail: "保存失败",
            loadSuccess: "加载成功",
            saveSuccess: "保存失败",
            loadFail: "加载成功",
            outMap: "超出地图边界",
        },

        game: {

            fail: "是不是油饼！",
            noTutorial: "本关没有辅助线",
            win: "大吉大利！今晚吃鸡！",

        },

        home: {

            moreGame: "即将开放",

        },

        tools: {
            brick: "brick",
            delete: "删除工具",
            rotate: "旋转工具",
            line: "画线工具",
        }

    }


    // static map = {
    //     saveFile: Global.isEn ? "Save Success, file name is " : "保存文件成功，文件名：",
    //     currentItem: Global.isEn ? "Current Item " : "当前物件 ",
    //     currentLevel: Global.isEn ? "Current Level " : "当前关卡 ",
    //     saveFail: Global.isEn ? "Save Fail" : "保存失败",
    //     loadSuccess: Global.isEn ? "Load Success" : "加载成功",
    //     saveSuccess: Global.isEn ? "Save Success" : "保存失败",
    //     loadFail: Global.isEn ? "Load Fail" : "加载成功",
    //     outMap: Global.isEn ? "Out of Map" : "超出地图边界",
    // }

    // static game = {

    //     fail: Global.isEn ? "Whats your PROBLEM!" : "是不是油饼！",
    //     noTutorial: Global.isEn ? "No tutorial line in this level" : "本关没有辅助线",
    //     win: Global.isEn ? "Winner!Winner!Chiken Dinner!" : "大吉大利！今晚吃鸡！",

    // }

    // static home = {

    //     moreGame: Global.isEn ? "Coming Soon!" : "即将开放",

    // }

    // static tools = {
    //     brick: "brick",
    //     delete: Global.isEn ? "Detele Tool" : "删除工具",
    //     rotate: Global.isEn ? "Rotate Tool" : "旋转工具",
    //     line: Global.isEn ? "Tutorial Pen" : "画线工具",
    // }

}



export const Effects = {
    Star: "StarEffect",
}

/* keys for storage */
export const Key = {
    MapData: "MapData",
    CurrentPen: "CurrentPen",
    Sound: "Sound",
    Bgm: "Bgm",
    Pens: "Pens",
    Pause: "Pause",
    Timer: "Timer",
    Level: "Level",
    Shuffle: "Shuffle",
    Frost: "Frost",
    Undo: "Undo",
    Energy: "Energy",
    Star: "Star",
    LastTime: "LastTime",
}


export const Props = {
    Scenes: "Scenes",
    Layers: "Layers",
    Comps: "Components",
    ShareConfig: "ShareConfig",

    Setting: "Setting",
    View: "View",
    AdConfig: "AdConfig",
    Ad: "Advertisement",

}

export const Clips = {
    hurt: "hurt",
    happy: "happy",
    bgm: "bgm",
    photo: "photo",
    counter: "counter",
    btn: "btn",
    touch: "touch",
    gold: "gold",
    reward: "reward",
    merge: "merge",
    win: "win",
    lose: "lose",
}

export type AssetType = {
    type: __private._cocos_core_asset_manager_shared__AssetType,
    path: string

}

/**
 * assettypes and paths
 */
export const Assets = ({
    BrickPrefab: { type: Prefab, path: "Preload/Prefabs/Brick" } as AssetType,
    UiPrefab: { type: Prefab, path: "Preload/Prefabs/UI" } as AssetType,
    Json: { type: JsonAsset, path: "Preload/Jsons/" } as AssetType,
    Sound: { type: AudioClip, path: "Preload/Clips/" } as AssetType,
    Atlas: { type: SpriteAtlas, path: "Preload/Atlas/" } as AssetType,
    Material: { type: Material, path: "Preload/Materials/" } as AssetType

})




