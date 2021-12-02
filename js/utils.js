// koffee 1.20.0

/*
000   000  000000000  000  000       0000000    
000   000     000     000  000      000         
000   000     000     000  000      0000000     
000   000     000     000  000           000    
 0000000      000     000  0000000  0000000
 */
var empty, firstLineCol, lastLineCol;

empty = function(a) {
    return (a === '' || a === null || a === (void 0)) || (typeof a === 'object' && Object.keys(a).length === 0);
};

lastLineCol = function(e) {
    var cols, ref;
    if ((e != null ? e.col : void 0) != null) {
        return {
            line: e.line,
            col: e.col + ((ref = e.text) != null ? ref.length : void 0)
        };
    } else if ((e != null) && e instanceof Object) {
        cols = Object.values(e).map(lastLineCol);
        if (!empty(cols)) {
            return cols.reduce(function(a, b) {
                if (a.line > b.line) {
                    return a;
                } else if (a.line === b.line) {
                    if (a.col > b.col) {
                        return a;
                    } else {
                        return b;
                    }
                } else {
                    return b;
                }
            });
        }
    }
    return {
        line: 1,
        col: 0
    };
};

firstLineCol = function(e) {
    var cols;
    if ((e != null ? e.col : void 0) != null) {
        return {
            line: e.line,
            col: e.col
        };
    } else if ((e != null) && e instanceof Object) {
        cols = Object.values(e).map(firstLineCol);
        if (!empty(cols)) {
            return cols.reduce(function(a, b) {
                if (a.line < b.line) {
                    return a;
                } else if (a.line === b.line) {
                    if (a.col < b.col) {
                        return a;
                    } else {
                        return b;
                    }
                } else {
                    return b;
                }
            });
        }
    }
    return {
        line: 2e308,
        col: 2e308
    };
};

module.exports = {
    firstLineCol: firstLineCol,
    lastLineCol: lastLineCol,
    empty: empty
};
