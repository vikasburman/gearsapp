define([
    use('sys.core.app.App')
], (App) => {
    /**
     * @class sys.core.app.Client
     * @classdesc sys.core.app.Client
     * @desc Starts client application.
     */       
    return Class('sys.core.app.Client', App, function(attr) {
        attr('override');
        this.func('navigate', (base, url, returnUrlORisReplace) => {
            base();
            let currentHash = document.location.hash.replace('#', '');
            if (typeof returnUrlORisReplace === 'string') {
                url += '?returnUrl=' + returnUrlORisReplace;
                if (url.substr(0, 1) === '#') { url = url.substr(1); }
                document.location.replace('#' + url);
            } else if (typeof returnUrlORisReplace === 'boolean' && returnUrlORisReplace) {
                if (url.substr(0, 1) === '#') { url = url.substr(1); }
                document.location.replace('#' + url);
            } else {
                document.location.hash = url;
            }
            if (currentHash === url) {
                // trigger onhashchange manually, since same hash was alredy there
                window.dispatchEvent(new HashChangeEvent("hashchange"));
            }
        });
    });
});