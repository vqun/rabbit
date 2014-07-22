(function(Global, Base) {
    var queryToJson = Base.Utils.queryToJson, clear = Base.Utils.clear;
    var Controller = new Base.Class({
        "__constructor__": function(config) {
            this.router = {};
            this.currentView = "";
            this.config = {
                "VIEW_HOST": config.VIEW_HOST || "/",
                "VIEW_BASE": config.VIEW_BASE || "",
                "VIEW_DEFAULT": "index",
                "MAIN_CONTAINER": config.MAIN_CONTAINER || document.body
            };
        },
        "__init__": function() {
            require.config = {
                "host": this.config.VIEW_HOST,
                "baseUrl": this.config.VIEW_BASE
            };
            this.hashChange();
            Global.onhashchange = this.proxy(this.hashChange);
        }
    });
    Controller.fn.extend({
        "hashChange": function() {
            var viewinfo = this.getViewInfo();
            this.switchView(viewinfo);
        },
        "switchView": function(viewInfo){
            var view = null;
            var viewUri = viewInfo.path;
            var viewRouter = this.router[viewUri] || (this.router[viewUri] = {});
            if(!(view = viewRouter.view)) {
                require(viewUri, this.proxy(loadView));
            }else {
                view.query = queryToJson(viewInfo.query);
                this.viewLoaded(view, viewInfo.action)
            }
            return true

            function loadView(view) {
                viewRouter.view = view;
                view.query = queryToJson(viewInfo.query);

                this.create(view, viewRouter);
                this.render(view);
                this.viewLoaded(view, viewInfo.action)
            }
        },
        "create": function(view, viewRouter) {
            var conInfo = this.createContainer();
            viewRouter.container = conInfo.container;
            viewRouter.id = conInfo.id;
            view.el = conInfo.container;
            view.viewID = conInfo.id;
            view.onCreate();
        },
        "render": function(view) {
            this.config.MAIN_CONTAINER.appendChild(view.el);
        },
        "viewLoaded": function(view, action) {
            view.onLoad();
            this.swapView(view, action)
        },
        "swapView": function(view, action) {
            var cView;
            (cView = this.currentView) &&
            !!(cView.el.style.display = "none") &&
            cView.onHide();
            this.currentView = view;
            view.start(action);
            view.el.style.display = "";
            view.onShow();
        },
        "getViewInfo": function() {
            var hash = decodeURIComponent(location.hash).split("!"),
                hashInfo = hash.split("?"),
                actionInfo = (hash[1]||"").split(":");
            return {
                "path": (hashInfo[0]||"#" + this.config.VIEW_DEFAULT).replace("#", "\/"),
                "query": hashInfo[1]||"",
                "action": {
                    "name": actionInfo[1]||"",
                    "args": clear(actionInfo).split(",")
                }
            }
        },
        "createContainer": (function() {
            var id = 0, prefix = "rabbit-view-";
            return function() {
                var viewContainer = document.createElement("div");
                var viewConId = prefix + ++id;
                viewContainer.id = viewConId;
                viewContainer.style.display = "none";
                return {
                    container: viewContainer,
                    id: viewConId
                }
            }
        })()
    });
    Base.Controller = Controller
})(this, Rabbit);