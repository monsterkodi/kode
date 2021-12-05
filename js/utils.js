// monsterkodi/kode 0.41.0

var empty, valid, lastLineCol, firstLineCol


empty = function (a)
{
    return ['',null,undefined].indexOf(a) >= 0 || (typeof(a) === 'object' && Object.keys(a).length === 0)
}

valid = function (a)
{
    return !empty(a)
}

lastLineCol = function (e)
{
    var _26_13_, _29_30_, cols

    if (((e != null ? e.col : undefined) != null))
    {
        return {line:e.line,col:e.col + (e.text != null ? e.text.length : undefined)}
    }
    else if ((e != null) && e instanceof Object)
    {
        cols = Object.values(e).map(lastLineCol)
        if (valid(cols))
        {
            return cols.reduce(function (a, b)
            {
                if (a.line > b.line)
                {
                    return a
                }
                else if (a.line === b.line)
                {
                    if (a.col > b.col)
                    {
                        return a
                    }
                    else
                    {
                        return b
                    }
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
    var _49_13_, cols

    if (((e != null ? e.col : undefined) != null))
    {
        return {line:e.line,col:e.col}
    }
    else if ((e != null) && e instanceof Object)
    {
        cols = Object.values(e).map(firstLineCol)
        if (valid(cols))
        {
            return cols.reduce(function (a, b)
            {
                if (a.line < b.line)
                {
                    return a
                }
                else if (a.line === b.line)
                {
                    if (a.col < b.col)
                    {
                        return a
                    }
                    else
                    {
                        return b
                    }
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
module.exports = {firstLineCol:firstLineCol,lastLineCol:lastLineCol,empty:empty,valid:valid}