module.exports = {
    generateSASSTree: function(parsedCSS, allValuesAsVariables) {
        const tree = [];
        const variables = generateVariables(parsedCSS, allValuesAsVariables);
        const nodes = parsedCSS.nodes;

        for (let i=0; i < nodes.length; i++) {
            if (nodes[i].type === 'comment') {
                pushNode(tree, 'comment', null, nodes[i].text, null);
            } else {
                const selector = nodes[i].selector;
                const splitBySpace = selector.split(" ");
                const splitByComma = selector.split(",");

                if (splitBySpace.length > 1 || splitByComma > 1) {
                    if (splitBySpace.length > 1) {
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
                        }

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

                        if (!alreadyDefined) {
                            pushNode(tree, 'rule', parentSelector, null, child);
                        }
                    } else {
                        //TODO
                    }
                } else {
                    const attributes = nodes[i].nodes;
                    const childs = generateChildren(attributes, variables, nodes);

                    pushNode(tree, 'rule', selector, null, childs);
                }
            }
        }

        print(tree, variables);
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

function print(tree, variables) {
    for (let i=0; i<variables.length; i++) {
        console.log(variables[i][0] + ' = ' + variables[i][1]);
    }

    for (let i=0; i<tree.length; i++) {
        const node = tree[i];
        if (node.type === 'comment') {
            console.log('/* ' + node.value + ' */');
        } else {
            console.log(node.name);
            const children = node.children;
            for (let j=0; j<children.length; j++) {
                const child = children[j];
                if (child.type === 'comment') {
                    console.log('\t/* ' + child.value + ' */');
                } else {
                    if (child.type === 'rule') {
                        console.log('\t' + child.name);

                        const childs = child.children;
                        for (let k=0; k<childs.length; k++) {
                            if (childs[k].type === 'comment') {
                                console.log('\t\t/* ' + childs[k].value + ' */');
                            } else {
                                console.log('\t\t' + childs[k].name + ': ' + childs[k].value);
                            }
                        }
                    } else {
                        console.log('\t' + child.name + ': ' + child.value);
                    }
                }
            }
        }
    }
}