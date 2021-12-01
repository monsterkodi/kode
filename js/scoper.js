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
            if (e.assert) {
                insert("_" + e.assert.qmrk.line + "_" + e.assert.qmrk.col + "_", '?.');
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NvcGVyLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsic2NvcGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7OztBQVFBOzs7QUFSQSxJQUFBOztBQVlNO0lBRUMsZ0JBQUMsSUFBRDtRQUFDLElBQUMsQ0FBQSxPQUFEO1FBRUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFDLENBQUEsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN0QixJQUFDLENBQUEsS0FBRCxHQUFXLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3RCLElBQUMsQ0FBQSxHQUFELEdBQVcsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFJLENBQUM7SUFKdkI7O3FCQVlILE9BQUEsR0FBUyxTQUFDLEVBQUQ7UUFFTCxJQUFDLENBQUEsSUFBRCxHQUFRO1FBQ1IsSUFBQyxDQUFBLElBQUQsR0FBUTtRQUNSLElBQUMsQ0FBQSxLQUFELENBQU8sRUFBUDtlQUNBO0lBTEs7O3FCQWFULEtBQUEsR0FBTyxTQUFDLElBQUQ7QUFFSCxZQUFBO1FBQUEsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFOLENBQVcsRUFBWDtRQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBTixDQUFXLElBQUksQ0FBQyxJQUFoQjtBQUNBO0FBQUEsYUFBQSxzQ0FBQTs7WUFBQSxJQUFDLENBQUEsR0FBRCxDQUFLLENBQUw7QUFBQTtRQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFBO1FBQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxHQUFOLENBQUE7ZUFDQTtJQVBHOztxQkFlUCxHQUFBLEdBQUssU0FBQyxDQUFEO0FBRUQsWUFBQTtRQUFBLElBQUcsQ0FBSSxDQUFQO0FBQWMsbUJBQWQ7O1FBRUEsTUFBQSxHQUFTLENBQUEsU0FBQSxLQUFBO21CQUFBLFNBQUMsQ0FBRCxFQUFHLENBQUg7Z0JBQ0wsS0FBQyxDQUFBLElBQUQsQ0FBTSxNQUFBLENBQU8sQ0FBUCxDQUFOLEVBQWlCLEdBQUEsQ0FBSSxDQUFKLENBQWpCO2dCQUNBLElBQUcsQ0FBSSxLQUFDLENBQUEsSUFBSyxVQUFFLENBQUEsQ0FBQSxDQUFFLENBQUEsQ0FBQSxDQUFqQjtvQkFDSSxLQUFDLENBQUEsSUFBSyxVQUFFLENBQUEsQ0FBQSxDQUFDLENBQUMsSUFBVixDQUFlO3dCQUFBLElBQUEsRUFBSyxDQUFMO3dCQUFRLElBQUEsRUFBSyxDQUFiO3FCQUFmOzJCQUNBLEtBQUMsQ0FBQSxJQUFLLFVBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQSxDQUFBLENBQVYsR0FBZSxFQUZuQjs7WUFGSztRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7UUFNVCxJQUFHLENBQUMsQ0FBQyxJQUFMO21CQUFlLEtBQWY7U0FBQSxNQUNLLElBQUcsQ0FBQSxZQUFhLEtBQWhCO1lBQTRCLElBQXFCLENBQUMsQ0FBQyxNQUF2QjtBQUFBO3FCQUFBLG1DQUFBOztpQ0FBQSxJQUFDLENBQUEsR0FBRCxDQUFLLENBQUw7QUFBQTsrQkFBQTthQUE1QjtTQUFBLE1BQ0EsSUFBRyxDQUFBLFlBQWEsTUFBaEI7WUFFRCxJQUFHLENBQUMsQ0FBQyxTQUFGLDBDQUErQixDQUFFLGNBQWpDLElBQTBDLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQXJCLEtBQTZCLEdBQTFFO2dCQUNJLE1BQUEsQ0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUF2QixFQUE2QixDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFsRCxFQURKOztZQUdBLElBQUcsQ0FBQyxFQUFDLEdBQUQsRUFBSjtnQkFDSSxJQUFHLENBQUMsRUFBQyxHQUFELEVBQUksQ0FBQyxJQUFJLENBQUMsSUFBZDtvQkFDSSxNQUFBLENBQU8sQ0FBQyxFQUFDLEdBQUQsRUFBSSxDQUFDLElBQUksQ0FBQyxJQUFsQixFQUF3QixLQUF4QixFQURKO2lCQUFBLE1BQUE7b0JBR0ksSUFBQSx3RkFBaUMsQ0FBQyxFQUFDLEdBQUQsRUFBSSxDQUFDO0FBQ3ZDO0FBQUEseUJBQUEsd0NBQUE7O3dCQUNJLElBQXdCLENBQUMsQ0FBQyxJQUExQjs0QkFBQSxNQUFBLENBQU8sQ0FBQyxDQUFDLElBQVQsRUFBZSxLQUFmLEVBQUE7O0FBREoscUJBSko7aUJBREo7O1lBUUEsSUFBRyxDQUFDLENBQUMsTUFBTDtnQkFDSSxNQUFBLENBQU8sR0FBQSxHQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQWxCLEdBQXVCLEdBQXZCLEdBQTBCLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQXhDLEdBQTRDLEdBQW5ELEVBQXNELElBQXRELEVBREo7O1lBR0EsSUFBRyxDQUFDLENBQUMsTUFBTDtnQkFDSSxNQUFBLENBQU8sR0FBQSxHQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQWxCLEdBQXVCLEdBQXZCLEdBQTBCLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQXhDLEdBQTRDLEdBQW5ELEVBQXNELEtBQXRELEVBREo7O1lBR0EsSUFBRyxDQUFDLENBQUMsSUFBTDtnQkFDSSxJQUFzQixDQUFDLENBQUMsSUFBSSxDQUFDLElBQTdCO29CQUFBLElBQUMsQ0FBQSxHQUFELENBQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFkLEVBQUE7O2dCQUNBLElBQXNCLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBN0I7MkJBQUEsSUFBQyxDQUFBLEtBQUQsQ0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQWQsRUFBQTtpQkFGSjthQUFBLE1BQUE7QUFJSTtxQkFBQSxRQUFBOztvQkFDSSxJQUFHLEdBQUg7d0JBQ0ksSUFBRyxHQUFHLENBQUMsSUFBUDswQ0FBaUIsSUFBQyxDQUFBLEdBQUQsQ0FBSyxHQUFMLEdBQWpCO3lCQUFBLE1BQUE7NEJBRUksSUFBRyxHQUFBLFlBQWUsS0FBbEI7Z0NBQ0ksSUFBRyxHQUFHLENBQUMsTUFBUDs7O0FBQ0k7NkNBQUEsdUNBQUE7OzBEQUFBLElBQUMsQ0FBQSxHQUFELENBQUssQ0FBTDtBQUFBOzttREFESjtpQ0FBQSxNQUFBOzBEQUFBO2lDQURKOzZCQUFBLE1BQUE7OztBQUlJO3lDQUFBLFFBQUE7O3NEQUFBLElBQUMsQ0FBQSxHQUFELENBQUssQ0FBTDtBQUFBOzsrQ0FKSjs2QkFGSjt5QkFESjtxQkFBQSxNQUFBOzhDQUFBOztBQURKO2dDQUpKO2FBbkJDOztJQVpKOztxQkE2Q0wsSUFBQSxHQUFNLFNBQUE7UUFBRyxJQUFHLElBQUMsQ0FBQSxPQUFKO21CQUFpQixPQUFPLENBQUMsR0FBRyxDQUFDLEtBQVosQ0FBa0IsT0FBTyxDQUFDLEdBQTFCLEVBQStCLFNBQS9CLEVBQWpCOztJQUFIOzs7Ozs7QUFFVixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwIFxuMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwMDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgIFxuICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuIyMjXG5cbiMjI1xuICAgIHdhbGtzIHRocm91Z2ggYW4gYWJzdHJhY3Qgc3ludGF4IHRyZWUgYW5kIGNvbGxlY3RzIHZhcnNcbiMjI1xuXG5jbGFzcyBTY29wZXJcblxuICAgIEA6IChAa29kZSkgLT5cblxuICAgICAgICBAdmVyYm9zZSA9IEBrb2RlLmFyZ3MudmVyYm9zZVxuICAgICAgICBAZGVidWcgICA9IEBrb2RlLmFyZ3MuZGVidWdcbiAgICAgICAgQHJhdyAgICAgPSBAa29kZS5hcmdzLnJhd1xuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgICAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBjb2xsZWN0OiAodGwpIC0+XG4gICAgICAgIFxuICAgICAgICBAbWFwcyA9IFtdXG4gICAgICAgIEB2YXJzID0gW11cbiAgICAgICAgQHNjb3BlIHRsXG4gICAgICAgIHRsXG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBzY29wZTogKGJvZHkpIC0+XG5cbiAgICAgICAgQG1hcHMucHVzaCB7fVxuICAgICAgICBAdmFycy5wdXNoIGJvZHkudmFyc1xuICAgICAgICBAZXhwIGUgZm9yIGUgaW4gYm9keS5leHBzID8gW11cbiAgICAgICAgQG1hcHMucG9wKClcbiAgICAgICAgQHZhcnMucG9wKClcbiAgICAgICAgYm9keVxuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgIFxuICAgIGV4cDogKGUpIC0+XG5cbiAgICAgICAgaWYgbm90IGUgdGhlbiByZXR1cm5cbiAgICAgICAgICAgIFxuICAgICAgICBpbnNlcnQgPSAodix0KSA9PiBcbiAgICAgICAgICAgIEB2ZXJiIHllbGxvdyh2KSwgcmVkKHQpXG4gICAgICAgICAgICBpZiBub3QgQG1hcHNbLTFdW3ZdXG4gICAgICAgICAgICAgICAgQHZhcnNbLTFdLnB1c2ggdGV4dDp2LCB0eXBlOnRcbiAgICAgICAgICAgICAgICBAbWFwc1stMV1bdl0gPSB0XG4gICAgICAgIFxuICAgICAgICBpZiBlLnR5cGUgdGhlbiBudWxsXG4gICAgICAgIGVsc2UgaWYgZSBpbnN0YW5jZW9mIEFycmF5ICB0aGVuIEBleHAgdiBmb3IgdiBpbiBlIGlmIGUubGVuZ3RoXG4gICAgICAgIGVsc2UgaWYgZSBpbnN0YW5jZW9mIE9iamVjdFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBlLm9wZXJhdGlvbiBhbmQgZS5vcGVyYXRpb24ubGhzPy50ZXh0IGFuZCBlLm9wZXJhdGlvbi5vcGVyYXRvci50ZXh0ID09ICc9J1xuICAgICAgICAgICAgICAgIGluc2VydCBlLm9wZXJhdGlvbi5saHMudGV4dCwgZS5vcGVyYXRpb24ub3BlcmF0b3IudGV4dFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGUuZm9yXG4gICAgICAgICAgICAgICAgaWYgZS5mb3IudmFscy50ZXh0XG4gICAgICAgICAgICAgICAgICAgIGluc2VydCBlLmZvci52YWxzLnRleHQsICdmb3InXG4gICAgICAgICAgICAgICAgZWxzZSBcbiAgICAgICAgICAgICAgICAgICAgdmFscyA9IGUuZm9yLnZhbHMuYXJyYXk/Lml0ZW1zID8gZS5mb3IudmFsc1xuICAgICAgICAgICAgICAgICAgICBmb3IgdiBpbiB2YWxzID8gW11cbiAgICAgICAgICAgICAgICAgICAgICAgIGluc2VydCB2LnRleHQsICdmb3InIGlmIHYudGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBlLmFzc2VydFxuICAgICAgICAgICAgICAgIGluc2VydCBcIl8je2UuYXNzZXJ0LnFtcmsubGluZX1fI3tlLmFzc2VydC5xbXJrLmNvbH1fXCIgJz8uJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgZS5xbXJrb3BcbiAgICAgICAgICAgICAgICBpbnNlcnQgXCJfI3tlLnFtcmtvcC5xbXJrLmxpbmV9XyN7ZS5xbXJrb3AucW1yay5jb2x9X1wiICcgPyAnXG5cbiAgICAgICAgICAgIGlmIGUuZnVuY1xuICAgICAgICAgICAgICAgIEBleHAgICBlLmZ1bmMuYXJncyBpZiBlLmZ1bmMuYXJnc1xuICAgICAgICAgICAgICAgIEBzY29wZSBlLmZ1bmMuYm9keSBpZiBlLmZ1bmMuYm9keVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGZvciBrZXksdmFsIG9mIGVcbiAgICAgICAgICAgICAgICAgICAgaWYgdmFsXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiB2YWwudHlwZSB0aGVuIEBleHAgdmFsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgdmFsIGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgdmFsLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGV4cCB2IGZvciB2IGluIHZhbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGV4cCB2IGZvciBrLHYgb2YgdmFsXG4gICAgICAgIFxuICAgIHZlcmI6IC0+IGlmIEB2ZXJib3NlIHRoZW4gY29uc29sZS5sb2cuYXBwbHkgY29uc29sZS5sb2csIGFyZ3VtZW50cyBcblxubW9kdWxlLmV4cG9ydHMgPSBTY29wZXJcbiJdfQ==
//# sourceURL=../coffee/scoper.coffee