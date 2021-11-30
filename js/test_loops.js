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
        cmp("for t in l\n    t", "var list = l\nfor (var i = 0; i < list.length; i++)\n{\n    t = list[i]\n    t\n}");
        cmp("for a in [1,2,3] then log a", "var list = [1,2,3]\nfor (var i = 0; i < list.length; i++)\n{\n    a = list[i]\n    console.log(a)\n}");
        cmp("for a in [1,2,3] then log a\nlog a", "var list = [1,2,3]\nfor (var i = 0; i < list.length; i++)\n{\n    a = list[i]\n    console.log(a)\n}\nconsole.log(a)");
        cmp("for a in [1,2,3]\n    log '1' a\n    log '2' a\nlog '3' a", "var list = [1,2,3]\nfor (var i = 0; i < list.length; i++)\n{\n    a = list[i]\n    console.log('1',a)\n    console.log('2',a)\n}\nconsole.log('3',a)");
        cmp("for v,i in @regs\n    log i,v", "var list = this.regs\nfor (i = 0; i < list.length; i++)\n{\n    v = list[i]\n    console.log(i,v)\n}");
        cmp("for [a,b] in @regs\n    log a,b", "var list = this.regs\nfor (var i = 0; i < list.length; i++)\n{\n    a = list[i][0]\n    b = list[i][1]\n    console.log(a,b)\n}");
        cmp("for a in [1..2] then for b in [1..3] then c = 1; d = 1", "var list = [1,2]\nfor (var i = 0; i < list.length; i++)\n{\n    a = list[i]\n    var list1 = [1,2,3]\n    for (var i1 = 0; i1 < list1.length; i1++)\n    {\n        b = list1[i1]\n        c = 1\n        d = 1\n    }\n}");
        return cmp("for a in [1..9] then for b in [1..9]\n    c = 3\n    d:\n        e: 1", "var list = [1,2,3,4,5,6,7,8,9]\nfor (var i = 0; i < list.length; i++)\n{\n    a = list[i]\n    var list1 = [1,2,3,4,5,6,7,8,9]\n    for (var i1 = 0; i1 < list1.length; i1++)\n    {\n        b = list1[i1]\n        c = 3\n        {d:{e:1}}\n    }\n}");
    });
    it('for of', function() {
        return cmp("for key,val of @patterns\n    log key, val", "for (key in this.patterns)\n{\n    val = this.patterns[key]\n    console.log(key,val)\n}");
    });
    return it('while', function() {
        cmp("while true\n    log 4", "while (true)\n{\n    console.log(4)\n}");
        cmp("while true then log 5", "while (true)\n{\n    console.log(5)\n}");
        return cmp("while a == b then log c; log d\nlog e", "while (a === b)\n{\n    console.log(c)\n    console.log(d)\n}\nconsole.log(e)");
    });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdF9sb29wcy5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbInRlc3RfbG9vcHMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFDLE1BQU8sT0FBQSxDQUFRLGNBQVI7O0FBRVIsUUFBQSxDQUFTLE9BQVQsRUFBaUIsU0FBQTtJQVFiLEVBQUEsQ0FBRyxRQUFILEVBQVksU0FBQTtRQUVSLEdBQUEsQ0FBSSxtQkFBSixFQUdRLG1GQUhSO1FBWUEsR0FBQSxDQUFJLDZCQUFKLEVBRVEsc0dBRlI7UUFXQSxHQUFBLENBQUksb0NBQUosRUFHUSxzSEFIUjtRQWFBLEdBQUEsQ0FBSSwyREFBSixFQUtRLHNKQUxSO1FBZ0JBLEdBQUEsQ0FBSSwrQkFBSixFQUdRLHNHQUhSO1FBWUEsR0FBQSxDQUFJLGlDQUFKLEVBR1EsaUlBSFI7UUFhQSxHQUFBLENBQUksd0RBQUosRUFFUSwyTkFGUjtlQWlCQSxHQUFBLENBQUksdUVBQUosRUFLUSx5UEFMUjtJQWhHUSxDQUFaO0lBMEhBLEVBQUEsQ0FBRyxRQUFILEVBQVksU0FBQTtlQUVSLEdBQUEsQ0FBSSw0Q0FBSixFQUdRLDBGQUhSO0lBRlEsQ0FBWjtXQW1CQSxFQUFBLENBQUcsT0FBSCxFQUFXLFNBQUE7UUFFUCxHQUFBLENBQUksdUJBQUosRUFHUSx3Q0FIUjtRQVVBLEdBQUEsQ0FBSSx1QkFBSixFQUVRLHdDQUZSO2VBU0EsR0FBQSxDQUFJLHVDQUFKLEVBR1EsK0VBSFI7SUFyQk8sQ0FBWDtBQXJKYSxDQUFqQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDBcbjAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMFxuMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAgICAwMDBcbjAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMDAwMDBcbiMjI1xuXG57Y21wfSA9IHJlcXVpcmUgJy4vdGVzdF91dGlscydcblxuZGVzY3JpYmUgJ2xvb3BzJyAtPlxuXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAgICAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAgMDAwMCAgMDAwXG4gICAgIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAgICAgIDAwMCAgMDAwIDAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAgMDAwICAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgICAgIDAwMCAgMDAwICAgMDAwXG5cbiAgICBpdCAnZm9yIGluJyAtPlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGZvciB0IGluIGxcbiAgICAgICAgICAgICAgICB0XG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICB2YXIgbGlzdCA9IGxcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0ID0gbGlzdFtpXVxuICAgICAgICAgICAgICAgIHRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGZvciBhIGluIFsxLDIsM10gdGhlbiBsb2cgYVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgdmFyIGxpc3QgPSBbMSwyLDNdXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYSA9IGxpc3RbaV1cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhhKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgZm9yIGEgaW4gWzEsMiwzXSB0aGVuIGxvZyBhXG4gICAgICAgICAgICBsb2cgYVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgdmFyIGxpc3QgPSBbMSwyLDNdXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYSA9IGxpc3RbaV1cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhhKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc29sZS5sb2coYSlcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGZvciBhIGluIFsxLDIsM11cbiAgICAgICAgICAgICAgICBsb2cgJzEnIGFcbiAgICAgICAgICAgICAgICBsb2cgJzInIGFcbiAgICAgICAgICAgIGxvZyAnMycgYVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgdmFyIGxpc3QgPSBbMSwyLDNdXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYSA9IGxpc3RbaV1cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnMScsYSlcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnMicsYSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCczJyxhKVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgZm9yIHYsaSBpbiBAcmVnc1xuICAgICAgICAgICAgICAgIGxvZyBpLHZcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIHZhciBsaXN0ID0gdGhpcy5yZWdzXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB2ID0gbGlzdFtpXVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGksdilcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGZvciBbYSxiXSBpbiBAcmVnc1xuICAgICAgICAgICAgICAgIGxvZyBhLGJcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIHZhciBsaXN0ID0gdGhpcy5yZWdzXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYSA9IGxpc3RbaV1bMF1cbiAgICAgICAgICAgICAgICBiID0gbGlzdFtpXVsxXVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGEsYilcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGZvciBhIGluIFsxLi4yXSB0aGVuIGZvciBiIGluIFsxLi4zXSB0aGVuIGMgPSAxOyBkID0gMVxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgdmFyIGxpc3QgPSBbMSwyXVxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGEgPSBsaXN0W2ldXG4gICAgICAgICAgICAgICAgdmFyIGxpc3QxID0gWzEsMiwzXVxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkxID0gMDsgaTEgPCBsaXN0MS5sZW5ndGg7IGkxKyspXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBiID0gbGlzdDFbaTFdXG4gICAgICAgICAgICAgICAgICAgIGMgPSAxXG4gICAgICAgICAgICAgICAgICAgIGQgPSAxXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgZm9yIGEgaW4gWzEuLjldIHRoZW4gZm9yIGIgaW4gWzEuLjldXG4gICAgICAgICAgICAgICAgYyA9IDNcbiAgICAgICAgICAgICAgICBkOlxuICAgICAgICAgICAgICAgICAgICBlOiAxXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICB2YXIgbGlzdCA9IFsxLDIsMyw0LDUsNiw3LDgsOV1cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBhID0gbGlzdFtpXVxuICAgICAgICAgICAgICAgIHZhciBsaXN0MSA9IFsxLDIsMyw0LDUsNiw3LDgsOV1cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpMSA9IDA7IGkxIDwgbGlzdDEubGVuZ3RoOyBpMSsrKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgYiA9IGxpc3QxW2kxXVxuICAgICAgICAgICAgICAgICAgICBjID0gM1xuICAgICAgICAgICAgICAgICAgICB7ZDp7ZToxfX1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgICAgICAwMDAwMDAwICAgMDAwXG5cbiAgICBpdCAnZm9yIG9mJyAtPlxuXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIGZvciBrZXksdmFsIG9mIEBwYXR0ZXJuc1xuICAgICAgICAgICAgICAgIGxvZyBrZXksIHZhbFxuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgZm9yIChrZXkgaW4gdGhpcy5wYXR0ZXJucylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB2YWwgPSB0aGlzLnBhdHRlcm5zW2tleV1cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhrZXksdmFsKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIDAwMDAwMDAwXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAwMDBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAgICAgIDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIDAwMFxuICAgICMgMDAgICAgIDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDBcblxuICAgIGl0ICd3aGlsZScgLT5cblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICB3aGlsZSB0cnVlXG4gICAgICAgICAgICAgICAgbG9nIDRcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIHdoaWxlICh0cnVlKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKDQpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICB3aGlsZSB0cnVlIHRoZW4gbG9nIDVcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIHdoaWxlICh0cnVlKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKDUpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICB3aGlsZSBhID09IGIgdGhlbiBsb2cgYzsgbG9nIGRcbiAgICAgICAgICAgIGxvZyBlXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICB3aGlsZSAoYSA9PT0gYilcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhjKVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGQpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlKVxuICAgICAgICAgICAgXCJcIlwiXG4iXX0=
//# sourceURL=../coffee/test_loops.coffee