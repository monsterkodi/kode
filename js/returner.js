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
                } else if (lst["switch"]) {
                    this["switch"](lst["switch"]);
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
        this.insert(e.then);
        ref1 = (ref = e.elifs) != null ? ref : [];
        for (i = 0, len = ref1.length; i < len; i++) {
            ei = ref1[i];
            if (ei.elif.then) {
                this.insert(ei.elif.then);
            }
        }
        if (e["else"]) {
            return this.insert(e["else"]);
        }
    };

    Returner.prototype["switch"] = function(e) {
        var i, len, ref, w;
        ref = e.whens;
        for (i = 0, len = ref.length; i < len; i++) {
            w = ref[i];
            if (w.when.then) {
                this.insert(w.when.then);
            }
        }
        if (e["else"]) {
            return this.insert(e["else"]);
        }
    };

    Returner.prototype.insert = function(e) {
        var lst, ref, ref1;
        if (e instanceof Array) {
            lst = e.slice(-1)[0];
            if (lst["if"]) {
                return this["if"](lst["if"]);
            }
            if (lst["return"]) {
                return;
            }
            if (lst["while"]) {
                return;
            }
            if (lst["for"]) {
                return;
            }
            if (!(lst["return"] || ((ref = lst.call) != null ? (ref1 = ref.callee) != null ? ref1.text : void 0 : void 0) === 'log')) {
                return e.push({
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmV0dXJuZXIuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJyZXR1cm5lci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztBQUlGO0lBRUMsa0JBQUMsSUFBRDtRQUFDLElBQUMsQ0FBQSxPQUFEO1FBRUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFDLENBQUEsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN0QixJQUFDLENBQUEsS0FBRCxHQUFXLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBSSxDQUFDO0lBSHZCOzt1QkFXSCxPQUFBLEdBQVMsU0FBQyxFQUFEO2VBQVEsSUFBQyxDQUFBLEtBQUQsQ0FBTyxFQUFQO0lBQVI7O3VCQVFULEtBQUEsR0FBTyxTQUFDLElBQUQ7QUFFSCxZQUFBO1FBQUEsa0RBQWEsQ0FBRSx3QkFBZjtBQUNJO0FBQUEsaUJBQUEsc0NBQUE7O2dCQUFBLElBQUMsQ0FBQSxHQUFELENBQUssQ0FBTDtBQUFBLGFBREo7O2VBRUE7SUFKRzs7dUJBWVAsSUFBQSxHQUFNLFNBQUMsQ0FBRDtBQUVGLFlBQUE7UUFBQSxJQUFlLENBQUMsQ0FBQyxJQUFqQjtZQUFBLElBQUMsQ0FBQSxHQUFELENBQUssQ0FBQyxDQUFDLElBQVAsRUFBQTs7UUFFQSw2REFBZSxDQUFFLHdCQUFqQjtZQUVJLDBDQUFTLENBQUUsY0FBUixLQUFxQixHQUFyQixJQUFBLElBQUEsS0FBeUIsYUFBNUI7Z0JBRUksR0FBQSxHQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSyxVQUFFLENBQUEsQ0FBQTtnQkFFcEIsTUFBQSxHQUFTLFNBQUE7MkJBQ0wsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBWixDQUFpQjt3QkFBQSxDQUFBLE1BQUEsQ0FBQSxFQUNiOzRCQUFBLEdBQUEsRUFBSztnQ0FBQSxJQUFBLEVBQUssU0FBTDtnQ0FBZSxJQUFBLEVBQUssUUFBcEI7NkJBQUw7NEJBQ0EsR0FBQSxFQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQVosQ0FBQSxDQURMO3lCQURhO3FCQUFqQjtnQkFESztnQkFLVCxZQUFHLEdBQUcsQ0FBQyxLQUFKLEtBQWEsS0FBYixJQUFBLElBQUEsS0FBbUIsS0FBbkIsSUFBQSxJQUFBLEtBQXlCLFFBQXpCLElBQUEsSUFBQSxLQUFrQyxRQUFsQyxJQUFBLElBQUEsS0FBMkMsUUFBOUM7b0JBQTZELE1BQUEsQ0FBQSxFQUE3RDtpQkFBQSxNQUNLLElBQUcsR0FBRyxDQUFDLElBQVA7b0JBQXdCLFlBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBaEIsS0FBNkIsS0FBN0IsSUFBQSxJQUFBLEtBQW1DLE1BQW5DLElBQUEsSUFBQSxLQUEwQyxPQUE3Qzt3QkFBMkQsTUFBQSxDQUFBLEVBQTNEO3FCQUF4QjtpQkFBQSxNQUNBLElBQUcsR0FBRyxDQUFDLFNBQVA7b0JBQXdCLE1BQUEsQ0FBQSxFQUF4QjtpQkFBQSxNQUNBLElBQUcsR0FBRyxDQUFDLElBQVA7b0JBQXdCLE1BQUEsQ0FBQSxFQUF4QjtpQkFBQSxNQUNBLElBQUcsR0FBRyxDQUFDLEtBQVA7b0JBQXdCLE1BQUEsQ0FBQSxFQUF4QjtpQkFBQSxNQUNBLElBQUcsR0FBRyxDQUFDLElBQVA7b0JBQXdCLE1BQUEsQ0FBQSxFQUF4QjtpQkFBQSxNQUNBLElBQUcsR0FBRyxDQUFDLEtBQVA7b0JBQXdCLE1BQUEsQ0FBQSxFQUF4QjtpQkFBQSxNQUNBLElBQUcsR0FBRyxDQUFDLE1BQVA7b0JBQXdCLE1BQUEsQ0FBQSxFQUF4QjtpQkFBQSxNQUNBLElBQUcsR0FBRyxDQUFDLE1BQVA7b0JBQXdCLE1BQUEsQ0FBQSxFQUF4QjtpQkFBQSxNQUNBLElBQUcsR0FBRyxFQUFDLE1BQUQsRUFBTjtvQkFBd0IsS0FBeEI7aUJBQUEsTUFDQSxJQUFHLEdBQUcsRUFBQyxLQUFELEVBQU47b0JBQXdCLEtBQXhCO2lCQUFBLE1BQ0EsSUFBRyxHQUFHLEVBQUMsR0FBRCxFQUFOO29CQUF3QixLQUF4QjtpQkFBQSxNQUNBLElBQUcsR0FBRyxFQUFDLEVBQUQsRUFBTjtvQkFBd0IsSUFBQyxFQUFBLEVBQUEsRUFBRCxDQUFJLEdBQUcsRUFBQyxFQUFELEVBQVAsRUFBeEI7aUJBQUEsTUFDQSxJQUFHLEdBQUcsRUFBQyxNQUFELEVBQU47b0JBQXdCLElBQUMsRUFBQSxNQUFBLEVBQUQsQ0FBUSxHQUFHLEVBQUMsTUFBRCxFQUFYLEVBQXhCO2lCQUFBLE1BQUE7b0JBRUYsT0FBQSxDQUFDLEdBQUQsQ0FBSyxnQkFBTCxFQUFzQixNQUFNLENBQUMsSUFBUCxDQUFZLEdBQVosQ0FBaUIsQ0FBQSxDQUFBLENBQXZDLEVBRkU7aUJBdEJUOzttQkEwQkEsSUFBQyxDQUFBLEtBQUQsQ0FBTyxDQUFDLENBQUMsSUFBVCxFQTVCSjs7SUFKRTs7d0JBd0NOLElBQUEsR0FBSSxTQUFDLENBQUQ7QUFFQSxZQUFBO1FBQUEsQ0FBQyxDQUFDLE9BQUYsR0FBWTtRQUNaLElBQUMsQ0FBQSxNQUFELENBQVEsQ0FBQyxDQUFDLElBQVY7QUFDQTtBQUFBLGFBQUEsc0NBQUE7O1lBQ0ksSUFBd0IsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFoQztnQkFBQSxJQUFDLENBQUEsTUFBRCxDQUFRLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBaEIsRUFBQTs7QUFESjtRQUdBLElBQWtCLENBQUMsRUFBQyxJQUFELEVBQW5CO21CQUFBLElBQUMsQ0FBQSxNQUFELENBQVEsQ0FBQyxFQUFDLElBQUQsRUFBVCxFQUFBOztJQVBBOzt3QkFlSixRQUFBLEdBQVEsU0FBQyxDQUFEO0FBRUosWUFBQTtBQUFBO0FBQUEsYUFBQSxxQ0FBQTs7WUFDSSxJQUF1QixDQUFDLENBQUMsSUFBSSxDQUFDLElBQTlCO2dCQUFBLElBQUMsQ0FBQSxNQUFELENBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFmLEVBQUE7O0FBREo7UUFHQSxJQUFrQixDQUFDLEVBQUMsSUFBRCxFQUFuQjttQkFBQSxJQUFDLENBQUEsTUFBRCxDQUFRLENBQUMsRUFBQyxJQUFELEVBQVQsRUFBQTs7SUFMSTs7dUJBYVIsTUFBQSxHQUFRLFNBQUMsQ0FBRDtBQUVKLFlBQUE7UUFBQSxJQUFHLENBQUEsWUFBYSxLQUFoQjtZQUNJLEdBQUEsR0FBTSxDQUFFLFVBQUUsQ0FBQSxDQUFBO1lBQ1YsSUFBRyxHQUFHLEVBQUMsRUFBRCxFQUFOO0FBQXFCLHVCQUFPLElBQUMsRUFBQSxFQUFBLEVBQUQsQ0FBSSxHQUFHLEVBQUMsRUFBRCxFQUFQLEVBQTVCOztZQUNBLElBQUcsR0FBRyxFQUFDLE1BQUQsRUFBTjtBQUFxQix1QkFBckI7O1lBQ0EsSUFBRyxHQUFHLEVBQUMsS0FBRCxFQUFOO0FBQXFCLHVCQUFyQjs7WUFDQSxJQUFHLEdBQUcsRUFBQyxHQUFELEVBQU47QUFBcUIsdUJBQXJCOztZQUVBLElBQUcsQ0FBSSxDQUFDLEdBQUcsRUFBQyxNQUFELEVBQUgsa0VBQThCLENBQUUsdUJBQWxCLEtBQTBCLEtBQXpDLENBQVA7dUJBQ0ksQ0FBQyxDQUFDLElBQUYsQ0FDSTtvQkFBQSxDQUFBLE1BQUEsQ0FBQSxFQUNJO3dCQUFBLEdBQUEsRUFBSzs0QkFBQSxJQUFBLEVBQUssU0FBTDs0QkFBZSxJQUFBLEVBQUssUUFBcEI7eUJBQUw7d0JBQ0EsR0FBQSxFQUFLLENBQUMsQ0FBQyxHQUFGLENBQUEsQ0FETDtxQkFESjtpQkFESixFQURKO2FBUEo7O0lBRkk7O3VCQXFCUixHQUFBLEdBQUssU0FBQyxDQUFEO0FBRUQsWUFBQTtRQUFBLElBQUcsQ0FBSSxDQUFQO0FBQWMsbUJBQWQ7O1FBRUEsSUFBRyxDQUFDLENBQUMsSUFBTDtBQUFBO1NBQUEsTUFDSyxJQUFHLENBQUEsWUFBYSxLQUFoQjtZQUE0QixJQUFxQixDQUFDLENBQUMsTUFBdkI7QUFBQTtxQkFBQSxtQ0FBQTs7aUNBQUEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxDQUFMO0FBQUE7K0JBQUE7YUFBNUI7U0FBQSxNQUNBLElBQUcsQ0FBQSxZQUFhLE1BQWhCO1lBRUQsSUFBRyxDQUFDLENBQUMsSUFBTDt1QkFDSSxJQUFDLENBQUEsSUFBRCxDQUFNLENBQUMsQ0FBQyxJQUFSLEVBREo7YUFBQSxNQUFBO0FBR0k7cUJBQUEsUUFBQTs7b0JBQ0ksSUFBRyxHQUFIO3dCQUNJLElBQUcsR0FBRyxDQUFDLElBQVA7MENBQWlCLElBQUMsQ0FBQSxHQUFELENBQUssR0FBTCxHQUFqQjt5QkFBQSxNQUFBOzRCQUVJLElBQUcsR0FBQSxZQUFlLEtBQWxCO2dDQUNJLElBQUcsR0FBRyxDQUFDLE1BQVA7OztBQUNJOzZDQUFBLHVDQUFBOzswREFBQSxJQUFDLENBQUEsR0FBRCxDQUFLLENBQUw7QUFBQTs7bURBREo7aUNBQUEsTUFBQTswREFBQTtpQ0FESjs2QkFBQSxNQUFBOzs7QUFJSTt5Q0FBQSxRQUFBOztzREFBQSxJQUFDLENBQUEsR0FBRCxDQUFLLENBQUw7QUFBQTs7K0NBSko7NkJBRko7eUJBREo7cUJBQUEsTUFBQTs4Q0FBQTs7QUFESjtnQ0FISjthQUZDOztJQU5KOzt1QkFxQkwsSUFBQSxHQUFNLFNBQUE7UUFBRyxJQUFHLElBQUMsQ0FBQSxPQUFKO21CQUFpQixPQUFPLENBQUMsR0FBRyxDQUFDLEtBQVosQ0FBa0IsT0FBTyxDQUFDLEdBQTFCLEVBQStCLFNBQS9CLEVBQWpCOztJQUFIOzs7Ozs7QUFFVixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbjAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4wMDAwMDAwICAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAgMCAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbjAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4jIyNcblxucHJpbnQgPSByZXF1aXJlICcuL3ByaW50J1xuXG4jIGluc2VydHMgaW1wbGljaXQgcmV0dXJuIHN0YXRlbWVudHNcblxuY2xhc3MgUmV0dXJuZXJcblxuICAgIEA6IChAa29kZSkgLT5cblxuICAgICAgICBAdmVyYm9zZSA9IEBrb2RlLmFyZ3MudmVyYm9zZVxuICAgICAgICBAZGVidWcgICA9IEBrb2RlLmFyZ3MuZGVidWdcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAgICAgICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgY29sbGVjdDogKHRsKSAtPiBAc2NvcGUgdGxcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAgMDAwMDAwMDAgIFxuICAgIFxuICAgIHNjb3BlOiAoYm9keSkgLT5cblxuICAgICAgICBpZiBib2R5Py5leHBzPy5sZW5ndGhcbiAgICAgICAgICAgIEBleHAgZSBmb3IgZSBpbiBib2R5LmV4cHNcbiAgICAgICAgYm9keVxuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4gICAgXG4gICAgZnVuYzogKGYpIC0+XG4gICAgICAgIFxuICAgICAgICBAZXhwIGYuYXJncyBpZiBmLmFyZ3NcbiAgICAgICAgXG4gICAgICAgIGlmIGYuYm9keT8uZXhwcz8ubGVuZ3RoXG5cbiAgICAgICAgICAgIGlmIGYubmFtZT8udGV4dCBub3QgaW4gWydAJyAnY29uc3RydWN0b3InXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGxzdCA9IGYuYm9keS5leHBzWy0xXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGluc2VydCA9IC0+IFxuICAgICAgICAgICAgICAgICAgICBmLmJvZHkuZXhwcy5wdXNoIHJldHVybjpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldDogdHlwZTona2V5d29yZCcgdGV4dDoncmV0dXJuJ1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsOiBmLmJvZHkuZXhwcy5wb3AoKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIGxzdC50eXBlIGluIFsndmFyJyAnbnVtJyAnc2luZ2xlJyAnZG91YmxlJyAndHJpcGxlJ10gdGhlbiBpbnNlcnQoKVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgbHN0LmNhbGwgICAgICAgIHRoZW4gaWYgbHN0LmNhbGwuY2FsbGVlLnRleHQgbm90IGluIFsnbG9nJyAnd2FybicgJ2Vycm9yJ10gdGhlbiBpbnNlcnQoKVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgbHN0Lm9wZXJhdGlvbiAgIHRoZW4gaW5zZXJ0KClcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGxzdC5mdW5jICAgICAgICB0aGVuIGluc2VydCgpXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBsc3QuYXJyYXkgICAgICAgdGhlbiBpbnNlcnQoKVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgbHN0LnByb3AgICAgICAgIHRoZW4gaW5zZXJ0KClcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGxzdC5pbmRleCAgICAgICB0aGVuIGluc2VydCgpXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBsc3Qub2JqZWN0ICAgICAgdGhlbiBpbnNlcnQoKVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgbHN0LmFzc2VydCAgICAgIHRoZW4gaW5zZXJ0KClcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGxzdC5yZXR1cm4gICAgICB0aGVuIG51bGxcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGxzdC53aGlsZSAgICAgICB0aGVuIG51bGxcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGxzdC5mb3IgICAgICAgICB0aGVuIG51bGxcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGxzdC5pZiAgICAgICAgICB0aGVuIEBpZiBsc3QuaWZcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGxzdC5zd2l0Y2ggICAgICB0aGVuIEBzd2l0Y2ggbHN0LnN3aXRjaFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgbG9nICd0b2RvOiByZXR1cm5lcicgT2JqZWN0LmtleXMobHN0KVswXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBAc2NvcGUgZi5ib2R5IFxuICAgICAgICBcbiAgICAjIDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgIDAwMDAwMCAgICBcbiAgICAjIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAwMDAgICAgICAgXG4gICAgXG4gICAgaWY6IChlKSAtPlxuICAgICAgICBcbiAgICAgICAgZS5yZXR1cm5zID0gdHJ1ZVxuICAgICAgICBAaW5zZXJ0IGUudGhlblxuICAgICAgICBmb3IgZWkgaW4gZS5lbGlmcyA/IFtdXG4gICAgICAgICAgICBAaW5zZXJ0IGVpLmVsaWYudGhlbiBpZiBlaS5lbGlmLnRoZW5cbiAgICAgICAgXG4gICAgICAgIEBpbnNlcnQgZS5lbHNlIGlmIGUuZWxzZVxuICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAwIDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAwMDAwMDAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIHN3aXRjaDogKGUpIC0+XG4gICAgICAgIFxuICAgICAgICBmb3IgdyBpbiBlLndoZW5zXG4gICAgICAgICAgICBAaW5zZXJ0IHcud2hlbi50aGVuIGlmIHcud2hlbi50aGVuXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEBpbnNlcnQgZS5lbHNlIGlmIGUuZWxzZVxuICAgICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBpbnNlcnQ6IChlKSAtPlxuXG4gICAgICAgIGlmIGUgaW5zdGFuY2VvZiBBcnJheVxuICAgICAgICAgICAgbHN0ID0gZVstMV1cbiAgICAgICAgICAgIGlmIGxzdC5pZiAgICAgICB0aGVuIHJldHVybiBAaWYgbHN0LmlmXG4gICAgICAgICAgICBpZiBsc3QucmV0dXJuICAgdGhlbiByZXR1cm5cbiAgICAgICAgICAgIGlmIGxzdC53aGlsZSAgICB0aGVuIHJldHVyblxuICAgICAgICAgICAgaWYgbHN0LmZvciAgICAgIHRoZW4gcmV0dXJuXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG5vdCAobHN0LnJldHVybiBvciBsc3QuY2FsbD8uY2FsbGVlPy50ZXh0ID09ICdsb2cnKVxuICAgICAgICAgICAgICAgIGUucHVzaFxuICAgICAgICAgICAgICAgICAgICByZXR1cm46XG4gICAgICAgICAgICAgICAgICAgICAgICByZXQ6IHR5cGU6J2tleXdvcmQnIHRleHQ6J3JldHVybidcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbDogZS5wb3AoKVxuICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICBcbiAgICBleHA6IChlKSAtPlxuXG4gICAgICAgIGlmIG5vdCBlIHRoZW4gcmV0dXJuXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgZS50eXBlICAgICAgICAgICAgICAgICAgIHRoZW4gcmV0dXJuXG4gICAgICAgIGVsc2UgaWYgZSBpbnN0YW5jZW9mIEFycmF5ICB0aGVuIEBleHAgdiBmb3IgdiBpbiBlIGlmIGUubGVuZ3RoXG4gICAgICAgIGVsc2UgaWYgZSBpbnN0YW5jZW9mIE9iamVjdFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBlLmZ1bmNcbiAgICAgICAgICAgICAgICBAZnVuYyBlLmZ1bmNcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBmb3Iga2V5LHZhbCBvZiBlXG4gICAgICAgICAgICAgICAgICAgIGlmIHZhbFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgdmFsLnR5cGUgdGhlbiBAZXhwIHZhbFxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIHZhbCBpbnN0YW5jZW9mIEFycmF5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIHZhbC5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBleHAgdiBmb3IgdiBpbiB2YWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBleHAgdiBmb3Igayx2IG9mIHZhbFxuICAgICAgICBcbiAgICB2ZXJiOiAtPiBpZiBAdmVyYm9zZSB0aGVuIGNvbnNvbGUubG9nLmFwcGx5IGNvbnNvbGUubG9nLCBhcmd1bWVudHMgXG5cbm1vZHVsZS5leHBvcnRzID0gUmV0dXJuZXJcbiJdfQ==
//# sourceURL=../coffee/returner.coffee