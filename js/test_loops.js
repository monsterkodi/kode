// koffee 1.20.0

/*
000       0000000    0000000   00000000    0000000
000      000   000  000   000  000   000  000
000      000   000  000   000  00000000   0000000
000      000   000  000   000  000             000
0000000   0000000    0000000   000        0000000
 */
var cmp;

cmp = require('./test_utils').cmp;

describe('loops', function() {
    it('for in', function() {
        cmp("for t in l\n    t", "var list = l\nfor (var i = 0; i < list.length; i++)\n{\n    var t = list[i]\n    t\n}");
        cmp("for a in [1,2,3] then log a", "var list = [1,2,3]\nfor (var i = 0; i < list.length; i++)\n{\n    var a = list[i]\n    console.log(a)\n}");
        cmp("for a in [1,2,3] then log a\nlog a", "var list = [1,2,3]\nfor (var i = 0; i < list.length; i++)\n{\n    var a = list[i]\n    console.log(a)\n}\nconsole.log(a)");
        cmp("for a in [1,2,3]\n    log '1' a\n    log '2' a\nlog '3' a", "var list = [1,2,3]\nfor (var i = 0; i < list.length; i++)\n{\n    var a = list[i]\n    console.log('1',a)\n    console.log('2',a)\n}\nconsole.log('3',a)");
        cmp("for v,i in @regs\n    log i,v", "var list = this.regs\nfor (var i = 0; i < list.length; i++)\n{\n    var v = list[i]\n    console.log(i,v)\n}");
        return cmp("for [a,b] in @regs\n    log a,b", "var list = this.regs\nfor (var i = 0; i < list.length; i++)\n{\n    var a = list[i][0]\n    var b = list[i][1]\n    console.log(a,b)\n}");
    });
    it('for of', function() {
        return cmp("for key,val of @patterns\n    log key, val", "for (key in this.patterns)\n{\n    val = this.patterns[key]\n    console.log(key,val)\n}");
    });
    it('while', function() {
        cmp("while true\n    log 4", "while (true)\n{\n    console.log(4)\n}");
        cmp("while true then log 5", "while (true)\n{\n    console.log(5)\n}");
        return cmp("while a == b then log c; log d\nlog e", "while (a === b)\n{\n    console.log(c)\n    console.log(d)\n}\nconsole.log(e)");
    });
    return it('switch', function() {
        return cmp("switch a\n    when 1 then 2", "switch (a)\n{\n    case 1:\n        2\n        break\n}\n");
    });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdF9sb29wcy5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbInRlc3RfbG9vcHMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFDLE1BQU8sT0FBQSxDQUFRLGNBQVI7O0FBRVIsUUFBQSxDQUFTLE9BQVQsRUFBaUIsU0FBQTtJQVFiLEVBQUEsQ0FBRyxRQUFILEVBQVksU0FBQTtRQUVSLEdBQUEsQ0FBSSxtQkFBSixFQUdRLHVGQUhSO1FBWUEsR0FBQSxDQUFJLDZCQUFKLEVBRVEsMEdBRlI7UUFXQSxHQUFBLENBQUksb0NBQUosRUFHUSwwSEFIUjtRQWFBLEdBQUEsQ0FBSSwyREFBSixFQUtRLDBKQUxSO1FBZ0JBLEdBQUEsQ0FBSSwrQkFBSixFQUdRLDhHQUhSO2VBWUEsR0FBQSxDQUFJLGlDQUFKLEVBR1EseUlBSFI7SUFsRVEsQ0FBWjtJQXFGQSxFQUFBLENBQUcsUUFBSCxFQUFZLFNBQUE7ZUFFUixHQUFBLENBQUksNENBQUosRUFHUSwwRkFIUjtJQUZRLENBQVo7SUFtQkEsRUFBQSxDQUFHLE9BQUgsRUFBVyxTQUFBO1FBRVAsR0FBQSxDQUFJLHVCQUFKLEVBR1Esd0NBSFI7UUFVQSxHQUFBLENBQUksdUJBQUosRUFFUSx3Q0FGUjtlQVNBLEdBQUEsQ0FBSSx1Q0FBSixFQUdRLCtFQUhSO0lBckJPLENBQVg7V0F1Q0EsRUFBQSxDQUFHLFFBQUgsRUFBWSxTQUFBO2VBRVIsR0FBQSxDQUFJLDZCQUFKLEVBR1EsMkRBSFI7SUFGUSxDQUFaO0FBdkphLENBQWpCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMFxuMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4wMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwXG4wMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgICAgIDAwMFxuMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgICAgICAgMDAwMDAwMFxuIyMjXG5cbntjbXB9ID0gcmVxdWlyZSAnLi90ZXN0X3V0aWxzJ1xuXG5kZXNjcmliZSAnbG9vcHMnIC0+XG5cbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgICAgICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwICAwMDAwICAwMDBcbiAgICAjIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgICAgMDAwICAwMDAgMCAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwICAwMDAgIDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgICAgMDAwICAwMDAgICAwMDBcblxuICAgIGl0ICdmb3IgaW4nIC0+XG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgZm9yIHQgaW4gbFxuICAgICAgICAgICAgICAgIHRcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIHZhciBsaXN0ID0gbFxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZhciB0ID0gbGlzdFtpXVxuICAgICAgICAgICAgICAgIHRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGZvciBhIGluIFsxLDIsM10gdGhlbiBsb2cgYVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgdmFyIGxpc3QgPSBbMSwyLDNdXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmFyIGEgPSBsaXN0W2ldXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGZvciBhIGluIFsxLDIsM10gdGhlbiBsb2cgYVxuICAgICAgICAgICAgbG9nIGFcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIHZhciBsaXN0ID0gWzEsMiwzXVxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZhciBhID0gbGlzdFtpXVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGEpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhhKVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgZm9yIGEgaW4gWzEsMiwzXVxuICAgICAgICAgICAgICAgIGxvZyAnMScgYVxuICAgICAgICAgICAgICAgIGxvZyAnMicgYVxuICAgICAgICAgICAgbG9nICczJyBhXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICB2YXIgbGlzdCA9IFsxLDIsM11cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB2YXIgYSA9IGxpc3RbaV1cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnMScsYSlcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnMicsYSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCczJyxhKVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgZm9yIHYsaSBpbiBAcmVnc1xuICAgICAgICAgICAgICAgIGxvZyBpLHZcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIHZhciBsaXN0ID0gdGhpcy5yZWdzXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmFyIHYgPSBsaXN0W2ldXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coaSx2KVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgZm9yIFthLGJdIGluIEByZWdzXG4gICAgICAgICAgICAgICAgbG9nIGEsYlxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgdmFyIGxpc3QgPSB0aGlzLnJlZ3NcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB2YXIgYSA9IGxpc3RbaV1bMF1cbiAgICAgICAgICAgICAgICB2YXIgYiA9IGxpc3RbaV1bMV1cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhhLGIpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgICAgICAwMDAwMDAwICAgMDAwXG5cbiAgICBpdCAnZm9yIG9mJyAtPlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGZvciBrZXksdmFsIG9mIEBwYXR0ZXJuc1xuICAgICAgICAgICAgICAgIGxvZyBrZXksIHZhbFxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgZm9yIChrZXkgaW4gdGhpcy5wYXR0ZXJucylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB2YWwgPSB0aGlzLnBhdHRlcm5zW2tleV1cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhrZXksdmFsKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIDAwMDAwMDAwXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAwMDBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAgICAgIDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIDAwMFxuICAgICMgMDAgICAgIDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDBcblxuICAgIGl0ICd3aGlsZScgLT5cblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICB3aGlsZSB0cnVlXG4gICAgICAgICAgICAgICAgbG9nIDRcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIHdoaWxlICh0cnVlKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKDQpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICB3aGlsZSB0cnVlIHRoZW4gbG9nIDVcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIHdoaWxlICh0cnVlKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKDUpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICB3aGlsZSBhID09IGIgdGhlbiBsb2cgYzsgbG9nIGRcbiAgICAgICAgICAgIGxvZyBlXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICB3aGlsZSAoYSA9PT0gYilcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhjKVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGQpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlKVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwIDAgMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAwMDAwMDBcbiAgICAjICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgIDAwMCAgIDAwMFxuXG4gICAgaXQgJ3N3aXRjaCcgLT5cblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBzd2l0Y2ggYVxuICAgICAgICAgICAgICAgIHdoZW4gMSB0aGVuIDJcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIHN3aXRjaCAoYSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgICAgIDJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIH1cXG5cIlwiXCJcbiJdfQ==
//# sourceURL=../coffee/test_loops.coffee