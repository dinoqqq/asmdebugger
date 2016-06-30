var Debugger = Debugger || {};

Debugger.Helper = (function() {

    function _removeComments(code) {
        // remove all comments
        code = code.replace(/;.*/g,'');

        return code;
    }

    function _removeTooMuchWhitespace(code) {
        var pattern;

        // matches whitespace (equivalent of \s), except we removed \n
        var whitespace = '[ \f\r\t\v\u00a0\u1680\u180e\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]';

        // remove all empty lines
        code = code.replace(/^\n/mg,'');

        // reduce all whitespace to 1 space char.
        pattern = new RegExp(whitespace + '+', 'g');
        code = code.replace(pattern,' ');

        // remove preceeding whitespaces
        pattern = new RegExp('^' + whitespace + '+', 'gm');
        code = code.replace(pattern, '');

        // remove comma's with 1 space char.
        code = code.replace(/\s*,\s*/g,' ');

        return code;
    }

    /*
     * Will tell if the value is singed, based on the resultSize (in bits).
     *
     * Example for for 32bit registers (2^32 = 4294967296)
     * Signed limits 32bit = [-2147483648, 2147483647]
     *
     * So operands in base 10 [0, 2147483647] are +
     * So operands in base 10 [2147483648, 4294967295] are -
     *
     */
    function _isSignedPositive(value, resultSize) {
        if (!resultSize) {
            console.log('_isSignedPositive: Throw in a resultSize');
            return false;
        }

        var maxSize = Math.pow(2, resultSize) / 2 - 1;
        return value >= 0 && value <= maxSize;
    }

    function _isSignedNegative(value, resultSize) {
        if (!resultSize) {
            console.log('_isSignedNegative: Throw in a resultSize');
            return false;
        }
        var minSize = Math.pow(2, resultSize) / 2;
        var maxSize = Math.pow(2, resultSize) - 1;

        return value >= minSize && value <= maxSize;
    }

    function assignInstructionPointerToAddressCode(instructionObjects, instructionPointerToAddressCode) {
        var instructionCounter = 1;

        $('.code .line').each(function() {
            var instructionLine = $(this).text();
            instructionLine = codeCleanup(instructionLine);

            if (instructionLine !== "" && instructionCounter > Object.keys(instructionObjects).length) {
                console.log('Trying to assign ' + instructionLine + ' but instructionObjects is already processed');

                // continue
                return true;
            }

            if (instructionObjects[instructionCounter] && instructionLine === instructionObjects[instructionCounter].instruction) {
                instructionPointerToAddressCode[instructionCounter] = $(this).data('address');
                instructionCounter++;
            }
        });

        return true;
    }

    function splitCode(code) {
        code = code.trim();
        return code.split("\n");
    }

    function codeCleanup(code) {
        code = _removeTooMuchWhitespace(code);
        code = _removeComments(code);
        code = _removeTooMuchWhitespace(code); // FIXME, only call this once
        return code;
    }

    function checkMnemonic(mnemonic) {
        return !!Debugger.Config.instructionList[mnemonic];
    }

    /* Check if the string is available in the labels array */
    function isLabel(string) {
        return Debugger.Vars.labels.indexOf(Debugger.Helper.cleanLabel(string)) > -1;
    }

    /* Check if we have a label with a ":" on the end */
    function isLabelName(param) {
        return /[a-zA-Z]{1}[a-zA-Z0-9_]*:/.test(param);
    }

    /*
     * Remove the trailing ":" from a label, but only when it has one.
     */
    function cleanLabel(label) {
        if (label.substr(-1) === ':') {
            return label.substr(0, label.length-1);
        }
        return label;
    }

    /*
     * Check if the type is a register
     */
    function isTypeRegister(type) {
        return 'reg' === type.substr(0,3);
    }

    /*
     * Throw in a string and find out what type it is.
     */
    function getTypeParam(string) {
        // check if we have a register
        var register;
        if (register = Debugger.Helper.getTypeRegister(string)) {
            return register;
        }

        if (Debugger.Helper.isLabel(string)) {
            return 'label';
        }

        if (Debugger.Helper.extractBase(string) > 0) {
            return 'val';
        }

        return false;
    }

    /*
     * Set the flags and draw new table.
     */
    function setFlags(type, operand1, operand2, result, resultSize) {
        Debugger.Helper.updateSignFlag(result, resultSize);
        Debugger.Helper.updateZeroFlag(result);
        Debugger.Helper.updateCarryFlag(type, result, resultSize);
        Debugger.Helper.updateOverflowFlag(type, operand1, operand2, result, resultSize);

        Debugger.Html.drawFlags();
    }

    /* Set 1 flag */
    function setFlag(flag, value) {
        Debugger.Config.flags[flag] = value;

        Debugger.Html.drawFlags();
    }

    /*
     * This functions sets a register based on the type (e.g. reg32, reg16, reg8h, reg8l).
     *
     * It takes the value and adds 0 padding based on the length of the register.
     * Example:
     *
     * mov eax, 100101b ; 37 decimal, 25 hex
     *
     * Binary: extend the length of the value to 32 (because eax = 32b) and save it.
     * 0000000000000000000000000100101
     *
     * Hex: extend the length of the value to 8 (because eax = 8h) and save it.
     * 00000025
     *
     * Decimal: no extension
     * 37
     *
     */
    function setRegister(register, type, value) {
        // Determine how many positions need to be edited per base
        var registerOffsets = Debugger.Vars.getRegisterOffsetValues(type);

        /* First update the 32 bit register with it's new value. Then cut off every 16 bit / 8 bit register parts and
         * assign those to the other registers. */
        var typeList = Debugger.Config.typeList;
        var reg32bit = Debugger.Helper.get32BitRegister(register, type);

        // Calculate the bin and hex values
        var hex = Debugger.Helper.toHex(value, (registerOffsets.hexEnd - registerOffsets.hexStart + 1));
        var bin = Debugger.Helper.toBin(value, (registerOffsets.binEnd - registerOffsets.binStart + 1));

        // Set the 32 bit hex register
        var hexValue = Debugger.Helper.replacePartOfString(
            Debugger.Config.registers[reg32bit]['reg32']['value']['hex'],
            hex,
            registerOffsets.hexStart,
            registerOffsets.hexEnd
        );

        // Set the 32 bit bin register
        var binValue = Debugger.Helper.replacePartOfString(
            Debugger.Config.registers[reg32bit]['reg32']['value']['bin'],
            bin,
            registerOffsets.binStart,
            registerOffsets.binEnd
        );

        // Now iterate over all registers, and get the part of the string we need, and set the new register value.
        for (var key in typeList) {
            if (!typeList.hasOwnProperty(key)) { continue; }

            var regType = typeList[key];
            if (!Debugger.Config.registers[reg32bit].hasOwnProperty(regType)) { continue; }


            var registerOffsetsPerType = Debugger.Vars.getRegisterOffsetValues(regType);

            // Get the part of the string
            var binValuePerType = Debugger.Helper.getPartOfString(
                binValue,
                registerOffsetsPerType.binStart,
                registerOffsetsPerType.binEnd
            );

            // Get the part of the string
            var hexValuePerType = Debugger.Helper.getPartOfString(
                hexValue,
                registerOffsetsPerType.hexStart,
                registerOffsetsPerType.hexEnd
            );

            // set bin value
            Debugger.Config.registers[reg32bit][regType]['value']['bin'] = binValuePerType;
            // set hex value
            Debugger.Config.registers[reg32bit][regType]['value']['hex'] = hexValuePerType;

            // set dec value
            Debugger.Config.registers[reg32bit][regType]['value']['dec'] =
                Debugger.Helper.limitDec(Debugger.Helper.baseConverter(binValuePerType, 2, 10));
            // set sDec value
            Debugger.Config.registers[reg32bit][regType]['value']['sDec'] =
                Debugger.Helper.limitSDec(Debugger.Helper.binToSignedInt(binValuePerType));
        }

        Debugger.Html.drawRegisters();
    }

    /*
     * Replace part of a string by index (starts at 0)
     *
     * Example
     * 'abc','c', 1, 1 => 'acc'
     * 'abcdef','', 2, 3 => 'abef'
     */
    function replacePartOfString(string, replace, start, end) {
        if (start < 0 || end < 0) {
            console.log('Debugger.Helper.replacePartOfString: "start" or "end" can not be < 0');
            return false;
        }
        return string.substr(0,start) + replace + string.substr(end + 1);
    }

    /*
     * Get the part of a string by index (starts at 0)
     *
     * Example
     * 'abc', 1, 1 => 'a'
     * 'abcdef', 2, 3 => 'cd'
     */
    function getPartOfString(string, start, end) {
        if (start < 0 || end < 0) {
            console.log('Debugger.Helper.getPartOfString: "start" or "end" can not be < 0');
            return false;
        }
        return string.substr(start, (end - start + 1));
    }

    function resetFlags() {
        for (var key in Debugger.Config.flags) {
            if (!Debugger.Config.flags.hasOwnProperty(key)) { continue; }

            Debugger.Config.flags[key] = 0;
        }
        Debugger.Html.drawFlags();
    }

    /*
     * Set all the registers to 0.
     */
    function resetRegisters() {
        var typeList = Debugger.Config.typeList;

        for (var key in Debugger.Config.registers) {
            if (!Debugger.Config.registers.hasOwnProperty(key)) { continue; }

            for (var key2 in typeList) {
                if (!Debugger.Config.registers[key].hasOwnProperty(typeList[key2])) { continue; }

                var size = Debugger.Helper.getSizeOfRegister(typeList[key2]);

                Debugger.Config.registers[key][typeList[key2]]['value']['dec'] = 0;
                Debugger.Config.registers[key][typeList[key2]]['value']['sDec'] = 0;
                Debugger.Config.registers[key][typeList[key2]]['value']['hex'] = Debugger.Helper.addPadding('0', size/4);
                Debugger.Config.registers[key][typeList[key2]]['value']['bin'] = Debugger.Helper.addPadding('0', size);
            }
        }
        Debugger.Html.drawRegisters();
    }

    /*
     * Check the sign of the result, based on the size of the register
     */
    function updateSignFlag(result, resultSize) {
        var resultBin = Debugger.Helper.toBin(result, resultSize);

        if (resultBin.length >= resultSize && resultBin.substr(resultSize * -1).substr(0,1) === '1') {
            Debugger.Helper.setFlag('sf', 1);
        } else {
            Debugger.Helper.setFlag('sf', 0);
        }
    }

    /*
     * Check if the result is zero
     */
    function updateZeroFlag(result) {
        if (result === 0) {
            Debugger.Helper.setFlag('zf', 1);
        } else {
            Debugger.Helper.setFlag('zf', 0);
        }
    }

    /*
     * Check if the result is < 0 or larger then the size of the resultSize
     *
     * Do not set carry flag for inc/dec operations
     *
     */
    function updateCarryFlag(type, result, resultSize) {
        if (type === 'dec') { return true; }
        if (type === 'inc') { return true; }

        var maxResult = Math.pow(2, resultSize);

        if (result < 0 || result > (maxResult - 1)) {
            Debugger.Helper.setFlag('cf', 1);
        } else {
            Debugger.Helper.setFlag('cf', 0);
        }
    }

    /*
     * This function expects an integer and returns a binary (as string) value with given length. Handles negative
     * input integers and returns the binary value in two's complement representation.
     */
    function toBin(value, length) {
        // return the bin in two's complement representation when value < 0
        // call twoComplement twice, so we have the value in binary two's complement representation
        if (value < 0) {
            var twos = Debugger.Helper.twoComplement(value, length);
            twos = Debugger.Helper.twoComplement(twos, length, 2);

            return twos;
        }

        return Debugger.Helper.addPadding((value).toString(2), length, 0);
    }

    /*
     * This function expects an integer and returns a hex (as string) value with given length. Handles negative
     * input integers and returns the hex value.
     *
     * Examples:
     * input 4, 8 output 4
     * input 255, 8 output FF
     * input 256, 8 output 0
     * input 257, 8 output 0
     * input -4, 8 output FC
     * input -1, 8 output FF
     */
    function toHex(value, length) {
        // return the bin in two's complement representation when value < 0
        // call twoComplement twice, so we have the value in binary two's complement representation
        if (value < 0) {
            // calculate the length in binary
            binLength = length * 4;

            var twos = Debugger.Helper.twoComplement(value, binLength);
            twos = Debugger.Helper.twoComplement(twos, binLength, 2);

            // convert back to hex and return
            return Debugger.Helper.baseConverter(twos, 2, 16);
        }

        return Debugger.Helper.addPadding((value).toString(16), length, 0);
    }

    /*
     * This function limits a signed decimal number, with a max of 32 bits (default). Getting higher or lower than the
     * second param, makes the function starts counting at the higher/lower boundary again.
     *
     * Example:
     * input -4, 4: 2^4 = 8 possible values, upper bound = 7, lower bound = -8, output = -4
     * input -9, 4: 2^4 = 8 possible values, upper bound = 7, lower bound = -8, output = 7
     * input 8, 4: 2^4 = 8 possible values, upper bound = 7, lower bound = -8, output = -8
     * input -3, 4: output = -3
     */
    function limitSDec(value, maxLengthInBits) {
        maxLengthInBits = maxLengthInBits || 32;

        var possibleValues = Math.pow(2, maxLengthInBits);

        // we only need the lower bound
        var lowerBound = (possibleValues / 2) * -1;
        var upperBound = (possibleValues / 2) - 1;

        // when it's between the bounds, return
        if (value <= upperBound && value >= lowerBound) {
            return value;
        }

        var result = value % Math.pow(2, maxLengthInBits);

        if (result >= 0) {
            result = result - 16;
        }

        if (result < 0) {
            result = result + 16;
        }

        return result;
    }

    /*
     * This function limits a decimal number, with a max of 32 bits (default). Getting higher than the second param,
     * makes the function starts counting at zero again.
     *
     * Example:
     * input 5, 2 => output 1
     * input 4294967297, 32 => output 1
     */
    function limitDec(value, maxLengthInBits) {
        maxLengthInBits = maxLengthInBits || 32;

        return value % Math.pow(2, maxLengthInBits);
    }

    /*
     * In the following cases the overflow flag is set:
     * + + + = -
     * - + - = +
     * - - + = +
     * + - - = -
     *
     * + / + = -
     * - / - = -
     * - / + = +
     * + / - = +
     *
     */
    function updateOverflowFlag(type, operand1, operand2, result, resultSize) {
        Debugger.Helper.setFlag('of', 0);

        if (type === 'add'
            && _isSignedPositive(operand1, resultSize)
            && _isSignedPositive(operand2, resultSize)
            && _isSignedNegative(result, resultSize))
        {
            Debugger.Helper.setFlag('of', 1);
        }

        if (type === 'add'
            && _isSignedNegative(operand1, resultSize)
            && _isSignedNegative(operand2, resultSize)
            && _isSignedPositive(result, resultSize))
        {
            Debugger.Helper.setFlag('of', 1);
        }

        if (type === 'sub'
            && _isSignedNegative(operand1, resultSize)
            && _isSignedPositive(operand2, resultSize)
            && _isSignedPositive(result, resultSize))
        {
            Debugger.Helper.setFlag('of', 1);
        }

        if (type === 'sub'
            && _isSignedPositive(operand1, resultSize)
            && _isSignedNegative(operand2, resultSize)
            && _isSignedNegative(result, resultSize))
        {
            Debugger.Helper.setFlag('of', 1);
        }

        if (type === 'div'
            && _isSignedPositive(operand1, resultSize)
            && _isSignedPositive(operand2, resultSize)
            && _isSignedNegative(result, resultSize))
        {
            Debugger.Helper.setFlag('of', 1);
        }

        if (type === 'div'
            && _isSignedNegative(operand1, resultSize)
            && _isSignedNegative(operand2, resultSize)
            && _isSignedNegative(result, resultSize))
        {
            Debugger.Helper.setFlag('of', 1);
        }

        if (type === 'div'
            && _isSignedNegative(operand1, resultSize)
            && _isSignedPositive(operand2, resultSize)
            && _isSignedPositive(result, resultSize))
        {
            Debugger.Helper.setFlag('of', 1);
        }

        if (type === 'div'
            && _isSignedPositive(operand1, resultSize)
            && _isSignedNegative(operand2, resultSize)
            && _isSignedPositive(result, resultSize))
        {
            Debugger.Helper.setFlag('of', 1);
        }
    }

    /*
     * Add padding to a string.
     */
    function addPadding(string, length, paddingChar) {
        var pad_char = typeof paddingChar !== 'undefined' ? paddingChar : '0';
        var pad = new Array(1 + length).join(pad_char);
        return (pad + string).slice(-pad.length);
    }

    /*
     * Extract the base of a value.
     *
     * Supported examples:
     *
     * 2 (= base 10)
     * 2d (= base 10)
     *
     * 1b (= base 2)
     *
     * 0ABh (= base 16)
     * 0xAB (= base 16)
     */
    function extractBase(value) {
        if (/^-?[0-1]+b$/.test(value)) {
            return 2;
        }

        if (/^-?0[0-9a-fA-F]+h$/.test(value)) {
            return 16;
        }

        if (/^-?0x[0-9a-fA-F]+$/.test(value)) {
            return 16;
        }

        if (/^-?[0-9]+d?$/.test(value)) {
            return 10;
        }

        return false;
    }

    /*
     * This function converts a value from a binary to a signed int.
     *
     * Examples:
     *
     * 1001 => -7
     * 001 => 1
     * 11111111 => -1
     */
    function binToSignedInt(bin) {
        // check if the MSB is a 0, then just return the normal int value.
        if (bin.substr(0,1) === '0') {
            return parseInt(bin, 2);
        }

        // calculate the lowest possible number
        var possibleNumbers = Math.pow(2, bin.substr(1).length);

        // calculate the unsigned number (without the sign bit)
        var valueInt = parseInt(bin.substr(1), 2);

        // all possible numbers - the unsigned number times -1 is the result
        return ((possibleNumbers - valueInt) * -1);
    }

    /*
     * This function converts a value from one base to another base. Always returns a string, except when toBase is 10,
     * then a int is returned.
     *
     * When converting to base 10 a lot of allowed values are automatically stripped to the right int.
     * Examples:
     *
     * 1b => 1
     * 0Ah => 10
     * 0xA => 10
     * 2d => 2
     */
    function baseConverter(value, fromBase, toBase) {
        var valueInt = parseInt(value, fromBase);
        var newValue = valueInt.toString(toBase);

        // when in base 10 convert to int
        if (toBase === 10) {
            newValue = parseInt(newValue, 10);
        }

        // when we have a negative number, return the two's complement
        if (valueInt < 0 && toBase === 2) {
            Debugger.Helper.twoComplement(valueInt * -1, newValue.length);
        }

        return newValue;
    }

    function echoInstruction(instructionObject, preText, afterText) {
        var message = '';
        preText = preText || '';
        afterText = afterText || '';

        if (instructionObject.param0 && instructionObject.param0.value) {
            message += ' ' + instructionObject.param0.value;
        }

        if (instructionObject.param1 && instructionObject.param1.value) {
            message += ' ' + instructionObject.param1.value;
        }

        if (instructionObject.param2 && instructionObject.param2.value) {
            message += ' ' + instructionObject.param2.value;
        }

        console.log(preText + message + afterText);
    }

    function findLabelAddress(label, instructionObjects) {
        var match = label + ':';

        for (var key in instructionObjects) {
            if (!instructionObjects.hasOwnProperty(key)) { continue; }

            if (instructionObjects[key].param0.type === 'label' && instructionObjects[key].param0.value === match) {
                return parseInt(key, 10);
            }
        }

        return false;
    }

    /*
     * Throw in a 32bit register and a type and return the value of the register. Optionally the second parameter can be
     * a base number, defaults to 10;
     *
     * Examples:
     * Register values: eax = 00010A0Fh
     *
     * input "ah", output "10" (= 0Ah)
     * input "al", output "15" (= 0Fh)
     * input "ax", output "2575" (= 0A0Fh)
     * input "eax", output "68111" (= 0001 0A0Fh)
     * input "ax", "2", output "101000001111" (= 0A0Fh)
     */
    function register32AndTypeToRegisterValue(register32, type, base) {
        var registers = Debugger.Config.registers;
        var typeList = Debugger.Config.typeList;

        if (!registers.hasOwnProperty(register32)) {
            console.log('register32AndTypeToRegisterValue: register32 not recognized "' + register32 + '"');
            return false;
        }

        if (!registers[register32].hasOwnProperty(type)) {
            console.log(
                'register32AndTypeToRegisterValue: type not recognized "' + type + '" for register "' + register32 + '"'
            );
            return false;
        }

        var dec = registers[register32][type]['value']['dec'];
        return Debugger.Helper.baseConverter(dec, 10, base);
    }


    /*
     * Throw in a register string and return the value of the register. Optionally the second parameter can be
     * a base number, defaults to 10;
     *
     * Examples:
     * Register values: eax = 00010A0Fh
     *
     * input "ah", output "10" (= 0Ah)
     * input "al", output "15" (= 0Fh)
     * input "ax", output "2575" (= 0A0Fh)
     * input "eax", output "68111" (= 0001 0A0Fh)
     * input "ax", "2", output "101000001111" (= 0A0Fh)
     */
    function registerToRegisterValue(register, base) {
        base = base || 10;

        var registers = Debugger.Config.registers;
        var typeList = Debugger.Config.typeList;

        for (var key in registers) {
            if (!registers.hasOwnProperty(key)) { continue; }

            for (var key2 in typeList) {
                if (!typeList.hasOwnProperty(key2)) { continue; }
                if (!registers[key].hasOwnProperty(typeList[key2])) { continue; }

                if (registers[key][typeList[key2]].name === register) {
                    var dec = registers[key][typeList[key2]]['value']['dec'];
                    return Debugger.Helper.baseConverter(dec, 10, base);
                }
            }
        }

        return false;
    }

    /*
     * Throw in a param object and return the value of the register. Optionally the second parameter can be
     * a base number, defaults to 10;
     *
     * Examples:
     * Register values: eax = 00010A0Fh
     *
     * input { value: "ah", type: "reg8h" }, output "10" (= 0Ah)
     * input { value: "al", type: "reg8l" } output "15" (= 0Fh)
     * input { value: "ax", type: "reg16" } output "2575" (= 0A0Fh)
     * input { value: "eax", type: "reg32" } output "68111" (= 0001 0A0Fh)
     * input { value: "ax", type: "reg16" }, "2", output "101000001111" (= 0A0Fh)
     */
    function paramToRegisterValue(param, base) {
        base = base || 10;

        var register32Bit = Debugger.Helper.get32BitRegister(param.value, param.type);
        var registerBinValue = Debugger.Config.registers[register32Bit][param.type]['value']['bin'];
        return Debugger.Helper.baseConverter(registerBinValue, 2, base);
    }

    /*
     * Get the type of a register
     *
     * Examples:
     * input "al", output "reg8l"
     * input "bh", output "reg8h"
     * input "eax", output "reg32"
     */
    function getTypeRegister(register) {
        var registers = Debugger.Config.registers;
        var typeList = Debugger.Config.typeList;

        for (var key in registers) {
            if (!registers.hasOwnProperty(key)) { continue; }

            for (var key2 in typeList) {
                if (registers[key][typeList[key2]]
                    && registers[key][typeList[key2]]['name']
                    && registers[key][typeList[key2]]['name'] === register)
                {
                    return typeList[key2];
                }
            }
        }

        return false;
    }

    /*
     * Gets the 32 bit variant of the register
     *
     * Example:
     * input "al", output "eax"
     * input "ax", output "eax"
     * input "si", output "esi"
     * input "ebx", output "ebx"
     */
    function get32BitRegister(register, type) {
        for (var key in Debugger.Config.registers) {
            if (!Debugger.Config.registers.hasOwnProperty(key)) { continue; }

            if (Debugger.Config.registers[key][type]
                && Debugger.Config.registers[key][type]['name']
                && Debugger.Config.registers[key][type]['name'] === register)
            {
                return key;
            }
        }

        return false;
    }

    /*
     * When we have a 8 bit register, ensure that we get the low 8 bit register
     *
     * Examples:
     * "reg8h" => "reg8l"
     * "reg8l" => "reg8l"
     * "reg32" => "reg32"
     * "reg16" => "reg16"
     */
    function ensure8BitLow(string) {
        return string === 'reg8h' ? 'reg8l' : string;
    }

    /*
     * Returns the size of the register type. Optionally it can return with "l" and "h" for 8 bit registers, default not.
     */
    function getSizeOfRegister(registerType, withLowHigh) {
        withLowHigh = withLowHigh || false;

        if (!withLowHigh && (registerType.substr(-1) === 'l' || registerType.substr(-1) === 'h')) {
            return parseInt(registerType.substr(3, registerType.length - 4), 10);
        }

        return parseInt(registerType.substr(3), 10);
    }

    /*
     * Get all available registers and returns them in an array
     */
    function getAllRegisters() {
        var registers = Debugger.Config.registers;
        var typeList = Debugger.Config.typeList;
        var allRegisters = [];

        for (var key in registers) {
            if (!registers.hasOwnProperty(key)) {
                continue;
            }

            for (var key2 in typeList) {
                if (!typeList.hasOwnProperty(key2)) {
                    continue;
                }

                if (registers[key][typeList[key2]] && registers[key][typeList[key2]]['name']) {
                    allRegisters.push(registers[key][typeList[key2]]['name']);
                }
            }
        }

        return allRegisters;
    }

    /*
     * Calculathe the two's complement of a value and returns it. Expects an integer as input and returns a base value
     * which can be given as third input (default base 10).
     *
     * Does not work with negative integers.
     *
     * Examples:
     * input 4, 3; (4d = 100b) output 100
     *
     */
    function twoComplement(value, size, toBase) {
        toBase = toBase || 10;

        // when we have a negative value, just return the positive value
        if (value < 0) {
            return Debugger.Helper.baseConverter(value * -1, 10, toBase);
        }

        value = value.toString(2);

        value = Debugger.Helper.addPadding(value, size);

        // replace all 1's with #
        value = value.replace(/1/g, '#');

        // replace all 0's with 1
        value = value.replace(/0/g, '1');

        // replace all #'s with 0
        value = value.replace(/#/g, '0');

        // get the decimal
        value = Debugger.Helper.baseConverter(value, 2, 10);

        // add 1
        value++;

        // get the base given the input
        value = Debugger.Helper.baseConverter(value, 10, toBase);

        return value;
    }

    return {
        setRegister: setRegister,
        setFlags: setFlags,
        setFlag: setFlag,
        resetRegisters: resetRegisters,
        resetFlags: resetFlags,
        replacePartOfString: replacePartOfString,
        getPartOfString: getPartOfString,
        echoInstruction: echoInstruction,
        getTypeRegister: getTypeRegister,
        get32BitRegister: get32BitRegister,
        isTypeRegister: isTypeRegister,
        addPadding: addPadding,
        getTypeParam: getTypeParam,
        isLabel: isLabel,
        isLabelName: isLabelName,
        cleanLabel: cleanLabel,
        checkMnemonic: checkMnemonic,
        register32AndTypeToRegisterValue: register32AndTypeToRegisterValue,
        registerToRegisterValue: registerToRegisterValue,
        paramToRegisterValue: paramToRegisterValue,
        codeCleanup: codeCleanup,
        splitCode: splitCode,
        getSizeOfRegister: getSizeOfRegister,
        findLabelAddress: findLabelAddress,
        assignInstructionPointerToAddressCode: assignInstructionPointerToAddressCode,
        updateZeroFlag: updateZeroFlag,
        updateSignFlag: updateSignFlag,
        updateCarryFlag: updateCarryFlag,
        updateOverflowFlag: updateOverflowFlag,
        toBin: toBin,
        toHex: toHex,
        limitDec: limitDec,
        limitSDec: limitSDec,
        binToSignedInt: binToSignedInt,
        extractBase: extractBase,
        ensure8BitLow: ensure8BitLow,
        baseConverter: baseConverter,
        getAllRegisters: getAllRegisters,
        twoComplement: twoComplement
    };
})();
