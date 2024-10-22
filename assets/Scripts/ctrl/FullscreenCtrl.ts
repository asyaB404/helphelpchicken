

import { _decorator, Component, Widget } from 'cc';
import { Global } from '../Global';
const { ccclass, property } = _decorator;

@ccclass('FullscreenCtrl')
export class FullscreenCtrl extends Component {
    start() {

        if (Global.screenRatio >= 1.1) {
            const widget = this.node.getComponent(Widget);

            if (widget) {
                if (widget.isAlignTop) widget.top = 0;
                if (widget.isAlignBottom) widget.bottom = 0;
            }

        }

    }

}

