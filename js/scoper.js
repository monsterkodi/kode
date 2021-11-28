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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NvcGVyLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsic2NvcGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRTTtJQUVDLGdCQUFDLElBQUQ7UUFBQyxJQUFDLENBQUEsT0FBRDtRQUVBLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDdEIsSUFBQyxDQUFBLEtBQUQsR0FBVyxJQUFDLENBQUEsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN0QixJQUFDLENBQUEsR0FBRCxHQUFXLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBSSxDQUFDO0lBSnZCOztxQkFNSCxPQUFBLEdBQVMsU0FBQyxFQUFEO1FBRUwsSUFBQyxDQUFBLElBQUQsR0FBUTtRQUNSLElBQUMsQ0FBQSxJQUFELEdBQVE7UUFDUixJQUFDLENBQUEsS0FBRCxDQUFPLEVBQVA7ZUFDQTtJQUxLOztxQkFPVCxLQUFBLEdBQU8sU0FBQyxJQUFEO0FBRUgsWUFBQTtRQUFBLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBTixDQUFXLEVBQVg7UUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sQ0FBVyxJQUFJLENBQUMsSUFBaEI7QUFDQTtBQUFBLGFBQUEsc0NBQUE7O1lBQUEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxDQUFMO0FBQUE7UUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLEdBQU4sQ0FBQTtRQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFBO2VBQ0E7SUFQRzs7cUJBU1AsR0FBQSxHQUFLLFNBQUMsQ0FBRDtBQUVELFlBQUE7UUFBQSxJQUFHLENBQUksQ0FBUDtBQUFjLG1CQUFLLE9BQUEsQ0FBRSxHQUFGLENBQU0sUUFBTixFQUFuQjs7UUFFQSxNQUFBLEdBQVMsQ0FBQSxTQUFBLEtBQUE7bUJBQUEsU0FBQyxDQUFELEVBQUcsQ0FBSDtnQkFDTCxLQUFDLENBQUEs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MUIsRUFBK0IsU0FBL0IsRUFBakI7O0lBQUg7Ozs7OztBQUVWLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgXG4wMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwXG4wMDAwMDAwICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgXG4gICAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwXG4wMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgICAwMDAwMDAwMCAgMDAwICAgMDAwXG4jIyNcblxuY2xhc3MgU2NvcGVyXG5cbiAgICBAOiAoQGtvZGUpIC0+XG5cbiAgICAgICAgQHZlcmJvc2UgPSBAa29kZS5hcmdzLnZlcmJvc2VcbiAgICAgICAgQGRlYnVnICAgPSBAa29kZS5hcmdzLmRlYnVnXG4gICAgICAgIEByYXcgICAgID0gQGtvZGUuYXJncy5yYXdcbiAgICAgICAgXG4gICAgY29sbGVjdDogKHRsKSAtPlxuICAgICAgICBcbiAgICAgICAgQG1hcHMgPSBbXVxuICAgICAgICBAdmFycyA9IFtdXG4gICAgICAgIEBzY29wZSB0bFxuICAgICAgICB0bFxuXG4gICAgc2NvcGU6IChib2R5KSAtPlxuXG4gICAgICAgIEBtYXBzLnB1c2gge31cbiAgICAgICAgQHZhcnMucHVzaCBib2R5LnZhcnNcbiAgICAgICAgQGV4cCBlIGZvciBlIGluIGJvZHkuZXhwcyA/IFtdXG4gICAgICAgIEBtYXBzLnBvcCgpXG4gICAgICAgIEB2YXJzLnBvcCgpXG4gICAgICAgIGJvZHlcbiAgICAgICAgXG4gICAgZXhwOiAoZSkgLT5cblxuICAgICAgICBpZiBub3QgZSB0aGVuIHJldHVybiBsb2cgJ2RhZnVrISdcbiAgICAgICAgICAgIFxuICAgICAgICBpbnNlcnQgPSAodix0KSA9PiBcbiAgICAgICAgICAgIEB2ZXJiIHllbGxvdyh2KSwgcmVkKHQpXG4gICAgICAgICAgICBpZiBub3QgQG1hcHNbLTFdW3ZdXG4gICAgICAgICAgICAgICAgQHZhcnNbLTFdLnB1c2ggdGV4dDp2LCB0eXBlOnRcbiAgICAgICAgICAgICAgICBAbWFwc1stMV1bdl0gPSB0XG4gICAgICAgIFxuICAgICAgICAjIGlmIGUudHlwZSA9PSAndmFyJyAgICAgICAgICB0aGVuIEB2ZXJiIGdyYXkoZS50eXBlKSwgZ3JlZW4oZS50ZXh0KVxuICAgICAgICAjIGVsc2UgaWYgZS50eXBlICAgICAgICAgICAgICB0aGVuIEB2ZXJiIGdyYXkoZS50eXBlKSwgYmx1ZShlLnRleHQpXG4gICAgICAgIGlmIGUudHlwZSB0aGVuIG51bGxcbiAgICAgICAgZWxzZSBpZiBlIGluc3RhbmNlb2YgQXJyYXkgIHRoZW4gQGV4cCB2IGZvciB2IGluIGUgaWYgZS5sZW5ndGhcbiAgICAgICAgZWxzZSBpZiBlIGluc3RhbmNlb2YgT2JqZWN0XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGUub3BlcmF0aW9uIGFuZCBlLm9wZXJhdGlvbi5saHM/LnRleHQgYW5kIGUub3BlcmF0aW9uLm9wZXJhdG9yLnRleHQgPT0gJz0nXG4gICAgICAgICAgICAgICAgaW5zZXJ0IGUub3BlcmF0aW9uLmxocy50ZXh0LCBlLm9wZXJhdGlvbi5vcGVyYXRvci50ZXh0XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgZS5mb3JcbiAgICAgICAgICAgICAgICBpZiBlLmZvci52YWxzLnRleHRcbiAgICAgICAgICAgICAgICAgICAgaW5zZXJ0IGUuZm9yLnZhbHMudGV4dCwgJ2ZvcidcbiAgICAgICAgICAgICAgICBlbHNlIFxuICAgICAgICAgICAgICAgICAgICB2YWxzID0gZS5mb3IudmFscy5hcnJheT8uaXRlbXMgPyBlLmZvci52YWxzXG4gICAgICAgICAgICAgICAgICAgIGZvciB2IGluIHZhbHMgPyBbXVxuICAgICAgICAgICAgICAgICAgICAgICAgaW5zZXJ0IHYudGV4dCwgJ2ZvcicgaWYgdi50ZXh0XG5cbiAgICAgICAgICAgIGlmIGUuZnVuY1xuICAgICAgICAgICAgICAgIEBleHAgICBlLmZ1bmMuYXJncyBpZiBlLmZ1bmMuYXJnc1xuICAgICAgICAgICAgICAgIEBzY29wZSBlLmZ1bmMuYm9keSBpZiBlLmZ1bmMuYm9keVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGZvciBrZXksdmFsIG9mIGVcbiAgICAgICAgICAgICAgICAgICAgaWYgdmFsXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiB2YWwudHlwZSB0aGVuIEBleHAgdmFsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgdmFsIGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgdmFsLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGV4cCB2IGZvciB2IGluIHZhbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBsb2cgdmFsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBleHAgdiBmb3Igayx2IG9mIHZhbFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBsb2cgJ2RhZnVrPycgZVxuICAgICAgICBcbiAgICB2ZXJiOiAtPiBpZiBAdmVyYm9zZSB0aGVuIGNvbnNvbGUubG9nLmFwcGx5IGNvbnNvbGUubG9nLCBhcmd1bWVudHMgXG5cbm1vZHVsZS5leHBvcnRzID0gU2NvcGVyXG4iXX0=
//# sourceURL=../coffee/scoper.coffee