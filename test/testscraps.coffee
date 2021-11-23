###
000000000  00000000   0000000  000000000          0000000   0000000  00000000    0000000   00000000    0000000   
   000     000       000          000            000       000       000   000  000   000  000   000  000        
   000     0000000   0000000      000            0000000   000       0000000    000000000  00000000   0000000    
   000     000            000     000                 000  000       000   000  000   000  000             000   
   000     00000000  0000000      000            0000000    0000000  000   000  000   000  000        0000000    
###

# a ?= b
# a = c ? d
# func? arg

# a = if 0 then 1 else if 2 then 3 else 5
# h = a ? (c ? d) : e

f = (a:, b:) -> log a, b
    
f c:4 b:3

for a in 1..9
    log 'hello'

for a in [1..9]
    log 'hello'
    
for a in [1..9] then \
for b in [1..9]
    c = Math.sqrt a*a + b*b
    return String [a, b, c] if not c % 1

a.b = 1    
a .b = 1    
a. b = 1    
a . b = 1    
a   .   b = 1    
    
log(a,b,c)

a(b for b in c)
a (b for b in c)

[a,b,c,]    
[a,b,c]    
[1,2,3,]    
[1,2,3]    
[1 2 3]    
    
kstr    = require 'kstr'
slash   = require 'kslash'
noon    = require 'noon'
nearley = require 'nearley'
grammar = require './grammar'
    
text = slash.readText "#{__dirname}/../coffee/test.coffee"
log text

longstr = """
    line1
    line2
    """

lstr = """abc"""; lstr2 = """def"""
    
$1=$$2
_1st = _2nd
whilefor_if_then_else_in = 2
    
while next = lexer.next()
    delete next.toString
    if next.type in ['s''n']
        log blue(kstr.pad(next.line, 3))
    else if next.type in ['i''o']
        log blue(kstr.pad(next.line, 2)), if next.type == 'i' then '▸' else '◂'
    else
        log blue(kstr.pad(next.line, 3)), kstr.pad(next.type, 10), yellow(next.text)

▸profile 'tokenize'        
    __uff_bla__ = 3.333
    _ = 0x10
    # 1abc = 223da

    @: ->
        
text[-1] == '\n'
a = 1
a == b
b != 1
c >= 1
d <= 1
d += 1
d -= 1
d *= 1
d /= 1
e < 1 < f
e > 2 > f
f * g / h

known[l] = s[3] if s[3]; short[s[0][1]] = "--#{l}" if s[0]!=''

a ?= b
a ? b

double = "
    line1
    line2
    "
    
single = '
    l1
    l2
    '
    
l = ['a' ['b' 'c']]
l = [
    'a' 
    ['b' 'c']
    1 2 3
]

l = [
    1 2 3 'a'
    c: 
        d:3
        e:4
    f:
        'b'
    'c'
    ]   
l = 
    1

o = {a:1 b:2 c: d:4 e:f}
o = a:1 b:2 c: d:4 e:f

o = 
    a:1 
    b:2 
    c: 
        d:4
    e:f

o =
    a:1 
    b:2 
    c: 
        d:4 
        e:f
        
o = {
    a:1 
    b:2 
    c: 
        d:4
    e:f
}

o = {
    a:1 
    b:2 
    c: 
        d:4 
        e:f
}

traverse= (
    b,
    a = b:1 c: d: e:1
    ) ->

if true        
        
    for a in [1..2] then for b in [1..3] 
        c = 1
        d = 1
    
    for a in [1..2] 
        for b in [1..3] then c = 1; d = 1
            
    for a in [1..2] then for b in [1..3] 
        c = 1; d= 1
        
    for a in [1..2] then for b in [1..3] then c = 1; d = 1
    
    b = if true then false else yes
    b = if false then true; false else yes; no
    b = 
        if false 
            true
        else 
            no
    b = if false then true; false else 
        yes; no
    
    b = if false then (if a() then 2 else if b() then 4 else 3) else yes; no    
    b = if false then (if a() then 2 else if b() then 4 else 3) else yes; no


for a in [1..2] then for b in [1..3] then c = 1; d = 1
    
for a in [1..9] then for b in [1..9]
    c = 3
    d: 
        e: 1
    
while next = lexer.next()
    delete next.toString
    if next.type in ['s''n']
        log blue(kstr.pad(next.line, 3))
    else if next.type in ['i''o']
        log blue(kstr.pad(next.line, 2)), if next.type == 'i' then '▸' else '◂'
    else
        log blue(kstr.pad(next.line, 3)), kstr.pad(next.type, 10), yellow(next.text)
    
    