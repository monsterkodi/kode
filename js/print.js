// koffee 1.20.0

/*
00000000   00000000   000  000   000  000000000
000   000  000   000  000  0000  000     000
00000000   0000000    000  000 0 000     000
000        000   000  000  000  0000     000
000        000   000  000  000   000     000
 */
var Print, childp, fs, klor, kstr, noon, slash,
    indexOf = [].indexOf;

kstr = require('kstr');

klor = require('klor');

noon = require('noon');

slash = require('kslash');

childp = require('child_process');

fs = require('fs-extra');

klor.kolor.globalize();

Print = (function() {
    function Print() {}

    Print.tokens = function(header, tokens) {
        var i, len, s, tok;
        console.log(R3(y5("\n " + header)));
        console.log(b6(kstr.pad('', 80, ' ')));
        s = '';
        for (i = 0, len = tokens.length; i < len; i++) {
            tok = tokens[i];
            s += this.token(tok);
        }
        return console.log(s);
    };

    Print.token = function(tok) {
        var indent, ref, toktext;
        indent = kstr.lpad('', tok.col);
        if (tok.type === 'nl') {
            return red('◂\n');
        }
        if ((ref = tok.type) === 'ws' || ref === 'nl') {
            return '';
        }
        toktext = (function(_this) {
            return function(tok) {
                var i, len, ref1, s, t;
                if (tok.text === '') {
                    return '\n' + indent;
                } else if (tok.text) {
                    return tok.text;
                } else if (tok.tokens) {
                    s = '';
                    ref1 = tok.tokens;
                    for (i = 0, len = ref1.length; i < len; i++) {
                        t = ref1[i];
                        s += _this.token(t);
                    }
                    return '\n' + s;
                } else {
                    return '???';
                }
            };
        })(this);
        return b6(kstr.lpad(tok.line, 4)) + ' ' + blue(kstr.lpad(tok.col, 3)) + ' ' + gray(kstr.pad(tok.type, 10)) + ' ' + bold(yellow(indent + toktext(tok)) + '\n');
    };

    Print.stack = function(stack, node, color) {
        if (color == null) {
            color = W4;
        }
        return console.log(W2(stack.join(' ') + ' ') + color(node != null ? node : ''));
    };

    Print.sheap = function(sheap, popped) {
        var c, i, len, r, s;
        s = B2('   ');
        for (i = 0, len = sheap.length; i < len; i++) {
            r = sheap[i];
            if (r.type === 'exps') {
                s += B5(r.text + B2(' '));
            } else {
                s += Y4(black(r.text + Y2(' ')));
            }
        }
        if (popped) {
            c = popped.type === 'exps' ? B1 : W1;
            s += black(c(popped.text) + ' ');
        }
        return console.log(s);
    };

    Print.block = function(header, block, legend) {
        var printBlock;
        if (legend == null) {
            legend = false;
        }
        console.log(R3(y5("\n " + header)));
        printBlock = function(b) {
            var c, ci, cn, i, len, ref, ref1, ref2, ref3, s;
            if (legend) {
                s = b.indent + b6(kstr.rpad(b.line, 3)) + b5('- ' + kstr.pad(b.last, 3)) + w2(kstr.rpad(b.col, 3)) + yellow(b.tokens.length);
                s += '\n' + b.indent;
            }
            s = b.indent;
            if ((ref = b.type) === '{}' || ref === '()' || ref === '[]') {
                s += b.type[0] + ' ';
            }
            ref1 = b.tokens;
            for (i = 0, len = ref1.length; i < len; i++) {
                c = ref1[i];
                if (c.tokens != null) {
                    s += '\n' + printBlock(c) + b.indent;
                } else if (c.type === 'nl') {
                    s += '\n' + b.indent + '▸';
                } else {
                    ci = parseInt(b.indent.length / 4);
                    cn = ['g5', 'r5', 'm5', 'g3', 'r3', 'm3', 'g1', 'r1', 'm1'][ci % 8];
                    s += global[cn](((ref2 = c.text) != null ? ref2 : '') + ' ');
                }
            }
            if ((ref3 = b.type) === '{}' || ref3 === '()' || ref3 === '[]') {
                s += b.type[1];
            }
            return s;
        };
        return console.log(printBlock(block));
    };

    Print.ast = function(header, ast) {
        var i, len, lpad, node, printNode, results;
        console.log(G1(g6("\n " + header)));
        lpad = kstr.lpad('', 19);
        printNode = function(node, indent, visited) {
            var i, len, name, s, value;
            if (indent == null) {
                indent = '';
            }
            if (visited == null) {
                visited = [];
            }
            s = '';
            if (!node) {
                return s;
            }
            if (node.type) {
                s += b6(kstr.lpad(node.line, 4)) + ' ' + blue(kstr.lpad(node.col, 3)) + ' ' + gray(kstr.pad(node.type, 10)) + ' ' + bold(yellow(indent + node.text) + '\n');
            } else if (node instanceof Array) {
                if (indexOf.call(visited, node) >= 0) {
                    return s;
                }
                visited.push(node);
                s += lpad + ' ' + bold(w3(indent + '['));
                for (i = 0, len = node.length; i < len; i++) {
                    value = node[i];
                    s += '\n';
                    s += printNode(value, indent, visited);
                }
                s += lpad + ' ' + bold(w3(indent + ']\n'));
            } else {
                if (indexOf.call(visited, node) >= 0) {
                    return s;
                }
                visited.push(node);
                for (name in node) {
                    value = node[name];
                    s += lpad + ' ' + bold(b8(indent + name));
                    s += '\n';
                    s += printNode(value, indent + '  ', visited);
                }
            }
            return s;
        };
        if (ast instanceof Array) {
            results = [];
            for (i = 0, len = ast.length; i < len; i++) {
                node = ast[i];
                results.push(console.log(printNode(node)));
            }
            return results;
        } else {
            return console.log(printNode(ast));
        }
    };

    Print.astr = function(ast) {
        var node, printNode, s;
        printNode = function(node, indent, visited) {
            var i, len, name, s, value;
            if (indent == null) {
                indent = '';
            }
            if (visited == null) {
                visited = [];
            }
            s = '';
            if (!node) {
                return s;
            }
            if (node.type) {
                s += indent + node.text + '\n';
            } else if (node instanceof Array) {
                if (indexOf.call(visited, node) >= 0) {
                    return s;
                }
                visited.push(node);
                if (!node.length) {
                    s += indent + '[]\n';
                } else {
                    s += indent + '[';
                    for (i = 0, len = node.length; i < len; i++) {
                        value = node[i];
                        s += '\n';
                        s += printNode(value, indent, visited);
                    }
                    s += indent + ']\n';
                }
            } else {
                if (indexOf.call(visited, node) >= 0) {
                    return s;
                }
                visited.push(node);
                for (name in node) {
                    value = node[name];
                    s += indent + name;
                    s += '\n';
                    s += printNode(value, indent + '    ', visited);
                }
            }
            return s;
        };
        if (ast instanceof Array) {
            s = ((function() {
                var i, len, results;
                results = [];
                for (i = 0, len = ast.length; i < len; i++) {
                    node = ast[i];
                    results.push(printNode(node));
                }
                return results;
            })()).join('');
        } else {
            s = printNode(ast);
        }
        return kstr.strip(s, ' \n');
    };

    Print.code = function(msg, code, ext) {
        var tmp;
        if (ext == null) {
            ext = 'js';
        }
        console.log(W1(w5(kstr.lpad(msg + ' ', 80))));
        tmp = slash.tmpfile();
        tmp = slash.swapExt(tmp, ext);
        slash.writeText(tmp, code);
        console.log(childp.execSync(__dirname + "/../node_modules/.bin/colorcat --lineNumbers " + tmp, {
            encoding: 'utf8'
        }));
        return fs.unlink(tmp);
    };

    Print.noon = function(msg, arg) {
        console.log(red(msg));
        return console.log(noon.stringify(arg, {
            colors: true
        }));
    };

    return Print;

})();

module.exports = Print;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJpbnQuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJwcmludC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsMENBQUE7SUFBQTs7QUFRQSxJQUFBLEdBQVMsT0FBQSxDQUFRLE1BQVI7O0FBQ1QsSUFBQSxHQUFTLE9BQUEsQ0FBUSxNQUFSOztBQUNULElBQUEsR0FBUyxPQUFBLENBQVEsTUFBUjs7QUFDVCxLQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVI7O0FBQ1QsTUFBQSxHQUFTLE9BQUEsQ0FBUSxlQUFSOztBQUNULEVBQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7QUFFVCxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVgsQ0FBQTs7QUFFTTs7O0lBUUYsS0FBQyxDQUFBLE1BQUQsR0FBUyxTQUFDLE1BQUQsRUFBUyxNQUFUO0FBQ0YsWUFBQTtRQUFBLE9BQUEsQ0FBQyxHQUFELENBQUssRUFBQSxDQUFHLEVBQUEsQ0FBRyxLQUFBLEdBQU0sTUFBVCxDQUFILENBQUw7UUFBeUIsT0FBQSxDQUN4QixHQUR3QixDQUNwQixFQUFBLENBQUcsSUFBSSxDQUFDLEdBQUwsQ0FBUyxFQUFULEVBQVksRUFBWixFQUFlLEdBQWYsQ0FBSCxDQURvQjtRQUV4QixDQUFBLEdBQUk7QUFDSixhQUFBLHdDQUFBOztZQUNJLENBQUEsSUFBSyxJQUFDLENBQUEsS0FBRCxDQUFPLEdBQVA7QUFEVDtlQUVBLE9BQUEsQ0FBQSxHQUFBLENBQUksQ0FBSjtJQU5DOztJQVFULEtBQUMsQ0FBQSxLQUFELEdBQVEsU0FBQyxHQUFEO0FBRUosWUFBQTtRQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsSUFBTCxDQUFVLEVBQVYsRUFBYSxHQUFHLENBQUMsR0FBakI7UUFDVCxJQUFvQixHQUFHLENBQUMsSUFBSixLQUFZLElBQWhDO0FBQUEsbUJBQU8sR0FBQSxDQUFJLEtBQUosRUFBUDs7UUFDQSxXQUFhLEdBQUcsQ0FBQyxL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QVcsQ0FBWCxFQUFjLEtBQWQ7SUF0Q0c7O0lBOENQLEtBQUMsQ0FBQSxJQUFELEdBQU8sU0FBQyxHQUFELEVBQU0sSUFBTixFQUFZLEdBQVo7QUFDSixZQUFBOztZQURnQixNQUFJOztRQUNwQixPQUFBLENBQUMsR0FBRCxDQUFLLEVBQUEsQ0FBRyxFQUFBLENBQUcsSUFBSSxDQUFDLElBQUwsQ0FBVSxHQUFBLEdBQUksR0FBZCxFQUFrQixFQUFsQixDQUFILENBQUgsQ0FBTDtRQUNDLEdBQUEsR0FBTSxLQUFLLENBQUMsT0FBTixDQUFBO1FBQ04sR0FBQSxHQUFNLEtBQUssQ0FBQyxPQUFOLENBQWMsR0FBZCxFQUFtQixHQUFuQjtRQUNOLEtBQUssQ0FBQyxTQUFOLENBQWdCLEdBQWhCLEVBQXFCLElBQXJCO1FBQXlCLE9BQUEsQ0FDekIsR0FEeUIsQ0FDckIsTUFBTSxDQUFDLFFBQVAsQ0FBbUIsU0FBRCxHQUFXLCtDQUFYLEdBQTBELEdBQTVFLEVBQWtGO1lBQUEsUUFBQSxFQUFTLE1BQVQ7U0FBbEYsQ0FEcUI7ZUFFekIsRUFBRSxDQUFDLE1BQUgsQ0FBVSxHQUFWO0lBTkc7O0lBUVAsS0FBQyxDQUFBLElBQUQsR0FBTyxTQUFDLEdBQUQsRUFBTSxHQUFOO1FBQ0osT0FBQSxDQUFDLEdBQUQsQ0FBSyxHQUFBLENBQUksR0FBSixDQUFMO2VBQVksT0FBQSxDQUNYLEdBRFcsQ0FDUCxJQUFJLENBQUMsU0FBTCxDQUFlLEdBQWYsRUFBb0I7WUFBQSxNQUFBLEVBQU8sSUFBUDtTQUFwQixDQURPO0lBRFI7Ozs7OztBQUlYLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAwMDBcbjAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgIDAwMCAwIDAwMCAgICAgMDAwXG4wMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgICAgIDAwMFxuMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcbiMjI1xuXG5rc3RyICAgPSByZXF1aXJlICdrc3RyJ1xua2xvciAgID0gcmVxdWlyZSAna2xvcidcbm5vb24gICA9IHJlcXVpcmUgJ25vb24nXG5zbGFzaCAgPSByZXF1aXJlICdrc2xhc2gnXG5jaGlsZHAgPSByZXF1aXJlICdjaGlsZF9wcm9jZXNzJ1xuZnMgICAgID0gcmVxdWlyZSAnZnMtZXh0cmEnXG5cbmtsb3Iua29sb3IuZ2xvYmFsaXplKClcblxuY2xhc3MgUHJpbnRcblxuICAgICMgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwMDAwMFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwMCAgICAgICAwMDBcbiAgICAjICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDBcblxuICAgIEB0b2tlbnM6IChoZWFkZXIsIHRva2VucykgLT5cbiAgICAgICAgICAgIGxvZyBSMyB5NSBcIlxcbiAje2hlYWRlcn1cIlxuICAgICAgICAgICAgbG9nIGI2KGtzdHIucGFkICcnIDgwICcgJylcbiAgICAgICAgICAgIHMgPSAnJ1xuICAgICAgICAgICAgZm9yIHRvayBpbiB0b2tlbnNcbiAgICAgICAgICAgICAgICBzICs9IEB0b2tlbiB0b2tcbiAgICAgICAgICAgIGxvZyBzXG5cbiAgICBAdG9rZW46ICh0b2spIC0+XG4gICAgICAgIFxuICAgICAgICBpbmRlbnQgPSBrc3RyLmxwYWQgJycgdG9rLmNvbFxuICAgICAgICByZXR1cm4gcmVkICfil4JcXG4nIGlmIHRvay50eXBlID09ICdubCdcbiAgICAgICAgcmV0dXJuICcnIGlmIHRvay50eXBlIGluIFsnd3MnJ25sJ11cbiAgICAgICAgdG9rdGV4dCA9ICh0b2spID0+IFxuICAgICAgICAgICAgaWYgdG9rLnRleHQgPT0gJycgdGhlbiAnXFxuJytpbmRlbnQgXG4gICAgICAgICAgICBlbHNlIGlmIHRvay50ZXh0IHRoZW4gdG9rLnRleHRcbiAgICAgICAgICAgIGVsc2UgaWYgdG9rLnRva2Vuc1xuICAgICAgICAgICAgICAgICMgJ1xcbicrKChrc3RyLmxwYWQgJycgMjApK3Rvay5pbmRlbnQpKyh0b2sudG9rZW5zLm1hcCAodCkgLT4gdG9rdGV4dCh0KSkuam9pbiAnICdcbiAgICAgICAgICAgICAgICBzID0gJydcbiAgICAgICAgICAgICAgICBmb3IgdCBpbiB0b2sudG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gQHRva2VuKHQpIyArICdcXG4nXG4gICAgICAgICAgICAgICAgJ1xcbicgKyBzXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgJz8/PydcbiAgICAgICAgYjYoa3N0ci5scGFkIHRvay5saW5lLCA0KSArICcgJyArIGJsdWUoa3N0ci5scGFkIHRvay5jb2wsIDMpICsgJyAnICsgZ3JheShrc3RyLnBhZCB0b2sudHlwZSwgMTApICsgJyAnICsgYm9sZCB5ZWxsb3coaW5kZW50ICsgdG9rdGV4dCB0b2spICsgJ1xcbidcbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMFxuICAgICMgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMFxuXG4gICAgQHN0YWNrOiAoc3RhY2ssIG5vZGUsIGNvbG9yPVc0KSAtPlxuXG4gICAgICAgIGxvZyBXMihzdGFjay5qb2luKCcgJykgKyAnICcpICsgY29sb3Igbm9kZSA/ICcnXG4gICAgICAgIFxuICAgIEBzaGVhcDogKHNoZWFwLCBwb3BwZWQpIC0+XG4gICAgICAgIFxuICAgICAgICBzID0gQjIgJyAgICdcbiAgICAgICAgZm9yIHIgaW4gc2hlYXBcbiAgICAgICAgICAgIGlmIHIudHlwZSA9PSAnZXhwcycgXG4gICAgICAgICAgICAgICAgcyArPSBCNSByLnRleHQgKyBCMiAnICdcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBzICs9IFk0IGJsYWNrIHIudGV4dCArIFkyICcgJ1xuICAgICAgICBpZiBwb3BwZWRcbiAgICAgICAgICAgIGMgPSBpZiBwb3BwZWQudHlwZSA9PSAnZXhwcycgdGhlbiBCMSBlbHNlIFcxXG4gICAgICAgICAgICBzICs9IGJsYWNrIGMocG9wcGVkLnRleHQpICsgJyAnXG4gICAgICAgIGxvZyBzXG5cbiAgICAjIDAwMDAwMDAgICAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwXG5cbiAgICBAYmxvY2s6IChoZWFkZXIsIGJsb2NrLCBsZWdlbmQ9ZmFsc2UpIC0+XG5cbiAgICAgICAgbG9nIFIzIHk1IFwiXFxuICN7aGVhZGVyfVwiXG4gICAgICAgIHByaW50QmxvY2sgPSAoYikgLT5cbiAgICAgICAgICAgIGlmIGxlZ2VuZFxuICAgICAgICAgICAgICAgIHMgPSBiLmluZGVudCArIGI2KGtzdHIucnBhZCBiLmxpbmUsIDMpICsgYjUoJy0gJyArIGtzdHIucGFkIGIubGFzdCwgMykgKyB3Mihrc3RyLnJwYWQgYi5jb2wsIDMpICsgeWVsbG93KGIudG9rZW5zLmxlbmd0aClcbiAgICAgICAgICAgICAgICBzICs9ICdcXG4nICsgYi5pbmRlbnRcbiAgICAgICAgICAgIHMgPSBiLmluZGVudFxuICAgICAgICAgICAgaWYgYi50eXBlIGluIFsne30nJygpJydbXSddIHRoZW4gcyArPSBiLnR5cGVbMF0gKyAnICdcbiAgICAgICAgICAgIGZvciBjIGluIGIudG9rZW5zXG4gICAgICAgICAgICAgICAgaWYgYy50b2tlbnM/XG4gICAgICAgICAgICAgICAgICAgIHMgKz0gJ1xcbicgKyBwcmludEJsb2NrKGMpICsgYi5pbmRlbnRcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGMudHlwZSA9PSAnbmwnXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gJ1xcbicrYi5pbmRlbnQrJ+KWuCdcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGNpID0gcGFyc2VJbnQgYi5pbmRlbnQubGVuZ3RoLzRcbiAgICAgICAgICAgICAgICAgICAgY24gPSBbJ2c1JydyNScnbTUnJ2czJydyMycnbTMnJ2cxJydyMScnbTEnXVtjaSU4XVxuICAgICAgICAgICAgICAgICAgICBzICs9IGdsb2JhbFtjbl0gKGMudGV4dCA/ICcnKSArICcgJ1xuICAgICAgICAgICAgaWYgYi50eXBlIGluIFsne30nJygpJydbXSddIHRoZW4gcyArPSBiLnR5cGVbMV1cbiAgICAgICAgICAgIHNcbiAgICAgICAgbG9nIHByaW50QmxvY2sgYmxvY2tcblxuICAgICMgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAgIDAwMFxuICAgICMgMDAwICAgMDAwICAgICAgIDAwMCAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAwMDBcblxuICAgIEBhc3Q6IChoZWFkZXIsIGFzdCkgLT5cblxuICAgICAgICBsb2cgRzEgZzYgXCJcXG4gI3toZWFkZXJ9XCJcbiAgICAgICAgXG4gICAgICAgIGxwYWQgPSBrc3RyLmxwYWQgJycgMTlcblxuICAgICAgICBwcmludE5vZGUgPSAobm9kZSwgaW5kZW50PScnLCB2aXNpdGVkPVtdKSAtPlxuXG4gICAgICAgICAgICBzID0gJydcblxuICAgICAgICAgICAgcmV0dXJuIHMgaWYgbm90IG5vZGVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbm9kZS50eXBlXG4gICAgICAgICAgICAgICAgcyArPSBiNihrc3RyLmxwYWQgbm9kZS5saW5lLCA0KSArICcgJyArIGJsdWUoa3N0ci5scGFkIG5vZGUuY29sLCAzKSArICcgJyArIGdyYXkoa3N0ci5wYWQgbm9kZS50eXBlLCAxMCkgKyAnICcgKyBib2xkIHllbGxvdyhpbmRlbnQgKyBub2RlLnRleHQpICsgJ1xcbidcbiAgICAgICAgICAgIGVsc2UgaWYgbm9kZSBpbnN0YW5jZW9mIEFycmF5XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcmV0dXJuIHMgaWYgbm9kZSBpbiB2aXNpdGVkXG4gICAgICAgICAgICAgICAgdmlzaXRlZC5wdXNoIG5vZGVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBzICs9IGxwYWQgKyAnICcgKyBib2xkIHczKGluZGVudCArICdbJylcbiAgICAgICAgICAgICAgICBmb3IgdmFsdWUgaW4gbm9kZVxuICAgICAgICAgICAgICAgICAgICBzICs9ICdcXG4nIFxuICAgICAgICAgICAgICAgICAgICBzICs9IHByaW50Tm9kZSB2YWx1ZSwgaW5kZW50LCB2aXNpdGVkXG4gICAgICAgICAgICAgICAgcyArPSBscGFkICsgJyAnICsgYm9sZCB3MyhpbmRlbnQgKyAnXVxcbicpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmV0dXJuIHMgaWYgbm9kZSBpbiB2aXNpdGVkXG4gICAgICAgICAgICAgICAgdmlzaXRlZC5wdXNoIG5vZGVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBmb3IgbmFtZSx2YWx1ZSBvZiBub2RlXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gbHBhZCArICcgJyArIGJvbGQgYjgoaW5kZW50ICsgbmFtZSlcbiAgICAgICAgICAgICAgICAgICAgcyArPSAnXFxuJyAgXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gcHJpbnROb2RlIHZhbHVlLCBpbmRlbnQrJyAgJywgdmlzaXRlZFxuICAgICAgICAgICAgc1xuXG4gICAgICAgIGlmIGFzdCBpbnN0YW5jZW9mIEFycmF5XG4gICAgICAgICAgICBsb2cgcHJpbnROb2RlIG5vZGUgZm9yIG5vZGUgaW4gYXN0XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGxvZyBwcmludE5vZGUgYXN0XG5cbiAgICAjICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICBcbiAgICBcbiAgICBAYXN0cjogKGFzdCkgLT5cblxuICAgICAgICBwcmludE5vZGUgPSAobm9kZSwgaW5kZW50PScnLCB2aXNpdGVkPVtdKSAtPlxuXG4gICAgICAgICAgICBzID0gJydcblxuICAgICAgICAgICAgcmV0dXJuIHMgaWYgbm90IG5vZGVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbm9kZS50eXBlXG4gICAgICAgICAgICAgICAgcyArPSBpbmRlbnQgKyBub2RlLnRleHQgKyAnXFxuJ1xuICAgICAgICAgICAgZWxzZSBpZiBub2RlIGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZXR1cm4gcyBpZiBub2RlIGluIHZpc2l0ZWRcbiAgICAgICAgICAgICAgICB2aXNpdGVkLnB1c2ggbm9kZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG5vdCBub2RlLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICBzICs9IGluZGVudCArICdbXVxcbidcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gaW5kZW50ICsgJ1snXG4gICAgICAgICAgICAgICAgICAgIGZvciB2YWx1ZSBpbiBub2RlXG4gICAgICAgICAgICAgICAgICAgICAgICBzICs9ICdcXG4nIFxuICAgICAgICAgICAgICAgICAgICAgICAgcyArPSBwcmludE5vZGUgdmFsdWUsIGluZGVudCwgdmlzaXRlZFxuICAgICAgICAgICAgICAgICAgICBzICs9IGluZGVudCArICddXFxuJ1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJldHVybiBzIGlmIG5vZGUgaW4gdmlzaXRlZFxuICAgICAgICAgICAgICAgIHZpc2l0ZWQucHVzaCBub2RlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZm9yIG5hbWUsdmFsdWUgb2Ygbm9kZVxuICAgICAgICAgICAgICAgICAgICBzICs9IGluZGVudCArIG5hbWVcbiAgICAgICAgICAgICAgICAgICAgcyArPSAnXFxuJyAgXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gcHJpbnROb2RlIHZhbHVlLCBpbmRlbnQrJyAgICAnLCB2aXNpdGVkXG4gICAgICAgICAgICBzXG5cbiAgICAgICAgaWYgYXN0IGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgICAgIHMgPSAocHJpbnROb2RlIG5vZGUgZm9yIG5vZGUgaW4gYXN0KS5qb2luICcnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHMgPSBwcmludE5vZGUgYXN0XG4gICAgICAgICAgICBcbiAgICAgICAga3N0ci5zdHJpcCBzLCAnIFxcbidcbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDBcblxuICAgIEBjb2RlOiAobXNnLCBjb2RlLCBleHQ9J2pzJykgLT5cbiAgICAgICAgbG9nIFcxIHc1IGtzdHIubHBhZCBtc2crJyAnIDgwXG4gICAgICAgIHRtcCA9IHNsYXNoLnRtcGZpbGUoKVxuICAgICAgICB0bXAgPSBzbGFzaC5zd2FwRXh0IHRtcCwgZXh0XG4gICAgICAgIHNsYXNoLndyaXRlVGV4dCB0bXAsIGNvZGVcbiAgICAgICAgbG9nIGNoaWxkcC5leGVjU3luYyBcIiN7X19kaXJuYW1lfS8uLi9ub2RlX21vZHVsZXMvLmJpbi9jb2xvcmNhdCAtLWxpbmVOdW1iZXJzICN7dG1wfVwiIGVuY29kaW5nOid1dGY4J1xuICAgICAgICBmcy51bmxpbmsgdG1wXG5cbiAgICBAbm9vbjogKG1zZywgYXJnKSAtPlxuICAgICAgICBsb2cgcmVkIG1zZ1xuICAgICAgICBsb2cgbm9vbi5zdHJpbmdpZnkgYXJnLCBjb2xvcnM6dHJ1ZVxuXG5tb2R1bGUuZXhwb3J0cyA9IFByaW50XG4iXX0=
//# sourceURL=../coffee/print.coffee