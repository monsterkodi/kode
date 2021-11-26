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
        cmp('a = (a,b,c) ->', 'a = function (a, b, c)\n{}');
        cmp("-> return 1", "function ()\n{\n    return 1\n}");
        cmp("->\n    1\n    2", "function ()\n{\n    1\n    return 2\n}");
        cmp("->\n    return 1\n    2", "function ()\n{\n    return 1\n    return 2\n}");
        cmp("->\n    1\n    return 2", "function ()\n{\n    1\n    return 2\n}");
        cmp("a = (a,b,c) -> d", "a = function (a, b, c)\n{\n    return d\n}");
        cmp("a.x = (y,z) -> q", "a.x = function (y, z)\n{\n    return q\n}");
        cmp("a = ->\n    b = ->", "a = function ()\n{\n    return b = function ()\n    {}\n}");
        cmp("a = (b,c) ->\n    b = (e, f) -> g\n    b", "a = function (b, c)\n{\n    b = function (e, f)\n    {\n        return g\n    }\n    return b\n}");
        cmp("a = (b,c) ->\n    b = (e, f) -> h", "a = function (b, c)\n{\n    return b = function (e, f)\n    {\n        return h\n    }\n}");
        cmp("a = (b,c) ->\n    (e, f) -> j", "a = function (b, c)\n{\n    return function (e, f)\n    {\n        return j\n    }\n}");
        cmp("f = ->\n    (a) -> 1", "f = function ()\n{\n    return function (a)\n    {\n        return 1\n    }\n}");
        cmp("a = ->\n    'a'\n1", "a = function ()\n{\n    return 'a'\n}\n1");
        cmp("a = ->\n    log 'a'\n\nb = ->\n    log 'b'", "a = function ()\n{\n    return console.log('a')\n}\nb = function ()\n{\n    return console.log('b')\n}");
        return cmp("a = ( a, b=1 c=2 ) ->", "a = function (a, b = 1, c = 2)\n{}");
    });
    return it('calls', function() {
        cmp('a(b)', 'a(b)');
        cmp('a(b,c)', 'a(b,c)');
        cmp('a(1,null,"2")', 'a(1,null,"2")');
        cmp('a[1](b)', 'a[1](b)');
        cmp("f 'b', (a) ->", "f('b',function (a)\n{})");
        cmp("a('1' 2 3.4 true false null undefined NaN Infinity)", "a('1',2,3.4,true,false,null,undefined,NaN,Infinity)");
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
        return cmp("l = timer ((i) -> i), y", "l = timer((function (i)\n{\n    return i\n}),y)");
    });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdF9mdW5jLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsidGVzdF9mdW5jLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRQyxNQUFPLE9BQUEsQ0FBUSxjQUFSOztBQUVSLFFBQUEsQ0FBUyxNQUFULEVBQWdCLFNBQUE7SUFFWixFQUFBLENBQUcsTUFBSCxFQUFVLFNBQUE7UUFFTixHQUFBLENBQUksSUFBSixFQUF1QixpQkFBdkI7UUFDQSxHQUFBLENBQUksUUFBSixFQUF1QixrQkFBdkI7UUFDQSxHQUFBLENBQUksWUFBSixFQUF1Qix3QkFBdkI7UUFDQSxHQUFBLENBQUksZ0JBQUosRUFBdUIsNEJBQXZCO1FBRUEsR0FBQSxDQUFJLGFBQUosRUFFUSxpQ0FGUjtRQVNBLEdBQUEsQ0FBSSxrQkFBSixFQUlRLHdDQUpSO1FBWUEsR0FBQSxDQUFJLHlCQUFKLEVBSVEsK0NBSlI7UUFZQSxHQUFBLENBQUkseUJBQUosRUFJUSx3Q0FKUjtRQVlBLEdBQUEsQ0FBSSxrQkFBSixFQUVRLDRDQUZSO1FBU0EsR0FBQSxDQUFJLGtCQUFKLEVBRVEsMkNBRlI7UUFTQSxHQUFBLENBQUksb0JBQUosRUFHUSwyREFIUjtRQVdBLEdBQUEsQ0FBSSwwQ0FBSixFQUlRLGtHQUpSO1FBZUEsR0FBQSxDQUFJLG1DQUFKLEVBR1EsMkZBSFI7UUFhQSxHQUFBLENBQUksK0JBQUosRUFHUSx1RkFIUjtRQWFBLEdBQUEsQ0FBSSxzQkFBSixFQUdRLGdGQUhSO1FBYUEsR0FBQSxDQUFJLG9CQUFKLEVBSVEsMENBSlI7UUFZQSxHQUFBLENBQUksNENBQUosRUFNUSx3R0FOUjtlQWlCQSxHQUFBLENBQUksdUJBQUosRUFBOEIsb0NBQTlCO0lBcEtNLENBQVY7V0E0S0EsRUFBQSxDQUFHLE9BQUgsRUFBVyxTQUFBO1FBRVAsR0FBQSxDQUFJLE1BQUosRUFBc0IsTUFBdEI7UUFDQSxHQUFBLENBQUksUUFBSixFQUFzQixRQUF0QjtRQUNBLEdBQUEsQ0FBSSxlQUFKLEVBQXNCLGVBQXRCO1FBQ0EsR0FBQSxDQUFJLFNBQUosRUFBc0IsU0FBdEI7UUFDQSxHQUFBLENBQUksZUFBSixFQUFzQix5QkFBdEI7UUFDQSxHQUFBLENBQUkscURBQUosRUFDSSxxREFESjtRQUdBLEdBQUEsQ0FBSSx5RkFBSixFQVdRLG9DQVhSO1FBZUEsR0FBQSxDQUFJLDhCQUFKLEVBS1EsK0JBTFI7UUFZQSxHQUFBLENBQUksY0FBSixFQUdRLGtCQUhSO1FBUUEsR0FBQSxDQUFJLDBDQUFKLEVBT1Esa0JBUFI7UUFZQSxHQUFBLENBQUksa0NBQUosRUFPUSxnQkFQUjtRQVlBLEdBQUEsQ0FBSSxZQUFKLEVBQ0ksd0NBREo7UUFRQSxHQUFBLENBQUksZ0JBQUosRUFBcUIsOEJBQXJCO1FBRUEsR0FBQSxDQUFJLFlBQUosRUFFUSxvQ0FGUjtRQVNBLEdBQUEsQ0FBSSxnQkFBSixFQUVRLHlDQUZSO1FBU0EsR0FBQSxDQUFJLHNCQUFKLEVBRVEsK0NBRlI7ZUFTQSxHQUFBLENBQUkseUJBQUosRUFFUSxpREFGUjtJQTFHTyxDQUFYO0FBOUtZLENBQWhCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMFxuMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDBcbjAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwXG4wMDAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwXG4jIyNcblxue2NtcH0gPSByZXF1aXJlICcuL3Rlc3RfdXRpbHMnXG5cbmRlc2NyaWJlICdmdW5jJyAtPlxuXG4gICAgaXQgJ2Z1bmMnIC0+XG5cbiAgICAgICAgY21wICctPicgICAgICAgICAgICAgICAnZnVuY3Rpb24gKClcXG57fSdcbiAgICAgICAgY21wICcoYSkgLT4nICAgICAgICAgICAnZnVuY3Rpb24gKGEpXFxue30nXG4gICAgICAgIGNtcCAnKGEsYixjKSAtPicgICAgICAgJ2Z1bmN0aW9uIChhLCBiLCBjKVxcbnt9J1xuICAgICAgICBjbXAgJ2EgPSAoYSxiLGMpIC0+JyAgICdhID0gZnVuY3Rpb24gKGEsIGIsIGMpXFxue30nXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgLT4gcmV0dXJuIDFcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGZ1bmN0aW9uICgpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIC0+XG4gICAgICAgICAgICAgICAgMVxuICAgICAgICAgICAgICAgIDJcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGZ1bmN0aW9uICgpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgMVxuICAgICAgICAgICAgICAgIHJldHVybiAyXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICAtPlxuICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICAgICAgMlxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgZnVuY3Rpb24gKClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgICAgIHJldHVybiAyXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICAtPlxuICAgICAgICAgICAgICAgIDFcbiAgICAgICAgICAgICAgICByZXR1cm4gMlxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgZnVuY3Rpb24gKClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAxXG4gICAgICAgICAgICAgICAgcmV0dXJuIDJcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGEgPSAoYSxiLGMpIC0+IGRcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGEgPSBmdW5jdGlvbiAoYSwgYiwgYylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgYS54ID0gKHkseikgLT4gcVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgYS54ID0gZnVuY3Rpb24gKHksIHopXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHFcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGEgPSAtPlxuICAgICAgICAgICAgICAgIGIgPSAtPlxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgYSA9IGZ1bmN0aW9uICgpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGIgPSBmdW5jdGlvbiAoKVxuICAgICAgICAgICAgICAgIHt9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIFxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBhID0gKGIsYykgLT5cbiAgICAgICAgICAgICAgICBiID0gKGUsIGYpIC0+IGdcbiAgICAgICAgICAgICAgICBiXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBhID0gZnVuY3Rpb24gKGIsIGMpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYiA9IGZ1bmN0aW9uIChlLCBmKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGEgPSAoYixjKSAtPlxuICAgICAgICAgICAgICAgIGIgPSAoZSwgZikgLT4gaFxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgYSA9IGZ1bmN0aW9uIChiLCBjKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiBiID0gZnVuY3Rpb24gKGUsIGYpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGEgPSAoYixjKSAtPlxuICAgICAgICAgICAgICAgIChlLCBmKSAtPiBqXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBhID0gZnVuY3Rpb24gKGIsIGMpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChlLCBmKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGpcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBmID0gLT5cbiAgICAgICAgICAgICAgICAoYSkgLT4gMVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgZiA9IGZ1bmN0aW9uICgpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChhKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBhID0gLT5cbiAgICAgICAgICAgICAgICAnYSdcbiAgICAgICAgICAgIDFcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGEgPSBmdW5jdGlvbiAoKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiAnYSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIDFcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGEgPSAtPlxuICAgICAgICAgICAgICAgIGxvZyAnYSdcblxuICAgICAgICAgICAgYiA9IC0+XG4gICAgICAgICAgICAgICAgbG9nICdiJ1xuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgYSA9IGZ1bmN0aW9uICgpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUubG9nKCdhJylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGIgPSBmdW5jdGlvbiAoKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb25zb2xlLmxvZygnYicpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIFxuICAgICAgICBjbXAgXCJhID0gKCBhLCBiPTEgYz0yICkgLT5cIiwgIFwiYSA9IGZ1bmN0aW9uIChhLCBiID0gMSwgYyA9IDIpXFxue31cIiAgICAgICAgICAgIFxuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAgICAgICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAgICAgICAwMDAgICAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgICAgIDAwMFxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMCAgMDAwMDAwMFxuXG4gICAgaXQgJ2NhbGxzJyAtPlxuXG4gICAgICAgIGNtcCAnYShiKScgICAgICAgICAgICAnYShiKSdcbiAgICAgICAgY21wICdhKGIsYyknICAgICAgICAgICdhKGIsYyknXG4gICAgICAgIGNtcCAnYSgxLG51bGwsXCIyXCIpJyAgICdhKDEsbnVsbCxcIjJcIiknXG4gICAgICAgIGNtcCAnYVsxXShiKScgICAgICAgICAnYVsxXShiKSdcbiAgICAgICAgY21wIFwiZiAnYicsIChhKSAtPlwiICAgXCJmKCdiJyxmdW5jdGlvbiAoYSlcXG57fSlcIlxuICAgICAgICBjbXAgXCJhKCcxJyAyIDMuNCB0cnVlIGZhbHNlIG51bGwgdW5kZWZpbmVkIE5hTiBJbmZpbml0eSlcIixcbiAgICAgICAgICAgIFwiYSgnMScsMiwzLjQsdHJ1ZSxmYWxzZSxudWxsLHVuZGVmaW5lZCxOYU4sSW5maW5pdHkpXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBhKFxuICAgICAgICAgICAgICAgICcxJ1xuICAgICAgICAgICAgICAgIDJcbiAgICAgICAgICAgICAgICAzLjRcbiAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICBudWxsXG4gICAgICAgICAgICAgICAgICAgIHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGEoJzEnLDIsMy40LHRydWUsW251bGwsdW5kZWZpbmVkXSlcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGEgJzEnXG4gICAgICAgICAgICBiICAyXG4gICAgICAgICAgICBjICAzLjRcbiAgICAgICAgICAgIGQgIHRydWVcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGEoJzEnKVxuICAgICAgICAgICAgYigyKVxuICAgICAgICAgICAgYygzLjQpXG4gICAgICAgICAgICBkKHRydWUpXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBhIGIgMVxuICAgICAgICAgICAgYyBkIDJcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGEoYigxKSlcbiAgICAgICAgICAgIGMoZCgyKSlcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGFcbiAgICAgICAgICAgICAgICBiXG4gICAgICAgICAgICAgICAgICAgIDNcbiAgICAgICAgICAgIGNcbiAgICAgICAgICAgICAgICBkXG4gICAgICAgICAgICAgICAgICAgIDRcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGEoYigzKSlcbiAgICAgICAgICAgIGMoZCg0KSlcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGFcbiAgICAgICAgICAgICAgICBiXG4gICAgICAgICAgICAgICAgMVxuICAgICAgICAgICAgY1xuICAgICAgICAgICAgICAgIGRcbiAgICAgICAgICAgICAgICAyXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBhKGIsMSlcbiAgICAgICAgICAgIGMoZCwyKVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiYSAnYicgLT4gY1wiLFxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBhKCdiJyxmdW5jdGlvbiAoKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiBjXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wICdsID0gcGF0Lm1hcCAtPicgJ2wgPSBwYXQubWFwKGZ1bmN0aW9uICgpXFxue30pJ1xuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgICgoYSkgLT4gMSlcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIChmdW5jdGlvbiAoYSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGwgPSBhIChpKSAtPiAwXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBsID0gYShmdW5jdGlvbiAoaSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGwgPSB0aW1lciAoKGkpIC0+IDEpXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBsID0gdGltZXIoKGZ1bmN0aW9uIChpKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICB9KSlcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGwgPSB0aW1lciAoKGkpIC0+IGkpLCB5XG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBsID0gdGltZXIoKGZ1bmN0aW9uIChpKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiBpXG4gICAgICAgICAgICB9KSx5KVxuICAgICAgICAgICAgXCJcIlwiXG4iXX0=
//# sourceURL=../coffee/test_func.coffee