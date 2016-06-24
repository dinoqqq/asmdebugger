var Debugger = Debugger || {};

Debugger.Config = function() {
    /*
     * The different types of registers and their sizes
     * Storage of the values of the registers
     */
    var registers = {
        'eax': {
            reg32: 'eax',
            reg16: 'ax',
            reg8h: 'ah',
            reg8l: 'al',
            value: {
                dec: null,
                hex: null,
                bin: null
            },
            valueFormat: {
                dec: null,
                hex: null,
                bin: null
            }
        },
        'ebx': {
            reg32: 'ebx',
            reg16: 'bx',
            reg8h: 'bh',
            reg8l: 'bl',
            value: {
                dec: null,
                hex: null,
                bin: null
            },
            valueFormat: {
                dec: null,
                hex: null,
                bin: null
            }
        },
        'ecx': {
            reg32: 'ecx',
            reg16: 'cx',
            reg8h: 'ch',
            reg8l: 'cl',
            value: {
                dec: null,
                hex: null,
                bin: null
            },
            valueFormat: {
                dec: null,
                hex: null,
                bin: null
            }
        },
        'edx': {
            reg32: 'edx',
            reg16: 'dx',
            reg8h: 'dh',
            reg8l: 'dl',
            value: {
                dec: null,
                hex: null,
                bin: null
            },
            valueFormat: {
                dec: null,
                hex: null,
                bin: null
            }
        },
        'esi': {
            reg32: 'esi',
            reg16: 'si',
            value: {
                dec: null,
                hex: null,
                bin: null
            },
            valueFormat: {
                dec: null,
                hex: null,
                bin: null
            }
        },
        'edi': {
            reg32: 'edi',
            reg16: 'di',
            value: {
                dec: null,
                hex: null,
                bin: null
            },
            valueFormat: {
                dec: null,
                hex: null,
                bin: null
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
            ['reg8l'],
            ['reg8']
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
        'cmp': [
            ['reg32', 'reg32'],
            ['reg16', 'reg16'],
            ['reg8h', 'reg8l'],
            ['reg8l', 'reg8h'],
            ['reg8h', 'reg8h'],
            ['reg8l', 'reg8l']
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
