'use strict';

const helpers = {
    rnd(min, max){
        ~~(Math.random() * (max - min + 1) + min)
    }
}

export let rnd = helpers.rnd;