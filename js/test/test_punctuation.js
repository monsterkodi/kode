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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdF9wdW5jdHVhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi9jb2ZmZWUvdGVzdCIsInNvdXJjZXMiOlsidGVzdF9wdW5jdHVhdGlvbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUUsTUFBTyxPQUFBLENBQVEsY0FBUjs7QUFFVCxRQUFBLENBQVMsYUFBVCxFQUF1QixTQUFBO0lBUW5CLEVBQUEsQ0FBRyxRQUFILEVBQVksU0FBQTtRQUVSLEdBQUEsQ0FBSSxLQUFKLEVBQWtDLE1BQWxDO1FBQ0EsR0FBQSxDQUFJLE9BQUosRUFBa0MsU0FBbEM7UUFDQSxHQUFBLENBQUksU0FBSixFQUFrQyxXQUFsQztlQUNBLEdBQUEsQ0FBSSxhQUFKLEVBQWtDLGNBQWxDO0lBTFEsQ0FBWjtXQWFBLEVBQUEsQ0FBRyxrQkFBSCxFQUFzQixTQUFBO1FBRWxCLEdBQUEsQ0FBSSxRQUFKLEVBQWtDLFFBQWxDO1FBQ0EsR0FBQSxDQUFJLGVBQUosRUFBa0MsYUFBbEM7UUFDQSxHQUFBLENBQUksZUFBSixFQUFrQyxjQUFsQztRQUNBLEdBQUEsQ0FBSSxnQkFBSixFQUFrQyxjQUFsQztRQUNBLEdBQUEsQ0FBSSxnQkFBSixFQUFrQyxnQkFBbEM7UUFDQSxHQUFBLENBQUksZ0JBQUosRUFBa0MsY0FBbEM7UUFDQSxHQUFBLENBQUksZ0JBQUosRUFBa0MsY0FBbEM7UUFDQSxHQUFBLENBQUksV0FBSixFQUFrQyxXQUFsQztRQUNBLEdBQUEsQ0FBSSxZQUFKLEVBQWtDLFlBQWxDO1FBQ0EsR0FBQSxDQUFJLHFCQUFKLEVBQWtDLHFCQUFsQztRQUNBLEdBQUEsQ0FBSSxrQkFBSixFQUFrQyxrQkFBbEM7UUFDQSxHQUFBLENBQUksY0FBSixFQUFrQyxrQkFBbEM7UUFDQSxHQUFBLENBQUksaUJBQUosRUFBa0MsZUFBbEM7UUFDQSxHQUFBLENBQUksYUFBSixFQUFrQyxlQUFsQztRQUNBLEdBQUEsQ0FBSSxtQkFBSixFQUFrQyxtQkFBbEM7UUFDQSxHQUFBLENBQUksaUJBQUosRUFBa0MsbUJBQWxDO1FBQ0EsR0FBQSxDQUFJLDBCQUFKLEVBQWtDLHVCQUFsQztRQUNBLEdBQUEsQ0FBSSx5QkFBSixFQUFrQyx1QkFBbEM7UUFDQSxHQUFBLENBQUkscUJBQUosRUFBa0MsbUJBQWxDO1FBQ0EsR0FBQSxDQUFJLG1CQUFKLEVBQWtDLGlCQUFsQztRQUNBLEdBQUEsQ0FBSSxlQUFKLEVBQWtDLGFBQWxDO1FBQ0EsR0FBQSxDQUFJLGFBQUosRUFBa0MsYUFBbEM7UUFDQSxHQUFBLENBQUksMkJBQUosRUFBa0MsMkJBQWxDO1FBQ0EsR0FBQSxDQUFJLHVCQUFKLEVBQWtDLHFCQUFsQztRQUNBLEdBQUEsQ0FBSSw2QkFBSixFQUFrQywyQkFBbEM7UUFDQSxHQUFBLENBQUksWUFBSixFQUFrQyxhQUFsQztRQUNBLEdBQUEsQ0FBSSxvQkFBSixFQUFrQyxrQ0FBbEM7UUFDQSxHQUFBLENBQUksdUJBQUosRUFBa0MsZ0NBQWxDO1FBQ0EsR0FBQSxDQUFJLFdBQUosRUFBa0Msb0JBQWxDO1FBRUEsR0FBQSxDQUFJLGtEQUFKLEVBQ00sc0RBRE47UUFHQSxHQUFBLENBQUksOEJBQUosRUFBb0Msa0NBQXBDO1FBRUEsR0FBQSxDQUFJLFVBQUosRUFBd0Isd0JBQXhCO1FBQ0EsR0FBQSxDQUFJLGNBQUosRUFBd0IseUJBQXhCO1FBQ0EsR0FBQSxDQUFJLGFBQUosRUFBd0IsV0FBeEI7UUFDQSxHQUFBLENBQUksYUFBSixFQUF3QixjQUF4QjtRQUNBLEdBQUEsQ0FBSSxXQUFKLEVBQXdCLFlBQXhCO1FBQ0EsR0FBQSxDQUFJLFVBQUosRUFBd0IsV0FBeEI7UUFDQSxHQUFBLENBQUksV0FBSixFQUF3QixZQUF4QjtRQUVBLEdBQUEsQ0FBSSxRQUFKLEVBQXdCLHNCQUF4QjtRQUNBLEdBQUEsQ0FBSSxZQUFKLEVBQXdCLHVCQUF4QjtRQUNBLEdBQUEsQ0FBSSxXQUFKLEVBQXdCLFNBQXhCO1FBQ0EsR0FBQSxDQUFJLFdBQUosRUFBd0IsWUFBeEI7UUFDQSxHQUFBLENBQUksU0FBSixFQUF3QixVQUF4QjtRQUNBLEdBQUEsQ0FBSSxRQUFKLEVBQXdCLFNBQXhCO2VBQ0EsR0FBQSxDQUFJLFNBQUosRUFBd0IsVUFBeEI7SUFuRGtCLENBQXRCO0FBckJtQixDQUF2QiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbjAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4wMDAgICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiMjI1xuXG57IGNtcCB9PSByZXF1aXJlICcuL3Rlc3RfdXRpbHMnXG5cbmRlc2NyaWJlICdwdW5jdHVhdGlvbicgLT5cblxuICAgICMgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDBcblxuICAgIGl0ICdwYXJlbnMnIC0+XG5cbiAgICAgICAgY21wICcoYiknICAgICAgICAgICAgICAgICAgICAgICAgICc7KGIpJ1xuICAgICAgICBjbXAgJyhiIGMpJyAgICAgICAgICAgICAgICAgICAgICAgJzsoYihjKSknXG4gICAgICAgIGNtcCAnKGIgLS1jKScgICAgICAgICAgICAgICAgICAgICAnOyhiKC0tYykpJ1xuICAgICAgICBjbXAgJ2EgKyAoYiAtLWMpJyAgICAgICAgICAgICAgICAgJ2EgKyAoYigtLWMpKSdcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIFxuICAgIFxuICAgIGl0ICdvcHRpb25hbCBjb21tYXRhJyAtPlxuICAgICAgICBcbiAgICAgICAgY21wIFwiYSA9IC0xXCIgICAgICAgICAgICAgICAgICAgICAgXCJhID0gLTFcIiBcbiAgICAgICAgY21wIFwiYSA9IFsgMSAyIDMgXVwiICAgICAgICAgICAgICAgXCJhID0gWzEsMiwzXVwiIFxuICAgICAgICBjbXAgXCJhID0gWy0xIDIgMyBdXCIgICAgICAgICAgICAgICBcImEgPSBbLTEsMiwzXVwiIFxuICAgICAgICBjbXAgXCJhID0gWyAxIC0yIDMgXVwiICAgICAgICAgICAgICBcImEgPSBbMSwtMiwzXVwiIFxuICAgICAgICBjbXAgXCJhID0gWy0xIC0yIC0zXVwiICAgICAgICAgICAgICBcImEgPSBbLTEsLTIsLTNdXCIgXG4gICAgICAgIGNtcCBcImEgPSBbIDEgKzIgLTNdXCIgICAgICAgICAgICAgIFwiYSA9IFsxLDIsLTNdXCIgXG4gICAgICAgIGNtcCBcImEgPSBbKzEgLTIgKzNdXCIgICAgICAgICAgICAgIFwiYSA9IFsxLC0yLDNdXCIgXG4gICAgICAgIGNtcCBcImEgPSBbMSBhXVwiICAgICAgICAgICAgICAgICAgIFwiYSA9IFsxLGFdXCIgXG4gICAgICAgIGNtcCBcImEgPSBbMSAtYl1cIiAgICAgICAgICAgICAgICAgIFwiYSA9IFsxLC1iXVwiIFxuICAgICAgICBjbXAgXCJhID0gWycwJyAtMiAnYycgLTNdXCIgICAgICAgICBcImEgPSBbJzAnLC0yLCdjJywtM11cIiBcbiAgICAgICAgY21wIFwiYSA9IFstMSAtIDIgLSAzXVwiICAgICAgICAgICAgXCJhID0gWy0xIC0gMiAtIDNdXCIgXG4gICAgICAgIGNtcCBcImEgPSBbLTEtMi0zXVwiICAgICAgICAgICAgICAgIFwiYSA9IFstMSAtIDIgLSAzXVwiIFxuICAgICAgICBjbXAgXCJhID0geyBhOjEgYjoyIH1cIiAgICAgICAgICAgICBcImEgPSB7YToxLGI6Mn1cIlxuICAgICAgICBjbXAgXCJhID0gYToxIGI6MlwiICAgICAgICAgICAgICAgICBcImEgPSB7YToxLGI6Mn1cIlxuICAgICAgICBjbXAgXCJhID0gWydhJyAnYicgJ2MnXVwiICAgICAgICAgICBcImEgPSBbJ2EnLCdiJywnYyddXCJcbiAgICAgICAgY21wIFwiYSA9IFsnYScnYicnYyddXCIgICAgICAgICAgICAgXCJhID0gWydhJywnYicsJ2MnXVwiXG4gICAgICAgIGNtcCBcImEgPSB7IGE6e2E6MX0sIGI6e2I6Mn0gfVwiICAgIFwiYSA9IHthOnthOjF9LGI6e2I6Mn19XCJcbiAgICAgICAgY21wIFwiYSA9IHsgYTp7YTozfSBiOntiOjR9IH1cIiAgICAgXCJhID0ge2E6e2E6M30sYjp7Yjo0fX1cIlxuICAgICAgICBjbXAgXCJhID0gWyB7YTo1fSB7Yjo2fSBdXCIgICAgICAgICBcImEgPSBbe2E6NX0se2I6Nn1dXCJcbiAgICAgICAgY21wIFwiYSA9IFsge2E6MSBiOjJ9IF1cIiAgICAgICAgICAgXCJhID0gW3thOjEsYjoyfV1cIlxuICAgICAgICBjbXAgXCJhID0gWyBbXSBbXSBdXCIgICAgICAgICAgICAgICBcImEgPSBbW10sW11dXCJcbiAgICAgICAgY21wIFwiYSA9IFtbXSBbXV1cIiAgICAgICAgICAgICAgICAgXCJhID0gW1tdLFtdXVwiXG4gICAgICAgIGNtcCBcImEgPSBbW1tbW10gW11dIFtbXSBbXV1dXV1cIiAgIFwiYSA9IFtbW1tbXSxbXV0sW1tdLFtdXV1dXVwiXG4gICAgICAgIGNtcCBcImEgPSBbIFsxIDJdIFszICc0J10gXVwiICAgICAgIFwiYSA9IFtbMSwyXSxbMywnNCddXVwiXG4gICAgICAgIGNtcCBcImEgPSBbIFstMSAtMl0gWy0zICc0JyAtNV0gXVwiIFwiYSA9IFtbLTEsLTJdLFstMywnNCcsLTVdXVwiXG4gICAgICAgIGNtcCBcImEub24gJ2InIGNcIiAgICAgICAgICAgICAgICAgIFwiYS5vbignYicsYylcIiBcbiAgICAgICAgY21wIFwiZGVzY3JpYmUgJ3Rlc3QnIC0+XCIgICAgICAgICAgXCJkZXNjcmliZSgndGVzdCcsZnVuY3Rpb24gKClcXG57fSlcIlxuICAgICAgICBjbXAgJ2xvZyBcImhlbGxvXCIgMSBcIndvcmxkXCInICAgICAgICdjb25zb2xlLmxvZyhcImhlbGxvXCIsMSxcIndvcmxkXCIpJ1xuICAgICAgICBjbXAgJ2xvZyAxIDIgMycgICAgICAgICAgICAgICAgICAgJ2NvbnNvbGUubG9nKDEsMiwzKSdcbiAgICAgICAgXG4gICAgICAgIGNtcCBcImEgPSBbJ2EnIDEgMi4zIG51bGwgdW5kZWZpbmVkIHRydWUgZmFsc2UgeWVzIG5vXVwiLCBcbiAgICAgICAgICAgICAgXCJhID0gWydhJywxLDIuMyxudWxsLHVuZGVmaW5lZCx0cnVlLGZhbHNlLHRydWUsZmFsc2VdXCJcbiAgICAgICAgICAgICAgICAgIFxuICAgICAgICBjbXAgXCJhID0gWyBbYToyXSBbYjonNCddIFtjOltdXSBdXCIgIFwiYSA9IFtbe2E6Mn1dLFt7YjonNCd9XSxbe2M6W119XV1cIlxuICAgICAgICAgICAgXG4gICAgICAgIGNtcCBcImYgJ2EnIC0+XCIgICAgICAgICAgXCJmKCdhJyxmdW5jdGlvbiAoKVxcbnt9KVwiIFxuICAgICAgICBjbXAgXCJmICdhJyAoYikgLT5cIiAgICAgIFwiZignYScsZnVuY3Rpb24gKGIpXFxue30pXCIgXG4gICAgICAgIGNtcCBcImYgJ2InIG5vdCBhXCIgICAgICAgXCJmKCdiJywhYSlcIiBcbiAgICAgICAgY21wIFwiZiAnYicge2E6MX1cIiAgICAgICBcImYoJ2InLHthOjF9KVwiIFxuICAgICAgICBjbXAgXCJmICdiJyArK2FcIiAgICAgICAgIFwiZignYicsKythKVwiIFxuICAgICAgICBjbXAgXCJmICdiJyBbXVwiICAgICAgICAgIFwiZignYicsW10pXCIgXG4gICAgICAgIGNtcCBcImYgJ2InIDEgMlwiICAgICAgICAgXCJmKCdiJywxLDIpXCIgXG4gICAgICAgIFxuICAgICAgICBjbXAgXCJnIDIgLT5cIiAgICAgICAgICAgIFwiZygyLGZ1bmN0aW9uICgpXFxue30pXCIgXG4gICAgICAgIGNtcCBcImcgMiAoYikgLT5cIiAgICAgICAgXCJnKDIsZnVuY3Rpb24gKGIpXFxue30pXCIgXG4gICAgICAgIGNtcCBcImcgMiBub3QgYVwiICAgICAgICAgXCJnKDIsIWEpXCIgXG4gICAgICAgIGNtcCBcImcgMiB7YToxfVwiICAgICAgICAgXCJnKDIse2E6MX0pXCIgXG4gICAgICAgIGNtcCBcImcgMiArK2FcIiAgICAgICAgICAgXCJnKDIsKythKVwiIFxuICAgICAgICBjbXAgXCJnIDIgW11cIiAgICAgICAgICAgIFwiZygyLFtdKVwiIFxuICAgICAgICBjbXAgXCJnIDIgMSAyXCIgICAgICAgICAgIFwiZygyLDEsMilcIiBcbiAgICAgICAgIl19
//# sourceURL=../../coffee/test/test_punctuation.coffee