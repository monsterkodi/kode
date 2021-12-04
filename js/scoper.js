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
                if ((ref5 = e.assert.obj.type) !== 'var') {
                    insert("_" + e.assert.qmrk.line + "_" + e.assert.qmrk.col + "_", '?.');
                }
            }
            if (e.qmrkop) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NvcGVyLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsic2NvcGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7OztBQVFBOzs7QUFSQSxJQUFBOztBQVlNO0lBRUMsZ0JBQUMsSUFBRDtRQUFDLElBQUMsQ0FBQSxPQUFEO1FBRUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFDLENBQUEsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN0QixJQUFDLENBQUEsS0FBRCxHQUFXLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3RCLElBQUMsQ0FBQSxHQUFELEdBQVcsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFJLENBQUM7SUFKdkI7O3FCQVlILE9BQUEsR0FBUyxTQUFDLEVBQUQ7UUFFTCxJQUFDLENBQUEsSUFBRCxHQUFRO1FBQ1IsSUFBQyxDQUFBLElBQUQsR0FBUTtRQUNSLElBQUMsQ0FBQSxLQUFELENBQU8sRUFBUDtlQUNBO0lBTEs7O3FCQWFULEtBQUEsR0FBTyxTQUFDLElBQUQ7QUFFSCxZQUFBO1FBQUEsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFOLENBQVcsRUFBWDtRQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBTixDQUFXLElBQUksQ0FBQyxJQUFoQjtBQUNBO0FBQUEsYUFBQSxzQ0FBQTs7WUFBQSxJQUFDLENBQUEsR0FBRCxDQUFLLENBQUw7QUFBQTtRQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFBO1FBQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxHQUFOLENBQUE7ZUFDQTtJQVBHOztxQkFlUCxHQUFBLEdBQUssU0FBQyxDQUFEO0FBRUQsWUFBQTtRQUFBLElBQUcsQ0FBSSxDQUFQO0FBQWMsbUJBQWQ7O1FBRUEsTUFBQSxHQUFTLENBQUEsU0FBQSxLQUFBO21CQUFBLFNBQUMsQ0FBRCxFQUFHLENBQUg7Z0JBQ0wsS0FBQyxDQUFBLElBQUQsQ0FBTSxNQUFBLENBQU8sQ0FB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QyxJQUFJLENBQUMsSUFBZCxFQUFBO2lCQUZKO2FBQUEsTUFBQTtBQUlJO3FCQUFBLFFBQUE7O29CQUNJLElBQUcsR0FBSDt3QkFDSSxJQUFHLEdBQUcsQ0FBQyxJQUFQOzBDQUFpQixJQUFDLENBQUEsR0FBRCxDQUFLLEdBQUwsR0FBakI7eUJBQUEsTUFBQTs0QkFFSSxJQUFHLEdBQUEsWUFBZSxLQUFsQjtnQ0FDSSxJQUFHLEdBQUcsQ0FBQyxNQUFQOzs7QUFDSTs2Q0FBQSx1Q0FBQTs7MERBQUEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxDQUFMO0FBQUE7O21EQURKO2lDQUFBLE1BQUE7MERBQUE7aUNBREo7NkJBQUEsTUFBQTs7O0FBSUk7eUNBQUEsUUFBQTs7c0RBQUEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxDQUFMO0FBQUE7OytDQUpKOzZCQUZKO3lCQURKO3FCQUFBLE1BQUE7OENBQUE7O0FBREo7Z0NBSko7YUExQkM7O0lBWko7O3FCQW9ETCxJQUFBLEdBQU0sU0FBQTtRQUFHLElBQUcsSUFBQyxDQUFBLE9BQUo7bUJBQWlCLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBWixDQUFrQixPQUFPLENBQUMsR0FBMUIsRUFBK0IsU0FBL0IsRUFBakI7O0lBQUg7Ozs7OztBQUVWLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgXG4wMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwXG4wMDAwMDAwICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgXG4gICAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwXG4wMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgICAwMDAwMDAwMCAgMDAwICAgMDAwXG4jIyNcblxuIyMjXG4gICAgd2Fsa3MgdGhyb3VnaCBhbiBhYnN0cmFjdCBzeW50YXggdHJlZSBhbmQgY29sbGVjdHMgdmFyc1xuIyMjXG5cbmNsYXNzIFNjb3BlclxuXG4gICAgQDogKEBrb2RlKSAtPlxuXG4gICAgICAgIEB2ZXJib3NlID0gQGtvZGUuYXJncy52ZXJib3NlXG4gICAgICAgIEBkZWJ1ZyAgID0gQGtvZGUuYXJncy5kZWJ1Z1xuICAgICAgICBAcmF3ICAgICA9IEBrb2RlLmFyZ3MucmF3XG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwICAgICAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIGNvbGxlY3Q6ICh0bCkgLT5cbiAgICAgICAgXG4gICAgICAgIEBtYXBzID0gW11cbiAgICAgICAgQHZhcnMgPSBbXVxuICAgICAgICBAc2NvcGUgdGxcbiAgICAgICAgdGxcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAgMDAwMDAwMDAgIFxuICAgIFxuICAgIHNjb3BlOiAoYm9keSkgLT5cblxuICAgICAgICBAbWFwcy5wdXNoIHt9XG4gICAgICAgIEB2YXJzLnB1c2ggYm9keS52YXJzXG4gICAgICAgIEBleHAgZSBmb3IgZSBpbiBib2R5LmV4cHMgPyBbXVxuICAgICAgICBAbWFwcy5wb3AoKVxuICAgICAgICBAdmFycy5wb3AoKVxuICAgICAgICBib2R5XG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgXG4gICAgZXhwOiAoZSkgLT5cblxuICAgICAgICBpZiBub3QgZSB0aGVuIHJldHVyblxuICAgICAgICAgICAgXG4gICAgICAgIGluc2VydCA9ICh2LHQpID0+IFxuICAgICAgICAgICAgQHZlcmIgeWVsbG93KHYpLCByZWQodClcbiAgICAgICAgICAgIGlmIG5vdCBAbWFwc1stMV1bdl1cbiAgICAgICAgICAgICAgICBAdmFyc1stMV0ucHVzaCB0ZXh0OnYsIHR5cGU6dFxuICAgICAgICAgICAgICAgIEBtYXBzWy0xXVt2XSA9IHRcbiAgICAgICAgXG4gICAgICAgIGlmIGUudHlwZSB0aGVuIG51bGxcbiAgICAgICAgZWxzZSBpZiBlIGluc3RhbmNlb2YgQXJyYXkgIHRoZW4gQGV4cCB2IGZvciB2IGluIGUgaWYgZS5sZW5ndGhcbiAgICAgICAgZWxzZSBpZiBlIGluc3RhbmNlb2YgT2JqZWN0XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGUub3BlcmF0aW9uIGFuZCBlLm9wZXJhdGlvbi5vcGVyYXRvci50ZXh0ID09ICc9J1xuICAgICAgICAgICAgICAgIGlmIGUub3BlcmF0aW9uLmxocz8udGV4dFxuICAgICAgICAgICAgICAgICAgICBpbnNlcnQgZS5vcGVyYXRpb24ubGhzLnRleHQsIGUub3BlcmF0aW9uLm9wZXJhdG9yLnRleHRcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGUub3BlcmF0aW9uLmxocy5vYmplY3RcbiAgICAgICAgICAgICAgICAgICAgIyBsb2cgJ3Njb3BlciBjdXJseSBsaHMnIGUub3BlcmF0aW9uLmxocy5vYmplY3Qua2V5dmFsc1xuICAgICAgICAgICAgICAgICAgICBmb3Iga2V5dmFsIGluIGUub3BlcmF0aW9uLmxocy5vYmplY3Qua2V5dmFsc1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYga2V5dmFsLnR5cGUgPT0gJ3ZhcidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnNlcnQga2V5dmFsLnRleHQsICdjdXJseSdcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBlLmZvclxuICAgICAgICAgICAgICAgIGlmIGUuZm9yLnZhbHMudGV4dFxuICAgICAgICAgICAgICAgICAgICBpbnNlcnQgZS5mb3IudmFscy50ZXh0LCAnZm9yJ1xuICAgICAgICAgICAgICAgIGVsc2UgXG4gICAgICAgICAgICAgICAgICAgIHZhbHMgPSBlLmZvci52YWxzLmFycmF5Py5pdGVtcyA/IGUuZm9yLnZhbHNcbiAgICAgICAgICAgICAgICAgICAgZm9yIHYgaW4gdmFscyA/IFtdXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnNlcnQgdi50ZXh0LCAnZm9yJyBpZiB2LnRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgZS5hc3NlcnRcbiAgICAgICAgICAgICAgICBpZiBlLmFzc2VydC5vYmoudHlwZSBub3QgaW4gWyd2YXInXVxuICAgICAgICAgICAgICAgICAgICBpbnNlcnQgXCJfI3tlLmFzc2VydC5xbXJrLmxpbmV9XyN7ZS5hc3NlcnQucW1yay5jb2x9X1wiICc/LidcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGUucW1ya29wXG4gICAgICAgICAgICAgICAgaW5zZXJ0IFwiXyN7ZS5xbXJrb3AucW1yay5saW5lfV8je2UucW1ya29wLnFtcmsuY29sfV9cIiAnID8gJ1xuXG4gICAgICAgICAgICBpZiBlLmZ1bmNcbiAgICAgICAgICAgICAgICBAZXhwICAgZS5mdW5jLmFyZ3MgaWYgZS5mdW5jLmFyZ3NcbiAgICAgICAgICAgICAgICBAc2NvcGUgZS5mdW5jLmJvZHkgaWYgZS5mdW5jLmJvZHlcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBmb3Iga2V5LHZhbCBvZiBlXG4gICAgICAgICAgICAgICAgICAgIGlmIHZhbFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgdmFsLnR5cGUgdGhlbiBAZXhwIHZhbFxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIHZhbCBpbnN0YW5jZW9mIEFycmF5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIHZhbC5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBleHAgdiBmb3IgdiBpbiB2YWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBleHAgdiBmb3Igayx2IG9mIHZhbFxuICAgICAgICBcbiAgICB2ZXJiOiAtPiBpZiBAdmVyYm9zZSB0aGVuIGNvbnNvbGUubG9nLmFwcGx5IGNvbnNvbGUubG9nLCBhcmd1bWVudHMgXG5cbm1vZHVsZS5leHBvcnRzID0gU2NvcGVyXG4iXX0=
//# sourceURL=../coffee/scoper.coffee