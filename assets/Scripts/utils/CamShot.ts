import { _decorator, Component, Node, Camera, RenderTexture, ImageAsset, view, Texture2D, SpriteFrame, Sprite, sys, director, Layers } from 'cc';

const { ccclass, property } = _decorator;

/* the screen shot's sclae, the lower, the less memory and I/O costs */
const scale = 0.5;

export const captureSize = [Math.round(scale * 600), Math.round(scale * 720)]

@ccclass('CamShot')
export class CamShot extends Component {

    @property(Camera)
    mainCam: Camera = null;

    rt: RenderTexture = null;

    private _canvas: HTMLCanvasElement = null!;

    private _buffer: ArrayBufferView = null!;

    private _size: number[] = new Array(2);

    private _cam: Camera = null!;

    public static ins: CamShot = null;


    start() {

        CamShot.ins = this;



    }

    initCam(){

        this._cam = this.node.getComponent(Camera);
        this.rt = new RenderTexture();
        this._size = [Math.round(view.getVisibleSize().width * scale), Math.round(view.getVisibleSize().height * scale)]
        this.rt.reset({
            width: Math.round(this._size[0]),
            height: Math.round(this._size[1]),
        })
        this._cam.targetTexture = this.rt;
        this.setHeight();
        this._cam.visibility = Layers.Enum.NONE;
    }

    setHeight() {
        this._cam.orthoHeight = this.mainCam.orthoHeight;
        this._cam.node.worldPosition = this.mainCam.node.worldPosition;
        this._size = [Math.round(view.getVisibleSize().width * scale), Math.round(view.getVisibleSize().height * scale)]
        // this._cam.node.active = false;
    }


    copyRenderTex(sp: Sprite, offset: [number, number] = [0, 0]) {
        this._cam.visibility = Layers.Enum.DEFAULT;
        this._buffer = null;
        this.scheduleOnce(() => {
            const width = captureSize[0];
            const height = captureSize[1];
            const x = (this._size[0] + offset[0] - captureSize[0]) * 0.5;
            const y = (this._size[1] + offset[1] - captureSize[1]) * 0.5;
            this._buffer = this.rt.readPixels(x, y, width, height);
            this._cam.visibility = Layers.Enum.NONE;

            this.showImage(sp);
        })
    }

    showImage(sp: Sprite) {
        const img = new ImageAsset();
        img.reset({
            _data: this._buffer,
            width: captureSize[0],
            height: captureSize[1],
            format: Texture2D.PixelFormat.RGBA8888,
            _compressed: false
        });
        let texture = new Texture2D();
        texture.image = img;
        let sf = new SpriteFrame();
        sf.texture = texture;
        sf.packable = false;
        sp.spriteFrame = sf;
        sp.spriteFrame.flipUVY = true;
        if (sys.isNative && (sys.os === sys.OS.IOS || sys.os === sys.OS.OSX)) {
            sp.spriteFrame.flipUVY = false;
        }
        // this._cam.node.active = false;

    }

    savaAsImage(width, height, arrayBuffer) {

        if (sys.platform === sys.Platform.WECHAT_GAME) {
            if (!this._canvas) {
                //@ts-ignore
                this._canvas = wx.createCanvas();
                this._canvas.width = width;
                this._canvas.height = height;
            } else {
                this.clearCanvas();
            }
            var ctx = this._canvas.getContext('2d');

            var rowBytes = width * 4;

            for (var row = 0; row < height; row++) {
                var sRow = height - 1 - row;
                var imageData = ctx.createImageData(width, 1);
                var start = sRow * width * 4;

                for (var i = 0; i < rowBytes; i++) {
                    imageData.data[i] = arrayBuffer[start + i];
                }

                ctx.putImageData(imageData, 0, row);
            }
            //@ts-ignore
            this._canvas.toTempFilePath({
                x: 0,
                y: 0,
                width: this._canvas.width,
                height: this._canvas.height,
                destWidth: this._canvas.width,
                destHeight: this._canvas.height,
                fileType: "png",
                success: (res) => {
                    //@ts-ignore
                    wx.showToast({
                        title: "截图成功"
                    });
                    //@ts-ignore
                    wx.saveImageToPhotosAlbum({
                        filePath: res.tempFilePath,
                        success: (res) => {
                            //@ts-ignore              
                            wx.showToast({
                                title: "成功保存到设备相册",
                            });
                            // t`成功保存在设备目录: ${res.tempFilePath}`;
                        },
                        fail: () => {
                            // t `保存图片失败`;
                        }
                    })
                },
                fail: () => {
                    //@ts-ignore
                    wx.showToast({
                        title: "截图失败"
                    });
                    // `截图失败`;
                }
            })
        }
    }

    clearCanvas() {
        let ctx = this._canvas.getContext('2d');
        ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    }

    onSaveImageBtnClicked() {
        const width = captureSize[0];
        const height = captureSize[1];
        this.savaAsImage(width, height, this._buffer)
    }
}