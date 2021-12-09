###
000000000  00000000   0000000  000000000        000   000  000000000  000  000       0000000  
   000     000       000          000           000   000     000     000  000      000       
   000     0000000   0000000      000           000   000     000     000  000      0000000   
   000     000            000     000           000   000     000     000  000           000  
   000     00000000  0000000      000            0000000      000     000  0000000  0000000   
###

Kode = require '../'
chai = require 'chai'
chai.should()
kode = -> new Kode()

module.exports = 
    
    evl: (c,p) -> chai.assert.deepEqual kode().eval(c), p
    sme: (c,p) -> kode().compile(c).should.eql kode().compile(p)
    ast: (c,p) -> kode().astr(c, no).should.eql p
    cmp: (c,p) -> 
        k = kode().compile c
        if k.startsWith '// monsterkodi/kode'   then k = k[k.indexOf('\n')+2..]
        if k.startsWith 'var _k_'               then k = k[k.indexOf('\n')+2..]
        if k.startsWith 'var '                  then k = k[k.indexOf('\n')+2..]
        k.should.eql p
        