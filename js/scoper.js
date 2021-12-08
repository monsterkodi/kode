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
        this.args = [];
        this.vars = [];
        this.scope(tl);
        return tl;
    };

    Scoper.prototype.scope = function(body) {
        var e, i, len, ref, ref1;
        this.maps.push({});
        this.args.push({});
        this.vars.push(body.vars);
        ref1 = (ref = body.exps) != null ? ref : [];
        for (i = 0, len = ref1.length; i < len; i++) {
            e = ref1[i];
            this.exp(e);
        }
        this.maps.pop();
        this.args.pop();
        this.vars.pop();
        return body;
    };

    Scoper.prototype.func = function(f) {
        var arg, e, i, j, len, len1, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, t;
        this.maps.push({});
        this.args.push({});
        this.vars.push(f.body.vars);
        ref2 = (ref = (ref1 = f.args) != null ? ref1.parens.exps : void 0) != null ? ref : [];
        for (i = 0, len = ref2.length; i < len; i++) {
            arg = ref2[i];
            if (t = arg.text) {
                this.args.slice(-1)[0][t] = t;
            } else if (t = (ref3 = arg.operation) != null ? (ref4 = ref3.lhs) != null ? ref4.text : void 0 : void 0) {
                this.args.slice(-1)[0][t] = t;
            } else {
                if (((ref5 = arg.prop) != null ? (ref6 = ref5.obj) != null ? ref6.text : void 0 : void 0) !== '@') {
                    console.log('todo: scoper handle complex arg', arg);
                }
            }
        }
        ref9 = (ref7 = (ref8 = f.body) != null ? ref8.exps : void 0) != null ? ref7 : [];
        for (j = 0, len1 = ref9.length; j < len1; j++) {
            e = ref9[j];
            this.exp(e);
        }
        this.maps.pop();
        this.args.pop();
        this.vars.pop();
        return f;
    };

    Scoper.prototype.exp = function(e) {
        var i, insert, j, k, key, keyval, l, len, len1, len2, len3, ref, ref1, ref2, ref3, ref4, ref5, v, val, vals;
        if (!e) {
            return;
        }
        insert = (function(_this) {
            return function(v, t) {
                var arg, i, j, len, len1, map, ref, ref1;
                ref = _this.maps;
                for (i = 0, len = ref.length; i < len; i++) {
                    map = ref[i];
                    if (map[v]) {
                        return;
                    }
                }
                ref1 = _this.args;
                for (j = 0, len1 = ref1.length; j < len1; j++) {
                    arg = ref1[j];
                    if (arg[v]) {
                        return;
                    }
                }
                _this.verb(yellow(v), red(t));
                _this.vars.slice(-1)[0].push({
                    text: v,
                    type: t
                });
                return _this.maps.slice(-1)[0][v] = t;
            };
        })(this);
        if (e.type) {
            if (e.type === 'code') {
                this.exp(e.exps);
            }
            return;
        } else if (e instanceof Array) {
            if (e.length) {
                for (i = 0, len = e.length; i < len; i++) {
                    v = e[i];
                    this.exp(v);
                }
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
                } else if (e.operation.lhs.array) {
                    ref2 = e.operation.lhs.array.items;
                    for (k = 0, len2 = ref2.length; k < len2; k++) {
                        val = ref2[k];
                        if (val.type === 'var') {
                            insert(val.text, 'array');
                        }
                    }
                }
            }
            if (e["for"]) {
                if (e["for"].vals.text) {
                    insert(e["for"].vals.text, 'for');
                } else {
                    vals = (ref3 = (ref4 = e["for"].vals.array) != null ? ref4.items : void 0) != null ? ref3 : e["for"].vals;
                    ref5 = vals != null ? vals : [];
                    for (l = 0, len3 = ref5.length; l < len3; l++) {
                        v = ref5[l];
                        if (v.text) {
                            insert(v.text, 'for');
                        }
                    }
                }
            }
            if (e.assert) {
                this.verb('assert', e);
                if (e.assert.obj.type !== 'var' && !e.assert.obj.index) {
                    insert("_" + e.assert.qmrk.line + "_" + e.assert.qmrk.col + "_", '?.');
                }
            }
            if (e.qmrkop) {
                this.verb('qmrkop', e);
                if (e.qmrkop.lhs.type !== 'var') {
                    insert("_" + e.qmrkop.qmrk.line + "_" + e.qmrkop.qmrk.col + "_", ' ? ');
                }
            }
            if (e["function"]) {
                insert(e["function"].name.text);
            }
            if (e.func) {
                this.func(e.func);
            } else {
                for (key in e) {
                    val = e[key];
                    this.exp(val);
                }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NvcGVyLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsic2NvcGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFVTTtJQUVDLGdCQUFDLElBQUQ7UUFBQyxJQUFDLENBQUEsT0FBRDtRQUVBLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDdEIsSUFBQyxDQUFBLEtBQUQsR0FBVyxJQUFDLENBQUEsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN0QixJQUFDLENBQUEsR0FBRCxHQUFXLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBSSxDQUFDO0lBSnZCOztxQkFZSCxPQUFBLEdBQVMsU0FBQyxFQUFEO1FBRUwsSUFBQyxDQUFBLElBQUQsR0FBUTtRQUNSLElBQUMsQ0FBQSxJQUFELEdBQVE7UUFDUixJQUFDLENBQUEsSUFBRCxHQUFRO1FBQ1IsSUFBQyxDQUFBLEtBQUQsQ0FBTyxFQUFQO2VBQ0E7SUFOSzs7cUJBY1QsS0FBQSxHQUFPLFNBQUMsSUFBRDtBQUVILFlBQUE7UUFBQSxJQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sQ0FBVyxFQUFYO1FBQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFOLENBQVcsRUFBWDtRQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBTixDQUFXLElBQUksQ0FBQyxJQUFoQjtBQUNBO0FBQUEsYUFBQSxzQ0FBQTs7WUFBQSxJQUFDLENBQUEsR0FBRCxDQUFLLENBQUw7QUFBQTtRQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFBO1FBQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxHQUFOLENBQUE7UUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLEdBQU4sQ0FBQTtlQUNBO0lBVEc7O3FCQWlCUCxJQUFBLEdBQU0sU0FBQyxDQUFEO0FBRUYsWUFBQTtRQUFBLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBTixDQUFX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QWUsQ0FBZjtnQkFDQSxJQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQWIsS0FBcUIsS0FBeEI7b0JBQ0ksTUFBQSxDQUFPLEdBQUEsR0FBSSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFsQixHQUF1QixHQUF2QixHQUEwQixDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUF4QyxHQUE0QyxHQUFuRCxFQUFzRCxLQUF0RCxFQURKO2lCQUZKOztZQUtBLElBQUcsQ0FBQyxFQUFDLFFBQUQsRUFBSjtnQkFDSSxNQUFBLENBQU8sQ0FBQyxFQUFDLFFBQUQsRUFBUyxDQUFDLElBQUksQ0FBQyxJQUF2QixFQURKOztZQUdBLElBQUcsQ0FBQyxDQUFDLElBQUw7Z0JBQ0ksSUFBQyxDQUFBLElBQUQsQ0FBTSxDQUFDLENBQUMsSUFBUixFQURKO2FBQUEsTUFBQTtBQUdJLHFCQUFBLFFBQUE7O29CQUFBLElBQUMsQ0FBQSxHQUFELENBQUssR0FBTDtBQUFBLGlCQUhKO2FBbkNDOztJQW5CSjs7cUJBNERMLElBQUEsR0FBTSxTQUFBO1FBQUcsSUFBRyxJQUFDLENBQUEsT0FBSjttQkFBaUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFaLENBQWtCLE9BQU8sQ0FBQyxHQUExQixFQUErQixTQUEvQixFQUFqQjs7SUFBSDs7Ozs7O0FBRVYsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCBcbjAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwMDAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICBcbiAgICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAwICAwMDAgICAwMDBcbiMjI1xuXG4jIHdhbGtzIHRocm91Z2ggYW4gYWJzdHJhY3Qgc3ludGF4IHRyZWUgYW5kIGNvbGxlY3RzIHZhcnNcblxuY2xhc3MgU2NvcGVyXG5cbiAgICBAOiAoQGtvZGUpIC0+XG5cbiAgICAgICAgQHZlcmJvc2UgPSBAa29kZS5hcmdzLnZlcmJvc2VcbiAgICAgICAgQGRlYnVnICAgPSBAa29kZS5hcmdzLmRlYnVnXG4gICAgICAgIEByYXcgICAgID0gQGtvZGUuYXJncy5yYXdcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAgICAgICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgY29sbGVjdDogKHRsKSAtPlxuICAgICAgICBcbiAgICAgICAgQG1hcHMgPSBbXVxuICAgICAgICBAYXJncyA9IFtdXG4gICAgICAgIEB2YXJzID0gW11cbiAgICAgICAgQHNjb3BlIHRsXG4gICAgICAgIHRsXG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBzY29wZTogKGJvZHkpIC0+XG5cbiAgICAgICAgQG1hcHMucHVzaCB7fVxuICAgICAgICBAYXJncy5wdXNoIHt9XG4gICAgICAgIEB2YXJzLnB1c2ggYm9keS52YXJzXG4gICAgICAgIEBleHAgZSBmb3IgZSBpbiBib2R5LmV4cHMgPyBbXVxuICAgICAgICBAbWFwcy5wb3AoKVxuICAgICAgICBAYXJncy5wb3AoKVxuICAgICAgICBAdmFycy5wb3AoKVxuICAgICAgICBib2R5XG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiAgICBcbiAgICBmdW5jOiAoZikgLT5cblxuICAgICAgICBAbWFwcy5wdXNoIHt9XG4gICAgICAgIEBhcmdzLnB1c2gge31cbiAgICAgICAgQHZhcnMucHVzaCBmLmJvZHkudmFyc1xuICAgICAgICBcbiAgICAgICAgZm9yIGFyZyBpbiBmLmFyZ3M/LnBhcmVucy5leHBzID8gW11cbiAgICAgICAgICAgIGlmIHQgPSBhcmcudGV4dFxuICAgICAgICAgICAgICAgIEBhcmdzWy0xXVt0XSA9IHRcbiAgICAgICAgICAgIGVsc2UgaWYgdCA9IGFyZy5vcGVyYXRpb24/Lmxocz8udGV4dFxuICAgICAgICAgICAgICAgIEBhcmdzWy0xXVt0XSA9IHRcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBsb2cgJ3RvZG86IHNjb3BlciBoYW5kbGUgY29tcGxleCBhcmcnIGFyZyBpZiBhcmcucHJvcD8ub2JqPy50ZXh0ICE9ICdAJ1xuXG4gICAgICAgIEBleHAgZSBmb3IgZSBpbiBmLmJvZHk/LmV4cHMgPyBbXVxuICAgICAgICBAbWFwcy5wb3AoKVxuICAgICAgICBAYXJncy5wb3AoKVxuICAgICAgICBAdmFycy5wb3AoKVxuICAgICAgICBmXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgXG4gICAgZXhwOiAoZSkgLT5cblxuICAgICAgICBpZiBub3QgZSB0aGVuIHJldHVyblxuICAgICAgICAgICAgXG4gICAgICAgIGluc2VydCA9ICh2LHQpID0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGZvciBtYXAgaW4gQG1hcHMgdGhlbiBpZiBtYXBbdl0gdGhlbiByZXR1cm5cbiAgICAgICAgICAgIGZvciBhcmcgaW4gQGFyZ3MgdGhlbiBpZiBhcmdbdl0gdGhlbiByZXR1cm5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIEB2ZXJiIHllbGxvdyh2KSwgcmVkKHQpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIEB2YXJzWy0xXS5wdXNoIHRleHQ6diwgdHlwZTp0XG4gICAgICAgICAgICBAbWFwc1stMV1bdl0gPSB0XG4gICAgICAgIFxuICAgICAgICBpZiBlLnR5cGUgXG4gICAgICAgICAgICBpZiBlLnR5cGUgPT0gJ2NvZGUnXG4gICAgICAgICAgICAgICAgQGV4cCBlLmV4cHNcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICBlbHNlIGlmIGUgaW5zdGFuY2VvZiBBcnJheSAgdGhlbiBAZXhwIHYgZm9yIHYgaW4gZSBpZiBlLmxlbmd0aFxuICAgICAgICBlbHNlIGlmIGUgaW5zdGFuY2VvZiBPYmplY3RcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgZS5vcGVyYXRpb24gYW5kIGUub3BlcmF0aW9uLm9wZXJhdG9yLnRleHQgPT0gJz0nXG4gICAgICAgICAgICAgICAgaWYgZS5vcGVyYXRpb24ubGhzPy50ZXh0XG4gICAgICAgICAgICAgICAgICAgIGluc2VydCBlLm9wZXJhdGlvbi5saHMudGV4dCwgZS5vcGVyYXRpb24ub3BlcmF0b3IudGV4dFxuICAgICAgICAgICAgICAgIGVsc2UgaWYgZS5vcGVyYXRpb24ubGhzLm9iamVjdFxuICAgICAgICAgICAgICAgICAgICBmb3Iga2V5dmFsIGluIGUub3BlcmF0aW9uLmxocy5vYmplY3Qua2V5dmFsc1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYga2V5dmFsLnR5cGUgPT0gJ3ZhcidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnNlcnQga2V5dmFsLnRleHQsICdjdXJseSdcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGUub3BlcmF0aW9uLmxocy5hcnJheVxuICAgICAgICAgICAgICAgICAgICBmb3IgdmFsIGluIGUub3BlcmF0aW9uLmxocy5hcnJheS5pdGVtc1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgdmFsLnR5cGUgPT0gJ3ZhcidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnNlcnQgdmFsLnRleHQsICdhcnJheSdcbiAgICAgICAgICAgIGlmIGUuZm9yXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgZS5mb3IudmFscy50ZXh0XG4gICAgICAgICAgICAgICAgICAgIGluc2VydCBlLmZvci52YWxzLnRleHQsICdmb3InXG4gICAgICAgICAgICAgICAgZWxzZSBcbiAgICAgICAgICAgICAgICAgICAgdmFscyA9IGUuZm9yLnZhbHMuYXJyYXk/Lml0ZW1zID8gZS5mb3IudmFsc1xuICAgICAgICAgICAgICAgICAgICBmb3IgdiBpbiB2YWxzID8gW11cbiAgICAgICAgICAgICAgICAgICAgICAgIGluc2VydCB2LnRleHQsICdmb3InIGlmIHYudGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBlLmFzc2VydFxuICAgICAgICAgICAgICAgIEB2ZXJiICdhc3NlcnQnIGVcbiAgICAgICAgICAgICAgICBpZiBlLmFzc2VydC5vYmoudHlwZSAhPSAndmFyJyBhbmQgbm90IGUuYXNzZXJ0Lm9iai5pbmRleFxuICAgICAgICAgICAgICAgICAgICBpbnNlcnQgXCJfI3tlLmFzc2VydC5xbXJrLmxpbmV9XyN7ZS5hc3NlcnQucW1yay5jb2x9X1wiICc/LidcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGUucW1ya29wXG4gICAgICAgICAgICAgICAgQHZlcmIgJ3FtcmtvcCcgZVxuICAgICAgICAgICAgICAgIGlmIGUucW1ya29wLmxocy50eXBlICE9ICd2YXInXG4gICAgICAgICAgICAgICAgICAgIGluc2VydCBcIl8je2UucW1ya29wLnFtcmsubGluZX1fI3tlLnFtcmtvcC5xbXJrLmNvbH1fXCIgJyA/ICdcblxuICAgICAgICAgICAgaWYgZS5mdW5jdGlvblxuICAgICAgICAgICAgICAgIGluc2VydCBlLmZ1bmN0aW9uLm5hbWUudGV4dFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGUuZnVuY1xuICAgICAgICAgICAgICAgIEBmdW5jIGUuZnVuY1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEBleHAgdmFsIGZvciBrZXksdmFsIG9mIGVcbiAgICAgICAgcmV0dXJuXG4gICAgICAgIFxuICAgIHZlcmI6IC0+IGlmIEB2ZXJib3NlIHRoZW4gY29uc29sZS5sb2cuYXBwbHkgY29uc29sZS5sb2csIGFyZ3VtZW50cyBcblxubW9kdWxlLmV4cG9ydHMgPSBTY29wZXJcbiJdfQ==
//# sourceURL=../coffee/scoper.coffee