var Debugger = Debugger || {};

Debugger.Helper = (function() {

    function _removeComments(code) {
        // remove all empty lines
        code = code.replace(/^;.*/mg,'');

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
        Debugger.Helper.updateCarryFlag(result, resultSize);
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
        var hexStart;
        var hexEnd;
        var binStart;
        var binEnd;

        var registerOffsets = Debugger.Vars.getRegisterOffsetValues(type);

        var hex = Debugger.Helper.toHex(value, (registerOffsets.hexEnd - registerOffsets.hexStart + 1));
        var bin = Debugger.Helper.toBin(value, (registerOffsets.binEnd - registerOffsets.binStart + 1));

        var register32Bit = Debugger.Helper.get32BitRegister(register, type);

        // Set the hex register
        var hexValue = Debugger.Helper.replacePartOfString(
            Debugger.Config.registers[register32Bit]['value']['hex'],
            hex,
            registerOffsets.hexStart,
            registerOffsets.hexEnd
        );
        Debugger.Config.registers[register32Bit]['value']['hex'] = hexValue;
        Debugger.Config.registers[register32Bit]['valueFormat']['hex'] = _readableFormat(hexValue, 4);

        // Set the bin register
        var binValue = Debugger.Helper.replacePartOfString(
            Debugger.Config.registers[register32Bit]['value']['bin'],
            bin,
            registerOffsets.binStart,
            registerOffsets.binEnd
        );

        Debugger.Config.registers[register32Bit]['value']['bin'] = binValue;
        Debugger.Config.registers[register32Bit]['valueFormat']['bin'] = _readableFormat(binValue, 8);

        // Always take the whole 32 bit value of the register to show in the decimal register
        var base10 = Debugger.Helper.baseConverter(Debugger.Config.registers[register32Bit]['value']['bin'], 2, 10);

        // Set the decimal register
        Debugger.Config.registers[register32Bit]['value']['dec'] = Debugger.Helper.limitDec(base10);
        Debugger.Config.registers[register32Bit]['valueFormat']['dec'] = Debugger.Helper.limitDec(base10);

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
            console.log('Debugger.Helper.getPartOfString: "start" or "end" can not be < 0');
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
        for (var key in Debugger.Config.registers) {
            if (!Debugger.Config.registers.hasOwnProperty(key)) { continue; }

            for (var key2 in Debugger.Config.registers[key]['value']) {
                if (!Debugger.Config.registers[key]['value'].hasOwnProperty(key2)) { continue; }

                if (key2 === 'dec') {
                    Debugger.Config.registers[key]['value'][key2] = 0;
                    Debugger.Config.registers[key]['valueFormat'][key2] = 0;
                } else if (key2 === 'hex') {
                    Debugger.Config.registers[key]['value'][key2] = '00000000';
                    Debugger.Config.registers[key]['valueFormat'][key2] = _readableFormat('00000000', 4);
                } else if (key2 === 'bin') {
                    Debugger.Config.registers[key]['value'][key2] = '00000000000000000000000000000000';
                    Debugger.Config.registers[key]['valueFormat'][key2] = _readableFormat('00000000000000000000000000000000', 8);
                }

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
     */
    function updateCarryFlag(result, resultSize) {
        var maxResult = Math.pow(2, resultSize);

        if (result < 0 || result > (maxResult - 1)) {
            Debugger.Helper.setFlag('cf', 1);
        } else {
            Debugger.Helper.setFlag('cf', 0);
        }
    }

    /*
     * This function expects an integer and returns a binary (as string) value with given length.
     */
    function toBin(value, length) {
        return Debugger.Helper.addPadding((value).toString(2), length, 0);
    }

    /*
     * This function expects an integer and returns a hexidecimal (as string) value with given length.
     */
    function toHex(value, length) {
        return Debugger.Helper.addPadding((value).toString(16), length, 0);
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
     * FIXME: What to do with multiplication?
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
     * Throw in a param object and return the value of the 32 bit register. Optionally the second parameter can be
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
    function paramToRegisterValue(param, base) {
        base = base || 10;

        var register32Bit = Debugger.Helper.get32BitRegister(param.value, param.type);

        // Get the 32 bit
        var register32BinValue = Debugger.Config.registers[register32Bit]['value']['bin'];
        var registerOffsets = Debugger.Vars.getRegisterOffsetValues(param.type);

        // Get part from the string that we need
        var binValue = Debugger.Helper.getPartOfString(
            register32BinValue,
            registerOffsets.binStart,
            registerOffsets.binEnd
        );

        return Debugger.Helper.baseConverter(binValue, 2, base);
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
                if (!typeList.hasOwnProperty(key2)) { continue; }

                if (registers[key][typeList[key2]] && registers[key][typeList[key2]] === register) {
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

            if (Debugger.Config.registers[key][type] && Debugger.Config.registers[key][type] === register) {
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
     * Returns the size of the register. Optionally it can return with "l" and "h" for 8 bit registers, default not.
     */
    function getSizeOfRegister(register, withLowHigh) {
        withLowHigh = withLowHigh || false;

        if (!withLowHigh && (register.substr(-1) === 'l' || register.substr(-1) === 'h')) {
            return parseInt(register.substr(3, register.length - 4), 10);
        }

        return parseInt(register.substr(3), 10);
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

                if (registers[key][typeList[key2]]) {
                    allRegisters.push(registers[key][typeList[key2]]);
                }
            }
        }

        return allRegisters;
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
        extractBase: extractBase,
        ensure8BitLow: ensure8BitLow,
        baseConverter: baseConverter,
        getAllRegisters: getAllRegisters
    };
})();
