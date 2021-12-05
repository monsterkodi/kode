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
        var i, insert, j, k, key, keyval, l, len, len1, len2, len3, ref, ref1, ref2, ref3, ref4, ref5, v, val, vals;
        if (!e) {
            return;
        }
        insert = (function(_this) {
            return function(v, t) {
                var i, len, map, ref;
                _this.verb(yellow(v), red(t));
                ref = _this.maps;
                for (i = 0, len = ref.length; i < len; i++) {
                    map = ref[i];
                    if (map[v]) {
                        return;
                    }
                }
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
                if (e.func.args) {
                    this.exp(e.func.args);
                }
                if (e.func.body) {
                    this.scope(e.func.body);
                }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NvcGVyLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsic2NvcGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFVTTtJQUVDLGdCQUFDLElBQUQ7UUFBQyxJQUFDLENBQUEsT0FBRDtRQUVBLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDdEIsSUFBQyxDQUFBLEtBQUQsR0FBVyxJQUFDLENBQUEsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN0QixJQUFDLENBQUEsR0FBRCxHQUFXLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBSSxDQUFDO0lBSnZCOztxQkFZSCxPQUFBLEdBQVMsU0FBQyxFQUFEO1FBRUwsSUFBQyxDQUFBLElBQUQsR0FBUTtRQUNSLElBQUMsQ0FBQSxJQUFELEdBQVE7UUFDUixJQUFDLENBQUEsS0FBRCxDQUFPLEVBQVA7ZUFDQTtJQUxLOztxQkFhVCxLQUFBLEdBQU8sU0FBQyxJQUFEO0FBRUgsWUFBQTtRQUFBLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBTixDQUFXLEVBQVg7UUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sQ0FBVyxJQUFJLENBQUMsSUFBaEI7QUFDQTtBQUFBLGFBQUEsc0NBQUE7O1lBQUEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxDQUFMO0FBQUE7UUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLEdBQU4sQ0FBQTtRQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFBO2VBQ0E7SUFQRzs7cUJBZVAsR0FBQSxHQUFLLFNBQUMsQ0FBRDtBQUVELFlBQUE7UUFBQSxJQUFHLENBQUksQ0FBUDtBQUFjLG1CQUFkOztRQUVBLE1BQUEsR0FBUyxDQUFBLFNBQUEsS0FBQTttQkFBQSxTQUFDLENBQUQsRUFBRyxDQUFIO0FBQ0wsb0JBQUE7Z0JBQUEsS0FBQyxDQUFBLElBQUQsQ0FBTSxNQUFBLENBQU8s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QUw7Z0JBQ0ksSUFBQyxDQUFBLElBQUQsQ0FBTSxRQUFOLEVBQWUsQ0FBZjtnQkFDQSxJQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQWIsS0FBcUIsS0FBeEI7b0JBQ0ksTUFBQSxDQUFPLEdBQUEsR0FBSSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFsQixHQUF1QixHQUF2QixHQUEwQixDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUF4QyxHQUE0QyxHQUFuRCxFQUFzRCxLQUF0RCxFQURKO2lCQUZKOztZQUtBLElBQUcsQ0FBQyxDQUFDLElBQUw7Z0JBQ0ksSUFBc0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUE3QjtvQkFBQSxJQUFDLENBQUEsR0FBRCxDQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBZCxFQUFBOztnQkFDQSxJQUFzQixDQUFDLENBQUMsSUFBSSxDQUFDLElBQTdCO29CQUFBLElBQUMsQ0FBQSxLQUFELENBQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFkLEVBQUE7aUJBRko7YUFBQSxNQUFBO0FBSUkscUJBQUEsUUFBQTs7b0JBQUEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxHQUFMO0FBQUEsaUJBSko7YUFoQ0M7O0lBbEJKOztxQkF5REwsSUFBQSxHQUFNLFNBQUE7UUFBRyxJQUFHLElBQUMsQ0FBQSxPQUFKO21CQUFpQixPQUFPLENBQUMsR0FBRyxDQUFDLEtBQVosQ0FBa0IsT0FBTyxDQUFDLEdBQTFCLEVBQStCLFNBQS9CLEVBQWpCOztJQUFIOzs7Ozs7QUFFVixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwIFxuMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwMDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgIFxuICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuIyMjXG5cbiMgd2Fsa3MgdGhyb3VnaCBhbiBhYnN0cmFjdCBzeW50YXggdHJlZSBhbmQgY29sbGVjdHMgdmFyc1xuXG5jbGFzcyBTY29wZXJcblxuICAgIEA6IChAa29kZSkgLT5cblxuICAgICAgICBAdmVyYm9zZSA9IEBrb2RlLmFyZ3MudmVyYm9zZVxuICAgICAgICBAZGVidWcgICA9IEBrb2RlLmFyZ3MuZGVidWdcbiAgICAgICAgQHJhdyAgICAgPSBAa29kZS5hcmdzLnJhd1xuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgICAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBjb2xsZWN0OiAodGwpIC0+XG4gICAgICAgIFxuICAgICAgICBAbWFwcyA9IFtdXG4gICAgICAgIEB2YXJzID0gW11cbiAgICAgICAgQHNjb3BlIHRsXG4gICAgICAgIHRsXG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBzY29wZTogKGJvZHkpIC0+XG5cbiAgICAgICAgQG1hcHMucHVzaCB7fVxuICAgICAgICBAdmFycy5wdXNoIGJvZHkudmFyc1xuICAgICAgICBAZXhwIGUgZm9yIGUgaW4gYm9keS5leHBzID8gW11cbiAgICAgICAgQG1hcHMucG9wKClcbiAgICAgICAgQHZhcnMucG9wKClcbiAgICAgICAgYm9keVxuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgIFxuICAgIGV4cDogKGUpIC0+XG5cbiAgICAgICAgaWYgbm90IGUgdGhlbiByZXR1cm5cbiAgICAgICAgICAgIFxuICAgICAgICBpbnNlcnQgPSAodix0KSA9PiBcbiAgICAgICAgICAgIEB2ZXJiIHllbGxvdyh2KSwgcmVkKHQpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGZvciBtYXAgaW4gQG1hcHMgXG4gICAgICAgICAgICAgICAgaWYgbWFwW3ZdIHRoZW4gcmV0dXJuXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIEB2YXJzWy0xXS5wdXNoIHRleHQ6diwgdHlwZTp0XG4gICAgICAgICAgICBAbWFwc1stMV1bdl0gPSB0XG4gICAgICAgIFxuICAgICAgICBpZiBlLnR5cGUgXG4gICAgICAgICAgICBpZiBlLnR5cGUgPT0gJ2NvZGUnXG4gICAgICAgICAgICAgICAgQGV4cCBlLmV4cHNcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICBlbHNlIGlmIGUgaW5zdGFuY2VvZiBBcnJheSAgdGhlbiBAZXhwIHYgZm9yIHYgaW4gZSBpZiBlLmxlbmd0aFxuICAgICAgICBlbHNlIGlmIGUgaW5zdGFuY2VvZiBPYmplY3RcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgZS5vcGVyYXRpb24gYW5kIGUub3BlcmF0aW9uLm9wZXJhdG9yLnRleHQgPT0gJz0nXG4gICAgICAgICAgICAgICAgaWYgZS5vcGVyYXRpb24ubGhzPy50ZXh0XG4gICAgICAgICAgICAgICAgICAgIGluc2VydCBlLm9wZXJhdGlvbi5saHMudGV4dCwgZS5vcGVyYXRpb24ub3BlcmF0b3IudGV4dFxuICAgICAgICAgICAgICAgIGVsc2UgaWYgZS5vcGVyYXRpb24ubGhzLm9iamVjdFxuICAgICAgICAgICAgICAgICAgICBmb3Iga2V5dmFsIGluIGUub3BlcmF0aW9uLmxocy5vYmplY3Qua2V5dmFsc1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYga2V5dmFsLnR5cGUgPT0gJ3ZhcidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnNlcnQga2V5dmFsLnRleHQsICdjdXJseSdcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGUub3BlcmF0aW9uLmxocy5hcnJheVxuICAgICAgICAgICAgICAgICAgICBmb3IgdmFsIGluIGUub3BlcmF0aW9uLmxocy5hcnJheS5pdGVtc1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgdmFsLnR5cGUgPT0gJ3ZhcidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnNlcnQgdmFsLnRleHQsICdhcnJheSdcbiAgICAgICAgICAgIGlmIGUuZm9yXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgZS5mb3IudmFscy50ZXh0XG4gICAgICAgICAgICAgICAgICAgIGluc2VydCBlLmZvci52YWxzLnRleHQsICdmb3InXG4gICAgICAgICAgICAgICAgZWxzZSBcbiAgICAgICAgICAgICAgICAgICAgdmFscyA9IGUuZm9yLnZhbHMuYXJyYXk/Lml0ZW1zID8gZS5mb3IudmFsc1xuICAgICAgICAgICAgICAgICAgICBmb3IgdiBpbiB2YWxzID8gW11cbiAgICAgICAgICAgICAgICAgICAgICAgIGluc2VydCB2LnRleHQsICdmb3InIGlmIHYudGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBlLmFzc2VydFxuICAgICAgICAgICAgICAgIEB2ZXJiICdhc3NlcnQnIGVcbiAgICAgICAgICAgICAgICBpZiBlLmFzc2VydC5vYmoudHlwZSAhPSAndmFyJyBhbmQgbm90IGUuYXNzZXJ0Lm9iai5pbmRleFxuICAgICAgICAgICAgICAgICAgICBpbnNlcnQgXCJfI3tlLmFzc2VydC5xbXJrLmxpbmV9XyN7ZS5hc3NlcnQucW1yay5jb2x9X1wiICc/LidcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGUucW1ya29wXG4gICAgICAgICAgICAgICAgQHZlcmIgJ3FtcmtvcCcgZVxuICAgICAgICAgICAgICAgIGlmIGUucW1ya29wLmxocy50eXBlICE9ICd2YXInXG4gICAgICAgICAgICAgICAgICAgIGluc2VydCBcIl8je2UucW1ya29wLnFtcmsubGluZX1fI3tlLnFtcmtvcC5xbXJrLmNvbH1fXCIgJyA/ICdcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBlLmZ1bmNcbiAgICAgICAgICAgICAgICBAZXhwICAgZS5mdW5jLmFyZ3MgaWYgZS5mdW5jLmFyZ3NcbiAgICAgICAgICAgICAgICBAc2NvcGUgZS5mdW5jLmJvZHkgaWYgZS5mdW5jLmJvZHlcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAZXhwIHZhbCBmb3Iga2V5LHZhbCBvZiBlXG4gICAgICAgIHJldHVyblxuICAgICAgICBcbiAgICB2ZXJiOiAtPiBpZiBAdmVyYm9zZSB0aGVuIGNvbnNvbGUubG9nLmFwcGx5IGNvbnNvbGUubG9nLCBhcmd1bWVudHMgXG5cbm1vZHVsZS5leHBvcnRzID0gU2NvcGVyXG4iXX0=
//# sourceURL=../coffee/scoper.coffee