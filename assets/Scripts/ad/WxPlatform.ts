
import { WECHAT } from "cc/env";
import { Main } from "../Main";

export class WxPlatform {

    static _ins: WxPlatform;
    public wx = window["wx"];


    static get ins() {
        if (this._ins) {
            return this._ins;
        }

        this._ins = new WxPlatform();

        this._ins.init();



        return this._ins;
    }

    init() {
        this.wx.showShareMenu();
        // 绑定分享参数

        const shares = Main.ins.Shares[0].sharePics;


        if (shares.length > 0) {
            this.wx.onShareAppMessage(function () {
                // 用户点击了“转发”按钮
                let url = Math.floor(Math.random() * shares.length);

                return {
                    title: shares[url].shareText,
                    imageUrlId: shares[url].shareId, // 图片 id
                    imageUrl: shares[url].shareLink // 图片 URL
                }
            })

            this.wx.onShareTimeline(() => {
                let url = Math.floor(Math.random() * shares.length);
                return {
                    title: shares[url].shareText,
                    imageUrl: shares[url].shareLink, // 图片 URL
                    query: ''
                }
            })

        }



    }

    getLaunchOption() {
        const query = this.wx.getLaunchOptionsSync().query;

        return query;
    }



    getScene() {
        let scene = this.wx.getLaunchOptionsSync().scene;
        return scene
    }



    showShare(queryString: string = '') {

        if (!Main.ins.Shares[0]) return;

        const shares = Main.ins.Shares[0].sharePics;

        if (shares.length <= 0) return;

        let url = Math.floor(Math.random() * shares.length);

        if (WECHAT) {
            this.wx.shareAppMessage({
                title: shares[url].shareText,
                imageUrlId: shares[url].shareId, // 图片 id
                imageUrl: shares[url].shareLink, // 图片 URL
                query: queryString

            })

        }

    }


    banner: any;

    hideBanner() {

        if (this.banner != null) {

            this.banner.destroy();
            this.banner = null;

        }
    }

    showBanner(style = 2) {

        if (!WECHAT) {
            return;
        }

        if (this.banner != null) {
            this.banner.destroy();
            this.banner = null;
            return;

        }

        let id = Main.ins.Platforms[0].bannerId[0];

        let winSize = this.wx.getSystemInfoSync();


        let bannerAd = this.wx.createBannerAd({


            adUnitId: id,

            adIntervals: 30,


            style: {

                left: 0,

                top: 500,

                width: 300,

            }

        })
        let left;
        if (style == 1) {
            left = winSize.windowWidth - bannerAd.style.realWidth;
        }
        else if (style == 2) {
            left = winSize.windowWidth / 2 - bannerAd.style.realWidth / 2;
        }
        else {
            left = 0;
        }
        bannerAd.onResize(res => {
            bannerAd.style.top = winSize.windowHeight - bannerAd.style.realHeight;

            bannerAd.style.left = left;

        })

        bannerAd.onLoad(() => {

            console.log('banner 广告加载成功');

            this.banner = bannerAd;

        })

        bannerAd.onError(err => {

            console.log('banner 广告加载错误', err);

        })

        bannerAd.show();

    }

    //创建原生模板广告组件-1行格子广告-弹窗

    custom: any;
    showCustomAd(callback: Function) {

        if (!WECHAT) {

            return;

        }
        let id = Main.ins.Platforms[0].customId[0];
        let winSize = this.wx.getSystemInfoSync();
        let style = {}

        style = {
            width: winSize.screenWidth / 1.5,
            left: (winSize.screenWidth - winSize.screenWidth / 1.5) / 2,
            top: 0,
            fixed: 0,
        }

        if (this.custom) {
            this.custom.show();
            return;
        }

        let CustomAd = this.wx.createCustomAd({
            adUnitId: id,  //'adunit-abf9c63427c3a38a',
            style: style
        });
        CustomAd.onLoad(() => {
            console.log('原生模板 广告加载成功');
            callback(1);
            CustomAd.show().then(() => console.log('原生模板 广告显示成功')).catch((err) => {
                console.log("原生模板 广告显示失败", err)
                callback(0);
            })
            this.custom = CustomAd;
        })
        CustomAd.onClose(res => {
            console.log('关闭原生模板广告', res);
        });
        CustomAd.onError(err => {
            console.log('原生模板CustomAd 广告加载失败：', err);
            callback(0);
        });
    }


    //创建原生模板广告组件-1行格子广告-弹窗

    custom1: any;
    showCustomAd1(callback: Function) {

        if (!WECHAT) {

            return;

        }
        let id = Main.ins.Platforms[0].customId[0];
        let winSize = this.wx.getSystemInfoSync();
        let style = {}

        id = "原生五行格子广告id";
        style = {
            width: 128,
            left: 64,
            top: 300,
            fixed: 0,
        }


        if (this.custom1) {
            this.custom1.show();
            return;
        }

        let CustomAd = this.wx.createCustomAd({
            adUnitId: id,  //'adunit-abf9c63427c3a38a',
            style: style
        });
        CustomAd.onLoad(() => {
            console.log('原生模板 广告加载成功');
            callback(1);
            CustomAd.show().then(() => console.log('原生模板 广告显示成功')).catch((err) => {
                console.log("原生模板 广告显示失败", err)
                callback(0);
            })
            this.custom1 = CustomAd;
        })
        CustomAd.onClose(res => {
            console.log('关闭原生模板广告', res);
        });
        CustomAd.onError(err => {
            console.log('原生模板CustomAd 广告加载失败：', err);
            callback(0);
        });
    }

    //创建原生模板广告组件-3行格子广告-弹窗

    custom3: any;
    async showCustomAd3(callback: Function) {

        if (!WECHAT) {

            return;

        }
        let id = Main.ins.Platforms[0].customId[0];
        let winSize = this.wx.getSystemInfoSync();
        let style = {}

        style = {
            top: 76,
            width: 375, // 用于设置组件宽度，只有部分模板才支持，如矩阵格子模板
            // width: winSize.windowHeight/1.2,
            // left: (winSize.screenWidth - winSize.screenWidth / 1.2) / 2,
            // top: 0,
            fixed: 0,

        }


        let CustomAd = this.wx.createCustomAd({
            adUnitId: id,  //'adunit-abf9c63427c3a38a',
            style: style
        });
        CustomAd.onLoad(() => {
            console.log('原生模板 广告加载成功');
            callback(1);
            CustomAd.show().then(() => console.log('原生模板 广告显示成功')).catch((err) => {
                console.log("原生模板 广告显示失败", err)
                callback(0);
            })
            this.custom3 = CustomAd;
        })
        CustomAd.onClose(res => {
            console.log('关闭原生模板广告', res);
        });
        CustomAd.onError(errMsg => {
            console.log('原生模板CustomAd 广告加载失败：', errMsg);
            callback(0);
        });
    }




    showInterstitialAd(delay = 0) {

        if (!WECHAT) {
            return;
        }
        let id = Main.ins.Platforms[0].intersitialId[0];
        let interstitialAd = this.wx.createInterstitialAd({
            adUnitId: id,
        });
        if (interstitialAd) {
            interstitialAd.load().then(() => {
                console.log('插屏 广告加载成功');
            });
            interstitialAd.onClose(res => {
                console.log('关闭插屏广告', res);
            });
            interstitialAd.onError(err => {
                console.log('err:插屏广告加载失败', err);
            });

            setTimeout(() => {
                interstitialAd.show().catch((err) => {
                    console.log('插屏广告展示失败', err);
                });
            }, delay * 1000);
        }






    }


    rewardVideo2: any;

    showRewardVideo(callback?: Function) {

        let my = this;
        let id = Main.ins.Platforms[0].videoId[0];
        if (my.rewardVideo2 != null) {
            my.rewardVideo2.offClose(fun);
        }
        let rewardedVideoAd = this.wx.createRewardedVideoAd({
            adUnitId: id,
        });
        my.rewardVideo2 = rewardedVideoAd;
        rewardedVideoAd.load().then(() => {
            this.wx.showToast({

                title: "加载中，请稍后",

                icon: 'success',//图标，支持"success"、"loading" 

                duration: 1500,//提示的延迟时间，单位毫秒，默认：1500 

                mask: false,//是否显示透明蒙层，防止触摸穿透，默认：false 

                success: function () { },

                fail: function () { },

                complete: function () { }

            })


            console.log('激励视频 广告加载成功');
            rewardedVideoAd.show();
        });
        rewardedVideoAd.onError(err => {
            console.log('激励视频 广告显示失败', err);
            this.wx.showToast({

                title: "请稍后再试",

                icon: 'fail',//图标，支持"success"、"loading" 

                duration: 1500,//提示的延迟时间，单位毫秒，默认：1500 

                mask: false,//是否显示透明蒙层，防止触摸穿透，默认：false 

                success: function () { },

                fail: function () { },

                complete: function () { }

            })
            callback(2);
        })
        var fun = function (res) {
            if (res && res.isEnded) {
                console.log('res:  ', res);
                callback(1);
                rewardedVideoAd.offClose(fun);
            } else {
                console.log('播放中途退出');
                callback(0);
            }
        }
        rewardedVideoAd.onClose(fun);
    }




}



