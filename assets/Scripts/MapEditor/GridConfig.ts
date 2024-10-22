/*
 * @Descripttion: 
 * @version: 
 * @Author: iwae
 * @Date: 2022-11-03 10:13:54
 * @LastEditors: iwae
 * @LastEditTime: 2022-11-03 14:30:12
 */

import { _decorator } from 'cc';

export interface actionStep { y: number, x: number, name?: string };


export class GridConfig {




    static x = 10;
    static y = 22;
    static safeY = 14;
    static size = 75;

    static actions: actionStep[] = [];

}


