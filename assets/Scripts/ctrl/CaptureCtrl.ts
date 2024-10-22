import { _decorator, Component, Node, RenderTexture, Sprite, Camera, SpriteFrame, Texture2D, Rect } from 'cc';
const { ccclass, property, menu } = _decorator;

@ccclass('CaptureCtrl')
export class CaptureCtrl extends Component {
    @property(Sprite)
    public sprite: Sprite = null!;
    @property(Camera)
    public camera: Camera = null!;

    protected _renderTex: RenderTexture | null = null;

    test() {


        const spriteFrame = this.sprite.spriteFrame!;
        const sp = new SpriteFrame();
        sp.reset({
            originalSize: spriteFrame.originalSize,
            rect: spriteFrame.rect,
            offset: spriteFrame.offset,
            isRotate: spriteFrame.rotated,
            borderTop: spriteFrame.insetTop,
            borderLeft: spriteFrame.insetLeft,
            borderBottom: spriteFrame.insetBottom,
            borderRight: spriteFrame.insetRight,
        });


        const renderTex = this._renderTex = new RenderTexture();
        renderTex.reset({
            width: 360,
            height: 640,
        });
        this.camera.node.active = true;
        this.camera.targetTexture = renderTex;
        let tex = new Texture2D();
        sp.texture = renderTex;
        this.sprite.spriteFrame = sp;
        const rect = new Rect(400, 0, 512, 512)

        const _sp: any = this.sprite;
        spriteFrame.rect = rect;
        _sp.updateMaterial();
        this.sprite.updateRenderer();
        _sp.markForUpdateRenderData()

        _sp._updateUVs()
        console.log(11, spriteFrame.rect)

        this.scheduleOnce(() => {
            // renderTex.resize(512, 512);
        });
        // this.camera.node.active = false;

    }

    onDestroy() {
        if (this._renderTex) {
            this._renderTex.destroy();
            this._renderTex = null;
        }
    }
}