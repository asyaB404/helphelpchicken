import { Component } from "cc";

export default class FSM extends Component {


    private stateList: string[] = []; //group of states

    /**current FSM state */
    public get currentState(): string {
        return this._currentState;
    }

    public get preState(): string {
        return this._preState;
    }

    private _currentState: string = "";
    private _preState: string = "";

    /**current state running duration*/
    public duration: number = 0;
    public dt: number = 0;

    public paused: boolean = false;

    /**
     *  add specific state 
     * @param state 
     */
    public addState(state: string) {
        let _tmpState = this.getState(state);

        if (_tmpState == null) {
            this.stateList.push(state);
            //if this is the 1st stata, it will be the default state as well
            if (this.stateList.length == 1) {
                this._currentState = state;
            }
        }
        else {
            console.warn(`FSM: current state [${state}] has been added`);
        }
    }

    /**
     * add a group of states
     * @param states 
     */
    public addStates(states: object) {
        Object.keys(states).forEach((key) => {
            this.addState(states[key]);
        });

    }

    /**
     * remove state
     * @param state 
     */
    public removeState(state: string) {
        let _tmpState: string = this.getState(state);
        if (_tmpState != null) {
            this.stateList.splice(this.stateList.indexOf(_tmpState), 1);
        }
        else {
            console.warn(`FSM:nthe state [${state}] does not exist`);
        }
    }

    public getState(state: string): string {
        if (this.stateList.indexOf(state) !== -1) {
            return state;
        } else {
            return null;
        }
    }

    /**
     * reset states
     */
    public resetState() {
        this.changeState();
    }

    /**
     * change FSM state
     * @param state 
     */
    public changeState(state: string = this._preState) {
        let _tmpState: string = this.getState(state);

        if (_tmpState == null) {
            console.log(`FSM: current state [${state}] is not in state`);
            return;
        }

        if (this._currentState != null) {
            if (this[`on${this._currentState}Exit`]) {
                this[`on${this._currentState}Exit`](this._currentState, this._preState);
            }
        }

        this._preState = this._currentState;
        this._currentState = _tmpState;
        this.duration = 0;
        if (this[`on${this._currentState}Enter`]) {
            this[`on${this._currentState}Enter`](this._currentState, this._preState);
        }

    }

    public update(dt) {
        if (this.paused || dt == 0) return

        if (this._currentState != null) {
            this.dt = dt;
            this.duration += dt;
            if (this[`on${this._currentState}Update`]) {
                this[`on${this._currentState}Update`](this._currentState, this._preState);
            }
        }
    }

    /**
     *  remove all states
     */
    public RemoveAllState() {
        if (this._currentState != null) {
            if (this[`on${this._currentState}Exit`]) {
                this[`on${this._currentState}Exit`](this._currentState, this._preState);
            }
            this._currentState = null;
        }
        this.stateList.length = 0;
    }
}
