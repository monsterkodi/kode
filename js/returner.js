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
        var ins, lst, ref, ref1, ref2, ref3, ref4, ref5;
        if (f.args) {
            this.exp(f.args);
        }
        if ((ref = f.body) != null ? (ref1 = ref.exps) != null ? ref1.length : void 0 : void 0) {
            if ((ref2 = (ref3 = f.name) != null ? ref3.text : void 0) !== '@' && ref2 !== 'constructor') {
                lst = f.body.exps.slice(-1)[0];
                ins = (function(_this) {
                    return function() {
                        return _this.insert(f.body.exps);
                    };
                })(this);
                if ((ref4 = lst.type) === 'var' || ref4 === 'num' || ref4 === 'single' || ref4 === 'double' || ref4 === 'triple') {
                    ins();
                } else if (lst.call) {
                    if ((ref5 = lst.call.callee.text) !== 'log' && ref5 !== 'warn' && ref5 !== 'error') {
                        ins();
                    }
                } else if (lst.operation) {
                    ins();
                } else if (lst.func) {
                    ins();
                } else if (lst.array) {
                    ins();
                } else if (lst.prop) {
                    ins();
                } else if (lst.index) {
                    ins();
                } else if (lst.object) {
                    ins();
                } else if (lst.assert) {
                    ins();
                } else if (lst.stripol) {
                    ins();
                } else if (lst.qmrkop) {
                    ins();
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
        var lst, ref, ref1, ref2;
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
            if (!(lst["return"] || ((ref = (ref1 = lst.call) != null ? (ref2 = ref1.callee) != null ? ref2.text : void 0 : void 0) === 'log' || ref === 'throw'))) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmV0dXJuZXIuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJyZXR1cm5lci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztBQUNOLFFBQVUsT0FBQSxDQUFRLFNBQVI7O0FBSU47SUFFQyxrQkFBQyxJQUFEO1FBQUMsSUFBQyxDQUFBLE9BQUQ7UUFFQSxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3RCLElBQUMsQ0FBQSxLQUFELEdBQVcsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFJLENBQUM7SUFIdkI7O3VCQVdILE9BQUEsR0FBUyxTQUFDLEVBQUQ7ZUFBUSxJQUFDLENBQUEsS0FBRCxDQUFPLEVBQVA7SUFBUjs7dUJBUVQsS0FBQSxHQUFPLFNBQUMsSUFBRDtBQUVILFlBQUE7UUFBQSxrREFBYSxDQUFFLHdCQUFmO0FBQ0k7QUFBQSxpQkFBQSxzQ0FBQTs7Z0JBQUEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxDQUFMO0FBQUEsYUFESjs7ZUFFQTtJQUpHOzt1QkFZUCxJQUFBLEdBQU0sU0FBQyxDQUFEO0FBRUYsWUFBQTtRQUFBLElBQWUsQ0FBQyxDQUFDLElBQWpCO1lBQUEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxDQUFDLENBQUMsSUFBUCxFQUFBOztRQUVBLDZEQUFlLENBQUUsd0JBQWpCO1lBRUksMENBQVMsQ0FBRSxjQUFSLEtBQXFCLEdBQXJCLElBQUEsSUFBQSxLQUF5QixhQUE1QjtnQkFFSSxHQUFBLEdBQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFLLFVBQUUsQ0FBQSxDQUFBO2dCQUVwQixHQUFBLEdBQU0sQ0FBQSxTQUFBLEtBQUE7MkJBQUEsU0FBQTsrQkFBRyxLQUFDLENBQUEsTUFBRCxDQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBZjtvQkFBSDtnQkFBQSxDQUFB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O0lBQUg7Ozs7OztBQUVWLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbjAwMDAwMDAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4wMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiMjI1xuXG5wcmludCA9IHJlcXVpcmUgJy4vcHJpbnQnXG57IHZhbGlkIH0gPSByZXF1aXJlICcuL3V0aWxzJ1xuXG4jIGluc2VydHMgaW1wbGljaXQgcmV0dXJuIHN0YXRlbWVudHNcblxuY2xhc3MgUmV0dXJuZXJcblxuICAgIEA6IChAa29kZSkgLT5cblxuICAgICAgICBAdmVyYm9zZSA9IEBrb2RlLmFyZ3MudmVyYm9zZVxuICAgICAgICBAZGVidWcgICA9IEBrb2RlLmFyZ3MuZGVidWdcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAgICAgICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgY29sbGVjdDogKHRsKSAtPiBAc2NvcGUgdGxcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAgMDAwMDAwMDAgIFxuICAgIFxuICAgIHNjb3BlOiAoYm9keSkgLT5cblxuICAgICAgICBpZiBib2R5Py5leHBzPy5sZW5ndGhcbiAgICAgICAgICAgIEBleHAgZSBmb3IgZSBpbiBib2R5LmV4cHNcbiAgICAgICAgYm9keVxuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4gICAgXG4gICAgZnVuYzogKGYpIC0+XG4gICAgICAgIFxuICAgICAgICBAZXhwIGYuYXJncyBpZiBmLmFyZ3NcbiAgICAgICAgXG4gICAgICAgIGlmIGYuYm9keT8uZXhwcz8ubGVuZ3RoXG5cbiAgICAgICAgICAgIGlmIGYubmFtZT8udGV4dCBub3QgaW4gWydAJyAnY29uc3RydWN0b3InXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGxzdCA9IGYuYm9keS5leHBzWy0xXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlucyA9ID0+IEBpbnNlcnQgZi5ib2R5LmV4cHNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBsc3QudHlwZSBpbiBbJ3ZhcicgJ251bScgJ3NpbmdsZScgJ2RvdWJsZScgJ3RyaXBsZSddIHRoZW4gaW5zKClcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGxzdC5jYWxsICAgICAgICB0aGVuIGlmIGxzdC5jYWxsLmNhbGxlZS50ZXh0IG5vdCBpbiBbJ2xvZycgJ3dhcm4nICdlcnJvciddIHRoZW4gaW5zKClcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGxzdC5vcGVyYXRpb24gICB0aGVuIGlucygpXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBsc3QuZnVuYyAgICAgICAgdGhlbiBpbnMoKVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgbHN0LmFycmF5ICAgICAgIHRoZW4gaW5zKClcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGxzdC5wcm9wICAgICAgICB0aGVuIGlucygpXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBsc3QuaW5kZXggICAgICAgdGhlbiBpbnMoKVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgbHN0Lm9iamVjdCAgICAgIHRoZW4gaW5zKClcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGxzdC5hc3NlcnQgICAgICB0aGVuIGlucygpXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBsc3Quc3RyaXBvbCAgICAgdGhlbiBpbnMoKVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgbHN0LnFtcmtvcCAgICAgIHRoZW4gaW5zKClcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGxzdC5yZXR1cm4gICAgICB0aGVuIG51bGxcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGxzdC53aGlsZSAgICAgICB0aGVuIG51bGxcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGxzdC5mb3IgICAgICAgICB0aGVuIG51bGxcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGxzdC5pZiAgICAgICAgICB0aGVuIEBpZiBsc3QuaWZcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGxzdC50cnkgICAgICAgICB0aGVuIEB0cnkgbHN0LnRyeVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgbHN0LnN3aXRjaCAgICAgIHRoZW4gQHN3aXRjaCBsc3Quc3dpdGNoXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBsb2cgJ3RvZG86IHJldHVybmVyJyBPYmplY3Qua2V5cyhsc3QpWzBdXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIEBzY29wZSBmLmJvZHkgXG4gICAgICAgIFxuICAgICMgMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgMDAwMDAwICAgIFxuICAgICMgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgIDAwMCAgICAgICBcbiAgICBcbiAgICBpZjogKGUpIC0+XG4gICAgICAgIFxuICAgICAgICBlLnJldHVybnMgPSB0cnVlXG4gICAgICAgIEBpbnNlcnQgZS50aGVuXG4gICAgICAgIGZvciBlaSBpbiBlLmVsaWZzID8gW11cbiAgICAgICAgICAgIEBpbnNlcnQgZWkuZWxpZi50aGVuIGlmIGVpLmVsaWYudGhlblxuICAgICAgICBcbiAgICAgICAgQGluc2VydCBlLmVsc2UgaWYgZS5lbHNlXG5cbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgICAwMDAgMDAwICAgXG4gICAgIyAgICAwMDAgICAgIDAwMDAwMDAgICAgICAwMDAwMCAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgdHJ5OiAoZSkgLT5cbiAgICAgICAgXG4gICAgICAgIEBpbnNlcnQgZS5leHBzXG4gICAgICAgIEBpbnNlcnQgZS5maW5hbGx5IGlmIGUuZmluYWxseVxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwMDAwMDAwICBcbiAgICAjICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBzd2l0Y2g6IChlKSAtPlxuICAgICAgICBcbiAgICAgICAgZm9yIHcgaW4gZS53aGVuc1xuICAgICAgICAgICAgQGluc2VydCB3LndoZW4udGhlbiBpZiB2YWxpZCB3LndoZW4udGhlblxuXG4gICAgICAgIEBpbnNlcnQgZS5lbHNlIGlmIHZhbGlkIGUuZWxzZVxuICAgICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBpbnNlcnQ6IChlKSAtPlxuXG4gICAgICAgIGlmIGUgaW5zdGFuY2VvZiBBcnJheVxuICAgICAgICAgICAgbHN0ID0gZVstMV1cbiAgICAgICAgICAgIGlmIGxzdC5pZiAgICAgICB0aGVuIHJldHVybiBAaWYgbHN0LmlmXG4gICAgICAgICAgICBpZiBsc3QucmV0dXJuICAgdGhlbiByZXR1cm5cbiAgICAgICAgICAgIGlmIGxzdC53aGlsZSAgICB0aGVuIHJldHVyblxuICAgICAgICAgICAgaWYgbHN0LmZvciAgICAgIHRoZW4gcmV0dXJuXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG5vdCAobHN0LnJldHVybiBvciBsc3QuY2FsbD8uY2FsbGVlPy50ZXh0IGluIFsnbG9nJyAndGhyb3cnXSlcbiAgICAgICAgICAgICAgICBlLnB1c2hcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0OiB0eXBlOidrZXl3b3JkJyB0ZXh0OidyZXR1cm4nXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWw6IGUucG9wKClcbiAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgXG4gICAgZXhwOiAoZSkgLT5cblxuICAgICAgICBpZiBub3QgZSB0aGVuIHJldHVyblxuICAgICAgICAgICAgXG4gICAgICAgIGlmIGUudHlwZSAgICAgICAgICAgICAgICAgICB0aGVuIHJldHVyblxuICAgICAgICBlbHNlIGlmIGUgaW5zdGFuY2VvZiBBcnJheSAgdGhlbiBAZXhwIHYgZm9yIHYgaW4gZSBpZiBlLmxlbmd0aFxuICAgICAgICBlbHNlIGlmIGUgaW5zdGFuY2VvZiBPYmplY3RcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgZS5mdW5jXG4gICAgICAgICAgICAgICAgQGZ1bmMgZS5mdW5jXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgZm9yIGtleSx2YWwgb2YgZVxuICAgICAgICAgICAgICAgICAgICBpZiB2YWxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIHZhbC50eXBlIHRoZW4gQGV4cCB2YWxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiB2YWwgaW5zdGFuY2VvZiBBcnJheVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiB2YWwubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAZXhwIHYgZm9yIHYgaW4gdmFsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAZXhwIHYgZm9yIGssdiBvZiB2YWxcbiAgICAgICAgXG4gICAgdmVyYjogLT4gaWYgQHZlcmJvc2UgdGhlbiBjb25zb2xlLmxvZy5hcHBseSBjb25zb2xlLmxvZywgYXJndW1lbnRzIFxuXG5tb2R1bGUuZXhwb3J0cyA9IFJldHVybmVyXG4iXX0=
//# sourceURL=../coffee/returner.coffee