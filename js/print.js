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
        var i, idx, len, s, tok;
        console.log(R3(y5("\n " + header)));
        console.log(b6(kstr.pad('', 80, ' ')));
        s = '';
        for (idx = i = 0, len = tokens.length; i < len; idx = ++i) {
            tok = tokens[idx];
            s += this.token(tok, idx);
        }
        return console.log(s);
    };

    Print.token = function(tok, idx) {
        var indent, ref, toktext;
        if (idx == null) {
            idx = '';
        }
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
        return b6(kstr.lpad(tok.line, 4)) + ' ' + blue(kstr.lpad(tok.col, 3)) + ' ' + w2(kstr.lpad(idx, 4)) + ' ' + gray(kstr.pad(tok.type, 10)) + ' ' + bold(yellow(indent + toktext(tok)) + '\n');
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
            switch (r.type) {
                case 'exps':
                    s += B5(r.text) + B2(' ');
                    break;
                case 'stack':
                    s += W4(r.text) + W2(' ');
                    break;
                case 'rhs':
                    s += R3(r1(r.text)) + R1(' ');
                    break;
                case 'lhs':
                    s += G3(g1(r.text)) + G1(' ');
                    break;
                default:
                    s += Y4(black(r.text) + Y2(' '));
            }
        }
        if (popped) {
            c = (function() {
                switch (popped.type) {
                    case 'exps':
                        return B1;
                    case 'stack':
                        return W3;
                    default:
                        return W1;
                }
            })();
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
                if (node.length) {
                    s += lpad + ' ' + indent + bold(w3('['));
                    for (i = 0, len = node.length; i < len; i++) {
                        value = node[i];
                        s += '\n';
                        s += printNode(value, indent, visited);
                    }
                    s += lpad + ' ' + bold(w3(indent + ']\n'));
                } else {
                    s += lpad + ' ' + indent + bold(w3('[]\n'));
                }
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
        if (!arg) {
            arg = msg;
            msg = null;
        }
        if (msg) {
            console.log(red(msg));
        }
        return console.log(noon.stringify(arg, {
            colors: true
        }));
    };

    return Print;

})();

module.exports = Print;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJpbnQuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJwcmludC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsMENBQUE7SUFBQTs7QUFRQSxJQUFBLEdBQVMsT0FBQSxDQUFRLE1BQVI7O0FBQ1QsSUFBQSxHQUFTLE9BQUEsQ0FBUSxNQUFSOztBQUNULElBQUEsR0FBUyxPQUFBLENBQVEsTUFBUjs7QUFDVCxLQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVI7O0FBQ1QsTUFBQSxHQUFTLE9BQUEsQ0FBUSxlQUFSOztBQUNULEVBQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7QUFFVCxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVgsQ0FBQTs7QUFFTTs7O0lBUUYsS0FBQyxDQUFBLE1BQUQsR0FBUyxTQUFDLE1BQUQsRUFBUyxNQUFUO0FBRU4sWUFBQTtRQUFBLE9BQUEsQ0FBQyxHQUFELENBQUssRUFBQSxDQUFHLEVBQUEsQ0FBRyxLQUFBLEdBQU0sTUFBVCxDQUFILENBQUw7UUFBeUIsT0FBQSxDQUN4QixHQUR3QixDQUNwQixFQUFBLENBQUcsSUFBSSxDQUFDLEdBQUwsQ0FBUyxFQUFULEVBQVksRUFBWixFQUFlLEdBQWYsQ0FBSCxDQURvQjtRQUV4QixDQUFBLEdBQUk7QUFDSixhQUFBLG9EQUFBOztZQUNJLENBQUEsSUFBSyxJQUFDLENBQUEsS0FBRCxDQUFPLEdBQVAsRUFBWSxHQUFaO0FBRFQ7ZUFFQSxPQUFBLENBQUEsR0FBQSxDQUFJLENBQUo7SUFQSzs7SUFTVCxLQUFDLENBQUEsS0FBRCxHQUFRLFNBQUMsR0FBRCxFQUFNLEdBQU47QUFFSixZQUFBOztZQUZVLE1BQUk7O1FBRWQsTUFBQSxHQUFTLElBQUksQ0FBQyxJQUFMLENBQVUsRUFBVixFQUFhLEdBQUcsQ0FBQyxHQUFqQjtRQUNULElBQW9CLEdBQUcsQ0FBQyxJQUFKLEtBQVksSUFBaEM7QUFBQSxtQkFBTyxHQUFBLENBQUksS0FBSixFQUFQOztRQUNBLFdBQWEsR0FBRyxDQUFDLEtBQUosS0FBYSxJQUFiLElBQUEsR0FBQSxLQUFpQixJQUE5QjtBQUFBLG1CQUFPLEdBQVA7O1FBQ0EsT0FBQSxHQUFVLENBQUEsU0FBQSxLQUFBO21CQUFBLFNBQUMsR0FBRDtBQUNOLG9CQUFBO2dCQUFBLElBQUcsR0FBRyxDQUFDLElBQUosS0FBWSxFQUFmOzJCQUF1QixJQUFBLEdBQUssT0FBNUI7aUJBQUEsTUFDSyxJQUFHLEdBQUcsQ0FBQyxJQUFQOzJCQUFpQixHQUFHLENBQUMsS0FBckI7aUJBQUEsTUFDQSxJQUFHLEdBQUcsQ0FBQyxNQUFQO29CQUNELENBQUEsR0FBSTtBQUNKO0FBQUEseUJBQUEsc0NBQUE7O3dCQUNJLENBQUEsSUFBSyxLQUFDLENBQUEsS0FBRCxDQUFPLENBQVA7QUFEVDsyQkFFQSxJQUFBLEdBQU8sRUFKTjtpQkFBQSxNQUFBOzJCQU1ELE1BTkM7O1lBSEM7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO2VBVVYsRUFBQSxDQUFHLElBQUksQ0FBQyxJQUFMLENBQVUsR0FBRyxDQUFDLElBQWQsRUFBb0IsQ0FBcEIsQ0FBSCxDQUFBLEdBQTRCLEdBQTVCLEdBQWtDLElBQUEsQ0FBSyxJQUFJLENBQUMsSUFBTCxDQUFVLEdBQUcsQ0FBQyxHQUFkLEVBQW1CLENBQW5CLENBQUwsQ0FBbEMsR0FBK0QsR0FBL0QsR0FBcUUsRUFBQSxDQUFHLElBQUksQ0FBQyxJQUFMLENBQVUsR0FBVixFQUFlLENBQWYsQ0FBSCxDQUFyRSxHQUE0RixHQUE1RixHQUFrRyxJQUFBLENBQUssSUFBSSxDQUFDLEdBQUwsQ0FBUyxHQUFHLENBQUMsSUFBYixFQUFtQixFQUFuQixDQUFMLENBQWxHLEdBQWdJLEdBQWhJLEdBQXNJLElBQUEsQ0FBSyxNQUFBLENBQU8sTUFBQSxHQUFTLE9BQUEsQ0FBUSxHQUFSLENBQWhCLENBQUEsR0FBK0IsSUFBcEM7SUFmbEk7O0lBdUJSLEtBQUMsQ0FBQSxLQUFELEdBQVEsU0FBQyxLQUFELEVBQVEsSUFBUixFQUFjLEtBQWQ7O1lBQWMsUUFBTTs7ZUFFekIsT0FBQSxDQUFDLEdBQUQsQ0FBSyxFQUFBLENBQUcsS0FBSyxDQUFDLElBQU4sQ0FBVyxHQUFYLENBQUEsR0FBa0IsR0FBckIsQ0FBQSxHQUE0QixLQUFBLGdCQUFNLE9BQU8sRUFBYixDQUFqQztJQUZLOztJQUlSLEtBQUMsQ0FBQSxLQUFELEdBQVEsU0FBQyxLQUFELEVBQVEsTUFBUjtBQUVKLFlBQUE7UUFBQSxDQUFBLEdBQUksRUFBQSxDQUFHLEtBQUg7QUFDSixhQUFBLHVDQUFBOztBQUNJLG9CQUFPLENBQUMsQ0FBQyxJQUFUO0FBQUEscUJBQ1MsTUFEVDtvQkFDc0IsQ0FBQSxJQUFLLEVBQUEsQ0FBRyxDQUFDLENBQUMsSUFBTCxDQUFBLEdBQWEsRUFBQSxDQUFHLEdBQUg7QUFBL0I7QUFEVCxxQkFFUyxPQUZUO29CQUVzQixDQUFBLElBQUssRUFBQSxDQUFHLENBQUMsQ0FBQyxJQUFMLENBQUEsR0FBYSxFQUFBLENBQUcsR0FBSDtBQUEvQjtBQUZULHFCQUdTLEtBSFQ7b0JBR3NCLENBQUEsSUFBSyxFQUFBLENBQUcsRUFBQSxDQUFHLENBQUMsQ0FBQyxJQUFMLENBQUgsQ0FBQSxHQUFnQixFQUFBLENBQUcsR0FBSDtBQUFsQztBQUhULHFCQUlTLEtBSlQ7b0JBSXNCLENBQUEsSUFBSyxFQUFBLENBQUcsRUFBQSxDQUFHLENBQUMsQ0FBQyxJQUFMLENBQUgsQ0FBQSxHQUFnQixFQUFBLENBQUcsR0FBSDtBQUFsQztBQUpUO29CQUtzQixDQUFBLElBQUssRUFBQSxDQUFHLEtBQUEsQ0FBTSxDQUFDLENBQUMsSUFBUixDQUFBLEdBQWdCLEVBQUEsQ0FBRyxHQUFILENBQW5CO0FBTDNCO0FBREo7UUFPQSxJQUFHLE1BQUg7WUFDSSxDQUFBO0FBQUksd0JBQU8sTUFBTSxDQUFDLElBQWQ7QUFBQSx5QkFDSyxNQURMOytCQUNpQjtBQURqQix5QkFFSyxPQUZMOytCQUVrQjtBQUZsQjsrQkFHSztBQUhMOztZQUlKLENBQUEsSUFBSyxLQUFBLENBQU0sQ0FBQSxDQUFFLE1BQU0sQ0FBQyxJQUFULENBQUEsR0FBaUIsR0FBdkIsRUFMVDs7ZUFNQSxPQUFBLENBQUEsR0FBQSxDQUFJLENBQUo7SUFoQkk7O0lBd0JSLEtBQUMsQ0FBQSxLQUFELEdBQVEsU0FBQyxNQUFELEVBQVMsS0FBVCxFQUFnQixNQUFoQjtBQUVMLFlBQUE7O1lBRnFCLFNBQU87O1FBRTVCLE9BQUEsQ0FBQyxHQUFELENBQUssRUFBQSxDQUFHLEVBQUEsQ0FBRyxLQUFBLEdBQU0sTUFBVCxDQUFILENBQUw7UUFDQyxVQUFBLEdBQWEsU0FBQyxDQUFEO0FBQ1QsZ0JBQUE7WUFBQSxJQUFHLE1BQUg7Z0JBQ0ksQ0FBQSxHQUFJLENBQUMsQ0FBQyxNQUFGLEdBQVcsRUFBQSxDQUFHLElBQUksQ0FBQyxJQUFMLENBQVUsQ0FBQyxDQUFDLElBQVosRUFBa0IsQ0FBbEIsQ0FBSCxDQUFYLEdBQXFDLEVBQUEsQ0FBRyxJQUFJLENBQUMsSUFBTCxDQUFVLENBQUMsQ0FBQyxHQUFaLEVBQWlCLENBQWpCLENBQUgsQ0FBckMsR0FBOEQsTUFBQSxDQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBaEI7Z0JBQ2xFLENBQUEsSUFBSyxJQUFBLEdBQU8sQ0FBQyxDQUFDLE9BRmxCOztZQUdBLENBQUEsR0FBSSxDQUFDLENBQUM7WUFDTixXQUFHLENBQUMsQ0FBQyxLQUFGLEtBQVcsSUFBWCxJQUFBLEdBQUEsS0FBZSxJQUFmLElBQUEsR0FBQSxLQUFtQixJQUF0QjtnQkFBaUMsQ0FBQSxJQUFLLENBQUMsQ0FBQyxJQUFLLENBQUEsQ0FBQSxDQUFQLEdBQVksSUFBbEQ7O0FBQ0E7QUFBQSxpQkFBQSxzQ0FBQTs7Z0JBQ0ksSUFBRyxnQkFBSDtvQkFDSSxDQUFBLElBQUssSUFBQSxHQUFPLFVBQUEsQ0FBVyxDQUFYLENBQVAsR0FBdUIsQ0FBQyxDQUFDLE9BRGxDO2lCQUFBLE1BRUssSUFBRyxDQUFDLENBQUMsSUFBRixLQUFVLElBQWI7b0JBQ0QsQ0FBQSxJQUFLLElBQUEsR0FBSyxDQUFDLENBQUMsTUFBUCxHQUFjLElBRGxCO2lCQUFBLE1BQUE7b0JBR0QsRUFBQSxHQUFLLFFBQUEsQ0FBUyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQVQsR0FBZ0IsQ0FBekI7b0JBQ0wsRUFBQSxHQUFLLENBQUMsSUFBRCxFQUFLLElBQUwsRUFBUyxJQUFULEVBQWEsSUFBYixFQUFpQixJQUFqQixFQUFxQixJQUFyQixFQUF5QixJQUF6QixFQUE2QixJQUE3QixFQUFpQyxJQUFqQyxDQUF1QyxDQUFBLEVBQUEsR0FBRyxDQUFIO29CQUM1QyxDQUFBLElBQUssTUFBTyxDQUFBLEVBQUEsQ0FBUCxDQUFXLGtDQUFVLEVBQVYsQ0FBQSxHQUFnQixHQUEzQixFQUxKOztBQUhUO1lBU0EsWUFBRyxDQUFDLENBQUMsS0FBRixLQUFXLElBQVgsSUFBQSxJQUFBLEtBQWUsSUFBZixJQUFBLElBQUEsS0FBbUIsSUFBdEI7Z0JBQWlDLENBQUEsSUFBSyxDQUFDLENBQUMsSUFBSyxDQUFBLENBQUEsRUFBN0M7O21CQUNBO1FBaEJTO2VBaUJiLE9BQUEsQ0FBQSxHQUFBLENBQUksVUFBQSxDQUFXLEtBQVgsQ0FBSjtJQXBCSTs7SUE0QlIsS0FBQyxDQUFBLEdBQUQsR0FBTSxTQUFDLE1BQUQsRUFBUyxHQUFUO0FBRUgsWUFBQTtRQUFBLE9BQUEsQ0FBQyxHQUFELENBQUssRUFBQSxDQUFHLEVBQUEsQ0FBRyxLQUFBLEdBQU0sTUFBVCxDQUFILENBQUw7UUFFQyxJQUFBLEdBQU8sSUFBSSxDQUFDLElBQUwsQ0FBVSxFQUFWLEVBQWEsRUFBYjtRQUVQLFNBQUEsR0FBWSxTQUFDLElBQUQsRUFBTyxNQUFQLEVBQWtCLE9BQWxCO0FBRVIsZ0JBQUE7O2dCQUZlLFNBQU87OztnQkFBSSxVQUFROztZQUVsQyxDQUFBLEdBQUk7WUFFSixJQUFZLENBQUksSUFBaEI7QUFBQSx1QkFBTyxFQUFQOztZQUVBLElBQUcsSUFBSSxDQUFDLElBQVI7Z0JBQ0ksQ0FBQSxJQUFLLEVBQUEsQ0FBRyxJQUFJLENBQUMsSUFBTCxtQ0FBc0IsRUFBdEIsRUFBMEIsQ0FBMUIsQ0FBSCxDQUFBLEdBQWtDLEdBQWxDLEdBQXdDLElBQUEsQ0FBSyxJQUFJLENBQUMsSUFBTCxvQ0FBcUIsRUFBckIsRUFBeUIsQ0FBekIsQ0FBTCxDQUF4QyxHQUEyRSxHQUEzRSxHQUFpRixJQUFBLENBQUssSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFJLENBQUMsSUFBZCxFQUFvQixFQUFwQixDQUFMLENBQWpGLEdBQWdILEdBQWhILEdBQXNILElBQUEsQ0FBSyxNQUFBLENBQU8sTUFBQSxHQUFTLElBQUksQ0FBQyxJQUFyQixDQUFBLEdBQTZCLElBQWxDLEVBRC9IO2FBQUEsTUFFSyxJQUFHLElBQUEsWUFBZ0IsS0FBbkI7Z0JBRUQsSUFBWSxhQUFRLE9BQVIsRUFBQSxJQUFBLE1BQVo7QUFBQSwyQkFBTyxFQUFQOztnQkFDQSxPQUFPLENBQUMsSUFBUixDQUFhLElBQWI7Z0JBRUEsSUFBRyxJQUFJLENBQUMsTUFBUjtvQkFDSSxDQUFBLElBQUssSUFBQSxHQUFPLEdBQVAsR0FBYSxNQUFiLEdBQXNCLElBQUEsQ0FBSyxFQUFBLENBQUcsR0FBSCxDQUFMO0FBQzNCLHlCQUFBLHNDQUFBOzt3QkFDSSxDQUFBLElBQUs7d0JBQ0wsQ0FBQSxJQUFLLFNBQUEsQ0FBVSxLQUFWLEVBQWlCLE1BQWpCLEVBQXlCLE9BQXpCO0FBRlQ7b0JBR0EsQ0FBQSxJQUFLLElBQUEsR0FBTyxHQUFQLEdBQWEsSUFBQSxDQUFLLEVBQUEsQ0FBRyxNQUFBLEdBQVMsS0FBWixDQUFMLEVBTHRCO2lCQUFBLE1BQUE7b0JBT0ksQ0FBQSxJQUFLLElBQUEsR0FBTyxHQUFQLEdBQWEsTUFBYixHQUFzQixJQUFBLENBQUssRUFBQSxDQUFHLE1BQUgsQ0FBTCxFQVAvQjtpQkFMQzthQUFBLE1BQUE7Z0JBY0QsSUFBWSxhQUFRLE9BQVIsRUFBQSxJQUFBLE1BQVo7QUFBQSwyQkFBTyxFQUFQOztnQkFDQSxPQUFPLENBQUMsSUFBUixDQUFhLElBQWI7QUFFQSxxQkFBQSxZQUFBOztvQkFDSSxDQUFBLElBQUssSUFBQSxHQUFPLEdBQVAsR0FBYSxJQUFBLENBQUssRUFBQSxDQUFHLE1BQUEsR0FBUyxJQUFaLENBQUw7b0JBQ2xCLENBQUEsSUFBSztvQkFDTCxDQUFBLElBQUssU0FBQSxDQUFVLEtBQVYsRUFBaUIsTUFBQSxHQUFPLElBQXhCLEVBQThCLE9BQTlCO0FBSFQsaUJBakJDOzttQkFxQkw7UUE3QlE7UUErQlosSUFBRyxHQUFBLFlBQWUsS0FBbEI7QUFDRztpQkFBQSxxQ0FBQTs7NkJBQUEsT0FBQSxDQUFDLEdBQUQsQ0FBSyxTQUFBLENBQVUsSUFBVixDQUFMO0FBQUE7MkJBREg7U0FBQSxNQUFBO21CQUdHLE9BQUEsQ0FBQyxHQUFELENBQUssU0FBQSxDQUFVLEdBQVYsQ0FBTCxFQUhIOztJQXJDRTs7SUFnRE4sS0FBQyxDQUFBLElBQUQsR0FBTyxTQUFDLEdBQUQsRUFBTSxNQUFOO0FBRUgsWUFBQTtRQUFBLFNBQUEsR0FBWSxTQUFDLElBQUQsRUFBTyxNQUFQLEVBQWtCLE9BQWxCO0FBRVIsZ0JBQUE7O2dCQUZlLFNBQU87OztnQkFBSSxVQUFROztZQUVsQyxDQUFBLEdBQUk7WUFFSixJQUFZLENBQUksSUFBaEI7QUFBQSx1QkFBTyxFQUFQOztZQUVBLElBQUcsSUFBSSxDQUFDLElBQVI7Z0JBQ0ksQ0FBQSxJQUFLLE1BQUEsR0FBUyxJQUFJLENBQUMsSUFBZCxHQUFxQixLQUQ5QjthQUFBLE1BRUssSUFBRyxJQUFBLFlBQWdCLEtBQW5CO2dCQUVELElBQVksYUFBUSxPQUFSLEVBQUEsSUFBQSxNQUFaO0FBQUEsMkJBQU8sRUFBUDs7Z0JBQ0EsT0FBTyxDQUFDLElBQVIsQ0FBYSxJQUFiO2dCQUVBLElBQUcsSUFBSSxDQUFDLE1BQVI7QUFDSSx5QkFBQSxzQ0FBQTs7d0JBQ0ksQ0FBQSxJQUFLLFNBQUEsQ0FBVSxLQUFWLEVBQWlCLE1BQWpCLEVBQXlCLE9BQXpCO0FBRFQscUJBREo7aUJBTEM7YUFBQSxNQUFBO2dCQVNELElBQVksYUFBUSxPQUFSLEVBQUEsSUFBQSxNQUFaO0FBQUEsMkJBQU8sRUFBUDs7Z0JBQ0EsT0FBTyxDQUFDLElBQVIsQ0FBYSxJQUFiO2dCQUVBLElBQUcsbUJBQUEsSUFBZSxtQkFBZixJQUE4QixDQUFJLE1BQXJDO29CQUNJLENBQUEsR0FBSSxTQUFBLENBQVUsSUFBSSxDQUFDLElBQWYsRUFBcUIsTUFBckIsRUFBNkIsT0FBN0IsRUFEUjtpQkFBQSxNQUFBO0FBR0kseUJBQUEsWUFBQTs7d0JBQ0ksQ0FBQSxJQUFLLE1BQUEsR0FBUzt3QkFDZCxDQUFBLElBQUs7d0JBQ0wsQ0FBQSxJQUFLLFNBQUEsQ0FBVSxLQUFWLEVBQWlCLE1BQUEsR0FBTyxNQUF4QixFQUErQixPQUEvQjtBQUhULHFCQUhKO2lCQVpDOzttQkFtQkw7UUEzQlE7UUE2QlosSUFBRyxHQUFBLFlBQWUsS0FBbEI7WUFDSSxDQUFBLEdBQUk7O0FBQUM7cUJBQUEscUNBQUE7O2lDQUFBLFNBQUEsQ0FBVSxJQUFWO0FBQUE7O2dCQUFELENBQWdDLENBQUMsSUFBakMsQ0FBc0MsRUFBdEMsRUFEUjtTQUFBLE1BQUE7WUFHSSxDQUFBLEdBQUksU0FBQSxDQUFVLEdBQVYsRUFIUjs7ZUFLQSxJQUFJLENBQUMsS0FBTCxDQUFXLENBQVgsRUFBYyxLQUFkO0lBcENHOztJQTRDUCxLQUFDLENBQUEsSUFBRCxHQUFPLFNBQUMsR0FBRCxFQUFNLElBQU4sRUFBWSxHQUFaO0FBQ0osWUFBQTs7WUFEZ0IsTUFBSTs7UUFDcEIsT0FBQSxDQUFDLEdBQUQsQ0FBSyxFQUFBLENBQUcsRUFBQSxDQUFHLElBQUksQ0FBQyxJQUFMLENBQVUsR0FBQSxHQUFJLEdBQWQsRUFBa0IsRUFBbEIsQ0FBSCxDQUFILENBQUw7UUFDQyxHQUFBLEdBQU0sS0FBSyxDQUFDLE9BQU4sQ0FBQTtRQUNOLEdBQUEsR0FBTSxLQUFLLENBQUMsT0FBTixDQUFjLEdBQWQsRUFBbUIsR0FBbkI7UUFDTixLQUFLLENBQUMsU0FBTixDQUFnQixHQUFoQixFQUFxQixJQUFyQjtRQUF5QixPQUFBLENBQ3pCLEdBRHlCLENBQ3JCLE1BQU0sQ0FBQyxRQUFQLENBQW1CLFNBQUQsR0FBVywrQ0FBWCxHQUEwRCxHQUE1RSxFQUFrRjtZQUFBLFFBQUEsRUFBUyxNQUFUO1NBQWxGLENBRHFCO2VBRXpCLEVBQUUsQ0FBQyxNQUFILENBQVUsR0FBVjtJQU5HOztJQVFQLEtBQUMsQ0FBQSxJQUFELEdBQU8sU0FBQyxHQUFELEVBQU0sR0FBTjtRQUNILElBQUcsQ0FBSSxHQUFQO1lBQ0ksR0FBQSxHQUFNO1lBQ04sR0FBQSxHQUFNLEtBRlY7O1FBR0EsSUFBZSxHQUFmO1lBQUEsT0FBQSxDQUFBLEdBQUEsQ0FBSSxHQUFBLENBQUksR0FBSixDQUFKLEVBQUE7O2VBQWtCLE9BQUEsQ0FDbEIsR0FEa0IsQ0FDZCxJQUFJLENBQUMsU0FBTCxDQUFlLEdBQWYsRUFBb0I7WUFBQSxNQUFBLEVBQU8sSUFBUDtTQUFwQixDQURjO0lBSmY7Ozs7OztBQU9YLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAwMDBcbjAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgIDAwMCAwIDAwMCAgICAgMDAwXG4wMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgICAgIDAwMFxuMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcbiMjI1xuXG5rc3RyICAgPSByZXF1aXJlICdrc3RyJ1xua2xvciAgID0gcmVxdWlyZSAna2xvcidcbm5vb24gICA9IHJlcXVpcmUgJ25vb24nXG5zbGFzaCAgPSByZXF1aXJlICdrc2xhc2gnXG5jaGlsZHAgPSByZXF1aXJlICdjaGlsZF9wcm9jZXNzJ1xuZnMgICAgID0gcmVxdWlyZSAnZnMtZXh0cmEnXG5cbmtsb3Iua29sb3IuZ2xvYmFsaXplKClcblxuY2xhc3MgUHJpbnRcblxuICAgICMgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwMDAwMFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwMCAgICAgICAwMDBcbiAgICAjICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDBcblxuICAgIEB0b2tlbnM6IChoZWFkZXIsIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIGxvZyBSMyB5NSBcIlxcbiAje2hlYWRlcn1cIlxuICAgICAgICBsb2cgYjYoa3N0ci5wYWQgJycgODAgJyAnKVxuICAgICAgICBzID0gJydcbiAgICAgICAgZm9yIHRvayxpZHggaW4gdG9rZW5zXG4gICAgICAgICAgICBzICs9IEB0b2tlbiB0b2ssIGlkeFxuICAgICAgICBsb2cgc1xuXG4gICAgQHRva2VuOiAodG9rLCBpZHg9JycpIC0+XG4gICAgICAgIFxuICAgICAgICBpbmRlbnQgPSBrc3RyLmxwYWQgJycgdG9rLmNvbFxuICAgICAgICByZXR1cm4gcmVkICfil4JcXG4nIGlmIHRvay50eXBlID09ICdubCdcbiAgICAgICAgcmV0dXJuICcnIGlmIHRvay50eXBlIGluIFsnd3MnJ25sJ11cbiAgICAgICAgdG9rdGV4dCA9ICh0b2spID0+IFxuICAgICAgICAgICAgaWYgdG9rLnRleHQgPT0gJycgdGhlbiAnXFxuJytpbmRlbnQgXG4gICAgICAgICAgICBlbHNlIGlmIHRvay50ZXh0IHRoZW4gdG9rLnRleHRcbiAgICAgICAgICAgIGVsc2UgaWYgdG9rLnRva2Vuc1xuICAgICAgICAgICAgICAgIHMgPSAnJ1xuICAgICAgICAgICAgICAgIGZvciB0IGluIHRvay50b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgcyArPSBAdG9rZW4odCkjICsgJ1xcbidcbiAgICAgICAgICAgICAgICAnXFxuJyArIHNcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAnPz8/J1xuICAgICAgICBiNihrc3RyLmxwYWQgdG9rLmxpbmUsIDQpICsgJyAnICsgYmx1ZShrc3RyLmxwYWQgdG9rLmNvbCwgMykgKyAnICcgKyB3Mihrc3RyLmxwYWQgaWR4LCA0KSArICcgJyArIGdyYXkoa3N0ci5wYWQgdG9rLnR5cGUsIDEwKSArICcgJyArIGJvbGQgeWVsbG93KGluZGVudCArIHRva3RleHQgdG9rKSArICdcXG4nXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDBcbiAgICAjICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDBcblxuICAgIEBzdGFjazogKHN0YWNrLCBub2RlLCBjb2xvcj1XNCkgLT5cblxuICAgICAgICBsb2cgVzIoc3RhY2suam9pbignICcpICsgJyAnKSArIGNvbG9yIG5vZGUgPyAnJ1xuICAgICAgICBcbiAgICBAc2hlYXA6IChzaGVhcCwgcG9wcGVkKSAtPlxuICAgICAgICBcbiAgICAgICAgcyA9IEIyICcgICAnXG4gICAgICAgIGZvciByIGluIHNoZWFwXG4gICAgICAgICAgICBzd2l0Y2ggci50eXBlXG4gICAgICAgICAgICAgICAgd2hlbiAnZXhwcycgIHRoZW4gcyArPSBCNShyLnRleHQpICsgQjIgJyAnXG4gICAgICAgICAgICAgICAgd2hlbiAnc3RhY2snIHRoZW4gcyArPSBXNChyLnRleHQpICsgVzIgJyAnXG4gICAgICAgICAgICAgICAgd2hlbiAncmhzJyAgIHRoZW4gcyArPSBSMyhyMSByLnRleHQpICsgUjEgJyAnXG4gICAgICAgICAgICAgICAgd2hlbiAnbGhzJyAgIHRoZW4gcyArPSBHMyhnMSByLnRleHQpICsgRzEgJyAnXG4gICAgICAgICAgICAgICAgZWxzZSAgICAgICAgICAgICAgcyArPSBZNCBibGFjayhyLnRleHQpICsgWTIgJyAnXG4gICAgICAgIGlmIHBvcHBlZFxuICAgICAgICAgICAgYyA9IHN3aXRjaCBwb3BwZWQudHlwZSBcbiAgICAgICAgICAgICAgICB3aGVuICdleHBzJyB0aGVuIEIxIFxuICAgICAgICAgICAgICAgIHdoZW4gJ3N0YWNrJyB0aGVuIFczXG4gICAgICAgICAgICAgICAgZWxzZSBXMVxuICAgICAgICAgICAgcyArPSBibGFjayBjKHBvcHBlZC50ZXh0KSArICcgJ1xuICAgICAgICBsb2cgc1xuXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMFxuICAgICMgMDAwMDAwMCAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMFxuXG4gICAgQGJsb2NrOiAoaGVhZGVyLCBibG9jaywgbGVnZW5kPWZhbHNlKSAtPlxuXG4gICAgICAgIGxvZyBSMyB5NSBcIlxcbiAje2hlYWRlcn1cIlxuICAgICAgICBwcmludEJsb2NrID0gKGIpIC0+XG4gICAgICAgICAgICBpZiBsZWdlbmRcbiAgICAgICAgICAgICAgICBzID0gYi5pbmRlbnQgKyBiNihrc3RyLnJwYWQgYi5saW5lLCAzKSArIHcyKGtzdHIucnBhZCBiLmNvbCwgMykgKyB5ZWxsb3coYi50b2tlbnMubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHMgKz0gJ1xcbicgKyBiLmluZGVudFxuICAgICAgICAgICAgcyA9IGIuaW5kZW50XG4gICAgICAgICAgICBpZiBiLnR5cGUgaW4gWyd7fScnKCknJ1tdJ10gdGhlbiBzICs9IGIudHlwZVswXSArICcgJ1xuICAgICAgICAgICAgZm9yIGMgaW4gYi50b2tlbnNcbiAgICAgICAgICAgICAgICBpZiBjLnRva2Vucz9cbiAgICAgICAgICAgICAgICAgICAgcyArPSAnXFxuJyArIHByaW50QmxvY2soYykgKyBiLmluZGVudFxuICAgICAgICAgICAgICAgIGVsc2UgaWYgYy50eXBlID09ICdubCdcbiAgICAgICAgICAgICAgICAgICAgcyArPSAnXFxuJytiLmluZGVudCsn4pa4J1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgY2kgPSBwYXJzZUludCBiLmluZGVudC5sZW5ndGgvNFxuICAgICAgICAgICAgICAgICAgICBjbiA9IFsnZzUnJ3I1JydtNScnZzMnJ3IzJydtMycnZzEnJ3IxJydtMSddW2NpJThdXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gZ2xvYmFsW2NuXSAoYy50ZXh0ID8gJycpICsgJyAnXG4gICAgICAgICAgICBpZiBiLnR5cGUgaW4gWyd7fScnKCknJ1tdJ10gdGhlbiBzICs9IGIudHlwZVsxXVxuICAgICAgICAgICAgc1xuICAgICAgICBsb2cgcHJpbnRCbG9jayBibG9ja1xuXG4gICAgIyAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgICAgICAgMDAwICAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgIDAwMFxuXG4gICAgQGFzdDogKGhlYWRlciwgYXN0KSAtPlxuXG4gICAgICAgIGxvZyBHMSBnNiBcIlxcbiAje2hlYWRlcn1cIlxuICAgICAgICBcbiAgICAgICAgbHBhZCA9IGtzdHIubHBhZCAnJyAxOVxuXG4gICAgICAgIHByaW50Tm9kZSA9IChub2RlLCBpbmRlbnQ9JycsIHZpc2l0ZWQ9W10pIC0+XG5cbiAgICAgICAgICAgIHMgPSAnJ1xuXG4gICAgICAgICAgICByZXR1cm4gcyBpZiBub3Qgbm9kZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBub2RlLnR5cGVcbiAgICAgICAgICAgICAgICBzICs9IGI2KGtzdHIubHBhZCBub2RlLmxpbmUgPyAnJywgNCkgKyAnICcgKyBibHVlKGtzdHIubHBhZCBub2RlLmNvbCA/ICcnLCAzKSArICcgJyArIGdyYXkoa3N0ci5wYWQgbm9kZS50eXBlLCAxMCkgKyAnICcgKyBib2xkIHllbGxvdyhpbmRlbnQgKyBub2RlLnRleHQpICsgJ1xcbidcbiAgICAgICAgICAgIGVsc2UgaWYgbm9kZSBpbnN0YW5jZW9mIEFycmF5XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcmV0dXJuIHMgaWYgbm9kZSBpbiB2aXNpdGVkXG4gICAgICAgICAgICAgICAgdmlzaXRlZC5wdXNoIG5vZGVcblxuICAgICAgICAgICAgICAgIGlmIG5vZGUubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gbHBhZCArICcgJyArIGluZGVudCArIGJvbGQgdzMoJ1snKVxuICAgICAgICAgICAgICAgICAgICBmb3IgdmFsdWUgaW4gbm9kZVxuICAgICAgICAgICAgICAgICAgICAgICAgcyArPSAnXFxuJyBcbiAgICAgICAgICAgICAgICAgICAgICAgIHMgKz0gcHJpbnROb2RlIHZhbHVlLCBpbmRlbnQsIHZpc2l0ZWRcbiAgICAgICAgICAgICAgICAgICAgcyArPSBscGFkICsgJyAnICsgYm9sZCB3MyhpbmRlbnQgKyAnXVxcbicpXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBzICs9IGxwYWQgKyAnICcgKyBpbmRlbnQgKyBib2xkIHczKCdbXVxcbicpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmV0dXJuIHMgaWYgbm9kZSBpbiB2aXNpdGVkXG4gICAgICAgICAgICAgICAgdmlzaXRlZC5wdXNoIG5vZGVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBmb3IgbmFtZSx2YWx1ZSBvZiBub2RlXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gbHBhZCArICcgJyArIGJvbGQgYjgoaW5kZW50ICsgbmFtZSlcbiAgICAgICAgICAgICAgICAgICAgcyArPSAnXFxuJyAgXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gcHJpbnROb2RlIHZhbHVlLCBpbmRlbnQrJyAgJywgdmlzaXRlZFxuICAgICAgICAgICAgc1xuXG4gICAgICAgIGlmIGFzdCBpbnN0YW5jZW9mIEFycmF5XG4gICAgICAgICAgICBsb2cgcHJpbnROb2RlIG5vZGUgZm9yIG5vZGUgaW4gYXN0XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGxvZyBwcmludE5vZGUgYXN0XG5cbiAgICAjICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICBcbiAgICBcbiAgICBAYXN0cjogKGFzdCwgc2NvcGVzKSAtPlxuXG4gICAgICAgIHByaW50Tm9kZSA9IChub2RlLCBpbmRlbnQ9JycsIHZpc2l0ZWQ9W10pIC0+XG5cbiAgICAgICAgICAgIHMgPSAnJ1xuXG4gICAgICAgICAgICByZXR1cm4gcyBpZiBub3Qgbm9kZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBub2RlLnR5cGVcbiAgICAgICAgICAgICAgICBzICs9IGluZGVudCArIG5vZGUudGV4dCArICdcXG4nXG4gICAgICAgICAgICBlbHNlIGlmIG5vZGUgaW5zdGFuY2VvZiBBcnJheVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJldHVybiBzIGlmIG5vZGUgaW4gdmlzaXRlZFxuICAgICAgICAgICAgICAgIHZpc2l0ZWQucHVzaCBub2RlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgbm9kZS5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgZm9yIHZhbHVlIGluIG5vZGVcbiAgICAgICAgICAgICAgICAgICAgICAgIHMgKz0gcHJpbnROb2RlIHZhbHVlLCBpbmRlbnQsIHZpc2l0ZWRcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZXR1cm4gcyBpZiBub2RlIGluIHZpc2l0ZWRcbiAgICAgICAgICAgICAgICB2aXNpdGVkLnB1c2ggbm9kZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG5vZGUudmFycz8gYW5kIG5vZGUuZXhwcz8gYW5kIG5vdCBzY29wZXNcbiAgICAgICAgICAgICAgICAgICAgcyA9IHByaW50Tm9kZSBub2RlLmV4cHMsIGluZGVudCwgdmlzaXRlZFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgZm9yIG5hbWUsdmFsdWUgb2Ygbm9kZVxuICAgICAgICAgICAgICAgICAgICAgICAgcyArPSBpbmRlbnQgKyBuYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICBzICs9ICdcXG4nICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHMgKz0gcHJpbnROb2RlIHZhbHVlLCBpbmRlbnQrJyAgICAnIHZpc2l0ZWRcbiAgICAgICAgICAgIHNcblxuICAgICAgICBpZiBhc3QgaW5zdGFuY2VvZiBBcnJheVxuICAgICAgICAgICAgcyA9IChwcmludE5vZGUgbm9kZSBmb3Igbm9kZSBpbiBhc3QpLmpvaW4gJydcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcyA9IHByaW50Tm9kZSBhc3RcbiAgICAgICAgICAgIFxuICAgICAgICBrc3RyLnN0cmlwIHMsICcgXFxuJ1xuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMFxuXG4gICAgQGNvZGU6IChtc2csIGNvZGUsIGV4dD0nanMnKSAtPlxuICAgICAgICBsb2cgVzEgdzUga3N0ci5scGFkIG1zZysnICcgODBcbiAgICAgICAgdG1wID0gc2xhc2gudG1wZmlsZSgpXG4gICAgICAgIHRtcCA9IHNsYXNoLnN3YXBFeHQgdG1wLCBleHRcbiAgICAgICAgc2xhc2gud3JpdGVUZXh0IHRtcCwgY29kZVxuICAgICAgICBsb2cgY2hpbGRwLmV4ZWNTeW5jIFwiI3tfX2Rpcm5hbWV9Ly4uL25vZGVfbW9kdWxlcy8uYmluL2NvbG9yY2F0IC0tbGluZU51bWJlcnMgI3t0bXB9XCIgZW5jb2Rpbmc6J3V0ZjgnXG4gICAgICAgIGZzLnVubGluayB0bXBcblxuICAgIEBub29uOiAobXNnLCBhcmcpIC0+XG4gICAgICAgIGlmIG5vdCBhcmdcbiAgICAgICAgICAgIGFyZyA9IG1zZ1xuICAgICAgICAgICAgbXNnID0gbnVsbFxuICAgICAgICBsb2cgcmVkIG1zZyBpZiBtc2dcbiAgICAgICAgbG9nIG5vb24uc3RyaW5naWZ5IGFyZywgY29sb3JzOnRydWVcblxubW9kdWxlLmV4cG9ydHMgPSBQcmludFxuIl19
//# sourceURL=../coffee/print.coffee