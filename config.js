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
        'div': [
            ['reg']
        ],
        'cmp': [
            ['reg', 'reg']
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
