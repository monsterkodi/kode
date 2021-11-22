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
            type: string # any of the keys in lexer.noon
            text: string # text of match
            line: number # line number
            col:  number # start index in line
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


    /*
        converts list of tokens into tree of blocks
        block:
            type:  'block'
            tokens: array  # tokens of the block
            indent: string # indentation string
            line:   number # first line number
            last:   number # last line number
            col:    number
    
        ws tokens and empty lines are pruned from the tree
        nl tokens are only kept between lines of the same block
     */

    Lexer.prototype.blockify = function(tokens) {
        var block, blocks, i, idx, j, len, nxt, outdentTo, ref, ref1, ref2, ref3, results, tok;
        tokens = this.unslash(tokens);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGV4ZXIuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJsZXhlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsSUFBQSxHQUFRLE9BQUEsQ0FBUSxNQUFSOztBQUNSLEtBQUEsR0FBUSxPQUFBLENBQVEsUUFBUjs7QUFDUixJQUFBLEdBQVEsT0FBQSxDQUFRLE1BQVI7O0FBRUY7SUFFQyxlQUFBO0FBRUMsWUFBQTtRQUFBLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBSSxDQUFDLElBQUwsQ0FBVSxLQUFLLENBQUMsSUFBTixDQUFXLFNBQVgsRUFBc0Isc0JBQXRCLENBQVY7UUFFWixJQUFDLENBQUEsSUFBRCxHQUFRO0FBQ1I7QUFBQSxhQUFBLFVBQUE7O1lBQ0ksSUFBRyxPQUFPLEdBQVAsS0FBYyxRQUFqQjtnQkFDSSxJQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sQ0FBVyxDQUFDLEdBQUQsRUFBTSxJQUFJLE1BQUosQ0FBVyxHQUFYLENBQU4sQ0FBWCxFQURKO2FBQUEsTUFFSyxJQUFHLEdBQUEsWUFBZSxLQUFsQjtnQkFDRCxHQUFBLEdBQU0sR0FBRyxDQUFDLEdBQUosQ0FBUSxTQUFDLENBQUQ7MkJBQU8sSUFBSSxDQUFDLFlBQUwsQ0FBa0IsRUFBQSxHQUFHLENBQXJCO2dCQUFQLENBQVI7Z0JBQ04sR0FBQSxHQUFNLE1BQUEsR0FBUyxHQUFHLENBQUMsSUFBSixDQUFTLEdBQVQsQ0FBVCxHQUF5QjtnQkFDL0IsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFOLENBQVcsQ0FBQyxHQUFELEVBQU0sSUFBSSxNQUFKLENBQVcsR0FBWCxDQUFOLENBQVgsRUFIQzs7QUFIVDtJQUxEOzs7QUFtQkg7Ozs7Ozs7OztvQkFTQSxRQUFBLEdBQVUsU0FBQyxJQUFEO0FBRU4sWUFBQTtRQUFBLE1BQUEsR0FBUztRQUNULElBQUEsR0FBTztRQUNQLEdBQUEsR0FBTTtBQUNOLGVBQU0sSUFB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bEM7d0JBQ0QsU0FBQSxDQUFVLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBbkIsRUFBMkIsR0FBRyxDQUFDLElBQS9CLEVBREM7cUJBWlQ7aUJBQUEsTUFlSyxJQUFHLEdBQUg7b0JBQ0QsSUFBRyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQWhCO3dCQUNJLFNBQUEsQ0FBVSxDQUFWLEVBQWEsR0FBRyxDQUFDLElBQWpCLEVBREo7cUJBREM7aUJBckJUO2FBQUEsTUF5QkssSUFBRyxHQUFHLENBQUMsSUFBSixLQUFZLElBQWY7QUFDRCx5QkFEQzs7WUFHTCxLQUFLLENBQUMsTUFBTSxDQUFDLElBQWIsQ0FBa0IsR0FBbEI7WUFDQSxLQUFLLENBQUMsSUFBTixHQUFhLEdBQUcsQ0FBQztBQS9CckI7ZUFpQ0EsTUFBTyxDQUFBLENBQUE7SUFoREQ7Ozs7OztBQWtEZCxNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwXG4wMDAgICAgICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwXG4wMDAgICAgICAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMFxuMDAwICAgICAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuIyMjXG5cbm5vb24gID0gcmVxdWlyZSAnbm9vbidcbnNsYXNoID0gcmVxdWlyZSAna3NsYXNoJ1xua3N0ciAgPSByZXF1aXJlICdrc3RyJ1xuXG5jbGFzcyBMZXhlclxuXG4gICAgQDogLT5cblxuICAgICAgICBAcGF0dGVybnMgPSBub29uLmxvYWQgc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLi9jb2ZmZWUvbGV4ZXIubm9vbidcblxuICAgICAgICBAcmVncyA9IFtdXG4gICAgICAgIGZvciBrZXkscGF0IG9mIEBwYXR0ZXJuc1xuICAgICAgICAgICAgaWYgdHlwZW9mIHBhdCA9PSAnc3RyaW5nJ1xuICAgICAgICAgICAgICAgIEByZWdzLnB1c2ggW2tleSwgbmV3IFJlZ0V4cCBwYXRdXG4gICAgICAgICAgICBlbHNlIGlmIHBhdCBpbnN0YW5jZW9mIEFycmF5XG4gICAgICAgICAgICAgICAgcGF0ID0gcGF0Lm1hcCAocCkgLT4ga3N0ci5lc2NhcGVSZWdleHAgXCIje3B9XCJcbiAgICAgICAgICAgICAgICByZWcgPSAnXFxcXGIoJyArIHBhdC5qb2luKCd8JykgKyAnKVxcXFxiJ1xuICAgICAgICAgICAgICAgIEByZWdzLnB1c2ggW2tleSwgbmV3IFJlZ0V4cCByZWddXG5cbiAgICAjIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgICAgMDAwICAgMDAwXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAgICAgMDAwICAgIDAwMDAwMDBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4gICAgIyAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwXG5cbiAgICAjIyNcbiAgICAgICAgY29udmVydHMgdGV4dCBpbnRvIGEgbGlzdCBvZiB0b2tlbiBvYmplY3RzXG4gICAgICAgIHRva2VuIG9iamVjdDpcbiAgICAgICAgICAgIHR5cGU6IHN0cmluZyAjIGFueSBvZiB0aGUga2V5cyBpbiBsZXhlci5ub29uXG4gICAgICAgICAgICB0ZXh0OiBzdHJpbmcgIyB0ZXh0IG9mIG1hdGNoXG4gICAgICAgICAgICBsaW5lOiBudW1iZXIgIyBsaW5lIG51bWJlclxuICAgICAgICAgICAgY29sOiAgbnVtYmVyICMgc3RhcnQgaW5kZXggaW4gbGluZVxuICAgICMjI1xuXG4gICAgdG9rZW5pemU6ICh0ZXh0KSAtPlxuXG4gICAgICAgIHRva2VucyA9IFtdXG4gICAgICAgIGxpbmUgPSAxXG4gICAgICAgIGNvbCA9IDBcbiAgICAgICAgd2hpbGUgdGV4dC5sZW5ndGhcbiAgICAgICAgICAgIGJlZm9yZSA9IHRleHQubGVuZ3RoXG4gICAgICAgICAgICBmb3IgW2tleSxyZWddIGluIEByZWdzXG4gICAgICAgICAgICAgICAgbWF0Y2ggPSB0ZXh0Lm1hdGNoIHJlZ1xuICAgICAgICAgICAgICAgIGlmIG1hdGNoPy5pbmRleCA9PSAwXG5cbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBpZiBrZXkgPT0gJ25sJyB0aGVuICcnIGVsc2UgbWF0Y2hbMF1cblxuICAgICAgICAgICAgICAgICAgICB0b2tlbnMucHVzaCB0eXBlOmtleSwgdGV4dDp2YWx1ZSwgbGluZTpsaW5lLCBjb2w6Y29sXG5cbiAgICAgICAgICAgICAgICAgICAgaWYga2V5ID09ICdubCdcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbCA9IDBcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmUrK1xuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIGtleSBpbiBbJ2NvbW1lbnQnJ3RyaXBsZSddXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lcyA9IHZhbHVlLnNwbGl0ICdcXG4nXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lICs9IGxpbmVzLmxlbmd0aC0xXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBsaW5lcy5sZW5ndGggPiAxXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sID0gbGluZXNbLTFdLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbCArPSB2YWx1ZS5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgY29sICs9IHZhbHVlLmxlbmd0aFxuXG4gICAgICAgICAgICAgICAgICAgIHRleHQgPSB0ZXh0W21hdGNoWzBdLmxlbmd0aC4uLTFdXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgICAgIGFmdGVyID0gdGV4dC5sZW5ndGhcbiAgICAgICAgICAgIGlmIGJlZm9yZSA9PSBhZnRlclxuICAgICAgICAgICAgICAgIGxvZyBcInN0cmF5IGNoYXJhY3RlciAje3RleHRbMF19IGluIGxpbmUgI3tsaW5lfSBjb2wgI3tjb2x9XCJcbiAgICAgICAgICAgICAgICB0b2tlbnMucHVzaCB0eXBlOidzdHJheScgdGV4dDp0ZXh0WzBdLCBsaW5lOmxpbmUsIGNvbDpjb2xcbiAgICAgICAgICAgICAgICB0ZXh0ID0gdGV4dFsxLi4tMV1cbiAgICAgICAgdG9rZW5zXG5cbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAwICAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuXG4gICAgIyB3YWxrcyB0aHJvdWdoIHRva2VucyBhbmQgam9pbnMgbGluZXMgdGhhdCBlbmQgd2l0aCAnXFwnXG5cbiAgICB1bnNsYXNoOiAodG9rZW5zKSAtPlxuXG4gICAgICAgIG5ld1Rva2VucyA9IFtdXG5cbiAgICAgICAgaWR4ID0gMFxuICAgICAgICB3aGlsZSBpZHggPCB0b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICB0b2sgPSB0b2tlbnNbaWR4XVxuICAgICAgICAgICAgaWYgdG9rLnRleHQgPT0gJ1xcXFwnXG4gICAgICAgICAgICAgICAgaWR4ICs9IDFcbiAgICAgICAgICAgICAgICB3aGlsZSB0b2tlbnNbaWR4XS50eXBlIGluIFsnbmwnICd3cyddXG4gICAgICAgICAgICAgICAgICAgIGlkeCArPSAxXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbmV3VG9rZW5zLnB1c2ggdG9rXG4gICAgICAgICAgICAgICAgaWR4ICs9IDFcblxuICAgICAgICBuZXdUb2tlbnNcblxuICAgICMgMDAwMDAwMCAgICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwICAwMDAwMDAgICAgICAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICAgIDAwMFxuXG4gICAgIyMjXG4gICAgICAgIGNvbnZlcnRzIGxpc3Qgb2YgdG9rZW5zIGludG8gdHJlZSBvZiBibG9ja3NcbiAgICAgICAgYmxvY2s6XG4gICAgICAgICAgICB0eXBlOiAgJ2Jsb2NrJ1xuICAgICAgICAgICAgdG9rZW5zOiBhcnJheSAgIyB0b2tlbnMgb2YgdGhlIGJsb2NrXG4gICAgICAgICAgICBpbmRlbnQ6IHN0cmluZyAjIGluZGVudGF0aW9uIHN0cmluZ1xuICAgICAgICAgICAgbGluZTogICBudW1iZXIgIyBmaXJzdCBsaW5lIG51bWJlclxuICAgICAgICAgICAgbGFzdDogICBudW1iZXIgIyBsYXN0IGxpbmUgbnVtYmVyXG4gICAgICAgICAgICBjb2w6ICAgIG51bWJlclxuXG4gICAgICAgIHdzIHRva2VucyBhbmQgZW1wdHkgbGluZXMgYXJlIHBydW5lZCBmcm9tIHRoZSB0cmVlXG4gICAgICAgIG5sIHRva2VucyBhcmUgb25seSBrZXB0IGJldHdlZW4gbGluZXMgb2YgdGhlIHNhbWUgYmxvY2tcbiAgICAjIyNcblxuICAgIGJsb2NraWZ5OiAodG9rZW5zKSAtPlxuXG4gICAgICAgIHRva2VucyA9IEB1bnNsYXNoIHRva2Vuc1xuXG4gICAgICAgIGJsb2NrcyA9IFtdXG5cbiAgICAgICAgYmxvY2sgPSB0eXBlOidibG9jaycgdG9rZW5zOltdIGxpbmU6MSBsYXN0OjEgaW5kZW50OicnIGNvbDowXG4gICAgICAgIGJsb2Nrcy5wdXNoIGJsb2NrXG5cbiAgICAgICAgb3V0ZGVudFRvID0gKGRlcHRoLCBsaW5lKSAtPlxuICAgICAgICAgICAgd2hpbGUgZGVwdGggPCBibG9jay5pbmRlbnQubGVuZ3RoXG4gICAgICAgICAgICAgICAgYmxvY2tzLnBvcCgpXG4gICAgICAgICAgICAgICAgYmxvY2sgPSBibG9ja3NbLTFdXG4gICAgICAgICAgICAgICAgYmxvY2subGFzdCA9IGxpbmVcblxuICAgICAgICBmb3IgaWR4IGluIDAuLi50b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICB0b2sgPSB0b2tlbnNbaWR4XVxuICAgICAgICAgICAgaWYgdG9rLnR5cGUgPT0gJ25sJ1xuXG4gICAgICAgICAgICAgICAgbnh0ID0gdG9rZW5zW2lkeCsxXVxuICAgICAgICAgICAgICAgIGlmIG54dD8udHlwZSBpbiBbJ25sJ11cbiAgICAgICAgICAgICAgICAgICAgY29udGludWVcblxuICAgICAgICAgICAgICAgIGlmIG54dD8udHlwZSA9PSAnd3MnXG5cbiAgICAgICAgICAgICAgICAgICAgaWYgdG9rZW5zW2lkeCsyXT8udHlwZSA9PSAnbmwnIG9yIGlkeCsxID49IHRva2Vucy5sZW5ndGgtMVxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWVcblxuICAgICAgICAgICAgICAgICAgICBpZiBueHQudGV4dC5sZW5ndGggPiBibG9jay5pbmRlbnQubGVuZ3RoXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGJsb2NrID0gdHlwZTonYmxvY2snIHRva2VuczpbXSBsaW5lOm54dC5saW5lLCBsYXN0Om54dC5saW5lLCBpbmRlbnQ6bnh0LnRleHQsIGNvbDpueHQudGV4dC5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgIGJsb2Nrc1stMV0udG9rZW5zLnB1c2ggYmxvY2tcbiAgICAgICAgICAgICAgICAgICAgICAgIGJsb2Nrcy5wdXNoIGJsb2NrXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQubGVuZ3RoIDwgYmxvY2suaW5kZW50Lmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0ZGVudFRvIG54dC50ZXh0Lmxlbmd0aCwgbnh0LmxpbmVcblxuICAgICAgICAgICAgICAgIGVsc2UgaWYgbnh0XG4gICAgICAgICAgICAgICAgICAgIGlmIGJsb2NrLmluZGVudC5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGRlbnRUbyAwLCBueHQubGluZVxuXG4gICAgICAgICAgICBlbHNlIGlmIHRvay50eXBlID09ICd3cydcbiAgICAgICAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgICAgICBibG9jay50b2tlbnMucHVzaCB0b2tcbiAgICAgICAgICAgIGJsb2NrLmxhc3QgPSB0b2subGluZVxuXG4gICAgICAgIGJsb2Nrc1swXVxuXG5tb2R1bGUuZXhwb3J0cyA9IExleGVyXG4iXX0=
//# sourceURL=../coffee/lexer.coffee