/*
This library provides a comprehensive suite of utility functions for type checking in vanilla JavaScript without the need for any additional 
frameworks or a compiler. 
It offers an immediate and proactive way of validating data types during the development process, which can be particularly useful in a language 
like JavaScript where types can be loosely defined It is very simple and aims at staying simple to use.These helper functions throw errors 
immediately when a type mismatch or invalid parameter is detected, facilitating early error discovery and making debugging easier. 
Furthermore, there's a function to verify if a given JSON object matches a specific schema, a feature which is quite useful when working 
with JSON data from an API. It makes debugging frontend to backend communication and inconsistencies easier. 
This library is a simple way to enforce strict type checking with zero maintenance costs.

MIT License

Copyright (c) 2023 Arthur Weinmann

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

function AssertInstOf(src, target) {
    if (!(src instanceof target)) {
        throw new Error("invalid parameter");
    }
}

function AssertEnum(src, possibleValues) {
    AssertInstOf(possibleValues, Array);
    if (!possibleValues.includes(src)) {
        throw new Error("invalid parameter");
    }
}

function AssertTypeOf(src, t) {
    if (typeof src !== t) {
        throw new Error("invalid parameter " + typeof src);
    }
}

function AssertOneOrTheOtherString(...n) {
    let one = false
    for (let i = 0; i < n.length; i++) {
        AssertTypeOf(n[i], 'string');
        if (n[i].length > 0) {
            if (one) {
                throw new Error("invalid parameters: only one non empty string supported");
            }
            one = true
        }
    }
}

function AssertTypeOfOR(src, ...t) {
    for (let i = 0; i < t.length; i++) {
        if (typeof src === t[i]) {
            return;
        }
    }
    throw new Error("invalid parameter " + typeof src);
}

function AssertNotEqual(src, target) {
    if (src === target) {
        throw new Error("invalid parameter");
    }
}

function AssertEqual(src, target) {
    if (src !== target) {
        throw new Error("invalid parameter");
    }
}

function AssertArray(src) {
    if (!Array.isArray(src)) {
        throw new Error("invalid parameter, expected an array");
    }
}

function AssertArrayOfType(src, t) {
    AssertArray(src);
    for (let i = 0; i < src.length; i++) {
        if (typeof src[i] !== t) {
            throw new Error(`invalid parameter at index ${i}, expected a ${t}`);
        }
    }
}



/**
 * Function to check Object against a type schema with the possibility to reference schemas as the type of one or more fields.
 * 
 * @param {Object<string, any>} obj 
 * @param {Object<string, any>} schema
 * @param {Object<string, Object<string, any>>|undefined} referencedSchemas 
 * @returns 
 */
function CheckObjectAgainstSchema(obj, schema, referencedSchemas) {
    AssertTypeOf(obj, "object");
    AssertTypeOf(schema, "object");
    AssertTypeOfOR(referencedSchemas, "object", "undefined");

    // Iterate over each property in the schema
    for (let key in schema) {
        // If the Object doesn't have this property, check if it's optional
        if (!obj.hasOwnProperty(key)) {
            if (schema[key].optional) {
                continue; // If it's optional, skip the rest of the loop for this property
            } else {
                console.log(`Missing property: ${key}`);
                return false;
            }
        }

        let requiredType;
        if (schema[key].type) {
            requiredType = schema[key].type;
        } else {
            requiredType = schema[key];
        }

        // If the required type is a reference a schema, substitute it
        if (typeof requiredType === 'string' && requiredType.charAt(0) === "$") {
            requiredType = referencedSchemas[requiredType];
            if (requiredType === undefined || typeof requiredType !== 'object') {
                throw new Error("could not find the schema " + requiredType + " referenced in root schema defintion"); // better to panic early for this error than returning false
            }
        }

        // If the required type is an object, recurse into it
        if (typeof requiredType === "object" && !Array.isArray(requiredType)) {
            // If the corresponding Object property is not an object, return false
            if (typeof obj[key] !== "object" || Array.isArray(obj[key])) {
                console.log(`Expected object for property: ${key}`);
                return false;
            }
            // Recurse into the object
            if (!CheckObjectAgainstSchema(obj[key], requiredType, referencedSchemas)) {
                return false;
            }
        } else if (Array.isArray(requiredType)) {
            // If requiredType is an array, check if the object value is an array of the correct type
            if (!Array.isArray(obj[key])) {
                console.log(`Expected array for property: ${key}`);
                return false;
            } else {
                if (typeof requiredType[0] === 'string' && requiredType[0].charAt(0) === "$") {
                    requiredType[0] = referencedSchemas[requiredType[0]];
                    if (requiredType[0] === undefined || typeof requiredType[0] !== 'object') {
                        throw new Error("could not find the schema " + requiredType[0] + " referenced in root schema defintion"); // better to panic early for this error than returning false
                    }
                }

                // Check each item in the array
                for (let item of obj[key]) {
                    if (typeof requiredType[0] === 'object') {
                        // Recurse into the array item and expected item type
                        if (!CheckObjectAgainstSchema(item, requiredType[0], referencedSchemas)) {
                            return false;
                        }
                    } else {
                        // If the types don't match, return false
                        if (typeof item !== requiredType[0]) {
                            console.log(`Incorrect type for array item: ${item}. Expected ${requiredType[0]}, got ${typeof item}`);
                            return false;
                        }
                    }
                }
            }
        } else {
            // If the types don't match, return false
            if (typeof obj[key] !== requiredType) {
                console.log(`Incorrect type for property: ${key}. Expected ${requiredType}, got ${typeof obj[key]}`);
                return false;
            }
        }
    }

    // If we made it through all properties without returning false, the Object matches the schema
    return true;
}

const NATIVE_SCHEMAS = {
    "$HTML_ELEMENT": {
        "tagName": "string",
        "attributes": {
            "id": "string",
            "class": "string"
        },
        "children": {
            "type": ["$HTML_ELEMENT"],
            "optional": true,
        }
    },
};

class HTMLElementType {
    /**
     * 
     * @param {Object<string, any>} htmlSchema 
     */
    constructor(htmlSchema) {
        AssertTypeOf(htmlSchema, "object");
        if (!CheckObjectAgainstSchema(htmlSchema, NATIVE_SCHEMAS["$HTML_ELEMENT"], NATIVE_SCHEMAS)) {
            throw new Error("invalid parameter");
        }
        this.Schema = htmlSchema;
    }

    /**
     * 
     * @param {HTMLElement} node 
     * @return {Boolean}
     */
    Check(node) {
        // TODO
        return false;
    }

    /**
     * @template {{innerText: string, children: Array<attr>}} attr
     * @param {Object<string, attr>} fromRecursiveAttributes 
     * @return {HTMLElement}
     */
    ToHTML(fromRecursiveAttributes) {
        return this.#_tohtml(fromRecursiveAttributes, this.Schema);
    }

    #_tohtml(fromRecursiveAttributes, schema) {
        AssertTypeOf(fromRecursiveAttributes, "object");
        AssertTypeOf(schema, "object");

        // Create a new element based on the tagName
        let newElement = document.createElement(schema.tagName);

        // Set the element's id and class if they're present in the schema
        if (schema.attributes.id) {
            newElement.id = schema.attributes.id;
        }

        if (schema.attributes.class) {
            newElement.className = schema.attributes.class;
        }

        if (fromRecursiveAttributes.innerText) {
            newElement.innerText = fromRecursiveAttributes.innerText;
        }

        // Recurse into children, if any
        if (Array.isArray(fromRecursiveAttributes.children)) {
            if (!Array.isArray(schema.children) || fromRecursiveAttributes.children.length > schema.children.length) {
                console.log(schema.children, fromRecursiveAttributes.children, !Array.isArray(schema.children), fromRecursiveAttributes.children.length, schema.children.length);
                throw new Error("the provided recursive attributes does not follow this html type schema");
            }

            for (let i = 0; i < fromRecursiveAttributes.children.length; i++) {
                if (fromRecursiveAttributes.children[i] !== null) {
                    let childElement = this.#_tohtml(fromRecursiveAttributes.children[i], schema.children[i]);
                    newElement.appendChild(childElement);
                }
            }
        }

        return newElement;
    }

    /**
     * 
     * @param {HTMLElement} element 
     * @return {HTMLElementType}
     */
    static FromNode(element) {
        AssertInstOf(element, HTMLElement);

        let queue = [{ element: element, parentJson: null }];

        let rootJson;
        while (queue.length > 0) {
            let current = queue.shift();
            let currentElement = current.element;
            let parentJson = current.parentJson;

            // Initialize the JSON object for this element.
            let json = {
                tagName: currentElement.tagName.toLowerCase(),
                attributes: {
                    id: currentElement.id ? currentElement.id : "",
                    class: currentElement.className ? currentElement.className : ""
                },
                children: []
            };

            if (parentJson !== null) {
                parentJson.children.push(json);
            } else {
                rootJson = json;
            }

            // Loop through all children of the current element
            for (let i = 0; i < currentElement.children.length; i++) {
                let childElement = currentElement.children[i];
                if (childElement instanceof HTMLElement) {
                    queue.push({ element: childElement, parentJson: json });
                }
            }
        }

        return new HTMLElementType(rootJson);
    }


}

