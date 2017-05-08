var treeHolder;
var codeString;
var staticString;
var heapString;
var heapStack = [];
var stringHolder;
var symbolTree;
var asTree;
var symbolTable = [];
var staticCounter;
//var heapCounter;
var traversalResult;
var codeGenString;
var addCounter = 0;
var slick;
var stop = true;
var startLoc = 0;
var endLoc = 0;
var alwaysTrue = false;
var jump = 0;

var heapPosition;
var inVarDecl = false;
var inAssign = false;
var inPrint = false;
var inWhile = false;
var inIf = false;
var tempVar;
var tempVar2;
var firstVar = true;
var added = false;

function codeGen(testchar) {
    
    treeHolder = ast(testchar);
    symbolTree = treeHolder[1];
    asTree = treeHolder[0];
    traversalResult = "";
    heapString = "";
    staticString = "";
    heapStack = [];
    staticCounter = 0;
    heapCounter = 0;
    heapPosition = 256;
    
    heapStack["true"] = toHexPosition("true");
    console.log(heapStack["true"]);
    heapStack["false"] = toHexPosition("false");
    console.log(heapStack["false"]);
    try {
        stExpand(symbolTree.root, 0);
    astExpand(asTree.root, 0);
    
    codeString = traversalResult;
    codeString += "00";
    console.log(codeString);
    
    staticString = replaceFakes(codeString);
    
    codeGenString = addStaticCode(staticString);
    
    codeGenString = combine(codeGenString, heapStack);
    
    codeGenString = addSpaces(codeGenString);
        
    console.log(codeGenString);
    console.log(symbolTable);
    } catch (e)
    {
        console.log(e);
    }
    
    console.log(heapString);
    document.getElementById("codeGenResult").append(codeGenString);
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
                    temp = k + "@" + node.name.charAt(node.name.length-1);
                    tempVar = "T" + staticCounter + "XX";
                    symbolTable[temp] = [tempVar, node.hashTable.items[k].datatype, staticCounter];
                    staticCounter++;//( k + " | " + node.hashTable.items[k].datatype + " | " + node.hashTable.items[k].lineNumber + " | " + node.name + ",\n");
                }
                if (node.hashTable.items[k].datatype == "string")
                {
                    temp = k + "@" + node.name.charAt(node.name.length-1);
                    tempVar = "S" + heapCounter + "XX";
                    symbolTable[temp] = [tempVar, node.hashTable.items[k].datatype, staticCounter];
                    staticCounter++;
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
                    temp = k + "@" + node.name.charAt(node.name.length-1);
                    tempVar = "T" + staticCounter + "XX";
                    symbolTable[temp] = [tempVar, node.hashTable.items[k].datatype, staticCounter];
                    staticCounter++;//( k + " | " + node.hashTable.items[k].datatype + " | " + node.hashTable.items[k].lineNumber + " | " + node.name + ",\n");
                }
                if (node.hashTable.items[k].datatype == "string")
                {
                    temp = k + "@" + node.name.charAt(node.name.length-1);
                    tempVar = "S" + heapCounter + "XX";
                    symbolTable[temp] = [tempVar, node.hashTable.items[k].datatype, staticCounter];
                    staticCounter++;
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
    
    // If there are no children (i.e., leaf nodes)...
    if (!node.children || node.children.length === 0)
    {
        // ... note the leaf node.
        if (inVarDecl) //If We are inside a Variable Decleration
        {            
            if (node.name.charAt(1) == "@") // Generate the code for the Variable
            {
                if (symbolTable[node.name][1] == "int" || symbolTable[node.name][1] == "boolean")  //If it is an int or boolean
                {
                    traversalResult += "A9" //Load with the constant
                    traversalResult += "00" // 0
                    traversalResult += "8D" // Store the value
                    traversalResult += symbolTable[node.name][0]; // To a temporary location.
                }
                else// If it is a String you heve created a temp value for it already
                {
                    //Strings
                }
                inVarDecl = false; // We have finished the var decl
            }
        }
        
        if (inAssign) //If We are inside a Assign Statement
        {
            if (isNaN(node.name)) // If we are not a Number
            {
                if (node.name.charAt(1) == "@") // If we are an ID
                {
                    if (firstVar)
                    {
                        tempVar = symbolTable[node.name][0];
                        slick = node.name;
                        firstVar = !firstVar;
                    }
                    else
                    {
                        tempVar2 = symbolTable[node.name][0];
                        
                        traversalResult += "AD"; // Load from memory
                        traversalResult += tempVar; // To a temporary location 1.
                        traversalResult += "8D"; // Store the value from memory
                        traversalResult += tempVar2 // to temporary location 2
                        inAssign = false;
                        firstVar = !firstVar;   
                    }
                    
                    //traversalResult += symbolTable[node.name]; // To a temporary location.
                    //inAssign = false;
                }
                else
                {
                    if (heapStack[node.name] == undefined)
                    {
                        heapStack[node.name] = toHexPosition(node.name);
                    }
                    
                    //console.log(node.name);
                    if(symbolTable[slick][1] == "boolean")
                    {
                        if (node.name == "true")
                        {
                            traversalResult += "A9"; //Load with the constant
                            traversalResult += "01";
                            traversalResult += "8D"; // Store the value
                            traversalResult += tempVar; // To a temporary location.
                            symbolTable[slick] = [tempVar, "boolean", "true"];
                            inAssign = false;
                        }
                        if (node.name == "false")
                        {
                            traversalResult += "A9"; //Load with the constant
                            traversalResult += "00";
                            traversalResult += "8D"; // Store the value
                            traversalResult += tempVar; // To a temporary location.

                            symbolTable[slick] = [tempVar, "boolean", "false"];
                            inAssign = false;
                        }       
                    }
                    else
                    {
                        //console.log(tempVar)
                        traversalResult += "A9"; //Load with the constant
                        traversalResult += heapStack[node.name].toString(16);
                        traversalResult += "8D"; // Store the value
                        traversalResult += tempVar; // To a temporary location.
                        inAssign = false;
                    }
                    
                }
            }
            else // Is a Number
            {
                console.log(addCounter);
                if(addCounter == 0)
                {
                    if (added)
                    {
                        traversalResult += "A9"; //Load with the constant
                        traversalResult += "0" + node.name; // 0 and Some number between 0-9
                        traversalResult += "6D"; // Store the value
                        traversalResult += tempVar2; // To a temporary location
                        traversalResult += "8D"; // Store the value
                        traversalResult += tempVar; // To a temporary location
                    }
                    else
                    {
                        traversalResult += "A9"; //Load with the constant
                        traversalResult += "0" + node.name; // 0 and Some number between 0-9
                        traversalResult += "8D"; // Store the value
                        traversalResult += tempVar; // To a temporary location.
                    }
                    inAssign = false;
                }
                else
                {//A9 01 6D EC 00 8D EC 00 A9 09 6D EC 00 8D EB 00
                    tempVar2 = "T" + staticCounter + "XX";
                    symbolTable["tempInt"] = [tempVar2, "int"];
                    traversalResult += "A9"; //Load with the constant
                    traversalResult += "0" + node.name; // 0 and Some number between 0-9
                    traversalResult += "6D"; // Store the value
                    traversalResult += tempVar2; // To a temporary location
                    traversalResult += "8D"; // Store the value
                    traversalResult += tempVar2; // To a temporary location
                 
                    addCounter--;
                }
                
            }
            
        }
        
        if (inPrint)
        {
            if (isNaN(node.name)) // Is not a Number
            {
                if (node.name.charAt(1) == "@")
                {
                    console.log(node.name)
                    if (symbolTable[node.name][1] == "int")
                    {
                        tempVar = symbolTable[node.name][0];
                        traversalResult += "AC"; // Load the Y Register from memory
                        traversalResult += tempVar; // with refrence to var location
                        traversalResult += "A2"; // Load the X register with a Constant
                        traversalResult += "01"; // Print the integer stored in the Y register
                        traversalResult += "FF"; // make the system call to print
                        inPrint = false;
                    }
                    if (symbolTable[node.name][1] == "boolean")
                    {
                        traversalResult += "A0"; // Load the Y Register from with a const
                        traversalResult += heapStack[symbolTable[node.name][2]].toString(16); // with refrence to var location
                        traversalResult += "A2"; // Load the X register with a Constant
                        traversalResult += "02"; // Print the static Memory stored in the Y register
                        traversalResult += "FF"; // make the system call to print
                        inPrint = false;
                    }
                    if (symbolTable[node.name][1] == "string")
                    {
                        tempVar = symbolTable[node.name][0];
                        traversalResult += "AC"; // Load the Y Register from with a const
                        traversalResult += tempVar; // with refrence to var location
                        traversalResult += "A2"; // Load the X register with a Constant
                        traversalResult += "02"; // Print the static Memory stored in the Y register
                        traversalResult += "FF"; // make the system call to print
                        inPrint = false;
                    }
                }
                else
                {
                    if (heapStack[node.name] == undefined)
                    {
                        heapStack[node.name] = toHexPosition(node.name);
                    }
                    
                    if (node.name == "true" || node.name == "false")
                    {
                        //tempVar2 = "T" + staticCounter + "XX";
                        //symbolTable["tempStr"] = [, "int"];
                        //console.log("Under Construction");
                        traversalResult += "A0"; // Load the Y Register from with a const
                        traversalResult += heapStack[node.name].toString(16); // with refrence to var location
                        traversalResult += "A2"; // Load the X register with a Constant
                        traversalResult += "02"; // Print the static Memory stored in the Y register
                        traversalResult += "FF"; // make the system call to print
                        inPrint = false;

                    }
                    else
                    {   
                        traversalResult += "A0"; // Load the Y Register from with a const
                        traversalResult += heapStack[node.name].toString(16); // with refrence to var location
                        traversalResult += "A2"; // Load the X register with a Constant
                        traversalResult += "02"; // Print the static Memory stored in the Y register
                        traversalResult += "FF"; // make the system call to print
                        inPrint = false;
                    }
                }
                
            }
            else // Is a Number
            {
                traversalResult += "A0"; // Load the Y Register from memory
                traversalResult += "0" + node.name; // 0 and Some number between 0-9
                traversalResult += "A2"; // Load the X register with a Constant
                traversalResult += "01"; // Print the integer stored in the Y register
                traversalResult += "FF"; // make the system call to print
                inPrint = false;
            }
        }
        
        if (inWhile)
        {
            endLoc = endLoc+5;
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
        if (node.name =="AssignmentStatement")
        {
            inAssign = true;
            firstVar = true;
        }
        if (node.name == "PrintStatement")
        {
            inPrint = true;
        }
        if (node.name == "ADD")
        {
            //console.log("Under Construction");
            addCounter++;
            added = true;
            //traversalResult += "A9" // Load from memory    
        }
        if (node.name == "WhileStatement")
        {
            if (node.children[0].name == "false")
            {
                stop = false;
            }
            else
            {
                if (node.children[0].name == "true")
                {
                    inWhile = true;
                    alwaysTrue = true;
                    startLoc = traversalResult.length/2;
                    endLoc = startLoc;
                }
                else
                {
                    if (node.children[0].name == "false")
                    {
                        inWhile = false;
                        alwaysTrue = false;
                        stop = false;
                    }
                }
            }
        }
        if (node.name == "IfStatement")
        {
            if (node.children[0].name == "false")
            {
                stop = false;
            }
            else
            {
                
            }
        }
        //if (node.name == "")
        if(stop)
        {
            for (var i = 0; i < node.children.length; i++)
            {
                astExpand(node.children[i], depth + 1);
            }
            stop = true;
        }
        if (inWhile)
        {
            if(alwaysTrue)
            {
                jump = endLoc - startLoc;
                console.log(jump);
                jump = 256-jump;
                console.log(jump);
                traversalResult += "A2";
                traversalResult += "00";
                traversalResult += "EC";
                traversalResult += "FE";
                traversalResult += "00";
                traversalResult += "D0";
                traversalResult += jump.toString(16);
                alwaysTrue = false;
            }
        }
    }
}

function replaceFakes(string)
{
    var codeLength;
    var startLocation;
    var temp;
    
    codeLength = (string.length)/2;

    if (codeLength % 2 != 0)
    {
        codeLength++;
    }
    console.log(codeLength);
    temp = codeLength;
    //codeLength++;
    startLocation = codeLength.toString(16);
   
    for (var k in symbolTable)
    {
        tempVar = symbolTable[k][0];
        if(startLocation.length == 1)
        {
            startLocation = "0"+startLocation;
        }
        tempVar2 = startLocation+"00";
        
        var re = new RegExp(tempVar,"g");
        
        console.log("Running Replace : "+ symbolTable[k][0] + " with "+ startLocation+"00");
        string = string.replace(re, tempVar2);
        
        temp++;
        startLocation = temp.toString(16);
        //console.log(startLocation);
    }
    
    return string;
}

function toHex(string)
{
    var hexValue = "";
    
    for (i = 0; i < string.length; i++)
    {
        hexValue += (string.charCodeAt(i)).toString(16);
        //hexValue += " ";
        heapPosition --;
    }
    hexValue += "00";
    
    return hexValue;
}

function toHexPosition(string)
{
    var hexValue = "";
    
    for (i = 0; i < string.length; i++)
    {
        hexValue += (string.charCodeAt(i)).toString(16);
        //hexValue += " ";
        heapPosition --;
    }
    hexValue += "00";
    heapPosition --;
    
    return heapPosition;
}

function addSpaces(string)
{
    var holder = "";
    
    for (i = 0; i < string.length; i++)
        {
            holder += string.charAt(i);
            //console.log("adding"+string.charAt(i))
            if(i%2 != 0)
                {
                    holder+= " ";
                }
        }
    return holder;
}

function combine(string, stack)
{
    var zeros;
    heapString = "";
    
    for (var k in stack)
    {
        heapString = toHex(k) + heapString;
    }
    console.log(heapString);
    
    if((string.length+heapString.length)/2 > 255)
    {
        throw "Not Enoguh Memory";
    }
    else
    {
        zeros = (256 - (string.length+heapString.length)/2)
        for (i = 0; i< zeros; i++)
        {
            string += "00";
        }
        string += heapString;
    }
    return string;
}

function addStaticCode(string)
{
    var holder = "";
    holder = string;
    
    for (var k in symbolTable)
    {
        holder += "00"
    }
    return holder;
}

//function getMemories()