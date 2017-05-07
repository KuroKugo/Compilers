var treeHolder;
var codeString;
var symbolTree;
var asTree;
var symbolTable = [];
var staticCounter;
var heapCounter;
var traversalResult;
var inVarDecl = false;
var inAssign = false;
var depth

function codeGen(testchar) {
    
    treeHolder = ast(testchar);
    symbolTree = treeHolder[1];
    asTree = treeHolder[0];
    traversalResult = "";
    
    staticCounter = 0;
    heapCounter = 0;
    
    
    stExpand(symbolTree.root, 0);
    astExpand(asTree.root, 0);
    
    console.log(symbolTable);
    
    document.getElementById("codeGenResult").append(traversalResult);
}

function stExpand(node, depth)
{
    var temp;
    var tempVar;
    // If there are no children (i.e., leaf nodes)...
    if (!node.children || node.children.length === 0)
    {
        // ... note the leaf node.
        //traversalResult += "[" + node.name + "]" + " -- " + node.hashTable.length + " \n";
        
        // go thorough the hashtable and print the contents
        for (var k in node.hashTable.items) {
            if (node.hashTable.hasItem(k)) {
                
                if (node.hashTable.items[k].datatype == "int" || node.hashTable.items[k].datatype == "boolean")
                {
                    temp = k + "@" + depth;
                    tempVar = "T" + staticCounter + "XX";
                    symbolTable[temp] = tempVar;
                    staticCounter++;//( k + " | " + node.hashTable.items[k].datatype + " | " + node.hashTable.items[k].lineNumber + " | " + node.name + ",\n");
                }
                if (node.hashTable.items[k].datatype == "string")
                {
                    temp = k + "@" + depth;
                    tempVar = "S" + heapCounter;
                    symbolTable[temp] = tempVar;
                    heapCounter++;
                }

            }
        }
        
        //traversalResult += "\n";
    }
    else
    {
        // There are children, so note these interior/branch nodes and ...
        //traversalResult += "<" + node.name + "> -- " + node.hashTable.length +" \n";
        
        // go thorough the hashtable and print the contents
        for (var k in node.hashTable.items) {
            if (node.hashTable.hasItem(k)) {
                
                if (node.hashTable.items[k].datatype == "int" || node.hashTable.items[k].datatype == "boolean")
                {
                    temp = k + "@" + depth;
                    tempVar = "T" + staticCounter + "XX";
                    symbolTable[temp] = tempVar;
                    staticCounter++;//( k + " | " + node.hashTable.items[k].datatype + " | " + node.hashTable.items[k].lineNumber + " | " + node.name + ",\n");
                }
                if (node.hashTable.items[k].datatype == "string")
                {
                    temp = k + "@" + depth;
                    tempVar = "S" + heapCounter;
                    symbolTable[temp] = tempVar;
                    heapCounter++;
                }
                
            }
        }
        
        // .. recursively expand them.
        for (var i = 0; i < node.children.length; i++)
        {
            stExpand(node.children[i], depth + 1);
        }
    }
    
}

function astExpand(node, depth)
{
    var temp;
    // If there are no children (i.e., leaf nodes)...
    if (!node.children || node.children.length === 0)
    {
        // ... note the leaf node.
        if (inVarDecl)
        {
            if (node.name == "int" || node.name == "boolean")
            {
                //staticCounter++;
                
                traversalResult += "A9" //Load with the constant
                traversalResult += "00" // 0
                traversalResult += "8D" // Store the value
                
                
            }
            else
            {
                if (node.name == "string")
                    {
                        console.log("Under Construction");
                    }
            }
            
            if (node.name.length == 1)
            {
                
                temp = node.name+"@"+(depth-2);
                console.log(temp);
                console.log(symbolTable[temp]);
                
                traversalResult += symbolTable[temp]; // To a temporary location.
                inVarDecl = false;
            }
        }
        
        if (inAssign)
        {
            console.log("Under Construction");
        }
    }
    else
    {
        // There are children, so note these interior/branch nodes and ...
        //traversalResult += "<" + node.name + "> \n";
        // .. recursively expand them.
        
        if (node.name =="VarDecl")
            {
                inVarDecl = true;
            }
        if (node.name =="AssignStatement")
            {
                inAssign = true;
            }
        
        for (var i = 0; i < node.children.length; i++)
        {
            astExpand(node.children[i], depth + 1);
        }
    }
}