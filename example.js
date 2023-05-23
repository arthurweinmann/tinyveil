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