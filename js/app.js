/* FIXME:
- comments behind instructions
- flags register
- arithmetic (and flag setting) is based on 32bits
- two complements representation in the table registers
- now adding and subtracting are hardcoded, not looking if param1 is source or destination (Intel syntax)
- minus numbers in hex. register needs to be fixed
- what to do when numbers are too large for processor?
- is toDec needed before we set the flags (because maybe carry flag can not be detected)
 */

var Debugger = Debugger || {};

Debugger.App = (function() {
    /*
     * Set the instructions and the code variables
     */
    function init() {
        // clear all variables
        Debugger.Vars.code = '';
        Debugger.Vars.instructions = '';
        Debugger.Vars.instructionObjects = {};
        Debugger.Vars.instructionPointer = 1;
        Debugger.Vars.instructionPointerToAddressCode = {};
        Debugger.Vars.addresses = {};

        Debugger.Vars.code = $('.code').text();
        if (!Debugger.Vars.code) {
            console.log('We need some code!');
            return false;
        }

        var codeAddress = Debugger.Html.assignAddressToCode(Debugger.Vars.code);
        Debugger.Vars.code = Debugger.Helper.codeCleanup(Debugger.Vars.code);

        Debugger.Vars.instructions = Debugger.Helper.splitCode(Debugger.Vars.code);

        // Extract all labels before hand
        if (!(Debugger.Vars.labels = _extractLabels(Debugger.Vars.instructions))) {
            return false;
        }

        if (!(Debugger.Vars.instructionObjects = _createInstructionObjects(Debugger.Vars.instructions, Debugger.Vars.instructionPointer))) {
            return false;
        }

        Debugger.Helper.assignInstructionPointerToAddressCode(Debugger.Vars.instructionObjects, Debugger.Vars.instructionPointerToAddressCode);

        Debugger.Html.drawRegisters('registers');
        Debugger.Html.drawRegisters('flags');

        Debugger.Helper.resetFlags();
        Debugger.Helper.resetRegisters();

        Debugger.Html.initHelp();

        return true;
    }
    /*
     * Read the next instruction in the instructionObjects with the instructionPointer and execute it.
     */
    function executeNextLine() {
        if (Debugger.Vars.instructionPointer > Object.keys(Debugger.Vars.instructionObjects).length) {
            console.log('No more instructions');
            return;
        }

        if (!Debugger.Html.drawCodeLine(Debugger.Vars.instructionPointer, Debugger.Vars.instructionPointerToAddressCode)) {
            console.log('Could not draw code line for: ' + Debugger.Vars.instructionObjects[instructionPointer].instruction);
            return false;
        }

        // Get the current instruction
        var instructionObject = Debugger.Vars.instructionObjects[Debugger.Vars.instructionPointer];
        Debugger.Vars.instructionPointer++;

        // when we have a label just proceed
        if (instructionObject.param0.type === 'label') {
            return true;
        }

        if (!_validateInstruction(instructionObject)) {
            console.log('Could not validate instruction: ' + instructionObject.instruction);
            return false;
        }

        if (!Debugger.Instructions.executeInstruction(instructionObject, Debugger.Vars.instructionObjects)) {
            console.log('Could not execute instruction: ' + instructionObject.instruction);
            return false;
        }
    }

    function _readNextInstruction(instructions, index) {
        return instructions[index];
    }

    /*
     * Extract all labels, based on a set of instructions
     */
    function _extractLabels(instructions) {
        var labels = [];
        var registers = Debugger.Helper.getAllRegisters();

        if (!instructions) {
            console.log('No instructions found');
            return false;
        }

        /* Loop over all instructions and check if we have a label */
        for (var i = 0; i < instructions.length; i++) {
            var instruction = _readNextInstruction(instructions, i);

            // check if this is a label name
            if (!Debugger.Helper.isLabelName(instruction)) {
                continue;
            }

            instruction = Debugger.Helper.cleanLabel(instruction);

            // check if it is not an allowed value
            if (Debugger.Helper.extractBase(instruction) > 0) {
                console.log('Label name can not be like an allowed numeric value: ' + instruction);
                continue;
            }


            // check if the name is not like a register
            if (registers.indexOf(instruction) > 0) {
                console.log('Label name can not be like a register name: ' + instruction);
                continue;
            }

            labels.push(instruction);
        }

        return labels;
    }

    /*
     * Create all instructionObjects combined in one object "instructionObjects"
     */
    function _createInstructionObjects(instructions, instructionPointer) {
        var instructionObjects = {};

        if (!instructions) {
            console.log('No instructions found');
            return false;
        }

        if (instructionPointer >= instructions.length) {
            console.log('No more instructions');
            return false;
        }

        /* Loop over all instructions and set them at the right address in the instructionObjects object */
        for (var k = 0; k < instructions.length; k++) {
            var instruction = _readNextInstruction(instructions, k);

            var instructionObject;
            if (!(instructionObject = _createInstructionObject(instruction))) {
                console.log('Could not validate instruction (obj): ' + instruction);
                return false;
            }

            instructionObjects[instructionPointer] = instructionObject;
            instructionPointer++;
        }

        /* reset the instruction pointer */
        instructionPointer = 1;

        return instructionObjects;
    }

    /*
     * Create 1 instructionObject and return it
     */
    function _createInstructionObject(instruction) {
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

            // save as integer when in base 10
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

            // save as integer when in base 10
            if (param2.type === 'val' && param2.base === 10) {
                param2.value = Debugger.Helper.toDec(param2.value);
            }

            instructionObject.param2 = param2;
        }

        return instructionObject;
    }

    function _validateInstruction(instructionObject) {
        var param0 = instructionObject.param0;
        var param1 = instructionObject.param1;
        var param2 = instructionObject.param2;

        // check if the types are allowed with this instruction
        var chosenInstructionList = Debugger.Config.instructionList[param0.value];

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

    return {
        init: init,
        executeNextLine: executeNextLine
    };
})();


$('document').ready(function() {
    var resetCode = false;

    Debugger.App.init();

    $('.next').on('click', function() {
        if (resetCode) {
            Debugger.App.init();

            resetCode = false;
        }

        Debugger.App.executeNextLine();
    });

    $('.help').on('click', function() {
        $('.help-content').toggle();
        $(this).toggleClass('active');
    });

    $('.code').on('keyup', function() {
        resetCode = true;
    });
});
