var Test = Test || {};

Test = function() {

    var consoleLogMessages = [];

    function logConsoleLog() {
        var oldLog = console.log;
        console.log = function (message) {
            consoleLogMessages.push(message);
            oldLog.apply(console, arguments);
        };
    }

    function getConsoleLog(number) {
        return consoleLogMessages.slice(-1 * number)[0]
    }

    function getError() {
        return getConsoleLog(2);
    }

    function code(code) {
        var oldText = $('.code').text();
        $('.code').text(oldText + code + "\n");
        $('.code').keyup();
    }

    function next(times) {
        times = times || 1;

        for (var i=0; i<times; i++) {
            $('.next').click();
        }
    }

    /**
     * Return the value of a register.
     *
     * regvaluetype can be any general regster or flag register
     *
     * Example inputs:
     * "eax.dec"
     * "si.bin"
     * "al.sdec"
     * "of"
     * "sf"
     */
    function reg(regValueType) {
        if(regValueType.indexOf('.') === -1) {
            return $('.' + regValueType).text();
        }

        regValueType = regValueType.split('.');
        var reg = regValueType[0];
        var valueType = regValueType[1];

        return $('.' + reg + '.' + valueType).text().trim();
    }

    function clear() {
        $('.code').text('');
    }

    function selectedLineAddress() {
        return $('.code span.active').data('address');
    }

    return {
          code: code,
          next: next,
          reg: reg,
          getConsoleLog: getConsoleLog,
          logConsoleLog: logConsoleLog,
          clear: clear,
          getError: getError,
          selectedLineAddress
    }
}();

// Start the console.log
Test.logConsoleLog();
