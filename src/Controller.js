(function(Global, Base) {
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
            var viewUri = this.getViewUri(viewInfo.path);
            var viewRouter = this.router[viewUri] || (this.router[viewUri] = {});
            if(!(view = viewRouter.view)) {
                require(viewUri, this.proxy(loadView));
            }else {
                view.param = Base.Utils.queryToJson(viewInfo.query);
                this.viewLoaded(view)
            }
            return true

            function loadView(view) {
                viewRouter.view = view;
                view.param = Base.Utils.queryToJson(viewInfo.query);

                this.create(view, viewUri);
                this.render(view);
                this.viewLoaded(view)
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
        "viewLoaded": function(view) {
            view.onLoad();
            this.swapView(view);
            view.start()
        },
        "swapView": function(view) {
            var cView;
            (cView = this.currentView) &&
            !!(cView.el.style.display = "none") &&
            cView.onHide();

            this.currentView = view;
            view.el.style.display = "";
            view.onShow();
        },
        "getViewInfo": function() {
            var hash = location.hash.split("?");
            return {
                "path": hash[0].replace("#", "\/") || this.config.VIEW_DEFAULT,
                "query": hash[1]||""
            }
        },
        "getViewUri": function(viewpath) {
            return this.config.VIEW_HOST + this.config.VIEW_BASE + viewpath
        },
        "createContainer": (function() {
            var id = 0, prefix = "saber-view-";
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
})(this, Base);