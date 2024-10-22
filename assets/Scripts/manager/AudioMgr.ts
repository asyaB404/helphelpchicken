
import { AudioClip, AudioSourceComponent, _decorator } from "cc";
import { Global } from "../Global";
import ResMgr from "./ResMgr";

const { ccclass, property } = _decorator;

@ccclass("AudioMgr")
export class AudioMgr {
    /**
     * play single clip
     */
    private _audioComp: AudioSourceComponent = null;
    /**
     * play looped clip
     */
    private _audioLoopComp: AudioSourceComponent = null;

    private _curLoopAudioName: string = "";

    private static _ins: AudioMgr = null!;

    public static get ins() {
        if (!this._ins) {
            this._ins = new AudioMgr();
            this._ins.initAudio();
        }

        return this._ins;
    }

    private initAudio() {
        this._audioComp = new AudioSourceComponent();
        this._audioComp.loop = true;
        this._audioLoopComp = new AudioSourceComponent();
        this._audioLoopComp.loop = true;
        this._audioLoopComp.volume = 0.3;
    }


    public async playMusic(audio: string) {
        if (Global.bgm == -1) return
        if (this._audioComp.clip) {
            this._audioComp.play();
            return;
        }

        let clip = await ResMgr.ins.getClip(audio);
        this._audioComp.volume = 0.8;
        this._audioComp.clip = clip;
        this._audioComp.play();
    }

    public stopMusic() {
        this._audioComp.stop();
    }

    public async playSound(audio: string, scale = 1) {

        if (Global.sound == -1) return
        let clip = await ResMgr.ins.getClip(audio);
        this._audioComp.playOneShot(clip, scale);
    }
    /**
     * @description: Play loop Audio
     * @param {string} audio
     * @return {*}
     */
    public async playLoopSound(audio: string): Promise<void> {
        if (Global.sound == -1) return
        let clip = await ResMgr.ins.getClip(audio);
        this._audioLoopComp.stop();
        this._audioLoopComp.clip = clip;
        this._audioLoopComp.play();
        this._curLoopAudioName = audio;
    }

    public async stopLoopSound(): Promise<void> {
        this._audioLoopComp.stop();
    }

    public get curLoopAudioName(): string {
        return this._curLoopAudioName;
    }

    public isLoopAudioPlaying(): boolean {
        return this._audioLoopComp.playing;
    }
}