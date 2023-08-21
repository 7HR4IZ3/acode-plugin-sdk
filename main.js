
class Logger {
  /**
   * 
   * @param {HTMLElement} element 
   */
  constructor(logger_id, log_template) {
    this.logs = [];
    this.logger_id = logger_id
    this.log_template = log_template
  }

  log(type, message) {
    let date = new Date().toUTCString();
    type = (type || "info").toUpperCase()

    this.logs.push(this.format(type, message, date));
  }

  debug(message) {
    return this.log("debug", message)
  }

  error(message) {
    this.log("error", message)
  }

  info(message) {
    this.log("info", message)
  }

  warning(message) {
    this.log("warning", message)
  }

  format(type, message, date) {
    return eval(`"${this.log_template}"`.replaceAll('"', "`"));
  }
}

class LoggerSidebar {
  log_template = "[${type}](${date}) => '${message}'"

  constructor() {
    this.element = null;
    this.loggers = new Map();
    this.node = tag('div')
  }

  /**
   * @param {HTMLElement} container 
   */
  init(container) {
    this.element = container;
  }

  /**
   * @param {HTMLElement} container 
   */
  onSelected(container) {
    // this.render();z
  }

  render() {
    this.element.innerHTML = "";
  }

  createLogger(logger_id, log_template) {
    let logger = new Logger(
      logger_id, log_template || this.log_template
    );
    this.loggers.set(logger_id, {
      element: null,
      logger: logger
    });
    return logger;
  }
}

class AcodePlugin {

  async init() {
    let sidebarApps = acode.require("sidebarApps");

    let sidebarApp = new LoggerSidebar();
    sidebarApps.add(
      "settings", "acode.sdk.logger", "Logger", sidebarApp.init,
      false, sidebarApp.onSelected
    )

    acode.define("acode.sdk.logger", sidebarApp.createLogger);
    this.setupDevTools();
  }
  
  setupDevTools() {
    let erudaSrc = this.baseUrl + 'src/eruda.min.js';
    let script = document.head.appendChild(
      document.createElement("script")
    )
    script.src = erudaSrc;
    script.onload = () => {
      eruda.init();
      acode.define("acode.sdk.eruda", eruda);
    }
  }

  destroy() {
    eruda.destroy();
  }
}

if (window.acode) {
  const acodePlugin = new AcodePlugin();
  acode.setPluginInit(
    "acode.plugin.sdk",
    async (baseUrl, $page, { cacheFileUrl, cacheFile }) => {
      if (!baseUrl.endsWith('/')) {
        baseUrl += '/';
      }
      acodePlugin.baseUrl = baseUrl;
      try {
        await acodePlugin.init($page, cacheFile, cacheFileUrl);
      } catch (err) {
        acode.alert('Error', err)
      }
    }
  );

  acode.setPluginUnmount("acode.plugin.sdk", () => {
    acodePlugin.destroy();
  });
}
