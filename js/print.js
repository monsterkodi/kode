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
                s = b.indent + b6(kstr.rpad(b.line, 3)) + w2(kstr.rpad(b.col, 3)) + yellow(b.tokens.length);
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
            var i, len, name, ref, ref1, s, value;
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
                s += b6(kstr.lpad((ref = node.line) != null ? ref : '', 4)) + ' ' + blue(kstr.lpad((ref1 = node.col) != null ? ref1 : '', 3)) + ' ' + gray(kstr.pad(node.type, 10)) + ' ' + bold(yellow(indent + node.text) + '\n');
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

    Print.astr = function(ast, scopes) {
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
                if (node.length) {
                    for (i = 0, len = node.length; i < len; i++) {
                        value = node[i];
                        s += printNode(value, indent, visited);
                    }
                }
            } else {
                if (indexOf.call(visited, node) >= 0) {
                    return s;
                }
                visited.push(node);
                if ((node.vars != null) && (node.exps != null) && !scopes) {
                    s = printNode(node.exps, indent, visited);
                } else {
                    for (name in node) {
                        value = node[name];
                        s += indent + name;
                        s += '\n';
                        s += printNode(value, indent + '    ', visited);
                    }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJpbnQuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJwcmludC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsMENBQUE7SUFBQTs7QUFRQSxJQUFBLEdBQVMsT0FBQSxDQUFRLE1BQVI7O0FBQ1QsSUFBQSxHQUFTLE9BQUEsQ0FBUSxNQUFSOztBQUNULElBQUEsR0FBUyxPQUFBLENBQVEsTUFBUjs7QUFDVCxLQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVI7O0FBQ1QsTUFBQSxHQUFTLE9BQUEsQ0FBUSxlQUFSOztBQUNULEVBQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7QUFFVCxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVgsQ0FBQTs7QUFFTTs7O0lBUUYsS0FBQyxDQUFBLE1BQUQsR0FBUyxTQUFDLE1BQUQsRUFBUyxNQUFUO0FBQ0YsWUFBQTtRQUFBLE9BQUEsQ0FBQyxHQUFELENBQUssRUFBQSxDQUFHLEVBQUEsQ0FBRyxLQUFBLEdBQU0sTUFBVCxDQUFILENBQUw7UUFBeUIsT0FBQSxDQUN4QixHQUR3QixDQUNwQixFQUFBLENBQUcsSUFBSSxDQUFDLEdBQUwsQ0FBUyxFQUFULEVBQVksRUFBWixFQUFlLEdBQWYsQ0FBSCxDQURvQjtRQUV4QixDQUFBLEdBQUk7QUFDSixhQUFBLHdDQUFBOztZQUNJLENBQUEsSUFBSyxJQUFDLENBQUEsS0FBRCxDQUFPLEdBQVA7QUFEVDtlQUVBLE9BQUEsQ0FBQSxHQUFBLENBQUksQ0FBSjtJQU5DOztJQVFULEtBQUMsQ0FBQSxLQUFELEdBQVEsU0FBQyxHQUFEO0FBRUosWUFBQTtRQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsSUFBTCxDQUFVLEVBQVYsRUFBYSxHQUFHLENBQUMsR0FBakI7UUFDVCxJQUFvQixHQUFHLENBQUMsSUFBSixLQUFZLElBQWhDO0FBQUEsbUJBQU8sR0FBQSxDQUFJLEtBQUosRUFBUDs7UUFDQSxXQUFhLEdBQUcsQ0FBQyxL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QVksR0FBWjtBQUNKLFlBQUE7O1lBRGdCLE1BQUk7O1FBQ3BCLE9BQUEsQ0FBQyxHQUFELENBQUssRUFBQSxDQUFHLEVBQUEsQ0FBRyxJQUFJLENBQUMsSUFBTCxDQUFVLEdBQUEsR0FBSSxHQUFkLEVBQWtCLEVBQWxCLENBQUgsQ0FBSCxDQUFMO1FBQ0MsR0FBQSxHQUFNLEtBQUssQ0FBQyxPQUFOLENBQUE7UUFDTixHQUFBLEdBQU0sS0FBSyxDQUFDLE9BQU4sQ0FBYyxHQUFkLEVBQW1CLEdBQW5CO1FBQ04sS0FBSyxDQUFDLFNBQU4sQ0FBZ0IsR0FBaEIsRUFBcUIsSUFBckI7UUFBeUIsT0FBQSxDQUN6QixHQUR5QixDQUNyQixNQUFNLENBQUMsUUFBUCxDQUFtQixTQUFELEdBQVcsK0NBQVgsR0FBMEQsR0FBNUUsRUFBa0Y7WUFBQSxRQUFBLEVBQVMsTUFBVDtTQUFsRixDQURxQjtlQUV6QixFQUFFLENBQUMsTUFBSCxDQUFVLEdBQVY7SUFORzs7SUFRUCxLQUFDLENBQUEsSUFBRCxHQUFPLFNBQUMsR0FBRCxFQUFNLEdBQU47UUFDSixPQUFBLENBQUMsR0FBRCxDQUFLLEdBQUEsQ0FBSSxHQUFKLENBQUw7ZUFBWSxPQUFBLENBQ1gsR0FEVyxDQUNQLElBQUksQ0FBQyxTQUFMLENBQWUsR0FBZixFQUFvQjtZQUFBLE1BQUEsRUFBTyxJQUFQO1NBQXBCLENBRE87SUFEUjs7Ozs7O0FBSVgsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgIDAwMFxuMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgMDAwIDAgMDAwICAgICAwMDBcbjAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgICAgMDAwXG4wMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuIyMjXG5cbmtzdHIgICA9IHJlcXVpcmUgJ2tzdHInXG5rbG9yICAgPSByZXF1aXJlICdrbG9yJ1xubm9vbiAgID0gcmVxdWlyZSAnbm9vbidcbnNsYXNoICA9IHJlcXVpcmUgJ2tzbGFzaCdcbmNoaWxkcCA9IHJlcXVpcmUgJ2NoaWxkX3Byb2Nlc3MnXG5mcyAgICAgPSByZXF1aXJlICdmcy1leHRyYSdcblxua2xvci5rb2xvci5nbG9iYWxpemUoKVxuXG5jbGFzcyBQcmludFxuXG4gICAgIyAwMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAwMDAwXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAwICAgICAgIDAwMFxuICAgICMgICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuXG4gICAgQHRva2VuczogKGhlYWRlciwgdG9rZW5zKSAtPlxuICAgICAgICAgICAgbG9nIFIzIHk1IFwiXFxuICN7aGVhZGVyfVwiXG4gICAgICAgICAgICBsb2cgYjYoa3N0ci5wYWQgJycgODAgJyAnKVxuICAgICAgICAgICAgcyA9ICcnXG4gICAgICAgICAgICBmb3IgdG9rIGluIHRva2Vuc1xuICAgICAgICAgICAgICAgIHMgKz0gQHRva2VuIHRva1xuICAgICAgICAgICAgbG9nIHNcblxuICAgIEB0b2tlbjogKHRvaykgLT5cbiAgICAgICAgXG4gICAgICAgIGluZGVudCA9IGtzdHIubHBhZCAnJyB0b2suY29sXG4gICAgICAgIHJldHVybiByZWQgJ+KXglxcbicgaWYgdG9rLnR5cGUgPT0gJ25sJ1xuICAgICAgICByZXR1cm4gJycgaWYgdG9rLnR5cGUgaW4gWyd3cycnbmwnXVxuICAgICAgICB0b2t0ZXh0ID0gKHRvaykgPT4gXG4gICAgICAgICAgICBpZiB0b2sudGV4dCA9PSAnJyB0aGVuICdcXG4nK2luZGVudCBcbiAgICAgICAgICAgIGVsc2UgaWYgdG9rLnRleHQgdGhlbiB0b2sudGV4dFxuICAgICAgICAgICAgZWxzZSBpZiB0b2sudG9rZW5zXG4gICAgICAgICAgICAgICAgIyAnXFxuJysoKGtzdHIubHBhZCAnJyAyMCkrdG9rLmluZGVudCkrKHRvay50b2tlbnMubWFwICh0KSAtPiB0b2t0ZXh0KHQpKS5qb2luICcgJ1xuICAgICAgICAgICAgICAgIHMgPSAnJ1xuICAgICAgICAgICAgICAgIGZvciB0IGluIHRvay50b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgcyArPSBAdG9rZW4odCkjICsgJ1xcbidcbiAgICAgICAgICAgICAgICAnXFxuJyArIHNcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAnPz8/J1xuICAgICAgICBiNihrc3RyLmxwYWQgdG9rLmxpbmUsIDQpICsgJyAnICsgYmx1ZShrc3RyLmxwYWQgdG9rLmNvbCwgMykgKyAnICcgKyBncmF5KGtzdHIucGFkIHRvay50eXBlLCAxMCkgKyAnICcgKyBib2xkIHllbGxvdyhpbmRlbnQgKyB0b2t0ZXh0IHRvaykgKyAnXFxuJ1xuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwXG4gICAgIyAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwXG5cbiAgICBAc3RhY2s6IChzdGFjaywgbm9kZSwgY29sb3I9VzQpIC0+XG5cbiAgICAgICAgbG9nIFcyKHN0YWNrLmpvaW4oJyAnKSArICcgJykgKyBjb2xvciBub2RlID8gJydcbiAgICAgICAgXG4gICAgQHNoZWFwOiAoc2hlYXAsIHBvcHBlZCkgLT5cbiAgICAgICAgXG4gICAgICAgIHMgPSBCMiAnICAgJ1xuICAgICAgICBmb3IgciBpbiBzaGVhcFxuICAgICAgICAgICAgaWYgci50eXBlID09ICdleHBzJyBcbiAgICAgICAgICAgICAgICBzICs9IEI1IHIudGV4dCArIEIyICcgJ1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHMgKz0gWTQgYmxhY2sgci50ZXh0ICsgWTIgJyAnXG4gICAgICAgIGlmIHBvcHBlZFxuICAgICAgICAgICAgYyA9IGlmIHBvcHBlZC50eXBlID09ICdleHBzJyB0aGVuIEIxIGVsc2UgVzFcbiAgICAgICAgICAgIHMgKz0gYmxhY2sgYyhwb3BwZWQudGV4dCkgKyAnICdcbiAgICAgICAgbG9nIHNcblxuICAgICMgMDAwMDAwMCAgICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDBcblxuICAgIEBibG9jazogKGhlYWRlciwgYmxvY2ssIGxlZ2VuZD1mYWxzZSkgLT5cblxuICAgICAgICBsb2cgUjMgeTUgXCJcXG4gI3toZWFkZXJ9XCJcbiAgICAgICAgcHJpbnRCbG9jayA9IChiKSAtPlxuICAgICAgICAgICAgaWYgbGVnZW5kXG4gICAgICAgICAgICAgICAgcyA9IGIuaW5kZW50ICsgYjYoa3N0ci5ycGFkIGIubGluZSwgMykgKyB3Mihrc3RyLnJwYWQgYi5jb2wsIDMpICsgeWVsbG93KGIudG9rZW5zLmxlbmd0aClcbiAgICAgICAgICAgICAgICBzICs9ICdcXG4nICsgYi5pbmRlbnRcbiAgICAgICAgICAgIHMgPSBiLmluZGVudFxuICAgICAgICAgICAgaWYgYi50eXBlIGluIFsne30nJygpJydbXSddIHRoZW4gcyArPSBiLnR5cGVbMF0gKyAnICdcbiAgICAgICAgICAgIGZvciBjIGluIGIudG9rZW5zXG4gICAgICAgICAgICAgICAgaWYgYy50b2tlbnM/XG4gICAgICAgICAgICAgICAgICAgIHMgKz0gJ1xcbicgKyBwcmludEJsb2NrKGMpICsgYi5pbmRlbnRcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGMudHlwZSA9PSAnbmwnXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gJ1xcbicrYi5pbmRlbnQrJ+KWuCdcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGNpID0gcGFyc2VJbnQgYi5pbmRlbnQubGVuZ3RoLzRcbiAgICAgICAgICAgICAgICAgICAgY24gPSBbJ2c1JydyNScnbTUnJ2czJydyMycnbTMnJ2cxJydyMScnbTEnXVtjaSU4XVxuICAgICAgICAgICAgICAgICAgICBzICs9IGdsb2JhbFtjbl0gKGMudGV4dCA/ICcnKSArICcgJ1xuICAgICAgICAgICAgaWYgYi50eXBlIGluIFsne30nJygpJydbXSddIHRoZW4gcyArPSBiLnR5cGVbMV1cbiAgICAgICAgICAgIHNcbiAgICAgICAgbG9nIHByaW50QmxvY2sgYmxvY2tcblxuICAgICMgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAgIDAwMFxuICAgICMgMDAwICAgMDAwICAgICAgIDAwMCAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAwMDBcblxuICAgIEBhc3Q6IChoZWFkZXIsIGFzdCkgLT5cblxuICAgICAgICBsb2cgRzEgZzYgXCJcXG4gI3toZWFkZXJ9XCJcbiAgICAgICAgXG4gICAgICAgIGxwYWQgPSBrc3RyLmxwYWQgJycgMTlcblxuICAgICAgICBwcmludE5vZGUgPSAobm9kZSwgaW5kZW50PScnLCB2aXNpdGVkPVtdKSAtPlxuXG4gICAgICAgICAgICBzID0gJydcblxuICAgICAgICAgICAgcmV0dXJuIHMgaWYgbm90IG5vZGVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbm9kZS50eXBlXG4gICAgICAgICAgICAgICAgcyArPSBiNihrc3RyLmxwYWQgbm9kZS5saW5lID8gJycsIDQpICsgJyAnICsgYmx1ZShrc3RyLmxwYWQgbm9kZS5jb2wgPyAnJywgMykgKyAnICcgKyBncmF5KGtzdHIucGFkIG5vZGUudHlwZSwgMTApICsgJyAnICsgYm9sZCB5ZWxsb3coaW5kZW50ICsgbm9kZS50ZXh0KSArICdcXG4nXG4gICAgICAgICAgICBlbHNlIGlmIG5vZGUgaW5zdGFuY2VvZiBBcnJheVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJldHVybiBzIGlmIG5vZGUgaW4gdmlzaXRlZFxuICAgICAgICAgICAgICAgIHZpc2l0ZWQucHVzaCBub2RlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcyArPSBscGFkICsgJyAnICsgYm9sZCB3MyhpbmRlbnQgKyAnWycpXG4gICAgICAgICAgICAgICAgZm9yIHZhbHVlIGluIG5vZGVcbiAgICAgICAgICAgICAgICAgICAgcyArPSAnXFxuJyBcbiAgICAgICAgICAgICAgICAgICAgcyArPSBwcmludE5vZGUgdmFsdWUsIGluZGVudCwgdmlzaXRlZFxuICAgICAgICAgICAgICAgIHMgKz0gbHBhZCArICcgJyArIGJvbGQgdzMoaW5kZW50ICsgJ11cXG4nKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJldHVybiBzIGlmIG5vZGUgaW4gdmlzaXRlZFxuICAgICAgICAgICAgICAgIHZpc2l0ZWQucHVzaCBub2RlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZm9yIG5hbWUsdmFsdWUgb2Ygbm9kZVxuICAgICAgICAgICAgICAgICAgICBzICs9IGxwYWQgKyAnICcgKyBib2xkIGI4KGluZGVudCArIG5hbWUpXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gJ1xcbicgIFxuICAgICAgICAgICAgICAgICAgICBzICs9IHByaW50Tm9kZSB2YWx1ZSwgaW5kZW50KycgICcsIHZpc2l0ZWRcbiAgICAgICAgICAgIHNcblxuICAgICAgICBpZiBhc3QgaW5zdGFuY2VvZiBBcnJheVxuICAgICAgICAgICAgbG9nIHByaW50Tm9kZSBub2RlIGZvciBub2RlIGluIGFzdFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBsb2cgcHJpbnROb2RlIGFzdFxuXG4gICAgIyAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgQGFzdHI6IChhc3QsIHNjb3BlcykgLT5cblxuICAgICAgICBwcmludE5vZGUgPSAobm9kZSwgaW5kZW50PScnLCB2aXNpdGVkPVtdKSAtPlxuXG4gICAgICAgICAgICBzID0gJydcblxuICAgICAgICAgICAgcmV0dXJuIHMgaWYgbm90IG5vZGVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbm9kZS50eXBlXG4gICAgICAgICAgICAgICAgcyArPSBpbmRlbnQgKyBub2RlLnRleHQgKyAnXFxuJ1xuICAgICAgICAgICAgZWxzZSBpZiBub2RlIGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZXR1cm4gcyBpZiBub2RlIGluIHZpc2l0ZWRcbiAgICAgICAgICAgICAgICB2aXNpdGVkLnB1c2ggbm9kZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG5vZGUubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIGZvciB2YWx1ZSBpbiBub2RlXG4gICAgICAgICAgICAgICAgICAgICAgICBzICs9IHByaW50Tm9kZSB2YWx1ZSwgaW5kZW50LCB2aXNpdGVkXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmV0dXJuIHMgaWYgbm9kZSBpbiB2aXNpdGVkXG4gICAgICAgICAgICAgICAgdmlzaXRlZC5wdXNoIG5vZGVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBub2RlLnZhcnM/IGFuZCBub2RlLmV4cHM/IGFuZCBub3Qgc2NvcGVzXG4gICAgICAgICAgICAgICAgICAgIHMgPSBwcmludE5vZGUgbm9kZS5leHBzLCBpbmRlbnQsIHZpc2l0ZWRcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGZvciBuYW1lLHZhbHVlIG9mIG5vZGVcbiAgICAgICAgICAgICAgICAgICAgICAgIHMgKz0gaW5kZW50ICsgbmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgcyArPSAnXFxuJyAgXG4gICAgICAgICAgICAgICAgICAgICAgICBzICs9IHByaW50Tm9kZSB2YWx1ZSwgaW5kZW50KycgICAgJyB2aXNpdGVkXG4gICAgICAgICAgICBzXG5cbiAgICAgICAgaWYgYXN0IGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgICAgIHMgPSAocHJpbnROb2RlIG5vZGUgZm9yIG5vZGUgaW4gYXN0KS5qb2luICcnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHMgPSBwcmludE5vZGUgYXN0XG4gICAgICAgICAgICBcbiAgICAgICAga3N0ci5zdHJpcCBzLCAnIFxcbidcbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDBcblxuICAgIEBjb2RlOiAobXNnLCBjb2RlLCBleHQ9J2pzJykgLT5cbiAgICAgICAgbG9nIFcxIHc1IGtzdHIubHBhZCBtc2crJyAnIDgwXG4gICAgICAgIHRtcCA9IHNsYXNoLnRtcGZpbGUoKVxuICAgICAgICB0bXAgPSBzbGFzaC5zd2FwRXh0IHRtcCwgZXh0XG4gICAgICAgIHNsYXNoLndyaXRlVGV4dCB0bXAsIGNvZGVcbiAgICAgICAgbG9nIGNoaWxkcC5leGVjU3luYyBcIiN7X19kaXJuYW1lfS8uLi9ub2RlX21vZHVsZXMvLmJpbi9jb2xvcmNhdCAtLWxpbmVOdW1iZXJzICN7dG1wfVwiIGVuY29kaW5nOid1dGY4J1xuICAgICAgICBmcy51bmxpbmsgdG1wXG5cbiAgICBAbm9vbjogKG1zZywgYXJnKSAtPlxuICAgICAgICBsb2cgcmVkIG1zZ1xuICAgICAgICBsb2cgbm9vbi5zdHJpbmdpZnkgYXJnLCBjb2xvcnM6dHJ1ZVxuXG5tb2R1bGUuZXhwb3J0cyA9IFByaW50XG4iXX0=
//# sourceURL=../coffee/print.coffee