var Debugger = Debugger || {};

Debugger.Helper = (function() {

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

    function checkMnemonic(mnemonic) {
        return !!Debugger.Config.instructionList[mnemonic];
    }

    /* Check if we have a label without a ":" on the end */
    function isLabelName(param) {
        return /[a-zA-Z]{1}[a-zA-Z0-9_]*/.test(param);
    }

    /* Check if we have a label with a ":" on the end */
    function isLabel(param) {
        return /[a-zA-Z]{1}[a-zA-Z0-9_]*:/.test(param);
    }

    /*
     * Check if the type is a register
     */
    function isTypeRegister(type) {
        return 'reg' === type.substr(0,3);
    }

    function getTypeParam(param) {
        // check if we have a register
        var register;
        if (register = Debugger.Helper.getTypeRegister(param)) {
            return register;
        }

        if (Debugger.Helper.isLabelName(param)) {
            return 'label';
        }

        return 'val';
    }

    /*
     * Get the type of a register
     */
    function getTypeRegister(register) {
        if (!Debugger.Config.registerTypes) {
            console.log('No register types found in config');
            return false;
        }

        var registerTypes = Debugger.Config.registerTypes;

        for (key in registerTypes) {
            if (!registerTypes.hasOwnProperty(key)) {
                continue;
            }

            if (registerTypes[key].bit32 && registerTypes[key].bit32 === register) {
                return 'reg32';
            }

            if (registerTypes[key].bit16 && registerTypes[key].bit16 === register) {
                return 'reg16';
            }

            if (registerTypes[key].bit8h && registerTypes[key].bit8h === register) {
                return 'reg8h';
            }

            if (registerTypes[key].bit8l && registerTypes[key].bit8l === register) {
                return 'reg8l';
            }
        }

        return false;
    }

    /* Set the flags and draw new table */
    function setFlags(type, operand1, operand2, result) {
        Debugger.Helper.updateSignFlag(result);
        Debugger.Helper.updateZeroFlag(result);
        Debugger.Helper.updateCarryFlag(result);
        Debugger.Helper.updateOverflowFlag(type, operand1, operand2, result);

        Debugger.Html.drawRegisters('flags');
    }

    /* Set 1 flag */
    function setFlag(flag, value) {
        Debugger.Config.flags[flag] = value;

        Debugger.Html.drawRegisters('flags');
    }

    function setRegister(register, value) {
        Debugger.Config.registers[register]['dec'] = Debugger.Helper.toDec(value);

        Debugger.Config.registers[register]['hex'] = Debugger.Helper.toHex(value, 8);

        Debugger.Config.registers[register]['bin'] = Debugger.Helper.toBin(value, 32);

        Debugger.Html.drawRegisters('registers');
    }

    function resetFlags() {
        for (key in Debugger.Config.flags) {
            Debugger.Config.flags[key] = 0;
        }
        Debugger.Html.drawRegisters('flags');
    }

    function resetRegisters() {
        for (key in Debugger.Config.registers) {
            for (key2 in Debugger.Config.registers[key]) {
                Debugger.Config.registers[key][key2] = 0;
            }
        }
        Debugger.Html.drawRegisters('registers');
    }

    function updateSignFlag(result) {
        var resultBin = Debugger.Helper.toBin(result, 32);

        if (resultBin.length >= 32 && resultBin.substr(-32).substr(0,1) === '1') {
            Debugger.Helper.setFlag('sf', 1);
        } else {
            Debugger.Helper.setFlag('sf', 0);
        }
    }

    function updateZeroFlag(result) {
        if (result === 0) {
            Debugger.Helper.setFlag('zf', 1);
        } else {
            Debugger.Helper.setFlag('zf', 0);
        }
    }

    /* Only works for 32bit registers (2^32 = 4294967296) */
    // FIXME
    function updateCarryFlag(result) {
        if (result < 0 || result > 4294967295) {
            Debugger.Helper.setFlag('cf', 1);
        } else {
            Debugger.Helper.setFlag('cf', 0);
        }
    }

    function toBin(value, length) {
        if (value.length <= 32) {
            // this trims the value to max. 32 bits
            value = value >>> 0;
        }
        return Debugger.Helper.addPadding((value).toString(2), length, 0);
    }

    function toHex(value, length) {
        return Debugger.Helper.addPadding((value).toString(16), length, 0);
    }

    function toDec(value, length) {
        return value % 4294967296;
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
     * Only works for 32bit registers (2^32 = 4294967296) FIXME
     * Signed limits 32bit = [-2147483648, 2147483647]
     *
     * So operands in base 10 [0, 2147483647] are +
     * So operands in base 10 [2147483648, 4294967295] are -
     *
     */
    function updateOverflowFlag(type, operand1, operand2, result) {
        Debugger.Helper.setFlag('of', 0);

        if (_isSignedPositive(operand1) && _isSignedPositive(operand2) && type === 'add' && _isSignedNegative(result)) {
            Debugger.Helper.setFlag('of', 1);
        }

        if (_isSignedNegative(operand1) && _isSignedNegative(operand2) && type === 'add' && _isSignedPositive(result)) {
            Debugger.Helper.setFlag('of', 1);
        }

        if (_isSignedNegative(operand1) && _isSignedPositive(operand2) && type === 'sub' && _isSignedPositive(result)) {
            Debugger.Helper.setFlag('of', 1);
        }

        if (_isSignedPositive(operand1) && _isSignedNegative(operand2) && type === 'sub' && _isSignedNegative(result)) {
            Debugger.Helper.setFlag('of', 1);
        }

        if (_isSignedPositive(operand1) && _isSignedPositive(operand2) && type === 'div' && _isSignedNegative(result)) {
            Debugger.Helper.setFlag('of', 1);
        }

        if (_isSignedNegative(operand1) && _isSignedNegative(operand2) && type === 'div' && _isSignedNegative(result)) {
            Debugger.Helper.setFlag('of', 1);
        }

        if (_isSignedNegative(operand1) && _isSignedPositive(operand2) && type === 'div' && _isSignedPositive(result)) {
            Debugger.Helper.setFlag('of', 1);
        }

        if (_isSignedPositive(operand1) && _isSignedNegative(operand2) && type === 'div' && _isSignedPositive(result)) {
            Debugger.Helper.setFlag('of', 1);
        }
    }

   /*
    * Only works for 32bit registers (2^32 = 4294967296) FIXME
    * Signed limits 32bit = [-2147483648, 2147483647]
    *
    * So operands in base 10 [0, 2147483647] are +
    * So operands in base 10 [2147483648, 4294967295] are -
    *
    */
    function _isSignedPositive(value) {
        return value >= 0 && value <= 2147483647;
    }

    function _isSignedNegative(value) {
        return value >= 2147483648 && value <= 4294967295;
    }

    function addPadding(n, p, c) {
        var pad_char = typeof c !== 'undefined' ? c : '0';
        var pad = new Array(1 + p).join(pad_char);
        return (pad + n).slice(-pad.length);
    }

    function extractBase(value) {
        if (/[0-9]+/.test(value)) {
            return 10;
        }

        if (/[0-1]+b/.test(value)) {
            return 2;
        }

        if (/[0-9a-fA-F]+h/.test(value)) {
            return 16;
        }

        if (/0[0-9a-fA-F]+/.test(value)) {
            return 16;
        }

        return false;
    }

    function baseConverter(value, fromBase, toBase) {
        var valueInt = parseInt(value, fromBase);
        var newValue = valueInt.toString(toBase);

        // when in base 10 convert to int
        if (Debugger.Helper.toBase === 10) {
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

        for (key in instructionObjects) {
            if (!instructionObjects.hasOwnProperty(key)) { continue; }

            if (instructionObjects[key].param0.type === 'label' && instructionObjects[key].param0.value === match) {
                return parseInt(key, 10);
            }
        }

        return false;
    }

    return {
        setRegister: setRegister,
        setFlags: setFlags,
        setFlag: setFlag,
        resetRegisters: resetRegisters,
        resetFlags: resetFlags,
        echoInstruction: echoInstruction,
        getTypeRegister: getTypeRegister,
        isTypeRegister: isTypeRegister,
        addPadding: addPadding,
        getTypeParam: getTypeParam,
        isLabel: isLabel,
        isLabelName: isLabelName,
        checkMnemonic: checkMnemonic,
        codeCleanup: codeCleanup,
        splitCode: splitCode,
        findLabelAddress: findLabelAddress,
        assignInstructionPointerToAddressCode: assignInstructionPointerToAddressCode,
        updateZeroFlag: updateZeroFlag,
        updateSignFlag: updateSignFlag,
        updateCarryFlag: updateCarryFlag,
        updateOverflowFlag: updateOverflowFlag,
        toBin: toBin,
        toHex: toHex,
        toDec: toDec,
        extractBase: extractBase,
        baseConverter: baseConverter
    };
})();
