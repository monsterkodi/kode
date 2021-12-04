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
                } else if (lst["return"]) {
                    null;
                } else if (lst["while"]) {
                    null;
                } else if (lst["for"]) {
                    null;
                } else if (lst["if"]) {
                    this["if"](lst["if"]);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmV0dXJuZXIuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJyZXR1cm5lci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztBQUNOLFFBQVUsT0FBQSxDQUFRLFNBQVI7O0FBSU47SUFFQyxrQkFBQyxJQUFEO1FBQUMsSUFBQyxDQUFBLE9BQUQ7UUFFQSxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3RCLElBQUMsQ0FBQSxLQUFELEdBQVcsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFJLENBQUM7SUFIdkI7O3VCQVdILE9BQUEsR0FBUyxTQUFDLEVBQUQ7ZUFBUSxJQUFDLENBQUEsS0FBRCxDQUFPLEVBQVA7SUFBUjs7dUJBUVQsS0FBQSxHQUFPLFNBQUMsSUFBRDtBQUVILFlBQUE7UUFBQSxrREFBYSxDQUFFLHdCQUFmO0FBQ0k7QUFBQSxpQkFBQSxzQ0FBQTs7Z0JBQUEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxDQUFMO0FBQUEsYUFESjs7ZUFFQTtJQUpHOzt1QkFZUCxJQUFBLEdBQU0sU0FBQyxDQUFEO0FBRUYsWUFBQTtRQUFBLElBQWUsQ0FBQyxDQUFDLElBQWpCO1lBQUEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxDQUFDLENBQUMsSUFBUCxFQUFBOztRQUVBLDZEQUFlLENBQUUsd0JBQWpCO1lBRUksMENBQVMsQ0FBRSxjQUFSLEtBQXFCLEdBQXJCLElBQUEsSUFBQSxLQUF5QixhQUE1QjtnQkFFSSxHQUFBLEdBQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFLLFVBQUUsQ0FBQSxDQUFBO2dCQUVwQixNQUFBLEdBQVMsU0FBQTsyQkFDTCxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFaLENBQWlCO3dCQUFBLENBQUEsTUFBQSxDQUFBLEVBQ2I7NEJBQUEsR0FBQSxFQUFL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QUw7QUFBQTsrQkFBQTthQUE1QjtTQUFBLE1BQ0EsSUFBRyxDQUFBLFlBQWEsTUFBaEI7WUFFRCxJQUFHLENBQUMsQ0FBQyxJQUFMO3VCQUNJLElBQUMsQ0FBQSxJQUFELENBQU0sQ0FBQyxDQUFDLElBQVIsRUFESjthQUFBLE1BQUE7QUFHSTtxQkFBQSxRQUFBOztvQkFDSSxJQUFHLEdBQUg7d0JBQ0ksSUFBRyxHQUFHLENBQUMsSUFBUDswQ0FBaUIsSUFBQyxDQUFBLEdBQUQsQ0FBSyxHQUFMLEdBQWpCO3lCQUFBLE1BQUE7NEJBRUksSUFBRyxHQUFBLFlBQWUsS0FBbEI7Z0NBQ0ksSUFBRyxHQUFHLENBQUMsTUFBUDs7O0FBQ0k7NkNBQUEsdUNBQUE7OzBEQUFBLElBQUMsQ0FBQSxHQUFELENBQUssQ0FBTDtBQUFBOzttREFESjtpQ0FBQSxNQUFBOzBEQUFBO2lDQURKOzZCQUFBLE1BQUE7OztBQUlJO3lDQUFBLFFBQUE7O3NEQUFBLElBQUMsQ0FBQSxHQUFELENBQUssQ0FBTDtBQUFBOzsrQ0FKSjs2QkFGSjt5QkFESjtxQkFBQSxNQUFBOzhDQUFBOztBQURKO2dDQUhKO2FBRkM7O0lBTko7O3VCQXFCTCxJQUFBLEdBQU0sU0FBQTtRQUFHLElBQUcsSUFBQyxDQUFBLE9BQUo7bUJBQWlCLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBWixDQUFrQixPQUFPLENBQUMsR0FBMUIsRUFBK0IsU0FBL0IsRUFBakI7O0lBQUg7Ozs7OztBQUVWLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbjAwMDAwMDAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4wMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiMjI1xuXG5wcmludCA9IHJlcXVpcmUgJy4vcHJpbnQnXG57IHZhbGlkIH0gPSByZXF1aXJlICcuL3V0aWxzJ1xuXG4jIGluc2VydHMgaW1wbGljaXQgcmV0dXJuIHN0YXRlbWVudHNcblxuY2xhc3MgUmV0dXJuZXJcblxuICAgIEA6IChAa29kZSkgLT5cblxuICAgICAgICBAdmVyYm9zZSA9IEBrb2RlLmFyZ3MudmVyYm9zZVxuICAgICAgICBAZGVidWcgICA9IEBrb2RlLmFyZ3MuZGVidWdcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAgICAgICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgY29sbGVjdDogKHRsKSAtPiBAc2NvcGUgdGxcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAgMDAwMDAwMDAgIFxuICAgIFxuICAgIHNjb3BlOiAoYm9keSkgLT5cblxuICAgICAgICBpZiBib2R5Py5leHBzPy5sZW5ndGhcbiAgICAgICAgICAgIEBleHAgZSBmb3IgZSBpbiBib2R5LmV4cHNcbiAgICAgICAgYm9keVxuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4gICAgXG4gICAgZnVuYzogKGYpIC0+XG4gICAgICAgIFxuICAgICAgICBAZXhwIGYuYXJncyBpZiBmLmFyZ3NcbiAgICAgICAgXG4gICAgICAgIGlmIGYuYm9keT8uZXhwcz8ubGVuZ3RoXG5cbiAgICAgICAgICAgIGlmIGYubmFtZT8udGV4dCBub3QgaW4gWydAJyAnY29uc3RydWN0b3InXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGxzdCA9IGYuYm9keS5leHBzWy0xXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGluc2VydCA9IC0+IFxuICAgICAgICAgICAgICAgICAgICBmLmJvZHkuZXhwcy5wdXNoIHJldHVybjpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldDogdHlwZTona2V5d29yZCcgdGV4dDoncmV0dXJuJ1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsOiBmLmJvZHkuZXhwcy5wb3AoKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIGxzdC50eXBlIGluIFsndmFyJyAnbnVtJyAnc2luZ2xlJyAnZG91YmxlJyAndHJpcGxlJ10gdGhlbiBpbnNlcnQoKVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgbHN0LmNhbGwgICAgICAgIHRoZW4gaWYgbHN0LmNhbGwuY2FsbGVlLnRleHQgbm90IGluIFsnbG9nJyAnd2FybicgJ2Vycm9yJ10gdGhlbiBpbnNlcnQoKVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgbHN0Lm9wZXJhdGlvbiAgIHRoZW4gaW5zZXJ0KClcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGxzdC5mdW5jICAgICAgICB0aGVuIGluc2VydCgpXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBsc3QuYXJyYXkgICAgICAgdGhlbiBpbnNlcnQoKVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgbHN0LnByb3AgICAgICAgIHRoZW4gaW5zZXJ0KClcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGxzdC5pbmRleCAgICAgICB0aGVuIGluc2VydCgpXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBsc3Qub2JqZWN0ICAgICAgdGhlbiBpbnNlcnQoKVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgbHN0LmFzc2VydCAgICAgIHRoZW4gaW5zZXJ0KClcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGxzdC5yZXR1cm4gICAgICB0aGVuIG51bGxcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGxzdC53aGlsZSAgICAgICB0aGVuIG51bGxcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGxzdC5mb3IgICAgICAgICB0aGVuIG51bGxcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGxzdC5pZiAgICAgICAgICB0aGVuIEBpZiBsc3QuaWZcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGxzdC5zd2l0Y2ggICAgICB0aGVuIEBzd2l0Y2ggbHN0LnN3aXRjaFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgbG9nICd0b2RvOiByZXR1cm5lcicgT2JqZWN0LmtleXMobHN0KVswXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBAc2NvcGUgZi5ib2R5IFxuICAgICAgICBcbiAgICAjIDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgIDAwMDAwMCAgICBcbiAgICAjIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAwMDAgICAgICAgXG4gICAgXG4gICAgaWY6IChlKSAtPlxuICAgICAgICBcbiAgICAgICAgZS5yZXR1cm5zID0gdHJ1ZVxuICAgICAgICBAaW5zZXJ0IGUudGhlblxuICAgICAgICBmb3IgZWkgaW4gZS5lbGlmcyA/IFtdXG4gICAgICAgICAgICBAaW5zZXJ0IGVpLmVsaWYudGhlbiBpZiBlaS5lbGlmLnRoZW5cbiAgICAgICAgXG4gICAgICAgIEBpbnNlcnQgZS5lbHNlIGlmIGUuZWxzZVxuICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAwIDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAwMDAwMDAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIHN3aXRjaDogKGUpIC0+XG4gICAgICAgIFxuICAgICAgICBmb3IgdyBpbiBlLndoZW5zXG4gICAgICAgICAgICBAaW5zZXJ0IHcud2hlbi50aGVuIGlmIHZhbGlkIHcud2hlbi50aGVuXG5cbiAgICAgICAgQGluc2VydCBlLmVsc2UgaWYgdmFsaWQgZS5lbHNlXG4gICAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgIDAwMDAgICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIGluc2VydDogKGUpIC0+XG5cbiAgICAgICAgaWYgZSBpbnN0YW5jZW9mIEFycmF5XG4gICAgICAgICAgICBsc3QgPSBlWy0xXVxuICAgICAgICAgICAgaWYgbHN0LmlmICAgICAgIHRoZW4gcmV0dXJuIEBpZiBsc3QuaWZcbiAgICAgICAgICAgIGlmIGxzdC5yZXR1cm4gICB0aGVuIHJldHVyblxuICAgICAgICAgICAgaWYgbHN0LndoaWxlICAgIHRoZW4gcmV0dXJuXG4gICAgICAgICAgICBpZiBsc3QuZm9yICAgICAgdGhlbiByZXR1cm5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbm90IChsc3QucmV0dXJuIG9yIGxzdC5jYWxsPy5jYWxsZWU/LnRleHQgPT0gJ2xvZycpXG4gICAgICAgICAgICAgICAgZS5wdXNoXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldDogdHlwZTona2V5d29yZCcgdGV4dDoncmV0dXJuJ1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsOiBlLnBvcCgpXG4gICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgIFxuICAgIGV4cDogKGUpIC0+XG5cbiAgICAgICAgaWYgbm90IGUgdGhlbiByZXR1cm5cbiAgICAgICAgICAgIFxuICAgICAgICBpZiBlLnR5cGUgICAgICAgICAgICAgICAgICAgdGhlbiByZXR1cm5cbiAgICAgICAgZWxzZSBpZiBlIGluc3RhbmNlb2YgQXJyYXkgIHRoZW4gQGV4cCB2IGZvciB2IGluIGUgaWYgZS5sZW5ndGhcbiAgICAgICAgZWxzZSBpZiBlIGluc3RhbmNlb2YgT2JqZWN0XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGUuZnVuY1xuICAgICAgICAgICAgICAgIEBmdW5jIGUuZnVuY1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGZvciBrZXksdmFsIG9mIGVcbiAgICAgICAgICAgICAgICAgICAgaWYgdmFsXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiB2YWwudHlwZSB0aGVuIEBleHAgdmFsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgdmFsIGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgdmFsLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGV4cCB2IGZvciB2IGluIHZhbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGV4cCB2IGZvciBrLHYgb2YgdmFsXG4gICAgICAgIFxuICAgIHZlcmI6IC0+IGlmIEB2ZXJib3NlIHRoZW4gY29uc29sZS5sb2cuYXBwbHkgY29uc29sZS5sb2csIGFyZ3VtZW50cyBcblxubW9kdWxlLmV4cG9ydHMgPSBSZXR1cm5lclxuIl19
//# sourceURL=../coffee/returner.coffee