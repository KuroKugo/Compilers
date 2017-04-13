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
    }
    
    words = 0;
    currentIndex = 0;
    
    tokenList.forEach(function (o)
    {
       if(o.kind == "EOP")
           {
               programs++;
           }
    });
    
    while (programs > 0)
        {
            scope = -1;
   try {
        parseASTProgram();
   }
    catch(e){
        result = result.concat(e + "The AST ended unsuccessfully \n");
        console.log(e)
    }
            
    //$('#astResult').append(PrintResult());
    var tree = asTree.toString();
    document.getElementById("astResult").append(tree);
    document.getElementById("astResult").append(result);
    tree = scopeTree.toString();
    document.getElementById("stResult").append(tree);

   // $('#result').append(tree);
            programs--;
            
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
    scope++;
    
    scopeTree.addNode("Scope "+scope, "branch");
    
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
    
    console.log("you made it");
    //skip =
    currentIndex++;
    
    parseASTExpr();
    
    asTree.endChildren();
}

function parseASTVarDecl () {
    asTree.addNode("VarDecl", "branch");
    
    if (scopeTree.cur.hashTable.hasItem(tokenList[currentIndex+1].charValue))// If the variable has been declared send error
        {
            throw "You cannot Redelcare variables";
        }
    else
        { // otherwise add it to the table
            copy = {datatype:tokenList[currentIndex].charValue, lineNumber:tokenList[currentIndex + 1].lineNum, used: "No", initialized: "No", declared: "Yes"};
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
    if (findVars(scopeTree.cur, currentIndex)) // If the variable has been declared continue
        {
            console.log("Found var "+ tokenList[currentIndex].charValue)
            //good 
            if (asTree.cur.name == "AssignmentStatement")
            {
                
//                var item = getVars(scopeTree.cur, currentIndex);
//                if (item != null)
//                {
//                    item.initialized = "Yes";
//                    console.log(scopeTree);
//                }
            }
            
        }
    else
        { // otherwise give a warning about using undeclared variables
            throw "You cannot use variable "+ tokenList[currentIndex].charValue + " as it has not been declared \n";
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
        var item = getVars(scopeTree.cur, currentIndex - 2);
        console.log(item);
        if (item.datatype == "int")// if the id is of type int
            {
                //continue 
                 
            }
        else// type mismatch
            {
                throw "Type missmatch with the id and int";
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
                    if (findVars(scopeTree.cur, currentIndex - 2))// If the variable has been declared continue
                        //scopeTree.cur.hashTable.hasItem(tokenList[currentIndex - 2].charValue ||
                    {
                        if (tokenList[currentIndex - 2].kind == "QUOTE" || item.datatype == "string") //if the last token was a "
                        {
                            throw "Cannot compare Strings and Ints";
                        }
                        else
                        {
                            if (tokenList[currentIndex - 2].kind == "RPAREN" || tokenList[currentIndex - 2].kind == "BOOLVAL" || item.datatype == "boolean") //if the last token was a boolaen Expr
                            {
                                throw "Cannot compare Booleans and Ints";
                            }
                        }
                    }
                    else
                    {
                        throw "The variable was not found in higher scope";
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
        var item = getVars(scopeTree.cur, currentIndex - 2);
        console.log(item);
        if (item.datatype == "string")// if the id is of type int
            {
                //continue
            }
        else// type mismatch
            {
                throw "Type missmatch: with the id and string";
            }
    }
    else
    {
        if (tokenList[currentIndex - 1].kind == "INTOP") // if the last token was an intop
        {
            throw "Type missmatch: cannot add string to an int";
        }
        else
        {
                if (tokenList[currentIndex - 1].kind == "BOOLOP") // if the last token was an boolop
                {
                    if (findVars(scopeTree.cur, currentIndex - 2))// If the variable has been declared continue
                        //scopeTree.cur.hashTable.hasItem(tokenList[currentIndex - 2].charValue ||
                    {
                        if (tokenList[currentIndex - 2].kind == "DIGIT" || item.datatype == "int") //if the last token was a "
                        {
                            throw "Type missmatch: Cannot compare Strings and Ints";
                        }
                        else
                        {
                            if (tokenList[currentIndex - 2].kind == "RPAREN" || tokenList[currentIndex - 2].kind == "BOOLVAL" || item.datatype == "boolean") //if the last token was a boolaen Expr
                            {
                                throw "Type missmatch: Cannot compare String and Booleans";
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
        var item = getVars(scopeTree.cur, currentIndex - 2);
        console.log(item);
        if (item.datatype == "boolean")// if the id is of type int
            {
                //continue
            }
        else// type mismatch
            {
                throw "Type missmatch: with the id and boolean";
            }
    }
    else
    {
        if (tokenList[currentIndex - 1].kind == "INTOP") // if the last token was an intop
        {
            throw "Type missmatch: cannot add boolean to an int";
        }
        else
        {
                if (tokenList[currentIndex - 1].kind == "BOOLOP") // if the last token was an boolop
                {
                    if (findVars(scopeTree.cur, currentIndex - 2))// If the variable has been declared continue
                        //scopeTree.cur.hashTable.hasItem(tokenList[currentIndex - 2].charValue ||
                    {
                        if (tokenList[currentIndex - 2].kind == "QUOTE" || item.datatype == "string") //if the last token was a "
                        {
                            throw "Type missmatch: Cannot compare Booleans and String";
                        }
                        else
                        {
                            if (tokenList[currentIndex - 2].kind == "DIGIT" || item.datatype == "int") //if the last token was a boolaen Expr
                            {
                                throw "Type missmatch: Cannot compare Booleans and Ints";
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
                throw "Type missmatch: with the Id";
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
                throw "Type missmatch: cannot add the Id";
            }
        }
        else
        {
            if (tokenList[currentIndex - 1].kind == "BOOLOP") // if the last token was an boolop
            {
                if (findVars(scopeTree.cur, currentIndex))// If the variable has been declared continue
                        //scopeTree.cur.hashTable.hasItem(tokenList[currentIndex - 2].charValue ||
                {
                    if ((scopeTree.cur.hashTable.getItem(tokenList[currentIndex].charValue).datatype != "boolean") && (tokenList[currentIndex - 2].kind == "RPAREN" || tokenList[currentIndex - 2].kind == "BOOLVAL") )
                    {
                        throw "Type missmatch: Cannot compare Booleans and a non boolean id";
                    }
                    else
                    {
                        if ((scopeTree.cur.hashTable.getItem(tokenList[currentIndex].charValue).datatype != "int") && (tokenList[currentIndex - 2].kind == "DIGIT") )
                        {
                            throw "Type missmatch: Cannot compare Ints and a non Int id";
                        }
                        else
                        {
                            if ((scopeTree.cur.hashTable.getItem(tokenList[currentIndex].charValue).datatype != "string") && (tokenList[currentIndex - 2].kind == "QUOTE"))
                            {
                                 throw "Type missmatch: Cannot compare String and a non string id";
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
                                            throw "Type missmatch: The Id's are not of the same type";
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

function getVars(node, index)
{
    var stuff;
    if (node.parent == null)
    {
        console.log("Variable Not Found");
        stuff = null;   
    }
    else 
    {
        if(node.hashTable.hasItem(tokenList[index].charValue))
        {
            console.log("Found it");
            stuff = node.hashTable.getItem(tokenList[index].charValue);
        }
        else 
        {
            if(findVars(node.parent, index))
            {
                stuff = getVars(node.parent, index);
            }
            else
            {
                stuff = null;
            }
        }
    }       
    return stuff;
}

function findVars(node, index)
{
    if (node.parent == null)
        {
            console.log("Variable Not Found");
            return false;
        }
    else
    {
        if (node.hashTable.hasItem(tokenList[index].charValue))
        {
            console.log("Found it" + " at " + node.name);
            return true;
        }
        else
        {
            console.log("Variable Not Found in" + node.name);
            if (findVars(node.parent, index))
            {
                return true;
            }
            else
            {
                return false;
            }
        } 
    }
    
}