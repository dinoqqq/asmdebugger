describe("instruction cdq:", function() {
    beforeEach(function() {
        Test.clear();
    });

    describe("basic", function() {
        it("should take value into eax and sign extend it into edx:eax with 0", function() {
            Test.code('mov eax, 00001111000011110000000011111111b');
            Test.code('mov edx, 00001111000011110000000011111111b');
            Test.code('cdq');
            Test.next(3);

            expect($('.eax.bin').text()).toEqual('00001111 00001111 00000000 11111111');
            expect($('.edx.bin').text()).toEqual('00000000 00000000 00000000 00000000');
        });

        xit("should take value into ax and sign extend it into eax with 1", function() {
            Test.code('mov eax, 10001111000011110000000011111111b');
            Test.code('mov edx, 00001111000011110000000011111111b');
            Test.code('cdq');
            Test.next(3);

            expect($('.eax.bin').text()).toEqual('10001111 00001111 00000000 11111111');
            expect($('.edx.bin').text()).toEqual('11111111 11111111 11111111 11111111');
        });

        it("should not do anything with other registers", function() {
            Test.code('mov ebx, 11111111000000001111111100000000b');
            Test.code('mov ecx, 11111111000000001111111100000000b');
            Test.code('mov esi, 11111111000000001111111100000000b');
            Test.code('mov edi, 11111111000000001111111100000000b');
            Test.code('cdq');
            Test.next(5);

            expect($('.ebx.bin').text()).toEqual('11111111 00000000 11111111 00000000');
            expect($('.ecx.bin').text()).toEqual('11111111 00000000 11111111 00000000');
            expect($('.esi.bin').text()).toEqual('11111111 00000000 11111111 00000000');
            expect($('.edi.bin').text()).toEqual('11111111 00000000 11111111 00000000');
        });
    });
});

