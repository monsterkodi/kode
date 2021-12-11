// monsterkodi/kode 0.84.0

var _k_ = {list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}, empty: function (l) {return l==='' || l===null || l===undefined || l!==l || typeof(l) === 'object' && Object.keys(l).length === 0}, in: function (a,l) {return [].indexOf.call(l,a) >= 0}, extend: function (c,p) {for (var k in p) { if (Object.hasOwn(p, k)) c[k] = p[k] } function ctor() { this.constructor = c; } ctor.prototype = p.prototype; c.prototype = new ctor(); c.__super__ = p.prototype; return c;}}

var Kode, chai, kode

Kode = require('../../')
chai = require('chai')
chai.should()

kode = function ()
{
    return new Kode()
}
module.exports = {evl:function (c, p)
{
    return chai.assert.deepEqual(kode().eval(c),p)
},sme:function (c, p)
{
    return kode().compile(c).should.eql(kode().compile(p))
},ast:function (c, p)
{
    return kode().astr(c,false).should.eql(p)
},cmp:function (c, p)
{
    var k

    k = kode().compile(c)
    if (k.startsWith('// monsterkodi/kode'))
    {
        k = k.slice(k.indexOf('\n') + 2)
    }
    if (k.startsWith('var _k_'))
    {
        k = k.slice(k.indexOf('\n') + 2)
    }
    if (k.startsWith('var '))
    {
        k = k.slice(k.indexOf('\n') + 2)
    }
    return k.should.eql(p)
}}