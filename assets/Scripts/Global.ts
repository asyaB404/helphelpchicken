/*
 * @Author: iwae iwae@foxmail.com
 * @Date: 2022-09-02 10:54:56
 * @LastEditors: iwae
 * @LastEditTime: 2022-11-13 22:02:19
 * @FilePath: /98KPhysic/assets/src/Global.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

import { director, Node } from "cc";
import { Key } from "./enum/Enums";

export class Global {

    static currentPen: number = 0;

    static pens = [1, 0, 0, 0, 0, 0, 0, 0];


    static playersLayer: Node = null;

    static bricksLayer: Node = null;

    static tutorialPoints = [];

    static screenRatio = 1;

    static Debug = false;
    /* if is game Run time */
    static runtime = false;

    /* if game starts */
    static start = false;

    /* enemies which be spawned by each black hole */
    static levelEnemies = 1;

    /* if the tutorial has started */

    static isTutorial = false;

    /* if game drawed */
    static isDraw = false;

    /* if game draw ended */
    static drawEnd = false;

    /* if the device is mobile */

    static isMobile = false;

    /* store performance settings */

    static high = false;

    static scale = 2;


    /* loading rate  */
    static LoadingRate = 0;

    /* global layer storage */

    static layer: Node[] = [];

    static scene: Node[] = [];

    /* to store the players on the scene */
    static players: Node[] = [];

    /* if Egnlish env */

    static isEn = false;

    static maxLevel = 20
    /* temp level storage */
    static level = 1;

    /* temp current level storage */
    static currlevel = 1;

    /* temp level time storage */
    static time = 0;

    /* play bgm */
    static bgm = 1;

    /* play sound */
    static sound = 1;

    /* used for game pause */
    static Pause(isPause = true) {
        director.emit(Key.Pause, isPause);
        Global.start = !isPause;
    }


}

