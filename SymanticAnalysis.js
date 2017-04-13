var tokenList;
var currentIndex;
var result;
var asTree;
var words;
var stringArr;
var copy;
var scopeTree;
var scope;


function ast(testchar) {
    asTree = new Tree;
    scopeTree = new SymbolTree;
    tokenList = [];
    currentIndex = 0;
    tokenList = parse(testchar);
    result = "";
    var programs = 0;
    words = "";
    stringArr = [];
    
    while(currentIndex < tokenList.length) // replace all char lists with the string equivalent
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
    //console.log(stringArr[0]);
    
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
            scope = 0;
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
    tree = scopeTree.toString();
    document.getElementById("stResult").append(tree);
    //console.log(tree);
   // $('#result').append(tree);
            programs--;
            //console.log(programs);
            asTree = new Tree;
            //asTree = ;
        }
    //console.log(scopeTree);
}

//parseAST functions
function parseASTProgram () {
    
    parseASTBlock();
    //skip $
    currentIndex++;
    
}

function parseASTBlock () {
    asTree.addNode("Block", "branch");
    scopeTree.addNode("Scope "+scope, "branch");
    scope++;
    //skip the {
    currentIndex++;
    
    //check for antything that is not a }
    if(tokenList[currentIndex].kind != "RBRACE") {
            parseASTStatementList();   
        }
    //skip the }
    currentIndex++;
    
    asTree.endChildren();
    scopeTree.endChildren();
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
    
    if (scopeTree.cur.hashTable.hasItem(tokenList[currentIndex+1].charValue))// If the variable has been declared send error
        {
            console.log("You cannot redelcare variables");
        }
    else
        { // otherwise add it to the table
            copy = {datatype:tokenList[currentIndex].charValue, lineNumber:tokenList[currentIndex + 1].lineNum};
            scopeTree.cur.hashTable.setItem(tokenList[currentIndex+1].charValue, copy);
        }
    
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
         checkIntType(); // check the type
        
        parseASTIntExpr();
    } else if(tokenList[currentIndex].kind == "QUOTE") {
        checkStringType();
        
        parseASTStringExpr();   
    } else if(tokenList[currentIndex].kind == "LPAREN" || tokenList[currentIndex].kind == "BOOLVAL") {
        checkBooleanType();
        
        parseASTBooleanExpr();
    } else if(tokenList[currentIndex].kind == "ID") {
        checkIdType();
        
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
   
    if (scopeTree.cur.hashTable.hasItem(tokenList[currentIndex].charValue) || findVar(scopeTree.cur))// If the variable has been declared continue
        {
            
        }
    else
        { // otherwise give a warning about using undeclared variables
            copy = scopeTree.cur;
            console.log(scopeTree.cur);
            if (findVar(scopeTree.cur.parent))
                {
                   console.log("variable "+ tokenList[currentIndex].charValue + " found in higher scope"); 
                }
            else {
            console.log("You cannot use variable "+ tokenList[currentIndex].charValue + " as it has not been declared");    
            }
            scopeTree.cur = copy;
        }
     
    //match Id
    matchAST("ID");
    
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

function checkIntType() {
   if (tokenList[currentIndex - 1].kind == "ASSIGN")// if the last token was an assignment
    {
        if (scopeTree.cur.hashTable.getItem(tokenList[currentIndex - 2].charValue).datatype == "int")// if the id is of type int
            {
                //continue
            }
        else// type mismatch
            {
                console.log("Type missmatch with the id and int");
            }
    }
    else
    {
        if (tokenList[currentIndex - 1].kind == "INTOP") // if the last token was an intop
        {
            //continue
        }
        else
        {
                if (tokenList[currentIndex - 1].kind == "BOOLOP") // if the last token was an boolop
                {
                    if (findVar(scopeTree.cur, currentIndex - 2))// If the variable has been declared continue
                        //scopeTree.cur.hashTable.hasItem(tokenList[currentIndex - 2].charValue ||
                    {
                        if (tokenList[currentIndex - 2].kind == "QUOTE" || scopeTree.cur.hashTable.getItem(tokenList[currentIndex - 2].charValue).datatype == "string") //if the last token was a "
                        {
                            console.log("Cannot compare Strings and Ints");
                        }
                        else
                        {
                            if (tokenList[currentIndex - 2].kind == "RPAREN" || tokenList[currentIndex - 2].kind == "BOOLVAL" || scopeTree.cur.hashTable.getItem(tokenList[currentIndex - 2].charValue).datatype == "boolean") //if the last token was a boolaen Expr
                            {
                                console.log("Cannot compare Booleans and Ints");
                            }
                        }
                    }
                    else
                    {
                        console.log("The ");
                    }
                        
                }   
                else
                {
                     //console.log("This should not happen");
                }
            
        }
    }
}

function checkStringType() {
    if (tokenList[currentIndex - 1].kind == "ASSIGN")// if the last token was an assignment
    {
        if (scopeTree.cur.hashTable.getItem(tokenList[currentIndex - 2].charValue).datatype == "string")// if the id is of type int
            {
                //continue
            }
        else// type mismatch
            {
                console.log("Type missmatch: with the id and string");
            }
    }
    else
    {
        if (tokenList[currentIndex - 1].kind == "INTOP") // if the last token was an intop
        {
            console.log("Type missmatch: cannot add string to an int");
        }
        else
        {
                if (tokenList[currentIndex - 1].kind == "BOOLOP") // if the last token was an boolop
                {
                    if (findVar(scopeTree.cur, currentIndex - 2))// If the variable has been declared continue
                        //scopeTree.cur.hashTable.hasItem(tokenList[currentIndex - 2].charValue ||
                    {
                        if (tokenList[currentIndex - 2].kind == "DIGIT" || scopeTree.cur.hashTable.getItem(tokenList[currentIndex - 2].charValue).datatype == "int") //if the last token was a "
                        {
                            console.log("Type missmatch: Cannot compare Strings and Ints");
                        }
                        else
                        {
                            if (tokenList[currentIndex - 2].kind == "RPAREN" || tokenList[currentIndex - 2].kind == "BOOLVAL" || scopeTree.cur.hashTable.getItem(tokenList[currentIndex - 2].charValue).datatype == "boolean") //if the last token was a boolaen Expr
                            {
                                console.log("Type missmatch: Cannot compare String and Booleans");
                            }
                        }
                    }
                    else
                    {
                        //bad
                    }
                }   
                else
                {
                   // console.log("This should not happen");
                }
            
        }
    }
}

function checkBooleanType() {
    if (tokenList[currentIndex - 1].kind == "ASSIGN")// if the last token was an assignment
    {
        if (scopeTree.cur.hashTable.getItem(tokenList[currentIndex - 2].charValue).datatype == "boolean")// if the id is of type int
            {
                //continue
            }
        else// type mismatch
            {
                console.log("Type missmatch: with the id and boolean");
            }
    }
    else
    {
        if (tokenList[currentIndex - 1].kind == "INTOP") // if the last token was an intop
        {
            console.log("Type missmatch: cannot add boolean to an int");
        }
        else
        {
                if (tokenList[currentIndex - 1].kind == "BOOLOP") // if the last token was an boolop
                {
                    if (findVar(scopeTree.cur, currentIndex - 2))// If the variable has been declared continue
                        //scopeTree.cur.hashTable.hasItem(tokenList[currentIndex - 2].charValue ||
                    {
                        if (tokenList[currentIndex - 2].kind == "QUOTE" || scopeTree.cur.hashTable.getItem(tokenList[currentIndex - 2].charValue).datatype == "string") //if the last token was a "
                        {
                            console.log("Type missmatch: Cannot compare Booleans and String");
                        }
                        else
                        {
                            if (tokenList[currentIndex - 2].kind == "DIGIT" || scopeTree.cur.hashTable.getItem(tokenList[currentIndex - 2].charValue).datatype == "int") //if the last token was a boolaen Expr
                            {
                                console.log("Type missmatch: Cannot compare Booleans and Ints");
                            }
                        }
                    }
                    else{
                        //bad
                    }
                }   
                else
                {
                     //console.log("This should not happen");
                }
            
        }
    }
}

function checkIdType() {
    if (tokenList[currentIndex - 1].kind == "ASSIGN")// if the last token was an assignment
    {
        if (scopeTree.cur.hashTable.getItem(tokenList[currentIndex - 2].charValue).datatype == scopeTree.cur.hashTable.getItem(tokenList[currentIndex].charValue).datatype)// if the id is of the same type
            {
                //continue
            }
        else// type mismatch
            {
                console.log("Type missmatch: with the Id");
            }
    }
    else
    {
        if (tokenList[currentIndex - 1].kind == "INTOP") // if the last token was an intop
        {
            if (scopeTree.cur.hashTable.getItem(tokenList[currentIndex].charValue).datatype == "int")
            {
                //good
            }
            else
            {
                console.log("Type missmatch: cannot add the Id");
            }
        }
        else
        {
            if (tokenList[currentIndex - 1].kind == "BOOLOP") // if the last token was an boolop
            {
                if (findVar(scopeTree.cur, currentIndex))// If the variable has been declared continue
                        //scopeTree.cur.hashTable.hasItem(tokenList[currentIndex - 2].charValue ||
                {
                    if ((scopeTree.cur.hashTable.getItem(tokenList[currentIndex].charValue).datatype != "boolean") && (tokenList[currentIndex - 2].kind == "RPAREN" || tokenList[currentIndex - 2].kind == "BOOLVAL") )
                    {
                        console.log("Type missmatch: Cannot compare Booleans and a non boolean id");
                    }
                    else
                    {
                        if ((scopeTree.cur.hashTable.getItem(tokenList[currentIndex].charValue).datatype != "int") && (tokenList[currentIndex - 2].kind == "DIGIT") )
                        {
                            console.log("Type missmatch: Cannot compare Ints and a non Int id");
                        }
                        else
                        {
                            if ((scopeTree.cur.hashTable.getItem(tokenList[currentIndex].charValue).datatype != "string") && (tokenList[currentIndex - 2].kind == "QUOTE"))
                            {
                                 console.log("Type missmatch: Cannot compare String and a non string id");
                            }
                            else
                            {
                                if (tokenList[currentIndex - 2].kind == "ID")
                                    {
                                       if (scopeTree.cur.hashTable.getItem(tokenList[currentIndex - 2].charValue).datatype == scopeTree.cur.hashTable.getItem(tokenList[currentIndex].charValue).datatype) //if the id's are of the same type
                                        {
                                            //good
                                        }
                                        else
                                        {
                                            console.log("Type missmatch: The Id's are not of the same type");
                                        } 
                                    }

                            }
                        }

                    }
                }
                else{
                    //bad
                }
                
                
            }   
            else
            {
                 //console.log("This should not happen");
            }
        }
    }
}


var found;

function findVar(parent)
{
    if (parent.parent == null)
        {
            console.log("Not Found");
            found = false;   
        }
    else 
    {
        if(parent.hashTable.hasItem(tokenList[currentIndex].charValue))
        {
            console.log("Found it");
            found = true;
        }
        else 
        {
            findVar(parent.parent);
        }
    }
        
            
    return found;
}

function findVar(parent, index)
{
    if (parent.parent == null)
        {
            console.log("Not Found");
            found = false;   
        }
    else 
    {
        if(parent.hashTable.hasItem(tokenList[index].charValue))
        {
            console.log("Found it");
            found = true;
        }
        else 
        {
            findVar(parent.parent);
        }
    }
        
            
    return found;
}