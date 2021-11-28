// koffee 1.20.0

/*
 0000000   0000000   0000000   00000000   00000000  00000000 
000       000       000   000  000   000  000       000   000
0000000   000       000   000  00000000   0000000   0000000  
     000  000       000   000  000        000       000   000
0000000    0000000   0000000   000        00000000  000   000
 */

/*
    walks through an abstract syntax tree and collects vars
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
        if (e.type) {
            return null;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NvcGVyLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsic2NvcGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7OztBQVFBOzs7QUFSQSxJQUFBOztBQVlNO0lBRUMsZ0JBQUMsSUFBRDtRQUFDLElBQUMsQ0FBQSxPQUFEO1FBRUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFDLENBQUEsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN0QixJQUFDLENBQUEsS0FBRCxHQUFXLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3RCLElBQUMsQ0FBQSxHQUFELEdBQVcsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFJLENBQUM7SUFKdkI7O3FCQU1ILE9BQUEsR0FBUyxTQUFDLEVBQUQ7UUFFTCxJQUFDLENBQUEsSUFBRCxHQUFRO1FBQ1IsSUFBQyxDQUFBLElBQUQsR0FBUTtRQUNSLElBQUMsQ0FBQSxLQUFELENBQU8sRUFBUDtlQUNBO0lBTEs7O3FCQU9ULEtBQUEsR0FBTyxTQUFDLElBQUQ7QUFFSCxZQUFBO1FBQUEsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFOLENBQVcsRUFBWDtRQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBTixDQUFXLElBQUksQ0FBQyxJQUFoQjtBQUNBO0FBQUEsYUFBQSxzQ0FBQTs7WUFBQSxJQUFDLENBQUEsR0FBRCxDQUFLLENBQUw7QUFBQTtRQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFBO1FBQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxHQUFOLENBQUE7ZUFDQTtJQVBHOztxQkFTUCxHQUFBLEdBQUssU0FBQyxDQUFEO0FBRUQsWUFBQTtRQUFBLElBQUcsQ0FBSSxDQUFQO0FBQWMsbUJBQUssT0FBQSxDQUFFLEdBQUYsQ0FBTSxRQUFOLEVBQW5COztRQUVBLE1BQUEsR0FBUyxDQUFBLFNBQUEsS0FBQTttQkFBQSxTQUFDLENBQUQsRUFBRyxDQUFIO2dCQUNMLEtB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Q0FBQyxHQUExQixFQUErQixTQUEvQixFQUFqQjs7SUFBSDs7Ozs7O0FBRVYsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCBcbjAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwMDAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICBcbiAgICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAwICAwMDAgICAwMDBcbiMjI1xuXG4jIyNcbiAgICB3YWxrcyB0aHJvdWdoIGFuIGFic3RyYWN0IHN5bnRheCB0cmVlIGFuZCBjb2xsZWN0cyB2YXJzXG4jIyNcblxuY2xhc3MgU2NvcGVyXG5cbiAgICBAOiAoQGtvZGUpIC0+XG5cbiAgICAgICAgQHZlcmJvc2UgPSBAa29kZS5hcmdzLnZlcmJvc2VcbiAgICAgICAgQGRlYnVnICAgPSBAa29kZS5hcmdzLmRlYnVnXG4gICAgICAgIEByYXcgICAgID0gQGtvZGUuYXJncy5yYXdcbiAgICAgICAgXG4gICAgY29sbGVjdDogKHRsKSAtPlxuICAgICAgICBcbiAgICAgICAgQG1hcHMgPSBbXVxuICAgICAgICBAdmFycyA9IFtdXG4gICAgICAgIEBzY29wZSB0bFxuICAgICAgICB0bFxuXG4gICAgc2NvcGU6IChib2R5KSAtPlxuXG4gICAgICAgIEBtYXBzLnB1c2gge31cbiAgICAgICAgQHZhcnMucHVzaCBib2R5LnZhcnNcbiAgICAgICAgQGV4cCBlIGZvciBlIGluIGJvZHkuZXhwcyA/IFtdXG4gICAgICAgIEBtYXBzLnBvcCgpXG4gICAgICAgIEB2YXJzLnBvcCgpXG4gICAgICAgIGJvZHlcbiAgICAgICAgXG4gICAgZXhwOiAoZSkgLT5cblxuICAgICAgICBpZiBub3QgZSB0aGVuIHJldHVybiBsb2cgJ2RhZnVrISdcbiAgICAgICAgICAgIFxuICAgICAgICBpbnNlcnQgPSAodix0KSA9PiBcbiAgICAgICAgICAgIEB2ZXJiIHllbGxvdyh2KSwgcmVkKHQpXG4gICAgICAgICAgICBpZiBub3QgQG1hcHNbLTFdW3ZdXG4gICAgICAgICAgICAgICAgQHZhcnNbLTFdLnB1c2ggdGV4dDp2LCB0eXBlOnRcbiAgICAgICAgICAgICAgICBAbWFwc1stMV1bdl0gPSB0XG4gICAgICAgIFxuICAgICAgICBpZiBlLnR5cGUgdGhlbiBudWxsXG4gICAgICAgIGVsc2UgaWYgZSBpbnN0YW5jZW9mIEFycmF5ICB0aGVuIEBleHAgdiBmb3IgdiBpbiBlIGlmIGUubGVuZ3RoXG4gICAgICAgIGVsc2UgaWYgZSBpbnN0YW5jZW9mIE9iamVjdFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBlLm9wZXJhdGlvbiBhbmQgZS5vcGVyYXRpb24ubGhzPy50ZXh0IGFuZCBlLm9wZXJhdGlvbi5vcGVyYXRvci50ZXh0ID09ICc9J1xuICAgICAgICAgICAgICAgIGluc2VydCBlLm9wZXJhdGlvbi5saHMudGV4dCwgZS5vcGVyYXRpb24ub3BlcmF0b3IudGV4dFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGUuZm9yXG4gICAgICAgICAgICAgICAgaWYgZS5mb3IudmFscy50ZXh0XG4gICAgICAgICAgICAgICAgICAgIGluc2VydCBlLmZvci52YWxzLnRleHQsICdmb3InXG4gICAgICAgICAgICAgICAgZWxzZSBcbiAgICAgICAgICAgICAgICAgICAgdmFscyA9IGUuZm9yLnZhbHMuYXJyYXk/Lml0ZW1zID8gZS5mb3IudmFsc1xuICAgICAgICAgICAgICAgICAgICBmb3IgdiBpbiB2YWxzID8gW11cbiAgICAgICAgICAgICAgICAgICAgICAgIGluc2VydCB2LnRleHQsICdmb3InIGlmIHYudGV4dFxuXG4gICAgICAgICAgICBpZiBlLmZ1bmNcbiAgICAgICAgICAgICAgICBAZXhwICAgZS5mdW5jLmFyZ3MgaWYgZS5mdW5jLmFyZ3NcbiAgICAgICAgICAgICAgICBAc2NvcGUgZS5mdW5jLmJvZHkgaWYgZS5mdW5jLmJvZHlcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBmb3Iga2V5LHZhbCBvZiBlXG4gICAgICAgICAgICAgICAgICAgIGlmIHZhbFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgdmFsLnR5cGUgdGhlbiBAZXhwIHZhbFxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIHZhbCBpbnN0YW5jZW9mIEFycmF5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIHZhbC5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBleHAgdiBmb3IgdiBpbiB2YWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBleHAgdiBmb3Igayx2IG9mIHZhbFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBsb2cgJ2RhZnVrPycgZVxuICAgICAgICBcbiAgICB2ZXJiOiAtPiBpZiBAdmVyYm9zZSB0aGVuIGNvbnNvbGUubG9nLmFwcGx5IGNvbnNvbGUubG9nLCBhcmd1bWVudHMgXG5cbm1vZHVsZS5leHBvcnRzID0gU2NvcGVyXG4iXX0=
//# sourceURL=../coffee/scoper.coffee