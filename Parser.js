//parse functions
function parseProgram () {
    parseBlock();
    
    //match $
    
}

function parseBlock () {
    //match {
    
    parseStatementList();
    
    //match }
    
}

function parseStatementList () {
    parseStatment();
    
    parseStatementList();
    
    //null
}

function parseStatement () {
    parsePrintStatement();
    
    parseAssignmentStatement();
    
    parseVarDecl();
    
    parseWhileStatement();
    
    parseIfStatement();
    
    parseBlock();
    
}

function parsePrintStatement() {
    //match print
    
    //match (
    
    parseExpr();
    
    //match )
    
}

function parseAssignmentStatement () {
    parseId();
    
    //match =
    
    parseExper();
    
}

function parseVarDecl () {
    //match type
    
    parseId();
    
}

function parseWhileStatement () {
    //match while
    
    parseBooleanExpr();
    
    parseBlock();
}

function parseIfStatement () {
    //match if
    
    parseBooleanExpr();
    
    parseBlock();
    
}

function parseExpr () {
    parseIntExpr();
    
    parseStringExpr();
    
    parseBooleanExpr();
    
    parseId();
    
}

function parseIntExpr () {
    //match digit
    
    //match intop
    
    parseExpr();
    
}

function parseStringExpr () {
    //match quote
    
    parseCharList();
    
    //match quote
    
}

function parseBooleanExpr () {
    //match (
    
    parseExpr();
    
    //match boolop
    
    parseExpr();
    
    //match )
    
    //match boolval
}

function parseId () {
    //match char
}

function parseCharList () {
    //match char
    
    parseCharList();
    
    //match space
    
    parseCharList();
    
    //null
    
}