# Vanilla Javascript Typesystem

This library provides a comprehensive suite of utility functions for type checking in vanilla JavaScript without the need for any additional frameworks or a compiler. It offers an immediate and proactive way of validating data types during the development process, which can be particularly useful in a language like JavaScript where types can be loosely defined It is very simple and aims at staying simple to use.These helper functions throw errors immediately when a type mismatch or invalid parameter is detected, facilitating early error discovery and making debugging easier. Furthermore, there's a function to verify if a given JSON object matches a specific schema, a feature which is quite useful when working with JSON data from an API. It makes debugging frontend to backend communication and inconsistencies easier. This library is a simple way to enforce strict type checking with zero maintenance costs. 

Maybe we do not need another framework but a typesystem on the side.

## Features

Here's a brief rundown of the features available in this library:

- `AssertInstOf(src, target)`: Asserts that the `src` is an instance of `target`. If not, it throws an error.

- `AssertEnum(src, possibleValues)`: Asserts that `src` is one of the `possibleValues`. If not, it throws an error.

- `AssertTypeOf(src, t)`: Asserts that the type of `src` matches `t`. If not, it throws an error.

- `AssertOneOrTheOtherString(...n)`: Asserts that there is only one non-empty string among the input parameters. If not, it throws an error.

- `AssertTypeOfOR(src, ...t)`: Asserts that the type of `src` is one of the types in `t`. If not, it throws an error.

- `AssertNotEqual(src, target)`: Asserts that `src` and `target` are not equal. If they are equal, it throws an error.

- `AssertEqual(src, target)`: Asserts that `src` and `target` are equal. If they are not equal, it throws an error.

- `AssertArray(src)`: Asserts that `src` is an array. If it is not an array, it throws an error.

- `AssertArrayOfType(src, t)`: Asserts that `src` is an array and all elements are of type `t`. If not, it throws an error.

- `CheckObjectAgainstSchema(obj, schema, referencedSchemas)`: Checks an object `obj` against a schema `schema`, using `referencedSchemas` for type references.

- `NATIVE_SCHEMAS`: A native schema used to define the structure of an HTML element.

- `HTMLElementType`: A class that validates an HTML element against a schema, and can also convert an HTML element to its schema.

## Usage

First, include typesystem.js in your project.

Here is an example:

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
        AssertTypeOf(name, 'string');
        AssertTypeOf(age, 'number');
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
```

For more information on each function and class, please refer to the comments above their definitions in the code.

## License

This library is under the MIT License. You are free to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of this software, subject to certain conditions. Please refer to the license text at the top of the JavaScript file for more details.
