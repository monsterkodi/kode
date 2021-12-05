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
        var arg, e, i, j, len, len1, ref, ref1, ref2, ref3, ref4, ref5;
        this.maps.push({});
        this.args.push({});
        this.vars.push(f.body.vars);
        ref2 = (ref = (ref1 = f.args) != null ? ref1.parens.exps : void 0) != null ? ref : [];
        for (i = 0, len = ref2.length; i < len; i++) {
            arg = ref2[i];
            if (arg.text) {
                this.args.slice(-1)[0][arg.text] = arg.text;
            } else {
                console.log('todo: scoper handle complex args');
            }
        }
        ref5 = (ref3 = (ref4 = f.body) != null ? ref4.exps : void 0) != null ? ref3 : [];
        for (j = 0, len1 = ref5.length; j < len1; j++) {
            e = ref5[j];
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NvcGVyLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsic2NvcGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFVTTtJQUVDLGdCQUFDLElBQUQ7UUFBQyxJQUFDLENBQUEsT0FBRDtRQUVBLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDdEIsSUFBQyxDQUFBLEtBQUQsR0FBVyxJQUFDLENBQUEsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN0QixJQUFDLENBQUEsR0FBRCxHQUFXLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBSSxDQUFDO0lBSnZCOztxQkFZSCxPQUFBLEdBQVMsU0FBQyxFQUFEO1FBRUwsSUFBQyxDQUFBLElBQUQsR0FBUTtRQUNSLElBQUMsQ0FBQSxJQUFELEdBQVE7UUFDUixJQUFDLENBQUEsSUFBRCxHQUFRO1FBQ1IsSUFBQyxDQUFBLEtBQUQsQ0FBTyxFQUFQO2VBQ0E7SUFOSzs7cUJBY1QsS0FBQSxHQUFPLFNBQUMsSUFBRDtBQUVILFlBQUE7UUFBQSxJQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sQ0FBVyxFQUFYO1FBQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFOLENBQVcsRUFBWDtRQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBTixDQUFXLElBQUksQ0FBQyxJQUFoQjtBQUNBO0FBQUEsYUFBQSxzQ0FBQTs7WUFBQSxJQUFDLENBQUEsR0FBRCxDQUFLLENBQUw7QUFBQTtRQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFBO1FBQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxHQUFOLENBQUE7UUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLEdBQU4sQ0FBQTtlQUNBO0lBVEc7O3FCQWlCUCxJQUFBLEdBQU0sU0FBQyxDQUFEO0FBRUYsWUFBQTtRQUFBLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBTixDQUFX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QUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQXhDLEdBQTRDLEdBQW5ELEVBQXNELEtBQXRELEVBREo7aUJBRko7O1lBS0EsSUFBRyxDQUFDLENBQUMsSUFBTDtnQkFDSSxJQUFDLENBQUEsSUFBRCxDQUFNLENBQUMsQ0FBQyxJQUFSLEVBREo7YUFBQSxNQUFBO0FBR0kscUJBQUEsUUFBQTs7b0JBQUEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxHQUFMO0FBQUEsaUJBSEo7YUFoQ0M7O0lBbkJKOztxQkF5REwsSUFBQSxHQUFNLFNBQUE7UUFBRyxJQUFHLElBQUMsQ0FBQSxPQUFKO21CQUFpQixPQUFPLENBQUMsR0FBRyxDQUFDLEtBQVosQ0FBa0IsT0FBTyxDQUFDLEdBQTFCLEVBQStCLFNBQS9CLEVBQWpCOztJQUFIOzs7Ozs7QUFFVixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwIFxuMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwMDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgIFxuICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuIyMjXG5cbiMgd2Fsa3MgdGhyb3VnaCBhbiBhYnN0cmFjdCBzeW50YXggdHJlZSBhbmQgY29sbGVjdHMgdmFyc1xuXG5jbGFzcyBTY29wZXJcblxuICAgIEA6IChAa29kZSkgLT5cblxuICAgICAgICBAdmVyYm9zZSA9IEBrb2RlLmFyZ3MudmVyYm9zZVxuICAgICAgICBAZGVidWcgICA9IEBrb2RlLmFyZ3MuZGVidWdcbiAgICAgICAgQHJhdyAgICAgPSBAa29kZS5hcmdzLnJhd1xuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgICAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBjb2xsZWN0OiAodGwpIC0+XG4gICAgICAgIFxuICAgICAgICBAbWFwcyA9IFtdXG4gICAgICAgIEBhcmdzID0gW11cbiAgICAgICAgQHZhcnMgPSBbXVxuICAgICAgICBAc2NvcGUgdGxcbiAgICAgICAgdGxcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAgMDAwMDAwMDAgIFxuICAgIFxuICAgIHNjb3BlOiAoYm9keSkgLT5cblxuICAgICAgICBAbWFwcy5wdXNoIHt9XG4gICAgICAgIEBhcmdzLnB1c2gge31cbiAgICAgICAgQHZhcnMucHVzaCBib2R5LnZhcnNcbiAgICAgICAgQGV4cCBlIGZvciBlIGluIGJvZHkuZXhwcyA/IFtdXG4gICAgICAgIEBtYXBzLnBvcCgpXG4gICAgICAgIEBhcmdzLnBvcCgpXG4gICAgICAgIEB2YXJzLnBvcCgpXG4gICAgICAgIGJvZHlcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuICAgIFxuICAgIGZ1bmM6IChmKSAtPlxuXG4gICAgICAgIEBtYXBzLnB1c2gge31cbiAgICAgICAgQGFyZ3MucHVzaCB7fVxuICAgICAgICBAdmFycy5wdXNoIGYuYm9keS52YXJzXG4gICAgICAgIFxuICAgICAgICBmb3IgYXJnIGluIGYuYXJncz8ucGFyZW5zLmV4cHMgPyBbXVxuICAgICAgICAgICAgaWYgYXJnLnRleHRcbiAgICAgICAgICAgICAgICBAYXJnc1stMV1bYXJnLnRleHRdID0gYXJnLnRleHRcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBsb2cgJ3RvZG86IHNjb3BlciBoYW5kbGUgY29tcGxleCBhcmdzJ1xuXG4gICAgICAgIEBleHAgZSBmb3IgZSBpbiBmLmJvZHk/LmV4cHMgPyBbXVxuICAgICAgICBAbWFwcy5wb3AoKVxuICAgICAgICBAYXJncy5wb3AoKVxuICAgICAgICBAdmFycy5wb3AoKVxuICAgICAgICBmXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgXG4gICAgZXhwOiAoZSkgLT5cblxuICAgICAgICBpZiBub3QgZSB0aGVuIHJldHVyblxuICAgICAgICAgICAgXG4gICAgICAgIGluc2VydCA9ICh2LHQpID0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGZvciBtYXAgaW4gQG1hcHMgdGhlbiBpZiBtYXBbdl0gdGhlbiByZXR1cm5cbiAgICAgICAgICAgIGZvciBhcmcgaW4gQGFyZ3MgdGhlbiBpZiBhcmdbdl0gdGhlbiByZXR1cm5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIEB2ZXJiIHllbGxvdyh2KSwgcmVkKHQpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIEB2YXJzWy0xXS5wdXNoIHRleHQ6diwgdHlwZTp0XG4gICAgICAgICAgICBAbWFwc1stMV1bdl0gPSB0XG4gICAgICAgIFxuICAgICAgICBpZiBlLnR5cGUgXG4gICAgICAgICAgICBpZiBlLnR5cGUgPT0gJ2NvZGUnXG4gICAgICAgICAgICAgICAgQGV4cCBlLmV4cHNcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICBlbHNlIGlmIGUgaW5zdGFuY2VvZiBBcnJheSAgdGhlbiBAZXhwIHYgZm9yIHYgaW4gZSBpZiBlLmxlbmd0aFxuICAgICAgICBlbHNlIGlmIGUgaW5zdGFuY2VvZiBPYmplY3RcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgZS5vcGVyYXRpb24gYW5kIGUub3BlcmF0aW9uLm9wZXJhdG9yLnRleHQgPT0gJz0nXG4gICAgICAgICAgICAgICAgaWYgZS5vcGVyYXRpb24ubGhzPy50ZXh0XG4gICAgICAgICAgICAgICAgICAgIGluc2VydCBlLm9wZXJhdGlvbi5saHMudGV4dCwgZS5vcGVyYXRpb24ub3BlcmF0b3IudGV4dFxuICAgICAgICAgICAgICAgIGVsc2UgaWYgZS5vcGVyYXRpb24ubGhzLm9iamVjdFxuICAgICAgICAgICAgICAgICAgICBmb3Iga2V5dmFsIGluIGUub3BlcmF0aW9uLmxocy5vYmplY3Qua2V5dmFsc1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYga2V5dmFsLnR5cGUgPT0gJ3ZhcidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnNlcnQga2V5dmFsLnRleHQsICdjdXJseSdcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGUub3BlcmF0aW9uLmxocy5hcnJheVxuICAgICAgICAgICAgICAgICAgICBmb3IgdmFsIGluIGUub3BlcmF0aW9uLmxocy5hcnJheS5pdGVtc1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgdmFsLnR5cGUgPT0gJ3ZhcidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnNlcnQgdmFsLnRleHQsICdhcnJheSdcbiAgICAgICAgICAgIGlmIGUuZm9yXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgZS5mb3IudmFscy50ZXh0XG4gICAgICAgICAgICAgICAgICAgIGluc2VydCBlLmZvci52YWxzLnRleHQsICdmb3InXG4gICAgICAgICAgICAgICAgZWxzZSBcbiAgICAgICAgICAgICAgICAgICAgdmFscyA9IGUuZm9yLnZhbHMuYXJyYXk/Lml0ZW1zID8gZS5mb3IudmFsc1xuICAgICAgICAgICAgICAgICAgICBmb3IgdiBpbiB2YWxzID8gW11cbiAgICAgICAgICAgICAgICAgICAgICAgIGluc2VydCB2LnRleHQsICdmb3InIGlmIHYudGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBlLmFzc2VydFxuICAgICAgICAgICAgICAgIEB2ZXJiICdhc3NlcnQnIGVcbiAgICAgICAgICAgICAgICBpZiBlLmFzc2VydC5vYmoudHlwZSAhPSAndmFyJyBhbmQgbm90IGUuYXNzZXJ0Lm9iai5pbmRleFxuICAgICAgICAgICAgICAgICAgICBpbnNlcnQgXCJfI3tlLmFzc2VydC5xbXJrLmxpbmV9XyN7ZS5hc3NlcnQucW1yay5jb2x9X1wiICc/LidcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGUucW1ya29wXG4gICAgICAgICAgICAgICAgQHZlcmIgJ3FtcmtvcCcgZVxuICAgICAgICAgICAgICAgIGlmIGUucW1ya29wLmxocy50eXBlICE9ICd2YXInXG4gICAgICAgICAgICAgICAgICAgIGluc2VydCBcIl8je2UucW1ya29wLnFtcmsubGluZX1fI3tlLnFtcmtvcC5xbXJrLmNvbH1fXCIgJyA/ICdcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBlLmZ1bmNcbiAgICAgICAgICAgICAgICBAZnVuYyBlLmZ1bmNcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAZXhwIHZhbCBmb3Iga2V5LHZhbCBvZiBlXG4gICAgICAgIHJldHVyblxuICAgICAgICBcbiAgICB2ZXJiOiAtPiBpZiBAdmVyYm9zZSB0aGVuIGNvbnNvbGUubG9nLmFwcGx5IGNvbnNvbGUubG9nLCBhcmd1bWVudHMgXG5cbm1vZHVsZS5leHBvcnRzID0gU2NvcGVyXG4iXX0=
//# sourceURL=../coffee/scoper.coffee