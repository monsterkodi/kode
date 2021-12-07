// koffee 1.20.0

/*
000   000  000000000  000  000       0000000    
000   000     000     000  000      000         
000   000     000     000  000      0000000     
000   000     000     000  000           000    
 0000000      000     000  0000000  0000000
 */
var childp, empty, firstLineCol, lastLineCol, register, slash, valid;

childp = require('child_process');

slash = require('kslash');

empty = function(a) {
    return (a === '' || a === null || a === (void 0)) || (typeof a === 'object' && Object.keys(a).length === 0);
};

valid = function(a) {
    return !empty(a);
};


/*
00000000   00000000   0000000   000   0000000  000000000  00000000  00000000   
000   000  000       000        000  000          000     000       000   000  
0000000    0000000   000  0000  000  0000000      000     0000000   0000000    
000   000  000       000   000  000       000     000     000       000   000  
000   000  00000000   0000000   000  0000000      000     00000000  000   000
 */

register = function() {
    var Module, binary, fork, loadFile;
    loadFile = function(module, file) {
        var Kode, code, err, kode, result;
        try {
            Kode = require('./kode');
            kode = new Kode({
                header: true,
                files: [file],
                map: false
            });
            code = slash.readText(file);
            result = kode.compile(code);
            return module._compile(result, file);
        } catch (error) {
            err = error;
            console.error("error loading " + file + ":", code);
            throw err;
        }
    };
    if (require.extensions) {
        require.extensions['.kode'] = loadFile;
        require.extensions['.coffee'] = loadFile;
        Module = require('module');
        Module.prototype.load = function(file) {
            var ext;
            this.filename = file;
            this.paths = Module._nodeModulePaths(slash.dir(file));
            ext = '.' + slash.ext(file);
            Module._extensions[ext](this, file);
            return this.loaded = true;
        };
    }
    if (childp) {
        fork = childp.fork;
        binary = require.resolve('../bin/kode');
        return childp.fork = function(path, args, options) {
            var ref;
            if ((ref = slash.ext(path)) === 'kode' || ref === 'coffee') {
                if (!Array.isArray(args)) {
                    options = args || {};
                    args = [];
                }
                args = [path].concat(args);
                path = binary;
            }
            return fork(path, args, options);
        };
    }
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
        if (valid(cols)) {
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
        if (valid(cols)) {
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
    register: register,
    firstLineCol: firstLineCol,
    lastLineCol: lastLineCol,
    empty: empty,
    valid: valid
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJ1dGlscy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxlQUFSOztBQUNULEtBQUEsR0FBUyxPQUFBLENBQVEsUUFBUjs7QUFRVCxLQUFBLEdBQVEsU0FBQyxDQUFEO1dBQU8sQ0FBQSxDQUFBLEtBQU0sRUFBTixJQUFBLENBQUEsS0FBUyxJQUFULElBQUEsQ0FBQSxLQUFjLFFBQWQsQ0FBQSxJQUE0QixDQUFDLE9BQU8sQ0FBUCxLQUFhLFFBQWIsSUFBMEIsTUFBTSxDQUFDLElBQVAsQ0FBWSxDQUFaLENBQWMsQ0FBQyxNQUFmLEtBQXlCLENBQXBEO0FBQW5DOztBQUNSLEtBQUEsR0FBUSxTQUFDLENBQUQ7V0FBTyxDQUFJLEtBQUEsQ0FBTSxDQUFOO0FBQVg7OztBQUVSOzs7Ozs7OztBQVFBLFFBQUEsR0FBVyxTQUFBO0FBRVAsUUFBQTtJQUFBLFFBQUEsR0FBVyxTQUFDLE1BQUQsRUFBUyxJQUFUO0FBRVAsWUFBQTtBQUFBO1lBQ0ksSUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSO1lBQ1QsSUFBQSxHQUFTLElBQUksSUFBSixDQUFTO2dCQUFBLE1BQUEsRUFBTyxJQUFQO2dCQUFhLEtBQUEsRUFBTSxDQUFDLElBQUQsQ0FBbkI7Z0JBQTJCLEdBQUEsRUFBSSxLQUEvQjthQUFUO1lBQ1QsSUFBQSxHQUFTLEtBQUssQ0FBQyxRQUFOLENBQWUsSUFBZjtZQUNULE1BQUEsR0FBUyxJQUFJLENBQUMsT0FBTCxDQUFhLElBQWI7bUJBQ1QsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsTUFBaEIsRUFBd0IsSUFBeEIsRUFMSjtTQUFBLGFBQUE7WUFNTTtZQUNILE9BQUEsQ0FBQyxLQUFELENBQU8sZ0JBQUEsR0FBaUIsSUFBakIsR0FBc0IsR0FBN0IsRUFBZ0MsSUFBaEM7QUFDQyxrQkFBTSxJQVJW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QUFPLElBQUksQ0FBQyxNQUFMLENBQVksU0FBQyxDQUFELEVBQUcsQ0FBSDtnQkFDZixJQUFHLENBQUMsQ0FBQyxJQUFGLEdBQVMsQ0FBQyxDQUFDLElBQWQ7MkJBQXdCLEVBQXhCO2lCQUFBLE1BQ0ssSUFBRyxDQUFDLENBQUMsSUFBRixLQUFVLENBQUMsQ0FBQyxJQUFmO29CQUNELElBQUcsQ0FBQyxDQUFDLEdBQUYsR0FBUSxDQUFDLENBQUMsR0FBYjsrQkFBc0IsRUFBdEI7cUJBQUEsTUFBQTsrQkFBNkIsRUFBN0I7cUJBREM7aUJBQUEsTUFBQTsyQkFFQSxFQUZBOztZQUZVLENBQVosRUFEWDtTQUZDOztXQVFMO1FBQUEsSUFBQSxFQUFLLEtBQUw7UUFDQSxHQUFBLEVBQUssS0FETDs7QUFkVzs7QUFpQmYsTUFBTSxDQUFDLE9BQVAsR0FBaUI7SUFBRSxVQUFBLFFBQUY7SUFBWSxjQUFBLFlBQVo7SUFBMEIsYUFBQSxXQUExQjtJQUF1QyxPQUFBLEtBQXZDO0lBQThDLE9BQUEsS0FBOUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIFxuMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgICAgXG4wMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAgICAwMDAwMDAwICAgICBcbjAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgICAgICAgICAgMDAwICAgIFxuIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMCAgICAgXG4jIyNcblxuY2hpbGRwID0gcmVxdWlyZSAnY2hpbGRfcHJvY2VzcydcbnNsYXNoICA9IHJlcXVpcmUgJ2tzbGFzaCdcblxuIyAwMDAwMDAwMCAgMDAgICAgIDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAwMDAgMDAwICAgXG4jIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgICAgMDAwICAgICAgIDAwMDAwICAgIFxuIyAwMDAgICAgICAgMDAwIDAgMDAwICAwMDAgICAgICAgICAgIDAwMCAgICAgICAgMDAwICAgICBcbiMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgICAwMDAgICAgICAgIDAwMCAgICAgXG5cbmVtcHR5ID0gKGEpIC0+IGEgaW4gWycnIG51bGwgdW5kZWZpbmVkXSBvciAodHlwZW9mKGEpID09ICdvYmplY3QnIGFuZCBPYmplY3Qua2V5cyhhKS5sZW5ndGggPT0gMClcbnZhbGlkID0gKGEpIC0+IG5vdCBlbXB0eSBhXG5cbiMjI1xuMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuIyMjXG5cbnJlZ2lzdGVyID0gLT5cbiAgICBcbiAgICBsb2FkRmlsZSA9IChtb2R1bGUsIGZpbGUpIC0+XG4gICAgICAgIFxuICAgICAgICB0cnlcbiAgICAgICAgICAgIEtvZGUgICA9IHJlcXVpcmUgJy4va29kZSdcbiAgICAgICAgICAgIGtvZGUgICA9IG5ldyBLb2RlIGhlYWRlcjp0cnVlLCBmaWxlczpbZmlsZV0sIG1hcDpmYWxzZVxuICAgICAgICAgICAgY29kZSAgID0gc2xhc2gucmVhZFRleHQgZmlsZVxuICAgICAgICAgICAgcmVzdWx0ID0ga29kZS5jb21waWxlIGNvZGVcbiAgICAgICAgICAgIG1vZHVsZS5fY29tcGlsZSByZXN1bHQsIGZpbGVcbiAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICBlcnJvciBcImVycm9yIGxvYWRpbmcgI3tmaWxlfTpcIiBjb2RlXG4gICAgICAgICAgICB0aHJvdyBlcnJcbiAgICBcbiAgICBpZiByZXF1aXJlLmV4dGVuc2lvbnNcbiAgICAgICAgXG4gICAgICAgIHJlcXVpcmUuZXh0ZW5zaW9uc1snLmtvZGUnXSAgID0gbG9hZEZpbGVcbiAgICAgICAgcmVxdWlyZS5leHRlbnNpb25zWycuY29mZmVlJ10gPSBsb2FkRmlsZVxuICAgIFxuICAgICAgICBNb2R1bGUgPSByZXF1aXJlICdtb2R1bGUnXG4gICAgXG4gICAgICAgIE1vZHVsZS5wcm90b3R5cGUubG9hZCA9IChmaWxlKSAtPlxuICAgICAgICAgICAgQGZpbGVuYW1lID0gZmlsZVxuICAgICAgICAgICAgQHBhdGhzID0gTW9kdWxlLl9ub2RlTW9kdWxlUGF0aHMgc2xhc2guZGlyIGZpbGVcbiAgICAgICAgICAgIGV4dCA9ICcuJyArIHNsYXNoLmV4dCBmaWxlXG4gICAgICAgICAgICBNb2R1bGUuX2V4dGVuc2lvbnNbZXh0XShALCBmaWxlKVxuICAgICAgICAgICAgQGxvYWRlZCA9IHRydWVcbiAgICBcbiAgICBpZiBjaGlsZHBcbiAgICBcbiAgICAgICAgeyBmb3JrIH0gPSBjaGlsZHBcbiAgICAgICAgYmluYXJ5ID0gcmVxdWlyZS5yZXNvbHZlICcuLi9iaW4va29kZSdcbiAgICAgICAgXG4gICAgICAgIGNoaWxkcC5mb3JrID0gKHBhdGgsIGFyZ3MsIG9wdGlvbnMpIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHNsYXNoLmV4dChwYXRoKSBpbiBbJ2tvZGUnJ2NvZmZlZSddXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgbm90IEFycmF5LmlzQXJyYXkgYXJnc1xuICAgICAgICAgICAgICAgICAgICBvcHRpb25zID0gYXJncyBvciB7fVxuICAgICAgICAgICAgICAgICAgICBhcmdzID0gW11cbiAgICAgICAgICAgICAgICBhcmdzID0gW3BhdGhdLmNvbmNhdCBhcmdzXG4gICAgICAgICAgICAgICAgcGF0aCA9IGJpbmFyeVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZm9yayBwYXRoLCBhcmdzLCBvcHRpb25zXG5cbiMgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIFxuIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgICAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4jIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgICAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICBcbiMgMDAwICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIFxuIyAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgXG5cbmxhc3RMaW5lQ29sID0gKGUpIC0+XG4gICAgXG4gICAgaWYgZT8uY29sP1xuICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIGxpbmU6IGUubGluZVxuICAgICAgICAgICAgY29sOiAgZS5jb2wrZS50ZXh0Py5sZW5ndGhcbiAgICBlbHNlIGlmIGU/IGFuZCBlIGluc3RhbmNlb2YgT2JqZWN0XG4gICAgICAgIGNvbHMgPSBPYmplY3QudmFsdWVzKGUpLm1hcCBsYXN0TGluZUNvbFxuICAgICAgICBpZiB2YWxpZCBjb2xzXG4gICAgICAgICAgICByZXR1cm4gY29scy5yZWR1Y2UgKGEsYikgLT4gXG4gICAgICAgICAgICAgICAgaWYgYS5saW5lID4gYi5saW5lIHRoZW4gYSBcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGEubGluZSA9PSBiLmxpbmVcbiAgICAgICAgICAgICAgICAgICAgaWYgYS5jb2wgPiBiLmNvbCB0aGVuIGEgZWxzZSBiXG4gICAgICAgICAgICAgICAgZWxzZSBiXG4gICAgbGluZToxXG4gICAgY29sOiAwXG5cbiMgMDAwMDAwMDAgIDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIFxuIyAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgICAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4jIDAwMDAwMCAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgICAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICBcbiMgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIFxuIyAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgXG5cbmZpcnN0TGluZUNvbCA9IChlKSAtPlxuICAgIFxuICAgIGlmIGU/LmNvbD9cbiAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICBsaW5lOiBlLmxpbmVcbiAgICAgICAgICAgIGNvbDogIGUuY29sXG4gICAgZWxzZSBpZiBlPyBhbmQgZSBpbnN0YW5jZW9mIE9iamVjdFxuICAgICAgICBjb2xzID0gT2JqZWN0LnZhbHVlcyhlKS5tYXAgZmlyc3RMaW5lQ29sXG4gICAgICAgIGlmIHZhbGlkIGNvbHNcbiAgICAgICAgICAgIHJldHVybiBjb2xzLnJlZHVjZSAoYSxiKSAtPiBcbiAgICAgICAgICAgICAgICBpZiBhLmxpbmUgPCBiLmxpbmUgdGhlbiBhIFxuICAgICAgICAgICAgICAgIGVsc2UgaWYgYS5saW5lID09IGIubGluZVxuICAgICAgICAgICAgICAgICAgICBpZiBhLmNvbCA8IGIuY29sIHRoZW4gYSBlbHNlIGJcbiAgICAgICAgICAgICAgICBlbHNlIGJcbiAgICBsaW5lOkluZmluaXR5XG4gICAgY29sOiBJbmZpbml0eVxuICAgICAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IHsgcmVnaXN0ZXIsIGZpcnN0TGluZUNvbCwgbGFzdExpbmVDb2wsIGVtcHR5LCB2YWxpZCB9XG4iXX0=
//# sourceURL=../coffee/utils.coffee