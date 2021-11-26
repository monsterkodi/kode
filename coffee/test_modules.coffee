assert = require 'assert'
chai   = require 'chai'
path   = require 'path'
fs     = require 'fs'
koffee = require 'koffee'
Kode   = require '../'
chai.should()

kode = new Kode()

lexer    = kode.lexer
parser   = kode.parser
renderer = kode.renderer

# 000      00000000  000   000  00000000  00000000
# 000      000        000 000   000       000   000
# 000      0000000     00000    0000000   0000000
# 000      000        000 000   000       000   000
# 0000000  00000000  000   000  00000000  000   000

describe 'modules' ->

    it 'tokenize' ->

        lexer.tokenize 'a=b'
        .should.eql [
                col: 0
                line: 1
                text: 'a'
                type: 'var'
            ,
                col: 1
                line: 1
                text: '='
                type: 'op'
            ,
                col: 2
                line: 1
                text: 'b'
                type: 'var'
            ]

    it 'blockify' ->

        lexer.blockify lexer.tokenize """
            if 1
                a=b
            """
        .should.eql
            type: 'block'
            tokens:
                [
                    type: 'keyword' text: 'if' line: 1 col: 0
                ,
                    type: 'num' text: '1' line: 1 col: 3
                ,
                    type:  'block'
                    indent: '    '
                    tokens:
                        [
                            col:  4
                            line: 2
                            text: 'a'
                            type: 'var'
                        ,
                            col:  5
                            line: 2
                            text: '='
                            type: 'op'
                        ,
                            col:  6
                            line: 2
                            text: 'b'
                            type: 'var'
                        ]
                    line: 2
                    last: 2
                    col:  4
                ]
            indent: ''
            line:   1
            last:   1
            col:    0

    # 00000000    0000000   00000000    0000000  00000000  00000000
    # 000   000  000   000  000   000  000       000       000   000
    # 00000000   000000000  0000000    0000000   0000000   0000000
    # 000        000   000  000   000       000  000       000   000
    # 000        000   000  000   000  0000000   00000000  000   000

    it 'parse' ->

        parser.parse lexer.blockify lexer.tokenize """
            if a then b else c
            """
        .should.eql [
            if:
                exp:
                    col: 3
                    line: 1
                    text: "a"
                    type: "var"
                then:
                    vars:   []
                    exps:   [ 
                            col: 10
                            line: 1
                            text: 'b'
                            type: 'var'
                            ]
                else:
                    vars:   []
                    exps:   [
                            col: 17
                            line: 1
                            text: 'c'
                            type: 'var'
                            ]
            ]
                        
        parser.parse lexer.blockify lexer.tokenize """
            a.b.c
            """
        .should.eql [
            prop:
                obj:
                    prop:
                        obj:
                            type:    'var'
                            text:    'a'
                            line:    1
                            col:     0
                        dot:
                            type:    'punct'
                            text:    '.'
                            line:    1
                            col:     1
                      
                        prop:
                            type:    'var'
                            text:    'b'
                            line:    1
                            col:     2
                dot:
                    type:    'punct'
                    text:    '.'
                    line:    1
                    col:     3
                prop:
                    type:    'var'
                    text:    'c'
                    line:    1
                    col:     4
            ]

    # 00000000   00000000  000   000  0000000    00000000  00000000
    # 000   000  000       0000  000  000   000  000       000   000
    # 0000000    0000000   000 0 000  000   000  0000000   0000000
    # 000   000  000       000  0000  000   000  000       000   000
    # 000   000  00000000  000   000  0000000    00000000  000   000

    it 'render' ->

        renderer.render parser.parse lexer.blockify lexer.tokenize """
            if a then b else c"""
        .should.eql """
            if (a)
            {
                b
            }
            else
            {
                c
            }"""