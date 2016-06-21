var Debugger = Debugger || {};

Debugger.Html = (function() {

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
                    if (!object[key].hasOwnProperty(key2)) { continue; }
                    
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
        drawRegisters: drawRegisters,
        drawCodeLine: drawCodeLine,
        initHelp: initHelp,
        assignAddressToCode: assignAddressToCode
    };
})();
