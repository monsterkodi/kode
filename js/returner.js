// koffee 1.20.0

/*
00000000   00000000  000000000  000   000  00000000   000   000  00000000  00000000   
000   000  000          000     000   000  000   000  0000  000  000       000   000  
0000000    0000000      000     000   000  0000000    000 0 000  0000000   0000000    
000   000  000          000     000   000  000   000  000  0000  000       000   000  
000   000  00000000     000      0000000   000   000  000   000  00000000  000   000
 */
var Returner;

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
        var insert, lst, ref, ref1, ref2, ref3, ref4;
        if (f.args) {
            this.exp(f.args);
        }
        if ((ref = f.body) != null ? (ref1 = ref.exps) != null ? ref1.length : void 0 : void 0) {
            if ((ref2 = f.name) !== '@' && ref2 !== 'constructor') {
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
                if ((ref3 = lst.type) === 'var' || ref3 === 'num' || ref3 === 'single' || ref3 === 'double' || ref3 === 'triple') {
                    insert();
                } else if (lst.call && ((ref4 = lst.call.callee.text) !== 'log' && ref4 !== 'warn' && ref4 !== 'error')) {
                    insert();
                } else if (lst.func) {
                    insert();
                } else if (lst.array) {
                    insert();
                } else if (lst.operation) {
                    insert();
                }
            }
            return this.scope(f.body);
        }
    };

    Returner.prototype.exp = function(e) {
        var i, k, key, len, results, results1, v, val;
        if (!e) {
            return console.log('dafuk!');
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
        } else {
            return console.log('dafuk?', e);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmV0dXJuZXIuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJyZXR1cm5lci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUU07SUFFQyxrQkFBQyxJQUFEO1FBQUMsSUFBQyxDQUFBLE9BQUQ7UUFFQSxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3RCLElBQUMsQ0FBQSxLQUFELEdBQVcsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFJLENBQUM7SUFIdkI7O3VCQUtILE9BQUEsR0FBUyxTQUFDLEVBQUQ7ZUFBUSxJQUFDLENBQUEsS0FBRCxDQUFPLEVBQVA7SUFBUjs7dUJBRVQsS0FBQSxHQUFPLFNBQUMsSUFBRDtBQUVILFlBQUE7UUFBQSxrREFBYSxDQUFFLHdCQUFmO0FBQ0k7QUFBQSxpQkFBQSxzQ0FBQTs7Z0JBQUEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxDQUFMO0FBQUEsYUFESjs7ZUFFQTtJQUpHOzt1QkFNUCxJQUFBLEdBQU0sU0FBQyxDQUFEO0FBRUYsWUFBQTtRQUFBLElBQWUsQ0FBQyxDQUFDLElBQWpCO1lBQUEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxDQUFDLENBQUMsSUFBUCxFQUFBOztRQUVBLDZEQUFlLENBQUUsd0JBQWpCO1lBRUksWUFBRyxDQUFDLENBQUMsS0FBRixLQUFlLEdBQWYsSUFBQSxJQUFBLEtBQW1CLGFBQXRCO2dCQUVJLEdBQUEsR0FBTSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUssVUFBRSxDQUFBLENBQUE7Z0JBR3BCLE1BQUEsR0FBUyxTQUFBOzJCQUNMLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQVosQ0FBaUI7d0JBQUEsQ0FBQSxNQUFBLENBQUEsRUFDYjs0QkFBQSxHQUFBLEVBQUs7Z0NBQUEsSUFBQSxFQUFLLFNBQUw7Z0NBQWUsSUFBQSxFQUFLLFFBQXBCOzZCQUFMOzRCQUNBLEdBQUEsRUFBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFaLENBQUEsQ0FETDt5QkFEYTtxQkFBakI7Z0JBREs7Z0JBS1QsWUFBRyxHQUFHLENBQUMsS0FBSixLQUFhLEtBQWIsSUFBQSxJQUFBLEtBQW1CLEtBQW5CLElBQUEsSUFBQSxLQUF5QixRQUF6QixJQUFBLElBQUEsS0FBa0MsUUFBbEMsSUFBQSxJQUFBLEtBQTJDLFFBQTlDO29CQUE2RCxNQUFBLENBQUEsRUFBN0Q7aUJBQUEsTUFDSyxJQUFHLEdBQUcsQ0FBQyxJQUFKLElBQWEsU0FBQSxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFoQixLQUE2QixLQUE3QixJQUFBLElBQUEsS0FBbUMsTUFBbkMsSUFBQSxJQUFBLEtBQTBDLE9BQTFDLENBQWhCO29CQUF3RSxNQUFBLENBQUEsRUFBeEU7aUJBQUEsTUFDQSxJQUFHLEdBQUcsQ0FBQyxJQUFQO29CQUFpQixNQUFBLENBQUEsRUFBakI7aUJBQUEsTUFDQSxJQUFHLEdBQUcsQ0FBQyxLQUFQO29CQUFrQixNQUFBLENBQUEsRUFBbEI7aUJBQUEsTUFDQSxJQUFHLEdBQUcsQ0FBQyxTQUFQO29CQUFzQixNQUFBLENBQUEsRUFBdEI7aUJBZFQ7O21CQWdCQSxJQUFDLENBQUEsS0FBRCxDQUFPLENBQUMsQ0FBQyxJQUFULEVBbEJKOztJQUpFOzt1QkF3Qk4sR0FBQSxHQUFLLFNBQUMsQ0FBRDtBQUVELFlBQUE7UUFBQSxJQUFHLENBQUksQ0FBUDtBQUFjLG1CQUFLLE9BQUEsQ0FBRSxHQUFGLENBQU0sUUFBTixFQUFuQjs7UUFFQSxJQUFHLENBQUMsQ0FBQyxJQUFMO0FBQUE7U0FBQSxNQUNLLElBQUcsQ0FBQSxZQUFhLEtBQWhCO1lBQTRCLElBQXFCLENBQUMsQ0FBQyxNQUF2QjtBQUFBO3FCQUFBLG1DQUFBOztpQ0FBQSxJQUFDLENBQUEsR0FBRCxDQUFLLENBQUw7QUFBQTsrQkFBQTthQUE1QjtTQUFBLE1BQ0EsSUFBRyxDQUFBLFlBQWEsTUFBaEI7WUFFRCxJQUFHLENBQUMsQ0FBQyxJQUFMO3VCQUNJLElBQUMsQ0FBQSxJQUFELENBQU0sQ0FBQyxDQUFDLElBQVIsRUFESjthQUFBLE1BQUE7QUFHSTtxQkFBQSxRQUFBOztvQkFDSSxJQUFHLEdBQUg7d0JBQ0ksSUFBRyxHQUFHLENBQUMsSUFBUDswQ0FBaUIsSUFBQyxDQUFBLEdBQUQsQ0FBSyxHQUFMLEdBQWpCO3lCQUFBLE1BQUE7NEJBRUksSUFBRyxHQUFBLFlBQWUsS0FBbEI7Z0NBQ0ksSUFBRyxHQUFHLENBQUMsTUFBUDs7O0FBQ0k7NkNBQUEsdUNBQUE7OzBEQUFBLElBQUMsQ0FBQSxHQUFELENBQUssQ0FBTDtBQUFBOzttREFESjtpQ0FBQSxNQUFBOzBEQUFBO2lDQURKOzZCQUFBLE1BQUE7OztBQUlJO3lDQUFBLFFBQUE7O3NEQUFBLElBQUMsQ0FBQSxHQUFELENBQUssQ0FBTDtBQUFBOzsrQ0FKSjs2QkFGSjt5QkFESjtxQkFBQSxNQUFBOzhDQUFBOztBQURKO2dDQUhKO2FBRkM7U0FBQSxNQUFBO21CQWVGLE9BQUEsQ0FBQyxHQUFELENBQUssUUFBTCxFQUFjLENBQWQsRUFmRTs7SUFOSjs7dUJBdUJMLElBQUEsR0FBTSxTQUFBO1FBQUcsSUFBRyxJQUFDLENBQUEsT0FBSjttQkFBaUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFaLENBQWtCLE9BQU8sQ0FBQyxHQUExQixFQUErQixTQUEvQixFQUFqQjs7SUFBSDs7Ozs7O0FBRVYsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4wMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwMDAwMCAgICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwIDAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbjAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4wMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuIyMjXG5cbmNsYXNzIFJldHVybmVyXG5cbiAgICBAOiAoQGtvZGUpIC0+XG5cbiAgICAgICAgQHZlcmJvc2UgPSBAa29kZS5hcmdzLnZlcmJvc2VcbiAgICAgICAgQGRlYnVnICAgPSBAa29kZS5hcmdzLmRlYnVnXG4gICAgICAgIFxuICAgIGNvbGxlY3Q6ICh0bCkgLT4gQHNjb3BlIHRsXG5cbiAgICBzY29wZTogKGJvZHkpIC0+XG5cbiAgICAgICAgaWYgYm9keT8uZXhwcz8ubGVuZ3RoXG4gICAgICAgICAgICBAZXhwIGUgZm9yIGUgaW4gYm9keS5leHBzXG4gICAgICAgIGJvZHlcbiAgICAgICAgXG4gICAgZnVuYzogKGYpIC0+XG4gICAgICAgIFxuICAgICAgICBAZXhwIGYuYXJncyBpZiBmLmFyZ3NcbiAgICAgICAgXG4gICAgICAgIGlmIGYuYm9keT8uZXhwcz8ubGVuZ3RoXG5cbiAgICAgICAgICAgIGlmIGYubmFtZSBub3QgaW4gWydAJyAnY29uc3RydWN0b3InXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGxzdCA9IGYuYm9keS5leHBzWy0xXVxuICAgICAgICAgICAgICAgICMgbG9nIGYuYXJyb3cubGluZSwgZi5hcnJvdy50ZXh0LCBsc3RcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpbnNlcnQgPSAtPiBcbiAgICAgICAgICAgICAgICAgICAgZi5ib2R5LmV4cHMucHVzaCByZXR1cm46XG4gICAgICAgICAgICAgICAgICAgICAgICByZXQ6IHR5cGU6J2tleXdvcmQnIHRleHQ6J3JldHVybidcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbDogZi5ib2R5LmV4cHMucG9wKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBsc3QudHlwZSBpbiBbJ3ZhcicgJ251bScgJ3NpbmdsZScgJ2RvdWJsZScgJ3RyaXBsZSddIHRoZW4gaW5zZXJ0KClcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGxzdC5jYWxsIGFuZCBsc3QuY2FsbC5jYWxsZWUudGV4dCBub3QgaW4gWydsb2cnICd3YXJuJyAnZXJyb3InXSB0aGVuIGluc2VydCgpXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBsc3QuZnVuYyB0aGVuIGluc2VydCgpXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBsc3QuYXJyYXkgdGhlbiBpbnNlcnQoKVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgbHN0Lm9wZXJhdGlvbiB0aGVuIGluc2VydCgpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIEBzY29wZSBmLmJvZHkgXG4gICAgICAgIFxuICAgIGV4cDogKGUpIC0+XG5cbiAgICAgICAgaWYgbm90IGUgdGhlbiByZXR1cm4gbG9nICdkYWZ1ayEnXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgZS50eXBlICAgICAgICAgICAgICAgICAgIHRoZW4gcmV0dXJuXG4gICAgICAgIGVsc2UgaWYgZSBpbnN0YW5jZW9mIEFycmF5ICB0aGVuIEBleHAgdiBmb3IgdiBpbiBlIGlmIGUubGVuZ3RoXG4gICAgICAgIGVsc2UgaWYgZSBpbnN0YW5jZW9mIE9iamVjdFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBlLmZ1bmNcbiAgICAgICAgICAgICAgICBAZnVuYyBlLmZ1bmNcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBmb3Iga2V5LHZhbCBvZiBlXG4gICAgICAgICAgICAgICAgICAgIGlmIHZhbFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgdmFsLnR5cGUgdGhlbiBAZXhwIHZhbFxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIHZhbCBpbnN0YW5jZW9mIEFycmF5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIHZhbC5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBleHAgdiBmb3IgdiBpbiB2YWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBleHAgdiBmb3Igayx2IG9mIHZhbFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBsb2cgJ2RhZnVrPycgZVxuICAgICAgICBcbiAgICB2ZXJiOiAtPiBpZiBAdmVyYm9zZSB0aGVuIGNvbnNvbGUubG9nLmFwcGx5IGNvbnNvbGUubG9nLCBhcmd1bWVudHMgXG5cbm1vZHVsZS5leHBvcnRzID0gUmV0dXJuZXJcbiJdfQ==
//# sourceURL=../coffee/returner.coffee