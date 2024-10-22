import { _decorator, Node, Prefab, instantiate, Toggle, director, Sprite, UITransform, Layers, UIOpacity, Label, sys } from 'cc';
import { PREVIEW } from 'cc/env';
import texts, { events, Key, topStates, ui } from '../../Scripts/enum/Enums';
import { Main } from '../../Scripts/Main';
import { DataMgr } from '../../Scripts/manager/DataMgr';
import ResMgr from '../../Scripts/manager/ResMgr';
import { BaseView } from '../../Scripts/view/BaseView';
import { FileMgr } from './FileMgr';
import { EditorMgr } from './EditorMgr';
import { MapItem } from './MapItem';
const { ccclass, property, disallowMultiple, help } = _decorator;


@ccclass('EditorView')
@disallowMultiple(true)
@help("http://learncocos.com")

export class EditorView extends BaseView {


    @property({ type: Prefab, displayOrder: 0, group: "components" })
    ToggleView: Prefab = null!
    @property({ type: Prefab, displayOrder: 0, group: "components" })
    BuildView: Prefab = null!

    @property(Label)
    fileName: Label = null;
    @property(Node)
    toggleNode: Node = null;
    @property(Node)
    tabBtns: Node[] = [];

    @property(Node)
    saveBtn: Node = null;
    @property(Node)
    loadBtn: Node = null;
    @property(Node)
    clearBtn: Node = null;

    private _EditorMgr: EditorMgr = null!;

    public fileMgr: FileMgr = null;

    private _fileName: Label = null;

    private _currentIndex = 0;

    private _buildItems: [Node[], Node[], Node[]] = [[], [], []];

    private items: Map<string, MapItem> = new Map();

    private _toggle: Toggle = null;



    onEnable() {
        director.emit(events.changeTop, topStates.hideAll);
        director.emit(events.paperOcacity, 160);
        director.on(events.startCustom, this.onClose, this);

    }

    onDisable() {
        this._EditorMgr.unRegisterEvents();
        director.on(events.startCustom, this.onClose, this);

    }

    init() {
        /* init scene */
        this.initScene();
        /* init objects */
        this.initObjects();

    }

    editMap(json: string) {
        this.init();

        this.initLevel(json);
    }

    async goBack() {


        this.onClose();

        await ResMgr.ins.getUI(ui.BuildView);

    }

    onClose() {
        this._EditorMgr.clear();

        super.close();
    }


    async initScene() {

        if (!this._EditorMgr) {
            this._EditorMgr = new EditorMgr();

            const trans = this.node.getComponent(UITransform);

            const OutputNode = new Node("OutputNode");
            /* pleae dont delete Output node */
            var output = this.node.getChildByName("OutputLayer") || this.node;

            OutputNode.parent = output;

            const gizmo = new Node("gizmo");
            gizmo.layer = Layers.Enum.UI_2D;
            gizmo.parent = this.node;
            gizmo.addComponent(Sprite);
            const opacity = gizmo.addComponent(UIOpacity);

            opacity.opacity = 170;

            const mat = Main.ins.grid.mat;

            this._EditorMgr.init(gizmo, mat, trans, OutputNode)

            this.toggleNode = this.toggleNode;

            this._fileName = this.fileName;

            if (PREVIEW) {
                this.loadBtn.on(Node.EventType.TOUCH_END, this.loadFile, this);
            } else {
                this.loadBtn.active = false;
            }
            this.saveBtn.on(Node.EventType.TOUCH_END, this.saveMap, this);

            this.clearBtn.on(Node.EventType.TOUCH_END, () => {
                this._EditorMgr.clear();
            }, this);

            this.tabBtns.forEach((v, i) => {
                v.on(Node.EventType.TOUCH_END, () => {
                    this.changeTab(i);
                }, this);
            })
        };

        this._EditorMgr.registerEvents();
        this._fileName.string = DataMgr.getId(DataMgr.currentMap);

    }



    async loadFile() {

        if (!this.fileMgr) this.fileMgr = new FileMgr();

        const res = await this.fileMgr.loadFile();
        if (!res) {
            director.emit(events.Toast, texts.gameText.map.loadFail, 1);

        }
        const json = JSON.parse(res);

        this.initLevel(json);

    }

    initLevel(json) {
        const mapData = json.mapData;
        // const config = json.config;

        if (!mapData) return;

        const L = mapData.length;

        if (L > 0) {

            this._EditorMgr.clear();


            for (var i = 0; i < L; i++) {

                const data = mapData[i];
                const name = data[0] as string;
                const mapItem = this.items.get(name);

                if (mapItem) {
                    const node = instantiate(mapItem.sp.node);
                    this._EditorMgr.setItem(data, node);
                }

            }
            const lineL = json.points.length;
            if (lineL > 0) {
                // this._EditorMgr.points = json.points;

                for (var i = 0; i < lineL; i++) {

                    const pos = json.points[i];
                    if (i == 0) {
                        this._EditorMgr.gc.moveTo(pos[0], pos[1]);

                    } else {
                        this._EditorMgr.gc.lineTo(pos[0], pos[1]);
                        this._EditorMgr.gc.stroke();
                    }
                }

            }
            director.emit(events.Toast, texts.gameText.map.loadSuccess, 1);

        } else {
            director.emit(events.Toast, texts.gameText.map.loadFail, 1);


        }
    }


    saveMap() {
        const items = this._EditorMgr.mapData;
        const data: any = {};
        /* you can custom */
        /* game time */
        const id = this._fileName.string;
        data.id = id;
        if (data.points) {
            data.points.length = 0;
        } else {
            data.points = [];
        }
        let res = data.mapData = [];

        items.forEach((v, k) => {
            const item = [k.name, v[0], v[1], v[2], v[3], k.scale.x, k.scale.y];
            res.push(item)
        })
        const lineL = this._EditorMgr.points.length;
        if (lineL > 0) {
            /* deep clone points */
            data.points = this._EditorMgr.points.concat();
        }

        if (res.length > 0) {
            DataMgr.MapData = data;

            /* file can only be saved with desktop browser */
            if (sys.platform == sys.Platform.DESKTOP_BROWSER) {
                const fileData = JSON.stringify(data);
                this.saveAsFile(fileData, id);
            }

        } else {
            director.emit(events.Toast, texts.gameText.map.saveFail);
        }

    }

    saveAsFile(fileData: string, filename: string) {

        if (!this.fileMgr) this.fileMgr = new FileMgr();
        this.fileMgr.saveFile(fileData, filename)
        director.emit(events.Toast, texts.gameText.map.saveFile + filename);
    }




    /* change the items */
    SwithItem(name: string): void {
        const item: MapItem = this.items.get(name);
        this._EditorMgr.item = item;
        director.emit(events.Toast, texts.gameText.map.currentItem + name, 0.3);
    }


    initObjects() {
        /* already init */
        if (this._buildItems[0].length > 0) return;
        this.initToggle(texts.gameText.tools.delete);
        this.initToggle(texts.gameText.tools.rotate);
        this.initToggle(texts.gameText.tools.line);
        this.addToggles(ResMgr.ins.buildPrefabs);
    }

    changeTab(index: number) {

        if (index == this._currentIndex || this._buildItems[index].length == 0) return;

        this._buildItems[this._currentIndex].forEach((v) => {
            v.active = false;
        });

        this._buildItems[index].forEach((v, i) => {
            v.active = true;
            /* toggled the 1st item in this tab */
            if (i == 0) {
                v.getComponent(Toggle).isChecked = true;
                this.SwithItem(v.name);
            }
        });

        this._currentIndex = index;

    }

    initToggle(name, size?, sp?) {
        const toggle: Node = instantiate(this.ToggleView);
        toggle.name = name;
        toggle.parent = this.toggleNode;
        const item = toggle.getComponent(MapItem);
        item.init(name, size, sp);
        this.items.set(name, item);
        toggle.on('toggle', this.onToggleClick, this);
        return toggle;
    }

    addToggles(prefabs: [Prefab[], Prefab[], Prefab[]]) {

        prefabs.forEach((v, i) => {
            v.forEach((v, ii) => {
                const prefab = v as Prefab;
                const name = prefab.data.name as string;
                const node = instantiate(prefab)
                const sp = node.getComponent(Sprite);
                const toggle = this.initToggle(name, node.getComponent(UITransform).contentSize, sp)
                this._buildItems[i].push(toggle);
                node.destroy();
                if (i == this._currentIndex) {
                    if (ii == 0) {
                        this.scheduleOnce(() => {
                            toggle.getComponent(Toggle).isChecked = true;
                            this.SwithItem(toggle.name);
                        })
                    }
                } else {
                    toggle.active = false;
                }
            })

        })

    }

    onToggleClick(toggle: Toggle) {
        if (this._toggle != toggle) {

            this._toggle = toggle;

            this.SwithItem(toggle.node.name);
        }

    }

}



