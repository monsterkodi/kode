// koffee 1.20.0

/*
00000000   000   000  000   000   0000000  000000000  000   000   0000000   000000000  000   0000000   000   000  
000   000  000   000  0000  000  000          000     000   000  000   000     000     000  000   000  0000  000  
00000000   000   000  000 0 000  000          000     000   000  000000000     000     000  000   000  000 0 000  
000        000   000  000  0000  000          000     000   000  000   000     000     000  000   000  000  0000  
000         0000000   000   000   0000000     000      0000000   000   000     000     000   0000000   000   000
 */
var cmp;

cmp = require('./test_utils').cmp;

describe('punctuation', function() {
    it('parens', function() {
        cmp('(b)', ';(b)');
        cmp('(b c)', ';(b(c))');
        cmp('(b --c)', ';(b(--c))');
        return cmp('a + (b --c)', 'a + (b(--c))');
    });
    return it('optional commata', function() {
        cmp("a = -1", "a = -1");
        cmp("a = [ 1 2 3 ]", "a = [1,2,3]");
        cmp("a = [-1 2 3 ]", "a = [-1,2,3]");
        cmp("a = [ 1 -2 3 ]", "a = [1,-2,3]");
        cmp("a = [-1 -2 -3]", "a = [-1,-2,-3]");
        cmp("a = [ 1 +2 -3]", "a = [1,2,-3]");
        cmp("a = [+1 -2 +3]", "a = [1,-2,3]");
        cmp("a = [1 a]", "a = [1,a]");
        cmp("a = [1 -b]", "a = [1,-b]");
        cmp("a = ['0' -2 'c' -3]", "a = ['0',-2,'c',-3]");
        cmp("a = [-1 - 2 - 3]", "a = [-1 - 2 - 3]");
        cmp("a = [-1-2-3]", "a = [-1 - 2 - 3]");
        cmp("a = { a:1 b:2 }", "a = {a:1,b:2}");
        cmp("a = a:1 b:2", "a = {a:1,b:2}");
        cmp("a = ['a' 'b' 'c']", "a = ['a','b','c']");
        cmp("a = ['a''b''c']", "a = ['a','b','c']");
        cmp("a = { a:{a:1}, b:{b:2} }", "a = {a:{a:1},b:{b:2}}");
        cmp("a = { a:{a:3} b:{b:4} }", "a = {a:{a:3},b:{b:4}}");
        cmp("a = [ {a:5} {b:6} ]", "a = [{a:5},{b:6}]");
        cmp("a = [ {a:1 b:2} ]", "a = [{a:1,b:2}]");
        cmp("a = [ [] [] ]", "a = [[],[]]");
        cmp("a = [[] []]", "a = [[],[]]");
        cmp("a = [[[[[] []] [[] []]]]]", "a = [[[[[],[]],[[],[]]]]]");
        cmp("a = [ [1 2] [3 '4'] ]", "a = [[1,2],[3,'4']]");
        cmp("a = [ [-1 -2] [-3 '4' -5] ]", "a = [[-1,-2],[-3,'4',-5]]");
        cmp("a.on 'b' c", "a.on('b',c)");
        cmp("describe 'test' ->", "describe('test',function ()\n{})");
        cmp('log "hello" 1 "world"', 'console.log("hello",1,"world")');
        cmp('log 1 2 3', 'console.log(1,2,3)');
        cmp("a = ['a' 1 2.3 null undefined true false yes no]", "a = ['a',1,2.3,null,undefined,true,false,true,false]");
        cmp("a = [ [a:2] [b:'4'] [c:[]] ]", "a = [[{a:2}],[{b:'4'}],[{c:[]}]]");
        cmp("f 'a' ->", "f('a',function ()\n{})");
        cmp("f 'a' (b) ->", "f('a',function (b)\n{})");
        cmp("f 'b' not a", "f('b',!a)");
        cmp("f 'b' {a:1}", "f('b',{a:1})");
        cmp("f 'b' ++a", "f('b',++a)");
        cmp("f 'b' []", "f('b',[])");
        cmp("f 'b' 1 2", "f('b',1,2)");
        cmp("g 2 ->", "g(2,function ()\n{})");
        cmp("g 2 (b) ->", "g(2,function (b)\n{})");
        cmp("g 2 not a", "g(2,!a)");
        cmp("g 2 {a:1}", "g(2,{a:1})");
        cmp("g 2 ++a", "g(2,++a)");
        cmp("g 2 []", "g(2,[])");
        return cmp("g 2 1 2", "g(2,1,2)");
    });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdF9wdW5jdHVhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbInRlc3RfcHVuY3R1YXRpb24uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFFLE1BQU8sT0FBQSxDQUFRLGNBQVI7O0FBRVQsUUFBQSxDQUFTLGFBQVQsRUFBdUIsU0FBQTtJQVFuQixFQUFBLENBQUcsUUFBSCxFQUFZLFNBQUE7UUFFUixHQUFBLENBQUksS0FBSixFQUFrQyxNQUFsQztRQUNBLEdBQUEsQ0FBSSxPQUFKLEVBQWtDLFNBQWxDO1FBQ0EsR0FBQSxDQUFJLFNBQUosRUFBa0MsV0FBbEM7ZUFDQSxHQUFBLENBQUksYUFBSixFQUFrQyxjQUFsQztJQUxRLENBQVo7V0FhQSxFQUFBLENBQUcsa0JBQUgsRUFBc0IsU0FBQTtRQUVsQixHQUFBLENBQUksUUFBSixFQUFrQyxRQUFsQztRQUNBLEdBQUEsQ0FBSSxlQUFKLEVBQWtDLGFBQWxDO1FBQ0EsR0FBQSxDQUFJLGVBQUosRUFBa0MsY0FBbEM7UUFDQSxHQUFBLENBQUksZ0JBQUosRUFBa0MsY0FBbEM7UUFDQSxHQUFBLENBQUksZ0JBQUosRUFBa0MsZ0JBQWxDO1FBQ0EsR0FBQSxDQUFJLGdCQUFKLEVBQWtDLGNBQWxDO1FBQ0EsR0FBQSxDQUFJLGdCQUFKLEVBQWtDLGNBQWxDO1FBQ0EsR0FBQSxDQUFJLFdBQUosRUFBa0MsV0FBbEM7UUFDQSxHQUFBLENBQUksWUFBSixFQUFrQyxZQUFsQztRQUNBLEdBQUEsQ0FBSSxxQkFBSixFQUFrQyxxQkFBbEM7UUFDQSxHQUFBLENBQUksa0JBQUosRUFBa0Msa0JBQWxDO1FBQ0EsR0FBQSxDQUFJLGNBQUosRUFBa0Msa0JBQWxDO1FBQ0EsR0FBQSxDQUFJLGlCQUFKLEVBQWtDLGVBQWxDO1FBQ0EsR0FBQSxDQUFJLGFBQUosRUFBa0MsZUFBbEM7UUFDQSxHQUFBLENBQUksbUJBQUosRUFBa0MsbUJBQWxDO1FBQ0EsR0FBQSxDQUFJLGlCQUFKLEVBQWtDLG1CQUFsQztRQUNBLEdBQUEsQ0FBSSwwQkFBSixFQUFrQyx1QkFBbEM7UUFDQSxHQUFBLENBQUkseUJBQUosRUFBa0MsdUJBQWxDO1FBQ0EsR0FBQSxDQUFJLHFCQUFKLEVBQWtDLG1CQUFsQztRQUNBLEdBQUEsQ0FBSSxtQkFBSixFQUFrQyxpQkFBbEM7UUFDQSxHQUFBLENBQUksZUFBSixFQUFrQyxhQUFsQztRQUNBLEdBQUEsQ0FBSSxhQUFKLEVBQWtDLGFBQWxDO1FBQ0EsR0FBQSxDQUFJLDJCQUFKLEVBQWtDLDJCQUFsQztRQUNBLEdBQUEsQ0FBSSx1QkFBSixFQUFrQyxxQkFBbEM7UUFDQSxHQUFBLENBQUksNkJBQUosRUFBa0MsMkJBQWxDO1FBQ0EsR0FBQSxDQUFJLFlBQUosRUFBa0MsYUFBbEM7UUFDQSxHQUFBLENBQUksb0JBQUosRUFBa0Msa0NBQWxDO1FBQ0EsR0FBQSxDQUFJLHVCQUFKLEVBQWtDLGdDQUFsQztRQUNBLEdBQUEsQ0FBSSxXQUFKLEVBQWtDLG9CQUFsQztRQUVBLEdBQUEsQ0FBSSxrREFBSixFQUNNLHNEQUROO1FBR0EsR0FBQSxDQUFJLDhCQUFKLEVBQW9DLGtDQUFwQztRQUVBLEdBQUEsQ0FBSSxVQUFKLEVBQXdCLHdCQUF4QjtRQUNBLEdBQUEsQ0FBSSxjQUFKLEVBQXdCLHlCQUF4QjtRQUNBLEdBQUEsQ0FBSSxhQUFKLEVBQXdCLFdBQXhCO1FBQ0EsR0FBQSxDQUFJLGFBQUosRUFBd0IsY0FBeEI7UUFDQSxHQUFBLENBQUksV0FBSixFQUF3QixZQUF4QjtRQUNBLEdBQUEsQ0FBSSxVQUFKLEVBQXdCLFdBQXhCO1FBQ0EsR0FBQSxDQUFJLFdBQUosRUFBd0IsWUFBeEI7UUFFQSxHQUFBLENBQUksUUFBSixFQUF3QixzQkFBeEI7UUFDQSxHQUFBLENBQUksWUFBSixFQUF3Qix1QkFBeEI7UUFDQSxHQUFBLENBQUksV0FBSixFQUF3QixTQUF4QjtRQUNBLEdBQUEsQ0FBSSxXQUFKLEVBQXdCLFlBQXhCO1FBQ0EsR0FBQSxDQUFJLFNBQUosRUFBd0IsVUFBeEI7UUFDQSxHQUFBLENBQUksUUFBSixFQUF3QixTQUF4QjtlQUNBLEdBQUEsQ0FBSSxTQUFKLEVBQXdCLFVBQXhCO0lBbkRrQixDQUF0QjtBQXJCbUIsQ0FBdkIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4wMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbjAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4jIyNcblxueyBjbXAgfT0gcmVxdWlyZSAnLi90ZXN0X3V0aWxzJ1xuXG5kZXNjcmliZSAncHVuY3R1YXRpb24nIC0+XG5cbiAgICAjIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAwMDBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwXG5cbiAgICBpdCAncGFyZW5zJyAtPlxuXG4gICAgICAgIGNtcCAnKGIpJyAgICAgICAgICAgICAgICAgICAgICAgICAnOyhiKSdcbiAgICAgICAgY21wICcoYiBjKScgICAgICAgICAgICAgICAgICAgICAgICc7KGIoYykpJ1xuICAgICAgICBjbXAgJyhiIC0tYyknICAgICAgICAgICAgICAgICAgICAgJzsoYigtLWMpKSdcbiAgICAgICAgY21wICdhICsgKGIgLS1jKScgICAgICAgICAgICAgICAgICdhICsgKGIoLS1jKSknXG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICBcbiAgICBcbiAgICBpdCAnb3B0aW9uYWwgY29tbWF0YScgLT5cbiAgICAgICAgXG4gICAgICAgIGNtcCBcImEgPSAtMVwiICAgICAgICAgICAgICAgICAgICAgIFwiYSA9IC0xXCIgXG4gICAgICAgIGNtcCBcImEgPSBbIDEgMiAzIF1cIiAgICAgICAgICAgICAgIFwiYSA9IFsxLDIsM11cIiBcbiAgICAgICAgY21wIFwiYSA9IFstMSAyIDMgXVwiICAgICAgICAgICAgICAgXCJhID0gWy0xLDIsM11cIiBcbiAgICAgICAgY21wIFwiYSA9IFsgMSAtMiAzIF1cIiAgICAgICAgICAgICAgXCJhID0gWzEsLTIsM11cIiBcbiAgICAgICAgY21wIFwiYSA9IFstMSAtMiAtM11cIiAgICAgICAgICAgICAgXCJhID0gWy0xLC0yLC0zXVwiIFxuICAgICAgICBjbXAgXCJhID0gWyAxICsyIC0zXVwiICAgICAgICAgICAgICBcImEgPSBbMSwyLC0zXVwiIFxuICAgICAgICBjbXAgXCJhID0gWysxIC0yICszXVwiICAgICAgICAgICAgICBcImEgPSBbMSwtMiwzXVwiIFxuICAgICAgICBjbXAgXCJhID0gWzEgYV1cIiAgICAgICAgICAgICAgICAgICBcImEgPSBbMSxhXVwiIFxuICAgICAgICBjbXAgXCJhID0gWzEgLWJdXCIgICAgICAgICAgICAgICAgICBcImEgPSBbMSwtYl1cIiBcbiAgICAgICAgY21wIFwiYSA9IFsnMCcgLTIgJ2MnIC0zXVwiICAgICAgICAgXCJhID0gWycwJywtMiwnYycsLTNdXCIgXG4gICAgICAgIGNtcCBcImEgPSBbLTEgLSAyIC0gM11cIiAgICAgICAgICAgIFwiYSA9IFstMSAtIDIgLSAzXVwiIFxuICAgICAgICBjbXAgXCJhID0gWy0xLTItM11cIiAgICAgICAgICAgICAgICBcImEgPSBbLTEgLSAyIC0gM11cIiBcbiAgICAgICAgY21wIFwiYSA9IHsgYToxIGI6MiB9XCIgICAgICAgICAgICAgXCJhID0ge2E6MSxiOjJ9XCJcbiAgICAgICAgY21wIFwiYSA9IGE6MSBiOjJcIiAgICAgICAgICAgICAgICAgXCJhID0ge2E6MSxiOjJ9XCJcbiAgICAgICAgY21wIFwiYSA9IFsnYScgJ2InICdjJ11cIiAgICAgICAgICAgXCJhID0gWydhJywnYicsJ2MnXVwiXG4gICAgICAgIGNtcCBcImEgPSBbJ2EnJ2InJ2MnXVwiICAgICAgICAgICAgIFwiYSA9IFsnYScsJ2InLCdjJ11cIlxuICAgICAgICBjbXAgXCJhID0geyBhOnthOjF9LCBiOntiOjJ9IH1cIiAgICBcImEgPSB7YTp7YToxfSxiOntiOjJ9fVwiXG4gICAgICAgIGNtcCBcImEgPSB7IGE6e2E6M30gYjp7Yjo0fSB9XCIgICAgIFwiYSA9IHthOnthOjN9LGI6e2I6NH19XCJcbiAgICAgICAgY21wIFwiYSA9IFsge2E6NX0ge2I6Nn0gXVwiICAgICAgICAgXCJhID0gW3thOjV9LHtiOjZ9XVwiXG4gICAgICAgIGNtcCBcImEgPSBbIHthOjEgYjoyfSBdXCIgICAgICAgICAgIFwiYSA9IFt7YToxLGI6Mn1dXCJcbiAgICAgICAgY21wIFwiYSA9IFsgW10gW10gXVwiICAgICAgICAgICAgICAgXCJhID0gW1tdLFtdXVwiXG4gICAgICAgIGNtcCBcImEgPSBbW10gW11dXCIgICAgICAgICAgICAgICAgIFwiYSA9IFtbXSxbXV1cIlxuICAgICAgICBjbXAgXCJhID0gW1tbW1tdIFtdXSBbW10gW11dXV1dXCIgICBcImEgPSBbW1tbW10sW11dLFtbXSxbXV1dXV1cIlxuICAgICAgICBjbXAgXCJhID0gWyBbMSAyXSBbMyAnNCddIF1cIiAgICAgICBcImEgPSBbWzEsMl0sWzMsJzQnXV1cIlxuICAgICAgICBjbXAgXCJhID0gWyBbLTEgLTJdIFstMyAnNCcgLTVdIF1cIiBcImEgPSBbWy0xLC0yXSxbLTMsJzQnLC01XV1cIlxuICAgICAgICBjbXAgXCJhLm9uICdiJyBjXCIgICAgICAgICAgICAgICAgICBcImEub24oJ2InLGMpXCIgXG4gICAgICAgIGNtcCBcImRlc2NyaWJlICd0ZXN0JyAtPlwiICAgICAgICAgIFwiZGVzY3JpYmUoJ3Rlc3QnLGZ1bmN0aW9uICgpXFxue30pXCJcbiAgICAgICAgY21wICdsb2cgXCJoZWxsb1wiIDEgXCJ3b3JsZFwiJyAgICAgICAnY29uc29sZS5sb2coXCJoZWxsb1wiLDEsXCJ3b3JsZFwiKSdcbiAgICAgICAgY21wICdsb2cgMSAyIDMnICAgICAgICAgICAgICAgICAgICdjb25zb2xlLmxvZygxLDIsMyknXG4gICAgICAgIFxuICAgICAgICBjbXAgXCJhID0gWydhJyAxIDIuMyBudWxsIHVuZGVmaW5lZCB0cnVlIGZhbHNlIHllcyBub11cIiwgXG4gICAgICAgICAgICAgIFwiYSA9IFsnYScsMSwyLjMsbnVsbCx1bmRlZmluZWQsdHJ1ZSxmYWxzZSx0cnVlLGZhbHNlXVwiXG4gICAgICAgICAgICAgICAgICBcbiAgICAgICAgY21wIFwiYSA9IFsgW2E6Ml0gW2I6JzQnXSBbYzpbXV0gXVwiICBcImEgPSBbW3thOjJ9XSxbe2I6JzQnfV0sW3tjOltdfV1dXCJcbiAgICAgICAgICAgIFxuICAgICAgICBjbXAgXCJmICdhJyAtPlwiICAgICAgICAgIFwiZignYScsZnVuY3Rpb24gKClcXG57fSlcIiBcbiAgICAgICAgY21wIFwiZiAnYScgKGIpIC0+XCIgICAgICBcImYoJ2EnLGZ1bmN0aW9uIChiKVxcbnt9KVwiIFxuICAgICAgICBjbXAgXCJmICdiJyBub3QgYVwiICAgICAgIFwiZignYicsIWEpXCIgXG4gICAgICAgIGNtcCBcImYgJ2InIHthOjF9XCIgICAgICAgXCJmKCdiJyx7YToxfSlcIiBcbiAgICAgICAgY21wIFwiZiAnYicgKythXCIgICAgICAgICBcImYoJ2InLCsrYSlcIiBcbiAgICAgICAgY21wIFwiZiAnYicgW11cIiAgICAgICAgICBcImYoJ2InLFtdKVwiIFxuICAgICAgICBjbXAgXCJmICdiJyAxIDJcIiAgICAgICAgIFwiZignYicsMSwyKVwiIFxuICAgICAgICBcbiAgICAgICAgY21wIFwiZyAyIC0+XCIgICAgICAgICAgICBcImcoMixmdW5jdGlvbiAoKVxcbnt9KVwiIFxuICAgICAgICBjbXAgXCJnIDIgKGIpIC0+XCIgICAgICAgIFwiZygyLGZ1bmN0aW9uIChiKVxcbnt9KVwiIFxuICAgICAgICBjbXAgXCJnIDIgbm90IGFcIiAgICAgICAgIFwiZygyLCFhKVwiIFxuICAgICAgICBjbXAgXCJnIDIge2E6MX1cIiAgICAgICAgIFwiZygyLHthOjF9KVwiIFxuICAgICAgICBjbXAgXCJnIDIgKythXCIgICAgICAgICAgIFwiZygyLCsrYSlcIiBcbiAgICAgICAgY21wIFwiZyAyIFtdXCIgICAgICAgICAgICBcImcoMixbXSlcIiBcbiAgICAgICAgY21wIFwiZyAyIDEgMlwiICAgICAgICAgICBcImcoMiwxLDIpXCIgXG4gICAgICAgICJdfQ==
//# sourceURL=../coffee/test_punctuation.coffee