var tokenList;
var currentIndex;
var result;
var csTree;

function parse(testchar) {
    csTree = new Tree;
    tokenList = [];
    currentIndex = 0;
    tokenList = lexer(testchar);
    result = "";
    
   try {
        parseProgram();
   }
    catch(e){
        result = result.concat(e + "The parser ended unsuccessfully");
        //console.log(e.message);
    }
    $('#result').append(PrintResult());
    
}

//parse functions
function parseProgram () {
    
    
    parseBlock();
    //match $
    match("EOP");
    
}

function parseBlock () {
    //match {
    match("LBRACE");
    
    //check for antything that is not a }
    if(tokenList[currentIndex].kind != "RBRACE") {
            parseStatementList();   
        }
    //match }
    match("RBRACE");
    
}

function parseStatementList () {
    if(tokenList[currentIndex].kind != "RBRACE") {
            parseStatement();
    
            parseStatementList();
        }
    else {
            // do nothing for epsilon
        }
    
}

function parseStatement () {
    if(tokenList[currentIndex].kind == "PRINT") {
        parsePrintStatement();
    } else if(tokenList[currentIndex].kind == "ID") {
        parseAssignmentStatement();
    } else if(tokenList[currentIndex].kind == "DATATYPE") {
        parseVarDecl();
    } else if(tokenList[currentIndex].kind == "WHILE") {
    parseWhileStatement();    
    } else if(tokenList[currentIndex].kind == "IF") {
    parseIfStatement();    
    } else if(tokenList[currentIndex].kind == "LBRACE") {
        parseBlock();    
    } else {
        //console.log("CHESSE");
        //console.log("Error : expexted \" print, id, a datatype, while, if, or {, recived \" " + tokenList[currentIndex].charValue + " at line " + tokenList[currentIndex].lineNum + "\n");
        throw "Error : expexted \" print, id, a datatype, while, if, or {\" recived  " + tokenList[currentIndex].charValue + " at line " + tokenList[currentIndex].lineNum + "\n";
    }
}

function parsePrintStatement() {
    //match print
    match("PRINT");
    
    //match (
    match("LPAREN");
    
    parseExpr();
    
    //match )
    match("RPAREN");
    
}

function parseAssignmentStatement () {
    parseId();
    
    //match =
    match("ASSIGN");
    
    parseExpr();
    
}

function parseVarDecl () {
    //match type
    match("DATATYPE");
    
    parseId();
    
}

function parseWhileStatement () {
    //match while
    match("WHILE");
    
    parseBooleanExpr();
    
    parseBlock();
}

function parseIfStatement () {
    //match if
    match("IF");
    
    parseBooleanExpr();
    
    parseBlock();
    
}

function parseExpr () {
    if(tokenList[currentIndex].kind == "DIGIT") {
        parseIntExpr();
    } else if(tokenList[currentIndex].kind == "QUOTE") {
        parseStringExpr();   
    } else if(tokenList[currentIndex].kind == "LPAREN" || tokenList[currentIndex].kind == "BOOLVAL") {
        parseBooleanExpr();
    } else if(tokenList[currentIndex].kind == "ID") {
        parseId();   
    } else {
        throw "Error : expexted \" a digit, \", (, a boolean value, or an id\" recived  " + tokenList[currentIndex].charValue + " at line " + tokenList[currentIndex].lineNum + "\n";;
    }
}

function parseIntExpr () {
    //match digit
    match("DIGIT");
    
    if(tokenList[currentIndex].kind == "INTOP") {
    //match intop
        match("INTOP");
    
        parseExpr();   
    }  
}

function parseStringExpr () {
    //match quote
    match("QUOTE");
    
    parseCharList();
    
    //match quote
    match("QUOTE");
    
}

function parseBooleanExpr () {
    if(tokenList[currentIndex].kind == "LPAREN") {
    //match (
        match("LPAREN");

        parseExpr();

    //match boolop
        match("BOOLOP");

        parseExpr();
        
    //match )
        match("RPAREN");
    } else if (tokenList[currentIndex].kind == "BOOLVAL") {        
    //match boolval
        match("BOOLVAL");
    } else {
        throw "Error : expexted \" ( or a boolean value\" recived  " + tokenList[currentIndex].charValue + " at line " + tokenList[currentIndex].lineNum + "\n";;
    }
}

function parseId () {
    //match Id
    match("ID");
}

function parseCharList () {
    if (tokenList[currentIndex].kind == "CHAR") { 
    //match char
        match("CHAR");
    
        parseCharList();
    } else {
        //do nothing for epsilon   
    }
}

function match (expectedToken) {
    if(expectedToken == tokenList[currentIndex].kind) {
        result = result.concat("Good  on "+ expectedToken +"\n");
        currentIndex++;
    } else {        
        //result = result.concat("Error : Expected "+ expectedToken + " recieved " + tokenList[currentIndex].kind + "at line " + tokenList[currentIndex].lineNum + "\n");
        throw "Error : Expected "+ expectedToken + " recieved " + tokenList[currentIndex].kind + " at line " + tokenList[currentIndex].lineNum + "\n";
    }
}