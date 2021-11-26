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
    function Lexer() {
        var key, pat, ref, reg;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGV4ZXIuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJsZXhlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsSUFBQSxHQUFRLE9BQUEsQ0FBUSxNQUFSOztBQUNSLEtBQUEsR0FBUSxPQUFBLENBQVEsUUFBUjs7QUFDUixJQUFBLEdBQVEsT0FBQSxDQUFRLE1BQVI7O0FBRUY7SUFFQyxlQUFBO0FBRUMsWUFBQTtRQUFBLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBSSxDQUFDLElBQUwsQ0FBVSxLQUFLLENBQUMsSUFBTixDQUFXLFNBQVgsRUFBc0Isc0JBQXRCLENBQVY7UUFFWixJQUFDLENBQUEsSUFBRCxHQUFRO0FBQ1I7QUFBQSxhQUFBLFVBQUE7O1lBQ0ksSUFBRyxPQUFPLEdBQVAsS0FBYyxRQUFqQjtnQkFDSSxJQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sQ0FBVyxDQUFDLEdBQUQsRUFBTSxJQUFJLE1BQUosQ0FBVyxHQUFYLENBQU4sQ0FBWCxFQURKO2FBQUEsTUFFSyxJQUFHLEdBQUEsWUFBZSxLQUFsQjtnQkFDRCxHQUFBLEdBQU0sR0FBRyxDQUFDLEdBQUosQ0FBUSxTQUFDLENBQUQ7MkJBQU8sSUFBSSxDQUFDLFlBQUwsQ0FBa0IsRUFBQSxHQUFHLENBQXJCO2dCQUFQLENBQVI7Z0JBQ04sR0FBQSxHQUFNLE1BQUEsR0FBUyxHQUFHLENBQUMsSUFBSixDQUFTLEdBQVQsQ0FBVCxHQUF5QjtnQkFDL0IsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFOLENBQVcsQ0FBQyxHQUFELEVBQU0sSUFBSSxNQUFKLENBQVcsR0FBWCxDQUFOLENBQVgsRUFIQzs7QUFIVDtJQUxEOzs7QUFtQkg7Ozs7Ozs7OztvQkFTQSxRQUFBLEdBQVUsU0FBQyxJQUFEO0FBRU4sWUFBQTtRQUFBLE1BQUEsR0FBUztRQUNULElBQUEsR0FBTztRQUNQLEdBQUEsR0FBTTtBQUNOLGVBQU0sSUFB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QkFDRCxJQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBaEI7d0JBQ0ksU0FBQSxDQUFVLENBQVYsRUFBYSxHQUFHLENBQUMsSUFBakIsRUFESjtxQkFEQztpQkFyQlQ7YUFBQSxNQXlCSyxJQUFHLEdBQUcsQ0FBQyxJQUFKLEtBQVksSUFBZjtBQUNELHlCQURDOztZQUdMLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBYixDQUFrQixHQUFsQjtZQUNBLEtBQUssQ0FBQyxJQUFOLEdBQWEsR0FBRyxDQUFDO0FBL0JyQjtlQWlDQSxNQUFPLENBQUEsQ0FBQTtJQWxERDs7Ozs7O0FBb0RkLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMDBcbjAwMCAgICAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwMCAgICAgIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwXG4wMDAgICAgICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwXG4wMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwXG4jIyNcblxubm9vbiAgPSByZXF1aXJlICdub29uJ1xuc2xhc2ggPSByZXF1aXJlICdrc2xhc2gnXG5rc3RyICA9IHJlcXVpcmUgJ2tzdHInXG5cbmNsYXNzIExleGVyXG5cbiAgICBAOiAtPlxuXG4gICAgICAgIEBwYXR0ZXJucyA9IG5vb24ubG9hZCBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uL2NvZmZlZS9sZXhlci5ub29uJ1xuXG4gICAgICAgIEByZWdzID0gW11cbiAgICAgICAgZm9yIGtleSxwYXQgb2YgQHBhdHRlcm5zXG4gICAgICAgICAgICBpZiB0eXBlb2YgcGF0ID09ICdzdHJpbmcnXG4gICAgICAgICAgICAgICAgQHJlZ3MucHVzaCBba2V5LCBuZXcgUmVnRXhwIHBhdF1cbiAgICAgICAgICAgIGVsc2UgaWYgcGF0IGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgICAgICAgICBwYXQgPSBwYXQubWFwIChwKSAtPiBrc3RyLmVzY2FwZVJlZ2V4cCBcIiN7cH1cIlxuICAgICAgICAgICAgICAgIHJlZyA9ICdcXFxcYignICsgcGF0LmpvaW4oJ3wnKSArICcpXFxcXGInXG4gICAgICAgICAgICAgICAgQHJlZ3MucHVzaCBba2V5LCBuZXcgUmVnRXhwIHJlZ11cblxuICAgICMgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAwMDAwMDAwMFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwICAgICAwMDAgICAwMDBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMCAgICAwMDAgICAgMDAwMDAwMFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAgICAwMDBcbiAgICAjICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDBcblxuICAgICMjI1xuICAgICAgICBjb252ZXJ0cyB0ZXh0IGludG8gYSBsaXN0IG9mIHRva2VuIG9iamVjdHNcbiAgICAgICAgdG9rZW4gb2JqZWN0OlxuICAgICAgICAgICAgdHlwZTogc3RyaW5nICAgICAgICAjIGFueSBvZiB0aGUga2V5cyBpbiBsZXhlci5ub29uXG4gICAgICAgICAgICB0ZXh0OiBzdHJpbmcgICAgICAgICMgdGV4dCBvZiBtYXRjaFxuICAgICAgICAgICAgbGluZTogbnVtYmVyICAgICAgICAjIGxpbmUgbnVtYmVyXG4gICAgICAgICAgICBjb2w6ICBudW1iZXIgICAgICAgICMgc3RhcnQgaW5kZXggaW4gbGluZVxuICAgICMjI1xuXG4gICAgdG9rZW5pemU6ICh0ZXh0KSAtPlxuXG4gICAgICAgIHRva2VucyA9IFtdXG4gICAgICAgIGxpbmUgPSAxXG4gICAgICAgIGNvbCA9IDBcbiAgICAgICAgd2hpbGUgdGV4dC5sZW5ndGhcbiAgICAgICAgICAgIGJlZm9yZSA9IHRleHQubGVuZ3RoXG4gICAgICAgICAgICBmb3IgW2tleSxyZWddIGluIEByZWdzXG4gICAgICAgICAgICAgICAgbWF0Y2ggPSB0ZXh0Lm1hdGNoIHJlZ1xuICAgICAgICAgICAgICAgIGlmIG1hdGNoPy5pbmRleCA9PSAwXG5cbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBpZiBrZXkgPT0gJ25sJyB0aGVuICcnIGVsc2UgbWF0Y2hbMF1cblxuICAgICAgICAgICAgICAgICAgICB0b2tlbnMucHVzaCB0eXBlOmtleSwgdGV4dDp2YWx1ZSwgbGluZTpsaW5lLCBjb2w6Y29sXG5cbiAgICAgICAgICAgICAgICAgICAgaWYga2V5ID09ICdubCdcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbCA9IDBcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmUrK1xuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIGtleSBpbiBbJ2NvbW1lbnQnJ3RyaXBsZSddXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lcyA9IHZhbHVlLnNwbGl0ICdcXG4nXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lICs9IGxpbmVzLmxlbmd0aC0xXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBsaW5lcy5sZW5ndGggPiAxXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sID0gbGluZXNbLTFdLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbCArPSB2YWx1ZS5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgY29sICs9IHZhbHVlLmxlbmd0aFxuXG4gICAgICAgICAgICAgICAgICAgIHRleHQgPSB0ZXh0W21hdGNoWzBdLmxlbmd0aC4uLTFdXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgICAgIGFmdGVyID0gdGV4dC5sZW5ndGhcbiAgICAgICAgICAgIGlmIGJlZm9yZSA9PSBhZnRlclxuICAgICAgICAgICAgICAgIGxvZyBcInN0cmF5IGNoYXJhY3RlciAje3RleHRbMF19IGluIGxpbmUgI3tsaW5lfSBjb2wgI3tjb2x9XCJcbiAgICAgICAgICAgICAgICB0b2tlbnMucHVzaCB0eXBlOidzdHJheScgdGV4dDp0ZXh0WzBdLCBsaW5lOmxpbmUsIGNvbDpjb2xcbiAgICAgICAgICAgICAgICB0ZXh0ID0gdGV4dFsxLi4tMV1cbiAgICAgICAgdG9rZW5zXG5cbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAwICAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuXG4gICAgIyB3YWxrcyB0aHJvdWdoIHRva2VucyBhbmQgam9pbnMgbGluZXMgdGhhdCBlbmQgd2l0aCAnXFwnXG5cbiAgICB1bnNsYXNoOiAodG9rZW5zKSAtPlxuXG4gICAgICAgIG5ld1Rva2VucyA9IFtdXG5cbiAgICAgICAgaWR4ID0gMFxuICAgICAgICB3aGlsZSBpZHggPCB0b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICB0b2sgPSB0b2tlbnNbaWR4XVxuICAgICAgICAgICAgaWYgdG9rLnRleHQgPT0gJ1xcXFwnXG4gICAgICAgICAgICAgICAgaWR4ICs9IDFcbiAgICAgICAgICAgICAgICB3aGlsZSB0b2tlbnNbaWR4XS50eXBlIGluIFsnbmwnICd3cyddXG4gICAgICAgICAgICAgICAgICAgIGlkeCArPSAxXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbmV3VG9rZW5zLnB1c2ggdG9rXG4gICAgICAgICAgICAgICAgaWR4ICs9IDFcblxuICAgICAgICBuZXdUb2tlbnNcbiAgICAgICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgIDAwMDAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgIFxuICAgIFxuICAgICMgd2Fsa3MgdGhyb3VnaCB0b2tlbnMgYW5kIGpvaW5zIGxpbmVzIHRoYXQgZW5kIHdpdGggb3BlcmF0b3JzIChleGNlcHQgKysgYW5kIC0tKVxuICAgIFxuICAgIG1lcmdlb3A6ICh0b2tlbnMpIC0+XG5cbiAgICAgICAgbmV3VG9rZW5zID0gW11cblxuICAgICAgICBpZHggPSAwXG4gICAgICAgIHdoaWxlIGlkeCA8IHRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgIHRvayA9IHRva2Vuc1tpZHhdXG4gICAgICAgICAgICBpZiB0b2sudHlwZSA9PSAnb3AnIGFuZCB0b2sudGV4dCBub3QgaW4gWyctLScnKysnXVxuICAgICAgICAgICAgICAgIG5ld1Rva2Vucy5wdXNoIHRva1xuICAgICAgICAgICAgICAgIGlkeCArPSAxXG4gICAgICAgICAgICAgICAgd2hpbGUgdG9rZW5zW2lkeF0udHlwZSBpbiBbJ25sJyAnd3MnXVxuICAgICAgICAgICAgICAgICAgICBpZHggKz0gMVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG5ld1Rva2Vucy5wdXNoIHRva1xuICAgICAgICAgICAgICAgIGlkeCArPSAxXG5cbiAgICAgICAgbmV3VG9rZW5zXG4gICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAgICAwMDAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIHVuY29tbWVudDogKHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIG5ld1Rva2VucyA9IFtdXG5cbiAgICAgICAgaWR4ID0gMFxuICAgICAgICB3aGlsZSBpZHggPCB0b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICB0b2sgPSB0b2tlbnNbaWR4XVxuICAgICAgICAgICAgaWYgdG9rLnR5cGUgPT0gJ2NvbW1lbnQnXG4gICAgICAgICAgICAgICAgIyBpZiBub3QgKHRva2Vuc1tpZHgtMV0/LnR5cGUgPT0gJ25sJyBvciB0b2tlbnNbaWR4LTJdPy50eXBlID09ICdubCcgYW5kIHRva2Vuc1tpZHgtMV0/LnR5cGUgPT0gJ3dzJylcbiAgICAgICAgICAgICAgICBpZHggKz0gMVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgICAgIG5ld1Rva2Vucy5wdXNoIHRva1xuICAgICAgICAgICAgaWR4ICs9IDFcblxuICAgICAgICBuZXdUb2tlbnNcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAwMDBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAgIDAwMDAwMCAgICAgIDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgICAgMDAwXG5cbiAgICAjIyNcbiAgICAgICAgY29udmVydHMgbGlzdCBvZiB0b2tlbnMgaW50byB0cmVlIG9mIGJsb2Nrc1xuICAgICAgICBibG9jazpcbiAgICAgICAgICAgIHR5cGU6ICAnYmxvY2snXG4gICAgICAgICAgICB0b2tlbnM6IGFycmF5ICAgICAgICAgICAjIHRva2VucyBvZiB0aGUgYmxvY2tcbiAgICAgICAgICAgIGluZGVudDogc3RyaW5nICAgICAgICAgICMgaW5kZW50YXRpb24gc3RyaW5nXG4gICAgICAgICAgICBsaW5lOiAgIG51bWJlciAgICAgICAgICAjIGZpcnN0IGxpbmUgbnVtYmVyXG4gICAgICAgICAgICBsYXN0OiAgIG51bWJlciAgICAgICAgICAjIGxhc3QgbGluZSBudW1iZXJcbiAgICAgICAgICAgIGNvbDogICAgbnVtYmVyXG5cbiAgICAgICAgd3MgdG9rZW5zIGFuZCBlbXB0eSBsaW5lcyBhcmUgcHJ1bmVkIGZyb20gdGhlIHRyZWVcbiAgICAgICAgbmwgdG9rZW5zIGFyZSBvbmx5IGtlcHQgYmV0d2VlbiBsaW5lcyBvZiB0aGUgc2FtZSBibG9ja1xuICAgICMjI1xuXG4gICAgYmxvY2tpZnk6ICh0b2tlbnMpIC0+XG5cbiAgICAgICAgdG9rZW5zID0gQHVuc2xhc2ggICB0b2tlbnNcbiAgICAgICAgdG9rZW5zID0gQG1lcmdlb3AgICB0b2tlbnNcbiAgICAgICAgdG9rZW5zID0gQHVuY29tbWVudCB0b2tlbnNcblxuICAgICAgICBibG9ja3MgPSBbXVxuXG4gICAgICAgIGJsb2NrID0gdHlwZTonYmxvY2snIHRva2VuczpbXSBsaW5lOjEgbGFzdDoxIGluZGVudDonJyBjb2w6MFxuICAgICAgICBibG9ja3MucHVzaCBibG9ja1xuXG4gICAgICAgIG91dGRlbnRUbyA9IChkZXB0aCwgbGluZSkgLT5cbiAgICAgICAgICAgIHdoaWxlIGRlcHRoIDwgYmxvY2suaW5kZW50Lmxlbmd0aFxuICAgICAgICAgICAgICAgIGJsb2Nrcy5wb3AoKVxuICAgICAgICAgICAgICAgIGJsb2NrID0gYmxvY2tzWy0xXVxuICAgICAgICAgICAgICAgIGJsb2NrLmxhc3QgPSBsaW5lXG5cbiAgICAgICAgZm9yIGlkeCBpbiAwLi4udG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgdG9rID0gdG9rZW5zW2lkeF1cbiAgICAgICAgICAgIGlmIHRvay50eXBlID09ICdubCdcblxuICAgICAgICAgICAgICAgIG54dCA9IHRva2Vuc1tpZHgrMV1cbiAgICAgICAgICAgICAgICBpZiBueHQ/LnR5cGUgaW4gWydubCddXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgICAgICAgICBpZiBueHQ/LnR5cGUgPT0gJ3dzJ1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIHRva2Vuc1tpZHgrMl0/LnR5cGUgPT0gJ25sJyBvciBpZHgrMSA+PSB0b2tlbnMubGVuZ3RoLTFcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgICAgICAgICAgICAgaWYgbnh0LnRleHQubGVuZ3RoID4gYmxvY2suaW5kZW50Lmxlbmd0aFxuXG4gICAgICAgICAgICAgICAgICAgICAgICBibG9jayA9IHR5cGU6J2Jsb2NrJyB0b2tlbnM6W10gbGluZTpueHQubGluZSwgbGFzdDpueHQubGluZSwgaW5kZW50Om54dC50ZXh0LCBjb2w6bnh0LnRleHQubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICBibG9ja3NbLTFdLnRva2Vucy5wdXNoIGJsb2NrXG4gICAgICAgICAgICAgICAgICAgICAgICBibG9ja3MucHVzaCBibG9ja1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWVcblxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0Lmxlbmd0aCA8IGJsb2NrLmluZGVudC5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGRlbnRUbyBueHQudGV4dC5sZW5ndGgsIG54dC5saW5lXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBlbHNlIGlmIG54dFxuICAgICAgICAgICAgICAgICAgICBpZiBibG9jay5pbmRlbnQubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRkZW50VG8gMCwgbnh0LmxpbmVcblxuICAgICAgICAgICAgZWxzZSBpZiB0b2sudHlwZSA9PSAnd3MnXG4gICAgICAgICAgICAgICAgY29udGludWVcblxuICAgICAgICAgICAgYmxvY2sudG9rZW5zLnB1c2ggdG9rXG4gICAgICAgICAgICBibG9jay5sYXN0ID0gdG9rLmxpbmVcblxuICAgICAgICBibG9ja3NbMF1cbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IExleGVyXG4iXX0=
//# sourceURL=../coffee/lexer.coffee