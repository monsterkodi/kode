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
            ast = ast.concat(this.exps('tl', block.tokens));
        }
        if (this.raw) {
            print.noon('raw ast', ast);
        }
        return ast;
    };

    Parse.prototype.exps = function(rule, tokens, stop) {
        var b, block, es, ex, nl, numTokens, ref, ref1, ref2, ref3, ref4, ref5;
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
                if (this.stack.slice(-1)[0] === '[' && ((ref3 = tokens[1]) != null ? ref3.text : void 0) === ']') {
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
                if (((ref4 = tokens[0]) != null ? ref4.text : void 0) === '.' && ((ref5 = tokens[1]) != null ? ref5.type : void 0) === 'var') {
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
        var e, f, last, numTokens, nxt, qmark, ref, ref1, ref10, ref11, ref12, ref13, ref14, ref15, ref16, ref17, ref18, ref19, ref2, ref20, ref21, ref22, ref23, ref24, ref25, ref26, ref27, ref28, ref29, ref3, ref30, ref31, ref32, ref33, ref34, ref35, ref36, ref4, ref5, ref6, ref7, ref8, ref9, tok;
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
                this.verb('exp start shift nl!');
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
        e = tok;
        while (nxt = tokens[0]) {
            numTokens = tokens.length;
            if (!e) {
                return console.error('no e?', nxt);
            }
            if (e.col != null) {
                last = e.col + ((ref1 = e.text) != null ? ref1.length : void 0);
            } else if (((ref2 = Object.values(e)[0]) != null ? (ref3 = ref2.close) != null ? ref3.col : void 0 : void 0) != null) {
                last = Object.values(e)[0].close.col + ((ref4 = Object.values(e)[0].close.text) != null ? ref4.length : void 0);
            } else {
                last = -1;
            }
            if (this.stack.slice(-1)[0] === 'onearg' && ((ref5 = nxt.type) === 'op')) {
                this.verb('exp break for onearg');
                break;
            }
            if (nxt.type === 'op' && ((ref6 = nxt.text) !== '++' && ref6 !== '--' && ref6 !== '+' && ref6 !== '-') && ((ref7 = e.text) !== '[' && ref7 !== '(') && indexOf.call(this.stack, 'onearg') < 0) {
                this.verb('exp is lhs of op', e, nxt);
                e = this.operation(e, tokens.shift(), tokens);
            } else if (nxt.type === 'op' && ((ref8 = nxt.text) === '+' || ref8 === '-') && ((ref9 = e.text) !== '[' && ref9 !== '(') && last < nxt.col && ((ref10 = tokens[1]) != null ? ref10.col : void 0) > nxt.col + nxt.text.length) {
                this.verb('exp is lhs of +-\s', e, nxt);
                e = this.operation(e, tokens.shift(), tokens);
            } else if (nxt.type === 'func' && e.parens) {
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
            } else if (nxt.text === '[' && nxt.col === last && ((ref11 = tokens[1]) != null ? ref11.text : void 0) !== ']' && e.text !== '[') {
                this.verb('exp is lhs of index', e);
                e = this.index(e, tokens);
            } else if (nxt.text === '?' && last === nxt.col && ((ref12 = tokens[1]) != null ? ref12.text : void 0) === '.') {
                qmark = tokens.shift();
                e = this.prop(e, tokens, qmark);
            } else if (nxt.text === '.') {
                e = this.prop(e, tokens);
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
            } else if (e.text != null) {
                if (e.text === '(') {
                    e = this.parens(e, tokens);
                } else if (e.text === '[') {
                    e = this.array(e, tokens);
                } else if (e.text === '{') {
                    e = this.curly(e, tokens);
                } else if (((ref13 = e.text) === '+' || ref13 === '-' || ref13 === '++' || ref13 === '--') && last === nxt.col) {
                    if (((ref14 = nxt.type) !== 'var' && ref14 !== 'paren') && ((ref15 = e.text) === '++' || ref15 === '--')) {
                        tokens.shift();
                        console.error('wrong lhs increment', e, nxt);
                        return;
                    }
                    this.verb('lhs null operation');
                    e = this.operation(null, e, tokens);
                    if ((ref16 = (ref17 = e.operation.rhs) != null ? (ref18 = ref17.operation) != null ? (ref19 = ref18.operator) != null ? ref19.text : void 0 : void 0 : void 0) === '++' || ref16 === '--') {
                        console.error('left and right side increment');
                        return;
                    }
                } else if (((ref20 = nxt.text) === '++' || ref20 === '--') && last === nxt.col) {
                    if ((ref21 = e.type) !== 'var') {
                        tokens.shift();
                        console.error('wrong rhs increment');
                        return;
                    }
                    e = this.operation(e, tokens.shift());
                } else if (nxt.type === 'dots' && ((ref22 = e.type) === 'var' || ref22 === 'num')) {
                    e = this.slice(e, tokens);
                } else if (this.stack.slice(-1)[0] === '[' && nxt.text === ']') {
                    this.verb('exp array end');
                    break;
                } else if (this.stack.slice(-1)[0] === '{' && nxt.text === '}') {
                    this.verb('exp curly end');
                    break;
                } else if (last < nxt.col && (ref23 = nxt.text, indexOf.call(')]},;:.', ref23) < 0) && ((ref24 = nxt.text) !== 'then' && ref24 !== 'else' && ref24 !== 'break' && ref24 !== 'continue' && ref24 !== 'in' && ref24 !== 'of') && ((ref25 = nxt.type) !== 'nl') && ((ref26 = e.type) !== 'num' && ref26 !== 'single' && ref26 !== 'double' && ref26 !== 'triple' && ref26 !== 'regex' && ref26 !== 'punct' && ref26 !== 'comment' && ref26 !== 'op') && ((ref27 = e.text) !== 'null' && ref27 !== 'undefined' && ref27 !== 'Infinity' && ref27 !== 'NaN' && ref27 !== 'true' && ref27 !== 'false' && ref27 !== 'yes' && ref27 !== 'no') && (e.type !== 'keyword' || ((ref28 = e.text) === 'new' || ref28 === 'require' || ref28 === 'typeof' || ref28 === 'delete')) && (((ref29 = this.stack.slice(-1)[0]) !== 'if' && ref29 !== 'for') || nxt.line === e.line) && indexOf.call(this.stack, 'onearg') < 0) {
                    this.verb('exp is lhs of implicit call! e', e, this.stack.slice(-1)[0]);
                    this.verb('    is lhs of implicit call! nxt', nxt);
                    e = this.call(e, tokens);
                } else if (nxt.type === 'op' && ((ref30 = nxt.text) === '+' || ref30 === '-') && ((ref31 = e.text) !== '[' && ref31 !== '(')) {
                    if (last < nxt.col && ((ref32 = tokens[1]) != null ? ref32.col : void 0) === nxt.col + nxt.text.length) {
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
                if (((ref33 = nxt.text) === '++' || ref33 === '--') && last === nxt.col) {
                    e = this.operation(e, tokens.shift());
                } else if (nxt.type === 'dots' && (ref34 = this.stack.slice(-1)[0], indexOf.call('.', ref34) < 0)) {
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
        if (nxt = tokens[0]) {
            if (empty(this.stack)) {
                this.verb('exp empty stack nxt', nxt);
                if (nxt.text === '[' && ((ref35 = tokens[1]) != null ? ref35.text : void 0) !== ']') {
                    this.verb('exp is last minute lhs of index', e);
                    e = this.index(e, tokens);
                }
            }
        } else {
            this.verb('exp end no nxt!');
        }
        if (this.verbose) {
            print.ast("exp " + (empty(this.stack) ? 'DONE' : ''), e);
        }
        this.sheapPop('exp', (ref36 = tok.text) != null ? ref36 : tok.type);
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

    Parse.prototype.blockExp = function(id, tokens) {
        var block, ref;
        this.verb("blockExp " + id);
        if (((ref = tokens[0]) != null ? ref.type : void 0) === 'block') {
            block = tokens.shift();
            return this.exp(block.tokens);
        } else {
            return this.exp(tokens);
        }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2UuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJwYXJzZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsbUJBQUE7SUFBQTs7QUFRQSxLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVI7O0FBQ1IsS0FBQSxHQUFRLFNBQUMsQ0FBRDtXQUFPLENBQUEsQ0FBQSxLQUFNLEVBQU4sSUFBQSxDQUFBLEtBQVMsSUFBVCxJQUFBLENBQUEsS0FBYyxRQUFkLENBQUEsSUFBNEIsQ0FBQyxPQUFPLENBQVAsS0FBYSxRQUFiLElBQTBCLE1BQU0sQ0FBQyxJQUFQLENBQVksQ0FBWixDQUFjLENBQUMsTUFBZixLQUF5QixDQUFwRDtBQUFuQzs7QUFFRjtJQUVDLGVBQUMsSUFBRDtRQUVDLElBQUMsQ0FBQSxLQUFELGtCQUFXLElBQUksQ0FBRTtRQUNqQixJQUFDLENBQUEsT0FBRCxrQkFBVyxJQUFJLENBQUU7UUFDakIsSUFBQyxDQUFBLEdBQUQsa0JBQVcsSUFBSSxDQUFFO0lBSmxCOztvQkFZSCxLQUFBLEdBQU8sU0FBQyxLQUFEO0FBRUgsWUFBQTtRQUFBLElBQUMsQ0FBQSxLQUFELEdBQVM7UUFDVCxJQUFDLENBQUEsS0FBRCxHQUFTO1FBRVQsR0FBQSxHQUFNO0FBRU4sZUFBTSxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQW5CO1lBQ0ksR0FBQSxHQUFNLEdBQUcsQ0FBQyxNQUFKLENBQVcsSUFBQyxDQUFBLElBQUQsQ0FBTSxJQUFOLEVBQVcsS0FBSyxDQUFDLE1BQWpCLENBQVg7UUFEVjtRQUdBLElBQUcsSUFBQyxDQUFBLEdBQUo7WUFBYSxLQUFLLENBQUMsSUFBTixDQUFXLFNBQVgsRUFBcUIsR0FBckIsRUFBYjs7ZUFFQTtJQVpHOztvQkFzQlAsSUFBQSxHQUFNLFNBQUMsSUFBRCxFQUFPLE1BQVAsRUFBZSxJQUFmO0FBRUYsWUFBQTtRQUFBLElBQVUsS0FBQSxDQUFNLE1BQU4sQ0FBVjtB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LENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBQTtRQUNKLElBQUcsQ0FBQSxLQUFLLENBQVI7WUFDRyxPQUFBLENBQUMsS0FBRCxDQUFPLGlCQUFQLEVBQXlCLENBQXpCLEVBQTRCLENBQTVCLEVBREg7O1FBRUEsSUFBRyxJQUFDLENBQUEsT0FBSjttQkFDSSxLQUFLLENBQUMsS0FBTixDQUFZLElBQUMsQ0FBQSxLQUFiLEVBQW9CLENBQXBCLEVBQXVCLFNBQUMsQ0FBRDt1QkFBTyxFQUFBLENBQUcsRUFBQSxDQUFHLENBQUgsQ0FBSDtZQUFQLENBQXZCLEVBREo7O0lBSkM7O29CQU9MLElBQUEsR0FBTSxTQUFBO1FBRUYsSUFBRyxJQUFDLENBQUEsT0FBSjttQkFDSSxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQVosQ0FBa0IsT0FBTyxDQUFDLEdBQTFCLEVBQStCLFNBQS9CLEVBREo7O0lBRkU7Ozs7OztBQUtWLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgIFxuMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgXG4wMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgICBcbjAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMFxuIyMjXG5cbnByaW50ID0gcmVxdWlyZSAnLi9wcmludCdcbmVtcHR5ID0gKGEpIC0+IGEgaW4gWycnIG51bGwgdW5kZWZpbmVkXSBvciAodHlwZW9mKGEpID09ICdvYmplY3QnIGFuZCBPYmplY3Qua2V5cyhhKS5sZW5ndGggPT0gMClcblxuY2xhc3MgUGFyc2UgIyB0aGUgYmFzZSBjbGFzcyBvZiBQYXJzZXJcblxuICAgIEA6IChhcmdzKSAtPlxuXG4gICAgICAgIEBkZWJ1ZyAgID0gYXJncz8uZGVidWdcbiAgICAgICAgQHZlcmJvc2UgPSBhcmdzPy52ZXJib3NlXG4gICAgICAgIEByYXcgICAgID0gYXJncz8ucmF3XG5cbiAgICAjIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMFxuXG4gICAgcGFyc2U6IChibG9jaykgLT4gIyBjb252ZXJ0IGJsb2NrIHRyZWUgdG8gYWJzdHJhY3Qgc3ludGF4IHRyZWVcblxuICAgICAgICBAc3RhY2sgPSBbXVxuICAgICAgICBAc2hlYXAgPSBbXVxuXG4gICAgICAgIGFzdCA9IFtdXG5cbiAgICAgICAgd2hpbGUgYmxvY2sudG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgYXN0ID0gYXN0LmNvbmNhdCBAZXhwcyAndGwnIGJsb2NrLnRva2Vuc1xuXG4gICAgICAgIGlmIEByYXcgdGhlbiBwcmludC5ub29uICdyYXcgYXN0JyBhc3RcblxuICAgICAgICBhc3RcblxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgICAgICAgIDAwMFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAwMDAwXG5cbiAgICAjIGNvbnN1bWVzIHRva2VucyBhbmQgcmV0dXJucyBsaXN0IG9mIGV4cHJlc3Npb25zXG5cbiAgICBleHBzOiAocnVsZSwgdG9rZW5zLCBzdG9wKSAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIGVtcHR5IHRva2Vuc1xuICAgICAgICBcbiAgICAgICAgQHNoZWFwUHVzaCAnZXhwcycgcnVsZVxuXG4gICAgICAgIGVzID0gW11cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICB3aGlsZSB0b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIG51bVRva2VucyA9IHRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgYiA9IHN3aXRjaCBAc3RhY2tbLTFdXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB3aGVuICdvbmVhcmcnICAgICAgIHRoZW4gZXMubGVuZ3RoXG4gICAgICAgICAgICAgICAgd2hlbiAnaWYnICdzd2l0Y2gnICB0aGVuIHRva2Vuc1swXS50ZXh0ID09ICdlbHNlJ1xuICAgICAgICAgICAgICAgIHdoZW4gJ1snICAgICAgICAgICAgdGhlbiB0b2tlbnNbMF0udGV4dCA9PSAnXScgICMgYW5kIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICAgICAgd2hlbiAnY2FsbCcgICAgICAgICB0aGVuIHRva2Vuc1swXS50ZXh0IGluICddOycgYW5kIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICAgICAgd2hlbiAneycgICAgICAgICAgICB0aGVuIHRva2Vuc1swXS50ZXh0IGluICd9OycgYW5kIHRva2Vucy5zaGlmdCgpICMgaSBrbm93LCBpdCdzIGEgcGFpbiwgYnV0IHdlIHNob3VsZG4ndCBzaGlmdCB9IGhlcmUhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgd2h5IGJyZWFrIG9uIDsgaW5zdGVhZCBvZiBiYWlsaW5nIG91dCB3aXRoIGFuIGVycm9yP1xuICAgICAgICAgICAgICAgIHdoZW4gcnVsZSAgICAgICAgICAgdGhlbiB0b2tlbnNbMF0udGV4dCA9PSBzdG9wICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBlbHNlIGZhbHNlXG5cbiAgICAgICAgICAgIGlmIGJcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBicmVhayBmb3Igc3RhY2sgdG9wJyBAc3RhY2tcbiAgICAgICAgICAgICAgICBicmVhayBcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0udHlwZSA9PSAnYmxvY2snXG4gICAgXG4gICAgICAgICAgICAgICAgYmxvY2sgPSB0b2tlbnMuc2hpZnQoKVxuICAgIFxuICAgICAgICAgICAgICAgIEB2ZXJiIFwiZXhwcyBibG9jayBzdGFydFwiIGJsb2NrXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICMgd2hpbGUgYmxvY2sudG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAjIGVzID0gZXMuY29uY2F0IEBleHBzICdleHBzIGJsb2NrJyBibG9jay50b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZXMgPSBlcy5jb25jYXQgQGV4cHMgJ2V4cHMgYmxvY2snIGJsb2NrLnRva2VucyAgICAgICAgICAgICAgICAgICAgXG5cbiAgICAgICAgICAgICAgICBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ25sJyBcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgXCJleHBzIGJsb2NrIGVuZCBzaGlmdCBubFwiIFxuICAgICAgICAgICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJywnXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiIFwiZXhwcyBibG9jayBlbmQgc2hpZnQgLFwiXG4gICAgICAgICAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEB2ZXJiICdleHBzIGJsb2NrIGVuZCAuLi5jb250aW51ZS4uLidcbiAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHRva2Vuc1swXS50eXBlID09ICdibG9jaycgXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgYnJlYWsgb24gYmxvY2snXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHRva2Vuc1swXS50ZXh0ID09ICcpJ1xuICAgICAgICAgICAgICAgIEB2ZXJiICdleHBzIGJyZWFrIG9uICknXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHJ1bGUgPT0gJ2ZvciB2YWxzJyBhbmQgdG9rZW5zWzBdLnRleHQgaW4gWydpbicnb2YnXVxuICAgICAgICAgICAgICAgIEB2ZXJiICdleHBzIGJyZWFrIG9uIGlufG9mJ1xuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0udHlwZSA9PSAnbmwnIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEB2ZXJiICdleHBzIG5sIHN0b3A6JyBzdG9wLCB0b2tlbnNbMF0sIEBzdGFja1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBAc3RhY2tbLTFdID09ICdbJyBhbmQgdG9rZW5zWzFdPy50ZXh0ID09ICddJ1xuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBubCBpbiBhcnJheSAoc2hpZnQgYW5kIGJyZWFrKSdcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgc3RvcFxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBubCB3aXRoIHN0b3AnIFxuICAgICAgICAgICAgICAgICAgICBpZiBAc3RhY2tbLTFdID09ICdjYWxsJ1xuICAgICAgICAgICAgICAgICAgICAgICAgQHZlcmIgXCJleHBzIG5sIHdpdGggc3RvcCBpbiBjYWxsIChicmVhaywgYnV0IGRvbid0IHNoaWZ0IG5sKVwiXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIEB2ZXJiICdleHBzIG5sIHdpdGggc3RvcCAoc2hpZnQgYW5kIGJyZWFrKScgXG4gICAgICAgICAgICAgICAgICAgICAgICB0b2tlbnMuc2hpZnQoKSBcbiAgICAgICAgICAgICAgICAgICAgYnJlYWsgXG5cbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBubCBzaGlmdCBhbmQgLi4uJyAgICAgXG4gICAgICAgICAgICAgICAgbmwgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnLicgYW5kIHRva2Vuc1sxXT8udHlwZSA9PSAndmFyJ1xuICAgICAgICAgICAgICAgICAgICBsb2cgJ2V4cHMgbmwgbmV4dCBsaW5lIHN0YXJ0cyB3aXRoIC52YXIhJ1xuICAgICAgICAgICAgICAgICAgICBlcy5wdXNoIEBwcm9wIGVzLnBvcCgpLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgIyBsb2cgJ3Rva2Vuc1swXS5jb2wnIHRva2Vuc1swXS5jb2xcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBubCBjb250aW51ZS4uLicgXG4gICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGV4ID0gQGV4cCB0b2tlbnNcbiAgICAgICAgICAgIGVzLnB1c2ggZXhcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbnVtVG9rZW5zID09IHRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgICAgICBlcnJvciAnZXhwcyBubyB0b2tlbiBjb25zdW1lZD8nXG4gICAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICBAc2hlYXBQb3AgJ2V4cHMnIHJ1bGVcbiAgICAgICAgXG4gICAgICAgIGVzXG5cbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMFxuXG4gICAgIyBjb25zdW1lcyB0b2tlbnMgYW5kIHJldHVybnMgYSBzaW5nbGUgZXhwcmVzc2lvblxuXG4gICAgZXhwOiAodG9rZW5zKSAtPlxuXG4gICAgICAgIHJldHVybiBpZiBlbXB0eSB0b2tlbnNcblxuICAgICAgICB0b2sgPSB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgIGxvZyBZNSB3MSB0b2s/LnRleHQgaWYgQGRlYnVnXG4gICAgICAgIFxuICAgICAgICAjIHRoaXMgYXNzdW1lcyB0aGF0IHRoZSBoYW5kbGluZyBvZiBsaXN0cyBvZiBleHByZXNzaW9ucyBpcyBkb25lIGluIGV4cHMgYW5kXG4gICAgICAgICMgc2lsZW50bHkgc2tpcHMgb3ZlciBsZWFkaW5nIHNlcGFyYXRpbmcgdG9rZW5zIGxpa2UgY29tbWF0YXMsIHNlbWljb2xvbnMgYW5kIG5sLlxuXG4gICAgICAgIHN3aXRjaCB0b2sudHlwZVxuICAgICAgICAgICAgd2hlbiAnYmxvY2snICAgICAgICAgICAgdGhlbiByZXR1cm4gZXJyb3IgXCJJTlRFUk5BTCBFUlJPUjogdW5leHBlY3RlZCBibG9jayB0b2tlbiBpbiBleHAhXCJcbiAgICAgICAgICAgIHdoZW4gJ25sJyAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEB2ZXJiICdleHAgc3RhcnQgc2hpZnQgbmwhJ1xuICAgICAgICAgICAgICAgIHJldHVybiBAZXhwIHRva2VucyAjIHNraXAgbmxcbiAgICAgICAgICAgIHdoZW4gJ2tleXdvcmQnXG4gICAgICAgICAgICAgICAgc3dpdGNoIHRvay50ZXh0IFxuICAgICAgICAgICAgICAgICAgICB3aGVuICdpZicgICAgICAgdGhlbiByZXR1cm4gQGlmICAgICB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICB3aGVuICdmb3InICAgICAgdGhlbiByZXR1cm4gQGZvciAgICB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICB3aGVuICd3aGlsZScgICAgdGhlbiByZXR1cm4gQHdoaWxlICB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICB3aGVuICdzd2l0Y2gnICAgdGhlbiByZXR1cm4gQHN3aXRjaCB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICB3aGVuICd3aGVuJyAgICAgdGhlbiByZXR1cm4gQHdoZW4gICB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICB3aGVuICdjbGFzcycgICAgdGhlbiByZXR1cm4gQGNsYXNzICB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICB3aGVuICdyZXR1cm4nICAgdGhlbiByZXR1cm4gQHJldHVybiB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHN3aXRjaCB0b2sudGV4dCBcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnLT4nICc9PicgIHRoZW4gcmV0dXJuIEBmdW5jIG51bGwsIHRvaywgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJzsnICAgICAgICB0aGVuIHJldHVybiBAZXhwIHRva2VucyAjIHNraXAgO1xuICAgICAgICAgICAgICAgICAgICB3aGVuICcsJyAgICAgICAgdGhlbiByZXR1cm4gQGV4cCB0b2tlbnMgIyBza2lwICxcblxuICAgICAgICAjIyNcbiAgICAgICAgaGVyZSBjb21lcyB0aGUgaGFpcnkgcGFydCA6LSlcbiAgICAgICAgXG4gICAgICAgIGNvbWJpbmUgaW5mb3JtYXRpb24gYWJvdXQgdGhlIHJ1bGUgc3RhY2ssIGN1cnJlbnQgYW5kIGZ1dHVyZSB0b2tlbnNcbiAgICAgICAgdG8gZmlndXJlIG91dCB3aGVuIHRoZSBleHByZXNzaW9uIGVuZHNcbiAgICAgICAgIyMjXG5cbiAgICAgICAgQHNoZWFwUHVzaCAnZXhwJyB0b2sudGV4dCA/IHRvay50eXBlXG4gICAgICAgIFxuICAgICAgICAjIGUgPSB0b2tlbjp0b2tcbiAgICAgICAgZSA9IHRva1xuICAgICAgICBcbiAgICAgICAgd2hpbGUgbnh0ID0gdG9rZW5zWzBdXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIG51bVRva2VucyA9IHRva2Vucy5sZW5ndGhcblxuICAgICAgICAgICAgaWYgbm90IGUgdGhlbiByZXR1cm4gZXJyb3IgJ25vIGU/JyBueHRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgZS5jb2w/XG4gICAgICAgICAgICAgICAgbGFzdCA9IGUuY29sK2UudGV4dD8ubGVuZ3RoXG4gICAgICAgICAgICBlbHNlIGlmIE9iamVjdC52YWx1ZXMoZSlbMF0/LmNsb3NlPy5jb2w/XG4gICAgICAgICAgICAgICAgbGFzdCA9IE9iamVjdC52YWx1ZXMoZSlbMF0uY2xvc2UuY29sK09iamVjdC52YWx1ZXMoZSlbMF0uY2xvc2UudGV4dD8ubGVuZ3RoXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbGFzdCA9IC0xXG4gICAgICAgICAgICAgICAgIyBAdmVyYiAnZXhwIG5vIGxhc3Q/IGU6JyBlXG4gICAgICAgICAgICAjIEB2ZXJiICdleHAgbGFzdCBuZXh0JyBsYXN0LCBueHQuY29sXG5cbiAgICAgICAgICAgIGlmIEBzdGFja1stMV0gPT0gJ29uZWFyZycgYW5kIG54dC50eXBlIGluIFsnb3AnXVxuICAgICAgICAgICAgICAgIEB2ZXJiICdleHAgYnJlYWsgZm9yIG9uZWFyZydcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBueHQudHlwZSA9PSAnb3AnIGFuZCBueHQudGV4dCBub3QgaW4gWycrKycgJy0tJyAnKycgJy0nXSBhbmQgZS50ZXh0IG5vdCBpbiBbJ1snICcoJ10gYW5kICdvbmVhcmcnIG5vdCBpbiBAc3RhY2tcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIGlzIGxocyBvZiBvcCcgZSwgbnh0XG4gICAgICAgICAgICAgICAgZSA9IEBvcGVyYXRpb24gZSwgdG9rZW5zLnNoaWZ0KCksIHRva2Vuc1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZSBpZiAoXG4gICAgICAgICAgICAgICAgICAgIG54dC50eXBlID09ICdvcCcgYW5kIFxuICAgICAgICAgICAgICAgICAgICBueHQudGV4dCBpbiBbJysnICctJ10gYW5kIFxuICAgICAgICAgICAgICAgICAgICBlLnRleHQgbm90IGluIFsnWycgJygnXSBhbmRcbiAgICAgICAgICAgICAgICAgICAgbGFzdCA8IG54dC5jb2wgYW5kIHRva2Vuc1sxXT8uY29sID4gbnh0LmNvbCtueHQudGV4dC5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIEB2ZXJiICdleHAgaXMgbGhzIG9mICstXFxzJyBlLCBueHRcbiAgICAgICAgICAgICAgICBlID0gQG9wZXJhdGlvbiBlLCB0b2tlbnMuc2hpZnQoKSwgdG9rZW5zXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnR5cGUgPT0gJ2Z1bmMnIGFuZCBlLnBhcmVuc1xuICAgICAgICAgICAgICAgIGYgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgIEB2ZXJiICdleHAgZnVuYyBmb3IgZScgZVxuICAgICAgICAgICAgICAgIGUgPSBAZnVuYyBlLCBmLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQgPT0gJygnXG4gICAgICAgICAgICAgICAgaWYgbnh0LmNvbCA9PSBsYXN0XG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdleHAgaXMgbGhzIG9mIGNhbGwnXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAY2FsbCBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdleHAgaXMgb3BlbiBwYXJlbidcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBwYXJlbnMgdG9rLCB0b2tlbnNcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQgPT0gJ1snIGFuZCBueHQuY29sID09IGxhc3QgYW5kIHRva2Vuc1sxXT8udGV4dCAhPSAnXScgYW5kIGUudGV4dCAhPSAnWydcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIGlzIGxocyBvZiBpbmRleCcgZVxuICAgICAgICAgICAgICAgIGUgPSBAaW5kZXggZSwgdG9rZW5zXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0ID09ICc/JyBhbmQgbGFzdCA9PSBueHQuY29sIGFuZCB0b2tlbnNbMV0/LnRleHQgPT0gJy4nXG4gICAgICAgICAgICAgICAgcW1hcmsgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgIGUgPSBAcHJvcCBlLCB0b2tlbnMsIHFtYXJrXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0ID09ICcuJ1xuICAgICAgICAgICAgICAgIGUgPSBAcHJvcCBlLCB0b2tlbnNcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQgPT0gJzonXG4gICAgICAgICAgICAgICAgaWYgQHN0YWNrWy0xXSAhPSAneydcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBpcyBmaXJzdCBrZXkgb2YgaW1wbGljaXQgb2JqZWN0JyBlXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAb2JqZWN0IGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBpcyBrZXkgb2YgKGltcGxpY2l0KSBvYmplY3QnIGVcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBrZXl2YWwgZSwgdG9rZW5zXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50eXBlID09ICdrZXl3b3JkJyBhbmQgbnh0LnRleHQgPT0gJ2luJyBhbmQgQHN0YWNrWy0xXSAhPSAnZm9yJ1xuICAgICAgICAgICAgICAgIGUgPSBAaW5jb25kIGUsIHRva2Vuc1xuICAgICAgICAgICAgZWxzZSBpZiBlLnRleHQ/XG4gICAgICAgICAgICAgICAgaWYgZS50ZXh0ID09ICcoJ1xuICAgICAgICAgICAgICAgICAgICBlID0gQHBhcmVucyBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGUudGV4dCA9PSAnWydcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBhcnJheSBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGUudGV4dCA9PSAneydcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBjdXJseSBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGUudGV4dCBpbiBbJysnJy0nJysrJyctLSddIGFuZCBsYXN0ID09IG54dC5jb2xcbiAgICAgICAgICAgICAgICAgICAgaWYgbnh0LnR5cGUgbm90IGluIFsndmFyJydwYXJlbiddIGFuZCBlLnRleHQgaW4gWycrKycnLS0nXVxuICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yICd3cm9uZyBsaHMgaW5jcmVtZW50JyBlLCBueHRcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnbGhzIG51bGwgb3BlcmF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICBlID0gQG9wZXJhdGlvbiBudWxsLCBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgaWYgZS5vcGVyYXRpb24ucmhzPy5vcGVyYXRpb24/Lm9wZXJhdG9yPy50ZXh0IGluIFsnKysnJy0tJ11cbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yICdsZWZ0IGFuZCByaWdodCBzaWRlIGluY3JlbWVudCdcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQgaW4gWycrKycnLS0nXSBhbmQgbGFzdCA9PSBueHQuY29sXG4gICAgICAgICAgICAgICAgICAgIGlmIGUudHlwZSBub3QgaW4gWyd2YXInXVxuICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yICd3cm9uZyByaHMgaW5jcmVtZW50J1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAb3BlcmF0aW9uIGUsIHRva2Vucy5zaGlmdCgpIFxuICAgICAgICAgICAgICAgIGVsc2UgaWYgbnh0LnR5cGUgPT0gJ2RvdHMnIGFuZCBlLnR5cGUgaW4gWyd2YXInICdudW0nXVxuICAgICAgICAgICAgICAgICAgICBlID0gQHNsaWNlIGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgQHN0YWNrWy0xXSA9PSAnWycgYW5kIG54dC50ZXh0ID09ICddJ1xuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIGFycmF5IGVuZCdcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIEBzdGFja1stMV0gPT0gJ3snIGFuZCBueHQudGV4dCA9PSAnfSdcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBjdXJseSBlbmQnXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0IDwgbnh0LmNvbCBhbmRcbiAgICAgICAgICAgICAgICAgICAgICAgIG54dC50ZXh0IG5vdCBpbiAnKV19LDs6LicgYW5kIFxuICAgICAgICAgICAgICAgICAgICAgICAgbnh0LnRleHQgbm90IGluIFsndGhlbicgJ2Vsc2UnICdicmVhaycgJ2NvbnRpbnVlJyAnaW4nICdvZiddIGFuZCBcbiAgICAgICAgICAgICAgICAgICAgICAgIG54dC50eXBlIG5vdCBpbiBbJ25sJ10gYW5kIFxuICAgICAgICAgICAgICAgICAgICAgICAgKGUudHlwZSBub3QgaW4gWydudW0nICdzaW5nbGUnICdkb3VibGUnICd0cmlwbGUnICdyZWdleCcgJ3B1bmN0JyAnY29tbWVudCcgJ29wJ10pIGFuZCBcbiAgICAgICAgICAgICAgICAgICAgICAgIChlLnRleHQgbm90IGluIFsnbnVsbCcgJ3VuZGVmaW5lZCcgJ0luZmluaXR5JyAnTmFOJyAndHJ1ZScgJ2ZhbHNlJyAneWVzJyAnbm8nXSkgYW5kIFxuICAgICAgICAgICAgICAgICAgICAgICAgKGUudHlwZSAhPSAna2V5d29yZCcgb3IgKGUudGV4dCBpbiBbJ25ldycgJ3JlcXVpcmUnICd0eXBlb2YnICdkZWxldGUnXSkpIGFuZCBcbiAgICAgICAgICAgICAgICAgICAgICAgICgoQHN0YWNrWy0xXSBub3QgaW4gWydpZicgJ2ZvciddKSBvciBueHQubGluZSA9PSBlLmxpbmUpIGFuZCBcbiAgICAgICAgICAgICAgICAgICAgICAgICdvbmVhcmcnIG5vdCBpbiBAc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBpcyBsaHMgb2YgaW1wbGljaXQgY2FsbCEgZScgZSwgQHN0YWNrWy0xXVxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnICAgIGlzIGxocyBvZiBpbXBsaWNpdCBjYWxsISBueHQnIG54dFxuICAgICAgICAgICAgICAgICAgICBlID0gQGNhbGwgZSwgdG9rZW5zXG5cbiAgICAgICAgICAgICAgICBlbHNlIGlmIG54dC50eXBlID09ICdvcCcgYW5kIG54dC50ZXh0IGluIFsnKycgJy0nXSBhbmQgZS50ZXh0IG5vdCBpbiBbJ1snICcoJ11cbiAgICAgICAgICAgICAgICAgICAgaWYgbGFzdCA8IG54dC5jb2wgYW5kIHRva2Vuc1sxXT8uY29sID09IG54dC5jb2wrbnh0LnRleHQubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIG9wIGlzIHVuYmFsYW5jZWQgKy0gYnJlYWsuLi4nIGUsIG54dCwgQHN0YWNrXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIGlzIGxocyBvZiBvcCcgZSwgbnh0XG4gICAgICAgICAgICAgICAgICAgIGUgPSBAb3BlcmF0aW9uIGUsIHRva2Vucy5zaGlmdCgpLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBwcmludC50b2tlbnMgXCJleHAgbm8gbnh0IG1hdGNoPyBicmVhayEgc3RhY2s6I3tAc3RhY2t9IG54dDpcIiBbbnh0XSBpZiBAdmVyYm9zZVxuICAgICAgICAgICAgICAgICAgICBicmVhayAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZSAjIGlmIGUgaXMgbm90IGEgdG9rZW4gYW55bW9yZVxuICAgICAgICAgICAgICAgIGlmIG54dC50ZXh0IGluIFsnKysnJy0tJ10gYW5kIGxhc3QgPT0gbnh0LmNvbFxuICAgICAgICAgICAgICAgICAgICBlID0gQG9wZXJhdGlvbiBlLCB0b2tlbnMuc2hpZnQoKSAjIG1pc3NpbmcgYnJlYWsgaGVyZT9cbiAgICAgICAgICAgICAgICBlbHNlIGlmIG54dC50eXBlID09ICdkb3RzJyBhbmQgQHN0YWNrWy0xXSBub3QgaW4gJy4nXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAc2xpY2UgZSwgdG9rZW5zICMgbWlzc2luZyBicmVhayBoZXJlP1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgQHN0YWNrWy0xXSA9PSAnY2FsbCcgYW5kIG54dC50ZXh0ID09ICddJ1xuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIGNhbGwgYXJyYXkgZW5kJ1xuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgQHN0YWNrWy0xXSA9PSAnWycgYW5kIG54dC50ZXh0ID09ICddJ1xuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIFsgYXJyYXkgZW5kJyBueHRcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGlmIEB2ZXJib3NlXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmludC5hc3QgXCJleHAgbm8gbnh0IG1hdGNoPz8gc3RhY2s6I3tAc3RhY2t9IGU6XCIgZVxuICAgICAgICAgICAgICAgICAgICAgICAgcHJpbnQudG9rZW5zIFwiZXhwIG5vIG54dCBtYXRjaD8/IG54dDpcIiBueHRcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBudW1Ub2tlbnMgPT0gdG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgICAgIGVycm9yICdleHAgbm8gdG9rZW4gY29uc3VtZWQ/J1xuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgIFxuICAgICAgICBpZiBueHQgPSB0b2tlbnNbMF1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgZW1wdHkgQHN0YWNrXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBlbXB0eSBzdGFjayBueHQnIG54dFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgbnh0LnRleHQgPT0gJ1snIGFuZCB0b2tlbnNbMV0/LnRleHQgIT0gJ10nXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdleHAgaXMgbGFzdCBtaW51dGUgbGhzIG9mIGluZGV4JyBlXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAaW5kZXggZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICMgaW1wbGVtZW50IG51bGwgY2hlY2tzIGhlcmUhXG4gICAgICAgIGVsc2UgXG4gICAgICAgICAgICBAdmVyYiAnZXhwIGVuZCBubyBueHQhJ1xuICAgICAgICAgICAgXG4gICAgICAgIHByaW50LmFzdCBcImV4cCAje2lmIGVtcHR5KEBzdGFjaykgdGhlbiAnRE9ORScgZWxzZSAnJ31cIiBlIGlmIEB2ZXJib3NlXG4gICAgICAgIFxuICAgICAgICBAc2hlYXBQb3AgJ2V4cCcgdG9rLnRleHQgPyB0b2sudHlwZVxuXG4gICAgICAgIGVcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwIFxuICAgICMgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwIFxuICAgIFxuICAgIHRoZW46IChpZCwgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICd0aGVuJ1xuICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIG5sID0gJ25sJ1xuICAgICAgICBlbHNlIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnYmxvY2snXG4gICAgICAgICAgICBibG9jayA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ25sJ1xuICAgICAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICB0b2tlbnMgPSBibG9jay50b2tlbnNcbiAgICAgICAgICAgIG5sID0gbnVsbFxuICAgICAgICBlbHNlIFxuICAgICAgICAgICAgZXJyb3IgXCIje2lkfTogdGhlbiBvciBibG9jayBleHBlY3RlZCFcIlxuXG4gICAgICAgIHRobiA9IEBleHBzIGlkLCB0b2tlbnMsIG5sXG4gICAgICAgIFxuICAgICAgICBpZiBibG9jayBhbmQgYmxvY2sudG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgcHJpbnQudG9rZW5zICdkYW5nbGluZyB0aGVuIHRva2VucycgdG9rZW5zXG4gICAgICAgICAgICBcbiAgICAgICAgdGhuXG4gICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIGJsb2NrOiAoaWQsIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnYmxvY2snXG4gICAgICAgICAgICBibG9jayA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ25sJ1xuICAgICAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICB0b2tlbnMgPSBibG9jay50b2tlbnNcbiAgICAgICAgICAgIG5sID0gbnVsbFxuICAgICAgICBlbHNlIFxuICAgICAgICAgICAgbmwgPSAnbmwnXG4gICAgICAgICAgICBcbiAgICAgICAgZXhwcyA9IEBleHBzIGlkLCB0b2tlbnMsIG5sXG5cbiAgICAgICAgaWYgYmxvY2sgYW5kIGJsb2NrLnRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgIHByaW50LnRva2VucyAnZGFuZ2xpbmcgYmxvY2sgdG9rZW5zJyB0b2tlbnNcbiAgICAgICAgICAgIFxuICAgICAgICBleHBzXG4gICAgICAgIFxuICAgIGJsb2NrRXhwOiAoaWQsIHRva2VucykgLT5cbiAgICAgICAgQHZlcmIgXCJibG9ja0V4cCAje2lkfVwiXG4gICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnYmxvY2snXG4gICAgICAgICAgICBibG9jayA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICAjIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnbmwnIHRoZW4gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIEBleHAgYmxvY2sudG9rZW5zXG4gICAgICAgIGVsc2UgXG4gICAgICAgICAgICBAZXhwIHRva2Vuc1xuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgICBcbiAgICBcbiAgICBzaGVhcFB1c2g6ICh0eXBlLCB0ZXh0KSAtPlxuICAgICAgICBcbiAgICAgICAgQHNoZWFwLnB1c2ggdHlwZTp0eXBlLCB0ZXh0OnRleHRcbiAgICAgICAgcHJpbnQuc2hlYXAgQHNoZWFwIGlmIEB2ZXJib3NlXG4gICAgICAgIFxuICAgIHNoZWFwUG9wOiAobSwgdCkgLT5cbiAgICAgICAgXG4gICAgICAgIHBvcHBlZCA9IEBzaGVhcC5wb3AoKVxuICAgICAgICBpZiBwb3BwZWQudGV4dCAhPSB0IHRoZW4gZXJyb3IgJ3dyb25nIHBvcD8nIHBvcHBlZC50ZXh0LCB0XG4gICAgICAgIHByaW50LnNoZWFwIEBzaGVhcCwgcG9wcGVkIGlmIEB2ZXJib3NlXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIFxuICAgICMgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG5cbiAgICBwdXNoOiAobm9kZSkgLT5cblxuICAgICAgICBwcmludC5zdGFjayBAc3RhY2ssIG5vZGUgaWYgQHZlcmJvc2VcbiAgICAgICAgQHN0YWNrLnB1c2ggbm9kZVxuXG4gICAgcG9wOiAobikgLT5cbiAgICAgICAgcCA9IEBzdGFjay5wb3AoKVxuICAgICAgICBpZiBwICE9IG5cbiAgICAgICAgICAgIGVycm9yIFwidW5leHBlY3RlZCBwb3AhXCIgcCwgblxuICAgICAgICBpZiBAdmVyYm9zZVxuICAgICAgICAgICAgcHJpbnQuc3RhY2sgQHN0YWNrLCBwLCAocykgLT4gVzEgdzEgc1xuXG4gICAgdmVyYjogLT5cblxuICAgICAgICBpZiBAdmVyYm9zZVxuICAgICAgICAgICAgY29uc29sZS5sb2cuYXBwbHkgY29uc29sZS5sb2csIGFyZ3VtZW50c1xuICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gUGFyc2VcbiJdfQ==
//# sourceURL=../coffee/parse.coffee