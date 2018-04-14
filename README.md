# unSASS
unSASS is a npm package that allows you to transform your .css files in .sass files with the awesome SASS sintaxys.

This is possible thanks to postcss and their amazing [library](https://github.com/postcss/postcss).

### Instalation
In order to use unSASS in your proyect you need to run:
```
npm install --save unsass
```

### Usage
```js
const unsass = require('unsass');
const allVariables = false; // allVariables = true if you want all values as variables 
const file = './path-to-your-file';

const sass = unsass.unSASS(file, allVariables);
```

### Output value
The unSASS function will return an js object with this structure:
```
{
  variables: [list_of_variables],
  superClasses: [list_of_superclasses],
  tree: the_sass_tree,
  toString: the_sass_tree_in_string_format,
  error: error
}
```
If there is an error all properties will be null except the error property.

### Example
If the input is:
```css
nav ul {
  margin: 10px;
  padding: 10px;
  list-style: none;
}

nav li {
  display: inline-block;
}

.message, .success {
  border: 1px solid #cccccc;
  padding: 10px;
  color: #333;
}

.success {
  border-color: #333;
}
```
The output is:
```sass
$var1: 10px
$var2: #333

%message-shared
  border: 1px solid #cccccc
  padding: $var1
  color: $var2
  
nav
  ul
    margin: $var1
    padding: $var1
    list-style: none
  li
    display: inline-block

.success 
  @extend %message-shared
  border-color: $var2
  
.message
  @extend %message-shared
```
