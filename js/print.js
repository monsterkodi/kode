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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJpbnQuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJwcmludC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsMENBQUE7SUFBQTs7QUFRQSxJQUFBLEdBQVMsT0FBQSxDQUFRLE1BQVI7O0FBQ1QsSUFBQSxHQUFTLE9BQUEsQ0FBUSxNQUFSOztBQUNULElBQUEsR0FBUyxPQUFBLENBQVEsTUFBUjs7QUFDVCxLQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVI7O0FBQ1QsTUFBQSxHQUFTLE9BQUEsQ0FBUSxlQUFSOztBQUNULEVBQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7QUFFVCxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVgsQ0FBQTs7QUFFTTs7O0lBUUYsS0FBQyxDQUFBLE1BQUQsR0FBUyxTQUFDLE1BQUQsRUFBUyxNQUFUO0FBQ0YsWUFBQTtRQUFBLE9BQUEsQ0FBQyxHQUFELENBQUssRUFBQSxDQUFHLEVBQUEsQ0FBRyxLQUFBLEdBQU0sTUFBVCxDQUFILENBQUw7UUFBeUIsT0FBQSxDQUN4QixHQUR3QixDQUNwQixFQUFBLENBQUcsSUFBSSxDQUFDLEdBQUwsQ0FBUyxFQUFULEVBQVksRUFBWixFQUFlLEdBQWYsQ0FBSCxDQURvQjtRQUV4QixDQUFBLEdBQUk7QUFDSixhQUFBLHdDQUFBOztZQUNJLENBQUEsSUFBSyxJQUFDLENBQUEsS0FBRCxDQUFPLEdBQVA7QUFEVDtlQUVBLE9BQUEsQ0FBQSxHQUFBLENBQUksQ0FBSjtJQU5DOztJQVFULEtBQUMsQ0FBQSxLQUFELEdBQVEsU0FBQyxHQUFEO0FBRUosWUFBQTtRQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsSUFBTCxDQUFVLEVBQVYsRUFBYSxHQUFHLENBQUMsR0FBakI7UUFDVCxJQUFvQixHQUFHLENBQUMsSUFBSixLQUFZLElBQWhDO0FBQUEsbUJBQU8sR0FBQSxDQUFJLEtBQUosRUFBUDs7UUFDQSxXQUFhLEdBQUcsQ0FBQyxL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QUFDLEtBQUwsQ0FBVyxDQUFYLEVBQWMsS0FBZDtJQXBDRzs7SUE0Q1AsS0FBQyxDQUFBLElBQUQsR0FBTyxTQUFDLEdBQUQsRUFBTSxJQUFOLEVBQVksR0FBWjtBQUNKLFlBQUE7O1lBRGdCLE1BQUk7O1FBQ3BCLE9BQUEsQ0FBQyxHQUFELENBQUssRUFBQSxDQUFHLEVBQUEsQ0FBRyxJQUFJLENBQUMsSUFBTCxDQUFVLEdBQUEsR0FBSSxHQUFkLEVBQWtCLEVBQWxCLENBQUgsQ0FBSCxDQUFMO1FBQ0MsR0FBQSxHQUFNLEtBQUssQ0FBQyxPQUFOLENBQUE7UUFDTixHQUFBLEdBQU0sS0FBSyxDQUFDLE9BQU4sQ0FBYyxHQUFkLEVBQW1CLEdBQW5CO1FBQ04sS0FBSyxDQUFDLFNBQU4sQ0FBZ0IsR0FBaEIsRUFBcUIsSUFBckI7UUFBeUIsT0FBQSxDQUN6QixHQUR5QixDQUNyQixNQUFNLENBQUMsUUFBUCxDQUFtQixTQUFELEdBQVcsK0NBQVgsR0FBMEQsR0FBNUUsRUFBa0Y7WUFBQSxRQUFBLEVBQVMsTUFBVDtTQUFsRixDQURxQjtlQUV6QixFQUFFLENBQUMsTUFBSCxDQUFVLEdBQVY7SUFORzs7SUFRUCxLQUFDLENBQUEsSUFBRCxHQUFPLFNBQUMsR0FBRCxFQUFNLEdBQU47UUFDSixPQUFBLENBQUMsR0FBRCxDQUFLLEdBQUEsQ0FBSSxHQUFKLENBQUw7ZUFBWSxPQUFBLENBQ1gsR0FEVyxDQUNQLElBQUksQ0FBQyxTQUFMLENBQWUsR0FBZixFQUFvQjtZQUFBLE1BQUEsRUFBTyxJQUFQO1NBQXBCLENBRE87SUFEUjs7Ozs7O0FBSVgsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgIDAwMFxuMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgMDAwIDAgMDAwICAgICAwMDBcbjAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgICAgMDAwXG4wMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuIyMjXG5cbmtzdHIgICA9IHJlcXVpcmUgJ2tzdHInXG5rbG9yICAgPSByZXF1aXJlICdrbG9yJ1xubm9vbiAgID0gcmVxdWlyZSAnbm9vbidcbnNsYXNoICA9IHJlcXVpcmUgJ2tzbGFzaCdcbmNoaWxkcCA9IHJlcXVpcmUgJ2NoaWxkX3Byb2Nlc3MnXG5mcyAgICAgPSByZXF1aXJlICdmcy1leHRyYSdcblxua2xvci5rb2xvci5nbG9iYWxpemUoKVxuXG5jbGFzcyBQcmludFxuXG4gICAgIyAwMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAwMDAwXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAwICAgICAgIDAwMFxuICAgICMgICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuXG4gICAgQHRva2VuczogKGhlYWRlciwgdG9rZW5zKSAtPlxuICAgICAgICAgICAgbG9nIFIzIHk1IFwiXFxuICN7aGVhZGVyfVwiXG4gICAgICAgICAgICBsb2cgYjYoa3N0ci5wYWQgJycgODAgJyAnKVxuICAgICAgICAgICAgcyA9ICcnXG4gICAgICAgICAgICBmb3IgdG9rIGluIHRva2Vuc1xuICAgICAgICAgICAgICAgIHMgKz0gQHRva2VuIHRva1xuICAgICAgICAgICAgbG9nIHNcblxuICAgIEB0b2tlbjogKHRvaykgLT5cbiAgICAgICAgXG4gICAgICAgIGluZGVudCA9IGtzdHIubHBhZCAnJyB0b2suY29sXG4gICAgICAgIHJldHVybiByZWQgJ+KXglxcbicgaWYgdG9rLnR5cGUgPT0gJ25sJ1xuICAgICAgICByZXR1cm4gJycgaWYgdG9rLnR5cGUgaW4gWyd3cycnbmwnXVxuICAgICAgICB0b2t0ZXh0ID0gKHRvaykgPT4gXG4gICAgICAgICAgICBpZiB0b2sudGV4dCA9PSAnJyB0aGVuICdcXG4nK2luZGVudCBcbiAgICAgICAgICAgIGVsc2UgaWYgdG9rLnRleHQgdGhlbiB0b2sudGV4dFxuICAgICAgICAgICAgZWxzZSBpZiB0b2sudG9rZW5zXG4gICAgICAgICAgICAgICAgIyAnXFxuJysoKGtzdHIubHBhZCAnJyAyMCkrdG9rLmluZGVudCkrKHRvay50b2tlbnMubWFwICh0KSAtPiB0b2t0ZXh0KHQpKS5qb2luICcgJ1xuICAgICAgICAgICAgICAgIHMgPSAnJ1xuICAgICAgICAgICAgICAgIGZvciB0IGluIHRvay50b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgcyArPSBAdG9rZW4odCkjICsgJ1xcbidcbiAgICAgICAgICAgICAgICAnXFxuJyArIHNcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAnPz8/J1xuICAgICAgICBiNihrc3RyLmxwYWQgdG9rLmxpbmUsIDQpICsgJyAnICsgYmx1ZShrc3RyLmxwYWQgdG9rLmNvbCwgMykgKyAnICcgKyBncmF5KGtzdHIucGFkIHRvay50eXBlLCAxMCkgKyAnICcgKyBib2xkIHllbGxvdyhpbmRlbnQgKyB0b2t0ZXh0IHRvaykgKyAnXFxuJ1xuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwXG4gICAgIyAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwXG5cbiAgICBAc3RhY2s6IChzdGFjaywgbm9kZSwgY29sb3I9VzQpIC0+XG5cbiAgICAgICAgbG9nIFcyKHN0YWNrLmpvaW4oJyAnKSArICcgJykgKyBjb2xvciBub2RlID8gJydcbiAgICAgICAgXG4gICAgQHNoZWFwOiAoc2hlYXAsIHBvcHBlZCkgLT5cbiAgICAgICAgXG4gICAgICAgIHMgPSBCMiAnICAgJ1xuICAgICAgICBmb3IgciBpbiBzaGVhcFxuICAgICAgICAgICAgaWYgci50eXBlID09ICdleHBzJyBcbiAgICAgICAgICAgICAgICBzICs9IEI1IHIudGV4dCArIEIyICcgJ1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHMgKz0gWTQgYmxhY2sgci50ZXh0ICsgWTIgJyAnXG4gICAgICAgIGlmIHBvcHBlZFxuICAgICAgICAgICAgYyA9IGlmIHBvcHBlZC50eXBlID09ICdleHBzJyB0aGVuIEIxIGVsc2UgVzFcbiAgICAgICAgICAgIHMgKz0gYmxhY2sgYyhwb3BwZWQudGV4dCkgKyAnICdcbiAgICAgICAgbG9nIHNcblxuICAgICMgMDAwMDAwMCAgICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDBcblxuICAgIEBibG9jazogKGhlYWRlciwgYmxvY2ssIGxlZ2VuZD1mYWxzZSkgLT5cblxuICAgICAgICBsb2cgUjMgeTUgXCJcXG4gI3toZWFkZXJ9XCJcbiAgICAgICAgcHJpbnRCbG9jayA9IChiKSAtPlxuICAgICAgICAgICAgaWYgbGVnZW5kXG4gICAgICAgICAgICAgICAgcyA9IGIuaW5kZW50ICsgYjYoa3N0ci5ycGFkIGIubGluZSwgMykgKyBiNSgnLSAnICsga3N0ci5wYWQgYi5sYXN0LCAzKSArIHcyKGtzdHIucnBhZCBiLmNvbCwgMykgKyB5ZWxsb3coYi50b2tlbnMubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHMgKz0gJ1xcbicgKyBiLmluZGVudFxuICAgICAgICAgICAgcyA9IGIuaW5kZW50XG4gICAgICAgICAgICBpZiBiLnR5cGUgaW4gWyd7fScnKCknJ1tdJ10gdGhlbiBzICs9IGIudHlwZVswXSArICcgJ1xuICAgICAgICAgICAgZm9yIGMgaW4gYi50b2tlbnNcbiAgICAgICAgICAgICAgICBpZiBjLnRva2Vucz9cbiAgICAgICAgICAgICAgICAgICAgcyArPSAnXFxuJyArIHByaW50QmxvY2soYykgKyBiLmluZGVudFxuICAgICAgICAgICAgICAgIGVsc2UgaWYgYy50eXBlID09ICdubCdcbiAgICAgICAgICAgICAgICAgICAgcyArPSAnXFxuJytiLmluZGVudCsn4pa4J1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgY2kgPSBwYXJzZUludCBiLmluZGVudC5sZW5ndGgvNFxuICAgICAgICAgICAgICAgICAgICBjbiA9IFsnZzUnJ3I1JydtNScnZzMnJ3IzJydtMycnZzEnJ3IxJydtMSddW2NpJThdXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gZ2xvYmFsW2NuXSAoYy50ZXh0ID8gJycpICsgJyAnXG4gICAgICAgICAgICBpZiBiLnR5cGUgaW4gWyd7fScnKCknJ1tdJ10gdGhlbiBzICs9IGIudHlwZVsxXVxuICAgICAgICAgICAgc1xuICAgICAgICBsb2cgcHJpbnRCbG9jayBibG9ja1xuXG4gICAgIyAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgICAgICAgMDAwICAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgIDAwMFxuXG4gICAgQGFzdDogKGhlYWRlciwgYXN0KSAtPlxuXG4gICAgICAgIGxvZyBHMSBnNiBcIlxcbiAje2hlYWRlcn1cIlxuICAgICAgICBcbiAgICAgICAgbHBhZCA9IGtzdHIubHBhZCAnJyAxOVxuXG4gICAgICAgIHByaW50Tm9kZSA9IChub2RlLCBpbmRlbnQ9JycsIHZpc2l0ZWQ9W10pIC0+XG5cbiAgICAgICAgICAgIHMgPSAnJ1xuXG4gICAgICAgICAgICByZXR1cm4gcyBpZiBub3Qgbm9kZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBub2RlLnR5cGVcbiAgICAgICAgICAgICAgICBzICs9IGI2KGtzdHIubHBhZCBub2RlLmxpbmUgPyAnJywgNCkgKyAnICcgKyBibHVlKGtzdHIubHBhZCBub2RlLmNvbCA/ICcnLCAzKSArICcgJyArIGdyYXkoa3N0ci5wYWQgbm9kZS50eXBlLCAxMCkgKyAnICcgKyBib2xkIHllbGxvdyhpbmRlbnQgKyBub2RlLnRleHQpICsgJ1xcbidcbiAgICAgICAgICAgIGVsc2UgaWYgbm9kZSBpbnN0YW5jZW9mIEFycmF5XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcmV0dXJuIHMgaWYgbm9kZSBpbiB2aXNpdGVkXG4gICAgICAgICAgICAgICAgdmlzaXRlZC5wdXNoIG5vZGVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBzICs9IGxwYWQgKyAnICcgKyBib2xkIHczKGluZGVudCArICdbJylcbiAgICAgICAgICAgICAgICBmb3IgdmFsdWUgaW4gbm9kZVxuICAgICAgICAgICAgICAgICAgICBzICs9ICdcXG4nIFxuICAgICAgICAgICAgICAgICAgICBzICs9IHByaW50Tm9kZSB2YWx1ZSwgaW5kZW50LCB2aXNpdGVkXG4gICAgICAgICAgICAgICAgcyArPSBscGFkICsgJyAnICsgYm9sZCB3MyhpbmRlbnQgKyAnXVxcbicpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmV0dXJuIHMgaWYgbm9kZSBpbiB2aXNpdGVkXG4gICAgICAgICAgICAgICAgdmlzaXRlZC5wdXNoIG5vZGVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBmb3IgbmFtZSx2YWx1ZSBvZiBub2RlXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gbHBhZCArICcgJyArIGJvbGQgYjgoaW5kZW50ICsgbmFtZSlcbiAgICAgICAgICAgICAgICAgICAgcyArPSAnXFxuJyAgXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gcHJpbnROb2RlIHZhbHVlLCBpbmRlbnQrJyAgJywgdmlzaXRlZFxuICAgICAgICAgICAgc1xuXG4gICAgICAgIGlmIGFzdCBpbnN0YW5jZW9mIEFycmF5XG4gICAgICAgICAgICBsb2cgcHJpbnROb2RlIG5vZGUgZm9yIG5vZGUgaW4gYXN0XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGxvZyBwcmludE5vZGUgYXN0XG5cbiAgICAjICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICBcbiAgICBcbiAgICBAYXN0cjogKGFzdCwgc2NvcGVzKSAtPlxuXG4gICAgICAgIHByaW50Tm9kZSA9IChub2RlLCBpbmRlbnQ9JycsIHZpc2l0ZWQ9W10pIC0+XG5cbiAgICAgICAgICAgIHMgPSAnJ1xuXG4gICAgICAgICAgICByZXR1cm4gcyBpZiBub3Qgbm9kZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBub2RlLnR5cGVcbiAgICAgICAgICAgICAgICBzICs9IGluZGVudCArIG5vZGUudGV4dCArICdcXG4nXG4gICAgICAgICAgICBlbHNlIGlmIG5vZGUgaW5zdGFuY2VvZiBBcnJheVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJldHVybiBzIGlmIG5vZGUgaW4gdmlzaXRlZFxuICAgICAgICAgICAgICAgIHZpc2l0ZWQucHVzaCBub2RlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgbm9kZS5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgZm9yIHZhbHVlIGluIG5vZGVcbiAgICAgICAgICAgICAgICAgICAgICAgIHMgKz0gcHJpbnROb2RlIHZhbHVlLCBpbmRlbnQsIHZpc2l0ZWRcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZXR1cm4gcyBpZiBub2RlIGluIHZpc2l0ZWRcbiAgICAgICAgICAgICAgICB2aXNpdGVkLnB1c2ggbm9kZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG5vZGUudmFycz8gYW5kIG5vZGUuZXhwcz8gYW5kIG5vdCBzY29wZXNcbiAgICAgICAgICAgICAgICAgICAgcyA9IHByaW50Tm9kZSBub2RlLmV4cHMsIGluZGVudCwgdmlzaXRlZFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgZm9yIG5hbWUsdmFsdWUgb2Ygbm9kZVxuICAgICAgICAgICAgICAgICAgICAgICAgcyArPSBpbmRlbnQgKyBuYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICBzICs9ICdcXG4nICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHMgKz0gcHJpbnROb2RlIHZhbHVlLCBpbmRlbnQrJyAgICAnIHZpc2l0ZWRcbiAgICAgICAgICAgIHNcblxuICAgICAgICBpZiBhc3QgaW5zdGFuY2VvZiBBcnJheVxuICAgICAgICAgICAgcyA9IChwcmludE5vZGUgbm9kZSBmb3Igbm9kZSBpbiBhc3QpLmpvaW4gJydcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcyA9IHByaW50Tm9kZSBhc3RcbiAgICAgICAgICAgIFxuICAgICAgICBrc3RyLnN0cmlwIHMsICcgXFxuJ1xuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMFxuXG4gICAgQGNvZGU6IChtc2csIGNvZGUsIGV4dD0nanMnKSAtPlxuICAgICAgICBsb2cgVzEgdzUga3N0ci5scGFkIG1zZysnICcgODBcbiAgICAgICAgdG1wID0gc2xhc2gudG1wZmlsZSgpXG4gICAgICAgIHRtcCA9IHNsYXNoLnN3YXBFeHQgdG1wLCBleHRcbiAgICAgICAgc2xhc2gud3JpdGVUZXh0IHRtcCwgY29kZVxuICAgICAgICBsb2cgY2hpbGRwLmV4ZWNTeW5jIFwiI3tfX2Rpcm5hbWV9Ly4uL25vZGVfbW9kdWxlcy8uYmluL2NvbG9yY2F0IC0tbGluZU51bWJlcnMgI3t0bXB9XCIgZW5jb2Rpbmc6J3V0ZjgnXG4gICAgICAgIGZzLnVubGluayB0bXBcblxuICAgIEBub29uOiAobXNnLCBhcmcpIC0+XG4gICAgICAgIGxvZyByZWQgbXNnXG4gICAgICAgIGxvZyBub29uLnN0cmluZ2lmeSBhcmcsIGNvbG9yczp0cnVlXG5cbm1vZHVsZS5leHBvcnRzID0gUHJpbnRcbiJdfQ==
//# sourceURL=../coffee/print.coffee