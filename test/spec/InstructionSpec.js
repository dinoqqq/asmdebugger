/**
 * Basic instruction tests
 *
 */
describe("basic instruction:", function() {
    beforeEach(function() {
        Test.clear();
    });

    describe("label", function() {
        it("should give an error when jump instruction has a non existing label", function() {
            Test.code('one:');
            Test.code('mov eax, 1');
            Test.code('two:');
            Test.code('mov ebx, eax');
            Test.code('jmp three');
            Test.next(1);

            expect(Test.getError()).toEqual('Could not validate instruction (obj): jmp three');
        });
    });
});
