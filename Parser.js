var tokenList;
var currentIndex;
var result;
var csTree;
var sucess = false;

function parse(testchar) {
    csTree = new Tree;
    tokenList = [];
    currentIndex = 0;
    tokenList = lexer(testchar);
    result = "";
    var programs = 0;
    
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
        parseProgram();    
   }
    catch(e){
        result = result.concat(e + "The parser ended unsuccessfully");
        //console.log(e.message);
    }
    //$('#parseResult').append(PrintResult());
    var tree = csTree.toString();
    document.getElementById("parseResult").append(tree);
    document.getElementById("parseResult").append(result);
    //console.log(tree);
   // $('#result').append(tree);
            programs--;
            //console.log(programs);
            csTree = new Tree;
            //csTree = ;
    }
    if (sucess)// if the parser completes
        {
            ast(testchar);
        }
}

//parse functions
function parseProgram () {
    //create program node
    csTree.addNode("Program", "branch");
    
    parseBlock();
    //match $
    match("EOP");
    
    sucess = true;
}

function parseBlock () {
    csTree.addNode("Block", "branch");
    
    //match {
    match("LBRACE");
    
    //check for antything that is not a }
    if(tokenList[currentIndex].kind != "RBRACE") {
            parseStatementList();   
        }
    //match }
    match("RBRACE");
    
    csTree.endChildren();
}

function parseStatementList () {
    
    
    if(tokenList[currentIndex].kind != "RBRACE") {
        csTree.addNode("StatmentList", "branch");
        
            parseStatement();
    
            parseStatementList();
        
        csTree.endChildren();
        }
    else {
            // do nothing for epsilon
        }
    
    
}

function parseStatement () {
    csTree.addNode("Statement", "branch");
    
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
        throw "Error : expexted  print, id, a datatype, while, if, or { recived  " + tokenList[currentIndex].charValue + " at line " + tokenList[currentIndex].lineNum + "\n";
    }
    
    csTree.endChildren();
}

function parsePrintStatement() {
    csTree.addNode("PrintStatement", "branch");
    
    //match print
    match("PRINT");
    
    //match (
    match("LPAREN");
    
    parseExpr();
    
    //match )
    match("RPAREN");
    
    csTree.endChildren();
}

function parseAssignmentStatement () {
    csTree.addNode("AssignmentStatement", "branch");
    
    parseId();
    
    //match =
    match("ASSIGN");
    
    parseExpr();
    
    csTree.endChildren();
}

function parseVarDecl () {
    csTree.addNode("VarDecl", "branch");
    
    //match type
    match("DATATYPE");
    
    parseId();
    
    csTree.endChildren();
}

function parseWhileStatement () {
    csTree.addNode("WhileStatement", "branch");
    
    //match while
    match("WHILE");
    
    parseBooleanExpr();
    
    parseBlock();
    
    csTree.endChildren();
}

function parseIfStatement () {
    csTree.addNode("IfStatement", "branch");
    
    //match if
    match("IF");
    
    parseBooleanExpr();
    
    parseBlock();
    
    csTree.endChildren();
}

function parseExpr () {
    csTree.addNode("Expr", "branch");
    
    if(tokenList[currentIndex].kind == "DIGIT") {
        parseIntExpr();
    } else if(tokenList[currentIndex].kind == "QUOTE") {
        parseStringExpr();   
    } else if(tokenList[currentIndex].kind == "LPAREN" || tokenList[currentIndex].kind == "BOOLVAL") {
        parseBooleanExpr();
    } else if(tokenList[currentIndex].kind == "ID") {
        parseId();   
    } else {
        throw "Error : expexted  a digit, \", (, a boolean value, or an id recived  " + tokenList[currentIndex].charValue + " at line " + tokenList[currentIndex].lineNum + "\n";;
    }
    
    csTree.endChildren();
}

function parseIntExpr () {
    csTree.addNode("IntExpr", "branch");
    
    //match digit
    match("DIGIT");
    
    if(tokenList[currentIndex].kind == "INTOP") {
    //match intop
        match("INTOP");
    
        parseExpr();   
    }  
    
    csTree.endChildren();
}

function parseStringExpr () {
    csTree.addNode("StringExpr", "branch");
    
    //match quote
    match("QUOTE");
    
    parseCharList();
    
    //match quote
    match("QUOTE");
    
    csTree.endChildren();
}

function parseBooleanExpr () {
    csTree.addNode("BooleanExpr", "branch");
    
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
        throw "Error : expexted  ( or a boolean value recived  " + tokenList[currentIndex].charValue + " at line " + tokenList[currentIndex].lineNum + "\n";;
    }
    
    csTree.endChildren();
}

function parseId () {
    csTree.addNode("Id", "branch");
    
    //match Id
    match("ID");
    
    csTree.endChildren();
}

function parseCharList () {
    
    
    if (tokenList[currentIndex].kind == "CHAR") { 
        csTree.addNode("CharList", "branch");
        
    //match char
        match("CHAR");
    
        parseCharList();
        
        csTree.endChildren();
    } else {
        //do nothing for epsilon   
    }
    
    
}

function match (expectedToken) {
    if(expectedToken == tokenList[currentIndex].kind) {
        //result = result.concat("Good  on "+ expectedToken +"\n");
        csTree.addNode(tokenList[currentIndex].charValue, "leaf");
        currentIndex++;
    } else {        
        //result = result.concat("Error : Expected "+ expectedToken + " recieved " + tokenList[currentIndex].kind + "at line " + tokenList[currentIndex].lineNum + "\n");
        throw "Error : Expected "+ expectedToken + " recieved " + tokenList[currentIndex].kind + " at line " + tokenList[currentIndex].lineNum + "\n";
    }
}

//-----------------------------------------
// treeDemo.js
//
// By Alan G. Labouseur, based on the 2009
// work by Michael Ardizzone and Tim Smith.
//-----------------------------------------

function Tree() {
    // ----------
    // Attributes
    // ----------
    
    this.root = null;  // Note the NULL root node of this tree.
    this.cur = {};     // Note the EMPTY current node of the tree we're building.


    // -- ------- --
    // -- Methods --
    // -- ------- --

    // Add a node: kind in {branch, leaf}.
    this.addNode = function(name, kind) {
        // Construct the node object.
        var node = { name: name,
                     children: [],
                     parent: {}
                   };

        // Check to see if it needs to be the root node.
        if ( (this.root == null) || (!this.root) )
        {
            // We are the root node.
            this.root = node;
        }
        else
        {
            // We are the children.
            // Make our parent the CURrent node...
            node.parent = this.cur;
            // ... and add ourselves (via the unfrotunately-named
            // "push" function) to the children array of the current node.
            this.cur.children.push(node);
        }
        // If we are an interior/branch node, then...
        if (kind == "branch")
        {
            // ... update the CURrent node pointer to ourselves.
            this.cur = node;
        }
    };

    // Note that we're done with this branch of the tree...
    this.endChildren = function() {
        // ... by moving "up" to our parent node (if possible).
        if ((this.cur.parent !== null) && (this.cur.parent.name !== undefined))
        {
            this.cur = this.cur.parent;
        }
        else
        {
            console.log("Why am i getting here");
            // TODO: Some sort of error logging.
            // This really should not happen, but it will, of course.
        }
    };

    // Return a string representation of the tree.
    this.toString = function() {
        // Initialize the result string.
        var traversalResult = "";

        // Recursive function to handle the expansion of the nodes.
        function expand(node, depth)
        {
            // Space out based on the current depth so
            // this looks at least a little tree-like.
            for (var i = 0; i < depth; i++)
            {
                traversalResult += "-";
            }

            // If there are no children (i.e., leaf nodes)...
            if (!node.children || node.children.length === 0)
            {
                // ... note the leaf node.
                traversalResult += "[" + node.name + "]";
                traversalResult += "\n";
            }
            else
            {
                // There are children, so note these interior/branch nodes and ...
                traversalResult += "<" + node.name + "> \n";
                // .. recursively expand them.
                for (var i = 0; i < node.children.length; i++)
                {
                    expand(node.children[i], depth + 1);
                }
            }
        }
        // Make the initial call to expand from the root.
        expand(this.root, 0);
        // Return the result.
        return traversalResult;
    };
}