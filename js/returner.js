// koffee 1.20.0

/*
00000000   00000000  000000000  000   000  00000000   000   000  00000000  00000000   
000   000  000          000     000   000  000   000  0000  000  000       000   000  
0000000    0000000      000     000   000  0000000    000 0 000  0000000   0000000    
000   000  000          000     000   000  000   000  000  0000  000       000   000  
000   000  00000000     000      0000000   000   000  000   000  00000000  000   000
 */
var Returner, print;

print = require('./print');

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmV0dXJuZXIuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJyZXR1cm5lci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztBQUlGO0lBRUMsa0JBQUMsSUFBRDtRQUFDLElBQUMsQ0FBQSxPQUFEO1FBRUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFDLENBQUEsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN0QixJQUFDLENBQUEsS0FBRCxHQUFXLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBSSxDQUFDO0lBSHZCOzt1QkFXSCxPQUFBLEdBQVMsU0FBQyxFQUFEO2VBQVEsSUFBQyxDQUFBLEtBQUQsQ0FBTyxFQUFQO0lBQVI7O3VCQVFULEtBQUEsR0FBTyxTQUFDLElBQUQ7QUFFSCxZQUFBO1FBQUEsa0RBQWEsQ0FBRSx3QkFBZjtBQUNJO0FBQUEsaUJBQUEsc0NBQUE7O2dCQUFBLElBQUMsQ0FBQSxHQUFELENBQUssQ0FBTDtBQUFBLGFBREo7O2VBRUE7SUFKRzs7dUJBWVAsSUFBQSxHQUFNLFNBQUMsQ0FBRDtBQUVGLFlBQUE7UUFBQSxJQUFlLENBQUMsQ0FBQyxJQUFqQjtZQUFBLElBQUMsQ0FBQSxHQUFELENBQUssQ0FBQyxDQUFDLElBQVAsRUFBQTs7UUFFQSw2REFBZSxDQUFFLHdCQUFqQjtZQUVJLDBDQUFTLENBQUUsY0FBUixLQUFxQixHQUFyQixJQUFBLElBQUEsS0FBeUIsYUFBNUI7Z0JBRUksR0FBQSxHQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSyxVQUFFLENBQUEsQ0FBQTtnQkFFcEIsTUFBQSxHQUFTLFNBQUE7MkJBQ0wsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBWixDQUFpQjt3QkFBQSxDQUFBLE1BQUEsQ0FBQSxFQUNiOzRCQUFBLEdBQUEsRUFBSztnQ0FBQSxJQUFBLEVBQUssU0FBTDtnQ0FB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eUNBQUEsUUFBQTs7c0RBQUEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxDQUFMO0FBQUE7OytDQUpKOzZCQUZKO3lCQURKO3FCQUFBLE1BQUE7OENBQUE7O0FBREo7Z0NBSEo7YUFGQzs7SUFOSjs7dUJBcUJMLElBQUEsR0FBTSxTQUFBO1FBQUcsSUFBRyxJQUFDLENBQUEsT0FBSjttQkFBaUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFaLENBQWtCLE9BQU8sQ0FBQyxHQUExQixFQUErQixTQUEvQixFQUFqQjs7SUFBSDs7Ozs7O0FBRVYsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4wMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwMDAwMCAgICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwIDAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbjAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4wMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuIyMjXG5cbnByaW50ID0gcmVxdWlyZSAnLi9wcmludCdcblxuIyBpbnNlcnRzIGltcGxpY2l0IHJldHVybiBzdGF0ZW1lbnRzXG5cbmNsYXNzIFJldHVybmVyXG5cbiAgICBAOiAoQGtvZGUpIC0+XG5cbiAgICAgICAgQHZlcmJvc2UgPSBAa29kZS5hcmdzLnZlcmJvc2VcbiAgICAgICAgQGRlYnVnICAgPSBAa29kZS5hcmdzLmRlYnVnXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwICAgICAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIGNvbGxlY3Q6ICh0bCkgLT4gQHNjb3BlIHRsXG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBzY29wZTogKGJvZHkpIC0+XG5cbiAgICAgICAgaWYgYm9keT8uZXhwcz8ubGVuZ3RoXG4gICAgICAgICAgICBAZXhwIGUgZm9yIGUgaW4gYm9keS5leHBzXG4gICAgICAgIGJvZHlcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuICAgIFxuICAgIGZ1bmM6IChmKSAtPlxuICAgICAgICBcbiAgICAgICAgQGV4cCBmLmFyZ3MgaWYgZi5hcmdzXG4gICAgICAgIFxuICAgICAgICBpZiBmLmJvZHk/LmV4cHM/Lmxlbmd0aFxuXG4gICAgICAgICAgICBpZiBmLm5hbWU/LnRleHQgbm90IGluIFsnQCcgJ2NvbnN0cnVjdG9yJ11cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBsc3QgPSBmLmJvZHkuZXhwc1stMV1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpbnNlcnQgPSAtPiBcbiAgICAgICAgICAgICAgICAgICAgZi5ib2R5LmV4cHMucHVzaCByZXR1cm46XG4gICAgICAgICAgICAgICAgICAgICAgICByZXQ6IHR5cGU6J2tleXdvcmQnIHRleHQ6J3JldHVybidcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbDogZi5ib2R5LmV4cHMucG9wKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBsc3QudHlwZSBpbiBbJ3ZhcicgJ251bScgJ3NpbmdsZScgJ2RvdWJsZScgJ3RyaXBsZSddIHRoZW4gaW5zZXJ0KClcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGxzdC5jYWxsICAgICAgICB0aGVuIGlmIGxzdC5jYWxsLmNhbGxlZS50ZXh0IG5vdCBpbiBbJ2xvZycgJ3dhcm4nICdlcnJvciddIHRoZW4gaW5zZXJ0KClcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGxzdC5vcGVyYXRpb24gICB0aGVuIGluc2VydCgpXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBsc3QuZnVuYyAgICAgICAgdGhlbiBpbnNlcnQoKVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgbHN0LmFycmF5ICAgICAgIHRoZW4gaW5zZXJ0KClcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGxzdC5wcm9wICAgICAgICB0aGVuIGluc2VydCgpXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBsc3QuaW5kZXggICAgICAgdGhlbiBpbnNlcnQoKVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgbHN0Lm9iamVjdCAgICAgIHRoZW4gaW5zZXJ0KClcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGxzdC5hc3NlcnQgICAgICB0aGVuIGluc2VydCgpXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBsc3QucmV0dXJuICAgICAgdGhlbiBudWxsXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBsc3Qud2hpbGUgICAgICAgdGhlbiBudWxsXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBsc3QuZm9yICAgICAgICAgdGhlbiBudWxsXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBsc3QuaWYgICAgICAgICAgdGhlbiBAaWYgbHN0LmlmXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBsb2cgJ3RvZG86IHJldHVybmVyJyBPYmplY3Qua2V5cyhsc3QpWzBdXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIEBzY29wZSBmLmJvZHkgXG4gICAgICAgIFxuICAgICMgMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgMDAwMDAwICAgIFxuICAgICMgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgIDAwMCAgICAgICBcbiAgICBcbiAgICBpZjogKGUpIC0+XG4gICAgICAgIFxuICAgICAgICBlLnJldHVybnMgPSB0cnVlXG4gICAgICAgIEBpbnNlcnQgZS50aGVuXG4gICAgICAgIGZvciBlaSBpbiBlLmVsaWZzID8gW11cbiAgICAgICAgICAgIEBpbnNlcnQgZWkuZWxpZi50aGVuIGlmIGVpLmVsaWYudGhlblxuICAgICAgICBcbiAgICAgICAgQGluc2VydCBlLmVsc2UgaWYgZS5lbHNlXG4gICAgICAgICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBpbnNlcnQ6IChlKSAtPlxuXG4gICAgICAgIGlmIGUgaW5zdGFuY2VvZiBBcnJheVxuICAgICAgICAgICAgbHN0ID0gZVstMV1cbiAgICAgICAgICAgIGlmIGxzdC5pZiAgICAgICB0aGVuIHJldHVybiBAaWYgbHN0LmlmXG4gICAgICAgICAgICBpZiBsc3QucmV0dXJuICAgdGhlbiByZXR1cm5cbiAgICAgICAgICAgIGlmIGxzdC53aGlsZSAgICB0aGVuIHJldHVyblxuICAgICAgICAgICAgaWYgbHN0LmZvciAgICAgIHRoZW4gcmV0dXJuXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG5vdCAobHN0LnJldHVybiBvciBsc3QuY2FsbD8uY2FsbGVlPy50ZXh0ID09ICdsb2cnKVxuICAgICAgICAgICAgICAgIGUucHVzaFxuICAgICAgICAgICAgICAgICAgICByZXR1cm46XG4gICAgICAgICAgICAgICAgICAgICAgICByZXQ6IHR5cGU6J2tleXdvcmQnIHRleHQ6J3JldHVybidcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbDogZS5wb3AoKVxuICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICBcbiAgICBleHA6IChlKSAtPlxuXG4gICAgICAgIGlmIG5vdCBlIHRoZW4gcmV0dXJuXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgZS50eXBlICAgICAgICAgICAgICAgICAgIHRoZW4gcmV0dXJuXG4gICAgICAgIGVsc2UgaWYgZSBpbnN0YW5jZW9mIEFycmF5ICB0aGVuIEBleHAgdiBmb3IgdiBpbiBlIGlmIGUubGVuZ3RoXG4gICAgICAgIGVsc2UgaWYgZSBpbnN0YW5jZW9mIE9iamVjdFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBlLmZ1bmNcbiAgICAgICAgICAgICAgICBAZnVuYyBlLmZ1bmNcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBmb3Iga2V5LHZhbCBvZiBlXG4gICAgICAgICAgICAgICAgICAgIGlmIHZhbFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgdmFsLnR5cGUgdGhlbiBAZXhwIHZhbFxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIHZhbCBpbnN0YW5jZW9mIEFycmF5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIHZhbC5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBleHAgdiBmb3IgdiBpbiB2YWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBleHAgdiBmb3Igayx2IG9mIHZhbFxuICAgICAgICBcbiAgICB2ZXJiOiAtPiBpZiBAdmVyYm9zZSB0aGVuIGNvbnNvbGUubG9nLmFwcGx5IGNvbnNvbGUubG9nLCBhcmd1bWVudHMgXG5cbm1vZHVsZS5leHBvcnRzID0gUmV0dXJuZXJcbiJdfQ==
//# sourceURL=../coffee/returner.coffee