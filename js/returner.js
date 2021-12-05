// koffee 1.20.0

/*
00000000   00000000  000000000  000   000  00000000   000   000  00000000  00000000   
000   000  000          000     000   000  000   000  0000  000  000       000   000  
0000000    0000000      000     000   000  0000000    000 0 000  0000000   0000000    
000   000  000          000     000   000  000   000  000  0000  000       000   000  
000   000  00000000     000      0000000   000   000  000   000  00000000  000   000
 */
var Returner, print, valid;

print = require('./print');

valid = require('./utils').valid;

Returner = (function() {
    function Returner(kode) {
        this.kode = kode;
        this.verbose = this.kode.args.verbose;
        this.debug = this.kode.args.debug;
    }

    Returner.prototype.collect = function(tl) {
        return this.scope(tl);
    };

    Returner.prototype.scope = function(body) {
        var e, i, len, ref, ref1;
        if (body != null ? (ref = body.exps) != null ? ref.length : void 0 : void 0) {
            ref1 = body.exps;
            for (i = 0, len = ref1.length; i < len; i++) {
                e = ref1[i];
                this.exp(e);
            }
        }
        return body;
    };

    Returner.prototype.func = function(f) {
        var insert, lst, ref, ref1, ref2, ref3, ref4, ref5;
        if (f.args) {
            this.exp(f.args);
        }
        if ((ref = f.body) != null ? (ref1 = ref.exps) != null ? ref1.length : void 0 : void 0) {
            if ((ref2 = (ref3 = f.name) != null ? ref3.text : void 0) !== '@' && ref2 !== 'constructor') {
                lst = f.body.exps.slice(-1)[0];
                insert = function() {
                    return f.body.exps.push({
                        "return": {
                            ret: {
                                type: 'keyword',
                                text: 'return'
                            },
                            val: f.body.exps.pop()
                        }
                    });
                };
                if ((ref4 = lst.type) === 'var' || ref4 === 'num' || ref4 === 'single' || ref4 === 'double' || ref4 === 'triple') {
                    insert();
                } else if (lst.call) {
                    if ((ref5 = lst.call.callee.text) !== 'log' && ref5 !== 'warn' && ref5 !== 'error') {
                        insert();
                    }
                } else if (lst.operation) {
                    insert();
                } else if (lst.func) {
                    insert();
                } else if (lst.array) {
                    insert();
                } else if (lst.prop) {
                    insert();
                } else if (lst.index) {
                    insert();
                } else if (lst.object) {
                    insert();
                } else if (lst.assert) {
                    insert();
                } else if (lst.stripol) {
                    insert();
                } else if (lst.qmrkop) {
                    insert();
                } else if (lst["return"]) {
                    null;
                } else if (lst["while"]) {
                    null;
                } else if (lst["for"]) {
                    null;
                } else if (lst["if"]) {
                    this["if"](lst["if"]);
                } else if (lst["try"]) {
                    this["try"](lst["try"]);
                } else if (lst["switch"]) {
                    this["switch"](lst["switch"]);
                } else {
                    console.log('todo: returner', Object.keys(lst)[0]);
                }
            }
            return this.scope(f.body);
        }
    };

    Returner.prototype["if"] = function(e) {
        var ei, i, len, ref, ref1;
        e.returns = true;
        this.insert(e.then);
        ref1 = (ref = e.elifs) != null ? ref : [];
        for (i = 0, len = ref1.length; i < len; i++) {
            ei = ref1[i];
            if (ei.elif.then) {
                this.insert(ei.elif.then);
            }
        }
        if (e["else"]) {
            return this.insert(e["else"]);
        }
    };

    Returner.prototype["try"] = function(e) {
        this.insert(e.exps);
        if (e["finally"]) {
            return this.insert(e["finally"]);
        }
    };

    Returner.prototype["switch"] = function(e) {
        var i, len, ref, w;
        ref = e.whens;
        for (i = 0, len = ref.length; i < len; i++) {
            w = ref[i];
            if (valid(w.when.then)) {
                this.insert(w.when.then);
            }
        }
        if (valid(e["else"])) {
            return this.insert(e["else"]);
        }
    };

    Returner.prototype.insert = function(e) {
        var lst, ref, ref1;
        if (e instanceof Array) {
            lst = e.slice(-1)[0];
            if (lst["if"]) {
                return this["if"](lst["if"]);
            }
            if (lst["return"]) {
                return;
            }
            if (lst["while"]) {
                return;
            }
            if (lst["for"]) {
                return;
            }
            if (!(lst["return"] || ((ref = lst.call) != null ? (ref1 = ref.callee) != null ? ref1.text : void 0 : void 0) === 'log')) {
                return e.push({
                    "return": {
                        ret: {
                            type: 'keyword',
                            text: 'return'
                        },
                        val: e.pop()
                    }
                });
            }
        }
    };

    Returner.prototype.exp = function(e) {
        var i, k, key, len, results, results1, v, val;
        if (!e) {
            return;
        }
        if (e.type) {

        } else if (e instanceof Array) {
            if (e.length) {
                results = [];
                for (i = 0, len = e.length; i < len; i++) {
                    v = e[i];
                    results.push(this.exp(v));
                }
                return results;
            }
        } else if (e instanceof Object) {
            if (e.func) {
                return this.func(e.func);
            } else {
                results1 = [];
                for (key in e) {
                    val = e[key];
                    if (val) {
                        if (val.type) {
                            results1.push(this.exp(val));
                        } else {
                            if (val instanceof Array) {
                                if (val.length) {
                                    results1.push((function() {
                                        var j, len1, results2;
                                        results2 = [];
                                        for (j = 0, len1 = val.length; j < len1; j++) {
                                            v = val[j];
                                            results2.push(this.exp(v));
                                        }
                                        return results2;
                                    }).call(this));
                                } else {
                                    results1.push(void 0);
                                }
                            } else {
                                results1.push((function() {
                                    var results2;
                                    results2 = [];
                                    for (k in val) {
                                        v = val[k];
                                        results2.push(this.exp(v));
                                    }
                                    return results2;
                                }).call(this));
                            }
                        }
                    } else {
                        results1.push(void 0);
                    }
                }
                return results1;
            }
        }
    };

    Returner.prototype.verb = function() {
        if (this.verbose) {
            return console.log.apply(console.log, arguments);
        }
    };

    return Returner;

})();

module.exports = Returner;
