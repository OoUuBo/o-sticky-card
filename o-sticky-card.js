class OStickyCard extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.ha = document.querySelector("home-assistant");
    this.main = this.ha.shadowRoot.querySelector(
      "home-assistant-main"
    ).shadowRoot;
    this.lovelace = this.main.querySelector("ha-panel-lovelace");
    
    // this.count = OStickyCard.idCounter++;
    // console.log("constructor",this.count);
  }

  setConfig(config) {
    // console.log("config",this.count);
    this.config = config;
    this._refCards = [];
    this._refTitleCard =[];
    this._init__refCards().then(() => {
      // console.log("this._refCard"+this.count,this._refCards);
      this.render(); 
    });
    
  }
 
  set hass(hass) {
    // console.log("hass");
    this._hass = hass;
    if (this._refCards) {
      this._refCards.forEach((card) => {  
          card.hass = hass;       
      });
    }

  }

  async getCardSize() {

  }

  processConfig(lovelace, config) {

  }

  connectedCallback() {

  }

  disconnectedCallback() {
  }

  //生成子卡片Dom，保存到this._refCards数组中
  async _init__refCards() {
    // console.time('_init__refCards');
    const config = this.config;
    if (window.loadCardHelpers) {
      this.helpers = await window.loadCardHelpers();
    }
    //配置cards。
    let promises = config.cards.map(async (config) => {
      let card = await this.createCardElement(config);      
        card.setAttribute("data-mainPathName", config.card_path_name);
        return card; 
    });
    this._refCards = await Promise.all(promises);
    this._refCards = this._refCards.filter(card => card !== undefined);
  }
 
  //将所有的元素，添加到this.shadow
  render() {
    
    // 创建 CSS style
    ////yaml配置文件的参数
    var top = this.config.top; 
    this.shadowRoot.innerHTML = "";                  
    // this.setAttribute('style', 'background:var(--primary-background-color);position:sticky;z-index:30;top:'+top);
    this.style.background = 'var(--primary-background-color)';
    this.style.position = 'sticky';
    this.style.zIndex = 30;
    this.style.top = top;

    var o_container = document.createElement("div");
    o_container.setAttribute("class", "sticky");
    this._refCards.forEach((card) => {  
      o_container.appendChild(card);
    });

    var style = document.createElement("style");
    style.textContent = `
    :host {
    }
  `;

    this.shadow.appendChild(style);
    if(this.config.cards.length > 1){
      this.shadow.appendChild(o_nav);
    }
    this.shadow.appendChild(o_container);
    
    // console.timeEnd('render');
    // console.log("render-end");
  }

  async createCardElement(cardConfig) {
    const createError = (error, origConfig) => {
      return createThing("hui-error-card", {
        type: "error",
        error,
        origConfig,
      });
    };
    const createThing = (tag, config) => {
      //新版的创建card方法
      if (this.helpers) {
        if (config.type === "divider") {
          return this.helpers.createRowElement(config);
        } else {
          return this.helpers.createCardElement(config);
        }
      }
      //旧版的创建card方法
      const element = document.createElement(tag);
      try {
        element.setConfig(config);
      } catch (err) {
        console.error(tag, err);
        return createError(err.message, config);
      }
      return element;
    };
    let tag = cardConfig.type;
    if (tag.startsWith("divider")) {
      tag = `hui-divider-row`;
    } else if (tag.startsWith("custom:")) {
      tag = tag.substr("custom:".length);
    } else {
      tag = `hui-${tag}-card`;
    }

    const element = createThing(tag, cardConfig);
    element.hass = this._hass;
    return element;
  }

}


OStickyCard.eventListenerAdded = false; //事件添加标记  防止重复添加
OStickyCard.idCounter = 0;


setTimeout(()=>{
  customElements.whenDefined("hui-view").then(() => {
    customElements.define('o-sticky-card',OStickyCard);
    // Overly complicated console tag.
  const conInfo = { header: "%c≡ oubo-test".padEnd(27), ver: "%cversion *DEV " };
  const br = "%c\n";
  const maxLen = Math.max(...Object.values(conInfo).map((el) => el.length));
  for (const [key] of Object.entries(conInfo)) {
    if (conInfo[key].length <= maxLen) conInfo[key] = conInfo[key].padEnd(maxLen);
    if (key == "header") conInfo[key] = `${conInfo[key].slice(0, -1)}⋮ `;
  }
  const header =
    "display:inline-block;border-width:1px 1px 0 1px;border-style:solid;border-color:#424242;color:white;background:#03a9f4;font-size:12px;padding:4px 4.5px 5px 6px;";
  const info = "border-width:0px 1px 1px 1px;padding:7px;background:white;color:#424242;line-height:0.7;";
  console.info(conInfo.header + br + conInfo.ver, header, "", `${header} ${info}`);

  });
},0);


// customElements.define('o-sticky-card',OStickyCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "o-sticky-card",
  name: "o-sticky-card",
  preview: false, // Optional - defaults to false
  description: "浮动定位卡片" ,// Optional
});

