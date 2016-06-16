var Debugger = Debugger || {};

Debugger.Helper = (function() {

    function drawRegisters(registerType) {
        var object = {};
        
        /* Clear current html */
        $('.' + registerType).html('');
        
        if (registerType === 'registers') {
            object = Debugger.Config.registers;
            $('.' + registerType).append('<tr><th>register</th><th>dec.</th><th>hex.</th><th>bin.</th></tr>');
        }
        
        if (registerType === 'flags') {
            object = Debugger.Config.flags;
        }
        
        for (var key in object) {
            if (!object.hasOwnProperty(key)) { continue; }
            
            var tds = '';
            
            // check if we have another object inside the object
            if (object[key] === Object(object[key])) {
                for (var key2 in object[key]) {
                    tds += '<td>' + object[key][key2] + '</td>';
                }
            } else {
                tds += '<td>' + object[key] + '</td>';
            }

            $('.' + registerType).append('<tr><th>' + key + '</th>' + tds + '</tr>');
        }
    }
    
    function drawCodeLine(instructionPointer, instructionPointerToAddressCode) {
        var addressCode = instructionPointerToAddressCode[instructionPointer];

        $('.code [data-address]').removeClass('active');
        $('.code [data-address=' + addressCode + ']').addClass('active');
        
        return true;
    }
    
    function assignAddressToCode(code, instructions) {
        count = 0;
        code = code.replace(/^(.*)$/mg, function(match) {
            // console.log(match);
            count++;
            return '<span class="line" data-address="' + count + '">' + match + '</span>';
        });
        
        $('.code').html(code);
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
        code = removeTooMuchWhitespace(code);
        code = removeComments(code);
        code = removeTooMuchWhitespace(code);
        return code;
    }
    
    function removeComments(code) {
        // remove all empty lines
        code = code.replace(/^;.*/mg,'');

        return code;
    }

    function removeTooMuchWhitespace(code) {
        var pattern;
        
        // matches whitespace (equivalent of \s), except we removed \n 
        var whitespace = '[ \f\r\t\v\u00a0\u1680\u180e\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]';
        
        // remove all empty lines
        code = code.replace(/^\n/mg,'');
        
        // reduce all whitespace to 1 space char.
        pattern = new RegExp(whitespace + '+', 'g')
        code = code.replace(pattern,' ');
        
        // remove preceeding whitespaces
        pattern = new RegExp('^' + whitespace + '+', 'gm')
        code = code.replace(pattern, '');

        // remove comma's with 1 space char.
        code = code.replace(/\s*,\s*/g,' ');

        return code;
    }

    function checkMnemonic(mnemonic) {
        if (Debugger.Config.instructionList[mnemonic]) {
            return true;
        }
        return false;
    }

    /* Check if we have a label without a ":" on the end */
    function isLabelName(param) {
        // check if we have a label
        if (/[a-zA-Z]{1}[a-zA-Z0-9_]*/.test(param)) {
            return true;
        }
        return false;
    }

    /* Check if we have a label with a ":" on the end */
    function isLabel(param) {
        // check if we have a label
        if (/[a-zA-Z]{1}[a-zA-Z0-9_]*:/.test(param)) {
            return true;
        }
        return false;
    }

    function getTypeParam(param) {
        // check if we have a register
        if (Debugger.Config.registers[param]) {
            return 'reg';
        }
        
        if (isLabelName(param)) {
            return 'label';
        }
        
        return 'val';
    }

    /* Set the flags and draw new table */
    function setFlags(type, operand1, operand2, result) {
        updateSignFlag(result);
        updateZeroFlag(result);
        updateCarryFlag(result);
        updateOverflowFlag(type, operand1, operand2, result);

        drawRegisters('flags');
    }

    /* Set 1 flag */
    function setFlag(flag, value) {
        Debugger.Config.flags[flag] = value;
    }

    function setRegister(register, value) {
        Debugger.Config.registers[register]['dec'] = toDec(value);
        
        Debugger.Config.registers[register]['hex'] = toHex(value, 8);
        
        Debugger.Config.registers[register]['bin'] = toBin(value, 32);
        
        drawRegisters('registers');
    }

    function updateSignFlag(result) {
        var resultBin = toBin(result, 32);
        
        if (resultBin.length >= 32 && resultBin.substr(-32).substr(0,1) === '1') {
            setFlag('sf', 1);
        } else {
            setFlag('sf', 0);
        }
    }

    function updateZeroFlag(result) {
        if (result === 0) {
            setFlag('zf', 1);
        } else {
            setFlag('zf', 0);
        }
    }

    /* Only works for 32bit registers (2^32 = 4294967296) */
    // FIXME
    function updateCarryFlag(result) {
        if (result < 0 || result > 4294967295) {
            setFlag('cf', 1);
        } else {
            setFlag('cf', 0);
        }
    }
    
    function toBin(value, length) {
        return addPadding((value >>> 0).toString(2), length, 0);
    }

    function toHex(value, length) {
        return addPadding((value).toString(16), length, 0);
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
        setFlag('of', 0);
        
        if (isSignedPositive(operand1) && isSignedPositive(operand2) && type === 'add' && isSignedNegative(result)) {
            setFlag('of', 1);
        }

        if (isSignedNegative(operand1) && isSignedNegative(operand2) && type === 'add' && isSignedPositive(result)) {
            setFlag('of', 1);
        }

        if (isSignedNegative(operand1) && isSignedPositive(operand2) && type === 'sub' && isSignedPositive(result)) {
            setFlag('of', 1);
        }

        if (isSignedPositive(operand1) && isSignedNegative(operand2) && type === 'sub' && isSignedNegative(result)) {
            setFlag('of', 1);
        }

        if (isSignedPositive(operand1) && isSignedPositive(operand2) && type === 'div' && isSignedNegative(result)) {
            setFlag('of', 1);
        }

        if (isSignedNegative(operand1) && isSignedNegative(operand2) && type === 'div' && isSignedNegative(result)) {
            setFlag('of', 1);
        }

        if (isSignedNegative(operand1) && isSignedPositive(operand2) && type === 'div' && isSignedPositive(result)) {
            setFlag('of', 1);
        }

        if (isSignedPositive(operand1) && isSignedNegative(operand2) && type === 'div' && isSignedPositive(result)) {
            setFlag('of', 1);
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
    function isSignedPositive(value) {
        return value >= 0 && value <= 2147483647;
    }

    function isSignedNegative(value) {
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

        if (/0x[0-9a-fA-F]+/.test(value)) {
            return 16;
        }
        
        return false;
    }
    
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

    return {
        setRegister: setRegister,
        setFlags: setFlags,
        echoInstruction: echoInstruction,
        getTypeParam: getTypeParam,
        isLabel: isLabel,
        isLabelName: isLabelName,
        checkMnemonic: checkMnemonic,
        codeCleanup: codeCleanup,
        splitCode: splitCode,
        drawRegisters: drawRegisters,
        drawCodeLine: drawCodeLine,
        assignAddressToCode: assignAddressToCode,
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
