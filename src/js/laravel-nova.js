nextElement.isMounted = ()=>nextElement.data.config !== undefined;
nextElement.data = {
    defaultConfig: {
        enabled: false,
        // delimiter: ",",
        triggerKey: "enter",
        submitTriggerKey: "ctrl+s",
        selectors: "select,textarea,input",
        preSelector: '[index]',
        selectorFixer: undefined,
        when: [],
        eventName: "keydown"
    },
    config: undefined,
};

Nova.booting(app => whenReady(() => {
    if (nextElement.isMounted()) {
        return;
    }
    nextElement.data.config = Nova && Nova.config && Nova.config('next_input_focus') || nextElement.data.defaultConfig;

    if (nextElement.data.config['enabled']) {
        nextElement.make(nextElement.data.config);
    }
}));
