// koffee 1.20.0

/*
000       0000000    0000000   00000000    0000000
000      000   000  000   000  000   000  000
000      000   000  000   000  00000000   0000000
000      000   000  000   000  000             000
0000000   0000000    0000000   000        0000000
 */
var cmp, evl, ref;

ref = require('./utils'), cmp = ref.cmp, evl = ref.evl;

describe('loops', function() {
    it('for in', function() {
        cmp("for t in l\n    t", "var list = (l != null ? l : [])\nfor (var _1_6_ = 0; _1_6_ < list.length; _1_6_++)\n{\n    t = list[_1_6_]\n    t\n}");
        cmp("for a in [1,2,3] then log a", "var list = [1,2,3]\nfor (var _1_6_ = 0; _1_6_ < list.length; _1_6_++)\n{\n    a = list[_1_6_]\n    console.log(a)\n}");
        cmp("for a in [1,2,3] then log a\nlog a", "var list = [1,2,3]\nfor (var _1_6_ = 0; _1_6_ < list.length; _1_6_++)\n{\n    a = list[_1_6_]\n    console.log(a)\n}\nconsole.log(a)");
        cmp("for a in [1,2,3]\n    log '1' a\n    log '2' a\nlog '3' a", "var list = [1,2,3]\nfor (var _1_6_ = 0; _1_6_ < list.length; _1_6_++)\n{\n    a = list[_1_6_]\n    console.log('1',a)\n    console.log('2',a)\n}\nconsole.log('3',a)");
        cmp("for v,i in @regs\n    log i,v", "var list = (this.regs != null ? this.regs : [])\nfor (i = 0; i < list.length; i++)\n{\n    v = list[i]\n    console.log(i,v)\n}");
        cmp("for [a,b] in @regs\n    log a,b", "var list = (this.regs != null ? this.regs : [])\nfor (var _1_10_ = 0; _1_10_ < list.length; _1_10_++)\n{\n    a = list[_1_10_][0]\n    b = list[_1_10_][1]\n    console.log(a,b)\n}");
        cmp("for a in [1..2] then for b in [1..3] then c = 1; d = 1", "var list = [1,2]\nfor (var _1_6_ = 0; _1_6_ < list.length; _1_6_++)\n{\n    a = list[_1_6_]\n    var list1 = [1,2,3]\n    for (var _1_27_ = 0; _1_27_ < list1.length; _1_27_++)\n    {\n        b = list1[_1_27_]\n        c = 1\n        d = 1\n    }\n}");
        cmp("for a in [1..9] then for b in [1..9]\n    c = 3\n    d:\n        e: 1", "var list = [1,2,3,4,5,6,7,8,9]\nfor (var _1_6_ = 0; _1_6_ < list.length; _1_6_++)\n{\n    a = list[_1_6_]\n    var list1 = [1,2,3,4,5,6,7,8,9]\n    for (var _1_27_ = 0; _1_27_ < list1.length; _1_27_++)\n    {\n        b = list1[_1_27_]\n        c = 3\n        {d:{e:1}}\n    }\n}");
        cmp("empty = (a) -> a in ['' null undefined] or b", "\nempty = function (a)\n{\n    return ['',null,undefined].indexOf(a) >= 0 || b\n}");
        return cmp("@exp body.exps,k,e for e,k in body.exps", "var list = (body.exps != null ? body.exps : [])\nfor (k = 0; k < list.length; k++)\n{\n    e = list[k]\n    this.exp(body.exps,k,e)\n}");
    });
    it('for of', function() {
        cmp("for key,val of @patterns\n    log key, val", "for (key in this.patterns)\n{\n    val = this.patterns[key]\n    console.log(key,val)\n}");
        return cmp("matches = ([k, r.exec t] for k,r of rgs)", "matches = (function () { var result = []; for (var k in rgs)  { var r = rgs[k];result.push([k,r.exec(t)])  } return result })()");
    });
    it('for tail', function() {
        return cmp("f e for e in l ? []", "var list = (l != null ? l : [])\nfor (var _1_10_ = 0; _1_10_ < list.length; _1_10_++)\n{\n    e = list[_1_10_]\n    f(e)\n}");
    });
    it('list comprehension', function() {
        cmp("m = ([k, r.exec t] for k,r of rgs)", "m = (function () { var result = []; for (var k in rgs)  { var r = rgs[k];result.push([k,r.exec(t)])  } return result })()");
        cmp("m = ([i, k] for k,i in rgs)", "m = (function () { var result = []; var list = (rgs != null ? rgs : []); for (i = 0; i < list.length; i++)  { var k = list[i];result.push([i,k])  } return result })()");
        evl("1", 1);
        evl("'abc'", 'abc');
        evl("[1,2,3]", [1, 2, 3]);
        evl("[i for i in [1,2,3]]", [1, 2, 3]);
        evl("(i for i in [1,2,3])", [1, 2, 3]);
        evl("[i*2 for i in [1,2,3]]", [2, 4, 6]);
        evl("(i+3 for i in [1,2,3])", [4, 5, 6]);
        evl("(k for k of {a:1,b:2,c:3})", ['a', 'b', 'c']);
        evl("(v*v for k,v of {a:1,b:2,c:3})", [1, 4, 9]);
        evl("(''+i+' '+v for i,v of [5,4,3])", ['0 5', '1 4', '2 3']);
        return evl('((-> (a={})[v]=k; a)() for k,v of {a:1,b:2,c:3})', [
            {
                '1': 'a'
            }, {
                '2': 'b'
            }, {
                '3': 'c'
            }
        ]);
    });
    it('each', function() {
        cmp("{a:1,b:2}", "{a:1,b:2}");
        evl("a = {a:1,b:2}", {
            a: 1,
            b: 2
        });
        evl("a = {a:1,b:2} each (k,v) -> [k, v*3]", {
            a: 3,
            b: 6
        });
        evl("a = {a:1,b:2} each (k,v) -> ['▸'+k, v]", {
            '▸a': 1,
            '▸b': 2
        });
        evl("a = [1,2,3] each (i,v) -> [i, v]", [1, 2, 3]);
        evl("a = [1,2,3] each (i,v) -> [2-i, v]", [3, 2, 1]);
        evl("a = [1,3]   each (i,v) -> [1-i,v*v]", [9, 1]);
        evl("a = ['3''2''1'] each (i,v) -> [i, v+'▸'+i]", ['3▸0', '2▸1', '1▸2']);
        evl("a = 'hello' each (i,c) -> [i,c+c]", "hheelllloo");
        return evl("a = 'hello world' each (i,c) -> [i,i%2 and c.toUpperCase() or c]", "hElLo wOrLd");
    });
    it('each single', function() {
        evl("a = '' each ->", '');
        evl("a = {} each ->", {});
        evl("a = [] each ->", []);
        evl("a = [1,2] each -> 'a'", ['a', 'a']);
        evl("a = [1,2] each ->", []);
        evl("a = [1,2,3] each (v) -> v", [1, 2, 3]);
        return evl("a = {a:1,b:2} each (v) -> v*3", {
            a: 3,
            b: 6
        });
    });
    return it('while', function() {
        cmp("while true\n    log 4", "while (true)\n{\n    console.log(4)\n}");
        cmp("while true then log 5", "while (true)\n{\n    console.log(5)\n}");
        return cmp("while a == b then log c; log d\nlog e", "while (a === b)\n{\n    console.log(c)\n    console.log(d)\n}\nconsole.log(e)");
    });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9vcHMuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vY29mZmVlL3Rlc3QiLCJzb3VyY2VzIjpbImxvb3BzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRQSxNQUFlLE9BQUEsQ0FBUSxTQUFSLENBQWYsRUFBRSxhQUFGLEVBQU87O0FBRVAsUUFBQSxDQUFTLE9BQVQsRUFBaUIsU0FBQTtJQVFiLEVBQUEsQ0FBRyxRQUFILEVBQVksU0FBQTtRQUVSLEdBQUEsQ0FBSSxtQkFBSixFQUdRLHNIQUhSO1FBWUEsR0FBQSxDQUFJLDZCQUFKLEVBRVEsc0hBRlI7UUFXQSxHQUFBLENBQUksb0NBQUosRUFHUSxzSUFIUjtRQWFBLEdBQUEsQ0FBSSwyREFBSixFQUtRLHNLQUxSO1FBZ0JBLEdBQUEsQ0FBSSwrQkFBSixFQUdRLGlJQUhSO1FBWUEsR0FBQSxDQUFJLGlDQUFKLEVBR1EscUxBSFI7UUFhQSxHQUFBLENBQUksd0RBQUosRUFFUSwyUEFGUjtRQWlCQSxHQUFBLENBQUksdUVBQUosRUFLUSx5UkFMUjtRQW9CQSxHQUFBLENBQUksOENBQUosRUFFUSxtRkFGUjtlQVVBLEdBQUEsQ0FBSSx5Q0FBSixFQUVRLHdJQUZSO0lBOUhRLENBQVo7SUErSUEsRUFBQSxDQUFHLFFBQUgsRUFBWSxTQUFBO1FBRVIsR0FBQSxDQUFJLDRDQUFKLEVBR1EsMEZBSFI7ZUFXQSxHQUFBLENBQUksMENBQUosRUFFUSxpSUFGUjtJQWJRLENBQVo7SUF5QkEsRUFBQSxDQUFHLFVBQUgsRUFBYyxTQUFBO2VBRVYsR0FBQSxDQUFJLHFCQUFKLEVBRVEsNkhBRlI7SUFGVSxDQUFkO0lBbUJBLEVBQUEsQ0FBRyxvQkFBSCxFQUF3QixTQUFBO1FBRXBCLEdBQUEsQ0FBSSxvQ0FBSixFQUNJLDJIQURKO1FBS0EsR0FBQSxDQUFJLDZCQUFKLEVBQ0ksd0tBREo7UUFLQSxHQUFBLENBQUksR0FBSixFQUF3QyxDQUF4QztRQUNBLEdBQUEsQ0FB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bjAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwXG4wMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbjAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDBcbjAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAgICAgMDAwXG4wMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgICAgICAwMDAwMDAwXG4jIyNcblxueyBjbXAsIGV2bCB9ID0gcmVxdWlyZSAnLi91dGlscydcblxuZGVzY3JpYmUgJ2xvb3BzJyAtPlxuXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAgICAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAgMDAwMCAgMDAwXG4gICAgIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAgICAgIDAwMCAgMDAwIDAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAgMDAwICAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgICAgIDAwMCAgMDAwICAgMDAwXG5cbiAgICBpdCAnZm9yIGluJyAtPlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGZvciB0IGluIGxcbiAgICAgICAgICAgICAgICB0XG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICB2YXIgbGlzdCA9IChsICE9IG51bGwgPyBsIDogW10pXG4gICAgICAgICAgICBmb3IgKHZhciBfMV82XyA9IDA7IF8xXzZfIDwgbGlzdC5sZW5ndGg7IF8xXzZfKyspXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdCA9IGxpc3RbXzFfNl9dXG4gICAgICAgICAgICAgICAgdFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgZm9yIGEgaW4gWzEsMiwzXSB0aGVuIGxvZyBhXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICB2YXIgbGlzdCA9IFsxLDIsM11cbiAgICAgICAgICAgIGZvciAodmFyIF8xXzZfID0gMDsgXzFfNl8gPCBsaXN0Lmxlbmd0aDsgXzFfNl8rKylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBhID0gbGlzdFtfMV82X11cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhhKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgZm9yIGEgaW4gWzEsMiwzXSB0aGVuIGxvZyBhXG4gICAgICAgICAgICBsb2cgYVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgdmFyIGxpc3QgPSBbMSwyLDNdXG4gICAgICAgICAgICBmb3IgKHZhciBfMV82XyA9IDA7IF8xXzZfIDwgbGlzdC5sZW5ndGg7IF8xXzZfKyspXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYSA9IGxpc3RbXzFfNl9dXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGEpXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBmb3IgYSBpbiBbMSwyLDNdXG4gICAgICAgICAgICAgICAgbG9nICcxJyBhXG4gICAgICAgICAgICAgICAgbG9nICcyJyBhXG4gICAgICAgICAgICBsb2cgJzMnIGFcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIHZhciBsaXN0ID0gWzEsMiwzXVxuICAgICAgICAgICAgZm9yICh2YXIgXzFfNl8gPSAwOyBfMV82XyA8IGxpc3QubGVuZ3RoOyBfMV82XysrKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGEgPSBsaXN0W18xXzZfXVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCcxJyxhKVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCcyJyxhKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc29sZS5sb2coJzMnLGEpXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBmb3IgdixpIGluIEByZWdzXG4gICAgICAgICAgICAgICAgbG9nIGksdlxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgdmFyIGxpc3QgPSAodGhpcy5yZWdzICE9IG51bGwgPyB0aGlzLnJlZ3MgOiBbXSlcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHYgPSBsaXN0W2ldXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coaSx2KVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgZm9yIFthLGJdIGluIEByZWdzXG4gICAgICAgICAgICAgICAgbG9nIGEsYlxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgdmFyIGxpc3QgPSAodGhpcy5yZWdzICE9IG51bGwgPyB0aGlzLnJlZ3MgOiBbXSlcbiAgICAgICAgICAgIGZvciAodmFyIF8xXzEwXyA9IDA7IF8xXzEwXyA8IGxpc3QubGVuZ3RoOyBfMV8xMF8rKylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBhID0gbGlzdFtfMV8xMF9dWzBdXG4gICAgICAgICAgICAgICAgYiA9IGxpc3RbXzFfMTBfXVsxXVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGEsYilcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGZvciBhIGluIFsxLi4yXSB0aGVuIGZvciBiIGluIFsxLi4zXSB0aGVuIGMgPSAxOyBkID0gMVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgdmFyIGxpc3QgPSBbMSwyXVxuICAgICAgICAgICAgZm9yICh2YXIgXzFfNl8gPSAwOyBfMV82XyA8IGxpc3QubGVuZ3RoOyBfMV82XysrKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGEgPSBsaXN0W18xXzZfXVxuICAgICAgICAgICAgICAgIHZhciBsaXN0MSA9IFsxLDIsM11cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfMV8yN18gPSAwOyBfMV8yN18gPCBsaXN0MS5sZW5ndGg7IF8xXzI3XysrKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgYiA9IGxpc3QxW18xXzI3X11cbiAgICAgICAgICAgICAgICAgICAgYyA9IDFcbiAgICAgICAgICAgICAgICAgICAgZCA9IDFcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBmb3IgYSBpbiBbMS4uOV0gdGhlbiBmb3IgYiBpbiBbMS4uOV1cbiAgICAgICAgICAgICAgICBjID0gM1xuICAgICAgICAgICAgICAgIGQ6XG4gICAgICAgICAgICAgICAgICAgIGU6IDFcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIHZhciBsaXN0ID0gWzEsMiwzLDQsNSw2LDcsOCw5XVxuICAgICAgICAgICAgZm9yICh2YXIgXzFfNl8gPSAwOyBfMV82XyA8IGxpc3QubGVuZ3RoOyBfMV82XysrKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGEgPSBsaXN0W18xXzZfXVxuICAgICAgICAgICAgICAgIHZhciBsaXN0MSA9IFsxLDIsMyw0LDUsNiw3LDgsOV1cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfMV8yN18gPSAwOyBfMV8yN18gPCBsaXN0MS5sZW5ndGg7IF8xXzI3XysrKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgYiA9IGxpc3QxW18xXzI3X11cbiAgICAgICAgICAgICAgICAgICAgYyA9IDNcbiAgICAgICAgICAgICAgICAgICAge2Q6e2U6MX19XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBcbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgZW1wdHkgPSAoYSkgLT4gYSBpbiBbJycgbnVsbCB1bmRlZmluZWRdIG9yIGJcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZW1wdHkgPSBmdW5jdGlvbiAoYSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gWycnLG51bGwsdW5kZWZpbmVkXS5pbmRleE9mKGEpID49IDAgfHwgYlxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBcbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgQGV4cCBib2R5LmV4cHMsayxlIGZvciBlLGsgaW4gYm9keS5leHBzXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICB2YXIgbGlzdCA9IChib2R5LmV4cHMgIT0gbnVsbCA/IGJvZHkuZXhwcyA6IFtdKVxuICAgICAgICAgICAgZm9yIChrID0gMDsgayA8IGxpc3QubGVuZ3RoOyBrKyspXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZSA9IGxpc3Rba11cbiAgICAgICAgICAgICAgICB0aGlzLmV4cChib2R5LmV4cHMsayxlKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgICAgICAwMDAgICAwMDAgIDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMFxuXG4gICAgaXQgJ2ZvciBvZicgLT5cblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBmb3Iga2V5LHZhbCBvZiBAcGF0dGVybnNcbiAgICAgICAgICAgICAgICBsb2cga2V5LCB2YWxcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGZvciAoa2V5IGluIHRoaXMucGF0dGVybnMpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmFsID0gdGhpcy5wYXR0ZXJuc1trZXldXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coa2V5LHZhbClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIG1hdGNoZXMgPSAoW2ssIHIuZXhlYyB0XSBmb3IgayxyIG9mIHJncylcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIG1hdGNoZXMgPSAoZnVuY3Rpb24gKCkgeyB2YXIgcmVzdWx0ID0gW107IGZvciAodmFyIGsgaW4gcmdzKSAgeyB2YXIgciA9IHJnc1trXTtyZXN1bHQucHVzaChbayxyLmV4ZWModCldKSAgfSByZXR1cm4gcmVzdWx0IH0pKClcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAgICAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICBcbiAgICBcbiAgICBpdCAnZm9yIHRhaWwnIC0+XG4gICAgICAgIFxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBmIGUgZm9yIGUgaW4gbCA/IFtdXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICB2YXIgbGlzdCA9IChsICE9IG51bGwgPyBsIDogW10pXG4gICAgICAgICAgICBmb3IgKHZhciBfMV8xMF8gPSAwOyBfMV8xMF8gPCBsaXN0Lmxlbmd0aDsgXzFfMTBfKyspXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZSA9IGxpc3RbXzFfMTBfXVxuICAgICAgICAgICAgICAgIGYoZSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgXG4gICAgaXQgJ2xpc3QgY29tcHJlaGVuc2lvbicgLT5cbiAgICAgICAgXG4gICAgICAgIGNtcCBcIm0gPSAoW2ssIHIuZXhlYyB0XSBmb3IgayxyIG9mIHJncylcIixcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgbSA9IChmdW5jdGlvbiAoKSB7IHZhciByZXN1bHQgPSBbXTsgZm9yICh2YXIgayBpbiByZ3MpICB7IHZhciByID0gcmdzW2tdO3Jlc3VsdC5wdXNoKFtrLHIuZXhlYyh0KV0pICB9IHJldHVybiByZXN1bHQgfSkoKVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwibSA9IChbaSwga10gZm9yIGssaSBpbiByZ3MpXCIsXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIG0gPSAoZnVuY3Rpb24gKCkgeyB2YXIgcmVzdWx0ID0gW107IHZhciBsaXN0ID0gKHJncyAhPSBudWxsID8gcmdzIDogW10pOyBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykgIHsgdmFyIGsgPSBsaXN0W2ldO3Jlc3VsdC5wdXNoKFtpLGtdKSAgfSByZXR1cm4gcmVzdWx0IH0pKClcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgXG4gICAgICAgIGV2bCBcIjFcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDFcbiAgICAgICAgZXZsIFwiJ2FiYydcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2FiYydcbiAgICAgICAgZXZsIFwiWzEsMiwzXVwiICAgICAgICAgICAgICAgICAgICAgICAgICAgWzEsMiwzXVxuICAgICAgICBldmwgXCJbaSBmb3IgaSBpbiBbMSwyLDNdXVwiICAgICAgICAgICAgICBbIDEsIDIsIDMgXVxuICAgICAgICBldmwgXCIoaSBmb3IgaSBpbiBbMSwyLDNdKVwiICAgICAgICAgICAgICBbIDEsIDIsIDMgXVxuICAgICAgICBldmwgXCJbaSoyIGZvciBpIGluIFsxLDIsM11dXCIgICAgICAgICAgICBbIDIsIDQsIDYgXVxuICAgICAgICBldmwgXCIoaSszIGZvciBpIGluIFsxLDIsM10pXCIgICAgICAgICAgICBbIDQsIDUsIDYgXVxuICAgICAgICBldmwgXCIoayBmb3IgayBvZiB7YToxLGI6MixjOjN9KVwiICAgICAgICBbICdhJyAnYicgJ2MnIF1cbiAgICAgICAgZXZsIFwiKHYqdiBmb3Igayx2IG9mIHthOjEsYjoyLGM6M30pXCIgICAgWyAxIDQgOSBdXG4gICAgICAgIGV2bCBcIignJytpKycgJyt2IGZvciBpLHYgb2YgWzUsNCwzXSlcIiAgIFsgJzAgNScgJzEgNCcgJzIgMycgXVxuICAgICAgICBldmwgJygoLT4gKGE9e30pW3ZdPWs7IGEpKCkgZm9yIGssdiBvZiB7YToxLGI6MixjOjN9KScgIFsgeycxJzonYSd9IHsnMic6J2InfSB7JzMnOidjJ30gXVxuXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIGl0ICdlYWNoJyAtPlxuICAgICAgICBcbiAgICAgICAgY21wIFwie2E6MSxiOjJ9XCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ7YToxLGI6Mn1cIlxuXG4gICAgICAgIGV2bCBcImEgPSB7YToxLGI6Mn1cIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHthOjEsYjoyfVxuICAgICAgICBldmwgXCJhID0ge2E6MSxiOjJ9IGVhY2ggKGssdikgLT4gW2ssIHYqM11cIiAgICAgICAgICB7YTozLGI6Nn1cbiAgICAgICAgZXZsIFwiYSA9IHthOjEsYjoyfSBlYWNoIChrLHYpIC0+IFsn4pa4JytrLCB2XVwiICAgICAgICB7J+KWuGEnOjEsJ+KWuGInOjJ9XG4gICAgICAgIFxuICAgICAgICBldmwgXCJhID0gWzEsMiwzXSBlYWNoIChpLHYpIC0+IFtpLCB2XVwiICAgICAgICAgICAgICBbMSwyLDNdXG4gICAgICAgIGV2bCBcImEgPSBbMSwyLDNdIGVhY2ggKGksdikgLT4gWzItaSwgdl1cIiAgICAgICAgICAgIFszLDIsMV1cbiAgICAgICAgZXZsIFwiYSA9IFsxLDNdICAgZWFjaCAoaSx2KSAtPiBbMS1pLHYqdl1cIiAgICAgICAgICAgWzksMV1cbiAgICAgICAgZXZsIFwiYSA9IFsnMycnMicnMSddIGVhY2ggKGksdikgLT4gW2ksIHYrJ+KWuCcraV1cIiAgICBbJzPilrgwJyAnMuKWuDEnICcx4pa4MiddXG4gICAgICAgIGV2bCBcImEgPSAnaGVsbG8nIGVhY2ggKGksYykgLT4gW2ksYytjXVwiICAgICAgICAgICAgIFwiaGhlZWxsbGxvb1wiXG4gICAgICAgIGV2bCBcImEgPSAnaGVsbG8gd29ybGQnIGVhY2ggKGksYykgLT4gW2ksaSUyIGFuZCBjLnRvVXBwZXJDYXNlKCkgb3IgY11cIiAgICBcImhFbExvIHdPckxkXCJcbiAgICAgICAgIyBldmwgXCJhID0gJ2hlbGxvIGFnYWluJyBlYWNoIChpLGMpIC0+IFtpLCgoaSUyKSA/IGMudG9VcHBlckNhc2UoKSA6IGMpXVwiICAgXCJoRWxMbyBhR2FJblwiXG4gICAgICAgIFxuICAgIGl0ICdlYWNoIHNpbmdsZScgLT5cbiAgICAgICAgXG4gICAgICAgIGV2bCBcImEgPSAnJyBlYWNoIC0+XCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcnXG4gICAgICAgIGV2bCBcImEgPSB7fSBlYWNoIC0+XCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt9XG4gICAgICAgIGV2bCBcImEgPSBbXSBlYWNoIC0+XCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtdXG4gICAgICAgIGV2bCBcImEgPSBbMSwyXSBlYWNoIC0+ICdhJ1wiICAgICAgICAgICAgICAgICAgICAgICAgIFsnYScnYSddXG4gICAgICAgIGV2bCBcImEgPSBbMSwyXSBlYWNoIC0+XCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtdXG4gICAgICAgIGV2bCBcImEgPSBbMSwyLDNdIGVhY2ggKHYpIC0+IHZcIiAgICAgICAgICAgICAgICAgICAgIFsxLDIsM11cbiAgICAgICAgZXZsIFwiYSA9IHthOjEsYjoyfSBlYWNoICh2KSAtPiB2KjNcIiAgICAgICAgICAgICAgICAge2E6MyxiOjZ9XG4gICAgICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIDAwMDAwMDAwXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAwMDBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAgICAgIDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIDAwMFxuICAgICMgMDAgICAgIDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDBcblxuICAgIGl0ICd3aGlsZScgLT5cblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICB3aGlsZSB0cnVlXG4gICAgICAgICAgICAgICAgbG9nIDRcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIHdoaWxlICh0cnVlKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKDQpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICB3aGlsZSB0cnVlIHRoZW4gbG9nIDVcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIHdoaWxlICh0cnVlKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKDUpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICB3aGlsZSBhID09IGIgdGhlbiBsb2cgYzsgbG9nIGRcbiAgICAgICAgICAgIGxvZyBlXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICB3aGlsZSAoYSA9PT0gYilcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhjKVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGQpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlKVxuICAgICAgICAgICAgXCJcIlwiXG4iXX0=
//# sourceURL=../../coffee/test/loops.coffee