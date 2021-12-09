// koffee 1.20.0

/*
 0000000  000   000  000  000000000   0000000  000   000
000       000 0 000  000     000     000       000   000
0000000   000000000  000     000     000       000000000
     000  000   000  000     000     000       000   000
0000000   00     00  000     000      0000000  000   000
 */
var cmp;

cmp = require('./utils').cmp;

describe('switch', function() {
    it('switches', function() {
        cmp("switch a\n    when 1 then 2", "switch (a)\n{\n    case 1:\n        2\n        break\n}\n");
        cmp("switch a\n    when 11 then 22; 33", "switch (a)\n{\n    case 11:\n        22\n        33\n        break\n}\n");
        cmp("switch a\n    when 'a'   then i++ ; j = 1 if k == 0", "switch (a)\n{\n    case 'a':\n        i++\n        if (k === 0)\n        {\n            j = 1\n        }\n        break\n}\n");
        cmp("switch a\n    when 'a'   then i++ ; j = 0 if k == 1\n    when 'b'   then l++ ; m = 2 if p == 3", "switch (a)\n{\n    case 'a':\n        i++\n        if (k === 1)\n        {\n            j = 0\n        }\n        break\n    case 'b':\n        l++\n        if (p === 3)\n        {\n            m = 2\n        }\n        break\n}\n");
        cmp("switch a\n    when 'a'   then i++ ; i = 1 if i == 0\n    when 'b'   then f++ ; f = 1 if f == 0\n    when 'c'\n        i++ if f != 'f'", "switch (a)\n{\n    case 'a':\n        i++\n        if (i === 0)\n        {\n            i = 1\n        }\n        break\n    case 'b':\n        f++\n        if (f === 0)\n        {\n            f = 1\n        }\n        break\n    case 'c':\n        if (f !== 'f')\n        {\n            i++\n        }\n        break\n}\n");
        cmp("switch a\n    when 111 222 333 then\n    when 'a' 'b' 'c' then", "switch (a)\n{\n    case 111:\n    case 222:\n    case 333:\n        break\n    case 'a':\n    case 'b':\n    case 'c':\n        break\n}\n");
        return cmp("switch a\n    when 111 222 333\n    when 'a' 'b' 'c'", "switch (a)\n{\n    case 111:\n    case 222:\n    case 333:\n        break\n    case 'a':\n    case 'b':\n    case 'c':\n        break\n}\n");
    });
    it('assign', function() {
        cmp("b = switch c\n    when 'c'\n        true\n    when 'd'\n        false", "b = ((function ()\n{\n    switch (c)\n    {\n        case 'c':\n            return true\n\n        case 'd':\n            return false\n\n    }\n\n}).bind(this))()");
        return cmp("b = switch matches[0][0]\n    when 'close'\n        c += index+length\n        true\n    when 'triple' 'double' 'single'\n        c += index+length\n        false\n    else\n        log 'unhandled?' matches[0]\n        c += index+length\n        true", "b = ((function ()\n{\n    switch (matches[0][0])\n    {\n        case 'close':\n            c += index + length\n            return true\n\n        case 'triple':\n        case 'double':\n        case 'single':\n            c += index + length\n            return false\n\n        default:\n            console.log('unhandled?',matches[0])\n            c += index + length\n            return true\n    }\n\n}).bind(this))()");
    });
    return it('nicer', function() {
        cmp("switch x\n    'bla'   ➜ bla\n    'hello' ➜ blub\n            ➜ fork", "switch (x)\n{\n    case 'bla':\n        bla\n        break\n    case 'hello':\n        blub\n        break\n    default:\n        fork\n}\n");
        return cmp("switch x\n    'x' \n    1 2 3\n    'bla'   ➜ bla\n    'a' 'b'\n    'hello' ➜ blub\n            ➜ fork", "switch (x)\n{\n    case 'x':\n    case 1:\n    case 2:\n    case 3:\n    case 'bla':\n        bla\n        break\n    case 'a':\n    case 'b':\n    case 'hello':\n        blub\n        break\n    default:\n        fork\n}\n");
    });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3dpdGNoLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbInN3aXRjaC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUMsTUFBTyxPQUFBLENBQVEsU0FBUjs7QUFFUixRQUFBLENBQVMsUUFBVCxFQUFrQixTQUFBO0lBRWQsRUFBQSxDQUFHLFVBQUgsRUFBYyxTQUFBO1FBRVYsR0FBQSxDQUFJLDZCQUFKLEVBR1EsMkRBSFI7UUFZQSxHQUFBLENBQUksbUNBQUosRUFHUSx5RUFIUjtRQWFBLEdBQUEsQ0FBSSxxREFBSixFQUdRLDhIQUhSO1FBZ0JBLEdBQUEsQ0FBSSxnR0FBSixFQUlRLHdPQUpSO1FBd0JBLEdBQUEsQ0FBSSx1SUFBSixFQU1RLHFVQU5SO1FBZ0NBLEdBQUEsQ0FBSSxnRUFBSixFQUlRLDRJQUpSO2VBa0JBLEdBQUEsQ0FBSSxzREFBSixFQUlRLDRJQUpSO0lBckhVLENBQWQ7SUE2SUEsRUFBQSxDQUFHLFFBQUgsRUFBWSxTQUFBO1FBRVIsR0FBQSxDQUFJLHVFQUFKLEVBTVEscUtBTlI7ZUFzQkEsR0FBQSxDQUFJLDRQQUFKLEVBWVEsMGFBWlI7SUF4QlEsQ0FBWjtXQWtFQSxFQUFBLENBQUcsT0FBSCxFQUFXLFNBQUE7UUFFUCxHQUFBLENBQUkscUVBQUosRUFLUSw2SUFMUjtlQW1CQSxHQUFBLENBQUksdUdBQUosRUFRUSxpT0FSUjtJQXJCTyxDQUFYO0FBak5jLENBQWxCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMFxuMDAwICAgICAgIDAwMCAwIDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwMDAwMDAwXG4gICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAwMDAgICAwMDBcbiMjI1xuXG57Y21wfSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbmRlc2NyaWJlICdzd2l0Y2gnIC0+XG5cbiAgICBpdCAnc3dpdGNoZXMnIC0+XG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgc3dpdGNoIGFcbiAgICAgICAgICAgICAgICB3aGVuIDEgdGhlbiAyXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBzd2l0Y2ggKGEpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgICAgICAyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICB9XFxuXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBzd2l0Y2ggYVxuICAgICAgICAgICAgICAgIHdoZW4gMTEgdGhlbiAyMjsgMzNcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIHN3aXRjaCAoYSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjYXNlIDExOlxuICAgICAgICAgICAgICAgICAgICAyMlxuICAgICAgICAgICAgICAgICAgICAzM1xuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgfVxcblxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgc3dpdGNoIGFcbiAgICAgICAgICAgICAgICB3aGVuICdhJyAgIHRoZW4gaSsrIDsgaiA9IDEgaWYgayA9PSAwXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBzd2l0Y2ggKGEpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY2FzZSAnYSc6XG4gICAgICAgICAgICAgICAgICAgIGkrK1xuICAgICAgICAgICAgICAgICAgICBpZiAoayA9PT0gMClcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaiA9IDFcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgfVxcblxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgc3dpdGNoIGFcbiAgICAgICAgICAgICAgICB3aGVuICdhJyAgIHRoZW4gaSsrIDsgaiA9IDAgaWYgayA9PSAxXG4gICAgICAgICAgICAgICAgd2hlbiAnYicgICB0aGVuIGwrKyA7IG0gPSAyIGlmIHAgPT0gM1xuICAgICAgICAgICAgXCJcIlwiIFwiXCJcIlxuICAgICAgICAgICAgc3dpdGNoIChhKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2EnOlxuICAgICAgICAgICAgICAgICAgICBpKytcbiAgICAgICAgICAgICAgICAgICAgaWYgKGsgPT09IDEpXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGogPSAwXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBjYXNlICdiJzpcbiAgICAgICAgICAgICAgICAgICAgbCsrXG4gICAgICAgICAgICAgICAgICAgIGlmIChwID09PSAzKVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtID0gMlxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICB9XFxuXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBzd2l0Y2ggYVxuICAgICAgICAgICAgICAgIHdoZW4gJ2EnICAgdGhlbiBpKysgOyBpID0gMSBpZiBpID09IDBcbiAgICAgICAgICAgICAgICB3aGVuICdiJyAgIHRoZW4gZisrIDsgZiA9IDEgaWYgZiA9PSAwXG4gICAgICAgICAgICAgICAgd2hlbiAnYydcbiAgICAgICAgICAgICAgICAgICAgaSsrIGlmIGYgIT0gJ2YnXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBzd2l0Y2ggKGEpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY2FzZSAnYSc6XG4gICAgICAgICAgICAgICAgICAgIGkrK1xuICAgICAgICAgICAgICAgICAgICBpZiAoaSA9PT0gMClcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaSA9IDFcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGNhc2UgJ2InOlxuICAgICAgICAgICAgICAgICAgICBmKytcbiAgICAgICAgICAgICAgICAgICAgaWYgKGYgPT09IDApXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGYgPSAxXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBjYXNlICdjJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKGYgIT09ICdmJylcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaSsrXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIH1cXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgXG4gICAgICAgIGNtcCBcIlwiXCJcbiAgICAgICAgICAgIHN3aXRjaCBhXG4gICAgICAgICAgICAgICAgd2hlbiAxMTEgMjIyIDMzMyB0aGVuXG4gICAgICAgICAgICAgICAgd2hlbiAnYScgJ2InICdjJyB0aGVuXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBzd2l0Y2ggKGEpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY2FzZSAxMTE6XG4gICAgICAgICAgICAgICAgY2FzZSAyMjI6XG4gICAgICAgICAgICAgICAgY2FzZSAzMzM6XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgY2FzZSAnYSc6XG4gICAgICAgICAgICAgICAgY2FzZSAnYic6XG4gICAgICAgICAgICAgICAgY2FzZSAnYyc6XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICB9XFxuXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBzd2l0Y2ggYVxuICAgICAgICAgICAgICAgIHdoZW4gMTExIDIyMiAzMzNcbiAgICAgICAgICAgICAgICB3aGVuICdhJyAnYicgJ2MnXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBzd2l0Y2ggKGEpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY2FzZSAxMTE6XG4gICAgICAgICAgICAgICAgY2FzZSAyMjI6XG4gICAgICAgICAgICAgICAgY2FzZSAzMzM6XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgY2FzZSAnYSc6XG4gICAgICAgICAgICAgICAgY2FzZSAnYic6XG4gICAgICAgICAgICAgICAgY2FzZSAnYyc6XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICB9XFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgICAwMDAwICAwMDAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgMCAwMDAgIFxuICAgICMgMDAwICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgIFxuICAgIGl0ICdhc3NpZ24nIC0+XG4gICAgICAgICBcbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgYiA9IHN3aXRjaCBjXG4gICAgICAgICAgICAgICAgd2hlbiAnYydcbiAgICAgICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgICAgIHdoZW4gJ2QnXG4gICAgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBiID0gKChmdW5jdGlvbiAoKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoYylcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2MnOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBjYXNlICdkJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpKSgpXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBiID0gc3dpdGNoIG1hdGNoZXNbMF1bMF1cbiAgICAgICAgICAgICAgICB3aGVuICdjbG9zZSdcbiAgICAgICAgICAgICAgICAgICAgYyArPSBpbmRleCtsZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgICAgIHdoZW4gJ3RyaXBsZScgJ2RvdWJsZScgJ3NpbmdsZSdcbiAgICAgICAgICAgICAgICAgICAgYyArPSBpbmRleCtsZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGxvZyAndW5oYW5kbGVkPycgbWF0Y2hlc1swXVxuICAgICAgICAgICAgICAgICAgICBjICs9IGluZGV4K2xlbmd0aFxuICAgICAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBiID0gKChmdW5jdGlvbiAoKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAobWF0Y2hlc1swXVswXSlcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2Nsb3NlJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGMgKz0gaW5kZXggKyBsZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAndHJpcGxlJzpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnZG91YmxlJzpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnc2luZ2xlJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGMgKz0gaW5kZXggKyBsZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygndW5oYW5kbGVkPycsbWF0Y2hlc1swXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGMgKz0gaW5kZXggKyBsZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpKSgpXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMDAgIDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgaXQgJ25pY2VyJyAtPlxuICAgICAgICAgICAgIFxuICAgICAgICBjbXAgXCJcIlwiXG4gICAgICAgICAgICBzd2l0Y2ggeFxuICAgICAgICAgICAgICAgICdibGEnICAg4p6cIGJsYVxuICAgICAgICAgICAgICAgICdoZWxsbycg4p6cIGJsdWJcbiAgICAgICAgICAgICAgICAgICAgICAgIOKenCBmb3JrXG4gICAgICAgICAgICBcIlwiXCIgXCJcIlwiXG4gICAgICAgICAgICBzd2l0Y2ggKHgpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY2FzZSAnYmxhJzpcbiAgICAgICAgICAgICAgICAgICAgYmxhXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgY2FzZSAnaGVsbG8nOlxuICAgICAgICAgICAgICAgICAgICBibHViXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgZm9ya1xuICAgICAgICAgICAgfVxcblxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY21wIFwiXCJcIlxuICAgICAgICAgICAgc3dpdGNoIHhcbiAgICAgICAgICAgICAgICAneCcgXG4gICAgICAgICAgICAgICAgMSAyIDNcbiAgICAgICAgICAgICAgICAnYmxhJyAgIOKenCBibGFcbiAgICAgICAgICAgICAgICAnYScgJ2InXG4gICAgICAgICAgICAgICAgJ2hlbGxvJyDinpwgYmx1YlxuICAgICAgICAgICAgICAgICAgICAgICAg4p6cIGZvcmtcbiAgICAgICAgICAgIFwiXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIHN3aXRjaCAoeClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjYXNlICd4JzpcbiAgICAgICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICBjYXNlICdibGEnOlxuICAgICAgICAgICAgICAgICAgICBibGFcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBjYXNlICdhJzpcbiAgICAgICAgICAgICAgICBjYXNlICdiJzpcbiAgICAgICAgICAgICAgICBjYXNlICdoZWxsbyc6XG4gICAgICAgICAgICAgICAgICAgIGJsdWJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBmb3JrXG4gICAgICAgICAgICB9XFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICJdfQ==
//# sourceURL=switch.coffee