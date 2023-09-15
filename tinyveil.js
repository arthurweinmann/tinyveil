const TINYVEIL_CUSTOM_TYPES_CHECKS = {
    "hexcolorcode": function (colorcode) {
        if (typeof colorcode !== 'string') {
            return false;
        }
        var reg = /^#([0-9a-f]{3}){1,2}$/i;
        return reg.test(colorcode);
    }
};

function AssertInstOf(target, ...src) {
    for (let i = 0; i < src.length; i++) {
        if (!(src[i] instanceof target)) {
            throw new Error("invalid parameter " + i + ": " + JSON.stringify(src[i]));
        }
    }
}

function AssertNullOrInstOf(target, ...src) {
    for (let i = 0; i < src.length; i++) {
        if (src[i] !== null && !(src[i] instanceof target)) {
            throw new Error("invalid parameter " + i + ": " + JSON.stringify(src[i]));
        }
    }
}

function AssertComplexInstOf(conditions, ...src) {
    AssertInstOf(Array, conditions);
    for (let i = 0; i < conditions.length; i++) {
        for (let j = 0; j < src.length; j++) {
            AssertInstOfOR(src[j], ...conditions[i].OR);
        }
    }
}

function AssertStringStartsWith(prefix, ...strs) {
    for (let i = 0; i < strs.length; i++) {
        if (!strs[i].startsWith(prefix)) {
            throw new Error("invalid parameter " + i + ": " + strs[i]);
        }
    }
}

function AssertStringStartsWithOr(str, ...prefixes) {
    AssertTypeOf('string', str);
    for (let i = 0; i < prefixes.length; i++) {
        if (str.startsWith(prefixes[i])) {
            return;
        }
    }
    throw new Error("invalid parameter not starting with either " + prefixes.join(" or ") + ": " + str);
}

function AssertTypeOf(t, ...src) {
    let customtype = null;
    if (typeof t === 'string' && TINYVEIL_CUSTOM_TYPES_CHECKS[t] !== undefined) {
        if (typeof TINYVEIL_CUSTOM_TYPES_CHECKS[t] !== 'function') {
            throw new Error("tinyveil internal inconsistency error");
        }
        customtype = TINYVEIL_CUSTOM_TYPES_CHECKS[t];
    }
    for (let i = 0; i < src.length; i++) {
        if (customtype !== null) {
            if (!customtype(src[i])) {
                throw new Error("invalid parameter " + i + ", expected " + t + ": " + typeof src[i] + " " + src[i]);
            }
        } else if (t === null) {
            if (src[i] !== null) {
                throw new Error("invalid parameter " + i + ", expected " + t + ": " + typeof src[i] + " " + src[i]);
            }
        } else if (t === undefined) {
            if (src[i] !== undefined) {
                throw new Error("invalid parameter " + i + ": " + typeof src[i] + " " + src[i]);
            }
        } else if (src[i] === null || src[i] === undefined || typeof src[i] !== t) { // typeof null is "object" and typeof undefined is "undefined"
            throw new Error("invalid parameter " + i + ", expected " + t + ": " + typeof src[i] + " " + src[i]);
        } else if (t === 'number' && isNaN(src[i])) {
            throw new Error("invalid parameter " + i + ", expected " + t + ": " + typeof src[i] + " " + src[i]);
        }
    }
}

function AssertNullOrTypeOf(t, ...src) {
    let customtype = null;
    if (typeof t === 'string' && TINYVEIL_CUSTOM_TYPES_CHECKS[t] !== undefined) {
        if (typeof TINYVEIL_CUSTOM_TYPES_CHECKS[t] !== 'function') {
            throw new Error("tinyveil internal inconsistency error");
        }
        customtype = TINYVEIL_CUSTOM_TYPES_CHECKS[t];
    }
    for (let i = 0; i < src.length; i++) {
        if (src[i] !== null) {
            if (customtype !== null) {
                if (!customtype(src[i])) {
                    throw new Error("invalid parameter " + i + ": " + typeof src[i] + " " + src[i]);
                }
            } else if (t === undefined) {
                if (src[i] !== undefined) {
                    throw new Error("invalid parameter " + i + ": " + typeof src[i] + " " + src[i]);
                }
            } else if (typeof src[i] !== t) {
                throw new Error("invalid parameter " + i + ": " + typeof src[i] + " " + src[i]);
            } else if (t === 'number' && isNaN(src[i])) {
                throw new Error("invalid parameter " + i + ": " + typeof src[i] + " " + src[i]);
            }
        }
    }
}

function AssertEnum(src, possibleValues) {
    AssertInstOf(Array, possibleValues);
    if (!possibleValues.includes(src)) {
        throw new Error("invalid parameter");
    }
}

/**
 * AssertOneOrTheOtherString throws an error if more than one string is not empty
 * @param  {...string} n 
 */
function AssertOneOrTheOtherString(...n) {
    let one = false
    for (let i = 0; i < n.length; i++) {
        AssertTypeOf('string', n[i]);
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
        if (typeof t[i] === 'string' && TINYVEIL_CUSTOM_TYPES_CHECKS[t[i]] !== undefined) {
            if (typeof TINYVEIL_CUSTOM_TYPES_CHECKS[t[i]] !== 'function') {
                throw new Error("tinyveil internal inconsistency error");
            }
            if (TINYVEIL_CUSTOM_TYPES_CHECKS[t[i]](src)) {
                return;
            }
        } else if (t[i] === null) {
            if (src === null) {
                return;
            }
        } else if (t[i] === undefined) {
            if (src === undefined) {
                return;
            }
        } else if (typeof src === t[i] && (t[i] !== 'number' || !isNaN(src))) {
            return;
        }
    }
    throw new Error("invalid parameter " + typeof src);
}

function AssertInstOfOR(src, ...t) {
    for (let i = 0; i < t.length; i++) {
        if (t[i] === null) {
            if (src === null) {
                return;
            }
        } else if (t[i] === undefined) {
            if (src === undefined) {
                return;
            }
        } else if (src instanceof t[i]) {
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
        throw new Error("invalid parameter, expected an array, got: " + JSON.stringify(src));
    }
}

function AssertArrayOfInstances(src, t) {
    for (let i = 0; i < src.length; i++) {
        if (!(src[i] instanceof t)) {
            throw new Error(`invalid parameter at index ${i}, expected a ${t}, got ${src[i]}`)
        }
    }
}

function AssertArrayOfType(src, t) {
    AssertArray(src);

    let customtype = null;
    if (typeof t === 'string' && TINYVEIL_CUSTOM_TYPES_CHECKS[t] !== undefined) {
        if (typeof TINYVEIL_CUSTOM_TYPES_CHECKS[t] !== 'function') {
            throw new Error("tinyveil internal inconsistency error");
        }
        customtype = TINYVEIL_CUSTOM_TYPES_CHECKS[t];
    }

    for (let i = 0; i < src.length; i++) {
        if (t === null) {
            if (src[i] !== null) {
                panic(`invalid parameter at index ${i}, expected a ${t}, but got`, src[i]);
            }
        } else if (t === undefined) {
            if (src[i] !== undefined) {
                panic(`invalid parameter at index ${i}, expected a ${t}, but got`, src[i]);
            }
        } else if (customtype !== null) {
            if (!customtype(src[i])) {
                panic(`invalid parameter at index ${i}, expected a ${t}, but got`, src[i]);
            }
        } else if (typeof src[i] !== t) {
            panic(`invalid parameter at index ${i}, expected a ${t}, but got`, src[i]);
        } else if (t === 'number' && isNaN(src[i])) {
            panic(`invalid parameter at index ${i}, expected a ${t}, but got`, src[i]);
        }
    }
}

/**
 * Function to check Object against a type schema with the possibility to reference schemas as the type of one or more fields.
 * 
 * @param {Object<string, any>} obj 
 * @param {Object<string, any>} schema
 * @param {Object<string, Object<string, any>>|undefined} referencedSchemas 
 */
function AssertObjectSchema(obj, schema, referencedSchemas) {
    let resp = CheckObjectAgainstSchema(obj, schema, referencedSchemas);
    if (!resp.success) {
        throw new Error("object does not respect schema: " + resp.message);
    }
}


/**
 * Function to check Object against a type schema with the possibility to reference schemas as the type of one or more fields.
 * 
 * TODO: refactor
 * @template {{success: boolean, message: string}} resp
 * @param {Object<string, any>} obj 
 * @param {Object<string, any>} schema
 * @param {Object<string, Object<string, any>>|undefined} referencedSchemas 
 * @return {resp}
 */
function CheckObjectAgainstSchema(obj, schema, referencedSchemas) {
    AssertTypeOf("object", schema);
    AssertTypeOfOR(referencedSchemas, "object", "undefined");

    if (typeof obj !== 'object' || obj === null || obj === undefined) {
        return { success: false, message: stringLog("Invalid object to check:", obj) };
    }

    // hack to handle root map type
    if (schema.type !== undefined && schema.keytype !== undefined && schema.valuetype !== undefined) {
        obj = {____: obj};
        schema = {____: schema};
    }

    // Iterate over each property in the schema
    for (let key in schema) {
        // the key may be modified below in this iteration if it begins with .
        let requiredType;
        
        // for `map` type only
        let keytype = null;
        let valuetype = null;

        if (schema[key].type) {
            requiredType = schema[key].type;
            if (requiredType === 'map') {
                if (typeof schema[key].keytype !== 'string') {
                    panic("When using type `map` we also need a string keytype field, for example 'number' or 'string'");
                }
                if (schema[key].valuetype === undefined) {
                    panic("When using type `map` we also need a valuetype occupying the role of the classic type field");
                }
                keytype = schema[key].keytype;
                valuetype = schema[key].valuetype;
            }
        } else {
            requiredType = schema[key];
        }

        // If the Object doesn't have this property, check if it's optional
        if (!obj.hasOwnProperty(key) || obj[key] === undefined || obj[key] === null) {
            if (schema[key].optional) {
                continue; // If it's optional, skip the rest of the loop for this property
            } else if (key.charAt(0) === ".") {
                key = removeFirstCharacter(key);
                if (obj[key] === undefined) {
                    return { success: false, message: stringLog(`Missing property: ${key} in object`, obj, `having to satisfy schema`, schema) };
                }
            } else {
                return { success: false, message: stringLog(`Missing property: ${key} in object`, obj, `having to satisfy schema`, schema) };
            }
        }

        // If the required type is a reference a schema, substitute it
        if (typeof requiredType === 'string' && requiredType.charAt(0) === "$") {
            requiredType = referencedSchemas[requiredType];
            if (requiredType === undefined || typeof requiredType !== 'object') {
                throw new Error("could not find the schema " + requiredType + " referenced in root schema defintion"); // better to panic early for this error than returning false
            }
        }

        let typeAndInstanceOfCheck = function (target, reqT) {
            if (typeof reqT === 'string' && reqT.charAt(0) === "#") {
                reqT = referencedSchemas[reqT];
                if (reqT === undefined) {
                    throw new Error("could not find the class " + reqT + " referenced in root schema defintion"); // better to panic early for this error than returning false
                }
                if (target instanceof reqT) {
                    return { success: true };
                }
            } else if (typeof reqT === 'string' && reqT.startsWith('enum(')) {
                let possibleValues = reqT.substring('enum('.length, reqT.length - 1).split(',').map(x => x.trim());
                for (let i = 0; i < possibleValues.length; i++) {
                    if (typeAndInstanceOfCheck(target, possibleValues[i])) {
                        return { success: true };
                    }
                }
            } else if (isQuoted(reqT)) { // in an enum with a limited number of allowed predefined strings
                if (typeof target === 'string' && target === reqT.slice(1, reqT.length - 1)) {
                    return { success: true }
                }
            } else if (typeof target === reqT && (reqT !== 'number' || !isNaN(target))) {
                return { success: true };
            }
            return { success: false, message: stringLog(`Incorrect type for property: ${key}. Expected ${reqT}, got`, target) };
        };

        // If the required type is an object, recurse into it
        if (typeof requiredType === "object" && !Array.isArray(requiredType)) {
            // If the corresponding Object property is not an object, return false
            if (typeof obj[key] !== "object" || Array.isArray(obj[key])) {
                return { success: false, message: stringLog(`Expected object for property: ${key}`) };
            }
            // Recurse into the object
            let resp = CheckObjectAgainstSchema(obj[key], requiredType, referencedSchemas);
            if (!resp.success) {
                return resp;
            }
        } else if (requiredType === "map") {
            // If the corresponding Object property is not an object, return false
            if (typeof obj[key] !== "object" || Array.isArray(obj[key])) {
                return { success: false, message: stringLog(`Expected object(map) for property: ${key}`) };
            }
            for (let [k, v] of Object.entries(obj[key])) {
                // in the case of maps, in javascript an object's keys are always strings even when the object values are set with number keys, they are converted.
                switch (keytype) {
                    default:
                        panic(`We do not support keys of type ${keytype} in a map type`);
                    case "number":
                        let tmp = parseFloat(k);
                        if (isNaN(tmp) || typeof tmp !== 'number') {
                            return {success: false, message: stringLog("We got an invalid map key", k, "which should be a string parsable as a number")};
                        }
                        break;
                    case "boolean":
                        if (!["true", "false"].includes(k.toLowerCase())) {
                            return {success: false, message: stringLog("We got an invalid map key", k, "which should be a string parsable as a boolean true or false")};
                        }
                        break;
                    case "string":
                        if (typeof k !== 'string') {
                            return {success: false, message: stringLog("We got an invalid map key", k, "which should be a string")};
                        }
                        break;
                }
                switch (true) {
                    default:
                        let checkresp = typeAndInstanceOfCheck(v, valuetype);
                        if (!checkresp.success) {
                            return { success: false, message: stringLog(`We got an invalid value in map: ${checkresp.message}`) };
                        }
                        break;
                    case typeof valuetype === "object": // object or array
                        // Recurse into the value
                        let resp = CheckObjectAgainstSchema(v, valuetype, referencedSchemas);
                        if (!resp.success) {
                            return { success: false, message: stringLog(`We got an invalid value in map: ${resp.message}`) };
                        }
                        break;
                }
            }
        } else if (Array.isArray(requiredType)) {
            // If requiredType is an array, check if the object value is an array of the correct type
            if (!Array.isArray(obj[key])) {
                return { success: false, message: stringLog(`Expected array for property: ${key}`) };
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
                        let resp = CheckObjectAgainstSchema(item, requiredType[0], referencedSchemas);
                        if (!resp.success) {
                            return resp;
                        }
                    } else {
                        // If the types don't match, return false
                        let checkresp = typeAndInstanceOfCheck(item, requiredType[0]);
                        if (!checkresp.success) {
                            return checkresp;
                        }
                    }
                }
            }
        } else {
            // If the types don't match, return false
            let checkresp = typeAndInstanceOfCheck(obj[key], requiredType);
            if (!checkresp.success) {
                return checkresp;
            }
        }
    }

    // If we made it through all properties without returning false, the Object matches the schema
    return { success: true };
}

class HTMLElementType {
    #NATIVE_SCHEMAS = {
        "#HTMLElement": HTMLElement, // the # identifies an instance of a class
        "$HTML_ELEMENT": { // the $ identifies a schema that can be referenced in validation schemas
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
    }

    /**
     * 
     * @param {Object<string, any>} htmlSchema 
     */
    constructor(htmlSchema) {
        AssertTypeOf("object", htmlSchema);
        let resp = CheckObjectAgainstSchema(htmlSchema, this.#NATIVE_SCHEMAS["$HTML_ELEMENT"], this.#NATIVE_SCHEMAS);
        if (!resp.success) {
            throw new Error("invalid parameter: " + resp.message);
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
        panic("not yet implemented");
        return false;
    }

    /**
     * @template {{innerText: string}} attr
     * @param {Object<string, attr>} fromContent 
     * @return {HTMLElement}
     */
    ToHTML(fromContent) {
        AssertTypeOf("object", fromContent);

        var htmlnode = this.#_tohtml(this.Schema);

        for (const [query, attrs] of Object.entries(fromContent)) {
            if (typeof attrs.innerText === 'string') {
                htmlnode.querySelector(query).innerText = attrs.innerText;
            }
        }

        return htmlnode;
    }

    #_tohtml(schema) {
        AssertTypeOf("object", schema);

        // Create a new element based on the tagName
        let newElement = document.createElement(schema.tagName);

        // Set the element's id and class if they're present in the schema
        if (schema.attributes.id) {
            newElement.id = schema.attributes.id;
        }

        if (schema.attributes.class) {
            newElement.className = schema.attributes.class;
        }

        // Recurse into children, if any
        if (Array.isArray(schema.children)) {
            for (let i = 0; i < schema.children.length; i++) {
                if (schema.children[i] !== null) {
                    let childElement = this.#_tohtml(schema.children[i]);
                    newElement.appendChild(childElement);
                }
            }
        }

        return newElement;
    }

    /**
     * 
     * @param {string} htmlString 
     * @return {HTMLElementType}
     */
    static FromString(htmlString) {
        AssertTypeOf('string', htmlString);
        return HTMLElementType.FromNode(CreateElementFromHTML(htmlString));
    }

    /**
     * 
     * @param {HTMLElement} element 
     * @return {HTMLElementType}
     */
    static FromNode(element) {
        AssertInstOf(HTMLElement, element);

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

// TODO: set an optional timeout waiting for backend response and enhance idempotency hash usage
class WebsocketAPI {
    /**
     * 
     * @param {string} url 
     */
    constructor(url) {
        AssertTypeOf('string', url);

        this.socket = null;

        /**
         * @template {{routename:string, message:Object, cb:function}} request
         * @type {Array<request>}
         */
        this.requestbuffer = [];

        /**
         * @template {{routename:string, message:Object, cb:function}} request
         * @type {Object<number, request>} Keys are request IDs
         */
        this.requestCallbacks = {};

        this.routes = {};
        this.references = {};
        this.requestidincrement = 0;
        this.address = url;

        this.opened = false;
        this.restarting = false;

        this.retryDelay = 5000;
        this.retryBackoffFactor = 2;
        this.retryMaxDelay = 60000;
        this.retryCount = 0;

        this.sessionID = null;

        this.#start();
    }

    #start() {
        if (this.opened || this.restarting) {
            return;
        }

        this.restarting = true;

        let that = this;

        if (this.retryCount > 0) {
            this.retryDelay *= this.retryBackoffFactor;
            if (this.retryDelay > this.retryMaxDelay) {
                this.retryDelay = this.retryMaxDelay;
            }
        }
        this.retryCount++;

        try {
            this.socket = new WebSocket(this.address);
        } catch (e) {
            that.restarting = false;
            console.log("We could not establish websocket to backend:", e);
            that.#close();
            return;
        }

        this.socket.addEventListener('open', (event) => {
            that.opened = true;
            that.restarting = false;
            that.retryDelay = 5000;

            for (let request = that.requestbuffer.pop(); request !== undefined; request = that.requestbuffer.pop()) {
                if (!that.Send(request.routename, request.message, request.cb)) {
                    return;
                }
            }

            console.log("server connection established successfully");
        });

        this.socket.addEventListener('message', (event) => {
            that.#onmessage(event);
        });

        this.socket.addEventListener('error', (event) => {
            if (that.opened || that.restarting) {
                that.restarting = false;
                console.log("server connection error:", event);
                that.#close();
            }
        });

        this.socket.addEventListener('close', (event) => {
            if (that.opened || that.restarting) {
                that.restarting = false;
                console.log("server connection closed:", event);
                that.#close();
            }
        });
    }

    #close() {
        if (this.opened) {
            this.opened = false;
            this.socket.close();
            this.socket = null;
            for (const [_, definition] of Object.entries(this.requestCallbacks)) {
                definition.cb(new Err("lostConnection", "we lost connection with the server"), null);
            }
            this.requestCallbacks = {};
        }
        let delay = (this.retryDelay / 10) * 7 + Math.random() * (this.retryDelay / 10) * 3;
        console.log(`trying reconnection in ${(delay / 1000).toFixed(2)} seconds..`);
        setTimeout(() => { this.#start(); }, delay);
    }

    #onmessage(event) {
        let resp;
        try {
            resp = JSON.parse(event.data);
        } catch (e) {
            console.log("Could not JSON parse payload:", e, event);
            return;
        }

        if (resp.order === undefined || typeof resp.order !== 'number') {
            console.log("Received payload from the backend without a requestid:", resp);
            return;
        }

        if ((resp.message === undefined || typeof resp.message !== 'object') && (resp.error === undefined || typeof resp.error !== 'object')) {
            console.log("Received payload from the backend without an object message or error:", resp);
            return;
        }

        if (resp.sessionid === undefined || typeof resp.sessionid !== 'string') {
            console.log("Received payload from the backend without a sessionid:", resp);
            return;
        }
        if (this.sessionID !== null && resp.sessionid !== this.sessionID) {
            console.log("Received payload from the backend with an invalid sessionid different from " + this.sessionID + " :", resp);
            return;
        } else if (this.sessionID === null) {
            this.sessionID = resp.sessionid;
        }

        if (this.requestCallbacks[resp.order] === undefined) {
            console.log("Could not find response callback: Either Received duplicate payload from the backend with the same order number or backend inconsistency error:", resp);
            return;
        }

        let definition = this.requestCallbacks[resp.order];
        delete this.requestCallbacks[resp.order];

        if (resp.error !== undefined) {
            definition.cb(new Err(resp.error.code, resp.error.message), null);
            return;
        }

        let checkresp = CheckObjectAgainstSchema(resp.message, this.routes[definition.routename].responseType, this.references);
        if (!checkresp.success) {
            definition.cb(new Err("invalidMessageStructure", "The response received from the backend: " + JSON.stringify(resp.message) + " does not satisfy the set response type: " + JSON.stringify(this.routes[definition.routename].responseType) + " for route " + definition.routename + " for the following reason: " + checkresp.message), null);
            return false;
        }

        definition.cb(null, resp.message);
    }

    /**
     * 
     * @param {string} name 
     * @param {Object} requestType 
     * @param {Object} responseType
     * @return {WebsocketAPI}
     */
    CreateRoute(name, requestType, responseType) {
        AssertTypeOf('string', name);
        AssertTypeOf('object', requestType, responseType);
        if (this.routes[name] !== undefined) {
            throw new Error("We already registered route " + name);
        }
        this.routes[name] = {
            "requestType": requestType,
            "responseType": responseType,
        };
        return this;
    }

    /**
     * 
     * @param {string} routename 
     * @param {object} message 
     * @param {Function} cb(err:Err, data:object)
     * @return {Boolean}
     */
    Send(routename, message, cb) {
        if (this.routes[routename] === undefined) {
            throw new Error("Route " + routename + " does not exist");
        }
        let checkresp = CheckObjectAgainstSchema(message, this.routes[routename].requestType, this.references);
        if (!checkresp.success) {
            cb(new Err("invalidMessageStructure", "The provided message: " + JSON.stringify(message) + " does not satisfy the set request type: " + JSON.stringify(this.routes[routename].requestType) + " for route " + routename + " for the following reason: " + checkresp.message), null);
            return false;
        }

        var definition = {
            "routename": routename,
            "message": message,
            "cb": cb
        };

        if (!this.opened) {
            this.requestbuffer.push(definition);
            return false;
        }

        let payload = {
            "routename": routename,
            "order": (this.requestidincrement++),
            // "idempotencyhash": CRC64(JSON.stringify({ routename: routename, message: message })),
            "message": message
        };
        if (this.sessionID !== null) {
            payload.sessionid = this.sessionID;
        }

        this.requestCallbacks[payload.order] = definition;

        // fail fast
        var str = JSON.stringify(payload);

        try {
            this.socket.send(str);
        } catch (e) {
            this.#close();
        }

        return true
    }

    /**
     * 
     * @param {string} routename 
     * @param {object} message
     * @return {Promise}
     */
    SendPromise(routename, message) {
        return new Promise(function (resolve, reject) {
            this.Send(routename, message, function (err, data) {
                if (err !== null) {
                    reject(err);
                    return;
                }
                resolve(data);
            });
        }.bind(this));
    }
}

function CreateElementFromHTML(htmlString) {
    AssertTypeOf('string', htmlString);

    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();

    // Change this to div.childNodes to support multiple top-level nodes.
    return div.firstChild;
}

function CreateManyElementsFromHTML(htmlString) {
    AssertTypeOf('string', htmlString);

    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();

    var ret = [];
    for (let i = 0; i < div.childNodes.length; i++) {
        if (!(div.childNodes[i] instanceof Text)) {
            ret.push(div.childNodes[i]);
        }
    }

    return ret;
}

/**
 * 
 * @param {HTMLElement|SVGElement} node 
 * @param {Object<string, string>} styleObj
 * @return {HTMLElement}
 */
function SetStyle(node, styleObj) {
    AssertInstOfOR(node, HTMLElement, SVGElement);
    AssertObjectSchema(styleObj, {type: "map", keytype: "string", valuetype: "string"});
    for (let prop in styleObj) {
        if (styleObj.hasOwnProperty(prop)) {
            node.style[prop] = styleObj[prop];
        }
    }
    return node;
}

function SetMStyle(styleObj, ...nodes) {
    AssertObjectSchema(styleObj, {type: "map", keytype: "string", valuetype: "string"});
    AssertObjectSchema({nodes: nodes}, {nodes: ["enum(#HTMLElement, #SVGElement)"]}, {"#HTMLElement": HTMLElement, "#SVGElement": SVGElement});
    for (let prop in styleObj) {
        if (styleObj.hasOwnProperty(prop)) {
            for (let i = 0; i < nodes.length; i++) {
                nodes[i].style[prop] = styleObj[prop];
            }
        }
    }
}

/**
 * One final callback is great, we want to avoid callback hell consisting of many nested callbacks.
 * We want readable linear and flat code. We do not want obscurity and contamination as with async/await.
 * @param {Function} code 
 * @param {Function} finalcb 
 */
function ASYNC(code, finalcb) {
    if (typeof code !== 'function' || typeof finalcb !== 'function') {
        throw new Error("The arguments must be functions.");
    }

    let generator = code();

    function handleResult(result) {

        if (result.done) {
            return finalcb(...result.value);
        }

        let value = result.value;

        if (Array.isArray(value)) {
            if (value.every(isPromise)) {
                return Promise.all(value)
                    .then(function (res) {
                        if (res.length !== value.length) {
                            panic(`we received a number of responses ${res.length} which does not match the number of promises ${value.length}`);
                        }

                        for (let i = 0; i < res.length; i++) {
                            if (!Array.isArray(res[i])) {
                                panic("Promises must return an array of results to work with our choosen specification");
                            }
                            if (res[i].length === 0) {
                                panic("We need promises to return array with at least null or Err as the first element");
                            }
                            if (res[i][0] !== null) {
                                handleError(res[i][0]);
                                return;
                            }
                            if (res[i].length > 1) {
                                res[i] = res[i].slice(1);
                            } else {
                                res[i] = null;
                            }
                        }

                        iterator(null, ...res)
                    })
                    .catch(e => handleError(e, value.length));
            } else {
                let [fn, ...args] = value;
                if (typeof fn !== 'function') {
                    throw new Error("The first element of the array should be a function.");
                }
                fn(...args, iterator);
                return;
            }
        }

        if (isPromise(value)) {
            value.then(function (v) {
                if (Array.isArray(v)) {
                    if (v.length === 0) {
                        panic("We need a return array with at least null or Err as the first element");
                    }
                    if (v[0] !== null) {
                        handleError(v[0]);
                        return;
                    }
                    if (v.length > 1) {
                        iterator(null, ...v.slice(1));
                    } else {
                        iterator(null);
                    }
                } else {
                    iterator(null, v);
                }
            }).catch(e => handleError(e));
            return;
        }

        throw new Error("Invalid yielded value. Expecting either a promise or an array.");
    }

    function handleError(e, length = 1) {
        const errMessage = (e instanceof Error) ? e.message + "\nStack: " + e.stack : e.toString();
        const nullargs = Array(length).fill(null);
        iterator(new Error(`${errMessage}`), ...nullargs);
    }

    function iterator(err, ...args) {
        if (err) {
            // Handle the error, for now we are just throwing it
            throw err;
        }
        try {
            handleResult(generator.next([null, ...args]));
        } catch (e) {
            // Handle synchronous errors
            handleError(e);
        }
    }

    iterator();
}

function ASYNCPromise(code, ...defers) {
    AssertObjectSchema({ defers: defers }, {
        defers: { optional: true, type: ['function'] },
    });
    return new Promise(function (resolve, reject) {
        ASYNC(code, function (err, ...args) {
            for (let i = 0; i < defers.length; i++) {
                defers[i]();
            }
            if (err !== null) {
                reject([err, ...Array(args.length).fill(null)]);
                return
            }
            resolve([null, ...args]);
        });
    });
}

/**
 * Asyncmethod returns the method from your class instance binded to this class instance. In Javascript, when you put the method
 * from a class instance into a variable, and call this from inside this method, it does not refer anymore to the class instance.
 * 
 * You may bind your class method directly into your class constructor if you would like to avoid using this function.
 * For example
 *              class A {
 *                  constructor() {
 *                      this.method = this.method.bind(this);
 *                  }
 *                  
 *                  method() {
 *                      console.log(this)
 *                  }
 *              }
 * @param {Object} objinstance 
 * @param {string} methodname 
 */
function Asyncmethod(objinstance, methodname) {
    if (objinstance[methodname] === undefined) {
        throw new Error("Object does not contain the property:" + methodname);
    }
    return objinstance[methodname].bind(objinstance);
}

/**
 * @param {any} arg Passed to resolve as argument
 * @return {Promise} immediately resolved
 */
function DonePromise(arg) {
    return new Promise(function (resolve, reject) { resolve(arg); });
}

// ------------------------------------------
//                UTILS
// ------------------------------------------

class Err {
    /**
     * 
     * @param {string} code 
     * @param {string} message 
     */
    constructor(code, message) {
        AssertTypeOf('string', code, message);
        this.Code = code;
        this.Message = message;
    }

    toString() {
        return "Error(" + this.Code + "): " + this.Message;
    }

    toJSON() {
        return { code: this.Code, message: this.Message };
    }
}

function MergeArraysAndRemoveDuplicates(arr1, arr2) {
    const mergedArray = arr1.concat(arr2); // Merge the arrays using the concat() function
    const uniqueArray = [...new Set(mergedArray)]; // Use the Set() function to remove duplicates and convert back to an array
    return uniqueArray;
}

// This function finds all hexadecimal escape sequences and converts them to their ASCII representation
function ReplaceHexCodesWithCharacters(str) {
    str = str.toString();
    str = str.replace(/%[0-9A-Fa-f]{2}/g, function (match) {
        return String.fromCharCode(parseInt(match.slice(1), 16));
    });
    return str;
}

function removeFirstCharacter(str) {
    AssertTypeOf('string', str);
    if (str.length > 0) {
        return str.substring(1);
    } else {
        return '';
    }
}

function generateTable() {
    const POLY = BigInt('0xc96c5795d7870f42');
    const table = [];

    for (let i = 0; i < 8; i++) {
        table[i] = [];
    }

    let crc = BigInt(0);

    for (let i = 0; i < 256; i++) {
        crc = BigInt(i);

        for (let j = 0; j < 8; j++) {
            if (crc & BigInt(1)) {
                crc = POLY ^ (crc >> BigInt(1));
            } else {
                crc = crc >> BigInt(1);
            }
        }

        table[0][i] = crc;
    }

    for (let i = 0; i < 256; i++) {
        crc = table[0][i];

        for (let j = 1; j < 8; j++) {
            const index = Number(crc & BigInt(0xff));
            crc = table[0][index] ^ (crc >> BigInt(8));
            table[j][i] = crc;
        }
    }

    return table;
}

function StringToBytes(str) {
    return new TextEncoder().encode(str);
}

const CRC64_ECMA_TABLE = generateTable();

function CRC64(str) {
    // const utf8String = StringToUtf8(string);
    let bytes = StringToBytes(str);
    let crc = ~BigInt(0) & BigInt('0xffffffffffffffff');

    while (bytes.length > 8) {
        crc ^=
            BigInt(bytes[0]) |
            (BigInt(bytes[1]) << BigInt(8)) |
            (BigInt(bytes[2]) << BigInt(16)) |
            (BigInt(bytes[3]) << BigInt(24)) |
            (BigInt(bytes[4]) << BigInt(32)) |
            (BigInt(bytes[5]) << BigInt(40)) |
            (BigInt(bytes[6]) << BigInt(48)) |
            (BigInt(bytes[7]) << BigInt(56));

        crc =
            TABLE[7][Number(crc & BigInt(0xff))] ^
            TABLE[6][Number((crc >> BigInt(8)) & BigInt(0xff))] ^
            TABLE[5][Number((crc >> BigInt(16)) & BigInt(0xff))] ^
            TABLE[4][Number((crc >> BigInt(24)) & BigInt(0xff))] ^
            TABLE[3][Number((crc >> BigInt(32)) & BigInt(0xff))] ^
            TABLE[2][Number((crc >> BigInt(40)) & BigInt(0xff))] ^
            TABLE[1][Number((crc >> BigInt(48)) & BigInt(0xff))] ^
            TABLE[0][Number(crc >> BigInt(56))];

        bytes = bytes.slice(8);
    }

    for (let i = 0; i < bytes.length; i++) {
        const lower = Number(crc & BigInt(0xff));
        const index = lower ^ bytes[i];
        crc = TABLE[0][index] ^ (crc >> BigInt(8));
    }

    crc = ~crc & BigInt('0xffffffffffffffff');

    return crc;
}

// We do not account for strings that contain unescaped quotation characters in the middle
function isQuoted(str) {
    const firstChar = str[0];
    const lastChar = str[str.length - 1];
    return (firstChar === lastChar) && (firstChar === '"' || firstChar === "'" || firstChar === "`");
}

/**
 * This function iterates over all arguments. If the argument is an object (which includes arrays), 
 * it stringifies it using JSON.stringify with a replacer that prevents errors from circular references. 
 * If the argument is not an object, it is converted to a string using String. 
 * After each argument, a space is added to separate the arguments in the resulting string.
 * @param {...any}
 * @return {string}
 */
function stringLog() {
    let result = '';
    const seen = new WeakSet();

    for (let i = 0; i < arguments.length; i++) {
        if (typeof arguments[i] === 'object' && arguments[i] !== null) {
            result += JSON.stringify(arguments[i], function (key, value) {
                if (typeof value === 'object' && value !== null) {
                    if (seen.has(value)) {
                        return;
                    }
                    seen.add(value);
                }
                return value;
            });
        } else {
            result += String(arguments[i]);
        }

        // Add a space between arguments like console.log does
        if (i < arguments.length - 1) {
            result += ' ';
        }
    }

    return result;
}

/**
 * Panic is a golang-ish shorthand for throw new Error({message})
 * @param {string} message 
 */
function panic(message, ...args) {
    if (args.length > 0) {
        throw new Error(stringLog(message, ...args));
    }
    throw new Error(message);
}

function isPromise(p) {
    if (
        p !== null &&
        typeof p === 'object' &&
        typeof p.then === 'function' &&
        typeof p.catch === 'function'
    ) {
        return true;
    }
    return false;
}