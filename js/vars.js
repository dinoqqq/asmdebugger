var Debugger = Debugger || {};

Debugger.Vars = (function() {
    /*
     * The raw code, user input
     */
    var code;

    /*
     * The raw code splitted per line in an array and comments removed
     */
    var instructions;

    /*
     * Object with instructions and metadata about the instructions
     */
    var instructionObjects = {};

    /*
     * The pointer for the next instruction
     */
    var instructionPointer = 1;

    /*
     * The link between instruction pointer (internal instruction object) and address code (the code in HTML)
     */
    var instructionPointerToAddressCode = {};

    /*
     * Object with all addresses for the code in HTML
     */
    var addresses = {};

    /*
     * Array with all labels of the code in it. Labels are stored without an ending ":"
     */
    var labels = [];

    /*
     * Get the values used for multiplication and division.
     *
     * For example: "mul" works like this:
     *
     * mul ecx (ecx * eax = edx:eax)
     * mul cx (cx * ax = dx:ax)
     * mul cl (cl * al = ah:al = ax)
     * mul ch (ch * al = ah:al = ax)
     */
    var getMulDivValues = function(sizeRegister) {
        var size;
        var register1;
        var register2;

        switch(sizeRegister) {
            case 32:
                size = sizeRegister;
                register1 = 'eax';
                register2 = 'edx';
                break;
            case 16:
                size = sizeRegister;
                register1 = 'ax';
                register2 = 'dx';
                break;
            case 8:
                size = sizeRegister;
                register1 = 'al';
                register2 = 'ah';
                break;
            default:
                console.log(sizeRegister);
                console.log('getMulDivValues: sizeRegister not recognized');
                return false;
        }

        return  {
            size: size,
            register1: register1,
            register2: register2
        }
    };

    /*
     * Get the offset / indexes of which part should be extracted from the 32 bit register, based on a register type.
     */
    function getRegisterOffsetValues(registerType) {
        var hexStart;
        var hexEnd;
        var binStart;
        var binEnd;

        switch(registerType) {
            case 'reg8h':
                hexStart = 4;
                hexEnd = 5;

                binStart = 16;
                binEnd = 23;
                break;
            case 'reg8l':
                hexStart = 6;
                hexEnd = 7;

                binStart = 24;
                binEnd = 31;
                break;
            case 'reg16':
                hexStart = 4;
                hexEnd = 7;

                binStart = 16;
                binEnd = 31;
                break;
            case 'reg32':
                hexStart = 0;
                hexEnd = 7;

                binStart = 0;
                binEnd = 31;
                break;
            default:
                return false;
        }


        return {
            hexStart: hexStart,
            hexEnd: hexEnd,
            binStart: binStart,
            binEnd: binEnd
        }
    }


    return {
        code: code,
        instructions: instructions,
        instructionObjects: instructionObjects,
        instructionPointer: instructionPointer,
        instructionPointerToAddressCode: instructionPointerToAddressCode,
        addresses: addresses,
        labels: labels,
        getMulDivValues: getMulDivValues,
        getRegisterOffsetValues: getRegisterOffsetValues
    }
})();
