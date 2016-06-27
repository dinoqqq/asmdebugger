var Debugger = Debugger || {};

Debugger.Html = (function() {

    /*
     * Format a string with spaces after a given number
     */
    function _readableFormat(value, spaceAfter) {
        if (value === null) { return 0 }

        var newValue = '';
        var i;

        for(i = 0; i < value.length; i++) {
            newValue += value[i];

            if (i > 0 && (i+1) % spaceAfter === 0) {
                newValue += ' ';
            }
        }

        return newValue;
    }

    function drawFlags() {
        var flags = Debugger.Config.flags;

        /* Clear current html */
        $('.flags').html('');

        for (var key in flags) {
            if (!flags.hasOwnProperty(key)) { continue; }

            var tds = '';
            tds += '<td>' + flags[key] + '</td>';

            $('.flags').append('<tr><th>' + key + '</th>' + tds + '</tr>');
        }
    }


    function drawRegisters() {
        var registers = Debugger.Config.registers;
        var typeList = Debugger.Config.typeList;

        /* Clear current html */
        $('.registers').html('');
        $('.registers').append('<tr><th></th><th>dec.</th><th>dec. (s)</th><th>hex.</th><th>bin.</th></tr>');

        for (var key in registers) {
            if (!registers.hasOwnProperty(key)) { continue; }

            for (var key2 in typeList) {
                if (!registers[key].hasOwnProperty(typeList[key2])) { continue; }

                var tds = '';

                tds += '<td>' + registers[key][typeList[key2]]['value']['dec'] + '</td>';
                tds += '<td>' + registers[key][typeList[key2]]['value']['sDec'] + '</td>';
                tds += '<td>' + _readableFormat(registers[key][typeList[key2]]['value']['hex'], 4) + '</td>';
                tds += '<td>' + _readableFormat(registers[key][typeList[key2]]['value']['bin'], 8) + '</td>';

                $('.registers').append('<tr><th class="' + typeList[key2] + '">' + registers[key][typeList[key2]]['name'] + '</th>' + tds + '</tr>');
            }
        }
    }

    function drawCodeLine(instructionPointer, instructionPointerToAddressCode) {
        var addressCode = instructionPointerToAddressCode[instructionPointer];

        $('.code [data-address]').removeClass('active');
        $('.code [data-address=' + addressCode + ']').addClass('active');

        return true;
    }

    function initHelp() {
        var listItem = '';

        $('.supported-instructions li').remove();

        for (key in Debugger.Config.instructionList) {
            listItem = '<li>' + key + ': <ul>';

            for (key2 in Debugger.Config.instructionList[key]) {
                listItem += '<li>' + Debugger.Config.instructionList[key][key2] + '</li>';
            }

            listItem += '</ul></li>';

            $('.supported-instructions').append(listItem);
        }
    }

    function assignAddressToCode(code) {
        var count = 0;
        code = code.replace(/^(.*)$/mg, function(match) {
            count++;
            return '<span class="line" data-address="' + count + '">' + match + '</span>';
        });

        $('.code').html(code);
    }

    return {
        drawFlags: drawFlags,
        drawRegisters: drawRegisters,
        drawCodeLine: drawCodeLine,
        initHelp: initHelp,
        assignAddressToCode: assignAddressToCode
    };
})();
