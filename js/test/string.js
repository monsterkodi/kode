// koffee 1.20.0

/*
 0000000  000000000  00000000   000  000   000   0000000   
000          000     000   000  000  0000  000  000        
0000000      000     0000000    000  000 0 000  000  0000  
     000     000     000   000  000  000  0000  000   000  
0000000      000     000   000  000  000   000   0000000
 */
var cmp;

cmp = require('./utils').cmp;

describe('string', function() {
    it('triple', function() {
        return cmp("log \"\"\"\n    hello\n    \"\"\"", "console.log(`\n    hello\n    `)");
    });
    return it('interpolation', function() {
        cmp("'" + "'", "'" + "'");
        cmp('"#{}"', "`${}`");
        cmp('"#{1}"', "`${1}`");
        cmp('"#{a}"', "`${a}`");
        cmp('"01234\#{}890"', "`01234${}890`");
        cmp('"01234#{}890"', "`01234${}890`");
        cmp('log "#{a+1}", "#{a}"', 'console.log(`${a + 1}`,`${a}`)');
        cmp('"#{b+2}" ; "#{b}"', '`${b + 2}`\n`${b}`');
        cmp('log "- #{c+3} - #{c}"', 'console.log(`- ${c + 3} - ${c}`)');
        cmp('"""tri#{triple}ple""" ; "dou#{double}ble"', '`tri${triple}ple`\n`dou${double}ble`');
        cmp('"#{\'a\'}"', "`${'a'}`");
        cmp('"""#{"a"}"""', '`${"a"}`');
        return cmp('"""{ok#} #{"well" + "1+\'2\' #{\'omg\'}" + is kinda fukked}"""', "`{ok#} ${\"well\" + `1+'2' ${'omg'}` + is(kinda(fukked))}`");
    });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyaW5nLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uL2NvZmZlZS90ZXN0Iiwic291cmNlcyI6WyJzdHJpbmcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFDLE1BQU8sT0FBQSxDQUFRLFNBQVI7O0FBRVIsUUFBQSxDQUFTLFFBQVQsRUFBa0IsU0FBQTtJQUVkLEVBQUEsQ0FBRyxRQUFILEVBQVksU0FBQTtlQUVSLEdBQUEsQ0FBSSxtQ0FBSixFQUlRLGtDQUpSO0lBRlEsQ0FBWjtXQWtCQSxFQUFBLENBQUcsZUFBSCxFQUFtQixTQUFBO1FBQ2YsR0FBQSxDQUFJLEdBQUEsR0FBSyxHQUFULEVBQWdELEdBQUEsR0FBSyxHQUFyRDtRQUNBLEdBQUEsQ0FBSSxPQUFKLEVBQWdELE9BQWhEO1FBQ0EsR0FBQSxDQUFJLFFBQUosRUFBZ0QsUUFBaEQ7UUFDQSxHQUFBLENBQUksUUFBSixFQUFnRCxRQUFoRDtRQUNBLEdBQUEsQ0FBSSxnQkFBSixFQUFnRCxlQUFoRDtRQUNBLEdBQUEsQ0FBSSxlQUFKLEVBQWdELGVBQWhEO1FBQ0EsR0FBQSxDQUFJLHNCQUFKLEVBQWdELGdDQUFoRDtRQUNBLEdBQUEsQ0FBSSxtQkFBSixFQUFpRCxvQkFBakQ7UUFDQSxHQUFBLENBQUksdUJBQUosRUFBZ0Qsa0NBQWhEO1FBQ0EsR0FBQSxDQUFJLDJDQUFKLEVBQWlELHNDQUFqRDtRQUNBLEdBQUEsQ0FBSSxZQUFKLEVBQWdELFVBQWhEO1FBQ0EsR0FBQSxDQUFJLGNBQUosRUFBZ0QsVUFBaEQ7ZUFDQSxHQUFBLENBQUksZ0VBQUosRUFBc0UsNERBQXRFO0lBYmUsQ0FBbkI7QUFwQmMsQ0FBbEIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgXG4wMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgIFxuMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAwMDAwICBcbiAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgXG4wMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIFxuIyMjXG5cbntjbXB9ID0gcmVxdWlyZSAnLi91dGlscydcblxuZGVzY3JpYmUgJ3N0cmluZycgLT5cbiAgICBcbiAgICBpdCAndHJpcGxlJyAtPlxuICAgICAgICBcbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgbG9nIFxcXCJcXFwiXFxcIlxuICAgICAgICAgICAgICAgIGhlbGxvXG4gICAgICAgICAgICAgICAgXFxcIlxcXCJcXFwiXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgXG4gICAgICAgICAgICAgICAgaGVsbG9cbiAgICAgICAgICAgICAgICBgKVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwXG5cbiAgICBpdCAnaW50ZXJwb2xhdGlvbicgLT5cbiAgICAgICAgY21wIFwiJyN7fSdcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIicje30nXCJcbiAgICAgICAgY21wICdcIiN7fVwiJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImAke31gXCJcbiAgICAgICAgY21wICdcIiN7MX1cIicgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImAkezF9YFwiXG4gICAgICAgIGNtcCAnXCIje2F9XCInICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJgJHthfWBcIlxuICAgICAgICBjbXAgJ1wiMDEyMzRcXCN7fTg5MFwiJyAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImAwMTIzNCR7fTg5MGBcIlxuICAgICAgICBjbXAgJ1wiMDEyMzQje304OTBcIicgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYDAxMjM0JHt9ODkwYFwiXG4gICAgICAgIGNtcCAnbG9nIFwiI3thKzF9XCIsIFwiI3thfVwiJyAgICAgICAgICAgICAgICAgICAgICAnY29uc29sZS5sb2coYCR7YSArIDF9YCxgJHthfWApJ1xuICAgICAgICBjbXAgJ1wiI3tiKzJ9XCIgOyBcIiN7Yn1cIicgICAgICAgICAgICAgICAgICAgICAgICAgICdgJHtiICsgMn1gXFxuYCR7Yn1gJ1xuICAgICAgICBjbXAgJ2xvZyBcIi0gI3tjKzN9IC0gI3tjfVwiJyAgICAgICAgICAgICAgICAgICAgICdjb25zb2xlLmxvZyhgLSAke2MgKyAzfSAtICR7Y31gKSdcbiAgICAgICAgY21wICdcIlwiXCJ0cmkje3RyaXBsZX1wbGVcIlwiXCIgOyBcImRvdSN7ZG91YmxlfWJsZVwiJyAgJ2B0cmkke3RyaXBsZX1wbGVgXFxuYGRvdSR7ZG91YmxlfWJsZWAnXG4gICAgICAgIGNtcCAnXCIje1xcJ2FcXCd9XCInICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImAkeydhJ31gXCJcbiAgICAgICAgY21wICdcIlwiXCIje1wiYVwifVwiXCJcIicgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYCR7XCJhXCJ9YCdcbiAgICAgICAgY21wICdcIlwiXCJ7b2sjfSAje1wid2VsbFwiICsgXCIxK1xcJzJcXCcgI3tcXCdvbWdcXCd9XCIgKyBpcyBraW5kYSBmdWtrZWR9XCJcIlwiJyAgXCJge29rI30gJHtcXFwid2VsbFxcXCIgKyBgMSsnMicgJHsnb21nJ31gICsgaXMoa2luZGEoZnVra2VkKSl9YFwiXG4iXX0=
//# sourceURL=../../coffee/test/string.coffee