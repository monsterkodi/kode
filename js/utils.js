// koffee 1.14.0

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJ1dGlscy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBY0EsS0FBQSxHQUFRLFNBQUMsQ0FBRDtXQUFPLENBQUEsQ0FBQSxLQUFNLEVBQU4sSUFBQSxDQUFBLEtBQVMsSUFBVCxJQUFBLENBQUEsS0FBYyxRQUFkLENBQUEsSUFBNEIsQ0FBQyxPQUFPLENBQVAsS0FBYSxRQUFiLElBQTBCLE1BQU0sQ0FBQyxJQUFQLENBQVksQ0FBWixDQUFjLENBQUMsTUFBZixLQUF5QixDQUFwRDtBQUFuQzs7QUFRUixXQUFBLEdBQWMsU0FBQyxDQUFEO0FBRVYsUUFBQTtJQUFBLElBQUcsb0NBQUg7QUFDSSxlQUNJO1lBQUEsSUFBQSxFQUFNLENBQUMsQ0FBQyxJQUFSO1lBQ0EsR0FBQSxFQUFNLENBQUMsQ0FBQyxHQUFGLGdDQUFZLENBQUUsZ0JBRHBCO1VBRlI7S0FBQSxNQUlLLElBQUcsV0FBQSxJQUFPLENBQUEsWUFBYSxNQUF2QjtRQUNELElBQUEsR0FBTyxNQUFNLENBQUMsTUFBUCxDQUFjLENBQWQsQ0FBZ0IsQ0FBQyxHQUFqQixDQUFxQixXQUFyQjtRQUNQLElBQUcsQ0FBSSxLQUFBLENBQU0sSUFBTixDQUFQO0FBQ0ksbUJBQU8sSUFBSSxDQUFDLE1BQUwsQ0FBWSxTQUFDLENBQUQsRUFBRyxDQUFIO2dCQUNmLElBQUcsQ0FBQyxDQUFDLElBQUYsR0FBUyxDQUFDLENBQUMsSUFBZDsyQkFBd0IsRUFBeEI7aUJBQUEsTUFDSyxJQUFHLENBQUMsQ0FBQyxJQUFGLEtBQVUsQ0FBQyxDQUFDLElBQWY7b0JBQ0QsSUFBRyxDQUFDLENBQUMsR0FBRixHQUFRLENBQUMsQ0FBQyxHQUFiOytCQUFzQixFQUF0QjtxQkFBQSxNQUFBOytCQUE2QixFQUE3QjtxQkFEQztpQkFBQSxNQUFBOzJCQUVBLEVBRkE7O1lBRlUsQ0FBWixFQURYO1NBRkM7O1dBUUw7UUFBQSxJQUFBLEVBQUssQ0FBTDtRQUNBLEdBQUEsRUFBSyxDQURMOztBQWRVOztBQXVCZCxZQUFBLEdBQWUsU0FBQyxDQUFEO0FBRVgsUUFBQTtJQUFBLElBQUcsb0NBQUg7QUFDSSxlQUNJO1lBQUEsSUFBQSxFQUFNLENBQUMsQ0FBQyxJQUFSO1lBQ0EsR0FBQSxFQUFNLENBQUMsQ0FBQyxHQURSO1VBRlI7S0FBQSxNQUlLLElBQUcsV0FBQSxJQUFPLENBQUEsWUFBYSxNQUF2QjtRQUNELElBQUEsR0FBTyxNQUFNLENBQUMsTUFBUCxDQUFjLENBQWQsQ0FBZ0IsQ0FBQyxHQUFqQixDQUFxQixZQUFyQjtRQUNQLElBQUcsQ0FBSSxLQUFBLENBQU0sSUFBTixDQUFQO0FBQ0ksbUJBQU8sSUFBSSxDQUFDLE1BQUwsQ0FBWSxTQUFDLENBQUQsRUFBRyxDQUFIO2dCQUNmLElBQUcsQ0FBQyxDQUFDLElBQUYsR0FBUyxDQUFDLENBQUMsSUFBZDsyQkFBd0IsRUFBeEI7aUJBQUEsTUFDSyxJQUFHLENBQUMsQ0FBQyxJQUFGLEtBQVUsQ0FBQyxDQUFDLElBQWY7b0JBQ0QsSUFBRyxDQUFDLENBQUMsR0FBRixHQUFRLENBQUMsQ0FBQyxHQUFiOytCQUFzQixFQUF0QjtxQkFBQSxNQUFBOytCQUE2QixFQUE3QjtxQkFEQztpQkFBQSxNQUFBOzJCQUVBLEVBRkE7O1lBRlUsQ0FBWixFQURYO1NBRkM7O1dBUUw7UUFBQSxJQUFBLEVBQUssS0FBTDtRQUNBLEdBQUEsRUFBSyxLQURMOztBQWRXOztBQWlCZixNQUFNLENBQUMsT0FBUCxHQUFpQjtJQUFFLGNBQUEsWUFBRjtJQUFnQixhQUFBLFdBQWhCO0lBQTZCLE9BQUEsS0FBN0IiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIFxuMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgICAgXG4wMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAgICAwMDAwMDAwICAgICBcbjAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgICAgICAgICAgMDAwICAgIFxuIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMCAgICAgXG4jIyNcblxuIyAwMDAwMDAwMCAgMDAgICAgIDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAwMDAgMDAwICAgXG4jIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgICAgMDAwICAgICAgIDAwMDAwICAgIFxuIyAwMDAgICAgICAgMDAwIDAgMDAwICAwMDAgICAgICAgICAgIDAwMCAgICAgICAgMDAwICAgICBcbiMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgICAwMDAgICAgICAgIDAwMCAgICAgXG5cbmVtcHR5ID0gKGEpIC0+IGEgaW4gWycnIG51bGwgdW5kZWZpbmVkXSBvciAodHlwZW9mKGEpID09ICdvYmplY3QnIGFuZCBPYmplY3Qua2V5cyhhKS5sZW5ndGggPT0gMClcblxuIyAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgXG4jIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICBcbiMgMDAwICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIFxuIyAwMDAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4jIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICBcblxubGFzdExpbmVDb2wgPSAoZSkgLT5cbiAgICBcbiAgICBpZiBlPy5jb2w/XG4gICAgICAgIHJldHVyblxuICAgICAgICAgICAgbGluZTogZS5saW5lXG4gICAgICAgICAgICBjb2w6ICBlLmNvbCtlLnRleHQ/Lmxlbmd0aFxuICAgIGVsc2UgaWYgZT8gYW5kIGUgaW5zdGFuY2VvZiBPYmplY3RcbiAgICAgICAgY29scyA9IE9iamVjdC52YWx1ZXMoZSkubWFwIGxhc3RMaW5lQ29sXG4gICAgICAgIGlmIG5vdCBlbXB0eSBjb2xzXG4gICAgICAgICAgICByZXR1cm4gY29scy5yZWR1Y2UgKGEsYikgLT4gXG4gICAgICAgICAgICAgICAgaWYgYS5saW5lID4gYi5saW5lIHRoZW4gYSBcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGEubGluZSA9PSBiLmxpbmVcbiAgICAgICAgICAgICAgICAgICAgaWYgYS5jb2wgPiBiLmNvbCB0aGVuIGEgZWxzZSBiXG4gICAgICAgICAgICAgICAgZWxzZSBiXG4gICAgbGluZToxXG4gICAgY29sOiAwXG5cbiMgMDAwMDAwMDAgIDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIFxuIyAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgICAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4jIDAwMDAwMCAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgICAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICBcbiMgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIFxuIyAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgXG5cbmZpcnN0TGluZUNvbCA9IChlKSAtPlxuICAgIFxuICAgIGlmIGU/LmNvbD9cbiAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICBsaW5lOiBlLmxpbmVcbiAgICAgICAgICAgIGNvbDogIGUuY29sXG4gICAgZWxzZSBpZiBlPyBhbmQgZSBpbnN0YW5jZW9mIE9iamVjdFxuICAgICAgICBjb2xzID0gT2JqZWN0LnZhbHVlcyhlKS5tYXAgZmlyc3RMaW5lQ29sXG4gICAgICAgIGlmIG5vdCBlbXB0eSBjb2xzXG4gICAgICAgICAgICByZXR1cm4gY29scy5yZWR1Y2UgKGEsYikgLT4gXG4gICAgICAgICAgICAgICAgaWYgYS5saW5lIDwgYi5saW5lIHRoZW4gYSBcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGEubGluZSA9PSBiLmxpbmVcbiAgICAgICAgICAgICAgICAgICAgaWYgYS5jb2wgPCBiLmNvbCB0aGVuIGEgZWxzZSBiXG4gICAgICAgICAgICAgICAgZWxzZSBiXG4gICAgbGluZTpJbmZpbml0eVxuICAgIGNvbDogSW5maW5pdHlcbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IHsgZmlyc3RMaW5lQ29sLCBsYXN0TGluZUNvbCwgZW1wdHkgfVxuIl19
//# sourceURL=../coffee/utils.coffee