/* FIXME:
- comments behind instructions
- label address, based on fixed address instead of array index
- flags register
- arithmetic (and flag setting) is based on 32bits
- two complements representation in the table registers
- now adding and subtracting are hardcoded, not looking is param1 is source of destination (FASM)
- minus numbers in hex. register needs to be fixed
- what to do when numbers are too large for processor?
- is toDec needed before we set the flags (because maybe carry flag can not be detected)
 */

var Debugger = Debugger || {};

Debugger.WebApp = (function() {
    var code;
    var instructions;
    var instructionObjects = {};
    var instructionPointer = 1;
    var instructionPointerToAddressCode = {};
    var addresses = {};

    /*
     * Set the instructions and the code variables
     */
    function init() {
        // clear all variables
        code = '';
        instructions = '';
        instructionObjects = {};
        instructionPointer = 1;
        instructionPointerToAddressCode = {};
        addresses = {};
        
        code = $('.code').text();
        if (!code) {
            console.log('We need some code!');
            return false;
        }
        
        var codeAddress = Debugger.Helper.assignAddressToCode(code, instructions);
        code = Debugger.Helper.codeCleanup(code);
        
        instructions = Debugger.Helper.splitCode(code);
        if (!createInstructionObjects(instructions)) {
            return;
        }
        instructionPointer = 1;
        

        Debugger.Helper.assignInstructionPointerToAddressCode(instructionObjects, instructionPointerToAddressCode);
        
        Debugger.Helper.drawRegisters('registers');
        Debugger.Helper.drawRegisters('flags');
    }
    
    function createInstructionObjects() {
        if (!instructions) {
            console.log('No instructions found');
            return;
        }

        if (instructionPointer >= instructions.length) {
            console.log('No more instructions');
            return;
        }

        /* Loop over all instructions and set them at the right address in the instructionObjects object */
        for (var k = 0; k < instructions.length; k++) {
            var instruction = readNextInstruction(instructions, k);

            var instructionObject;
            if (!(instructionObject = createInstructionObject(instruction))) {
                console.log('Could not validate instruction (obj): ' + instruction);
                return false;
            }

            instructionObjects[instructionPointer] = instructionObject;
            instructionPointer++;
        }
        
        return true;
    }

    function executeNextLine() {
        if (instructionPointer > Object.keys(instructionObjects).length) {
            console.log('No more instructions');
            return;
        }
        
        if (!Debugger.Helper.drawCodeLine(instructionPointer, instructionPointerToAddressCode)) {
            console.log('Could not draw code line for: ' + instructionObjects[instructionPointer].instruction);
            return false;
        }

        // Get the current instruction
        var instructionObject = instructionObjects[instructionPointer];
        instructionPointer++;
        
        // when we have a label just proceed
        if (instructionObject.param0.type === 'label') {
            return true;
        }

        if (!validateInstruction(instructionObject)) {
            console.log('Could not validate instruction: ' + instructionObject.instruction);
            return false;
        }
        
        if (!executeInstruction(instructionObject)) {
            console.log('Could not execute instruction: ' + instructionObject.instruction);
            return false;
        }
    }

    function readNextInstruction(instructions, index) {
        return instructions[index];
    }

    function createInstructionObject(instruction) {
        var instructionObject = {};
        var instructionParams = instruction.split(' ');
        
        instructionObject.instruction = instruction;
        
        if (instructionParams.length === 0) {
            return false;
        }

        if (instructionParams[0]) {
            var value = instructionParams[0];
            var param0 = {
                value: value
            };
            
            // check if we have a label or mnemonic
            if (Debugger.Helper.isLabel(param0.value)) {
                param0.type = 'label';
            } else if (Debugger.Helper.checkMnemonic(param0.value)) {
                param0.type = 'mnemonic';
            } else {
                console.log('Mnemonic not supported: ' + param0.value);
                return false;
            }
            
            instructionObject.param0 = param0;
        }
        
        if (instructionParams[1]) {
            var param1 = {
                type: Debugger.Helper.getTypeParam(instructionParams[1]),
                value: instructionParams[1]
            };

            if (param1.type === 'val') {
                param1.base = Debugger.Helper.extractBase(param1.value);
            }

            if (param1.type === 'val' && param1.base === 10) {
                param1.value = Debugger.Helper.toDec(param1.value);
            }

            instructionObject.param1 = param1;
        }

        if (instructionParams[2]) {
            var param2 = {
                type: Debugger.Helper.getTypeParam(instructionParams[2]),
                value: instructionParams[2]
            };
            
            if (param2.type === 'val') {
                param2.base = Debugger.Helper.extractBase(param2.value);
            }

            if (param2.type === 'val' && param2.base === 10) {
                param2.value = Debugger.Helper.toDec(param2.value);
            }
            
            instructionObject.param2 = param2;
        }
        
        return instructionObject;
    }

    function validateInstruction(instructionObject) {
        var param0 = instructionObject.param0;
        var param1 = instructionObject.param1;
        var param2 = instructionObject.param2;
        
        // check if the types are allowed with this instruction
        chosenInstructionList = Debugger.Config.instructionList[param0.value];
        for (i=0; i<chosenInstructionList.length; i++) {
            var length = chosenInstructionList[i].length;

            switch(length) {
                case 1:
                    if (!param1) {
                        continue;
                    }

                    if (param1.type === chosenInstructionList[i][0])
                    {
                        return true;
                    }
                    break;
                case 2:
                    if (!param1 || !param2) {
                        continue;
                    }

                    if (param1.type === chosenInstructionList[i][0] && param2.type === chosenInstructionList[i][1])
                    {
                        return true;
                    }
                    break;
            }
        }
        
        Debugger.Helper.echoInstruction(instructionObject, 'No instruction found for: ');
        return false;
    }

    function executeInstruction(instructionObject) {
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
                Debugger.Helper.setRegister(param1.value, result);
                
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
              * Divison works like this
              * 
              * div ecx (edx:eax / ecx)
              * 
              * Remainder stored in edx
              * Division value stored in eax
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

            case 'jmp':
                var address;
                if (!(address = findLabelAddress(instructionObject.param1.value))) {
                    console.log('Jump to, but label not found');
                    return;
                }

                instructionPointer = address;
                break;

            case 'jz':
            case 'jnz':
            case 'js':
            case 'jns':
            case 'jc':
            case 'jnc':
            case 'jo':
            case 'jno':
                if (!(address = findLabelAddress(instructionObject.param1.value))) {
                    console.log('Jump to, but label not found');
                    return;
                }

                var secondLetter = param0.value.substr(1,1);
                var thirdLetter = param0.value.substr(2,1);

                if (secondLetter === 'n' && Debugger.Config.flags[thirdLetter + 'f'] === 0) {
                    instructionPointer = address;
                }

                if (secondLetter !== 'n' && Debugger.Config.flags[secondLetter + 'f'] === 1) {
                    instructionPointer = address;
                }
                break;

            default:
                console.log('No instruction execution found');
                break;
        }

        Debugger.Helper.echoInstruction(instructionObject);
        return true;
    }
    
    function updateZeroFlag(calculation) {
        if (calculation === 0) {
            Debugger.Helper.setFlags('zf', 1);
        } else {
            Debugger.Helper.setFlags('zf', 0);
        }
    }

    function findLabelAddress(label) {
        var match = label + ':';
        
        for (key in instructionObjects) {
            if (!instructionObjects.hasOwnProperty(key)) { continue; }
            
            if (instructionObjects[key].param0.type === 'label' && instructionObjects[key].param0.value === match) {
                return parseInt(key, 10);
            }
        } 
        
        return false;
    }
    
    return {
        init: init,
        executeNextLine: executeNextLine
    };
})();


$('document').ready(function() {
    Debugger.WebApp.init();

    $('.next').on('click', function() {
        Debugger.WebApp.executeNextLine();
    });
    
    $('.new').on('click', function() {
        Debugger.WebApp.init();
    });
});
