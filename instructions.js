var Debugger = Debugger || {};

Debugger.Instructions = (function() {
    function executeInstruction(instructionObject, instructionObjects) {
        var param0 = instructionObject.param0;
        var param1 = instructionObject.param1;
        var param2 = instructionObject.param2;

        switch(param0.value) {
            case 'mov':
                if (param2.type === 'reg') {
                    var value = Debugger.Config.registers[param2.value]['dec'];

                    Debugger.Helper.setRegister(param1.value, value);
                }

                if (param2.type === 'val') {
                    value = param2.value;
                    Debugger.Helper.setRegister(param1.value, param2.value);
                }

                Debugger.Helper.setRegister(param1.value, value);

                break;

            case 'add':
                if (param2.type === 'reg') {
                    var operand1 = Debugger.Config.registers[param1.value]['dec'];
                    var operand2 = Debugger.Config.registers[param2.value]['dec'];
                }

                if (param2.type === 'val') {
                    var operand1 = Debugger.Config.registers[param1.value]['dec'];
                    var operand2 = param2.value;
                }

                var result = Debugger.Helper.toDec(operand1 + operand2);
                var type = 'add';

                Debugger.Helper.setFlags(type, operand1, operand2, result);
                Debugger.Helper.setRegister(param1.value, result);

                break;

            case 'cmp':
            case 'sub':
                if (param2.type === 'reg') {
                    var operand1 = Debugger.Config.registers[param1.value]['dec'];
                    var operand2 = Debugger.Config.registers[param2.value]['dec'];
                }

                if (param2.type === 'val') {
                    var operand1 = Debugger.Config.registers[param1.value]['dec'];
                    var operand2 = param2.value;
                }

                var result = Debugger.Helper.toDec(operand1 - operand2);
                var type = 'sub';

                Debugger.Helper.setFlags(type, operand1, operand2, result);

                // do not set registers when using "cmp"
                if (param0.value === 'sub') {
                    Debugger.Helper.setRegister(param1.value, result);
                }

                break;

            case 'inc':
                var value1 = Debugger.Config.registers[param1.value]['dec'];

                var operand1 = value1;
                var operand2 = 1;
                var result = Debugger.Helper.toDec(operand1 + operand2);
                var type = 'add';

                Debugger.Helper.setFlags(type, operand1, operand2, result);
                Debugger.Helper.setRegister(param1.value, result);

                break;

            case 'dec':
                var value1 = Debugger.Config.registers[param1.value]['dec'];

                var operand1 = value1;
                var operand2 = 1;
                var result = Debugger.Helper.toDec(operand1 - operand2);
                var type = 'sub';

                Debugger.Helper.setFlags(type, operand1, operand2, result);
                Debugger.Helper.setRegister(param1.value, result);

                break;

            /*
             * Multiplication works like this
             *
             * mul ecx (ecx * eax = edx:eax)
             */
            case 'mul':
                var value1 = Debugger.Config.registers[param1.value]['dec'];
                var value2 = Debugger.Config.registers['eax']['dec'];

                var result = value1 * value2;

                /* create a 64 bit long string */
                var resultBin = Debugger.Helper.toBin(result, 64);

                var resultEax = resultBin.substr(-32);
                var resultEdx = resultBin.substr(0, 32);

                var resultEaxDec = Debugger.Helper.baseConverter(resultEax, 2, 10);
                var resultEdxDec = Debugger.Helper.baseConverter(resultEdx, 2, 10);

                var operand1 = value1;
                var operand2 = value2;
                var type = 'mul';

                Debugger.Helper.setFlags(type, operand1, operand2, result);
                Debugger.Helper.setRegister('eax', resultEaxDec);
                Debugger.Helper.setRegister('edx', resultEdxDec);

                break;

            /*
             * Divison works like this
             *
             * div ecx (edx:eax / ecx)
             *
             * Remainder stored in edx
             * Quotient value stored in eax
             */
            case 'div':
                var value1 = Debugger.Config.registers[param1.value]['dec'];

                var value2 = Debugger.Config.registers['edx']['bin'];
                var value3 = Debugger.Config.registers['eax']['bin'];

                var value4 = Debugger.Helper.baseConverter(value2 + value3, 2, 10);

                // trick to floor
                var resultEax = ~~(Debugger.Helper.toDec(value4) / value1);
                var resultEdx = Debugger.Helper.toDec(value4) % value1;

                var operand1 = value4;
                var operand2 = value1;
                var type = 'div';

                Debugger.Helper.setFlags(type, operand1, operand2, resultEax);
                Debugger.Helper.setRegister('eax', resultEax);
                Debugger.Helper.setRegister('edx', resultEdx);

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
