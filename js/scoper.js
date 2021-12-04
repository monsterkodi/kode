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
        var i, insert, j, k, key, keyval, l, len, len1, len2, ref, ref1, ref2, ref3, ref4, ref5, results, results1, v, val, vals;
        if (!e) {
            return;
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
            if (e.operation && e.operation.operator.text === '=') {
                if ((ref = e.operation.lhs) != null ? ref.text : void 0) {
                    insert(e.operation.lhs.text, e.operation.operator.text);
                } else if (e.operation.lhs.object) {
                    ref1 = e.operation.lhs.object.keyvals;
                    for (j = 0, len1 = ref1.length; j < len1; j++) {
                        keyval = ref1[j];
                        if (keyval.type === 'var') {
                            insert(keyval.text, 'curly');
                        }
                    }
                }
            }
            if (e["for"]) {
                if (e["for"].vals.text) {
                    insert(e["for"].vals.text, 'for');
                } else {
                    vals = (ref2 = (ref3 = e["for"].vals.array) != null ? ref3.items : void 0) != null ? ref2 : e["for"].vals;
                    ref4 = vals != null ? vals : [];
                    for (l = 0, len2 = ref4.length; l < len2; l++) {
                        v = ref4[l];
                        if (v.text) {
                            insert(v.text, 'for');
                        }
                    }
                }
            }
            if (e.assert) {
                this.verb('assert', e);
                if (((ref5 = e.assert.obj.type) !== 'var') && !e.assert.obj.index) {
                    insert("_" + e.assert.qmrk.line + "_" + e.assert.qmrk.col + "_", '?.');
                }
            }
            if (e.qmrkop) {
                this.verb('qmrkop', e);
                insert("_" + e.qmrkop.qmrk.line + "_" + e.qmrkop.qmrk.col + "_", ' ? ');
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
                                        var len3, m, results2;
                                        results2 = [];
                                        for (m = 0, len3 = val.length; m < len3; m++) {
                                            v = val[m];
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

    Scoper.prototype.verb = function() {
        if (this.verbose) {
            return console.log.apply(console.log, arguments);
        }
    };

    return Scoper;

})();

module.exports = Scoper;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NvcGVyLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsic2NvcGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFVTTtJQUVDLGdCQUFDLElBQUQ7UUFBQyxJQUFDLENBQUEsT0FBRDtRQUVBLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDdEIsSUFBQyxDQUFBLEtBQUQsR0FBVyxJQUFDLENBQUEsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN0QixJQUFDLENBQUEsR0FBRCxHQUFXLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBSSxDQUFDO0lBSnZCOztxQkFZSCxPQUFBLEdBQVMsU0FBQyxFQUFEO1FBRUwsSUFBQyxDQUFBLElBQUQsR0FBUTtRQUNSLElBQUMsQ0FBQSxJQUFELEdBQVE7UUFDUixJQUFDLENBQUEsS0FBRCxDQUFPLEVBQVA7ZUFDQTtJQUxLOztxQkFhVCxLQUFBLEdBQU8sU0FBQyxJQUFEO0FBRUgsWUFBQTtRQUFBLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBTixDQUFXLEVBQVg7UUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sQ0FBVyxJQUFJLENBQUMsSUFBaEI7QUFDQTtBQUFBLGFBQUEsc0NBQUE7O1lBQUEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxDQUFMO0FBQUE7UUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLEdBQU4sQ0FBQTtRQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFBO2VBQ0E7SUFQRzs7cUJBZVAsR0FBQSxHQUFLLFNBQUMsQ0FBRDtBQUVELFlBQUE7UUFBQSxJQUFHLENBQUksQ0FBUDtBQUFjLG1CQUFkOztRQUVBLE1BQUEsR0FBUyxDQUFBLFNBQUEsS0FBQTttQkFBQSxTQUFDLENBQUQsRUFBRyxDQUFIO2dCQUNMLEtBQUMsQ0FBQSxJQUFELENBQU0sTUFBQSxDQUFPLENBQVAsQ0FBTixF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QjtvQkFBQSxJQUFDLENBQUEsR0FBRCxDQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBZCxFQUFBOztnQkFDQSxJQUFzQixDQUFDLENBQUMsSUFBSSxDQUFDLElBQTdCOzJCQUFBLElBQUMsQ0FBQSxLQUFELENBQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFkLEVBQUE7aUJBRko7YUFBQSxNQUFBO0FBSUk7cUJBQUEsUUFBQTs7b0JBQ0ksSUFBRyxHQUFIO3dCQUNJLElBQUcsR0FBRyxDQUFDLElBQVA7MENBQWlCLElBQUMsQ0FBQSxHQUFELENBQUssR0FBTCxHQUFqQjt5QkFBQSxNQUFBOzRCQUVJLElBQUcsR0FBQSxZQUFlLEtBQWxCO2dDQUNJLElBQUcsR0FBRyxDQUFDLE1BQVA7OztBQUNJOzZDQUFBLHVDQUFBOzswREFBQSxJQUFDLENBQUEsR0FBRCxDQUFLLENBQUw7QUFBQTs7bURBREo7aUNBQUEsTUFBQTswREFBQTtpQ0FESjs2QkFBQSxNQUFBOzs7QUFJSTt5Q0FBQSxRQUFBOztzREFBQSxJQUFDLENBQUEsR0FBRCxDQUFLLENBQUw7QUFBQTs7K0NBSko7NkJBRko7eUJBREo7cUJBQUEsTUFBQTs4Q0FBQTs7QUFESjtnQ0FKSjthQTVCQzs7SUFaSjs7cUJBc0RMLElBQUEsR0FBTSxTQUFBO1FBQUcsSUFBRyxJQUFDLENBQUEsT0FBSjttQkFBaUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFaLENBQWtCLE9BQU8sQ0FBQyxHQUExQixFQUErQixTQUEvQixFQUFqQjs7SUFBSDs7Ozs7O0FBRVYsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCBcbjAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwMDAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICBcbiAgICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAwICAwMDAgICAwMDBcbiMjI1xuXG4jIHdhbGtzIHRocm91Z2ggYW4gYWJzdHJhY3Qgc3ludGF4IHRyZWUgYW5kIGNvbGxlY3RzIHZhcnNcblxuY2xhc3MgU2NvcGVyXG5cbiAgICBAOiAoQGtvZGUpIC0+XG5cbiAgICAgICAgQHZlcmJvc2UgPSBAa29kZS5hcmdzLnZlcmJvc2VcbiAgICAgICAgQGRlYnVnICAgPSBAa29kZS5hcmdzLmRlYnVnXG4gICAgICAgIEByYXcgICAgID0gQGtvZGUuYXJncy5yYXdcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAgICAgICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgY29sbGVjdDogKHRsKSAtPlxuICAgICAgICBcbiAgICAgICAgQG1hcHMgPSBbXVxuICAgICAgICBAdmFycyA9IFtdXG4gICAgICAgIEBzY29wZSB0bFxuICAgICAgICB0bFxuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgICAwMDAwMDAwMCAgXG4gICAgXG4gICAgc2NvcGU6IChib2R5KSAtPlxuXG4gICAgICAgIEBtYXBzLnB1c2gge31cbiAgICAgICAgQHZhcnMucHVzaCBib2R5LnZhcnNcbiAgICAgICAgQGV4cCBlIGZvciBlIGluIGJvZHkuZXhwcyA/IFtdXG4gICAgICAgIEBtYXBzLnBvcCgpXG4gICAgICAgIEB2YXJzLnBvcCgpXG4gICAgICAgIGJvZHlcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICBcbiAgICBleHA6IChlKSAtPlxuXG4gICAgICAgIGlmIG5vdCBlIHRoZW4gcmV0dXJuXG4gICAgICAgICAgICBcbiAgICAgICAgaW5zZXJ0ID0gKHYsdCkgPT4gXG4gICAgICAgICAgICBAdmVyYiB5ZWxsb3codiksIHJlZCh0KVxuICAgICAgICAgICAgaWYgbm90IEBtYXBzWy0xXVt2XVxuICAgICAgICAgICAgICAgIEB2YXJzWy0xXS5wdXNoIHRleHQ6diwgdHlwZTp0XG4gICAgICAgICAgICAgICAgQG1hcHNbLTFdW3ZdID0gdFxuICAgICAgICBcbiAgICAgICAgaWYgZS50eXBlIHRoZW4gbnVsbFxuICAgICAgICBlbHNlIGlmIGUgaW5zdGFuY2VvZiBBcnJheSAgdGhlbiBAZXhwIHYgZm9yIHYgaW4gZSBpZiBlLmxlbmd0aFxuICAgICAgICBlbHNlIGlmIGUgaW5zdGFuY2VvZiBPYmplY3RcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgZS5vcGVyYXRpb24gYW5kIGUub3BlcmF0aW9uLm9wZXJhdG9yLnRleHQgPT0gJz0nXG4gICAgICAgICAgICAgICAgaWYgZS5vcGVyYXRpb24ubGhzPy50ZXh0XG4gICAgICAgICAgICAgICAgICAgIGluc2VydCBlLm9wZXJhdGlvbi5saHMudGV4dCwgZS5vcGVyYXRpb24ub3BlcmF0b3IudGV4dFxuICAgICAgICAgICAgICAgIGVsc2UgaWYgZS5vcGVyYXRpb24ubGhzLm9iamVjdFxuICAgICAgICAgICAgICAgICAgICAjIGxvZyAnc2NvcGVyIGN1cmx5IGxocycgZS5vcGVyYXRpb24ubGhzLm9iamVjdC5rZXl2YWxzXG4gICAgICAgICAgICAgICAgICAgIGZvciBrZXl2YWwgaW4gZS5vcGVyYXRpb24ubGhzLm9iamVjdC5rZXl2YWxzXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBrZXl2YWwudHlwZSA9PSAndmFyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc2VydCBrZXl2YWwudGV4dCwgJ2N1cmx5J1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGUuZm9yXG4gICAgICAgICAgICAgICAgaWYgZS5mb3IudmFscy50ZXh0XG4gICAgICAgICAgICAgICAgICAgIGluc2VydCBlLmZvci52YWxzLnRleHQsICdmb3InXG4gICAgICAgICAgICAgICAgZWxzZSBcbiAgICAgICAgICAgICAgICAgICAgdmFscyA9IGUuZm9yLnZhbHMuYXJyYXk/Lml0ZW1zID8gZS5mb3IudmFsc1xuICAgICAgICAgICAgICAgICAgICBmb3IgdiBpbiB2YWxzID8gW11cbiAgICAgICAgICAgICAgICAgICAgICAgIGluc2VydCB2LnRleHQsICdmb3InIGlmIHYudGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBlLmFzc2VydFxuICAgICAgICAgICAgICAgIEB2ZXJiICdhc3NlcnQnIGVcbiAgICAgICAgICAgICAgICBpZiBlLmFzc2VydC5vYmoudHlwZSBub3QgaW4gWyd2YXInXSBhbmQgbm90IGUuYXNzZXJ0Lm9iai5pbmRleFxuICAgICAgICAgICAgICAgICAgICBpbnNlcnQgXCJfI3tlLmFzc2VydC5xbXJrLmxpbmV9XyN7ZS5hc3NlcnQucW1yay5jb2x9X1wiICc/LidcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGUucW1ya29wXG4gICAgICAgICAgICAgICAgQHZlcmIgJ3FtcmtvcCcgZVxuICAgICAgICAgICAgICAgIGluc2VydCBcIl8je2UucW1ya29wLnFtcmsubGluZX1fI3tlLnFtcmtvcC5xbXJrLmNvbH1fXCIgJyA/ICdcblxuICAgICAgICAgICAgaWYgZS5mdW5jXG4gICAgICAgICAgICAgICAgQGV4cCAgIGUuZnVuYy5hcmdzIGlmIGUuZnVuYy5hcmdzXG4gICAgICAgICAgICAgICAgQHNjb3BlIGUuZnVuYy5ib2R5IGlmIGUuZnVuYy5ib2R5XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgZm9yIGtleSx2YWwgb2YgZVxuICAgICAgICAgICAgICAgICAgICBpZiB2YWxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIHZhbC50eXBlIHRoZW4gQGV4cCB2YWxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiB2YWwgaW5zdGFuY2VvZiBBcnJheVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiB2YWwubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAZXhwIHYgZm9yIHYgaW4gdmFsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAZXhwIHYgZm9yIGssdiBvZiB2YWxcbiAgICAgICAgXG4gICAgdmVyYjogLT4gaWYgQHZlcmJvc2UgdGhlbiBjb25zb2xlLmxvZy5hcHBseSBjb25zb2xlLmxvZywgYXJndW1lbnRzIFxuXG5tb2R1bGUuZXhwb3J0cyA9IFNjb3BlclxuIl19
//# sourceURL=../coffee/scoper.coffee