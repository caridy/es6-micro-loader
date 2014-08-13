import simple from "./bar";
import {multi} from "./bar";

class Baz {

    constructor(config) {
        this.config = config;
    }

    simple(a, b) {
        let r = simple(a, b);
        return r;
    }

    multi() {
        return multi.apply(this, arguments);
    }

};

export default Baz;
