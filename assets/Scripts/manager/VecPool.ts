import { Vec2, Vec3 } from 'cc';

const poolLength = 240;

/* VecPool is used to store Vectors like Vec2/Vec3, which avoid creating new vec class and cause minor gc,meow */

export class VecPool {
    private _v2pool: Vec2[] = [];
    private _v3pool: Vec3[] = [];

    static _ins: VecPool;

    static get ins() {
        if (this._ins) {
            return this._ins;
        }

        this._ins = new VecPool();

        return this._ins;
    }

    get Vec2(): Vec2 {
        let v: Vec2
        if (this._v2pool.length > 0) {
            v = this._v2pool.shift();
        } else {
            v = new Vec2();
        }
        return v;
    }

    set Vec2(v: Vec2) {

        if (v) {
            if (this._v2pool.length < poolLength) {
                this._v2pool.push(v);
            } else {
                v.x = v.y = null;
                v = null;
            }
        }
    }

    get Vec3(): Vec3 {
        let v: Vec3
        if (this._v3pool.length > 0) {
            v = this._v3pool.shift();
        } else {
            v = new Vec3();
        }
        return v;
    }

    set Vec3(v: Vec3) {

        if (v) {
            if (this._v3pool.length < poolLength) {
                this._v3pool.push(v);
            } else {
                v.x = v.y = v.z = null;
                v = null;
            }
        }

    }
}

