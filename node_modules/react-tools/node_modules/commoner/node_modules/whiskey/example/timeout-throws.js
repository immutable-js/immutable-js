function initSecondTimeout(tag) {
    setTimeout(function secondTimeout() {
        throw new Error(tag);
    }, 100);
}

function onload() {
   setTimeout(function firstTimeout() {
        initSecondTimeout("timeout");
    }, 100);
}

onload();
