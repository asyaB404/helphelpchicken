
import { _decorator, Component, Node, tween, Label, director } from 'cc';
import { events, Key, ui } from '../enum/Enums';
import { GameConfig } from '../GameConfig';
import { load, save, Tools } from '../utils/Tools';
import ResMgr from './ResMgr';
const { ccclass, property } = _decorator;

@ccclass('EnergyMgr')
export class EnergyMgr extends Component {

    @property(Label)
    energyLabel: Label = null;
    @property(Label)
    timerLabel: Label = null;

    private _e = 0;
    private _time = 0;

    get energyNum() {
        return this._e;
    }
    set energyNum(v) {
        this._e = v;
        this.energyLabel.string = Math.floor(this._e) + "";
    }

    public static ins: EnergyMgr = null;


    start() {
        EnergyMgr.ins = this;
        const timeLast = Number(load(Key.LastTime));
        const timeNow = Tools.getDay();

        this.timerLabel.string = "";

        if (timeLast) {
            let energy = Number(load(Key.Energy));
            if (energy < GameConfig.startEnergy) {
                this.startTimer();
            }
            /* comepare time */
            if (timeNow > timeLast) {
                if (energy < GameConfig.startEnergy) energy = GameConfig.startEnergy
                save(Key.Energy, energy);
                save(Key.LastTime, timeNow);
            }
            this.energyNum = energy;
        } else {
            save(Key.LastTime, timeNow);
            save(Key.Energy, GameConfig.startEnergy);
            this.energyNum = GameConfig.startEnergy;
        }

    }

    /* for add or reduce energy */
    changeEnergy(add = false) {

        let energy = Number(load(Key.Energy));
        if (add) {
            energy += GameConfig.addEnergy;
            const self = this.getComponent(EnergyMgr);
            tween(self).to(GameConfig.addEnergy / 10, { energyNum: energy }).start();
            save(Key.Energy, energy);
            if (energy >= GameConfig.startEnergy) {
                this.timerLabel.string = "";
                this.unschedule(this.updateTimer);
            }
            return true;
        } else {
            const result = energy - GameConfig.levelEnergy;

            if (result < 0) {
                this.showEnergy();
                return false;
            } else {

                energy -= GameConfig.levelEnergy;
                save(Key.Energy, energy);
                this.energyLabel.string = "" + energy;

                if (energy < GameConfig.startEnergy) {

                    this.startTimer();
                }

                return true;
            }
        }
    }

    startTimer() {
        this.timerLabel.string = "";

        this.schedule(this.updateTimer, 1);

    }


    updateTimer() {

        this._time++;

        if (this._time > GameConfig.recoveryEnergyTime) {
            this._time = 0;
            let energy = Number(load(Key.Energy));
            energy++;
            save(Key.Energy, energy);

            this.energyLabel.string = "" + energy;
            if (energy > GameConfig.startEnergy) {
                this.timerLabel.string = "";
                this.unschedule(this.updateTimer);
            }
            return;
        }
        {

            let time = GameConfig.recoveryEnergyTime - this._time;

            let mins = Math.floor(time / 60);

            let sec = time - mins * 60;

            this.timerLabel.string = mins + ":" + sec;

        }


    }

    async showEnergy() {
        director.emit(events.Toast, "鸡蛋不足");
        await ResMgr.ins.getUI(ui.MoneyView);
    }


}

