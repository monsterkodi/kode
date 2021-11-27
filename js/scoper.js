// koffee 1.20.0

/*
 0000000   0000000   0000000   00000000   00000000  00000000 
000       000       000   000  000   000  000       000   000
0000000   000       000   000  00000000   0000000   0000000  
     000  000       000   000  000        000       000   000
0000000    0000000   0000000   000        00000000  000   000
 */
var Scoper;

Scoper = (function() {
    function Scoper(kode) {
        this.kode = kode;
        this.verbose = this.kode.args.verbose;
        this.debug = this.kode.args.debug;
        this.raw = this.kode.args.raw;
    }

    Scoper.prototype.collect = function(tl) {
        this.maps = [];
        this.vars = [];
        this.scope(tl);
        return tl;
    };

    Scoper.prototype.scope = function(body) {
        var e, i, len, ref, ref1;
        this.maps.push({});
        this.vars.push(body.vars);
        ref1 = (ref = body.exps) != null ? ref : [];
        for (i = 0, len = ref1.length; i < len; i++) {
            e = ref1[i];
            this.exp(e);
        }
        this.maps.pop();
        this.vars.pop();
        return body;
    };

    Scoper.prototype.exp = function(e) {
        var i, insert, j, k, key, len, len1, ref, ref1, ref2, ref3, results, results1, v, val, vals;
        if (!e) {
            return console.log('dafuk!');
        }
        insert = (function(_this) {
            return function(v, t) {
                _this.verb(yellow(v), red(t));
                if (!_this.maps.slice(-1)[0][v]) {
                    _this.vars.slice(-1)[0].push({
                        text: v,
                        type: t
                    });
                    return _this.maps.slice(-1)[0][v] = t;
                }
            };
        })(this);
        if (e.type === 'var') {
            return this.verb(gray(e.type), green(e.text));
        } else if (e.type) {
            return this.verb(gray(e.type), blue(e.text));
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
            if (e.operation && ((ref = e.operation.lhs) != null ? ref.text : void 0) && e.operation.operator.text === '=') {
                insert(e.operation.lhs.text, e.operation.operator.text);
            }
            if (e["for"]) {
                if (e["for"].vals.text) {
                    insert(e["for"].vals.text, 'for');
                } else {
                    vals = (ref1 = (ref2 = e["for"].vals.array) != null ? ref2.items : void 0) != null ? ref1 : e["for"].vals;
                    ref3 = vals != null ? vals : [];
                    for (j = 0, len1 = ref3.length; j < len1; j++) {
                        v = ref3[j];
                        if (v.text) {
                            insert(v.text, 'for');
                        }
                    }
                }
            }
            if (e.func) {
                if (e.func.args) {
                    this.exp(e.func.args);
                }
                if (e.func.body) {
                    return this.scope(e.func.body);
                }
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
                                        var l, len2, results2;
                                        results2 = [];
                                        for (l = 0, len2 = val.length; l < len2; l++) {
                                            v = val[l];
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
        } else {
            return console.log('dafuk?', e);
        }
    };

    Scoper.prototype.verb = function() {
        if (this.verbose) {
            return console.log.apply(console.log, arguments);
        }
    };

    return Scoper;

})();

module.exports = Scoper;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NvcGVyLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsic2NvcGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRTTtJQUVDLGdCQUFDLElBQUQ7UUFBQyxJQUFDLENBQUEsT0FBRDtRQUVBLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDdEIsSUFBQyxDQUFBLEtBQUQsR0FBVyxJQUFDLENBQUEsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN0QixJQUFDLENBQUEsR0FBRCxHQUFXLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBSSxDQUFDO0lBSnZCOztxQkFNSCxPQUFBLEdBQVMsU0FBQyxFQUFEO1FBRUwsSUFBQyxDQUFBLElBQUQsR0FBUTtRQUNSLElBQUMsQ0FBQSxJQUFELEdBQVE7UUFDUixJQUFDLENBQUEsS0FBRCxDQUFPLEVBQVA7ZUFDQTtJQUxLOztxQkFPVCxLQUFBLEdBQU8sU0FBQyxJQUFEO0FBRUgsWUFBQTtRQUFBLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBTixDQUFXLEVBQVg7UUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sQ0FBVyxJQUFJLENBQUMsSUFBaEI7QUFDQTtBQUFBLGFBQUEsc0NBQUE7O1lBQUEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxDQUFMO0FBQUE7UUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLEdBQU4sQ0FBQTtRQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFBO2VBQ0E7SUFQRzs7cUJBU1AsR0FBQSxHQUFLLFNBQUMsQ0FBRDtBQUVELFlBQUE7UUFBQSxJQUFHLENBQUksQ0FBUDtBQUFjLG1CQUFLLE9BQUEsQ0FBRSxHQUFGLENBQU0sUUFBTixFQUFuQjs7UUFFQSxNQUFBLEdBQVMsQ0FBQSxTQUFBLEtBQUE7bUJBQUEsU0FBQyxDQUFELEVBQUcsQ0FBSDtnQkFDTCxLQUFDLENBQUEs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QUssQ0FBTDtBQUFBOzsrQ0FKSjs2QkFGSjt5QkFESjtxQkFBQSxNQUFBOzhDQUFBOztBQURKO2dDQUpKO2FBYkM7U0FBQSxNQUFBO21CQTJCRixPQUFBLENBQUMsR0FBRCxDQUFLLFFBQUwsRUFBYyxDQUFkLEVBM0JFOztJQWJKOztxQkEwQ0wsSUFBQSxHQUFNLFNBQUE7UUFBRyxJQUFHLElBQUMsQ0FBQSxPQUFKO21CQUFpQixPQUFPLENBQUMsR0FBRyxDQUFDLEtBQVosQ0FBa0IsT0FBTyxDQUFDLEdBQTFCLEVBQStCLFNBQS9CLEVBQWpCOztJQUFIOzs7Ozs7QUFFVixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwIFxuMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwMDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgIFxuICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuIyMjXG5cbmNsYXNzIFNjb3BlclxuXG4gICAgQDogKEBrb2RlKSAtPlxuXG4gICAgICAgIEB2ZXJib3NlID0gQGtvZGUuYXJncy52ZXJib3NlXG4gICAgICAgIEBkZWJ1ZyAgID0gQGtvZGUuYXJncy5kZWJ1Z1xuICAgICAgICBAcmF3ICAgICA9IEBrb2RlLmFyZ3MucmF3XG4gICAgICAgIFxuICAgIGNvbGxlY3Q6ICh0bCkgLT5cbiAgICAgICAgXG4gICAgICAgIEBtYXBzID0gW11cbiAgICAgICAgQHZhcnMgPSBbXVxuICAgICAgICBAc2NvcGUgdGxcbiAgICAgICAgdGxcblxuICAgIHNjb3BlOiAoYm9keSkgLT5cblxuICAgICAgICBAbWFwcy5wdXNoIHt9XG4gICAgICAgIEB2YXJzLnB1c2ggYm9keS52YXJzXG4gICAgICAgIEBleHAgZSBmb3IgZSBpbiBib2R5LmV4cHMgPyBbXVxuICAgICAgICBAbWFwcy5wb3AoKVxuICAgICAgICBAdmFycy5wb3AoKVxuICAgICAgICBib2R5XG4gICAgICAgIFxuICAgIGV4cDogKGUpIC0+XG5cbiAgICAgICAgaWYgbm90IGUgdGhlbiByZXR1cm4gbG9nICdkYWZ1ayEnXG4gICAgICAgICAgICBcbiAgICAgICAgaW5zZXJ0ID0gKHYsdCkgPT4gXG4gICAgICAgICAgICBAdmVyYiB5ZWxsb3codiksIHJlZCh0KVxuICAgICAgICAgICAgaWYgbm90IEBtYXBzWy0xXVt2XVxuICAgICAgICAgICAgICAgIEB2YXJzWy0xXS5wdXNoIHRleHQ6diwgdHlwZTp0XG4gICAgICAgICAgICAgICAgQG1hcHNbLTFdW3ZdID0gdFxuICAgICAgICBcbiAgICAgICAgaWYgZS50eXBlID09ICd2YXInICAgICAgICAgIHRoZW4gQHZlcmIgZ3JheShlLnR5cGUpLCBncmVlbihlLnRleHQpXG4gICAgICAgIGVsc2UgaWYgZS50eXBlICAgICAgICAgICAgICB0aGVuIEB2ZXJiIGdyYXkoZS50eXBlKSwgYmx1ZShlLnRleHQpXG4gICAgICAgIGVsc2UgaWYgZSBpbnN0YW5jZW9mIEFycmF5ICB0aGVuIEBleHAgdiBmb3IgdiBpbiBlIGlmIGUubGVuZ3RoXG4gICAgICAgIGVsc2UgaWYgZSBpbnN0YW5jZW9mIE9iamVjdFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBlLm9wZXJhdGlvbiBhbmQgZS5vcGVyYXRpb24ubGhzPy50ZXh0IGFuZCBlLm9wZXJhdGlvbi5vcGVyYXRvci50ZXh0ID09ICc9J1xuICAgICAgICAgICAgICAgIGluc2VydCBlLm9wZXJhdGlvbi5saHMudGV4dCwgZS5vcGVyYXRpb24ub3BlcmF0b3IudGV4dFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGUuZm9yXG4gICAgICAgICAgICAgICAgaWYgZS5mb3IudmFscy50ZXh0XG4gICAgICAgICAgICAgICAgICAgIGluc2VydCBlLmZvci52YWxzLnRleHQsICdmb3InXG4gICAgICAgICAgICAgICAgZWxzZSBcbiAgICAgICAgICAgICAgICAgICAgdmFscyA9IGUuZm9yLnZhbHMuYXJyYXk/Lml0ZW1zID8gZS5mb3IudmFsc1xuICAgICAgICAgICAgICAgICAgICBmb3IgdiBpbiB2YWxzID8gW11cbiAgICAgICAgICAgICAgICAgICAgICAgIGluc2VydCB2LnRleHQsICdmb3InIGlmIHYudGV4dFxuXG4gICAgICAgICAgICBpZiBlLmZ1bmNcbiAgICAgICAgICAgICAgICBAZXhwICAgZS5mdW5jLmFyZ3MgaWYgZS5mdW5jLmFyZ3NcbiAgICAgICAgICAgICAgICBAc2NvcGUgZS5mdW5jLmJvZHkgaWYgZS5mdW5jLmJvZHlcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBmb3Iga2V5LHZhbCBvZiBlXG4gICAgICAgICAgICAgICAgICAgIGlmIHZhbFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgdmFsLnR5cGUgdGhlbiBAZXhwIHZhbFxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIHZhbCBpbnN0YW5jZW9mIEFycmF5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIHZhbC5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBleHAgdiBmb3IgdiBpbiB2YWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBleHAgdiBmb3Igayx2IG9mIHZhbFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBsb2cgJ2RhZnVrPycgZVxuICAgICAgICBcbiAgICB2ZXJiOiAtPiBpZiBAdmVyYm9zZSB0aGVuIGNvbnNvbGUubG9nLmFwcGx5IGNvbnNvbGUubG9nLCBhcmd1bWVudHMgXG5cbm1vZHVsZS5leHBvcnRzID0gU2NvcGVyXG4iXX0=
//# sourceURL=../coffee/scoper.coffee