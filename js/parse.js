// koffee 1.20.0

/*
00000000    0000000   00000000    0000000  00000000
000   000  000   000  000   000  000       000     
00000000   000000000  0000000    0000000   0000000 
000        000   000  000   000       000  000     
000        000   000  000   000  0000000   00000000
 */
var Parse, empty, print,
    indexOf = [].indexOf;

print = require('./print');

empty = function(a) {
    return (a === '' || a === null || a === (void 0)) || (typeof a === 'object' && Object.keys(a).length === 0);
};

Parse = (function() {
    function Parse(args) {
        this.debug = args != null ? args.debug : void 0;
        this.verbose = args != null ? args.verbose : void 0;
        this.raw = args != null ? args.raw : void 0;
    }

    Parse.prototype.parse = function(block) {
        var ast;
        this.stack = [];
        this.sheap = [];
        ast = [];
        while (block.tokens.length) {
            ast = ast.concat(this.exps('tl block', block.tokens));
        }
        if (this.raw) {
            print.noon('raw ast', ast);
        }
        return ast;
    };

    Parse.prototype.exps = function(rule, tokens, stop) {
        var b, block, es, ex, nl, numTokens, ref, ref1, ref2, ref3, ref4, ref5, ref6;
        if (empty(tokens)) {
            return;
        }
        this.sheapPush('exps', rule);
        es = [];
        while (tokens.length) {
            numTokens = tokens.length;
            b = (function() {
                var ref, ref1;
                switch (this.stack.slice(-1)[0]) {
                    case 'onearg':
                        return es.length;
                    case 'if':
                    case 'switch':
                        return tokens[0].text === 'else';
                    case '[':
                        return tokens[0].text === ']';
                    case 'call':
                        return (ref = tokens[0].text, indexOf.call('];', ref) >= 0) && tokens.shift();
                    case '{':
                        return (ref1 = tokens[0].text, indexOf.call('};', ref1) >= 0) && tokens.shift();
                    case rule:
                        return tokens[0].text === stop;
                    default:
                        return false;
                }
            }).call(this);
            if (b) {
                this.verb('exps break for stack top', this.stack);
                break;
            }
            if (tokens[0].type === 'block') {
                block = tokens.shift();
                this.verb("exps block start", block);
                es = es.concat(this.exps('exps block', block.tokens));
                if (((ref = tokens[0]) != null ? ref.type : void 0) === 'nl') {
                    this.verb("exps block end shift nl");
                    tokens.shift();
                }
                if (((ref1 = tokens[0]) != null ? ref1.text : void 0) === ',') {
                    this.verb("exps block end shift ,");
                    tokens.shift();
                }
                this.verb('exps block end ...continue...');
                continue;
            }
            if (tokens[0].type === 'block') {
                this.verb('exps break on block');
                break;
            }
            if (tokens[0].text === ')') {
                this.verb('exps break on )');
                break;
            }
            if (rule === 'for vals' && ((ref2 = tokens[0].text) === 'in' || ref2 === 'of')) {
                this.verb('exps break on in|of');
                break;
            }
            if (tokens[0].type === 'nl') {
                this.verb('exps nl stop:', stop, tokens[0], this.stack);
                if (this.stack.slice(-1)[0] === 'if' && ((ref3 = tokens[1]) != null ? ref3.text : void 0) !== 'else') {
                    this.verb('exps nl in if (shift and break)');
                    tokens.shift();
                    break;
                }
                if (this.stack.slice(-1)[0] === '[' && ((ref4 = tokens[1]) != null ? ref4.text : void 0) === ']') {
                    this.verb('exps nl in array (shift and break)');
                    tokens.shift();
                    break;
                }
                if (stop) {
                    this.verb('exps nl with stop');
                    if (this.stack.slice(-1)[0] === 'call') {
                        this.verb("exps nl with stop in call (break, but don't shift nl)");
                    } else {
                        this.verb('exps nl with stop (shift and break)');
                        tokens.shift();
                    }
                    break;
                }
                this.verb('exps nl shift and ...');
                nl = tokens.shift();
                if (((ref5 = tokens[0]) != null ? ref5.text : void 0) === '.' && ((ref6 = tokens[1]) != null ? ref6.type : void 0) === 'var') {
                    console.log('exps nl next line starts with .var!');
                    es.push(this.prop(es.pop(), tokens));
                }
                this.verb('exps nl continue...');
                continue;
            }
            ex = this.exp(tokens);
            es.push(ex);
            if (numTokens === tokens.length) {
                console.error('exps no token consumed?');
                break;
            }
        }
        this.sheapPop('exps', rule);
        return es;
    };

    Parse.prototype.exp = function(tokens) {
        var e, f, last, numTokens, nxt, qmark, ref, ref1, ref10, ref11, ref12, ref13, ref14, ref15, ref16, ref17, ref18, ref19, ref2, ref20, ref21, ref22, ref23, ref24, ref25, ref26, ref27, ref28, ref29, ref3, ref30, ref31, ref32, ref33, ref34, ref35, ref36, ref37, ref38, ref39, ref4, ref40, ref41, ref42, ref43, ref5, ref6, ref7, ref8, ref9, tok;
        if (empty(tokens)) {
            return;
        }
        tok = tokens.shift();
        if (this.debug) {
            console.log(Y5(w1(tok != null ? tok.text : void 0)));
        }
        switch (tok.type) {
            case 'block':
                return console.error("INTERNAL ERROR: unexpected block token in exp!");
            case 'nl':
                return this.exp(tokens);
            case 'keyword':
                switch (tok.text) {
                    case 'if':
                        return this["if"](tok, tokens);
                    case 'for':
                        return this["for"](tok, tokens);
                    case 'while':
                        return this["while"](tok, tokens);
                    case 'switch':
                        return this["switch"](tok, tokens);
                    case 'when':
                        return this.when(tok, tokens);
                    case 'class':
                        return this["class"](tok, tokens);
                    case 'return':
                        return this["return"](tok, tokens);
                }
                break;
            default:
                switch (tok.text) {
                    case '->':
                    case '=>':
                        return this.func(null, tok, tokens);
                    case ';':
                        return this.exp(tokens);
                    case ',':
                        return this.exp(tokens);
                }
        }

        /*
        here comes the hairy part :-)
        
        combine information about the rule stack, current and future tokens
        to figure out when the expression ends
         */
        this.sheapPush('exp', (ref = tok.text) != null ? ref : tok.type);
        e = {
            token: tok
        };
        while (nxt = tokens[0]) {
            numTokens = tokens.length;
            if (!e) {
                return console.error('no e?', nxt);
            }
            if (((ref1 = Object.values(e)[0]) != null ? ref1.col : void 0) != null) {
                last = Object.values(e)[0].col + ((ref2 = Object.values(e)[0].text) != null ? ref2.length : void 0);
            } else if (((ref3 = Object.values(e)[0]) != null ? (ref4 = ref3.close) != null ? ref4.col : void 0 : void 0) != null) {
                last = Object.values(e)[0].close.col + ((ref5 = Object.values(e)[0].close.text) != null ? ref5.length : void 0);
            } else {
                last = -1;
            }
            if (this.stack.slice(-1)[0] === 'onearg' && ((ref6 = nxt.type) === 'op')) {
                this.verb('exp break for onearg');
                break;
            }
            if (nxt.type === 'op' && ((ref7 = nxt.text) !== '++' && ref7 !== '--' && ref7 !== '+' && ref7 !== '-') && ((ref8 = (ref9 = e.token) != null ? ref9.text : void 0) !== '[' && ref8 !== '(') && indexOf.call(this.stack, 'onearg') < 0) {
                this.verb('exp is lhs of op', e, nxt);
                e = this.operation(e, tokens.shift(), tokens);
            } else if (nxt.type === 'op' && ((ref10 = nxt.text) === '+' || ref10 === '-') && ((ref11 = (ref12 = e.token) != null ? ref12.text : void 0) !== '[' && ref11 !== '(') && last < nxt.col && ((ref13 = tokens[1]) != null ? ref13.col : void 0) > nxt.col + nxt.text.length) {
                this.verb('exp is lhs of +-\s', e, nxt);
                e = this.operation(e, tokens.shift(), tokens);
            } else if (nxt.type === 'func' && (e.parens || e.token && ((ref14 = e.token.type) !== 'num' && ref14 !== 'single' && ref14 !== 'double' && ref14 !== 'triple') && (ref15 = e.token.text, indexOf.call('}]', ref15) < 0))) {
                f = tokens.shift();
                this.verb('exp func for e', e);
                e = this.func(e, f, tokens);
            } else if (nxt.text === '(') {
                if (nxt.col === last) {
                    this.verb('exp is lhs of call');
                    e = this.call(e, tokens);
                } else {
                    this.verb('exp is open paren');
                    e = this.parens(tok, tokens);
                }
            } else if (nxt.text === '[' && nxt.col === last && ((ref16 = tokens[1]) != null ? ref16.text : void 0) !== ']' && ((ref17 = e.token) != null ? ref17.text : void 0) !== '[') {
                this.verb('exp is lhs of index', e);
                e = this.index(e, tokens);
            } else if (nxt.text === '?' && last === nxt.col && ((ref18 = tokens[1]) != null ? ref18.text : void 0) === '.') {
                qmark = tokens.shift();
                e = this.prop(e, tokens, qmark);
            } else if (nxt.text === '.') {
                e = this.prop(e, tokens);
                break;
            } else if (nxt.text === ':') {
                if (this.stack.slice(-1)[0] !== '{') {
                    this.verb('exp is first key of implicit object', e);
                    e = this.object(e, tokens);
                } else {
                    this.verb('exp is key of (implicit) object', e);
                    e = this.keyval(e, tokens);
                }
            } else if (nxt.type === 'keyword' && nxt.text === 'in' && this.stack.slice(-1)[0] !== 'for') {
                e = this.incond(e, tokens);
            } else if (e.token) {
                if (e.token.text === '(') {
                    e = this.parens(e.token, tokens);
                } else if (e.token.text === '[') {
                    e = this.array(e.token, tokens);
                } else if (e.token.text === '{') {
                    e = this.curly(e.token, tokens);
                } else if (((ref19 = e.token.text) === '+' || ref19 === '-' || ref19 === '++' || ref19 === '--') && last === nxt.col) {
                    if (((ref20 = nxt.type) !== 'var' && ref20 !== 'paren') && ((ref21 = e.token.text) === '++' || ref21 === '--')) {
                        tokens.shift();
                        console.error('wrong lhs increment', e, nxt);
                        return;
                    }
                    this.verb('lhs null operation');
                    e = this.operation(null, e.token, tokens);
                    if ((ref22 = (ref23 = e.operation.rhs) != null ? (ref24 = ref23.operation) != null ? (ref25 = ref24.operator) != null ? ref25.text : void 0 : void 0 : void 0) === '++' || ref22 === '--') {
                        console.error('left and right side increment');
                        return;
                    }
                } else if (((ref26 = nxt.text) === '++' || ref26 === '--') && last === nxt.col) {
                    if ((ref27 = e.token.type) !== 'var') {
                        tokens.shift();
                        console.error('wrong rhs increment');
                        return;
                    }
                    e = this.operation(e, tokens.shift());
                } else if (nxt.type === 'dots' && ((ref28 = e.token.type) === 'var' || ref28 === 'num')) {
                    e = this.slice(e, tokens);
                } else if (this.stack.slice(-1)[0] === '[' && nxt.text === ']') {
                    this.verb('exp array end');
                    break;
                } else if (this.stack.slice(-1)[0] === '{' && nxt.text === '}') {
                    this.verb('exp curly end');
                    break;
                } else if (last < nxt.col && (ref29 = nxt.text, indexOf.call(')]},;:.', ref29) < 0) && ((ref30 = nxt.text) !== 'then' && ref30 !== 'else' && ref30 !== 'break' && ref30 !== 'continue' && ref30 !== 'in' && ref30 !== 'of') && ((ref31 = nxt.type) !== 'nl') && ((ref32 = e.token.type) !== 'num' && ref32 !== 'single' && ref32 !== 'double' && ref32 !== 'triple' && ref32 !== 'regex' && ref32 !== 'punct' && ref32 !== 'comment' && ref32 !== 'op') && ((ref33 = e.token.text) !== 'null' && ref33 !== 'undefined' && ref33 !== 'Infinity' && ref33 !== 'NaN' && ref33 !== 'true' && ref33 !== 'false' && ref33 !== 'yes' && ref33 !== 'no') && (e.token.type !== 'keyword' || ((ref34 = e.token.text) === 'new' || ref34 === 'require' || ref34 === 'typeof' || ref34 === 'delete')) && (((ref35 = this.stack.slice(-1)[0]) !== 'if' && ref35 !== 'for') || nxt.line === e.token.line) && indexOf.call(this.stack, 'onearg') < 0) {
                    this.verb('exp is lhs of implicit call! e', e, this.stack.slice(-1)[0]);
                    this.verb('    is lhs of implicit call! nxt', nxt);
                    e = this.call(e, tokens);
                } else if (nxt.type === 'op' && ((ref36 = nxt.text) === '+' || ref36 === '-') && ((ref37 = (ref38 = e.token) != null ? ref38.text : void 0) !== '[' && ref37 !== '(')) {
                    if (last < nxt.col && ((ref39 = tokens[1]) != null ? ref39.col : void 0) === nxt.col + nxt.text.length) {
                        this.verb('exp op is unbalanced +- break...', e, nxt, this.stack);
                        break;
                    }
                    this.verb('exp is lhs of op', e, nxt);
                    e = this.operation(e, tokens.shift(), tokens);
                } else {
                    if (this.verbose) {
                        print.tokens("exp no nxt match? break! stack:" + this.stack + " nxt:", [nxt]);
                    }
                    break;
                }
            } else {
                if (((ref40 = nxt.text) === '++' || ref40 === '--') && last === nxt.col) {
                    e = this.operation(e, tokens.shift());
                } else if (nxt.type === 'dots' && (ref41 = this.stack.slice(-1)[0], indexOf.call('.', ref41) < 0)) {
                    e = this.slice(e, tokens);
                } else if (this.stack.slice(-1)[0] === 'call' && nxt.text === ']') {
                    this.verb('exp call array end');
                    break;
                } else if (this.stack.slice(-1)[0] === '[' && nxt.text === ']') {
                    this.verb('exp [ array end', nxt);
                    break;
                } else {
                    if (this.verbose) {
                        print.ast("exp no nxt match?? stack:" + this.stack + " e:", e);
                        print.tokens("exp no nxt match?? nxt:", nxt);
                    }
                    break;
                }
            }
            if (numTokens === tokens.length) {
                console.error('exp no token consumed?');
                break;
            }
        }
        if (empty(this.stack)) {
            if (nxt = tokens[0]) {
                this.verb('exp empty stack nxt', nxt);
                if (nxt.text === '[' && ((ref42 = tokens[1]) != null ? ref42.text : void 0) !== ']') {
                    this.verb('exp is last minute lhs of index', e);
                    e = this.index(e, tokens);
                }
            }
        }
        if (this.verbose) {
            print.ast("exp " + (empty(this.stack) ? 'DONE' : ''), e);
        }
        this.sheapPop('exp', (ref43 = tok.text) != null ? ref43 : tok.type);
        return e;
    };

    Parse.prototype.then = function(id, tokens) {
        var block, nl, ref, ref1, ref2, thn;
        if (((ref = tokens[0]) != null ? ref.text : void 0) === 'then') {
            tokens.shift();
            nl = 'nl';
        } else if (((ref1 = tokens[0]) != null ? ref1.type : void 0) === 'block') {
            block = tokens.shift();
            if (((ref2 = tokens[0]) != null ? ref2.type : void 0) === 'nl') {
                tokens.shift();
            }
            tokens = block.tokens;
            nl = null;
        } else {
            console.error(id + ": then or block expected!");
        }
        thn = this.exps(id, tokens, nl);
        if (block && block.tokens.length) {
            print.tokens('dangling then tokens', tokens);
        }
        return thn;
    };

    Parse.prototype.block = function(id, tokens) {
        var block, exps, nl, ref, ref1;
        if (((ref = tokens[0]) != null ? ref.type : void 0) === 'block') {
            block = tokens.shift();
            if (((ref1 = tokens[0]) != null ? ref1.type : void 0) === 'nl') {
                tokens.shift();
            }
            tokens = block.tokens;
            nl = null;
        } else {
            nl = 'nl';
        }
        exps = this.exps(id, tokens, nl);
        if (block && block.tokens.length) {
            print.tokens('dangling block tokens', tokens);
        }
        return exps;
    };

    Parse.prototype.sheapPush = function(type, text) {
        this.sheap.push({
            type: type,
            text: text
        });
        if (this.verbose) {
            return print.sheap(this.sheap);
        }
    };

    Parse.prototype.sheapPop = function(m, t) {
        var popped;
        popped = this.sheap.pop();
        if (popped.text !== t) {
            console.error('wrong pop?', popped.text, t);
        }
        if (this.verbose) {
            return print.sheap(this.sheap, popped);
        }
    };

    Parse.prototype.push = function(node) {
        if (this.verbose) {
            print.stack(this.stack, node);
        }
        return this.stack.push(node);
    };

    Parse.prototype.pop = function(n) {
        var p;
        p = this.stack.pop();
        if (p !== n) {
            console.error("unexpected pop!", p, n);
        }
        if (this.verbose) {
            return print.stack(this.stack, p, function(s) {
                return W1(w1(s));
            });
        }
    };

    Parse.prototype.verb = function() {
        if (this.verbose) {
            return console.log.apply(console.log, arguments);
        }
    };

    return Parse;

})();

module.exports = Parse;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2UuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJwYXJzZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsbUJBQUE7SUFBQTs7QUFRQSxLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVI7O0FBQ1IsS0FBQSxHQUFRLFNBQUMsQ0FBRDtXQUFPLENBQUEsQ0FBQSxLQUFNLEVBQU4sSUFBQSxDQUFBLEtBQVMsSUFBVCxJQUFBLENBQUEsS0FBYyxRQUFkLENBQUEsSUFBNEIsQ0FBQyxPQUFPLENBQVAsS0FBYSxRQUFiLElBQTBCLE1BQU0sQ0FBQyxJQUFQLENBQVksQ0FBWixDQUFjLENBQUMsTUFBZixLQUF5QixDQUFwRDtBQUFuQzs7QUFFRjtJQUVDLGVBQUMsSUFBRDtRQUVDLElBQUMsQ0FBQSxLQUFELGtCQUFXLElBQUksQ0FBRTtRQUNqQixJQUFDLENBQUEsT0FBRCxrQkFBVyxJQUFJLENBQUU7UUFDakIsSUFBQyxDQUFBLEdBQUQsa0JBQVcsSUFBSSxDQUFFO0lBSmxCOztvQkFZSCxLQUFBLEdBQU8sU0FBQyxLQUFEO0FBRUgsWUFBQTtRQUFBLElBQUMsQ0FBQSxLQUFELEdBQVM7UUFDVCxJQUFDLENBQUEsS0FBRCxHQUFTO1FBRVQsR0FBQSxHQUFNO0FBRU4sZUFBTSxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQW5CO1lBQ0ksR0FBQSxHQUFNLEdBQUcsQ0FBQyxNQUFKLENBQVcsSUFBQyxDQUFBLElBQUQsQ0FBTSxVQUFOLEVBQWlCLEtBQUssQ0FBQyxNQUF2QixDQUFYO1FBRFY7UUFHQSxJQUFHLElBQUMsQ0FBQSxHQUFKO1lBQWEsS0FBSyxDQUFDLElBQU4sQ0FBVyxTQUFYLEVBQXFCLEdBQXJCLEVBQWI7O2VBRUE7SUFaRzs7b0JBc0JQLElBQUEsR0FBTSxTQUFDLElBQUQsRUFBTyxNQUFQLEVBQWUsSUFBZjtBQUVGLFlBQUE7UUFBQSxJQUFVLEtBQUEsQ0FBTSxNQUFOLENBQVY7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Q0FBdkMsRUFBbEI7O1FBQ0EsSUFBOEIsSUFBQyxDQUFBLE9BQS9CO21CQUFBLEtBQUssQ0FBQyxLQUFOLENBQVksSUFBQyxDQUFBLEtBQWIsRUFBb0IsTUFBcEIsRUFBQTs7SUFKTTs7b0JBWVYsSUFBQSxHQUFNLFNBQUMsSUFBRDtRQUVGLElBQTRCLElBQUMsQ0FBQSxPQUE3QjtZQUFBLEtBQUssQ0FBQyxLQUFOLENBQVksSUFBQyxDQUFBLEtBQWIsRUFBb0IsSUFBcEIsRUFBQTs7ZUFDQSxJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBWSxJQUFaO0lBSEU7O29CQUtOLEdBQUEsR0FBSyxTQUFDLENBQUQ7QUFDRCxZQUFBO1FBQUEsQ0FBQSxHQUFJLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFBO1FBQ0osSUFBRyxDQUFBLEtBQUssQ0FBUjtZQUNHLE9BQUEsQ0FBQyxLQUFELENBQU8saUJBQVAsRUFBeUIsQ0FBekIsRUFBNEIsQ0FBNUIsRUFESDs7UUFFQSxJQUFHLElBQUMsQ0FBQSxPQUFKO21CQUNJLEtBQUssQ0FBQyxLQUFOLENBQVksSUFBQyxDQUFBLEtBQWIsRUFBb0IsQ0FBcEIsRUFBdUIsU0FBQyxDQUFEO3VCQUFPLEVBQUEsQ0FBRyxFQUFBLENBQUcsQ0FBSCxDQUFIO1lBQVAsQ0FBdkIsRUFESjs7SUFKQzs7b0JBT0wsSUFBQSxHQUFNLFNBQUE7UUFFRixJQUFHLElBQUMsQ0FBQSxPQUFKO21CQUNJLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBWixDQUFrQixPQUFPLENBQUMsR0FBMUIsRUFBK0IsU0FBL0IsRUFESjs7SUFGRTs7Ozs7O0FBS1YsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgXG4wMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCBcbjAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAgIFxuMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwXG4jIyNcblxucHJpbnQgPSByZXF1aXJlICcuL3ByaW50J1xuZW1wdHkgPSAoYSkgLT4gYSBpbiBbJycgbnVsbCB1bmRlZmluZWRdIG9yICh0eXBlb2YoYSkgPT0gJ29iamVjdCcgYW5kIE9iamVjdC5rZXlzKGEpLmxlbmd0aCA9PSAwKVxuXG5jbGFzcyBQYXJzZSAjIHRoZSBiYXNlIGNsYXNzIG9mIFBhcnNlclxuXG4gICAgQDogKGFyZ3MpIC0+XG5cbiAgICAgICAgQGRlYnVnICAgPSBhcmdzPy5kZWJ1Z1xuICAgICAgICBAdmVyYm9zZSA9IGFyZ3M/LnZlcmJvc2VcbiAgICAgICAgQHJhdyAgICAgPSBhcmdzPy5yYXdcblxuICAgICMgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwXG5cbiAgICBwYXJzZTogKGJsb2NrKSAtPiAjIGNvbnZlcnQgYmxvY2sgdHJlZSB0byBhYnN0cmFjdCBzeW50YXggdHJlZVxuXG4gICAgICAgIEBzdGFjayA9IFtdXG4gICAgICAgIEBzaGVhcCA9IFtdXG5cbiAgICAgICAgYXN0ID0gW11cblxuICAgICAgICB3aGlsZSBibG9jay50b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICBhc3QgPSBhc3QuY29uY2F0IEBleHBzICd0bCBibG9jaycgYmxvY2sudG9rZW5zXG5cbiAgICAgICAgaWYgQHJhdyB0aGVuIHByaW50Lm5vb24gJ3JhdyBhc3QnIGFzdFxuXG4gICAgICAgIGFzdFxuXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMDAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgICAgICAgMDAwXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMDAwMDBcblxuICAgICMgY29uc3VtZXMgdG9rZW5zIGFuZCByZXR1cm5zIGxpc3Qgb2YgZXhwcmVzc2lvbnNcblxuICAgIGV4cHM6IChydWxlLCB0b2tlbnMsIHN0b3ApIC0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgZW1wdHkgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICBAc2hlYXBQdXNoICdleHBzJyBydWxlXG5cbiAgICAgICAgZXMgPSBbXVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIHdoaWxlIHRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbnVtVG9rZW5zID0gdG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBiID0gc3dpdGNoIEBzdGFja1stMV1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHdoZW4gJ29uZWFyZycgICAgICAgdGhlbiBlcy5sZW5ndGhcbiAgICAgICAgICAgICAgICB3aGVuICdpZicgJ3N3aXRjaCcgIHRoZW4gdG9rZW5zWzBdLnRleHQgPT0gJ2Vsc2UnXG4gICAgICAgICAgICAgICAgd2hlbiAnWycgICAgICAgICAgICB0aGVuIHRva2Vuc1swXS50ZXh0ID09ICddJyAgIyBhbmQgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICB3aGVuICdjYWxsJyAgICAgICAgIHRoZW4gdG9rZW5zWzBdLnRleHQgaW4gJ107JyBhbmQgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICB3aGVuICd7JyAgICAgICAgICAgIHRoZW4gdG9rZW5zWzBdLnRleHQgaW4gJ307JyBhbmQgdG9rZW5zLnNoaWZ0KCkgIyBpIGtub3csIGl0J3MgYSBwYWluLCBidXQgd2Ugc2hvdWxkbid0IHNoaWZ0IH0gaGVyZSFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyB3aHkgYnJlYWsgb24gOyBpbnN0ZWFkIG9mIGJhaWxpbmcgb3V0IHdpdGggYW4gZXJyb3I/XG4gICAgICAgICAgICAgICAgd2hlbiBydWxlICAgICAgICAgICB0aGVuIHRva2Vuc1swXS50ZXh0ID09IHN0b3AgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGVsc2UgZmFsc2VcblxuICAgICAgICAgICAgaWYgYlxuICAgICAgICAgICAgICAgIEB2ZXJiICdleHBzIGJyZWFrIGZvciBzdGFjayB0b3AnIEBzdGFja1xuICAgICAgICAgICAgICAgIGJyZWFrIFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHRva2Vuc1swXS50eXBlID09ICdibG9jaydcbiAgICBcbiAgICAgICAgICAgICAgICBibG9jayA9IHRva2Vucy5zaGlmdCgpXG4gICAgXG4gICAgICAgICAgICAgICAgQHZlcmIgXCJleHBzIGJsb2NrIHN0YXJ0XCIgYmxvY2tcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgIyB3aGlsZSBibG9jay50b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICMgZXMgPSBlcy5jb25jYXQgQGV4cHMgJ2V4cHMgYmxvY2snIGJsb2NrLnRva2Vuc1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBlcyA9IGVzLmNvbmNhdCBAZXhwcyAnZXhwcyBibG9jaycgYmxvY2sudG9rZW5zICAgICAgICAgICAgICAgICAgICBcblxuICAgICAgICAgICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnbmwnIFxuICAgICAgICAgICAgICAgICAgICBAdmVyYiBcImV4cHMgYmxvY2sgZW5kIHNoaWZ0IG5sXCIgXG4gICAgICAgICAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnLCdcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgXCJleHBzIGJsb2NrIGVuZCBzaGlmdCAsXCJcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgYmxvY2sgZW5kIC4uLmNvbnRpbnVlLi4uJ1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdLnR5cGUgPT0gJ2Jsb2NrJyBcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBicmVhayBvbiBibG9jaydcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdLnRleHQgPT0gJyknXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgYnJlYWsgb24gKSdcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgcnVsZSA9PSAnZm9yIHZhbHMnIGFuZCB0b2tlbnNbMF0udGV4dCBpbiBbJ2luJydvZiddXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgYnJlYWsgb24gaW58b2YnXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHRva2Vuc1swXS50eXBlID09ICdubCcgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgbmwgc3RvcDonIHN0b3AsIHRva2Vuc1swXSwgQHN0YWNrXG5cbiAgICAgICAgICAgICAgICBpZiBAc3RhY2tbLTFdID09ICdpZicgYW5kIHRva2Vuc1sxXT8udGV4dCAhPSAnZWxzZSdcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgbmwgaW4gaWYgKHNoaWZ0IGFuZCBicmVhayknIFxuICAgICAgICAgICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBAc3RhY2tbLTFdID09ICdbJyBhbmQgdG9rZW5zWzFdPy50ZXh0ID09ICddJ1xuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBubCBpbiBhcnJheSAoc2hpZnQgYW5kIGJyZWFrKSdcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgc3RvcFxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBubCB3aXRoIHN0b3AnIFxuICAgICAgICAgICAgICAgICAgICBpZiBAc3RhY2tbLTFdID09ICdjYWxsJ1xuICAgICAgICAgICAgICAgICAgICAgICAgQHZlcmIgXCJleHBzIG5sIHdpdGggc3RvcCBpbiBjYWxsIChicmVhaywgYnV0IGRvbid0IHNoaWZ0IG5sKVwiXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIEB2ZXJiICdleHBzIG5sIHdpdGggc3RvcCAoc2hpZnQgYW5kIGJyZWFrKScgXG4gICAgICAgICAgICAgICAgICAgICAgICB0b2tlbnMuc2hpZnQoKSBcbiAgICAgICAgICAgICAgICAgICAgYnJlYWsgXG5cbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBubCBzaGlmdCBhbmQgLi4uJyAgICAgXG4gICAgICAgICAgICAgICAgbmwgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnLicgYW5kIHRva2Vuc1sxXT8udHlwZSA9PSAndmFyJ1xuICAgICAgICAgICAgICAgICAgICBsb2cgJ2V4cHMgbmwgbmV4dCBsaW5lIHN0YXJ0cyB3aXRoIC52YXIhJ1xuICAgICAgICAgICAgICAgICAgICBlcy5wdXNoIEBwcm9wIGVzLnBvcCgpLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgIyBsb2cgJ3Rva2Vuc1swXS5jb2wnIHRva2Vuc1swXS5jb2xcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBubCBjb250aW51ZS4uLicgXG4gICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGV4ID0gQGV4cCB0b2tlbnNcbiAgICAgICAgICAgIGVzLnB1c2ggZXhcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbnVtVG9rZW5zID09IHRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgICAgICBlcnJvciAnZXhwcyBubyB0b2tlbiBjb25zdW1lZD8nXG4gICAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICBAc2hlYXBQb3AgJ2V4cHMnIHJ1bGVcbiAgICAgICAgXG4gICAgICAgIGVzXG5cbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMFxuXG4gICAgIyBjb25zdW1lcyB0b2tlbnMgYW5kIHJldHVybnMgYSBzaW5nbGUgZXhwcmVzc2lvblxuXG4gICAgZXhwOiAodG9rZW5zKSAtPlxuXG4gICAgICAgIHJldHVybiBpZiBlbXB0eSB0b2tlbnNcblxuICAgICAgICB0b2sgPSB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgIGxvZyBZNSB3MSB0b2s/LnRleHQgaWYgQGRlYnVnXG4gICAgICAgIFxuICAgICAgICAjIHRoaXMgYXNzdW1lcyB0aGF0IHRoZSBoYW5kbGluZyBvZiBsaXN0cyBvZiBleHByZXNzaW9ucyBpcyBkb25lIGluIGV4cHMgYW5kXG4gICAgICAgICMgc2lsZW50bHkgc2tpcHMgb3ZlciBsZWFkaW5nIHNlcGFyYXRpbmcgdG9rZW5zIGxpa2UgY29tbWF0YXMsIHNlbWljb2xvbnMgYW5kIG5sLlxuXG4gICAgICAgIHN3aXRjaCB0b2sudHlwZVxuICAgICAgICAgICAgd2hlbiAnYmxvY2snICAgICAgICAgICAgdGhlbiByZXR1cm4gZXJyb3IgXCJJTlRFUk5BTCBFUlJPUjogdW5leHBlY3RlZCBibG9jayB0b2tlbiBpbiBleHAhXCJcbiAgICAgICAgICAgIHdoZW4gJ25sJyAgICAgICAgICAgICAgIHRoZW4gcmV0dXJuIEBleHAgdG9rZW5zICMgc2tpcCBubFxuICAgICAgICAgICAgd2hlbiAna2V5d29yZCdcbiAgICAgICAgICAgICAgICBzd2l0Y2ggdG9rLnRleHQgXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ2lmJyAgICAgICB0aGVuIHJldHVybiBAaWYgICAgIHRvaywgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ2ZvcicgICAgICB0aGVuIHJldHVybiBAZm9yICAgIHRvaywgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ3doaWxlJyAgICB0aGVuIHJldHVybiBAd2hpbGUgIHRvaywgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ3N3aXRjaCcgICB0aGVuIHJldHVybiBAc3dpdGNoIHRvaywgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ3doZW4nICAgICB0aGVuIHJldHVybiBAd2hlbiAgIHRvaywgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ2NsYXNzJyAgICB0aGVuIHJldHVybiBAY2xhc3MgIHRvaywgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ3JldHVybicgICB0aGVuIHJldHVybiBAcmV0dXJuIHRvaywgdG9rZW5zXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgc3dpdGNoIHRvay50ZXh0IFxuICAgICAgICAgICAgICAgICAgICB3aGVuICctPicgJz0+JyAgdGhlbiByZXR1cm4gQGZ1bmMgbnVsbCwgdG9rLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnOycgICAgICAgIHRoZW4gcmV0dXJuIEBleHAgdG9rZW5zICMgc2tpcCA7XG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJywnICAgICAgICB0aGVuIHJldHVybiBAZXhwIHRva2VucyAjIHNraXAgLFxuXG4gICAgICAgICMjI1xuICAgICAgICBoZXJlIGNvbWVzIHRoZSBoYWlyeSBwYXJ0IDotKVxuICAgICAgICBcbiAgICAgICAgY29tYmluZSBpbmZvcm1hdGlvbiBhYm91dCB0aGUgcnVsZSBzdGFjaywgY3VycmVudCBhbmQgZnV0dXJlIHRva2Vuc1xuICAgICAgICB0byBmaWd1cmUgb3V0IHdoZW4gdGhlIGV4cHJlc3Npb24gZW5kc1xuICAgICAgICAjIyNcblxuICAgICAgICBAc2hlYXBQdXNoICdleHAnIHRvay50ZXh0ID8gdG9rLnR5cGVcbiAgICAgICAgXG4gICAgICAgIGUgPSB0b2tlbjp0b2tcbiAgICAgICAgXG4gICAgICAgIHdoaWxlIG54dCA9IHRva2Vuc1swXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBudW1Ub2tlbnMgPSB0b2tlbnMubGVuZ3RoXG5cbiAgICAgICAgICAgIGlmIG5vdCBlIHRoZW4gcmV0dXJuIGVycm9yICdubyBlPycgbnh0XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIE9iamVjdC52YWx1ZXMoZSlbMF0/LmNvbD9cbiAgICAgICAgICAgICAgICBsYXN0ID0gT2JqZWN0LnZhbHVlcyhlKVswXS5jb2wrT2JqZWN0LnZhbHVlcyhlKVswXS50ZXh0Py5sZW5ndGhcbiAgICAgICAgICAgIGVsc2UgaWYgT2JqZWN0LnZhbHVlcyhlKVswXT8uY2xvc2U/LmNvbD9cbiAgICAgICAgICAgICAgICBsYXN0ID0gT2JqZWN0LnZhbHVlcyhlKVswXS5jbG9zZS5jb2wrT2JqZWN0LnZhbHVlcyhlKVswXS5jbG9zZS50ZXh0Py5sZW5ndGhcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBsYXN0ID0gLTFcbiAgICAgICAgICAgICAgICAjIEB2ZXJiICdleHAgbm8gbGFzdD8gZTonIGVcbiAgICAgICAgICAgICMgQHZlcmIgJ2V4cCBsYXN0IG5leHQnIGxhc3QsIG54dC5jb2xcblxuICAgICAgICAgICAgaWYgQHN0YWNrWy0xXSA9PSAnb25lYXJnJyBhbmQgbnh0LnR5cGUgaW4gWydvcCddXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBicmVhayBmb3Igb25lYXJnJ1xuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG54dC50eXBlID09ICdvcCcgYW5kIG54dC50ZXh0IG5vdCBpbiBbJysrJyAnLS0nICcrJyAnLSddIGFuZCBlLnRva2VuPy50ZXh0IG5vdCBpbiBbJ1snICcoJ10gYW5kICdvbmVhcmcnIG5vdCBpbiBAc3RhY2tcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIGlzIGxocyBvZiBvcCcgZSwgbnh0XG4gICAgICAgICAgICAgICAgZSA9IEBvcGVyYXRpb24gZSwgdG9rZW5zLnNoaWZ0KCksIHRva2Vuc1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZSBpZiBueHQudHlwZSA9PSAnb3AnIGFuZCBueHQudGV4dCBpbiBbJysnICctJ10gYW5kIGUudG9rZW4/LnRleHQgbm90IGluIFsnWycgJygnXSBhbmQgXFxcbiAgICAgICAgICAgICAgICAgICAgbGFzdCA8IG54dC5jb2wgYW5kIHRva2Vuc1sxXT8uY29sID4gbnh0LmNvbCtueHQudGV4dC5sZW5ndGhcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIGlzIGxocyBvZiArLVxccycgZSwgbnh0XG4gICAgICAgICAgICAgICAgZSA9IEBvcGVyYXRpb24gZSwgdG9rZW5zLnNoaWZ0KCksIHRva2Vuc1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50eXBlID09ICdmdW5jJyBhbmQgKGUucGFyZW5zIG9yIGUudG9rZW4gYW5kIFxuICAgICAgICAgICAgICAgICAgICBlLnRva2VuLnR5cGUgbm90IGluIFsnbnVtJydzaW5nbGUnJ2RvdWJsZScndHJpcGxlJ10gYW5kIFxuICAgICAgICAgICAgICAgICAgICBlLnRva2VuLnRleHQgbm90IGluICd9XScpXG4gICAgICAgICAgICAgICAgZiA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBmdW5jIGZvciBlJyBlXG4gICAgICAgICAgICAgICAgZSA9IEBmdW5jIGUsIGYsIHRva2Vuc1xuICAgICAgICAgICAgZWxzZSBpZiBueHQudGV4dCA9PSAnKCdcbiAgICAgICAgICAgICAgICBpZiBueHQuY29sID09IGxhc3RcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBpcyBsaHMgb2YgY2FsbCdcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBjYWxsIGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBpcyBvcGVuIHBhcmVuJ1xuICAgICAgICAgICAgICAgICAgICBlID0gQHBhcmVucyB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgZWxzZSBpZiBueHQudGV4dCA9PSAnWycgYW5kIG54dC5jb2wgPT0gbGFzdCBhbmQgdG9rZW5zWzFdPy50ZXh0ICE9ICddJyBhbmQgZS50b2tlbj8udGV4dCAhPSAnWydcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIGlzIGxocyBvZiBpbmRleCcgZVxuICAgICAgICAgICAgICAgIGUgPSBAaW5kZXggZSwgdG9rZW5zXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0ID09ICc/JyBhbmQgbGFzdCA9PSBueHQuY29sIGFuZCB0b2tlbnNbMV0/LnRleHQgPT0gJy4nXG4gICAgICAgICAgICAgICAgcW1hcmsgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgIGUgPSBAcHJvcCBlLCB0b2tlbnMsIHFtYXJrXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0ID09ICcuJ1xuICAgICAgICAgICAgICAgIGUgPSBAcHJvcCBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgZWxzZSBpZiBueHQudGV4dCA9PSAnOidcbiAgICAgICAgICAgICAgICBpZiBAc3RhY2tbLTFdICE9ICd7J1xuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIGlzIGZpcnN0IGtleSBvZiBpbXBsaWNpdCBvYmplY3QnIGVcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBvYmplY3QgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIGlzIGtleSBvZiAoaW1wbGljaXQpIG9iamVjdCcgZVxuICAgICAgICAgICAgICAgICAgICBlID0gQGtleXZhbCBlLCB0b2tlbnNcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnR5cGUgPT0gJ2tleXdvcmQnIGFuZCBueHQudGV4dCA9PSAnaW4nIGFuZCBAc3RhY2tbLTFdICE9ICdmb3InXG4gICAgICAgICAgICAgICAgZSA9IEBpbmNvbmQgZSwgdG9rZW5zXG4gICAgICAgICAgICBlbHNlIGlmIGUudG9rZW5cbiAgICAgICAgICAgICAgICBpZiBlLnRva2VuLnRleHQgPT0gJygnXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAcGFyZW5zIGUudG9rZW4sIHRva2Vuc1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgZS50b2tlbi50ZXh0ID09ICdbJ1xuICAgICAgICAgICAgICAgICAgICBlID0gQGFycmF5IGUudG9rZW4sIHRva2Vuc1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgZS50b2tlbi50ZXh0ID09ICd7J1xuICAgICAgICAgICAgICAgICAgICBlID0gQGN1cmx5IGUudG9rZW4sIHRva2Vuc1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgZS50b2tlbi50ZXh0IGluIFsnKycnLScnKysnJy0tJ10gYW5kIGxhc3QgPT0gbnh0LmNvbFxuICAgICAgICAgICAgICAgICAgICBpZiBueHQudHlwZSBub3QgaW4gWyd2YXInJ3BhcmVuJ10gYW5kIGUudG9rZW4udGV4dCBpbiBbJysrJyctLSddXG4gICAgICAgICAgICAgICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3IgJ3dyb25nIGxocyBpbmNyZW1lbnQnIGUsIG54dFxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdsaHMgbnVsbCBvcGVyYXRpb24nXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAb3BlcmF0aW9uIG51bGwsIGUudG9rZW4sIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICBpZiBlLm9wZXJhdGlvbi5yaHM/Lm9wZXJhdGlvbj8ub3BlcmF0b3I/LnRleHQgaW4gWycrKycnLS0nXVxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3IgJ2xlZnQgYW5kIHJpZ2h0IHNpZGUgaW5jcmVtZW50J1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBueHQudGV4dCBpbiBbJysrJyctLSddIGFuZCBsYXN0ID09IG54dC5jb2xcbiAgICAgICAgICAgICAgICAgICAgaWYgZS50b2tlbi50eXBlIG5vdCBpbiBbJ3ZhciddXG4gICAgICAgICAgICAgICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3IgJ3dyb25nIHJocyBpbmNyZW1lbnQnXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICAgICAgZSA9IEBvcGVyYXRpb24gZSwgdG9rZW5zLnNoaWZ0KCkgXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBueHQudHlwZSA9PSAnZG90cycgYW5kIGUudG9rZW4udHlwZSBpbiBbJ3ZhcicgJ251bSddXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAc2xpY2UgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBAc3RhY2tbLTFdID09ICdbJyBhbmQgbnh0LnRleHQgPT0gJ10nXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdleHAgYXJyYXkgZW5kJ1xuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgQHN0YWNrWy0xXSA9PSAneycgYW5kIG54dC50ZXh0ID09ICd9J1xuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIGN1cmx5IGVuZCdcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGxhc3QgPCBueHQuY29sIGFuZCBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgbnh0LnRleHQgbm90IGluICcpXX0sOzouJyBhbmQgXFxcbiAgICAgICAgICAgICAgICAgICAgICAgIG54dC50ZXh0IG5vdCBpbiBbJ3RoZW4nICdlbHNlJyAnYnJlYWsnICdjb250aW51ZScgJ2luJyAnb2YnXSBhbmQgXFxcbiAgICAgICAgICAgICAgICAgICAgICAgIG54dC50eXBlIG5vdCBpbiBbJ25sJ10gYW5kIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAoZS50b2tlbi50eXBlIG5vdCBpbiBbJ251bScgJ3NpbmdsZScgJ2RvdWJsZScgJ3RyaXBsZScgJ3JlZ2V4JyAncHVuY3QnICdjb21tZW50JyAnb3AnXSkgYW5kIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAoZS50b2tlbi50ZXh0IG5vdCBpbiBbJ251bGwnICd1bmRlZmluZWQnICdJbmZpbml0eScgJ05hTicgJ3RydWUnICdmYWxzZScgJ3llcycgJ25vJ10pIGFuZCBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgKGUudG9rZW4udHlwZSAhPSAna2V5d29yZCcgb3IgKGUudG9rZW4udGV4dCBpbiBbJ25ldycgJ3JlcXVpcmUnICd0eXBlb2YnICdkZWxldGUnXSkpIGFuZCBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgKChAc3RhY2tbLTFdIG5vdCBpbiBbJ2lmJyAnZm9yJ10pIG9yIG54dC5saW5lID09IGUudG9rZW4ubGluZSkgYW5kIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAnb25lYXJnJyBub3QgaW4gQHN0YWNrXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdleHAgaXMgbGhzIG9mIGltcGxpY2l0IGNhbGwhIGUnIGUsIEBzdGFja1stMV1cbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJyAgICBpcyBsaHMgb2YgaW1wbGljaXQgY2FsbCEgbnh0JyBueHRcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBjYWxsIGUsIHRva2Vuc1xuXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBueHQudHlwZSA9PSAnb3AnIGFuZCBueHQudGV4dCBpbiBbJysnICctJ10gYW5kIGUudG9rZW4/LnRleHQgbm90IGluIFsnWycgJygnXVxuICAgICAgICAgICAgICAgICAgICBpZiBsYXN0IDwgbnh0LmNvbCBhbmQgdG9rZW5zWzFdPy5jb2wgPT0gbnh0LmNvbCtueHQudGV4dC5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgIEB2ZXJiICdleHAgb3AgaXMgdW5iYWxhbmNlZCArLSBicmVhay4uLicgZSwgbnh0LCBAc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdleHAgaXMgbGhzIG9mIG9wJyBlLCBueHRcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBvcGVyYXRpb24gZSwgdG9rZW5zLnNoaWZ0KCksIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHByaW50LnRva2VucyBcImV4cCBubyBueHQgbWF0Y2g/IGJyZWFrISBzdGFjazoje0BzdGFja30gbnh0OlwiIFtueHRdIGlmIEB2ZXJib3NlXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlICMgaWYgZSBpcyBub3QgYSB0b2tlbiBhbnltb3JlXG4gICAgICAgICAgICAgICAgaWYgbnh0LnRleHQgaW4gWycrKycnLS0nXSBhbmQgbGFzdCA9PSBueHQuY29sXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAb3BlcmF0aW9uIGUsIHRva2Vucy5zaGlmdCgpICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGVsc2UgaWYgbnh0LnR5cGUgPT0gJ2RvdHMnIGFuZCBAc3RhY2tbLTFdIG5vdCBpbiAnLidcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBzbGljZSBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBlbHNlIGlmIEBzdGFja1stMV0gPT0gJ2NhbGwnIGFuZCBueHQudGV4dCA9PSAnXSdcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBjYWxsIGFycmF5IGVuZCdcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIEBzdGFja1stMV0gPT0gJ1snIGFuZCBueHQudGV4dCA9PSAnXSdcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBbIGFycmF5IGVuZCcgbnh0XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBpZiBAdmVyYm9zZVxuICAgICAgICAgICAgICAgICAgICAgICAgcHJpbnQuYXN0IFwiZXhwIG5vIG54dCBtYXRjaD8/IHN0YWNrOiN7QHN0YWNrfSBlOlwiIGVcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW50LnRva2VucyBcImV4cCBubyBueHQgbWF0Y2g/PyBueHQ6XCIgbnh0XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbnVtVG9rZW5zID09IHRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgICAgICBlcnJvciAnZXhwIG5vIHRva2VuIGNvbnN1bWVkPydcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICBcbiAgICAgICAgaWYgZW1wdHkgQHN0YWNrXG4gICAgICAgICAgICAjIEB2ZXJiICdleHAgZW1wdHkgc3RhY2snXG4gICAgICAgICAgICBpZiBueHQgPSB0b2tlbnNbMF1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIGVtcHR5IHN0YWNrIG54dCcgbnh0XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBueHQudGV4dCA9PSAnWycgYW5kIHRva2Vuc1sxXT8udGV4dCAhPSAnXSdcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBpcyBsYXN0IG1pbnV0ZSBsaHMgb2YgaW5kZXgnIGVcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBpbmRleCBlLCB0b2tlbnNcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBpbXBsZW1lbnQgbnVsbCBjaGVja3MgaGVyZSFcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcHJpbnQuYXN0IFwiZXhwICN7aWYgZW1wdHkoQHN0YWNrKSB0aGVuICdET05FJyBlbHNlICcnfVwiIGUgaWYgQHZlcmJvc2VcbiAgICAgICAgXG4gICAgICAgIEBzaGVhcFBvcCAnZXhwJyB0b2sudGV4dCA/IHRvay50eXBlXG5cbiAgICAgICAgZVxuICAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgXG4gICAgIyAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgXG4gICAgXG4gICAgdGhlbjogKGlkLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJ3RoZW4nXG4gICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgbmwgPSAnbmwnXG4gICAgICAgIGVsc2UgaWYgdG9rZW5zWzBdPy50eXBlID09ICdibG9jaydcbiAgICAgICAgICAgIGJsb2NrID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnbmwnXG4gICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIHRva2VucyA9IGJsb2NrLnRva2Vuc1xuICAgICAgICAgICAgbmwgPSBudWxsXG4gICAgICAgIGVsc2UgXG4gICAgICAgICAgICBlcnJvciBcIiN7aWR9OiB0aGVuIG9yIGJsb2NrIGV4cGVjdGVkIVwiXG5cbiAgICAgICAgdGhuID0gQGV4cHMgaWQsIHRva2VucywgbmxcbiAgICAgICAgXG4gICAgICAgIGlmIGJsb2NrIGFuZCBibG9jay50b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICBwcmludC50b2tlbnMgJ2RhbmdsaW5nIHRoZW4gdG9rZW5zJyB0b2tlbnNcbiAgICAgICAgICAgIFxuICAgICAgICB0aG5cbiAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgYmxvY2s6IChpZCwgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgdG9rZW5zWzBdPy50eXBlID09ICdibG9jaydcbiAgICAgICAgICAgIGJsb2NrID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnbmwnXG4gICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIHRva2VucyA9IGJsb2NrLnRva2Vuc1xuICAgICAgICAgICAgbmwgPSBudWxsXG4gICAgICAgIGVsc2UgXG4gICAgICAgICAgICBubCA9ICdubCdcbiAgICAgICAgICAgIFxuICAgICAgICBleHBzID0gQGV4cHMgaWQsIHRva2VucywgbmxcblxuICAgICAgICBpZiBibG9jayBhbmQgYmxvY2sudG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgcHJpbnQudG9rZW5zICdkYW5nbGluZyBibG9jayB0b2tlbnMnIHRva2Vuc1xuICAgICAgICAgICAgXG4gICAgICAgIGV4cHNcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwMCAgICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAgXG4gICAgXG4gICAgc2hlYXBQdXNoOiAodHlwZSwgdGV4dCkgLT5cbiAgICAgICAgXG4gICAgICAgIEBzaGVhcC5wdXNoIHR5cGU6dHlwZSwgdGV4dDp0ZXh0XG4gICAgICAgIHByaW50LnNoZWFwIEBzaGVhcCBpZiBAdmVyYm9zZVxuICAgICAgICBcbiAgICBzaGVhcFBvcDogKG0sIHQpIC0+XG4gICAgICAgIFxuICAgICAgICBwb3BwZWQgPSBAc2hlYXAucG9wKClcbiAgICAgICAgaWYgcG9wcGVkLnRleHQgIT0gdCB0aGVuIGVycm9yICd3cm9uZyBwb3A/JyBwb3BwZWQudGV4dCwgdFxuICAgICAgICBwcmludC5zaGVhcCBAc2hlYXAsIHBvcHBlZCBpZiBAdmVyYm9zZVxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICBcbiAgICAjICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuXG4gICAgcHVzaDogKG5vZGUpIC0+XG5cbiAgICAgICAgcHJpbnQuc3RhY2sgQHN0YWNrLCBub2RlIGlmIEB2ZXJib3NlXG4gICAgICAgIEBzdGFjay5wdXNoIG5vZGVcblxuICAgIHBvcDogKG4pIC0+XG4gICAgICAgIHAgPSBAc3RhY2sucG9wKClcbiAgICAgICAgaWYgcCAhPSBuXG4gICAgICAgICAgICBlcnJvciBcInVuZXhwZWN0ZWQgcG9wIVwiIHAsIG5cbiAgICAgICAgaWYgQHZlcmJvc2VcbiAgICAgICAgICAgIHByaW50LnN0YWNrIEBzdGFjaywgcCwgKHMpIC0+IFcxIHcxIHNcblxuICAgIHZlcmI6IC0+XG5cbiAgICAgICAgaWYgQHZlcmJvc2VcbiAgICAgICAgICAgIGNvbnNvbGUubG9nLmFwcGx5IGNvbnNvbGUubG9nLCBhcmd1bWVudHNcbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IFBhcnNlXG4iXX0=
//# sourceURL=../coffee/parse.coffee