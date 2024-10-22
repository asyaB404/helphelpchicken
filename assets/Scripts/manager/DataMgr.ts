/*
 * @Descripttion: 
 * @version: 
 * @Author: iwae
 * @Date: 2022-10-31 00:24:52
 * @LastEditors: iwae iwae@foxmail.com
 * @LastEditTime: 2022-11-14 12:12:23
 */
import { Key } from '../enum/Enums';
import { load, save } from '../utils/Tools';

export class DataMgr {

    static _data: any = null;

    static currentMap = 1;

    static maxMaps = 5;

    static set MapData(v: any) {

        this._data[this.currentMap] = v;
        save(Key.MapData, JSON.stringify(this._data));

    }


    static get MapData() {

        if (!this._data) {
            const data = load(Key.MapData, 2);
            if (data) {
                this._data = data;
            } else {
                this._data = [];
                save(Key.MapData, JSON.stringify(this._data));
            }
        }

        return this._data;
    }

    /**
     * @description: get the real index id
     * @return {*}
     */
    static getId(index) {

        const id = this._data[index].id;

        return id;


    }


}


