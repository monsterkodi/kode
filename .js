name                kode
version             0.82.0
description         programming language
main                js/kode.js
scripts
                    test    mocha -c js/test/*.js
                    watch   mocha -w -c js/test/*.js
author              monsterkodi
license             Unlicense
dependencies
                    colorcat            monsterkodi/colorcat
                    karg                monsterkodi/karg
                    klor                monsterkodi/klor
                    kslash              monsterkodi/kslash
                    kstr                monsterkodi/kstr
                    noon                monsterkodi/noon
                    lodash.clone        ^4.5.0
                    lodash.isfunction   ^3.0.9
devDependencies
                    chai    ^4.3.4
                    mocha   ^9.1.3