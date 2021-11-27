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
        var key, pat, ref, ref1, ref2, ref3, reg;
        this.kode = kode;
        this.debug = (ref = this.kode.args) != null ? ref.debug : void 0;
        this.verbose = (ref1 = this.kode.args) != null ? ref1.verbose : void 0;
        this.raw = (ref2 = this.kode.args) != null ? ref2.raw : void 0;
        this.patterns = noon.load(slash.join(__dirname, '../coffee/lexer.noon'));
        this.regs = [];
        ref3 = this.patterns;
        for (key in ref3) {
            pat = ref3[key];
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
        var frc, fst, idx, ifc, ist, lst, ref, ref1, ref2, ref3, swap, thc, tok, wlc, wst;
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
                    if (((ref1 = tokens[idx - 1]) != null ? ref1.type : void 0) === 'nl' || ((ref2 = tokens[idx - 2]) != null ? ref2.type : void 0) === 'nl' || ((ref3 = tokens[idx - 1]) != null ? ref3.text : void 0) === '=') {
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


    /*
        converts list of tokens into tree of blocks
        block:
            type:  'block'
            tokens: array           # tokens of the block
            indent: string          # indentation string
            line:   number          # first line number
            last:   number          # last line number
            col:    number
    
        ws tokens and empty lines are pruned from the tree
        nl tokens are only kept between lines of the same block
     */

    Lexer.prototype.blockify = function(tokens) {
        var block, blocks, i, idx, j, len, nxt, outdentTo, ref, ref1, ref2, ref3, results, tok;
        tokens = this.unslash(tokens);
        tokens = this.mergeop(tokens);
        tokens = this.uncomment(tokens);
        tokens = this.frontify(tokens);
        blocks = [];
        block = {
            type: 'block',
            tokens: [],
            line: 1,
            last: 1,
            indent: '',
            col: 0
        };
        blocks.push(block);
        outdentTo = function(depth, line) {
            var results;
            results = [];
            while (depth < block.indent.length) {
                blocks.pop();
                block = blocks.slice(-1)[0];
                results.push(block.last = line);
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
                            last: nxt.line,
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
            block.last = tok.line;
        }
        return blocks[0];
    };

    return Lexer;

})();

module.exports = Lexer;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGV4ZXIuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJsZXhlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsSUFBQSxHQUFRLE9BQUEsQ0FBUSxNQUFSOztBQUNSLEtBQUEsR0FBUSxPQUFBLENBQVEsUUFBUjs7QUFDUixJQUFBLEdBQVEsT0FBQSxDQUFRLE1BQVI7O0FBQ1IsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztBQUVGO0lBRUMsZUFBQyxJQUFEO0FBRUMsWUFBQTtRQUZBLElBQUMsQ0FBQSxPQUFEO1FBRUEsSUFBQyxDQUFBLEtBQUQsdUNBQXNCLENBQUU7UUFDeEIsSUFBQyxDQUFBLE9BQUQseUNBQXNCLENBQUU7UUFDeEIsSUFBQyxDQUFBLEdBQUQseUNBQXNCLENBQUU7UUFFeEIsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQUFJLENBQUMsSUFBTCxDQUFVLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBWCxFQUFzQixzQkFBdEIsQ0FBVjtRQUVaLElBQUMsQ0FBQSxJQUFELEdBQVE7QUFDUjtBQUFBLGFBQUEsV0FBQTs7WUFDSSxJQUFHLE9BQU8sR0FBUCxLQUFjLFFBQWpCO2dCQUNJLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBTixDQUFXLENBQUMsR0FBRCxFQUFNLElBQUksTUFBSixDQUFXLEdBQVgsQ0FBTixDQUFYLEVBREo7YUFBQSxNQUVLLElBQUcsR0FBQSxZQUFlLEtBQWxCO2dCQUNELEdBQUEsR0FBTSxHQUFHLENBQUMsR0FBSixDQUFRLFNBQUMsQ0FBRDsyQkFBTyxJQUFJLENBQUMsWUFBTCxDQUFrQixFQUFBLEdBQUcsQ0FBckI7Z0JBQVAsQ0FBUjtnQkFDTixHQUFBLEdBQU0sTUFBQSxHQUFTLEdBQUcsQ0FBQyxJQUFKLENBQVMsR0FBVCxDQUFULEdBQXlCO2dCQUMvQixJQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sQ0FBVyxDQUFDLEdBQUQsRUFBTSxJ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MDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMFxuMDAwICAgICAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwICAgICAgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDBcbjAwMCAgICAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDBcbiMjI1xuXG5ub29uICA9IHJlcXVpcmUgJ25vb24nXG5zbGFzaCA9IHJlcXVpcmUgJ2tzbGFzaCdcbmtzdHIgID0gcmVxdWlyZSAna3N0cidcbnByaW50ID0gcmVxdWlyZSAnLi9wcmludCdcblxuY2xhc3MgTGV4ZXJcblxuICAgIEA6IChAa29kZSkgLT5cblxuICAgICAgICBAZGVidWcgICAgPSBAa29kZS5hcmdzPy5kZWJ1Z1xuICAgICAgICBAdmVyYm9zZSAgPSBAa29kZS5hcmdzPy52ZXJib3NlXG4gICAgICAgIEByYXcgICAgICA9IEBrb2RlLmFyZ3M/LnJhd1xuXG4gICAgICAgIEBwYXR0ZXJucyA9IG5vb24ubG9hZCBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uL2NvZmZlZS9sZXhlci5ub29uJ1xuXG4gICAgICAgIEByZWdzID0gW11cbiAgICAgICAgZm9yIGtleSxwYXQgb2YgQHBhdHRlcm5zXG4gICAgICAgICAgICBpZiB0eXBlb2YgcGF0ID09ICdzdHJpbmcnXG4gICAgICAgICAgICAgICAgQHJlZ3MucHVzaCBba2V5LCBuZXcgUmVnRXhwIHBhdF1cbiAgICAgICAgICAgIGVsc2UgaWYgcGF0IGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgICAgICAgICBwYXQgPSBwYXQubWFwIChwKSAtPiBrc3RyLmVzY2FwZVJlZ2V4cCBcIiN7cH1cIlxuICAgICAgICAgICAgICAgIHJlZyA9ICdcXFxcYignICsgcGF0LmpvaW4oJ3wnKSArICcpXFxcXGInXG4gICAgICAgICAgICAgICAgQHJlZ3MucHVzaCBba2V5LCBuZXcgUmVnRXhwIHJlZ11cblxuICAgICMgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAwMDAwMDAwMFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwICAgICAwMDAgICAwMDBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMCAgICAwMDAgICAgMDAwMDAwMFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAgICAwMDBcbiAgICAjICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDBcblxuICAgICMjI1xuICAgICAgICBjb252ZXJ0cyB0ZXh0IGludG8gYSBsaXN0IG9mIHRva2VuIG9iamVjdHNcbiAgICAgICAgdG9rZW4gb2JqZWN0OlxuICAgICAgICAgICAgdHlwZTogc3RyaW5nICAgICAgICAjIGFueSBvZiB0aGUga2V5cyBpbiBsZXhlci5ub29uXG4gICAgICAgICAgICB0ZXh0OiBzdHJpbmcgICAgICAgICMgdGV4dCBvZiBtYXRjaFxuICAgICAgICAgICAgbGluZTogbnVtYmVyICAgICAgICAjIGxpbmUgbnVtYmVyXG4gICAgICAgICAgICBjb2w6ICBudW1iZXIgICAgICAgICMgc3RhcnQgaW5kZXggaW4gbGluZVxuICAgICMjI1xuXG4gICAgdG9rZW5pemU6ICh0ZXh0KSAtPlxuXG4gICAgICAgIHRva2VucyA9IFtdXG4gICAgICAgIGxpbmUgPSAxXG4gICAgICAgIGNvbCA9IDBcbiAgICAgICAgd2hpbGUgdGV4dC5sZW5ndGhcbiAgICAgICAgICAgIGJlZm9yZSA9IHRleHQubGVuZ3RoXG4gICAgICAgICAgICBmb3IgW2tleSxyZWddIGluIEByZWdzXG4gICAgICAgICAgICAgICAgbWF0Y2ggPSB0ZXh0Lm1hdGNoIHJlZ1xuICAgICAgICAgICAgICAgIGlmIG1hdGNoPy5pbmRleCA9PSAwXG5cbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBpZiBrZXkgPT0gJ25sJyB0aGVuICcnIGVsc2UgbWF0Y2hbMF1cblxuICAgICAgICAgICAgICAgICAgICB0b2tlbnMucHVzaCB0eXBlOmtleSwgdGV4dDp2YWx1ZSwgbGluZTpsaW5lLCBjb2w6Y29sXG5cbiAgICAgICAgICAgICAgICAgICAgaWYga2V5ID09ICdubCdcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbCA9IDBcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmUrK1xuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIGtleSBpbiBbJ2NvbW1lbnQnJ3RyaXBsZSddXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lcyA9IHZhbHVlLnNwbGl0ICdcXG4nXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lICs9IGxpbmVzLmxlbmd0aC0xXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBsaW5lcy5sZW5ndGggPiAxXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sID0gbGluZXNbLTFdLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbCArPSB2YWx1ZS5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgY29sICs9IHZhbHVlLmxlbmd0aFxuXG4gICAgICAgICAgICAgICAgICAgIHRleHQgPSB0ZXh0W21hdGNoWzBdLmxlbmd0aC4uLTFdXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgICAgIGFmdGVyID0gdGV4dC5sZW5ndGhcbiAgICAgICAgICAgIGlmIGJlZm9yZSA9PSBhZnRlclxuICAgICAgICAgICAgICAgIGxvZyBcInN0cmF5IGNoYXJhY3RlciAje3RleHRbMF19IGluIGxpbmUgI3tsaW5lfSBjb2wgI3tjb2x9XCJcbiAgICAgICAgICAgICAgICB0b2tlbnMucHVzaCB0eXBlOidzdHJheScgdGV4dDp0ZXh0WzBdLCBsaW5lOmxpbmUsIGNvbDpjb2xcbiAgICAgICAgICAgICAgICB0ZXh0ID0gdGV4dFsxLi4tMV1cbiAgICAgICAgdG9rZW5zXG5cbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAwICAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuXG4gICAgIyB3YWxrcyB0aHJvdWdoIHRva2VucyBhbmQgam9pbnMgbGluZXMgdGhhdCBlbmQgd2l0aCAnXFwnXG5cbiAgICB1bnNsYXNoOiAodG9rZW5zKSAtPlxuXG4gICAgICAgIG5ld1Rva2VucyA9IFtdXG5cbiAgICAgICAgaWR4ID0gMFxuICAgICAgICB3aGlsZSBpZHggPCB0b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICB0b2sgPSB0b2tlbnNbaWR4XVxuICAgICAgICAgICAgaWYgdG9rLnRleHQgPT0gJ1xcXFwnXG4gICAgICAgICAgICAgICAgaWR4ICs9IDFcbiAgICAgICAgICAgICAgICB3aGlsZSB0b2tlbnNbaWR4XS50eXBlIGluIFsnbmwnICd3cyddXG4gICAgICAgICAgICAgICAgICAgIGlkeCArPSAxXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbmV3VG9rZW5zLnB1c2ggdG9rXG4gICAgICAgICAgICAgICAgaWR4ICs9IDFcblxuICAgICAgICBuZXdUb2tlbnNcbiAgICAgICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgIDAwMDAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgIFxuICAgIFxuICAgICMgd2Fsa3MgdGhyb3VnaCB0b2tlbnMgYW5kIGpvaW5zIGxpbmVzIHRoYXQgZW5kIHdpdGggb3BlcmF0b3JzIChleGNlcHQgKysgYW5kIC0tKVxuICAgIFxuICAgIG1lcmdlb3A6ICh0b2tlbnMpIC0+XG5cbiAgICAgICAgbmV3VG9rZW5zID0gW11cblxuICAgICAgICBpZHggPSAwXG4gICAgICAgIHdoaWxlIGlkeCA8IHRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgIHRvayA9IHRva2Vuc1tpZHhdXG4gICAgICAgICAgICBpZiB0b2sudHlwZSA9PSAnb3AnIGFuZCB0b2sudGV4dCBub3QgaW4gWyctLScnKysnXVxuICAgICAgICAgICAgICAgIG5ld1Rva2Vucy5wdXNoIHRva1xuICAgICAgICAgICAgICAgIGlkeCArPSAxXG4gICAgICAgICAgICAgICAgd2hpbGUgdG9rZW5zW2lkeF0udHlwZSBpbiBbJ25sJyAnd3MnXVxuICAgICAgICAgICAgICAgICAgICBpZHggKz0gMVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG5ld1Rva2Vucy5wdXNoIHRva1xuICAgICAgICAgICAgICAgIGlkeCArPSAxXG5cbiAgICAgICAgbmV3VG9rZW5zXG4gICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAgICAwMDAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIHVuY29tbWVudDogKHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIG5ld1Rva2VucyA9IFtdXG5cbiAgICAgICAgaWR4ID0gMFxuICAgICAgICB3aGlsZSBpZHggPCB0b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICB0b2sgPSB0b2tlbnNbaWR4XVxuICAgICAgICAgICAgaWYgdG9rLnR5cGUgPT0gJ2NvbW1lbnQnXG4gICAgICAgICAgICAgICAgIyBpZiBub3QgKHRva2Vuc1tpZHgtMV0/LnR5cGUgPT0gJ25sJyBvciB0b2tlbnNbaWR4LTJdPy50eXBlID09ICdubCcgYW5kIHRva2Vuc1tpZHgtMV0/LnR5cGUgPT0gJ3dzJylcbiAgICAgICAgICAgICAgICBpZHggKz0gMVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgICAgIG5ld1Rva2Vucy5wdXNoIHRva1xuICAgICAgICAgICAgaWR4ICs9IDFcblxuICAgICAgICBuZXdUb2tlbnNcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAgICAgIDAwMCAwMDAgICBcbiAgICAjIDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAgICAwMDAgICAgIDAwMCAgMDAwMDAwICAgICAgMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICBcbiAgICAjIHN3YXAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgIyAgICAgICAgZXhwIGlmIGNvbmQgICAgICAgICAgICAgICAg4pa4ICAgICAgaWYgY29uZCB0aGVuIGV4cFxuICAgICMgICAgICAgIGV4cCB3aGlsZSBjb25kICAgICAgICAgICAgIOKWuCAgICAgIHdoaWxlIGNvbmQgdGhlbiBleHBcbiAgICAjICAgICAgICBleHAgZm9yIC4uLiBpbi9vZiAuLi4gICAgICDilrggICAgICBmb3IgLi4gaW4vb2YgLi4gdGhlbiBleHBcbiAgICBcbiAgICBmcm9udGlmeTogKHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIGlkeCA9IDBcbiAgICAgICAgbHN0ID0gaXN0ID0gd3N0ID0gZnN0ID0gaWZjID0gd2xjID0gZnJjID0gdGhjID0gMFxuXG4gICAgICAgIHN3YXAgPSA9PlxuICAgICAgICAgICAgcmV0dXJuIGlmIG5vdCAoaXN0IG9yIHdzdCBvciBmc3QpXG4gICAgICAgICAgICBsb2cgdG9rLmxpbmUsIHRvay5jb2wsICdzdGFydCcsIGlzdCwgd3N0LCBmc3QsICdjb3VudCcsIGlmYywgd2xjLCBmcmMsIHRoYyBpZiBAdmVyYm9zZVxuICAgICAgICAgICAgc3QgPSBNYXRoLm1heCBpc3QsIHdzdCwgZnN0XG4gICAgICAgICAgICBwcmludC50b2tlbnMgJ2JlZm9yZScgdG9rZW5zW2xzdC4uLmlkeF0gaWYgQGRlYnVnXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGZyb250ID0gdG9rZW5zLnNwbGljZSBsc3QsIHN0LWxzdFxuICAgICAgICAgICAgZnJvbnQudW5zaGlmdCB0eXBlOidrZXl3b3JkJyB0ZXh0Oid0aGVuJyBsaW5lOnRva2Vuc1tpZHhdPy5saW5lLCBjb2w6dG9rZW5zW2lkeF0/LmNvbFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBbXS5zcGxpY2UuYXBwbHkgdG9rZW5zLCBbaWR4LShzdC1sc3QpLCAwXS5jb25jYXQgZnJvbnRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcHJpbnQudG9rZW5zICdhZnRlcicgdG9rZW5zW2xzdC4uLmlkeCsxXSBpZiBAZGVidWdcbiAgICAgICAgXG4gICAgICAgIHdoaWxlIGlkeCA8IHRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdG9rID0gdG9rZW5zW2lkeF1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgdG9rLnR5cGUgPT0gJ25sJyBvciB0b2sudGV4dCA9PSAnOydcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBzd2FwKCkgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgbHN0ID0gaWR4KzFcbiAgICAgICAgICAgICAgICBpc3QgPSB3c3QgPSBmc3QgXG4gICAgICAgICAgICAgICAgaWZjID0gd2xjID0gZnJjID0gdGhjID0gMFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZSBpZiB0b2sudHlwZSA9PSAnd3MnIGFuZCBpZHggPT0gbHN0IHRoZW4gbHN0ID0gaWR4KzEgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiB0b2sudGV4dCBpbiBbJ2lmJyAnZm9yJyAnd2hpbGUnICdlbHNlJ11cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmICB0b2tlbnNbaWR4LTFdPy50eXBlID09ICdubCcgb3IgXFxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRva2Vuc1tpZHgtMl0/LnR5cGUgPT0gJ25sJyBvciBcXCAjIGxpbmUgc3RhcnRzIHdpdGgga3dcbiAgICAgICAgICAgICAgICAgICAgICAgIHRva2Vuc1tpZHgtMV0/LnRleHQgPT0gJz0nICAgICAgICMgb3IgeCA9IGlmfGZvcnx3aGlsZS4uLiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICArK2lkeCB3aGlsZSBpZHggPCB0b2tlbnMubGVuZ3RoIGFuZCB0b2tlbnNbaWR4XS50eXBlICE9ICdubCcgIyBza2lwIHVudGlsIG5leHQgbmxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHN3aXRjaCB0b2sudGV4dCBcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnaWYnICAgIHRoZW4gaWZjKysgOyBpc3QgPSBpZHggaWYgaXN0ID09IDAgXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ2ZvcicgICB0aGVuIGZyYysrIDsgZnN0ID0gaWR4IGlmIGZzdCA9PSAwIFxuICAgICAgICAgICAgICAgICAgICB3aGVuICd3aGlsZScgdGhlbiB3bGMrKyA7IHdzdCA9IGlkeCBpZiB3c3QgPT0gMCBcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAndGhlbicgIHRoZW4gdGhjKytcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnZWxzZScgIFxuICAgICAgICAgICAgICAgICAgICAgICAgaWZjKysgaWYgdG9rZW5zW2lkeCsyXS50ZXh0ICE9ICdpZicgXG4gICAgICAgICAgICBpZHgrK1xuICAgICAgICBcbiAgICAgICAgc3dhcCgpXG4gICAgICAgIFxuICAgICAgICB0b2tlbnNcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAwMDBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAgIDAwMDAwMCAgICAgIDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgICAgMDAwXG5cbiAgICAjIyNcbiAgICAgICAgY29udmVydHMgbGlzdCBvZiB0b2tlbnMgaW50byB0cmVlIG9mIGJsb2Nrc1xuICAgICAgICBibG9jazpcbiAgICAgICAgICAgIHR5cGU6ICAnYmxvY2snXG4gICAgICAgICAgICB0b2tlbnM6IGFycmF5ICAgICAgICAgICAjIHRva2VucyBvZiB0aGUgYmxvY2tcbiAgICAgICAgICAgIGluZGVudDogc3RyaW5nICAgICAgICAgICMgaW5kZW50YXRpb24gc3RyaW5nXG4gICAgICAgICAgICBsaW5lOiAgIG51bWJlciAgICAgICAgICAjIGZpcnN0IGxpbmUgbnVtYmVyXG4gICAgICAgICAgICBsYXN0OiAgIG51bWJlciAgICAgICAgICAjIGxhc3QgbGluZSBudW1iZXJcbiAgICAgICAgICAgIGNvbDogICAgbnVtYmVyXG5cbiAgICAgICAgd3MgdG9rZW5zIGFuZCBlbXB0eSBsaW5lcyBhcmUgcHJ1bmVkIGZyb20gdGhlIHRyZWVcbiAgICAgICAgbmwgdG9rZW5zIGFyZSBvbmx5IGtlcHQgYmV0d2VlbiBsaW5lcyBvZiB0aGUgc2FtZSBibG9ja1xuICAgICMjI1xuXG4gICAgYmxvY2tpZnk6ICh0b2tlbnMpIC0+XG5cbiAgICAgICAgdG9rZW5zID0gQHVuc2xhc2ggICB0b2tlbnNcbiAgICAgICAgdG9rZW5zID0gQG1lcmdlb3AgICB0b2tlbnNcbiAgICAgICAgdG9rZW5zID0gQHVuY29tbWVudCB0b2tlbnNcbiAgICAgICAgdG9rZW5zID0gQGZyb250aWZ5ICB0b2tlbnMgXG5cbiAgICAgICAgYmxvY2tzID0gW11cblxuICAgICAgICBibG9jayA9IHR5cGU6J2Jsb2NrJyB0b2tlbnM6W10gbGluZToxIGxhc3Q6MSBpbmRlbnQ6JycgY29sOjBcbiAgICAgICAgYmxvY2tzLnB1c2ggYmxvY2tcblxuICAgICAgICBvdXRkZW50VG8gPSAoZGVwdGgsIGxpbmUpIC0+XG4gICAgICAgICAgICB3aGlsZSBkZXB0aCA8IGJsb2NrLmluZGVudC5sZW5ndGhcbiAgICAgICAgICAgICAgICBibG9ja3MucG9wKClcbiAgICAgICAgICAgICAgICBibG9jayA9IGJsb2Nrc1stMV1cbiAgICAgICAgICAgICAgICBibG9jay5sYXN0ID0gbGluZVxuXG4gICAgICAgIGZvciBpZHggaW4gMC4uLnRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgIHRvayA9IHRva2Vuc1tpZHhdXG4gICAgICAgICAgICBpZiB0b2sudHlwZSA9PSAnbmwnXG5cbiAgICAgICAgICAgICAgICBueHQgPSB0b2tlbnNbaWR4KzFdXG4gICAgICAgICAgICAgICAgaWYgbnh0Py50eXBlIGluIFsnbmwnXVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgICAgICAgICAgaWYgbnh0Py50eXBlID09ICd3cydcblxuICAgICAgICAgICAgICAgICAgICBpZiB0b2tlbnNbaWR4KzJdPy50eXBlID09ICdubCcgb3IgaWR4KzEgPj0gdG9rZW5zLmxlbmd0aC0xXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIG54dC50ZXh0Lmxlbmd0aCA+IGJsb2NrLmluZGVudC5sZW5ndGhcblxuICAgICAgICAgICAgICAgICAgICAgICAgYmxvY2sgPSB0eXBlOidibG9jaycgdG9rZW5zOltdIGxpbmU6bnh0LmxpbmUsIGxhc3Q6bnh0LmxpbmUsIGluZGVudDpueHQudGV4dCwgY29sOm54dC50ZXh0Lmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgYmxvY2tzWy0xXS50b2tlbnMucHVzaCBibG9ja1xuICAgICAgICAgICAgICAgICAgICAgICAgYmxvY2tzLnB1c2ggYmxvY2tcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiBueHQudGV4dC5sZW5ndGggPCBibG9jay5pbmRlbnQubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRkZW50VG8gbnh0LnRleHQubGVuZ3RoLCBueHQubGluZVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBueHRcbiAgICAgICAgICAgICAgICAgICAgaWYgYmxvY2suaW5kZW50Lmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0ZGVudFRvIDAsIG54dC5saW5lXG5cbiAgICAgICAgICAgIGVsc2UgaWYgdG9rLnR5cGUgPT0gJ3dzJ1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgICAgIGJsb2NrLnRva2Vucy5wdXNoIHRva1xuICAgICAgICAgICAgYmxvY2subGFzdCA9IHRvay5saW5lXG5cbiAgICAgICAgYmxvY2tzWzBdXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBMZXhlclxuIl19
//# sourceURL=../coffee/lexer.coffee