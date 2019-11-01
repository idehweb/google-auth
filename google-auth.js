const {google} = require("googleapis");

/*******************/
/** CONFIGURATION **/
/*******************/

const googleConfig = {
    clientId: '<GOOGLE_CLIENT_ID>', // e.g. 563322924764-u4o5f5o8fovn7t9f24mh92jefqpjj3hl.apps.googleusercontent.com
    clientSecret: '<GOOGLE_CLIENT_SECRET>', // e.g. swQWKv9GJv2bA2l2lCs70sMI
    redirect: 'http://localhost:3000/validateWithGoogle' // this must match your google api settings
};

/**
 * This scope tells google what information we want to request.
 */
const defaultScope = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
];

var GA = module.exports = {

    /**
     * Create the google auth object which gives us access to talk to google's apis.
     */
    createConnection: function () {
        return new google.auth.OAuth2(
            googleConfig.clientId,
            googleConfig.clientSecret,
            googleConfig.redirect
        );
    },

    /**
     * Get a url which will open the google sign-in page and request access to the scope provided (such as calendar events).
     */
    getConnectionUrl: function (auth) {
        return auth.generateAuthUrl({
            access_type: 'offline',
            prompt: 'consent', // access type and approval prompt will force a new refresh token to be made each time signs in
            scope: defaultScope
        });
    },

    /**
     * Helper function to get the library with access to the google plus api.
     */
    getGooglePeopleApi: function (auth) {
        return google.people({
            version: 'v1',
            auth: auth,
        });
    },

    /**
     * Part 1: Create a Google URL and send to the client to log in the user.
     */
    getGoogleAuthenticationUrl: function () {
        return new Promise(async (resolve, reject) => {
            const auth = await GA.createConnection();
            const authorizeUrl = await GA.getConnectionUrl(auth);
            resolve({
                url: authorizeUrl
            });
        });
    },

    /**
     * Part 2: Take the "code" parameter which Google gives us once when the user logs in, then get the user's email and id.
     */
    getGoogleAccountFromCode: async function (code) {

        const auth = await GA.createConnection();
        const data = await auth.getToken(code);
        const tokens = data.tokens;
        await auth.setCredentials(tokens);

        const people = GA.getGooglePeopleApi(auth);
        const me = await people.people.get({
            resourceName: 'people/me',
            personFields: 'emailAddresses,names,photos',
        });
        return me.data;

    },
};
