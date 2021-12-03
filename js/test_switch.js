// koffee 1.20.0

/*
 0000000  000   000  000  000000000   0000000  000   000
000       000 0 000  000     000     000       000   000
0000000   000000000  000     000     000       000000000
     000  000   000  000     000     000       000   000
0000000   00     00  000     000      0000000  000   000
 */
var cmp;

cmp = require('./test_utils').cmp;

describe('switch', function() {
    return it('switches', function() {
        cmp("switch a\n    when 1 then 2", "switch (a)\n{\n    case 1:\n        2\n        break\n}\n");
        cmp("switch a\n    when 11 then 22; 33", "switch (a)\n{\n    case 11:\n        22\n        33\n        break\n}\n");
        cmp("switch a\n    when 'a'   then i++ ; j = 1 if k == 0", "switch (a)\n{\n    case 'a':\n        i++\n        if (k === 0)\n        {\n            j = 1\n        }\n        break\n}\n");
        cmp("switch a\n    when 'a'   then i++ ; j = 0 if k == 1\n    when 'b'   then l++ ; m = 2 if p == 3", "switch (a)\n{\n    case 'a':\n        i++\n        if (k === 1)\n        {\n            j = 0\n        }\n        break\n    case 'b':\n        l++\n        if (p === 3)\n        {\n            m = 2\n        }\n        break\n}\n");
        cmp("switch a\n    when 'a'   then i++ ; i = 1 if i == 0\n    when 'b'   then f++ ; f = 1 if f == 0\n    when 'c'\n        i++ if f != 'f'", "switch (a)\n{\n    case 'a':\n        i++\n        if (i === 0)\n        {\n            i = 1\n        }\n        break\n    case 'b':\n        f++\n        if (f === 0)\n        {\n            f = 1\n        }\n        break\n    case 'c':\n        if (f !== 'f')\n        {\n            i++\n        }\n        break\n}\n");
        cmp("switch a\n    when 111 222 333 then\n    when 'a' 'b' 'c' then", "switch (a)\n{\n    case 111:\n    case 222:\n    case 333:\n        break\n    case 'a':\n    case 'b':\n    case 'c':\n        break\n}\n");
        cmp("switch a\n    when 111 222 333\n    when 'a' 'b' 'c'", "switch (a)\n{\n    case 111:\n    case 222:\n    case 333:\n        break\n    case 'a':\n    case 'b':\n    case 'c':\n        break\n}\n");
        return cmp("b = switch matches[0][0]\n    when 'close'\n        c += index+length\n        true\n    when 'triple' 'double' 'single'\n        c += index+length\n        false\n    else\n        log 'unhandled?' matches[0]\n        c += index+length\n        true", "b = switch (matches[0][0])\n{\n    case 'close':\n        c += index + length\n        true\n        break\n    case 'triple':\n    case 'double':\n    case 'single':\n        c += index + length\n        false\n        break\n    default:\n}\n");
    });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdF9zd2l0Y2guanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJ0ZXN0X3N3aXRjaC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUMsTUFBTyxPQUFBLENBQVEsY0FBUjs7QUFFUixRQUFBLENBQVMsUUFBVCxFQUFrQixTQUFBO1dBRWQsRUFBQSxDQUFHLFVBQUgsRUFBYyxTQUFBO1FBRVYsR0FBQSxDQUFJLDZCQUFKLEVBR1EsMkRBSFI7UUFZQSxHQUFBLENBQUksbUNBQUosRUFHUSx5RUFIUjtRQWFBLEdBQUEsQ0FBSSxxREFBSixFQUdRLDhIQUhSO1FBZ0JBLEdBQUEsQ0FBSSxnR0FBSixFQUlRLHdPQUpSO1FBd0JBLEdBQUEsQ0FBSSx1SUFBSixFQU1RLHFVQU5SO1FBZ0NBLEdBQUEsQ0FBSSxnRUFBSixFQUlRLDRJQUpSO1FBa0JBLEdBQUEsQ0FBSSxzREFBSixFQUlRLDRJQUpSO2VBa0JBLEdBQUEsQ0FBSSw0UEFBSixFQVlRLHNQQVpSO0lBdklVLENBQWQ7QUFGYyxDQUFsQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDBcbjAwMCAgICAgICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwXG4wMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMDAwMDAwMFxuICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwMDAwMDAgICAwMCAgICAgMDAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgMDAwICAgMDAwXG4jIyNcblxue2NtcH0gPSByZXF1aXJlICcuL3Rlc3RfdXRpbHMnXG5cbmRlc2NyaWJlICdzd2l0Y2gnIC0+XG5cbiAgICBpdCAnc3dpdGNoZXMnIC0+XG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgc3dpdGNoIGFcbiAgICAgICAgICAgICAgICB3aGVuIDEgdGhlbiAyXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBzd2l0Y2ggKGEpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgICAgICAyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICB9XFxuXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBzd2l0Y2ggYVxuICAgICAgICAgICAgICAgIHdoZW4gMTEgdGhlbiAyMjsgMzNcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIHN3aXRjaCAoYSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjYXNlIDExOlxuICAgICAgICAgICAgICAgICAgICAyMlxuICAgICAgICAgICAgICAgICAgICAzM1xuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgfVxcblxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgc3dpdGNoIGFcbiAgICAgICAgICAgICAgICB3aGVuICdhJyAgIHRoZW4gaSsrIDsgaiA9IDEgaWYgayA9PSAwXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBzd2l0Y2ggKGEpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY2FzZSAnYSc6XG4gICAgICAgICAgICAgICAgICAgIGkrK1xuICAgICAgICAgICAgICAgICAgICBpZiAoayA9PT0gMClcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaiA9IDFcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgfVxcblxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgc3dpdGNoIGFcbiAgICAgICAgICAgICAgICB3aGVuICdhJyAgIHRoZW4gaSsrIDsgaiA9IDAgaWYgayA9PSAxXG4gICAgICAgICAgICAgICAgd2hlbiAnYicgICB0aGVuIGwrKyA7IG0gPSAyIGlmIHAgPT0gM1xuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgc3dpdGNoIChhKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2EnOlxuICAgICAgICAgICAgICAgICAgICBpKytcbiAgICAgICAgICAgICAgICAgICAgaWYgKGsgPT09IDEpXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGogPSAwXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBjYXNlICdiJzpcbiAgICAgICAgICAgICAgICAgICAgbCsrXG4gICAgICAgICAgICAgICAgICAgIGlmIChwID09PSAzKVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtID0gMlxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICB9XFxuXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBzd2l0Y2ggYVxuICAgICAgICAgICAgICAgIHdoZW4gJ2EnICAgdGhlbiBpKysgOyBpID0gMSBpZiBpID09IDBcbiAgICAgICAgICAgICAgICB3aGVuICdiJyAgIHRoZW4gZisrIDsgZiA9IDEgaWYgZiA9PSAwXG4gICAgICAgICAgICAgICAgd2hlbiAnYydcbiAgICAgICAgICAgICAgICAgICAgaSsrIGlmIGYgIT0gJ2YnXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBzd2l0Y2ggKGEpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY2FzZSAnYSc6XG4gICAgICAgICAgICAgICAgICAgIGkrK1xuICAgICAgICAgICAgICAgICAgICBpZiAoaSA9PT0gMClcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaSA9IDFcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGNhc2UgJ2InOlxuICAgICAgICAgICAgICAgICAgICBmKytcbiAgICAgICAgICAgICAgICAgICAgaWYgKGYgPT09IDApXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGYgPSAxXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBjYXNlICdjJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKGYgIT09ICdmJylcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaSsrXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIH1cXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIHN3aXRjaCBhXG4gICAgICAgICAgICAgICAgd2hlbiAxMTEgMjIyIDMzMyB0aGVuXG4gICAgICAgICAgICAgICAgd2hlbiAnYScgJ2InICdjJyB0aGVuXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBzd2l0Y2ggKGEpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY2FzZSAxMTE6XG4gICAgICAgICAgICAgICAgY2FzZSAyMjI6XG4gICAgICAgICAgICAgICAgY2FzZSAzMzM6XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgY2FzZSAnYSc6XG4gICAgICAgICAgICAgICAgY2FzZSAnYic6XG4gICAgICAgICAgICAgICAgY2FzZSAnYyc6XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICB9XFxuXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBzd2l0Y2ggYVxuICAgICAgICAgICAgICAgIHdoZW4gMTExIDIyMiAzMzNcbiAgICAgICAgICAgICAgICB3aGVuICdhJyAnYicgJ2MnXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBzd2l0Y2ggKGEpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY2FzZSAxMTE6XG4gICAgICAgICAgICAgICAgY2FzZSAyMjI6XG4gICAgICAgICAgICAgICAgY2FzZSAzMzM6XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgY2FzZSAnYSc6XG4gICAgICAgICAgICAgICAgY2FzZSAnYic6XG4gICAgICAgICAgICAgICAgY2FzZSAnYyc6XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICB9XFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIFxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBiID0gc3dpdGNoIG1hdGNoZXNbMF1bMF1cbiAgICAgICAgICAgICAgICB3aGVuICdjbG9zZSdcbiAgICAgICAgICAgICAgICAgICAgYyArPSBpbmRleCtsZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgICAgIHdoZW4gJ3RyaXBsZScgJ2RvdWJsZScgJ3NpbmdsZSdcbiAgICAgICAgICAgICAgICAgICAgYyArPSBpbmRleCtsZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGxvZyAndW5oYW5kbGVkPycgbWF0Y2hlc1swXVxuICAgICAgICAgICAgICAgICAgICBjICs9IGluZGV4K2xlbmd0aFxuICAgICAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBiID0gc3dpdGNoIChtYXRjaGVzWzBdWzBdKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2Nsb3NlJzpcbiAgICAgICAgICAgICAgICAgICAgYyArPSBpbmRleCArIGxlbmd0aFxuICAgICAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgY2FzZSAndHJpcGxlJzpcbiAgICAgICAgICAgICAgICBjYXNlICdkb3VibGUnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ3NpbmdsZSc6XG4gICAgICAgICAgICAgICAgICAgIGMgKz0gaW5kZXggKyBsZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgfVxcblxuICAgICAgICAgICAgXCJcIlwiXG5cbiJdfQ==
//# sourceURL=../coffee/test_switch.coffee