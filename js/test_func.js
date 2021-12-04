// koffee 1.20.0

/*
00000000  000   000  000   000   0000000
000       000   000  0000  000  000
000000    000   000  000 0 000  000
000       000   000  000  0000  000
000        0000000   000   000   0000000
 */
var cmp;

cmp = require('./test_utils').cmp;

describe('func', function() {
    it('func', function() {
        cmp('->', 'function ()\n{}');
        cmp('(a) ->', 'function (a)\n{}');
        cmp('(a,b,c) ->', 'function (a, b, c)\n{}');
        cmp('a = (a,b) ->', '\na = function (a, b)\n{}');
        cmp("-> return 1", "function ()\n{\n    return 1\n}");
        cmp("->\n    1\n    2", "function ()\n{\n    1\n    return 2\n}");
        cmp("->\n    return 1\n    2", "function ()\n{\n    return 1\n    return 2\n}");
        cmp("->\n    1\n    return 2", "function ()\n{\n    1\n    return 2\n}");
        cmp("a = (a,b,c) -> d", "\na = function (a, b, c)\n{\n    return d\n}");
        cmp("a.x = (y,z) -> q", "\na.x = function (y, z)\n{\n    return q\n}");
        cmp("a = ->\n    b = ->", "\na = function ()\n{\n    var b\n\n    return b = function ()\n    {}\n}");
        cmp("a = (b,c) ->\n    b = (e, f) -> g\n    b", "\na = function (b, c)\n{\n    var b\n\n    b = function (e, f)\n    {\n        return g\n    }\n    return b\n}");
        cmp("a = (b,c) ->\n    b = (e, f) -> h", "\na = function (b, c)\n{\n    var b\n\n    return b = function (e, f)\n    {\n        return h\n    }\n}");
        cmp("a = (b,c) ->\n    (e, f) -> j", "\na = function (b, c)\n{\n    return function (e, f)\n    {\n        return j\n    }\n}");
        cmp("f = ->\n    (a) -> 1", "\nf = function ()\n{\n    return function (a)\n    {\n        return 1\n    }\n}");
        cmp("a = ->\n    'a'\n1\n", "\na = function ()\n{\n    return 'a'\n}\n1");
        cmp("a = ->\n    log 'a'\n\nb = ->\n    log 'b'", "\na = function ()\n{\n    console.log('a')\n}\n\nb = function ()\n{\n    console.log('b')\n}");
        cmp("a = ( a, b=1 c=2 ) ->", "\na = function (a, b = 1, c = 2)\n{}");
        cmp("if 1 then return", "if (1)\n{\n    return\n}");
        cmp("if x then return\na", "if (x)\n{\n    return\n}\na");
        cmp("-> @a", "function ()\n{\n    return this.a\n}");
        cmp("(@a) -> @a", "function (a)\n{\n    this.a = a\n    return this.a\n}");
        return cmp("(@a,a) -> log @a", "function (a1, a)\n{\n    this.a = a1\n    console.log(this.a)\n}");
    });
    it('return', function() {
        cmp("f = =>\n    if 2 then return", "\nf = function ()\n{\n    if (2)\n    {\n        return\n    }\n}");
        cmp("f = ->\n    if 3\n        log '42'", "\nf = function ()\n{\n    if (3)\n    {\n        console.log('42')\n    }\n}");
        cmp("f = ->\n    if 4\n        '42'", "\nf = function ()\n{\n    if (4)\n    {\n        return '42'\n    }\n}");
        return cmp("-> \n    if 1 then h \n    else if 2\n        if 3 then j else k\n    else l", "function ()\n{\n    if (1)\n    {\n        return h\n    }\n    else if (2)\n    {\n        if (3)\n        {\n            return j\n        }\n        else\n        {\n            return k\n        }\n    }\n    else\n    {\n        return l\n    }\n}");
    });
    return it('calls', function() {
        cmp('a(b)', 'a(b)');
        cmp('a(b,c)', 'a(b,c)');
        cmp('a(1,null,"2")', 'a(1,null,"2")');
        cmp('a[1](b)', 'a[1](b)');
        cmp("f 'b', (a) ->", "f('b',function (a)\n{})");
        cmp("a('1' 2 3.4 true false null undefined NaN Infinity)", "a('1',2,3.4,true,false,null,undefined,NaN,Infinity)");
        cmp("a b:c[1], d:2", "a({b:c[1],d:2})");
        cmp("a b:c[2], d:3\n4", "a({b:c[2],d:3})\n4");
        cmp("a(\n    '1'\n    2\n    3.4\n    true\n    [\n        null\n        undefined\n    ]\n)", "a('1',2,3.4,true,[null,undefined])");
        cmp("a '1'\nb  2\nc  3.4\nd  true", "a('1')\nb(2)\nc(3.4)\nd(true)");
        cmp("a b 1\nc d 2", "a(b(1))\nc(d(2))");
        cmp("a\n    b\n        3\nc\n    d\n        4", "a(b(3))\nc(d(4))");
        cmp("a\n    b\n    1\nc\n    d\n    2", "a(b,1)\nc(d,2)");
        cmp("a 'b' -> c", "a('b',function ()\n{\n    return c\n})");
        cmp('l = pat.map ->', 'l = pat.map(function ()\n{})');
        cmp("((a) -> 1)", ";(function (a)\n{\n    return 1\n})");
        cmp("l = a (i) -> 0", "l = a(function (i)\n{\n    return 0\n})");
        cmp("l = timer ((i) -> 1)", "l = timer((function (i)\n{\n    return 1\n}))");
        cmp("l = timer ((i) -> i), y", "l = timer((function (i)\n{\n    return i\n}),y)");
        cmp("a.b c:2\nx = y", "a.b({c:2})\nx = y");
        cmp("a = (-> 1)()", "a = (function ()\n{\n    return 1\n})()");
        return cmp("a = (-> \n    1)()", "a = (function ()\n{\n    return 1\n})()");
    });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdF9mdW5jLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsidGVzdF9mdW5jLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRQyxNQUFPLE9BQUEsQ0FBUSxjQUFSOztBQUVSLFFBQUEsQ0FBUyxNQUFULEVBQWdCLFNBQUE7SUFFWixFQUFBLENBQUcsTUFBSCxFQUFVLFNBQUE7UUFFTixHQUFBLENBQUksSUFBSixFQUF1QixpQkFBdkI7UUFDQSxHQUFBLENBQUksUUFBSixFQUF1QixrQkFBdkI7UUFDQSxHQUFBLENBQUksWUFBSixFQUF1Qix3QkFBdkI7UUFDQSxHQUFBLENBQUksY0FBSixFQUF1QiwyQkFBdkI7UUFFQSxHQUFBLENBQUksYUFBSixFQUVRLGlDQUZSO1FBU0EsR0FBQSxDQUFJLGtCQUFKLEVBSVEsd0NBSlI7UUFZQSxHQUFBLENBQUkseUJBQUosRUFJUSwrQ0FKUjtRQVlBLEdBQUEsQ0FBSSx5QkFBSixFQUlRLHdDQUpSO1FBWUEsR0FBQSxDQUFJLGtCQUFKLEVBRVEsOENBRlI7UUFVQSxHQUFBLENBQUksa0JBQUosRUFFUSw2Q0FGUjtRQVVBLEdBQUEsQ0FBSSxvQkFBSixFQUdRLDBFQUhSO1FBY0EsR0FBQSxDQUFJLDBDQUFKLEVBSVEsaUhBSlI7UUFrQkEsR0FBQSxDQUFJLG1DQUFKLEVBR1EsMEdBSFI7UUFnQkEsR0FBQSxDQUFJLCtCQUFKLEVBR1EseUZBSFI7UUFjQSxHQUFBLENBQUksc0JBQUosRUFHUSxrRkFIUjtRQWNBLEdBQUEsQ0FBSSxzQkFBSixFQUtRLDRDQUxSO1FBY0EsR0FBQSxDQUFJLDRDQUFKLEVBTVEsOEZBTlI7UUFtQkEsR0FBQSxDQUFJLHVCQUFKLEVBQThCLHNDQUE5QjtRQUVBLEdBQUEsQ0FBSSxrQkFBSixFQUVRLDBCQUZSO1FBU0EsR0FBQSxDQUFJLHFCQUFKLEVBR1EsNkJBSFI7UUFXQSxHQUFBLENBQUksT0FBSixFQUNJLHNDQURKO1FBUUEsR0FBQSxDQUFJLFlBQUosRUFDSSx1REFESjtlQVNBLEdBQUEsQ0FBSSxrQkFBSixFQUNJLGtFQURKO0lBNU5NLENBQVY7SUEyT0EsRUFBQSxDQUFHLFFBQUgsRUFBWSxTQUFBO1FBRVIsR0FBQSxDQUFJLDhCQUFKLEVBR1EsbUVBSFI7UUFjQSxHQUFBLENBQUksb0NBQUosRUFJUSw4RUFKUjtRQWVBLEdBQUEsQ0FBSSxnQ0FBSixFQUlRLHdFQUpSO2VBZUEsR0FBQSxDQUFJLDhFQUFKLEVBTVEsOFBBTlI7SUE5Q1EsQ0FBWjtXQW1GQSxFQUFBLENBQUcsT0FBSCxFQUFXLFNBQUE7UUFFUCxHQUFBLENBQUksTUFBSixFQUFzQixNQUF0QjtRQUNBLEdBQUEsQ0FBSSxRQUFKLEVBQXNCLFFBQXRCO1FBQ0EsR0FBQSxDQUFJLGVBQUosRUFBc0IsZUFBdEI7UUFDQSxHQUFBLENBQUksU0FBSixFQUFzQixTQUF0QjtRQUNBLEdBQUEsQ0FBSSxlQUFKLEVBQXNCLHlCQUF0QjtRQUNBLEdBQUEsQ0FBSSxxREFBSixFQUNJLHFEQURKO1FBR0EsR0FBQSxDQUFJLGVBQUosRUFFUSxpQkFGUjtRQU1BLEdBQUEsQ0FBSSxrQkFBSixFQUdRLG9CQUhSO1FBUUEsR0FBQSxDQUFJLHlGQUFKLEVBV1Esb0NBWFI7UUFlQSxHQUFBLENBQUksOEJBQUosRUFLUSwrQkFMUjtRQVlBLEdBQUEsQ0FBSSxjQUFKLEVBR1Esa0JBSFI7UUFRQSxHQUFBLENBQUksMENBQUosRUFPUSxrQkFQUjtRQVlBLEdBQUEsQ0FBSSxrQ0FBSixFQU9RLGdCQVBSO1FBWUEsR0FBQSxDQUFJLFlBQUosRUFDSSx3Q0FESjtRQVFBLEdBQUEsQ0FBSSxnQkFBSixFQUFxQiw4QkFBckI7UUFFQSxHQUFBLENBQUksWUFBSixFQUVRLHFDQUZSO1FBU0EsR0FBQSxDQUFJLGdCQUFKLEVBRVEseUNBRlI7UUFTQSxHQUFBLENBQUksc0JBQUosRUFFUSwrQ0FGUjtRQVNBLEdBQUEsQ0FBSSx5QkFBSixFQUVRLGlEQUZSO1FBU0EsR0FBQSxDQUFJLGdCQUFKLEVBR1EsbUJBSFI7UUFRQSxHQUFBLENBQUksY0FBSixFQUNJLHlDQURKO2VBUUEsR0FBQSxDQUFJLG9CQUFKLEVBR1EseUNBSFI7SUFqSk8sQ0FBWDtBQWhVWSxDQUFoQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMFxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDBcbjAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMFxuMDAwICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMFxuIyMjXG5cbntjbXB9ID0gcmVxdWlyZSAnLi90ZXN0X3V0aWxzJ1xuXG5kZXNjcmliZSAnZnVuYycgLT5cblxuICAgIGl0ICdmdW5jJyAtPlxuXG4gICAgICAgIGNtcCAnLT4nICAgICAgICAgICAgICAgJ2Z1bmN0aW9uICgpXFxue30nXG4gICAgICAgIGNtcCAnKGEpIC0+JyAgICAgICAgICAgJ2Z1bmN0aW9uIChhKVxcbnt9J1xuICAgICAgICBjbXAgJyhhLGIsYykgLT4nICAgICAgICdmdW5jdGlvbiAoYSwgYiwgYylcXG57fSdcbiAgICAgICAgY21wICdhID0gKGEsYikgLT4nICAgICAnXFxuYSA9IGZ1bmN0aW9uIChhLCBiKVxcbnt9J1xuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIC0+IHJldHVybiAxXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBmdW5jdGlvbiAoKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICAtPlxuICAgICAgICAgICAgICAgIDFcbiAgICAgICAgICAgICAgICAyXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBmdW5jdGlvbiAoKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIDFcbiAgICAgICAgICAgICAgICByZXR1cm4gMlxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgLT5cbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgICAgIDJcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGZ1bmN0aW9uICgpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgICAgICByZXR1cm4gMlxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgLT5cbiAgICAgICAgICAgICAgICAxXG4gICAgICAgICAgICAgICAgcmV0dXJuIDJcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGZ1bmN0aW9uICgpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgMVxuICAgICAgICAgICAgICAgIHJldHVybiAyXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBhID0gKGEsYixjKSAtPiBkXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGEgPSBmdW5jdGlvbiAoYSwgYiwgYylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgYS54ID0gKHkseikgLT4gcVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBhLnggPSBmdW5jdGlvbiAoeSwgeilcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgYSA9IC0+XG4gICAgICAgICAgICAgICAgYiA9IC0+XG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGEgPSBmdW5jdGlvbiAoKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZhciBiXG5cbiAgICAgICAgICAgICAgICByZXR1cm4gYiA9IGZ1bmN0aW9uICgpXG4gICAgICAgICAgICAgICAge31cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGEgPSAoYixjKSAtPlxuICAgICAgICAgICAgICAgIGIgPSAoZSwgZikgLT4gZ1xuICAgICAgICAgICAgICAgIGJcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgYSA9IGZ1bmN0aW9uIChiLCBjKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZhciBiXG5cbiAgICAgICAgICAgICAgICBiID0gZnVuY3Rpb24gKGUsIGYpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gYlxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgYSA9IChiLGMpIC0+XG4gICAgICAgICAgICAgICAgYiA9IChlLCBmKSAtPiBoXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGEgPSBmdW5jdGlvbiAoYiwgYylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB2YXIgYlxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGIgPSBmdW5jdGlvbiAoZSwgZilcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBoXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgYSA9IChiLGMpIC0+XG4gICAgICAgICAgICAgICAgKGUsIGYpIC0+IGpcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgYSA9IGZ1bmN0aW9uIChiLCBjKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoZSwgZilcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBqXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgZiA9IC0+XG4gICAgICAgICAgICAgICAgKGEpIC0+IDFcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZiA9IGZ1bmN0aW9uICgpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChhKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBhID0gLT5cbiAgICAgICAgICAgICAgICAnYSdcbiAgICAgICAgICAgIDFcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBhID0gZnVuY3Rpb24gKClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2EnXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAxXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBhID0gLT5cbiAgICAgICAgICAgICAgICBsb2cgJ2EnXG5cbiAgICAgICAgICAgIGIgPSAtPlxuICAgICAgICAgICAgICAgIGxvZyAnYidcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgYSA9IGZ1bmN0aW9uICgpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2EnKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBiID0gZnVuY3Rpb24gKClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnYicpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJhID0gKCBhLCBiPTEgYz0yICkgLT5cIiwgIFwiXFxuYSA9IGZ1bmN0aW9uIChhLCBiID0gMSwgYyA9IDIpXFxue31cIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGlmIDEgdGhlbiByZXR1cm5cbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGlmICgxKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgaWYgeCB0aGVuIHJldHVyblxuICAgICAgICAgICAgYVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgaWYgKHgpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCItPiBAYVwiLFxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBmdW5jdGlvbiAoKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmFcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIihAYSkgLT4gQGFcIixcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgZnVuY3Rpb24gKGEpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhpcy5hID0gYVxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmFcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIihAYSxhKSAtPiBsb2cgQGFcIixcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgZnVuY3Rpb24gKGExLCBhKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRoaXMuYSA9IGExXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5hKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAgMCAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG5cbiAgICBpdCAncmV0dXJuJyAtPlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGYgPSA9PlxuICAgICAgICAgICAgICAgIGlmIDIgdGhlbiByZXR1cm5cbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZiA9IGZ1bmN0aW9uICgpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWYgKDIpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBmID0gLT5cbiAgICAgICAgICAgICAgICBpZiAzXG4gICAgICAgICAgICAgICAgICAgIGxvZyAnNDInXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGYgPSBmdW5jdGlvbiAoKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlmICgzKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJzQyJylcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIFxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBmID0gLT5cbiAgICAgICAgICAgICAgICBpZiA0XG4gICAgICAgICAgICAgICAgICAgICc0MidcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZiA9IGZ1bmN0aW9uICgpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWYgKDQpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJzQyJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIC0+IFxuICAgICAgICAgICAgICAgIGlmIDEgdGhlbiBoIFxuICAgICAgICAgICAgICAgIGVsc2UgaWYgMlxuICAgICAgICAgICAgICAgICAgICBpZiAzIHRoZW4gaiBlbHNlIGtcbiAgICAgICAgICAgICAgICBlbHNlIGxcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGZ1bmN0aW9uICgpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWYgKDEpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmICgyKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKDMpXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBqXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ga1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgICAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICAgICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAwMDAwICAwMDAwMDAwXG5cbiAgICBpdCAnY2FsbHMnIC0+XG5cbiAgICAgICAgY21wICdhKGIpJyAgICAgICAgICAgICdhKGIpJ1xuICAgICAgICBjbXAgJ2EoYixjKScgICAgICAgICAgJ2EoYixjKSdcbiAgICAgICAgY21wICdhKDEsbnVsbCxcIjJcIiknICAgJ2EoMSxudWxsLFwiMlwiKSdcbiAgICAgICAgY21wICdhWzFdKGIpJyAgICAgICAgICdhWzFdKGIpJ1xuICAgICAgICBjbXAgXCJmICdiJywgKGEpIC0+XCIgICBcImYoJ2InLGZ1bmN0aW9uIChhKVxcbnt9KVwiXG4gICAgICAgIGNtcCBcImEoJzEnIDIgMy40IHRydWUgZmFsc2UgbnVsbCB1bmRlZmluZWQgTmFOIEluZmluaXR5KVwiLFxuICAgICAgICAgICAgXCJhKCcxJywyLDMuNCx0cnVlLGZhbHNlLG51bGwsdW5kZWZpbmVkLE5hTixJbmZpbml0eSlcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGEgYjpjWzFdLCBkOjJcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGEoe2I6Y1sxXSxkOjJ9KVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgYSBiOmNbMl0sIGQ6M1xuICAgICAgICAgICAgNFxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgYSh7YjpjWzJdLGQ6M30pXG4gICAgICAgICAgICA0XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBhKFxuICAgICAgICAgICAgICAgICcxJ1xuICAgICAgICAgICAgICAgIDJcbiAgICAgICAgICAgICAgICAzLjRcbiAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICBudWxsXG4gICAgICAgICAgICAgICAgICAgIHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGEoJzEnLDIsMy40LHRydWUsW251bGwsdW5kZWZpbmVkXSlcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGEgJzEnXG4gICAgICAgICAgICBiICAyXG4gICAgICAgICAgICBjICAzLjRcbiAgICAgICAgICAgIGQgIHRydWVcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGEoJzEnKVxuICAgICAgICAgICAgYigyKVxuICAgICAgICAgICAgYygzLjQpXG4gICAgICAgICAgICBkKHRydWUpXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBhIGIgMVxuICAgICAgICAgICAgYyBkIDJcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGEoYigxKSlcbiAgICAgICAgICAgIGMoZCgyKSlcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGFcbiAgICAgICAgICAgICAgICBiXG4gICAgICAgICAgICAgICAgICAgIDNcbiAgICAgICAgICAgIGNcbiAgICAgICAgICAgICAgICBkXG4gICAgICAgICAgICAgICAgICAgIDRcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGEoYigzKSlcbiAgICAgICAgICAgIGMoZCg0KSlcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGFcbiAgICAgICAgICAgICAgICBiXG4gICAgICAgICAgICAgICAgMVxuICAgICAgICAgICAgY1xuICAgICAgICAgICAgICAgIGRcbiAgICAgICAgICAgICAgICAyXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBhKGIsMSlcbiAgICAgICAgICAgIGMoZCwyKVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiYSAnYicgLT4gY1wiLFxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBhKCdiJyxmdW5jdGlvbiAoKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiBjXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wICdsID0gcGF0Lm1hcCAtPicgJ2wgPSBwYXQubWFwKGZ1bmN0aW9uICgpXFxue30pJ1xuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgICgoYSkgLT4gMSlcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIDsoZnVuY3Rpb24gKGEpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBsID0gYSAoaSkgLT4gMFxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgbCA9IGEoZnVuY3Rpb24gKGkpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDBcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBsID0gdGltZXIgKChpKSAtPiAxKVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgbCA9IHRpbWVyKChmdW5jdGlvbiAoaSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBsID0gdGltZXIgKChpKSAtPiBpKSwgeVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgbCA9IHRpbWVyKChmdW5jdGlvbiAoaSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaVxuICAgICAgICAgICAgfSkseSlcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGEuYiBjOjJcbiAgICAgICAgICAgIHggPSB5XG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBhLmIoe2M6Mn0pXG4gICAgICAgICAgICB4ID0geVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBcbiAgICAgICAgY21wIFwiYSA9ICgtPiAxKSgpXCIsXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGEgPSAoZnVuY3Rpb24gKClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgfSkoKVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgYSA9ICgtPiBcbiAgICAgICAgICAgICAgICAxKSgpXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBhID0gKGZ1bmN0aW9uICgpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgIH0pKClcbiAgICAgICAgICAgIFwiXCJcIlxuIl19
//# sourceURL=../coffee/test_func.coffee