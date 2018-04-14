module.exports = {
    getSASSTree: function(parsedCSS, allValuesAsVariables) {
        const tree = [];
        const variables = generateVariables(parsedCSS, allValuesAsVariables);
        const superClasses = generateSuperClasses(parsedCSS, variables);
        const nodes = parsedCSS.nodes;

        for (let i=0; i < nodes.length; i++) {
            if (nodes[i].type === 'comment') {
                pushNode(tree, 'comment', null, nodes[i].text, null);
            } else if (nodes[i].type == 'atrule') {
                const attributes = nodes[i].nodes;
                const childs = generateChildren(attributes, variables, nodes);
                const name = '@' + nodes[i].name;
                pushNode(tree, 'atrule', name, null, childs);
            } else {
                const selector = nodes[i].selector;
                const splitBySpace = selector.split(" ");
                const splitByComma = selector.split(",");

                if (splitBySpace.length > 1 || splitByComma.length > 1) {
                    if (splitBySpace.length > 1 && splitByComma.length == 1) {
                        const parentSelector = splitBySpace[0];
                        let childSelector = '';

                        for (let j=1; j<splitBySpace.length; j++) {
                            if (j != splitBySpace.length - 1) {
                                childSelector += splitBySpace[j] + ' '; 
                            } else {
                                childSelector += splitBySpace[j]; 
                            }
                        }

                        const attributes = nodes[i].nodes;
                        const childs = generateChildren(attributes, variables, nodes);

                        const child = {
                            type: 'rule',
                            name: childSelector,
                            value: null,
                            children: childs
                        };

                        let alreadyDefined = false;
                        for (let j=0; j < tree.length; j++) {
                            if (tree[j].name === parentSelector) {
                                const children = [].concat(tree[j].children);
                                children.push(child);
                                tree[j].children = children;
                                alreadyDefined = true;
                                break;
                            }
                        }

                        if (!alreadyDefined ) {
                            pushNode(tree, 'rule', parentSelector, null, child);
                        }
                    } 
                } else {
                    const attributes = nodes[i].nodes;
                    const childs = generateChildren(attributes, variables, nodes);
                    let extendsSupperClass = false;
                    for (let j=0; j<superClasses.length; j++) {
                        const superClass = superClasses[j];

                        for (let k=0; k<superClass.list.length; k++) {
                            if (nodes[i].selector === superClass.list[k]) {
                                const newChild = [];
                                pushNode(newChild, 'extension', '@extend ' + superClass.name, null, null);
                                pushNode(tree, 'rule', selector, null, newChild.concat(childs));
                                extendsSupperClass = true;
                                break;
                            }
                        }

                        if (extendsSupperClass) {
                            break;
                        }
                    }

                    if (!extendsSupperClass) {
                        pushNode(tree, 'rule', selector, null, childs);
                    }
                }
            }
        }

        for (let i=0; i<superClasses.length; i++) {
            const superClass = superClasses[i];
            const selectors = superClass.list;
            for (let j=0; j<selectors.length; j++) {
                let selectorUndefined = true;
                for (let k=0; k<tree.length; k++) {
                    if (tree[k].type === 'rule' && selectors[j] === tree[k].name) {
                        selectorUndefined = false;
                        break;
                    }
                }

                if (selectorUndefined) {
                    const newChild = [];
                    pushNode(newChild, 'extension', '@extend ' + superClass.name, null, null);
                    pushNode(tree, 'rule', selectors[j], null, newChild);
                }
            }
        }

        return { 
            variables, 
            superClasses, 
            tree, 
            toString: toString(tree, variables, superClasses), 
            error: null 
        };
    }
}

function generateChildren(attributes, variables, nodes) {
    const childs = [];

    for (let i=0; i< attributes.length; i++) {
        if (attributes[i].type === 'decl') {
            var replaced = false;
            for(let j=0; j<variables.length; j++) {
                if (variables[j][1] == attributes[i].value) {
                    pushNode(childs, 'decl', attributes[i].prop, variables[j][0], null)
                    replaced = true;
                    break;
                }
            }

            if (!replaced) {
                pushNode(childs, 'decl', attributes[i].prop, attributes[i].value, null)
            }
        } else {
            pushNode(childs, 'comment', null, attributes[i].text, null)
        }
    }

    return childs;
}

function generateVariables(parsedCSS, allValuesAsVariables) {
    var valuesArray = [];
    var repeatedValues = [];
    var variables = [];

    var nodes = parsedCSS.nodes;
    for (var i=0; i < nodes.length; i++) {
        if (nodes[i].type != 'comment') {
            var attributes = nodes[i].nodes;
            for (var j=0; j< attributes.length; j++) {
                if (attributes[j].type === 'decl') {
                    var value = attributes[j].value;
                    if (valuesArray.includes(value)) {
                        if (!repeatedValues.includes(value)) {
                            repeatedValues.push(value);
                        }
                    } else {
                        valuesArray.push(value);
                    }
                }
            }
        }
    }

    var index = 0;
    var variable = [];
    if (allValuesAsVariables) {
        for (var k=0; k < valuesArray.length; k++) {
            variable = ['$var' + index, valuesArray[k]];
            variables.push(variable);
            index ++;
        }
    } else {
        for (var k=0; k < repeatedValues.length; k++) {
            variable = ['$var' + index, repeatedValues[k]];
            variables.push(variable);
            index ++;
        }
    }

    return variables;
}

function pushNode(tree, type, name, value, children) {
    const newNode = {
        type: type,
        name: name,
        value: value,
        children: children
    };

    tree.push(newNode);
}

function toString(tree, variables, superClasses) {
    var sass = '';

    for (let i=0; i<variables.length; i++) {
        sass += variables[i][0] + ': ' + variables[i][1] + '\n';
    }

    for (let i=0; i<superClasses.length; i++) {
        const superClass = superClasses[i];
        sass += superClass.name + '\n';
        const childs = superClass.content;
        for (let k=0; k<childs.length; k++) {
            if (childs[k].type === 'comment') {
                sass += '\t/* ' + childs[k].value + ' */\n';
            } else {
                sass += '\t' + childs[k].name + ': ' + childs[k].value + '\n';
            }
        }
    }

    for (let i=0; i<tree.length; i++) {
        const node = tree[i];
        if (node.type === 'comment') {
            sass += '/* ' + node.value + ' */\n';
        } else {
            sass += node.name + '\n';
            const children = node.children;
            for (let j=0; j<children.length; j++) {
                const child = children[j];
                if (child.type === 'comment') {
                    sass += '\t/* ' + child.value + ' */\n';
                } else {
                    if (child.type === 'rule') {
                        sass += '\t' + child.name + '\n';
                        const childs = child.children;
                        for (let k=0; k<childs.length; k++) {
                            if (childs[k].type === 'comment') {
                                sass += '\t\t/* ' + childs[k].value + ' */\n';
                            } else {
                                sass += '\t\t' + childs[k].name + ': ' + childs[k].value + '\n';
                            }
                        }
                    } else {
                        if (child.type === 'extension') {
                            sass += '\t' + child.name + '\n';
                        } else {
                            sass += '\t' + child.name + ': ' + child.value + '\n';
                        }
                    }
                }
            }
        }
    }
    return sass;
}

function generateSuperClasses(parsedCSS, variables) {
    const nodes = parsedCSS.nodes;
    const superClasses = [];
    let index = 1;

    for (let i=0; i<nodes.length; i++) {
        const node = nodes[i];
        if (node.type === 'rule') {
            const selectors = node.selector.split(",");
            if (selectors.length > 1) {
                for (let j=0; j<selectors.length; j++) {
                    selectors[j] = selectors[j].trim();
                }

                const childs = generateChildren(node.nodes, variables, nodes);

                const superClass = {
                    name: '%message-shared' + index,
                    content: childs,
                    list: selectors
                };
                superClasses.push(superClass);

                index ++;
            }
        }
    }

    return superClasses;
}
