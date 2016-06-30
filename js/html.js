var Debugger = Debugger || {};

Debugger.Html = (function() {

    function toggleExpand($row) {
        $row.toggleClass('open');

        var registerName = $row.data('register-name');
        $('.parent-' + registerName + ':not(.parent)').toggle();
    }

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

    function initRegisters() {
        var registers = Debugger.Config.registers;
        var typeList = Debugger.Config.typeList;

        /* Clear current html */
        $('.registers').html('');
        $('.registers').append('<tr class="top-header"><th></th><th>dec.</th><th>dec. (s)</th><th>hex.</th><th>bin.</th></tr>');

        for (var key in registers) {
            if (!registers.hasOwnProperty(key)) { continue; }

            for (var key2 in typeList) {
                if (!registers[key].hasOwnProperty(typeList[key2])) { continue; }

                var name = registers[key][typeList[key2]]['name'];
                var isParent = name === key ? 'parent' : '';
                var emptyTds = '<td></td><td></td><td></td><td></td>';

                $('.registers').append(
                    '<tr class="' + isParent + ' ' + 'parent-' + key + ' ' + name + ' '
                    + typeList[key2] + '" data-register-name="' + name + '"><th class="reg-header">' + name + '</th>'
                    + emptyTds + '</tr>'
                );
            }
        }

        Debugger.Html.toggleExpand($('.eax'));
    }

    function drawRegisters() {
        var registers = Debugger.Config.registers;
        var typeList = Debugger.Config.typeList;

        for (var key in registers) {
            if (!registers.hasOwnProperty(key)) { continue; }

            for (var key2 in typeList) {
                if (!registers[key].hasOwnProperty(typeList[key2])) { continue; }

                var tds = '';
                var name = registers[key][typeList[key2]]['name'];
                var reg = registers[key][typeList[key2]];

                tds += '<td>' + reg['value']['dec'] + '</td>';
                tds += '<td>' + reg['value']['sDec'] + '</td>';
                tds += '<td>' + _readableFormat(reg['value']['hex'], 4) + '</td>';
                tds += '<td>' + _readableFormat(reg['value']['bin'], 8) + '</td>';

                $('.registers .' + name + ' td').remove();
                $('.registers .' + name).append(tds);
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


    /*
     * Create a listener on pasting of text in the code block. Remove all html.
     */
    function cleanupCodePaste() {
        // When code is pasted into the code block, sometimes HTML is copied together with it. Remove it.
        $('.code').on('paste', function () {
            var element = this;
            setTimeout(function () {
                Debugger.Html.cleanupUserInput();
            }, 100);
        });
    }

    function cleanupUserInput() {
        var codeHtml = $('.code').html();

        // replace <br> with \n
        codeHtml = codeHtml.replace(/(<br ?\/?>)+/mg,"\n");

        // add a container (needed for text() function)
        codeHtml = '<div>' + codeHtml + '</div>';

        // remove all html
        var codeText = $(codeHtml).text();
        $('.code').text(codeText);
    }

    return {
        drawFlags: drawFlags,
        initRegisters: initRegisters,
        drawRegisters: drawRegisters,
        drawCodeLine: drawCodeLine,
        initHelp: initHelp,
        assignAddressToCode: assignAddressToCode,
        toggleExpand: toggleExpand,
        cleanupCodePaste: cleanupCodePaste,
        cleanupUserInput: cleanupUserInput
    };
})();
