define([
    use('[Base]'),
    use('[User]'),
    use('[ClaimsChecker]'),
    use('[Credentials]'),
    use('[CredentialsValidator]'),
    use('sys.core.security.server.JwtToken'),
    use('sys.core.security.dto.AuthInfo')
], (Base, User, ClaimsChecker, Credentials, CredentialsValidator, Jwt, AuthInfo) => {
    /**
     * @class sys.core.security.server.Auth
     * @classdesc sys.core.security.server.Auth
     * @desc App authentication and authorization (server side)
     */    
    return Class('sys.core.security.server.Auth', Base, function(attr) {
        attr('override');
        attr('singleton');
        this.func('constructor', (base) => {
            base();
        });
        
        attr('async');
        this.func('validate', (resolve, reject, request) => {
            let token = request.getToken();
            if (token) {
                let jwt = new Jwt();
                jwt.verify(token).then((user) => {
                    if (user) {
                        let claimsChecker = new ClaimsChecker();
                        if (claimsChecker.check(request.claims, user.access)) {
                            request.user = user;
                            resolve();
                        } else {
                            reject('Unauthorized');
                        }
                    } else {
                        reject('Unauthorized user.');
                    }
                }).catch(reject);
            } else {
                reject('Authentication token is not available.');
            }
        });

        attr('async');
        this.func('login', (resolve, reject, request) => {
            let credentials = request.data.credentials || {},
                credentialsValidator = new CredentialsValidator();
            credentialsValidator.validate(credentials).then((user) => {
                if (user) {
                    jwt = new Jwt();
                    jwt.create(user).then((token) => {
                        if (token) {
                            let authInfo = new AuthInfo(token, user);
                            request.response.send.json(authInfo);
                            resolve(authInfo);
                        } else {
                            request.response.send.error(401, 'Failed to generate auth token.');
                            reject(401);
                        }
                    }).catch((err) => {
                        request.response.send.error(401, `Failed to generate auth token. (${err || ''})`);
                        reject(err);
                    });
                } else {
                    request.response.send.error(401, 'User not found.');
                    reject(401);
                }
            }).catch((err) => {
                request.response.send.error(401, `Invalid user name or password. (${err || ''})`);
                reject(err);
            });
        });
    });
});