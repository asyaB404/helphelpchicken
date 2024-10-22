import { _decorator, Node, Vec2, PolygonCollider2D } from 'cc';
import { GameConfig } from '../GameConfig';
import { VecPool } from '../manager/VecPool';
import { Tools } from '../utils/Tools';

const v1 = new Vec2();
const v2 = new Vec2();

export class lineLogic {

    /**
     * @description: index is where the poly located, 0 is mid, 1 is start,2 is end
     * the resean the seperate the poly into 3 parts is if it generate the poly box in the end,
     * the edges of the poly box may contact with other colliders,the tri poly will solve this
     * @return :{PolygonCollider2D}
     */
    static setPolyBox(poly: PolygonCollider2D, start: [number, number], end: [number, number], index: number): PolygonCollider2D {

        /* the poly will be resused */
        Tools.clearPoly(poly);

        /* half width of the line width */

        const width = GameConfig.lineWidth * 0.5;

        const d = VecPool.ins.Vec2.set(end[0] - start[0], end[1] - start[1])/* as direction */;
        /* normalize the direction */
        Vec2.normalize(d, d);

        let p1: Vec2, p2: Vec2, p3: Vec2, p4: Vec2;

        switch (index) {
            /*  poly box in the middle parts */
            case 0:
                /* upper line's end point,the line starts from the start, and verticle to the direction, */
                p1 = VecPool.ins.Vec2.set(d.y, -d.x).multiplyScalar(width).add2f(start[0], start[1]);
                /* bottom line's end point,the line starts from the start, and verticle to the direction, */
                p2 = VecPool.ins.Vec2.set(-d.y, d.x).multiplyScalar(width).add2f(start[0], start[1]);
                /* upper line's end point,the line starts from the end, and verticle to the direction, */
                p3 = VecPool.ins.Vec2.set(d.y, -d.x).multiplyScalar(width).add2f(end[0], end[1]);
                /* bottom line's end point,the line starts from the end, and verticle to the direction, */
                p4 = VecPool.ins.Vec2.set(-d.y, d.x).multiplyScalar(width).add2f(end[0], end[1]);
                poly.points = [p1, p2, p4, p3];
                break
            /* poly tri in the start */
            case 1:
                /* start point */
                p1 = VecPool.ins.Vec2.set(start[0], start[1])
                p2 = VecPool.ins.Vec2.set(d.y, -d.x).multiplyScalar(width).add2f(end[0], end[1]);
                p3 = VecPool.ins.Vec2.set(-d.y, d.x).multiplyScalar(width).add2f(end[0], end[1]);
                poly.points = [p1, p2, p3];
                break;
            /* poly tri in the end */
            case 2:
                p1 = VecPool.ins.Vec2.set(d.y, -d.x).multiplyScalar(width).add2f(start[0], start[1]);
                p2 = VecPool.ins.Vec2.set(-d.y, d.x).multiplyScalar(width).add2f(start[0], start[1]);
                /* end point */
                p3 = VecPool.ins.Vec2.set(end[0], end[1])
                poly.points = [p1, p2, p3];
                break;
        }


        poly.apply();
        return poly

    }

    static normalize(point) {
        const x = point[0];
        const y = point[1];
        let len = x * x + y * y;
        if (len > 0) {
            len = 1 / Math.sqrt(len);
            point[0] = x * len;
            point[1] = y * len;
        }
    }

    /**
     * @description: return if the line form the point to last point, 
     * and the line form the point to the 2nd last point paralle
     * the result may be not accurate,just roughly paralle
     */
    public static pushPoints(points: [number, number][], p3: [number, number]) {

        const L = points.length;
        if (L < 3) {
            points.push(p3);
            return;
        }
        /* last point */
        const p1 = points[L - 2];
        /* 2nd last point */
        const p2 = points[L - 1];

        const d1 = [p1[0] - p2[0], p1[1] - p2[1]];
        const d2 = [p2[0] - p3[0], p2[1] - p3[1]];

        this.normalize(d1);
        this.normalize(d2);

        /* cal the direction and normalize the direction */
        // Vec2.subtract(v1, p2, p1).normalize();
        // Vec2.subtract(v2, p3, p2).normalize();

        let d1_x = d1[0];
        let d1_y = d1[1];
        let d2_x = d2[0];
        let d2_y = d2[1];
        const d = 0.1;
        /* if the x or y is too small, the result may be 0 or infinite, so we roughly set it to d/-d */
        if (d1_x >= -d && d1_x < d) {
            d1_x = d;
        } else if (d1_x < 0 && d1_x > -d) {
            d1_x = -d;
        }
        if (d1_y >= 0 && d1_y < d) {
            d1_y = d;
        } else if (d1_y < 0 && d1_y > -d) {
            d1_y = -d;
        }
        if (d2_x >= 0 && d2_x < d) {
            d2_x = d;
        } else if (d2_x < 0 && d2_x > -d) {
            d2_x = -d;
        }
        if (d2_y >= 0 && d2_y < d) {
            d2_y = d;
        } else if (d2_y < 0 && d2_y > -d) {
            d2_y = -d;
        }

        /* cal the 2x and 2y's division result, if they are on the same side ,the result should be greater than 0 */
        const t1 = d1_x / d2_x;
        const t2 = d1_y / d2_y;

        /* y and the same side,but x not, if both d1_x and dx_x if within -d and -d, they rougly same angle */
        if (t2 > 0 && t1 < 0) {

            if ((Math.abs(d1_x) == d) && (Math.abs(d2_x) == d)) {

                const pl = points.length;
                points[pl] = p3;
            } else {
                points.push(p3);

            }

        } else if (t1 > 0 && t2 < 0) {

            if ((Math.abs(d1_y) == d) && (Math.abs(d2_y) == d)) {
                const pl = points.length;
                points[pl] = p3;

            } else {
                points.push(p3);
            }
        }

        else if (t1 > 0 && t2 > 0) {

            const r = t1 / t2;

            /* which means the 2 tans are roughly same */
            if (r > 0.96 && r < 1.04) {
                const pl = points.length;
                points[pl] = p3;

            } else {
                points.push(p3);
            }
        } else {
            points.push(p3);
        }

    }

}

