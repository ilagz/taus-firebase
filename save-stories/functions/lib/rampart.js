var jwt = require('jsonwebtoken');
const prodPubkey = "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyR5lICHbqsMNjdJFvtHFIspDBtIJPGFvmMEyAncyM4Bqi4nHuYBu62yvnD28PC4Hx2f67g2FTUtWXWO9jPkQlnxctG3WPu52Fq9PfNAdVTtCj3JGqSeCnlVJweDd0dKmoiQ+UjlyPkgkukF0kcgAS3WFiKwA8d7UCels1oH2aqcLM4fQjEXMO8hFx2yKU8hDKhb6ECjsTl6QwfwgFg6b88JSCeRPh/pmc21mjx0IEkTgPT7Z9RRk7KodSL9XEf6LVT99zdlHwhAVjOaIGy/BFoCyXw0RK0drVPHa0rU6QL3VK5g7ZQXTta0WBknbUtQQgA2t/QkzJOPIc7td1ALmiwIDAQAB\n-----END PUBLIC KEY-----";
const sitPubkey = "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3Ui/Er/gOEphsJVqmoE26qcNrqie3g45sG6IGPHXSnAeca8wVL8VuvDWTL8GOBOOnCmKeYFdxFLjJxJNIkWEcHfMsdSHM7DHPxeQqb8OOinaNxSuADvXMVPu3kk+i3Gp9VcuGXBRt5lneMPEJcIiL0yq46G1+ueIl486BJff1AkoXgPPP2Fu9Ns2RdzgLkOLEFXJTcL02E99h455UVAMAi06tdUXtmDuzL2sbvFcPJ1hooTEnDjXGcs/l3EMlUKKSTb4qCK6O3cKGl79B1gkkcqmxvKB4hAEuQ/NVxD1IVH9sKbAdkZ7wzVXivCJjq8NkbenvibhR92nphzO5GFO9QIDAQAB\n-----END PUBLIC KEY-----";
const uatPubkey = "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA9H7ZE+FhZYfFDwgHqoUzbb8g7spnyc0twxWeUaYEH/Y3/YU7qmpfXavL4t6FJD9ywY7N0l7OA9YXICvyQaRFypPxB+sGLUTxOQuGRnaqD8wouzMWADAgWvAL3rda5jsr0mUyb0vkILwMqgtIjYZcXeDEy8Lpznw7Rc35n0QUFL/mnIw0FAFj7OBnpeK/o3hc0YoWrdH0YFkwIXn6Tb4gB0pSiXDP1CXbY/JpaHQOyVpNXNb5+DXVykED3eQUzZ0LFUd9TZ/O/vqER+O5Qc7Q1dNA3+bsqbLc4QXYQfKy9fqYnw4eUeLYTBijamtInNhnYkSuOZjNrCKPqwGMPTlVawIDAQAB\n-----END PUBLIC KEY-----";
module.exports = function (rampartToken, environment, done) {

    var pubkey;
    if (environment) {
        if (environment.toUpperCase() === "SIT") {
            pubkey = sitPubkey;
        } else if (environment.toUpperCase() === "UAT") {
            pubkey = uatPubkey;
        } else {
            pubkey = prodPubkey;
        }
    } else {
        pubkey = prodPubkey;
    }
    jwt.verify(rampartToken, pubkey, function (err, decoded) {
        if (!err) {
            var thinkID = decoded["http://login.newscorpaustralia.com.au/profile"].think_id;
            if (thinkID !== "") {
                return done(null, thinkID);

            } else {
                global.statusCode = 403;
                global.statusBody = { "message": "Rampart Token doesn't belong to News Corp", "code": 403 };
                return done({ "message": "Rampart Token doesn't belong to News Corp", "code": 403 });

            }
        } else {
            global.statusCode = 403;
            global.statusBody = { "message": "Cannot verify Rampart Token", "code": 403, "error": err };
            return done({ "message": "Cannot verify Rampart Token", "code": 403, "error": err });
        }
    });

};

