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
            //console.log("Why am i getting here");
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
    
    // Return the code Gen result
//    this.codeToString = function(symbolTable) {
//        var staticCounter = -1;
//        var heapCounter = -1;
//        var staticTable = [];
//        var heapTable;
//        var inVarDecl = false;
//        var inAssign = false;
//        var tempLoc;
//        
//        // Initialize the result string.
//        var traversalResult = "";
//
//        // Recursive function to handle the expansion of the nodes.
//        function expand(node, depth)
//        {
//            // Space out based on the current depth so
//            // this looks at least a little tree-like.
////            for (var i = 0; i < depth; i++)
////            {
////                traversalResult += "-";
////            }
//
//            // If there are no children (i.e., leaf nodes)...
//            if (!node.children || node.children.length === 0)
//            {
//                // ... note the leaf node.
////                traversalResult += "[" + node.name + "]";
////                traversalResult += "\n";
//                if (inVarDecl)
//                {
//                    if (node.name == "int" || node.name == "boolean")
//                    {
//                        staticCounter++;
//                        
//                        traversalResult += "A9" //Load with the constant
//                        traversalResult += "00" // 0
//
//                        traversalResult += "8D" // Store the value
//                        traversalResult += "T" + staticCounter + "XX"; // To a temporary location.
//                        
//                        tempLoc = "T" + staticCounter + "XX";
//                    }
//                    else
//                    {
//                        if (node.name == "string")
//                            {
//                                console.log("Under Construction");
//                            }
//                    }
//                    
//                    if (node.name.length == 1)
//                    {
//                        console.log(tempLoc);
//                        
//                        staticTable.push([node.name, tempLoc, ]);
//                        inVarDecl = false;
//                    }
//                }
//                
//                if (inAssign)
//                {
//                    if ()
//                    traversalResult += "A9" //Load with the constant
//                    traversalResult += "00" // 0
//
//                    traversalResult += "8D" // Store the value
//                    traversalResult += "T" + staticCounter + "XX";
//                }
//            }
//            else
//            {
//                // There are children, so note these interior/branch nodes and ...
//                //traversalResult += "<" + node.name + "> \n";
//                // .. recursively expand them.
//                
//                if (node.name =="VarDecl")
//                    {
//                        inVarDecl = true;
//                    }
//                if (node.name =="AssignStatement")
//                    {
//                        inAssign = true;
//                    }
//                
//                for (var i = 0; i < node.children.length; i++)
//                {
//                    expand(node.children[i], depth + 1);
//                }
//            }
//        }
//        // Make the initial call to expand from the root.
//        expand(this.root, 0);
//        console.log(staticTable);
//        // Return the result.
//        return traversalResult;
//    };
//}