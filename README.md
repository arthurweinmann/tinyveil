<p align="center">
    <img src="doc/logo.png"/>
</p>

# Vanilla Javascript Typesystem

This library provides a comprehensive suite of utility functions for type checking in vanilla JavaScript without the need for any additional frameworks or a compiler. It offers an immediate and proactive way of validating data types during the development process, which can be particularly useful in a language like JavaScript where types can be loosely defined It is very simple and aims at staying simple to use.These helper functions throw errors immediately when a type mismatch or invalid parameter is detected, facilitating early error discovery and making debugging easier. Furthermore, there's a function to verify if a given JSON object matches a specific schema, a feature which is quite useful when working with JSON data from an API. It makes debugging frontend to backend communication and inconsistencies easier. This library is a simple way to enforce strict type checking with zero maintenance costs. 

Maybe we do not need another framework but a typesystem on the side.

## Features

- Javascript type assertions with some nice quirks
- Object check against a type schema (for receiving response from backend apis for example)
- An interesting alpha experiment of an HTML node type compiling to and from an HTMLElement recursively

## Usage

First, include tinyveil.js in your project.

Here are some examples:

```javascript
const roles = ['admin', 'user', 'guest'];

const API_RESPONSES_SCHEMAS = {
    "get_user": {
        "name": "string",
        "age": {
            "type": "number",
            "optional": true,
        },
        "role": "string",
    }
}

class User {
    /**
     * 
     * @param {string} name 
     * @param {number} age 
     * @param {string} role 
     */
    constructor(name, age, role) {
        AssertTypeOf('string', name);
        AssertTypeOf('number', age);
        AssertEnum(role, roles);

        this.name = name;
        this.age = age;
        this.role = role;
    }

    static ParseUserFromAPI(userJson) {
        CheckJsonAgainstSchema(userJson, API_RESPONSES_SCHEMAS["get_user"]);
    }
}

let schema = {
    "id": "number",
    "name": "string",
    "active": "boolean",
    "details": {
        "email": "string",
        "age": "number"
    },
    "optionalField": {
        "type": "string",
        "optional": true
    },
    "tableau": ["number"],
    "tableau2": ["string"]
};
let myJson = {
    "id": 1,
    "name": "John",
    "active": true,
    "details": {
        "email": "john@example.com",
        "age": 30
    },
    "tableau": [1, 2, 3],
    "tableau2": ["a", "b", "c"],
    // "optionalField" is missing, but that's okay because it's optional
};
if (CheckObjectAgainstSchema(myJson, schema) !== true) {
    throw new Error("invalid response");
}

let userSchema = {
    "name": "string",
    "age": { "type": "number", "optional": true },
    "address": { "type": "$addressSchema" }
};

let addressSchema = {
    "street": "string",
    "city": "string",
    "state": "string",
    "country": "string",
    "zip": "string"
};

let referencedSchemas = {
    "$addressSchema": addressSchema
};

let userObject = {
    "name": "John Doe",
    "age": 25,
    "address": {
        "street": "123 Main St",
        "city": "Anytown",
        "state": "Anystate",
        "country": "USA",
        "zip": "12345"
    }
};
if (CheckObjectAgainstSchema(userObject, userSchema, referencedSchemas) !== true) {
    throw new Error("invalid response");
}

userObject = {
    "name": "John Doe",
    "address": {
        "city": "Anytown",
        "state": "Anystate",
        "country": "USA",
        "zip": "12345"
    }
};
if (CheckObjectAgainstSchema(userObject, userSchema, referencedSchemas) !== false) {
    throw new Error("invalid response");
}

let htmlSchema = {
    "tagName": "string",
    "attributes": {
        "id": "string",
        "class": "string"
    },
    "children": {
        "type": ["$htmlSchema"],
        "optional": true,
    }
};
let nodeWithChildren = {
    "tagName": "div",
    "attributes": {
        "id": "",
        "class": "className"
    },
    "children": [
        {
            "tagName": "div",
            "attributes": {
                "id": "",
                "class": "className2"
            },
            "children": [
                {
                    "tagName": "div",
                    "attributes": {
                        "id": "",
                        "class": "className3"
                    },
                },
            ],
        },
        {
            "tagName": "div",
            "attributes": {
                "id": "id1",
                "class": ""
            },
            "children": [

            ],
        }
    ],
};
if (CheckObjectAgainstSchema(nodeWithChildren, htmlSchema, {"$htmlSchema": htmlSchema}) !== true) {
    throw new Error("invalid response");
}

let htmlNodeType = HTMLElementType.FromNode(document.querySelector("html"));

let newelem = htmlNodeType.ToHTML({"#test": {innerText: "Replaced text"}});

if (newelem.children.length != 2 ||
newelem.children[1].children[0].innerText !== "Replaced text") {
    throw new Error("invalid response");
}

// You can also check that fields are of a certain class instance, for example if we have the class Decimal:
class MyJavascriptClass {
    constructor() {}
}

CheckObjectAgainstSchema(point, {
    x: "#MyJavascriptClass",
    y: "#MyJavascriptClass"
}, { "#MyJavascriptClass": MyJavascriptClass }); // use the # to identify classes provided in the reference parameter

// To test an array and not a root object containing an array, for now the best way to do this is to put the array into a temporary object for the test as so:
CheckObjectAgainstSchema({ result: result }, {
   result: [
       {
           a: "number",
           b: "number",
           c: "string",
           d: "string"
       }
   ], 
{});
```

For more information on each function and class, please refer to the comments above their definitions in the code.

## License

Please refer to the license file.
