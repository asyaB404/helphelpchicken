import { _decorator, Component, Node, RigidBody2D, director } from 'cc';
import { events } from '../enum/Enums';
import { GameConfig } from '../GameConfig';
import { Tools } from '../utils/Tools';
const { ccclass, property } = _decorator;

@ccclass('TrapCtrl')
export class TrapCtrl extends Component {

    @property({ min: 0, max: 20 })
    angleSpeed = 5;

    private rigid: RigidBody2D = null

    onEnable() {

        if (!this.rigid) {
            const rigid = this.node.getComponent(RigidBody2D);
            if (rigid) this.rigid = rigid;
        }

        director.on(events.initTrap, this.rotateItem, this);

    }

    onDisable() {
        director.off(events.initTrap, this.rotateItem, this);


    }

    rotateItem(direction: 1 | -1 = 1) {

        this.rigid.wakeUp();
        this.rigid.angularVelocity = this.angleSpeed * direction * GameConfig.timeScale;

        this.rigid.applyAngularImpulse(1, true);



    }




}

