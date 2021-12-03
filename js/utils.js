// monsterkodi/kode 0.10.1

var empty, lastLineCol, firstLineCol


empty = function (a)
{
    return ['',null,undefined].indexOf(a) >= 0 || (typeof(a) === 'object' && Object.keys(a).length === 0)
}

lastLineCol = function (e)
{
    var _25_13_, _25_8_, _28_30_, _29_13_, cols

    if (((e != null ? e.col : undefined) != null))
    {
        return {line:e.line,col:e.col + (e.text != null ? e.text.length : undefined)}
    }
    else if ((e != null) && e instanceof Object)
    {
        cols = Object.values(e).map(lastLineCol)
        if (!empty(cols))
        {
            return cols.reduce(function (a, b)
            {
                if (a.line > b.line)
                {
                    return a
                }
                else if (a.line === b.line)
                {
                    return a.col > b.col ? a : b
                }
                else
                {
                    return b
                }
            })
        }
    }
    return {line:1,col:0}
}

firstLineCol = function (e)
{
    var _48_13_, _48_8_, _52_13_, cols

    if (((e != null ? e.col : undefined) != null))
    {
        return {line:e.line,col:e.col}
    }
    else if ((e != null) && e instanceof Object)
    {
        cols = Object.values(e).map(firstLineCol)
        if (!empty(cols))
        {
            return cols.reduce(function (a, b)
            {
                if (a.line < b.line)
                {
                    return a
                }
                else if (a.line === b.line)
                {
                    return a.col < b.col ? a : b
                }
                else
                {
                    return b
                }
            })
        }
    }
    return {line:Infinity,col:Infinity}
}
module.exports = {firstLineCol:firstLineCol,lastLineCol:lastLineCol,empty:empty}