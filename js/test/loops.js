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
        cmp("for t in l\n    t", "var list = l\nfor (var _1_6_ = 0; _1_6_ < list.length; _1_6_++)\n{\n    t = list[_1_6_]\n    t\n}");
        cmp("for a in [1,2,3] then log a", "var list = [1,2,3]\nfor (var _1_6_ = 0; _1_6_ < list.length; _1_6_++)\n{\n    a = list[_1_6_]\n    console.log(a)\n}");
        cmp("for a in [1,2,3] then log a\nlog a", "var list = [1,2,3]\nfor (var _1_6_ = 0; _1_6_ < list.length; _1_6_++)\n{\n    a = list[_1_6_]\n    console.log(a)\n}\nconsole.log(a)");
        cmp("for a in [1,2,3]\n    log '1' a\n    log '2' a\nlog '3' a", "var list = [1,2,3]\nfor (var _1_6_ = 0; _1_6_ < list.length; _1_6_++)\n{\n    a = list[_1_6_]\n    console.log('1',a)\n    console.log('2',a)\n}\nconsole.log('3',a)");
        cmp("for v,i in @regs\n    log i,v", "var list = this.regs\nfor (i = 0; i < list.length; i++)\n{\n    v = list[i]\n    console.log(i,v)\n}");
        cmp("for [a,b] in @regs\n    log a,b", "var list = this.regs\nfor (var _1_10_ = 0; _1_10_ < list.length; _1_10_++)\n{\n    a = list[_1_10_][0]\n    b = list[_1_10_][1]\n    console.log(a,b)\n}");
        cmp("for a in [1..2] then for b in [1..3] then c = 1; d = 1", "var list = [1,2]\nfor (var _1_6_ = 0; _1_6_ < list.length; _1_6_++)\n{\n    a = list[_1_6_]\n    var list1 = [1,2,3]\n    for (var _1_27_ = 0; _1_27_ < list1.length; _1_27_++)\n    {\n        b = list1[_1_27_]\n        c = 1\n        d = 1\n    }\n}");
        cmp("for a in [1..9] then for b in [1..9]\n    c = 3\n    d:\n        e: 1", "var list = [1,2,3,4,5,6,7,8,9]\nfor (var _1_6_ = 0; _1_6_ < list.length; _1_6_++)\n{\n    a = list[_1_6_]\n    var list1 = [1,2,3,4,5,6,7,8,9]\n    for (var _1_27_ = 0; _1_27_ < list1.length; _1_27_++)\n    {\n        b = list1[_1_27_]\n        c = 3\n        {d:{e:1}}\n    }\n}");
        return cmp("empty = (a) -> a in ['' null undefined] or b", "\nempty = function (a)\n{\n    return ['',null,undefined].indexOf(a) >= 0 || b\n}");
    });
    it('for of', function() {
        return cmp("for key,val of @patterns\n    log key, val", "for (key in this.patterns)\n{\n    val = this.patterns[key]\n    console.log(key,val)\n}");
    });
    it('for tail', function() {
        return cmp("f e for e in l ? []", "var list = ((_1_15_=l) != null ? _1_15_ : [])\nfor (var _1_10_ = 0; _1_10_ < list.length; _1_10_++)\n{\n    e = list[_1_10_]\n    f(e)\n}");
    });
    it('list comprehension', function() {
        cmp("m = ([k, r.exec t] for k,r of rgs)", "m = (function () { var result = []; for (k in rgs)  { var r = rgs[k];result.push([k,r.exec(t)])  } return result })()");
        cmp("m = ([i, k] for k,i in rgs)", "m = (function () { var result = []; var list = rgs; for (i = 0; i < list.length; i++)  { var k = list[i];result.push([i,k])  } return result })()");
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9vcHMuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vY29mZmVlL3Rlc3QiLCJzb3VyY2VzIjpbImxvb3BzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRQSxNQUFlLE9BQUEsQ0FBUSxTQUFSLENBQWYsRUFBRSxhQUFGLEVBQU87O0FBRVAsUUFBQSxDQUFTLE9BQVQsRUFBaUIsU0FBQTtJQVFiLEVBQUEsQ0FBRyxRQUFILEVBQVksU0FBQTtRQUVSLEdBQUEsQ0FBSSxtQkFBSixFQUdRLG1HQUhSO1FBWUEsR0FBQSxDQUFJLDZCQUFKLEVBRVEsc0hBRlI7UUFXQSxHQUFBLENBQUksb0NBQUosRUFHUSxzSUFIUjtRQWFBLEdBQUEsQ0FBSSwyREFBSixFQUtRLHNLQUxSO1FBZ0JBLEdBQUEsQ0FBSSwrQkFBSixFQUdRLHNHQUhSO1FBWUEsR0FBQSxDQUFJLGlDQUFKLEVBR1EsMEpBSFI7UUFhQSxHQUFBLENBQUksd0RBQUosRUFFUSwyUEFGUjtRQWlCQSxHQUFBLENBQUksdUVBQUosRUFLUSx5UkFMUjtlQW9CQSxHQUFBLENBQUksOENBQUosRUFFUSxtRkFGUjtJQXBIUSxDQUFaO0lBb0lBLEVBQUEsQ0FBRyxRQUFILEVBQVksU0FBQTtlQUVSLEdBQUEsQ0FBSSw0Q0FBSixFQUdRLDBGQUhSO0lBRlEsQ0FBWjtJQW1CQSxFQUFBLENBQUcsVUFBSCxFQUFjLFNBQUE7ZUFFVixHQUFBLENBQUkscUJBQUosRUFFUSwySUFGUjtJQUZVLENBQWQ7SUFtQkEsRUFBQSxDQUFHLG9CQUFILEVBQXdCLFNBQUE7UUFFcEIsR0FBQSxDQUFJLG9DQUFKLEVBQ0ksdUhBREo7UUFLQSxHQUFBLENBQUksNkJBQUosRUFDSSxtSkFESjtRQUtBLEdBQUEsQ0FBSSxHQUFKLEVBQXdDLENBQXhDO1FBQ0EsR0FBQSxDQUFJLE9BQUosRUFBd0MsS0FBeEM7UUFDQSxHQUFBLENBQUksU0FBSixFQUF3QyxDQUFDLENBQUQsRUFBRyxDQUFILEVBQUssQ0FBTCxDQUF4QztRQUNBLEdBQUEsQ0FBSSxzQkFBSixFQUF3QyxDQUFFLENBQUYsRUFBSyxDQUFMLEVBQVEsQ0FBUixDQUF4QztRQUNBLEdBQUEsQ0FBSSxzQkFBSixFQUF3QyxDQUFFLENBQUYsRUFBSyxDQUFMLEVBQVEsQ0FBUixDQUF4QztRQUNBLEdBQUEsQ0FBSSx3QkFBSixFQUF3QyxDQUFFLENBQUYsRUFBSyxDQUFMLEVBQVEsQ0FBUixDQUF4QztRQUNBLEdBQUEsQ0FBSSx3QkFBSixFQUF3QyxDQUFFLENBQUYsRUFBSyxDQUFMLEVBQVEsQ0FBUixDQUF4QztRQUNBLEdBQUEsQ0FBSSw0QkFBSixFQUF3QyxDQUFFLEdBQUYsRUFBTSxHQUFOLEVBQVUsR0FBVixDQUF4QztRQUNBLEdBQUEsQ0FBSSxnQ0FBSixFQUF3QyxDQUFFLENBQUYsRUFBSSxDQUFKLEVBQU0sQ0FBTixDQUF4QztRQUNBLEdBQUEsQ0FBSSxpQ0FBSixFQUF3QyxDQUFFLEtBQUYsRUFBUSxLQUFSLEVBQWMsS0FBZCxDQUF4QztlQUNBLEdBQUEsQ0FBSSxrREFBSixFQUF3RDtZQUFFO2dCQUFDLEdBQUEsRUFBSSxHQUFMO2FBQUYsRUFBWTtnQkFBQyxHQUFBLEVBQUksR0FBTDthQUFaLEVBQXNCO2dCQUFDLEdBQUEsRUFBSSxHQUFMO2FBQXRCO1NBQXhEO0lBdEJvQixDQUF4QjtJQThCQSxFQUFBLENBQUcsTUFBSCxFQUFVLFNBQUE7UUFFTixHQUFBLENBQUksV0FBSixFQUFvRCxXQUFwRDtRQUVBLEdBQUEsQ0FBSSxlQUFKLEVBQW9EO1lBQUMsQ0FBQSxFQUFFLENBQUg7WUFBSyxDQUFBLEVBQUUsQ0FBUDtTQUFwRDtRQUNBLEdBQUEsQ0FBSSxzQ0FBSixFQUFvRDtZQUFDLENBQUEsRUFBRSxDQUFIO1lBQUssQ0FBQSxFQUFFLENBQVA7U0FBcEQ7UUFDQSxHQUFBLENBQUksd0NBQUosRUFBb0Q7WUFBQyxJQUFBLEVBQUssQ0FBTjtZQUFRLElBQUEsRUFBSyxDQUFiO1NBQXBEO1FBRUEsR0FBQSxDQUFJLGtDQUFKLEVBQW9ELENBQUMsQ0FBRCxFQUFHLENBQUgsRUFBSyxDQUFMLENBQXBEO1FBQ0EsR0FBQSxDQUFJLG9DQUFKLEVBQW9ELENBQUMsQ0FBRCxFQUFHLENBQUgsRUFBSyxDQUFMLENBQXBEO1FBQ0EsR0FBQSxDQUFJLHFDQUFKLEVBQW9ELENBQUMsQ0FBRCxFQUFHLENBQUgsQ0FBcEQ7UUFDQSxHQUFBLENBQUksNENBQUosRUFBb0QsQ0FBQyxLQUFELEVBQU8sS0FBUCxFQUFhLEtBQWIsQ0FBcEQ7UUFDQSxHQUFBLENBQUksbUNBQUosRUFBb0QsWUFBcEQ7ZUFDQSxHQUFBLENBQUksa0VBQUosRUFBMEUsYUFBMUU7SUFiTSxDQUFWO0lBZ0JBLEVBQUEsQ0FBRyxhQUFILEVBQWlCLFNBQUE7UUFFYixHQUFBLENBQUksZ0JBQUosRUFBb0QsRUFBcEQ7UUFDQSxHQUFBLENBQUksZ0JBQUosRUFBb0QsRUFBcEQ7UUFDQSxHQUFBLENBQUksZ0JBQUosRUFBb0QsRUFBcEQ7UUFDQSxHQUFBLENBQUksdUJBQUosRUFBb0QsQ0FBQyxHQUFELEVBQUksR0FBSixDQUFwRDtRQUNBLEdBQUEsQ0FBSSxtQkFBSixFQUFvRCxFQUFwRDtRQUNBLEdBQUEsQ0FBSSwyQkFBSixFQUFvRCxDQUFDLENBQUQsRUFBRyxDQUFILEVBQUssQ0FBTCxDQUFwRDtlQUNBLEdBQUEsQ0FBSSwrQkFBSixFQUFvRDtZQUFDLENBQUEsRUFBRSxDQUFIO1lBQUssQ0FBQSxFQUFFLENBQVA7U0FBcEQ7SUFSYSxDQUFqQjtXQWdCQSxFQUFBLENBQUcsT0FBSCxFQUFXLFNBQUE7UUFFUCxHQUFBLENBQUksdUJBQUosRUFHUSx3Q0FIUjtRQVVBLEdBQUEsQ0FBSSx1QkFBSixFQUVRLHdDQUZSO2VBU0EsR0FBQSxDQUFJLHVDQUFKLEVBR1EsK0VBSFI7SUFyQk8sQ0FBWDtBQWhQYSxDQUFqQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDBcbjAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMFxuMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAgICAwMDBcbjAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMDAwMDBcbiMjI1xuXG57IGNtcCwgZXZsIH0gPSByZXF1aXJlICcuL3V0aWxzJ1xuXG5kZXNjcmliZSAnbG9vcHMnIC0+XG5cbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgICAgICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwICAwMDAwICAwMDBcbiAgICAjIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgICAgMDAwICAwMDAgMCAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwICAwMDAgIDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgICAgMDAwICAwMDAgICAwMDBcblxuICAgIGl0ICdmb3IgaW4nIC0+XG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgZm9yIHQgaW4gbFxuICAgICAgICAgICAgICAgIHRcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIHZhciBsaXN0ID0gbFxuICAgICAgICAgICAgZm9yICh2YXIgXzFfNl8gPSAwOyBfMV82XyA8IGxpc3QubGVuZ3RoOyBfMV82XysrKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHQgPSBsaXN0W18xXzZfXVxuICAgICAgICAgICAgICAgIHRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGZvciBhIGluIFsxLDIsM10gdGhlbiBsb2cgYVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgdmFyIGxpc3QgPSBbMSwyLDNdXG4gICAgICAgICAgICBmb3IgKHZhciBfMV82XyA9IDA7IF8xXzZfIDwgbGlzdC5sZW5ndGg7IF8xXzZfKyspXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYSA9IGxpc3RbXzFfNl9dXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGZvciBhIGluIFsxLDIsM10gdGhlbiBsb2cgYVxuICAgICAgICAgICAgbG9nIGFcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIHZhciBsaXN0ID0gWzEsMiwzXVxuICAgICAgICAgICAgZm9yICh2YXIgXzFfNl8gPSAwOyBfMV82XyA8IGxpc3QubGVuZ3RoOyBfMV82XysrKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGEgPSBsaXN0W18xXzZfXVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGEpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhhKVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgZm9yIGEgaW4gWzEsMiwzXVxuICAgICAgICAgICAgICAgIGxvZyAnMScgYVxuICAgICAgICAgICAgICAgIGxvZyAnMicgYVxuICAgICAgICAgICAgbG9nICczJyBhXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICB2YXIgbGlzdCA9IFsxLDIsM11cbiAgICAgICAgICAgIGZvciAodmFyIF8xXzZfID0gMDsgXzFfNl8gPCBsaXN0Lmxlbmd0aDsgXzFfNl8rKylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBhID0gbGlzdFtfMV82X11cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnMScsYSlcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnMicsYSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCczJyxhKVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgZm9yIHYsaSBpbiBAcmVnc1xuICAgICAgICAgICAgICAgIGxvZyBpLHZcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIHZhciBsaXN0ID0gdGhpcy5yZWdzXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB2ID0gbGlzdFtpXVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGksdilcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGZvciBbYSxiXSBpbiBAcmVnc1xuICAgICAgICAgICAgICAgIGxvZyBhLGJcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIHZhciBsaXN0ID0gdGhpcy5yZWdzXG4gICAgICAgICAgICBmb3IgKHZhciBfMV8xMF8gPSAwOyBfMV8xMF8gPCBsaXN0Lmxlbmd0aDsgXzFfMTBfKyspXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYSA9IGxpc3RbXzFfMTBfXVswXVxuICAgICAgICAgICAgICAgIGIgPSBsaXN0W18xXzEwX11bMV1cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhhLGIpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBmb3IgYSBpbiBbMS4uMl0gdGhlbiBmb3IgYiBpbiBbMS4uM10gdGhlbiBjID0gMTsgZCA9IDFcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIHZhciBsaXN0ID0gWzEsMl1cbiAgICAgICAgICAgIGZvciAodmFyIF8xXzZfID0gMDsgXzFfNl8gPCBsaXN0Lmxlbmd0aDsgXzFfNl8rKylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBhID0gbGlzdFtfMV82X11cbiAgICAgICAgICAgICAgICB2YXIgbGlzdDEgPSBbMSwyLDNdXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgXzFfMjdfID0gMDsgXzFfMjdfIDwgbGlzdDEubGVuZ3RoOyBfMV8yN18rKylcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGIgPSBsaXN0MVtfMV8yN19dXG4gICAgICAgICAgICAgICAgICAgIGMgPSAxXG4gICAgICAgICAgICAgICAgICAgIGQgPSAxXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgZm9yIGEgaW4gWzEuLjldIHRoZW4gZm9yIGIgaW4gWzEuLjldXG4gICAgICAgICAgICAgICAgYyA9IDNcbiAgICAgICAgICAgICAgICBkOlxuICAgICAgICAgICAgICAgICAgICBlOiAxXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICB2YXIgbGlzdCA9IFsxLDIsMyw0LDUsNiw3LDgsOV1cbiAgICAgICAgICAgIGZvciAodmFyIF8xXzZfID0gMDsgXzFfNl8gPCBsaXN0Lmxlbmd0aDsgXzFfNl8rKylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBhID0gbGlzdFtfMV82X11cbiAgICAgICAgICAgICAgICB2YXIgbGlzdDEgPSBbMSwyLDMsNCw1LDYsNyw4LDldXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgXzFfMjdfID0gMDsgXzFfMjdfIDwgbGlzdDEubGVuZ3RoOyBfMV8yN18rKylcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGIgPSBsaXN0MVtfMV8yN19dXG4gICAgICAgICAgICAgICAgICAgIGMgPSAzXG4gICAgICAgICAgICAgICAgICAgIHtkOntlOjF9fVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGVtcHR5ID0gKGEpIC0+IGEgaW4gWycnIG51bGwgdW5kZWZpbmVkXSBvciBiXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGVtcHR5ID0gZnVuY3Rpb24gKGEpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFsnJyxudWxsLHVuZGVmaW5lZF0uaW5kZXhPZihhKSA+PSAwIHx8IGJcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAgICAgICAwMDAwMDAwICAgMDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgICAgMDAwICAgMDAwICAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDBcblxuICAgIGl0ICdmb3Igb2YnIC0+XG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgZm9yIGtleSx2YWwgb2YgQHBhdHRlcm5zXG4gICAgICAgICAgICAgICAgbG9nIGtleSwgdmFsXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBmb3IgKGtleSBpbiB0aGlzLnBhdHRlcm5zKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZhbCA9IHRoaXMucGF0dGVybnNba2V5XVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGtleSx2YWwpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAgICAgICAwMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAgICAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgXG4gICAgXG4gICAgaXQgJ2ZvciB0YWlsJyAtPlxuICAgICAgICBcbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgZiBlIGZvciBlIGluIGwgPyBbXVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgdmFyIGxpc3QgPSAoKF8xXzE1Xz1sKSAhPSBudWxsID8gXzFfMTVfIDogW10pXG4gICAgICAgICAgICBmb3IgKHZhciBfMV8xMF8gPSAwOyBfMV8xMF8gPCBsaXN0Lmxlbmd0aDsgXzFfMTBfKyspXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZSA9IGxpc3RbXzFfMTBfXVxuICAgICAgICAgICAgICAgIGYoZSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgXG4gICAgaXQgJ2xpc3QgY29tcHJlaGVuc2lvbicgLT5cbiAgICAgICAgXG4gICAgICAgIGNtcCBcIm0gPSAoW2ssIHIuZXhlYyB0XSBmb3IgayxyIG9mIHJncylcIixcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgbSA9IChmdW5jdGlvbiAoKSB7IHZhciByZXN1bHQgPSBbXTsgZm9yIChrIGluIHJncykgIHsgdmFyIHIgPSByZ3Nba107cmVzdWx0LnB1c2goW2ssci5leGVjKHQpXSkgIH0gcmV0dXJuIHJlc3VsdCB9KSgpXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJtID0gKFtpLCBrXSBmb3IgayxpIGluIHJncylcIixcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgbSA9IChmdW5jdGlvbiAoKSB7IHZhciByZXN1bHQgPSBbXTsgdmFyIGxpc3QgPSByZ3M7IGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSAgeyB2YXIgayA9IGxpc3RbaV07cmVzdWx0LnB1c2goW2ksa10pICB9IHJldHVybiByZXN1bHQgfSkoKVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBcbiAgICAgICAgZXZsIFwiMVwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgMVxuICAgICAgICBldmwgXCInYWJjJ1wiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYWJjJ1xuICAgICAgICBldmwgXCJbMSwyLDNdXCIgICAgICAgICAgICAgICAgICAgICAgICAgICBbMSwyLDNdXG4gICAgICAgIGV2bCBcIltpIGZvciBpIGluIFsxLDIsM11dXCIgICAgICAgICAgICAgIFsgMSwgMiwgMyBdXG4gICAgICAgIGV2bCBcIihpIGZvciBpIGluIFsxLDIsM10pXCIgICAgICAgICAgICAgIFsgMSwgMiwgMyBdXG4gICAgICAgIGV2bCBcIltpKjIgZm9yIGkgaW4gWzEsMiwzXV1cIiAgICAgICAgICAgIFsgMiwgNCwgNiBdXG4gICAgICAgIGV2bCBcIihpKzMgZm9yIGkgaW4gWzEsMiwzXSlcIiAgICAgICAgICAgIFsgNCwgNSwgNiBdXG4gICAgICAgIGV2bCBcIihrIGZvciBrIG9mIHthOjEsYjoyLGM6M30pXCIgICAgICAgIFsgJ2EnICdiJyAnYycgXVxuICAgICAgICBldmwgXCIodip2IGZvciBrLHYgb2Yge2E6MSxiOjIsYzozfSlcIiAgICBbIDEgNCA5IF1cbiAgICAgICAgZXZsIFwiKCcnK2krJyAnK3YgZm9yIGksdiBvZiBbNSw0LDNdKVwiICAgWyAnMCA1JyAnMSA0JyAnMiAzJyBdXG4gICAgICAgIGV2bCAnKCgtPiAoYT17fSlbdl09azsgYSkoKSBmb3Igayx2IG9mIHthOjEsYjoyLGM6M30pJyAgWyB7JzEnOidhJ30geycyJzonYid9IHsnMyc6J2MnfSBdXG5cbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgaXQgJ2VhY2gnIC0+XG4gICAgICAgIFxuICAgICAgICBjbXAgXCJ7YToxLGI6Mn1cIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInthOjEsYjoyfVwiXG5cbiAgICAgICAgZXZsIFwiYSA9IHthOjEsYjoyfVwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2E6MSxiOjJ9XG4gICAgICAgIGV2bCBcImEgPSB7YToxLGI6Mn0gZWFjaCAoayx2KSAtPiBbaywgdiozXVwiICAgICAgICAgIHthOjMsYjo2fVxuICAgICAgICBldmwgXCJhID0ge2E6MSxiOjJ9IGVhY2ggKGssdikgLT4gWyfilrgnK2ssIHZdXCIgICAgICAgIHsn4pa4YSc6MSwn4pa4Yic6Mn1cbiAgICAgICAgXG4gICAgICAgIGV2bCBcImEgPSBbMSwyLDNdIGVhY2ggKGksdikgLT4gW2ksIHZdXCIgICAgICAgICAgICAgIFsxLDIsM11cbiAgICAgICAgZXZsIFwiYSA9IFsxLDIsM10gZWFjaCAoaSx2KSAtPiBbMi1pLCB2XVwiICAgICAgICAgICAgWzMsMiwxXVxuICAgICAgICBldmwgXCJhID0gWzEsM10gICBlYWNoIChpLHYpIC0+IFsxLWksdip2XVwiICAgICAgICAgICBbOSwxXVxuICAgICAgICBldmwgXCJhID0gWyczJycyJycxJ10gZWFjaCAoaSx2KSAtPiBbaSwgdisn4pa4JytpXVwiICAgIFsnM+KWuDAnICcy4pa4MScgJzHilrgyJ11cbiAgICAgICAgZXZsIFwiYSA9ICdoZWxsbycgZWFjaCAoaSxjKSAtPiBbaSxjK2NdXCIgICAgICAgICAgICAgXCJoaGVlbGxsbG9vXCJcbiAgICAgICAgZXZsIFwiYSA9ICdoZWxsbyB3b3JsZCcgZWFjaCAoaSxjKSAtPiBbaSxpJTIgYW5kIGMudG9VcHBlckNhc2UoKSBvciBjXVwiICAgIFwiaEVsTG8gd09yTGRcIlxuICAgICAgICAjIGV2bCBcImEgPSAnaGVsbG8gYWdhaW4nIGVhY2ggKGksYykgLT4gW2ksKChpJTIpID8gYy50b1VwcGVyQ2FzZSgpIDogYyldXCIgICBcImhFbExvIGFHYUluXCJcbiAgICAgICAgXG4gICAgaXQgJ2VhY2ggc2luZ2xlJyAtPlxuICAgICAgICBcbiAgICAgICAgZXZsIFwiYSA9ICcnIGVhY2ggLT5cIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJydcbiAgICAgICAgZXZsIFwiYSA9IHt9IGVhY2ggLT5cIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge31cbiAgICAgICAgZXZsIFwiYSA9IFtdIGVhY2ggLT5cIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW11cbiAgICAgICAgZXZsIFwiYSA9IFsxLDJdIGVhY2ggLT4gJ2EnXCIgICAgICAgICAgICAgICAgICAgICAgICAgWydhJydhJ11cbiAgICAgICAgZXZsIFwiYSA9IFsxLDJdIGVhY2ggLT5cIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW11cbiAgICAgICAgZXZsIFwiYSA9IFsxLDIsM10gZWFjaCAodikgLT4gdlwiICAgICAgICAgICAgICAgICAgICAgWzEsMiwzXVxuICAgICAgICBldmwgXCJhID0ge2E6MSxiOjJ9IGVhY2ggKHYpIC0+IHYqM1wiICAgICAgICAgICAgICAgICB7YTozLGI6Nn1cbiAgICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwMDAwMDBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIDAwMFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwICAgICAgMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwXG4gICAgIyAwMCAgICAgMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAwMDAwMDAwMFxuXG4gICAgaXQgJ3doaWxlJyAtPlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIHdoaWxlIHRydWVcbiAgICAgICAgICAgICAgICBsb2cgNFxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgd2hpbGUgKHRydWUpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coNClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIHdoaWxlIHRydWUgdGhlbiBsb2cgNVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgd2hpbGUgKHRydWUpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coNSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIHdoaWxlIGEgPT0gYiB0aGVuIGxvZyBjOyBsb2cgZFxuICAgICAgICAgICAgbG9nIGVcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIHdoaWxlIChhID09PSBiKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGMpXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpXG4gICAgICAgICAgICBcIlwiXCJcbiJdfQ==
//# sourceURL=../../coffee/test/loops.coffee