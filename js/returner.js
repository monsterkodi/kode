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
        e.then = this.insert(e.then);
        ref1 = (ref = e.elifs) != null ? ref : [];
        for (i = 0, len = ref1.length; i < len; i++) {
            ei = ref1[i];
            if (ei.elif.then) {
                this.insert(ei.elif.then);
            }
        }
        if (e["else"]) {
            return e["else"] = this.insert(e["else"]);
        }
    };

    Returner.prototype.insert = function(e) {
        var l, ref, ref1;
        if (e instanceof Array) {
            l = e.slice(-1)[0];
            if (!(l["return"] || ((ref = l.call) != null ? (ref1 = ref.callee) != null ? ref1.text : void 0 : void 0) === 'log')) {
                e.push({
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
        return e;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmV0dXJuZXIuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJyZXR1cm5lci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztBQUlGO0lBRUMsa0JBQUMsSUFBRDtRQUFDLElBQUMsQ0FBQSxPQUFEO1FBRUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFDLENBQUEsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN0QixJQUFDLENBQUEsS0FBRCxHQUFXLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBSSxDQUFDO0lBSHZCOzt1QkFXSCxPQUFBLEdBQVMsU0FBQyxFQUFEO2VBQVEsSUFBQyxDQUFBLEtBQUQsQ0FBTyxFQUFQO0lBQVI7O3VCQVFULEtBQUEsR0FBTyxTQUFDLElBQUQ7QUFFSCxZQUFBO1FBQUEsa0RBQWEsQ0FBRSx3QkFBZjtBQUNJO0FBQUEsaUJBQUEsc0NBQUE7O2dCQUFBLElBQUMsQ0FBQSxHQUFELENBQUssQ0FBTDtBQUFBLGFBREo7O2VBRUE7SUFKRzs7dUJBWVAsSUFBQSxHQUFNLFNBQUMsQ0FBRDtBQUVGLFlBQUE7UUFBQSxJQUFlLENBQUMsQ0FBQyxJQUFqQjtZQUFBLElBQUMsQ0FBQSxHQUFELENBQUssQ0FBQyxDQUFDLElBQVAsRUFBQTs7UUFFQSw2REFBZSxDQUFFLHdCQUFqQjtZQUVJLDBDQUFTLENBQUUsY0FBUixLQUFxQixHQUFyQixJQUFBLElBQUEsS0FBeUIsYUFBNUI7Z0JBRUksR0FBQSxHQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSyxVQUFFLENBQUEsQ0FBQTtnQkFFcEIsTUFBQSxHQUFTLFNBQUE7MkJBQ0wsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBWixDQUFpQjt3QkFBQSxDQUFBLE1BQUEsQ0FBQSxFQUNiOzRCQUFBLEdBQUEsRUFBSztnQ0FBQSxJQUFBLEVBQUssU0FBTDtnQ0FB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LENBQUMsS0FBWixDQUFrQixPQUFPLENBQUMsR0FBMUIsRUFBK0IsU0FBL0IsRUFBakI7O0lBQUg7Ozs7OztBQUVWLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbjAwMDAwMDAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4wMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiMjI1xuXG5wcmludCA9IHJlcXVpcmUgJy4vcHJpbnQnXG5cbiMgaW5zZXJ0cyBpbXBsaWNpdCByZXR1cm4gc3RhdGVtZW50c1xuXG5jbGFzcyBSZXR1cm5lclxuXG4gICAgQDogKEBrb2RlKSAtPlxuXG4gICAgICAgIEB2ZXJib3NlID0gQGtvZGUuYXJncy52ZXJib3NlXG4gICAgICAgIEBkZWJ1ZyAgID0gQGtvZGUuYXJncy5kZWJ1Z1xuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgICAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBjb2xsZWN0OiAodGwpIC0+IEBzY29wZSB0bFxuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgICAwMDAwMDAwMCAgXG4gICAgXG4gICAgc2NvcGU6IChib2R5KSAtPlxuXG4gICAgICAgIGlmIGJvZHk/LmV4cHM/Lmxlbmd0aFxuICAgICAgICAgICAgQGV4cCBlIGZvciBlIGluIGJvZHkuZXhwc1xuICAgICAgICBib2R5XG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiAgICBcbiAgICBmdW5jOiAoZikgLT5cbiAgICAgICAgXG4gICAgICAgIEBleHAgZi5hcmdzIGlmIGYuYXJnc1xuICAgICAgICBcbiAgICAgICAgaWYgZi5ib2R5Py5leHBzPy5sZW5ndGhcblxuICAgICAgICAgICAgaWYgZi5uYW1lPy50ZXh0IG5vdCBpbiBbJ0AnICdjb25zdHJ1Y3RvciddXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgbHN0ID0gZi5ib2R5LmV4cHNbLTFdXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaW5zZXJ0ID0gLT4gXG4gICAgICAgICAgICAgICAgICAgIGYuYm9keS5leHBzLnB1c2ggcmV0dXJuOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0OiB0eXBlOidrZXl3b3JkJyB0ZXh0OidyZXR1cm4nXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWw6IGYuYm9keS5leHBzLnBvcCgpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgbHN0LnR5cGUgaW4gWyd2YXInICdudW0nICdzaW5nbGUnICdkb3VibGUnICd0cmlwbGUnXSB0aGVuIGluc2VydCgpXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBsc3QuY2FsbCAgICAgICAgdGhlbiBpZiBsc3QuY2FsbC5jYWxsZWUudGV4dCBub3QgaW4gWydsb2cnICd3YXJuJyAnZXJyb3InXSB0aGVuIGluc2VydCgpXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBsc3Qub3BlcmF0aW9uICAgdGhlbiBpbnNlcnQoKVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgbHN0LmZ1bmMgICAgICAgIHRoZW4gaW5zZXJ0KClcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGxzdC5hcnJheSAgICAgICB0aGVuIGluc2VydCgpXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBsc3QucHJvcCAgICAgICAgdGhlbiBpbnNlcnQoKVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgbHN0LmluZGV4ICAgICAgIHRoZW4gaW5zZXJ0KClcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGxzdC5vYmplY3QgICAgICB0aGVuIGluc2VydCgpXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBsc3QuYXNzZXJ0ICAgICAgdGhlbiBpbnNlcnQoKVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgbHN0LnJldHVybiAgICAgIHRoZW4gbnVsbFxuICAgICAgICAgICAgICAgIGVsc2UgaWYgbHN0LndoaWxlICAgICAgIHRoZW4gbnVsbFxuICAgICAgICAgICAgICAgIGVsc2UgaWYgbHN0LmZvciAgICAgICAgIHRoZW4gbnVsbFxuICAgICAgICAgICAgICAgIGVsc2UgaWYgbHN0LmlmICAgICAgICAgIHRoZW4gQGlmIGxzdC5pZlxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgbG9nICd0b2RvOiByZXR1cm5lcicgT2JqZWN0LmtleXMobHN0KVswXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBAc2NvcGUgZi5ib2R5IFxuICAgICAgICBcbiAgICAjIDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgIDAwMDAwMCAgICBcbiAgICAjIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAwMDAgICAgICAgXG4gICAgXG4gICAgaWY6IChlKSAtPlxuICAgICAgICBcbiAgICAgICAgZS5yZXR1cm5zID0gdHJ1ZVxuICAgICAgICBlLnRoZW4gPSBAaW5zZXJ0IGUudGhlblxuICAgICAgICBmb3IgZWkgaW4gZS5lbGlmcyA/IFtdXG4gICAgICAgICAgICBAaW5zZXJ0IGVpLmVsaWYudGhlbiBpZiBlaS5lbGlmLnRoZW5cbiAgICAgICAgXG4gICAgICAgIGUuZWxzZSA9IEBpbnNlcnQgZS5lbHNlIGlmIGUuZWxzZVxuICAgICAgICAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAgMDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgaW5zZXJ0OiAoZSkgLT5cblxuICAgICAgICBpZiBlIGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgICAgIGwgPSBlWy0xXVxuICAgICAgICAgICAgaWYgbm90IChsLnJldHVybiBvciBsLmNhbGw/LmNhbGxlZT8udGV4dCA9PSAnbG9nJylcbiAgICAgICAgICAgICAgICBlLnB1c2hcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0OiB0eXBlOidrZXl3b3JkJyB0ZXh0OidyZXR1cm4nXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWw6IGUucG9wKClcbiAgICAgICAgZVxuICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICBcbiAgICBleHA6IChlKSAtPlxuXG4gICAgICAgIGlmIG5vdCBlIHRoZW4gcmV0dXJuXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgZS50eXBlICAgICAgICAgICAgICAgICAgIHRoZW4gcmV0dXJuXG4gICAgICAgIGVsc2UgaWYgZSBpbnN0YW5jZW9mIEFycmF5ICB0aGVuIEBleHAgdiBmb3IgdiBpbiBlIGlmIGUubGVuZ3RoXG4gICAgICAgIGVsc2UgaWYgZSBpbnN0YW5jZW9mIE9iamVjdFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBlLmZ1bmNcbiAgICAgICAgICAgICAgICBAZnVuYyBlLmZ1bmNcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBmb3Iga2V5LHZhbCBvZiBlXG4gICAgICAgICAgICAgICAgICAgIGlmIHZhbFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgdmFsLnR5cGUgdGhlbiBAZXhwIHZhbFxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIHZhbCBpbnN0YW5jZW9mIEFycmF5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIHZhbC5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBleHAgdiBmb3IgdiBpbiB2YWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBleHAgdiBmb3Igayx2IG9mIHZhbFxuICAgICAgICBcbiAgICB2ZXJiOiAtPiBpZiBAdmVyYm9zZSB0aGVuIGNvbnNvbGUubG9nLmFwcGx5IGNvbnNvbGUubG9nLCBhcmd1bWVudHMgXG5cbm1vZHVsZS5leHBvcnRzID0gUmV0dXJuZXJcbiJdfQ==
//# sourceURL=../coffee/returner.coffee