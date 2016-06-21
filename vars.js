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
});
