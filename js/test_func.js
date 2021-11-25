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
        cmp("->\n    1\n    2", "function ()\n{\n    1;\n    return 2\n}");
        cmp("->\n    return 1\n    2", "function ()\n{\n    return 1;\n    return 2\n}");
        cmp("->\n    1\n    return 2", "function ()\n{\n    1;\n    return 2\n}");
        cmp("a = (a,b,c) -> d", "a = function (a, b, c)\n{\n    return d\n}");
        cmp("a = (b,c) ->\n    b = (e, f) -> g", "a = function (b, c)\n{\n    return b = function (e, f)\n    {\n        return g\n    }\n}");
        cmp("a = (b,c) ->\n    (e, f) -> g", "a = function (b, c)\n{\n    return function (e, f)\n    {\n        return g\n    }\n}");
        return cmp("f = ->\n    (a) -> 1", "f = function ()\n{\n    return function (a)\n    {\n        return 1\n    }\n}");
    });
    return it('calls', function() {
        cmp('a(b)', 'a(b)');
        cmp('a(b,c)', 'a(b,c)');
        cmp('a(1,null,"2")', 'a(1,null,"2")');
        cmp('a[1](b)', 'a[1](b)');
        cmp("a('1' 2 3.4 true false null undefined NaN Infinity)", "a('1',2,3.4,true,false,null,undefined,NaN,Infinity)");
        cmp("a(\n    '1'\n    2\n    3.4\n    true\n    [\n        null\n        undefined\n    ]\n)", "a('1',2,3.4,true,[null,undefined])");
        cmp("a '1'\nb  2\nc  3.4\nd  true", "a('1')\nb(2)\nc(3.4)\nd(true)");
        cmp("a b 1\nc d 2", "a(b(1))\nc(d(2))");
        cmp("a\n    b\n        3\nc\n    d\n        4", "a(b(3))\nc(d(4))");
        cmp("a\n    b\n    1\nc\n    d\n    2", "a(b,1)\nc(d,2)");
        cmp("a 'b' -> c", "a('b',function ()\n{\n    return c\n})");
        return cmp('l = pat.map ->', 'l = pat.map(function ()\n{})');
    });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdF9mdW5jLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsidGVzdF9mdW5jLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRQyxNQUFPLE9BQUEsQ0FBUSxjQUFSOztBQUVSLFFBQUEsQ0FBUyxNQUFULEVBQWdCLFNBQUE7SUFFWixFQUFBLENBQUcsTUFBSCxFQUFVLFNBQUE7UUFFTixHQUFBLENBQUksSUFBSixFQUF1QixpQkFBdkI7UUFDQSxHQUFBLENBQUksUUFBSixFQUF1QixrQkFBdkI7UUFDQSxHQUFBLENBQUksWUFBSixFQUF1Qix3QkFBdkI7UUFDQSxHQUFBLENBQUksZ0JBQUosRUFBdUIsNEJBQXZCO1FBRUEsR0FBQSxDQUFJLGFBQUosRUFFUSxpQ0FGUjtRQVNBLEdBQUEsQ0FBSSxrQkFBSixFQUlRLHlDQUpSO1FBWUEsR0FBQSxDQUFJLHlCQUFKLEVBSVEsZ0RBSlI7UUFZQSxHQUFBLENBQUkseUJBQUosRUFJUSx5Q0FKUjtRQVlBLEdBQUEsQ0FBSSxrQkFBSixFQUVRLDRDQUZSO1FBU0EsR0FBQSxDQUFJLG1DQUFKLEVBR1EsMkZBSFI7UUFhQSxHQUFBLENBQUksK0JBQUosRUFHUSx1RkFIUjtlQWFBLEdBQUEsQ0FBSSxzQkFBSixFQUdRLGdGQUhSO0lBdkZNLENBQVY7V0EwR0EsRUFBQSxDQUFHLE9BQUgsRUFBVyxTQUFBO1FBRVAsR0FBQSxDQUFJLE1BQUosRUFBc0IsTUFBdEI7UUFDQSxHQUFBLENBQUksUUFBSixFQUFzQixRQUF0QjtRQUNBLEdBQUEsQ0FBSSxlQUFKLEVBQXNCLGVBQXRCO1FBQ0EsR0FBQSxDQUFJLFNBQUosRUFBc0IsU0FBdEI7UUFFQSxHQUFBLENBQUkscURBQUosRUFDSSxxREFESjtRQUdBLEdBQUEsQ0FBSSx5RkFBSixFQVdRLG9DQVhSO1FBZUEsR0FBQSxDQUFJLDhCQUFKLEVBS1EsK0JBTFI7UUFZQSxHQUFBLENBQUksY0FBSixFQUdRLGtCQUhSO1FBUUEsR0FBQSxDQUFJLDBDQUFKLEVBT1Esa0JBUFI7UUFZQSxHQUFBLENBQUksa0NBQUosRUFPUSxnQkFQUjtRQVlBLEdBQUEsQ0FBSSxZQUFKLEVBQ0ksd0NBREo7ZUFRQSxHQUFBLENBQUksZ0JBQUosRUFBcUIsOEJBQXJCO0lBN0VPLENBQVg7QUE1R1ksQ0FBaEIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDBcbjAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwXG4wMDAwMDAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMFxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDBcbjAwMCAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDBcbiMjI1xuXG57Y21wfSA9IHJlcXVpcmUgJy4vdGVzdF91dGlscydcblxuZGVzY3JpYmUgJ2Z1bmMnIC0+XG5cbiAgICBpdCAnZnVuYycgLT5cblxuICAgICAgICBjbXAgJy0+JyAgICAgICAgICAgICAgICdmdW5jdGlvbiAoKVxcbnt9J1xuICAgICAgICBjbXAgJyhhKSAtPicgICAgICAgICAgICdmdW5jdGlvbiAoYSlcXG57fSdcbiAgICAgICAgY21wICcoYSxiLGMpIC0+JyAgICAgICAnZnVuY3Rpb24gKGEsIGIsIGMpXFxue30nXG4gICAgICAgIGNtcCAnYSA9IChhLGIsYykgLT4nICAgJ2EgPSBmdW5jdGlvbiAoYSwgYiwgYylcXG57fSdcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICAtPiByZXR1cm4gMVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgZnVuY3Rpb24gKClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgLT5cbiAgICAgICAgICAgICAgICAxXG4gICAgICAgICAgICAgICAgMlxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgZnVuY3Rpb24gKClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAxO1xuICAgICAgICAgICAgICAgIHJldHVybiAyXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICAtPlxuICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICAgICAgMlxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgZnVuY3Rpb24gKClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgICAgICByZXR1cm4gMlxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgLT5cbiAgICAgICAgICAgICAgICAxXG4gICAgICAgICAgICAgICAgcmV0dXJuIDJcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGZ1bmN0aW9uICgpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgMTtcbiAgICAgICAgICAgICAgICByZXR1cm4gMlxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgYSA9IChhLGIsYykgLT4gZFxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgYSA9IGZ1bmN0aW9uIChhLCBiLCBjKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiBkXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBhID0gKGIsYykgLT5cbiAgICAgICAgICAgICAgICBiID0gKGUsIGYpIC0+IGdcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGEgPSBmdW5jdGlvbiAoYiwgYylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYiA9IGZ1bmN0aW9uIChlLCBmKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBhID0gKGIsYykgLT5cbiAgICAgICAgICAgICAgICAoZSwgZikgLT4gZ1xuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgYSA9IGZ1bmN0aW9uIChiLCBjKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoZSwgZilcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgZiA9IC0+XG4gICAgICAgICAgICAgICAgKGEpIC0+IDFcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGYgPSBmdW5jdGlvbiAoKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoYSlcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgICAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICAgICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAwMDAwICAwMDAwMDAwXG5cbiAgICBpdCAnY2FsbHMnIC0+XG5cbiAgICAgICAgY21wICdhKGIpJyAgICAgICAgICAgICdhKGIpJ1xuICAgICAgICBjbXAgJ2EoYixjKScgICAgICAgICAgJ2EoYixjKSdcbiAgICAgICAgY21wICdhKDEsbnVsbCxcIjJcIiknICAgJ2EoMSxudWxsLFwiMlwiKSdcbiAgICAgICAgY21wICdhWzFdKGIpJyAgICAgICAgICdhWzFdKGIpJ1xuXG4gICAgICAgIGNtcCBcImEoJzEnIDIgMy40IHRydWUgZmFsc2UgbnVsbCB1bmRlZmluZWQgTmFOIEluZmluaXR5KVwiLFxuICAgICAgICAgICAgXCJhKCcxJywyLDMuNCx0cnVlLGZhbHNlLG51bGwsdW5kZWZpbmVkLE5hTixJbmZpbml0eSlcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGEoXG4gICAgICAgICAgICAgICAgJzEnXG4gICAgICAgICAgICAgICAgMlxuICAgICAgICAgICAgICAgIDMuNFxuICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgIG51bGxcbiAgICAgICAgICAgICAgICAgICAgdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgYSgnMScsMiwzLjQsdHJ1ZSxbbnVsbCx1bmRlZmluZWRdKVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgYSAnMSdcbiAgICAgICAgICAgIGIgIDJcbiAgICAgICAgICAgIGMgIDMuNFxuICAgICAgICAgICAgZCAgdHJ1ZVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgYSgnMScpXG4gICAgICAgICAgICBiKDIpXG4gICAgICAgICAgICBjKDMuNClcbiAgICAgICAgICAgIGQodHJ1ZSlcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGEgYiAxXG4gICAgICAgICAgICBjIGQgMlxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgYShiKDEpKVxuICAgICAgICAgICAgYyhkKDIpKVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgYVxuICAgICAgICAgICAgICAgIGJcbiAgICAgICAgICAgICAgICAgICAgM1xuICAgICAgICAgICAgY1xuICAgICAgICAgICAgICAgIGRcbiAgICAgICAgICAgICAgICAgICAgNFxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgYShiKDMpKVxuICAgICAgICAgICAgYyhkKDQpKVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgYVxuICAgICAgICAgICAgICAgIGJcbiAgICAgICAgICAgICAgICAxXG4gICAgICAgICAgICBjXG4gICAgICAgICAgICAgICAgZFxuICAgICAgICAgICAgICAgIDJcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGEoYiwxKVxuICAgICAgICAgICAgYyhkLDIpXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJhICdiJyAtPiBjXCIsXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGEoJ2InLGZ1bmN0aW9uICgpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIFxuICAgICAgICBjbXAgJ2wgPSBwYXQubWFwIC0+JyAnbCA9IHBhdC5tYXAoZnVuY3Rpb24gKClcXG57fSknXG4gICAgICAgIFxuICAgICAgICAjIGNtcCAnbCA9IHBhdC5sLm1hcCAoKGkpIC0+IGkpLCB5JyxcbiAgICAgICAgICAgICMgXCJcIlwiXG4gICAgICAgICAgICAjIGwgPSBwYXQubWFwKGZ1bmN0aW9uIChpKVxuICAgICAgICAgICAgIyB7XG4gICAgICAgICAgICAgICAgIyByZXR1cm4gaVxuICAgICAgICAgICAgIyB9LCB5KSdcbiAgICAgICAgICAgICMgXCJcIlwiXG4gICAgICAgICAgICAiXX0=
//# sourceURL=../coffee/test_func.coffee