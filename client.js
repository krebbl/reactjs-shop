var React = require('react'),
    Application = require('./src/Application'),
    Fluxxor = require('fluxxor'),
    _ = require('lodash'),
    Actions = require('./src/Actions'),
    ActionTypes = require('./src/ActionTypes'),
    ArticleStore = require('./src/store/ArticleStore'),
    CatalogStore = require('./src/store/CatalogStore'),
    BasketStore = require('./src/store/BasketStore'),
    KeyStore = require('./src/store/KeyStore'),
    ApplicationStore = require('./src/store/ApplicationStore');

// Enable Recat DevTools
window.React = React

var ClientStore = Fluxxor.createStore({


    states: [],
    currentPosition: 0,

    initialize: function () {
        this.bindActions(
            ActionTypes.ADD_STATE, this.onAddState
        )

    },

    onSetCurrentState: function (pos) {
        this.currentPosition = pos;
        this.emit("change");
    },

    onAddState: function (state) {
        this.states.push(state);
        this.currentPosition++;
        this.emit("change");
    },

    getStateByIndex: function (index) {
        return this.states[index];
    },

    getNumberOfStates: function () {
        return this.states.length;
    },
    getCurrentPosition: function () {
        return this.currentPosition;
    }

});

var stores = {
    ArticleStore: new ArticleStore(),
    CatalogStore: new CatalogStore(),
    ApplicationStore: new ApplicationStore(),
    ClientStore: new ClientStore(),
    KeyStore: new KeyStore(),
    BasketStore: new BasketStore({basketId: "d342a3c0-0779-49c2-be7f-8969aaf34df8"})
};

stores.ApplicationStore.setState(window.location.pathname);

var flux = new Fluxxor.Flux(stores, Actions);

var actions = [],
    states = [],
    replay = false,
    locked = false,
    latestState = null;
currentState = -1;

flux.on("dispatch", function (type, payload) {
    actions.push({
        type: type,
        payload: payload
    });

    latestState = null;

    //window.localStorage.setItem("actions", JSON.stringify(actions));
    if (!locked) {
        var globalState = {};
        for (var s in flux.stores) {
            if (s !== "ClientStore") {
                globalState[s] = _.cloneDeep(flux.stores[s].getState());
            }
        }
        states.push(globalState);
        flux.dispatcher.dispatch({type: ActionTypes.ADD_STATE, payload: globalState});
        currentState++;
        // TODO: add compression
        //window.localStorage.setItem("states", JSON.stringify(states));
    }
});

var globalState = {};

for (var s in flux.stores) {
    if (s !== "ClientStore") {
        globalState[s] = flux.stores[s].getState();
    }
}

window.replayActions = function () {
    var actions = JSON.parse(window.localStorage.getItem("actions"));

    window.localStorage.setItem("actions", "[]");

    // set application back to initial state
    var globalState = JSON.parse(window.localStorage.getItem("globalState"));
    for (var s in flux.stores) {
        flux.stores[s].setState(globalState[s]);
    }
    //store.clearState();

    var interval = setInterval(function () {
        if (actions.length > 0) {
            var a = actions.shift();
            //if(!flux.dispatcher.currentDispatch){
            flux.dispatchBinder.dispatch(a.type, a.payload);
            //}
        } else {
            clearInterval(interval);
        }
    }.bind(this), 500);
};

window.goStepBack = function () {
    locked = true;
    if (currentState > 0) {
        var globalState = states[currentState];
        for (var s in flux.stores) {
            flux.stores[s].setState(globalState[s]);
        }
        currentState--;
    }
    locked = false;
};

window.goStepForward = function () {
    locked = true;
    if (currentState < states.length - 1) {
        var globalState = states[currentState];
        for (var s in flux.stores) {
            flux.stores[s].setState(globalState[s]);
        }
        currentState++;
    }
    locked = false;
}

window.goToStep = function (index) {
    locked = true;
    if (index < states.length) {
        if (!latestState) {
            latestState = {}
            for (var s in flux.stores) {
                if (s !== "ClientStore") {
                    latestState[s] = _.cloneDeep(flux.stores[s].getState());
                }
            }
        }
        flux.stores.ClientStore.currentPosition = index;
        var globalState = states[index];
        for (var s in flux.stores) {
            if (s !== "ClientStore") {
                flux.stores[s].setState(globalState[s]);
            }
        }
    } else if (index == states.length && latestState) {
        flux.stores.ClientStore.currentPosition = index;

        for (var s in flux.stores) {
            if (s !== "ClientStore") {
                flux.stores[s].setState(latestState[s]);
            }
        }
    }
    locked = false;
};

//window.localStorage.setItem("globalState", JSON.stringify(globalState));

var fluxStores = window._fluxStores;
if (fluxStores) {
    for (var s in fluxStores) {
        flux.stores[s].setState(fluxStores[s]);
    }
}
;


React.renderComponent(Application({
    flux: flux
}), document);