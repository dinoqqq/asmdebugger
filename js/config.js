var Debugger = Debugger || {};

Debugger.Config = function() {
    /*
     * The different types of registers and their sizes
     * Storage of the values of the registers
     */
    var registers = {
        'eax': {
            reg32: {
                name: 'eax',
                value: {
                    dec: null,
                    sDec: null,
                    hex: null,
                    bin: null
                }
            },
            reg16: {
                name: 'ax',
                value: {
                    dec: null,
                    sDec: null,
                    hex: null,
                    bin: null
                }
            },
            reg8h: {
                name: 'ah',
                value: {
                    dec: null,
                    sDec: null,
                    hex: null,
                    bin: null
                }
            },
            reg8l: {
                name: 'al',
                value: {
                    dec: null,
                    sDec: null,
                    hex: null,
                    bin: null
                }
            }
        },
        'ebx': {
            reg32: {
                name: 'ebx',
                value: {
                    dec: null,
                    sDec: null,
                    hex: null,
                    bin: null
                }
            },
            reg16: {
                name: 'bx',
                value: {
                    dec: null,
                    sDec: null,
                    hex: null,
                    bin: null
                }
            },
            reg8h: {
                name: 'bh',
                value: {
                    dec: null,
                    sDec: null,
                    hex: null,
                    bin: null
                }
            },
            reg8l: {
                name: 'bl',
                value: {
                    dec: null,
                    sDec: null,
                    hex: null,
                    bin: null
                }
            }
        },
        'ecx': {
            reg32: {
                name: 'ecx',
                value: {
                    dec: null,
                    sDec: null,
                    hex: null,
                    bin: null
                }
            },
            reg16: {
                name: 'cx',
                value: {
                    dec: null,
                    sDec: null,
                    hex: null,
                    bin: null
                }
            },
            reg8h: {
                name: 'ch',
                value: {
                    dec: null,
                    sDec: null,
                    hex: null,
                    bin: null
                }
            },
            reg8l: {
                name: 'cl',
                value: {
                    dec: null,
                    sDec: null,
                    hex: null,
                    bin: null
                }
            }
        },
        'edx': {
            reg32: {
                name: 'edx',
                value: {
                    dec: null,
                    sDec: null,
                    hex: null,
                    bin: null
                }
            },
            reg16: {
                name: 'dx',
                value: {
                    dec: null,
                    sDec: null,
                    hex: null,
                    bin: null
                }
            },
            reg8h: {
                name: 'dh',
                value: {
                    dec: null,
                    sDec: null,
                    hex: null,
                    bin: null
                }
            },
            reg8l: {
                name: 'dl',
                value: {
                    dec: null,
                    sDec: null,
                    hex: null,
                    bin: null
                }
            }
        },
        'esi': {
            reg32: {
                name: 'esi',
                value: {
                    dec: null,
                    sDec: null,
                    hex: null,
                    bin: null
                }
            },
            reg16: {
                name: 'si',
                value: {
                    dec: null,
                    sDec: null,
                    hex: null,
                    bin: null
                }
            }
        },
        'edi': {
            reg32: {
                name: 'edi',
                value: {
                    dec: null,
                    sDec: null,
                    hex: null,
                    bin: null
                }
            },
            reg16: {
                name: 'di',
                value: {
                    dec: null,
                    sDec: null,
                    hex: null,
                    bin: null
                }
            }
        }
    };

    /*
     * Storage of the values of the flags
     */
    var flags = {
        'cf': 0,
        'of': 0,
        'sf': 0,
        'zf': 0
    };

    /*
     * The list of all possible types
     */
    var typeList = [
        'reg32',
        'reg16',
        'reg8h',
        'reg8l',
        'label',
        'val'
    ];

    /*
     * The list of all instructions (mnemonics) and their possible parameters
     */
    var instructionList = {
        'mov': [
            ['reg32', 'reg32'],
            ['reg16', 'reg16'],
            ['reg8h', 'reg8l'],
            ['reg8l', 'reg8h'],
            ['reg8h', 'reg8h'],
            ['reg8l', 'reg8l'],
            ['reg32', 'val'],
            ['reg16', 'val'],
            ['reg8h', 'val'],
            ['reg8l', 'val']
        ],
        'movzx': [
            ['reg32', 'reg16'],
            ['reg32', 'reg8l'],
            ['reg32', 'reg8h'],
            ['reg16', 'reg8l'],
            ['reg16', 'reg8h']
        ],
        'movsx': [
            ['reg32', 'reg16'],
            ['reg32', 'reg8l'],
            ['reg32', 'reg8h'],
            ['reg16', 'reg8l'],
            ['reg16', 'reg8h']
        ],
        'cbw': [],
        'cwde': [],
        'cwd': [],
        'cdq': [],
        'sub': [
            ['reg32', 'reg32'],
            ['reg16', 'reg16'],
            ['reg8h', 'reg8l'],
            ['reg8l', 'reg8h'],
            ['reg8h', 'reg8h'],
            ['reg8l', 'reg8l'],
            ['reg32', 'val'],
            ['reg16', 'val'],
            ['reg8h', 'val'],
            ['reg8l', 'val']
        ],
        'add': [
            ['reg32', 'reg32'],
            ['reg16', 'reg16'],
            ['reg8h', 'reg8l'],
            ['reg8l', 'reg8h'],
            ['reg8h', 'reg8h'],
            ['reg8l', 'reg8l'],
            ['reg32', 'val'],
            ['reg16', 'val'],
            ['reg8h', 'val'],
            ['reg8l', 'val']
        ],
        'inc': [
            ['reg32'],
            ['reg16'],
            ['reg8h'],
            ['reg8l']
        ],
        'dec': [
            ['reg32'],
            ['reg16'],
            ['reg8h'],
            ['reg8l']
        ],
        'mul': [
            ['reg32'],
            ['reg16'],
            ['reg8h'],
            ['reg8l']
        ],
        'div': [
            ['reg32'],
            ['reg16'],
            ['reg8h'],
            ['reg8l']
        ],
        'imul': [
            ['reg32'],
            ['reg16'],
            ['reg8h'],
            ['reg8l']
        ],
        'idiv': [
            ['reg32'],
            ['reg16'],
            ['reg8h'],
            ['reg8l']
        ],
        'cmp': [
            ['reg32', 'reg32'],
            ['reg16', 'reg16'],
            ['reg8h', 'reg8l'],
            ['reg8l', 'reg8h'],
            ['reg8h', 'reg8h'],
            ['reg8l', 'reg8l']
        ],
        'neg': [
            ['reg32'],
            ['reg16'],
            ['reg8h'],
            ['reg8l']
        ],
        'loop': [
            ['label']
        ],
        'jz': [
            ['label']
        ],
        'jnz': [
            ['label']
        ],
        'js': [
            ['label']
        ],
        'jns': [
            ['label']
        ],
        'jo': [
            ['label']
        ],
        'jno': [
            ['label']
        ],
        'jb': [
            ['label']
        ],
        'jbe': [
            ['label']
        ],
        'ja': [
            ['label']
        ],
        'jae': [
            ['label']
        ],
        'jl': [
            ['label']
        ],
        'jle': [
            ['label']
        ],
        'jg': [
            ['label']
        ],
        'jge': [
            ['label']
        ],
        'jmp': [
            ['label']
        ]
    };

    return {
        registers: registers,
        typeList: typeList,
        flags: flags,
        instructionList: instructionList
    }
}();
