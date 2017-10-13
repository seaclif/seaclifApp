App.info({
    id: 'com.seaclif.garage',
    name: 'Seaclif',
    description: 'Seaclif Control App',
    author: 'Seaclif Dev',
    email: 'austen.schulz@seaclif.com',
    website: 'http://garage.seaclif.com',
    version: "0.0.4"
});

// Set up resources such as icons and launch screens.
/*App.icons({
    'iphone': 'icons/icon-60.png',
    'iphone_2x': 'icons/icon-60@2x.png',
    'ipad': 'icons/icon-72.png',
    'ipad_2x': 'icons/icon-72@2x.png'
    'Default-568h@2x.png',
'Default-568h@2x~iphone.png',
'Default-667h.png',
'Default-667h@2x.png',
'Default-736h.png',
'Default-Landscape-736h.png',
'Default-Landscape-736h@3x.png',
'Default-Landscape.png',
'Default-Landscape@2x~ipad.png',
'Default-Landscape~ipad.png',
'Default-Portrait-736h@3x.png',
'Default-Portrait.png',
'Default-Portrait@2x.png',
'Default-Portrait@2x~ipad.png',
'Default-Portrait~ipad.png',
'Default@2x.png',
'Default@2x~iphone.png',
'Default~iphone.png'
});

App.launchScreens({
    'iphone': 'splash/Default~iphone.png',
    'iphone_2x': 'splash/Default@2x~iphone.png',
    'iphone5': 'splash/Default-568h@2x~iphone.png',
    'ipad_portrait': 'splash/Default-Portrait~ipad.png',
    'ipad_portrait_2x': 'splash/Default-Portrait@2x~ipad.png',
    'ipad_landscape': 'splash/Default-Landscape~ipad.png',
    'ipad_landscape_2x': 'splash/Default-Landscape@2x~ipad.png'
});*/

// Set PhoneGap/Cordova preferences
// App.setPreference('BackgroundColor', '0xff0000ff');
// App.setPreference('HideKeyboardFormAccessoryBar', true);
// App.setPreference('Orientation', 'all', 'ios');
// App.setPreference("KeyboardShrinksView", true);
// App.setPreference("DisallowOverscroll", true);
// App.setPreference("EnableViewportScale", true);
// App.setPreference("DisallowOverscroll", true);
App.accessRule('*');
App.setPreference("AllowInlineMediaPlayback", false);
App.setPreference("DisallowOverscroll", true);
App.setPreference("EnableViewportScale", true);
App.setPreference("KeyboardDisplayRequiresUserAction", true);
App.setPreference("MediaPlaybackRequiresUserAction", false);
App.setPreference("SuppressesIncrementalRendering", false);
App.setPreference("SuppressesLongPressGesture", false);
App.setPreference("Suppresses3DTouchGesture", false);
App.setPreference("GapBetweenPages", 0);
App.setPreference("PageLength", 0);
App.setPreference("PaginationBreakingMode", 'page');
App.setPreference("PaginationMode", 'unpaginated');
App.setPreference("CordovaWebViewEngine", 'CDVWKWebViewEngine');
App.setPreference("StatusBarOverlaysWebView", false);
App.setPreference("StatusBarStyle", 'default');
App.setPreference("webviewbounce", false);
App.setPreference("AutoHideSplashScreen", false);
App.setPreference("SplashScreen", 'screen');
App.setPreference("SplashScreenDelay", 5000);
App.setPreference("FadeSplashScreenDuration", 250);
App.setPreference("ShowSplashScreenSpinner", false);
App.setPreference("BackgroundColor", '0xff0000ff');
App.setPreference("HideKeyboardFormAccessoryBar", true);
App.setPreference('Orientation', 'all', 'ios');
App.setPreference("KeyboardShrinksView", false);
