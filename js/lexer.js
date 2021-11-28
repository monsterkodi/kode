// koffee 1.20.0

/*
000      00000000  000   000  00000000  00000000
000      000        000 000   000       000   000
000      0000000     00000    0000000   0000000
000      000        000 000   000       000   000
0000000  00000000  000   000  00000000  000   000
 */
var Lexer, kstr, noon, print, slash;

noon = require('noon');

slash = require('kslash');

kstr = require('kstr');

print = require('./print');

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
        var after, before, col, i, key, len, line, lines, match, ref, ref1, reg, tokens, value;
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
                    tokens.push({
                        type: key,
                        text: value,
                        line: line,
                        col: col
                    });
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

    Lexer.prototype.frontify = function(tokens) {
        var frc, fst, idx, ifc, ist, lineStart, lst, ref, ref1, ref2, ref3, swap, thc, tok, wlc, wst;
        idx = 0;
        lst = ist = wst = fst = ifc = wlc = frc = thc = 0;
        swap = (function(_this) {
            return function() {
                var front, ref, ref1, st;
                if (!(ist || wst || fst)) {
                    return;
                }
                if (_this.verbose) {
                    console.log(tok.line, tok.col, 'start', ist, wst, fst, 'count', ifc, wlc, frc, thc);
                }
                st = Math.max(ist, wst, fst);
                if (_this.debug) {
                    print.tokens('before', tokens.slice(lst, idx));
                }
                front = tokens.splice(lst, st - lst);
                front.unshift({
                    type: 'keyword',
                    text: 'then',
                    line: (ref = tokens[idx]) != null ? ref.line : void 0,
                    col: (ref1 = tokens[idx]) != null ? ref1.col : void 0
                });
                [].splice.apply(tokens, [idx - (st - lst), 0].concat(front));
                if (_this.debug) {
                    return print.tokens('after', tokens.slice(lst, idx + 1));
                }
            };
        })(this);
        while (idx < tokens.length) {
            tok = tokens[idx];
            if (tok.type === 'nl' || tok.text === ';') {
                swap();
                lst = idx + 1;
                ist = wst = fst;
                ifc = wlc = frc = thc = 0;
            } else if (tok.type === 'ws' && idx === lst) {
                lst = idx + 1;
            } else {
                if ((ref = tok.text) === 'if' || ref === 'for' || ref === 'while' || ref === 'else') {
                    lineStart = tok.col === 0 || ((ref1 = tokens[idx - 1]) != null ? ref1.type : void 0) === 'nl' || ((ref2 = tokens[idx - 2]) != null ? ref2.type : void 0) === 'nl';
                    if (lineStart || ((ref3 = tokens[idx - 1]) != null ? ref3.text : void 0) === '=') {
                        while (idx < tokens.length && tokens[idx].type !== 'nl') {
                            ++idx;
                        }
                        continue;
                    }
                }
                switch (tok.text) {
                    case 'if':
                        ifc++;
                        if (ist === 0) {
                            ist = idx;
                        }
                        break;
                    case 'for':
                        frc++;
                        if (fst === 0) {
                            fst = idx;
                        }
                        break;
                    case 'while':
                        wlc++;
                        if (wst === 0) {
                            wst = idx;
                        }
                        break;
                    case 'then':
                        thc++;
                        break;
                    case 'else':
                        if (tokens[idx + 2].text !== 'if') {
                            ifc++;
                        }
                }
            }
            idx++;
        }
        swap();
        return tokens;
    };

    Lexer.prototype.untail = function(tokens) {
        var bwd, end, first, idx, ifc, last, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, start, thc;
        print.tokens("untail", tokens);
        idx = 0;
        while (idx < tokens.length) {
            while (((ref = (ref1 = tokens[idx]) != null ? ref1.type : void 0) === 'nl' || ref === 'ws') || ((ref2 = tokens[idx]) != null ? ref2.text : void 0) === ';') {
                idx++;
            }
            first = idx;
            while (idx < tokens.length && tokens[idx].type !== 'nl' && tokens[idx].text !== ';') {
                idx++;
            }
            last = idx - 1;
            thc = 0;
            ifc = 0;
            bwd = last;
            while (bwd > first) {
                bwd--;
                if (tokens[bwd].text === 'if' && ((ref3 = tokens[bwd - 2]) != null ? ref3.text : void 0) !== 'else' && thc === 0 && bwd > first) {
                    print.tokens("untail " + first + " " + last, tokens.slice(first, +last + 1 || 9e9));
                    console.log('tailing if!', first, bwd, last);
                    start = bwd - 1;
                    while (((ref4 = (ref5 = tokens[start - 1]) != null ? ref5.text : void 0) !== '(' && ref4 !== 'if' && ref4 !== 'then') && start > first) {
                        start--;
                    }
                    if (((ref6 = tokens[start]) != null ? ref6.type : void 0) === 'ws') {
                        start++;
                    }
                    end = bwd + 1;
                    while (((ref7 = (ref8 = tokens[end + 1]) != null ? ref8.text : void 0) !== ')' && ref7 !== 'if' && ref7 !== 'else') && end < last) {
                        end++;
                    }
                    if (((ref9 = tokens[end]) != null ? ref9.type : void 0) === 'ws') {
                        end--;
                    }
                    console.log('tailing if:', start, bwd, end);
                    console.log('tailing if:', tokens[start], tokens[end]);
                }
                if (tokens[bwd].text === 'then') {
                    thc++;
                }
            }
        }
        return tokens;
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
        tokens = this.mergeop(tokens);
        tokens = this.uncomment(tokens);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGV4ZXIuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJsZXhlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsSUFBQSxHQUFRLE9BQUEsQ0FBUSxNQUFSOztBQUNSLEtBQUEsR0FBUSxPQUFBLENBQVEsUUFBUjs7QUFDUixJQUFBLEdBQVEsT0FBQSxDQUFRLE1BQVI7O0FBQ1IsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztBQUVGO0lBRUMsZUFBQyxJQUFEO0FBRUMsWUFBQTtRQUZBLElBQUMsQ0FBQSxPQUFEO1FBRUEsSUFBQyxDQUFBLEtBQUQsR0FBWSxJQUFDLENBQUEsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN2QixJQUFDLENBQUEsT0FBRCxHQUFZLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3ZCLElBQUMsQ0FBQSxHQUFELEdBQVksSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFJLENBQUM7UUFFdkIsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQUFJLENBQUMsSUFBTCxDQUFVLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBWCxFQUFzQixzQkFBdEIsQ0FBVjtRQUVaLElBQUMsQ0FBQSxJQUFELEdBQVE7QUFDUjtBQUFBLGFBQUEsVUFBQTs7WUFDSSxJQUFHLE9BQU8sR0FBUCxLQUFjLFFBQWpCO2dCQUNJLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBTixDQUFXLENBQUMsR0FBRCxFQUFNLElBQUksTUFBSixDQUFXLEdBQVgsQ0FBTixDQUFYLEVBREo7YUFBQSxNQUVLLElBQUcsR0FBQSxZQUFlLEtBQWxCO2dCQUNELEdBQUEsR0FBTSxHQUFHLENBQUMsR0FBSixDQUFRLFNBQUMsQ0FBRDsyQkFBTyxJQUFJLENBQUMsWUFBTCxDQUFrQixFQUFBLEdBQUcsQ0FBckI7Z0JBQVAsQ0FBUjtnQkFDTixHQUFBLEdBQU0sTUFBQSxHQUFTLEdBQUcsQ0FBQyxJQUFKLENBQVMs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S0FBdkI7d0JBQ0EsTUFBTSxDQUFDLElBQVAsQ0FBWSxLQUFaO0FBQ0EsaUNBTEo7cUJBQUEsTUFPSyxJQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBVCxHQUFrQixLQUFLLENBQUMsTUFBTSxDQUFDLE1BQWxDO3dCQUNELFNBQUEsQ0FBVSxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQW5CLEVBQTJCLEdBQUcsQ0FBQyxJQUEvQixFQURDO3FCQVpUO2lCQUFBLE1BZUssSUFBRyxHQUFIO29CQUNELElBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFoQjt3QkFDSSxTQUFBLENBQVUsQ0FBVixFQUFhLEdBQUcsQ0FBQyxJQUFqQixFQURKO3FCQURDO2lCQXJCVDthQUFBLE1BeUJLLElBQUcsR0FBRyxDQUFDLElBQUosS0FBWSxJQUFmO0FBQ0QseUJBREM7O1lBR0wsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFiLENBQWtCLEdBQWxCO0FBOUJKO2VBZ0NBLE1BQU8sQ0FBQSxDQUFBO0lBbEREOzs7Ozs7QUFvRGQsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMCAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMFxuMDAwICAgICAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwICAgICAgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDBcbjAwMCAgICAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDBcbiMjI1xuXG5ub29uICA9IHJlcXVpcmUgJ25vb24nXG5zbGFzaCA9IHJlcXVpcmUgJ2tzbGFzaCdcbmtzdHIgID0gcmVxdWlyZSAna3N0cidcbnByaW50ID0gcmVxdWlyZSAnLi9wcmludCdcblxuY2xhc3MgTGV4ZXJcblxuICAgIEA6IChAa29kZSkgLT5cblxuICAgICAgICBAZGVidWcgICAgPSBAa29kZS5hcmdzLmRlYnVnXG4gICAgICAgIEB2ZXJib3NlICA9IEBrb2RlLmFyZ3MudmVyYm9zZVxuICAgICAgICBAcmF3ICAgICAgPSBAa29kZS5hcmdzLnJhd1xuXG4gICAgICAgIEBwYXR0ZXJucyA9IG5vb24ubG9hZCBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uL2NvZmZlZS9sZXhlci5ub29uJ1xuXG4gICAgICAgIEByZWdzID0gW11cbiAgICAgICAgZm9yIGtleSxwYXQgb2YgQHBhdHRlcm5zXG4gICAgICAgICAgICBpZiB0eXBlb2YgcGF0ID09ICdzdHJpbmcnXG4gICAgICAgICAgICAgICAgQHJlZ3MucHVzaCBba2V5LCBuZXcgUmVnRXhwIHBhdF1cbiAgICAgICAgICAgIGVsc2UgaWYgcGF0IGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgICAgICAgICBwYXQgPSBwYXQubWFwIChwKSAtPiBrc3RyLmVzY2FwZVJlZ2V4cCBcIiN7cH1cIlxuICAgICAgICAgICAgICAgIHJlZyA9ICdcXFxcYignICsgcGF0LmpvaW4oJ3wnKSArICcpXFxcXGInXG4gICAgICAgICAgICAgICAgQHJlZ3MucHVzaCBba2V5LCBuZXcgUmVnRXhwIHJlZ11cblxuICAgICMgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAwMDAwMDAwMFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwICAgICAwMDAgICAwMDBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMCAgICAwMDAgICAgMDAwMDAwMFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAgICAwMDBcbiAgICAjICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDBcblxuICAgICMjI1xuICAgICAgICBjb252ZXJ0cyB0ZXh0IGludG8gYSBsaXN0IG9mIHRva2VuIG9iamVjdHNcbiAgICAgICAgdG9rZW4gb2JqZWN0OlxuICAgICAgICAgICAgdHlwZTogc3RyaW5nICAgICAgICAjIGFueSBvZiB0aGUga2V5cyBpbiBsZXhlci5ub29uXG4gICAgICAgICAgICB0ZXh0OiBzdHJpbmcgICAgICAgICMgdGV4dCBvZiBtYXRjaFxuICAgICAgICAgICAgbGluZTogbnVtYmVyICAgICAgICAjIGxpbmUgbnVtYmVyXG4gICAgICAgICAgICBjb2w6ICBudW1iZXIgICAgICAgICMgc3RhcnQgaW5kZXggaW4gbGluZVxuICAgICMjI1xuXG4gICAgdG9rZW5pemU6ICh0ZXh0KSAtPlxuXG4gICAgICAgIHRva2VucyA9IFtdXG4gICAgICAgIGxpbmUgPSAxXG4gICAgICAgIGNvbCA9IDBcbiAgICAgICAgd2hpbGUgdGV4dC5sZW5ndGhcbiAgICAgICAgICAgIGJlZm9yZSA9IHRleHQubGVuZ3RoXG4gICAgICAgICAgICBmb3IgW2tleSxyZWddIGluIEByZWdzXG4gICAgICAgICAgICAgICAgbWF0Y2ggPSB0ZXh0Lm1hdGNoIHJlZ1xuICAgICAgICAgICAgICAgIGlmIG1hdGNoPy5pbmRleCA9PSAwXG5cbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBpZiBrZXkgPT0gJ25sJyB0aGVuICcnIGVsc2UgbWF0Y2hbMF1cblxuICAgICAgICAgICAgICAgICAgICB0b2tlbnMucHVzaCB0eXBlOmtleSwgdGV4dDp2YWx1ZSwgbGluZTpsaW5lLCBjb2w6Y29sXG5cbiAgICAgICAgICAgICAgICAgICAgaWYga2V5ID09ICdubCdcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbCA9IDBcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmUrK1xuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIGtleSBpbiBbJ2NvbW1lbnQnJ3RyaXBsZSddXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lcyA9IHZhbHVlLnNwbGl0ICdcXG4nXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lICs9IGxpbmVzLmxlbmd0aC0xXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBsaW5lcy5sZW5ndGggPiAxXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sID0gbGluZXNbLTFdLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbCArPSB2YWx1ZS5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgY29sICs9IHZhbHVlLmxlbmd0aFxuXG4gICAgICAgICAgICAgICAgICAgIHRleHQgPSB0ZXh0W21hdGNoWzBdLmxlbmd0aC4uLTFdXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgICAgIGFmdGVyID0gdGV4dC5sZW5ndGhcbiAgICAgICAgICAgIGlmIGJlZm9yZSA9PSBhZnRlclxuICAgICAgICAgICAgICAgIGxvZyBcInN0cmF5IGNoYXJhY3RlciAje3RleHRbMF19IGluIGxpbmUgI3tsaW5lfSBjb2wgI3tjb2x9XCJcbiAgICAgICAgICAgICAgICB0b2tlbnMucHVzaCB0eXBlOidzdHJheScgdGV4dDp0ZXh0WzBdLCBsaW5lOmxpbmUsIGNvbDpjb2xcbiAgICAgICAgICAgICAgICB0ZXh0ID0gdGV4dFsxLi4tMV1cbiAgICAgICAgdG9rZW5zXG5cbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAwICAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuXG4gICAgIyB3YWxrcyB0aHJvdWdoIHRva2VucyBhbmQgam9pbnMgbGluZXMgdGhhdCBlbmQgd2l0aCAnXFwnXG5cbiAgICB1bnNsYXNoOiAodG9rZW5zKSAtPlxuXG4gICAgICAgIG5ld1Rva2VucyA9IFtdXG5cbiAgICAgICAgaWR4ID0gMFxuICAgICAgICB3aGlsZSBpZHggPCB0b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICB0b2sgPSB0b2tlbnNbaWR4XVxuICAgICAgICAgICAgaWYgdG9rLnRleHQgPT0gJ1xcXFwnXG4gICAgICAgICAgICAgICAgaWR4ICs9IDFcbiAgICAgICAgICAgICAgICB3aGlsZSB0b2tlbnNbaWR4XS50eXBlIGluIFsnbmwnICd3cyddXG4gICAgICAgICAgICAgICAgICAgIGlkeCArPSAxXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbmV3VG9rZW5zLnB1c2ggdG9rXG4gICAgICAgICAgICAgICAgaWR4ICs9IDFcblxuICAgICAgICBuZXdUb2tlbnNcbiAgICAgICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgIDAwMDAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgIFxuICAgIFxuICAgICMgd2Fsa3MgdGhyb3VnaCB0b2tlbnMgYW5kIGpvaW5zIGxpbmVzIHRoYXQgZW5kIHdpdGggb3BlcmF0b3JzIChleGNlcHQgKysgYW5kIC0tKVxuICAgIFxuICAgIG1lcmdlb3A6ICh0b2tlbnMpIC0+XG5cbiAgICAgICAgbmV3VG9rZW5zID0gW11cblxuICAgICAgICBpZHggPSAwXG4gICAgICAgIHdoaWxlIGlkeCA8IHRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgIHRvayA9IHRva2Vuc1tpZHhdXG4gICAgICAgICAgICBpZiB0b2sudHlwZSA9PSAnb3AnIGFuZCB0b2sudGV4dCBub3QgaW4gWyctLScnKysnXVxuICAgICAgICAgICAgICAgIG5ld1Rva2Vucy5wdXNoIHRva1xuICAgICAgICAgICAgICAgIGlkeCArPSAxXG4gICAgICAgICAgICAgICAgd2hpbGUgdG9rZW5zW2lkeF0udHlwZSBpbiBbJ25sJyAnd3MnXVxuICAgICAgICAgICAgICAgICAgICBpZHggKz0gMVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG5ld1Rva2Vucy5wdXNoIHRva1xuICAgICAgICAgICAgICAgIGlkeCArPSAxXG5cbiAgICAgICAgbmV3VG9rZW5zXG4gICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAgICAwMDAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgICMgVE9ETzoga2VlcCB0aGUgc3dhbGxvd2VkIHRva2VucyBhbmQgcmVpbnNlcnQgdGhlbSBhZnRlciBwYXJzaW5nXG4gICAgXG4gICAgdW5jb21tZW50OiAodG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgbmV3VG9rZW5zID0gW11cblxuICAgICAgICBpZHggPSAwXG4gICAgICAgIHdoaWxlIGlkeCA8IHRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgIHRvayA9IHRva2Vuc1tpZHhdXG4gICAgICAgICAgICBpZiB0b2sudHlwZSA9PSAnY29tbWVudCdcbiAgICAgICAgICAgICAgICAjIGlmIG5vdCAodG9rZW5zW2lkeC0xXT8udHlwZSA9PSAnbmwnIG9yIHRva2Vuc1tpZHgtMl0/LnR5cGUgPT0gJ25sJyBhbmQgdG9rZW5zW2lkeC0xXT8udHlwZSA9PSAnd3MnKVxuICAgICAgICAgICAgICAgIGlkeCArPSAxXG4gICAgICAgICAgICAgICAgY29udGludWVcblxuICAgICAgICAgICAgbmV3VG9rZW5zLnB1c2ggdG9rXG4gICAgICAgICAgICBpZHggKz0gMVxuXG4gICAgICAgIG5ld1Rva2Vuc1xuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgICAgICAgMDAwIDAwMCAgIFxuICAgICMgMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAwMDAgICAgICAwMDAwMCAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgIFxuICAgICMgc3dhcCAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAjICAgICAgICBleHAgaWYgY29uZCAgICAgICAgICAgICAgICDilrggICAgICBpZiBjb25kIHRoZW4gZXhwXG4gICAgIyAgICAgICAgZXhwIHdoaWxlIGNvbmQgICAgICAgICAgICAg4pa4ICAgICAgd2hpbGUgY29uZCB0aGVuIGV4cFxuICAgICMgICAgICAgIGV4cCBmb3IgLi4uIGluL29mIC4uLiAgICAgIOKWuCAgICAgIGZvciAuLiBpbi9vZiAuLiB0aGVuIGV4cFxuICAgIFxuICAgIGZyb250aWZ5OiAodG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgaWR4ID0gMFxuICAgICAgICBsc3QgPSBpc3QgPSB3c3QgPSBmc3QgPSBpZmMgPSB3bGMgPSBmcmMgPSB0aGMgPSAwXG5cbiAgICAgICAgc3dhcCA9ID0+XG4gICAgICAgICAgICByZXR1cm4gaWYgbm90IChpc3Qgb3Igd3N0IG9yIGZzdClcbiAgICAgICAgICAgIGxvZyB0b2subGluZSwgdG9rLmNvbCwgJ3N0YXJ0JywgaXN0LCB3c3QsIGZzdCwgJ2NvdW50JywgaWZjLCB3bGMsIGZyYywgdGhjIGlmIEB2ZXJib3NlXG4gICAgICAgICAgICBzdCA9IE1hdGgubWF4IGlzdCwgd3N0LCBmc3RcbiAgICAgICAgICAgIHByaW50LnRva2VucyAnYmVmb3JlJyB0b2tlbnNbbHN0Li4uaWR4XSBpZiBAZGVidWdcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZnJvbnQgPSB0b2tlbnMuc3BsaWNlIGxzdCwgc3QtbHN0XG4gICAgICAgICAgICBmcm9udC51bnNoaWZ0IHR5cGU6J2tleXdvcmQnIHRleHQ6J3RoZW4nIGxpbmU6dG9rZW5zW2lkeF0/LmxpbmUsIGNvbDp0b2tlbnNbaWR4XT8uY29sXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFtdLnNwbGljZS5hcHBseSB0b2tlbnMsIFtpZHgtKHN0LWxzdCksIDBdLmNvbmNhdCBmcm9udFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBwcmludC50b2tlbnMgJ2FmdGVyJyB0b2tlbnNbbHN0Li4uaWR4KzFdIGlmIEBkZWJ1Z1xuICAgICAgICBcbiAgICAgICAgd2hpbGUgaWR4IDwgdG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgXG4gICAgICAgICAgICB0b2sgPSB0b2tlbnNbaWR4XVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiB0b2sudHlwZSA9PSAnbmwnIG9yIHRvay50ZXh0ID09ICc7J1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHN3YXAoKSAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBsc3QgPSBpZHgrMVxuICAgICAgICAgICAgICAgIGlzdCA9IHdzdCA9IGZzdCBcbiAgICAgICAgICAgICAgICBpZmMgPSB3bGMgPSBmcmMgPSB0aGMgPSAwXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlIGlmIHRvay50eXBlID09ICd3cycgYW5kIGlkeCA9PSBsc3QgdGhlbiBsc3QgPSBpZHgrMSBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIHRvay50ZXh0IGluIFsnaWYnICdmb3InICd3aGlsZScgJ2Vsc2UnXVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgbGluZVN0YXJ0ID0gdG9rLmNvbCA9PSAwIG9yIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICB0b2tlbnNbaWR4LTFdPy50eXBlID09ICdubCcgb3IgXFxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRva2Vuc1tpZHgtMl0/LnR5cGUgPT0gJ25sJyAjIGxpbmUgc3RhcnRzIHdpdGgga3dcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmIGxpbmVTdGFydCBvciBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRva2Vuc1tpZHgtMV0/LnRleHQgPT0gJz0nICMgeCA9IGlmfGZvcnx3aGlsZS4uLiBcbiAgICAgICAgICAgICAgICAgICAgICAgICsraWR4IHdoaWxlIGlkeCA8IHRva2Vucy5sZW5ndGggYW5kIHRva2Vuc1tpZHhdLnR5cGUgIT0gJ25sJyAjIHNraXAgdW50aWwgbmxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgc3dpdGNoIHRvay50ZXh0IFxuICAgICAgICAgICAgICAgICAgICB3aGVuICdpZicgICAgdGhlbiBpZmMrKyA7IGlzdCA9IGlkeCBpZiBpc3QgPT0gMCBcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnZm9yJyAgIHRoZW4gZnJjKysgOyBmc3QgPSBpZHggaWYgZnN0ID09IDAgXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ3doaWxlJyB0aGVuIHdsYysrIDsgd3N0ID0gaWR4IGlmIHdzdCA9PSAwIFxuICAgICAgICAgICAgICAgICAgICB3aGVuICd0aGVuJyAgdGhlbiB0aGMrK1xuICAgICAgICAgICAgICAgICAgICB3aGVuICdlbHNlJyAgXG4gICAgICAgICAgICAgICAgICAgICAgICBpZmMrKyBpZiB0b2tlbnNbaWR4KzJdLnRleHQgIT0gJ2lmJyBcbiAgICAgICAgICAgIGlkeCsrXG4gICAgICAgIFxuICAgICAgICBzd2FwKClcbiAgICAgICAgXG4gICAgICAgIHRva2Vuc1xuICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICBcbiAgICBcbiAgICB1bnRhaWw6ICh0b2tlbnMpIC0+XG5cbiAgICAgICAgcHJpbnQudG9rZW5zIFwidW50YWlsXCIgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICBpZHggPSAwXG4gICAgICAgIFxuICAgICAgICB3aGlsZSBpZHggPCB0b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlkeCsrIHdoaWxlIHRva2Vuc1tpZHhdPy50eXBlIGluIFsnbmwnICd3cyddIG9yIHRva2Vuc1tpZHhdPy50ZXh0ID09ICc7J1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBmaXJzdCA9IGlkeFxuICAgICAgICAgICAgaWR4Kysgd2hpbGUgaWR4IDwgdG9rZW5zLmxlbmd0aCBhbmQgdG9rZW5zW2lkeF0udHlwZSAhPSAnbmwnIGFuZCB0b2tlbnNbaWR4XS50ZXh0ICE9ICc7J1xuICAgICAgICAgICAgbGFzdCA9IGlkeC0xXG4gICAgICAgIFxuICAgICAgICAgICAgdGhjID0gMFxuICAgICAgICAgICAgaWZjID0gMFxuICAgICAgICAgICAgYndkID0gbGFzdFxuXG4gICAgICAgICAgICB3aGlsZSBid2QgPiBmaXJzdFxuXG4gICAgICAgICAgICAgICAgYndkLS1cblxuICAgICAgICAgICAgICAgIGlmIHRva2Vuc1tid2RdLnRleHQgPT0gJ2lmJyBhbmQgdG9rZW5zW2J3ZC0yXT8udGV4dCAhPSAnZWxzZScgYW5kIHRoYyA9PSAwIGFuZCBid2QgPiBmaXJzdFxuICAgICAgICAgICAgICAgICAgICBwcmludC50b2tlbnMgXCJ1bnRhaWwgI3tmaXJzdH0gI3tsYXN0fVwiIHRva2Vuc1tmaXJzdC4ubGFzdF1cbiAgICAgICAgICAgICAgICAgICAgbG9nICd0YWlsaW5nIGlmIScgZmlyc3QsIGJ3ZCwgbGFzdFxuICAgICAgICAgICAgICAgICAgICBzdGFydCA9IGJ3ZC0xXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0LS0gd2hpbGUgdG9rZW5zW3N0YXJ0LTFdPy50ZXh0IG5vdCBpbiBbJygnICdpZicgJ3RoZW4nXSBhbmQgc3RhcnQgPiBmaXJzdFxuICAgICAgICAgICAgICAgICAgICBzdGFydCsrIGlmIHRva2Vuc1tzdGFydF0/LnR5cGUgPT0gJ3dzJ1xuICAgICAgICAgICAgICAgICAgICBlbmQgPSBid2QrMVxuICAgICAgICAgICAgICAgICAgICBlbmQrKyB3aGlsZSB0b2tlbnNbZW5kKzFdPy50ZXh0IG5vdCBpbiBbJyknICdpZicgJ2Vsc2UnXSBhbmQgZW5kIDwgbGFzdFxuICAgICAgICAgICAgICAgICAgICBlbmQtLSBpZiB0b2tlbnNbZW5kXT8udHlwZSA9PSAnd3MnXG4gICAgICAgICAgICAgICAgICAgIGxvZyAndGFpbGluZyBpZjonIHN0YXJ0LCBid2QsIGVuZFxuICAgICAgICAgICAgICAgICAgICBsb2cgJ3RhaWxpbmcgaWY6JyB0b2tlbnNbc3RhcnRdLCB0b2tlbnNbZW5kXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHRoYysrIGlmIHRva2Vuc1tid2RdLnRleHQgPT0gJ3RoZW4nXG4gICAgICAgIFxuICAgICAgICB0b2tlbnNcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAwMDBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAgIDAwMDAwMCAgICAgIDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgICAgMDAwXG5cbiAgICAjIyNcbiAgICAgICAgY29udmVydHMgbGlzdCBvZiB0b2tlbnMgaW50byB0cmVlIG9mIGJsb2Nrc1xuICAgICAgICBibG9jazpcbiAgICAgICAgICAgIHR5cGU6ICAnYmxvY2snXG4gICAgICAgICAgICB0b2tlbnM6IGFycmF5ICAgICAgICAgICAjIHRva2VucyBvZiB0aGUgYmxvY2tcbiAgICAgICAgICAgIGluZGVudDogc3RyaW5nICAgICAgICAgICMgaW5kZW50YXRpb24gc3RyaW5nXG4gICAgICAgICAgICBsaW5lOiAgIG51bWJlciAgICAgICAgICAjIGZpcnN0IGxpbmUgbnVtYmVyXG4gICAgICAgICAgICBjb2w6ICAgIG51bWJlclxuXG4gICAgICAgIHdzIHRva2VucyBhbmQgZW1wdHkgbGluZXMgYXJlIHBydW5lZCBmcm9tIHRoZSB0cmVlXG4gICAgICAgIG5sIHRva2VucyBhcmUgb25seSBrZXB0IGJldHdlZW4gbGluZXMgb2YgdGhlIHNhbWUgYmxvY2tcbiAgICAjIyNcblxuICAgIGJsb2NraWZ5OiAodG9rZW5zKSAtPlxuXG4gICAgICAgIHRva2VucyA9IEB1bnNsYXNoICAgdG9rZW5zXG4gICAgICAgIHRva2VucyA9IEBtZXJnZW9wICAgdG9rZW5zXG4gICAgICAgIHRva2VucyA9IEB1bmNvbW1lbnQgdG9rZW5zXG4gICAgICAgICMgdG9rZW5zID0gQHVudGFpbCAgICB0b2tlbnMgXG4gICAgICAgICMgdG9rZW5zID0gQGZyb250aWZ5ICB0b2tlbnMgXG5cbiAgICAgICAgYmxvY2tzID0gW11cblxuICAgICAgICBibG9jayA9IHR5cGU6J2Jsb2NrJyB0b2tlbnM6W10gaW5kZW50OicnIGxpbmU6MSBjb2w6MFxuICAgICAgICBibG9ja3MucHVzaCBibG9ja1xuXG4gICAgICAgIG91dGRlbnRUbyA9IChkZXB0aCwgbGluZSkgLT5cbiAgICAgICAgICAgIHdoaWxlIGRlcHRoIDwgYmxvY2suaW5kZW50Lmxlbmd0aFxuICAgICAgICAgICAgICAgIGJsb2Nrcy5wb3AoKVxuICAgICAgICAgICAgICAgIGJsb2NrID0gYmxvY2tzWy0xXVxuXG4gICAgICAgIGZvciBpZHggaW4gMC4uLnRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgIHRvayA9IHRva2Vuc1tpZHhdXG4gICAgICAgICAgICBpZiB0b2sudHlwZSA9PSAnbmwnXG5cbiAgICAgICAgICAgICAgICBueHQgPSB0b2tlbnNbaWR4KzFdXG4gICAgICAgICAgICAgICAgaWYgbnh0Py50eXBlIGluIFsnbmwnXVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgICAgICAgICAgaWYgbnh0Py50eXBlID09ICd3cydcblxuICAgICAgICAgICAgICAgICAgICBpZiB0b2tlbnNbaWR4KzJdPy50eXBlID09ICdubCcgb3IgaWR4KzEgPj0gdG9rZW5zLmxlbmd0aC0xXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIG54dC50ZXh0Lmxlbmd0aCA+IGJsb2NrLmluZGVudC5sZW5ndGhcblxuICAgICAgICAgICAgICAgICAgICAgICAgYmxvY2sgPSB0eXBlOidibG9jaycgdG9rZW5zOltdIGxpbmU6bnh0LmxpbmUsIGluZGVudDpueHQudGV4dCwgY29sOm54dC50ZXh0Lmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgYmxvY2tzWy0xXS50b2tlbnMucHVzaCBibG9ja1xuICAgICAgICAgICAgICAgICAgICAgICAgYmxvY2tzLnB1c2ggYmxvY2tcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiBueHQudGV4dC5sZW5ndGggPCBibG9jay5pbmRlbnQubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRkZW50VG8gbnh0LnRleHQubGVuZ3RoLCBueHQubGluZVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBueHRcbiAgICAgICAgICAgICAgICAgICAgaWYgYmxvY2suaW5kZW50Lmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0ZGVudFRvIDAsIG54dC5saW5lXG5cbiAgICAgICAgICAgIGVsc2UgaWYgdG9rLnR5cGUgPT0gJ3dzJ1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgICAgIGJsb2NrLnRva2Vucy5wdXNoIHRva1xuXG4gICAgICAgIGJsb2Nrc1swXVxuICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gTGV4ZXJcbiJdfQ==
//# sourceURL=../coffee/lexer.coffee