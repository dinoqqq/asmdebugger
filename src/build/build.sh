#!/bin/bash
# This scripts copies index.html to test.html and inserts the 
# necessary javascript and css files for testing. After running
# the script, a new test.html is generated in the root folder.

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
TEST_HEADER_HTML="$DIR/../_header_test.html"
INDEX_HTML="$DIR/../../index.html"
TEST_HTML="$DIR/../../test.html"

echo "INSERT TEST HEADERS IN test.html"

# Copy index.html to test.html
cp $INDEX_HTML $TEST_HTML
echo "1. cp index.html test.html: $?"

# Replace the closing head tag with the test headers
sed -i "/<\/head>/ {
    h
    r $TEST_HEADER_HTML
    g
    N
}" $TEST_HTML
echo "2. inserting test scripts in header: $?"
echo "all done!"
