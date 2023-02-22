/**
 * v1.0.0
 */
class nextElement {
    static #_log = false;
    #_enabled = false;
    #_selectorFixer;
    #_selectors;
    #_cache = [];
    #_when = [];
    #_triggerKey;
    #_submitTriggerKey;
    delimiter = ",";
    preSelector;
    eventName;

    constructor(options = {
        enabled: true, delimiter: ",", triggerKey: "enter", submitTriggerKey: "ctrl+s", selectors: "select,textarea,input", preSelector: '[index]', selectorFixer: undefined, when: [], eventName: "keydown"
    }) {
        options = Object.assign({}, options, {
            enabled: true, delimiter: ",", triggerKey: "enter", submitTriggerKey: options['submitTriggerKey'] === null ? "" : "ctrl+s", selectors: "select,textarea,input", preSelector: '[index]', selectorFixer: undefined, when: [], eventName: "keydown"
        });
        this.#_enabled = options['enabled'];
        this.setDelimiter(options['delimiter']);
        this.setTriggerKey(options['triggerKey'] || "enter");
        this.setSubmitTriggerKey(options['submitTriggerKey']);
        this.setSelectors(options['selectors']);
        this.setPreSelector(options['preSelector']);
        this.setSelectorFixer(options['selectorFixer']);
        this.setEventName(options['eventName']);

        for (let whenCondition of Array.of(options['when'])) {
            if (typeof (whenCondition) === 'function') {
                this.when(...options['when']);
                break;
            }

            this.when(...whenCondition);
        }

        whenReady(() => {
            this.#prepare();
        }, 100);
    }

    #prepare() {
        let elm = document.body;
        elm.addEventListener(this.eventName, (event) => {
            if (event && event.target) {
                if (event.target.matches && event.target.matches(this.queryString)) {
                    return this.trigger(event);
                }
            }
        });
        document.addEventListener('inertia:before', () => this.#_cache = []);
        Nova && Nova.addShortcut && this.#_triggerKey && Nova.addShortcut(this.#_triggerKey, (event) => {
            event.preventDefault();
            let $focusOn = this.freshElements();
            if ($focusOn.length) {
                $focusOn = $focusOn[0];
                $focusOn.focus && $focusOn.focus();
                $focusOn.select && $focusOn.select();
            }
        });
        nextElement.log(["\n[NOVA]", " NextElement:\n", "Attached!\n"]);

        return this;
    }

    when(checker, value) {
        if (typeof (checker) === 'function' && typeof (value) === 'function') {
            this.#_when.push([checker, value]);
        }

        return this;
    }

    setEventName(eventName = "keydown") {
        this.eventName = String(eventName).trim();
        return this;
    }

    setSelectors(v) {
        v = v || "";
        this.#_selectors = String(Array.isArray(v) ? v.join(this.delimiter) : v).trim();
        return this;
    }

    setTriggerKey(key = "enter") {
        this.#_triggerKey = String(key || "enter").trim();
        return this;
    }

    setSubmitTriggerKey(key = "ctrl+s") {
        this.#_submitTriggerKey = String(key).trim();
        return this;
    }

    setDelimiter(delimiter = ",") {
        this.delimiter = String(delimiter).trim();
        return this;
    }

    setPreSelector(preSelector = "[index]") {
        this.preSelector = String(preSelector).trim();
        return this;
    }

    setSelectorFixer(v) {
        v = v || "";
        if (typeof (v) === 'function') {
            this.#_selectorFixer = v;
        }

        return this;
    }

    freshElements() {
        let $elements = [...(new Set(document.querySelectorAll(this.queryString)))];
        let results = [];
        let result = undefined;
        this.#_when = !Array.isArray(this.#_when) ? [] : this.#_when;

        if (this.#_when.length) {
            for (let element of $elements) {
                for (let $checker of this.#_when) {
                    let checker = $checker[0];
                    let checkerValue = $checker[1];
                    if (checker(element)) {
                        result = checkerValue(element);
                        break;
                    }
                }

                if (result) {
                    results.push(result || element);
                    result = undefined;
                }
            }
        } else {
            results = $elements;
        }
        return results;
    }

    map(...args) {
        let elements = this.elements;
        this.#_cache = elements.map(...args);

        return this.#_cache;
    }

    each(...args) {
        this.elements.forEach(...args);

        return this;
    }

    nextElement(e) {
        let found = false;
        for (let element of this) {
            if (found) {
                return element;
            }

            if (element.isEqualNode(e)) {
                found = true;
            }
        }

        return undefined;
    }

    hasNextElement(e) {
        return this.nextElement(e) !== undefined;
    }

    isSubmit(event) {
        let keys = this.#_submitTriggerKey;
        if (keys === undefined || keys === null || !String(keys).trim().length) {
            return false;
        }

        let hits = 0;
        keys = keys.split('+').map(x => String(x).trim().toLocaleLowerCase());
        let key = String(event.key).trim().toLocaleLowerCase();
        let superKeys = ['shift', 'meta', 'ctrl', 'alt'];

        for (let k of keys) {
            if (k.length === 1) {
                if (String(k).trim().toLocaleLowerCase() === key) {
                    hits++;
                }
                continue;
            }

            let eKey = `${k}Key`;
            if (!superKeys.includes(k)) {
                return false;
            }

            if (eKey in event && event[eKey]) {
                for (let $key of superKeys) {
                    if ($key !== k && event[`${$key}Key`]) {
                        return false;
                    }
                }
                hits++;
            }
        }

        return hits === keys.length;
    }

    trigger(e) {
        if (!this.#_enabled) {
            return false;
        }

        nextElement.log('nextElement Script Triggered!');
        let {key, shiftKey, metaKey, ctrlKey, altKey, target} = e;
        let $key = String(key).trim().toLocaleLowerCase();
        let test = ctrlKey === false && metaKey === false && altKey === false && $key === this.#_triggerKey;

        if (this.isSubmit(e)) {
            e.preventDefault(e);
            let form = target.form;
            if (form) {
                let submit = form.querySelector('[type=submit]');
                submit = submit || form.querySelector('button');
                if (submit) {
                    submit.click();
                } else {
                    form.submit();
                }
            }
            return false;
        }

        if (test && (!['TEXTAREA', 'SELECT'].includes(target.tagName) || shiftKey === true)) {
            e.preventDefault(e);
            try {
                let nextTarget = this.hasNextElement(target) ? this.nextElement(target) : this.elements[0];
                nextTarget.focus && nextTarget.focus();
                nextTarget.select && nextTarget.select();

                return nextTarget;
            } catch (e) {
                return false;
            }
        }

        return false;
    }

    static make(...args) {
        return new nextElement(...args);
    }

    static log(message = "", type = 'log', instance) {
        if ((instance || this).#_log) {
            let prefix = Array.isArray(message) ? message.shift() : '--';
            let $APP = Array.isArray(message) ? message.shift() : '[NextElement]';
            message = Array.isArray(message) ? message.shift() : message;
            console[type](`${prefix}%c${$APP}%c %s`, 'font-weight: bold;', 'font-weight: normal;', message);
        }
    }

    get queryString() {
        return this.selectors.join(this.delimiter);
    }

    get selectors() {
        return this.#_selectors.split(this.delimiter).map(this.selectorFixer);
    }

    get hasPreSelector() {
        return this.preSelector.length > 0;
    }

    get selectorFixer() {
        let doPreSelector = (x) => {
            if (!this.hasPreSelector) {
                return x;
            }
            if (x.includes(this.delimiter)) {
                return x = x.split(this.delimiter).map(this.selectorFixer).join(this.delimiter);
            }

            x = this.preSelector + ' ' + x;
            return typeof (this.#_selectorFixer) === 'function' ? this.#_selectorFixer(x) : x;
        };
        return ((x) => String(doPreSelector(x)).trim());
    }

    get elements() {
        this.#_cache = this.#_cache.length ? this.#_cache : this.freshElements();
        return this.#_cache;
    }

    get length() {
        return this.elements.length;
    }

    [Symbol.iterator]() {
        var index = -1;
        var data = this.elements;

        return {
            next: () => ({
                value: data[++index], done: !(index in data)
            })
        };
    }
    ;
}
