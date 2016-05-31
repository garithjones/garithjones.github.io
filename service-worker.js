console.log("Service Worker: Loaded");

this.addEventListener('install', installEventFunction);

function installEventFunction(event) {
    console.log(event);
    try{
    event.waitUntil(
        caches.create('csir_catchmenttool_cache').then(cacheCreateSuccess, cacheCreateFailure)
    );
    }catch(e){
        console.log(e);
    }
}

function cacheCreateSuccess(cache) {
    console.log(cache);

    return cache.add(['/']);
}

function cacheCreateFailure(error) {
    console.log("Error");
}

this.addEventListener('fetch', fetchEventFunction);

function fetchEventFunction(event) {
    //console.log(event.request);
}