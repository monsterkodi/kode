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
        return cmp("f = ->\n    if 4\n        '42'", "\nf = function ()\n{\n    if (4)\n    {\n        return '42'\n    }\n}");
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
        cmp("((a) -> 1)", "(function (a)\n{\n    return 1\n})");
        cmp("l = a (i) -> 0", "l = a(function (i)\n{\n    return 0\n})");
        cmp("l = timer ((i) -> 1)", "l = timer((function (i)\n{\n    return 1\n}))");
        cmp("l = timer ((i) -> i), y", "l = timer((function (i)\n{\n    return i\n}),y)");
        return cmp("a.b c:2\nx = y", "a.b({c:2})\nx = y");
    });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdF9mdW5jLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsidGVzdF9mdW5jLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRQyxNQUFPLE9BQUEsQ0FBUSxjQUFSOztBQUVSLFFBQUEsQ0FBUyxNQUFULEVBQWdCLFNBQUE7SUFFWixFQUFBLENBQUcsTUFBSCxFQUFVLFNBQUE7UUFFTixHQUFBLENBQUksSUFBSixFQUF1QixpQkFBdkI7UUFDQSxHQUFBLENBQUksUUFBSixFQUF1QixrQkFBdkI7UUFDQSxHQUFBLENBQUksWUFBSixFQUF1Qix3QkFBdkI7UUFDQSxHQUFBLENBQUksY0FBSixFQUF1QiwyQkFBdkI7UUFFQSxHQUFBLENBQUksYUFBSixFQUVRLGlDQUZSO1FBU0EsR0FBQSxDQUFJLGtCQUFKLEVBSVEsd0NBSlI7UUFZQSxHQUFBLENBQUkseUJBQUosRUFJUSwrQ0FKUjtRQVlBLEdBQUEsQ0FBSSx5QkFBSixFQUlRLHdDQUpSO1FBWUEsR0FBQSxDQUFJLGtCQUFKLEVBRVEsOENBRlI7UUFVQSxHQUFBLENBQUksa0JBQUosRUFFUSw2Q0FGUjtRQVVBLEdBQUEsQ0FBSSxvQkFBSixFQUdRLDBFQUhSO1FBY0EsR0FBQSxDQUFJLDBDQUFKLEVBSVEsaUhBSlI7UUFrQkEsR0FBQSxDQUFJLG1DQUFKLEVBR1EsMEdBSFI7UUFnQkEsR0FBQSxDQUFJLCtCQUFKLEVBR1EseUZBSFI7UUFjQSxHQUFBLENBQUksc0JBQUosRUFHUSxrRkFIUjtRQWNBLEdBQUEsQ0FBSSxzQkFBSixFQUtRLDRDQUxSO1FBY0EsR0FBQSxDQUFJLDRDQUFKLEVBTVEsOEZBTlI7UUFtQkEsR0FBQSxDQUFJLHVCQUFKLEVBQThCLHNDQUE5QjtRQUVBLEdBQUEsQ0FBSSxrQkFBSixFQUVRLDBCQUZSO1FBU0EsR0FBQSxDQUFJLHFCQUFKLEVBR1EsNkJBSFI7UUFXQSxHQUFBLENBQUksT0FBSixFQUNJLHNDQURKO1FBUUEsR0FBQSxDQUFJLFlBQUosRUFDSSx1REFESjtlQVNBLEdBQUEsQ0FBSSxrQkFBSixFQUNJLGtFQURKO0lBNU5NLENBQVY7SUEyT0EsRUFBQSxDQUFHLFFBQUgsRUFBWSxTQUFBO1FBRVIsR0FBQSxDQUFJLDhCQUFKLEVBR1EsbUVBSFI7UUFjQSxHQUFBLENBQUksb0NBQUosRUFJUSw4RUFKUjtlQWVBLEdBQUEsQ0FBSSxnQ0FBSixFQUlRLHdFQUpSO0lBL0JRLENBQVo7V0FvREEsRUFBQSxDQUFHLE9BQUgsRUFBVyxTQUFBO1FBRVAsR0FBQSxDQUFJLE1BQUosRUFBc0IsTUFBdEI7UUFDQSxHQUFBLENBQUksUUFBSixFQUFzQixRQUF0QjtRQUNBLEdBQUEsQ0FBSSxlQUFKLEVBQXNCLGVBQXRCO1FBQ0EsR0FBQSxDQUFJLFNBQUosRUFBc0IsU0FBdEI7UUFDQSxHQUFBLENBQUksZUFBSixFQUFzQix5QkFBdEI7UUFDQSxHQUFBLENBQUkscURBQUosRUFDSSxxREFESjtRQUdBLEdBQUEsQ0FBSSxlQUFKLEVBRVEsaUJBRlI7UUFNQSxHQUFBLENBQUksa0JBQUosRUFHUSxvQkFIUjtRQVFBLEdBQUEsQ0FBSSx5RkFBSixFQVdRLG9DQVhSO1FBZUEsR0FBQSxDQUFJLDhCQUFKLEVBS1EsK0JBTFI7UUFZQSxHQUFBLENBQUksY0FBSixFQUdRLGtCQUhSO1FBUUEsR0FBQSxDQUFJLDBDQUFKLEVBT1Esa0JBUFI7UUFZQSxHQUFBLENBQUksa0NBQUosRUFPUSxnQkFQUjtRQVlBLEdBQUEsQ0FBSSxZQUFKLEVBQ0ksd0NBREo7UUFRQSxHQUFBLENBQUksZ0JBQUosRUFBcUIsOEJBQXJCO1FBRUEsR0FBQSxDQUFJLFlBQUosRUFFUSxvQ0FGUjtRQVNBLEdBQUEsQ0FBSSxnQkFBSixFQUVRLHlDQUZSO1FBU0EsR0FBQSxDQUFJLHNCQUFKLEVBRVEsK0NBRlI7UUFTQSxHQUFBLENBQUkseUJBQUosRUFFUSxpREFGUjtlQVNBLEdBQUEsQ0FBSSxnQkFBSixFQUdRLG1CQUhSO0lBaklPLENBQVg7QUFqU1ksQ0FBaEIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDBcbjAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwXG4wMDAwMDAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMFxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDBcbjAwMCAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDBcbiMjI1xuXG57Y21wfSA9IHJlcXVpcmUgJy4vdGVzdF91dGlscydcblxuZGVzY3JpYmUgJ2Z1bmMnIC0+XG5cbiAgICBpdCAnZnVuYycgLT5cblxuICAgICAgICBjbXAgJy0+JyAgICAgICAgICAgICAgICdmdW5jdGlvbiAoKVxcbnt9J1xuICAgICAgICBjbXAgJyhhKSAtPicgICAgICAgICAgICdmdW5jdGlvbiAoYSlcXG57fSdcbiAgICAgICAgY21wICcoYSxiLGMpIC0+JyAgICAgICAnZnVuY3Rpb24gKGEsIGIsIGMpXFxue30nXG4gICAgICAgIGNtcCAnYSA9IChhLGIpIC0+JyAgICAgJ1xcbmEgPSBmdW5jdGlvbiAoYSwgYilcXG57fSdcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICAtPiByZXR1cm4gMVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgZnVuY3Rpb24gKClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgLT5cbiAgICAgICAgICAgICAgICAxXG4gICAgICAgICAgICAgICAgMlxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgZnVuY3Rpb24gKClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAxXG4gICAgICAgICAgICAgICAgcmV0dXJuIDJcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIC0+XG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgICAgICAyXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBmdW5jdGlvbiAoKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICAgICAgcmV0dXJuIDJcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIC0+XG4gICAgICAgICAgICAgICAgMVxuICAgICAgICAgICAgICAgIHJldHVybiAyXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBmdW5jdGlvbiAoKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIDFcbiAgICAgICAgICAgICAgICByZXR1cm4gMlxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgYSA9IChhLGIsYykgLT4gZFxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBhID0gZnVuY3Rpb24gKGEsIGIsIGMpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGEueCA9ICh5LHopIC0+IHFcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgYS54ID0gZnVuY3Rpb24gKHksIHopXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHFcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGEgPSAtPlxuICAgICAgICAgICAgICAgIGIgPSAtPlxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBhID0gZnVuY3Rpb24gKClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB2YXIgYlxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGIgPSBmdW5jdGlvbiAoKVxuICAgICAgICAgICAgICAgIHt9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBhID0gKGIsYykgLT5cbiAgICAgICAgICAgICAgICBiID0gKGUsIGYpIC0+IGdcbiAgICAgICAgICAgICAgICBiXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGEgPSBmdW5jdGlvbiAoYiwgYylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB2YXIgYlxuXG4gICAgICAgICAgICAgICAgYiA9IGZ1bmN0aW9uIChlLCBmKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGEgPSAoYixjKSAtPlxuICAgICAgICAgICAgICAgIGIgPSAoZSwgZikgLT4gaFxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBhID0gZnVuY3Rpb24gKGIsIGMpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmFyIGJcblxuICAgICAgICAgICAgICAgIHJldHVybiBiID0gZnVuY3Rpb24gKGUsIGYpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGEgPSAoYixjKSAtPlxuICAgICAgICAgICAgICAgIChlLCBmKSAtPiBqXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGEgPSBmdW5jdGlvbiAoYiwgYylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGUsIGYpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4galxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGYgPSAtPlxuICAgICAgICAgICAgICAgIChhKSAtPiAxXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGYgPSBmdW5jdGlvbiAoKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoYSlcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgYSA9IC0+XG4gICAgICAgICAgICAgICAgJ2EnXG4gICAgICAgICAgICAxXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgYSA9IGZ1bmN0aW9uICgpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICdhJ1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgMVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgYSA9IC0+XG4gICAgICAgICAgICAgICAgbG9nICdhJ1xuXG4gICAgICAgICAgICBiID0gLT5cbiAgICAgICAgICAgICAgICBsb2cgJ2InXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGEgPSBmdW5jdGlvbiAoKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdhJylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgYiA9IGZ1bmN0aW9uICgpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2InKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiYSA9ICggYSwgYj0xIGM9MiApIC0+XCIsICBcIlxcbmEgPSBmdW5jdGlvbiAoYSwgYiA9IDEsIGMgPSAyKVxcbnt9XCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBpZiAxIHRoZW4gcmV0dXJuXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBpZiAoMSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGlmIHggdGhlbiByZXR1cm5cbiAgICAgICAgICAgIGFcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGlmICh4KVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiLT4gQGFcIixcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgZnVuY3Rpb24gKClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5hXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCIoQGEpIC0+IEBhXCIsXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGZ1bmN0aW9uIChhKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRoaXMuYSA9IGFcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5hXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCIoQGEsYSkgLT4gbG9nIEBhXCIsXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGZ1bmN0aW9uIChhMSwgYSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aGlzLmEgPSBhMVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMuYSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwIDAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuXG4gICAgaXQgJ3JldHVybicgLT5cblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBmID0gPT5cbiAgICAgICAgICAgICAgICBpZiAyIHRoZW4gcmV0dXJuXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGYgPSBmdW5jdGlvbiAoKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlmICgyKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgZiA9IC0+XG4gICAgICAgICAgICAgICAgaWYgM1xuICAgICAgICAgICAgICAgICAgICBsb2cgJzQyJ1xuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBmID0gZnVuY3Rpb24gKClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZiAoMylcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCc0MicpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBcbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgZiA9IC0+XG4gICAgICAgICAgICAgICAgaWYgNFxuICAgICAgICAgICAgICAgICAgICAnNDInXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGYgPSBmdW5jdGlvbiAoKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlmICg0KVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICc0MidcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwICAgICAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwICAgICAgMDAwICAgICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAgIDAwMDAwMDBcblxuICAgIGl0ICdjYWxscycgLT5cblxuICAgICAgICBjbXAgJ2EoYiknICAgICAgICAgICAgJ2EoYiknXG4gICAgICAgIGNtcCAnYShiLGMpJyAgICAgICAgICAnYShiLGMpJ1xuICAgICAgICBjbXAgJ2EoMSxudWxsLFwiMlwiKScgICAnYSgxLG51bGwsXCIyXCIpJ1xuICAgICAgICBjbXAgJ2FbMV0oYiknICAgICAgICAgJ2FbMV0oYiknXG4gICAgICAgIGNtcCBcImYgJ2InLCAoYSkgLT5cIiAgIFwiZignYicsZnVuY3Rpb24gKGEpXFxue30pXCJcbiAgICAgICAgY21wIFwiYSgnMScgMiAzLjQgdHJ1ZSBmYWxzZSBudWxsIHVuZGVmaW5lZCBOYU4gSW5maW5pdHkpXCIsXG4gICAgICAgICAgICBcImEoJzEnLDIsMy40LHRydWUsZmFsc2UsbnVsbCx1bmRlZmluZWQsTmFOLEluZmluaXR5KVwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgYSBiOmNbMV0sIGQ6MlxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgYSh7YjpjWzFdLGQ6Mn0pXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBhIGI6Y1syXSwgZDozXG4gICAgICAgICAgICA0XG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBhKHtiOmNbMl0sZDozfSlcbiAgICAgICAgICAgIDRcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGEoXG4gICAgICAgICAgICAgICAgJzEnXG4gICAgICAgICAgICAgICAgMlxuICAgICAgICAgICAgICAgIDMuNFxuICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgIG51bGxcbiAgICAgICAgICAgICAgICAgICAgdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgYSgnMScsMiwzLjQsdHJ1ZSxbbnVsbCx1bmRlZmluZWRdKVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgYSAnMSdcbiAgICAgICAgICAgIGIgIDJcbiAgICAgICAgICAgIGMgIDMuNFxuICAgICAgICAgICAgZCAgdHJ1ZVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgYSgnMScpXG4gICAgICAgICAgICBiKDIpXG4gICAgICAgICAgICBjKDMuNClcbiAgICAgICAgICAgIGQodHJ1ZSlcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGEgYiAxXG4gICAgICAgICAgICBjIGQgMlxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgYShiKDEpKVxuICAgICAgICAgICAgYyhkKDIpKVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgYVxuICAgICAgICAgICAgICAgIGJcbiAgICAgICAgICAgICAgICAgICAgM1xuICAgICAgICAgICAgY1xuICAgICAgICAgICAgICAgIGRcbiAgICAgICAgICAgICAgICAgICAgNFxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgYShiKDMpKVxuICAgICAgICAgICAgYyhkKDQpKVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgYVxuICAgICAgICAgICAgICAgIGJcbiAgICAgICAgICAgICAgICAxXG4gICAgICAgICAgICBjXG4gICAgICAgICAgICAgICAgZFxuICAgICAgICAgICAgICAgIDJcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGEoYiwxKVxuICAgICAgICAgICAgYyhkLDIpXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJhICdiJyAtPiBjXCIsXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGEoJ2InLGZ1bmN0aW9uICgpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgJ2wgPSBwYXQubWFwIC0+JyAnbCA9IHBhdC5tYXAoZnVuY3Rpb24gKClcXG57fSknXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgKChhKSAtPiAxKVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgKGZ1bmN0aW9uIChhKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgbCA9IGEgKGkpIC0+IDBcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGwgPSBhKGZ1bmN0aW9uIChpKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiAwXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgbCA9IHRpbWVyICgoaSkgLT4gMSlcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGwgPSB0aW1lcigoZnVuY3Rpb24gKGkpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgbCA9IHRpbWVyICgoaSkgLT4gaSksIHlcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGwgPSB0aW1lcigoZnVuY3Rpb24gKGkpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlcbiAgICAgICAgICAgIH0pLHkpXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBhLmIgYzoyXG4gICAgICAgICAgICB4ID0geVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgYS5iKHtjOjJ9KVxuICAgICAgICAgICAgeCA9IHlcbiAgICAgICAgICAgIFwiXCJcIlxuIl19
//# sourceURL=../coffee/test_func.coffee