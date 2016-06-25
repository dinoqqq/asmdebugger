var Debugger = Debugger || {};

Debugger.Instructions = (function() {
    function executeInstruction(instructionObject, instructionObjects) {
        var param0 = instructionObject.param0;
        var param1 = instructionObject.param1;
        var param2 = instructionObject.param2;

        switch(param0.value) {
            case 'mov':
                if (Debugger.Helper.isTypeRegister(param2.type)) {
                    var value = Debugger.Config.registers[param2.value]['dec'];

                    Debugger.Helper.setRegister(param1.value, param1.type, value);
                }

                if (param2.type === 'val') {
                    value = param2.value;
                    Debugger.Helper.setRegister(param1.value, param1.type, param2.value);
                }

                Debugger.Helper.setRegister(param1.value, param1.type, value);

                break;

            case 'add':
                if (Debugger.Helper.isTypeRegister(param2.type)) {
                    var operand1 = Debugger.Helper.paramToRegisterValue(param1);
                    var operand2 = Debugger.Helper.paramToRegisterValue(param2);
                }

                if (param2.type === 'val') {
                    var operand1 = Debugger.Helper.paramToRegisterValue(param1);
                    var operand2 = param2.value;
                }

                var result = Debugger.Helper.limitDec(operand1 + operand2);
                var type = 'add';

                Debugger.Helper.setFlags(type, operand1, operand2, result);
                Debugger.Helper.setRegister(param1.value, param1.type, result);

                break;

            case 'cmp':
            case 'sub':
                if (Debugger.Helper.isTypeRegister(param2.type)) {
                    var operand1 = Debugger.Helper.paramToRegisterValue(param1);
                    var operand2 = Debugger.Helper.paramToRegisterValue(param2);
                }

                if (param2.type === 'val') {
                    var operand1 = Debugger.Helper.paramToRegisterValue(param1);
                    var operand2 = param2.value;
                }

                var result = Debugger.Helper.limitDec(operand1 - operand2);
                var type = 'sub';

                Debugger.Helper.setFlags(type, operand1, operand2, result);

                // do not set registers when using "cmp"
                if (param0.value === 'sub') {
                    Debugger.Helper.setRegister(param1.value, param1.type, result);
                }

                break;

            case 'inc':
                var operand1 = Debugger.Helper.paramToRegisterValue(param1);
                var operand2 = 1;
                var result = Debugger.Helper.limitDec(operand1 + operand2);
                var type = 'add';

                Debugger.Helper.setFlags(type, operand1, operand2, result);
                Debugger.Helper.setRegister(param1.value, param1.type, result);

                break;

            case 'dec':
                var operand1 = Debugger.Helper.paramToRegisterValue(param1);
                var operand2 = 1;
                var result = Debugger.Helper.limitDec(operand1 - operand2);
                var type = 'sub';

                Debugger.Helper.setFlags(type, operand1, operand2, result);
                Debugger.Helper.setRegister(param1.value, param1.type, result);

                break;

            /*
             * Multiplication works like this:
             *
             * mul ecx (ecx * eax = edx:eax)
             * mul cx (cx * ax = dx:ax)
             * mul cl (cl * al = ah:al = ax)
             * mul ch (ch * al = ah:al = ax)
             */
            case 'mul':
                var value1 = Debugger.Helper.paramToRegisterValue(param1);

                // Get the same sized value out of the register in the eax register
                // Ensure the low 8 bit register
                var paramTypeLow = Debugger.Helper.ensure8BitLow(param1.type);
                var value2ParamType = Debugger.Config.registers['eax'][paramTypeLow];

                var paramEax = {
                    type: paramTypeLow,
                    value: value2ParamType
                };

                var value2 = Debugger.Helper.paramToRegisterValue(paramEax);

                var result = value1 * value2;

                var sizeRegister = Debugger.Helper.getSizeOfRegister(paramTypeLow);

                var size;
                var registerResult1;
                var registerResult2;

                // Get the values to do "mul"
                var mulDivValues = Debugger.Vars.getMulDivValues(sizeRegister);

                /* create a double so long string */
                var resultBin = Debugger.Helper.toBin(result, mulDivValues.size * 2);

                var result1 = resultBin.substr(mulDivValues.size * -1);
                var result2 = resultBin.substr(0, mulDivValues.size);

                var result1Dec = Debugger.Helper.baseConverter(result1, 2, 10);
                var result2Dec = Debugger.Helper.baseConverter(result2, 2, 10);

                var operand1 = value1;
                var operand2 = value2;
                var type = 'mul';

                Debugger.Helper.setFlags(type, operand1, operand2, result);

                Debugger.Helper.setRegister(
                    mulDivValues.register1,
                    Debugger.Helper.getTypeRegister(mulDivValues.register1),
                    result1Dec
                );
                Debugger.Helper.setRegister(
                    mulDivValues.register2,
                    Debugger.Helper.getTypeRegister(mulDivValues.register2),
                    result2Dec
                );

                break;

            /*
             * Divison works like this
             *
             * div ecx (edx:eax / ecx) remainder: edx, division: eax
             * div cx (dx:ax / cx) remainder: dx, division: ax
             * div cl (ah:al / cl) remainder: ah, division: al
             * div ch (ah:al / ch) remainder: ah, division: al
             *
             */
            case 'div':
                var value1 = Debugger.Helper.paramToRegisterValue(param1);

                // When we have reg8h or reg8l, we need "ah" and "al" (ah:al) as dividend
                // Else take the same register size out of eax and edx
                if (param1.type === 'reg8h' || param1.type === 'reg8l') {
                    var value2ParamType = Debugger.Config.registers['eax']['reg8h'];
                    var value3ParamType = Debugger.Config.registers['eax']['reg8l'];
                    var value2Type = 'reg8h';
                    var value3Type = 'reg8l';
                } else {
                    var value2ParamType = Debugger.Config.registers['edx'][param1.type];
                    var value3ParamType = Debugger.Config.registers['eax'][param1.type];
                    var value2Type = param1.type;
                    var value3Type = param1.type;
                }

                var paramDividend1 = {
                    type: value2Type,
                    value: value2ParamType
                };

                var paramDividend2 = {
                    type: value3Type,
                    value: value3ParamType
                };

                var value2 = Debugger.Helper.paramToRegisterValue(paramDividend1, 2);
                var value3 = Debugger.Helper.paramToRegisterValue(paramDividend2, 2);

                var sizeRegister = Debugger.Helper.getSizeOfRegister(param1.type);

                // Get the values to do "div"
                var mulDivValues = Debugger.Vars.getMulDivValues(sizeRegister);

                // Use the "size" of mulDivValues to add padding
                value2 = Debugger.Helper.addPadding(value2, mulDivValues.size);
                value3 = Debugger.Helper.addPadding(value3, mulDivValues.size);

                // concatenate both dividends and convert to base 10
                var value4 = Debugger.Helper.baseConverter(value2 + value3, 2, 10);

                // trick to floor
                var resultEax = ~~(Debugger.Helper.limitDec(value4) / value1);
                var resultEdx = Debugger.Helper.limitDec(value4) % value1;

                var operand1 = value4;
                var operand2 = value1;
                var type = 'div';

                Debugger.Helper.setFlags(type, operand1, operand2, resultEax);

                Debugger.Helper.setRegister(
                    mulDivValues.register1,
                    Debugger.Helper.getTypeRegister(mulDivValues.register1),
                    resultEax
                );
                Debugger.Helper.setRegister(
                    mulDivValues.register2,
                    Debugger.Helper.getTypeRegister(mulDivValues.register2),
                    resultEdx
                );

                break;

            /*
             * Loop jumps to a label when ecx is not zero. After every jump it decreases ecx.
             */
            case 'loop':
                if (!(address = Debugger.Helper.findLabelAddress(instructionObject.param1.value, instructionObjects))) {
                    console.log('Jump to, but label not found');
                    return false;
                }

                var ecx = Debugger.Config.registers['ecx']['dec'];

                if (ecx !== 0) {
                    Debugger.Vars.instructionPointer = address;

                    // Decrease ecx
                    Debugger.Helper.setRegister('ecx', --ecx);
                }

                var operand1 = null;
                var operand2 = null;
                var type = 'loop';

                Debugger.Helper.setFlags(type, operand1, operand2, ecx);
                break;

            case 'jmp':
                var address;
                if (!(address = Debugger.Helper.findLabelAddress(instructionObject.param1.value, instructionObjects))) {
                    console.log('Jump to, but label not found');
                    return false;
                }

                Debugger.Vars.instructionPointer = address;
                break;

            case 'jz':
            case 'jnz':
            case 'js':
            case 'jns':
            case 'jc':
            case 'jnc':
            case 'jo':
            case 'jno':
                if (!(address = Debugger.Helper.findLabelAddress(instructionObject.param1.value, instructionObjects))) {
                    console.log('Jump to, but label not found');
                    return false;
                }

                var secondLetter = param0.value.substr(1,1);
                var thirdLetter = param0.value.substr(2,1);

                if (secondLetter === 'n' && Debugger.Config.flags[thirdLetter + 'f'] === 0) {
                    Debugger.Vars.instructionPointer = address;
                }

                if (secondLetter !== 'n' && Debugger.Config.flags[secondLetter + 'f'] === 1) {
                    Debugger.Vars.instructionPointer = address;
                }
                break;

            case 'jb':
                if (!(address = Debugger.Helper.findLabelAddress(instructionObject.param1.value, instructionObjects))) {
                    console.log('Jump to, but label not found');
                    return false;
                }

                if (Debugger.Config.flags['cf'] === 1) {
                    Debugger.Vars.instructionPointer = address;
                }
                break;

            case 'jbe':
                if (!(address = Debugger.Helper.findLabelAddress(instructionObject.param1.value, instructionObjects))) {
                    console.log('Jump to, but label not found');
                    return false;
                }

                if (Debugger.Config.flags['cf'] === 1 || Debugger.Config.flags['zf'] === 1) {
                    Debugger.Vars.instructionPointer = address;
                }
                break;

            case 'ja':
                if (!(address = Debugger.Helper.findLabelAddress(instructionObject.param1.value, instructionObjects))) {
                    console.log('Jump to, but label not found');
                    return false;
                }

                if (Debugger.Config.flags['cf'] === 0 && Debugger.Config.flags['zf'] === 0) {
                    Debugger.Vars.instructionPointer = address;
                }
                break;

            case 'jae':
                if (!(address = Debugger.Helper.findLabelAddress(instructionObject.param1.value, instructionObjects))) {
                    console.log('Jump to, but label not found');
                    return false;
                }

                if (Debugger.Config.flags['cf'] === 0) {
                    Debugger.Vars.instructionPointer = address;
                }
                break;

            case 'jl':
                if (!(address = Debugger.Helper.findLabelAddress(instructionObject.param1.value, instructionObjects))) {
                    console.log('Jump to, but label not found');
                    return false;
                }

                if (Debugger.Config.flags['sf'] !== Debugger.Config.flags['of']) {
                    Debugger.Vars.instructionPointer = address;
                }
                break;

            case 'jle':
                if (!(address = Debugger.Helper.findLabelAddress(instructionObject.param1.value, instructionObjects))) {
                    console.log('Jump to, but label not found');
                    return false;
                }

                if (Debugger.Config.flags['sf'] !== Debugger.Config.flags['of'] || Debugger.Config.flags['zf'] === 1) {
                    Debugger.Vars.instructionPointer = address;
                }
                break;

            case 'jg':
                if (!(address = Debugger.Helper.findLabelAddress(instructionObject.param1.value, instructionObjects))) {
                    console.log('Jump to, but label not found');
                    return false;
                }

                if (Debugger.Config.flags['sf'] === Debugger.Config.flags['of'] && Debugger.Config.flags['zf'] === 0) {
                    Debugger.Vars.instructionPointer = address;
                }
                break;

            case 'jge':
                if (!(address = Debugger.Helper.findLabelAddress(instructionObject.param1.value, instructionObjects))) {
                    console.log('Jump to, but label not found');
                    return false;
                }

                if (Debugger.Config.flags['sf'] === Debugger.Config.flags['of']) {
                    Debugger.Vars.instructionPointer = address;
                }
                break;

            default:
                console.log('No instruction execution found');
                break;
        }

        Debugger.Helper.echoInstruction(instructionObject);
        return true;
    }

    return {
        executeInstruction: executeInstruction
    };
})();
