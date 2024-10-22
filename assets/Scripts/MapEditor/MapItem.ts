/*
 * @Descripttion: 
 * @version: 
 * @Author: iwae
 * @Date: 2022-10-29 09:49:04
 * @LastEditors: iwae iwae@foxmail.com
 * @LastEditTime: 2022-11-04 13:42:52
 */

import { _decorator, Component, Node, Sprite, UITransform, SpriteFrame, math } from 'cc';
import texts from '../enum/Enums';
import { GridConfig } from './GridConfig';
const { ccclass, property } = _decorator;

@ccclass('MapItem')
export class MapItem extends Component {

    @property(Sprite)
    sp: Sprite = null;

    @property(SpriteFrame)
    sfs: SpriteFrame[] = [];

    size: math.Size = null;

    grid: number[] = [1, 1];

    isBrush: boolean = false;
    isDelete: boolean = false;
    isRotate: boolean = false;
    isDraw: boolean = false;

    init(name: string, size?: math.Size, sp?: Sprite) {
        this.isBrush = (name.indexOf(texts.gameText.tools.brick) != -1);

        if (name.indexOf(texts.gameText.tools.delete) != -1) {
            this.isDelete = true;
        }
        else if (name.indexOf(texts.gameText.tools.rotate) != -1) {
            this.isRotate = true;
            this.sp.spriteFrame = this.sfs[0];
        }
        else if (name.indexOf(texts.gameText.tools.line) != -1) {
            this.isDraw = true;
            this.sp.spriteFrame = this.sfs[1];
        }

        const sprite = this.sp.node;
        sprite.name = name;

        if (sp) {
            this.sp.spriteFrame = sp.spriteFrame;
            this.sp.color = sp.color;
        }
        if (!size) {
            size = this.node.getComponent(UITransform).contentSize;
        }
        this.size = size;

        sprite.getComponent(UITransform).setContentSize(size);

        const max = Math.max(size.width, size.height);

        const scale = 62 / max;

        sprite.setScale(scale, scale);

        this.grid[0] = Math.max(1, Math.round(size.width / GridConfig.size));
        this.grid[1] = Math.max(1, Math.round(size.height / GridConfig.size));

    }


}

