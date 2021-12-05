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
        console.log('returner try', e);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmV0dXJuZXIuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJyZXR1cm5lci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztBQUNOLFFBQVUsT0FBQSxDQUFRLFNBQVI7O0FBSU47SUFFQyxrQkFBQyxJQUFEO1FBQUMsSUFBQyxDQUFBLE9BQUQ7UUFFQSxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3RCLElBQUMsQ0FBQSxLQUFELEdBQVcsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFJLENBQUM7SUFIdkI7O3VCQVdILE9BQUEsR0FBUyxTQUFDLEVBQUQ7ZUFBUSxJQUFDLENBQUEsS0FBRCxDQUFPLEVBQVA7SUFBUjs7dUJBUVQsS0FBQSxHQUFPLFNBQUMsSUFBRDtBQUVILFlBQUE7UUFBQSxrREFBYSxDQUFFLHdCQUFmO0FBQ0k7QUFBQSxpQkFBQSxzQ0FBQTs7Z0JBQUEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxDQUFMO0FBQUEsYUFESjs7ZUFFQTtJQUpHOzt1QkFZUCxJQUFBLEdBQU0sU0FBQyxDQUFEO0FBRUYsWUFBQTtRQUFBLElBQWUsQ0FBQyxDQUFDLElBQWpCO1lBQUEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxDQUFDLENBQUMsSUFBUCxFQUFBOztRQUVBLDZEQUFlLENBQUUsd0JBQWpCO1lBRUksMENBQVMsQ0FBRSxjQUFSLEtBQXFCLEdBQXJCLElBQUEsSUFBQSxLQUF5QixhQUE1QjtnQkFFSSxHQUFBLEdBQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFLLFVBQUUsQ0FBQSxDQUFBO2dCQUVwQixNQUFBLEdBQVMsU0FBQTsyQkFDTCxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFaLENBQWlCO3dCQUFBLENBQUEsTUFBQSxDQUFBLEVBQ2I7NEJBQUEsR0FBQSxFQUFL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QStCLFNBQS9CLEVBQWpCOztJQUFIOzs7Ozs7QUFFVixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbjAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4wMDAwMDAwICAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAgMCAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbjAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4jIyNcblxucHJpbnQgPSByZXF1aXJlICcuL3ByaW50J1xueyB2YWxpZCB9ID0gcmVxdWlyZSAnLi91dGlscydcblxuIyBpbnNlcnRzIGltcGxpY2l0IHJldHVybiBzdGF0ZW1lbnRzXG5cbmNsYXNzIFJldHVybmVyXG5cbiAgICBAOiAoQGtvZGUpIC0+XG5cbiAgICAgICAgQHZlcmJvc2UgPSBAa29kZS5hcmdzLnZlcmJvc2VcbiAgICAgICAgQGRlYnVnICAgPSBAa29kZS5hcmdzLmRlYnVnXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwICAgICAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIGNvbGxlY3Q6ICh0bCkgLT4gQHNjb3BlIHRsXG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBzY29wZTogKGJvZHkpIC0+XG5cbiAgICAgICAgaWYgYm9keT8uZXhwcz8ubGVuZ3RoXG4gICAgICAgICAgICBAZXhwIGUgZm9yIGUgaW4gYm9keS5leHBzXG4gICAgICAgIGJvZHlcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuICAgIFxuICAgIGZ1bmM6IChmKSAtPlxuICAgICAgICBcbiAgICAgICAgQGV4cCBmLmFyZ3MgaWYgZi5hcmdzXG4gICAgICAgIFxuICAgICAgICBpZiBmLmJvZHk/LmV4cHM/Lmxlbmd0aFxuXG4gICAgICAgICAgICBpZiBmLm5hbWU/LnRleHQgbm90IGluIFsnQCcgJ2NvbnN0cnVjdG9yJ11cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBsc3QgPSBmLmJvZHkuZXhwc1stMV1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpbnNlcnQgPSAtPiBcbiAgICAgICAgICAgICAgICAgICAgZi5ib2R5LmV4cHMucHVzaCByZXR1cm46XG4gICAgICAgICAgICAgICAgICAgICAgICByZXQ6IHR5cGU6J2tleXdvcmQnIHRleHQ6J3JldHVybidcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbDogZi5ib2R5LmV4cHMucG9wKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBsc3QudHlwZSBpbiBbJ3ZhcicgJ251bScgJ3NpbmdsZScgJ2RvdWJsZScgJ3RyaXBsZSddIHRoZW4gaW5zZXJ0KClcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGxzdC5jYWxsICAgICAgICB0aGVuIGlmIGxzdC5jYWxsLmNhbGxlZS50ZXh0IG5vdCBpbiBbJ2xvZycgJ3dhcm4nICdlcnJvciddIHRoZW4gaW5zZXJ0KClcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGxzdC5vcGVyYXRpb24gICB0aGVuIGluc2VydCgpXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBsc3QuZnVuYyAgICAgICAgdGhlbiBpbnNlcnQoKVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgbHN0LmFycmF5ICAgICAgIHRoZW4gaW5zZXJ0KClcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGxzdC5wcm9wICAgICAgICB0aGVuIGluc2VydCgpXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBsc3QuaW5kZXggICAgICAgdGhlbiBpbnNlcnQoKVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgbHN0Lm9iamVjdCAgICAgIHRoZW4gaW5zZXJ0KClcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGxzdC5hc3NlcnQgICAgICB0aGVuIGluc2VydCgpXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBsc3QucmV0dXJuICAgICAgdGhlbiBudWxsXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBsc3Qud2hpbGUgICAgICAgdGhlbiBudWxsXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBsc3QuZm9yICAgICAgICAgdGhlbiBudWxsXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBsc3QuaWYgICAgICAgICAgdGhlbiBAaWYgbHN0LmlmXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBsc3QudHJ5ICAgICAgICAgdGhlbiBAdHJ5IGxzdC50cnlcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGxzdC5zd2l0Y2ggICAgICB0aGVuIEBzd2l0Y2ggbHN0LnN3aXRjaFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgbG9nICd0b2RvOiByZXR1cm5lcicgT2JqZWN0LmtleXMobHN0KVswXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBAc2NvcGUgZi5ib2R5IFxuICAgICAgICBcbiAgICAjIDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgIDAwMDAwMCAgICBcbiAgICAjIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAwMDAgICAgICAgXG4gICAgXG4gICAgaWY6IChlKSAtPlxuICAgICAgICBcbiAgICAgICAgZS5yZXR1cm5zID0gdHJ1ZVxuICAgICAgICBAaW5zZXJ0IGUudGhlblxuICAgICAgICBmb3IgZWkgaW4gZS5lbGlmcyA/IFtdXG4gICAgICAgICAgICBAaW5zZXJ0IGVpLmVsaWYudGhlbiBpZiBlaS5lbGlmLnRoZW5cbiAgICAgICAgXG4gICAgICAgIEBpbnNlcnQgZS5lbHNlIGlmIGUuZWxzZVxuXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwIDAwMCAgIFxuICAgICMgICAgMDAwICAgICAwMDAwMDAwICAgICAgMDAwMDAgICAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIHRyeTogKGUpIC0+XG4gICAgICAgIFxuICAgICAgICBsb2cgJ3JldHVybmVyIHRyeScgZVxuICAgICAgICBAaW5zZXJ0IGUuZXhwc1xuICAgICAgICBAaW5zZXJ0IGUuZmluYWxseSBpZiBlLmZpbmFsbHlcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwIDAgMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMDAwMDAwMCAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgc3dpdGNoOiAoZSkgLT5cbiAgICAgICAgXG4gICAgICAgIGZvciB3IGluIGUud2hlbnNcbiAgICAgICAgICAgIEBpbnNlcnQgdy53aGVuLnRoZW4gaWYgdmFsaWQgdy53aGVuLnRoZW5cblxuICAgICAgICBAaW5zZXJ0IGUuZWxzZSBpZiB2YWxpZCBlLmVsc2VcbiAgICAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAgMDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgaW5zZXJ0OiAoZSkgLT5cblxuICAgICAgICBpZiBlIGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgICAgIGxzdCA9IGVbLTFdXG4gICAgICAgICAgICBpZiBsc3QuaWYgICAgICAgdGhlbiByZXR1cm4gQGlmIGxzdC5pZlxuICAgICAgICAgICAgaWYgbHN0LnJldHVybiAgIHRoZW4gcmV0dXJuXG4gICAgICAgICAgICBpZiBsc3Qud2hpbGUgICAgdGhlbiByZXR1cm5cbiAgICAgICAgICAgIGlmIGxzdC5mb3IgICAgICB0aGVuIHJldHVyblxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBub3QgKGxzdC5yZXR1cm4gb3IgbHN0LmNhbGw/LmNhbGxlZT8udGV4dCA9PSAnbG9nJylcbiAgICAgICAgICAgICAgICBlLnB1c2hcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0OiB0eXBlOidrZXl3b3JkJyB0ZXh0OidyZXR1cm4nXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWw6IGUucG9wKClcbiAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgXG4gICAgZXhwOiAoZSkgLT5cblxuICAgICAgICBpZiBub3QgZSB0aGVuIHJldHVyblxuICAgICAgICAgICAgXG4gICAgICAgIGlmIGUudHlwZSAgICAgICAgICAgICAgICAgICB0aGVuIHJldHVyblxuICAgICAgICBlbHNlIGlmIGUgaW5zdGFuY2VvZiBBcnJheSAgdGhlbiBAZXhwIHYgZm9yIHYgaW4gZSBpZiBlLmxlbmd0aFxuICAgICAgICBlbHNlIGlmIGUgaW5zdGFuY2VvZiBPYmplY3RcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgZS5mdW5jXG4gICAgICAgICAgICAgICAgQGZ1bmMgZS5mdW5jXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgZm9yIGtleSx2YWwgb2YgZVxuICAgICAgICAgICAgICAgICAgICBpZiB2YWxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIHZhbC50eXBlIHRoZW4gQGV4cCB2YWxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiB2YWwgaW5zdGFuY2VvZiBBcnJheVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiB2YWwubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAZXhwIHYgZm9yIHYgaW4gdmFsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAZXhwIHYgZm9yIGssdiBvZiB2YWxcbiAgICAgICAgXG4gICAgdmVyYjogLT4gaWYgQHZlcmJvc2UgdGhlbiBjb25zb2xlLmxvZy5hcHBseSBjb25zb2xlLmxvZywgYXJndW1lbnRzIFxuXG5tb2R1bGUuZXhwb3J0cyA9IFJldHVybmVyXG4iXX0=
//# sourceURL=../coffee/returner.coffee