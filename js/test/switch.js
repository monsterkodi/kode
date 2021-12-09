// monsterkodi/kode 0.66.0

var _k_ = {list:   function (l)   {return (l != null ? typeof l.length === 'number' ? l : [] : [])},             length: function (l)   {return (l != null ? typeof l.length === 'number' ? l.length : 0 : 0)},             in:     function (a,l) {return (l != null ? typeof l.indexOf === 'function' ? l.indexOf(a) >= 0 : false : false)},             extend: function (c,p) {for (var k in p) { if (Object.hasOwn(p, k)) c[k] = p[k] } function ctor() { this.constructor = c; } ctor.prototype = p.prototype; c.prototype = new ctor(); c.__super__ = p.prototype; return c;}}

var cmp

cmp = require('./utils').cmp

describe('switch',function ()
{
    it('switches',function ()
    {
        cmp(`switch a
    when 1 then 2`,`switch (a)
{
    case 1:
        2
        break
}\n`)
        cmp(`switch a
    when 11 then 22; 33`,`switch (a)
{
    case 11:
        22
        33
        break
}\n`)
        cmp(`switch a
    when 'a'   then i++ ; j = 1 if k == 0`,`switch (a)
{
    case 'a':
        i++
        if (k === 0)
        {
            j = 1
        }
        break
}\n`)
        cmp(`switch a
    when 'a'   then i++ ; j = 0 if k == 1
    when 'b'   then l++ ; m = 2 if p == 3`,`switch (a)
{
    case 'a':
        i++
        if (k === 1)
        {
            j = 0
        }
        break
    case 'b':
        l++
        if (p === 3)
        {
            m = 2
        }
        break
}\n`)
        cmp(`switch a
    when 'a'   then i++ ; i = 1 if i == 0
    when 'b'   then f++ ; f = 1 if f == 0
    when 'c'
        i++ if f != 'f'`,`switch (a)
{
    case 'a':
        i++
        if (i === 0)
        {
            i = 1
        }
        break
    case 'b':
        f++
        if (f === 0)
        {
            f = 1
        }
        break
    case 'c':
        if (f !== 'f')
        {
            i++
        }
        break
}\n`)
        cmp(`switch a
    when 111 222 333 then
    when 'a' 'b' 'c' then`,`switch (a)
{
    case 111:
    case 222:
    case 333:
        break
    case 'a':
    case 'b':
    case 'c':
        break
}\n`)
        return cmp(`switch a
    when 111 222 333
    when 'a' 'b' 'c'`,`switch (a)
{
    case 111:
    case 222:
    case 333:
        break
    case 'a':
    case 'b':
    case 'c':
        break
}\n`)
    })
    it('assign',function ()
    {
        cmp(`b = switch c
    when 'c'
        true
    when 'd'
        false`,`b = ((function ()
{
    switch (c)
    {
        case 'c':
            return true

        case 'd':
            return false

    }

}).bind(this))()`)
        return cmp(`b = switch matches[0][0]
    when 'close'
        c += index+length
        true
    when 'triple' 'double' 'single'
        c += index+length
        false
    else
        log 'unhandled?' matches[0]
        c += index+length
        true`,`b = ((function ()
{
    switch (matches[0][0])
    {
        case 'close':
            c += index + length
            return true

        case 'triple':
        case 'double':
        case 'single':
            c += index + length
            return false

        default:
            console.log('unhandled?',matches[0])
            c += index + length
            return true
    }

}).bind(this))()`)
    })
    return it('nicer',function ()
    {
        cmp(`switch x
    'bla'   ➜ bla
    'hello' ➜ blub
            ➜ fork`,`switch (x)
{
    case 'bla':
        bla
        break
    case 'hello':
        blub
        break
    default:
        fork
}\n`)
        return cmp(`switch x
    'x' 
    1 2 3
    'bla'   ➜ bla
    'a' 'b'
    'hello' ➜ blub
            ➜ fork`,`switch (x)
{
    case 'x':
    case 1:
    case 2:
    case 3:
    case 'bla':
        bla
        break
    case 'a':
    case 'b':
    case 'hello':
        blub
        break
    default:
        fork
}\n`)
    })
})