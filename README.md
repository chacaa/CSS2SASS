# unSASS
unSASS is a npm package that allows you to transform your .css files in .sass files with the awesome SASS sintaxys.


### Instalation
In order to use unSASS in your proyect you need to run:
```
npm install --save unsass
```

### Usage
```js
const unsass = require('unsass');

/* 
  allVariables = true if you want all values as variables, 
  if not use allVariables = false 
*/
const allVariables = true;
const file = './path-to-your-file';

const sass = unsass.unSASS(file, allVariables);
```

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
