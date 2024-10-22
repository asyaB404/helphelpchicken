import { _decorator, Component, Node, Graphics } from 'cc';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('testLine')
@executeInEditMode(true)
export class testLine extends Component {

    @property(Graphics)
    gc: Graphics = null
    onEnable() {
        this.gc.lineWidth = 60;
        this.gc.moveTo(0, 30);
        this.gc.lineTo(0, -30);
        this.gc.stroke();

    }

    update(deltaTime: number) {

    }
}

