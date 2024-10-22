
import { _decorator, Node, UITransform, Canvas, Widget, renderer, gfx, view, Vec3, DirectionalLight, Color, Camera } from 'cc';


export class MapTools {

    /* 新建1个2D Canvas */
    static createCanvas(parent?: Node): Canvas {
        const size = view.getDesignResolutionSize()
        // const size = screen.windowSize;
        const canvasNode = new Node("Canvas");
        let canvas = canvasNode.addComponent(Canvas);
        canvas.getComponent(UITransform).setContentSize(size)
        const widget = canvas.addComponent(Widget);
        widget.isAlignVerticalCenter = widget.isAlignHorizontalCenter = true;
        widget.top = widget.bottom = widget.left = widget.right = 0;
        widget.alignMode = Widget.AlignMode.ON_WINDOW_RESIZE;
        const uiCamera = new Node("UiCamera");
        const uiCamComp = uiCamera.addComponent(Camera);
        uiCamComp.projection = renderer.scene.CameraProjection.ORTHO;
        uiCamComp.clearFlags = gfx.ClearFlagBit.DEPTH;
        uiCamComp.visibility = 41943040;
        uiCamComp.orthoHeight = 576.045455;
        uiCamera.parent = canvas.node;
        uiCamera.setPosition(0, 0, 1000);
        canvas.cameraComponent = uiCamComp;
        canvas.alignCanvasWithScreen = true;
        if (parent) {
            canvas.node.parent = parent;
        }
        return canvas;
    }

    static createLight(parent?: Node): Node {
        const light = new Node("Light");
        light.setRotationFromEuler(new Vec3(-45));
        light.addComponent(DirectionalLight);
        if (parent) {
            light.parent = parent;
        }
        return light;

    }

    static createCamera(parent?: Node): Camera {
        const camera = new Node("Camera");
        if (parent) {
            camera.parent = parent;
        }
        const _Camera = camera.addComponent(Camera);
        _Camera.clearColor = Color.fromHEX(new Color(), "02141E");
        _Camera.clearFlags = gfx.ClearFlagBit.ALL;;

        return _Camera
    }

}

