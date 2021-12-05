// koffee 1.20.0

/*
 0000000   00000000   00000000    0000000   000   000
000   000  000   000  000   000  000   000   000 000
000000000  0000000    0000000    000000000    00000
000   000  000   000  000   000  000   000     000
000   000  000   000  000   000  000   000     000
 */
var cmp, evl, ref;

ref = require('./utils'), cmp = ref.cmp, evl = ref.evl;

describe('array', function() {
    it('index', function() {
        cmp('a[1]', 'a[1]');
        cmp('a[1][2]', 'a[1][2]');
        cmp('a[1][2]', 'a[1][2]');
        cmp('[1,2][1]', ';[1,2][1]');
        return cmp('{a:1}["a"]', '{a:1}["a"]');
    });
    it('index slice', function() {
        cmp('a[0..1]', 'a.slice(0, 2)');
        cmp('a[0...1]', 'a.slice(0, 1)');
        cmp('a[-1]', 'a.slice(-1)[0]');
        cmp('a[-2]', 'a.slice(-2,-1)[0]');
        cmp('a[-100]', 'a.slice(-100,-99)[0]');
        return cmp("blocks[-1].tokens.push block\nblocks.push block", "blocks.slice(-1)[0].tokens.push(block)\nblocks.push(block)");
    });
    it('range', function() {
        cmp('[1..10]', ';[1,2,3,4,5,6,7,8,9,10]');
        cmp('[1...10]', ';[1,2,3,4,5,6,7,8,9]');
        cmp('r = [1..10]', 'r = [1,2,3,4,5,6,7,8,9,10]');
        cmp('r = [1...10]', 'r = [1,2,3,4,5,6,7,8,9]');
        cmp('[1..100]', ";(function() { var r = []; for (var i = 1; i <= 100; i++){ r.push(i); } return r; }).apply(this)");
        cmp('[1...100]', ";(function() { var r = []; for (var i = 1; i < 100; i++){ r.push(i); } return r; }).apply(this)");
        return cmp('[-3..3]', ';[-3,-2,-1,0,1,2,3]');
    });
    it('slice', function() {
        cmp("a[1..4]", "a.slice(1, 5)");
        cmp("a[1...4]", "a.slice(1, 4)");
        cmp("a[1...a]", "a.slice(1, typeof a === 'number' ? a : -1)");
        cmp("a[1..a]", "a.slice(1, typeof a === 'number' ? a+1 : Infinity)");
        cmp("a[1..a.b]", "a.slice(1, typeof a.b === 'number' ? a.b+1 : Infinity)");
        cmp("a[1..a[2]]", "a.slice(1, typeof a[2] === 'number' ? a[2]+1 : Infinity)");
        cmp("a[1..a[3].b]", "a.slice(1, typeof a[3].b === 'number' ? a[3].b+1 : Infinity)");
        cmp("b[c...-1]", "b.slice(c, -1)");
        cmp("b[c.d...-1]", "b.slice(c.d, -1)");
        cmp("b[c[0]...-1]", "b.slice(c[0], -1)");
        cmp("b[c[0].d..-1]", "b.slice(c[0].d)");
        cmp("s[i+1..]", "s.slice(i + 1)");
        cmp("s[i+1...]", "s.slice(i + 1, -1)");
        cmp("o[0..-1]", "o.slice(0)");
        cmp("q[..-1]", "q.slice(0)");
        cmp("p[0..]", "p.slice(0)");
        cmp("r[..]", "r.slice(0)");
        cmp("s[ic...c+index]", "s.slice(ic, c + index)");
        cmp("s[...i] + s[i+1..]", "s.slice(0, typeof i === 'number' ? i : -1) + s.slice(i + 1)");
        evl("'abc'[0..1]", "ab");
        evl("'abc'[0..2]", "abc");
        evl("'xyz'[0..]", "xyz");
        return evl("'uvw'[0...]", "uv");
    });
    it('array', function() {
        cmp('[1]', ';[1]');
        cmp('[1 2]', ';[1,2]');
        cmp('[1,2]', ';[1,2]');
        cmp('[a,b]', ';[a,b]');
        cmp('[ "1" ]', ';["1"]');
        cmp("[ '1' ]", ";['1']");
        cmp('["1" "2"]', ';["1","2"]');
        cmp("['1' '2']", ";['1','2']");
        cmp('["1" , "2"]', ';["1","2"]');
        cmp("['1' , '2']", ";['1','2']");
        cmp("[['1'] , [2]]", ";[['1'],[2]]");
        cmp('[[]]', ';[[]]');
        cmp('[{}]', ';[{}]');
        cmp('[[[]]]', ';[[[]]]');
        cmp('[[[] []]]', ';[[[],[]]]');
        cmp('[[[],[]]]', ';[[[],[]]]');
        cmp('[[[][]]]', ';[[[],[]]]');
        cmp('[[[1]], 1]', ';[[[1]],1]');
        cmp('[b(c)]', ';[b(c)]');
        cmp('[b c]', ';[b(c)]');
        cmp("['1' , a, true, false, null, undefined]", ";['1',a,true,false,null,undefined]");
        cmp("a = [1 2 - 3 x 4 + 5 'a' b 'c']", "a = [1,2 - 3,x(4 + 5,'a',b('c'))]");
        return cmp("['1' \"2\" 3 4.5 [] {} true false null undefined NaN Infinity yes no]", ";['1',\"2\",3,4.5,[],{},true,false,null,undefined,NaN,Infinity,true,false]");
    });
    it('objects', function() {
        cmp('[a:b]', ';[{a:b}]');
        cmp("a = [{\n        a:1\n        b:2\n        c:3\n    }{\n        x:1\n        y:2\n        z:3\n    }]", "a = [{a:1,b:2,c:3},{x:1,y:2,z:3}]");
        return cmp("a = [\n        a:4\n        b:5\n    ,\n        x:6\n        y:7\n    ]", "a = [{a:4,b:5},{x:6,y:7}]");
    });
    it('function', function() {
        return cmp('[a -3]', ';[a(-3)]');
    });
    it('assign', function() {
        return cmp('[l, r] = a', 'l = a[0]\nr = a[1]\n');
    });
    return it('blocks', function() {
        cmp("[\n    1,2\n]", ";[1,2]");
        cmp("[\n    1,\n    2\n]", ";[1,2]");
        cmp("[\n    1\n    2\n]", ";[1,2]");
        cmp("[\n    [\n        0\n        1\n    ]\n    2\n]", ";[[0,1],2]");
        cmp("a = [\n        [\n            0\n            1\n        ]\n        2\n    ]", "a = [[0,1],2]");
        cmp("a =\n    [\n        [\n            0\n            1\n        ]\n        2\n    ]", "a = [[0,1],2]");
        cmp("[\n    b\n        [\n            0\n            1\n        ]\n    2\n]", ";[b([0,1]),2]");
        cmp("a\n    [\n        b\n            [\n                0\n                1\n            ]\n        2\n    ]", "a([b([0,1]),2])");
        cmp("->\n    [\n        1\n        2\n    ]", "(function ()\n{\n    return [1,2]\n})");
        cmp("l = [\n     1 2 3 'a'\n     c:\n      d:3\n      e:4\n     f:\n      'b'\n     'c'\n     l =\n        1\n    ]", "l = [1,2,3,'a',{c:{d:3,e:4},f:'b'},'c',l = 1]");
        cmp("l = [[ [\n        [[\n          1\n          2\n          ]\n         ]\n        ]]   ]", "l = [[[[[1,2]]]]]");
        cmp("l = [[1\n       2]]", "l = [[1,2]]");
        cmp("l = [[1\n  2]]", "l = [[1,2]]");
        cmp("l = [[1\n    2]\n      ]", "l = [[1,2]]");
        return cmp("l = [[1 2]\n    ]", "l = [[1,2]]");
    });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJyYXkuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vY29mZmVlL3Rlc3QiLCJzb3VyY2VzIjpbImFycmF5LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRQSxNQUFlLE9BQUEsQ0FBUSxTQUFSLENBQWYsRUFBRSxhQUFGLEVBQU87O0FBRVAsUUFBQSxDQUFTLE9BQVQsRUFBaUIsU0FBQTtJQVFiLEVBQUEsQ0FBRyxPQUFILEVBQVcsU0FBQTtRQUVQLEdBQUEsQ0FBSSxNQUFKLEVBQXNCLE1BQXRCO1FBQ0EsR0FBQSxDQUFJLFNBQUosRUFBc0IsU0FBdEI7UUFDQSxHQUFBLENBQUksU0FBSixFQUFzQixTQUF0QjtRQUNBLEdBQUEsQ0FBSSxVQUFKLEVBQXNCLFdBQXRCO2VBQ0EsR0FBQSxDQUFJLFlBQUosRUFBc0IsWUFBdEI7SUFOTyxDQUFYO0lBUUEsRUFBQSxDQUFHLGFBQUgsRUFBaUIsU0FBQTtRQUViLEdBQUEsQ0FBSSxTQUFKLEVBQXNCLGVBQXRCO1FBQ0EsR0FBQSxDQUFJLFVBQUosRUFBc0IsZUFBdEI7UUFDQSxHQUFBLENBQUksT0FBSixFQUFzQixnQkFBdEI7UUFDQSxHQUFBLENBQUksT0FBSixFQUFzQixtQkFBdEI7UUFDQSxHQUFBLENBQUksU0FBSixFQUFzQixzQkFBdEI7ZUFFQSxHQUFBLENBQUksaURBQUosRUFHUSw0REFIUjtJQVJhLENBQWpCO0lBc0JBLEVBQUEsQ0FBRyxPQUFILEVBQVcsU0FBQTtRQUVQLEdBQUEsQ0FBSSxTQUFKLEVBQXNCLHlCQUF0QjtRQUNBLEdBQUEsQ0FBSSxVQUFKLEVBQXNCLHNCQUF0QjtRQUNBLEdBQUEsQ0FBSSxhQUFKLEVBQXNCLDRCQUF0QjtRQUNBLEdBQUEsQ0FBSSxjQUFKLEVBQXNCLHlCQUF0QjtRQUVBLEdBQUEsQ0FBSSxVQUFKLEVBQWUsa0dBQWY7UUFJQSxHQUFBLENBQUksV0FBSixFQUFnQixpR0FBaEI7ZUFJQSxHQUFBLENBQUksU0FBSixF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ZDtJQVVBLEVBQUEsQ0FBRyxRQUFILEVBQVksU0FBQTtlQUVSLEdBQUEsQ0FBSSxZQUFKLEVBQW9CLHNCQUFwQjtJQUZRLENBQVo7V0FVQSxFQUFBLENBQUcsUUFBSCxFQUFZLFNBQUE7UUFFUixHQUFBLENBQUksZUFBSixFQUlRLFFBSlI7UUFRQSxHQUFBLENBQUkscUJBQUosRUFLUSxRQUxSO1FBU0EsR0FBQSxDQUFJLG9CQUFKLEVBS1EsUUFMUjtRQVNBLEdBQUEsQ0FBSSxpREFBSixFQVFRLFlBUlI7UUFZQSxHQUFBLENBQUksNkVBQUosRUFRUSxlQVJSO1FBWUEsR0FBQSxDQUFJLGtGQUFKLEVBU1EsZUFUUjtRQWFBLEdBQUEsQ0FBSSx3RUFBSixFQVNRLGVBVFI7UUFhQSxHQUFBLENBQUksMkdBQUosRUFVUSxpQkFWUjtRQWNBLEdBQUEsQ0FBSSx3Q0FBSixFQU1RLHVDQU5SO1FBYUEsR0FBQSxDQUFJLGdIQUFKLEVBWVEsK0NBWlI7UUFnQkEsR0FBQSxDQUFJLHlGQUFKLEVBUVEsbUJBUlI7UUFZQSxHQUFBLENBQUkscUJBQUosRUFHUSxhQUhSO1FBT0EsR0FBQSxDQUFJLGdCQUFKLEVBR1EsYUFIUjtRQU9BLEdBQUEsQ0FBSSwwQkFBSixFQUlRLGFBSlI7ZUFRQSxHQUFBLENBQUksbUJBQUosRUFHUSxhQUhSO0lBM0pRLENBQVo7QUFqTWEsQ0FBakIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAgMDAwXG4wMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwMDAgICAgMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuIyMjXG5cbnsgY21wLCBldmwgfSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbmRlc2NyaWJlICdhcnJheScgLT5cblxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwXG4gICAgIyAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMFxuICAgICMgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwXG5cbiAgICBpdCAnaW5kZXgnIC0+XG5cbiAgICAgICAgY21wICdhWzFdJyAgICAgICAgICAgICdhWzFdJ1xuICAgICAgICBjbXAgJ2FbMV1bMl0nICAgICAgICAgJ2FbMV1bMl0nXG4gICAgICAgIGNtcCAnYVsxXVsyXScgICAgICAgICAnYVsxXVsyXSdcbiAgICAgICAgY21wICdbMSwyXVsxXScgICAgICAgICc7WzEsMl1bMV0nXG4gICAgICAgIGNtcCAne2E6MX1bXCJhXCJdJyAgICAgICd7YToxfVtcImFcIl0nXG5cbiAgICBpdCAnaW5kZXggc2xpY2UnIC0+XG5cbiAgICAgICAgY21wICdhWzAuLjFdJyAgICAgICAgICdhLnNsaWNlKDAsIDIpJ1xuICAgICAgICBjbXAgJ2FbMC4uLjFdJyAgICAgICAgJ2Euc2xpY2UoMCwgMSknXG4gICAgICAgIGNtcCAnYVstMV0nICAgICAgICAgICAnYS5zbGljZSgtMSlbMF0nXG4gICAgICAgIGNtcCAnYVstMl0nICAgICAgICAgICAnYS5zbGljZSgtMiwtMSlbMF0nXG4gICAgICAgIGNtcCAnYVstMTAwXScgICAgICAgICAnYS5zbGljZSgtMTAwLC05OSlbMF0nXG4gICAgICAgIFxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBibG9ja3NbLTFdLnRva2Vucy5wdXNoIGJsb2NrXG4gICAgICAgICAgICBibG9ja3MucHVzaCBibG9ja1xuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgYmxvY2tzLnNsaWNlKC0xKVswXS50b2tlbnMucHVzaChibG9jaylcbiAgICAgICAgICAgIGJsb2Nrcy5wdXNoKGJsb2NrKVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAgMDAwXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwXG5cbiAgICBpdCAncmFuZ2UnIC0+XG4gICAgICAgIFxuICAgICAgICBjbXAgJ1sxLi4xMF0nICAgICAgICAgJztbMSwyLDMsNCw1LDYsNyw4LDksMTBdJ1xuICAgICAgICBjbXAgJ1sxLi4uMTBdJyAgICAgICAgJztbMSwyLDMsNCw1LDYsNyw4LDldJ1xuICAgICAgICBjbXAgJ3IgPSBbMS4uMTBdJyAgICAgJ3IgPSBbMSwyLDMsNCw1LDYsNyw4LDksMTBdJ1xuICAgICAgICBjbXAgJ3IgPSBbMS4uLjEwXScgICAgJ3IgPSBbMSwyLDMsNCw1LDYsNyw4LDldJ1xuXG4gICAgICAgIGNtcCAnWzEuLjEwMF0nIFwiXG4gICAgICAgICAgICA7KGZ1bmN0aW9uKCkgeyB2YXIgciA9IFtdOyBmb3IgKHZhciBpID0gMTsgaSA8PSAxMDA7IGkrKyl7IHIucHVzaChpKTsgfSByZXR1cm4gcjsgfSkuYXBwbHkodGhpcylcbiAgICAgICAgICAgIFwiXG5cbiAgICAgICAgY21wICdbMS4uLjEwMF0nIFwiXG4gICAgICAgICAgICA7KGZ1bmN0aW9uKCkgeyB2YXIgciA9IFtdOyBmb3IgKHZhciBpID0gMTsgaSA8IDEwMDsgaSsrKXsgci5wdXNoKGkpOyB9IHJldHVybiByOyB9KS5hcHBseSh0aGlzKVxuICAgICAgICAgICAgXCJcbiAgICAgICAgICAgIFxuICAgICAgICBjbXAgJ1stMy4uM10nICc7Wy0zLC0yLC0xLDAsMSwyLDNdJ1xuXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBpdCAnc2xpY2UnIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgY21wIFwiYVsxLi40XVwiICAgICAgICAgICBcImEuc2xpY2UoMSwgNSlcIlxuICAgICAgICBjbXAgXCJhWzEuLi40XVwiICAgICAgICAgIFwiYS5zbGljZSgxLCA0KVwiXG4gICAgICAgIGNtcCBcImFbMS4uLmFdXCIgICAgICAgICAgXCJhLnNsaWNlKDEsIHR5cGVvZiBhID09PSAnbnVtYmVyJyA/IGEgOiAtMSlcIlxuICAgICAgICBjbXAgXCJhWzEuLmFdXCIgICAgICAgICAgIFwiYS5zbGljZSgxLCB0eXBlb2YgYSA9PT0gJ251bWJlcicgPyBhKzEgOiBJbmZpbml0eSlcIlxuICAgICAgICBjbXAgXCJhWzEuLmEuYl1cIiAgICAgICAgIFwiYS5zbGljZSgxLCB0eXBlb2YgYS5iID09PSAnbnVtYmVyJyA/IGEuYisxIDogSW5maW5pdHkpXCJcbiAgICAgICAgY21wIFwiYVsxLi5hWzJdXVwiICAgICAgICBcImEuc2xpY2UoMSwgdHlwZW9mIGFbMl0gPT09ICdudW1iZXInID8gYVsyXSsxIDogSW5maW5pdHkpXCJcbiAgICAgICAgY21wIFwiYVsxLi5hWzNdLmJdXCIgICAgICBcImEuc2xpY2UoMSwgdHlwZW9mIGFbM10uYiA9PT0gJ251bWJlcicgPyBhWzNdLmIrMSA6IEluZmluaXR5KVwiXG4gICAgICAgIFxuICAgICAgICBjbXAgXCJiW2MuLi4tMV1cIiAgICAgICAgIFwiYi5zbGljZShjLCAtMSlcIlxuICAgICAgICBjbXAgXCJiW2MuZC4uLi0xXVwiICAgICAgIFwiYi5zbGljZShjLmQsIC0xKVwiXG4gICAgICAgIGNtcCBcImJbY1swXS4uLi0xXVwiICAgICAgXCJiLnNsaWNlKGNbMF0sIC0xKVwiXG4gICAgICAgIGNtcCBcImJbY1swXS5kLi4tMV1cIiAgICAgXCJiLnNsaWNlKGNbMF0uZClcIlxuICAgICAgICBjbXAgXCJzW2krMS4uXVwiICAgICAgICAgIFwicy5zbGljZShpICsgMSlcIlxuICAgICAgICBjbXAgXCJzW2krMS4uLl1cIiAgICAgICAgIFwicy5zbGljZShpICsgMSwgLTEpXCJcbiAgICAgICAgXG4gICAgICAgIGNtcCBcIm9bMC4uLTFdXCIgICAgICAgICAgXCJvLnNsaWNlKDApXCIgIFxuICAgICAgICBjbXAgXCJxWy4uLTFdXCIgICAgICAgICAgIFwicS5zbGljZSgwKVwiIFxuICAgICAgICBjbXAgXCJwWzAuLl1cIiAgICAgICAgICAgIFwicC5zbGljZSgwKVwiXG4gICAgICAgIGNtcCBcInJbLi5dXCIgICAgICAgICAgICAgXCJyLnNsaWNlKDApXCJcbiAgICAgICAgXG4gICAgICAgIGNtcCBcInNbaWMuLi5jK2luZGV4XVwiICAgXCJzLnNsaWNlKGljLCBjICsgaW5kZXgpXCJcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBjbXAgXCJzWy4uLmldICsgc1tpKzEuLl1cIiBcInMuc2xpY2UoMCwgdHlwZW9mIGkgPT09ICdudW1iZXInID8gaSA6IC0xKSArIHMuc2xpY2UoaSArIDEpXCJcbiAgICAgICAgXG4gICAgICAgIGV2bCBcIidhYmMnWzAuLjFdXCIgICAgICAgXCJhYlwiXG4gICAgICAgIGV2bCBcIidhYmMnWzAuLjJdXCIgICAgICAgXCJhYmNcIlxuICAgICAgICBcbiAgICAgICAgZXZsIFwiJ3h5eidbMC4uXVwiICAgICAgICBcInh5elwiXG4gICAgICAgIGV2bCBcIid1dncnWzAuLi5dXCIgICAgICAgXCJ1dlwiICAgICAgICBcbiAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMCAwMDAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgICAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBpdCAnYXJyYXknIC0+XG5cbiAgICAgICAgY21wICdbMV0nICAgICAgICAgICAgICAgJztbMV0nXG4gICAgICAgIGNtcCAnWzEgMl0nICAgICAgICAgICAgICc7WzEsMl0nXG4gICAgICAgIGNtcCAnWzEsMl0nICAgICAgICAgICAgICc7WzEsMl0nXG4gICAgICAgIGNtcCAnW2EsYl0nICAgICAgICAgICAgICc7W2EsYl0nXG4gICAgICAgIGNtcCAnWyBcIjFcIiBdJyAgICAgICAgICAgJztbXCIxXCJdJ1xuICAgICAgICBjbXAgXCJbICcxJyBdXCIgICAgICAgICAgIFwiO1snMSddXCJcbiAgICAgICAgY21wICdbXCIxXCIgXCIyXCJdJyAgICAgICAgICc7W1wiMVwiLFwiMlwiXSdcbiAgICAgICAgY21wIFwiWycxJyAnMiddXCIgICAgICAgICBcIjtbJzEnLCcyJ11cIlxuICAgICAgICBjbXAgJ1tcIjFcIiAsIFwiMlwiXScgICAgICAgJztbXCIxXCIsXCIyXCJdJ1xuICAgICAgICBjbXAgXCJbJzEnICwgJzInXVwiICAgICAgIFwiO1snMScsJzInXVwiXG4gICAgICAgIGNtcCBcIltbJzEnXSAsIFsyXV1cIiAgICAgXCI7W1snMSddLFsyXV1cIlxuICAgICAgICBjbXAgJ1tbXV0nICAgICAgICAgICAgICAnO1tbXV0nXG4gICAgICAgIGNtcCAnW3t9XScgICAgICAgICAgICAgICc7W3t9XSdcbiAgICAgICAgY21wICdbW1tdXV0nICAgICAgICAgICAgJztbW1tdXV0nXG4gICAgICAgIGNtcCAnW1tbXSBbXV1dJyAgICAgICAgICc7W1tbXSxbXV1dJ1xuICAgICAgICBjbXAgJ1tbW10sW11dXScgICAgICAgICAnO1tbW10sW11dXSdcbiAgICAgICAgY21wICdbW1tdW11dXScgICAgICAgICAgJztbW1tdLFtdXV0nXG4gICAgICAgIGNtcCAnW1tbMV1dLCAxXScgICAgICAgICc7W1tbMV1dLDFdJ1xuICAgICAgICBjbXAgJ1tiKGMpXScgICAgICAgICAgICAnO1tiKGMpXSdcbiAgICAgICAgY21wICdbYiBjXScgICAgICAgICAgICAgJztbYihjKV0nXG4gICAgICAgIFxuICAgICAgICBjbXAgXCJbJzEnICwgYSwgdHJ1ZSwgZmFsc2UsIG51bGwsIHVuZGVmaW5lZF1cIixcbiAgICAgICAgICAgIFwiO1snMScsYSx0cnVlLGZhbHNlLG51bGwsdW5kZWZpbmVkXVwiXG4gICAgICAgICAgICBcbiAgICAgICAgY21wIFwiYSA9IFsxIDIgLSAzIHggNCArIDUgJ2EnIGIgJ2MnXVwiLCAgXG4gICAgICAgICAgICBcImEgPSBbMSwyIC0gMyx4KDQgKyA1LCdhJyxiKCdjJykpXVwiXG4gICAgICAgICAgICBcbiAgICAgICAgY21wIFwiXCJcIlsnMScgXCIyXCIgMyA0LjUgW10ge30gdHJ1ZSBmYWxzZSBudWxsIHVuZGVmaW5lZCBOYU4gSW5maW5pdHkgeWVzIG5vXVwiXCJcIixcbiAgICAgICAgICAgIFwiXCJcIjtbJzEnLFwiMlwiLDMsNC41LFtdLHt9LHRydWUsZmFsc2UsbnVsbCx1bmRlZmluZWQsTmFOLEluZmluaXR5LHRydWUsZmFsc2VdXCJcIlwiXG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgICAgICAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwICAgICAgICAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICAgICAgIDAwMCAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIGl0ICdvYmplY3RzJyAtPlxuICAgICAgICBcbiAgICAgICAgY21wICdbYTpiXScgICAgICAgICAgICAgJztbe2E6Yn1dJ1xuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBhID0gW3tcbiAgICAgICAgICAgICAgICAgICAgYToxXG4gICAgICAgICAgICAgICAgICAgIGI6MlxuICAgICAgICAgICAgICAgICAgICBjOjNcbiAgICAgICAgICAgICAgICB9e1xuICAgICAgICAgICAgICAgICAgICB4OjFcbiAgICAgICAgICAgICAgICAgICAgeToyXG4gICAgICAgICAgICAgICAgICAgIHo6M1xuICAgICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBhID0gW3thOjEsYjoyLGM6M30se3g6MSx5OjIsejozfV1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGEgPSBbXG4gICAgICAgICAgICAgICAgICAgIGE6NFxuICAgICAgICAgICAgICAgICAgICBiOjVcbiAgICAgICAgICAgICAgICAsXG4gICAgICAgICAgICAgICAgICAgIHg6NlxuICAgICAgICAgICAgICAgICAgICB5OjdcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBhID0gW3thOjQsYjo1fSx7eDo2LHk6N31dXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICBcbiAgICBpdCAnZnVuY3Rpb24nIC0+XG4gICAgICAgIFxuICAgICAgICBjbXAgJ1thIC0zXScgICAgJztbYSgtMyldJ1xuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAgMDAwMCAgMDAwICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICBcbiAgICBpdCAnYXNzaWduJyAtPlxuICAgICAgICBcbiAgICAgICAgY21wICdbbCwgcl0gPSBhJyAgICAnbCA9IGFbMF1cXG5yID0gYVsxXVxcbidcbiAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgXG4gICAgaXQgJ2Jsb2NrcycgLT5cblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgMSwyXG4gICAgICAgICAgICBdXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICA7WzEsMl1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAxLFxuICAgICAgICAgICAgICAgIDJcbiAgICAgICAgICAgIF1cbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIDtbMSwyXVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIDFcbiAgICAgICAgICAgICAgICAyXG4gICAgICAgICAgICBdXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICA7WzEsMl1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgICAgICAgICAgMVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAyXG4gICAgICAgICAgICBdXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICA7W1swLDFdLDJdXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBhID0gW1xuICAgICAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICAgICAgICAgICAgICAxXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgMlxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGEgPSBbWzAsMV0sMl1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGEgPVxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAgICAgMFxuICAgICAgICAgICAgICAgICAgICAgICAgMVxuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgIDJcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBhID0gW1swLDFdLDJdXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgYlxuICAgICAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICAgICAgICAgICAgICAxXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAyXG4gICAgICAgICAgICBdXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICA7W2IoWzAsMV0pLDJdXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBhXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICBiXG4gICAgICAgICAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDFcbiAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgMlxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGEoW2IoWzAsMV0pLDJdKVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgLT5cbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgIDFcbiAgICAgICAgICAgICAgICAgICAgMlxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIChmdW5jdGlvbiAoKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiBbMSwyXVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGwgPSBbXG4gICAgICAgICAgICAgICAgIDEgMiAzICdhJ1xuICAgICAgICAgICAgICAgICBjOlxuICAgICAgICAgICAgICAgICAgZDozXG4gICAgICAgICAgICAgICAgICBlOjRcbiAgICAgICAgICAgICAgICAgZjpcbiAgICAgICAgICAgICAgICAgICdiJ1xuICAgICAgICAgICAgICAgICAnYydcbiAgICAgICAgICAgICAgICAgbCA9XG4gICAgICAgICAgICAgICAgICAgIDFcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBsID0gWzEsMiwzLCdhJyx7Yzp7ZDozLGU6NH0sZjonYid9LCdjJyxsID0gMV1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGwgPSBbWyBbXG4gICAgICAgICAgICAgICAgICAgIFtbXG4gICAgICAgICAgICAgICAgICAgICAgMVxuICAgICAgICAgICAgICAgICAgICAgIDJcbiAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgIF1dICAgXVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgbCA9IFtbW1tbMSwyXV1dXV1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGwgPSBbWzFcbiAgICAgICAgICAgICAgICAgICAyXV1cbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGwgPSBbWzEsMl1dXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBsID0gW1sxXG4gICAgICAgICAgICAgIDJdXVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgbCA9IFtbMSwyXV1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGwgPSBbWzFcbiAgICAgICAgICAgICAgICAyXVxuICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgbCA9IFtbMSwyXV1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGwgPSBbWzEgMl1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBsID0gW1sxLDJdXVxuICAgICAgICAgICAgXCJcIlwiIl19
//# sourceURL=../../coffee/test/array.coffee