var Debugger = Debugger || {};

Debugger.Config = (function() {
    var registers = {
        'eax': {
            dec: 0,
            hex: 0,
            bin: 0
        },
        'ebx': {
            dec: 0,
            hex: 0,
            bin: 0
        },
        'ecx': {
            dec: 0,
            hex: 0,
            bin: 0
        },
        'edx': {
            dec: 0,
            hex: 0,
            bin: 0
        },
        'esi': {
            dec: 0,
            hex: 0,
            bin: 0
        },
        'edi': {
            dec: 0,
            hex: 0,
            bin: 0
        }
    };

    var registerTypes = {
        'eax': {
            bit32: 'eax',
            bit16: 'ax',
            bit8h: 'ah',
            bit8l: 'al'
        },
        'ebx': {
            bit32: 'ebx',
            bit16: 'bx',
            bit8h: 'bh',
            bit8l: 'bl'
        },
        'ecx': {
            bit32: 'ecx',
            bit16: 'cx',
            bit8h: 'ch',
            bit8l: 'cl'
        },
        'edx': {
            bit32: 'edx',
            bit16: 'dx',
            bit8h: 'dh',
            bit8l: 'dl'
        },
        'esi': {
            bit32: 'esi',
            bit16: 'si'
        },
        'edi': {
            bit32: 'edi',
            bit16: 'di'
        }
    };

    var flags = {
        'cf': 0,
        'of': 0,
        'sf': 0,
        'zf': 0
    };

    var typeList = [
        'reg',
        'label',
        'val'
    ];

    var instructionList = {
        'mov': [
            ['reg', 'reg'],
            ['reg', 'val']
        ],
        'sub': [
            ['reg', 'reg'],
            ['reg', 'val']
        ],
        'add': [
            ['reg', 'reg'],
            ['reg', 'val']
        ],
        'inc': [
            ['reg']
        ],
        'dec': [
            ['reg']
        ],
        'mul': [
            ['reg']
        ],
        'div': [
            ['reg']
        ],
        'cmp': [
            ['reg', 'reg']
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
})();
