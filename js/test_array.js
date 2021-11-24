// koffee 1.20.0

/*
 0000000   00000000   00000000    0000000   000   000
000   000  000   000  000   000  000   000   000 000
000000000  0000000    0000000    000000000    00000
000   000  000   000  000   000  000   000     000
000   000  000   000  000   000  000   000     000
 */
var cmp;

cmp = require('./test_utils').cmp;

describe('array', function() {
    it('index', function() {
        cmp('a[1]', 'a[1]');
        cmp('a[1][2]', 'a[1][2]');
        cmp('a[1][2]', 'a[1][2]');
        cmp('[1,2][1]', '[1,2][1]');
        return cmp('{a:1}["a"]', '{a:1}["a"]');
    });
    it('index slice', function() {
        cmp('a[0..1]', 'a.slice(0, 1+1)');
        cmp('a[0...1]', 'a.slice(0, 1)');
        cmp('a[-1]', 'a.slice(-1)[0]');
        cmp('a[-2]', 'a.slice(-2,-1)[0]');
        return cmp('a[-100]', 'a.slice(-100,-99)[0]');
    });
    it('range', function() {
        cmp('[1..10]', '[1,2,3,4,5,6,7,8,9,10]');
        cmp('[1...10]', '[1,2,3,4,5,6,7,8,9]');
        cmp('r = [1..10]', 'r = [1,2,3,4,5,6,7,8,9,10]');
        cmp('r = [1...10]', 'r = [1,2,3,4,5,6,7,8,9]');
        cmp('[1..100]', "(function() { var r = []; for (var i = 1; i <= 100; i++){ r.push(i); } return r; }).apply(this)");
        return cmp('[1...100]', "(function() { var r = []; for (var i = 1; i < 100; i++){ r.push(i); } return r; }).apply(this)");
    });
    it('array', function() {
        cmp('[1]', '[1]');
        cmp('[1 2]', '[1,2]');
        cmp('[1,2]', '[1,2]');
        cmp('[a,b]', '[a,b]');
        cmp('[ "1" ]', '["1"]');
        cmp("[ '1' ]", "['1']");
        cmp('["1" "2"]', '["1","2"]');
        cmp("['1' '2']", "['1','2']");
        cmp('["1" , "2"]', '["1","2"]');
        cmp("['1' , '2']", "['1','2']");
        cmp('[[]]', '[[]]');
        cmp('[{}]', '[{}]');
        cmp('[[[]]]', '[[[]]]');
        cmp('[[[] []]]', '[[[],[]]]');
        cmp('[[[],[]]]', '[[[],[]]]');
        cmp('[[[][]]]', '[[[],[]]]');
        cmp("[['1'] , [2]]", "[['1'],[2]]");
        cmp("['1' , a, true, false, null, undefined]", "['1',a,true,false,null,undefined]");
        return cmp("['1' \"2\" 3 4.5 [] {} true false null undefined NaN Infinity yes no]", "['1',\"2\",3,4.5,[],{},true,false,null,undefined,NaN,Infinity,true,false]");
    });
    it('objects', function() {
        cmp('[a:b]', '[{a:b}]');
        cmp("a = [{\n        a:1\n        b:2\n        c:3\n    }{\n        x:1\n        y:2\n        z:3\n    }]", "a = [{a:1,b:2,c:3},{x:1,y:2,z:3}]");
        return cmp("a = [\n        a:4\n        b:5\n    ,\n        x:6\n        y:7\n    ]", "a = [{a:4,b:5},{x:6,y:7}]");
    });
    it('function', function() {
        return cmp('[a -3]', '[a(-3)]');
    });
    return it('array nl', function() {
        cmp("[\n    1,2\n]", "[1,2]");
        cmp("[\n    1,\n    2\n]", "[1,2]");
        cmp("[\n    1\n    2\n]", "[1,2]");
        cmp("[\n    [\n        0\n        1\n    ]\n    2\n]", "[[0,1],2]");
        cmp("a = [\n        [\n            0\n            1\n        ]\n        2\n    ]", "a = [[0,1],2]");
        cmp("a =\n    [\n        [\n            0\n            1\n        ]\n        2\n    ]", "a = [[0,1],2]");
        cmp("[\n    b\n        [\n            0\n            1\n        ]\n    2\n]", "[b([0,1]),2]");
        cmp("a\n    [\n        b\n            [\n                0\n                1\n            ]\n        2\n    ]", "a([b([0,1]),2])");
        cmp("->\n    [\n        1\n        2\n    ]", "function ()\n{\n    return [1,2]\n}");
        cmp("l = [\n     1 2 3 'a'\n     c:\n      d:3\n      e:4\n     f:\n      'b'\n     'c'\n     l =\n        1\n    ]", "l = [1,2,3,'a',{c:{d:3,e:4},f:'b','c',l = 1}]");
        cmp("l = [ [\n [\n   [\n     1\n     2\n    ]\n      ]\n   ]\n     ]", "l = [[[[1,2]]]]");
        cmp("l = [[1\n      2]]", "l = [[1,2]]");
        cmp("l = [[1\n 2]]", "l = [[1,2]]");
        cmp("l = [[1\n    2]\n     ]", "l = [[1,2]]");
        return cmp("l = [[1 2]\n    ]", "l = [[1,2]]");
    });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdF9hcnJheS5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbInRlc3RfYXJyYXkuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFDLE1BQU8sT0FBQSxDQUFRLGNBQVI7O0FBRVIsUUFBQSxDQUFTLE9BQVQsRUFBaUIsU0FBQTtJQVFiLEVBQUEsQ0FBRyxPQUFILEVBQVcsU0FBQTtRQUVQLEdBQUEsQ0FBSSxNQUFKLEVBQXNCLE1BQXRCO1FBQ0EsR0FBQSxDQUFJLFNBQUosRUFBc0IsU0FBdEI7UUFDQSxHQUFBLENBQUksU0FBSixFQUFzQixTQUF0QjtRQUNBLEdBQUEsQ0FBSSxVQUFKLEVBQXNCLFVBQXRCO2VBQ0EsR0FBQSxDQUFJLFlBQUosRUFBc0IsWUFBdEI7SUFOTyxDQUFYO0lBUUEsRUFBQSxDQUFHLGFBQUgsRUFBaUIsU0FBQTtRQUViLEdBQUEsQ0FBSSxTQUFKLEVBQXNCLGlCQUF0QjtRQUNBLEdBQUEsQ0FBSSxVQUFKLEVBQXNCLGVBQXRCO1FBQ0EsR0FBQSxDQUFJLE9BQUosRUFBc0IsZ0JBQXRCO1FBQ0EsR0FBQSxDQUFJLE9BQUosRUFBc0IsbUJBQXRCO2VBQ0EsR0FBQSxDQUFJLFNBQUosRUFBc0Isc0JBQXRCO0lBTmEsQ0FBakI7SUFjQSxFQUFBLENBQUcsT0FBSCxFQUFXLFNBQUE7UUFFUCxHQUFBLENBQUksU0FBSixFQUFzQix3QkFBdEI7UUFDQSxHQUFBLENBQUksVUFBSixFQUFzQixxQkFBdEI7UUFDQSxHQUFBLENBQUksYUFBSixFQUFzQiw0QkFBdEI7UUFDQSxHQUFBLENBQUksY0FBSixFQUFzQix5QkFBdEI7UUFFQSxHQUFBLENBQUksVUFBSixFQUFlLGlHQUFmO2VBSUEsR0FBQSxDQUFJLFdBQUosRUFBZ0IsZ0dBQWhCO0lBWE8sQ0FBWDtJQXFCQSxFQUFBLENBQUcsT0FBSCxFQUFXLFNBQUE7UUFFUCxHQUFBLENBQUksS0FBSixFQUF3QixLQUF4QjtRQUNBLEdBQUEsQ0FBSSxPQUFKLEVBQXdCLE9BQXhCO1FBQ0EsR0FBQSxDQUFJLE9BQUosRUFBd0IsT0FBeEI7UUFDQSxHQUFBLENBQUksT0FBSixFQUF3QixPQUF4QjtRQUNBLEdBQUEsQ0FBSSxTQUFKLEVBQXdCLE9BQXhCO1FBQ0EsR0FBQSxDQUFJLFNBQUosRUFBd0IsT0FBeEI7UUFDQSxHQUFBLENBQUksV0FBSixFQUF3QixXQUF4QjtRQUNBLEdBQUEsQ0FBSSxXQUFKLEVBQXdCLFdBQXhCO1FBQ0EsR0FBQSxDQUFJLGFBQUosRUFBd0IsV0FBeEI7UUFDQSxHQUFBLENBQUksYUFBSixFQUF3QixXQUF4QjtRQUNBLEdBQUEsQ0FBSSxNQUFKLEVBQXdCLE1BQXhCO1FBQ0EsR0FBQSxDQUFJLE1BQUosRUFBd0IsTUFBeEI7UUFDQSxHQUFBLENBQUksUUFBSixFQUF3QixRQUF4QjtRQUNBLEdBQUEsQ0FBSSxXQUFKLEVBQXdCLFdBQXhCO1FBQ0EsR0FBQSxDQUFJLFdBQUosRUFBd0IsV0FBeEI7UUFDQSxHQUFBLENBQUksVUFBSixFQUF3QixXQUF4QjtRQUNBLEdBQUEsQ0FBSSxlQUFKLEVBQXdCLGFBQXhCO1FBQ0EsR0FBQSxDQUFJLHlDQUFKLEVBQThDLG1DQUE5QztlQUNBLEdBQUEsQ0FBSSx1RUFBSixFQUNJLDJFQURKO0lBcEJPLENBQVg7SUE2QkEsRUFBQSxDQUFHLFNBQUgsRUFBYSxTQUFBO1FBRVQsR0FBQSxDQUFJLE9BQUosRUFBd0IsU0FBeEI7UUFDQSxHQUFBLENBQUksc0dBQUosRUFVUSxtQ0FWUjtlQWNBLEdBQUEsQ0FBSSx5RUFBSixFQVFRLDJCQVJSO0lBakJTLENBQWI7SUFtQ0EsRUFBQSxDQUFHLFVBQUgsRUFBYyxTQUFBO2VBRVYsR0FBQSxDQUFJLFFBQUosRUFBZ0IsU0FBaEI7SUFGVSxDQUFkO1dBV0EsRUFBQSxDQUFHLFVBQUgsRUFBYyxTQUFBO1FBRVYsR0FBQSxDQUFJLGVBQUosRUFJUSxPQUpSO1FBUUEsR0FBQSxDQUFJLHFCQUFKLEVBS1EsT0FMUjtRQVNBLEdBQUEsQ0FBSSxvQkFBSixFQUtRLE9BTFI7UUFTQSxHQUFBLENBQUksaURBQUosRUFRUSxXQVJSO1FBWUEsR0FBQSxDQUFJLDZFQUFKLEVBUVEsZUFSUjtRQVlBLEdBQUEsQ0FBSSxrRkFBSixFQVNRLGVBVFI7UUFhQSxHQUFBLENBQUksd0VBQUosRUFTUSxjQVRSO1FBYUEsR0FBQSxDQUFJLDJHQUFKLEVBVVEsaUJBVlI7UUFjQSxHQUFBLENBQUksd0NBQUosRUFNUSxxQ0FOUjtRQWFBLEdBQUEsQ0FBSSxnSEFBSixFQVlRLCtDQVpSO1FBZ0JBLEdBQUEsQ0FBSSxpRUFBSixFQVVRLGlCQVZSO1FBY0EsR0FBQSxDQUFJLG9CQUFKLEVBR1EsYUFIUjtRQU9BLEdBQUEsQ0FBSSxlQUFKLEVBR1EsYUFIUjtRQU9BLEdBQUEsQ0FBSSx5QkFBSixFQUlRLGFBSlI7ZUFRQSxHQUFBLENBQUksbUJBQUosRUFHUSxhQUhSO0lBN0pVLENBQWQ7QUE5SGEsQ0FBakIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAgMDAwXG4wMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwMDAgICAgMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuIyMjXG5cbntjbXB9ID0gcmVxdWlyZSAnLi90ZXN0X3V0aWxzJ1xuXG5kZXNjcmliZSAnYXJyYXknIC0+XG5cbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwIDAwMFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwIDAwMFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuXG4gICAgaXQgJ2luZGV4JyAtPlxuXG4gICAgICAgIGNtcCAnYVsxXScgICAgICAgICAgICAnYVsxXSdcbiAgICAgICAgY21wICdhWzFdWzJdJyAgICAgICAgICdhWzFdWzJdJ1xuICAgICAgICBjbXAgJ2FbMV1bMl0nICAgICAgICAgJ2FbMV1bMl0nXG4gICAgICAgIGNtcCAnWzEsMl1bMV0nICAgICAgICAnWzEsMl1bMV0nXG4gICAgICAgIGNtcCAne2E6MX1bXCJhXCJdJyAgICAgICd7YToxfVtcImFcIl0nXG5cbiAgICBpdCAnaW5kZXggc2xpY2UnIC0+XG5cbiAgICAgICAgY21wICdhWzAuLjFdJyAgICAgICAgICdhLnNsaWNlKDAsIDErMSknXG4gICAgICAgIGNtcCAnYVswLi4uMV0nICAgICAgICAnYS5zbGljZSgwLCAxKSdcbiAgICAgICAgY21wICdhWy0xXScgICAgICAgICAgICdhLnNsaWNlKC0xKVswXSdcbiAgICAgICAgY21wICdhWy0yXScgICAgICAgICAgICdhLnNsaWNlKC0yLC0xKVswXSdcbiAgICAgICAgY21wICdhWy0xMDBdJyAgICAgICAgICdhLnNsaWNlKC0xMDAsLTk5KVswXSdcblxuICAgICMgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICAwMDBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDBcblxuICAgIGl0ICdyYW5nZScgLT5cbiAgICAgICAgXG4gICAgICAgIGNtcCAnWzEuLjEwXScgICAgICAgICAnWzEsMiwzLDQsNSw2LDcsOCw5LDEwXSdcbiAgICAgICAgY21wICdbMS4uLjEwXScgICAgICAgICdbMSwyLDMsNCw1LDYsNyw4LDldJ1xuICAgICAgICBjbXAgJ3IgPSBbMS4uMTBdJyAgICAgJ3IgPSBbMSwyLDMsNCw1LDYsNyw4LDksMTBdJ1xuICAgICAgICBjbXAgJ3IgPSBbMS4uLjEwXScgICAgJ3IgPSBbMSwyLDMsNCw1LDYsNyw4LDldJ1xuXG4gICAgICAgIGNtcCAnWzEuLjEwMF0nIFwiXG4gICAgICAgICAgICAoZnVuY3Rpb24oKSB7IHZhciByID0gW107IGZvciAodmFyIGkgPSAxOyBpIDw9IDEwMDsgaSsrKXsgci5wdXNoKGkpOyB9IHJldHVybiByOyB9KS5hcHBseSh0aGlzKVxuICAgICAgICAgICAgXCJcblxuICAgICAgICBjbXAgJ1sxLi4uMTAwXScgXCJcbiAgICAgICAgICAgIChmdW5jdGlvbigpIHsgdmFyIHIgPSBbXTsgZm9yICh2YXIgaSA9IDE7IGkgPCAxMDA7IGkrKyl7IHIucHVzaChpKTsgfSByZXR1cm4gcjsgfSkuYXBwbHkodGhpcylcbiAgICAgICAgICAgIFwiXG4gICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAgMDAwICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwMDAgICAgMDAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgaXQgJ2FycmF5JyAtPlxuXG4gICAgICAgIGNtcCAnWzFdJyAgICAgICAgICAgICAgICdbMV0nXG4gICAgICAgIGNtcCAnWzEgMl0nICAgICAgICAgICAgICdbMSwyXSdcbiAgICAgICAgY21wICdbMSwyXScgICAgICAgICAgICAgJ1sxLDJdJ1xuICAgICAgICBjbXAgJ1thLGJdJyAgICAgICAgICAgICAnW2EsYl0nXG4gICAgICAgIGNtcCAnWyBcIjFcIiBdJyAgICAgICAgICAgJ1tcIjFcIl0nXG4gICAgICAgIGNtcCBcIlsgJzEnIF1cIiAgICAgICAgICAgXCJbJzEnXVwiXG4gICAgICAgIGNtcCAnW1wiMVwiIFwiMlwiXScgICAgICAgICAnW1wiMVwiLFwiMlwiXSdcbiAgICAgICAgY21wIFwiWycxJyAnMiddXCIgICAgICAgICBcIlsnMScsJzInXVwiXG4gICAgICAgIGNtcCAnW1wiMVwiICwgXCIyXCJdJyAgICAgICAnW1wiMVwiLFwiMlwiXSdcbiAgICAgICAgY21wIFwiWycxJyAsICcyJ11cIiAgICAgICBcIlsnMScsJzInXVwiXG4gICAgICAgIGNtcCAnW1tdXScgICAgICAgICAgICAgICdbW11dJ1xuICAgICAgICBjbXAgJ1t7fV0nICAgICAgICAgICAgICAnW3t9XSdcbiAgICAgICAgY21wICdbW1tdXV0nICAgICAgICAgICAgJ1tbW11dXSdcbiAgICAgICAgY21wICdbW1tdIFtdXV0nICAgICAgICAgJ1tbW10sW11dXSdcbiAgICAgICAgY21wICdbW1tdLFtdXV0nICAgICAgICAgJ1tbW10sW11dXSdcbiAgICAgICAgY21wICdbW1tdW11dXScgICAgICAgICAgJ1tbW10sW11dXSdcbiAgICAgICAgY21wIFwiW1snMSddICwgWzJdXVwiICAgICBcIltbJzEnXSxbMl1dXCJcbiAgICAgICAgY21wIFwiWycxJyAsIGEsIHRydWUsIGZhbHNlLCBudWxsLCB1bmRlZmluZWRdXCIgXCJbJzEnLGEsdHJ1ZSxmYWxzZSxudWxsLHVuZGVmaW5lZF1cIlxuICAgICAgICBjbXAgXCJcIlwiWycxJyBcIjJcIiAzIDQuNSBbXSB7fSB0cnVlIGZhbHNlIG51bGwgdW5kZWZpbmVkIE5hTiBJbmZpbml0eSB5ZXMgbm9dXCJcIlwiLFxuICAgICAgICAgICAgXCJcIlwiWycxJyxcIjJcIiwzLDQuNSxbXSx7fSx0cnVlLGZhbHNlLG51bGwsdW5kZWZpbmVkLE5hTixJbmZpbml0eSx0cnVlLGZhbHNlXVwiXCJcIlxuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAgICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgICAgICAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgICAgICAwMDAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBpdCAnb2JqZWN0cycgLT5cbiAgICAgICAgXG4gICAgICAgIGNtcCAnW2E6Yl0nICAgICAgICAgICAgICdbe2E6Yn1dJ1xuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBhID0gW3tcbiAgICAgICAgICAgICAgICAgICAgYToxXG4gICAgICAgICAgICAgICAgICAgIGI6MlxuICAgICAgICAgICAgICAgICAgICBjOjNcbiAgICAgICAgICAgICAgICB9e1xuICAgICAgICAgICAgICAgICAgICB4OjFcbiAgICAgICAgICAgICAgICAgICAgeToyXG4gICAgICAgICAgICAgICAgICAgIHo6M1xuICAgICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBhID0gW3thOjEsYjoyLGM6M30se3g6MSx5OjIsejozfV1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGEgPSBbXG4gICAgICAgICAgICAgICAgICAgIGE6NFxuICAgICAgICAgICAgICAgICAgICBiOjVcbiAgICAgICAgICAgICAgICAsXG4gICAgICAgICAgICAgICAgICAgIHg6NlxuICAgICAgICAgICAgICAgICAgICB5OjdcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBhID0gW3thOjQsYjo1fSx7eDo2LHk6N31dXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICBcbiAgICBpdCAnZnVuY3Rpb24nIC0+XG4gICAgICAgIFxuICAgICAgICBjbXAgJ1thIC0zXScgICAgJ1thKC0zKV0nXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMDAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMCAgXG4gICAgXG4gICAgaXQgJ2FycmF5IG5sJyAtPlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAxLDJcbiAgICAgICAgICAgIF1cbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIFsxLDJdXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgMSxcbiAgICAgICAgICAgICAgICAyXG4gICAgICAgICAgICBdXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBbMSwyXVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIDFcbiAgICAgICAgICAgICAgICAyXG4gICAgICAgICAgICBdXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBbMSwyXVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgMFxuICAgICAgICAgICAgICAgICAgICAxXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIDJcbiAgICAgICAgICAgIF1cbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIFtbMCwxXSwyXVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgYSA9IFtcbiAgICAgICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAgICAgMFxuICAgICAgICAgICAgICAgICAgICAgICAgMVxuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgIDJcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBhID0gW1swLDFdLDJdXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBhID1cbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgICAgICAgICAgICAgIDFcbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICAyXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgYSA9IFtbMCwxXSwyXVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIGJcbiAgICAgICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAgICAgMFxuICAgICAgICAgICAgICAgICAgICAgICAgMVxuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgMlxuICAgICAgICAgICAgXVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgW2IoWzAsMV0pLDJdXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBhXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICBiXG4gICAgICAgICAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDFcbiAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgMlxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGEoW2IoWzAsMV0pLDJdKVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgLT5cbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgIDFcbiAgICAgICAgICAgICAgICAgICAgMlxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGZ1bmN0aW9uICgpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFsxLDJdXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBsID0gW1xuICAgICAgICAgICAgICAgICAxIDIgMyAnYSdcbiAgICAgICAgICAgICAgICAgYzpcbiAgICAgICAgICAgICAgICAgIGQ6M1xuICAgICAgICAgICAgICAgICAgZTo0XG4gICAgICAgICAgICAgICAgIGY6XG4gICAgICAgICAgICAgICAgICAnYidcbiAgICAgICAgICAgICAgICAgJ2MnXG4gICAgICAgICAgICAgICAgIGwgPVxuICAgICAgICAgICAgICAgICAgICAxXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgbCA9IFsxLDIsMywnYScse2M6e2Q6MyxlOjR9LGY6J2InLCdjJyxsID0gMX1dXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBsID0gWyBbXG4gICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAxXG4gICAgICAgICAgICAgICAgIDJcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGwgPSBbW1tbMSwyXV1dXVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgbCA9IFtbMVxuICAgICAgICAgICAgICAgICAgMl1dXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBsID0gW1sxLDJdXVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgbCA9IFtbMVxuICAgICAgICAgICAgIDJdXVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgbCA9IFtbMSwyXV1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGwgPSBbWzFcbiAgICAgICAgICAgICAgICAyXVxuICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBsID0gW1sxLDJdXVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgbCA9IFtbMSAyXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIGwgPSBbWzEsMl1dXG4gICAgICAgICAgICBcIlwiXCIiXX0=
//# sourceURL=../coffee/test_array.coffee