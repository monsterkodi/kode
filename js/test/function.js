// monsterkodi/kode 0.68.0

var _k_ = {list:   function (l)   {return (l != null ? typeof l.length === 'number' ? l : [] : [])},             length: function (l)   {return (l != null ? typeof l.length === 'number' ? l.length : 0 : 0)},             in:     function (a,l) {return (l != null ? typeof l.indexOf === 'function' ? l.indexOf(a) >= 0 : false : false)},             extend: function (c,p) {for (var k in p) { if (Object.hasOwn(p, k)) c[k] = p[k] } function ctor() { this.constructor = c; } ctor.prototype = p.prototype; c.prototype = new ctor(); c.__super__ = p.prototype; return c;}}

var cmp

cmp = require('./utils').cmp

describe('function',function ()
{
    return it('function',function ()
    {
        return cmp(`function A`,`
A = (function ()
{
    return A
})()
`)
    })
})