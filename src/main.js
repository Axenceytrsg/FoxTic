import "bootstrap";
import { createApp, h } from "vue";
import contenteditable from "vue-contenteditable";
import Toast, { useToast } from "vue-toastification";
import "vue-toastification/dist/index.css";
import App from "./App.vue";
import "./assets/app.scss";
import "./assets/vue-datepicker.scss";
import "./assets/custom-menu.scss";
import { i18n } from "./i18n";
import { FontAwesomeIcon } from "./icon.js";
import datetime from "./mixins/datetime";
import mobile from "./mixins/mobile";
import publicMixin from "./mixins/public";
import socket from "./mixins/socket";
import theme from "./mixins/theme";
import lang from "./mixins/lang";
import { router } from "./router";
import { appName } from "./util.ts";
import dayjs from "dayjs";
import timezone from "./modules/dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import relativeTime from "dayjs/plugin/relativeTime";
import { loadToastSettings } from "./util-frontend";
import { defaultPopperConfig } from "./bootstrap-config";

// Configuration globale de Bootstrap pour éviter les avertissements de Popper
window.bootstrap = window.bootstrap || {};
window.bootstrap.Dropdown = window.bootstrap.Dropdown || {};
window.bootstrap.Dropdown.Default = window.bootstrap.Dropdown.Default || {};
window.bootstrap.Dropdown.Default.popperConfig = defaultPopperConfig;

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

const app = createApp({
    mixins: [
        socket,
        theme,
        mobile,
        datetime,
        publicMixin,
        lang,
    ],
    data() {
        return {
            appName: appName,
            vtoast: useToast()
        };
    },
    render: () => h(App),
});

app.use(router);
app.use(i18n);

app.use(Toast, loadToastSettings());
app.component("Editable", contenteditable);
app.component("FontAwesomeIcon", FontAwesomeIcon);

app.mount("#app");

// Expose the vue instance for development
if (process.env.NODE_ENV === "development") {
    console.log("Dev Only: window.app is the vue instance");
    window.app = app._instance;
}
