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
kode = new Kode()

module.exports = 
    
    cmp: (c,p) -> kode.compile(c).should.eql p
    ast: (c,p) -> kode.astr(c, no).should.eql p