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
        cmp("a = ->\n    b = ->", "a = function ()\n{\n    var b\n\n    return b = function ()\n    {}\n}");
        cmp("a = (b,c) ->\n    b = (e, f) -> g\n    b", "a = function (b, c)\n{\n    var b\n\n    b = function (e, f)\n    {\n        return g\n    }\n    return b\n}");
        cmp("a = (b,c) ->\n    b = (e, f) -> h", "a = function (b, c)\n{\n    var b\n\n    return b = function (e, f)\n    {\n        return h\n    }\n}");
        cmp("a = (b,c) ->\n    (e, f) -> j", "a = function (b, c)\n{\n    return function (e, f)\n    {\n        return j\n    }\n}");
        cmp("f = ->\n    (a) -> 1", "f = function ()\n{\n    return function (a)\n    {\n        return 1\n    }\n}");
        cmp("a = ->\n    'a'\n1", "a = function ()\n{\n    return 'a'\n}\n1");
        cmp("a = ->\n    log 'a'\n\nb = ->\n    log 'b'", "a = function ()\n{\n    console.log('a')\n}\nb = function ()\n{\n    console.log('b')\n}");
        cmp("a = ( a, b=1 c=2 ) ->", "a = function (a, b = 1, c = 2)\n{}");
        cmp("if true then return", "if (true)\n{\n    return\n}");
        return cmp("if x then return\na", "if (x)\n{\n    return\n}\na");
    });
    it('return', function() {});
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdF9mdW5jLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsidGVzdF9mdW5jLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRQyxNQUFPLE9BQUEsQ0FBUSxjQUFSOztBQUVSLFFBQUEsQ0FBUyxNQUFULEVBQWdCLFNBQUE7SUFFWixFQUFBLENBQUcsTUFBSCxFQUFVLFNBQUE7UUFFTixHQUFBLENBQUksSUFBSixFQUF1QixpQkFBdkI7UUFDQSxHQUFBLENBQUksUUFBSixFQUF1QixrQkFBdkI7UUFDQSxHQUFBLENBQUksWUFBSixFQUF1Qix3QkFBdkI7UUFDQSxHQUFBLENBQUksZ0JBQUosRUFBdUIsNEJBQXZCO1FBRUEsR0FBQSxDQUFJLGFBQUosRUFFUSxpQ0FGUjtRQVNBLEdBQUEsQ0FBSSxrQkFBSixFQUlRLHdDQUpSO1FBWUEsR0FBQSxDQUFJLHlCQUFKLEVBSVEsK0NBSlI7UUFZQSxHQUFBLENBQUkseUJBQUosRUFJUSx3Q0FKUjtRQVlBLEdBQUEsQ0FBSSxrQkFBSixFQUVRLDRDQUZSO1FBU0EsR0FBQSxDQUFJLGtCQUFKLEVBRVEsMkNBRlI7UUFTQSxHQUFBLENBQUksb0JBQUosRUFHUSx3RUFIUjtRQWFBLEdBQUEsQ0FBSSwwQ0FBSixFQUlRLCtHQUpSO1FBaUJBLEdBQUEsQ0FBSSxtQ0FBSixFQUdRLHdHQUhSO1FBZUEsR0FBQSxDQUFJLCtCQUFKLEVBR1EsdUZBSFI7UUFhQSxHQUFBLENBQUksc0JBQUosRUFHUSxnRkFIUjtRQWFBLEdBQUEsQ0FBSSxvQkFBSixFQUlRLDBDQUpSO1FBWUEsR0FBQSxDQUFJLDRDQUFKLEVBTVEsMEZBTlI7UUFpQkEsR0FBQSxDQUFJLHVCQUFKLEVBQThCLG9DQUE5QjtRQUVBLEdBQUEsQ0FBSSxxQkFBSixFQUVRLDZCQUZSO2VBU0EsR0FBQSxDQUFJLHFCQUFKLEVBR1EsNkJBSFI7SUFyTE0sQ0FBVjtJQXNNQSxFQUFBLENBQUcsUUFBSCxFQUFZLFNBQUEsR0FBQSxDQUFaO1dBaURBLEVBQUEsQ0FBRyxPQUFILEVBQVcsU0FBQTtRQUVQLEdBQUEsQ0FBSSxNQUFKLEVBQXNCLE1BQXRCO1FBQ0EsR0FBQSxDQUFJLFFBQUosRUFBc0IsUUFBdEI7UUFDQSxHQUFBLENBQUksZUFBSixFQUFzQixlQUF0QjtRQUNBLEdBQUEsQ0FBSSxTQUFKLEVBQXNCLFNBQXRCO1FBQ0EsR0FBQSxDQUFJLGVBQUosRUFBc0IseUJBQXRCO1FBQ0EsR0FBQSxDQUFJLHFEQUFKLEVBQ0kscURBREo7UUFHQSxHQUFBLENBQUksZUFBSixFQUVRLGlCQUZSO1FBTUEsR0FBQSxDQUFJLGtCQUFKLEVBR1Esb0JBSFI7UUFRQSxHQUFBLENBQUkseUZBQUosRUFXUSxvQ0FYUjtRQWVBLEdBQUEsQ0FBSSw4QkFBSixFQUtRLCtCQUxSO1FBWUEsR0FBQSxDQUFJLGNBQUosRUFHUSxrQkFIUjtRQVFBLEdBQUEsQ0FBSSwwQ0FBSixFQU9RLGtCQVBSO1FBWUEsR0FBQSxDQUFJLGtDQUFKLEVBT1EsZ0JBUFI7UUFZQSxHQUFBLENBQUksWUFBSixFQUNJLHdDQURKO1FBUUEsR0FBQSxDQUFJLGdCQUFKLEVBQXFCLDhCQUFyQjtRQUVBLEdBQUEsQ0FBSSxZQUFKLEVBRVEsb0NBRlI7UUFTQSxHQUFBLENBQUksZ0JBQUosRUFFUSx5Q0FGUjtRQVNBLEdBQUEsQ0FBSSxzQkFBSixFQUVRLCtDQUZSO1FBU0EsR0FBQSxDQUFJLHlCQUFKLEVBRVEsaURBRlI7ZUFTQSxHQUFBLENBQUksZ0JBQUosRUFHUSxtQkFIUjtJQWpJTyxDQUFYO0FBelBZLENBQWhCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMFxuMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDBcbjAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwXG4wMDAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwXG4jIyNcblxue2NtcH0gPSByZXF1aXJlICcuL3Rlc3RfdXRpbHMnXG5cbmRlc2NyaWJlICdmdW5jJyAtPlxuXG4gICAgaXQgJ2Z1bmMnIC0+XG5cbiAgICAgICAgY21wICctPicgICAgICAgICAgICAgICAnZnVuY3Rpb24gKClcXG57fSdcbiAgICAgICAgY21wICcoYSkgLT4nICAgICAgICAgICAnZnVuY3Rpb24gKGEpXFxue30nXG4gICAgICAgIGNtcCAnKGEsYixjKSAtPicgICAgICAgJ2Z1bmN0aW9uIChhLCBiLCBjKVxcbnt9J1xuICAgICAgICBjbXAgJ2EgPSAoYSxiLGMpIC0+JyAgICdhID0gZnVuY3Rpb24gKGEsIGIsIGMpXFxue30nXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgLT4gcmV0dXJuIDFcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGZ1bmN0aW9uICgpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIC0+XG4gICAgICAgICAgICAgICAgMVxuICAgICAgICAgICAgICAgIDJcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGZ1bmN0aW9uICgpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgMVxuICAgICAgICAgICAgICAgIHJldHVybiAyXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICAtPlxuICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICAgICAgMlxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgZnVuY3Rpb24gKClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgICAgIHJldHVybiAyXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICAtPlxuICAgICAgICAgICAgICAgIDFcbiAgICAgICAgICAgICAgICByZXR1cm4gMlxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgZnVuY3Rpb24gKClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAxXG4gICAgICAgICAgICAgICAgcmV0dXJuIDJcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGEgPSAoYSxiLGMpIC0+IGRcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGEgPSBmdW5jdGlvbiAoYSwgYiwgYylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgYS54ID0gKHkseikgLT4gcVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgYS54ID0gZnVuY3Rpb24gKHksIHopXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHFcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGEgPSAtPlxuICAgICAgICAgICAgICAgIGIgPSAtPlxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgYSA9IGZ1bmN0aW9uICgpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmFyIGJcblxuICAgICAgICAgICAgICAgIHJldHVybiBiID0gZnVuY3Rpb24gKClcbiAgICAgICAgICAgICAgICB7fVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgYSA9IChiLGMpIC0+XG4gICAgICAgICAgICAgICAgYiA9IChlLCBmKSAtPiBnXG4gICAgICAgICAgICAgICAgYlxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgYSA9IGZ1bmN0aW9uIChiLCBjKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZhciBiXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBiID0gZnVuY3Rpb24gKGUsIGYpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gYlxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgYSA9IChiLGMpIC0+XG4gICAgICAgICAgICAgICAgYiA9IChlLCBmKSAtPiBoXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBhID0gZnVuY3Rpb24gKGIsIGMpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmFyIGJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJldHVybiBiID0gZnVuY3Rpb24gKGUsIGYpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGEgPSAoYixjKSAtPlxuICAgICAgICAgICAgICAgIChlLCBmKSAtPiBqXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBhID0gZnVuY3Rpb24gKGIsIGMpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChlLCBmKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGpcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBmID0gLT5cbiAgICAgICAgICAgICAgICAoYSkgLT4gMVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgZiA9IGZ1bmN0aW9uICgpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChhKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBhID0gLT5cbiAgICAgICAgICAgICAgICAnYSdcbiAgICAgICAgICAgIDFcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGEgPSBmdW5jdGlvbiAoKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiAnYSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIDFcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGEgPSAtPlxuICAgICAgICAgICAgICAgIGxvZyAnYSdcblxuICAgICAgICAgICAgYiA9IC0+XG4gICAgICAgICAgICAgICAgbG9nICdiJ1xuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgYSA9IGZ1bmN0aW9uICgpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2EnKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYiA9IGZ1bmN0aW9uICgpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2InKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiYSA9ICggYSwgYj0xIGM9MiApIC0+XCIsICBcImEgPSBmdW5jdGlvbiAoYSwgYiA9IDEsIGMgPSAyKVxcbnt9XCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBpZiB0cnVlIHRoZW4gcmV0dXJuXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBpZiAodHJ1ZSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGlmIHggdGhlbiByZXR1cm5cbiAgICAgICAgICAgIGFcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGlmICh4KVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAgMCAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG5cbiAgICBpdCAncmV0dXJuJyAtPlxuXG4gICAgICAgICMgY21wIFwiXCJcIlxuICAgICAgICAgICAgIyBmID0gPT5cbiAgICAgICAgICAgICAgICAjIGlmIHRydWUgdGhlbiByZXR1cm5cbiAgICAgICAgICAgICMgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgIyBmID0gZnVuY3Rpb24gKClcbiAgICAgICAgICAgICMge1xuICAgICAgICAgICAgICAgICMgaWYgKHRydWUpXG4gICAgICAgICAgICAgICAgIyB7XG4gICAgICAgICAgICAgICAgICAgICMgcmV0dXJuXG4gICAgICAgICAgICAgICAgIyB9XG4gICAgICAgICAgICAjIH1cbiAgICAgICAgICAgICMgXCJcIlwiXG5cbiAgICAgICAgIyBjbXAgXCJcIlwiXG4gICAgICAgICAgICAjIGYgPSAtPlxuICAgICAgICAgICAgICAgICMgaWYgeWVzXG4gICAgICAgICAgICAgICAgICAgICMgJzQyJ1xuICAgICAgICAgICAgIyBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICAjIGYgPSBmdW5jdGlvbiAoKVxuICAgICAgICAgICAgIyB7XG4gICAgICAgICAgICAgICAgIyBpZiAodHJ1ZSlcbiAgICAgICAgICAgICAgICAjIHtcbiAgICAgICAgICAgICAgICAgICAgIyByZXR1cm4gJzQyJ1xuICAgICAgICAgICAgICAgICMgfVxuICAgICAgICAgICAgIyB9XG4gICAgICAgICAgICAjIFwiXCJcIlxuXG4gICAgICAgICMgY21wIFwiXCJcIlxuICAgICAgICAgICAgIyBmID0gLT5cbiAgICAgICAgICAgICAgICAjIGlmIHllc1xuICAgICAgICAgICAgICAgICAgICAjIGxvZyAnNDInXG4gICAgICAgICAgICAjIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgICMgZiA9IGZ1bmN0aW9uICgpXG4gICAgICAgICAgICAjIHtcbiAgICAgICAgICAgICAgICAjIGlmICh0cnVlKVxuICAgICAgICAgICAgICAgICMge1xuICAgICAgICAgICAgICAgICAgICAjIGNvbnNvbGUubG9nICc0MidcbiAgICAgICAgICAgICAgICAjIH1cbiAgICAgICAgICAgICMgfVxuICAgICAgICAgICAgIyBcIlwiXCJcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwICAgICAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwICAgICAgMDAwICAgICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAgIDAwMDAwMDBcblxuICAgIGl0ICdjYWxscycgLT5cblxuICAgICAgICBjbXAgJ2EoYiknICAgICAgICAgICAgJ2EoYiknXG4gICAgICAgIGNtcCAnYShiLGMpJyAgICAgICAgICAnYShiLGMpJ1xuICAgICAgICBjbXAgJ2EoMSxudWxsLFwiMlwiKScgICAnYSgxLG51bGwsXCIyXCIpJ1xuICAgICAgICBjbXAgJ2FbMV0oYiknICAgICAgICAgJ2FbMV0oYiknXG4gICAgICAgIGNtcCBcImYgJ2InLCAoYSkgLT5cIiAgIFwiZignYicsZnVuY3Rpb24gKGEpXFxue30pXCJcbiAgICAgICAgY21wIFwiYSgnMScgMiAzLjQgdHJ1ZSBmYWxzZSBudWxsIHVuZGVmaW5lZCBOYU4gSW5maW5pdHkpXCIsXG4gICAgICAgICAgICBcImEoJzEnLDIsMy40LHRydWUsZmFsc2UsbnVsbCx1bmRlZmluZWQsTmFOLEluZmluaXR5KVwiXG5cbiAgICAgICAgY21wIFwiXCJcIiAgICAgICAgICAgIFxuICAgICAgICAgICAgYSBiOmNbMV0sIGQ6MlxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgYSh7YjpjWzFdLGQ6Mn0pXG4gICAgICAgICAgICBcIlwiXCIgICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICBjbXAgXCJcIlwiICAgICAgICAgICAgXG4gICAgICAgICAgICBhIGI6Y1syXSwgZDozXG4gICAgICAgICAgICA0XG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBhKHtiOmNbMl0sZDozfSlcbiAgICAgICAgICAgIDRcbiAgICAgICAgICAgIFwiXCJcIiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGEoXG4gICAgICAgICAgICAgICAgJzEnXG4gICAgICAgICAgICAgICAgMlxuICAgICAgICAgICAgICAgIDMuNFxuICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgIG51bGxcbiAgICAgICAgICAgICAgICAgICAgdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgYSgnMScsMiwzLjQsdHJ1ZSxbbnVsbCx1bmRlZmluZWRdKVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIFxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBhICcxJ1xuICAgICAgICAgICAgYiAgMlxuICAgICAgICAgICAgYyAgMy40XG4gICAgICAgICAgICBkICB0cnVlXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBhKCcxJylcbiAgICAgICAgICAgIGIoMilcbiAgICAgICAgICAgIGMoMy40KVxuICAgICAgICAgICAgZCh0cnVlKVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgYSBiIDFcbiAgICAgICAgICAgIGMgZCAyXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBhKGIoMSkpXG4gICAgICAgICAgICBjKGQoMikpXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBhXG4gICAgICAgICAgICAgICAgYlxuICAgICAgICAgICAgICAgICAgICAzXG4gICAgICAgICAgICBjXG4gICAgICAgICAgICAgICAgZFxuICAgICAgICAgICAgICAgICAgICA0XG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBhKGIoMykpXG4gICAgICAgICAgICBjKGQoNCkpXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBhXG4gICAgICAgICAgICAgICAgYlxuICAgICAgICAgICAgICAgIDFcbiAgICAgICAgICAgIGNcbiAgICAgICAgICAgICAgICBkXG4gICAgICAgICAgICAgICAgMlxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgYShiLDEpXG4gICAgICAgICAgICBjKGQsMilcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcImEgJ2InIC0+IGNcIixcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgYSgnYicsZnVuY3Rpb24gKClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCAnbCA9IHBhdC5tYXAgLT4nICdsID0gcGF0Lm1hcChmdW5jdGlvbiAoKVxcbnt9KSdcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICAoKGEpIC0+IDEpXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICAoZnVuY3Rpb24gKGEpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBsID0gYSAoaSkgLT4gMFxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgbCA9IGEoZnVuY3Rpb24gKGkpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDBcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBsID0gdGltZXIgKChpKSAtPiAxKVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgbCA9IHRpbWVyKChmdW5jdGlvbiAoaSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBsID0gdGltZXIgKChpKSAtPiBpKSwgeVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgbCA9IHRpbWVyKChmdW5jdGlvbiAoaSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaVxuICAgICAgICAgICAgfSkseSlcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGEuYiBjOjJcbiAgICAgICAgICAgIHggPSB5XG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBhLmIoe2M6Mn0pXG4gICAgICAgICAgICB4ID0geVxuICAgICAgICAgICAgXCJcIlwiXG4iXX0=
//# sourceURL=../coffee/test_func.coffee