// @win window reference
// @fn function reference
function whenReady(fn) {
    let win = window,
        done = false,
        top = true,
        doc = win.document,
        root = doc.documentElement,
        modern = doc.addEventListener,
        add = modern ? 'addEventListener' : 'attachEvent',
        rem = modern ? 'removeEventListener' : 'detachEvent',
        pre = modern ? '' : 'on',

        lowerCase = (s) => String(s).trim().toLocaleLowerCase(),
        init = function (e) {
            if (lowerCase(e.type) === 'readystatechange' && lowerCase(doc.readyState) !== 'complete') {
                return;
            }

            (lowerCase(e.type) === 'load' ? win : doc)[rem](pre + e.type, init, false);

            if (!done && (done = true)) {
                fn.call(win, e.type || e);
            }
        },
        poll = function () {
            try {
                root.doScroll('left');
            } catch (e) {
                setTimeout(poll, 50);
                return;
            }
            init('poll');
        };

    if (lowerCase(doc.readyState) === 'complete') {
        fn.call(win, 'lazy');
    } else {
        if (!modern && root.doScroll) {
            try {
                top = !win.frameElement;
            } catch (e) {
            }
            if (top) {
                poll();
            }
        }
        doc[add](pre + 'DOMContentLoaded', init, false);
        doc[add](pre + 'readystatechange', init, false);
        win[add](pre + 'load', init, false);
    }
}
