var tokenList;
var currentIndex;
var result;
var asTree;
var words;
var stringArr;

function ast(testchar) {
    asTree = new Tree;
    tokenList = [];
    currentIndex = 0;
    tokenList = lexer(testchar);
    result = "";
    var programs = 0;
    words = "";
    stringArr = [];
    
    while(currentIndex < tokenList.length)
    {
        while(tokenList[currentIndex].kind == "CHAR")
        {
            words = words.concat(tokenList[currentIndex].charValue);
            currentIndex++;
        }
        if (words != "")
            {
                stringArr.push(words);
                words = "";
            }
        currentIndex++;
        //console.log(currentIndex + "---" + tokenList.kind);
    }
    words = 0;
    currentIndex = 0;
    console.log(stringArr[0]);
    
    tokenList.forEach(function (o)
    {
       if(o.kind == "EOP")
           {
               programs++;
           }
    });
    
    //console.log(programs);
    
    while (programs > 0)
        {
   try {
        parseASTProgram();
   }
    catch(e){
        result = result.concat(e + "The AST ended unsuccessfully");
        //console.log(e.message);
    }
    //$('#astResult').append(PrintResult());
    var tree = asTree.toString();
    document.getElementById("astResult").append(tree);
    document.getElementById("astResult").append(result);
    //console.log(tree);
   // $('#result').append(tree);
            programs--;
            //console.log(programs);
            asTree = new Tree;
            //asTree = ;
        }
}

//parseAST functions
function parseASTProgram () {
    parseASTBlock();
    //skip $
    currentIndex++;
    
}

function parseASTBlock () {
    asTree.addNode("Block", "branch");
    
    //skip the {
    currentIndex++;
    
    //check for antything that is not a }
    if(tokenList[currentIndex].kind != "RBRACE") {
            parseASTStatementList();   
        }
    //skip the }
    currentIndex++;
    
    asTree.endChildren();
}

function parseASTStatementList () {
    
    
    if(tokenList[currentIndex].kind != "RBRACE") {        
            parseASTStatement();
    
            parseASTStatementList();
        
        asTree.endChildren();
        }
    else {
            // do nothing for epsilon
        }
    
    
}

function parseASTStatement () {
    if(tokenList[currentIndex].kind == "PRINT") {
        parseASTPrintStatement();
    } else if(tokenList[currentIndex].kind == "ID") {
        parseASTAssignmentStatement();
    } else if(tokenList[currentIndex].kind == "DATATYPE") {
        parseASTVarDecl();
    } else if(tokenList[currentIndex].kind == "WHILE") {
    parseASTWhileStatement();    
    } else if(tokenList[currentIndex].kind == "IF") {
    parseASTIfStatement();    
    } else if(tokenList[currentIndex].kind == "LBRACE") {
        parseASTBlock();    
    } else {
        //console.log("CHESSE");
        //console.log("Error : expexted \" print, id, a datatype, while, if, or {, recived \" " + tokenList[currentIndex].charValue + " at line " + tokenList[currentIndex].lineNum + "\n");
        throw "Error : expexted \" print, id, a datatype, while, if, or {\" recived  " + tokenList[currentIndex].charValue + " at line " + tokenList[currentIndex].lineNum + "\n";
    }
}

function parseASTPrintStatement() {
    asTree.addNode("PrintStatement", "branch");
    
    //skip print
    currentIndex++;
    
    //skip (
    currentIndex++;
    
    parseASTExpr();
    
    //skip )
    currentIndex++;
    
    asTree.endChildren();
}

function parseASTAssignmentStatement () {
    asTree.addNode("AssignmentStatement", "branch");
    
    parseASTId();
    
    //skip =
    currentIndex++;
    
    parseASTExpr();
    
    asTree.endChildren();
}

function parseASTVarDecl () {
    asTree.addNode("VarDecl", "branch");
    
    //match type
    matchAST("DATATYPE");
    
    parseASTId();
    
    asTree.endChildren();
}

function parseASTWhileStatement () {
    asTree.addNode("WhileStatement", "branch");
    
    //skip while
    currentIndex++;
    
    parseASTBooleanExpr();
    
    parseASTBlock();
    
    asTree.endChildren();
}

function parseASTIfStatement () {
    asTree.addNode("IfStatement", "branch");
    
    //skip if
    currentIndex++;
    
    parseASTBooleanExpr();
    
    parseASTBlock();
    
    asTree.endChildren();
}

function parseASTExpr () {
    if(tokenList[currentIndex].kind == "DIGIT") {
        parseASTIntExpr();
    } else if(tokenList[currentIndex].kind == "QUOTE") {
        parseASTStringExpr();   
    } else if(tokenList[currentIndex].kind == "LPAREN" || tokenList[currentIndex].kind == "BOOLVAL") {
        parseASTBooleanExpr();
    } else if(tokenList[currentIndex].kind == "ID") {
        parseASTId();   
    } else {
        throw "Error : expexted \" a digit, \", (, a boolean value, or an id\" recived  " + tokenList[currentIndex].charValue + " at line " + tokenList[currentIndex].lineNum + "\n";;
    }
}

function parseASTIntExpr () {
    if(tokenList[currentIndex + 1].kind == "INTOP") {
        asTree.addNode("ADD", "branch");
    }
    
    
    //match digit
    matchAST("DIGIT");
    
    if(tokenList[currentIndex].kind == "INTOP") {
    //skip intop
        currentIndex++
    
        parseASTExpr(); 
        asTree.endChildren();
    }  
    
    
}

function parseASTStringExpr () {
    //skip quote
    currentIndex++;
    
    //parseASTCharList();
    while (tokenList[currentIndex].kind == "CHAR")
        {
            currentIndex++;
        }
    asTree.addNode(stringArr[words], "leaf");
    words++;
    
    //skip quote
    currentIndex++;
    
}

function parseASTBooleanExpr () {
     
    
    if(tokenList[currentIndex].kind == "LPAREN") {
        
        if (tokenList[currentIndex + 2].charValue == "==")// add a brand node for ==
        {
        asTree.addNode("isEqual", "branch");
        } else if (tokenList[currentIndex + 2].charValue == "!=")// add a brand node for !=
        {
        asTree.addNode("isNotEqual", "branch");
        }
        
     //skip (
        currentIndex++;

        parseASTExpr();

    //skip boolop
        currentIndex++;

        parseASTExpr();
        
    //skip )
         currentIndex++;
        asTree.endChildren();
    } else if (tokenList[currentIndex].kind == "BOOLVAL") {        
    //match boolval
        matchAST("BOOLVAL");
    } else {
        throw "Error : expexted \" ( or a boolean value\" recived  " + tokenList[currentIndex].charValue + " at line " + tokenList[currentIndex].lineNum + "\n";;
    }
    
    
}

function parseASTId () {
    //match Id
    matchAST("ID");
    
    asTree.endChildren();
}

function parseASTCharList () {
    
    
    if (tokenList[currentIndex].kind == "CHAR") { 
        asTree.addNode("CharList", "branch");
        
    //match char
        matchAST("CHAR");
    
        parseASTCharList();
        
        asTree.endChildren();
    } else {
        //do nothing for epsilon   
    }
    
    
}

function matchAST (expectedToken) {
    if(expectedToken == tokenList[currentIndex].kind) {
        //result = result.concat("Good  on "+ expectedToken +"\n");
        asTree.addNode(tokenList[currentIndex].charValue, "leaf");
        currentIndex++;
    } else {        
        //result = result.concat("Error : Expected "+ expectedToken + " recieved " + tokenList[currentIndex].kind + "at line " + tokenList[currentIndex].lineNum + "\n");
        throw "Error : Expected "+ expectedToken + " recieved " + tokenList[currentIndex].kind + " at line " + tokenList[currentIndex].lineNum + "\n";
    }
    
}
