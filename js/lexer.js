// koffee 1.20.0

/*
000      00000000  000   000  00000000  00000000
000      000        000 000   000       000   000
000      0000000     00000    0000000   0000000
000      000        000 000   000       000   000
0000000  00000000  000   000  00000000  000   000
 */
var Lexer, kstr, noon, slash;

noon = require('noon');

slash = require('kslash');

kstr = require('kstr');

Lexer = (function() {
    function Lexer(kode) {
        var key, pat, ref, reg;
        this.kode = kode;
        this.debug = this.kode.args.debug;
        this.verbose = this.kode.args.verbose;
        this.raw = this.kode.args.raw;
        this.patterns = noon.load(slash.join(__dirname, '../coffee/lexer.noon'));
        this.regs = [];
        ref = this.patterns;
        for (key in ref) {
            pat = ref[key];
            if (typeof pat === 'string') {
                this.regs.push([key, new RegExp(pat)]);
            } else if (pat instanceof Array) {
                pat = pat.map(function(p) {
                    return kstr.escapeRegexp("" + p);
                });
                reg = '\\b(' + pat.join('|') + ')\\b';
                this.regs.push([key, new RegExp(reg)]);
            }
        }
    }


    /*
        converts text into a list of token objects
        token object:
            type: string        # any of the keys in lexer.noon
            text: string        # text of match
            line: number        # line number
            col:  number        # start index in line
     */

    Lexer.prototype.tokenize = function(text) {
        var after, before, col, i, key, len, line, lines, match, ref, ref1, ref2, reg, tokens, value;
        tokens = [];
        line = 1;
        col = 0;
        while (text.length) {
            before = text.length;
            ref = this.regs;
            for (i = 0, len = ref.length; i < len; i++) {
                ref1 = ref[i], key = ref1[0], reg = ref1[1];
                match = text.match(reg);
                if ((match != null ? match.index : void 0) === 0) {
                    value = key === 'nl' ? '' : match[0];
                    if (key === 'then') {
                        value = 'then';
                        key = 'keyword';
                    }
                    if (value === 'then' && ((ref2 = tokens.slice(-2, -1)[0]) != null ? ref2.text : void 0) === 'else') {

                    } else {
                        tokens.push({
                            type: key,
                            text: value,
                            line: line,
                            col: col
                        });
                    }
                    if (key === 'nl') {
                        col = 0;
                        line++;
                    } else if (key === 'comment' || key === 'triple') {
                        lines = value.split('\n');
                        line += lines.length - 1;
                        if (lines.length > 1) {
                            col = lines.slice(-1)[0].length;
                        } else {
                            col += value.length;
                        }
                    } else {
                        col += value.length;
                    }
                    text = text.slice(match[0].length);
                    break;
                }
            }
            after = text.length;
            if (before === after) {
                console.log("stray character " + text[0] + " in line " + line + " col " + col);
                tokens.push({
                    type: 'stray',
                    text: text[0],
                    line: line,
                    col: col
                });
                text = text.slice(1);
            }
        }
        return tokens;
    };

    Lexer.prototype.unslash = function(tokens) {
        var idx, newTokens, ref, tok;
        newTokens = [];
        idx = 0;
        while (idx < tokens.length) {
            tok = tokens[idx];
            if (tok.text === '\\') {
                idx += 1;
                while ((ref = tokens[idx].type) === 'nl' || ref === 'ws') {
                    idx += 1;
                }
            } else {
                newTokens.push(tok);
                idx += 1;
            }
        }
        return newTokens;
    };

    Lexer.prototype.mergeop = function(tokens) {
        var idx, newTokens, ref, ref1, tok;
        newTokens = [];
        idx = 0;
        while (idx < tokens.length) {
            tok = tokens[idx];
            if (tok.type === 'op' && ((ref = tok.text) !== '--' && ref !== '++')) {
                newTokens.push(tok);
                idx += 1;
                while ((ref1 = tokens[idx].type) === 'nl' || ref1 === 'ws') {
                    idx += 1;
                }
            } else {
                newTokens.push(tok);
                idx += 1;
            }
        }
        return newTokens;
    };

    Lexer.prototype.uncomment = function(tokens) {
        var idx, newTokens, tok;
        newTokens = [];
        idx = 0;
        while (idx < tokens.length) {
            tok = tokens[idx];
            if (tok.type === 'comment') {
                idx += 1;
                continue;
            }
            newTokens.push(tok);
            idx += 1;
        }
        return newTokens;
    };


    /*
        converts list of tokens into tree of blocks
        block:
            type:  'block'
            tokens: array           # tokens of the block
            indent: string          # indentation string
            line:   number          # first line number
            col:    number
    
        ws tokens and empty lines are pruned from the tree
        nl tokens are only kept between lines of the same block
     */

    Lexer.prototype.blockify = function(tokens) {
        var block, blocks, i, idx, j, len, nxt, outdentTo, ref, ref1, ref2, ref3, results, tok;
        tokens = this.unslash(tokens);
        tokens = this.uncomment(tokens);
        tokens = this.mergeop(tokens);
        blocks = [];
        block = {
            type: 'block',
            tokens: [],
            indent: '',
            line: 1,
            col: 0
        };
        blocks.push(block);
        outdentTo = function(depth, line) {
            var results;
            results = [];
            while (depth < block.indent.length) {
                blocks.pop();
                results.push(block = blocks.slice(-1)[0]);
            }
            return results;
        };
        ref1 = (function() {
            results = [];
            for (var j = 0, ref = tokens.length; 0 <= ref ? j < ref : j > ref; 0 <= ref ? j++ : j--){ results.push(j); }
            return results;
        }).apply(this);
        for (i = 0, len = ref1.length; i < len; i++) {
            idx = ref1[i];
            tok = tokens[idx];
            if (tok.type === 'nl') {
                nxt = tokens[idx + 1];
                if ((ref2 = nxt != null ? nxt.type : void 0) === 'nl') {
                    continue;
                }
                if ((nxt != null ? nxt.type : void 0) === 'ws') {
                    if (((ref3 = tokens[idx + 2]) != null ? ref3.type : void 0) === 'nl' || idx + 1 >= tokens.length - 1) {
                        continue;
                    }
                    if (nxt.text.length > block.indent.length) {
                        block = {
                            type: 'block',
                            tokens: [],
                            line: nxt.line,
                            indent: nxt.text,
                            col: nxt.text.length
                        };
                        blocks.slice(-1)[0].tokens.push(block);
                        blocks.push(block);
                        continue;
                    } else if (nxt.text.length < block.indent.length) {
                        outdentTo(nxt.text.length, nxt.line);
                    }
                } else if (nxt) {
                    if (block.indent.length) {
                        outdentTo(0, nxt.line);
                    }
                }
            } else if (tok.type === 'ws') {
                continue;
            }
            block.tokens.push(tok);
        }
        return blocks[0];
    };

    return Lexer;

})();

module.exports = Lexer;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGV4ZXIuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJsZXhlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsSUFBQSxHQUFRLE9BQUEsQ0FBUSxNQUFSOztBQUNSLEtBQUEsR0FBUSxPQUFBLENBQVEsUUFBUjs7QUFDUixJQUFBLEdBQVEsT0FBQSxDQUFRLE1BQVI7O0FBRUY7SUFFQyxlQUFDLElBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLE9BQUQ7UUFFQSxJQUFDLENBQUEsS0FBRCxHQUFZLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3ZCLElBQUMsQ0FBQSxPQUFELEdBQVksSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDdkIsSUFBQyxDQUFBLEdBQUQsR0FBWSxJQUFDLENBQUEsSUFBSSxDQUFDLElBQUksQ0FBQztRQUV2QixJQUFDLENBQUEsUUFBRCxHQUFZLElBQUksQ0FBQyxJQUFMLENBQVUsS0FBSyxDQUFDLElBQU4sQ0FBVyxTQUFYLEVBQXNCLHNCQUF0QixDQUFWO1FBRVosSUFBQyxDQUFBLElBQUQsR0FBUTtBQUNSO0FBQUEsYUFBQSxVQUFBOztZQUNJLElBQUcsT0FBTyxHQUFQLEtBQWMsUUFBakI7Z0JBQ0ksSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFOLENBQVcsQ0FBQyxHQUFELEVBQU0sSUFBSSxNQUFKLENBQVcsR0FBWCxDQUFOLENBQVgsRUFESjthQUFBLE1BRUssSUFBRyxHQUFBLFlBQWUsS0FBbEI7Z0JBQ0QsR0FBQSxHQUFNLEdBQUcsQ0FBQyxHQUFKLENBQVEsU0FBQyxDQUFEOzJCQUFPLElBQUksQ0FBQyxZQUFMLENBQWtCLEVBQUEsR0FBRyxDQUFyQjtnQkFBUCxDQUFSO2dCQUNOLEdBQUEsR0FBTSxNQUFBLEdBQVMsR0FBRyxDQUFDLElBQUosQ0FBUyxHQUFULENBQVQsR0FBeUI7Z0JBQy9CLElBQUMsQ0FB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QUEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFsQixDQUF1QixLQUF2Qjt3QkFDQSxNQUFNLENBQUMsSUFBUCxDQUFZLEtBQVo7QUFDQSxpQ0FMSjtxQkFBQSxNQU9LLElBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFULEdBQWtCLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBbEM7d0JBQ0QsU0FBQSxDQUFVLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBbkIsRUFBMkIsR0FBRyxDQUFDLElBQS9CLEVBREM7cUJBWlQ7aUJBQUEsTUFlSyxJQUFHLEdBQUg7b0JBQ0QsSUFBRyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQWhCO3dCQUNJLFNBQUEsQ0FBVSxDQUFWLEVBQWEsR0FBRyxDQUFDLElBQWpCLEVBREo7cUJBREM7aUJBckJUO2FBQUEsTUF5QkssSUFBRyxHQUFHLENBQUMsSUFBSixLQUFZLElBQWY7QUFDRCx5QkFEQzs7WUFHTCxLQUFLLENBQUMsTUFBTSxDQUFDLElBQWIsQ0FBa0IsR0FBbEI7QUE5Qko7ZUFnQ0EsTUFBTyxDQUFBLENBQUE7SUFoREQ7Ozs7OztBQWtEZCxNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwXG4wMDAgICAgICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwXG4wMDAgICAgICAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMFxuMDAwICAgICAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuIyMjXG5cbm5vb24gID0gcmVxdWlyZSAnbm9vbidcbnNsYXNoID0gcmVxdWlyZSAna3NsYXNoJ1xua3N0ciAgPSByZXF1aXJlICdrc3RyJ1xuXG5jbGFzcyBMZXhlclxuXG4gICAgQDogKEBrb2RlKSAtPlxuXG4gICAgICAgIEBkZWJ1ZyAgICA9IEBrb2RlLmFyZ3MuZGVidWdcbiAgICAgICAgQHZlcmJvc2UgID0gQGtvZGUuYXJncy52ZXJib3NlXG4gICAgICAgIEByYXcgICAgICA9IEBrb2RlLmFyZ3MucmF3XG5cbiAgICAgICAgQHBhdHRlcm5zID0gbm9vbi5sb2FkIHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4vY29mZmVlL2xleGVyLm5vb24nXG5cbiAgICAgICAgQHJlZ3MgPSBbXVxuICAgICAgICBmb3Iga2V5LHBhdCBvZiBAcGF0dGVybnNcbiAgICAgICAgICAgIGlmIHR5cGVvZiBwYXQgPT0gJ3N0cmluZydcbiAgICAgICAgICAgICAgICBAcmVncy5wdXNoIFtrZXksIG5ldyBSZWdFeHAgcGF0XVxuICAgICAgICAgICAgZWxzZSBpZiBwYXQgaW5zdGFuY2VvZiBBcnJheVxuICAgICAgICAgICAgICAgIHBhdCA9IHBhdC5tYXAgKHApIC0+IGtzdHIuZXNjYXBlUmVnZXhwIFwiI3twfVwiXG4gICAgICAgICAgICAgICAgcmVnID0gJ1xcXFxiKCcgKyBwYXQuam9pbignfCcpICsgJylcXFxcYidcbiAgICAgICAgICAgICAgICBAcmVncy5wdXNoIFtrZXksIG5ldyBSZWdFeHAgcmVnXVxuXG4gICAgIyAwMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAgIDAwMCAgIDAwMFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwICAgIDAwMCAgICAwMDAwMDAwXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgICAwMDAgICAgIDAwMFxuICAgICMgICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAwMDAwMDAwMFxuXG4gICAgIyMjXG4gICAgICAgIGNvbnZlcnRzIHRleHQgaW50byBhIGxpc3Qgb2YgdG9rZW4gb2JqZWN0c1xuICAgICAgICB0b2tlbiBvYmplY3Q6XG4gICAgICAgICAgICB0eXBlOiBzdHJpbmcgICAgICAgICMgYW55IG9mIHRoZSBrZXlzIGluIGxleGVyLm5vb25cbiAgICAgICAgICAgIHRleHQ6IHN0cmluZyAgICAgICAgIyB0ZXh0IG9mIG1hdGNoXG4gICAgICAgICAgICBsaW5lOiBudW1iZXIgICAgICAgICMgbGluZSBudW1iZXJcbiAgICAgICAgICAgIGNvbDogIG51bWJlciAgICAgICAgIyBzdGFydCBpbmRleCBpbiBsaW5lXG4gICAgIyMjXG5cbiAgICB0b2tlbml6ZTogKHRleHQpIC0+XG5cbiAgICAgICAgdG9rZW5zID0gW11cbiAgICAgICAgbGluZSA9IDFcbiAgICAgICAgY29sID0gMFxuICAgICAgICB3aGlsZSB0ZXh0Lmxlbmd0aFxuICAgICAgICAgICAgYmVmb3JlID0gdGV4dC5sZW5ndGhcbiAgICAgICAgICAgIGZvciBba2V5LHJlZ10gaW4gQHJlZ3NcbiAgICAgICAgICAgICAgICBtYXRjaCA9IHRleHQubWF0Y2ggcmVnXG4gICAgICAgICAgICAgICAgaWYgbWF0Y2g/LmluZGV4ID09IDBcblxuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IGlmIGtleSA9PSAnbmwnIHRoZW4gJycgZWxzZSBtYXRjaFswXVxuICAgICAgICAgICAgICAgICAgICBpZiBrZXkgPT0gJ3RoZW4nIHRoZW4gdmFsdWUgPSAndGhlbic7IGtleSA9ICdrZXl3b3JkJ1xuICAgICAgICAgICAgICAgICAgICBpZiB2YWx1ZSA9PSAndGhlbicgYW5kIHRva2Vuc1stMl0/LnRleHQgPT0gJ2Vsc2UnIFxuICAgICAgICAgICAgICAgICAgICAgICAgIyBza2lwIHRoZW4gYWZ0ZXIgZWxzZVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHRva2Vucy5wdXNoIHR5cGU6a2V5LCB0ZXh0OnZhbHVlLCBsaW5lOmxpbmUsIGNvbDpjb2xcblxuICAgICAgICAgICAgICAgICAgICBpZiBrZXkgPT0gJ25sJ1xuICAgICAgICAgICAgICAgICAgICAgICAgY29sID0gMFxuICAgICAgICAgICAgICAgICAgICAgICAgbGluZSsrXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYga2V5IGluIFsnY29tbWVudCcndHJpcGxlJ11cbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVzID0gdmFsdWUuc3BsaXQgJ1xcbidcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmUgKz0gbGluZXMubGVuZ3RoLTFcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGxpbmVzLmxlbmd0aCA+IDFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2wgPSBsaW5lc1stMV0ubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sICs9IHZhbHVlLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2wgKz0gdmFsdWUubGVuZ3RoXG5cbiAgICAgICAgICAgICAgICAgICAgdGV4dCA9IHRleHRbbWF0Y2hbMF0ubGVuZ3RoLi4tMV1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICAgICAgYWZ0ZXIgPSB0ZXh0Lmxlbmd0aFxuICAgICAgICAgICAgaWYgYmVmb3JlID09IGFmdGVyXG4gICAgICAgICAgICAgICAgbG9nIFwic3RyYXkgY2hhcmFjdGVyICN7dGV4dFswXX0gaW4gbGluZSAje2xpbmV9IGNvbCAje2NvbH1cIlxuICAgICAgICAgICAgICAgIHRva2Vucy5wdXNoIHR5cGU6J3N0cmF5JyB0ZXh0OnRleHRbMF0sIGxpbmU6bGluZSwgY29sOmNvbFxuICAgICAgICAgICAgICAgIHRleHQgPSB0ZXh0WzEuLi0xXVxuICAgICAgICB0b2tlbnNcblxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMDAgICAgICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAwMDBcbiAgICAjICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwICAgMDAwXG5cbiAgICAjIHdhbGtzIHRocm91Z2ggdG9rZW5zIGFuZCBqb2lucyBsaW5lcyB0aGF0IGVuZCB3aXRoICdcXCdcblxuICAgIHVuc2xhc2g6ICh0b2tlbnMpIC0+XG5cbiAgICAgICAgbmV3VG9rZW5zID0gW11cblxuICAgICAgICBpZHggPSAwXG4gICAgICAgIHdoaWxlIGlkeCA8IHRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgIHRvayA9IHRva2Vuc1tpZHhdXG4gICAgICAgICAgICBpZiB0b2sudGV4dCA9PSAnXFxcXCdcbiAgICAgICAgICAgICAgICBpZHggKz0gMVxuICAgICAgICAgICAgICAgIHdoaWxlIHRva2Vuc1tpZHhdLnR5cGUgaW4gWydubCcgJ3dzJ11cbiAgICAgICAgICAgICAgICAgICAgaWR4ICs9IDFcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBuZXdUb2tlbnMucHVzaCB0b2tcbiAgICAgICAgICAgICAgICBpZHggKz0gMVxuXG4gICAgICAgIG5ld1Rva2Vuc1xuICAgICAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgMDAwMCAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAgXG4gICAgXG4gICAgIyB3YWxrcyB0aHJvdWdoIHRva2VucyBhbmQgam9pbnMgbGluZXMgdGhhdCBlbmQgd2l0aCBvcGVyYXRvcnMgKGV4Y2VwdCArKyBhbmQgLS0pXG4gICAgXG4gICAgbWVyZ2VvcDogKHRva2VucykgLT5cblxuICAgICAgICBuZXdUb2tlbnMgPSBbXVxuXG4gICAgICAgIGlkeCA9IDBcbiAgICAgICAgd2hpbGUgaWR4IDwgdG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgdG9rID0gdG9rZW5zW2lkeF1cbiAgICAgICAgICAgIGlmIHRvay50eXBlID09ICdvcCcgYW5kIHRvay50ZXh0IG5vdCBpbiBbJy0tJycrKyddXG4gICAgICAgICAgICAgICAgbmV3VG9rZW5zLnB1c2ggdG9rXG4gICAgICAgICAgICAgICAgaWR4ICs9IDFcbiAgICAgICAgICAgICAgICB3aGlsZSB0b2tlbnNbaWR4XS50eXBlIGluIFsnbmwnICd3cyddXG4gICAgICAgICAgICAgICAgICAgIGlkeCArPSAxXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbmV3VG9rZW5zLnB1c2ggdG9rXG4gICAgICAgICAgICAgICAgaWR4ICs9IDFcblxuICAgICAgICBuZXdUb2tlbnNcbiAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgIyBUT0RPOiBrZWVwIHRoZSBzd2FsbG93ZWQgdG9rZW5zIGFuZCByZWluc2VydCB0aGVtIGFmdGVyIHBhcnNpbmdcbiAgICBcbiAgICB1bmNvbW1lbnQ6ICh0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBuZXdUb2tlbnMgPSBbXVxuXG4gICAgICAgIGlkeCA9IDBcbiAgICAgICAgd2hpbGUgaWR4IDwgdG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgdG9rID0gdG9rZW5zW2lkeF1cbiAgICAgICAgICAgIGlmIHRvay50eXBlID09ICdjb21tZW50J1xuICAgICAgICAgICAgICAgICMgaWYgbm90ICh0b2tlbnNbaWR4LTFdPy50eXBlID09ICdubCcgb3IgdG9rZW5zW2lkeC0yXT8udHlwZSA9PSAnbmwnIGFuZCB0b2tlbnNbaWR4LTFdPy50eXBlID09ICd3cycpXG4gICAgICAgICAgICAgICAgaWR4ICs9IDFcbiAgICAgICAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgICAgICBuZXdUb2tlbnMucHVzaCB0b2tcbiAgICAgICAgICAgIGlkeCArPSAxXG5cbiAgICAgICAgbmV3VG9rZW5zXG4gICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwICAwMDAwMDAgICAgICAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICAgIDAwMFxuXG4gICAgIyMjXG4gICAgICAgIGNvbnZlcnRzIGxpc3Qgb2YgdG9rZW5zIGludG8gdHJlZSBvZiBibG9ja3NcbiAgICAgICAgYmxvY2s6XG4gICAgICAgICAgICB0eXBlOiAgJ2Jsb2NrJ1xuICAgICAgICAgICAgdG9rZW5zOiBhcnJheSAgICAgICAgICAgIyB0b2tlbnMgb2YgdGhlIGJsb2NrXG4gICAgICAgICAgICBpbmRlbnQ6IHN0cmluZyAgICAgICAgICAjIGluZGVudGF0aW9uIHN0cmluZ1xuICAgICAgICAgICAgbGluZTogICBudW1iZXIgICAgICAgICAgIyBmaXJzdCBsaW5lIG51bWJlclxuICAgICAgICAgICAgY29sOiAgICBudW1iZXJcblxuICAgICAgICB3cyB0b2tlbnMgYW5kIGVtcHR5IGxpbmVzIGFyZSBwcnVuZWQgZnJvbSB0aGUgdHJlZVxuICAgICAgICBubCB0b2tlbnMgYXJlIG9ubHkga2VwdCBiZXR3ZWVuIGxpbmVzIG9mIHRoZSBzYW1lIGJsb2NrXG4gICAgIyMjXG5cbiAgICBibG9ja2lmeTogKHRva2VucykgLT5cblxuICAgICAgICB0b2tlbnMgPSBAdW5zbGFzaCAgIHRva2Vuc1xuICAgICAgICB0b2tlbnMgPSBAdW5jb21tZW50IHRva2Vuc1xuICAgICAgICB0b2tlbnMgPSBAbWVyZ2VvcCAgIHRva2Vuc1xuXG4gICAgICAgIGJsb2NrcyA9IFtdXG5cbiAgICAgICAgYmxvY2sgPSB0eXBlOidibG9jaycgdG9rZW5zOltdIGluZGVudDonJyBsaW5lOjEgY29sOjBcbiAgICAgICAgYmxvY2tzLnB1c2ggYmxvY2tcblxuICAgICAgICBvdXRkZW50VG8gPSAoZGVwdGgsIGxpbmUpIC0+XG4gICAgICAgICAgICB3aGlsZSBkZXB0aCA8IGJsb2NrLmluZGVudC5sZW5ndGhcbiAgICAgICAgICAgICAgICBibG9ja3MucG9wKClcbiAgICAgICAgICAgICAgICBibG9jayA9IGJsb2Nrc1stMV1cblxuICAgICAgICBmb3IgaWR4IGluIDAuLi50b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICB0b2sgPSB0b2tlbnNbaWR4XVxuICAgICAgICAgICAgaWYgdG9rLnR5cGUgPT0gJ25sJ1xuXG4gICAgICAgICAgICAgICAgbnh0ID0gdG9rZW5zW2lkeCsxXVxuICAgICAgICAgICAgICAgIGlmIG54dD8udHlwZSBpbiBbJ25sJ11cbiAgICAgICAgICAgICAgICAgICAgY29udGludWVcblxuICAgICAgICAgICAgICAgIGlmIG54dD8udHlwZSA9PSAnd3MnXG5cbiAgICAgICAgICAgICAgICAgICAgaWYgdG9rZW5zW2lkeCsyXT8udHlwZSA9PSAnbmwnIG9yIGlkeCsxID49IHRva2Vucy5sZW5ndGgtMVxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWVcblxuICAgICAgICAgICAgICAgICAgICBpZiBueHQudGV4dC5sZW5ndGggPiBibG9jay5pbmRlbnQubGVuZ3RoXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGJsb2NrID0gdHlwZTonYmxvY2snIHRva2VuczpbXSBsaW5lOm54dC5saW5lLCBpbmRlbnQ6bnh0LnRleHQsIGNvbDpueHQudGV4dC5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgIGJsb2Nrc1stMV0udG9rZW5zLnB1c2ggYmxvY2tcbiAgICAgICAgICAgICAgICAgICAgICAgIGJsb2Nrcy5wdXNoIGJsb2NrXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQubGVuZ3RoIDwgYmxvY2suaW5kZW50Lmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0ZGVudFRvIG54dC50ZXh0Lmxlbmd0aCwgbnh0LmxpbmVcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGVsc2UgaWYgbnh0XG4gICAgICAgICAgICAgICAgICAgIGlmIGJsb2NrLmluZGVudC5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGRlbnRUbyAwLCBueHQubGluZVxuXG4gICAgICAgICAgICBlbHNlIGlmIHRvay50eXBlID09ICd3cydcbiAgICAgICAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgICAgICBibG9jay50b2tlbnMucHVzaCB0b2tcblxuICAgICAgICBibG9ja3NbMF1cbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IExleGVyXG4iXX0=
//# sourceURL=../coffee/lexer.coffee