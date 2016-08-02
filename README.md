# ASM Debugger
A simple version of an Assembly debugger. Currently build with *Intel syntax* support, but extensible. This is the
source code of the implementation of [asmdebugger.com](http://asmdebugger.com).

### Installation
Just checkout the code and go to `index.html` to run the application. Go to `test.html` to run all end-to-end tests.

### Features
Currently only a few basic mnemonics are supported. For a complete list of supported features checkout
[asmdebugger.com](http://asmdebugger.com).

### Contribute
Let me know if you have some improvements or want to add you own ASM dialect. 

#### Tests
When you write your own tests in seperate Spec files, simply add them to `src/_header_test.html` and run the
simple build script `bash src/build/build.sh`.  This will generate `test.html` in the root of the project with the 
necessary source files from Jasmine inserted. 

For an example of the tests that are run visit [asmdebugger.com/test.html](http://asmdebugger.com/test.html).
