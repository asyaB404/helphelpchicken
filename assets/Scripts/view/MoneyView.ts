/*
 * @Descripttion: 
 * @version: 
 * @Author: iwae
 * @Date: 2022-11-09 23:43:19
 * @LastEditors: iwae
 * @LastEditTime: 2022-11-13 23:18:37
 */
import { _decorator, Component, Node } from 'cc';
import { Clips } from '../enum/Enums';
import { AudioMgr } from '../manager/AudioMgr';
import { EnergyMgr } from '../manager/EnergyMgr';
import { BaseView } from './BaseView';
const { ccclass, property } = _decorator;

@ccclass('MoneyView')
export class MoneyView extends BaseView {



    getReward(){

        super.showVideo(()=>{
            this.giveReward();
        })


    }

    giveReward(){


        EnergyMgr.ins.changeEnergy(true);
        AudioMgr.ins.playSound(Clips.reward);
    }




    closePanel(){

        super.close();

    }

}


