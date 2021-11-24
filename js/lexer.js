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

    Lexer.prototype.commatise = function(tokens) {
        var idx, newTokens, ref, ref1, ref2, ref3, tok;
        newTokens = [];
        idx = 0;
        while (idx < tokens.length) {
            tok = tokens[idx];
            if (((ref = tok.type) === 'num' || ref === 'single' || ref === 'double' || ref === 'triple') || tok.text === '}') {
                if (((ref1 = tokens[idx + 1]) != null ? ref1.type : void 0) === 'ws' && ((ref2 = (ref3 = tokens[idx + 2]) != null ? ref3.type : void 0) === 'num' || ref2 === 'single' || ref2 === 'double' || ref2 === 'triple')) {
                    newTokens.push(tok);
                    newTokens.push({
                        type: 'punct',
                        text: ',',
                        col: tok.col,
                        line: tok.line
                    });
                    idx += 2;
                    continue;
                }
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
        tokens = this.uncomment(tokens);
        tokens = this.commatise(tokens);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGV4ZXIuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJsZXhlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsSUFBQSxHQUFRLE9BQUEsQ0FBUSxNQUFSOztBQUNSLEtBQUEsR0FBUSxPQUFBLENBQVEsUUFBUjs7QUFDUixJQUFBLEdBQVEsT0FBQSxDQUFRLE1BQVI7O0FBRUY7SUFFQyxlQUFBO0FBRUMsWUFBQTtRQUFBLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBSSxDQUFDLElBQUwsQ0FBVSxLQUFLLENBQUMsSUFBTixDQUFXLFNBQVgsRUFBc0Isc0JBQXRCLENBQVY7UUFFWixJQUFDLENBQUEsSUFBRCxHQUFRO0FBQ1I7QUFBQSxhQUFBLFVBQUE7O1lBQ0ksSUFBRyxPQUFPLEdBQVAsS0FBYyxRQUFqQjtnQkFDSSxJQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sQ0FBVyxDQUFDLEdBQUQsRUFBTSxJQUFJLE1BQUosQ0FBVyxHQUFYLENBQU4sQ0FBWCxFQURKO2FBQUEsTUFFSyxJQUFHLEdBQUEsWUFBZSxLQUFsQjtnQkFDRCxHQUFBLEdBQU0sR0FBRyxDQUFDLEdBQUosQ0FBUSxTQUFDLENBQUQ7MkJBQU8sSUFBSSxDQUFDLFlBQUwsQ0FBa0IsRUFBQSxHQUFHLENBQXJCO2dCQUFQLENBQVI7Z0JBQ04sR0FBQSxHQUFNLE1BQUEsR0FBUyxHQUFHLENBQUMsSUFBSixDQUFTLEdBQVQsQ0FBVCxHQUF5QjtnQkFDL0IsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFOLENBQVcsQ0FBQyxHQUFELEVBQU0sSUFBSSxNQUFKLENBQVcsR0FBWCxDQUFOLENBQVgsRUFIQzs7QUFIVDtJQUxEOzs7QUFtQkg7Ozs7Ozs7OztvQkFTQSxRQUFBLEdBQVUsU0FBQyxJQUFEO0FBRU4sWUFBQTtRQUFBLE1BQUEsR0FBUztRQUNULElBQUEsR0FBTztRQUNQLEdBQUEsR0FBTTtBQUNOLGVBQU0sSUFBSSxDQUFDLE1BQVg7WUFDSSxNQUFBLEdBQVMsSUFBSSxDQUFDO0FBQ2Q7QUFBQSxpQkFBQSxxQ0FBQTsrQkFBSyxlQUFJO2dCQUNMLEtBQUEsR0FBUSxJQUFJLENBQUMsS0FBTCxDQUFXLEdBQVg7Z0JBQ1IscUJBQUcsS0FBSyxDQUFFLGVBQVAsS0FBZ0IsQ0FBbkI7b0JBRUksS0FBQSxHQUFXLEdBQUEsS0FBTyxJQUFWLEdBQW9CLEVBQXBCLEdBQTRCLEtBQU0sQ0FBQSxDQUFBO29CQUUxQyxNQUFNLENBQUMsSUFBUCxDQUFZO3dCQUFBLElBQUEsRUFBSyxHQUFMO3dCQUFVLElBQUEsRUFBSyxLQUFmO3dCQUFzQixJQUFBLEVBQUssSUFBM0I7d0JBQWlDLEdBQUEsRUFBSSxHQUFyQztxQkFBWjtvQkFFQSxJQUFHLEdBQUEsS0FBTyxJQUFWO3dCQUNJLEdBQUEsR0FBTTt3QkFDTixJQUFBLEdBRko7cUJBQUEsTUFHSyxJQUFHLEdBQUEsS0FBUSxTQUFSLElBQUEsR0FBQSxLQUFpQixRQUFwQjt3QkFDRCxLQUFBLEdBQVEsS0FBSyxDQUFDLEtBQU4sQ0FBWSxJQUFaO3dCQUNSLElBQUEsSUFBUSxLQUFLLENBQUMsTUFBTixHQUFhO3dCQUNyQixJQUFHLEtBQUssQ0FBQyxNQUFOLEdBQWUsQ0FBbEI7NEJBQ0ksR0FBQSxHQUFNLEtBQU0sVUFBRSxDQUFBLENBQUEsQ0FBQyxDQUFDLE9BRHBCO3lCQUFBLE1BQUE7NEJBR0ksR0FBQSxJQUFPLEtBQUssQ0FBQyxPQUhqQjt5QkFIQztxQkFBQSxNQUFBO3dCQVFELEdBQUEsSUFBTyxLQUFLLENBQUMsT0FSWjs7b0JBVUwsSUFBQSxHQUFPLElBQUs7QUFDWiwwQkFwQko7O0FBRko7WUF3QkEsS0FBQSxHQUFRLElBQUksQ0FBQztZQUNiLElBQUcsTUFBQSxLQUFVLEtBQWI7Z0JBQ0csT0FBQSxDQUFDLEdBQUQsQ0FBSyxrQkFBQSxHQUFtQixJQUFLLENBQUEsQ0FBQSxDQUF4QixHQUEyQixXQUEzQixHQUFzQyxJQUF0QyxHQUEyQyxPQUEzQyxHQUFrRCxHQUF2RDtnQkFDQyxNQUFNLENBQUMsSUFBUCxDQUFZO29CQUFBLElBQUEsRUFBSyxPQUFMO29CQUFhLElBQUEsRUFBSyxJQUFLLENBQUEsQ0FBQSxDQUF2QjtvQkFBMkIsSUFBQSxFQUFLLElBQWhDO29CQUFzQyxHQUFBLEVBQUksR0FBMUM7aUJBQVo7Z0JBQ0EsSUFBQSxHQUFPLElBQUssVUFIaEI7O1FBM0JKO2VBK0JBO0lBcENNOztvQkE4Q1YsT0FBQSxHQUFTLFNBQUMsTUFBRDtBQUVMLFlBQUE7UUFBQSxTQUFBLEdBQVk7UUFFWixHQUFBLEdBQU07QUFDTixlQUFNLEdBQUEsR0FBTSxNQUFNLENBQUMsTUFBbkI7WUFDSSxHQUFBLEdBQU0sTUFBTyxDQUFBLEdBQUE7WUFDYixJQUFHLEdBQUcsQ0FBQyxJQUFKLEtBQVksSUFBZjtnQkFDSSxHQUFBLElBQU87QUFDUCw4QkFBTSxNQUFPLENBQUEsR0FBQSxDQUFJLENBQUMsS0FBWixLQUFxQixJQUFyQixJQUFBLEdBQUEsS0FBMEIsSUFBaEM7b0JBQ0ksR0FBQSxJQUFPO2dCQURYLENBRko7YUFBQSxNQUFBO2dCQUtJLFNBQVMsQ0FBQyxJQUFWLENBQWUsR0FBZjtnQkFDQSxHQUFBLElBQU8sRUFOWDs7UUFGSjtlQVVBO0lBZks7O29CQXVCVCxTQUFBLEdBQVcsU0FBQyxNQUFEO0FBRVAsWUFBQTtRQUFBLFNBQUEsR0FBWTtRQUVaLEdBQUEsR0FBTTtBQUNOLGVBQU0sR0FBQSxHQUFNLE1BQU0sQ0FBQyxNQUFuQjtZQUNJLEdBQUEsR0FBTSxNQUFPLENBQUEsR0FBQTtZQUNiLElBQUcsR0FBRyxDQUFDLElBQUosS0FBWSxTQUFmO2dCQUVJLEdBQUEsSUFBTztBQUNQLHlCQUhKOztZQUtBLFNBQVMsQ0FBQyxJQUFWLENBQWUsR0FBZjtZQUNBLEdBQUEsSUFBTztRQVJYO2VBVUE7SUFmTzs7b0JBaUJYLFNBQUEsR0FBVyxTQUFDLE1BQUQ7QUFFUCxZQUFBO1FBQUEsU0FBQSxHQUFZO1FBRVosR0FBQSxHQUFNO0FBQ04sZUFBTSxHQUFBLEdBQU0sTUFBTSxDQUFDLE1BQW5CO1lBQ0ksR0FBQSxHQUFNLE1BQU8sQ0FBQSxHQUFBO1lBQ2IsSUFBRyxRQUFBLEdBQUcsQ0FBQyxLQUFKLEtBQWEsS0FBYixJQUFBLEdBQUEsS0FBa0IsUUFBbEIsSUFBQSxHQUFBLEtBQTBCLFFBQTFCLElBQUEsR0FBQSxLQUFrQyxRQUFsQyxDQUFBLElBQStDLEdBQUcsQ0FBQyxJQUFKLEtBQVksR0FBOUQ7Z0JBQ0ksNENBQWdCLENBQUUsY0FBZixLQUF1QixJQUF2QixJQUFnQyxnREFBYSxDQUFFLGNBQWYsS0FBd0IsS0FBeEIsSUFBQSxJQUFBLEtBQTZCLFFBQTdCLElBQUEsSUFBQSxLQUFxQyxRQUFyQyxJQUFBLElBQUEsS0FBNkMsUUFBN0MsQ0FBbkM7b0JBQ0ksU0FBUyxDQUFDLElBQVYsQ0FBZSxHQUFmO29CQUNBLFNBQVMsQ0FBQyxJQUFWLENBQWU7d0JBQUEsSUFBQSxFQUFLLE9BQUw7d0JBQWEsSUFBQSxFQUFLLEdBQWxCO3dCQUFzQixHQUFBLEVBQUksR0FBRyxDQUFDLEdBQTlCO3dCQUFtQyxJQUFBLEVBQUssR0FBRyxDQUFDLElBQTVDO3FCQUFmO29CQUNBLEdBQUEsSUFBTztBQUNQLDZCQUpKO2lCQURKOztZQU9BLFNBQVMsQ0FBQyxJQUFWLENBQWUsR0FBZjtZQUNBLEdBQUEsSUFBTztRQVZYO2VBWUE7SUFqQk87OztBQXlCWDs7Ozs7Ozs7Ozs7Ozs7b0JBY0EsUUFBQSxHQUFVLFNBQUMsTUFBRDtBQUVOLFlBQUE7UUFBQSxNQUFBLEdBQVMsSUFBQyxDQUFBLE9BQUQsQ0FBVyxNQUFYO1FBQ1QsTUFBQSxHQUFTLElBQUMsQ0FBQSxTQUFELENBQVcsTUFBWDtRQUNULE1BQUEsR0FBUyxJQUFDLENBQUEsU0FBRCxDQUFXLE1BQVg7UUFFVCxNQUFBLEdBQVM7UUFFVCxLQUFBLEdBQVE7WUFBQSxJQUFBLEVBQUssT0FBTDtZQUFhLE1BQUEsRUFBTyxFQUFwQjtZQUF1QixJQUFBLEVBQUssQ0FBNUI7WUFBOEIsSUFBQSxFQUFLLENBQW5DO1lBQXFDLE1BQUEsRUFBTyxFQUE1QztZQUErQyxHQUFBLEVBQUksQ0FBbkQ7O1FBQ1IsTUFBTSxDQUFDLElBQVAsQ0FBWSxLQUFaO1FBRUEsU0FBQSxHQUFZLFNBQUMsS0FBRCxFQUFRLElBQVI7QUFDUixnQkFBQTtBQUFBO21CQUFNLEtBQUEsR0FBUSxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQTNCO2dCQUNJLE1BQU0sQ0FBQyxHQUFQLENBQUE7Z0JBQ0EsS0FBQSxHQUFRLE1BQU8sVUFBRSxDQUFBLENBQUE7NkJBQ2pCLEtBQUssQ0FBQyxJQUFOLEdBQWE7WUFIakIsQ0FBQTs7UUFEUTtBQU1aOzs7OztBQUFBLGFBQUEsc0NBQUE7O1lBQ0ksR0FBQSxHQUFNLE1BQU8sQ0FBQSxHQUFBO1lBQ2IsSUFBRyxHQUFHLENBQUMsSUFBSixLQUFZLElBQWY7Z0JBRUksR0FBQSxHQUFNLE1BQU8sQ0FBQSxHQUFBLEdBQUksQ0FBSjtnQkFDYiwwQkFBRyxHQUFHLENBQUUsY0FBTCxLQUFjLElBQWpCO0FBQ0ksNkJBREo7O2dCQUdBLG1CQUFHLEdBQUcsQ0FBRSxjQUFMLEtBQWEsSUFBaEI7b0JBRUksNENBQWdCLENBQUUsY0FBZixLQUF1QixJQUF2QixJQUErQixHQUFBLEdBQUksQ0FBSixJQUFTLE1BQU0sQ0FBQyxNQUFQLEdBQWMsQ0FBekQ7QUFDSSxpQ0FESjs7b0JBR0EsSUFBRyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQVQsR0FBa0IsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFsQzt3QkFFSSxLQUFBLEdBQVE7NEJBQUEsSUFBQSxFQUFLLE9BQUw7NEJBQWEsTUFBQSxFQUFPLEVBQXBCOzRCQUF1QixJQUFBLEVBQUssR0FBRyxDQUFDLElBQWhDOzRCQUFzQyxJQUFBLEVBQUssR0FBRyxDQUFDLElBQS9DOzRCQUFxRCxNQUFBLEVBQU8sR0FBRyxDQUFDLElBQWhFOzRCQUFzRSxHQUFBLEVBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFuRjs7d0JBQ1IsTUFBTyxVQUFFLENBQUEsQ0FBQSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQWxCLENBQXVCLEtBQXZCO3dCQUNBLE1BQU0sQ0FBQyxJQUFQLENBQVksS0FBWjtBQUNBLGlDQUxKO3FCQUFBLE1BT0ssSUFBRyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQVQsR0FBa0IsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFsQzt3QkFDRCxTQUFBLENBQVUsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFuQixFQUEyQixHQUFHLENBQUMsSUFBL0IsRUFEQztxQkFaVDtpQkFBQSxNQWVLLElBQUcsR0FBSDtvQkFDRCxJQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBaEI7d0JBQ0ksU0FBQSxDQUFVLENBQVYsRUFBYSxHQUFHLENBQUMsSUFBakIsRUFESjtxQkFEQztpQkFyQlQ7YUFBQSxNQXlCSyxJQUFHLEdBQUcsQ0FBQyxJQUFKLEtBQVksSUFBZjtBQUNELHlCQURDOztZQUdMLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBYixDQUFrQixHQUFsQjtZQUNBLEtBQUssQ0FBQyxJQUFOLEdBQWEsR0FBRyxDQUFDO0FBL0JyQjtlQWlDQSxNQUFPLENBQUEsQ0FBQTtJQWxERDs7Ozs7O0FBb0RkLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMDBcbjAwMCAgICAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwMCAgICAgIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwXG4wMDAgICAgICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwXG4wMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwXG4jIyNcblxubm9vbiAgPSByZXF1aXJlICdub29uJ1xuc2xhc2ggPSByZXF1aXJlICdrc2xhc2gnXG5rc3RyICA9IHJlcXVpcmUgJ2tzdHInXG5cbmNsYXNzIExleGVyXG5cbiAgICBAOiAtPlxuXG4gICAgICAgIEBwYXR0ZXJucyA9IG5vb24ubG9hZCBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uL2NvZmZlZS9sZXhlci5ub29uJ1xuXG4gICAgICAgIEByZWdzID0gW11cbiAgICAgICAgZm9yIGtleSxwYXQgb2YgQHBhdHRlcm5zXG4gICAgICAgICAgICBpZiB0eXBlb2YgcGF0ID09ICdzdHJpbmcnXG4gICAgICAgICAgICAgICAgQHJlZ3MucHVzaCBba2V5LCBuZXcgUmVnRXhwIHBhdF1cbiAgICAgICAgICAgIGVsc2UgaWYgcGF0IGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgICAgICAgICBwYXQgPSBwYXQubWFwIChwKSAtPiBrc3RyLmVzY2FwZVJlZ2V4cCBcIiN7cH1cIlxuICAgICAgICAgICAgICAgIHJlZyA9ICdcXFxcYignICsgcGF0LmpvaW4oJ3wnKSArICcpXFxcXGInXG4gICAgICAgICAgICAgICAgQHJlZ3MucHVzaCBba2V5LCBuZXcgUmVnRXhwIHJlZ11cblxuICAgICMgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAwMDAwMDAwMFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwICAgICAwMDAgICAwMDBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMCAgICAwMDAgICAgMDAwMDAwMFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAgICAwMDBcbiAgICAjICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDBcblxuICAgICMjI1xuICAgICAgICBjb252ZXJ0cyB0ZXh0IGludG8gYSBsaXN0IG9mIHRva2VuIG9iamVjdHNcbiAgICAgICAgdG9rZW4gb2JqZWN0OlxuICAgICAgICAgICAgdHlwZTogc3RyaW5nICAgICAgICAjIGFueSBvZiB0aGUga2V5cyBpbiBsZXhlci5ub29uXG4gICAgICAgICAgICB0ZXh0OiBzdHJpbmcgICAgICAgICMgdGV4dCBvZiBtYXRjaFxuICAgICAgICAgICAgbGluZTogbnVtYmVyICAgICAgICAjIGxpbmUgbnVtYmVyXG4gICAgICAgICAgICBjb2w6ICBudW1iZXIgICAgICAgICMgc3RhcnQgaW5kZXggaW4gbGluZVxuICAgICMjI1xuXG4gICAgdG9rZW5pemU6ICh0ZXh0KSAtPlxuXG4gICAgICAgIHRva2VucyA9IFtdXG4gICAgICAgIGxpbmUgPSAxXG4gICAgICAgIGNvbCA9IDBcbiAgICAgICAgd2hpbGUgdGV4dC5sZW5ndGhcbiAgICAgICAgICAgIGJlZm9yZSA9IHRleHQubGVuZ3RoXG4gICAgICAgICAgICBmb3IgW2tleSxyZWddIGluIEByZWdzXG4gICAgICAgICAgICAgICAgbWF0Y2ggPSB0ZXh0Lm1hdGNoIHJlZ1xuICAgICAgICAgICAgICAgIGlmIG1hdGNoPy5pbmRleCA9PSAwXG5cbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBpZiBrZXkgPT0gJ25sJyB0aGVuICcnIGVsc2UgbWF0Y2hbMF1cblxuICAgICAgICAgICAgICAgICAgICB0b2tlbnMucHVzaCB0eXBlOmtleSwgdGV4dDp2YWx1ZSwgbGluZTpsaW5lLCBjb2w6Y29sXG5cbiAgICAgICAgICAgICAgICAgICAgaWYga2V5ID09ICdubCdcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbCA9IDBcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmUrK1xuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIGtleSBpbiBbJ2NvbW1lbnQnJ3RyaXBsZSddXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lcyA9IHZhbHVlLnNwbGl0ICdcXG4nXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lICs9IGxpbmVzLmxlbmd0aC0xXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBsaW5lcy5sZW5ndGggPiAxXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sID0gbGluZXNbLTFdLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbCArPSB2YWx1ZS5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgY29sICs9IHZhbHVlLmxlbmd0aFxuXG4gICAgICAgICAgICAgICAgICAgIHRleHQgPSB0ZXh0W21hdGNoWzBdLmxlbmd0aC4uLTFdXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgICAgIGFmdGVyID0gdGV4dC5sZW5ndGhcbiAgICAgICAgICAgIGlmIGJlZm9yZSA9PSBhZnRlclxuICAgICAgICAgICAgICAgIGxvZyBcInN0cmF5IGNoYXJhY3RlciAje3RleHRbMF19IGluIGxpbmUgI3tsaW5lfSBjb2wgI3tjb2x9XCJcbiAgICAgICAgICAgICAgICB0b2tlbnMucHVzaCB0eXBlOidzdHJheScgdGV4dDp0ZXh0WzBdLCBsaW5lOmxpbmUsIGNvbDpjb2xcbiAgICAgICAgICAgICAgICB0ZXh0ID0gdGV4dFsxLi4tMV1cbiAgICAgICAgdG9rZW5zXG5cbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAwICAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuXG4gICAgIyB3YWxrcyB0aHJvdWdoIHRva2VucyBhbmQgam9pbnMgbGluZXMgdGhhdCBlbmQgd2l0aCAnXFwnXG5cbiAgICB1bnNsYXNoOiAodG9rZW5zKSAtPlxuXG4gICAgICAgIG5ld1Rva2VucyA9IFtdXG5cbiAgICAgICAgaWR4ID0gMFxuICAgICAgICB3aGlsZSBpZHggPCB0b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICB0b2sgPSB0b2tlbnNbaWR4XVxuICAgICAgICAgICAgaWYgdG9rLnRleHQgPT0gJ1xcXFwnXG4gICAgICAgICAgICAgICAgaWR4ICs9IDFcbiAgICAgICAgICAgICAgICB3aGlsZSB0b2tlbnNbaWR4XS50eXBlIGluIFsnbmwnICd3cyddXG4gICAgICAgICAgICAgICAgICAgIGlkeCArPSAxXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbmV3VG9rZW5zLnB1c2ggdG9rXG4gICAgICAgICAgICAgICAgaWR4ICs9IDFcblxuICAgICAgICBuZXdUb2tlbnNcbiAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgdW5jb21tZW50OiAodG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgbmV3VG9rZW5zID0gW11cblxuICAgICAgICBpZHggPSAwXG4gICAgICAgIHdoaWxlIGlkeCA8IHRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgIHRvayA9IHRva2Vuc1tpZHhdXG4gICAgICAgICAgICBpZiB0b2sudHlwZSA9PSAnY29tbWVudCdcbiAgICAgICAgICAgICAgICAjIGlmIG5vdCAodG9rZW5zW2lkeC0xXT8udHlwZSA9PSAnbmwnIG9yIHRva2Vuc1tpZHgtMl0/LnR5cGUgPT0gJ25sJyBhbmQgdG9rZW5zW2lkeC0xXT8udHlwZSA9PSAnd3MnKVxuICAgICAgICAgICAgICAgIGlkeCArPSAxXG4gICAgICAgICAgICAgICAgY29udGludWVcblxuICAgICAgICAgICAgbmV3VG9rZW5zLnB1c2ggdG9rXG4gICAgICAgICAgICBpZHggKz0gMVxuXG4gICAgICAgIG5ld1Rva2Vuc1xuXG4gICAgY29tbWF0aXNlOiAodG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgbmV3VG9rZW5zID0gW11cblxuICAgICAgICBpZHggPSAwXG4gICAgICAgIHdoaWxlIGlkeCA8IHRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgIHRvayA9IHRva2Vuc1tpZHhdXG4gICAgICAgICAgICBpZiB0b2sudHlwZSBpbiBbJ251bScnc2luZ2xlJydkb3VibGUnJ3RyaXBsZSddIG9yIHRvay50ZXh0ID09ICd9J1xuICAgICAgICAgICAgICAgIGlmIHRva2Vuc1tpZHgrMV0/LnR5cGUgPT0gJ3dzJyBhbmQgdG9rZW5zW2lkeCsyXT8udHlwZSBpbiBbJ251bScnc2luZ2xlJydkb3VibGUnJ3RyaXBsZSddXG4gICAgICAgICAgICAgICAgICAgIG5ld1Rva2Vucy5wdXNoIHRva1xuICAgICAgICAgICAgICAgICAgICBuZXdUb2tlbnMucHVzaCB0eXBlOidwdW5jdCcgdGV4dDonLCcgY29sOnRvay5jb2wsIGxpbmU6dG9rLmxpbmVcbiAgICAgICAgICAgICAgICAgICAgaWR4ICs9IDJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVcblxuICAgICAgICAgICAgbmV3VG9rZW5zLnB1c2ggdG9rXG4gICAgICAgICAgICBpZHggKz0gMVxuXG4gICAgICAgIG5ld1Rva2Vuc1xuICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwIDAwMFxuICAgICMgMDAwMDAwMCAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMCAgMDAwMDAwICAgICAgMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgICAwMDBcblxuICAgICMjI1xuICAgICAgICBjb252ZXJ0cyBsaXN0IG9mIHRva2VucyBpbnRvIHRyZWUgb2YgYmxvY2tzXG4gICAgICAgIGJsb2NrOlxuICAgICAgICAgICAgdHlwZTogICdibG9jaydcbiAgICAgICAgICAgIHRva2VuczogYXJyYXkgICAgICAgICAgICMgdG9rZW5zIG9mIHRoZSBibG9ja1xuICAgICAgICAgICAgaW5kZW50OiBzdHJpbmcgICAgICAgICAgIyBpbmRlbnRhdGlvbiBzdHJpbmdcbiAgICAgICAgICAgIGxpbmU6ICAgbnVtYmVyICAgICAgICAgICMgZmlyc3QgbGluZSBudW1iZXJcbiAgICAgICAgICAgIGxhc3Q6ICAgbnVtYmVyICAgICAgICAgICMgbGFzdCBsaW5lIG51bWJlclxuICAgICAgICAgICAgY29sOiAgICBudW1iZXJcblxuICAgICAgICB3cyB0b2tlbnMgYW5kIGVtcHR5IGxpbmVzIGFyZSBwcnVuZWQgZnJvbSB0aGUgdHJlZVxuICAgICAgICBubCB0b2tlbnMgYXJlIG9ubHkga2VwdCBiZXR3ZWVuIGxpbmVzIG9mIHRoZSBzYW1lIGJsb2NrXG4gICAgIyMjXG5cbiAgICBibG9ja2lmeTogKHRva2VucykgLT5cblxuICAgICAgICB0b2tlbnMgPSBAdW5zbGFzaCAgIHRva2Vuc1xuICAgICAgICB0b2tlbnMgPSBAdW5jb21tZW50IHRva2Vuc1xuICAgICAgICB0b2tlbnMgPSBAY29tbWF0aXNlIHRva2Vuc1xuXG4gICAgICAgIGJsb2NrcyA9IFtdXG5cbiAgICAgICAgYmxvY2sgPSB0eXBlOidibG9jaycgdG9rZW5zOltdIGxpbmU6MSBsYXN0OjEgaW5kZW50OicnIGNvbDowXG4gICAgICAgIGJsb2Nrcy5wdXNoIGJsb2NrXG5cbiAgICAgICAgb3V0ZGVudFRvID0gKGRlcHRoLCBsaW5lKSAtPlxuICAgICAgICAgICAgd2hpbGUgZGVwdGggPCBibG9jay5pbmRlbnQubGVuZ3RoXG4gICAgICAgICAgICAgICAgYmxvY2tzLnBvcCgpXG4gICAgICAgICAgICAgICAgYmxvY2sgPSBibG9ja3NbLTFdXG4gICAgICAgICAgICAgICAgYmxvY2subGFzdCA9IGxpbmVcblxuICAgICAgICBmb3IgaWR4IGluIDAuLi50b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICB0b2sgPSB0b2tlbnNbaWR4XVxuICAgICAgICAgICAgaWYgdG9rLnR5cGUgPT0gJ25sJ1xuXG4gICAgICAgICAgICAgICAgbnh0ID0gdG9rZW5zW2lkeCsxXVxuICAgICAgICAgICAgICAgIGlmIG54dD8udHlwZSBpbiBbJ25sJ11cbiAgICAgICAgICAgICAgICAgICAgY29udGludWVcblxuICAgICAgICAgICAgICAgIGlmIG54dD8udHlwZSA9PSAnd3MnXG5cbiAgICAgICAgICAgICAgICAgICAgaWYgdG9rZW5zW2lkeCsyXT8udHlwZSA9PSAnbmwnIG9yIGlkeCsxID49IHRva2Vucy5sZW5ndGgtMVxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWVcblxuICAgICAgICAgICAgICAgICAgICBpZiBueHQudGV4dC5sZW5ndGggPiBibG9jay5pbmRlbnQubGVuZ3RoXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGJsb2NrID0gdHlwZTonYmxvY2snIHRva2VuczpbXSBsaW5lOm54dC5saW5lLCBsYXN0Om54dC5saW5lLCBpbmRlbnQ6bnh0LnRleHQsIGNvbDpueHQudGV4dC5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgIGJsb2Nrc1stMV0udG9rZW5zLnB1c2ggYmxvY2tcbiAgICAgICAgICAgICAgICAgICAgICAgIGJsb2Nrcy5wdXNoIGJsb2NrXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQubGVuZ3RoIDwgYmxvY2suaW5kZW50Lmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0ZGVudFRvIG54dC50ZXh0Lmxlbmd0aCwgbnh0LmxpbmVcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGVsc2UgaWYgbnh0XG4gICAgICAgICAgICAgICAgICAgIGlmIGJsb2NrLmluZGVudC5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGRlbnRUbyAwLCBueHQubGluZVxuXG4gICAgICAgICAgICBlbHNlIGlmIHRvay50eXBlID09ICd3cydcbiAgICAgICAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgICAgICBibG9jay50b2tlbnMucHVzaCB0b2tcbiAgICAgICAgICAgIGJsb2NrLmxhc3QgPSB0b2subGluZVxuXG4gICAgICAgIGJsb2Nrc1swXVxuICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gTGV4ZXJcbiJdfQ==
//# sourceURL=../coffee/lexer.coffee