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
 * Function to check JSON against schema
 * Example:
 * 
 * let schema = {
 *      "id": "number",
 *      "name": "string",
 *      "active": "boolean",
 *      "details": {
 *          "email": "string",
 *          "age": "number"
 *      },
 *      "optionalField": {
 *          "type": "string",
 *          "optional": true
 *      },
 *      "tableau": ["number"],
 *      "tableau2": ["string"]
 * };
 * let myJson = {
 *      "id": 1,
 *      "name": "John",
 *      "active": true,
 *      "details": {
 *          "email": "john@example.com",
 *          "age": 30
 *      },
 *      "tableau": [1, 2, 3],
 *      "tableau2": ["a", "b", "c"],
 *      // "optionalField" is missing, but that's okay because it's optional
 *  };
 *  L.Debug(CheckJsonAgainstSchema(myJson, schema)); // Output: true
 *
 * @param {Object<string, any>} json 
 * @param {Object<string, any>} schema 
 * @returns 
 */
function CheckJsonAgainstSchema(json, schema) {
    AssertTypeOf(json, "object");
    AssertTypeOf(schema, "object");

    // Iterate over each property in the schema
    for (let key in schema) {
        // If the JSON doesn't have this property, check if it's optional
        if (!json.hasOwnProperty(key)) {
            if (schema[key].optional) {
                continue; // If it's optional, skip the rest of the loop for this property
            } else {
                L.Debug(`Missing property: ${key}`);
                return false;
            }
        }

        let requiredType;
        if (schema[key].type) {
            requiredType = schema[key].type;
        } else {
            requiredType = schema[key];
        }

        // If the required type is an object, recurse into it
        if (typeof requiredType === "object" && !Array.isArray(requiredType)) {
            // If the corresponding JSON property is not an object, return false
            if (typeof json[key] !== "object" || Array.isArray(json[key])) {
                L.Debug(`Expected object for property: ${key}`);
                return false;
            }
            // Recurse into the object
            if (!CheckJsonAgainstSchema(json[key], requiredType)) {
                return false;
            }
        } else if (Array.isArray(requiredType)) {
            // If requiredType is an array, check if the json value is an array of the correct type
            if (!Array.isArray(json[key])) {
                L.Debug(`Expected array for property: ${key}`);
                return false;
            } else {
                // Check each item in the array
                for (let item of json[key]) {
                    // Recurse into the array item and expexted item type
                    if (!CheckJsonAgainstSchema(item, requiredType[0])) {
                        return false;
                    }
                }
            }
        } else {
            // If the types don't match, return false
            if (typeof json[key] !== requiredType) {
                L.Debug(`Incorrect type for property: ${key}. Expected ${requiredType}, got ${typeof json[key]}`);
                return false;
            }
        }
    }

    // If we made it through all properties without returning false, the JSON matches the schema
    return true;
}