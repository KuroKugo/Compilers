var tokenList;
var currentIndex;
var result;
var asTree;
var words;
var stringArr;
var copy;
var scopeTree;
var scope;
var sucess = false;

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
    var inQuote = false;
    
    tokenList.forEach(function (o)
    {
        if (o.kind == "QUOTE")
        {
            inQuote = !inQuote
        }
        if(inQuote)
        {
            if(o.kind != "QUOTE")
            words = words.concat(o.charValue);
        }
        if (!inQuote)
        {
            if (words != "")
            {
                stringArr.push(words);
                words = "";
            }
        }
    });
    
    //console.log(stringArr);
    
    words = 0;
    currentIndex = 0;
    
    tokenList.forEach(function (o)
    {
       if(o.kind == "EOP")
           {
               programs++;
           }
    });
    var i = 0;
    while (programs > 0)
        {
            scope = -1;
   try {
        result += "\nCreating AST for Program: " + i + "\n";
        parseASTProgram();
   }
    catch(e){
        result = result.concat(e + "\nThe AST ended unsuccessfully \n");
        console.log(e)
        sucess = false;
    }
    
    var codeGen = [asTree, scopeTree];
            
    result += "\n";
    //$('#astResult').append(PrintResult());
    var tree = asTree.toString();
    document.getElementById("astResult").append(tree);
    document.getElementById("astResult").append(result);
    tree = scopeTree.toString();
    document.getElementById("stResult").append(tree);

   // $('#result').append(tree);
            
            programs--;
            i++;
            
            asTree = new Tree;
            scopeTree = new SymbolTree;
            result = "";
            //asTree = ;
            
            if (sucess)
            {
                return codeGen;
            }
        }
}

//parseAST functions
function parseASTProgram () {
    
    parseASTBlock();
    //skip $
    currentIndex++;
    
    sucess = true;
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
    
    //console.log("you made it");
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
            copy = {datatype:tokenList[currentIndex].charValue, lineNumber:tokenList[currentIndex + 1].lineNum, used: false, initialized: false, declared: true};
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
        result += "Cheking Int Type at line " + tokenList[currentIndex].lineNum + "\n";
       
        parseASTIntExpr();
    } else if(tokenList[currentIndex].kind == "QUOTE") {
        checkStringType();
        result += "Cheking String Type at line " + tokenList[currentIndex].lineNum + "\n";
        
        parseASTStringExpr();   
    } else if(tokenList[currentIndex].kind == "LPAREN" || tokenList[currentIndex].kind == "BOOLVAL") {
        checkBooleanType();
        result += "Cheking Boolean Type at line " + tokenList[currentIndex].lineNum + "\n";
        
        parseASTBooleanExpr();
    } else if(tokenList[currentIndex].kind == "ID") {
        checkIdType();
        result += "Cheking ID Type at line " + tokenList[currentIndex].lineNum + "\n";
        
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
            var item = getVars(scopeTree.cur, currentIndex);
            //good 
            if (asTree.cur.name == "AssignmentStatement") // if I am currently in an assign Statement
            {   
                if (item != null) // and the var is exists
                {
                    item.initialized = true; // update the var to have been initialze
                }
                else
                {
                    console.log("I don't think I should get here");    
                }
            }
            else
            {
                if (asTree.cur.name != "VarDecl") // if I am not in the Variable Decleration nor the assign statment
                {
                    if (item != null) // and the var is exists
                    {
                        item.used = true; // Then i have been used
                    }
                }
                
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
        if(expectedToken =="ID")
            {
                var name = getScope(scopeTree.cur,currentIndex);
                asTree.addNode(tokenList[currentIndex].charValue+"@"+name.charAt(name.length-1), "leaf");
            }
        else{
            asTree.addNode(tokenList[currentIndex].charValue, "leaf");
        }
        
        currentIndex++;
    } else {        
        //result = result.concat("Error : Expected "+ expectedToken + " recieved " + tokenList[currentIndex].kind + "at line " + tokenList[currentIndex].lineNum + "\n");
        throw "Error : Expected "+ expectedToken + " recieved " + tokenList[currentIndex].kind + " at line " + tokenList[currentIndex].lineNum + "\n";
    }   
}

function checkIntType() {
    var item = getVars(scopeTree.cur, currentIndex - 2);
   if (tokenList[currentIndex - 1].kind == "ASSIGN")// if the last token was an assignment
    {
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
                if (item != null)
                {
                    if (item.datatype == "string") //if the last token was a "
                    {
                        throw "Cannot compare Strings and Ints";
                    }
                    else
                    {
                        if (item.datatype == "boolean") //if the last token was a boolaen Expr
                        {
                            throw "Cannot compare Booleans and Ints";
                        }
                    }                 
                }
                else
                {
                     if (tokenList[currentIndex - 2].kind == "QUOTE") //if the last token was a "
                    {
                        throw "Cannot compare Strings and Ints";
                    }
                    else
                    {
                        if (tokenList[currentIndex - 2].kind == "RPAREN" || tokenList[currentIndex - 2].kind == "BOOLVAL") //if the last token was a boolaen Expr
                        {
                            throw "Cannot compare Booleans and Ints";
                        }
                    }   
                }
            }   
            else
            {
                 console.log("I an on the left side of a bool op");
            }
        }
    }
}

function checkStringType() {
    var item = getVars(scopeTree.cur, currentIndex - 2);
    if (tokenList[currentIndex - 1].kind == "ASSIGN")// if the last token was an assignment
    {
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
                if (item != null)
                {
                    if (item.datatype == "int") //if the last token was a "
                    {
                        throw "Type missmatch: Cannot compare Strings and Ints";
                    }
                    else
                    {
                        if (item.datatype == "boolean") //if the last token was a boolaen Expr
                        {
                            throw "Type missmatch: Cannot compare String and Booleans";
                        }
                    }                 
                }
                else
                {
                    if (tokenList[currentIndex - 2].kind == "DIGIT") //if the last token was a "
                    {
                        throw "Type missmatch: Cannot compare Strings and Ints";
                    }
                    else
                    {
                        if (tokenList[currentIndex - 2].kind == "RPAREN" || tokenList[currentIndex - 2].kind == "BOOLVAL") //if the last token was a boolaen Expr
                        {
                            throw "Type missmatch: Cannot compare String and Booleans";
                        }
                    }   
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
    var item = getVars(scopeTree.cur, currentIndex - 2);
    if (tokenList[currentIndex - 1].kind == "ASSIGN")// if the last token was an assignment
    {
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
                if (item != null)
                {
                    if (item.datatype == "string") //if the last token was a "
                    {
                        throw "Type missmatch: Cannot compare Booleans and String";
                    }
                    else
                    {
                        if (item.datatype == "int") //if the last token was a boolaen Expr
                        {
                            throw "Type missmatch: Cannot compare Booleans and Ints";
                        }
                    }                 
                }
                else
                {
                    if (tokenList[currentIndex - 2].kind == "QUOTE") //if the last token was a "
                    {
                        throw "Type missmatch: Cannot compare Booleans and String";
                    }
                    else
                    {
                        if (tokenList[currentIndex - 2].kind == "DIGIT") //if the last token was a boolaen Expr
                        {
                            throw "Type missmatch: Cannot compare Booleans and Ints";
                        }
                    }   
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
    var item = getVars(scopeTree.cur, currentIndex - 2);
    var item2 = getVars(scopeTree.cur, currentIndex);
    if (tokenList[currentIndex - 1].kind == "ASSIGN")// if the last token was an assignment
    {
        
        if (item.datatype == item2.datatype)// if the id is of the same type
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
            if (item2.datatype == "int")
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
                if (item != null)
                {
                    if (item.datatype == item2.datatype) //if the id's are of the same type
                    {
                        //good
                    }
                    else
                    {
                        throw "Type missmatch: The Id's are not of the same type";
                    }               
                }
                else
                {
                    if (tokenList[currentIndex - 2].kind == "QUOTE" && (item2.datatype != "string")) //if the last token was a "
                    {
                        throw "Type missmatch: Cannot compare String and a non string id";
                    }
                    else
                    {
                        if (tokenList[currentIndex - 2].kind == "DIGIT" && (item2.datatype != "int")) //if the last token was a boolaen Expr
                        {
                            throw "Type missmatch: Cannot compare Ints and a non Int id";
                        }
                        else
                        {
                            if ((tokenList[currentIndex - 2].kind == "RPAREN" || tokenList[currentIndex - 2].kind == "BOOLVAL") && (item2.datatype != "boolean"))
                            {
                                throw "Type missmatch: Cannot compare Booleans and a non boolean id";
                            }
                        }
                    }   
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
        //console.log("Variable Not Found");
        stuff = null;   
    }
    else 
    {
        if(node.hashTable.hasItem(tokenList[index].charValue))
        {
            //console.log("Found it");
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
    if (tokenList[index].kind == "ID")
    {
        result += "Looking up variable " + tokenList[index].charValue + " in " + node.name + "\n";
    }
    
    if (node.parent == null)
        {
            if (tokenList[index].kind == "ID")
            {
             result += "Variable Not Found \n";
            }
            return false;
        }
    else
    {
        if (node.hashTable.hasItem(tokenList[index].charValue))
        {
            if (tokenList[index].kind == "ID")
            {
                result += "Found " + tokenList[index].charValue + " at " + node.name + "\n ";
            }
            return true;
        }
        else
        {
            if (tokenList[index].kind == "ID")
            {
                result += "Variable Not Found in " + node.name + "\n";
            }
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
function getScope(node, index)
{
    if (tokenList[index].kind == "ID")
    {
        //console.log("Looking up variable " + tokenList[index].charValue + " in " + node.name + "\n");
    }
    
    if (node.parent == null)
        {
            if (tokenList[index].kind == "ID")
            {
             //console.log("Variable Not Found \n");
            }
            return null;
        }
    else
    {
        if (node.hashTable.hasItem(tokenList[index].charValue))
        {
            if (tokenList[index].kind == "ID")
            {
                //console.log("Found " + tokenList[index].charValue + " at " + node.name + "\n ");
            }
            return node.name;
        }
        else
        {
            if (tokenList[index].kind == "ID")
            {
                //console.log("Variable Not Found in " + node.name + "\n");
            }
            if (findVars(node.parent, index) != null)
            {
                return node.name;
            }
            else
            {
                return null;
            }
        } 
    }
    
}