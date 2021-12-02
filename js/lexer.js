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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGV4ZXIuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJsZXhlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsSUFBQSxHQUFRLE9BQUEsQ0FBUSxNQUFSOztBQUNSLEtBQUEsR0FBUSxPQUFBLENBQVEsUUFBUjs7QUFDUixJQUFBLEdBQVEsT0FBQSxDQUFRLE1BQVI7O0FBRUY7SUFFQyxlQUFDLElBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLE9BQUQ7UUFFQSxJQUFDLENBQUEsS0FBRCxHQUFZLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3ZCLElBQUMsQ0FBQSxPQUFELEdBQVksSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDdkIsSUFBQyxDQUFBLEdBQUQsR0FBWSxJQUFDLENBQUEsSUFBSSxDQUFDLElBQUksQ0FBQztRQUV2QixJQUFDLENBQUEsUUFBRCxHQUFZLElBQUksQ0FBQyxJQUFMLENBQVUsS0FBSyxDQUFDLElBQU4sQ0FBVyxTQUFYLEVBQXNCLHNCQUF0QixDQUFWO1FBRVosSUFBQyxDQUFBLElBQUQsR0FBUTtBQUNSO0FBQUEsYUFBQSxVQUFBOztZQUNJLElBQUcsT0FBTyxHQUFQLEtBQWMsUUFBakI7Z0JBQ0ksSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFOLENBQVcsQ0FBQyxHQUFELEVBQU0sSUFBSSxNQUFKLENBQVcsR0FBWCxDQUFOLENBQVgsRUFESjthQUFBLE1BRUssSUFBRyxHQUFBLFlBQWUsS0FBbEI7Z0JBQ0QsR0FBQSxHQUFNLEdBQUcsQ0FBQyxHQUFKLENBQVEsU0FBQyxDQUFEOzJCQUFPLElBQUksQ0FBQyxZQUFMLENBQWtCLEVBQUEsR0FBRyxDQUFyQjtnQkFBUCxDQUFSO2dCQUNOLEdBQUEsR0FBTSxNQUFBLEdBQVMsR0FBRyxDQUFDLElBQUosQ0FBUyxHQUFULENBQVQsR0FBeUI7Z0JBQy9CLElBQUMsQ0FB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TSxDQUFDLE1BQWxDO3dCQUNELFNBQUEsQ0FBVSxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQW5CLEVBQTJCLEdBQUcsQ0FBQyxJQUEvQixFQURDO3FCQVpUO2lCQUFBLE1BZUssSUFBRyxHQUFIO29CQUNELElBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFoQjt3QkFDSSxTQUFBLENBQVUsQ0FBVixFQUFhLEdBQUcsQ0FBQyxJQUFqQixFQURKO3FCQURDO2lCQXJCVDthQUFBLE1BeUJLLElBQUcsR0FBRyxDQUFDLElBQUosS0FBWSxJQUFmO0FBQ0QseUJBREM7O1lBR0wsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFiLENBQWtCLEdBQWxCO0FBOUJKO2VBZ0NBLE1BQU8sQ0FBQSxDQUFBO0lBaEREOzs7Ozs7QUFrRGQsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMCAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMFxuMDAwICAgICAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwICAgICAgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDBcbjAwMCAgICAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDBcbiMjI1xuXG5ub29uICA9IHJlcXVpcmUgJ25vb24nXG5zbGFzaCA9IHJlcXVpcmUgJ2tzbGFzaCdcbmtzdHIgID0gcmVxdWlyZSAna3N0cidcblxuY2xhc3MgTGV4ZXJcblxuICAgIEA6IChAa29kZSkgLT5cblxuICAgICAgICBAZGVidWcgICAgPSBAa29kZS5hcmdzLmRlYnVnXG4gICAgICAgIEB2ZXJib3NlICA9IEBrb2RlLmFyZ3MudmVyYm9zZVxuICAgICAgICBAcmF3ICAgICAgPSBAa29kZS5hcmdzLnJhd1xuXG4gICAgICAgIEBwYXR0ZXJucyA9IG5vb24ubG9hZCBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uL2NvZmZlZS9sZXhlci5ub29uJ1xuXG4gICAgICAgIEByZWdzID0gW11cbiAgICAgICAgZm9yIGtleSxwYXQgb2YgQHBhdHRlcm5zXG4gICAgICAgICAgICBpZiB0eXBlb2YgcGF0ID09ICdzdHJpbmcnXG4gICAgICAgICAgICAgICAgQHJlZ3MucHVzaCBba2V5LCBuZXcgUmVnRXhwIHBhdF1cbiAgICAgICAgICAgIGVsc2UgaWYgcGF0IGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgICAgICAgICBwYXQgPSBwYXQubWFwIChwKSAtPiBrc3RyLmVzY2FwZVJlZ2V4cCBcIiN7cH1cIlxuICAgICAgICAgICAgICAgIHJlZyA9ICdcXFxcYignICsgcGF0LmpvaW4oJ3wnKSArICcpXFxcXGInXG4gICAgICAgICAgICAgICAgQHJlZ3MucHVzaCBba2V5LCBuZXcgUmVnRXhwIHJlZ11cblxuICAgICMgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAwMDAwMDAwMFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwICAgICAwMDAgICAwMDBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMCAgICAwMDAgICAgMDAwMDAwMFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAgICAwMDBcbiAgICAjICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDBcblxuICAgICMjI1xuICAgICAgICBjb252ZXJ0cyB0ZXh0IGludG8gYSBsaXN0IG9mIHRva2VuIG9iamVjdHNcbiAgICAgICAgdG9rZW4gb2JqZWN0OlxuICAgICAgICAgICAgdHlwZTogc3RyaW5nICAgICAgICAjIGFueSBvZiB0aGUga2V5cyBpbiBsZXhlci5ub29uXG4gICAgICAgICAgICB0ZXh0OiBzdHJpbmcgICAgICAgICMgdGV4dCBvZiBtYXRjaFxuICAgICAgICAgICAgbGluZTogbnVtYmVyICAgICAgICAjIGxpbmUgbnVtYmVyXG4gICAgICAgICAgICBjb2w6ICBudW1iZXIgICAgICAgICMgc3RhcnQgaW5kZXggaW4gbGluZVxuICAgICMjI1xuXG4gICAgdG9rZW5pemU6ICh0ZXh0KSAtPlxuXG4gICAgICAgIHRva2VucyA9IFtdXG4gICAgICAgIGxpbmUgPSAxXG4gICAgICAgIGNvbCA9IDBcbiAgICAgICAgd2hpbGUgdGV4dC5sZW5ndGhcbiAgICAgICAgICAgIGJlZm9yZSA9IHRleHQubGVuZ3RoXG4gICAgICAgICAgICBmb3IgW2tleSxyZWddIGluIEByZWdzXG4gICAgICAgICAgICAgICAgbWF0Y2ggPSB0ZXh0Lm1hdGNoIHJlZ1xuICAgICAgICAgICAgICAgIGlmIG1hdGNoPy5pbmRleCA9PSAwXG5cbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBpZiBrZXkgPT0gJ25sJyB0aGVuICcnIGVsc2UgbWF0Y2hbMF1cblxuICAgICAgICAgICAgICAgICAgICB0b2tlbnMucHVzaCB0eXBlOmtleSwgdGV4dDp2YWx1ZSwgbGluZTpsaW5lLCBjb2w6Y29sXG5cbiAgICAgICAgICAgICAgICAgICAgaWYga2V5ID09ICdubCdcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbCA9IDBcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmUrK1xuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIGtleSBpbiBbJ2NvbW1lbnQnJ3RyaXBsZSddXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lcyA9IHZhbHVlLnNwbGl0ICdcXG4nXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lICs9IGxpbmVzLmxlbmd0aC0xXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBsaW5lcy5sZW5ndGggPiAxXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sID0gbGluZXNbLTFdLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbCArPSB2YWx1ZS5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgY29sICs9IHZhbHVlLmxlbmd0aFxuXG4gICAgICAgICAgICAgICAgICAgIHRleHQgPSB0ZXh0W21hdGNoWzBdLmxlbmd0aC4uLTFdXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgICAgIGFmdGVyID0gdGV4dC5sZW5ndGhcbiAgICAgICAgICAgIGlmIGJlZm9yZSA9PSBhZnRlclxuICAgICAgICAgICAgICAgIGxvZyBcInN0cmF5IGNoYXJhY3RlciAje3RleHRbMF19IGluIGxpbmUgI3tsaW5lfSBjb2wgI3tjb2x9XCJcbiAgICAgICAgICAgICAgICB0b2tlbnMucHVzaCB0eXBlOidzdHJheScgdGV4dDp0ZXh0WzBdLCBsaW5lOmxpbmUsIGNvbDpjb2xcbiAgICAgICAgICAgICAgICB0ZXh0ID0gdGV4dFsxLi4tMV1cbiAgICAgICAgdG9rZW5zXG5cbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAwICAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuXG4gICAgIyB3YWxrcyB0aHJvdWdoIHRva2VucyBhbmQgam9pbnMgbGluZXMgdGhhdCBlbmQgd2l0aCAnXFwnXG5cbiAgICB1bnNsYXNoOiAodG9rZW5zKSAtPlxuXG4gICAgICAgIG5ld1Rva2VucyA9IFtdXG5cbiAgICAgICAgaWR4ID0gMFxuICAgICAgICB3aGlsZSBpZHggPCB0b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICB0b2sgPSB0b2tlbnNbaWR4XVxuICAgICAgICAgICAgaWYgdG9rLnRleHQgPT0gJ1xcXFwnXG4gICAgICAgICAgICAgICAgaWR4ICs9IDFcbiAgICAgICAgICAgICAgICB3aGlsZSB0b2tlbnNbaWR4XS50eXBlIGluIFsnbmwnICd3cyddXG4gICAgICAgICAgICAgICAgICAgIGlkeCArPSAxXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbmV3VG9rZW5zLnB1c2ggdG9rXG4gICAgICAgICAgICAgICAgaWR4ICs9IDFcblxuICAgICAgICBuZXdUb2tlbnNcbiAgICAgICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgIDAwMDAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgIFxuICAgIFxuICAgICMgd2Fsa3MgdGhyb3VnaCB0b2tlbnMgYW5kIGpvaW5zIGxpbmVzIHRoYXQgZW5kIHdpdGggb3BlcmF0b3JzIChleGNlcHQgKysgYW5kIC0tKVxuICAgIFxuICAgIG1lcmdlb3A6ICh0b2tlbnMpIC0+XG5cbiAgICAgICAgbmV3VG9rZW5zID0gW11cblxuICAgICAgICBpZHggPSAwXG4gICAgICAgIHdoaWxlIGlkeCA8IHRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgIHRvayA9IHRva2Vuc1tpZHhdXG4gICAgICAgICAgICBpZiB0b2sudHlwZSA9PSAnb3AnIGFuZCB0b2sudGV4dCBub3QgaW4gWyctLScnKysnXVxuICAgICAgICAgICAgICAgIG5ld1Rva2Vucy5wdXNoIHRva1xuICAgICAgICAgICAgICAgIGlkeCArPSAxXG4gICAgICAgICAgICAgICAgd2hpbGUgdG9rZW5zW2lkeF0udHlwZSBpbiBbJ25sJyAnd3MnXVxuICAgICAgICAgICAgICAgICAgICBpZHggKz0gMVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG5ld1Rva2Vucy5wdXNoIHRva1xuICAgICAgICAgICAgICAgIGlkeCArPSAxXG5cbiAgICAgICAgbmV3VG9rZW5zXG4gICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAgICAwMDAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgICMgVE9ETzoga2VlcCB0aGUgc3dhbGxvd2VkIHRva2VucyBhbmQgcmVpbnNlcnQgdGhlbSBhZnRlciBwYXJzaW5nXG4gICAgXG4gICAgdW5jb21tZW50OiAodG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgbmV3VG9rZW5zID0gW11cblxuICAgICAgICBpZHggPSAwXG4gICAgICAgIHdoaWxlIGlkeCA8IHRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgIHRvayA9IHRva2Vuc1tpZHhdXG4gICAgICAgICAgICBpZiB0b2sudHlwZSA9PSAnY29tbWVudCdcbiAgICAgICAgICAgICAgICAjIGlmIG5vdCAodG9rZW5zW2lkeC0xXT8udHlwZSA9PSAnbmwnIG9yIHRva2Vuc1tpZHgtMl0/LnR5cGUgPT0gJ25sJyBhbmQgdG9rZW5zW2lkeC0xXT8udHlwZSA9PSAnd3MnKVxuICAgICAgICAgICAgICAgIGlkeCArPSAxXG4gICAgICAgICAgICAgICAgY29udGludWVcblxuICAgICAgICAgICAgbmV3VG9rZW5zLnB1c2ggdG9rXG4gICAgICAgICAgICBpZHggKz0gMVxuXG4gICAgICAgIG5ld1Rva2Vuc1xuICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwIDAwMFxuICAgICMgMDAwMDAwMCAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMCAgMDAwMDAwICAgICAgMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgICAwMDBcblxuICAgICMjI1xuICAgICAgICBjb252ZXJ0cyBsaXN0IG9mIHRva2VucyBpbnRvIHRyZWUgb2YgYmxvY2tzXG4gICAgICAgIGJsb2NrOlxuICAgICAgICAgICAgdHlwZTogICdibG9jaydcbiAgICAgICAgICAgIHRva2VuczogYXJyYXkgICAgICAgICAgICMgdG9rZW5zIG9mIHRoZSBibG9ja1xuICAgICAgICAgICAgaW5kZW50OiBzdHJpbmcgICAgICAgICAgIyBpbmRlbnRhdGlvbiBzdHJpbmdcbiAgICAgICAgICAgIGxpbmU6ICAgbnVtYmVyICAgICAgICAgICMgZmlyc3QgbGluZSBudW1iZXJcbiAgICAgICAgICAgIGNvbDogICAgbnVtYmVyXG5cbiAgICAgICAgd3MgdG9rZW5zIGFuZCBlbXB0eSBsaW5lcyBhcmUgcHJ1bmVkIGZyb20gdGhlIHRyZWVcbiAgICAgICAgbmwgdG9rZW5zIGFyZSBvbmx5IGtlcHQgYmV0d2VlbiBsaW5lcyBvZiB0aGUgc2FtZSBibG9ja1xuICAgICMjI1xuXG4gICAgYmxvY2tpZnk6ICh0b2tlbnMpIC0+XG5cbiAgICAgICAgdG9rZW5zID0gQHVuc2xhc2ggICB0b2tlbnNcbiAgICAgICAgdG9rZW5zID0gQG1lcmdlb3AgICB0b2tlbnNcbiAgICAgICAgdG9rZW5zID0gQHVuY29tbWVudCB0b2tlbnNcblxuICAgICAgICBibG9ja3MgPSBbXVxuXG4gICAgICAgIGJsb2NrID0gdHlwZTonYmxvY2snIHRva2VuczpbXSBpbmRlbnQ6JycgbGluZToxIGNvbDowXG4gICAgICAgIGJsb2Nrcy5wdXNoIGJsb2NrXG5cbiAgICAgICAgb3V0ZGVudFRvID0gKGRlcHRoLCBsaW5lKSAtPlxuICAgICAgICAgICAgd2hpbGUgZGVwdGggPCBibG9jay5pbmRlbnQubGVuZ3RoXG4gICAgICAgICAgICAgICAgYmxvY2tzLnBvcCgpXG4gICAgICAgICAgICAgICAgYmxvY2sgPSBibG9ja3NbLTFdXG5cbiAgICAgICAgZm9yIGlkeCBpbiAwLi4udG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgdG9rID0gdG9rZW5zW2lkeF1cbiAgICAgICAgICAgIGlmIHRvay50eXBlID09ICdubCdcblxuICAgICAgICAgICAgICAgIG54dCA9IHRva2Vuc1tpZHgrMV1cbiAgICAgICAgICAgICAgICBpZiBueHQ/LnR5cGUgaW4gWydubCddXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgICAgICAgICBpZiBueHQ/LnR5cGUgPT0gJ3dzJ1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIHRva2Vuc1tpZHgrMl0/LnR5cGUgPT0gJ25sJyBvciBpZHgrMSA+PSB0b2tlbnMubGVuZ3RoLTFcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgICAgICAgICAgICAgaWYgbnh0LnRleHQubGVuZ3RoID4gYmxvY2suaW5kZW50Lmxlbmd0aFxuXG4gICAgICAgICAgICAgICAgICAgICAgICBibG9jayA9IHR5cGU6J2Jsb2NrJyB0b2tlbnM6W10gbGluZTpueHQubGluZSwgaW5kZW50Om54dC50ZXh0LCBjb2w6bnh0LnRleHQubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICBibG9ja3NbLTFdLnRva2Vucy5wdXNoIGJsb2NrXG4gICAgICAgICAgICAgICAgICAgICAgICBibG9ja3MucHVzaCBibG9ja1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWVcblxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0Lmxlbmd0aCA8IGJsb2NrLmluZGVudC5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGRlbnRUbyBueHQudGV4dC5sZW5ndGgsIG54dC5saW5lXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBlbHNlIGlmIG54dFxuICAgICAgICAgICAgICAgICAgICBpZiBibG9jay5pbmRlbnQubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRkZW50VG8gMCwgbnh0LmxpbmVcblxuICAgICAgICAgICAgZWxzZSBpZiB0b2sudHlwZSA9PSAnd3MnXG4gICAgICAgICAgICAgICAgY29udGludWVcblxuICAgICAgICAgICAgYmxvY2sudG9rZW5zLnB1c2ggdG9rXG5cbiAgICAgICAgYmxvY2tzWzBdXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBMZXhlclxuIl19
//# sourceURL=../coffee/lexer.coffee