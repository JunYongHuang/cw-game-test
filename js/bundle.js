(function () {
    'use strict';

    class BaseItem {
        constructor() {
            this._keys = [];
            this.THIS_ID = "id";
        }
        init(obj) {
            for (let key in obj) {
                this._keys.push(key);
                let value = obj[key];
                if (obj[key] instanceof String) {
                    if (String(obj[key]).indexOf("[[") >= 0) {
                        value = JSON.parse(obj[key]);
                    }
                }
                this[key] = value;
            }
        }
        checkItems() {
        }
    }

    class LanguageItem extends BaseItem {
    }

    class Dictionary {
        constructor() {
            this._values = [];
            this._keys = [];
            this.SERIALIZATION_NUM = (new Date()).getTime();
        }
        get values() {
            return this._values;
        }
        get keys() {
            return this._keys;
        }
        set(key, value) {
            let index = this.indexOf(key);
            if (index >= 0) {
                this._values[index] = value;
                return;
            }
            this._keys.push(key);
            this._values.push(value);
        }
        indexOf(key) {
            let index = this._keys.indexOf(key);
            if (index >= 0) {
                return index;
            }
            key = key instanceof String ? Number(key) : (key instanceof Number ? key.toString() : key);
            return this._keys.indexOf(key);
        }
        get(key) {
            let index = this.indexOf(key);
            return index < 0 ? null : this._values[index];
        }
        remove(key) {
            let index = this.indexOf(key);
            if (index >= 0) {
                this._keys.splice(index, 1);
                this._values.splice(index, 1);
                return true;
            }
            return false;
        }
        clear() {
            this._values.length = 0;
            this._keys.length = 0;
        }
    }

    class GameLanguageMgr {
        constructor() {
            this._lanTypesById = new Dictionary();
            this._lanTypesByType = new Dictionary();
            this._configData = new Dictionary();
        }
        static get instance() {
            if (!GameLanguageMgr._instance) {
                GameLanguageMgr._instance = new GameLanguageMgr();
            }
            return GameLanguageMgr._instance;
        }
        initLanTypes(value) {
            this._lanTypesById = new Dictionary();
            this._lanTypesByType = new Dictionary();
            for (let a in value) {
                let languageItem = new LanguageItem();
                languageItem.init(value[a]);
                if (parseInt(languageItem.if_open) != 1) {
                    continue;
                }
                let ID = languageItem.ID;
                let type = languageItem.type;
                this._lanTypesById.set(ID, languageItem);
                if (type && type != "") {
                    this._lanTypesByType.set(type, languageItem);
                }
            }
        }
        getLanTypes() {
            return this._lanTypesById;
        }
        getLanIdByType(type) {
            if (this._lanTypesByType) {
                let languageItem = this._lanTypesByType.get(type);
                if (languageItem) {
                    return parseInt(languageItem.ID.toString());
                }
            }
            return 1;
        }
        getLanTypeById(id) {
            if (this._lanTypesById) {
                let languageItem = this._lanTypesById.get(id);
                if (languageItem) {
                    return languageItem.type;
                }
            }
            return "en";
        }
        initConfigLan(value) {
            this._configData = value;
        }
        initUILan(value) {
            Laya.Text.langPacks = {};
            let key;
            for (key in value) {
                let lanValue = value[key]["value"];
                Laya.Text.langPacks[key] = lanValue;
            }
        }
        changeBrToN(value) {
            let reg = /<br>/g;
            while (value.indexOf("<br>") != -1) {
                value = value.replace(reg, "\n");
            }
            return value;
        }
        getConfigLan(id) {
            if (this._configData && this._configData[id]) {
                let value = this._configData[id].value;
                if (value && id + "" != "5398") {
                    value = this.changeBrToN(value);
                }
                if (value) {
                    return value.toString();
                }
            }
            return id + "";
        }
        replacePlaceholder(source, args) {
            if (source == "") {
                return "";
            }
            let pattern = /{(\d+)}/g;
            if (args.length > 0) {
                source = source.replace(pattern, function () {
                    return args[arguments[1]];
                });
            }
            return this.replaceLanByBR(source);
        }
        replaceLanByBR(value) {
            let _str = value + "";
            while (_str.indexOf("/n") != -1) {
                _str = _str.replace("/n", "<br>");
            }
            return _str;
        }
        getLanguage(value, ...arg) {
            return this.getLanguage2(value, arg);
        }
        getLanguage2(value, replaceArr) {
            if (this._configData && this._configData[value]) {
                let _str = this._configData[value].value;
                if (_str && _str != "") {
                    let str = this.replacePlaceholder(_str, replaceArr);
                    str = str.replace(/^"*/g, "");
                    str = str.replace(/"*$/g, "");
                    return str;
                }
            }
            return this.replacePlaceholder(value + "", replaceArr);
        }
        getUILang(text, arg1 = null, arg2 = null, arg3 = null, arg4 = null) {
            text = Laya.Text.langPacks && Laya.Text.langPacks[text] ? Laya.Text.langPacks[text] : text;
            if (arguments.length > 1) {
                for (let i = 0, n = arguments.length; i < n; i++) {
                    text = text.replace("{" + i + "}", arguments[i + 1]);
                }
            }
            return text;
        }
        dispose() {
        }
    }

    class LayerManager {
        constructor() {
            this._touchEnabled = true;
            if (LayerManager._instance) {
                throw new Error("LayerManager是单例,不可new.");
            }
            LayerManager._instance = this;
        }
        get m_sprPanelLayer() {
            return this._m_sprPanelLayer;
        }
        set m_sprPanelLayer(value) {
            this._m_sprPanelLayer = value;
        }
        get m_sprMainUILayer() {
            return this._m_sprMainUILayer;
        }
        set m_sprMainUILayer(value) {
            this._m_sprMainUILayer = value;
        }
        get m_sprTipLayer() {
            return this._m_sprTipLayer;
        }
        set m_sprTipLayer(value) {
            this._m_sprTipLayer = value;
        }
        static get instence() {
            if (LayerManager._instance) {
                return LayerManager._instance;
            }
            LayerManager._instance = new LayerManager();
            return LayerManager._instance;
        }
        init() {
            this.m_sprSceneLayer = new Laya.Sprite();
            Laya.stage.addChild(this.m_sprSceneLayer);
            this.m_sprMainUILayer = new Laya.Sprite();
            Laya.stage.addChild(this.m_sprMainUILayer);
            this.m_sprPanelLayer = new Laya.Sprite();
            Laya.stage.addChild(this.m_sprPanelLayer);
            this.m_sprPopLayer = new Laya.Sprite();
            this.m_sprPopLayer.mouseThrough = true;
            Laya.stage.addChild(this.m_sprPopLayer);
            this.m_sprTipLayer = new Laya.Sprite();
            Laya.stage.addChild(this.m_sprTipLayer);
            this.m_sprGuideLayer = new Laya.Sprite();
            Laya.stage.addChild(this.m_sprGuideLayer);
            this.m_sprTopLayer = new Laya.Sprite();
            Laya.stage.addChild(this.m_sprTopLayer);
        }
        get touchEnabled() {
            return this._touchEnabled;
        }
        set touchEnabled(value) {
            if (this._touchEnabled == value) {
                return;
            }
            this._touchEnabled = value;
            this.m_sprSceneLayer.mouseEnabled = this._touchEnabled;
            this.m_sprMainUILayer.mouseEnabled = this._touchEnabled;
            this.m_sprPanelLayer.mouseEnabled = this._touchEnabled;
            this.m_sprPopLayer.mouseEnabled = this._touchEnabled;
            this.m_sprTipLayer.mouseEnabled = this._touchEnabled;
            this.m_sprGuideLayer.mouseEnabled = this._touchEnabled;
            this.m_sprTopLayer.mouseEnabled = this._touchEnabled;
        }
        addToLayerAndSet(view, layerType = LayerManager.M_PANEL, postTpye = LayerManager.CENTER) {
            this.addToLayer(view, layerType);
            this.setPosition(view, postTpye);
        }
        getLayerIndex(view, layerType = LayerManager.M_PANEL) {
            let index;
            switch (layerType) {
                case LayerManager.M_SCENE:
                    {
                        index = this.m_sprSceneLayer.getChildIndex(view);
                    }
                    break;
                case LayerManager.M_MAINUI:
                    {
                        index = this.m_sprMainUILayer.getChildIndex(view);
                    }
                    break;
                case LayerManager.M_PANEL:
                    {
                        index = this.m_sprPanelLayer.getChildIndex(view);
                    }
                    break;
                case LayerManager.M_POP:
                    {
                        index = this.m_sprPopLayer.getChildIndex(view);
                    }
                    break;
                case LayerManager.M_TIP:
                    {
                        index = this.m_sprTipLayer.getChildIndex(view);
                    }
                    break;
                case LayerManager.M_GUIDE:
                    {
                        index = this.m_sprGuideLayer.getChildIndex(view);
                    }
                    break;
                case LayerManager.M_TOP:
                    {
                        index = this.m_sprTopLayer.getChildIndex(view);
                    }
                    break;
            }
            return index;
        }
        addToLayerAt(view, layerType = LayerManager.M_PANEL, index = 0) {
            switch (layerType) {
                case LayerManager.M_SCENE:
                    {
                        this.m_sprSceneLayer.addChildAt(view, index);
                    }
                    break;
                case LayerManager.M_MAINUI:
                    {
                        this.m_sprMainUILayer.addChildAt(view, index);
                    }
                    break;
                case LayerManager.M_PANEL:
                    {
                        this.m_sprPanelLayer.addChildAt(view, index);
                    }
                    break;
                case LayerManager.M_POP:
                    {
                        this.m_sprPopLayer.addChildAt(view, index);
                    }
                    break;
                case LayerManager.M_TIP:
                    {
                        this.m_sprTipLayer.addChildAt(view, index);
                    }
                    break;
                case LayerManager.M_GUIDE:
                    {
                        this.m_sprGuideLayer.addChildAt(view, index);
                    }
                    break;
                case LayerManager.M_TOP:
                    {
                        this.m_sprTopLayer.addChildAt(view, index);
                    }
                    break;
            }
        }
        addToLayer(view, layerType = LayerManager.M_PANEL) {
            switch (layerType) {
                case LayerManager.M_SCENE:
                    {
                        this.m_sprSceneLayer.addChild(view);
                    }
                    break;
                case LayerManager.M_MAINUI:
                    {
                        this.m_sprMainUILayer.addChild(view);
                    }
                    break;
                case LayerManager.M_PANEL:
                    {
                        this.m_sprPanelLayer.addChild(view);
                    }
                    break;
                case LayerManager.M_POP:
                    {
                        this.m_sprPopLayer.addChild(view);
                    }
                    break;
                case LayerManager.M_TIP:
                    {
                        this.m_sprTipLayer.addChild(view);
                    }
                    break;
                case LayerManager.M_GUIDE:
                    {
                        this.m_sprGuideLayer.addChild(view);
                    }
                    break;
                case LayerManager.M_TOP:
                    {
                        this.m_sprTopLayer.addChild(view);
                    }
                    break;
            }
        }
        removeFromLayer(view, layerType) {
            switch (layerType) {
                case LayerManager.M_SCENE:
                    {
                        this.m_sprSceneLayer.removeChild(view);
                    }
                    break;
                case LayerManager.M_MAINUI:
                    {
                        this.m_sprMainUILayer.removeChild(view);
                    }
                    break;
                case LayerManager.M_PANEL:
                    {
                        this.m_sprPanelLayer.removeChild(view);
                    }
                    break;
                case LayerManager.M_POP:
                    {
                        this.m_sprPopLayer.removeChild(view);
                    }
                    break;
                case LayerManager.M_GUIDE:
                    {
                        this.m_sprGuideLayer.removeChild(view);
                    }
                    break;
                case LayerManager.M_TOP:
                    {
                        this.m_sprTopLayer.removeChild(view);
                    }
                    break;
            }
        }
        clearLayer(layerType) {
            switch (layerType) {
                case LayerManager.M_SCENE:
                    {
                        this.m_sprSceneLayer.removeChildren();
                    }
                    break;
                case LayerManager.M_MAINUI:
                    {
                        this.m_sprSceneLayer.removeChildren();
                    }
                    break;
                case LayerManager.M_PANEL:
                    {
                        this.m_sprSceneLayer.removeChildren();
                    }
                    break;
                case LayerManager.M_POP:
                    {
                        this.m_sprSceneLayer.removeChildren();
                    }
                    break;
                case LayerManager.M_TOP:
                    {
                        this.m_sprSceneLayer.removeChildren();
                    }
                    break;
            }
        }
        get stageWidth() {
            let swidth;
            swidth = Laya.stage.width;
            return swidth;
        }
        get stageHeight() {
            let sheight;
            sheight = Laya.stage.height;
            return sheight;
        }
        setPosition(view, postTpye, offsetX = 0, offsetY = 0, anchorX = false, anchorY = false) {
            let _posWidth = Laya.stage.width;
            let _posHeight = Laya.stage.height;
            this.m_iStageWidth = _posWidth;
            this.m_iStageHeight = _posHeight;
            switch (postTpye) {
                case LayerManager.UP:
                    {
                        view.x = anchorX ? _posWidth / 2 : (_posWidth - view.width * view.scaleX) / 2;
                        view.y = 0;
                    }
                    break;
                case LayerManager.DOWN:
                    {
                        view.x = anchorX ? _posWidth / 2 : (_posWidth - view.width * view.scaleX) / 2;
                        view.y = _posHeight - view.height * view.scaleY;
                    }
                    break;
                case LayerManager.LEFT:
                    {
                        view.x = 0;
                        view.y = anchorY ? _posHeight / 2 : (_posHeight - view.height * view.scaleY) / 2;
                    }
                    break;
                case LayerManager.RIGHT:
                    {
                        view.x = _posWidth - view.width * view.scaleX;
                        view.y = anchorY ? _posHeight / 2 : (_posHeight - view.height * view.scaleY) / 2;
                    }
                    break;
                case LayerManager.LEFTUP:
                    {
                        view.x = 0;
                        view.y = 0;
                    }
                    break;
                case LayerManager.RIGHTUP:
                    {
                        view.x = _posWidth - view.width * view.scaleX;
                        view.y = 0;
                    }
                    break;
                case LayerManager.LEFTDOWN:
                    {
                        view.x = 0;
                        view.y = _posHeight - view.height * view.scaleY;
                    }
                    break;
                case LayerManager.RIGHTDOWN:
                    {
                        view.x = _posWidth - view.width * view.scaleX;
                        view.y = _posHeight - view.height * view.scaleY;
                    }
                    break;
                case LayerManager.CENTERLEFT:
                    {
                        view.x = _posWidth / 2 - view.width * view.scaleX;
                        view.y = anchorY ? _posHeight / 2 : (_posHeight - view.height * view.scaleY) / 2;
                    }
                    break;
                case LayerManager.CENTERRIGHT:
                    {
                        view.x = _posWidth / 2;
                        view.y = anchorY ? _posHeight / 2 : (_posHeight - view.height * view.scaleY) / 2;
                    }
                    break;
                case LayerManager.CENTER:
                    {
                        view.x = anchorX ? _posWidth / 2 : (_posWidth - view.width * view.scaleX) / 2;
                        view.y = anchorY ? _posHeight / 2 : (_posHeight - view.height * view.scaleY) / 2;
                    }
                    break;
                default:
                    break;
            }
            view.x += offsetX;
            view.y += offsetY;
        }
        setLayer(view1, view2, isFrontBack) {
            if (!view1 || !view2) {
                return;
            }
            if (view1.parent != view2.parent) {
                return;
            }
            let index1 = view1.parent.getChildIndex(view1);
            let index2 = view2.parent.getChildIndex(view2);
            if (isFrontBack) {
                if (index1 > index2) {
                    view1.parent.setChildIndex(view1, index2);
                    view1.parent.setChildIndex(view2, index1);
                }
            }
            else {
                if (index1 < index2) {
                    view1.parent.setChildIndex(view1, index2);
                    view1.parent.setChildIndex(view2, index1);
                }
            }
        }
    }
    LayerManager.M_SCENE = 1;
    LayerManager.M_MAINUI = 2;
    LayerManager.M_PANEL = 3;
    LayerManager.M_POP = 4;
    LayerManager.M_TIP = 5;
    LayerManager.M_GUIDE = 7;
    LayerManager.M_TOP = 6;
    LayerManager.UP = 0x00000001;
    LayerManager.DOWN = 0x00000010;
    LayerManager.LEFT = 0x00000100;
    LayerManager.RIGHT = 0x00001000;
    LayerManager.CENTER = 0x00010000;
    LayerManager.LEFTUP = LayerManager.LEFT | LayerManager.UP;
    LayerManager.RIGHTUP = LayerManager.RIGHT | LayerManager.UP;
    LayerManager.LEFTDOWN = LayerManager.LEFT | LayerManager.DOWN;
    LayerManager.RIGHTDOWN = LayerManager.RIGHT | LayerManager.DOWN;
    LayerManager.CENTERLEFT = LayerManager.CENTER | LayerManager.LEFT;
    LayerManager.CENTERRIGHT = LayerManager.CENTER | LayerManager.RIGHT;
    LayerManager.MOVE = -1;

    class AlertType {
        constructor() {
        }
    }
    AlertType.YES = 1;
    AlertType.NO = 2;
    AlertType.SURE = 4;
    AlertType.CANCEL = 8;
    AlertType.CLOSE = 16;
    AlertType.RETURN_YES = 1;
    AlertType.RETURN_NO = 2;
    AlertType.RETURN_NONE = 3;
    AlertType.BASEALERTVIEW = "BaseAlertView";
    AlertType.BUYCONFIRMVIEW = "BuyConfirmView";
    AlertType.EnduranceOutTipView = "EnduranceOutTipView";
    AlertType.GUILDQUITVIEW = "GuildQuitView";
    AlertType.BuyItemConfirmView = "BuyItemConfirmView";
    AlertType.DOWNLOADALERT = "DownLoadAlert";

    class AlertManager {
        constructor() {
        }
        static instance() {
            if (!AlertManager._instance) {
                AlertManager._instance = new AlertManager();
            }
            return AlertManager._instance;
        }
        close() {
            if (this._alert) {
                this._alert.close();
            }
        }
        AlertByType(type, data = null, flag = 0, okHandler = null, cancelHandler = null, destroyDoCancel = false, initHandler = null) {
            if (flag == 0) {
                flag = AlertType.YES | AlertType.NO;
            }
            this.onLoaded(flag, type, data, okHandler, cancelHandler, destroyDoCancel, initHandler);
        }
        onLoaded(flag, type, data, okHandler = null, cancelHandler = null, destroyDoCancel = false, initHandler = null) {
            this._alert = Laya.ClassUtils.getInstance(type);
            this._alert.alert(flag, okHandler, cancelHandler, data, destroyDoCancel, initHandler);
            this._alert.popup();
        }
        onResizeChange() {
            if (this._alert) {
                this._alert.x = (Laya.stage.width - this._alert.width) / 2;
                this._alert.y = (Laya.stage.height - this._alert.height) / 2;
            }
        }
    }

    class EffectManager {
        constructor() {
            this.effectMap = new Dictionary();
        }
        loadEffect(url) {
            this.urls = url;
            for (let i = 0; i < this.urls.length; i++) {
                let oneUrl = this.urls[i].hasOwnProperty("url") ? this.urls[i]["url"] : this.urls[i];
                if (oneUrl && !GameResourceManager.instance.hasFormatEffectUrl(oneUrl)) {
                    if (this.urls[i] == "") {
                        this.urls[i] = {};
                    }
                    this.urls[i]["url"] = GameResourceManager.instance.getEffectUrl(oneUrl);
                    this.urls[i]["type"] = Laya.Loader.ATLAS;
                }
            }
            Laya.loader.load(this.urls, Laya.Handler.create(this, this.loadAssets));
        }
        getEffectByUrl(url) {
            if (!GameResourceManager.instance.hasFormatEffectUrl(url)) {
                url = GameResourceManager.instance.getEffectUrl(url);
            }
            return this.effectMap.get(url);
        }
        copyEffectByUrl(url) {
            if (!GameResourceManager.instance.hasFormatEffectUrl(url)) {
                url = GameResourceManager.instance.getEffectUrl(url);
            }
            let animation = this.effectMap.get(url);
            let copyAnimation = new Laya.Animation();
            copyAnimation.source = url;
            copyAnimation.stop();
            let newUrl = url + "_2";
            this.urls.push(newUrl);
            this.effectMap.set(newUrl, copyAnimation);
            return copyAnimation;
        }
        loadAssets() {
            if (!this.effectMap) {
                return;
            }
            let ani;
            for (let i = 0; i < this.urls.length; i++) {
                if (this.effectMap.get(this.urls[i]["url"])) {
                    continue;
                }
                ani = new Laya.Animation();
                ani.loadAtlas(this.urls[i]["url"]);
                ani.interval = 100;
                ani.stop();
                this.effectMap.set(this.urls[i]["url"], ani);
            }
            if (this.callBak) {
                this.callBak.run();
            }
        }
        destory() {
            if (this.urls) {
                for (let i = 0; i < this.urls.length; i++) {
                    this.removeUrlEffect(this.urls[i]);
                }
            }
            this.effectMap && this.effectMap.clear();
            this.effectMap = null;
            if (this.callBak) {
                this.callBak.clear();
                this.callBak = null;
            }
        }
        removeUrlEffect(url) {
            if (url.hasOwnProperty("url")) {
                url = url.url;
            }
            if (this.effectMap) {
                let effect = this.effectMap.get(url);
            }
            if (this.effect) {
                this.effect.destroy();
                Laya.Loader.clearRes(url);
                this.effect = null;
                this.effectMap.remove(url);
                url = Laya.URL.formatURL(url);
                let res = Laya.Loader.loadedMap[url];
                if (res) {
                    console.log("clear Res: " + url);
                    if (res instanceof Laya.Texture && res.bitmap) {
                        new Laya.Texture(res).destroy(true);
                    }
                    delete Laya.Loader.loadedMap[url];
                }
            }
        }
    }

    class LoadingManager {
        constructor() {
            this._isLoading = false;
        }
        static get instance() {
            if (!LoadingManager._instance) {
                LoadingManager._instance = new LoadingManager();
            }
            return LoadingManager._instance;
        }
        get isLoading() {
            return this._isLoading;
        }
        init() {
            if (this.effectManager == null) {
                this.effectManager = new EffectManager();
            }
            if (!this.loadingMc) {
                this.loadAsset();
                this.loadBgImg();
            }
        }
        loadBgImg() {
            Laya.loader.load([GameResourceManager.instance.getGuangImg("guang")], Laya.Handler.create(this, this.loadImgAssets));
        }
        loadImgAssets() {
            let texture = Laya.Loader.getRes(GameResourceManager.instance.getGuangImg("guang"));
            this.bgImg = new Laya.Image();
            this.bgImg.skin = GameResourceManager.instance.getGuangImg("guang");
            this.bgImg.pivot(this.bgImg.width / 2, this.bgImg.height / 2);
        }
        callBack() {
            this.loadingMc = this.effectManager.getEffectByUrl(GameResourceManager.instance.getEffectUrl("walking"));
            this.loadingMc.stop();
            this.loadingMc.visible;
            this.loadingMc.pivot(45, 80);
        }
        loadAsset() {
            let url1 = GameResourceManager.instance.getEffectUrl("walking");
            let effecturls = [{ "url": url1, "type": Laya.Loader.ATLAS }];
            this.effectManager.callBak = Laya.Handler.create(this, this.callBack);
            this.effectManager.loadEffect(effecturls);
        }
        showLoading(showImmediately = false) {
            if (!this.loadingMc) {
                return;
            }
            else {
                if (showImmediately) {
                    this._isLoading = true;
                    this.showMaskLoading();
                    this.showLazyLoading();
                    this._isLoading = false;
                }
                else {
                    this._isLoading = true;
                    this.showMaskLoading();
                    Laya.timer.once(3000, this, this.showLazyLoading);
                }
                if (this.m_txtLabel) {
                    this.m_txtLabel.visible = false;
                }
            }
        }
        showLoadingByInfo(text = "") {
            if (!this.loadingMc) {
                return;
            }
            else {
                this.showMaskLoading();
                this.showLazyLoading();
                if (!this.m_txtLabel) {
                    this.m_txtLabel = new Laya.Label();
                }
                this.m_txtLabel.fontSize = 18;
                this.m_txtLabel.color = "#ffffff";
                this.m_txtLabel.strokeColor = "#000000";
                this.m_txtLabel.stroke = 2;
                this.m_txtLabel.width = 150;
                this.m_txtLabel.y = (Laya.stage.height - this.m_txtLabel.height >> 1) + 100;
                Laya.stage.addChild(this.m_txtLabel);
            }
            this.m_txtLabel.text = text;
            let textWidth;
            if (this.m_txtLabel.textField) {
                textWidth = this.m_txtLabel.textField.textWidth;
            }
            this.m_txtLabel.x = Laya.stage.width - textWidth >> 1;
            this.m_txtLabel.visible = true;
        }
        playBg() {
            if (this.bgImg) {
                if (!this.bgImg.parent) {
                    Laya.stage.addChild(this.bgImg);
                    this.bgImg.x = Laya.stage.width / 2;
                    this.bgImg.y = Laya.stage.height / 2;
                }
                else {
                    this.bgImg.visible = true;
                }
                Laya.timer.loop(100, this, this.loopFrame);
            }
        }
        stopBg() {
            if (this.bgImg) {
                this.bgImg.visible = false;
                this.bgImg.rotation = 0;
                Laya.timer.clear(this, this.loopFrame);
            }
        }
        loopFrame() {
            this.bgImg.rotation += 3;
        }
        showMaskLoading() {
            if (this._isLoading) {
                if (!this._backLayer) {
                    this._backLayer = new Laya.Sprite();
                    this._backLayer.mouseEnabled = true;
                    this._backLayer.alpha = 0;
                    this._backLayer.visible = false;
                    Laya.stage.addChild(this._backLayer);
                }
                this._backLayer.graphics.clear();
                this._backLayer.graphics.drawRect(0, 0, Laya.stage.width + 200, Laya.stage.height, "#000000");
                this._backLayer.width = Laya.stage.width;
                this._backLayer.height = Laya.stage.height;
                this._backLayer.x = Math.round(Laya.stage.width - this._backLayer.width >> 1);
                this._backLayer.y = Math.round(Laya.stage.height - this._backLayer.height >> 1);
                this._backLayer.visible = true;
            }
        }
        showLazyLoading() {
            if (this._isLoading) {
                Laya.stage.addChild(this.loadingMc);
                this._backLayer.alpha = 0.24;
                this.loadingMc.x = Laya.stage.width / 2;
                this.loadingMc.y = Laya.stage.height / 2;
                this.loadingMc.play();
                this.loadingMc.visible = true;
                this.playBg();
            }
            Laya.timer.clear(this, this.showLazyLoading);
        }
        hideLoading() {
            this._isLoading = false;
            if (!this.loadingMc) {
                return;
            }
            else {
                this.loadingMc.stop();
                this.loadingMc.visible = false;
                if (this._backLayer) {
                    this._backLayer.visible = false;
                }
                if (this.m_txtLabel) {
                    this.m_txtLabel.visible = false;
                }
            }
            this.stopBg();
        }
        dispose() {
            if (this.loadingMc) {
                this.loadingMc.destroy();
                this.loadingMc.removeSelf();
                this.loadingMc = null;
            }
            if (this._backLayer) {
                this._backLayer.destroy();
                this._backLayer.removeSelf();
                this._backLayer = null;
            }
        }
    }

    class SceneLoadMgr {
        constructor() {
            this._mapUrl = "";
            this._mapWidth = 0;
            this._mapHeight = 0;
            this._gridWidth = 0;
            this._gridHeight = 0;
            this._xPics = 0;
            this._yPics = 0;
            this._fuzzyName = "";
        }
        static get instance() {
            if (!SceneLoadMgr._instance) {
                SceneLoadMgr._instance = new SceneLoadMgr();
            }
            return SceneLoadMgr._instance;
        }
        loadScene(mapWidth, mapHeight, gridWidth, gridHeight, _mapImg, _mapName, _callBack) {
            if (this._fuzzyName != "" && this._fuzzyName != _mapName) {
                this.dispose();
            }
            this._mapWidth = mapWidth;
            this._mapHeight = mapHeight;
            this._gridWidth = gridWidth;
            this._gridHeight = gridHeight;
            this._fuzzySprite = _mapImg;
            this._xPics = Math.floor(this._mapWidth / gridWidth);
            this._yPics = Math.floor(this._mapHeight / gridHeight);
            this._fuzzyName = _mapName;
            this._fuzzyCallBack = _callBack;
            let _altlasXmlUrl = GameResourceManager.instance.setResURL("scene/subScene/test1/" + _mapName + ".json");
            Laya.loader.load([{ url: _altlasXmlUrl, type: Laya.Loader.ATLAS }], Laya.Handler.create(this, this.loadSceneComplete), Laya.Handler.create(this, this.loadProcess, null, false), null, 0, true, null, true);
        }
        loadProcess() {
        }
        loadSceneComplete() {
            let _nima = Laya.Loader.getAtlas(GameResourceManager.instance.setResURL("scene/subScene/test1/" + this._fuzzyName + ".json"));
            if (this._fuzzySprite) {
                this._fuzzySprite.graphics.clear();
                let _index = 0;
                let sprite = new Laya.Sprite();
                sprite.name = "mapSprite";
                this._fuzzySprite.addChildAt(sprite, 0);
                for (let a = 0; a < this._yPics; a++) {
                    for (let b = 0; b < this._xPics; b++) {
                        let _textures = Laya.loader.getRes(_nima[_index]);
                        let img = new Laya.Image();
                        sprite.addChild(img);
                        img.texture = _textures;
                        img.size(_textures.width, _textures.height);
                        img.pos(b * this._gridWidth, a * this._gridHeight);
                        _index++;
                    }
                }
            }
            if (this._fuzzyCallBack != null) {
                this._fuzzyCallBack.run();
            }
        }
        dispose() {
            this._fuzzyCallBack = null;
            if (this._fuzzyName && this._fuzzyName != "") {
                Laya.loader.clearRes(GameResourceManager.instance.setResURL("atlas/" + this._fuzzyName + ".json"));
            }
        }
    }

    class SoundMgr {
        constructor() {
            this._m_bPlayMusic = true;
            this._m_bPlayeSound = true;
        }
        static get instance() {
            if (SoundMgr._instance) {
                return SoundMgr._instance;
            }
            SoundMgr._instance = new SoundMgr();
            return SoundMgr._instance;
        }
        get m_bPlayMusic() {
            return this._m_bPlayMusic;
        }
        set m_bPlayMusic(value) {
            this._m_bPlayMusic = value;
            if (value) {
                this.playMusicByURL(this.m_strMusicURL);
            }
            else {
                if (this.musicChannel) {
                    this.musicChannel.stop();
                }
            }
        }
        get m_bPlayeSound() {
            return this._m_bPlayeSound;
        }
        set m_bPlayeSound(value) {
            this._m_bPlayeSound = value;
        }
        playMusicByURL(url) {
            if (this.m_strMusicURL) {
            }
            if (this.m_strMusicURL == url && this.musicChannel) {
            }
            this.m_strMusicURL = url;
            Laya.SoundManager.stopMusic();
            this.musicChannel = Laya.SoundManager.playMusic(url, 0, new Laya.Handler(this, this.onComplete));
        }
        playMusicByName(name, pix = ".ogg") {
            if (!this.m_bPlayMusic) {
                return;
            }
            let url = GameResourceManager.instance.getSoundURL(name, pix);
            this.playMusicByURL(url);
        }
        playSound(url, loops = 1) {
            if (!this.m_bPlayeSound) {
                return;
            }
            Laya.SoundManager.playSound(url, loops, new Laya.Handler(this, this.onComplete));
        }
        playSoundByName(name, loops = 1) {
            let url = GameResourceManager.instance.getSoundURLogg(name);
            this.playSound(url, loops);
        }
        stopSoundByName(name) {
            let url = GameResourceManager.instance.getSoundURLogg(name);
            Laya.SoundManager.stopSound(url);
        }
        onComplete() {
        }
    }
    SoundMgr.soundName_bg = "bgm";
    SoundMgr.soundName1 = "ui01.ogg";
    SoundMgr.soundName2 = "ui02.ogg";
    SoundMgr.soundName3 = "ui03.ogg";
    SoundMgr.soundName4 = "ui04.ogg";
    SoundMgr.soundName5 = "ui05.ogg";
    SoundMgr.soundName6 = "ui06.ogg";
    SoundMgr.soundName7 = "ui07.ogg";
    SoundMgr.soundName8 = "ui08.ogg";
    SoundMgr.soundName9 = "ui09.ogg";
    SoundMgr.soundName10 = "ui10.ogg";
    SoundMgr.soundName11 = "ui11.ogg";
    SoundMgr.soundName12 = "ui12.ogg";
    SoundMgr.soundName13 = "ui13.ogg";
    SoundMgr.soundName14 = "ui14.ogg";
    SoundMgr.soundName15 = "ui15.ogg";
    SoundMgr.soundName16 = "ui16.ogg";
    SoundMgr.soundName17 = "ui17.ogg";
    SoundMgr.soundName18 = "ui18.ogg";
    SoundMgr.soundName19 = "ui19.ogg";
    SoundMgr.soundName20 = "ui20.ogg";
    SoundMgr.soundName21 = "ui21.ogg";
    SoundMgr.soundName22 = "ui22.ogg";
    SoundMgr.soundName23 = "ui23.ogg";
    SoundMgr.soundName24 = "ui24.ogg";
    SoundMgr.soundName25 = "ui25.ogg";
    SoundMgr.soundName26 = "ui26.ogg";
    SoundMgr.soundName27 = "ui27.ogg";
    SoundMgr.soundName28 = "ui28.ogg";
    SoundMgr.soundName29 = "ui29.ogg";
    SoundMgr.soundName30_1 = "ui30_1.ogg";
    SoundMgr.soundName28_1_star = "ui28_1_star.ogg";
    SoundMgr.soundName28_2_star = "ui28_2_stars.ogg";
    SoundMgr.soundName28_3_star = "ui28_3_stars.ogg";
    SoundMgr.soundName28_bar = "ui28_bar_rise.ogg";
    SoundMgr.soundName32 = "ui32.ogg";
    SoundMgr.soundName33 = "ui33.ogg";
    SoundMgr.soundName34 = "ui34.ogg";
    SoundMgr.soundName35 = "ui35.ogg";
    SoundMgr.soundName36 = "ui36.ogg";
    SoundMgr.soundName37 = "ui37.ogg";
    SoundMgr.soundName38 = "ui38.ogg";
    SoundMgr.soundName39 = "ui39.ogg";
    SoundMgr.soundName41 = "ui41.ogg";
    SoundMgr.soundName42 = "ui42.ogg";
    SoundMgr.soundName43 = "ui43.ogg";
    SoundMgr.soundName44 = "ui44.ogg";
    SoundMgr.soundName45 = "ui45.ogg";
    SoundMgr.soundNameUi40_1 = "ui40_1.ogg";
    SoundMgr.soundNameUi40_2 = "ui40_2.ogg";
    SoundMgr.soundNameUi40_3 = "ui40_3.ogg";
    SoundMgr.soundNameDressing = "dressing_score_sfx.ogg";
    SoundMgr.soundNameAnswer = "answer_bonus_points.ogg";

    class SceneType {
    }
    SceneType.M_SCENE_MAIN = "M_SCENE_MAIN";
    SceneType.M_SCENE_FIND = "M_SCENE_FIND";
    SceneType.M_SCENE_HOME = "M_SCENE_HOME";
    SceneType.M_SCENE_BEAUTY_SALON = "M_SCENE_BeautySalon";
    SceneType.M_SCENE_SUIT = "M_SCENE_SUIT";
    SceneType.M_SCENE_SUIT_SHOW = "M_SCENE_SUIT_SHOW";
    SceneType.M_SCENE_MATCHSHOW = "M_SCENE_MATCHSHOW";
    SceneType.M_SCENE_SHOP_EXCHANGE = "M_SCENE_SHOP_EXCHANGE";
    SceneType.M_SCENE_PRE_LOAD = "M_SCENE_PRE_LOAD";
    SceneType.M_SCENE_TRAVEL = "M_SCENE_TRAVEL";
    SceneType.M_SCENE_TVPLAY = "M_SCENE_TVPLAY";

    class FaceAttributeItem extends BaseItem {
        constructor() {
            super();
        }
        get lv_score() {
            return this._lv_score;
        }
        set lv_score(value) {
        }
    }

    class AchievementItem extends BaseItem {
    }

    class DetailruleItem extends BaseItem {
        get getTitle() {
            let str = GameLanguageMgr.instance.getLanguage(this.title);
            return str;
        }
        get getRules() {
            let str = GameLanguageMgr.instance.getLanguage(this.rules);
            return str;
        }
        get getBanner() {
            let str = GameLanguageMgr.instance.getLanguage(this.rules);
            return str;
        }
    }

    class FailureTipItem extends BaseItem {
        constructor() {
            super();
            this._wordsL = "";
        }
        get words() {
            if (this._wordsL == "") {
                this._wordsL = GameLanguageMgr.instance.getLanguage(this._words);
            }
            return this._wordsL;
        }
        set words(value) {
            this._words = value;
        }
    }

    class GeneralItem extends BaseItem {
        constructor() {
            super();
        }
    }

    class CatagoryClothtypeItem extends BaseItem {
    }

    class CatagoryStyleItem extends BaseItem {
        constructor() {
            super(...arguments);
            this.sort = 0;
        }
    }

    class BaseSheetDataModel {
        constructor(jsonName, idKeyName, sheetItemCls) {
            this._idKeyName = "";
            this._jsonName = "";
            this._sheetItemCls = null;
            this._isParse = false;
            this._idKeyName = idKeyName;
            this._jsonName = jsonName;
            this._sheetItemCls = sheetItemCls;
            this._idToValueMap = new Dictionary();
            this._items = [];
        }
        parseJson() {
            if (this._isParse) {
                return;
            }
            let json = GameResourceManager.instance.getResByURL("config/" + this._jsonName + ".json");
            if (!json) {
                throw new Error("无效的配置数据" + this._jsonName);
            }
            for (let obj of json) {
                let item = new this._sheetItemCls();
                item.beFill(obj);
                this._idToValueMap.set(obj[this._idKeyName], item);
                this._items.push(item);
                this.addItemProcess(item);
            }
            this._isParse = true;
        }
        addItemProcess(item) {
        }
        getItemById(id) {
            if (this.excuteIsParse()) {
                if (this._idToValueMap.get(id)) {
                    return this._idToValueMap.get(id);
                }
                else {
                    return null;
                }
            }
            else {
                return null;
            }
        }
        getAllItems() {
            if (this.excuteIsParse()) {
                return this._items;
            }
            else {
                return null;
            }
        }
        excuteIsParse() {
            if (!this._isParse) {
            }
            return this._isParse;
        }
    }

    class ItemSheetDataModel extends BaseSheetDataModel {
        constructor() {
            super("", "", "");
            this._itemsTypeMap = null;
            this._itemsTypeMap = new Dictionary();
        }
        getCombineKey(key1, key2, splitKey) {
            return key1 + splitKey.toString() + key2;
        }
        getItemsByChildType(childType, itemType) {
            let combineKey = this.getCombineKey(childType, itemType, "childType_itemType");
            if (this._itemsTypeMap.get(combineKey)) {
                return this._itemsTypeMap.get(combineKey);
            }
            this._itemsTypeMap.set(combineKey, []);
            let items = SheetDataManager.intance.m_dicItems.values;
            for (let item of items) {
                if (item.child_type == childType && item.itm_type == itemType) {
                    this._itemsTypeMap.get(combineKey).push(item);
                }
            }
            return this._itemsTypeMap.get(combineKey);
        }
    }

    class EnumeCatagoryChildType {
        static getIsPetType(childType) {
            return ((((((childType.toString() == EnumeCatagoryChildType.PET.toString() || childType.toString() == EnumeCatagoryChildType.PET_FOOD.toString()) || childType.toString() == EnumeCatagoryChildType.PET_THIRSTY.toString()) || childType.toString() == EnumeCatagoryChildType.PET_PLAY.toString()) || childType.toString() == EnumeCatagoryChildType.PET_Bracelet.toString()) || childType.toString() == "39") || childType.toString() == "40") || childType.toString() == EnumeCatagoryChildType.PET_NECKLACE.toString();
        }
        static getPetClothsChild() {
            return [EnumeCatagoryChildType.PET_Bracelet, EnumeCatagoryChildType.PET_NECKLACE];
        }
        static getVipOpenKeyName(childType) {
            let keyName = "";
            if (childType.toString() == EnumeCatagoryChildType.EYE_ZHU.toString()) {
                keyName = "unlock_contact";
            }
            else if (childType.toString() == EnumeCatagoryChildType.FACE_TYPE.toString()) {
                keyName = "unlock_faceshape";
            }
            else if (childType.toString() == EnumeCatagoryChildType.Eyebrow.toString()) {
                keyName = "unlock_brows";
            }
            else if (childType.toString() == EnumeCatagoryChildType.Eye.toString()) {
                keyName = "unlock_eyes";
            }
            else if (childType.toString() == EnumeCatagoryChildType.Nose.toString()) {
                keyName = "unlock_nose";
            }
            else if (childType.toString() == EnumeCatagoryChildType.Mouse.toString()) {
                keyName = "unlock_mouth";
            }
            return keyName;
        }
    }
    EnumeCatagoryChildType.Eye = 18;
    EnumeCatagoryChildType.Nose = 19;
    EnumeCatagoryChildType.Mouse = 20;
    EnumeCatagoryChildType.Eyebrow = 21;
    EnumeCatagoryChildType.SkinColor = 26;
    EnumeCatagoryChildType.Hair = 23;
    EnumeCatagoryChildType.FACE_TYPE = 22;
    EnumeCatagoryChildType.EYE_ZHU = 27;
    EnumeCatagoryChildType.MODEL = 28;
    EnumeCatagoryChildType.SCENE_STORE_BG = 29;
    EnumeCatagoryChildType.SCENE_HOME_BG = 32;
    EnumeCatagoryChildType.PET = 33;
    EnumeCatagoryChildType.PET_FOOD = 34;
    EnumeCatagoryChildType.PET_THIRSTY = 35;
    EnumeCatagoryChildType.PET_PLAY = 36;
    EnumeCatagoryChildType.PET_Bracelet = 37;
    EnumeCatagoryChildType.PET_NECKLACE = 38;
    EnumeCatagoryChildType.FRAGRANCE = 204;
    EnumeCatagoryChildType.COMBINE_SCORE = 99;
    EnumeCatagoryChildType.MATERIAL = 101;
    EnumeCatagoryChildType.STAR_FACE = 9;

    class EnumItemType {
        constructor() {
        }
    }
    EnumItemType.Item_Type_Cloths = 1;
    EnumItemType.Item_Type_Items = 2;
    EnumItemType.Item_Type_Materials = 3;
    EnumItemType.Item_Type_Designs = 4;
    EnumItemType.Item_Type_FacialFeatures = 5;
    EnumItemType.Item_Type_Fragment = 6;
    EnumItemType.Item_Type_ModelOwner = 7;

    class ItemsStItem extends BaseItem {
        constructor() {
            super(...arguments);
            this.makeover_display = 0;
            this.m_arrFace = [];
        }
        get item_img() {
            return this._item_img;
        }
        set item_img(value) {
            this._item_img = value;
        }
        get noInBea() {
            return this.makeover_display.toString() == "1";
        }
        get m_iSex() {
            return parseInt(this.model_clothes + "");
        }
        init(obj) {
            super.init(obj);
            if (this.child_type == 28) {
                let npcface = GlobalDataManager.instance.npcModel.npcFaceVo(this.itemID);
                if (npcface) {
                    this.m_arrFace = npcface.combine;
                }
                else {
                    if (GameSetting.IsCheckItem) {
                        console.log("item表中的模特itemId:" + this.itemID + " 在npc_face.json中没有找到");
                    }
                }
            }
        }
        isUseDestination() {
            return this.destination.length > 1 || this.destination.length == 1 && this.destination[0] != "";
        }
        getDestinationArgs() {
            if (this.destination.length > 1) {
                return this.destination.slice(1);
            }
            else {
                return [];
            }
        }
        getDestinationFunId() {
            if (this.destination.length >= 1 && this.destination[0] != "") {
                return this.destination[0];
            }
            else {
                return 0;
            }
        }
        get clothStyleDes() {
            this._clothStyleDes = [];
            for (let j = 0; j < this.cloth_style.length; j++) {
                let styleItem = SheetDataManager.intance.m_dicStyle.get(this.cloth_style[j]);
                if (styleItem) {
                    this._clothStyleDes.push(GameLanguageMgr.instance.getLanguage(styleItem.style));
                }
            }
            return this._clothStyleDes;
        }
        get needShowStar() {
            return this.child_type.toString() == EnumeCatagoryChildType.Hair.toString() || this.child_type.toString() == EnumeCatagoryChildType.MODEL.toString();
        }
        get isFragment() {
            return this.itm_type.toString() == EnumItemType.Item_Type_Fragment.toString();
        }
        get isHair() {
            return this.child_type.toString() == EnumeCatagoryChildType.Hair.toString();
        }
        get isNpc() {
            return this.child_type.toString() == EnumeCatagoryChildType.MODEL.toString();
        }
        compareName() {
            return GameLanguageMgr.instance.getConfigLan(this.item_name);
        }
        compareQuality() {
            return parseFloat(this.item_quality + "");
        }
        compareSellPrice() {
            return parseFloat(this.sell_price[1] + "");
        }
        compareNum() {
            return 0;
        }
        compareLevel() {
            return 0;
        }
        compareType() {
            return parseInt(this.paren_type.toString());
        }
        compareFragment() {
            return 0;
        }
        compareTypeId() {
            return parseInt(this.itemID + "");
        }
        get starArr() {
            if (this._starArr) {
                return this._starArr;
            }
            this._starArr = [];
            if (this.max_quality == 0) {
                return this._starArr;
            }
            let rate = this.item_quality / this.max_quality * 5;
            for (let k = 1; k <= 5; k++) {
                if (rate >= k) {
                    this._starArr.push(0);
                }
                else if (k - rate <= .5) {
                    this._starArr.push(2);
                }
                else {
                    this._starArr.push(1);
                }
            }
            return this._starArr;
        }
    }

    class SheetDictionary {
        constructor(data, BaseItemClass) {
            this._valuesObject = {};
            this.sheetObject = data;
            this.BaseItemClass = BaseItemClass;
        }
        get keys() {
            if (this._keys) {
                return this._keys;
            }
            this._keys = [];
            let item;
            for (let key in this.sheetObject) {
                if (!key || key == "") {
                    continue;
                }
                this._keys.push(key);
            }
            return this._keys;
        }
        get values() {
            if (this._values) {
                return this._values;
            }
            this._values = [];
            let item;
            for (let key in this.sheetObject) {
                if (this._valuesObject[key]) {
                    item = this._valuesObject[key];
                }
                else {
                    item = new this.BaseItemClass();
                    item.init(this.sheetObject[key]);
                    this._valuesObject[key] = item;
                }
                this._values.push(item);
            }
            return this._values;
        }
        get(key) {
            if (this._valuesObject[key]) {
                return this._valuesObject[key];
            }
            let data = this.sheetObject[key];
            if (!data) {
                return data;
            }
            let item;
            if (this.BaseItemClass) {
                item = new this.BaseItemClass();
                if (!item.hasOwnProperty("init")) {
                    console.log("ERROR :<没有继承BaseItem> SheetDataManager -->initConfig()" + "  class : " + this.BaseItemClass);
                }
                item.init(data);
            }
            this._valuesObject;
            let returnData = item ? item : data;
            this._valuesObject[key] = returnData;
            return returnData;
        }
        indexOf(key) {
            let index = this._keys.indexOf(key);
            if (index >= 0) {
                return index;
            }
            key = key instanceof String ? Number(key) : (key instanceof Number ? key.toString() : key);
            return this._keys.indexOf(key);
        }
        clear() {
            this.sheetObject = null;
        }
    }

    class BaseSheetItem {
        constructor() {
        }
        beFill(sourceObj) {
            for (let key in sourceObj) {
                if (this.hasOwnProperty(key)) {
                    let value = sourceObj[key];
                    if (value instanceof String) {
                        if (String(value).indexOf("[[") >= 0) {
                            value = JSON.parse(value);
                        }
                    }
                    this[key] = value;
                }
            }
        }
        converNumberStrArr(arr) {
            let result = [];
            for (let i = 0; i < arr.length; i++) {
                result.push(parseInt(arr[i]));
            }
            return result;
        }
    }

    class CatagoryChildTypeSheetItem extends BaseSheetItem {
        constructor() {
            super();
            this._childtypeL = "";
        }
        get icon() {
            return this._icon;
        }
        set icon(value) {
            this._icon = value;
        }
        get childtype() {
            if (this._childtypeL == "") {
                this._childtypeL = GameLanguageMgr.instance.getLanguage(this._childtype);
            }
            return this._childtypeL;
        }
        set childtype(value) {
            this._childtype = value;
        }
        get childtypeID() {
            return this._childtypeID;
        }
        set childtypeID(value) {
            this._childtypeID = value;
        }
        get if_use() {
            return this._if_use;
        }
        set if_use(value) {
            this._if_use = value;
        }
    }

    class CatagoryChildTypeSheetDataModel extends BaseSheetDataModel {
        constructor() {
            super("catagory_childtype", "childtypeID", CatagoryChildTypeSheetItem);
            this._beautySalonUpgradeItems = null;
            this._beautySalonSkinItems = null;
            this._beautySalonFeaturesItems = null;
            this._beautySlonHairItems = null;
        }
        getBeautySalonUpgradeItems() {
            if (this._beautySalonUpgradeItems) {
                return this._beautySalonUpgradeItems;
            }
            this._beautySalonUpgradeItems = [];
            this._beautySalonUpgradeItems.push(this.getItemById(EnumeCatagoryChildType.MODEL));
            this._beautySalonUpgradeItems = this._beautySalonUpgradeItems.concat(this.getHairTabItems());
            return this._beautySalonUpgradeItems;
        }
        getSkinTabItems() {
            if (this._beautySalonSkinItems) {
                return this._beautySalonSkinItems;
            }
            this._beautySalonSkinItems = [];
            this._beautySalonSkinItems.push(this.getItemById(EnumeCatagoryChildType.SkinColor));
            this._beautySalonSkinItems.push(this.getItemById(EnumeCatagoryChildType.FACE_TYPE));
            return this._beautySalonSkinItems;
        }
        getFeaturesTabItems() {
            if (this._beautySalonFeaturesItems) {
                return this._beautySalonFeaturesItems;
            }
            this._beautySalonFeaturesItems = [];
            this._beautySalonFeaturesItems.push(this.getItemById(EnumeCatagoryChildType.Eye));
            this._beautySalonFeaturesItems.push(this.getItemById(EnumeCatagoryChildType.Nose));
            this._beautySalonFeaturesItems.push(this.getItemById(EnumeCatagoryChildType.Mouse));
            this._beautySalonFeaturesItems.push(this.getItemById(EnumeCatagoryChildType.Eyebrow));
            this._beautySalonFeaturesItems.push(this.getItemById(EnumeCatagoryChildType.EYE_ZHU));
            return this._beautySalonFeaturesItems;
        }
        isSalonFeatureType(childType) {
            childType = parseInt(childType.toString());
            if ((((childType == EnumeCatagoryChildType.Eye || childType == EnumeCatagoryChildType.Nose) || childType == EnumeCatagoryChildType.Mouse) || childType == EnumeCatagoryChildType.Eyebrow) || childType == EnumeCatagoryChildType.EYE_ZHU) {
                return true;
            }
            else {
                return false;
            }
        }
        getHairTabItems() {
            if (this._beautySlonHairItems) {
                return this._beautySlonHairItems;
            }
            this._beautySlonHairItems = [];
            return this._beautySlonHairItems;
        }
    }

    class EnumConsumeType {
        static getTypeValue(type, value) {
            for (let info of value) {
                if (info[0] + "" == type + "") {
                    return parseInt(info[1]);
                }
            }
            return 0;
        }
        static isConsumeType(type) {
            type = parseInt(type.toString());
            return EnumConsumeType._types.indexOf(type) >= 0;
        }
    }
    EnumConsumeType.TYPE_GOLD = 1;
    EnumConsumeType.TYPE_DIAMOND = 2;
    EnumConsumeType.TYPE_PS = 3;
    EnumConsumeType.TYPE_ENDURANCE = 4;
    EnumConsumeType.TYPE_SHOP_EXP = 5;
    EnumConsumeType.TYPE_EXP = 6;
    EnumConsumeType.TYPE_STAMP = 7;
    EnumConsumeType.TYPE_Crystal_Shoes = 8;
    EnumConsumeType.TYPE_WISH_COIN = 9;
    EnumConsumeType.TYPE_Beauty_Box = 10;
    EnumConsumeType.TYPE_TASK_SHOP = 32;
    EnumConsumeType.TYPE_Item = 100;
    EnumConsumeType.TYPE_Guild = 11;
    EnumConsumeType.TYPE_GOLD_CRYSTAL = 12;
    EnumConsumeType.TYPE_Silver_finger = 13;
    EnumConsumeType.TYPE_Gold_finger = 14;
    EnumConsumeType.TYPE_CHOCO_LATE = 15;
    EnumConsumeType.TYPE_CHAMPAGNE = 16;
    EnumConsumeType.TYPE_LOVE = 17;
    EnumConsumeType.TYPE_imperial_crown = 18;
    EnumConsumeType.TYPE_SUPER_LOVE = 19;
    EnumConsumeType.TYPE_PK_COIN = 20;
    EnumConsumeType.TYPE_TIME_STAGE_COIN = 21;
    EnumConsumeType.TYPE_GOLD_SCISSORS = 22;
    EnumConsumeType.TYPE_SILVER_SCISSORS = 23;
    EnumConsumeType.TYPE_BRUSH = 24;
    EnumConsumeType.TYPE_REBORN = 25;
    EnumConsumeType.TYPE_TV = 26;
    EnumConsumeType.TYPE_TV_JP = 27;
    EnumConsumeType.TYPE_STOKEN = 28;
    EnumConsumeType.TYPE_SlotMachine = 29;
    EnumConsumeType.TYPE_LuckWheel = 30;
    EnumConsumeType.TYPE_Gashapon = 31;
    EnumConsumeType.TYPE_POKER = 10000;
    EnumConsumeType._types = [EnumConsumeType.TYPE_GOLD, EnumConsumeType.TYPE_DIAMOND, EnumConsumeType.TYPE_PS, EnumConsumeType.TYPE_ENDURANCE, EnumConsumeType.TYPE_SHOP_EXP, EnumConsumeType.TYPE_EXP, EnumConsumeType.TYPE_STAMP, EnumConsumeType.TYPE_Crystal_Shoes, EnumConsumeType.TYPE_WISH_COIN, EnumConsumeType.TYPE_Beauty_Box, EnumConsumeType.TYPE_Guild, EnumConsumeType.TYPE_GOLD_CRYSTAL, EnumConsumeType.TYPE_Silver_finger, EnumConsumeType.TYPE_Gold_finger, EnumConsumeType.TYPE_CHOCO_LATE, EnumConsumeType.TYPE_CHAMPAGNE, EnumConsumeType.TYPE_LOVE, EnumConsumeType.TYPE_imperial_crown, EnumConsumeType.TYPE_SUPER_LOVE, EnumConsumeType.TYPE_PK_COIN, EnumConsumeType.TYPE_TIME_STAGE_COIN, EnumConsumeType.TYPE_STOKEN, EnumConsumeType.TYPE_GOLD_SCISSORS, EnumConsumeType.TYPE_SILVER_SCISSORS, EnumConsumeType.TYPE_POKER, EnumConsumeType.TYPE_TV, EnumConsumeType.TYPE_SlotMachine, EnumConsumeType.TYPE_LuckWheel, EnumConsumeType.TYPE_Gashapon];

    class RoleLvItem extends BaseItem {
        constructor() {
            super();
        }
        getConsumeRewardValue(type) {
            if (type == EnumConsumeType.TYPE_ENDURANCE) {
                return parseInt(this.milegrow + "");
            }
            else if (type == EnumConsumeType.TYPE_PS) {
                return parseInt(this.taminagrow + "");
            }
            else {
                return 0;
            }
        }
    }

    class RuleItem extends BaseItem {
        constructor() {
            super();
            this.drop_item = [];
            this.THIS_ID = "ID";
            this.ITEM_DROPS = ["drop_item"];
        }
    }

    class SceneItem extends BaseItem {
        constructor() {
            super();
        }
    }

    class ChapterItem extends BaseItem {
        constructor() {
            super();
        }
        get wide() {
            return !GameSetting.usePcUI ? this._wide : 1700;
        }
        get high() {
            return !GameSetting.usePcUI ? this._high : 900;
        }
        set wide(value) {
            this._wide = value;
        }
        set high(value) {
            this._high = value;
        }
        get ifOpen() {
            return this.if_open.toString() == "1";
        }
    }

    class WorldMapItem extends BaseItem {
    }

    class WorldMapStarItem extends BaseItem {
        constructor() {
            super();
        }
    }

    class FbShareVo extends BaseItem {
    }

    class InstantGameEvnetVo extends BaseItem {
    }

    class SocialShareItem extends BaseItem {
    }

    class WhiteListItem extends BaseItem {
        constructor() {
            super();
        }
    }

    class ClothesScoreItem extends BaseItem {
        constructor() {
            super();
        }
    }

    class SheetDataManager {
        constructor() {
            if (SheetDataManager._instance) {
                throw new Error("SheetDataManager是单例,不可new.");
            }
            SheetDataManager._instance = this;
            this._modelList = new Dictionary();
        }
        get m_fragrances() {
            if (this._m_fragrances) {
                return this._m_fragrances;
            }
            this._m_fragrances = [];
            for (let item of this.m_dicItems.values) {
                if (item && item.child_type + "" == EnumeCatagoryChildType.FRAGRANCE + "") {
                    this._m_fragrances.push(item);
                }
            }
            return this._m_fragrances;
        }
        set m_fragrances(value) {
            this._m_fragrances = value;
        }
        static get intance() {
            if (SheetDataManager._instance) {
                return SheetDataManager._instance;
            }
            SheetDataManager._instance = new SheetDataManager();
            return SheetDataManager._instance;
        }
        init() {
            let startTime = Laya.Browser.now();
            GlobalDataManager.instance.systemOpenModel.parseJson();
            this.m_dicParentType = this.initConfig("catagory_clothtype", ["parenttypeID"], CatagoryClothtypeItem);
            this.m_dicStyle = this.initConfig("catagory_style", ["styleID"], CatagoryStyleItem);
            this.m_dicFace_attribute = this.initConfig("face_atrribute", ["type", "quality"], FaceAttributeItem);
            this.m_dicItems = this.initConfigObject("items", ItemsStItem);
            console.log("-----------------------sheetdata-time1:" + (Laya.Browser.now() - startTime));
            this.m_dicRule = this.initConfig("rule", ["ID"], RuleItem);
            this.m_dicWorldMap = this.initConfig("world_map", ["levelID"], WorldMapItem);
            this.m_dicCharpter = this.initConfig("chapter", ["ID", "types"], ChapterItem);
            this.m_dicWorldMapStar = this.initConfig("world_map_star_reward", ["chapter", "difficulty"], WorldMapStarItem);
            this.m_dicGenerate = this.initConfig("general", ["id"], GeneralItem);
            this.m_dicFailureTip = this.initConfig("failure_tip", ["ID"], FailureTipItem);
            this.m_dicWorldMapChildTypeItem = new Dictionary();
            this.m_dicAchievement = this.initConfig("achievement", ["id"], AchievementItem);
            this.m_dicRoleLv = this.initConfig("role_level", ["rolelevel"], RoleLvItem);
            this.m_dicClothesScore = this.initConfig("clothes_score", ["quality"], ClothesScoreItem);
            this.m_dicInstantGame = this.initConfig("instantgame_event", ["ID"], InstantGameEvnetVo);
            this.m_dicFacebookShare = this.initConfig("fb_share", ["id"], FbShareVo);
            this.m_dicSocialShare = this.initConfig("social_share", ["id"], SocialShareItem);
            this.m_dicWhiteList = this.initConfig("whitelist", ["id"], WhiteListItem);
            console.log("-----------------------sheetdata-time2:" + (Laya.Browser.now() - startTime));
        }
        itemsCallBack(item) {
            if (item && item.child_type + "" == EnumeCatagoryChildType.FRAGRANCE + "") {
                if (!this.m_fragrances) {
                    this.m_fragrances = [];
                }
                this.m_fragrances.push(item);
            }
        }
        preInit() {
            this.m_dicScene = this.initConfig("scene", ["name"], SceneItem);
            this.m_dicDetailrull = this.initConfig("detailrull", ["id"], DetailruleItem);
            this.m_dicSkin = this.initConfig("skin", ["id"]);
        }
        getItemModel() {
            return this.getDataModel(SheetDataManager.DataType_Items);
        }
        getGeneralValueById(id) {
            if (this.m_dicGenerate && this.m_dicGenerate.get(id)) {
                return this.m_dicGenerate.get(id).value;
            }
            return 0;
        }
        getSocialShareValueById(id) {
            if (this.m_dicSocialShare && this.m_dicSocialShare.get(id)) {
                return this.m_dicSocialShare.get(id).parameter;
            }
            return 0;
        }
        getDataModel(dataType) {
            if (!this._modelList.get(dataType)) {
                switch (dataType) {
                    case SheetDataManager.DataType_Items:
                        {
                            this._modelList.set(dataType, new ItemSheetDataModel());
                        }
                        break;
                    case SheetDataManager.DataType_CatagoryChildType:
                        {
                            this._modelList.set(dataType, new CatagoryChildTypeSheetDataModel());
                        }
                        break;
                }
            }
            return this._modelList.get(dataType);
        }
        static getArrFromDictionary(dic, key, value) {
            let arr = [];
            for (let i = 0; i < dic.values.length; i++) {
                if (dic.values[i][key] + "" == value + "") {
                    arr.push(dic.values[i]);
                }
            }
            return arr;
        }
        getArrFromDicItemByKey(key, value) {
            let arr = [];
            for (let i = 0; i < this.m_dicItems.values.length; i++) {
                if (this.m_dicItems.values[i][key] + "" == value + "") {
                    arr.push(this.m_dicItems.values[i]);
                }
            }
            return arr;
        }
        initConfigObject(name, BaseItemClass = null, callBack = null) {
            let url = "config/" + name + ".json";
            let data = GameResourceManager.instance.getResByURL(url);
            let dic = new SheetDictionary(data, BaseItemClass);
            return dic;
        }
        initConfig(name, keyArr, BaseItemClass = null, clearJson = false, callBack = null) {
            let url = "config/" + name + ".json";
            let data = GameResourceManager.instance.getResByURL(url);
            let dic = new Dictionary();
            if (!data) {
                console.log("ERROR : SheetDataManager -->initConfig()" + "  url:" + url);
                return dic;
            }
            let item;
            for (let i = 0; i < data.length; i++) {
                let key = this.compoundKey(data[i], keyArr);
                if (BaseItemClass) {
                    item = new BaseItemClass();
                    if (!item.hasOwnProperty("init")) {
                        console.log("ERROR :<没有继承BaseItem> SheetDataManager -->initConfig()" + "  url:" + url);
                    }
                    item.init(data[i]);
                    dic.set(key, item);
                    if (callBack) {
                        callBack.runWith(item);
                    }
                }
                else {
                    dic.set(key, data[i]);
                    if (callBack) {
                        callBack.runWith(data[i]);
                    }
                }
            }
            if (clearJson) {
                let targetURL = GameResourceManager.instance.setResURL(url);
                Laya.Loader.clearRes(targetURL);
            }
            return dic;
        }
        compoundKey(itemData, keyArr) {
            let key = "";
            let len = keyArr.length;
            for (let j = 0; j < len; j++) {
                key += itemData[keyArr[j]];
                if (j != len - 1) {
                    key += "_";
                }
            }
            return key;
        }
        getCompoundKey(valueArr) {
            let key = "";
            let len = valueArr.length;
            for (let j = 0; j < len; j++) {
                key += valueArr[j];
                if (j != len - 1) {
                    key += "_";
                }
            }
            return key;
        }
        initConfig2(name, key1, BaseItemClass, clearJson = true) {
            let url = "config/" + name + ".json";
            let data = GameResourceManager.instance.getResByURL(url);
            let dic = new Dictionary();
            if (!data) {
                console.log("ERROR : SheetDataManager -->initConfig2()" + "  url:" + url);
                return dic;
            }
            let item;
            for (let i = 0; i < data.length; i++) {
                let key = data[i][key1];
                let dataArr;
                if (dic.get(key) == null) {
                    dataArr = [];
                    dic.set(key, dataArr);
                }
                else {
                    dataArr = dic.get(key);
                }
                item = new BaseItemClass();
                if (!item.hasOwnProperty("init")) {
                    console.log("ERROR :<没有继承BaseItem> SheetDataManager -->initConfig2()" + "  url:" + url);
                }
                item.init(data[i]);
                dataArr.push(item);
            }
            if (clearJson && name != "items") {
                let targetURL = GameResourceManager.instance.setResURLByRoot(url);
                Laya.Loader.clearRes(targetURL);
            }
            return dic;
        }
        getItemsBy(itemType, childType) {
            let petSheets = this.getArrFromDicItemByKey("itm_type", itemType);
            let result = [];
            for (let itemS of petSheets) {
                if (itemS.child_type.toString() == childType.toString()) {
                    result.push(itemS);
                }
            }
            return result;
        }
        getSheetDataByMultiKey(m_dic, multiKeyValue) {
            let key = this.getCompoundKey(multiKeyValue);
            return m_dic.get(key);
        }
    }
    SheetDataManager.DataType_Items = "SheetDataManager:items";
    SheetDataManager.DataType_CatagoryChildType = "SheetDataManager:CatagoryChildType";
    SheetDataManager.DataType_BeautyPiece = "SheetDataManager:beautypiece";
    SheetDataManager.DataType_BeautyExp = "SheetDataManager:beautyexp";
    SheetDataManager.DataType_ClothStyleScore = "SheetDataManager:clothStyleScore";

    class ModuleName {
    }
    ModuleName.FindView = "FindView";
    ModuleName.FindEndView = "FindEndView";
    ModuleName.FindAskDialog = "FindAskDialog";
    ModuleName.FindRankUpDialog = "FindRankUpDialog";
    ModuleName.QuickTipDialog = "QuickTipDialog";
    ModuleName.QuickEndView = "QuickEndView";
    ModuleName.QuickShareView = "QuickShareView";
    ModuleName.QuickOperatorDialog = "QuickOperatorDialog";
    ModuleName.MyHomeRightViewController = "MyHomeRightViewController";
    ModuleName.MyHomeNewLeftViewController = "MyHomeNewLeftViewController";
    ModuleName.MyHomeShareDialog = "MyHomeShareDialog";
    ModuleName.MyHomeLeftViewController = "MyHomeLeftViewController";
    ModuleName.MyHomeButtomViewController = "MyHomeButtomViewController";
    ModuleName.MyHomeTravelViewController = "MyHomeTravelViewController";
    ModuleName.MainView = "MainView";
    ModuleName.RoleDialog = "RoleDialog";
    ModuleName.TVStartView = "TVStartView";
    ModuleName.QuickRechargeDialog = "QuickRechargeDialog";
    ModuleName.CreateNameDialog = "CreateNameDialog";
    ModuleName.SuitMainView = "SuitMainView";
    ModuleName.SuitShowMainView = "SuitShowMainView";
    ModuleName.DailyTaskDialog = "DailyTaskDialog";
    ModuleName.ActivityTaskDialog = "ActivityTaskDialog";
    ModuleName.ShareDialog = "ShareDialog";
    ModuleName.InvitationCenterDialog = "InvitationCenterDialog";
    ModuleName.DailyTaskDrawDialog = "DailyTaskDrawDialog";
    ModuleName.GuideView = "GuideView";
    ModuleName.GuideDialogView = "GuideDialogView";
    ModuleName.ShareView = "ShareView";
    ModuleName.MainTopView = "MainTopView";
    ModuleName.GetMoreDialog = "GetMoreDialog";
    ModuleName.ShopView = "ShopView";
    ModuleName.BuyCustomDialog = "BuyCustomDialog";
    ModuleName.FittingStartView = "FittingStartView";
    ModuleName.CustomerInfoDialog = "CustomerInfoDialog";
    ModuleName.GetItemDialog = "GetItemDialog";
    ModuleName.GetTitleDialog = "GetTitleDialog";
    ModuleName.CustomerLevelUpDialog = "CustomerLevelUpDialog";
    ModuleName.CustomerLevelRewardDialog = "CustomerLevelRewardDialog";
    ModuleName.ShopInfoDialog = "ShopInfoDialog";
    ModuleName.CustomerSimpleView = "CustomerSimpleView";
    ModuleName.StoreResultView = "StoreResultView";
    ModuleName.TravelMainView = "TravelMainView";
    ModuleName.TravelCharpterDialog = "TravelCharpterDialog";
    ModuleName.TravelInfoDialog = "TravelInfoDialog";
    ModuleName.TravelStarRewardDialog = "TravelStarRewardDialog";
    ModuleName.NewFunUnLockDialog = "NewFunUnLockDialog";
    ModuleName.TravelBuyChallengeDialog = "TravelBuyChallengeDialog";
    ModuleName.TravelTipDialog = "TravelTipDialog";
    ModuleName.DialogView = "DialogView";
    ModuleName.MallView = "MallView";
    ModuleName.MallCardView = "MallCardView";
    ModuleName.MallBuyDialog = "MallBuyDialog";
    ModuleName.FittingUiView = "FittingUiView";
    ModuleName.TaskDialog = "TaskDialog";
    ModuleName.CommentDialog = "CommentDialog";
    ModuleName.PotraitChangDialog = "PotraitChangDialog";
    ModuleName.ClothespressView = "ClothespressView";
    ModuleName.ItemSellDialog = "ItemSellDialog";
    ModuleName.ItemInfoDialog = "ItemInfoDialog";
    ModuleName.ItemGetDialog = "ItemGetDialog";
    ModuleName.ShopExchangeView = "ShopExchangeView";
    ModuleName.ShopExchangeEntranceDialog = "ShopExchangeEntranceDialog";
    ModuleName.AchievementDialog = "AchievementDialog";
    ModuleName.AchievementRewardDialog = "AchievementRewardDialog";
    ModuleName.OnlineAward = "OnlineAward";
    ModuleName.MaillView = "MailView";
    ModuleName.MailSendView = "MailSendView";
    ModuleName.TaylorSwifLostDialog = "TaylorSwifLostDialog";
    ModuleName.TaylorSwifMatchView = "TaylorSwifMatchView";
    ModuleName.TaylorSwifMatchShowView = "TaylorSwifMatchShowView";
    ModuleName.MatchStarView = "MatchStarView";
    ModuleName.TaylorSwifLeftView = "TaylorSwifLeftView";
    ModuleName.MatchWinView = "MatchWinView";
    ModuleName.MatchRecordDialog = "MatchRecordDialog";
    ModuleName.MatchRewardDialog = "MatchRewardDialog";
    ModuleName.TaylorSwifGradeAwardsDialog = "TaylorSwifGradeAwardsDialog";
    ModuleName.SelectSearchDialog = "SelectSearchDialog";
    ModuleName.MatchShowView = "MatchShowView";
    ModuleName.MailReceiveView1 = "MailReceiveView1";
    ModuleName.MailReceiveView2 = "MailReceiveView2";
    ModuleName.RankingView = "RankingView";
    ModuleName.BargainShopView = "BargainShopView";
    ModuleName.ActivityCenterDialog = "ActivityCenterDialog";
    ModuleName.ActivityDailyFixDialog = "ActivityDailyFixDialog";
    ModuleName.ActivityCheckinDialog = "ActivityCheckinDialog";
    ModuleName.ActivitySalesBonusDialog = "ActivitySalesBonusDialog";
    ModuleName.ActiveCheckInDialog = "ActiveCheckInDialog";
    ModuleName.GameSettingDialog = "GameSettingDialog";
    ModuleName.GamesettingSoundView = "GamesettingSoundView";
    ModuleName.GameSettingLanguageDialog = "GameSettingLanguageDialog";
    ModuleName.GameSettingVersionDialog = "GameSettingVersionDialog";
    ModuleName.FriendMainView = "FriendMainView";
    ModuleName.FriendSearchView = "FriendSearchView";
    ModuleName.FriendGetRewardDialog = "FriendGetRewardDialog";
    ModuleName.FriendRewardDialog = "FriendRewardDialog";
    ModuleName.FriendAddDialog = "FriendAddDialog";
    ModuleName.PreLoadingView = "PreLoadingView";
    ModuleName.HelpDialog = "HelpDialog";
    ModuleName.RechargeDialog = "RechargeDialog";
    ModuleName.FirstRechargeDialog = "FirstRechargeDialog";
    ModuleName.FirstWeekRechargeView = "FirstWeekRechargeView";
    ModuleName.ClientErrView = "ClientErrView";
    ModuleName.RoleUpgradeView = "RoleUpgradeView";
    ModuleName.ActiveRechargeView = "ActiveRechargeView";
    ModuleName.SmallSaleView = "SmallSaleView";
    ModuleName.RechargeSelectDialog = "RechargeSelectDialog";
    ModuleName.PartyMainView = "PartyMainView";
    ModuleName.PartyStartDialog = "PartyStartDialog";
    ModuleName.PartyApplyDialog = "PartyApplyDialog";
    ModuleName.PartyRecordDialog = "PartyRecordDialog";
    ModuleName.PartyInviteView = "PartyInviteView";
    ModuleName.FBLikeView = "FBLikeView";
    ModuleName.TurnSuitPreView = "TurnSuitPreView";
    ModuleName.SlotMachineView = "SlotMachineView";
    ModuleName.SlotMachineRewardPreDialog = "SlotMachineRewardPreDialog";
    ModuleName.SlotMachineResultDialog = "SlotMachineResultDialog";
    ModuleName.GashaponView = "GashaponView";
    ModuleName.GashaponRewardView = "GashaponRewardView";
    ModuleName.ActivityRankRewardView = "ActivityRankRewardView";
    ModuleName.AddRechargeView = "AddRechargeView";
    ModuleName.PVPMainView = "PVPMainView";
    ModuleName.PVPSearchView = "PVPSearchView";
    ModuleName.PvpVSView = "PvpVSView";
    ModuleName.PVPMatchLeftView = "PVPMatchLeftView";
    ModuleName.PvpMatchRecordView = "PvpMatchRecordView";
    ModuleName.PvpContinueWinRecordView = "PvpContinueWinRecordView";
    ModuleName.PvpScoreRewardDialog = "PvpScoreRewardDialog";
    ModuleName.PvpRankRewardDialog = "PvpRankRewardDialog";
    ModuleName.PvpGetBoxRewardView = "PvpGetBoxRewardView";
    ModuleName.PvpBuyTimesDialog = "PvpBuyTimesDialog";
    ModuleName.PvpResultView = "PvpResultView";
    ModuleName.PvpWinView = "PvpWinView";
    ModuleName.PvpLoseView = "PvpLoseView";
    ModuleName.TVShopingDialog = "TVShopingDialog";
    ModuleName.SuitPreViewDialog = "SuitPreViewDialog";
    ModuleName.TVPlayView = "TVPlayView";
    ModuleName.TVPlayEndDialog = "TVPlayEndDialog";
    ModuleName.TVPlayLeftView = "TVPlayLeftView";
    ModuleName.TVPlayEndView = "TVPlayEndView";
    ModuleName.TVPlaySkillEndView = "TVPlaySkillEndView";
    ModuleName.TVChangeTipDialog = "TVChangeTipDialog";
    ModuleName.TVRankDialog = "TVRankDialog";
    ModuleName.TVChangeHeadDialog = "TVChangeHeadDialog";
    ModuleName.TVSelectDialog = "TVSelectDialog";
    ModuleName.CupMatchStartDialog = "CupMatchStartDialog";
    ModuleName.CupMatchEndDialog = "CupMatchEndDialog";

    class BaseView extends Laya.Box {
        constructor() {
            super();
            this.m_iLayerType = LayerManager.M_PANEL;
            this.m_iPositionType = LayerManager.CENTER;
            this.m_canTouch_all = false;
            this.m_ioffsetX = 0;
            this.m_ioffsetY = 0;
            this.m_arrMapEvent = [];
            this.m_iAdaptation_Top = 0;
            this.m_iAdaptation_Buttom = 0;
            this.m_bAutoResizeWidth = false;
            this.m_bAutoResizeHeith = false;
            this.m_bAutoResize = false;
            this.hideLoadingBySelf = false;
        }
        get loadPaths() {
            return this._loadPaths;
        }
        onStageResize() {
            if ((this.m_canTouch_all && this._view) && !GameSetting.usePcUI) {
                this._view.size(LayerManager.instence.stageWidth, LayerManager.instence.stageHeight);
            }
            if ((this.m_bAutoResizeWidth || this.m_bAutoResize) && this._view) {
                this._view.width = Laya.stage.width;
            }
            if ((this.m_bAutoResizeHeith || this.m_bAutoResize) && this._view) {
                this._view.height = Laya.stage.height;
            }
            LayerManager.instence.setPosition(this, this.m_iPositionType, this.m_ioffsetX, this.m_ioffsetY);
        }
        setIphoneX() {
            if (GameSetting.m_bIsIphoneX && this._view) {
                let len = this._view.numChildren;
                let childs = [];
                if (len) {
                    for (let i = 0, n = len; i < n; i++) {
                        let node = this._view.getChildAt(i);
                        if (node.name === "ui_top") {
                            if (!isNaN(node.top)) {
                                node.top += this.m_iAdaptation_Top;
                            }
                            else {
                                node.y += this.m_iAdaptation_Top;
                            }
                        }
                        else if (node.name == "ui_bottom") {
                            node.bottom += this.m_iAdaptation_Buttom;
                        }
                    }
                }
            }
        }
        preinitialize() {
            Laya.stage.on(Laya.Event.RESIZE, this, this.onStageResize);
            super.preinitialize();
            this.init();
        }
        init() {
        }
        createChildren() {
            super.createChildren();
            if (GameSetting.m_bIsIphoneX) {
                this.m_iAdaptation_Top = GameSetting.IPHONEX_TOP;
                this.m_iAdaptation_Buttom = GameSetting.IPHONEX_BUTTOM;
            }
            if (this.loadPaths && this.loadPaths.length) {
                this.hideLoadingBySelf = true;
                Laya.loader.load(this.loadPaths, Laya.Handler.create(this, this.loadPathsComplete));
            }
            else {
                this.createUI();
                this.createUIEnd();
            }
        }
        loadPathsComplete() {
            this.createUI();
            this.createUIEnd();
            this.onStageResize();
            LoadingManager.instance.hideLoading();
        }
        createUI() {
        }
        createUIEnd() {
            this.setIphoneX();
            this._addEvent();
            this.initData();
            this.onLoaded();
        }
        _addEvent() {
            if (this.btn_com_help) {
                this.btn_com_help.on(Laya.Event.CLICK, this, this.onHelp);
            }
            this.addEvent();
        }
        addEvent() {
        }
        initData() {
        }
        onLoaded() {
        }
        removeEvent() {
        }
        backToPreScene() {
            let preSceneData = SceneManager.intance.getPreSceneData();
            SceneManager.intance.setCurrentScene(preSceneData[0], preSceneData[1], preSceneData[2], preSceneData[3], false);
        }
        setToMainScene() {
            SceneManager.intance.setCurrentScene(SceneType.M_SCENE_MAIN, true, 1);
        }
        addMapEvent(target, type, caller, listener, args = null) {
            target.on(type, caller, listener, args);
            this.m_arrMapEvent.push(target);
        }
        removeAllMapEvent() {
            if (!this.m_arrMapEvent) {
                return;
            }
            for (let i = 0; i < this.m_arrMapEvent.length; i++) {
                this.m_arrMapEvent[i].offAll();
            }
            this.m_arrMapEvent.splice(0, this.m_arrMapEvent.length);
            this.m_arrMapEvent = null;
        }
        setAnchor(anchorX = 0.5, anchorY = 0.5) {
            this.anchorX = anchorX;
            this.anchorY = anchorY;
        }
        dispose() {
            if (this.newRoleSpr) {
                while (this.newRoleSpr.numChildren > 0) {
                    this.newRoleSpr.removeChildAt(0);
                }
                this.newRoleSpr = null;
            }
            console.log("<<< BaseView.dispose() className: " + this["constructor"].name + " ==== name: " + this.name + " ==== m_strName: " + this.m_strName);
            Laya.stage.off(Laya.Event.RESIZE, this, this.onStageResize);
            if (this.btn_com_help) {
                this.btn_com_help.off(Laya.Event.CLICK, this, this.onHelp);
            }
            this.removeEvent();
            this.removeAllMapEvent();
            ModuleManager.intance.removeViewFromModuleManger(this);
            this.m_arrMapEvent = null;
            if (this.m_strName && this.m_strName != "") {
            }
            else {
                this.m_strName = this["constructor"].name;
            }
            GameResourceManager.instance.clearModuleUrl(this.m_strName);
            this.m_strName = null;
            if (this._view) {
                Laya.timer.clearAll(this._view);
                Laya.Tween.clearAll(this._view);
                this._view.offAll();
                this._view.removeSelf();
                this._view.destroy(true);
                this._view = null;
            }
            Laya.timer.clearAll(this);
            Laya.Tween.clearAll(this);
            this.offAll();
            this.graphics.destroy();
            this.removeSelf();
            this.destroy(true);
        }
        sendData(commandID, data = null, _callBackHandler = null, _isShowLoding = true) {
            if (data == null) {
                data = [];
            }
        }
        get btn_com_help() {
            if (this._view) {
                return this._view.getChildByName("btn_com_help");
            }
            else {
                return null;
            }
        }
        get btn_back() {
            return this._view.getChildByName("btn_back");
        }
        onHelp() {
            if (this.m_helpId) {
                ModuleManager.intance.openModule(ModuleName.HelpDialog, this.m_helpId);
            }
        }
        resetView() {
            this._view.width = LayerManager.instence.m_iStageWidth;
            this._view.height = LayerManager.instence.m_iStageHeight;
            this.onStageResize();
        }
        static shake(dis, times = 2, offset = 4, speed = 32) {
            if (BaseView.isShake) {
                return;
            }
            BaseView.isShake = true;
            let point = new Laya.Point(dis.x, dis.y);
            let offsetXYArray = [0, 0];
            let num = 0;
            let updateShake = function () {
                offsetXYArray[num % 2] = num++ % 4 < 2 ? 0 : offset;
                if (num > times * 4 + 1) {
                    Laya.timer.clear(Laya.stage, updateShake);
                    num = 0;
                    BaseView.isShake = false;
                }
                dis.x = offsetXYArray[0] + point.x;
                dis.y = offsetXYArray[1] + point.y;
            };
            Laya.timer.loop(speed, Laya.stage, updateShake);
        }
    }
    BaseView.isShake = false;

    class NoticeBaseView extends BaseView {
        constructor(notice) {
            super();
            this._notice = notice;
        }
        notice() {
        }
    }

    var View = Laya.View;
    var Dialog = Laya.Dialog;
    var REG = Laya.ClassUtils.regClass;
    var MornUI;
    (function (MornUI) {
        var BaseAlert;
        (function (BaseAlert) {
            class BaseAlertViewUI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("BaseAlert/BaseAlertView");
                }
            }
            BaseAlert.BaseAlertViewUI = BaseAlertViewUI;
            REG("MornUI.BaseAlert.BaseAlertViewUI", BaseAlertViewUI);
            class ClientErrViewUI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("BaseAlert/ClientErrView");
                }
            }
            BaseAlert.ClientErrViewUI = ClientErrViewUI;
            REG("MornUI.BaseAlert.ClientErrViewUI", ClientErrViewUI);
        })(BaseAlert = MornUI.BaseAlert || (MornUI.BaseAlert = {}));
    })(MornUI || (MornUI = {}));
    (function (MornUI) {
        var Basetips;
        (function (Basetips) {
            class BaseTipViewUI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("Basetips/BaseTipView");
                }
            }
            Basetips.BaseTipViewUI = BaseTipViewUI;
            REG("MornUI.Basetips.BaseTipViewUI", BaseTipViewUI);
        })(Basetips = MornUI.Basetips || (MornUI.Basetips = {}));
    })(MornUI || (MornUI = {}));
    (function (MornUI) {
        var BuildMap;
        (function (BuildMap) {
            class build1001UI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("BuildMap/build1001");
                }
            }
            BuildMap.build1001UI = build1001UI;
            REG("MornUI.BuildMap.build1001UI", build1001UI);
            class build1002UI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("BuildMap/build1002");
                }
            }
            BuildMap.build1002UI = build1002UI;
            REG("MornUI.BuildMap.build1002UI", build1002UI);
            class build1003UI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("BuildMap/build1003");
                }
            }
            BuildMap.build1003UI = build1003UI;
            REG("MornUI.BuildMap.build1003UI", build1003UI);
            class build1004UI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("BuildMap/build1004");
                }
            }
            BuildMap.build1004UI = build1004UI;
            REG("MornUI.BuildMap.build1004UI", build1004UI);
            class build1005UI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("BuildMap/build1005");
                }
            }
            BuildMap.build1005UI = build1005UI;
            REG("MornUI.BuildMap.build1005UI", build1005UI);
            class build1006UI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("BuildMap/build1006");
                }
            }
            BuildMap.build1006UI = build1006UI;
            REG("MornUI.BuildMap.build1006UI", build1006UI);
            class build1007UI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("BuildMap/build1007");
                }
            }
            BuildMap.build1007UI = build1007UI;
            REG("MornUI.BuildMap.build1007UI", build1007UI);
            class build1008UI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("BuildMap/build1008");
                }
            }
            BuildMap.build1008UI = build1008UI;
            REG("MornUI.BuildMap.build1008UI", build1008UI);
            class build1010UI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("BuildMap/build1010");
                }
            }
            BuildMap.build1010UI = build1010UI;
            REG("MornUI.BuildMap.build1010UI", build1010UI);
            class build1011UI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("BuildMap/build1011");
                }
            }
            BuildMap.build1011UI = build1011UI;
            REG("MornUI.BuildMap.build1011UI", build1011UI);
            class build1013UI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("BuildMap/build1013");
                }
            }
            BuildMap.build1013UI = build1013UI;
            REG("MornUI.BuildMap.build1013UI", build1013UI);
            class build1014UI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("BuildMap/build1014");
                }
            }
            BuildMap.build1014UI = build1014UI;
            REG("MornUI.BuildMap.build1014UI", build1014UI);
            class build1015UI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("BuildMap/build1015");
                }
            }
            BuildMap.build1015UI = build1015UI;
            REG("MornUI.BuildMap.build1015UI", build1015UI);
            class build1016UI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("BuildMap/build1016");
                }
            }
            BuildMap.build1016UI = build1016UI;
            REG("MornUI.BuildMap.build1016UI", build1016UI);
            class build1017UI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("BuildMap/build1017");
                }
            }
            BuildMap.build1017UI = build1017UI;
            REG("MornUI.BuildMap.build1017UI", build1017UI);
            class build1018UI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("BuildMap/build1018");
                }
            }
            BuildMap.build1018UI = build1018UI;
            REG("MornUI.BuildMap.build1018UI", build1018UI);
            class build4005UI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("BuildMap/build4005");
                }
            }
            BuildMap.build4005UI = build4005UI;
            REG("MornUI.BuildMap.build4005UI", build4005UI);
            class build7001UI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("BuildMap/build7001");
                }
            }
            BuildMap.build7001UI = build7001UI;
            REG("MornUI.BuildMap.build7001UI", build7001UI);
            class build9005UI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("BuildMap/build9005");
                }
            }
            BuildMap.build9005UI = build9005UI;
            REG("MornUI.BuildMap.build9005UI", build9005UI);
        })(BuildMap = MornUI.BuildMap || (MornUI.BuildMap = {}));
    })(MornUI || (MornUI = {}));
    (function (MornUI) {
        var createNameView;
        (function (createNameView) {
            class CreateNameViewUI extends Dialog {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("createNameView/CreateNameView");
                }
            }
            createNameView.CreateNameViewUI = CreateNameViewUI;
            REG("MornUI.createNameView.CreateNameViewUI", CreateNameViewUI);
        })(createNameView = MornUI.createNameView || (MornUI.createNameView = {}));
    })(MornUI || (MornUI = {}));
    (function (MornUI) {
        var DiamondAnswer;
        (function (DiamondAnswer) {
            class BuildingTipsUI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("DiamondAnswer/BuildingTips");
                }
            }
            DiamondAnswer.BuildingTipsUI = BuildingTipsUI;
            REG("MornUI.DiamondAnswer.BuildingTipsUI", BuildingTipsUI);
        })(DiamondAnswer = MornUI.DiamondAnswer || (MornUI.DiamondAnswer = {}));
    })(MornUI || (MornUI = {}));
    (function (MornUI) {
        var find;
        (function (find) {
            class FindViewUI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("find/FindView");
                }
            }
            find.FindViewUI = FindViewUI;
            REG("MornUI.find.FindViewUI", FindViewUI);
        })(find = MornUI.find || (MornUI.find = {}));
    })(MornUI || (MornUI = {}));
    (function (MornUI) {
        var find;
        (function (find) {
            var item;
            (function (item) {
                class FindItemRenderUI extends View {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("find/item/FindItemRender");
                    }
                }
                item.FindItemRenderUI = FindItemRenderUI;
                REG("MornUI.find.item.FindItemRenderUI", FindItemRenderUI);
            })(item = find.item || (find.item = {}));
        })(find = MornUI.find || (MornUI.find = {}));
    })(MornUI || (MornUI = {}));
    (function (MornUI) {
        var GameSetting;
        (function (GameSetting) {
            class GameSettingLanguageDialogUI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("GameSetting/GameSettingLanguageDialog");
                }
            }
            GameSetting.GameSettingLanguageDialogUI = GameSettingLanguageDialogUI;
            REG("MornUI.GameSetting.GameSettingLanguageDialogUI", GameSettingLanguageDialogUI);
            class GameSettingVersionDialogUI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("GameSetting/GameSettingVersionDialog");
                }
            }
            GameSetting.GameSettingVersionDialogUI = GameSettingVersionDialogUI;
            REG("MornUI.GameSetting.GameSettingVersionDialogUI", GameSettingVersionDialogUI);
        })(GameSetting = MornUI.GameSetting || (MornUI.GameSetting = {}));
    })(MornUI || (MornUI = {}));
    (function (MornUI) {
        var Login;
        (function (Login) {
            class PreLoadingViewUI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("Login/PreLoadingView");
                }
            }
            Login.PreLoadingViewUI = PreLoadingViewUI;
            REG("MornUI.Login.PreLoadingViewUI", PreLoadingViewUI);
            class SceneLoadingUI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("Login/SceneLoading");
                }
            }
            Login.SceneLoadingUI = SceneLoadingUI;
            REG("MornUI.Login.SceneLoadingUI", SceneLoadingUI);
        })(Login = MornUI.Login || (MornUI.Login = {}));
    })(MornUI || (MornUI = {}));
    (function (MornUI) {
        var MainView;
        (function (MainView) {
            class AirshipViewUI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("MainView/AirshipView");
                }
            }
            MainView.AirshipViewUI = AirshipViewUI;
            REG("MornUI.MainView.AirshipViewUI", AirshipViewUI);
            class HeadportraitChangeViewUI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("MainView/HeadportraitChangeView");
                }
            }
            MainView.HeadportraitChangeViewUI = HeadportraitChangeViewUI;
            REG("MornUI.MainView.HeadportraitChangeViewUI", HeadportraitChangeViewUI);
            class MainButtomViewUI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("MainView/MainButtomView");
                }
            }
            MainView.MainButtomViewUI = MainButtomViewUI;
            REG("MornUI.MainView.MainButtomViewUI", MainButtomViewUI);
            class MainIconViewUI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("MainView/MainIconView");
                }
            }
            MainView.MainIconViewUI = MainIconViewUI;
            REG("MornUI.MainView.MainIconViewUI", MainIconViewUI);
            class MainTopViewUI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("MainView/MainTopView");
                }
            }
            MainView.MainTopViewUI = MainTopViewUI;
            REG("MornUI.MainView.MainTopViewUI", MainTopViewUI);
            class MainUiRightViewUI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("MainView/MainUiRightView");
                }
            }
            MainView.MainUiRightViewUI = MainUiRightViewUI;
            REG("MornUI.MainView.MainUiRightViewUI", MainUiRightViewUI);
            class MainViewUI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("MainView/MainView");
                }
            }
            MainView.MainViewUI = MainViewUI;
            REG("MornUI.MainView.MainViewUI", MainViewUI);
            class McButtomIconUI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("MainView/McButtomIcon");
                }
            }
            MainView.McButtomIconUI = McButtomIconUI;
            REG("MornUI.MainView.McButtomIconUI", McButtomIconUI);
            class McMainWordUI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("MainView/McMainWord");
                }
            }
            MainView.McMainWordUI = McMainWordUI;
            REG("MornUI.MainView.McMainWordUI", McMainWordUI);
            class PhoneNpcMainIconUI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("MainView/PhoneNpcMainIcon");
                }
            }
            MainView.PhoneNpcMainIconUI = PhoneNpcMainIconUI;
            REG("MornUI.MainView.PhoneNpcMainIconUI", PhoneNpcMainIconUI);
            class PrayTimeViewUI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("MainView/PrayTimeView");
                }
            }
            MainView.PrayTimeViewUI = PrayTimeViewUI;
            REG("MornUI.MainView.PrayTimeViewUI", PrayTimeViewUI);
            class StoreTimeViewUI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("MainView/StoreTimeView");
                }
            }
            MainView.StoreTimeViewUI = StoreTimeViewUI;
            REG("MornUI.MainView.StoreTimeViewUI", StoreTimeViewUI);
        })(MainView = MornUI.MainView || (MornUI.MainView = {}));
    })(MornUI || (MornUI = {}));
    (function (MornUI) {
        var notice;
        (function (notice) {
            class TxtNoticeViewUI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("notice/TxtNoticeView");
                }
            }
            notice.TxtNoticeViewUI = TxtNoticeViewUI;
            REG("MornUI.notice.TxtNoticeViewUI", TxtNoticeViewUI);
        })(notice = MornUI.notice || (MornUI.notice = {}));
    })(MornUI || (MornUI = {}));
    (function (MornUI) {
        var ShopView;
        (function (ShopView) {
            class BuyComfirmViewUI extends Dialog {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("ShopView/BuyComfirmView");
                }
            }
            ShopView.BuyComfirmViewUI = BuyComfirmViewUI;
            REG("MornUI.ShopView.BuyComfirmViewUI", BuyComfirmViewUI);
        })(ShopView = MornUI.ShopView || (MornUI.ShopView = {}));
    })(MornUI || (MornUI = {}));
    (function (MornUI) {
        var test;
        (function (test) {
            class TestDialogUI extends Dialog {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("test/TestDialog");
                }
            }
            test.TestDialogUI = TestDialogUI;
            REG("MornUI.test.TestDialogUI", TestDialogUI);
            class TestViewUI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("test/TestView");
                }
            }
            test.TestViewUI = TestViewUI;
            REG("MornUI.test.TestViewUI", TestViewUI);
        })(test = MornUI.test || (MornUI.test = {}));
    })(MornUI || (MornUI = {}));
    (function (MornUI) {
        var travel;
        (function (travel) {
            var item;
            (function (item) {
                class ListCharpterItemUI extends View {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("travel/item/ListCharpterItem");
                    }
                }
                item.ListCharpterItemUI = ListCharpterItemUI;
                REG("MornUI.travel.item.ListCharpterItemUI", ListCharpterItemUI);
            })(item = travel.item || (travel.item = {}));
        })(travel = MornUI.travel || (MornUI.travel = {}));
    })(MornUI || (MornUI = {}));
    (function (MornUI) {
        var travel;
        (function (travel) {
            class TravelCharpterDialogUI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("travel/TravelCharpterDialog");
                }
            }
            travel.TravelCharpterDialogUI = TravelCharpterDialogUI;
            REG("MornUI.travel.TravelCharpterDialogUI", TravelCharpterDialogUI);
        })(travel = MornUI.travel || (MornUI.travel = {}));
    })(MornUI || (MornUI = {}));
    (function (MornUI) {
        var tvstart;
        (function (tvstart) {
            class GameSettingDialogUI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("tvstart/GameSettingDialog");
                }
            }
            tvstart.GameSettingDialogUI = GameSettingDialogUI;
            REG("MornUI.tvstart.GameSettingDialogUI", GameSettingDialogUI);
            class QuickEndViewUI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("tvstart/QuickEndView");
                }
            }
            tvstart.QuickEndViewUI = QuickEndViewUI;
            REG("MornUI.tvstart.QuickEndViewUI", QuickEndViewUI);
            class QuickOperatorDialogUI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("tvstart/QuickOperatorDialog");
                }
            }
            tvstart.QuickOperatorDialogUI = QuickOperatorDialogUI;
            REG("MornUI.tvstart.QuickOperatorDialogUI", QuickOperatorDialogUI);
            class QuickRechargeDialogUI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("tvstart/QuickRechargeDialog");
                }
            }
            tvstart.QuickRechargeDialogUI = QuickRechargeDialogUI;
            REG("MornUI.tvstart.QuickRechargeDialogUI", QuickRechargeDialogUI);
            class QuickShareViewUI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("tvstart/QuickShareView");
                }
            }
            tvstart.QuickShareViewUI = QuickShareViewUI;
            REG("MornUI.tvstart.QuickShareViewUI", QuickShareViewUI);
            class QuickTipDialogUI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("tvstart/QuickTipDialog");
                }
            }
            tvstart.QuickTipDialogUI = QuickTipDialogUI;
            REG("MornUI.tvstart.QuickTipDialogUI", QuickTipDialogUI);
            class TVStartViewUI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("tvstart/TVStartView");
                }
            }
            tvstart.TVStartViewUI = TVStartViewUI;
            REG("MornUI.tvstart.TVStartViewUI", TVStartViewUI);
        })(tvstart = MornUI.tvstart || (MornUI.tvstart = {}));
    })(MornUI || (MornUI = {}));

    class SimpleNoticeView extends NoticeBaseView {
        constructor(notice) {
            super(notice);
            this.zOrder = 10000000;
        }
        createUI() {
            this._ui = new MornUI.notice.TxtNoticeViewUI();
            this.addChild(this._ui);
        }
        notice() {
            let value = this._notice;
            this.view.label_tf.text = value;
            this.view.label_tf.x = 68;
            this.view.image_bg.width = 68 * 2 + this.view.label_tf.textField.textWidth;
            let line = value.length / 45;
            if (line > 1) {
                this.view.image_bg.height = this.view.label_tf.textField.textHeight + 25;
            }
        }
        get view() {
            return this._ui;
        }
        get width() {
            return this.view.image_bg.width;
        }
    }

    class NoticeMgr {
        constructor() {
            this._list = [];
            this._isNoticing = false;
            this._isListener = false;
        }
        static get instance() {
            if (!NoticeMgr._instance) {
                NoticeMgr._instance = new NoticeMgr();
            }
            return NoticeMgr._instance;
        }
        notice(value) {
            if (!this._isNoticing) {
                this._list.push(value);
                this.noticeOne();
            }
            else {
                if (!this._isListener) {
                    this._isListener = true;
                    this._list.push(value);
                    Laya.timer.loop(NoticeMgr.Tip_Interval, this, this.onInterVal);
                }
            }
        }
        noticeOne() {
            let noticeView;
            let notice = this._list.shift();
            if ("string" == typeof notice || notice instanceof String || !isNaN(notice)) {
                noticeView = new SimpleNoticeView(notice);
            }
            noticeView.notice();
            Laya.stage.addChild(noticeView);
            noticeView.x = LayerManager.instence.stageWidth * 0.5 - noticeView.width * 0.5;
            noticeView.y = LayerManager.instence.stageHeight * 0.5 - noticeView.height * 0.5;
            Laya.Tween.to(noticeView, { "y": noticeView.y - 150, "alpha": 0 }, 2000, null, Laya.Handler.create(this, this.onFinish, [noticeView]));
        }
        onFinish(view) {
            if (view) {
                view.visible = false;
                view.dispose();
            }
        }
        onInterVal() {
            if (this._list.length >= 1) {
                this.noticeOne();
            }
            else {
                this._isNoticing = false;
                this._isListener = false;
                Laya.timer.clear(this, this.onInterVal);
            }
        }
    }
    NoticeMgr.Tip_Interval = 1000;

    class ErrorPopManager {
        constructor() {
            this._curErrTxt = "";
        }
        static get instance() {
            if (!ErrorPopManager._instance) {
                ErrorPopManager._instance = new ErrorPopManager();
            }
            return ErrorPopManager._instance;
        }
        initErrData(_data) {
            this.errData = _data;
        }
        get(id) {
            return this.errData[id]["words"];
        }
        showErrorWord(id, para = 999999) {
            if (this.errData[id] && this.errData[id].hasOwnProperty("words")) {
                this._curErrTxt = this.errData[id]["words"];
                if (para != 999999) {
                    this._curErrTxt = GameLanguageMgr.instance.replacePlaceholder(this._curErrTxt, [para]);
                }
            }
            else {
                this._curErrTxt = "" + id;
            }
            NoticeMgr.instance.notice(this._curErrTxt);
        }
        showErrByString(value, color = "#ff0000") {
            this._curErrTxt = value;
            let _txt = new Laya.Label(this._curErrTxt);
            _txt.width = 500;
            _txt.align = "center";
            _txt.height = 40;
            _txt.fontSize = 26;
            _txt.color = color;
            _txt.mouseEnabled = false;
            _txt.strokeColor = "#000000";
            _txt.stroke = 0.5;
            Laya.stage.addChild(_txt);
            _txt.x = (Laya.stage.width - _txt.width) / 2;
            _txt.y = (Laya.stage.height - _txt.height) / 2;
            Laya.Tween.to(_txt, { y: _txt.y - 100, alpha: 0 }, 500, null, Laya.Handler.create(this, this.completeHandler, [_txt]), 1000);
        }
        completeHandler(value) {
            if (value && value.parent) {
                value.parent.removeChild(value);
            }
        }
        dispose() {
            this.errData = null;
        }
    }

    class NpcModel {
        constructor() {
        }
        parseJson() {
            if (this.npcMap == null) {
                this.npcMap = new Dictionary();
                let json = GameResourceManager.instance.getResByURL("config/boutique_quest_customer.json");
                let npcVo;
                for (let npc of json) {
                    npcVo = npc;
                    npcVo.name = GameLanguageMgr.instance.getConfigLan(npcVo.name);
                    npcVo.intro = GameLanguageMgr.instance.getConfigLan(npcVo.intro);
                    this.npcMap.set(npcVo.id, npcVo);
                }
            }
        }
        parseNpcFace() {
            if (!this.npcFaceMap) {
                this.npcFaceMap = new Dictionary();
                let faceVo;
                let json = GameResourceManager.instance.getResByURL("config/npc_face.json");
                for (let face of json) {
                    faceVo = face;
                    this.npcFaceMap.set(faceVo.id, faceVo);
                }
            }
        }
        npcFaceVo(id) {
            this.parseNpcFace();
            return this.npcFaceMap.get(id);
        }
        getNpcVo(id) {
            if (this.npcMap == null) {
                this.parseJson();
            }
            return this.npcMap.get(id);
        }
        parseComstomerLv() {
            if (!this.comstomerLvMap) {
                this.comstomerLvMap = new Dictionary();
                let lv;
                let json = GameResourceManager.instance.getResByURL("config/boutique_customer_level.json");
                for (let info of json) {
                    lv = info;
                    this.comstomerLvMap.set(lv.level, lv);
                }
            }
        }
        getComstomerLv(lv) {
            this.parseComstomerLv();
            return this.comstomerLvMap.get(lv);
        }
    }

    class EnumFunctionId {
    }
    EnumFunctionId.FUNID_MALL = "1004";
    EnumFunctionId.FUN_ID_TAGGARDEN = "2005";
    EnumFunctionId.FunID_WORK = "1006";
    EnumFunctionId.FUN_ID_BARGAIN_SHOP = "1007";
    EnumFunctionId.TRAVEL_HARD = "1012";
    EnumFunctionId.TRAVEL_REWARD = "3006";
    EnumFunctionId.FUNID_TUJIAN = "2105";
    EnumFunctionId.FUN_ID_PARTY = "7003";
    EnumFunctionId.FUN_ID_FB = "9010";
    EnumFunctionId.FUN_ID_PET = "9004";
    EnumFunctionId.FUN_ID_TURNTABLE = "9001";
    EnumFunctionId.FUN_ID_GASHPOEN = "9012";
    EnumFunctionId.FUN_ID_SHOPEXCHANGE = "2104";
    EnumFunctionId.FUN_ID_TIME_STAGE = "9014";
    EnumFunctionId.FUN_ID_DRAWCARD_PVP = "1008613";
    EnumFunctionId.FUN_ID_PHONE = "2004";
    EnumFunctionId.FUN_ID_DS = "9017";
    EnumFunctionId.FUN_ID_BUY_PS = "9030";
    EnumFunctionId.FUN_ID_DESTINY = "3020";
    EnumFunctionId.FUN_ID_ACTIVITY_SHOP = "9026";
    EnumFunctionId.FUN_ID_WORKSHOP_RECYCLE = "3002";
    EnumFunctionId.FUN_ID_WORKSHOP_COLOR = "3004";
    EnumFunctionId.FUN_ID_WORKSHOP_UPGRADE = "3003";
    EnumFunctionId.FUN_ID_GUILD = "1010";
    EnumFunctionId.FUN_ID_VIP = "9022";
    EnumFunctionId.FUN_ID_MONTHCARD = "9100";

    class SysteSheetModel {
        constructor() {
            this.bafflesInfo = [[330, 740, 9], [294, 113.95, 1], [712.95 - 80, 343.45, 3], [1251.35, 125.95, 7]];
            this.redHotStateMap = new Dictionary();
            this.openSystem = new Dictionary();
            this.m_dicSystemInfoCfg = new Dictionary();
            this._openTypeList = new Dictionary();
            this.parseJson();
        }
        hasRedState(funId) {
            let vo = this.redHotStateMap.get(funId + "");
            return vo ? vo.redState + "" == "1" : false;
        }
        initSystemOpen(_openSystem) {
            this.openSystem = new Dictionary();
            for (let j = 0; j < _openSystem.length; j++) {
                this.openSystem.set(_openSystem[j], true);
                if (_openSystem[j] + "" == EnumFunctionId.FUN_ID_PHONE.toString()) {
                }
            }
        }
        parseJson() {
            let json = GameResourceManager.instance.getResByURL("config/system_open.json");
            let systemInfo;
            for (let info in json) {
                systemInfo = json[info];
                if (systemInfo) {
                    this.m_dicSystemInfoCfg.set(systemInfo.functionID, systemInfo);
                    let arr = this._openTypeList.get(systemInfo.open_type);
                    if (!arr) {
                        arr = [];
                        this._openTypeList.set(systemInfo.open_type, arr);
                    }
                    arr.push(systemInfo);
                }
            }
        }
        getSystemsByType(position) {
            let arr = [];
            for (let i = 0; i < this.m_dicSystemInfoCfg.values.length; i++) {
                let value = this.m_dicSystemInfoCfg.values[i];
                if (value.positionID == position) {
                    arr.push(value);
                }
            }
            return arr;
        }
        getLockFun(openType, param) {
            let arr = this._openTypeList.get(openType);
            for (let vo of arr) {
                if (vo.parameter1 + "" == param + "") {
                    return vo;
                }
            }
            return null;
        }
        getBuildSystem() {
        }
        isOpen(sysId) {
            if (GameSetting.buildClickState) {
                return true;
            }
            if (sysId instanceof String) {
                sysId = parseInt(sysId + "");
            }
            let open = this.openSystem.get(sysId);
            return open != null;
        }
    }

    class GameEvent {
    }
    GameEvent.MOUSE_HOLDON = "MOUSE_HOLDON";
    GameEvent.EVENT_OPEN_MODULE = "EVENT_OPEN_MODULE";
    GameEvent.EVENT_MODULE_ADDED = "EVENT_MODULE_ADDED";
    GameEvent.EVENT_CLOSE_MODULE = "EVENT_CLOSE_MODULE";
    GameEvent.EVENT_LOADED_COMPLETE = "EVENT_LOAD_COMPLETE";
    GameEvent.EVENT_LOADED_SCENE_BG_COM = "EVENT_LOADED_SCENE_BG_COM";
    GameEvent.EVENT_LOAD_SKIN_COMPLETE = "EVENT_LOAD_SKIN_COMPLETE";
    GameEvent.EVENT_LOAD_HEAD_SKIN_COMPLETE = "EVENT_LOAD_HEAD_SKIN_COMPLETE";
    GameEvent.EVENT_LOADING_SUC = "EVENT_LOADING_SUC";
    GameEvent.EVENT_BACK_TO_LOGIN = "EVENT_BACK_TO_LOGIN";
    GameEvent.EVENT_ITEM_UPDATE = "EVENT_ITEM_UPDATE";
    GameEvent.EVENT_ROLE_UPDATE = "EVENT_ROLE_UPDATE";
    GameEvent.STAGE_ON_BLUR = "STAGE_ON_BLUR";
    GameEvent.STAGE_ON_FOCUS = "STAGE_ON_FOCUS";
    GameEvent.MYHOME_OPEN_CLOTH = "MYHOME_OPEN_CLOTH";
    GameEvent.MYHOME_CLOSE_CLOTH = "MYHOME_CLOSE_CLOTH";
    GameEvent.MYHOME_CLIECK_BG = "MYHOME_CLIECK_BG";
    GameEvent.Rest_Cloth = "Rest_Cloth";
    GameEvent.PACKAGE_UPDATE_ITEM = "PACKAGE_UPDATE_ITEM";
    GameEvent.IMPROVE_SUCESS_EVENT = "IMPROVE_SUCESS_EVENT";
    GameEvent.FACEPACKAGE_UPDATE_ITEM = "Item_Change_Event";
    GameEvent.MYHOME_TRY_CLOTH = "MYHOME_TRY_CLOTH";
    GameEvent.MYHOME_CUSTOMER_CLOTH = "MYHOME_CUSTOMER_CLOTH";
    GameEvent.DIALOG_VIEW_END = "DIALOG_VIEW_END";
    GameEvent.MALLCARD_SELECT = "MALLCARD_SELECT";
    GameEvent.MALLCARD_BACK = "MALLCARD_BACK";
    GameEvent.CHANG_POTRAIT = "CHANG_POTRAIT";
    GameEvent.ROLE_INFO_CHANGE = "ROLE_INFO_CHANGE";
    GameEvent.PET_ADDED_ON_ROLE = "PET_ADDED_ON_ROLE";
    GameEvent.REFRESH_MAIN_TASK = "REFRESH_MAIN_TASK";
    GameEvent.RECIVE_SUCESS_SERVICE = "RECIVE_SUCESS_SERVICE";
    GameEvent.SCENE_ROLE_COMPELTE = "SCENE_ROLE_COMPELTE";
    GameEvent.FITTING_CLOTH_BTN = "FITTING_CLOTH_BTN";
    GameEvent.STORE_CLICKBG_EVENT = "STORE_CLICKBG_EVENT";
    GameEvent.CLOSE_BG_VIEW = "CLOSE_BG_VIEW";
    GameEvent.EVENT_UPDATE_ONLINE = "EVENT_UPDATE_ONLINE";
    GameEvent.VIP_INFO_CHANGE = "VIP_INFO_CHANGE";
    GameEvent.EVENT_FUNCTION_OPEN_UPDATE = "EVENT_FUNCTION_OPEN_UPDATE";
    GameEvent.EVENT_ADD_ACTIVITY = "EVENT_ADD_ACTIVITY";
    GameEvent.EVENT_REMOVE_ACTIVITY = "EVENT_REMOVE_ACTIVITY";
    GameEvent.EVENT_STORE_RESETCLOTH = "EVENT_STORE_RESETCLOTH";
    GameEvent.EVENT_REFRESH_CUSTOMER_MESSAGE = "EVENT_REFRESH_CUSTOMER_MESSAGE";
    GameEvent.EVENT_UPDATE_TURNOVER_AWARD_STATE = "EVENT_UPDATE_TURNOVER_AWARD_STATE";
    GameEvent.UPDATE_CHAO_PIAO = "UPDATE_CHAO_PIAO";
    GameEvent.UPDATE_EXCHANGE_INFO = "UPDATE_EXCHANGE_INFO";
    GameEvent.UPDATE_RED_STATE_EVENT = "UPDATE_RED_STATE_EVENT";
    GameEvent.SYSTEM_OPEN_TIME_INITED = "SYSTEM_OPEN_TIME_INITED";
    GameEvent.EVENT_OPEN_SHARE = "EVENT_OPEN_SHARE";
    GameEvent.CHANGE_SCENE_BASE_ROLE_LAYER = "CHANGE_SCENE_BASE_ROLE_LAYER";
    GameEvent.CHANGE_NAME = "CHANGE_NAME";
    GameEvent.CHANGE_HEAD = "CHANGE_HEAD";
    GameEvent.CHANGE_RANK = "CHANGE_RANK";
    GameEvent.EVENT_ITEMGETDIALOG_CLICK = "EVENT_CLOSE_ITEMGETDIALOG";
    GameEvent.EVENT_AD_TIMES_UPDATE = "EVENT_AD_TIMES_UPDATE";
    GameEvent.EVENT_RECHARGED = "EVENT_RECHARGED";
    GameEvent.EVENT_RECHARGED_TIP = "EVENT_RECHARGED_TIP";

    class Signal extends Laya.EventDispatcher {
        static get intance() {
            if (Signal._instance) {
                return Signal._instance;
            }
            Signal._instance = new Signal();
            return Signal._instance;
        }
    }

    class GlobalRoleDataManger {
        static get instance() {
            if (GlobalRoleDataManger._instance) {
                return GlobalRoleDataManger._instance;
            }
            GlobalRoleDataManger._instance = new GlobalRoleDataManger();
            return GlobalRoleDataManger._instance;
        }
        init(complete, process) {
            complete.run();
            return;
        }
        initSkinData() {
            let startTime = Laya.Browser.now();
            GlobalRoleDataManger.m_objSkinPositon = new Object();
            GlobalRoleDataManger.m_objBoySkinPositon = new Object();
            GlobalRoleDataManger.m_objPetSkinPosition = new Dictionary();
            let arr = GameResourceManager.instance.m_arrWomanResource;
            for (let i = 0; i < arr.length; i++) {
                let str = arr[i];
                let obj1 = GameResourceManager.instance.getResByURL(str);
                if (!obj1) {
                    console.log("没有这个资源++++++++++++++++++" + str);
                    continue;
                    ;
                }
                obj1.name = str;
                GlobalRoleDataManger.m_objSkinPositon = Object.assign(GlobalRoleDataManger.m_objSkinPositon, obj1);
                let targetURL = GameResourceManager.instance.setResURL(str);
                Laya.Loader.clearRes(targetURL);
            }
            arr = GameResourceManager.instance.m_arrManResource;
            for (let i = 0; i < arr.length; i++) {
                let str = arr[i];
                let obj1 = GameResourceManager.instance.getResByURL(str);
                GlobalRoleDataManger.m_objBoySkinPositon = Object.assign(GlobalRoleDataManger.m_objBoySkinPositon, obj1);
                let targetURL = GameResourceManager.instance.setResURL(str);
                Laya.Loader.clearRes(targetURL);
            }
            console.log("-----------------------roledata-time:" + (Laya.Browser.now() - startTime));
        }
        onLoadError(e) {
        }
    }
    GlobalRoleDataManger.m_bParseCom = false;

    class ItemVo {
        constructor(id = 0) {
            this._m_iLevel = 0;
            this.m_iStyleType = [];
            this.m_arrSlot = [];
            this.m_arrSkin = [];
            this._m_arrDisc = [];
            this.newAddCnt = 0;
            this.isLvUp = false;
            this.m_bSalon = false;
            this.m_bIsSetId = false;
            this._clothStyleDes = [];
            this._m_arrDiscData = [];
            if (id == 0) {
                return;
            }
            this.m_iId = id;
        }
        get m_sIcon() {
            return this._m_sIcon;
        }
        set m_sIcon(value) {
            this._m_sIcon = value;
        }
        get m_iLevel() {
            return this._m_iLevel > 0 ? this._m_iLevel : 1;
        }
        set m_iLevel(value) {
            this._m_iLevel = value ? value : 0;
        }
        get m_iSalonLevel() {
            return this._m_iLevel;
        }
        set m_iSalonLevel(value) {
            this._m_iLevel = value;
        }
        get m_iNum() {
            return this._m_iNum;
        }
        get m_BaseNum() {
            if (this._m_iNum > 0 && this.m_iLevel > 1) {
                return this._m_iNum - 1;
            }
            return this._m_iNum;
        }
        set m_iNum(value) {
            this._m_iNum = value;
        }
        copyItem() {
            let vo = new ItemVo();
            vo.m_iId = this.m_iId;
            vo.m_iOriginalId = this.m_iOriginalId;
            return vo;
        }
        get m_bTry() {
            if (this.m_iId == this.m_iOriginalId) {
                this._m_bSet = false;
            }
            else {
                this._m_bSet = true;
            }
            return this._m_bSet;
        }
        getLevelAdd() {
            let bagVo = GlobalDataManager.instance.m_packageData.getItemVoByItemId(this.m_iId, this.m_itemVo.itm_type);
            if (bagVo) {
                let lv = bagVo.m_iLevel ? bagVo.m_iLevel : 1;
            }
            return 1;
        }
        get m_strName() {
            return GameLanguageMgr.instance.getLanguage(this.m_itemVo.item_name);
        }
        set m_bTry(value) {
            this._m_bSet = value;
        }
        get m_iId() {
            return this._m_iId;
        }
        set m_iId(value) {
            this._m_iId = value;
            if (!this.m_bIsSetId) {
                this.m_bIsSetId = true;
                this.m_iOriginalId = value;
            }
            this.setConfigData();
        }
        initDataByArr(arr) {
            this.m_iId = arr[0];
            this.m_iNum = arr[1];
            this.m_iLevel = arr[2];
        }
        initFaceDataByArr(arr) {
            this.m_iNum = 1;
            this.m_iId = arr[0];
            this.m_iLevel = arr[1];
            this.m_iExp = arr[2];
        }
        setConfigData() {
            if (this.m_iId == 0) {
                return;
            }
            this.m_itemVo = SheetDataManager.intance.m_dicItems.get(this.m_iId.toString());
            if (!this.m_itemVo) {
                console.log("[          <items表>找不到id:" + this.m_iId + "             ]");
                return;
            }
            this._m_arrFace = this.m_itemVo.m_arrFace.concat([]);
            this.m_iChildType = parseInt(this.m_itemVo.child_type + "");
            this.m_iHairType = parseInt(this.m_itemVo.hair_type + "");
            this.m_iParentType = parseInt(this.m_itemVo.paren_type + "");
            this.m_iRestort = parseInt(this.m_itemVo.if_restort + "");
            this.m_iStyleType = this.m_itemVo.cloth_style;
            this.m_sAtlas = this.m_itemVo.cloth_index;
            this.m_sIcon = this.m_itemVo.item_img;
            this.m_arrSlot = this.m_itemVo.slot || [];
            this.m_arrSkin = this.m_itemVo.resourse || [];
            if (this.m_itemVo.buy_price) {
                this.m_iPrice = this.m_itemVo.buy_price[0][1];
                let montyId = this.m_itemVo.buy_price[0][0];
                let monyItem = SheetDataManager.intance.m_dicItems.get(montyId);
                if (monyItem) {
                    this.m_strBuyIcon = GameResourceManager.instance.getIconUrl(monyItem.item_img);
                }
            }
            if (this.m_itemVo.sell_price) {
                this.m_iSellPrice = parseFloat(this.m_itemVo.sell_price[0][1]);
            }
            this.m_iQuality = this.m_itemVo.item_quality;
            this.setQualityData();
        }
        get m_arrDisc() {
            this._m_arrDisc = [];
            for (let j = 0; j < this.m_itemVo.cloth_style.length; j++) {
                let styleItem = SheetDataManager.intance.m_dicStyle.get(this.m_itemVo.cloth_style[j]);
                if (styleItem) {
                    this._m_arrDisc.push(GameLanguageMgr.instance.getLanguage(styleItem.style));
                }
            }
            return this._m_arrDisc;
        }
        get clothStyleDes() {
            this._clothStyleDes = this.m_itemVo.clothStyleDes;
            return this._clothStyleDes;
        }
        get m_arrDiscData() {
            this._m_arrDiscData = [];
            for (let i = 0; i < this.m_arrDisc.length; i++) {
                let obj = {};
                obj["txtValue"] = this.m_arrDisc[i];
                this._m_arrDiscData.push(obj);
            }
            return this._m_arrDiscData;
        }
        setQualityData() {
            this.m_arrQualityData = this.m_itemVo.starArr;
            return;
        }
        get getIconURL() {
            if (EnumConsumeType.isConsumeType(this._m_iId)) {
                return GameResourceManager.instance.getConsumeconUrl(this._m_iId);
            }
            else {
                return GameResourceManager.instance.getIconUrl(this.m_sIcon);
            }
        }
        copy() {
            let itemVo = new ItemVo(this.m_iId);
            itemVo.m_iLevel = this.m_iLevel;
            return itemVo;
        }
        get m_arrFace() {
            return this._m_arrFace;
        }
        compareName() {
            return GameLanguageMgr.instance.getConfigLan(this.m_itemVo.item_name);
        }
        compareQuality() {
            return parseFloat(this.m_iQuality + "");
        }
        compareSellPrice() {
            return parseFloat(this.m_itemVo.sell_price[1] + "");
        }
        compareNum() {
            return parseFloat(this.m_iNum + "");
        }
        compareLevel() {
            return parseFloat(this.m_iLevel + "");
        }
        compareFragment() {
            let itemID = this.m_itemVo.itemID;
            return 0;
        }
        compareType() {
            return parseInt(this.m_iParentType.toString());
        }
        compareTypeId() {
            return parseInt(this.m_iId + "");
        }
        replaceNpcFace(ids) {
            this._m_arrFace = this.m_itemVo.m_arrFace.concat([]);
            for (let id of ids) {
                let replaceItem = SheetDataManager.intance.m_dicItems.get(id + "");
                for (let sourceId of this.m_itemVo.m_arrFace) {
                    let sourceItem = SheetDataManager.intance.m_dicItems.get(sourceId + "");
                    if (replaceItem.child_type.toString() == sourceItem.child_type.toString()) {
                        this._m_arrFace.splice(this._m_arrFace.indexOf(sourceId), 1);
                        this._m_arrFace.push(id);
                        break;
                        ;
                    }
                }
                this._m_arrFace.push(id);
            }
        }
        static isMatchAffix(vo, type = 0) {
            return ItemVo.isMatchAffixByItemsStItem(vo.m_itemVo, type);
        }
        static isMatchSuit(vo, type) {
            let key = vo.ID + "_" + type;
            if (ItemVo.matchSuitDic.keys.indexOf(key) >= 0) {
                return ItemVo.matchSuitDic.get(key);
            }
            for (let i = 0; i < vo.composition.length; i++) {
                let item = SheetDataManager.intance.m_dicItems.get(vo.composition[i]);
                if (ItemVo.isMatchAffixByItemsStItem(item, type)) {
                    ItemVo.matchSuitDic.set(key, true);
                    return true;
                }
            }
            ItemVo.matchSuitDic.set(key, false);
            return false;
        }
        static isMatchAffixByItemsStItem(vo, type) {
            return false;
        }
        static get getTagType() {
            return -1;
        }
    }
    ItemVo.matchSuitDic = new Dictionary();
    ItemVo.TAG_SHOP = 6;
    ItemVo.TAG_ALL = 7;
    ItemVo.TAG_DRAWCARD = 8;
    ItemVo.TAG_TIMESTAGE = 3;

    class RoleInfo {
        constructor() {
            this.roleName = "Noble";
            this._money1 = 0;
            this.deltaDiamon = 0;
            this._money2 = 0;
            this.oldLevel = 1;
            this._level = 1;
            this._money6 = 0;
            this._stamp = 0;
            this._crystal = 0;
            this.deltaChocoLate = 0;
            this._chocolate = 0;
            this._wishCoint = 0;
            this._salonBox = 0;
            this._love = 0;
            this._imperial_crown = 0;
            this.deltaImperial_crown = 0;
            this._superLove = 0;
            this.deltaSuperLove = 0;
            this.deltaGoldscissors = 0;
            this.deltaSilverScissors = 0;
            this.deltaBrush = 0;
            this.deltaLove = 0;
            this._goldFinger = 0;
            this.deltaGoldFinger = 0;
            this._slotMachine = 0;
            this.deltaSlotMachine = 0;
            this._luckWheel = 0;
            this.deltaLuckWheel = 0;
            this._gashapon = 0;
            this.deltaGashapon = 0;
            this._guildVouchers = 0;
            this._goldCrystal = 0;
            this._money3 = 0;
            this._money4 = 0;
            this.money5 = 0;
            this._answerRebornCoin = 0;
            this.deltaRebornCoin = 0;
            this._timeStageCoin = 0;
            this.deltaTimeStageCoin = 0;
            this._sToken = 0;
            this.deltaSToken = 0;
        }
        get answerRebornCoin() {
            return this._answerRebornCoin;
        }
        set answerRebornCoin(value) {
            this.deltaRebornCoin = parseInt(value + "") - this._answerRebornCoin;
            this._answerRebornCoin = value;
        }
        get gold_scissors() {
            return this._gold_scissors;
        }
        set gold_scissors(value) {
            this.deltaGoldscissors = parseInt(value + "") - this._gold_scissors;
            this._gold_scissors = value;
        }
        get silver_scissors() {
            return this._silver_scissors;
        }
        set silver_scissors(value) {
            this.deltaSilverScissors = parseInt(value + "") - this._silver_scissors;
            this._silver_scissors = value;
        }
        get brush() {
            return this._brush;
        }
        set brush(value) {
            this.deltaBrush = parseInt(value + "") - this._brush;
            this._brush = value;
        }
        get chocolate() {
            return this._chocolate;
        }
        set chocolate(value) {
            this.deltaChocoLate = parseInt(value + "") - this._chocolate;
            this._chocolate = parseInt(value + "");
        }
        get level() {
            return this._level;
        }
        set level(value) {
            this.oldLevel = this._level;
            this._level = parseInt(value + "");
        }
        get guildVouchers() {
            return this._guildVouchers;
        }
        get imperialCrown() {
            return this._imperial_crown;
        }
        get superLove() {
            return this._superLove;
        }
        get love() {
            return this._love;
        }
        set timeStageCoint(value) {
            this.deltaTimeStageCoin = parseInt(value + "") - this._timeStageCoin;
            this._timeStageCoin = parseInt(value + "");
        }
        get timeStageCoint() {
            return this._timeStageCoin;
        }
        set sToken(value) {
            this.deltaSToken = parseInt(value + "") - this._sToken;
            this._sToken = parseInt(value + "");
        }
        get sToken() {
            return this._sToken;
        }
        set love(value) {
            this.deltaLove = parseInt(value + "") - this._love;
            this._love = parseInt(value + "");
        }
        set imperialCrown(value) {
            this.deltaImperial_crown = parseInt(value + "") - this._imperial_crown;
            this._imperial_crown = parseInt(value + "");
        }
        set superLove(value) {
            this.deltaSuperLove = parseInt(value + "") - this._superLove;
            this._superLove = parseInt(value + "");
        }
        get goldFinger() {
            return this._goldFinger;
        }
        set goldFinger(value) {
            this.deltaGoldFinger = parseInt(value + "") - this._goldFinger;
            this._goldFinger = parseInt(value + "");
        }
        get slotMachine() {
            return this._slotMachine;
        }
        set slotMachine(value) {
            this.deltaSlotMachine = parseInt(value + "") - this._slotMachine;
            this._slotMachine = parseInt(value + "");
        }
        get luckWheel() {
            return this._luckWheel;
        }
        set luckWheel(value) {
            this.deltaLuckWheel = parseInt(value + "") - this._luckWheel;
            this._luckWheel = parseInt(value + "");
        }
        get gashapon() {
            return this._gashapon;
        }
        set gashapon(value) {
            this.deltaGashapon = parseInt(value + "") - this._gashapon;
            this._gashapon = parseInt(value + "");
        }
        set guildVouchers(value) {
            this.deltaGuildVouchers = parseInt(value + "") - this._guildVouchers;
            this._guildVouchers = parseInt(value + "");
        }
        get goldCrystal() {
            return this._goldCrystal;
        }
        set goldCrystal(value) {
            this.deltaGoldCrystal = parseInt(value + "") - this._goldCrystal;
            this._goldCrystal = parseInt(value + "");
        }
        get salonBox() {
            return this._salonBox;
        }
        get maxps() {
            return this._maxps;
        }
        updateRoleBuyTimes(data) {
            if (data) {
                let arr;
                if (data[0][0] instanceof Array) {
                    arr = data[0];
                }
                else {
                    arr = data;
                }
                for (let i = 0; i < arr.length; i++) {
                    let buy = arr[i];
                    if (buy[0] == 6) {
                        this.buyTimes_gold = buy[1];
                    }
                    else if (buy[0] == 7) {
                        this.buyTimes_ps = buy[1];
                    }
                    else if (buy[0] == 8) {
                        this.buyTimes_endurance = buy[1];
                    }
                    else if (buy[0] == 57) {
                    }
                }
            }
        }
        updateHasTiliNaili(data) {
            for (let i = 0; i < data.length; i++) {
                let key = data[i][0];
                let value = data[i][1];
                if (key == 3) {
                    this.m_iTiliHasRecorvery = value;
                }
                else {
                    this.m_iNailiHasRecorvery = value;
                }
            }
        }
        updateMaxTiliNaili(data) {
            for (let i = 0; i < data.length; i++) {
                let key = data[i][0];
                let value = data[i][1];
                if (key == 3) {
                    this.m_iTiliMaxRecorvery = value;
                }
                else {
                    this.m_iNailiMaxRecorvery = value;
                }
            }
        }
        set maxps(value) {
            this.oldMaxPs = this._maxps;
            this._maxps = parseInt(value + "");
        }
        get maxendurance() {
            return this._maxendurance;
        }
        set maxendurance(value) {
            this.oldMaxEndurance = this._maxendurance;
            this._maxendurance = parseInt(value + "");
        }
        set salonBox(value) {
            this.deltaSalonBox = parseInt(value + "") - this._salonBox;
            this._salonBox = parseInt(value + "");
        }
        get wishCoint() {
            return this._wishCoint;
        }
        set wishCoint(value) {
            this.deltaWishCoin = parseInt(value + "") - this._wishCoint;
            this._wishCoint = parseInt(value + "");
        }
        get crystal() {
            return this._crystal;
        }
        set crystal(value) {
            this.deltaCrystal = parseInt(value + "") - this._crystal;
            this._crystal = parseInt(value + "");
        }
        get money6() {
            return this._money6;
        }
        set money6(value) {
            this.deltaExp = parseInt(value + "") - this._money6;
            this._money6 = parseInt(value + "");
        }
        get stamp() {
            return this._stamp;
        }
        set stamp(value) {
            this.deltaStamp = parseInt(value + "") - this._stamp;
            this._stamp = parseInt(value + "");
        }
        get money4() {
            return this._money4;
        }
        set money4(value) {
            this.deltaEndurance = parseInt(value + "") - this._money4;
            this._money4 = parseInt(value + "");
        }
        get money3() {
            return this._money3;
        }
        set money3(value) {
            this.deltaPs = parseInt(value + "") - this._money3;
            this._money3 = parseInt(value + "");
        }
        get money2() {
            return this._money2;
        }
        get getIcon() {
            return GameResourceManager.instance.setResURL("icon/roleIcon/potrait_" + this.icon + ".png");
        }
        set money2(value) {
            this.deltaDiamon = parseInt(value + "") - this._money2;
            this._money2 = parseInt(value + "");
        }
        get money1() {
            return this._money1;
        }
        set money1(value) {
            this.deltaGold = parseInt(value + "") - this._money1;
            this._money1 = parseInt(value + "");
        }
        initRoleInfo(info) {
            this.roleId = info[0];
            this.roleName = info[1];
            this.icon = info[2];
            GlobalDataManager.instance.moneyInfoHander([info[3]], true, false);
            let cloths = info[4];
            this.sceneid = info[5];
            this.color = info[6];
            this.newPlayer = info[7];
            this.initCloths(cloths);
            console.log("-------------------------------------------------skin color--------------");
            console.log("---------------------------------------------------------------------");
        }
        initCloths(data) {
            this.m_dicCloth = new Dictionary();
            let itemVo;
            console.log("-------------------------------------------------cloth data--------------");
            for (let i = 0; i < data.length; i++) {
                itemVo = new ItemVo();
                itemVo.m_iChildType = data[i][0];
                itemVo.m_iId = data[i][1];
                this.m_dicCloth.set(itemVo.m_iChildType, itemVo);
            }
            console.log("---------------------------------------------------------------------");
            GlobalRoleDataManger.m_dicSkin = this.m_dicCloth;
        }
        setClothToOriginal(dic = null) {
            if (!dic) {
                dic = GlobalDataManager.instance.roleInfo.m_dicCloth;
            }
            console.log("setClothToOriginal");
            let childTypeArr = dic.keys;
            for (let i = 0; i < childTypeArr.length; i++) {
                let itemVo = dic.get(childTypeArr[i]);
                if (itemVo && itemVo.m_bTry) {
                    itemVo.m_iId = itemVo.m_iOriginalId;
                }
            }
        }
        getSkinDic(value) {
            let dic = new Dictionary();
            for (let info of value) {
                let vo = new ItemVo();
                vo.m_iId = parseInt(info[1] + "");
                vo.m_iChildType = info[0];
                dic.set(vo.m_iChildType, vo);
            }
            return dic;
        }
        cloneClothDic() {
            let data = new Dictionary();
            let dic = GlobalDataManager.instance.roleInfo.m_dicCloth;
            console.log("setClothToOriginal");
            for (let i = 0; i < dic.values.length; i++) {
                let itemVo = dic.values[i];
                data.set(itemVo.m_iChildType, itemVo);
            }
            return data;
        }
        setClothToNull(exceptParentType) {
            for (let type of this.m_dicCloth.keys) {
                let itemVo = this.m_dicCloth.get(type);
                if (!itemVo || !itemVo.m_itemVo) {
                    continue;
                }
                if (itemVo.m_itemVo.paren_type.toString() == exceptParentType.toString()) {
                    continue;
                }
                this.m_dicCloth.get(type).m_iId = 0;
            }
        }
        get getChangeCloth() {
            let dataArr = [];
            let childTypeArr = this.m_dicCloth.keys;
            for (let i = 0; i < childTypeArr.length; i++) {
                let itemVo = GlobalDataManager.instance.roleInfo.m_dicCloth.get(childTypeArr[i]);
                if (itemVo && itemVo.m_bTry) {
                    dataArr.push([itemVo.m_iChildType, itemVo.m_iId]);
                }
            }
            return dataArr;
        }
        get getAllClothsTypeAndId() {
            let dataArr = [];
            let childTypeArr = this.m_dicCloth.keys;
            for (let i = 0; i < childTypeArr.length; i++) {
                let itemVo = GlobalDataManager.instance.roleInfo.m_dicCloth.get(childTypeArr[i]);
                if (itemVo) {
                    dataArr.push([itemVo.m_iChildType, itemVo.m_iId]);
                }
            }
            return dataArr;
        }
        get allCloths() {
            let dataArr = [];
            let childTypeArr = this.m_dicCloth.keys;
            for (let i = 0; i < childTypeArr.length; i++) {
                let itemVo = GlobalDataManager.instance.roleInfo.m_dicCloth.get(childTypeArr[i]);
                if ((itemVo && itemVo.m_itemVo) && itemVo.m_itemVo.paren_type != 2) {
                    dataArr.push(itemVo);
                }
            }
            return dataArr;
        }
        get getChangeIdArr() {
            let dataArr = [];
            let childTypeArr = GlobalDataManager.instance.roleInfo.m_dicCloth.keys;
            for (let i = 0; i < childTypeArr.length; i++) {
                let itemVo = GlobalDataManager.instance.roleInfo.m_dicCloth.get(childTypeArr[i]);
                if (itemVo.m_bTry) {
                    dataArr.push(itemVo.m_iId);
                }
            }
            return dataArr;
        }
        get getChangeTypeArr() {
            let dataArr = [];
            let childTypeArr = GlobalDataManager.instance.roleInfo.m_dicCloth.keys;
            for (let i = 0; i < childTypeArr.length; i++) {
                let itemVo = GlobalDataManager.instance.roleInfo.m_dicCloth.get(childTypeArr[i]);
                if (itemVo && itemVo.m_iId != 0) {
                    dataArr.push(itemVo.m_iChildType);
                }
            }
            return dataArr;
        }
        get faceRating() {
            let result = 0;
            return result;
        }
        getConsumeValue(itemId) {
            itemId = parseInt(itemId.toString());
            switch (itemId) {
                case EnumConsumeType.TYPE_GOLD:
                    {
                        return this.money1;
                    }
                    break;
                case EnumConsumeType.TYPE_DIAMOND:
                    {
                        return this.money2;
                    }
                    break;
                case EnumConsumeType.TYPE_PS:
                    {
                        return this.money3;
                    }
                    break;
                case EnumConsumeType.TYPE_ENDURANCE:
                    {
                        return this.money4;
                    }
                    break;
                case EnumConsumeType.TYPE_STAMP:
                    {
                        return this.stamp;
                    }
                    break;
                case EnumConsumeType.TYPE_Crystal_Shoes:
                    {
                        return this.crystal;
                    }
                    break;
                case EnumConsumeType.TYPE_WISH_COIN:
                    {
                        return this.wishCoint;
                    }
                    break;
                case EnumConsumeType.TYPE_Beauty_Box:
                    {
                        return this.salonBox;
                    }
                    break;
                case EnumConsumeType.TYPE_Guild:
                    {
                        return this.guildVouchers;
                    }
                    break;
                case EnumConsumeType.TYPE_GOLD_CRYSTAL:
                    {
                        return this.goldCrystal;
                    }
                    break;
                case EnumConsumeType.TYPE_Gold_finger:
                    {
                        return this.goldFinger;
                    }
                    break;
                case EnumConsumeType.TYPE_SlotMachine:
                    {
                        return this.slotMachine;
                    }
                    break;
                case EnumConsumeType.TYPE_LuckWheel:
                    {
                        return this.luckWheel;
                    }
                    break;
                case EnumConsumeType.TYPE_Gashapon:
                    {
                        return this.gashapon;
                    }
                    break;
                case EnumConsumeType.TYPE_CHOCO_LATE:
                    {
                        return this.chocolate;
                    }
                    break;
                case EnumConsumeType.TYPE_LOVE:
                    {
                        return this.love;
                    }
                    break;
                case EnumConsumeType.TYPE_imperial_crown:
                    {
                        return this.imperialCrown;
                    }
                    break;
                case EnumConsumeType.TYPE_SUPER_LOVE:
                    {
                        return this.superLove;
                    }
                    break;
                case EnumConsumeType.TYPE_TIME_STAGE_COIN:
                    {
                        return this.timeStageCoint;
                    }
                    break;
                case EnumConsumeType.TYPE_STOKEN:
                    {
                        return this.sToken;
                    }
                    break;
                case EnumConsumeType.TYPE_GOLD_SCISSORS:
                    {
                        return this.gold_scissors;
                    }
                    break;
                case EnumConsumeType.TYPE_SILVER_SCISSORS:
                    {
                        return this.silver_scissors;
                    }
                    break;
                case EnumConsumeType.TYPE_BRUSH:
                    {
                        return this.brush;
                    }
                    break;
                case EnumConsumeType.TYPE_REBORN:
                    {
                        return this.answerRebornCoin;
                    }
                    break;
                case EnumConsumeType.TYPE_TV_JP:
                    {
                    }
                    break;
            }
            return 0;
        }
        hasEnoughMoney(id, cost, showTip = true) {
            id = parseInt(id.toString());
            cost = parseInt(cost.toString());
            switch (id) {
                case EnumConsumeType.TYPE_GOLD:
                    {
                        if (this.money1 < cost && showTip) {
                            Signal.intance.event("open_buy", 3);
                        }
                        return this.money1 >= cost;
                    }
                    break;
                case EnumConsumeType.TYPE_DIAMOND:
                    {
                        if (this.money2 < cost && showTip) {
                            Signal.intance.event("open_buy", 4);
                        }
                        return this.money2 >= cost;
                    }
                    break;
                case EnumConsumeType.TYPE_PS:
                    {
                        if (this.money3 < cost && showTip) {
                            Signal.intance.event("open_buy", 1);
                        }
                        return this.money3 >= cost;
                    }
                    break;
                case EnumConsumeType.TYPE_ENDURANCE:
                    {
                        if (this.money4 < cost && showTip) {
                            Signal.intance.event("open_buy", 2);
                        }
                        return this.money4 >= cost;
                    }
                    break;
                case EnumConsumeType.TYPE_STAMP:
                    {
                        if (this.stamp < cost && showTip) {
                            NoticeMgr.instance.notice(GameLanguageMgr.instance.getLanguage("20003"));
                        }
                        return this.stamp >= cost;
                    }
                    break;
                case EnumConsumeType.TYPE_Crystal_Shoes:
                    {
                        if (this.crystal < cost && showTip) {
                            NoticeMgr.instance.notice(GameLanguageMgr.instance.getLanguage("20004"));
                        }
                        return this.crystal >= cost;
                    }
                    break;
                case EnumConsumeType.TYPE_WISH_COIN:
                    {
                        if (this.wishCoint < cost && showTip) {
                            NoticeMgr.instance.notice(GameLanguageMgr.instance.getLanguage("20005"));
                        }
                        return this.wishCoint >= cost;
                    }
                    break;
                case EnumConsumeType.TYPE_Beauty_Box:
                    {
                        if (this.salonBox < cost && showTip) {
                            NoticeMgr.instance.notice(GameLanguageMgr.instance.getLanguage("20006"));
                        }
                        return this.salonBox >= cost;
                    }
                    break;
                case EnumConsumeType.TYPE_Guild:
                    {
                        if (this.guildVouchers < cost && showTip) {
                            NoticeMgr.instance.notice(GameLanguageMgr.instance.getLanguage("20014"));
                        }
                        return this.guildVouchers >= cost;
                    }
                    break;
                case EnumConsumeType.TYPE_GOLD_CRYSTAL:
                    {
                        if (this.goldCrystal < cost && showTip) {
                            NoticeMgr.instance.notice(GameLanguageMgr.instance.getLanguage("20023"));
                        }
                        return this.goldCrystal >= cost;
                    }
                    break;
                case EnumConsumeType.TYPE_Gold_finger:
                    {
                        if (this.goldFinger < cost && showTip) {
                            NoticeMgr.instance.notice(GameLanguageMgr.instance.getLanguage("20025"));
                        }
                        return this.goldFinger >= cost;
                    }
                    break;
                case EnumConsumeType.TYPE_SlotMachine:
                    {
                        if (this.slotMachine < cost && showTip) {
                            NoticeMgr.instance.notice(GameLanguageMgr.instance.getLanguage("20025"));
                        }
                        return this.slotMachine >= cost;
                    }
                    break;
                case EnumConsumeType.TYPE_LuckWheel:
                    {
                        if (this.luckWheel < cost && showTip) {
                            NoticeMgr.instance.notice(GameLanguageMgr.instance.getLanguage("20025"));
                        }
                        return this.luckWheel >= cost;
                    }
                    break;
                case EnumConsumeType.TYPE_Gashapon:
                    {
                        if (this.gashapon < cost && showTip) {
                            NoticeMgr.instance.notice(GameLanguageMgr.instance.getLanguage("20025"));
                        }
                        return this.gashapon >= cost;
                    }
                    break;
                case EnumConsumeType.TYPE_CHOCO_LATE:
                    {
                        if (this.chocolate < cost && showTip) {
                            NoticeMgr.instance.notice(GameLanguageMgr.instance.getLanguage("5151"));
                        }
                        return this.chocolate >= cost;
                    }
                    break;
                case EnumConsumeType.TYPE_LOVE:
                    {
                        if (this.love < cost && showTip) {
                            NoticeMgr.instance.notice(GameLanguageMgr.instance.getLanguage("5164"));
                        }
                        return this.love >= cost;
                    }
                    break;
                case EnumConsumeType.TYPE_imperial_crown:
                    {
                        if (this.imperialCrown < cost && showTip) {
                            NoticeMgr.instance.notice(GameLanguageMgr.instance.getLanguage("5191"));
                        }
                        return this.imperialCrown >= cost;
                    }
                    break;
                case EnumConsumeType.TYPE_SUPER_LOVE:
                    {
                        if (this.superLove < cost && showTip) {
                            NoticeMgr.instance.notice(GameLanguageMgr.instance.getLanguage("5192"));
                        }
                        return this.superLove >= cost;
                    }
                    break;
                case EnumConsumeType.TYPE_TIME_STAGE_COIN:
                    {
                        if (this.timeStageCoint < cost && showTip) {
                            NoticeMgr.instance.notice(GameLanguageMgr.instance.getLanguage("20026"));
                        }
                        return this.timeStageCoint >= cost;
                    }
                    break;
                case EnumConsumeType.TYPE_STOKEN:
                    {
                        if (this.sToken < cost && showTip) {
                            NoticeMgr.instance.notice(GameLanguageMgr.instance.getLanguage("5430"));
                        }
                        return this.sToken >= cost;
                    }
                    break;
                default:
                    {
                        return true;
                    }
                    break;
            }
        }
    }

    class VipInfo {
        constructor() {
            this._vipLv = 0;
        }
        isReceive(vipLel) {
            for (let level of this.isRewards) {
                if (level + "" == vipLel.toString()) {
                    return true;
                }
            }
            return false;
        }
        addIsReceive(vipLevel) {
            if (!this.isReceive(vipLevel)) {
                this.isRewards.push(vipLevel);
            }
        }
        get vipLv() {
            return this._vipLv;
        }
        set vipLv(value) {
            if (this._vipLv != value) {
                this._vipLv = value;
            }
        }
    }

    class GetItemService {
        constructor() {
            this._isPop = false;
            Signal.intance.on(GameEvent.EVENT_CLOSE_MODULE, this, this.onCloseModuel);
        }
        static get instance() {
            if (!GetItemService._instance) {
                GetItemService._instance = new GetItemService();
            }
            return GetItemService._instance;
        }
        get model() {
            return GetItemDataModel.instance;
        }
        get isPop() {
            return this._isPop;
        }
        startShow() {
            if (!this._isPop && this.model.hasRemain()) {
                this._isPop = true;
                Signal.intance.event(GameEvent.EVENT_OPEN_MODULE, ModuleName.GetItemDialog);
            }
        }
        onCloseModuel(data) {
            if (data == ModuleName.GetItemDialog) {
                if (this.model.hasRemain()) {
                    Signal.intance.event(GameEvent.EVENT_OPEN_MODULE, ModuleName.GetItemDialog);
                }
                else {
                    this._isPop = false;
                }
            }
        }
    }
    class singClass {
    }

    class GetItemDataModel {
        constructor(cls) {
            this._list = [];
            this.needPop = true;
            this.autoPop = true;
        }
        static get instance() {
            if (!GetItemDataModel._instance) {
                GetItemDataModel._instance = new GetItemDataModel(new singClass$1());
            }
            return GetItemDataModel._instance;
        }
        get service() {
            return GetItemService.instance;
        }
        addItem(itemVo, isAutoShow = false) {
            let copyItem = new ItemVo();
            copyItem.m_iId = itemVo.m_iId;
            copyItem.newAddCnt = itemVo.newAddCnt;
            copyItem.m_iLevel = itemVo.m_iLevel;
            copyItem.isLvUp = itemVo.isLvUp;
            copyItem.m_bNew = itemVo.m_bNew;
            this._list.push(copyItem);
            if (isAutoShow) {
                this.service.startShow();
            }
        }
        addItems(value, isAutoShow = false) {
            this._list = this._list.concat(value);
            if (isAutoShow) {
                this.service.startShow();
            }
        }
        hasRemain() {
            if (this._list.length > 0) {
                return true;
            }
            else {
                return false;
            }
        }
        get needListener() {
            return this._list.length >= 2;
        }
        addConsumeByServer(info) {
            this._list.push(info);
        }
        addConsume(id, count) {
            this._list.push([id, count]);
        }
        getNextItem() {
            if (this._list.length > 0) {
                return this._list[0];
            }
            else {
                return null;
            }
        }
        getOneItem() {
            if (this._list.length > 0) {
                return this._list.shift();
            }
            else {
                return null;
            }
        }
    }
    class singClass$1 {
    }

    class FacePackageVo {
        constructor() {
            this._itemList = new Dictionary();
            this._childTypeList = new Dictionary();
        }
        get itemList() {
            return this._itemList;
        }
        initDataByArr(arr) {
            this._totalNum = arr[0];
            let item;
            for (let i = 0; i < arr[1].length; i++) {
                item = new ItemVo();
                item.initFaceDataByArr(arr[1][i]);
                this._itemList.set(item.m_iId, item);
                this.pushChildTypeList(item);
            }
        }
        pushChildTypeList(item) {
            let sheetItem = SheetDataManager.intance.m_dicItems.get(item.m_iId);
            if (!sheetItem) {
                return;
            }
            let list = this._childTypeList.get(sheetItem.child_type);
            if (!list) {
                list = [];
                this._childTypeList.set(sheetItem.child_type, list);
            }
            list.push(item);
        }
        getItemById(id) {
            return this._itemList.get(id);
        }
        hasItemById(id) {
            return this._itemList.keys.indexOf(id) >= 0;
        }
        getAllItems() {
            return this._itemList.values;
        }
        getItemsByChildType(childType) {
            if (this._childTypeList.keys.indexOf(childType) >= 0) {
                return this._childTypeList.get(childType);
            }
            else {
                return [];
            }
        }
        updataItemVoByArr(dataArr) {
            let addItems = [];
            let updateItemIds = [];
            let dispatchGetItem = false;
            for (let i = 0; i < dataArr.length; i++) {
                let itemVo = this._itemList.get(dataArr[i][0]);
                let isNew = false;
                if (!itemVo) {
                    itemVo = new ItemVo();
                    this._itemList.set(dataArr[i][0], itemVo);
                    isNew = true;
                }
                itemVo.initFaceDataByArr(dataArr[i]);
                updateItemIds.push(dataArr[i][0]);
                if (isNew) {
                    dispatchGetItem = true;
                    itemVo.newAddCnt = 1;
                    if (GetItemDataModel.instance.needPop) {
                        GetItemDataModel.instance.addItem(itemVo);
                    }
                    this.pushChildTypeList(itemVo);
                }
                if (dataArr[i][1] <= 0) {
                    this._itemList.remove(dataArr[i][0]);
                    let list = this._childTypeList.get(itemVo.m_iChildType);
                    if (list) {
                        list.splice(list.indexOf(itemVo), 1);
                    }
                }
            }
            if (updateItemIds.length > 0) {
            }
            if ((dispatchGetItem && GetItemDataModel.instance.needPop) && GetItemDataModel.instance.autoPop) {
                GetItemService.instance.startShow();
            }
        }
    }

    class SuitShowInfo extends BaseItem {
        constructor() {
            super();
            this.THIS_ID = "ID";
            this.ITEM_DROPS = ["composition"];
            this.TABLE_NAME = "suit";
        }
    }

    class SuitShowVo {
        get id() {
            return this._id;
        }
        set id(value) {
            this._id = value;
            this.suitInfo = SuitSheetDataManager.instance.getSuitById(this._id);
            if (this.suitInfo) {
                this.totalScore = this.suitInfo.totalScore;
            }
        }
        get realTotalItemNum() {
            return this.suitInfo.composition.length;
        }
        get realCurItemNum() {
            let real;
            for (let _comItemId of this.suitInfo.composition) {
                let _comItemCount = GlobalDataManager.instance.m_packageData.getCountById(_comItemId);
                if (_comItemCount > 0) {
                    real++;
                }
            }
            return real;
        }
    }

    class SuitTypeInfo {
        constructor() {
        }
    }

    class SuitSheetDataManager {
        constructor() {
            this.m_arrSuit = [];
            this.m_arrSuitItems = [];
        }
        static get instance() {
            if (!SuitSheetDataManager._instance) {
                SuitSheetDataManager._instance = new SuitSheetDataManager();
            }
            return SuitSheetDataManager._instance;
        }
        initSuit() {
            if (this.suitDic == null) {
                this.sameSuitTypeDic = new Dictionary();
                this.suitDic = new Dictionary();
                let json = GameResourceManager.instance.getResByURL("config/suit.json");
                let suitInfo;
                for (let value of json) {
                    suitInfo = new SuitShowInfo();
                    suitInfo.init(value);
                    let ifUse = parseInt(suitInfo.ifUse + "");
                    if (ifUse == 0) {
                        continue;
                        ;
                    }
                    this.suitDic.set(suitInfo.ID, suitInfo);
                    let totalScore = 0;
                    let composition = suitInfo.composition;
                    if (composition) {
                        for (let _comItemId of composition) {
                            totalScore += SuitSheetDataManager.instance.getScoreByItemId(_comItemId);
                        }
                    }
                    suitInfo.totalScore = totalScore;
                    let sameSuitTypes = this.sameSuitTypeDic.get(suitInfo.parentId);
                    if (!sameSuitTypes) {
                        sameSuitTypes = [];
                        this.sameSuitTypeDic.set(suitInfo.parentId, sameSuitTypes);
                    }
                    if (suitInfo.ID == suitInfo.parentId) {
                        sameSuitTypes.unshift(suitInfo);
                    }
                    else {
                        sameSuitTypes.push(suitInfo);
                    }
                }
            }
            return SuitSheetDataManager.instance;
        }
        getSameSuitTypesById(id) {
            return this.sameSuitTypeDic.get(id);
        }
        getSuitById(id) {
            this.initSuit();
            return this.suitDic.get(id);
        }
        getAllSuit() {
            this.initSuit();
            this.m_arrSuit = [];
            let suitInfo;
            for (let i = 0; i < this.suitDic.keys.length; i++) {
                suitInfo = this.suitDic.values[i];
                this.checkSuitOk(suitInfo);
            }
            return this.m_arrSuit;
        }
        checkSuitOk(suitInfo) {
            let allItemArr;
            let itemId;
            let arrItem = suitInfo.composition;
            for (let j = 0; j < arrItem.length; j++) {
                itemId = parseInt(arrItem[j]);
                if (allItemArr.indexOf(itemId) == -1) {
                    return false;
                }
            }
            this.m_arrSuit.push(suitInfo);
            return true;
        }
        getSuitsBySuitType(suitType, sex, justNormal = false) {
            this.initSuit();
            let suits = [];
            for (let suitInfo of this.suitDic.values) {
                if (suitInfo.style == suitType && parseInt(suitInfo.sex) == sex) {
                    let suitVo = new SuitShowVo();
                    suitVo.id = suitInfo.ID;
                    if (justNormal) {
                        if (suitVo.suitInfo.suitType == 1) {
                            suits.push(suitVo);
                        }
                    }
                    else {
                        suits.push(suitVo);
                    }
                }
            }
            return suits;
        }
        getSuitsBySuitTypeWithoutSex(suitType) {
            this.initSuit();
            let suits = [];
            for (let suitInfo of this.suitDic.values) {
                if (suitInfo.style == suitType) {
                    let suitVo = new SuitShowVo();
                    suitVo.id = suitInfo.ID;
                    suits.push(suitVo);
                }
            }
            return suits;
        }
        getOutfitSuits() {
            this.initSuit();
            let suits = [];
            for (let suitInfo of this.suitDic.values) {
                if (suitInfo.produce == 2) {
                    let suitVo = new SuitShowVo();
                    suitVo.id = suitInfo.ID;
                    suits.push(suitVo);
                }
            }
            return suits;
        }
        initSuitType() {
            if (this.simpleSuitTypeDic == null) {
                this.simpleSuitTypeDic = new Dictionary();
                let m_dicStyle = SheetDataManager.intance.m_dicStyle;
                for (let value of m_dicStyle.values) {
                    if (value.styleID != -10000) {
                        let suitTypeInfo = new SuitTypeInfo();
                        suitTypeInfo.id = value.styleID;
                        suitTypeInfo.name = value.style;
                        suitTypeInfo.icon = value.icon;
                        this.simpleSuitTypeDic.set(suitTypeInfo.id, suitTypeInfo);
                    }
                }
            }
        }
        getSuitTypes() {
            return [];
        }
        getSuitTypeById(id, type) {
            this.initSuitType();
            return this.simpleSuitTypeDic.get(id);
        }
        getScoreByItemId(_comItemId) {
            return 0;
        }
    }

    class PackageVo {
        constructor() {
            this.m_dicItemList = new Dictionary();
            this.m_dicParentTypeList = new Dictionary();
            this.m_dicChildTypeList = new Dictionary();
            this.m_dicStyleTypeList = new Dictionary();
        }
        initDataByArr(arr, isSet = true) {
            if (isSet) {
                this.m_iType = arr[0];
                this.m_iTotalNum = arr[1];
            }
            console.log("背包类型：" + this.m_iType + "   总数量：" + this.m_iTotalNum);
            if (!this.m_dicItemList) {
                this.m_dicItemList = new Dictionary();
            }
            if (!this.m_dicChildTypeList) {
                this.m_dicChildTypeList = new Dictionary();
            }
            if (!this.m_dicStyleTypeList) {
                this.m_dicStyleTypeList = new Dictionary();
            }
            let item;
            for (let i = 0; i < arr[2].length; i++) {
                item = new ItemVo();
                item.initDataByArr(arr[2][i]);
                this.pushItem(item);
            }
        }
        pushItem(item) {
            this.m_dicItemList.set(item.m_iId, item);
            if (this.m_dicParentTypeList.get(item.m_iParentType) == null) {
                this.m_dicParentTypeList.set(item.m_iParentType, []);
            }
            if (this.m_dicChildTypeList.get(item.m_iChildType) == null) {
                this.m_dicChildTypeList.set(item.m_iChildType, []);
            }
            if (this.m_dicStyleTypeList.get(item.m_iStyleType) == null) {
                this.m_dicStyleTypeList.set(item.m_iStyleType, []);
            }
            this.m_dicParentTypeList.get(item.m_iParentType).push(item);
            this.m_dicChildTypeList.get(item.m_iChildType).push(item);
            if (this.m_dicStyleTypeList.get(item.m_iStyleType) == null) {
                console.log("类型错误");
            }
            else {
                this.m_dicStyleTypeList.get(item.m_iStyleType).push(item);
            }
        }
        removeItem(item) {
            this.m_dicItemList.remove(item.m_iId);
            let removeOne = function (arr, vo) {
                if (!arr || !vo) {
                    return;
                }
                if (arr.indexOf(vo) >= 0) {
                    arr.splice(arr.indexOf(vo), 1);
                }
            };
            removeOne(this.m_dicParentTypeList.get(item.m_iParentType), item);
            removeOne(this.m_dicChildTypeList.get(item.m_iChildType), item);
            removeOne(this.m_dicStyleTypeList.get(item.m_iStyleType), item);
        }
        updataItemVoByVo(item) {
            this.pushItem(item);
        }
        updataItemVoByArr(dataArr, _totalNum, isLvUp = false) {
            this.m_iTotalNum = _totalNum;
            let updateIds = [];
            let dispatchGetItem = false;
            let itemArr = [];
            for (let i = 0; i < dataArr.length; i++) {
                itemArr = dataArr[i];
                let itemVo = this.m_dicItemList.get(itemArr[0]);
                if (itemVo == null) {
                    itemVo = new ItemVo(itemArr[0]);
                    itemVo.m_bNew = true;
                    if (isLvUp) {
                        itemVo.newAddCnt = 1;
                    }
                    else {
                        itemVo.newAddCnt = itemArr[1];
                    }
                    let suitInfo = SuitSheetDataManager.instance.getSuitById(itemVo.m_itemVo.parent_suite);
                    if (suitInfo) {
                        SuitSheetDataManager.instance.checkSuitOk(suitInfo);
                    }
                    if (itemVo.newAddCnt > 0) {
                        this.pushItem(itemVo);
                    }
                }
                else {
                    if (isLvUp) {
                        itemVo.newAddCnt = 1;
                    }
                    else {
                        itemVo.newAddCnt = itemArr[1] - itemVo.m_iNum;
                    }
                }
                itemVo.isLvUp = isLvUp;
                itemVo.initDataByArr(itemArr);
                updateIds.push(itemVo.m_iId);
                if (itemVo.m_iNum <= 0) {
                    this.removeItem(itemVo);
                }
                if (itemVo.newAddCnt > 0 && GetItemDataModel.instance.needPop) {
                    if (itemVo.m_itemVo.child_type.toString() == EnumeCatagoryChildType.PET.toString() && itemVo.m_itemVo.itm_type.toString() == EnumItemType.Item_Type_Items.toString()) {
                        return;
                    }
                    GetItemDataModel.instance.addItem(itemVo);
                    dispatchGetItem = true;
                }
            }
            if ((dispatchGetItem && GetItemDataModel.instance.needPop) && GetItemDataModel.instance.autoPop) {
                GetItemService.instance.startShow();
            }
            if (updateIds.length > 0) {
                Signal.intance.event(GameEvent.PACKAGE_UPDATE_ITEM, [updateIds]);
            }
        }
        getItemByTypeId(typeId) {
            let item = this.m_dicItemList.get(typeId);
            return item;
        }
        getItemsByChildType(childType) {
            let items = this.m_dicChildTypeList.get(childType);
            if (items == null) {
                items = [];
            }
            return items;
        }
        getListByChildType(childType, style = -10000, sex = 0) {
            let items = [];
            for (let i = 0; i < this.m_dicItemList.values.length; i++) {
                let itemVo = this.m_dicItemList.values[i];
                if (itemVo.m_iChildType == childType) {
                    if (style != -10000) {
                        if (itemVo.m_iStyleType.indexOf(style + "") != -1) {
                            if (parseInt(itemVo.m_itemVo.m_iSex + "") == sex) {
                                items.push(itemVo);
                            }
                        }
                    }
                    else {
                        if (parseInt(itemVo.m_itemVo.m_iSex + "") == sex) {
                            items.push(itemVo);
                        }
                    }
                }
            }
            items.sort(this.sortOnQa);
            return items;
        }
        getListByParentType(parentType, style = -10000, sex = 0) {
            let items = [];
            for (let i = 0; i < this.m_dicItemList.values.length; i++) {
                let itemVo = this.m_dicItemList.values[i];
                if (itemVo.m_iParentType == parentType) {
                    if (style != -10000) {
                        if (itemVo.m_iStyleType.indexOf(style + "") != -1) {
                            if (parseInt(itemVo.m_itemVo.m_iSex + "") == sex) {
                                items.push(itemVo);
                            }
                        }
                    }
                    else {
                        if (parseInt(itemVo.m_itemVo.m_iSex + "") == sex) {
                            items.push(itemVo);
                        }
                    }
                }
            }
            items.sort(this.sortOnQa);
            return items;
        }
        sortOnQa(a, b) {
            let aState = a.m_itemVo.item_quality;
            let bState = b.m_itemVo.item_quality;
            if (aState < bState) {
                return 1;
            }
            else if (aState > bState) {
                return -1;
            }
            else {
                return 0;
            }
        }
        getItemsByStyle(styleType) {
            let items = this.m_dicStyleTypeList.get(styleType);
            if (items == null) {
                items = [];
            }
            return items;
        }
        getItemCountByTypeId(typeId, needLv = true) {
            let itemVo = this.getItemByTypeId(typeId);
            if (itemVo) {
                if (needLv) {
                    return itemVo.m_iNum;
                }
                else {
                    return itemVo.m_BaseNum;
                }
            }
            else {
                return 0;
            }
        }
    }

    class PackageData {
        constructor() {
            this.m_dicPackageData = new Dictionary();
            for (let i = 1; i < 7; i++) {
                let packVo = new PackageVo();
                this.m_dicPackageData.set(i, packVo);
            }
        }
        initData(data) {
            let packVo = new PackageVo();
            packVo.initDataByArr(data);
            this.m_dicPackageData.set(packVo.m_iType, packVo);
            if (packVo.m_iType.toString() == "6") {
            }
            console.log("@@@@@@@@@@@@@@@@@@-----------------------------------------packVo: " + packVo.m_iType);
        }
        updateData(data) {
            console.dir("更新背包：" + data);
            let packVo = this.m_dicPackageData.get(data[0]);
            if (packVo) {
                packVo.updataItemVoByArr(data[1], data[2], data[3]);
            }
            else {
                console.log("Error -->更新背包数据 updateData:没有该类型的数据：" + data[0]);
            }
        }
        getDataByType(type) {
            return this.m_dicPackageData.get(type);
        }
        get clothData() {
            return this.m_dicPackageData.get(PackageData.TYPE_CLOTH);
        }
        get goodsData() {
            return this.m_dicPackageData.get(PackageData.TYPE_GOODS);
        }
        get chipData() {
            return this.m_dicPackageData.get(PackageData.TYPE_CHIP);
        }
        get designData() {
            return this.m_dicPackageData.get(PackageData.TYPE_DESIGN);
        }
        get faceData() {
            return this.m_dicPackageData.get(PackageData.TYPE_FACE);
        }
        get facechipData() {
            return this.m_dicPackageData.get(PackageData.TYPE_FACECHIP);
        }
        getClothDataByChildType() {
        }
        getCountById(itemId, needLv = true) {
            if (EnumConsumeType.isConsumeType(itemId)) {
                return GlobalDataManager.instance.roleInfo.getConsumeValue(itemId);
            }
            let item = SheetDataManager.intance.m_dicItems.get(itemId);
            if (item == null) {
                return 0;
            }
            if ((((item.child_type.toString() == EnumeCatagoryChildType.MODEL.toString() || item.child_type.toString() == EnumeCatagoryChildType.Hair.toString()) || item.child_type.toString() == EnumeCatagoryChildType.SCENE_STORE_BG.toString()) || item.child_type.toString() == EnumeCatagoryChildType.SCENE_HOME_BG.toString()) && item.itm_type.toString() != EnumItemType.Item_Type_Fragment.toString()) {
                let itemVO = GlobalDataManager.instance.facePackageVO.getItemById(itemId);
                return itemVO ? itemVO.m_iNum : 0;
            }
            let packVO = this.m_dicPackageData.get(item.itm_type);
            if (packVO) {
                return packVO.getItemCountByTypeId(itemId, needLv);
            }
            else {
                return 0;
            }
        }
        getFaceShipItemVoByItemId(itemId) {
            let packVO = this.m_dicPackageData.get(PackageData.TYPE_FACECHIP);
            if (packVO) {
                return packVO.getItemByTypeId(itemId);
            }
            else {
                return null;
            }
        }
        getItemVoByItemId(itemId, type) {
            let packVO = this.m_dicPackageData.get(type);
            if (packVO) {
                return packVO.getItemByTypeId(itemId);
            }
            else {
                return null;
            }
        }
    }
    PackageData.TYPE_CLOTH = 1;
    PackageData.TYPE_GOODS = 2;
    PackageData.TYPE_CHIP = 3;
    PackageData.TYPE_DESIGN = 4;
    PackageData.TYPE_FACE = 5;
    PackageData.TYPE_FACECHIP = 6;
    PackageData.TYPE_FACE_FIVE_FEACE = 7;

    class CommentModel {
        constructor() {
        }
        static get instance() {
            if (CommentModel._instance == null) {
                CommentModel._instance = new CommentModel();
            }
            return CommentModel._instance;
        }
        openCommentDialog(_type = 0) {
            if (GameSetting.m_bInstantGame == true || GameSetting.isPC) {
                return;
            }
            if (Laya.Browser.onAndroid) {
                return;
            }
            if (this.reviewstate > 0) {
                return;
            }
            Signal.intance.event(GameEvent.EVENT_OPEN_MODULE, [ModuleName.CommentDialog, _type]);
        }
    }

    class Cmd {
        static RECV_MSG(cmdId) {
            return "msg_" + cmdId;
        }
    }
    Cmd.MSG_ROLE_UPDATE_KNEAD_FACE_S2C = 2700;
    Cmd.MSG_BUY_SUIT_NPC_C2S = 87;
    Cmd.MSG_BUY_SUIT_NPC_S2C = 88;
    Cmd.MSG_INIT_WISHING_TREE_C2S = 112;
    Cmd.MSG_WISHING_TREE_C2S = 113;
    Cmd.MSG_WISHING_TREE_FREE_C2S = 114;
    Cmd.MSG_INIT_WISHING_TREE_EXCHANGE_C2S = 115;
    Cmd.MSG_WISHING_TREE_EXCHANGE_REWARD_C2S = 116;
    Cmd.MSG_WISHING_TREE_FREE_S2C = 117;
    Cmd.MSG_INIT_WISHING_TREE_S2C = 118;
    Cmd.MSG_WISHING_TREE_S2C = 119;
    Cmd.MSG_INIT_WISHING_TREE_EXCHANGE_S2C = 120;
    Cmd.MSG_INIT_SUIT_COLLECT_S2C = 130;
    Cmd.MSG_SUIT_COLLECT_REWARD_C2S = 131;
    Cmd.MSG_ACTIVE_CHECKIN_INIT_C2S = 2310;
    Cmd.MSG_ACTIVE_CHECKIN_INIT_S2C = 2311;
    Cmd.MSG_ACTIVE_CHECKIN_GET_REWARD_C2S = 2312;
    Cmd.MSG_ACTIVE_CHECKIN_GET_REWARD_S2C = 2313;
    Cmd.MSG_ACTIVE_DRAWING_SHOP_INIT_C2S = 2320;
    Cmd.MSG_ACTIVE_DRAWING_SHOP_INIT_S2C = 2321;
    Cmd.MSG_ACTIVE_DRAWING_SHOP_BUY_C2S = 2322;
    Cmd.MSG_ACTIVE_DRAWING_SHOP_BUY_S2C = 2323;
    Cmd.MSG_INIT_ACTIVE_TASK_C2S = 800;
    Cmd.MSG_INIT_ACTIVE_TASK_S2C = 801;
    Cmd.MSG_FINISH_ACTIVE_TASK_C2S = 802;
    Cmd.MSG_INIT_EVERYDAY_QUEST_C2S = 83;
    Cmd.MSG_INIT_EVERYDAY_QUEST_S2C = 84;
    Cmd.MSG_FINISH_EVERYDAY_QUEST_C2S = 85;
    Cmd.MSG_REWARD_ACTIVE_SCORE_GIFT_C2S = 176;
    Cmd.MSG_ACTIVE_SCORE_PRAY_C2S = 177;
    Cmd.MSG_UPDATE_VITALITY_REWARD_S2C = 2401;
    Cmd.MSG_GET_PVP_GRADE_S2C = 157;
    Cmd.MSG_SYS_BASE_INFO_S2C = 158;
    Cmd.MSG_GET_PVP_RANK_RESULT_S2C = 278;
    Cmd.MSG_INIT_ROLE_GUIDE_S2C = 320;
    Cmd.MSG_FINISH_GUIDE_C2S = 321;
    Cmd.MSG_SET_SHOP_BACKGROUND_C2S = 332;
    Cmd.MSG_INIT_SHOP_BACKGROUND_S2C = 333;
    Cmd.MSG_INIT_MY_SHOP_CLOTHS_S2C = 350;
    Cmd.MSG_INIT_MY_SHOP_CLOTHS_C2S = 351;
    Cmd.MSG_GET_ROLE_INFO_C2S = 163;
    Cmd.MSG_GET_ROLE_INFO_S2C = 164;
    Cmd.MSG_LIKE_GET_LIKE_RANK_INFO_C2S = 635;
    Cmd.MSG_LIKE_GET_LIKE_RANK_INFO_S2C = 636;
    Cmd.MSG_LIKE_GET_RESULT_INFO_S2C = 637;
    Cmd.MSG_THUMB_JUDGE_INIT_S2C = 640;
    Cmd.MSG_THUMB_JUDGE_GET_C2S = 641;
    Cmd.MSG_LIKE_GET_APPLY_REWARD_C2S = 642;
    Cmd.MSG_LIKE_GET_APPLY_REWARD_S2C = 643;
    Cmd.MSG_LIKE_RESIDUE_TIME_S2C = 644;
    Cmd.MSG_GET_PVP_ROLE_INFOS_C2S = 385;
    Cmd.MSG_GET_PVP_ROLE_INFOS_S2C = 386;
    Cmd.MSG_INIT_TITLE_C2S = 387;
    Cmd.MSG_INIT_TITLE_S2C = 388;
    Cmd.MSG_GET_TITLE_REWARD_C2S = 389;
    Cmd.MSG_GET_TITLE_REWARD_S2C = 390;
    Cmd.MSG_REPORT_SHOW_LEVEL_UP_C2S = 391;
    Cmd.MSG_INIT_REVIEW_RECORD_C2S = 755;
    Cmd.MSG_RESULT_REVIEW_RECORD_S2C = 756;
    Cmd.MSG_INIT_ACTIVITY_AG_S2C = 779;
    Cmd.MSG_INIT_ACTIVITY_AD_S2C = 780;
    Cmd.MSG_ACTIVE_TASK_AD_C2S = 803;
    Cmd.MSG_BUY_ITEMS_C2S = 184;
    Cmd.MSG_MULTI_PVP_INIT_C2S = 1101;
    Cmd.MSG_MULTI_PVP_RANK_INFO_S2C = 1102;
    Cmd.MSG_MULTI_PVP_CHALLENGE_C2S = 1103;
    Cmd.MSG_MULTI_PVP_START_S2C = 1104;
    Cmd.MSG_MULTI_PVP_CHALLENGE_END_C2S = 1105;
    Cmd.MSG_MULTI_PVP_CHALLENGE_RESULT_S2C = 1106;
    Cmd.MSG_MULTI_PVP_LOG_INIT_C2S = 1107;
    Cmd.MSG_MULTI_PVP_LOG_INIT_S2C = 1108;
    Cmd.MSG_MULTI_PVP_REFRESH_C2S = 1109;
    Cmd.MSG_MULTI_PVP_BUY_TIMES_C2S = 1110;
    Cmd.MSG_MULTI_PVP_CHALLENGE_TIMES_UPDATE_S2C = 1111;
    Cmd.MSG_GET_MULTI_PVP_RANK_RESULT_S2C = 1115;
    Cmd.MSG_MULTI_PVP_SCORE_REWARD_C2S = 1116;
    Cmd.MSG_MULTI_PVP_SCORE_REWARD_S2C = 1117;
    Cmd.MSG_MULTI_PVP_RETURN_C2S = 1118;
    Cmd.MSG_INIT_PETS_C2S = 703;
    Cmd.MSG_KEEPING_PETS_C2S = 712;
    Cmd.MSG_KEEPING_PETS_S2C = 715;
    Cmd.MSG_PET_IN_WAR_C2S = 713;
    Cmd.MSG_PET_IN_WAR_S2C = 714;
    Cmd.MSG_PET_UPGRADE_C2S = 716;
    Cmd.MSG_AUTOMATIC_FEEDING_C2S = 717;
    Cmd.MSG_INIT_AUTOMATIC_FEEDING_RESULT_S2C = 720;
    Cmd.MSG_PET_SKILL_COMMON_INFO_S2C = 1431;
    Cmd.MSG_PET_COMMON_EXTERNAL_INFO_S2C = 2036;
    Cmd.MSG_PET_RELEASE_SKILLS_C2S = 2037;
    Cmd.MSG_PET_RELEASE_SKILLS_UPDATE_S2C = 2038;
    Cmd.MSG_TRAVEL_PART_UNLOCK_S2C = 2039;
    Cmd.MSG_PET_ROOM_UNLOCK_C2S = 721;
    Cmd.MSG_PET_ROOM_UNLOCK_S2C = 722;
    Cmd.MSG_NEW_ROLE_COLLOCATION_C2S = 2728;
    Cmd.MSG_INSTANT_PVP_BUY_TIMES_C2S = 1429;
    Cmd.MSG_INSTANT_PVP_UPDATE_TIMES_S2C = 1430;
    Cmd.MSG_INSTANT_PVP_QUICK_END_C2S = 1432;
    Cmd.MSG_INSTANT_PVP_QUICK_END_S2C = 1433;
    Cmd.MSG_INSTANT_PVP_SCORE_REWARD_INFO_C2S = 1434;
    Cmd.MSG_INSTANT_PVP_SCORE_REWARD_INFO_S2C = 1435;
    Cmd.MSG_INSTANT_PVP_RANK_REWARD_INFO_C2S = 2702;
    Cmd.MSG_INSTANT_PVP_RANK_REWARD_INFO_S2C = 2703;
    Cmd.MSG_INSTANT_PVP_GET_SCORE_REWARD_C2S = 1438;
    Cmd.MSG_INSTANT_PVP_GET_SCORE_REWARD_S2C = 1439;
    Cmd.MSG_INSTANT_PVP_SCORE_S2C = 1440;
    Cmd.MSG_INIT_MY_BOYFRIEND_S2C = 1200;
    Cmd.MSG_CHANGE_BOYFRIEND_CLOTHS_C2S = 1201;
    Cmd.MSG_BUY_BOYFRIEND_PROPS_C2S = 1202;
    Cmd.MSG_BOYFRIEND_EXPIRE_C2S = 1203;
    Cmd.MSG_BOYFRIEND_EXPIRE_S2C = 1204;
    Cmd.MSG_BOYFRIEND_PROPERTY_UPDATE_S2C = 1205;
    Cmd.MSG_SWITCH_BOYFRIEND_C2S = 1206;
    Cmd.MSG_SWITCH_BOYFRIEND_S2C = 1207;
    Cmd.MSG_GET_TIGER_MACHINE_INIT_DATA_S2C = 1250;
    Cmd.MSG_TIGER_MACHINE_REWARD_PRE_S2C = 1254;
    Cmd.MSG_TIGER_MACHINE_RANDOM_C2S = 1251;
    Cmd.MSG_TIGER_MACHINE_RANDOM_S2C = 1252;
    Cmd.MSG_TIGER_MACHINE_NOTICE_C2S = 1256;
    Cmd.MSG_TIGER_MACHINE_NOTICE_S2C = 1257;
    Cmd.MSG_ACTIVITY_RANK_C2S = 1258;
    Cmd.MSG_ACTIVITY_RANK_S2C = 1259;
    Cmd.MSG_ACTIVITY_RANK_GET_REWARD_C2S = 1260;
    Cmd.MSG_ACTIVITY_RANK_GET_REWARD_S2C = 1261;
    Cmd.MSG_INIT_ADD_RECHARGE_S2C = 1350;
    Cmd.MSG_GET_ADD_RECHARGE_C2S = 1351;
    Cmd.MSG_INIT_FACTORY_C2S = 1620;
    Cmd.MSG_INIT_FACTORY_S2C = 1621;
    Cmd.MSG_SYNTHESIS_PRODUCTS_C2S = 1622;
    Cmd.MSG_ACCELERATE_PRODUCT_FACTORY_C2S = 1623;
    Cmd.MSG_RECEIVE_PRODUCT_C2S = 1624;
    Cmd.MSG_ADD_PRODUCTION_LOCATION_C2S = 1625;
    Cmd.MSG_INIT_LAND_INFO_C2S = 1500;
    Cmd.MSG_INIT_LAND_INFO_S2C = 1501;
    Cmd.MSG_INIT_ARCHITECTURE_INFO_C2S = 1599;
    Cmd.MSG_INIT_ARCHITECTURE_INFO_S2C = 1600;
    Cmd.MSG_CHANGE_ARCHITECTURE_COORDINATES_C2S = 1601;
    Cmd.MSG_CREATE_ARCHITECTURE_C2S = 1602;
    Cmd.MSG_GUESS_PVP_INIT_C2S = 1801;
    Cmd.MSG_GUESS_PVP_INIT_S2C = 1802;
    Cmd.MSG_GET_GUESS_PVP_RANK_RESULT_S2C = 1803;
    Cmd.MSG_GET_GUESS_PVP_ROLE_INFOS_C2S = 1804;
    Cmd.MSG_GET_GUESS_PVP_ROLE_INFOS_S2C = 1805;
    Cmd.MSG_GUESS_PVP_GUESS_C2S = 1806;
    Cmd.MSG_GUESS_PVP_GUESS_S2C = 1807;
    Cmd.MSG_GUESS_PVP_SAVE_C2S = 1808;
    Cmd.MSG_GUESS_PVP_SAVE_S2C = 1809;
    Cmd.MSG_GUESS_PVP_GET_GUESS_INFO_C2S = 1810;
    Cmd.MSG_GUESS_PVP_GET_GUESS_INFO_S2C = 1811;
    Cmd.MSG_GUESS_PVP_SAVE_PERFUME_C2S = 1812;
    Cmd.MSG_GUESS_PVP_SAVE_PERFUME_S2C = 1813;
    Cmd.MSG_GUESS_PVP_GET_GUESS_REWARD_C2S = 1814;
    Cmd.MSG_GUESS_PVP_GET_GUESS_REWARD_S2C = 1815;
    Cmd.MSG_GUESS_PVP_GET_RECORD_STAGE_C2S = 1816;
    Cmd.MSG_GUESS_PVP_GET_RECORD_STAGE_S2C = 1817;
    Cmd.MSG_GUESS_PVP_GET_RECORD_DETAIL_C2S = 1818;
    Cmd.MSG_GUESS_PVP_GET_RECORD_DETAIL_S2C = 1819;
    Cmd.MSG_GUESS_PVP_BUY_DOUBLE_C2S = 1820;
    Cmd.MSG_GUESS_PVP_BUY_DOUBLE_S2C = 1821;
    Cmd.MSG_GUESS_PVP_REWARD_STATE_C2S = 1822;
    Cmd.MSG_GUESS_PVP_REWARD_STATE_S2C = 1823;
    Cmd.MSG_ALL_PVP_RANK_REWARD_C2S = 1824;
    Cmd.MSG_ALL_PVP_RANK_REWARD_S2C = 1825;
    Cmd.MSG_GET_PARTICIPATE_REWARD_C2S = 1826;
    Cmd.MSG_GET_PARTICIPATE_REWARD_S2C = 1827;
    Cmd.MSG_DRAW_COLOR_INIT_C2S = 1901;
    Cmd.MSG_DRAW_COLOR_INIT_S2C = 1902;
    Cmd.MSG_GET_DRAW_COLOR_RANK_RESULT_S2C = 1903;
    Cmd.MSG_GET_DRAW_COLOR_ROLE_INFOS_C2S = 1904;
    Cmd.MSG_GET_DRAW_COLOR_ROLE_INFOS_S2C = 1905;
    Cmd.MSG_DRAW_COLOR_VOTE_C2S = 1906;
    Cmd.MSG_DRAW_COLOR_VOTE_S2C = 1907;
    Cmd.MSG_DRAW_COLOR_SAVE_C2S = 1908;
    Cmd.MSG_DRAW_COLOR_SAVE_S2C = 1909;
    Cmd.MSG_DRAW_COLOR_GET_VOTE_INFO_C2S = 1910;
    Cmd.MSG_DRAW_COLOR_GET_VOTE_INFO_S2C = 1911;
    Cmd.MSG_DRAW_COLOR_UPLOAD_C2S = 1912;
    Cmd.MSG_DRAW_COLOR_UPLOAD_S2C = 1913;
    Cmd.MSG_DRAW_COLOR_GET_VOTE_REWARD_C2S = 1914;
    Cmd.MSG_DRAW_COLOR_GET_VOTE_REWARD_S2C = 1915;
    Cmd.MSG_DRAW_COLOR_GET_RECORD_C2S = 1916;
    Cmd.MSG_DRAW_COLOR_GET_RECORD_S2C = 1917;
    Cmd.MSG_DRAW_COLOR_UNLOCK_AD_C2S = 1918;
    Cmd.MSG_DRAW_COLOR_UNLOCK_AD_S2C = 1919;
    Cmd.MSG_DRAW_COLOR_BUY_AD_C2S = 1920;
    Cmd.MSG_DRAW_COLOR_BUY_AD_S2C = 1921;
    Cmd.MSG_DRAW_COLOR_JUDGE_REWARD_STATE_C2S = 1922;
    Cmd.MSG_DRAW_COLOR_JUDGE_REWARD_STATE_S2C = 1923;
    Cmd.MSG_DRAW_COLOR_REQUIRE_ALL_FRIEND_VOTE_C2S = 1924;
    Cmd.MSG_DRAW_COLOR_REQUIRE_FRIEND_VOTE_C2S = 1925;
    Cmd.MSG_DRAW_COLOR_BUY_COLOR_DISK_C2S = 1926;
    Cmd.MSG_DRAW_COLOR_BUY_COLOR_DISK_S2C = 1927;
    Cmd.MSG_DRAW_COLOR_GET_FRIEND_INFO_C2S = 1928;
    Cmd.MSG_INVITATIONCENTER_INIT_INVITATION_CODE_C2S = 2003;
    Cmd.MSG_INVITATIONCENTER_INIT_INVITATION_CODE_S2C = 2008;
    Cmd.MSG_INVITATIONCENTER_RECEIVE_MY_CODE_REWARD_C2S = 2006;
    Cmd.MSG_INVITATIONCENTER_RECEIVE_MY_RECOMMEND_REWARD_S2C = 2007;
    Cmd.MSG_INVITATIONCENTER_FILL_IN_THE_INVITATION_CODE_C2S = 2004;
    Cmd.MSG_INVITATIONCENTER_FILL_IN_THE_INVITATION_CODE_S2C = 2005;
    Cmd.MSG_SHARE_INIT_S2C = 3000;
    Cmd.MSG_SHARE_GET_C2S = 3001;
    Cmd.MSG_SHARE_GET_S2C = 3002;
    Cmd.MSG_UPDATE_SHARE_POPUP_DATA_S2C = 3003;
    Cmd.MSG_CLIENT_ORDER_UPDATE_C2S = 3004;
    Cmd.MSG_REC_SHARE_SHOP_ITEMS_C2S = 3005;
    Cmd.MSG_SHARE_SHOP_ITEMS_RETURN_S2C = 3006;

    class GlobalService {
        constructor(cls) {
            this._addNewFList = [];
            this.delayShowNewFun = false;
        }
        static get instance() {
            if (GlobalService._instace == null) {
                GlobalService._instace = new GlobalService(new singClass$2());
            }
            return GlobalService._instace;
        }
        addNewOpenFun(value) {
            this._addNewFList = this._addNewFList.concat(value);
            if (!this.delayShowNewFun) {
                this.showNewFun();
            }
        }
        setDelayShowFun(value) {
            if (this.delayShowNewFun != value) {
                this.delayShowNewFun = value;
                if (!value) {
                    this.showNewFun();
                }
            }
        }
        showNewFun() {
            if (this._addNewFList.length > 0) {
                let funId = this._addNewFList.pop();
                let funVo = GlobalDataManager.instance.systemOpenModel.m_dicSystemInfoCfg.get(funId.toString());
                if (!funVo) {
                    this.showNewFun();
                }
                else if (funVo.if_open.toString() == "1" || funVo.if_pop.toString() != "1") {
                    this.showNewFun();
                }
                else {
                    this.swithToNewFun(funId);
                }
            }
        }
        swithToNewFun(funId, needPop = false) {
            let funVo = GlobalDataManager.instance.systemOpenModel.m_dicSystemInfoCfg.get(funId);
            if (!funVo) {
                return;
            }
            if (funVo.if_open.toString() == "1") {
                NoticeMgr.instance.notice("system_open.json-->funId:" + funVo.functionID + "is close");
                return;
            }
            if (funVo.if_pop.toString() == "1" || needPop) {
                Signal.intance.event(GameEvent.EVENT_OPEN_MODULE, [ModuleName.NewFunUnLockDialog, funId]);
            }
        }
        hasUnlockFunction(functionId, showTip = true) {
            let vo = GlobalDataManager.instance.systemOpenModel.m_dicSystemInfoCfg.get(functionId + "");
            let bool = GlobalDataManager.instance.systemOpenModel.isOpen(parseInt(functionId));
            if (!bool && showTip) {
                NoticeMgr.instance.notice(GameLanguageMgr.instance.getLanguage(vo.lock_word));
            }
            return bool;
        }
        popOutTip(coseType) {
            if (coseType.toString() == EnumConsumeType.TYPE_ENDURANCE.toString()) {
                Signal.intance.event("open_buy", 2);
            }
        }
    }
    class singClass$2 {
    }

    class Quick {
        static getColorText(text, color = "#FFFF00") {
            return '<font color="' + color + '">' + text + '</font>';
        }
        static getChildByName(target, name, attribute = "name") {
            if ((target && target.hasOwnProperty(attribute)) && target[attribute] == name) {
                return target;
            }
            let container = target;
            if (container) {
                let len = container.numChildren;
                let item;
                for (let i = 0; i < len; ++i) {
                    item = container.getChildAt(i);
                    if (item instanceof Laya.Sprite) {
                        item = Quick.getChildByName(item, name, attribute);
                    }
                    if ((item && item.hasOwnProperty(attribute)) && item[attribute] == name) {
                        return item;
                    }
                }
            }
            return null;
        }
        static getChildByAttri(target, attrName) {
            if ((target && target.hasOwnProperty(attrName)) && target[attrName]) {
                return target[attrName];
            }
            let container = target;
            if (container) {
                let len = container.numChildren;
                let item;
                for (let i = 0; i < len; ++i) {
                    item = container.getChildAt(i);
                    if (item instanceof Laya.Sprite) {
                        item = Quick.getChildByAttri(item, attrName);
                        if (item) {
                            return item;
                        }
                    }
                    else {
                        if ((item && item.hasOwnProperty(attrName)) && item[attrName]) {
                            return item[attrName];
                        }
                    }
                }
            }
            return null;
        }
        static logs(logMsg, logType = 0, addLogFile = true, color = 0xFFFFFF) {
            logMsg = Quick.GetLogTime + " " + logMsg;
            if (addLogFile) {
                switch (logType) {
                    case 0:
                        {
                            color = 0xFFFFFF;
                        }
                        break;
                    case 1:
                        {
                            color = 0xFFFFFF;
                        }
                        break;
                    case 2:
                        {
                            color = 0xFF0000;
                        }
                        break;
                    case 3:
                        {
                            color = 0xFFFFFF;
                        }
                        break;
                    case 4:
                        {
                            color = 0xCCFF99;
                        }
                        break;
                    case 5:
                        {
                            color = 0xFF77FF;
                        }
                        break;
                }
            }
        }
        static get GetLogTime() {
            let date = new Date();
            return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + ":" + date.getMilliseconds();
        }
        static get GRAY() {
            if (!Quick._GRAY) {
                Quick._GRAY = new Laya.ColorFilter([0.3, 0.59, 0.11, 0, 0, 0.3, 0.59, 0.11, 0, 0, 0.3, 0.59, 0.11, 0, 0, 0, 0, 0, 1, 0]);
            }
            return Quick._GRAY;
        }
        static get GRAY1() {
            if (!Quick._GRAY1) {
                let mat = [0.3086, 0.16094, 0.0820, 0, 0, 0.2086, 0.26094, 0.0820, 0, 0, 0.1086, 0.36094, 0.0820, 0, 0, 0, 0, 0, 1, 0];
                Quick._GRAY1 = new Laya.ColorFilter(mat);
            }
            return Quick._GRAY1;
        }
        static get GLOW() {
            if (!Quick._GLOW) {
                Quick._GLOW = new Laya.GlowFilter("#ffffff", 12, 0, 0);
            }
            return Quick._GLOW;
        }
        static get BLUR() {
            if (!Quick._BLUR) {
                let blurFilter = new Laya.BlurFilter();
                blurFilter.strength = 5;
                Quick._BLUR = [blurFilter];
            }
            return Quick._BLUR;
        }
        static get canShare() {
            return false;
            if (Laya.Browser.onIOS) {
                if (!AndroidPlatform.instance.isOldThan("1.0.0", "1.0.0")) {
                    return true;
                }
            }
            return GameSetting.isPC;
        }
        static get canShareByMessage() {
            if (Laya.Browser.onIOS) {
                if (!AndroidPlatform.instance.isOldThan("1.0.0", "1.0.0")) {
                    return true;
                }
            }
            return false;
        }
        static share(id = 1001, type = 2, imgUrl = null, code = null, imgWidth = 0, imgHeight = 0, _callBack = null) {
        }
        static get isReview() {
            if (Laya.Browser.onIOS) {
                if (AndroidPlatform.instance.isOldThan("1.0.0", "1.0.0")) {
                    return false;
                }
                else {
                    return true;
                }
            }
            return false;
        }
        static get canShowMonthCard() {
            return true;
            console.log("Quick.canShowMonthCard() Browser.onMobile: " + Laya.Browser.onMobile);
            if ((Laya.Browser.onIOS || Laya.Browser.onAndroid) && GameSetting.M_strCountry != "2") {
                return false;
            }
            return false;
        }
        static get isParseWWhiteUser() {
            return Quick._isParseWWhiteUser;
        }
        static get isWhiteName() {
            return GameSetting.isWhiteList;
        }
        static moneySign(price, hasBlank = false) {
            let str = "";
            let sign = "$";
            let blank = hasBlank ? " " : "";
            if (GameSetting.isMobile) {
                if (Laya.Browser.onAndroid) {
                    sign = "HK$";
                }
                if (GameSetting.M_strCountry == "2") {
                    sign = "TL";
                }
            }
            if (GameSetting.M_strCountry == "2") {
                str = price + blank + sign;
            }
            else {
                str = sign + blank + price;
            }
            return str;
        }
        static itemListHandler(clip, index) {
            let data = clip.dataSource;
            let _index = data[0];
            let _level = data[1];
            let _type = 2;
            let _clipSkin = clip.skin;
            if (_clipSkin) {
                if (_clipSkin.indexOf("xinSmall") != -1) {
                    _type = 1;
                }
                else if (_clipSkin.indexOf("xinBig") != -1) {
                    _type = 3;
                }
            }
            let _starStr;
            if (_type == 1) {
                _starStr = "common/common_clip/clip_xinSmall" + _level + ".png";
            }
            else if (_type == 3) {
                _starStr = "common/common_clip/clip_xinBig" + _level + ".png";
            }
            else {
                _starStr = "common/common_clip/clip_xinMiddle" + _level + ".png";
            }
            clip.skin = _starStr;
            clip.dataSource = _index;
        }
        static setStarList(starList, starArr) {
            starList.renderHandler = new Laya.Handler(Quick, Quick.itemListHandler);
            starList.dataSource = starArr;
        }
        static get BLACK() {
            if (!Quick._BLACK) {
                Quick._BLACK = new Laya.ColorFilter();
                Quick._BLACK.setColor("#000000");
            }
            return Quick._BLACK;
        }
        static get BLUE() {
            if (!Quick._BLUE) {
                Quick._BLUE = new Laya.ColorFilter();
                Quick._BLUE.setColor("#2f72a7");
            }
            return Quick._BLUE;
        }
        static setColor(_color = "#13e2cf") {
            let cf = new Laya.ColorFilter();
            cf.setColor(_color);
            return cf;
        }
    }
    Quick._isParseWWhiteUser = false;
    Quick.isWWhiteUser = false;

    class MessageReader {
        constructor() {
        }
        ReadShort(value) {
            let _array = new Uint8Array(value.buffer);
            let _index1 = _array[value.pos] << 8;
            let _index2 = _array[value.pos + 1];
            let _index3 = _index1 | _index2;
            value.pos += 2;
            return _index3;
        }
        ReadInt(value) {
            let _array = new Uint8Array(value.buffer);
            let _data = _array[value.pos] << 24 | _array[value.pos + 1] << 16 | _array[value.pos + 2] << 8 | _array[value.pos + 3];
            value.pos += 4;
            return _data;
        }
        ReadByte(value) {
            return value.getByte();
        }
        ReadString(value) {
            let _short = this.ReadShort(value);
            if (_short == 0) {
                return "";
            }
            return value.getUTFBytes(_short);
        }
        ReadBytes(value, len) {
            let _buffer1 = value.buffer.slice(value.pos, len);
            let _byt = new Laya.Byte(_buffer1);
            return _byt;
        }
        dispose() {
        }
    }

    class MessageWrite {
        constructor() {
            this.writeByt = new Laya.Byte();
        }
        writeByte() {
        }
        writeShort(value) {
            this.writeByt.writeByte(value >> 8);
            this.writeByt.writeByte(value);
        }
        writeInt(value) {
            this.writeByt.writeByte(value >> 24);
            this.writeByt.writeByte(value >> 16);
            this.writeByt.writeByte(value >> 8);
            this.writeByt.writeByte(value);
        }
        writeString(value) {
            let _len = value.length;
            if (_len == 0) {
                this.writeShort(0);
                return;
            }
            let _lenByt = new Laya.Byte();
            _lenByt.writeUTFBytes(value);
            this.writeShort(_lenByt.length);
            this.writeByt.writeUTFBytes(value);
        }
        dispose() {
        }
    }

    class MsgBodyAnaly {
        constructor() {
            this.cookie = "####1.0.0#0#";
            this.encryptKey = "FFIYD#^3LB954JB90fzj*(d)sO7";
            this._curSendIndex = -1;
        }
        static get instance() {
            if (!MsgBodyAnaly._instance) {
                MsgBodyAnaly._instance = new MsgBodyAnaly();
            }
            return MsgBodyAnaly._instance;
        }
        setLoginCookie() {
            this.cookie = "####1.0.0#" + GameSetting.Login_UDID + "#" + GameSetting.UserAgent;
        }
        parseCookie(_time, _roleID, _account, _version = "1.0.0") {
            let _key = this.encryptKey + _roleID + _time;
            let _md5 = MD5Compress(_key);
            _version = GlobalDataManager.instance.M_S_VersionServer;
            let _encryptData = _md5 + "#" + _time + "#" + _roleID + "#" + _account + "#" + _version + "#" + this._curSendIndex + "#1" + "#" + GameSetting.Login_UDID + "#" + GameSetting.UserAgent;
            this.cookie = _encryptData;
        }
        reflashCookie() {
            this.parseCookie(this.m_time, this.m_roleID, this.m_accout);
        }
        analyClient(commandId, _data) {
            let _write = new MessageWrite();
            _write.writeString(this.cookie);
            _write.writeShort(commandId);
            let _arrData = this.analyData[commandId];
            if (_arrData && _arrData.length > 0) {
                this.writeByt(_arrData, _data, _write);
            }
            return _write.writeByt;
        }
        writeByt(value, _data, _write) {
            for (let a in value) {
                let _itemData = _data[a];
                if (value[a].indexOf("7/") != -1) {
                    _write.writeShort(_itemData.length);
                    let _arrData = this.analyData[String(value[a]).split("7/")[1]];
                    if (_arrData) {
                        for (let xm in _itemData) {
                            this.writeByt(_arrData, _itemData[xm], _write);
                        }
                    }
                }
                else {
                    if (value[a] == "1") {
                        _write.writeInt(_itemData);
                    }
                    else if (value[a] == "2") {
                        _write.writeShort(_itemData);
                    }
                    else if (value[a] == "3") {
                        _write.writeString(_itemData);
                    }
                    else if ((value[a] == "4" || value[a] == "5") || value[a] == "6") {
                        _write.writeShort(_itemData.length);
                        for (let n in _itemData) {
                            if (value[a] == "4") {
                                _write.writeInt(_itemData[n]);
                            }
                            else if (value[a] == "5") {
                                _write.writeShort(_itemData[n]);
                            }
                            else if (value[a] == "6") {
                                _write.writeString(_itemData[n]);
                            }
                        }
                    }
                }
            }
        }
        analyServer(byt) {
            let _read = new MessageReader();
            let _msgID = _read.ReadShort(byt);
            let _arr = [_msgID];
            let _dataArr = this.analyData[_msgID];
            if (_dataArr && _dataArr.length > 0) {
                _arr = _arr.concat(this.readByt(_dataArr, byt, _read));
            }
            return _arr;
        }
        analyCookie(value = "") {
            console.log("RECE_COOKIE: " + value, 1);
            let _arr = value.split("#");
            this.m_time = _arr[0];
            this.m_roleID = _arr[1];
            this.m_accout = _arr[2];
            let _index = _arr[3];
            this._curSendIndex = _index;
            this._curSendIndex++;
            console.log("游戏cookie:_time:" + this.m_time + "  _roleID：" + this.m_roleID + "	  _accout：" + this.m_accout);
            this.parseCookie(this.m_time, this.m_roleID, this.m_accout);
            GlobalDataManager.instance.timeStamp = parseFloat(this.m_time);
        }
        readByt(value, _byt, _read) {
            let _arr = [];
            for (let a in value) {
                if (value[a].indexOf("7/") != -1) {
                    let _len = _read.ReadShort(_byt);
                    let _arrData = this.analyData[String(value[a]).split("7/")[1]];
                    let _dataArr = [];
                    if (_arrData && _len > 0) {
                        for (let m = 0; m < _len; m++) {
                            _dataArr.push(this.readByt(_arrData, _byt, _read));
                        }
                    }
                    _arr.push(_dataArr);
                }
                else {
                    if (value[a] == "1") {
                        _arr.push(_read.ReadInt(_byt));
                    }
                    else if (value[a] == "2") {
                        _arr.push(_read.ReadShort(_byt));
                    }
                    else if (value[a] == "3") {
                        _arr.push(_read.ReadString(_byt));
                    }
                    else if ((value[a] == "4" || value[a] == "5") || value[a] == "6") {
                        let _itemLen = _read.ReadShort(_byt);
                        let _itemArr = [];
                        for (let n = 0; n < _itemLen; n++) {
                            if (value[a] == "4") {
                                _itemArr.push(_read.ReadInt(_byt));
                            }
                            else if (value[a] == "5") {
                                _itemArr.push(_read.ReadShort(_byt));
                            }
                            else if (value[a] == "6") {
                                _itemArr.push(_read.ReadString(_byt));
                            }
                        }
                        _arr.push(_itemArr);
                    }
                }
            }
            return _arr;
        }
        dispose() {
        }
    }
    function MD5Compress(_key) {
        throw new Error("Function not implemented.");
    }

    class HttpNetService {
        constructor() {
            this._isSending = false;
            this._stopSending = false;
            this._sendCmd = 0;
            this._callDataArr = [];
            this._httpReq = new Laya.HttpRequest();
            this._httpReq.http.timeout = 15000;
            this._httpReq.http.ontimeout = this.timeoutFunction;
            this._httpReq.on(Laya.Event.COMPLETE, this, this.reqCompleteHandler);
            this._httpReq.on(Laya.Event.ERROR, this, this.reqErrorHandler);
            this._httpReq.on(Laya.Event.PROGRESS, this, this.reqProcessHandler);
            HttpNetService.RepeatHandler = Laya.Handler.create(this, this.repeatCallHandler, null, false);
        }
        static get instance() {
            if (!HttpNetService._instance) {
                HttpNetService._instance = new HttpNetService();
            }
            return HttpNetService._instance;
        }
        repeatCallHandler() {
            let _Calldata = this._callDataArr[0];
            if (_Calldata) {
                let needReSend = _Calldata.needReSend;
                if (needReSend) {
                    this._sendByByte(_Calldata.command, _Calldata.callData, _Calldata.isShowLoading, true);
                }
                else {
                    this._callDataArr.shift();
                }
            }
        }
        timeoutFunction() {
            HttpNetService.ErrorIndex++;
            if (this._sendCmd == 2) {
                let parameters = new Object();
                parameters["login_step"] = "1_3";
                parameters["login_msg"] = "timeout";
                PlatFormManager.instance.sendCustumEvent(52, parameters);
            }
            if (HttpNetService.timeoutTimes < HttpNetService.MaxSendTimes) {
                let parameters = new Object();
                parameters["ErrorIndex"] = HttpNetService.ErrorIndex;
                parameters["sendCmd"] = this._sendCmd;
                PlatFormManager.instance.sendCustumEvent(44, parameters);
            }
            HttpNetService.timeoutTimes++;
            HttpNetService._IS_SEND = false;
            this._isSending = false;
            if (HttpNetService.ErrorIndex >= HttpNetService.RepeatTimesTimeOut) {
                LoadingManager.instance.hideLoading();
                HttpNetService.ErrorTips = GameLanguageMgr.instance.getLanguage("5076");
                ModuleManager.intance.openModule(ModuleName.ClientErrView);
            }
            else {
                HttpNetService.RepeatHandler.run();
            }
        }
        reqCompleteHandler(evt) {
            let totalTime = Laya.Browser.now() - this.m_nSendTime;
            if (totalTime && totalTime > HttpNetService.RequestTime) {
                if (HttpNetService.reqTimes < HttpNetService.MaxSendTimes) {
                    let parameters = new Object();
                    parameters["totalTime"] = totalTime;
                    parameters["sendCmd"] = this._sendCmd;
                    PlatFormManager.instance.sendCustumEvent(47, parameters);
                }
                HttpNetService.reqTimes++;
            }
            else {
                HttpNetService.reqTimes = 0;
                HttpNetService.timeoutTimes = 0;
                HttpNetService.errorTimes = 0;
            }
            console.log("cmd 请求数据时长：" + (Laya.Browser.now() - this.m_nSendTime));
            if (this._httpReq.data == null) {
                ErrorPopManager.instance.showErrByString("_buff:null");
                return;
            }
            this._isSending = false;
            HttpNetService.ErrorIndex = 0;
            let _byt = new Laya.Byte(this._httpReq.data);
            let hasComBack;
            if (_byt) {
                let _read = new MessageReader();
                let _cookie = _read.ReadString(_byt);
                MsgBodyAnaly.instance.analyCookie(_cookie);
                let _num = _read.ReadByte(_byt);
                for (let a = 0; a < _num; a++) {
                    _read.ReadByte(_byt);
                    let _len = _read.ReadShort(_byt);
                    let _byts = _read.ReadBytes(_byt, _byt.pos + _len);
                    _byt.pos += _len;
                    if (_byts.length < 2) {
                        continue;
                        ;
                    }
                    _byts.pos = 0;
                    let _composeByt = _read.ReadBytes(_byts, _byts.length);
                    _composeByt.pos = 0;
                    let _arr = new Uint8Array(_composeByt.buffer);
                    let _data2 = new Uint8Array(decompressByt(_arr));
                    let _unCompose = new Laya.Byte(_data2.buffer);
                    _unCompose.pos = 0;
                    let _dataArr = MsgBodyAnaly.instance.analyServer(_unCompose);
                    if (window["PlatformClass"]) {
                        console.log("REVC_CMD: cmdID:" + _dataArr[0] + " data:" + _dataArr, 1);
                    }
                    else {
                        console.log(Quick.GetLogTime + " REVC_CMD: cmdID:", _dataArr[0], _dataArr);
                    }
                    if (_dataArr[0] == 153) {
                        console.log("断点");
                    }
                    if (_dataArr[0] == 27 && (_dataArr[1] == 20000 || _dataArr[1] == 20042)) {
                        hasComBack = true;
                    }
                    Signal.intance.event("msg_" + _dataArr.shift(), [_dataArr]);
                }
                if (_num == 0) {
                    console.log("REVC_DATA: NO_DATA", 1);
                }
            }
            if (this._callDataArr.length > 0) {
                let _data = this._callDataArr.shift();
                if ((hasComBack && _data) && _data.callBackHandler != null) {
                    _data.callBackHandler.run();
                }
            }
            HttpNetService._IS_SEND = false;
            if (this._callDataArr.length > 0) {
                HttpNetService.RepeatHandler.run();
            }
            else {
                LoadingManager.instance.hideLoading();
            }
        }
        reqErrorHandler(error) {
            console.log("[error] HttpNetService reqError: [" + error + "]", 1);
            if (HttpNetService.errorTimes < HttpNetService.MaxSendTimes) {
                if (this._sendCmd == 2) {
                    let parameters = new Object();
                    parameters["login_step"] = "1_3";
                    parameters["login_msg"] = "error";
                    PlatFormManager.instance.sendCustumEvent(52, parameters);
                }
                let parameters = new Object();
                parameters["ErrorIndex"] = HttpNetService.ErrorIndex;
                parameters["sendCmd"] = this._sendCmd;
                PlatFormManager.instance.sendCustumEvent(45, parameters);
            }
            HttpNetService.errorTimes++;
            LoadingManager.instance.showLoadingByInfo(GameLanguageMgr.instance.getConfigLan(5205));
            HttpNetService.ErrorIndex++;
            HttpNetService._IS_SEND = false;
            this._isSending = false;
            if (HttpNetService.ErrorIndex >= HttpNetService.RepeatTimes) {
                LoadingManager.instance.hideLoading();
                HttpNetService.ErrorTips = GameLanguageMgr.instance.getLanguage("5075");
                ModuleManager.intance.openModule(ModuleName.ClientErrView);
                this._callDataArr.length = 0;
            }
            else {
                Laya.timer.once(1000, this, function () {
                    HttpNetService.RepeatHandler.run();
                });
            }
        }
        reqProcessHandler(evt) {
        }
        DataToService(value) {
            if (window["PlatformClass"]) {
                this._httpReq.send(HttpNetService.httpUrl, value.buffer, "post", "arraybuffer", ["Content-Type", "application/x-www-form-urlencoded", "Connection", "close"]);
            }
            else {
                this._httpReq.send(HttpNetService.httpUrl, value.buffer, "post", "arraybuffer", ["Content-Type", "application/x-www-form-urlencoded"]);
            }
        }
        SendData(commandID, data, _callBackHandler = null, _isShowLoding = true, _needReSend = true) {
            if (this._stopSending) {
                return;
            }
            this.m_nSendTime = Laya.Browser.now();
            HttpNetService.ErrorIndex = 0;
            this._callDataArr.push({ command: commandID, callData: data, callBackHandler: _callBackHandler, isShowLoading: _isShowLoding, needReSend: _needReSend });
            this._sendByByte(commandID, data, _isShowLoding, false);
        }
        _sendByByte(commandID, data, _isShowLoding = true, isReSend = false) {
            if (HttpNetService._IS_SEND == false) {
                if (window["PlatformClass"]) {
                    console.log("SEND_CMD: cmdID:" + commandID + " data:" + data + " _isShowLoding:" + _isShowLoding, 1);
                }
                else {
                    console.log(Quick.GetLogTime + " SEND_CMD: cmdID:", commandID, data);
                }
                this._sendCmd = commandID;
                if (this._sendCmd == 2) {
                    let parameters = new Object();
                    parameters["login_step"] = "1_1";
                    PlatFormManager.instance.sendCustumEvent(52, parameters);
                }
                Laya.timer.clear(this, this.sendOutHandler);
                this._isSending = true;
                HttpNetService._IS_SEND = true;
                if (_isShowLoding) {
                    if (commandID == 2) {
                        if (isReSend) {
                            LoadingManager.instance.showLoadingByInfo(GameLanguageMgr.instance.getConfigLan(5204));
                        }
                    }
                    else {
                        LoadingManager.instance.showLoading(true);
                    }
                }
                else {
                    LoadingManager.instance.hideLoading();
                }
                let _byt = MsgBodyAnaly.instance.analyClient(commandID, data);
                this.DataToService(_byt);
            }
        }
        sendOutHandler() {
            Laya.timer.clear(this, this.sendOutHandler);
            if (this._isSending) {
                this._isSending = false;
                if (HttpNetService.ErrorIndex >= HttpNetService.RepeatTimes) {
                    LoadingManager.instance.hideLoading();
                    HttpNetService.ErrorTips = "Client Error!";
                    ModuleManager.intance.openModule(ModuleName.ClientErrView);
                    this._callDataArr.length = 0;
                }
                else {
                    HttpNetService.RepeatHandler.run();
                }
            }
        }
        EnCodeByte(value) {
            value.pos = 0;
            let _read = new MessageReader();
            let _byt = _read.ReadBytes(value, value.length);
            _byt.pos = 0;
            let _newByt = new Laya.Byte();
            let index = 0;
            let _data;
            let _newData = 0;
            for (let j = 0; j < _byt.length; j++) {
                if (index >= 6) {
                    index = 1;
                }
                else {
                    index += 1;
                }
                _data = _byt.getByte();
                _newData = _data;
                _data >>= 8 - index;
                _newData <<= index;
                _newData |= _data;
                _newData ^= 3;
                _newByt.writeByte(_newData);
            }
            return _newByt;
        }
        DecryptByte(value) {
            value.pos = 0;
            let _read = new MessageReader();
            let _byt = _read.ReadBytes(value, value.length);
            _byt.pos = 0;
            let _newByt = new Laya.Byte();
            let index = 0;
            let _data;
            let _uint8Arr = new Uint8Array(_byt.buffer);
            for (let a = 0; a < _uint8Arr.length; a++) {
                if (index >= 6) {
                    index = 1;
                }
                else {
                    index += 1;
                }
                _data = _uint8Arr[a];
                _data ^= 3;
                _data <<= 8 - index;
                _uint8Arr[a] ^= 3;
                _uint8Arr[a] >>= index;
                _uint8Arr[a] |= _data;
            }
            _newByt = new Laya.Byte(_uint8Arr.buffer);
            return _newByt;
        }
        init() {
            let _obj = GameResourceManager.instance.getResByURL("config/login.json");
            MsgBodyAnaly.instance.analyData = _obj;
        }
        HttpLoadProcess(progress) {
        }
        httpLoadComplete(data) {
            MsgBodyAnaly.instance.analyData = data;
        }
        dispose() {
        }
        set stopSending(value) {
            this._stopSending = value;
        }
    }
    HttpNetService._IS_SEND = false;
    HttpNetService.httpUrl = "https://qa_s19440001.clothesforever.com/server_h5/";
    HttpNetService.ErrorIndex = 0;
    HttpNetService.RepeatTimes = 8;
    HttpNetService.RepeatTimesTimeOut = 3;
    HttpNetService.ErrorTips = "";
    HttpNetService.LoginTime = 5000;
    HttpNetService.RequestTime = 4000;
    HttpNetService.MaxSendTimes = 5;
    HttpNetService.reqTimes = 0;
    HttpNetService.timeoutTimes = 0;
    HttpNetService.errorTimes = 0;
    function decompressByt(_arr) {
        throw new Error("Function not implemented.");
    }

    class GlobalDataManager {
        constructor() {
            this.timeZoneOff = 0;
            this.hearIntervalSceond = 10 * 60;
            this._timeStamp = 0;
            this._m_strLanguage = 1;
            this.isLanChanged = false;
            this.DSURL_APP = "";
            this.DSURL_WEB = "";
            this.M_S_VersionServer = "1.0.0";
            this.initReceive = true;
            this.initReceiveExp = true;
            this.needPopError = true;
        }
        get m_strLanguage() {
            return this._m_strLanguage;
        }
        set m_strLanguage(value) {
            this._m_strLanguage = value;
        }
        static get instance() {
            if (!GlobalDataManager._instance) {
                GlobalDataManager._instance = new GlobalDataManager();
            }
            return GlobalDataManager._instance;
        }
        init() {
            this.roleInfo = new RoleInfo();
            this.vipInfo = new VipInfo();
            this.m_packageData = new PackageData();
            this.facePackageVO = new FacePackageVo();
            this.systemOpenModel = new SysteSheetModel();
            this.npcModel = new NpcModel();
            this.m_dicCustomerVo = new Dictionary();
            Signal.intance.on("msg_27", this, this.commonErrHandler);
            Signal.intance.on("msg_4", this, this.roleInfoHandler);
            Signal.intance.on("msg_7", this, this.roleLeveHandler);
            Signal.intance.on("msg_5", this, this.roleEnduranceHandler);
            Signal.intance.on("msg_11", this, this.vipInfoHandler);
            Signal.intance.on("msg_13", this, this.onVipUpgrade);
            Signal.intance.on("msg_6", this, this.moneyInfoHander);
            Signal.intance.on("msg_79", this, this.itemsDataInitHandler);
            Signal.intance.on("msg_80", this, this.itemsDataUpdataHandler);
            Signal.intance.on("msg_14", this, this.itemsDataInitHandler);
            Signal.intance.on("msg_16", this, this.itemsDataUpdataHandler);
            Signal.intance.on("msg_17", this, this.itemsFacesDataInitHandler);
            Signal.intance.on("msg_18", this, this.itemsFaceUpdateHandler);
            Signal.intance.on("msg_41", this, this.initStoreDataHandler);
            Signal.intance.on("msg_37", this, this.upgradeCostumerHandler);
            Signal.intance.on("msg_57", this, this.onImproveBack);
            Signal.intance.on("msg_58", this, this.onImproveBack);
            Signal.intance.on("msg_69", this, this.initMallHandler);
            Signal.intance.on("msg_94", this, this.initMainTaskHandler);
            Signal.intance.on("msg_98", this, this.initAchievementHandler);
            Signal.intance.on("msg_99", this, this.updataAchievementHandler);
            Signal.intance.on("msg_130", this, this.initSuitRewardHandler);
            Signal.intance.on("msg_1000", this, this.getTimeZoneOff);
            Signal.intance.on("msg_90", this, this.initSystemOpen);
            Signal.intance.on("msg_91", this, this.updateSystemOpen);
            Signal.intance.on("msg_320", this, this.initGuideHandler);
            Signal.intance.on("msg_297", this, this.initFriendsGiftHandler);
            Signal.intance.on("msg_271", this, this.recieveOnlineAward);
            Signal.intance.on("msg_173", this, this.reciveFirstRecharge);
            Signal.intance.on("msg_281", this, this.reciveFriendList);
            Signal.intance.on("msg_29", this, this.handleSaveCloth);
            Signal.intance.on("msg_40", this, this.reciveBuyCustomerMsg);
            Signal.intance.on("msg_35", this, this.reciveCustomerVo);
            Signal.intance.on("msg_21", this, this.onUpdatePsAndEndurance);
            Signal.intance.on("msg_161", this, this.reciveTurnoverVo);
            Signal.intance.on("msg_333", this, this.onInitSceneBg);
            Signal.intance.on("msg_350", this, this.onInitStoreDiscount);
            Signal.intance.on("msg_388", this, this.onInitTitle);
            Signal.intance.on(Cmd.RECV_MSG(Cmd.MSG_RESULT_REVIEW_RECORD_S2C), this, this.onInitReviewstate);
            Signal.intance.on(Cmd.RECV_MSG(Cmd.MSG_INIT_ACTIVITY_AG_S2C), this, this.onInitAdRank);
            Signal.intance.on("msg_102", this, this.onReciveBuyTimes);
            Signal.intance.on("msg_1002", this, this.onLanChange);
            Signal.intance.on(Cmd.RECV_MSG(Cmd.MSG_GET_PVP_GRADE_S2C), this, this.onGetPvpGrade);
            Signal.intance.on(Cmd.RECV_MSG(Cmd.MSG_SYS_BASE_INFO_S2C), this, this.onInitStyleAndTag);
        }
        initSend() {
        }
        onDsUrl(value) {
            this.DSURL_APP = value[0];
            this.DSURL_WEB = value[1];
        }
        onLanChange(data) {
            let resoult = parseInt(data[0]);
            let needRefresh = parseInt(data[1]);
            switch (resoult) {
                case 1:
                    {
                        if (needRefresh == 1) {
                            GameSetting.intance.reloadGame();
                        }
                    }
                    break;
                case 2:
                    break;
            }
        }
        get timeStamp() {
            return this._timeStamp + (Laya.Browser.now() - this.recordStampTime) / 1000;
        }
        set timeStamp(value) {
            this.recordStampTime = Laya.Browser.now();
            this._timeStamp = value;
        }
        onReciveBuyTimes(data) {
            GlobalDataManager.instance.roleInfo.updateRoleBuyTimes(data);
        }
        reciveTurnoverVo(data) {
        }
        onInitSceneBg(data) {
        }
        onInitTitle(data) {
        }
        onInitReviewstate(data) {
            let _reviewstate = parseInt(data[0]);
            CommentModel.instance.reviewstate = _reviewstate;
        }
        onInitAdRank(data) {
            this.m_adRankDic = new Dictionary();
            let ags = data[0];
            if (ags) {
                for (let ag of ags) {
                    let type = parseInt(ag[0]);
                    let channels = ag[1];
                    if (type) {
                        this.m_adRankDic.set(type, channels.join());
                    }
                }
            }
        }
        getAdRankById(type) {
            if (this.m_adRankDic && this.m_adRankDic.get(type)) {
                return this.m_adRankDic.get(type);
            }
            return "";
        }
        onGetPvpGrade(data) {
            let currGradeId = data[0];
        }
        onInitStoreDiscount(data) {
        }
        reciveBuyCustomerMsg(data) {
        }
        onInitStyleAndTag(data) {
            let datas = data[0];
            for (let i = 0; i < datas.length; i++) {
                let _datas = datas[i];
                let funId = _datas[0];
                let styleId = _datas[1];
                let tagId = _datas[2];
            }
        }
        reciveCustomerVo(data) {
        }
        reciveFriendList(data) {
        }
        reciveFirstRecharge(data) {
        }
        hasReceiveFirst() {
            return this.firstRechargeState.toString() == "3";
        }
        recieveOnlineAward(data) {
        }
        initFriendsGiftHandler(data) {
        }
        initSystemOpen(data) {
            this.systemOpenModel.initSystemOpen(data[0]);
        }
        updateSystemOpen(data) {
            let opens = data[0];
            GlobalService.instance.addNewOpenFun(opens);
            for (let i = 0; i < opens.length; i++) {
                this.systemOpenModel.openSystem.set(opens[i], true);
            }
        }
        serverTimeUpdateHandler() {
            let interValTime = this.hearIntervalSceond * 1000;
            Laya.timer.loop(interValTime, this, this.onHear);
        }
        onHear() {
        }
        initSuitRewardHandler(data) {
        }
        updataAchievementHandler(data) {
        }
        getTimeZoneOff(value) {
            console.log(value[0]);
            this.timeZoneOff = parseFloat(value[0]);
            this.m_iServerTimeStamp = parseFloat(value[1]) * 1000;
            this.m_strShiqu = value[2];
            let _serverLanId = value[3];
            if (!GameSetting.ignoreLang) {
                if (_serverLanId != 0 && this.m_strLanguage != _serverLanId) {
                    this.m_strLanguage = _serverLanId;
                    this.isLanChanged = true;
                }
                else {
                    if (_serverLanId == 0 && GameSetting.isMobile) {
                    }
                    let type = GameLanguageMgr.instance.getLanTypeById(this.m_strLanguage);
                    AndroidPlatform.instance.FGM_SetLanguage(type);
                }
            }
            this.M_S_VersionServer = value[4];
            MsgBodyAnaly.instance.reflashCookie();
            console.log("-----------------时间戳：m_strShiqu: " + this.m_strShiqu + ", timeZoneOff: " + this.timeZoneOff + ", m_iServerTimeStamp: " + this.m_iServerTimeStamp, 1);
            console.log("-----------------语言_serverLanId: " + _serverLanId + " m_strLanguage: " + this.m_strLanguage, 1);
            console.log("-----------------服务器版本号：" + this.M_S_VersionServer, 1);
        }
        initAchievementHandler(data) {
        }
        initMainTaskHandler(data) {
        }
        initMallHandler(data) {
        }
        upgradeCostumerHandler(data) {
        }
        onImproveBack() {
        }
        initStoreDataHandler(data) {
        }
        itemsDataUpdataHandler(data) {
            this.m_packageData.updateData(data);
            Signal.intance.event(GameEvent.EVENT_ITEM_UPDATE);
        }
        itemsFaceUpdateHandler(data) {
            GetItemDataModel.instance.needPop = false;
            this.m_packageData.clothData.updataItemVoByArr(data[0], data[1]);
            GetItemDataModel.instance.needPop = true;
            this.facePackageVO.updataItemVoByArr(data[0]);
        }
        itemsFacesDataInitHandler(data) {
            this.m_packageData.getDataByType(PackageData.TYPE_CLOTH).initDataByArr([1, data[0], data[1]], false);
            this.facePackageVO.initDataByArr(data);
        }
        itemsDataInitHandler(data) {
            this.m_packageData.initData(data);
        }
        vipInfoHandler(data) {
            this.vipInfo.trecharge = data[1];
            this.vipInfo.isRewards = data[2];
            this.vipInfo.daygift = data[3];
        }
        onVipUpgrade(value) {
        }
        onUpdatePsAndEndurance(value) {
            this.roleEnduranceHandler(value, true);
        }
        moneyInfoHander(data, autoPatchEvent = true, needPop = true) {
            let totalNeed = false;
            let needPush = false;
            let delta = 0;
            for (let info of data[0]) {
                needPush = false;
                if (info[0] == EnumConsumeType.TYPE_GOLD) {
                    this.roleInfo.money1 = info[1];
                    delta = this.roleInfo.deltaGold;
                    needPush = this.roleInfo.deltaGold > 0;
                }
                else if (info[0] == EnumConsumeType.TYPE_DIAMOND) {
                    this.roleInfo.money2 = info[1];
                    delta = this.roleInfo.deltaDiamon;
                    needPush = this.roleInfo.deltaDiamon > 0;
                }
                else if (info[0] == EnumConsumeType.TYPE_PS) {
                    this.roleInfo.money3 = info[1];
                    delta = this.roleInfo.deltaPs;
                    needPush = false;
                }
                else if (info[0] == EnumConsumeType.TYPE_ENDURANCE) {
                    this.roleInfo.money4 = info[1];
                    delta = this.roleInfo.deltaEndurance;
                    needPush = false;
                }
                else if (info[0] == EnumConsumeType.TYPE_SHOP_EXP) {
                    this.roleInfo.money5 = info[1];
                }
                else if (info[0] == EnumConsumeType.TYPE_EXP) {
                    this.roleInfo.money6 = info[1];
                    delta = this.roleInfo.deltaExp;
                    needPush = this.roleInfo.deltaExp > 0;
                }
                else if (info[0] == EnumConsumeType.TYPE_STAMP) {
                    this.roleInfo.stamp = info[1];
                    delta = this.roleInfo.deltaStamp;
                    needPush = this.roleInfo.deltaStamp > 0;
                }
                else if (info[0] == EnumConsumeType.TYPE_Crystal_Shoes) {
                    this.roleInfo.crystal = info[1];
                    delta = this.roleInfo.deltaCrystal;
                    needPush = this.roleInfo.deltaCrystal > 0;
                }
                else if (info[0] == EnumConsumeType.TYPE_WISH_COIN) {
                    this.roleInfo.wishCoint = info[1];
                    delta = this.roleInfo.deltaWishCoin;
                    needPush = this.roleInfo.deltaWishCoin > 0;
                }
                else if (info[0] == EnumConsumeType.TYPE_Beauty_Box) {
                    this.roleInfo.salonBox = info[1];
                    delta = this.roleInfo.deltaSalonBox;
                    needPush = this.roleInfo.deltaSalonBox > 0;
                }
                else if (info[0] == EnumConsumeType.TYPE_Guild) {
                    this.roleInfo.guildVouchers = info[1];
                    delta = this.roleInfo.deltaGuildVouchers;
                    needPush = this.roleInfo.deltaGuildVouchers > 0;
                }
                else if (info[0] == EnumConsumeType.TYPE_GOLD_CRYSTAL) {
                    this.roleInfo.goldCrystal = info[1];
                    delta = this.roleInfo.deltaGoldCrystal;
                    needPush = this.roleInfo.deltaGoldCrystal > 0;
                }
                else if (info[0] == EnumConsumeType.TYPE_Silver_finger) {
                    this.roleInfo.silverFinger = info[1];
                    delta = this.roleInfo.deltaSilverFinger;
                    needPush = this.roleInfo.deltaSilverFinger > 0;
                }
                else if (info[0] == EnumConsumeType.TYPE_Gold_finger) {
                    this.roleInfo.goldFinger = info[1];
                    delta = this.roleInfo.deltaGoldFinger;
                    needPush = this.roleInfo.deltaGoldFinger > 0;
                }
                else if (info[0] == EnumConsumeType.TYPE_SlotMachine) {
                    this.roleInfo.slotMachine = info[1];
                    delta = this.roleInfo.deltaSlotMachine;
                    needPush = this.roleInfo.deltaSlotMachine > 0;
                }
                else if (info[0] == EnumConsumeType.TYPE_LuckWheel) {
                    this.roleInfo.luckWheel = info[1];
                    delta = this.roleInfo.deltaLuckWheel;
                    needPush = this.roleInfo.deltaLuckWheel > 0;
                }
                else if (info[0] == EnumConsumeType.TYPE_Gashapon) {
                    this.roleInfo.gashapon = info[1];
                    delta = this.roleInfo.deltaGashapon;
                    needPush = this.roleInfo.deltaGashapon > 0;
                }
                else if (info[0] == EnumConsumeType.TYPE_CHOCO_LATE) {
                    this.roleInfo.chocolate = info[1];
                    delta = this.roleInfo.deltaChocoLate;
                    needPush = this.roleInfo.deltaChocoLate > 0;
                }
                else if (info[0] == EnumConsumeType.TYPE_CHAMPAGNE) {
                    this.roleInfo.champagne = info[1];
                    delta = this.roleInfo.deltaChampagne;
                    needPush = this.roleInfo.deltaChampagne > 0;
                }
                else if (info[0] == EnumConsumeType.TYPE_LOVE) {
                    this.roleInfo.love = info[1];
                    delta = this.roleInfo.deltaLove;
                    needPush = this.roleInfo.deltaLove > 0;
                }
                else if (info[0] == EnumConsumeType.TYPE_imperial_crown) {
                    this.roleInfo.imperialCrown = info[1];
                    delta = this.roleInfo.deltaImperial_crown;
                    needPush = this.roleInfo.deltaImperial_crown > 0;
                }
                else if (info[0] == EnumConsumeType.TYPE_SUPER_LOVE) {
                    this.roleInfo.superLove = info[1];
                    delta = this.roleInfo.deltaSuperLove;
                    needPush = this.roleInfo.deltaSuperLove > 0;
                }
                else if (info[0] == EnumConsumeType.TYPE_PK_COIN) {
                    this.roleInfo.pkCoin = info[1];
                    delta = this.roleInfo.deltaPkCoin;
                    needPush = this.roleInfo.deltaPkCoin > 0;
                }
                else if (info[0] == EnumConsumeType.TYPE_TIME_STAGE_COIN) {
                    this.roleInfo.timeStageCoint = info[1];
                    delta = this.roleInfo.deltaTimeStageCoin;
                    needPush = this.roleInfo.deltaTimeStageCoin > 0;
                }
                else if (info[0] == EnumConsumeType.TYPE_STOKEN) {
                    this.roleInfo.sToken = info[1];
                    delta = this.roleInfo.deltaSToken;
                    needPush = this.roleInfo.deltaSToken > 0;
                }
                else if (info[0] == EnumConsumeType.TYPE_GOLD_SCISSORS) {
                    this.roleInfo.gold_scissors = info[1];
                    delta = this.roleInfo.deltaGoldscissors;
                    needPush = this.roleInfo.deltaGoldscissors > 0;
                }
                else if (info[0] == EnumConsumeType.TYPE_SILVER_SCISSORS) {
                    this.roleInfo.silver_scissors = info[1];
                    delta = this.roleInfo.deltaSilverScissors;
                    needPush = this.roleInfo.deltaSilverScissors > 0;
                }
                else if (info[0] == EnumConsumeType.TYPE_BRUSH) {
                    this.roleInfo.brush = info[1];
                    delta = this.roleInfo.deltaBrush;
                    needPush = this.roleInfo.deltaBrush > 0;
                }
                else if (info[0] == EnumConsumeType.TYPE_REBORN) {
                    this.roleInfo.answerRebornCoin = info[1];
                    delta = this.roleInfo.deltaRebornCoin;
                    needPush = this.roleInfo.deltaRebornCoin > 0;
                }
                if ((needPush && GetItemDataModel.instance.needPop) && needPop) {
                    totalNeed = true;
                    GetItemDataModel.instance.addConsumeByServer([info[0], delta]);
                }
            }
            this.roleInfo.updateRoleBuyTimes(data[1]);
            if (autoPatchEvent) {
                Signal.intance.event(GameEvent.ROLE_INFO_CHANGE);
            }
            if (totalNeed && GetItemDataModel.instance.autoPop) {
                GetItemService.instance.startShow();
            }
        }
        roleEnduranceHandler(data, needPop = false) {
            let needPush = false;
            let totalPush = false;
            this.roleInfo.maxps = data[0];
            this.roleInfo.maxendurance = data[1];
            this.roleInfo.money3 = data[2];
            needPush = this.roleInfo.deltaPs > 0;
            if ((needPush && !this.initReceive) && needPop) {
                GetItemDataModel.instance.addConsumeByServer([EnumConsumeType.TYPE_PS, this.roleInfo.deltaPs]);
                totalPush = true;
            }
            this.roleInfo.money4 = data[3];
            needPush = this.roleInfo.deltaEndurance > 0;
            if ((needPush && !this.initReceive) && needPop) {
                totalPush = true;
                GetItemDataModel.instance.addConsumeByServer([EnumConsumeType.TYPE_ENDURANCE, this.roleInfo.deltaEndurance]);
            }
            this.roleInfo.pleftsec = data[4];
            this.roleInfo.eleftsec = data[5];
            console.log("tili time:" + this.roleInfo.pleftsec);
            console.log("naili time:" + this.roleInfo.eleftsec);
            if ((totalPush && !this.initReceive) && GetItemDataModel.instance.autoPop) {
                GetItemService.instance.startShow();
            }
            this.roleInfo.updateHasTiliNaili(data[6]);
            this.roleInfo.updateMaxTiliNaili(data[7]);
            this.roleInfo.updateRoleBuyTimes(data[8]);
            Signal.intance.event(GameEvent.ROLE_INFO_CHANGE);
            this.initReceive = false;
        }
        roleLeveHandler(data) {
            let needSend = this.roleInfo.level > 0 && this.roleInfo.level != data[0];
            let lastLevel = this.roleInfo.level;
            this.roleInfo.level = data[0];
            this.roleInfo.money6 = data[1];
            let currLevel = this.roleInfo.level;
            if ((this.roleInfo.deltaExp > 0 && GetItemDataModel.instance.needPop) && !this.initReceiveExp) {
                GetItemDataModel.instance.addConsumeByServer([EnumConsumeType.TYPE_EXP, this.roleInfo.deltaExp]);
            }
            if (GetItemDataModel.instance.autoPop && !this.initReceiveExp) {
                GetItemService.instance.startShow();
            }
            this.initReceiveExp = false;
            if (needSend) {
                Signal.intance.event(GameEvent.ROLE_INFO_CHANGE);
                Signal.intance.event(GameEvent.EVENT_OPEN_MODULE, [ModuleName.RoleUpgradeView]);
                let level7 = parseInt(SheetDataManager.intance.getGeneralValueById(80) + "");
                let level13 = parseInt(SheetDataManager.intance.getGeneralValueById(81) + "");
                let level35 = parseInt(SheetDataManager.intance.getGeneralValueById(82) + "");
                if (lastLevel < level7 && currLevel >= level7) {
                    PlatFormManager.instance.sendCustumEvent(39);
                }
                if (lastLevel < level13 && currLevel >= level13) {
                    PlatFormManager.instance.sendCustumEvent(40);
                }
                if (lastLevel < level35 && currLevel >= level35) {
                    PlatFormManager.instance.sendCustumEvent(41);
                }
                AndroidPlatform.instance.FGM_Event_LevelUp(currLevel);
            }
        }
        roleInfoHandler(data) {
            this.roleInfo.initRoleInfo(data);
            Signal.intance.event(GameEvent.ROLE_INFO_CHANGE);
        }
        initGuideHandler(data) {
            let guideID = data[0];
            let guides = data[1];
            if (GameSetting.UseGuide == false) {
                guideID = 0;
                guides = [100, 110, 120, 130, 140, 150, 160, 190, 200, 210, 220, 230, 232, 235, 245, 250, 260, 270, 280, 290, 293, 296, 300, 310, 330];
            }
        }
        commonErrHandler(value) {
            LoadingManager.instance.hideLoading();
            if (parseInt(value[0]) == 20000) {
                if (this.needPopError) {
                    ErrorPopManager.instance.showErrorWord(parseInt(value[0]));
                    Signal.intance.event(GameEvent.RECIVE_SUCESS_SERVICE);
                }
                return;
            }
            else if (parseInt(value[0]) == 20008) {
                Signal.intance.event("open_buy", 1);
                return;
            }
            else if (parseInt(value[0]) == 20007) {
                Signal.intance.event("open_buy", 2);
                return;
            }
            else if (parseInt(value[0]) == 20015) {
                Signal.intance.event("open_buy", 3);
                return;
            }
            else if (parseInt(value[0]) == 20016) {
                Signal.intance.event("open_buy", 4);
                return;
            }
            else if (parseInt(value[0]) == 10021) {
                HttpNetService.ErrorTips = ErrorPopManager.instance.get(10021);
                ModuleManager.intance.openModule(ModuleName.ClientErrView);
                return;
            }
            else if (parseInt(value[0]) == 10023) {
                HttpNetService.ErrorTips = ErrorPopManager.instance.get(10023);
                ModuleManager.intance.openModule(ModuleName.ClientErrView);
                return;
            }
            else if (parseInt(value[0]) == 10019) {
                HttpNetService.ErrorTips = ErrorPopManager.instance.get(10019);
                ModuleManager.intance.openModule(ModuleName.ClientErrView);
                return;
            }
            else if (parseInt(value[0]) == 20053) {
            }
            else if (parseInt(value[0]) == 10002) {
                HttpNetService.ErrorTips = GameLanguageMgr.instance.getConfigLan(5085);
                ModuleManager.intance.openModule(ModuleName.ClientErrView);
                return;
            }
            ErrorPopManager.instance.showErrorWord(parseInt(value[0]));
            console.log("Server Error Code:" + value[0]);
        }
        dispose() {
        }
        handleSaveCloth(data) {
            let arr = data;
            if (arr[0] == 20000) {
                GlobalDataManager.instance.roleInfo.initCloths(data[1]);
                Signal.intance.event(GameEvent.MYHOME_CLOSE_CLOTH, [GameEvent.MYHOME_CLOSE_CLOTH]);
            }
        }
        parseNumber(setValue) {
            let _value = [];
            for (let i = 0; i < setValue.length; i++) {
                let v = setValue[i];
                v = this.dividedNumber(v);
                _value.push(v.toString());
            }
            return _value;
        }
        dividedNumber(v) {
            return v / 10000;
        }
    }

    class SpotInfo {
        constructor() {
            this.type = "base";
        }
    }

    class Debugger {
        constructor(stage, isRelease) {
            this._lineIndex = 0;
            this._isShow = false;
            this._alpha = 0.3;
            this.isInit = false;
            this._isRelease = true;
            this._count = 0;
            this.maxCount = 1000;
            this.prevX = 0;
            this.prevY = 0;
            this._stage = stage;
            this._isRelease = isRelease;
            this._actionLineList = [];
            this._time = (new Date()).getTime();
            let moveStartX;
            let moveStartY;
            let moveEndX;
            let moveEndY;
            let onDebugDown = function (e) {
                moveStartX = e.stageX;
                moveStartY = e.stageY;
                moveEndX = moveStartX;
                moveEndY = moveStartY;
            };
            let onDebugMove = function (e) {
                moveEndX = e.stageX;
                moveEndY = e.stageY;
            };
            let onDebugUp = function (e) {
                let widthEnough = Laya.stage.width - (moveEndX - moveStartX) < 160;
                let heightEnough = Laya.stage.height - (moveEndY - moveStartY) < 160;
                console.log("MainGame.onDebugUp(e)", "currentTarget: " + e.currentTarget["constructor"].name, "target: " + e.target["constructor"].name, widthEnough, heightEnough);
                if (widthEnough && heightEnough) {
                    if (Debug.debugger) {
                        if (this._isRelease) {
                            AndroidPlatform.instance.FGM_OpenComment();
                        }
                        else {
                            Debug.debugger.showOrHide();
                        }
                        Laya.timer.callLater(this, function () {
                        });
                    }
                }
            };
            Laya.stage.on(Laya.Event.MOUSE_DOWN, this, onDebugDown);
            Laya.stage.on(Laya.Event.MOUSE_MOVE, this, onDebugMove);
            Laya.stage.on(Laya.Event.MOUSE_UP, this, onDebugUp);
        }
        initDebugView() {
            if (!this.isInit) {
                this.totalW = Laya.stage.width;
                this.totalH = Laya.stage.height / 2;
                this.bigContainer = new Laya.Sprite();
                this.bgContainer = new Laya.Sprite();
                this._bgSp = new Laya.Sprite();
                this._bgSp.alpha = this._alpha;
                this._bgSp.graphics.drawRect(0, 0, this.totalW, this.totalH, "#000000");
                this._bgSp.mouseEnabled = false;
                this._debugInfoTf = new Laya.Text();
                this._debugInfoTf.color = "#ffffff";
                this._debugInfoTf.width = this.totalW - 10;
                this._debugInfoTf.height = this.totalH - 10;
                this._debugInfoTf.overflow = "scroll";
                this._debugInfoTf.wordWrap = true;
                let selfStr = "[LOADINFO - DEBUGGER]";
                this.appendText("加载调试信息 " + selfStr, 0, false);
                this._closeTf = new Laya.Label();
                this._closeTf.color = "#ff0000";
                this._closeTf.valign = "middle";
                this._closeTf.width = 55;
                this._closeTf.height = 55;
                this._closeTf.borderColor = Debugger.DEFAULT_COLOR;
                this._closeTf.text = "关闭";
                this._autoScrollTf = new Laya.Label();
                this._autoScrollTf.color = "#ff0000";
                this._autoScrollTf.valign = "middle";
                this._autoScrollTf.width = 55;
                this._autoScrollTf.height = 55;
                this._autoScrollTf.borderColor = Debugger.DEFAULT_COLOR;
                this._autoScrollTf.text = "自动卷屏";
                this._bgAlpha0 = new Laya.Label();
                this._bgAlpha0.color = "#ff0000";
                this._bgAlpha0.valign = "middle";
                this._bgAlpha0.width = 55;
                this._bgAlpha0.height = 55;
                this._bgAlpha0.borderColor = Debugger.DEFAULT_COLOR;
                this._bgAlpha0.text = "背景-";
                this._bgAlpha1 = new Laya.Label();
                this._bgAlpha1.color = "#ff0000";
                this._bgAlpha1.valign = "middle";
                this._bgAlpha1.width = 55;
                this._bgAlpha1.height = 55;
                this._bgAlpha1.borderColor = Debugger.DEFAULT_COLOR;
                this._bgAlpha1.text = "背景+";
                this._clearTf = new Laya.Label();
                this._clearTf.color = "#ff0000";
                this._clearTf.valign = "middle";
                this._clearTf.width = 55;
                this._clearTf.height = 55;
                this._clearTf.borderColor = Debugger.DEFAULT_COLOR;
                this._clearTf.text = "清理";
                this._testTf = new Laya.Label();
                this._testTf.color = "#ff0000";
                this._testTf.width = 55;
                this._testTf.height = 55;
                this._testTf.borderColor = Debugger.DEFAULT_COLOR;
                this._testTf.text = "点穿";
                this.bgContainer.x = 5;
                this.bgContainer.y = 5;
                this._debugInfoTf.x = 5;
                this._debugInfoTf.y = 5;
                this.bgContainer.addChild(this._bgSp);
                this.bgContainer.addChild(this._debugInfoTf);
                this._closeTf.x = this.totalW - 60;
                this._closeTf.y = 5;
                this.bgContainer.addChild(this._closeTf);
                this._autoScrollTf.x = this.totalW - 60;
                this._autoScrollTf.y = 105;
                this.bgContainer.addChild(this._autoScrollTf);
                this._bgAlpha0.x = this.totalW - 60;
                this._bgAlpha0.y = 205;
                this.bgContainer.addChild(this._bgAlpha0);
                this._bgAlpha1.x = this.totalW - 60;
                this._bgAlpha1.y = 305;
                this.bgContainer.addChild(this._bgAlpha1);
                this._clearTf.x = this.totalW - 60;
                this._clearTf.y = 405;
                this.bgContainer.addChild(this._clearTf);
                this._testTf.x = this.totalW - 60;
                this._testTf.y = 505;
                this.bigContainer.addChild(this.bgContainer);
                this.bigContainer.addChild(this._testTf);
                this._autoScroll = true;
                this._hide = true;
                this._debugInfoTf.on(Laya.Event.MOUSE_DOWN, this, this.startScrollText);
                this._closeTf.on(Laya.Event.CLICK, this, this.onCloseTfClick);
                this._autoScrollTf.on(Laya.Event.CLICK, this, this.onAutoScrollTfClick);
                this._bgAlpha0.on(Laya.Event.CLICK, this, this.onBgAlpha0);
                this._bgAlpha1.on(Laya.Event.CLICK, this, this.onBgAlpha1);
                this._clearTf.on(Laya.Event.CLICK, this, this.onClearTfClick);
                this._testTf.on(Laya.Event.CLICK, this, this.onTestTfClick);
                this.isInit = true;
            }
        }
        show() {
            this.initDebugView();
            this._stage.addChild(this.bigContainer);
            this._isShow = true;
            this.updateView();
        }
        hide() {
            this.initDebugView();
            if (this.bigContainer.parent) {
                this.bigContainer.parent.removeChild(this.bigContainer);
            }
            this._isShow = false;
            this.updateView();
        }
        showOrHide() {
            this._isShow = !this._isShow;
            if (this._isShow) {
                this.show();
            }
            else {
                this.hide();
            }
        }
        appendText(str, color = 0, addTime = true) {
            if (addTime) {
                let time = (new Date()).getTime() - this._time;
                str += "  [" + (time / 1000).toFixed(3) + "]";
            }
            this._actionLineList.push([str + "\n", color]);
            if (this._lineIndex >= 200) {
                this._actionLineList.splice(0, 20);
                this._lineIndex -= 20;
            }
            this._count++;
            if (this._count > this.maxCount) {
                this._count = 0;
                if (this._debugInfoTf) {
                    this._debugInfoTf.text = "";
                }
            }
            if (this._isShow) {
                this._currentLine = this._actionLineList[this._lineIndex++];
                if (this._debugInfoTf) {
                    this._debugInfoTf.text += this._currentLine[0];
                }
                if (this._autoScroll) {
                    if (this._debugInfoTf) {
                        this._debugInfoTf.scrollY = this._debugInfoTf.maxScrollY;
                    }
                }
            }
        }
        updateView() {
            if (this._isShow) {
                this._count = 0;
                this._debugInfoTf.text = "";
                let len = this._actionLineList.length;
                for (this._lineIndex = 0; this._lineIndex < len; ++this._lineIndex) {
                    this._currentLine = this._actionLineList[this._lineIndex];
                    this._debugInfoTf.text += this._currentLine[0];
                    this._count++;
                    if (this._count > this.maxCount) {
                        this._count = 0;
                        this._debugInfoTf.text = "";
                    }
                }
                if (this._autoScroll) {
                    this._debugInfoTf.scrollY = this._debugInfoTf.maxScrollY;
                }
            }
            else {
                this._debugInfoTf.text = "";
            }
        }
        onCloseTfClick(e) {
            this.hide();
        }
        onAutoScrollTfClick(e) {
            this._autoScroll = !this._autoScroll;
            if (this._autoScroll) {
                this._autoScrollTf.text = "自动卷屏";
            }
            else {
                this._autoScrollTf.text = "手动卷屏";
            }
        }
        onBgAlpha0(e) {
            this._alpha -= 0.1;
            if (this._alpha <= 0) {
                this._alpha = 0;
            }
            this._bgSp.alpha = this._alpha;
        }
        onBgAlpha1(e) {
            this._alpha += 0.1;
            if (this._alpha >= 1) {
                this._alpha = 1;
            }
            this._bgSp.alpha = this._alpha;
        }
        onClearTfClick(e) {
            this._debugInfoTf.text = "";
            this._actionLineList.length = 0;
            this._lineIndex = 0;
        }
        onTestTfClick(e) {
            this.bgContainer.mouseEnabled = !this.bgContainer.mouseEnabled;
        }
        set testFun(value) {
            this._testFun = value;
        }
        get bgSp() {
            return this._bgSp;
        }
        startScrollText(e) {
            this.prevX = this._debugInfoTf.mouseX;
            this.prevY = this._debugInfoTf.mouseY;
            Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.scrollText);
            Laya.stage.on(Laya.Event.MOUSE_UP, this, this.finishScrollText);
        }
        finishScrollText(e) {
            Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.scrollText);
            Laya.stage.off(Laya.Event.MOUSE_UP, this, this.finishScrollText);
        }
        scrollText(e) {
            let nowX = this._debugInfoTf.mouseX;
            let nowY = this._debugInfoTf.mouseY;
            this._debugInfoTf.scrollX += this.prevX - nowX;
            this._debugInfoTf.scrollY += this.prevY - nowY;
            this.prevX = nowX;
            this.prevY = nowY;
        }
    }
    Debugger.DEFAULT_COLOR = "#ffffff";

    class Debug {
        static Initialize(stage, isRelease) {
            Debug.isRelease = isRelease;
            if (this.debugger == null) {
                this.debugger = new Debugger(stage, isRelease);
            }
        }
        static Log(message, type = 0, color = 0) {
            if (this.debugger) {
                this.debugger.appendText(message, color);
            }
            console.log(message);
        }
    }

    class EnumAd {
        constructor() {
        }
    }
    EnumAd.AD_BUY_MONEY = 63;
    EnumAd.AD_BUY_PHYSICAL = 64;
    EnumAd.adv_cancelRestore = "adv_cancelRestore";
    EnumAd.adv_restore = "adv_restore";
    EnumAd.adv_back = "adv_back";
    EnumAd.adv_next = "adv_next";
    EnumAd.adv_reset = "adv_reset";
    EnumAd.adv_levelUp = "adv_levelUp";
    EnumAd.CROSS_CLICK_ADV = "CROSS_CLICK_ADV";
    EnumAd.login = "login";
    EnumAd.createnickname = "createnickname";
    EnumAd.validuser = "validuser";
    EnumAd.GAME_START = "GAME_START";
    EnumAd.GAME_LEVEL_UP = "GAME_LEVEL_UP";
    EnumAd.GAME_END_WIN = "GAME_END_WIN";
    EnumAd.GAME_END_LOSE = "GAME_END_LOSE";
    EnumAd.GAME_CUP = "GAME_CUP";

    class NumberUtil {
        static toFixed(number, decimalPointCount) {
            if (number.toString().indexOf(".") == -1) {
                return number;
            }
            else {
                let str = number.toFixed(decimalPointCount);
                return parseFloat(str);
            }
        }
        static toFixedWithPercent(number, decimalPointCount, addStr = "+") {
            let str;
            if (number.toString().indexOf(".") == -1) {
                str = addStr + number * 100 + "%";
            }
            else {
                decimalPointCount = decimalPointCount - 2;
                if (decimalPointCount < 0) {
                    decimalPointCount = 0;
                }
                str = addStr + (number * 100).toFixed(decimalPointCount) + "%";
            }
            return str;
        }
        static getGoldStr(num) {
            let str;
            if (num > 999999) {
                str = parseInt(String(num / 100000)) + "m";
            }
            else {
                str = num;
            }
            return str;
        }
        static numStringFormat(num) {
            let str = num;
            if (GlobalDataManager.instance.m_strLanguage == 2) {
                if (num.length > 4) {
                    str = String(num).replace(/(\d)(?=(\d{3})+$)/g, "$1 ");
                }
            }
            else {
                str = String(num).replace(/(\d)(?=(\d{3})+$)/g, "$1,");
            }
            return str;
        }
        static numSimple(num) {
            let str = num;
            let knum = parseInt(parseInt(str) / 1000 + "");
            if (knum > 0) {
                return knum + "k";
            }
            return NumberUtil.numStringFormat(str);
        }
        static numStringFormat2(num) {
            let str;
            if (num > 999999) {
                str = NumberUtil.getNumStr(num, 1000000, "M");
            }
            else if (num > 999) {
                str = NumberUtil.getNumStr(num, 1000, "K");
            }
            else {
                return num + "";
            }
            return str;
        }
        static getNumStr(numI, numM, lauguage) {
            let str = parseInt(Math.floor(numI / numM) + "") + lauguage;
            return str;
        }
        static getTimeStr(times) {
            let str;
            if (times < 3600) {
                str = GameLanguageMgr.instance.getLanguage(9024, Math.ceil(times / 60));
            }
            else if (times < 3600 * 24) {
                str = GameLanguageMgr.instance.getLanguage(9025, Math.ceil(times / 3600));
            }
            else {
                str = GameLanguageMgr.instance.getLanguage(9025, Math.ceil(times / (3600 * 24)));
            }
            return str;
        }
        static BigInt(value) {
            return 0;
        }
        static isInteger(obj) {
            return obj % 1 === 0;
        }
    }

    class TimeUtil {
        constructor() {
        }
        static formatMM(totalMM) {
            if (totalMM <= 0) {
                return '00:000';
            }
            let _second, millisecon;
            _second = totalMM / 1000;
            millisecon = totalMM % 1000;
            let numberTime = "";
            if (_second <= 9) {
                numberTime += "0";
            }
            numberTime += Math.floor(_second);
            numberTime += ":";
            if (millisecon <= 9) {
                numberTime += "00";
            }
            else if (millisecon <= 99) {
                numberTime += "0";
            }
            numberTime += millisecon;
            return numberTime;
        }
        static format(totalsec, _sign = ":", needHour = true) {
            if (totalsec <= 0) {
                if (needHour) {
                    return '00:00:00';
                }
                return '00:00';
            }
            let _second, _day, remain, _hours, _minute;
            _hours = totalsec / 3600;
            remain = totalsec % 3600;
            _minute = remain / 60;
            _second = remain % 60;
            let numberTime = "";
            if (needHour) {
                if (_hours <= 9) {
                    numberTime += "0";
                }
                numberTime += Math.floor(_hours) + _sign;
            }
            if (_minute <= 9) {
                numberTime += "0";
            }
            numberTime += Math.floor(_minute) + _sign;
            if (Math.ceil(_second) <= 9) {
                numberTime += "0";
            }
            numberTime += Math.ceil(_second);
            return numberTime;
        }
        static formatWithDay(totalsec, _sign = ":") {
            if (totalsec <= 0) {
                return '00:00';
            }
            let _second, _day, remain, _hours, _minute;
            _day = totalsec / 86400;
            remain = totalsec % 86400;
            _hours = remain / 3600;
            remain = remain % 3600;
            _minute = remain / 60;
            _second = remain % 60;
            let numberTime = "";
            if (_day >= 1) {
                let lanId = _day > 1 ? 2005 : 2003;
                numberTime = GameLanguageMgr.instance.getLanguage(lanId, Math.floor(_day)) + " ";
                if (_hours <= 9) {
                    numberTime += "0";
                }
                if (_second % 2 != 0) {
                    _sign = Quick.getColorText(_sign, "#412b20");
                }
                numberTime += Math.floor(_hours) + _sign;
                if (_minute <= 9) {
                    numberTime += "0";
                }
                numberTime += Math.floor(_minute);
            }
            else {
                if (_hours <= 9) {
                    numberTime += "0";
                }
                numberTime = Math.floor(_hours) + _sign;
                if (_minute <= 9) {
                    numberTime += "0";
                }
                numberTime += Math.floor(_minute) + _sign;
                if (Math.ceil(_second) <= 9) {
                    numberTime += "0";
                }
                numberTime += Math.ceil(_second);
            }
            return numberTime;
        }
        static getTimeArray(second, formatType = "HH-MM-SS") {
            second = Math.max(0, second);
            if (formatType.indexOf("-") == -1) {
                return [];
            }
            let result = [];
            let types = formatType.split("-");
            for (let type of types) {
                if (type == "DD") {
                    result.push(Math.floor(second / TimeUtil.OneDaySceond));
                }
                else if (type == "HH") {
                    result.push(Math.floor(second % TimeUtil.OneDaySceond / TimeUtil.OneHourSceond));
                }
                else if (type == "MM") {
                    result.push(Math.floor(second % TimeUtil.OneHourSceond / TimeUtil.OneMiniuteSecond));
                }
                else if (type == "SS") {
                    result.push(second % TimeUtil.OneMiniuteSecond);
                }
            }
            return result;
        }
        static getServerDate(timeStamp) {
            let date = new Date(timeStamp);
            return date;
        }
        static formatTimeStamp(time, formatType = "YY-MT-DD", splitStr = "/") {
            let date = TimeUtil.getServerDate(time);
            let types = formatType.split("-");
            let formatStr = "";
            if ((types.indexOf("MT") >= 0 || types.indexOf("YY") >= 0) || types.indexOf("DD") >= 0) {
                if (types.indexOf("YY") >= 0) {
                    formatStr += date.getFullYear() + splitStr;
                }
                if (types.indexOf("MT") >= 0) {
                    formatStr += date.getMonth() + 1;
                    if (types.indexOf("DD") >= 0) {
                        formatStr += splitStr;
                    }
                }
                if (types.indexOf("DD") >= 0) {
                    formatStr += date.getDate();
                }
            }
            else if ((types.indexOf("HH") >= 0 || types.indexOf("MM") >= 0) || types.indexOf("SS") >= 0) {
                if (types.indexOf("HH") >= 0) {
                    let hour = date.getHours();
                    if (hour > 9) {
                        formatStr += hour + splitStr;
                    }
                    else {
                        formatStr += "0" + hour + splitStr;
                    }
                }
                if (types.indexOf("MM") >= 0) {
                    let min = date.getMinutes();
                    if (min > 9) {
                        formatStr += min;
                    }
                    else {
                        formatStr += "0" + min;
                    }
                    if (types.indexOf("SS") >= 0) {
                        formatStr += splitStr;
                    }
                }
                if (types.indexOf("SS") >= 0) {
                    let sec = date.getSeconds();
                    if (sec > 9) {
                        formatStr += sec;
                    }
                    else {
                        formatStr += "0" + sec;
                    }
                }
            }
            return formatStr;
        }
        static formatTimeStamps(time, formatType = "YY-MT-DD HH-MM-SS") {
            let date = TimeUtil.getServerDate(time);
            let formatStr = formatType;
            formatStr = TimeUtil.parseTimeDetail(date, formatStr, "YY", false);
            formatStr = TimeUtil.parseTimeDetail(date, formatStr, "MT", false);
            formatStr = TimeUtil.parseTimeDetail(date, formatStr, "DD", false);
            formatStr = TimeUtil.parseTimeDetail(date, formatStr, "HH", true);
            formatStr = TimeUtil.parseTimeDetail(date, formatStr, "MM", true);
            formatStr = TimeUtil.parseTimeDetail(date, formatStr, "SS", true);
            return formatStr;
        }
        static parseTimeDetail(date, formatStr, signType, needZero) {
            if (formatStr.indexOf(signType) >= 0) {
                let secStr;
                let sec;
                if (signType == "YY") {
                    sec = date.getFullYear();
                }
                else if (signType == "MT") {
                    sec = date.getMonth() + 1;
                }
                else if (signType == "DD") {
                    sec = date.getDate();
                }
                else if (signType == "HH") {
                    sec = date.getHours();
                }
                else if (signType == "MM") {
                    sec = date.getMinutes();
                }
                else if (signType == "SS") {
                    sec = date.getSeconds();
                }
                if (sec > 9 || !needZero) {
                    secStr = sec.toString();
                }
                else {
                    secStr = "0" + sec;
                }
                formatStr = formatStr.replace(signType, secStr);
            }
            return formatStr;
        }
        static getServerTimeStr() {
            return TimeUtil.formatTimeStamp(Laya.timer.currTimer);
        }
        static getTimeArr() {
            let str = TimeUtil.getServerTimeStr();
            let arr = str.split("/");
            return arr;
        }
        static get getDay() {
            let str = TimeUtil.getServerTimeStr();
            let arr = str.split("/");
            let day = parseInt(arr[2]);
            return day;
        }
        static parseSheetTime(time1) {
            let timeStr = "";
            if (time1) {
                let len = time1.length;
                for (let i = 0; i < len; i++) {
                    let temp = "";
                    if (time1[i] < 10) {
                        temp = "0" + time1[i];
                    }
                    else {
                        temp = time1[i];
                    }
                    if (i !== len - 1) {
                        temp = temp + ":";
                    }
                    timeStr += temp;
                }
            }
            return timeStr;
        }
    }
    TimeUtil.OneDaySceond = 24 * 3600;
    TimeUtil.OneHourSceond = 3600;
    TimeUtil.OneMiniuteSecond = 60;

    class FindModel {
        constructor() {
            this._inited = false;
            this.sign = "item_";
            this._mass = 30;
            this._friction = 1000;
            this._restitution = 0.1;
            this._sX = 4.5;
            this._sY = 5;
            this._sZ = 4.5;
            this.sX = 4.5;
            this.sY = 5;
            this.sZ = 4.5;
            this.maxTimes = 30;
            this.bannerIndex = 0;
            this.currRound = 1;
            this.init();
        }
        isNoAd() {
            if (GameUserInfo.instance.currTimes < this.maxTimes) {
                return true;
            }
            else {
                let serverTime = TimeUtil.getServerTimeStr();
                if (serverTime != GameUserInfo.instance.lastServerTime) {
                    GameUserInfo.instance.currTimes = 0;
                    return true;
                }
                return false;
            }
        }
        addTime() {
            if (GameUserInfo.instance.currTimes < this.maxTimes) {
                GameUserInfo.instance.lastServerTime = TimeUtil.getServerTimeStr();
                GameUserInfo.instance.currTimes++;
            }
        }
        get ONE() {
            return 0.1;
        }
        get ZERO() {
            return 0;
        }
        static get instance() {
            if (!FindModel._instance) {
                FindModel._instance = new FindModel();
            }
            return FindModel._instance;
        }
        init() {
            if (!this._inited) {
                this._inited = true;
            }
        }
        get topFloor() {
            if (this.selectWorldMapItem) {
                return parseInt(this.selectWorldMapItem.floor + "");
            }
            return 15;
        }
        mockCupData() {
        }
        getHead(sex) {
            let index = Math.floor(Math.random() * 3) + 1;
            return "common/common_icon/img_" + sex + "_" + index + ".png";
        }
        getRoundName(_roundType) {
            let str = GameLanguageMgr.instance.getLanguage(10014, 16, 8);
            if (_roundType == 4) {
                str = GameLanguageMgr.instance.getLanguage(10014, 2, 1);
            }
            else if (_roundType == 3) {
                str = GameLanguageMgr.instance.getLanguage(10014, 4, 2);
            }
            else if (_roundType == 2) {
                str = GameLanguageMgr.instance.getLanguage(10014, 8, 4);
            }
            return str;
        }
        mockNextCupData() {
            let currNum = Math.pow(2, 5 - this.currRound);
            let lastTeamNum = currNum / 2;
            this.currRound++;
            let nextNum = Math.pow(2, 5 - this.currRound);
            let allPlayers = [];
            for (let i = 0; i < lastTeamNum; i++) {
                let team = this.teams[i];
                if (i == 0) {
                    allPlayers.push(team[0]);
                }
                else {
                    let index = Math.floor(Math.random() * 2);
                    allPlayers.push(team[index]);
                }
            }
            this.teams = [];
            let teamNum = nextNum / 2;
            for (let j = 0; j < teamNum; j++) {
                this.teams.push([allPlayers[j * 2], allPlayers[j * 2 + 1]]);
            }
            let rooms = SheetDataManager.intance.m_dicWorldMap.values;
            let _selectWorldMapItem = rooms[0];
            let floor = 9;
            if (this.currRound == 2) {
                floor = 13;
            }
            else if (this.currRound == 3) {
                floor = 15;
            }
            else {
                floor = 17;
            }
            _selectWorldMapItem.floor = floor;
            let leftPlayer = allPlayers[0];
            let rightPlayer = allPlayers[1];
            _selectWorldMapItem.leftPlayer = leftPlayer;
            _selectWorldMapItem.rightPlayer = rightPlayer;
            FindModel.instance.selectWorldMapItem = _selectWorldMapItem;
        }
        getNumName(wordNum) {
            wordNum = this.getNum(wordNum);
            return NumberUtil.numStringFormat2(wordNum);
        }
        getNum(wordNum) {
            return Math.pow(2, wordNum);
        }
        setPopTip() {
            GameUserInfo.instance.totalRound++;
            if (GameUserInfo.instance.totalRound == 1) {
                PlatFormManager.instance.sendCustumEvent(7);
            }
            else if (GameUserInfo.instance.totalRound == 2) {
                FindModel.instance.needNotice = true;
            }
            else if (GameUserInfo.instance.totalRound == 3 || GameUserInfo.instance.totalRound == 7) {
                FindModel.instance.needMark = true;
            }
            if (!FindModel.instance.needMark) {
                FindModel.instance.needPopRecharge = this.checkNeedPopRecharge();
            }
        }
        checkNeedPopRecharge() {
            let serverTime = TimeUtil.getServerTimeStr();
            if (serverTime != GameUserInfo.instance.lastServerTime) {
                GameUserInfo.instance.currTimes = 0;
            }
            this.playTimes++;
            if ((this.playTimes == 4 || this.playTimes == 9) && GameUserInfo.instance.currTimes < 2) {
                GameUserInfo.instance.lastServerTime = TimeUtil.getServerTimeStr();
                GameUserInfo.instance.currTimes++;
                return true;
            }
            return false;
        }
        showPpopTip() {
            if (FindModel.instance.needMark) {
                AndroidPlatform.instance.FGM_OpenAppScore();
                FindModel.instance.needMark = false;
            }
            if (FindModel.instance.needNotice) {
                AndroidPlatform.instance.FGM_Notification();
                FindModel.instance.needNotice = false;
            }
            if (FindModel.instance.needPopRecharge) {
                AndroidPlatform.instance.showRecharge();
                FindModel.instance.needPopRecharge = false;
            }
        }
        getLevelItem(level) {
            return null;
        }
        sortPops(pops) {
            pops.sort(this.sortOnNum);
            let _pops = [];
            let start = 0;
            for (let k = 0; k < 5; k++) {
                let popLine = pops.slice(start, start + 5);
                start += 5;
                if (k % 2 == 0) {
                    popLine.reverse();
                }
                _pops = _pops.concat(popLine);
            }
            return _pops;
        }
        sortOnNum(a, b) {
            let aState = parseInt(a);
            let bState = parseInt(b);
            if (aState < bState) {
                return -1;
            }
            else if (aState > bState) {
                return 1;
            }
            else {
                return 0;
            }
        }
        checkIsFall(humanSpr) {
            let hasFall = false;
            if ((humanSpr.x > this.maxX || humanSpr.x < this.minX) || humanSpr.y > this.maxY) {
                hasFall = true;
            }
            return hasFall;
        }
    }

    class RankingItem extends BaseItem {
    }

    class FindSheetDataManager {
        constructor() {
        }
        static get instance() {
            if (!FindSheetDataManager._instance) {
                FindSheetDataManager._instance = new FindSheetDataManager();
            }
            return FindSheetDataManager._instance;
        }
        initFind() {
            if (this.rankDic == null) {
                this.smallRankDic = new Dictionary();
                this.bigRankDic = new Dictionary();
                this.rankDic = new Dictionary();
                let json = GameResourceManager.instance.getResByURL("config/ranking.json");
                let rankingItem;
                for (let value of json) {
                    rankingItem = new RankingItem();
                    rankingItem.init(value);
                    if (rankingItem.npcid.toString() != "") {
                        this.middleRankNum = parseInt(rankingItem.rank + "");
                        this.middleRankCoin = parseInt(rankingItem.score + "");
                        this.smallRankDic.set(rankingItem.rank, rankingItem);
                    }
                    else {
                        this.bigRankDic.set(rankingItem.rank, rankingItem);
                    }
                    this.rankDic.set(rankingItem.rank, rankingItem);
                }
            }
        }
        getRankById(id) {
            this.initFind();
            return this.rankDic.get(id);
        }
        getBigRank(rankNum) {
            return null;
        }
    }

    class GameUserInfo {
        constructor() {
            this.CODE_NEW = GameUserInfo.GAME_TOKEN + "CODE_NEW";
            this.CODE_PLAYNAME = GameUserInfo.GAME_TOKEN + "PLAYNAME";
            this._playerName = "Player";
            this.CODE_PLAYHEAD = GameUserInfo.GAME_TOKEN + "PLAYHEAD";
            this._playerHead = "img_1_1";
            this.CODE_RANK = GameUserInfo.GAME_TOKEN + "RANK";
            this.CODE_ISRECHARGED = GameUserInfo.GAME_TOKEN + "CODE_ISRECHARGED";
            this.isCallBackOrder = false;
            this.CODE_CURRTIMES = GameUserInfo.GAME_TOKEN + "CURRTIMES";
            this.CODE_LASTSERVERTIME = GameUserInfo.GAME_TOKEN + "LASTSERVERTIME";
            this.CODE_TOTALROUND = GameUserInfo.GAME_TOKEN + "TOTALROUND";
            this.CODE_COINID = GameUserInfo.GAME_TOKEN + "COINID";
            this.CODE_LEVEL = GameUserInfo.GAME_TOKEN + "LEVEL";
            this.CODE_HUMAN = GameUserInfo.GAME_TOKEN + "HUMAN";
            this.CODE_MAX_TIME = GameUserInfo.GAME_TOKEN + "CODE_MAX_TIME";
            this.CODE_CURR_TIME = GameUserInfo.GAME_TOKEN + "CODE_CURR_TIME";
            this.CODE_IS_TIP = GameUserInfo.GAME_TOKEN + "CODE_IS_TIP";
            this.CODE_IS_GUIDE = GameUserInfo.GAME_TOKEN + "CODE_IS_GUIDE";
        }
        static get instance() {
            if (!GameUserInfo._instance) {
                GameUserInfo._instance = new GameUserInfo();
            }
            return GameUserInfo._instance;
        }
        setCmdData(cmdId, data) {
            let str = JSON.stringify(data);
            Laya.LocalStorage.setItem(GameUserInfo.GAME_TOKEN + "_" + cmdId, str);
        }
        getCmdData(cmdId) {
            let str = Laya.LocalStorage.getItem(GameUserInfo.GAME_TOKEN + "_" + cmdId);
            let obj = JSON.parse(str);
            return obj;
        }
        get isNewPlayer() {
            let tt = Laya.LocalStorage.getItem(this.CODE_NEW);
            if (!tt || tt == "") {
                this.isNewPlayer = false;
                return true;
            }
            return false;
        }
        set isNewPlayer(value) {
            Laya.LocalStorage.setItem(this.CODE_NEW, "notnew");
        }
        get playerName() {
            return this._playerName;
        }
        set playerName(value) {
            this._playerName = value;
            Laya.LocalStorage.setItem(this.CODE_PLAYNAME, this._playerName);
        }
        get playerHead() {
            return this._playerHead;
        }
        set playerHead(value) {
            this._playerHead = value;
            Laya.LocalStorage.setItem(this.CODE_PLAYHEAD, this._playerHead);
        }
        init() {
            if (this.isNewPlayer) {
                this.playerName = this._playerName;
                this.playerHead = this._playerHead;
                let spotInfo = new SpotInfo();
                spotInfo.Event = EnumAd.createnickname;
                spotInfo.platform = 1;
                spotInfo.ad = 1;
                spotInfo.needUid = 1;
                spotInfo.type = "act";
                PlatFormManager.instance.sendCustumEvent(0, null, spotInfo);
                this.coinNum = 0;
                this.rankNum = 586748;
                this.humans = ["1_1"];
                this.currHuman = 1;
            }
            else {
                this._playerName = Laya.LocalStorage.getItem(this.CODE_PLAYNAME);
                this._playerHead = Laya.LocalStorage.getItem(this.CODE_PLAYHEAD);
            }
        }
        get myRank() {
            let str;
            str = this.rankNum + "";
            return str;
        }
        get rankNum() {
            let tt = Laya.LocalStorage.getItem(this.CODE_RANK);
            if (tt) {
                let _tt = parseInt(tt);
                if (_tt && _tt > 0) {
                    return _tt;
                }
            }
            return 0;
        }
        set rankNum(value) {
            Laya.LocalStorage.setItem(this.CODE_RANK, value + "");
        }
        get coinNum() {
            let tt = Laya.LocalStorage.getItem(this.CODE_COINID);
            console.log("GameUserInfo.coinNum() tt: " + tt);
            if (tt) {
                let _tt = parseInt(tt);
                if (_tt && _tt > 0) {
                    return _tt;
                }
            }
            return 0;
        }
        set coinNum(value) {
            Laya.LocalStorage.setItem(this.CODE_COINID, value + "");
        }
        get isRecharged() {
            let tt = Laya.LocalStorage.getItem(this.CODE_ISRECHARGED);
            console.log("GameUserInfo.isRecharged() tt: " + tt);
            if (tt) {
                let _tt = parseInt(tt);
                if (_tt && _tt > 0) {
                    return _tt + "";
                }
            }
            return "0";
        }
        set isRecharged(value) {
            Laya.LocalStorage.setItem(this.CODE_ISRECHARGED, value + "");
        }
        AddCoinNum(_value) {
            this.coinNum += _value;
            this.getNewRank();
        }
        getNewRank() {
            let values;
            let myCoinNum = this.coinNum;
            if (myCoinNum < FindSheetDataManager.instance.middleRankCoin) {
                values = FindSheetDataManager.instance.bigRankDic.values;
            }
            else {
                values = FindSheetDataManager.instance.smallRankDic.values;
            }
            FindModel.instance.lastRank = this.rankNum;
            let newRankNum = this.rankNum;
            for (let j = 0; j < values.length; j++) {
                let rankItem = values[j];
                if (myCoinNum >= parseInt(rankItem.score + "")) {
                    newRankNum = parseInt(rankItem.rank + "");
                    break;
                    ;
                }
            }
            this.rankNum = newRankNum;
            FindModel.instance.rank = this.rankNum;
            console.log("GameUserInfo.getNewRank() lastRank: " + FindModel.instance.lastRank + ", rank: " + FindModel.instance.rank);
            Signal.intance.event(GameEvent.CHANGE_RANK);
        }
        get currTimes() {
            let tt = Laya.LocalStorage.getItem(this.CODE_CURRTIMES);
            if (tt) {
                let _tt = parseInt(tt);
                if (_tt && _tt > 0) {
                    return _tt;
                }
            }
            return 0;
        }
        set currTimes(value) {
            Laya.LocalStorage.setItem(this.CODE_CURRTIMES, value + "");
        }
        get lastServerTime() {
            let tt = Laya.LocalStorage.getItem(this.CODE_LASTSERVERTIME);
            console.log("GameUserInfo.lastServerTime() tt: " + tt);
            return tt;
        }
        set lastServerTime(value) {
            Laya.LocalStorage.setItem(this.CODE_LASTSERVERTIME, value + "");
        }
        get totalRound() {
            let tt = Laya.LocalStorage.getItem(this.CODE_TOTALROUND);
            if (tt) {
                let _tt = parseInt(tt);
                if (_tt && _tt > 0) {
                    return _tt;
                }
            }
            return 0;
        }
        set totalRound(value) {
            Laya.LocalStorage.setItem(this.CODE_TOTALROUND, value + "");
        }
        get level() {
            let tt = Laya.LocalStorage.getItem(this.CODE_LEVEL);
            if (tt) {
                let _tt = parseInt(tt);
                if (_tt && _tt > 0) {
                    return _tt;
                }
            }
            return 1;
        }
        set level(value) {
            Laya.LocalStorage.setItem(this.CODE_LEVEL, value + "");
        }
        get currTime() {
            let tt = Laya.LocalStorage.getItem(this.CODE_CURR_TIME);
            if (tt) {
                let _tt = parseInt(tt);
                if (_tt && _tt > 0) {
                    return _tt;
                }
            }
            return 0;
        }
        set currTime(value) {
            Laya.LocalStorage.setItem(this.CODE_CURR_TIME, value + "");
        }
        get isTip() {
            let tt = Laya.LocalStorage.getItem(this.CODE_IS_TIP);
            if (tt) {
                let _tt = parseInt(tt);
                if (_tt && _tt > 0) {
                    return _tt;
                }
            }
            return 0;
        }
        set isTip(value) {
            Laya.LocalStorage.setItem(this.CODE_IS_TIP, value + "");
        }
        get isGuide() {
            let tt = Laya.LocalStorage.getItem(this.CODE_IS_GUIDE);
            if (tt) {
                let _tt = parseInt(tt);
                if (_tt && _tt > 0) {
                    return _tt;
                }
            }
            return 0;
        }
        set isGuide(value) {
            Laya.LocalStorage.setItem(this.CODE_IS_GUIDE, value + "");
        }
        get currHuman() {
            let tt = Laya.LocalStorage.getItem(this.CODE_MAX_TIME);
            if (tt) {
                let _tt = parseInt(tt);
                if (_tt && _tt > 0) {
                    return _tt;
                }
            }
            return 1;
        }
        set currHuman(value) {
            Laya.LocalStorage.setItem(this.CODE_MAX_TIME, value + "");
        }
        get humans() {
            let tt = Laya.LocalStorage.getItem(this.CODE_HUMAN);
            if (tt) {
                let _tts = tt.split(",");
                if (_tts) {
                    return _tts;
                }
            }
            return null;
        }
        set humans(_tts) {
            if (_tts) {
                for (let i of _tts) {
                    if (i == "") {
                        throw new Error("GameUserInfo.pops(_tts) 有异常数据, value: " + i);
                    }
                }
                let str = _tts.join(",");
                Laya.LocalStorage.setItem(this.CODE_HUMAN, str);
            }
        }
        recharge() {
            if (GameUserInfo.instance.isRecharged == "1") {
                NoticeMgr.instance.notice(GameLanguageMgr.instance.getConfigLan(10011));
            }
            else {
                if (GameSetting.Login_UID == "-1") {
                    NoticeMgr.instance.notice(GameLanguageMgr.instance.getConfigLan(10012));
                }
                else if (GameUserInfo.instance.isCallBackOrder) {
                    PlatFormManager.instance.recharge();
                }
                else {
                    console.log("TVStartView.onClickADS() 订单状态未返回");
                }
            }
        }
    }
    GameUserInfo.GAME_TOKEN = "hjy3116";

    class AndroidPlatform {
        constructor() {
            this.AD_INTERSTITIAL = 2;
            this.AD_REWARDEDVIDEO = 3;
            this.adInterstitialTypes = [4, 1];
            this.adRewardTypes = [4, 1];
            this.isMaintainace = false;
            if (Laya.Render.isConchApp) {
                if (Laya.Browser.onIOS) {
                    this.m_patform = this.m_platformClass.newObject();
                }
                else if (Laya.Browser.onAndroid) {
                }
            }
        }
        static get instance() {
            if (AndroidPlatform._instance) {
                return AndroidPlatform._instance;
            }
            AndroidPlatform._instance = new AndroidPlatform();
            return AndroidPlatform._instance;
        }
        FGM_GetUDID(_callBack) {
            let callBack = function (str) {
                _callBack.runWith(str);
            };
            if (Laya.Browser.onIOS) {
                this.m_patform.callWithBack(callBack, "FGM_GetUDID");
            }
            else if (Laya.Browser.onAndroid) {
                this.m_platformClass.callWithBack(callBack, "FGM_GetUDID");
            }
        }
        FGM_GetAppVersion(_callBack) {
            let callBack = function (str) {
                _callBack.runWith(str);
            };
            if (Laya.Browser.onIOS) {
                this.m_patform.callWithBack(callBack, "FGM_GetAppVersion");
            }
            else if (Laya.Browser.onAndroid) {
                this.m_platformClass.callWithBack(callBack, "FGM_GetAppVersion");
            }
        }
        FGM_GetSDKVersion(_callBack) {
            let callBack = function (str) {
                _callBack.runWith(str);
            };
            if (Laya.Browser.onIOS) {
                this.m_patform.callWithBack(callBack, "FGM_GetSDKVersion");
            }
            else if (Laya.Browser.onAndroid) {
                this.m_platformClass.callWithBack(callBack, "FGM_GetSDKVersion");
            }
        }
        FGM_OpenAppStore(_callBack) {
            let callBack = function (str) {
                _callBack.runWith(str);
            };
            if (Laya.Browser.onIOS) {
                this.m_patform.callWithBack(callBack, "FGM_OpenAppStore");
            }
            else if (Laya.Browser.onAndroid) {
                this.m_platformClass.callWithBack(callBack, "FGM_OpenAppStore");
            }
        }
        FGM_GetDeviceInfo(_callBack) {
            let callBack = function (str) {
                _callBack.runWith(str);
            };
            if (Laya.Browser.onIOS) {
                this.m_patform.callWithBack(callBack, "FGM_GetDeviceInfo");
            }
            else if (Laya.Browser.onAndroid) {
                this.m_platformClass.callWithBack(callBack, "FGM_GetDeviceInfo");
            }
        }
        FGM_SetGameVersion() {
            let gameVersion = GameSetting.Game_Version;
            if (!Laya.Render.isConchApp) {
                return;
            }
            if (Laya.Browser.onIOS) {
                if (this.isOldThan("1.0.0")) {
                }
                else {
                    let jsonData = "";
                    let _obj = new Object();
                    _obj["gameVersion"] = gameVersion;
                    jsonData = JSON.stringify(_obj);
                    this.m_patform.call("FGM_SetGameVersion:", jsonData);
                }
            }
            else if (Laya.Browser.onAndroid) {
                if (parseInt(GameSetting.App_Version) >= 1000) {
                    this.m_platformClass.call("FGM_SetGameVersion", gameVersion);
                }
            }
        }
        FGM_GetFCMToken(_callBack = null) {
            if (!Laya.Render.isConchApp) {
                return;
            }
            let callBack = function (str) {
                GameSetting.FCM_Token = str;
                if (_callBack) {
                    _callBack.runWith(str);
                }
            };
            if (Laya.Browser.onIOS) {
                if (this.isOldThan("1.0.0")) {
                }
                else {
                    this.m_patform.callWithBack(callBack, "FGM_GetFCMToken");
                }
            }
            else if (Laya.Browser.onAndroid) {
                if (parseInt(GameSetting.App_Version) >= 1000) {
                    this.m_platformClass.callWithBack(callBack, "FGM_GetFCMToken");
                }
            }
        }
        FGM_GetLanguage() {
            let callBack = function (str) {
                console.log("initGame->-----------------------------当前系统的语言--- 获取FGM_GetLanguage:==" + str);
                if (str) {
                    str = str.substr(0, 2);
                    GameSetting.User_Lan = str;
                }
            };
            let cookieLang = Laya.LocalStorage.getItem(GameSetting.COOKIE_CF_LAN);
            if (!cookieLang || cookieLang == "") {
                if (GameSetting.m_bInstantGame == true || GameSetting.isPC) {
                    let str = "";
                    if (!str || str == "") {
                        str = this.language;
                        console.log("initGame->--------------instantgame--初始化语言时，instantgame没有初始化完成 lang = " + str);
                    }
                    str = str.substr(0, 2);
                    GameSetting.User_Lan = str;
                    console.log("initGame->--------------instantgame--当前系统的语言--- 获取FGM_GetLanguage:==" + str);
                    return;
                }
                if (!Laya.Render.isConchApp) {
                    callBack(this.language);
                }
                else {
                    if (Laya.Browser.onIOS) {
                        if (this.m_patform) {
                            this.m_patform.callWithBack(callBack, "FGM_GetLanguage");
                        }
                    }
                    else {
                        this.m_platformClass.callWithBack(callBack, "FGM_GetLanguage");
                    }
                }
            }
            else {
                callBack(cookieLang);
            }
        }
        get language() {
            let lang;
            let type = Laya.Browser.window.navigator.appName;
            if (type == "Netscape") {
                lang = Laya.Browser.window.navigator.language;
            }
            else {
                lang = Laya.Browser.window.navigator.userLanguage;
            }
            console.log("laya---------语言:" + lang + "	type:" + type);
            return lang;
        }
        FGM_SetLanguage(language) {
            if (language && language != "") {
                Laya.LocalStorage.setItem(GameSetting.COOKIE_CF_LAN, language);
                if (!Laya.Render.isConchApp) {
                    return;
                }
                if (Laya.Browser.onIOS) {
                    let jsonData = "";
                    let _obj = new Object();
                    _obj["language"] = language;
                    jsonData = JSON.stringify(_obj);
                    this.m_patform.call("FGM_SetLanguage:", jsonData);
                }
                else if (Laya.Browser.onAndroid) {
                    if (parseInt(GameSetting.App_Version) >= 1000) {
                        this.m_platformClass.call("FGM_SetLanguage", language);
                    }
                }
            }
        }
        FGM_GetIsRelease() {
            if (!Laya.Render.isConchApp) {
                return;
            }
            let callBack = function (_str) {
                if (_str) {
                    let o = JSON.parse(_str);
                    if (o && o.hasOwnProperty("isRelease")) {
                        let isRelease = parseInt(o.isRelease);
                        GameSetting.APP_IsRelease = isRelease == 1 ? true : false;
                        Debug.Initialize(Laya.stage, GameSetting.APP_IsRelease);
                    }
                }
            };
            if (Laya.Browser.onIOS) {
                if (this.isOldThan("1.0.0")) {
                }
                else {
                    this.m_patform.callWithBack(callBack, "FGM_GetIsRelease");
                }
            }
            else if (Laya.Browser.onAndroid) {
            }
        }
        FGM_ShareByUrl(url = "", _callBack = null) {
            let callBack = function (_str) {
                if (_str == null) {
                    if (_callBack) {
                        _callBack.runWith(true);
                    }
                    return;
                }
                let _obj = JSON.parse(_str);
                let isFail = false;
                if (Laya.Browser.onIOS) {
                    let errCode = _obj["errCode"];
                }
                else if (Laya.Browser.onAndroid) {
                    if (parseInt(GameSetting.App_Version) >= 1000) {
                        isFail = _obj["isSuc"] == false;
                    }
                    else {
                        isFail = false;
                    }
                }
                if (isFail) {
                    if (_callBack) {
                        _callBack.runWith(false);
                    }
                }
                else {
                    if (_callBack) {
                        _callBack.runWith(true);
                    }
                }
            };
            let _obj = new Object();
            _obj["url"] = url;
            let str = JSON.stringify(_obj);
            if (Laya.Render.isConchApp && Laya.Browser.onIOS) {
                if (AndroidPlatform.instance.isOldThan("1.0.0", "1.0.0")) {
                    let ErrorTips = GameLanguageMgr.instance.getConfigLan(5106);
                    ModuleManager.intance.openModule(ModuleName.ClientErrView, [ErrorTips, 1]);
                }
                else {
                    this.m_patform.callWithBack(callBack, "FGM_ShareByUrl:", str);
                }
            }
            else if (Laya.Browser.onAndroid) {
                if (parseInt(GameSetting.App_Version) >= 1000) {
                    this.m_platformClass.callWithBack(callBack, "FGM_ShareByUrl", str);
                }
                else {
                    let ErrorTips = GameLanguageMgr.instance.getConfigLan(5106);
                    ModuleManager.intance.openModule(ModuleName.ClientErrView, [ErrorTips, 1]);
                }
            }
            else {
                callBack(null);
            }
        }
        FGM_Share(_callBack, type = 1) {
            let callBack = function (str) {
                console.log("AndroidPlatform.FGM_Share.callBack(str): " + str);
                if (_callBack) {
                    _callBack.runWith(str);
                }
            };
            if (Laya.Browser.onIOS) {
                if (this.isOldThan("1.0.0")) {
                    let ErrorTips = GameLanguageMgr.instance.getConfigLan(5106);
                    ModuleManager.intance.openModule(ModuleName.ClientErrView, [ErrorTips, 1]);
                }
                else {
                    let _obj = new Object();
                    _obj["type"] = type;
                    let str = JSON.stringify(_obj);
                    this.m_patform.callWithBack(callBack, "FGM_Share:", str);
                }
            }
            else {
                callBack(null);
            }
        }
        FGM_RegisterCommCallBack(_callBack) {
            let callBack = function (str) {
                _callBack.runWith(str);
            };
            if (Laya.Browser.onIOS) {
                this.m_patform.callWithBack(callBack, "FGM_RegisterCommCallBack");
            }
            else if (Laya.Browser.onAndroid) {
                this.m_platformClass.callWithBack(callBack, "FGM_RegisterCommCallBack");
            }
        }
        FGM_OpenSupport(_callBack) {
            let callBack = function (str) {
                _callBack.runWith(str);
            };
            if (Laya.Browser.onIOS) {
                this.m_patform.callWithBack(callBack, "FGM_OpenSupport");
            }
            else if (Laya.Browser.onAndroid) {
                this.m_platformClass.callWithBack(callBack, "FGM_OpenSupport");
            }
        }
        FGM_NetTest(params) {
            if (Laya.Browser.onIOS) {
                this.m_patform.call("FGM_NetTest:", params);
            }
            else if (Laya.Browser.onAndroid) {
                this.m_platformClass.call("FGM_NetTest", params);
            }
        }
        FGM_Login(_callBack) {
            let callBack = function (str) {
                _callBack.runWith(str);
            };
            if (Laya.Browser.onIOS) {
                this.m_patform.callWithBack(callBack, "FGM_Login");
            }
            else if (Laya.Browser.onAndroid) {
                try {
                    this.m_platformClass.callWithBack(callBack, "FGM_Login");
                }
                catch (error) {
                    GameSetting.intance.reloadGame();
                }
                ;
            }
        }
        FGM_SwitchUser(params, _callBack) {
            let callBack = function (str) {
                _callBack.runWith(str);
            };
            if (Laya.Browser.onIOS) {
                this.m_patform.callWithBack(callBack, "FGM_SwitchUser:", params);
            }
            else if (Laya.Browser.onAndroid) {
                this.m_platformClass.callWithBack(callBack, "FGM_SwitchUser", params);
            }
        }
        FGM_SwitchLogin(params, _callBack) {
            let callBack = function (str) {
                _callBack.runWith(str);
            };
            this.m_patform.callWithBack(callBack, "FGM_SwitchLogin:", params);
        }
        FGM_Purchase(params, _callBack) {
            let callBack = function (str) {
                _callBack.runWith(str);
            };
            if (Laya.Browser.onIOS) {
                this.m_patform.callWithBack(callBack, "FGM_Purchase:", params);
            }
            else if (Laya.Browser.onAndroid) {
                this.m_platformClass.callWithBack(callBack, "FGM_Purchase", params);
            }
        }
        FGM_PurchaseByJson(params, _callBack) {
            let callBack = function (str) {
                _callBack.runWith(str);
            };
            if (Laya.Browser.onAndroid) {
                this.m_platformClass.callWithBack(callBack, "FGM_PurchaseByJson", params);
            }
        }
        FGM_OfflineGuestLogin(_callBack) {
            let callBack = function (str) {
                _callBack.runWith(str);
            };
            if (Laya.Browser.onIOS) {
                this.m_patform.callWithBack(callBack, "FGM_OfflineGuestLogin");
            }
            else if (Laya.Browser.onAndroid) {
                this.m_platformClass.callWithBack(callBack, "FGM_OfflineGuestLogin");
            }
        }
        FGM_BindingAccount(params, _callBack) {
            let callBack = function (str) {
                _callBack.runWith(str);
            };
            if (Laya.Browser.onIOS) {
                this.m_patform.callWithBack(callBack, "FGM_BindingAccount:", params);
            }
            else if (Laya.Browser.onAndroid) {
                this.m_platformClass.callWithBack(callBack, "FGM_BindingAccount", params);
            }
        }
        FGM_CustumEvent(jsonData) {
            if (Laya.Browser.onIOS) {
                this.m_patform.call("FGM_CustumEvent:", jsonData);
            }
            else if (Laya.Browser.onAndroid) {
                this.m_platformClass.call("FGM_CustumEvent", jsonData);
            }
        }
        FGM_Event_CompletedRegist(chennel = "") {
            if (!Laya.Render.isConchApp) {
                return;
            }
            if (Laya.Browser.onIOS) {
                let jsonData = "";
                this.m_patform.call("FGM_Event_CompletedRegist:", jsonData);
            }
            else if (Laya.Browser.onAndroid) {
                if (parseInt(GameSetting.App_Version) >= 1000) {
                    this.m_platformClass.call("FGM_Event_CompletedRegist");
                }
            }
        }
        FGM_Event_CompletedTutorial() {
            if (!Laya.Render.isConchApp) {
                return;
            }
            if (Laya.Browser.onIOS) {
                let jsonData = "";
                this.m_patform.call("FGM_Event_CompletedTutorial:", jsonData);
            }
            else if (Laya.Browser.onAndroid) {
                if (parseInt(GameSetting.App_Version) >= 1000) {
                    this.m_platformClass.call("FGM_Event_CompletedTutorial");
                }
            }
        }
        FGM_Event_LevelUp(level) {
            if (!Laya.Render.isConchApp) {
                return;
            }
            if (Laya.Browser.onIOS) {
                let jsonData = "";
                let _obj = new Object();
                _obj["level"] = level;
                jsonData = JSON.stringify(_obj);
                this.m_patform.call("FGM_Event_LevelUp:", jsonData);
            }
            else if (Laya.Browser.onAndroid) {
                if (parseInt(GameSetting.App_Version) >= 1000) {
                    this.m_platformClass.call("FGM_Event_LevelUp", level);
                }
            }
        }
        Ad_SetBannerAd(visible, x = 0, y = 0, _callBack = null) {
            if (!Laya.Render.isConchApp) {
                return;
            }
            else if (GameUserInfo.instance.isRecharged == "1" && visible) {
                return;
            }
            let callBack = function (str) {
                let resoult = parseInt(str);
                if (resoult == 0) {
                    str = GameLanguageMgr.instance.getConfigLan(1104028);
                    return;
                }
                if (_callBack) {
                    _callBack.runWith(str);
                }
            };
            let _obj = new Object();
            _obj["visible"] = visible;
            _obj["x"] = x;
            _obj["y"] = y;
            let adType;
            adType = "4,6";
            if (adType) {
                _obj["rankNums"] = adType;
            }
            let json = JSON.stringify(_obj);
            if (Laya.Browser.onIOS) {
                if (this.isOldThan("1.0.0")) {
                    let ErrorTips = GameLanguageMgr.instance.getConfigLan(5106);
                    ModuleManager.intance.openModule(ModuleName.ClientErrView, [ErrorTips, 1]);
                }
                else {
                    this.m_patform.callWithBack(callBack, "Ad_SetBannerAd:", json);
                }
            }
            else if (Laya.Browser.onAndroid) {
                if (parseInt(GameSetting.App_Version) >= 1000) {
                    this.m_platformClass.callWithBack(callBack, "Ad_SetBannerAd", json);
                }
                else {
                    let ErrorTips = GameLanguageMgr.instance.getConfigLan(5106);
                    ModuleManager.intance.openModule(ModuleName.ClientErrView, [ErrorTips, 1]);
                }
            }
        }
        Ad_SetInterstitialAd(funType = null, _callBack = null) {
            if (funType) {
                let spotInfo = new SpotInfo();
                spotInfo.type = "realiza";
                spotInfo.Event = funType;
                spotInfo.platform = 1;
                spotInfo.ad = 0;
                spotInfo.adType = "Interstitial";
                PlatFormManager.instance.sendCustumEvent(0, null, spotInfo);
            }
            let callBack = function (str) {
                Laya.SoundManager.setMusicVolume(1);
                let resoult = parseInt(str);
                if (resoult == 0) {
                    this.setOurAdAndRecharge(_callBack);
                    return;
                }
                let _resoult = Math.abs(resoult);
                if (_callBack) {
                    _callBack.runWith(_resoult);
                }
                PlatFormManager.instance.sendCustumEvent(43);
            };
            if (!Laya.Render.isConchApp) {
                NoticeMgr.instance.notice("======= 模拟看 插屏 广告 ========");
                callBack("1");
                return;
            }
            else if (GameUserInfo.instance.isRecharged == "1") {
                callBack("-1");
                return;
            }
            let adType = "4,1,2,3,6,5";
            if (Laya.Browser.onIOS) {
                if (this.isOldThan("1.0.0")) {
                    let ErrorTips = GameLanguageMgr.instance.getConfigLan(5106);
                    ModuleManager.intance.openModule(ModuleName.ClientErrView, [ErrorTips, 1]);
                }
                else {
                    Laya.SoundManager.setMusicVolume(0);
                    let _obj = new Object();
                    _obj["rankNums"] = adType;
                    let json = JSON.stringify(_obj);
                    this.m_patform.callWithBack(callBack, "Ad_SetInterstitialAd:", json);
                }
            }
            else if (Laya.Browser.onAndroid) {
                Laya.SoundManager.setMusicVolume(0);
                this.m_platformClass.callWithBack(callBack, "Ad_SetInterstitialAd", adType);
            }
        }
        setOurAdAndRecharge(_callBack) {
            this.Ad_SetOurAd(_callBack);
            this.noAdIndex++;
        }
        Ad_SetOurAd(_callBack) {
            if (!Laya.Render.isConchApp) {
                return;
            }
            let callBack = function (str) {
                let resoult = 1;
                if (_callBack) {
                    _callBack.runWith(str);
                }
            };
            if (Laya.Browser.onIOS) {
                this.m_patform.callWithBack(callBack, "Ad_SetOurAd");
            }
            else if (Laya.Browser.onAndroid) {
                this.m_platformClass.callWithBack(callBack, "Ad_SetOurAd");
            }
        }
        showRecharge(_callBack = null) {
            if (GameUserInfo.instance.isRecharged != "1") {
                Signal.intance.event(GameEvent.EVENT_OPEN_MODULE, [ModuleName.QuickRechargeDialog, _callBack]);
            }
        }
        loopInterstitial() {
            let before = this.adInterstitialTypes.slice(this.adInterstitialTypeIndex);
            let after = this.adInterstitialTypes.slice(0, this.adInterstitialTypeIndex);
            let all = before.concat(after);
            this.adInterstitialTypeIndex++;
            if (this.adInterstitialTypeIndex >= this.adInterstitialTypes.length) {
                this.adInterstitialTypeIndex = 0;
            }
            console.log("AndroidPlatform.loopInterstitial() all: " + all);
            return all.join(",") + ",5,3,2";
        }
        Ad_SetRewardedVideoAd(funType = null, _callBack = null) {
            if (funType) {
                let spotInfo = new SpotInfo();
                spotInfo.type = "realiza";
                spotInfo.Event = funType;
                spotInfo.platform = 1;
                spotInfo.ad = 0;
                spotInfo.adType = "Reward";
                PlatFormManager.instance.sendCustumEvent(0, null, spotInfo);
            }
            let callBack = function (str) {
                Laya.SoundManager.setMusicVolume(1);
                let resoult = parseInt(str);
                if (resoult == 0) {
                    this.setOurAdAndRecharge(_callBack);
                    return;
                }
                let _resoult = Math.abs(resoult);
                if (_callBack) {
                    _callBack.runWith(_resoult);
                }
                if (resoult == 1) {
                    PlatFormManager.instance.sendCustumEvent(43);
                    if (funType) {
                        let spotInfo = new SpotInfo();
                        spotInfo.Event = funType + "_Success";
                        spotInfo.platform = 1;
                        spotInfo.ad = 0;
                        PlatFormManager.instance.sendCustumEvent(0, null, spotInfo);
                    }
                }
            };
            if (!Laya.Render.isConchApp) {
                NoticeMgr.instance.notice("======= 模拟看 视频 广告 ========");
                callBack("1");
                return;
            }
            else if (GameUserInfo.instance.isRecharged == "1") {
                callBack("-1");
                return;
            }
            let adType = "4,1,2,3,6,5";
            if (Laya.Browser.onIOS) {
                if (this.isOldThan("1.0.0")) {
                    let ErrorTips = GameLanguageMgr.instance.getConfigLan(5106);
                    ModuleManager.intance.openModule(ModuleName.ClientErrView, [ErrorTips, 1]);
                }
                else {
                    let _obj = new Object();
                    _obj["rankNums"] = adType;
                    let json = JSON.stringify(_obj);
                    Laya.SoundManager.setMusicVolume(0);
                    this.m_patform.callWithBack(callBack, "Ad_SetRewardedVideoAd:", json);
                }
            }
            else if (Laya.Browser.onAndroid) {
                Laya.SoundManager.setMusicVolume(0);
                this.m_platformClass.callWithBack(callBack, "Ad_SetRewardedVideoAd", adType);
            }
        }
        loopReward() {
            let before = this.adRewardTypes.slice(this.adRewardTypeIndex);
            let after = this.adRewardTypes.slice(0, this.adRewardTypeIndex);
            let all = before.concat(after);
            this.adRewardTypeIndex++;
            if (this.adRewardTypeIndex >= this.adRewardTypes.length) {
                this.adRewardTypeIndex = 0;
            }
            console.log("AndroidPlatform.loopReward() all: " + all.join(",") + ",5,3,2");
            return all.join(",") + ",5,3,2";
        }
        Ad_SetNativeExpressAd(visible, x = 0, y = 0, _callBack = null) {
            if (!Laya.Render.isConchApp) {
                return;
            }
            let callBack = function (str) {
                let resoult = parseInt(str);
                if (resoult == 0) {
                    str = GameLanguageMgr.instance.getConfigLan(1104028);
                    NoticeMgr.instance.notice(str);
                    return;
                }
                if (_callBack) {
                    _callBack.runWith(str);
                }
            };
            let _obj = new Object();
            _obj["visible"] = visible;
            _obj["x"] = x;
            _obj["y"] = y;
            let str = JSON.stringify(_obj);
            if (Laya.Browser.onIOS) {
                if (this.isOldThan("1.0.0")) {
                    let ErrorTips = GameLanguageMgr.instance.getConfigLan(5106);
                    ModuleManager.intance.openModule(ModuleName.ClientErrView, [ErrorTips, 1]);
                }
                else {
                    this.m_patform.callWithBack(callBack, "Ad_SetNativeExpressAd:", str);
                }
            }
            else if (Laya.Browser.onAndroid) {
                if (parseInt(GameSetting.App_Version) >= 1000) {
                    this.m_platformClass.callWithBack(callBack, "Ad_SetNativeExpressAd", str);
                }
                else {
                    let ErrorTips = GameLanguageMgr.instance.getConfigLan(5106);
                    ModuleManager.intance.openModule(ModuleName.ClientErrView, [ErrorTips, 1]);
                }
            }
        }
        FGM_GetSingleServer(_callBack = null) {
            if (!Laya.Render.isConchApp) {
                return;
            }
            let callBack = function (_str) {
                let _obj = JSON.parse(_str);
                let isFail = false;
                let errCode;
                if (Laya.Browser.onIOS) {
                    isFail = _obj.hasOwnProperty("errCode");
                    if (isFail) {
                        errCode = _obj.errCode;
                    }
                }
                else if (Laya.Browser.onAndroid) {
                    isFail = _obj["isSuc"] == false;
                }
                if (isFail) {
                    if (_callBack) {
                        _callBack.run();
                    }
                }
                else {
                    let state = _obj["state"];
                    let data = _obj["data"][0];
                    let server_status = data.server_status;
                    let server_current = data.server_current;
                    let stop_announcement = data.stop_announcement;
                    let ip_white = data.ip_white;
                    if (state == "1" && server_status == "6") {
                        let ipCallBack = function (in_white) {
                            if (stop_announcement && !in_white) {
                                let _stop_announcement = JSON.parse(stop_announcement);
                                let userLan = GameSetting.User_Lan;
                                if (!_stop_announcement.hasOwnProperty(userLan)) {
                                    userLan = "en";
                                }
                                let msgDetail = _stop_announcement[userLan];
                                let _msgDetail = JSON.parse(msgDetail);
                                let openTime = _msgDetail["openTime"];
                                let msg = _msgDetail["msg"];
                                if (openTime) {
                                    let d = new Date(openTime);
                                    let openSecond = d.getTime() / 1000;
                                    let remainingTime = openSecond - parseFloat(server_current);
                                    remainingTime = parseInt(remainingTime / 60 + "");
                                    if (remainingTime < 0) {
                                        remainingTime = 30;
                                    }
                                    if (msg) {
                                        msg = GameLanguageMgr.instance.replacePlaceholder(msg, [remainingTime]);
                                        ModuleManager.intance.openModule(ModuleName.ClientErrView, [msg, 2]);
                                        this.isMaintainace = true;
                                        return;
                                    }
                                }
                            }
                            if (_callBack) {
                                _callBack.run();
                            }
                        };
                        this.FGM_CheckIP(ip_white, Laya.Handler.create(this, ipCallBack));
                    }
                    else {
                        if (_callBack) {
                            _callBack.run();
                        }
                    }
                }
            };
            if (Laya.Browser.onIOS) {
                if (this.isOldThan("1.0.0")) {
                    if (_callBack) {
                        _callBack.run();
                    }
                }
                else {
                    this.m_patform.callWithBack(callBack, "FGM_GetSingleServer");
                }
            }
            else if (Laya.Browser.onAndroid) {
                if (parseInt(GameSetting.App_Version) >= 1000) {
                    this.m_platformClass.callWithBack(callBack, "FGM_GetSingleServer");
                }
                else {
                    if (_callBack) {
                        _callBack.run();
                    }
                }
            }
        }
        FGM_CheckIP(ip_white, _callBack = null) {
            if (!Laya.Render.isConchApp) {
                return;
            }
            let getWhiteIpCallBack = function (ip_white_gameInfo) {
                let callBack = function (str) {
                    console.log("FGM_GetCurrentIP call back result: " + str);
                    let in_white = false;
                    let _obj = JSON.parse(str);
                    if (_obj.hasOwnProperty("currentIP")) {
                        let currentIP = _obj.currentIP;
                        if (currentIP && currentIP.indexOf(".") != -1) {
                            if (ip_white_gameInfo && ip_white_gameInfo != "") {
                                let ips = ip_white_gameInfo.split(",");
                                for (let ip of ips) {
                                    if (ip == currentIP) {
                                        in_white = true;
                                        break;
                                        ;
                                    }
                                }
                            }
                            if ((!in_white && ip_white) && ip_white != "") {
                                let ips = ip_white.split(",");
                                for (let ip of ips) {
                                    if (ip == currentIP) {
                                        in_white = true;
                                        break;
                                        ;
                                    }
                                }
                            }
                        }
                    }
                    if (_callBack) {
                        _callBack.runWith(in_white);
                    }
                };
                if (Laya.Browser.onIOS) {
                    this.m_patform.callWithBack(callBack, "FGM_GetCurrentIP");
                }
                else if (Laya.Browser.onAndroid) {
                    this.m_platformClass.callWithBack(callBack, "FGM_GetCurrentIP");
                }
            };
            if (Laya.Browser.onIOS) {
                if (this.isOldThan("1.0.0")) {
                    getWhiteIpCallBack("");
                }
                else {
                    this.FGM_GetGameInfo(Laya.Handler.create(this, getWhiteIpCallBack));
                }
            }
            else if (Laya.Browser.onAndroid) {
                if (parseInt(GameSetting.App_Version) >= 1000) {
                    this.FGM_GetGameInfo(Laya.Handler.create(this, getWhiteIpCallBack));
                }
                else {
                    getWhiteIpCallBack("");
                }
            }
        }
        FGM_GetGameInfo(_callBack = null) {
            let _ip_white = "";
            if (!Laya.Render.isConchApp) {
                return;
            }
            let callBack = function (_str) {
                let _obj = JSON.parse(_str);
                let isFail = false;
                let errCode;
                if (Laya.Browser.onIOS) {
                    isFail = _obj.hasOwnProperty("errCode");
                    if (isFail) {
                        errCode = _obj.errCode;
                    }
                }
                else if (Laya.Browser.onAndroid) {
                    isFail = _obj["isSuc"] == false;
                }
                if (isFail) {
                }
                else {
                    if (Laya.Browser.onIOS || Laya.Browser.onAndroid) {
                        let state = _obj["state"];
                        let data = _obj["data"][0];
                        let ip_white = data.ip_white;
                        if (state == "1") {
                            _ip_white = ip_white;
                        }
                    }
                    else if (Laya.Browser.onAndroid) {
                    }
                }
                if (_callBack) {
                    _callBack.runWith(_ip_white);
                }
            };
            if (Laya.Browser.onIOS) {
                this.m_patform.callWithBack(callBack, "FGM_GetGameInfo");
            }
            else if (Laya.Browser.onAndroid) {
                if (parseInt(GameSetting.App_Version) >= 1000) {
                    this.m_platformClass.callWithBack(callBack, "FGM_GetGameInfo");
                }
                else {
                    if (_callBack) {
                        _callBack.runWith(_ip_white);
                    }
                }
            }
        }
        FGM_OpenAppScore(_callBack = null) {
            if (!Laya.Render.isConchApp) {
                return;
            }
            let callBack = function (str) {
                if (_callBack) {
                    _callBack.runWith(str);
                }
            };
            if (Laya.Browser.onIOS) {
                let shareUrl = "itms-apps://itunes.apple.com/WebObjects/MZStore.woa/wa/viewContentsUserReviews?id=1471613073&pageNumber=0&sortOrdering=2&type=Purple+Software&mt=8";
                if (this.isOldThan("1.0.0", "1.0.0")) {
                    this.m_patform.callWithBack(callBack, "FGM_OpenURL:", shareUrl);
                }
                else {
                    this.m_patform.callWithBack(callBack, "FGM_OpenAppScore:", shareUrl);
                }
            }
            else if (Laya.Browser.onAndroid) {
                this.m_platformClass.callWithBack(callBack, "FGM_OpenAppScore");
            }
        }
        FGM_Notification() {
            if (!Laya.Render.isConchApp) {
                return;
            }
            if (Laya.Browser.onIOS) {
                this.m_patform.call("FGM_Notification");
            }
            else if (Laya.Browser.onAndroid) {
                this.m_platformClass.call("FGM_Notification");
            }
        }
        FGM_OpenComment(_callBack = null) {
            if (!Laya.Render.isConchApp) {
                return;
            }
            let callBack = function (str) {
                if (_callBack) {
                    _callBack.runWith(str);
                }
            };
            if (Laya.Browser.onIOS) {
                if (this.isOldThan("1.0.0")) {
                    PlatFormManager.instance.openSupport(Laya.Handler.create(this, callBack));
                }
                else {
                    this.m_patform.callWithBack(callBack, "FGM_OpenComment");
                }
            }
            else if (Laya.Browser.onAndroid) {
                if (parseInt(GameSetting.App_Version) >= 1000) {
                    this.m_platformClass.callWithBack(callBack, "FGM_OpenComment");
                }
                else {
                    let ErrorTips = GameLanguageMgr.instance.getConfigLan(5106);
                    ModuleManager.intance.openModule(ModuleName.ClientErrView, [ErrorTips, 1]);
                }
            }
        }
        drawScreen() {
            if (Laya.Browser.window['conch']) {
                Laya.Browser.window['conch'].captureScreen(function (arrayBuff, width, height) {
                    let url = Laya.Browser.window['conch'].getCachePath() + "/test.png";
                    Laya.Browser.window['conch'].saveAsPng(arrayBuff, width, height, url);
                    let image = Laya.Browser.window.document.createElement("img");
                    image.onload = function () {
                        let imgaes = new Laya.Image("file:///" + Laya.Browser.window['conch'].getCachePath() + "/test.png");
                        imgaes.width = (imgaes.height = 400);
                        Laya.stage.addChild(imgaes);
                    };
                    image.src = "file:///" + Laya.Browser.window['conch'].getCachePath() + "/test.png";
                });
            }
        }
        testDrawScreen() {
            let sp = new Laya.Sprite();
            let htmlC = sp.drawToCanvas(500, 500, 0, 0);
            let canvas;
            let base64Data = canvas.toDataURL();
            let _texture;
            console.log("-----------------------base64Data===================");
            console.log(base64Data);
            console.log("-----------------------base64Data===================");
        }
        FGM_OpenLike(url = "https://www.instagram.com/clothesforeverapp/", _callBack = null) {
            if (GameSetting.isPC && GameSetting.IsRelease) {
                if (url.indexOf("instagram") != -1) {
                    Laya.Browser.window.open(url);
                }
                if (url.indexOf("facebook") != -1) {
                    if (GameSetting.PLATFORM == GameSetting.P_WEB_FB) {
                        let frameWidth = 390;
                        let frameHeight = 308;
                        let frameLeft = Laya.Browser.clientWidth - frameWidth >> 1;
                        let frameTop = Laya.Browser.clientHeight - frameHeight >> 1;
                        let likeURL = GameSetting.URL_FB_Thumbup + '?game_id=' + GameSetting.Plantform_APPID;
                    }
                    else {
                    }
                }
                return;
            }
            if (!Laya.Render.isConchApp) {
                return;
            }
            if (url.indexOf("clothesforever") != -1 && url.indexOf("uid") == -1) {
                if (url.indexOf("?") == -1) {
                    url = url + "?" + this.getUrlData();
                }
                else {
                    url = url + "&" + this.getUrlData();
                }
            }
            let callBack = function (str) {
                if (_callBack) {
                    _callBack.runWith(str);
                }
            };
            if (Laya.Browser.onIOS) {
                this.m_patform.callWithBack(callBack, "FGM_OpenURL:", url);
            }
            else if (Laya.Browser.onAndroid) {
                this.m_platformClass.callWithBack(callBack, "FGM_OpenURL2", url);
            }
        }
        FGM_Copy(content, _callBack = null) {
            if (!Laya.Render.isConchApp) {
                let _title = GameLanguageMgr.instance.getConfigLan(5339);
                let _content = content;
                let _yestext = GameLanguageMgr.instance.getConfigLan(5405);
                let _notext = GameLanguageMgr.instance.getConfigLan(9009);
                let onComple = function () {
                    if (_callBack) {
                        _callBack.runWith(true);
                    }
                };
                try {
                }
                catch (error) {
                    if (_callBack) {
                        _callBack.runWith(false);
                    }
                }
                ;
                return;
            }
            console.log(" 调用拷贝方法: " + content);
            let callBack = function (str) {
                if (_callBack) {
                    _callBack.runWith(true);
                }
            };
            if (Laya.Browser.onIOS) {
                if (this.isOldThan("1.0.0", "1.0.0")) {
                    let ErrorTips = GameLanguageMgr.instance.getConfigLan(5106);
                    ModuleManager.intance.openModule(ModuleName.ClientErrView, [ErrorTips, 1]);
                }
                else {
                    this.m_patform.callWithBack(callBack, "FGM_Copy:", content);
                }
            }
            else if (Laya.Browser.onAndroid) {
            }
        }
        FGM_SendMsg(content, _callBack = null) {
            if (!Laya.Render.isConchApp) {
                if (_callBack) {
                    _callBack.runWith(false);
                }
                return;
            }
            console.log(" 调用SendMsg方法: " + content);
            let callBack = function (str) {
                if (_callBack) {
                    _callBack.runWith(true);
                }
            };
            if (Laya.Browser.onIOS) {
                if (this.isOldThan("1.0.0", "1.0.0")) {
                    let ErrorTips = GameLanguageMgr.instance.getConfigLan(5106);
                    ModuleManager.intance.openModule(ModuleName.ClientErrView, [ErrorTips, 1]);
                }
                else {
                    this.m_patform.callWithBack(callBack, "FGM_SendMsg:", content);
                }
            }
            else if (Laya.Browser.onAndroid) {
            }
        }
        FGM_OpenURL(url = "https://www.instagram.com/clothesforeverapp/", _callBack = null) {
            if (GameSetting.m_bInstantGame == true || GameSetting.isPC) {
                let str = GameLanguageMgr.instance.getConfigLan(500005);
                AlertManager.instance().AlertByType(AlertType.DOWNLOADALERT, str, AlertType.YES);
                return;
            }
            if (!Laya.Render.isConchApp) {
                return;
            }
            if (url.indexOf("clothesforever") != -1 && url.indexOf("uid") == -1) {
                if (url.indexOf("?") == -1) {
                    url = url + "?" + this.getUrlData();
                }
                else {
                    url = url + "&" + this.getUrlData();
                }
            }
            console.log("FGM_OpenURL 调用打开连接方法: " + url);
            let callBack = function (str) {
                if (_callBack) {
                    _callBack.runWith(str);
                }
            };
            if (Laya.Browser.onIOS) {
                if (this.isOldThan("1.0.0")) {
                    this.m_patform.callWithBack(callBack, "FGM_OpenURL:", url);
                    console.log("打开连接++++老版本" + url);
                }
                else {
                    this.m_patform.callWithBack(callBack, "FGM_BuyReal:", url);
                    console.log("打开连接++++新版本用游戏内部的浏览器" + url);
                }
            }
            else if (Laya.Browser.onAndroid) {
                this.m_platformClass.callWithBack(callBack, "FGM_OpenURL2", url);
            }
        }
        getUrlData(itemId = 0) {
            let dataStr = "uid=" + GameSetting.Login_UID + "&game_id=" + GameSetting.Plantform_APPID + "&token=" + GameSetting.Login_Token + "&platform=" + GameSetting.LoginType + "&id=" + itemId;
            return dataStr;
        }
        FGM_OpenDSURL() {
            let dataStr = "&lang=" + GameSetting.User_Lan + "&uid=" + GameSetting.Login_UID + "&game_id=" + GameSetting.Plantform_APPID + "&token=" + GameSetting.Login_Token + "&platform=" + GameSetting.LoginType;
            let frontStr = GameSetting.isMobile ? GlobalDataManager.instance.DSURL_APP : GlobalDataManager.instance.DSURL_WEB;
            let url = frontStr + dataStr;
            console.log("FGM_OpenDSURL 调用打开连接方法: " + url);
            if (!Laya.Render.isConchApp) {
                return;
            }
            this.FGM_OpenURL(url);
        }
        FGM_BuyReal(itemId) {
            if (GameSetting.m_bInstantGame == true || GameSetting.isPC) {
                let str = GameLanguageMgr.instance.getConfigLan(500005);
                AlertManager.instance().AlertByType(AlertType.DOWNLOADALERT, str, AlertType.YES);
                return;
            }
            console.log("************FGM_BuyReal--------FGM_BuyReal------------*************");
            this.FGM_OpenDSURL();
            return;
            let dataStr = this.getUrlData(itemId);
            let url = "https://m.clothesforever.com/buy?" + dataStr;
            console.log("FGM_BuyReal 调用打开连接方法: " + url);
            if (!Laya.Render.isConchApp) {
                return;
            }
            let callBack = function (str) {
                console.log("FGM_BuyReal 关闭连接回调成功");
            };
            this.FGM_OpenURL(url);
        }
        isOldThan(normalVersion, turkeyVersion = null) {
            if (turkeyVersion == null) {
                turkeyVersion = normalVersion;
            }
            let appVersionNum = this.getVersionNum(GameSetting.App_Version);
            let compareVersionNum;
            if (GameSetting.M_strCountry != "2") {
                compareVersionNum = this.getVersionNum(normalVersion);
            }
            else {
                compareVersionNum = this.getVersionNum(turkeyVersion);
            }
            return appVersionNum <= compareVersionNum;
        }
        getVersionNum(version) {
            let versionNum;
            if (version) {
                if (version instanceof String) {
                    let versions = version.split(".");
                    let versionStr = "";
                    for (let i = 0; i < versions.length; i++) {
                        let vNum = versions[i];
                        if (i == 0) {
                            versionStr += vNum;
                        }
                        else {
                            if (vNum.length == 1) {
                                versionStr += "0" + vNum;
                            }
                            else {
                                versionStr += vNum;
                            }
                        }
                    }
                    versionNum = parseInt(versionStr);
                }
                else {
                    versionNum = version;
                }
            }
            return versionNum;
        }
        reload() {
            AndroidPlatform.instance.Ad_SetBannerAd(false);
            if (!Laya.Render.isConchApp) {
                Laya.Browser.window.location.reload();
                return;
            }
            if (Laya.Browser.onIOS) {
                this.m_patform.call("FGM_Reload");
            }
            else {
                let loadingView = Laya.Browser.window.loadingView;
                if (loadingView) {
                    loadingView.showLoadingView();
                    loadingView.loading(0);
                }
                this.m_platformClass.call("FGM_Reload");
            }
            Laya.Browser.window.location.reload();
        }
        openAppStoreByURL(url) {
            if (GameSetting.m_bInstantGame == true || GameSetting.isPC) {
                let str = GameLanguageMgr.instance.getConfigLan(500005);
                AlertManager.instance().AlertByType(AlertType.DOWNLOADALERT, str, AlertType.YES);
                return;
            }
            if (!Laya.Render.isConchApp) {
                return;
            }
            if (Laya.Browser.onIOS) {
                this.m_patform.call("openAppStoreByURL:", url);
            }
            else if (Laya.Browser.onAndroid) {
                this.m_platformClass.call("openAppStoreByURL", url);
            }
        }
        FGM_RestoreCompletedTransactions() {
            console.log("call FGM_RestoreCompletedTransactions+++++++++++++");
            if (!Laya.Render.isConchApp) {
                return;
            }
            let callBack = function (result) {
                console.log("callback FGM_RestoreCompletedTransactions");
                if (result == "1") {
                    GameUserInfo.instance.isRecharged = "1";
                }
                GameUserInfo.instance.isCallBackOrder = true;
                Signal.intance.event(GameEvent.EVENT_RECHARGED);
            };
            if (Laya.Browser.onIOS) {
                this.m_patform.callWithBack(callBack, "FGM_RestoreCompletedTransactions");
            }
            else if (Laya.Browser.onAndroid) {
                this.m_platformClass.callWithBack(callBack, "FGM_RestoreCompletedTransactions");
            }
        }
        FGM_OrderForm() {
            console.log("call FGM_OrderForm+++++++++++++");
            if (GameSetting.m_bInstantGame == true || GameSetting.isPC) {
                let str = GameLanguageMgr.instance.getConfigLan(500005);
                AlertManager.instance().AlertByType(AlertType.DOWNLOADALERT, str, AlertType.YES);
                return;
            }
            if (!Laya.Render.isConchApp) {
                return;
            }
            let callBack = function (result) {
                console.log("callback FGM_OrderForm");
                GameUserInfo.instance.isCallBackOrder = true;
                if (result == "1") {
                    GameUserInfo.instance.isRecharged = "1";
                    Signal.intance.event(GameEvent.EVENT_RECHARGED_TIP);
                }
                Signal.intance.event(GameEvent.EVENT_RECHARGED);
            };
            if (Laya.Browser.onIOS) {
                this.m_patform.callWithBack(callBack, "FGM_OrderForm");
            }
            else if (Laya.Browser.onAndroid) {
                this.m_platformClass.callWithBack(callBack, "FGM_OrderForm");
            }
        }
        showWindowVideo(show, x = 0, y = 0, fixHeight = 1, scale = 1) {
            if (!Laya.Render.isConchApp) {
                return;
            }
            let callBack = function (result) {
            };
            let _obj = new Object();
            _obj["visible"] = show;
            _obj["x"] = x;
            _obj["y"] = y;
            _obj["fixHeight"] = fixHeight;
            _obj["scale"] = scale;
            let json = JSON.stringify(_obj);
            if (Laya.Browser.onIOS) {
                this.m_patform.callWithBack(callBack, "Ad_SetWindowAd:", json);
            }
            else if (Laya.Browser.onAndroid) {
                this.m_platformClass.callWithBack(callBack, "Ad_SetWindowAd", json);
            }
        }
    }
    AndroidPlatform.M_FACKEBOOK_URL = "https://www.facebook.com/ClothesForeverGame/";
    AndroidPlatform.M_INSTAGRAM_URL = "https://www.instagram.com/clothesforeverapp/";

    class ComUtil {
        static get IsSetRelease() {
            return ComUtil._IsSetRelease;
        }
        static get IsSetGuid() {
            return ComUtil._IsSetGuid;
        }
        static get IsSetOpen() {
            return ComUtil._IsSetOpen;
        }
        static initParms() {
            if (Laya.Browser.window['location']) {
                let m_arr = Laya.Browser.window.location.search.substr(1).split("&");
                ComUtil.m_obj = {};
                for (let i = 0; i < m_arr.length; i++) {
                    let arr = m_arr[i].split("=");
                    ComUtil.m_obj[arr[0]] = arr[1];
                }
                console.log("1initgame-->urldata:", ComUtil.m_obj);
                let webData = ComUtil.m_obj["data"];
                console.log("2initgame-->urldata m_obj[data]:", webData);
                let strBase64;
                if (webData) {
                    console.log("2initgame-->urldata base64DeCode(webData):", strBase64);
                    m_arr = strBase64.split("&");
                    console.log("3initgame-->urldata base64DeCode(webData):", m_arr);
                    ComUtil.m_obj = {};
                    for (let i = 0; i < m_arr.length; i++) {
                        let strValue = m_arr[i];
                        let indexF = strValue.indexOf("=");
                        let keys = strValue.substring(0, indexF);
                        let value = strValue.substring(indexF + 1, strValue.length);
                        ComUtil.m_obj[keys] = value;
                    }
                    GameUserInfo.GAME_TOKEN = ComUtil.m_obj["tokens"];
                    GameSetting.Login_UDID = ComUtil.m_obj["uid"];
                    GameSetting.Server_id = ComUtil.m_obj["server_id"];
                    GameSetting.Server_URL = ComUtil.m_obj["web_server_url"];
                    GameSetting.Plantform_APPID = ComUtil.m_obj["game_id"];
                    GameSetting.PLATFORM = ComUtil.m_obj["platform"];
                    GameSetting.m_bIsMobWeb = parseInt(ComUtil.m_obj["is_mobile"]) == 1;
                    let langID;
                    if (ComUtil.m_obj["language"]) {
                        langID = ComUtil.m_obj["language"] + "";
                    }
                    else {
                        langID = "1";
                    }
                    GameSetting.User_Lan = ComUtil.langObj[langID][0];
                    GameSetting.URL_Web_ProductList = ComUtil.m_obj["web_product_url"];
                    GameSetting.URL_FB_Thumbup = ComUtil.m_obj["fb_thumbs_up_url"];
                    GameSetting.IP_User = ComUtil.m_obj["userip"];
                    GameSetting.IsRelease = true;
                    console.log("4initgame-->urldata:", ComUtil.m_obj);
                    return;
                }
                let appData = ComUtil.m_obj["appdata"];
                if (appData) {
                    ComUtil.m_obj = {};
                    m_arr = strBase64.split("&");
                    for (let i = 0; i < m_arr.length; i++) {
                        let strValue = m_arr[i];
                        let indexF = strValue.indexOf("=");
                        let keys = strValue.substring(0, indexF);
                        let value = strValue.substring(indexF + 1, strValue.length);
                        ComUtil.m_obj[keys] = value;
                        console.log("2initgame-->keys:" + keys + " value:" + value);
                    }
                    GameSetting.M_strCountry = ComUtil.m_obj["country"];
                    GameSetting.M_strTarget = ComUtil.m_obj["target"];
                    GameSetting.M_strTarget = GameSetting.M_strTarget.replace(/(^\s*)|(\s*$)/g, "");
                    console.log("initgame-->M_strTarget:" + GameSetting.M_strTarget);
                    console.log("initgame-->M_strTarget:" + "local");
                    console.log("initgame-->M_strTarget:" + (GameSetting.M_strTarget == "local"));
                    GameSetting.M_bAppData = true;
                }
                if (ComUtil.m_obj["country"] && ComUtil.m_obj["country"] != "") {
                    GameSetting.M_strCountry = ComUtil.m_obj["country"];
                }
                if (ComUtil.m_obj["tk"] && ComUtil.m_obj["tk"] != "") {
                    GameUserInfo.GAME_TOKEN = ComUtil.m_obj["tk"];
                }
                if (ComUtil.m_obj["guid"] && ComUtil.m_obj["guid"] != "") {
                    if (ComUtil.m_obj["guid"] == "true" || ComUtil.m_obj["guid"] == "1") {
                        GameSetting.UseGuide = true;
                        if (ComUtil.m_obj["ignoreGuides"] && ComUtil.m_obj["ignoreGuides"] != "") {
                            let ignoreGuides = ComUtil.m_obj["ignoreGuides"];
                            GameSetting.ignoreGuides = ignoreGuides.split(",");
                        }
                        if (ComUtil.m_obj["removeGuides"] && ComUtil.m_obj["removeGuides"] != "") {
                            let removeGuides = ComUtil.m_obj["removeGuides"];
                            GameSetting.removeGuides = removeGuides.split(",");
                        }
                        if (ComUtil.m_obj["maxMapId"] && ComUtil.m_obj["maxMapId"] != "") {
                            let maxMapId = ComUtil.m_obj["maxMapId"];
                        }
                    }
                    else {
                        GameSetting.UseGuide = false;
                    }
                    ComUtil._IsSetGuid = true;
                }
                if (ComUtil.m_obj["showTravelHit"] && ComUtil.m_obj["showTravelHit"] != "") {
                    if (ComUtil.m_obj["showTravelHit"] == "true" || ComUtil.m_obj["showTravelHit"] == "1") {
                        GameSetting.m_showTravelHit = true;
                    }
                    else {
                        GameSetting.m_showTravelHit = false;
                    }
                }
                if (ComUtil.m_obj["showTimeStageHit"] && ComUtil.m_obj["showTimeStageHit"] != "") {
                    if (ComUtil.m_obj["showTimeStageHit"] == "true" || ComUtil.m_obj["showTimeStageHit"] == "1") {
                        GameSetting.m_showTimeStageHit = true;
                    }
                    else {
                        GameSetting.m_showTimeStageHit = false;
                    }
                }
                if (ComUtil.m_obj["open"] && ComUtil.m_obj["open"] != "") {
                    if (ComUtil.m_obj["open"] == "true" || ComUtil.m_obj['open'] == "1") {
                        GameSetting.buildClickState = true;
                    }
                    else {
                        GameSetting.buildClickState = false;
                    }
                    ComUtil._IsSetOpen = true;
                }
                if (ComUtil.m_obj["plat"] && ComUtil.m_obj["plat"] != "") {
                    GameSetting.PLATFORM = ComUtil.m_obj["plat"];
                }
                if (ComUtil.m_obj["version"] && ComUtil.m_obj["version"] != "") {
                    if (ComUtil.m_obj["version"] == "true" || ComUtil.m_obj["version"] == "1") {
                        GameSetting.useWebVersion = true;
                    }
                    else {
                        GameSetting.useWebVersion = false;
                    }
                }
                if (ComUtil.m_obj["release"] && ComUtil.m_obj["release"] != "") {
                    if (ComUtil.m_obj["release"] == "true" || ComUtil.m_obj["release"] + "" == "1") {
                        GameSetting.IsRelease = true;
                    }
                    else {
                        GameSetting.IsRelease = false;
                    }
                    ComUtil._IsSetRelease = true;
                }
                if (ComUtil.m_obj["lockMap"] && ComUtil.m_obj["lockMap"] != "") {
                    if (ComUtil.m_obj["lockMap"] == "true" || ComUtil.m_obj["lockMap"] == "1") {
                        GameSetting.unLockAllMap = true;
                    }
                    else {
                        GameSetting.unLockAllMap = false;
                    }
                }
                if (ComUtil.m_obj["lockFun"] && ComUtil.m_obj["lockFun"] != "") {
                    if (ComUtil.m_obj["lockFun"] == "true" || ComUtil.m_obj["lockFun"] == "1") {
                        GameSetting.unLockAllFun = true;
                    }
                    else {
                        GameSetting.unLockAllFun = false;
                    }
                }
                if (ComUtil.m_obj["floor"] && ComUtil.m_obj["floor"] != "") {
                    GameSetting.floor = parseInt(ComUtil.m_obj["floor"]);
                }
                if (ComUtil.m_obj["lang"] && ComUtil.m_obj["lang"] != "") {
                    let langIndex = parseInt(ComUtil.m_obj["lang"]);
                    if (langIndex < 1) {
                        langIndex = 1;
                    }
                    GameSetting.ignoreLang = true;
                    GlobalDataManager.instance.m_strLanguage = langIndex;
                }
                if (ComUtil.m_obj["app"] && ComUtil.m_obj["app"] != "") {
                    if (ComUtil.m_obj["app"] == "true" || ComUtil.m_obj["app"] == "1") {
                        GameSetting.PLATFORM = GameSetting.P_APP;
                    }
                    else {
                        GameSetting.PLATFORM = GameSetting.P_WEB_GW;
                    }
                }
                if (ComUtil.m_obj["proofPicId"] && ComUtil.m_obj["proofPicId"] != "") {
                    GameSetting.proofPicId = ComUtil.m_obj["proofPicId"];
                }
                if (ComUtil.m_obj["drawCardNum"] && ComUtil.m_obj["drawCardNum"] != "") {
                    GameSetting.drawCardNum = ComUtil.m_obj["drawCardNum"];
                }
                if (ComUtil.m_obj["send"] && ComUtil.m_obj["send"] != "") {
                    GameSetting.GM_DATA = ComUtil.m_obj["send"];
                }
                if (ComUtil.m_obj["monopolyEditor"] && ComUtil.m_obj["monopolyEditor"] != "") {
                }
                if (ComUtil.m_obj["isFarm"] && ComUtil.m_obj["isFarm"] != "") {
                    if (ComUtil.m_obj["isFarm"] == "true" || ComUtil.m_obj["isFarm"] == "1") {
                        GameSetting.isFarm = true;
                    }
                    else {
                        GameSetting.isFarm = false;
                    }
                }
                if (ComUtil.m_obj["isEditorMpy"] && ComUtil.m_obj["isEditorMpy"] != "") {
                    if (ComUtil.m_obj["isEditorMpy"] == "true" || ComUtil.m_obj["isEditorMpy"] == "1") {
                        GameSetting.isEditorMpy = true;
                    }
                    else {
                        GameSetting.isEditorMpy = false;
                    }
                }
            }
        }
        static cheakStr(nameStr) {
            let checkStr = new RegExp("[A-Za-z0-9_-\\s]", "g");
            let ary = nameStr.match(checkStr);
            if (ary && ary.length == nameStr.length) {
                return true;
            }
            return false;
        }
    }
    ComUtil._IsSetRelease = false;
    ComUtil._IsSetGuid = false;
    ComUtil._IsSetOpen = false;
    ComUtil.langObj = { "1": ["en", 1], "2": ["fr", 3], "3": ["de", 2], "4": ["es", 4], "5": ["zh", 6], "6": ["pt", 5], "7": ["ar", 12], "8": ["el", 16], "9": ["tr", 15], "10": ["pl", 10], "11": ["cs", 13], "12": ["it", 7], "13": ["hu", 11], "14": ["ro", 14] };

    class PreLoadingView extends BaseView {
        constructor() {
            super();
            this.isLogout = false;
            this.dotNum = 0;
            this.m_nProgress = 0;
        }
        get view() {
            return this._view;
        }
        createUI() {
            this.m_nSendTime = Laya.timer.currTimer;
            this._view = new MornUI.Login.PreLoadingViewUI();
            this.m_iPositionType = LayerManager.CENTER;
            this.addChild(this._view);
            SoundMgr.instance.playMusicByName(SoundMgr.soundName_bg, ".mp3");
            this.onStageResize();
            this.view.btnAccept.selected = true;
            this.view.btnLogin.visible = false;
            this.view.btnLogin.clickHandler = new Laya.Handler(this, this.handleClickBtn, [this.view.btnLogin]);
            this.view.btnLogout.clickHandler = new Laya.Handler(this, this.handleClickBtn, [this.view.btnLogout]);
            Signal.intance.on(GameEvent.EVENT_BACK_TO_LOGIN, this, this.backToLogin);
            this.view.btnSound.clickHandler = new Laya.Handler(this, this.handleClickBtn, [this.view.btnSound]);
            this.view.btnSound.visible = false;
            let gameVersion = "app_" + GameSetting.App_Version + " sdk_" + GameSetting.SDK_Version + " game_" + GameSetting.Game_Version;
            PreLoadingView.loadOk = false;
            this.initLoad();
            Laya.timer.loop(300, this, this.txtAnima);
        }
        txtAnima() {
            this.dotNum++;
            if (this.dotNum > 3) {
                this.dotNum = 0;
            }
            let dotStr = "";
            switch (this.dotNum) {
                case 1:
                    {
                        dotStr = ".";
                    }
                    break;
                case 2:
                    {
                        dotStr = "..";
                    }
                    break;
                case 3:
                    {
                        dotStr = "...";
                    }
                    break;
            }
        }
        handleClickBtn(currentTarget) {
            switch (currentTarget) {
                case this.view.btnLogin:
                    {
                        this.view.btnLogin.visible = false;
                    }
                    break;
                case this.view.btnLogout:
                    {
                        this.isLogout = true;
                    }
                    break;
                case this.view.btnSound:
                    {
                        SoundMgr.instance.m_bPlayMusic = !SoundMgr.instance.m_bPlayMusic;
                    }
                    break;
            }
        }
        timeOutHandler() {
            Laya.timer.clear(this, this.timeOutHandler);
            this.view.btnLogin.clickHandler = new Laya.Handler(this, this.handleClickBtn, [this.view.btnLogin]);
        }
        initLoad() {
            this.onAssetLoaded();
        }
        onAssetLoaded() {
            this.loadingProcess = 0;
            this.m_nProgress = 0;
            Laya.timer.loop(1800, this, this.onLoading, [this.m_nProgress]);
            this.completeFun();
        }
        set loadingProcess(_value) {
            if (_value > 1) {
                _value = 1;
            }
            this.view.mcProcess.value = _value;
            this.view.txtProcess.text = Math.floor(_value * 100) + "%";
        }
        completeFun() {
            Laya.timer.clear(this, this.onLoading);
            this.m_nProgress = 0;
            Laya.loader.load(GameResourceManager.instance.m_arrInitResource, Laya.Handler.create(this, this.getLoginData), Laya.Handler.create(this, this.onLoading2, null, false));
            if (!GameSetting.m_bInstantGame) {
                this.view.btnSound.visible = true;
            }
        }
        getLoginData() {
            PlatFormManager.instance.sendCustumEvent(51);
            GlobalRoleDataManger.instance.initSkinData();
            this.readyInitGame();
        }
        readyInitGame() {
            PreLoadingView.loadOk = true;
            if (this.isLogout) {
                Signal.intance.event(GameEvent.EVENT_LOADING_SUC);
                return;
            }
            if (this.view && this.view.mcProcess) {
                this.loadingProcess = 0.8 + 0.2;
            }
            this.initGame();
        }
        backToLogin() {
            this.initGame();
        }
        initGame() {
            LoadingManager.instance.showLoadingByInfo(GameLanguageMgr.instance.getConfigLan(5203));
            Signal.intance.event(GameEvent.EVENT_LOADED_COMPLETE);
            SheetDataManager.intance.init();
            this.joinGame();
        }
        joinGame() {
            console.log("PreLoadingView.joinGame()");
            let loginTime = Laya.timer.currTimer - this.m_nSendTime;
            if (loginTime < 2000) {
                Laya.timer.once(2000 - loginTime, this, this.loginCallBack);
            }
            else
                this.loginCallBack();
            console.log("********************************************************initgame->serverURL登录游戏成功:");
        }
        onLanguageLoaded() {
            GameResourceManager.instance.setGlobalLanguage();
            this.loginCallBack();
        }
        loginCallBack() {
            console.log("loginCallBack++++++++++++++++++++++++++++++++");
            PlatFormManager.instance.sendCustumEvent(3);
            LoadingManager.instance.hideLoading();
            PreLoadingView.m_iState = 2;
            Quick.logs("进入主界面", 5);
            let storyID = GameUserInfo.instance.playerName;
            console.log("storyID ==========" + storyID);
            SceneManager.intance.setCurrentScene(SceneType.M_SCENE_MAIN);
        }
        onLoading(progress) {
            this.m_nProgress += 0.01;
            if (this.view && this.view.mcProcess) {
                if (progress > this.view.mcProcess.value) {
                    this.loadingProcess = progress * 0.4;
                }
            }
        }
        onLoading2(progress) {
            if (this.view && this.view.mcProcess) {
                this.loadingProcess = 0 + progress * 1.1;
            }
        }
        removeEvent() {
            Laya.timer.clear(this, this.txtAnima);
            Laya.timer.clear(this, this.timeOutHandler);
            Signal.intance.off(GameEvent.EVENT_BACK_TO_LOGIN, this, this.backToLogin);
        }
    }
    PreLoadingView.m_iState = 1;
    PreLoadingView.loadOk = false;

    class GameSetting {
        constructor() {
        }
        static get LoginType() {
            return GameSetting._LoginType;
        }
        static set LoginType(value) {
            GameSetting._LoginType = value;
            if (GameSetting._LoginType && GameSetting._LoginType != "") {
                Laya.LocalStorage.setItem(GameSetting.COOKIE_CF_LoginType, GameSetting._LoginType);
            }
        }
        static get isWhiteList() {
            return true;
        }
        static get intance() {
            if (GameSetting._instance) {
                return GameSetting._instance;
            }
            GameSetting._instance = new GameSetting();
            return GameSetting._instance;
        }
        init() {
            GameSetting.m_bInstantGame = false;
            if (Laya.Browser.onIOS) {
                GameSetting.UserAgent = "ios";
            }
            else if (Laya.Browser.onAndroid) {
                GameSetting.UserAgent = "android";
            }
            else {
                if (GameSetting.PLATFORM == GameSetting.P_WEB_FB) {
                    GameSetting.UserAgent = "web_fb";
                }
                else {
                    GameSetting.UserAgent = "web_gw";
                }
                if (GameSetting.m_bIsMobWeb) {
                    GameSetting.UserAgent = "web_mob";
                }
            }
            if (GameSetting.m_bInstantGame) {
                if (!ComUtil.IsSetRelease) {
                    GameSetting.IsRelease = true;
                }
                GameSetting.PLATFORM = GameSetting.P_APP;
                GameSetting.UserAgent = "web_instant";
                GameSetting.useWebVersion = true;
            }
        }
        static get PlatFormToken() {
            let _obj = new Object();
            _obj["platform"] = GameSetting.LoginType;
            _obj["token"] = GameSetting.Login_Token;
            _obj["uid"] = GameSetting.Login_UID;
            _obj["currentChannel"] = GameSetting.LoginType;
            _obj["deviceInfo"] = GameSetting.Device_Info;
            _obj["appVersion"] = GameSetting.App_Version;
            _obj["userAgent"] = GameSetting.UserAgent;
            _obj["pushId"] = GameSetting.FCM_Token;
            return JSON.stringify(_obj);
        }
        static get server() {
            if (GameSetting.M_bAppData) {
                return GameSetting.Server_URL;
            }
            return "";
        }
        static get requestTime() {
            return 0;
        }
        static get loginTime() {
            return 0;
        }
        reloadGame() {
            if (GameSetting.NeedReload) {
                AndroidPlatform.instance.reload();
                if (GameSetting.isPC) {
                }
            }
        }
        static get usePcUI() {
            if (Laya.Render.isConchApp || GameSetting.m_bIsMobWeb) {
                return false;
            }
            return GameSetting.PLATFORM == GameSetting.P_WEB_FB || GameSetting.PLATFORM == GameSetting.P_WEB_GW;
        }
        static get isPC() {
            if (Laya.Render.isConchApp || GameSetting.m_bIsMobWeb) {
                return false;
            }
            return GameSetting.PLATFORM == GameSetting.P_WEB_FB || GameSetting.PLATFORM == GameSetting.P_WEB_GW;
        }
        static get isMobile() {
            if (Laya.Render.isConchApp || GameSetting.m_bIsMobWeb) {
                return true;
            }
            return GameSetting.PLATFORM != GameSetting.P_WEB_FB && GameSetting.PLATFORM != GameSetting.P_WEB_GW;
        }
        static set m_iTimeFrame(time) {
            if (time > 1500) {
                let cancelTime = function () {
                    GameSetting._m_iTimeFrame = 0;
                };
                GameSetting._m_iTimeFrame = time;
                Laya.timer.clear(Laya.timer, cancelTime);
                Laya.timer.once(500, Laya.timer, cancelTime);
                if (PreLoadingView.m_iState == 2) {
                    console.log("---------------## m_iTimeFrame send 165");
                }
            }
        }
        static get m_iTimeFrame() {
            return GameSetting._m_iTimeFrame;
        }
        loadFont() {
            this.urlFont1 = GameResourceManager.instance.setResURL("font/georgia.ttf");
            this.urlFont2 = GameResourceManager.instance.setResURL("font/Microsoft YaHei.ttf");
            Laya.loader.load(this.urlFont1, Laya.Handler.create(this, this.onLoaded), null, Laya.Loader.BUFFER);
            Laya.loader.load(this.urlFont2, Laya.Handler.create(this, this.onLoaded2), null, Laya.Loader.BUFFER);
        }
        onLoaded() {
            let arr = Laya.loader.getRes(this.urlFont1);
            if (Laya.Browser.window.conch) {
                Laya.Browser.window.conch.setFontFaceFromBuffer("constan", arr);
            }
        }
        onLoaded2() {
            let arr = Laya.loader.getRes(this.urlFont2);
            if (Laya.Browser.window.conch) {
                Laya.Browser.window.conch.setFontFaceFromBuffer("ebri", arr);
            }
        }
    }
    GameSetting.P_APP = "app";
    GameSetting.P_WEB_GW = "gw";
    GameSetting.P_WEB_FB = "fb";
    GameSetting.P_WEB_INSTANT = "fbinstantgame";
    GameSetting.PLATFORM = GameSetting.P_APP;
    GameSetting.IsRelease = false;
    GameSetting.m_bInstantGame = false;
    GameSetting.useWebVersion = false;
    GameSetting.m_strVersionEX = "V003";
    GameSetting.m_bIsMobWeb = false;
    GameSetting.m_strWebTag = "";
    GameSetting.Js_Version = "1";
    GameSetting.Game_Version = "20170505_05";
    GameSetting.App_Version = "1.0.0";
    GameSetting.SDK_Version = "1.0.0";
    GameSetting.M_strCountry = "1";
    GameSetting.M_bAppData = false;
    GameSetting.M_strTarget = "";
    GameSetting.UseGuide = false;
    GameSetting.m_mobileSameWb = false;
    GameSetting.unLockAllMap = false;
    GameSetting.unLockAllFun = false;
    GameSetting.buildClickState = true;
    GameSetting.ignoreLang = false;
    GameSetting.ignoreSheetNo = false;
    GameSetting.m_showTravelHit = false;
    GameSetting.m_showTimeStageHit = false;
    GameSetting.m_bIsIphoneX = false;
    GameSetting.proofPicId = 0;
    GameSetting.drawCardNum = 0;
    GameSetting.isFarm = false;
    GameSetting.isEditorMpy = false;
    GameSetting.GM_DATA = "";
    GameSetting.isTest = false;
    GameSetting.Server_URL = "";
    GameSetting.URL_FB_Thumbup = "";
    GameSetting.URL_Web_ProductList = "";
    GameSetting.IP_User = "";
    GameSetting.Plantform_APPID = "17";
    GameSetting.ServerId = 22310001;
    GameSetting.Login_UID = "-1";
    GameSetting._LoginType = "gamecenter";
    GameSetting.Login_Token = "96a3d1daf3b49735ed031c929c98d163";
    GameSetting.Login_UDID = "81BC19A8-B49B-47CC-BEFE-193E723B521A";
    GameSetting.Device_Info = "";
    GameSetting.FCM_Token = "";
    GameSetting.APP_IsRelease = true;
    GameSetting.User_Lan = "en";
    GameSetting.UserAgent = "";
    GameSetting.Login_UserName = "";
    GameSetting.UserBanding = [];
    GameSetting.NeedReload = true;
    GameSetting.IsCheckItem = false;
    GameSetting.usePcWay = true;
    GameSetting.APP_RES = "";
    GameSetting.GameResource_URL = GameSetting.APP_RES + "GameResource.json";
    GameSetting.UNPACK_RES_ROOT = "unpackUI/";
    GameSetting.ALLFILES = "update/allfiles.txt";
    GameSetting.FILETABLE1 = "update/filetable1.txt";
    GameSetting.COOKIE_CF_LAN = "COOKIE_GG_LAN";
    GameSetting.COOKIE_CF_LoginType = "COOKIE_CF_LoginType";
    GameSetting.IPHONEX_SCARE = 1.22;
    GameSetting.IPHONEX_TOP = 44;
    GameSetting.IPHONEX_BUTTOM = 34;
    GameSetting.DESIGN_WIDTH = 640;
    GameSetting.DESIGN_HEIGHT = 1136;
    GameSetting._m_iTimeFrame = 0;
    GameSetting.isStopPhysics = false;
    GameSetting.isDown = false;

    class SceneLoadingManager {
        constructor() {
            this.m_sprMap = new Laya.Sprite();
            this.m_Image = new Laya.Image();
        }
        static get instance() {
            if (!SceneLoadingManager._instance) {
                SceneLoadingManager._instance = new SceneLoadingManager();
            }
            return SceneLoadingManager._instance;
        }
        init() {
            if (!this.loadingMc) {
                let _mc = new Laya.MovieClip();
                _mc.loop = true;
                let mcUrl = GameResourceManager.instance.setResURL("swf/UILoading/UILoading.swf");
                let mcAtlasPath = GameResourceManager.instance.setResURL("swf/UILoading/UILoading.json");
                _mc.load(mcUrl, true, mcAtlasPath);
                _mc.x = Laya.stage.width / 2;
                _mc.y = Laya.stage.height / 2;
                this.loadingMc = _mc;
                _mc.visible = false;
                _mc.stop();
                this.m_sprMap.addChild(this.m_Image);
                this.m_sprMap.mouseEnabled = (this.m_sprMap.mouseThrough = false);
                this.loadingMc.mouseEnabled = (this.loadingMc.mouseThrough = false);
                Laya.stage.addChild(this.m_sprMap);
                this.m_sprMap.visible = false;
                Laya.stage.addChild(this.loadingMc);
            }
        }
        showLoading(showImmediately = false) {
            if (!this.loadingMc) {
                return;
            }
            else {
                this.m_sprMap.size(Laya.stage.width, Laya.stage.height);
                if (GameSetting.m_bIsIphoneX) {
                    this.m_Image.scaleX = GameSetting.IPHONEX_SCARE;
                    this.m_Image.scaleY = GameSetting.IPHONEX_SCARE;
                }
                this.m_Image.x = (this.m_sprMap.width - this.m_Image.width * this.m_Image.scaleX) / 2;
                this.m_Image.y = (this.m_sprMap.height - this.m_Image.height * this.m_Image.scaleY) / 2;
                this.m_sprMap.x = (LayerManager.instence.m_iStageWidth - this.m_sprMap.width * this.m_sprMap.scaleX) / 2;
                this.m_sprMap.y = (LayerManager.instence.m_iStageHeight - this.m_sprMap.height * this.m_sprMap.scaleY) / 2;
                this.m_sprMap.visible = true;
                Laya.timer.clear(this, this.showLazyBg);
                if (showImmediately) {
                    this.m_Image.alpha = 1;
                    this.showLazyBg();
                }
                else {
                    this.m_Image.alpha = 0;
                    if (this.m_sprMap) {
                        this.m_sprMap.graphics.clear();
                        this.m_sprMap.graphics.drawRect(0, 0, Laya.stage.width, Laya.stage.height, "#000000");
                    }
                    Laya.timer.once(300, this, this.showLazyBg);
                }
            }
        }
        showLazyBg() {
            if (this.m_sprMap) {
                this.m_sprMap.graphics.clear();
                this.m_Image.alpha = 1;
            }
            if (this.loadingMc) {
                this.loadingMc.x = Laya.stage.width / 2;
                this.loadingMc.y = Laya.stage.height / 2;
                this.loadingMc.play();
                this.loadingMc.visible = true;
            }
        }
        hideLoading() {
            if (!this.loadingMc) {
                return;
            }
            else {
                this.hideLoadingSHow();
            }
        }
        hideLoadingSHow() {
            Laya.timer.clear(this, this.showLazyBg);
            this.loadingMc.stop();
            this.loadingMc.visible = false;
            this.m_sprMap.visible = false;
        }
        get isShow() {
            return this.loadingMc && this.loadingMc.visible;
        }
        dispose() {
            if (this.m_sprMap) {
                this.m_sprMap.graphics.clear();
            }
            Laya.timer.clear(this, this.showLazyBg);
            if (this.loadingMc) {
                this.loadingMc.destroy();
                this.loadingMc.removeSelf();
                this.loadingMc = null;
            }
        }
    }

    class EnumFun {
    }
    EnumFun.FUN_MYHOME = 1;
    EnumFun.FUN_STORE = 2;
    EnumFun.FUN_TRAVEL = 3;
    EnumFun.FUN_PVP = 1011;
    EnumFun.FUN_PVPMULTI = 7001;
    EnumFun.FUN_GUILDPHOTO = 1004;
    EnumFun.FUN_PET = 1003;
    EnumFun.FUN_1V1 = 1014;
    EnumFun.FUN_THUMB = 9005;
    EnumFun.FUN_THUMB_RANKING_REWARD = 3008;
    EnumFun.FUN_BOYFRIEND = 4005;
    EnumFun.FUN_TIMESTAGE = 1006;
    EnumFun.FUN_FARM_MODEL = 1008611;
    EnumFun.FUN_GROUP_PHOTO = 1008612;
    EnumFun.FUN_TV = 1001;
    EnumFun.FUN_PRAY = 1005;
    EnumFun.FUN_WORKSHOP = 1006;
    EnumFun.FUN_SHOP_CLOTH = 4001;
    EnumFun.FUN_SHOP_PRAY = 2108;
    EnumFun.FUN_SHOP_1V1 = 2119;
    EnumFun.FUN_SHOP_PVP = 2107;
    EnumFun.FUN_SHOP_THUMB = 2113;
    EnumFun.FUN_SHOP_GUILD = 2111;
    EnumFun.FUN_FIRST_RECHARGE = 2201;
    EnumFun.FUN_ACTIVITY_CENTER = 2002;

    class ObjectUtils {
        constructor() {
        }
        static destroyArray(arr) {
            if (arr) {
                arr.splice(0, arr.length);
                arr = null;
            }
        }
        static destroyObject(obj, destroyChild = true) {
            if (obj && obj instanceof Laya.Sprite) {
                Laya.timer.clearAll(obj);
                Laya.Tween.clearAll(obj);
                obj.offAll();
                obj.graphics.destroy();
                obj.removeSelf();
                obj.destroy(destroyChild);
                obj = null;
            }
        }
    }

    class BaseScene extends Laya.Sprite {
        constructor(URL, isCanDrag = true, name = "", type = 1) {
            super();
            this.m_bCanDrag = true;
            this.toScene = "";
            this.isDispose = false;
            this.isHideLoading = true;
            this.isResDispose = true;
            this.showTop = false;
            this.maskLayer = new Laya.Sprite();
            this.m_arrOpenSceneData = [];
            this.m_SceneResource = "";
            this._loadSceneResCom = true;
            this._loadBgImgCom = false;
            this.isFixRoleView = false;
            this.m_iScare = 1;
            this.mapUrls = [];
            if (GameSetting.m_bIsIphoneX) {
                this.m_iScare = GameSetting.IPHONEX_SCARE;
            }
            this.m_strMapURL = URL;
            this.m_bCanDrag = isCanDrag;
            this.name = name;
            this.m_instanceType = type;
            this.init();
            Laya.stage.on(Laya.Event.RESIZE, this, this.onStageResize);
            Signal.intance.on(Laya.Event.CLOSE, this, this.onDialogColse);
        }
        onDialogColse() {
        }
        onStageResize() {
            if (GameSetting.usePcUI) {
                LayerManager.instence.setPosition(this, LayerManager.LEFTUP);
                this.showDragRegion();
            }
        }
        init() {
            this.m_sprMap = new Laya.Sprite();
            this.addChild(this.m_sprMap);
            this.m_sprMap.mouseEnabled = true;
            this.loadMap();
            SceneManager.intance.dragging = false;
        }
        reLoadMap(url, handler = null) {
            if (this.mapUrls.indexOf(url) == -1) {
                this.mapUrls.push(url);
            }
            if (this.m_strMapURL && this.m_strMapURL != "") {
                this.m_strMapURL = url;
                this.m_strMapURL = GameResourceManager.instance.setResURL(this.m_strMapURL);
                this.m_sprMap.graphics.clear();
                this.m_sprMap.loadImage(this.m_strMapURL, handler);
            }
            else {
                this.m_strMapURL = url;
                this.m_strMapURL = GameResourceManager.instance.setResURL(this.m_strMapURL);
                this.m_sprMap.loadImage(this.m_strMapURL, Laya.Handler.create(this, function (tex) {
                    this.initMapPosition();
                    handler && handler.runWith(tex);
                }));
            }
        }
        loadMap() {
            this._loadBgImgCom = false;
            if (SceneManager.m_arrSceneToDialog.indexOf(this.name) != -1 && GameSetting.usePcUI) {
                this.m_strMapURL = "";
                this.addChild(this.maskLayer);
                this.maskLayer.on(Laya.Event.CLICK, this, this.onClickMask);
                if (this.maskLayer) {
                    this.maskLayer.width = LayerManager.instence.m_iStageWidth;
                    this.maskLayer.height = LayerManager.instence.m_iStageHeight;
                    this.maskLayer.graphics.clear();
                    this.maskLayer.graphics.drawRect(0, 0, LayerManager.instence.m_iStageWidth, LayerManager.instence.m_iStageHeight, UIConfig.popupBgColor);
                    this.maskLayer.alpha = UIConfig.popupBgAlpha;
                }
            }
            if (SceneManager.m_arrSceneToDialogBG.indexOf(this.name) != -1) {
                if (GameSetting.usePcUI) {
                    this.m_strMapURL = "scene/com_bg.jpg";
                }
                this.m_sprMap.on(Laya.Event.CLICK, this, this.onClickMask);
            }
            if (this.m_strMapURL && this.m_strMapURL != "") {
                this.m_strMapURL = GameResourceManager.instance.setResURL(this.m_strMapURL);
                this.m_sprMap.loadImage(this.m_strMapURL, Laya.Handler.create(this, this.onMapLoaded));
            }
            else {
                this.onMapLoaded();
            }
        }
        onClickMask(event) {
            let preSceneData = SceneManager.intance.getPreSceneData();
            SceneManager.intance.setCurrentScene(preSceneData[0], preSceneData[1], preSceneData[2], preSceneData[3], false);
        }
        onMapLoaded(_e = null) {
            if (_e != null && _e instanceof Laya.Texture) {
                this.absURL = _e.url;
            }
            SoundMgr.instance.playSoundByName(SoundMgr.soundName3);
            if (this.isDispose) {
                return;
            }
            this.initMapPosition();
            this.loadSceneResource();
        }
        onMapChanged(_e = null) {
            this.initMapPosition();
        }
        loadSceneResource() {
            if (this.m_SceneResource) {
                GameResourceManager.instance.loadModuleUrl(this.m_SceneResource, Laya.Handler.create(this, this._onLoaded));
            }
            else {
                this._onLoaded();
            }
        }
        _onLoaded(_e = null) {
            if (this.isDispose) {
                return;
            }
            this.onLoaded();
            this.updateData();
            if (this.m_bCanDrag) {
                console.log("addDragEvent");
                this.addDragEvent();
            }
            if (this.isHideLoading) {
                SceneLoadingManager.instance.hideLoading();
            }
        }
        onLoaded() {
        }
        updateData() {
        }
        open() {
            this.updateData();
        }
        addDragEvent() {
            this.m_sprMap.on(Laya.Event.DRAG_START, this, this.onDragStart);
            this.m_sprMap.on(Laya.Event.DRAG_END, this, this.onDragEnd);
            this.m_sprMap.on(Laya.Event.MOUSE_DOWN, this, this.onStartDrag);
            this.m_sprMap.on(Laya.Event.DRAG_MOVE, this, this.onDragMove);
            this.m_sprMap.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
        }
        addEvent() {
        }
        _removeEvent() {
            this.m_sprMap.off(Laya.Event.DRAG_START, this, this.onDragStart);
            this.m_sprMap.off(Laya.Event.DRAG_END, this, this.onDragEnd);
            this.m_sprMap.off(Laya.Event.MOUSE_DOWN, this, this.onStartDrag);
            this.m_sprMap.off(Laya.Event.DRAG_MOVE, this, this.onDragMove);
            this.m_sprMap.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
            this.m_sprMap.offAll();
            Laya.stage.off(Laya.Event.RESIZE, this, this.onStageResize);
            Signal.intance.off(Laya.Event.CLOSE, this, this.onDialogColse);
            this.removeEvent();
        }
        removeEvent() {
        }
        get isToDialog() {
            return GameSetting.usePcUI && SceneManager.m_arrSceneToDialogBG.indexOf(this.name) != -1;
        }
        changMap(url) {
            url = "scene/sceneBg/" + url + ".jpg";
            this.changUrl = GameResourceManager.instance.setResURL(url);
            Laya.loader.load(this.changUrl, new Laya.Handler(this, this.loadImgComplete));
        }
        loadImgComplete() {
            if (this.isDispose) {
                return;
            }
            let texture = Laya.loader.getRes(this.changUrl);
            if (!texture) {
                console.log("BaseScene-> loadImagcomplete:texture =" + texture + "   url" + this.changUrl);
                return;
            }
            this.m_sprMap.texture = texture;
            this.m_sprMap.width = texture.width;
            this.m_sprMap.height = texture.height;
            this.initMapPosition();
        }
        initMapPosition() {
            if (GameSetting.m_bIsIphoneX) {
                this.m_sprMap.scaleX = this.m_iScare;
                this.m_sprMap.scaleY = this.m_iScare;
            }
            this.m_sprMap.pivot(this.m_sprMap.width / 2, this.m_sprMap.height / 2);
            this.m_sprMap.x = Laya.stage.width / 2;
            this.m_sprMap.y = Laya.stage.height / 2;
        }
        onDragStart(e = null) {
            this.m_iStartx = this.m_sprMap.x;
            SceneManager.intance.dragging = false;
        }
        onDragEnd(e = null) {
            SceneManager.intance.dragging = false;
        }
        onMouseMove() {
        }
        onDragMove() {
            BaseScene.m_iDx = Math.abs(this.m_iStartx - this.m_sprMap.x);
            if (BaseScene.m_iDx < 6) {
                return;
            }
            SceneManager.intance.dragging = true;
        }
        onStartDrag(e = null) {
            SceneManager.intance.dragging = false;
            this.showDragRegion();
            this.m_sprMap.on(Laya.Event.DRAG_MOVE, this, this.onDragMap);
            this.m_sprMap.startDrag(this.dragRegion, true, 0);
        }
        onDragMap(evt) {
        }
        showDragRegion() {
            let dragWidthLimit = this.m_sprMap.width * this.m_iScare - Laya.stage.width;
            let dragHeightLimit = 0;
            this.dragRegion = new Laya.Rectangle(Laya.stage.width - dragWidthLimit >> 1, Laya.stage.height - dragHeightLimit >> 1, dragWidthLimit, dragHeightLimit);
        }
        moveX(targetX, soonChange = true) {
            let mapX = this.m_sprMap.x;
            let globalPoint = this.m_sprMap.localToGlobal(new Laya.Point(targetX, 0));
            mapX += -globalPoint.x + new Laya.Point(LayerManager.instence.stageWidth * 0.5, LayerManager.instence.stageHeight * 0.5).x;
            this.m_sprMap.x = mapX;
            let gP = this.m_sprMap.localToGlobal(new Laya.Point(this.m_sprMap.width, 0));
            if (gP.x < LayerManager.instence.stageWidth) {
                mapX += LayerManager.instence.stageWidth - gP.x;
            }
            gP = this.m_sprMap.localToGlobal(new Laya.Point(0, 0));
            if (gP.x > 0) {
                mapX -= gP.x;
            }
            if (soonChange) {
                this.m_sprMap.x = mapX;
            }
            return mapX;
        }
        dispose() {
            this.isDispose = true;
            LoadingManager.instance.hideLoading();
            this._removeEvent();
            ObjectUtils.destroyObject(this.m_sprMap);
            ObjectUtils.destroyObject(this.maskLayer);
            if (this.absURL && this.absURL.indexOf("preload") == -1) {
                Laya.loader.clearRes(this.absURL);
            }
            if (this.isResDispose) {
                if (this.m_strMapURL && this.m_strMapURL != "") {
                    Laya.loader.clearRes(this.m_strMapURL);
                }
                for (let url of this.mapUrls) {
                    if (url != this.m_strMapURL) {
                        Laya.loader.clearRes(url);
                    }
                }
                GameResourceManager.instance.clearModuleUrl(this.m_SceneResource);
            }
            this.m_strMapURL = null;
            this.m_rectDragRegion = null;
            this.toScene = null;
            this.fromScene = null;
            this.dragRegion = null;
            this.absURL = null;
            this.m_SceneResource = null;
            this._newHandler && this._newHandler.clear();
            this._newHandler = null;
            this.changUrl = null;
            this.m_arrOpenSceneData = null;
            ObjectUtils.destroyObject(this);
        }
        get bgWidth() {
            return 0;
        }
        get bgHeight() {
            return 0;
        }
        static shake(shakeSprs, times = 2, offset = 4, speed = 32) {
            if (BaseScene.isShake) {
                return;
            }
            BaseScene.isShake = true;
            let len = shakeSprs.length;
            let points = [];
            for (let i = 0; i < len; i++) {
                let shakeSpr = shakeSprs[i];
                points.push([shakeSpr.x, shakeSpr.y]);
            }
            let offsetXYArray = [0, 0];
            let num = 0;
            let updateShake = function () {
                offsetXYArray[num % 2] = num++ % 4 < 2 ? 0 : offset;
                if (num > times * 4 + 1) {
                    Laya.timer.clear(Laya.stage, updateShake);
                    num = 0;
                    BaseScene.isShake = false;
                }
                for (let j = 0; j < len; j++) {
                    let shakeSpr = shakeSprs[j];
                    shakeSpr.x = offsetXYArray[0] + points[j][0];
                    shakeSpr.y = offsetXYArray[1] + points[j][1];
                }
            };
            Laya.timer.loop(speed, Laya.stage, updateShake);
        }
    }
    BaseScene.isShake = false;

    class FindEvent extends Laya.Event {
        constructor() {
            super();
        }
    }
    FindEvent.INIT_SUIT_EVENT = "FindEvent:INIT_SUIT_EVENT";
    FindEvent.EVENT_FIND_ITEM_CLICK = "FindEvent:EVENT_FIND_ITEM_CLICK";
    FindEvent.EVENT_RELEASE_ITEM_CLICK = "FindEvent:EVENT_RELEASE_ITEM_CLICK";
    FindEvent.EVENT_FINISH = "FindEvent:EVENT_FINISH";
    FindEvent.EVENT_START = "FindEvent:EVENT_START";
    FindEvent.EVENT_AGAIN = "FindEvent:EVENT_AGAIN";
    FindEvent.EVENT_ENABLE_TIJIAO = "FindEvent:EVENT_ENABLE_TIJIAO";
    FindEvent.EVENT_HUMANSTAY = "FindEvent:EVENT_HUMANSTAY";
    FindEvent.EVENT_STOPGAME = "FindEvent:EVENT_STOPGAME";
    FindEvent.EVENT_RESTORE = "FindEvent:EVENT_RESTORE";
    FindEvent.EVENT_CANCEL_RESTORE = "FindEvent:EVENT_CANCEL_RESTORE";
    FindEvent.EVENT_COLLISIONENTER = "FindEvent:EVENT_COLLISIONENTER";
    FindEvent.SELECT_UI = "FindEvent:SELECT_UI";

    class Car extends Laya.Script {
        constructor() {
            super(...arguments);
            this.level = 1;
            this.isPlayAdd = false;
            this.moveVec = new Laya.Point(0, 0);
            this.forceTotal = 200;
            this.force = 200;
            this.turn = 0;
        }
        onEnable() {
            this._myCar = this.owner;
            this._rig = this.owner.getComponent(Laya.RigidBody);
            this._rig.linearDamping = 2;
            this._rig.angularDamping = 10;
            this.level = Math.round(Math.random() * 5) + 1;
        }
        onStart() {
            let t = 1000 / 60;
            Laya.timer.loop(t, this, this.onFrame);
        }
        onDestroy() {
            Laya.timer.clear(this, this.onFrame);
        }
        onFrame() {
            let speedx = this._rig.linearVelocity.x;
            let speedy = this._rig.linearVelocity.y;
            let speed = Math.sqrt(speedx * speedx + speedy * speedy);
            let rotate = Car.angleToRadian(this._myCar.rotation - 90);
            if (this.isAdd) {
                this.moveVec.x = this.force * Math.cos(rotate);
                this.moveVec.y = this.force * Math.sin(rotate);
                if (!this.isPlayAdd) {
                    Laya.SoundManager.playSound("sound/AddSpeedSound.wav", 0);
                    this.isPlayAdd = true;
                }
            }
            else {
                Laya.SoundManager.stopSound("sound/AddSpeedSound.wav");
                this.isPlayAdd = false;
            }
            if (this.isReduce) {
                this.moveVec.setTo(0, 0);
            }
            if (this.isLeft) {
                this._myCar.rotation -= 1.5;
                this.turn++;
            }
            if (this.isRight) {
                this._myCar.rotation += 1.5;
                this.turn++;
            }
            if (!this.isAdd && !this.isReduce) {
                this.moveVec.setTo(0, 0);
            }
            if (!this.isLeft && !this.isRight) {
                this.turn = 0;
            }
            if (this.turn > 5 && speed > 10) {
                this.force = this.forceTotal / 2;
            }
            else if (speed !== 0) {
                this.force = this.forceTotal;
            }
            this._rig.applyForceToCenter(this.moveVec);
        }
        static angleToRadian(angle) {
            return angle * Math.PI / 180;
        }
        static radianToAngle(radian) {
            return radian * 180 / Math.PI;
        }
        onTriggerEnter(other, self, contact) {
            let owner = this.owner;
            if (other.label === "endPointCollider1") {
                this.lastEndPoint = other.label;
            }
            else if (other.label === "endPointCollider2") {
                if (this.lastEndPoint && this.lastEndPoint == "endPointCollider1") {
                    this.lastEndPoint = other.label;
                }
            }
            else if (other.label === "endPointCollider3") {
                if (this.lastEndPoint && this.lastEndPoint == "endPointCollider2") {
                    this.lastEndPoint = other.label;
                }
            }
            else if (other.label === "endPointCollider4") {
                if (this.lastEndPoint && this.lastEndPoint == "endPointCollider3") {
                    Signal.intance.event(FindEvent.EVENT_STOPGAME);
                }
            }
        }
        createEffect() {
            let ani = new Laya.Animation();
            ani.loadAnimation("test/TestAni.ani");
            let recover = () => {
                ani.removeSelf();
                Laya.Pool.recover("effect", ani);
            };
            ani.on(Laya.Event.COMPLETE, null, recover);
            return ani;
        }
        onDisable() {
            Laya.Pool.recover("Car", this.owner);
        }
        onBtnLeftDown() {
            this.isLeft = true;
            this.isRight = false;
            return;
        }
        onBtnLeftUp() {
            this.isLeft = false;
        }
        onBtnRightDown() {
            this.isLeft = false;
            this.isRight = true;
            console.log("_car.onBtnRightDown()");
        }
        onBtnRightUp() {
            this.isRight = false;
        }
        onBtnAddDown() {
            this.isReduce = false;
            this.isAdd = true;
        }
        onBtnAddUp() {
            this.isAdd = false;
        }
        onBtnReduceDown() {
            this.isAdd = false;
            this.isReduce = true;
        }
        onBtnReduceUp() {
            this.isReduce = false;
        }
    }

    class FindView extends BaseView {
        constructor(data) {
            super();
            this.addTime = 20;
            this.onStageResize();
        }
        init() {
            this.totalTime = 60 * 1000;
            this.currTime = 0;
            this.isStart = false;
            this.isEnd = false;
        }
        createUI() {
            this._view = new MornUI.find.FindViewUI();
            this.hitTestPrior = true;
            this._view.hitTestPrior = true;
            this.addChild(this._view);
            this._gameContainer = this.view.getChildByName("gameContainer");
            Laya.Physics.I.worldRoot = this.view.gameContainer;
            this._myCar = this.view.myCar;
            this._car = this._myCar.getComponent(Car);
            this.updateBg();
            this.mArrow = this.view.img_guide;
            this.mArrow.visible = false;
            FindModel.instance.addScore = 0;
            this.view.label_reduce.text = "剩余：" + TimeUtil.formatMM(this.totalTime);
            this.view.label_start.text = "开始：" + "00:000";
            FindModel.instance.addCoin = 0;
        }
        updateBg() {
            let carGlobalP = this._myCar.parent.localToGlobal(new Laya.Point(this._myCar.x, this._myCar.y));
            let centerPoint = new Laya.Point(Laya.stage.width >> 1, Laya.stage.height >> 1);
            let offsetP = new Laya.Point(centerPoint.x - carGlobalP.x, centerPoint.y - carGlobalP.y);
            let gx = this._gameContainer.x + offsetP.x;
            let gy = this._gameContainer.y + offsetP.y;
            let offsetX = 0;
            let offsetY = 0;
            if (gx > offsetX) {
                gx = offsetX;
            }
            else if (gx < Laya.stage.width - this._gameContainer.width * this._gameContainer.scaleX) {
                gx = Laya.stage.width - this._gameContainer.width * this._gameContainer.scaleX;
            }
            if (gy > offsetY) {
                gy = offsetY;
            }
            else if (gy < Laya.stage.height - this._gameContainer.height * this._gameContainer.scaleY) {
                gy = Laya.stage.height - this._gameContainer.height * this._gameContainer.scaleY;
            }
            this._gameContainer.pos(gx, gy);
            this.view.img_littleCar.pos(this.view.myCar.x / 10, this.view.myCar.y / 10);
        }
        startGame() {
            this.isStart = true;
            Laya.timer.frameLoop(1, this, this.updateBg);
            Laya.timer.loop(this.addTime, this, this.setTime);
            this.onTijiao();
        }
        onTijiao() {
            let sendCallBack = function (type) {
            };
            let delta = Laya.timer.delta;
            let _sendCallBack = sendCallBack;
            let score = "0";
            let frameRate = Laya.stage.frameRate;
            let urlPrama = score;
            let userAgent = Laya.Browser.userAgent;
            let d = new Date();
            let n = d.getTime();
            let url = Laya.Browser.window.location.href;
        }
        setTime() {
            this.totalTime -= this.addTime;
            if (this.totalTime < 0) {
                this.totalTime = 0;
                Laya.timer.clear(this, this.setTime);
                this.gameFinish(true);
                return;
            }
            this.currTime += this.addTime;
            this.view.label_reduce.text = "剩余：" + TimeUtil.formatMM(this.totalTime);
            this.view.label_start.text = "开始：" + TimeUtil.formatMM(this.currTime);
        }
        checkGuide() {
            if (GameUserInfo.instance.isGuide == 0) {
            }
        }
        get view() {
            return this._view;
        }
        addEvent() {
            this.view.btn_back.on(Laya.Event.CLICK, this, this.onBack);
            Signal.intance.on(FindEvent.EVENT_HUMANSTAY, this, this.onHumanStay);
            Signal.intance.on(FindEvent.EVENT_START, this, this.startGame);
            Signal.intance.on(FindEvent.EVENT_STOPGAME, this, this.gameFinish);
            this.view.btnLeft.on(Laya.Event.MOUSE_DOWN, this, this.onBtnLeftDown);
            this.view.btnLeft.on(Laya.Event.MOUSE_UP, this, this.onBtnLeftUp);
            this.view.btnLeft.on(Laya.Event.MOUSE_OUT, this, this.onBtnLeftUp);
            this.view.btnRight.on(Laya.Event.MOUSE_DOWN, this, this.onBtnRightDown);
            this.view.btnRight.on(Laya.Event.MOUSE_UP, this, this.onBtnRightUp);
            this.view.btnRight.on(Laya.Event.MOUSE_OUT, this, this.onBtnRightUp);
            this.view.btnAdd.on(Laya.Event.MOUSE_DOWN, this, this.onBtnAddDown);
            this.view.btnAdd.on(Laya.Event.MOUSE_UP, this, this.onBtnAddUp);
            this.view.btnAdd.on(Laya.Event.MOUSE_OUT, this, this.onBtnAddUp);
            super.addEvent();
        }
        onBtnLeftDown() {
            this._car.onBtnLeftDown();
        }
        onBtnLeftUp() {
            this._car.onBtnLeftUp();
        }
        onBtnRightDown() {
            this._car.onBtnRightDown();
        }
        onBtnRightUp() {
            this._car.onBtnRightUp();
        }
        onBtnAddDown() {
            this._car.onBtnAddDown();
        }
        onBtnAddUp() {
            this._car.onBtnAddUp();
        }
        onBtnReduceDown() {
            this._car.onBtnReduceDown();
        }
        onBtnReduceUp() {
            this._car.onBtnReduceUp();
        }
        onBack() {
            SceneManager.intance.setCurrentScene(SceneType.M_SCENE_MAIN);
        }
        onStageResize() {
            super.onStageResize();
            this.y = 0;
        }
        checkSleep() {
            let hasFall = false;
            if (hasFall) {
                Laya.timer.clear(this, this.checkSleep);
                this.isWin = false;
                if (FindModel.instance.restoreTime < 1) {
                    Laya.timer.clear(this, this.gameFinish);
                    FindModel.instance.restoreTime++;
                    Signal.intance.event(GameEvent.EVENT_OPEN_MODULE, [ModuleName.FindAskDialog, []]);
                    return;
                }
                this.gameFinish(true);
                return;
            }
        }
        gameFinish(immediately = true) {
            this.isEnd = true;
            Laya.timer.clearAll(this);
            if (immediately) {
                this.onGameFinish();
            }
            else {
                Laya.timer.once(500, this, this.onGameFinish);
            }
        }
        onGameFinish() {
            FindModel.instance.addScore = this.totalTime;
            Signal.intance.event(GameEvent.EVENT_OPEN_MODULE, [ModuleName.QuickShareView]);
        }
        onHumanStay() {
            if (!this.isStart || this.isEnd) {
                return;
            }
            this.isWin = true;
            Laya.timer.once(2000, this, this.gameFinish);
        }
        removeEvent() {
            Signal.intance.off(FindEvent.EVENT_STOPGAME, this, this.gameFinish);
            Signal.intance.off(FindEvent.EVENT_START, this, this.startGame);
            Signal.intance.off(FindEvent.EVENT_HUMANSTAY, this, this.onHumanStay);
            super.removeEvent();
        }
        dispose() {
            FindModel.instance.rigidBods = [];
            Laya.timer.clearAll(this);
            super.dispose();
        }
        firstTween() {
            Laya.Tween.to(this.mArrow, { x: this.endPt.x, y: this.endPt.y }, 1000, null, Laya.Handler.create(this, this.secondTween));
        }
        secondTween() {
            Laya.Tween.to(this.mArrow, { x: this.beginPt.x - 10, y: this.beginPt.y }, 500, null, Laya.Handler.create(this, this.firstTween));
        }
        clearTween() {
            this.mArrow.visible = false;
            Laya.Tween.clearAll(this.mArrow);
        }
    }

    class QuickEndView extends BaseView {
        constructor() {
            super();
            this.onStageResize();
        }
        init() {
            super.init();
        }
        get view() {
            return this._view;
        }
        createUI() {
            this._view = new MornUI.tvstart.QuickEndViewUI();
            this.addChild(this._view);
            super.initialize();
            this.view.label_score.text = FindModel.instance.addScore.toString();
            this.btnBackX = this.view.btn_back.x;
        }
        destroy(destroyChild = true) {
            super.destroy(destroyChild);
        }
        addEvent() {
            super.addEvent();
            this.view.btn_tijiao.on(Laya.Event.CLICK, this, this.onTijiao);
            this.view.btn_send.on(Laya.Event.CLICK, this, this.sendSms);
            this.view.btn_success.on(Laya.Event.CLICK, this, this.onSuccess);
            Signal.intance.on(FindEvent.EVENT_ENABLE_TIJIAO, this, this.enableTijiao);
            this.view.btn_back.on(Laya.Event.CLICK, this, this.onOpenStart);
        }
        onOpenStart() {
            if (SceneManager.intance.currSceneName == SceneType.M_SCENE_MAIN) {
                Signal.intance.event(GameEvent.EVENT_OPEN_MODULE, [ModuleName.TVStartView]);
                this.dispose();
            }
            else {
                SceneManager.intance.setCurrentScene(SceneType.M_SCENE_MAIN);
            }
        }
        onSuccess() {
            Signal.intance.event(GameEvent.EVENT_OPEN_MODULE, ModuleName.TravelCharpterDialog);
        }
        onTijiao(e) {
            this.view.btn_tijiao.disabled = true;
            let fromName = this.view.label_name.text;
            let phonenum = this.view.label_no.text;
            let shi = this.view.label_city.text;
            let code = this.view.label_yanzheng.text;
            let sendCallBack = function (type) {
                if (type > 0) {
                    this.view.box_tijiao.visible = false;
                    this.view.box_success.visible = true;
                    GameUserInfo.instance.isTip = 1;
                }
                else {
                    Signal.intance.event(FindEvent.EVENT_ENABLE_TIJIAO);
                }
            };
            let _sendCallBack = sendCallBack;
            if (!this.view.checkBox.selected) {
                NoticeMgr.instance.notice("请勾选阅读并同意隐私政策");
                this.view.btn_tijiao.disabled = false;
                return;
            }
        }
        sendSms(e) {
            let phonenum = this.view.label_no.text;
            let sendCodeBack = function (type) {
            };
            let _sendCodeBack = sendCodeBack;
            let errorMsg;
            if (phonenum == "") {
                errorMsg = "手机号 是必填项";
            }
            else if (phonenum.length != 11 || !/^1(3|4|5|6|7|8|9)\d{9}$/.test(phonenum)) {
                errorMsg = "手机号  必须为11位有效数字";
            }
            if (errorMsg != null) {
                NoticeMgr.instance.notice(errorMsg);
                return;
            }
            this.setTime();
        }
        setTime() {
            this.view.btn_send.disabled = true;
            this.totalTime = 60;
            this.view.label_time.visible = true;
            this.view.label_time.text = this.totalTime.toString();
            Laya.timer.loop(1000, this, this.updateTime);
        }
        updateTime() {
            this.totalTime--;
            if (this.totalTime < 0) {
                Laya.timer.clear(this, this.updateTime);
                this.view.btn_send.disabled = false;
                this.view.label_time.visible = false;
                return;
            }
            this.view.label_time.text = this.totalTime.toString();
        }
        enableTijiao() {
            this.view.btn_tijiao.disabled = false;
        }
        onStageResize() {
            this.view.btn_back.x = this.btnBackX - (Laya.stage.width - 640) / 2;
        }
        dispose() {
            super.dispose();
        }
        removeEvent() {
            super.removeEvent();
            Signal.intance.off(FindEvent.EVENT_ENABLE_TIJIAO, this, this.enableTijiao);
        }
    }

    class ByteEx {
        constructor(data = null) {
            this._xd_ = true;
            this._allocated_ = 8;
            this._pos_ = 0;
            this._length = 0;
            if (data) {
                this._u8d_ = new Uint8Array(data);
                this._d_ = new DataView(this._u8d_.buffer);
                this._length = this._d_.byteLength;
            }
            else {
                this._resizeBuffer(this._allocated_);
            }
        }
        static getSystemEndian() {
            if (!ByteEx._sysEndian) {
                let buffer = new ArrayBuffer(2);
                new DataView(buffer).setInt16(0, 256, true);
                ByteEx._sysEndian = new Int16Array(buffer)[0] === 256 ? ByteEx.LITTLE_ENDIAN : ByteEx.BIG_ENDIAN;
            }
            return ByteEx._sysEndian;
        }
        get buffer() {
            let rstBuffer = this._d_.buffer;
            if (rstBuffer.byteLength === this._length) {
                return rstBuffer;
            }
            return rstBuffer.slice(0, this._length);
        }
        get endian() {
            return this._xd_ ? ByteEx.LITTLE_ENDIAN : ByteEx.BIG_ENDIAN;
        }
        set endian(value) {
            this._xd_ = value === ByteEx.LITTLE_ENDIAN;
        }
        set length(value) {
            if (this._allocated_ < value) {
                this._resizeBuffer(this._allocated_ = Math.floor(Math.max(value, this._allocated_ * 2)));
            }
            else if (this._allocated_ > value) {
                this._resizeBuffer(this._allocated_ = value);
            }
            this._length = value;
        }
        get length() {
            return this._length;
        }
        _resizeBuffer(len) {
            try {
                let newByteView = new Uint8Array(len);
                if (this._u8d_ != null) {
                    if (this._u8d_.length <= len) {
                        newByteView.set(this._u8d_);
                    }
                    else {
                        newByteView.set(this._u8d_.subarray(0, len));
                    }
                }
                this._u8d_ = newByteView;
                this._d_ = new DataView(newByteView.buffer);
            }
            catch (err) {
                throw "Invalid typed array length:" + len;
            }
            ;
        }
        getString() {
            return this.readString();
        }
        readString() {
            return this._rUTF(this.getUint16());
        }
        getFloat32Array(start, len) {
            return this.readFloat32Array(start, len);
        }
        readFloat32Array(start, len) {
            let end = start + len;
            end = end > this._length ? this._length : end;
            let v = new Float32Array(this._d_.buffer.slice(start, end));
            this._pos_ = end;
            return v;
        }
        getUint8Array(start, len) {
            return this.readUint8Array(start, len);
        }
        readUint8Array(start, len) {
            let end = start + len;
            end = end > this._length ? this._length : end;
            let v = new Uint8Array(this._d_.buffer.slice(start, end));
            this._pos_ = end;
            return v;
        }
        getInt16Array(start, len) {
            return this.readInt16Array(start, len);
        }
        readInt16Array(start, len) {
            let end = start + len;
            end = end > this._length ? this._length : end;
            let v = new Int16Array(this._d_.buffer.slice(start, end));
            this._pos_ = end;
            return v;
        }
        getFloat32() {
            return this.readFloat32();
        }
        readFloat32() {
            if (this._pos_ + 4 > this._length) {
                throw "getFloat32 error - Out of bounds";
            }
            let v = this._d_.getFloat32(this._pos_, this._xd_);
            this._pos_ += 4;
            return v;
        }
        getFloat64() {
            return this.readFloat64();
        }
        readFloat64() {
            if (this._pos_ + 8 > this._length) {
                throw "getFloat64 error - Out of bounds";
            }
            let v = this._d_.getFloat64(this._pos_, this._xd_);
            this._pos_ += 8;
            return v;
        }
        writeFloat32(value) {
            this._ensureWrite(this._pos_ + 4);
            this._d_.setFloat32(this._pos_, value, this._xd_);
            this._pos_ += 4;
        }
        writeFloat64(value) {
            this._ensureWrite(this._pos_ + 8);
            this._d_.setFloat64(this._pos_, value, this._xd_);
            this._pos_ += 8;
        }
        getInt32() {
            return this.readInt32();
        }
        readInt32() {
            if (this._pos_ + 4 > this._length) {
                throw "getInt32 error - Out of bounds";
            }
            let float = this._d_.getInt32(this._pos_, this._xd_);
            this._pos_ += 4;
            return float;
        }
        getUint32() {
            return this.readUint32();
        }
        readUint32() {
            if (this._pos_ + 4 > this._length) {
                throw "getUint32 error - Out of bounds";
            }
            let v = this._d_.getUint32(this._pos_, this._xd_);
            this._pos_ += 4;
            return v;
        }
        writeInt32(value) {
            this._ensureWrite(this._pos_ + 4);
            this._d_.setInt32(this._pos_, value, this._xd_);
            this._pos_ += 4;
        }
        writeUint32(value) {
            this._ensureWrite(this._pos_ + 4);
            this._d_.setUint32(this._pos_, value, this._xd_);
            this._pos_ += 4;
        }
        getInt16() {
            return this.readInt16();
        }
        readInt16() {
            if (this._pos_ + 2 > this._length) {
                throw "getInt16 error - Out of bounds";
            }
            let us = this._d_.getInt16(this._pos_, this._xd_);
            this._pos_ += 2;
            return us;
        }
        getUint16() {
            return this.readUint16();
        }
        readUint16() {
            if (this._pos_ + 2 > this._length) {
                throw "getUint16 error - Out of bounds";
            }
            let us = this._d_.getUint16(this._pos_, this._xd_);
            this._pos_ += 2;
            return us;
        }
        writeUint16(value) {
            this._ensureWrite(this._pos_ + 2);
            this._d_.setUint16(this._pos_, value, this._xd_);
            this._pos_ += 2;
        }
        writeInt16(value) {
            this._ensureWrite(this._pos_ + 2);
            this._d_.setInt16(this._pos_, value, this._xd_);
            this._pos_ += 2;
        }
        getUint8() {
            return this.readUint8();
        }
        readUint8() {
            if (this._pos_ + 1 > this._length) {
                throw "getUint8 error - Out of bounds";
            }
            return this._d_.getUint8(this._pos_++);
        }
        writeUint8(value) {
            this._ensureWrite(this._pos_ + 1);
            this._d_.setUint8(this._pos_, value);
            this._pos_++;
        }
        _getUInt8(pos) {
            return this._readUInt8(pos);
        }
        _readUInt8(pos) {
            return this._d_.getUint8(pos);
        }
        _getUint16(pos) {
            return this._readUint16(pos);
        }
        _readUint16(pos) {
            return this._d_.getUint16(pos, this._xd_);
        }
        _getMatrix() {
            return this._readMatrix();
        }
        _readMatrix() {
            let rst = new Laya.Matrix(this.getFloat32(), this.getFloat32(), this.getFloat32(), this.getFloat32(), this.getFloat32(), this.getFloat32());
            return rst;
        }
        _rUTF(len) {
            let v = "", max = this._pos_ + len, c, c2, c3, f = String.fromCharCode;
            let u = this._u8d_, i = 0;
            while (this._pos_ < max) {
                c = u[this._pos_++];
                if (c < 0x80) {
                    if (c != 0) {
                        v += f(c);
                    }
                }
                else if (c < 0xE0) {
                    v += f((c & 0x3F) << 6 | u[this._pos_++] & 0x7F);
                }
                else if (c < 0xF0) {
                    c2 = u[this._pos_++];
                    v += f((c & 0x1F) << 12 | (c2 & 0x7F) << 6 | u[this._pos_++] & 0x7F);
                }
                else {
                    c2 = u[this._pos_++];
                    c3 = u[this._pos_++];
                    v += f((c & 0x0F) << 18 | (c2 & 0x7F) << 12 | c3 << 6 & 0x7F | u[this._pos_++] & 0x7F);
                }
                i++;
            }
            return v;
        }
        getCustomString(len) {
            return this.readCustomString(len);
        }
        readCustomString(len) {
            let v = "", ulen = 0, c, c2, f = String.fromCharCode;
            let u = this._u8d_, i = 0;
            while (len > 0) {
                c = u[this._pos_];
                if (c < 0x80) {
                    v += f(c);
                    this._pos_++;
                    len--;
                }
                else {
                    ulen = c - 0x80;
                    this._pos_++;
                    len -= ulen;
                    while (ulen > 0) {
                        c = u[this._pos_++];
                        c2 = u[this._pos_++];
                        v += f(c2 << 8 | c);
                        ulen--;
                    }
                }
            }
            return v;
        }
        get pos() {
            return this._pos_;
        }
        set pos(value) {
            this._pos_ = value;
        }
        get bytesAvailable() {
            return this._length - this._pos_;
        }
        clear() {
            this._pos_ = 0;
            this.length = 0;
        }
        __getBuffer() {
            return this._d_.buffer;
        }
        writeUTFBytes(value) {
            value = "" + value + " ";
            for (let i = 0, sz = value.length; i < sz; i++) {
                let c = value.charCodeAt(i);
                if (c <= 0x7F) {
                    this.writeByte(c);
                }
                else if (c <= 0x7FF) {
                    this._ensureWrite(this._pos_ + 2);
                    this._u8d_.set([0xC0 | c >> 6, 0x80 | c & 0x3F], this._pos_);
                    this._pos_ += 2;
                }
                else if (c <= 0xFFFF) {
                    this._ensureWrite(this._pos_ + 3);
                    this._u8d_.set([0xE0 | c >> 12, 0x80 | c >> 6 & 0x3F, 0x80 | c & 0x3F], this._pos_);
                    this._pos_ += 3;
                }
                else {
                    this._ensureWrite(this._pos_ + 4);
                    this._u8d_.set([0xF0 | c >> 18, 0x80 | c >> 12 & 0x3F, 0x80 | c >> 6 & 0x3F, 0x80 | c & 0x3F], this._pos_);
                    this._pos_ += 4;
                }
            }
        }
        writeUTFString(value) {
            let tPos = this.pos;
            this.writeUint16(1);
            this.writeUTFBytes(value);
            let dPos = this.pos - tPos - 2;
            this._d_.setUint16(tPos, dPos, this._xd_);
        }
        readUTFString() {
            return this.readUTFBytes(this.getUint16());
        }
        getUTFString() {
            return this.readUTFString();
        }
        readUTFBytes(len = -1) {
            if (len === 0) {
                return "";
            }
            let lastBytes = this.bytesAvailable;
            if (len > lastBytes) {
                throw "readUTFBytes error - Out of bounds";
            }
            len = len > 0 ? len : lastBytes;
            return this._rUTF(len);
        }
        getUTFBytes(len = -1) {
            return this.readUTFBytes(len);
        }
        writeByte(value) {
            this._ensureWrite(this._pos_ + 1);
            this._d_.setInt8(this._pos_, value);
            this._pos_ += 1;
        }
        readByte() {
            if (this._pos_ + 1 > this._length) {
                throw "readByte error - Out of bounds";
            }
            return this._d_.getInt8(this._pos_++);
        }
        getByte() {
            return this.readByte();
        }
        _ensureWrite(lengthToEnsure) {
            if (this._length < lengthToEnsure) {
                this._length = lengthToEnsure;
            }
            if (this._allocated_ < lengthToEnsure) {
                this.length = lengthToEnsure;
            }
        }
        writeArrayBuffer(arraybuffer, offset = 0, length = 0) {
            if (offset < 0 || length < 0) {
                throw "writeArrayBuffer error - Out of bounds";
            }
            if (length == 0) {
                length = arraybuffer.byteLength - offset;
            }
            this._ensureWrite(this._pos_ + length);
            let uint8array = new Uint8Array(arraybuffer);
            this._u8d_.set(uint8array.subarray(offset, offset + length), this._pos_);
            this._pos_ += length;
        }
    }
    ByteEx.BIG_ENDIAN = "bigEndian";
    ByteEx.LITTLE_ENDIAN = "littleEndian";
    ByteEx._sysEndian = null;

    class DESTool {
        constructor() {
        }
        static init() {
            if (DESTool.lookup) {
                return;
            }
            DESTool.lookup = new Uint8Array(256);
            for (let i = 0; i < DESTool.chars.length; i++) {
                DESTool.lookup[DESTool.chars.charCodeAt(i)] = i * DESTool.offset;
            }
        }
        static encode(arraybuffer) {
            let bytes = new Uint8Array(arraybuffer), i, len = bytes["length"], base64 = "";
            for (let i = 0; i < len; i += 3) {
                base64 += DESTool.chars[(bytes[i] >> 2) + 4];
                base64 += DESTool.chars[((bytes[i] & 3) << 4 | bytes[i + 1] >> 4) + 2];
                base64 += DESTool.chars[((bytes[i + 1] & 15) << 2 | bytes[i + 2] >> 6) + 1];
                base64 += DESTool.chars[bytes[i + 2] & 63];
            }
            if (len % 3 === 2) {
                base64 = base64.substring(0, base64.length - 1) + "=";
            }
            else if (len % 3 === 1) {
                base64 = base64.substring(0, base64.length - 2) + "==";
            }
            return base64;
        }
        static encodeStr(str) {
            let byte;
            byte = new ByteEx();
            byte.writeUTFString(str);
            return DESTool.encodeByte(byte);
        }
        static encodeStr2(str) {
            let byte;
            byte = new ByteEx();
            byte.writeUTFBytes(str);
            return DESTool.encodeByte(byte);
        }
        static encodeByte(byte, start = 0, end = -1) {
            if (end < 0) {
                end = byte.length;
            }
            return DESTool.coding1() + DESTool.encode(byte.buffer.slice(start, end)) + DESTool.coding2();
        }
        static coding1() {
            let arr = ['A', 'B', 'C', 'D', 'E', 'F', 'a', 'H', 'I', 'J', '2', 'L', 'M', 'i', '6', 'P', 'Q', 'c', 'S', 'T', 'm', 'V', 'W', 'X', 'Y', 'Z'];
            let idvalue = '';
            let n = 2;
            for (let i = 0; i < n; i++) {
                idvalue += arr[Math.floor(Math.random() * 26)];
            }
            return idvalue + "ID";
        }
        static coding2() {
            let arr = ['0', 'L', '=', 'i', '6', 'P', '=', 'c', '=', 'T', 'p'];
            let idvalue = '';
            let n = 2;
            for (let i = 0; i < n; i++) {
                idvalue += arr[Math.floor(Math.random() * 11)];
            }
            return idvalue + "=";
        }
    }
    DESTool.chars1 = "ABCDEPQRSTFGHIJKLMNOUVWXYZabcdefghiopqrsjklmntuvwxyz0123456789+/";
    DESTool.chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstu0123456789vwxyz+/";
    DESTool.lookup = null;
    DESTool.offset = 22;

    class QuickShareView extends BaseView {
        constructor() {
            super();
            this.onStageResize();
        }
        init() {
            super.init();
        }
        get view() {
            return this._view;
        }
        createUI() {
            this._view = new MornUI.tvstart.QuickShareViewUI();
            this.addChild(this._view);
            super.initialize();
            this.view.label_score.text = FindModel.instance.addScore.toString();
            this.onTijiao();
            this.btnBackX = this.view.btn_back.x;
            if (GameUserInfo.instance.isTip == 1) {
                this.view.box_first.visible = false;
                this.view.box_second.visible = true;
            }
            else {
                this.view.box_first.visible = true;
                this.view.box_second.visible = false;
            }
        }
        destroy(destroyChild = true) {
            super.destroy(destroyChild);
        }
        addEvent() {
            super.addEvent();
            this.view.btn_sure.on(Laya.Event.CLICK, this, this.onSure);
            this.view.btn_again.on(Laya.Event.CLICK, this, this.onSure);
            this.view.btn_yitianxie.on(Laya.Event.CLICK, this, this.onYiTianXie);
            this.view.btn_back.on(Laya.Event.CLICK, this, this.onOpenStart);
        }
        onOpenStart() {
            if (SceneManager.intance.currSceneName == SceneType.M_SCENE_MAIN) {
                Signal.intance.event(GameEvent.EVENT_OPEN_MODULE, [ModuleName.TVStartView]);
                this.dispose();
            }
            else {
                SceneManager.intance.setCurrentScene(SceneType.M_SCENE_MAIN);
            }
        }
        onYiTianXie() {
            Signal.intance.event(GameEvent.EVENT_OPEN_MODULE, ModuleName.TravelCharpterDialog);
        }
        onSure(e) {
            Signal.intance.event(GameEvent.EVENT_OPEN_MODULE, [ModuleName.QuickEndView]);
        }
        onTijiao() {
            let delta = Laya.timer.delta;
            let sendCallBack = function (type) {
            };
            let _sendCallBack = sendCallBack;
            let score = FindModel.instance.addScore;
            let urlPrama = DESTool.encodeStr2(score.toString());
            let userAgent = Laya.Browser.userAgent;
            let frameRate = Laya.stage.frameRate;
            let d = new Date();
            let n = d.getTime();
            let url = Laya.Browser.window.location.href;
        }
        onStageResize() {
            this.view.btn_back.x = this.btnBackX - (Laya.stage.width - 640) / 2;
        }
        dispose() {
            super.dispose();
        }
        removeEvent() {
            super.removeEvent();
        }
    }

    class TVStartView extends BaseView {
        constructor() {
            super();
        }
        get view() {
            return this._view;
        }
        createUI() {
            this._view = new MornUI.tvstart.TVStartViewUI();
            this.addChild(this._view);
            this.onStageResize();
            this.initView();
        }
        addEvent() {
            this.view.btn_rank.clickHandler = new Laya.Handler(this, this.onClickBuy);
            this.view.btn_watch.clickHandler = new Laya.Handler(this, this.onClickWatch);
            this.view.btnSound.on(Laya.Event.CLICK, this, this.onSwitchMusic);
            this.view.btnSound.selected = !SoundMgr.instance.m_bPlayMusic;
        }
        onClickRank() {
            Signal.intance.event(GameEvent.EVENT_OPEN_MODULE, ModuleName.TVRankDialog);
        }
        onBtnChangeHead() {
            Signal.intance.event(GameEvent.EVENT_OPEN_MODULE, ModuleName.TVChangeHeadDialog);
        }
        onBtnChangeName() {
        }
        removeEvent() {
        }
        dispose() {
            Laya.Tween.clearAll(this);
            super.dispose();
        }
        initView() {
            this._storyID = GameUserInfo.instance.playerName;
            console.log("TVStartView.initView() FindModel.instance.tempAddCoin: " + FindModel.instance.tempAddCoin);
        }
        onClickWatch() {
            let spotInfo = new SpotInfo();
            spotInfo.Event = EnumAd.GAME_START;
            spotInfo.platform = 1;
            spotInfo.ad = 0;
            spotInfo.needUid = 1;
            spotInfo.type = "act";
            PlatFormManager.instance.sendCustumEvent(0, null, spotInfo);
            Signal.intance.event(GameEvent.EVENT_OPEN_MODULE, ModuleName.QuickTipDialog);
        }
        onClickSet() {
            Signal.intance.event(GameEvent.EVENT_OPEN_MODULE, ModuleName.GameSettingDialog);
        }
        onClickBuy() {
            Signal.intance.event(GameEvent.EVENT_OPEN_MODULE, ModuleName.TravelCharpterDialog);
        }
        onSwitchMusic() {
            SoundMgr.instance.m_bPlayMusic = !SoundMgr.instance.m_bPlayMusic;
        }
        onStageResize() {
            super.onStageResize();
        }
    }

    class EnumWorldMapDiffculty {
        constructor() {
        }
    }
    EnumWorldMapDiffculty.COIN = 0;
    EnumWorldMapDiffculty.FREE = 1;

    class TravelCharpterDialog extends BaseView {
        constructor(isSpecial = false) {
            super();
            this._isSpecial = isSpecial;
            this.onStageResize();
        }
        get view() {
            return this._view;
        }
        createUI() {
            this._view = new MornUI.travel.TravelCharpterDialogUI();
            this.addChild(this._view);
            this.initContainer();
            this.btnBackX = this.view.btn_back.x;
            this.btnShareX = this.view.btn_share.x;
        }
        initContainer() {
            this.view.list_charper.dataSource = [];
            this.view.list_charper.vScrollBarSkin = "";
            this.view.list_chapterDcy.selectHandler = Laya.Handler.create(this, this.onSelectDifficulty, null, false);
            let dp = [];
            dp.push({ "label": { "text": "| 本周排行 |" } });
            dp.push({ "label": { "text": "| 历史排行 |" } });
            this.view.list_chapterDcy.dataSource = dp;
            this.view.list_chapterDcy.selectedIndex = -1;
            this.callLater(this.selectChapterDcy);
        }
        selectChapterDcy() {
            this.view.list_chapterDcy.selectedIndex = 0;
        }
        addEvent() {
            this.view.btn_back.on(Laya.Event.CLICK, this, this.onOpenStart);
            this.view.btn_share.on(Laya.Event.CLICK, this, this.onShare);
        }
        onOpenStart() {
            if (SceneManager.intance.currSceneName == SceneType.M_SCENE_MAIN) {
                Signal.intance.event(GameEvent.EVENT_OPEN_MODULE, [ModuleName.TVStartView]);
                this.dispose();
            }
            else {
                SceneManager.intance.setCurrentScene(SceneType.M_SCENE_MAIN);
            }
        }
        onSelectDifficulty() {
            if (this.view.list_chapterDcy.selectedIndex == -1) {
                return;
            }
            let diffculty = 0;
            if (this.view.list_chapterDcy.selectedIndex == 1) {
                diffculty = EnumWorldMapDiffculty.FREE;
            }
            else {
                diffculty = EnumWorldMapDiffculty.COIN;
            }
            this.selectTab(diffculty);
            this.updateList(diffculty);
            this.view.list_charper.selectedIndex = -1;
        }
        selectTab(_index) {
            for (let i = 0; i < 2; i++) {
                let box = this.view.list_chapterDcy.getChildByName("").getChildByName("item" + i);
                let label = box.getChildByName("label");
                if (_index == i) {
                    label.filters = null;
                }
                else {
                    label.filters = [Quick.setColor("#595757")];
                }
            }
        }
        updateList(dic) {
            this.onTijiao(dic);
        }
        onTijiao(type) {
            console.log("TravelCharpterDialog.onTijiao type: " + type);
            let sendCallBack = function (datas) {
                if (type == 0) {
                    let myHumanItem = datas.shift();
                    let rankStr = myHumanItem.rank > 0 ? myHumanItem.rank.toString() : "未上榜";
                    this.view.label_my.text = "我的最高比赛分数：" + myHumanItem.gameScore + "，助力人数：" + myHumanItem.votenum + "\n本周总分：" + myHumanItem.score + "，游戏排名：" + rankStr;
                    if (myHumanItem.tip != null && myHumanItem.tip != "") {
                        this.view.label_date.text = "(" + myHumanItem.tip + ")";
                    }
                }
                this.view.list_charper.dataSource = datas;
            };
            let _sendCallBack = sendCallBack;
        }
        onStageResize() {
            this.view.btn_back.x = this.btnBackX - (Laya.stage.width - 640) / 2;
            this.view.btn_share.x = this.btnShareX + (Laya.stage.width - 640) / 2;
        }
        removeEvent() {
            super.removeEvent();
        }
        destroy(destroyChild = true) {
            super.destroy();
        }
        onShare(e) {
            this.view.btn_share.disabled = true;
            let helpCallBack = function (type) {
                if (type > 0) {
                    Laya.timer.clear(this, this.hideBoxTip);
                    this.view.box_tip.visible = true;
                    this.view.arrowAni.play();
                    Laya.timer.once(3000, this, this.hideBoxTip);
                }
                else {
                    this.view.btn_share.disabled = false;
                }
            };
            let _helpCallBack = helpCallBack;
        }
        hideBoxTip() {
            this.view.box_tip.visible = false;
            this.view.arrowAni.stop();
            this.view.btn_share.disabled = false;
        }
    }

    class FindScene extends BaseScene {
        constructor(URL, isCanDrag = true, data = null) {
            super(URL, isCanDrag);
            this.goodsId = data;
        }
        init() {
            this.m_SceneResource = "FindScene";
            super.init();
            FindModel.instance.init();
        }
        onLoaded() {
            this.addEvent();
            Signal.intance.event(GameEvent.EVENT_OPEN_MODULE, [ModuleName.FindView, this.goodsId]);
            Signal.intance.event(GameEvent.EVENT_OPEN_MODULE, [ModuleName.QuickOperatorDialog]);
        }
        onAdded(data) {
            if (data instanceof FindView) {
                this.findView = data;
                if (this.startView) {
                    this.startView.dispose();
                    this.startView = null;
                }
                if (this.travelCharpterDialog) {
                    this.travelCharpterDialog.dispose();
                    this.travelCharpterDialog = null;
                }
            }
            else if (data instanceof TVStartView) {
                this.startView = data;
                if (this.travelCharpterDialog) {
                    this.travelCharpterDialog.dispose();
                    this.travelCharpterDialog = null;
                }
            }
            else if (data instanceof TravelCharpterDialog) {
                this.travelCharpterDialog = data;
                if (this.startView) {
                    this.startView.dispose();
                    this.startView = null;
                }
                if (this.quickEndView) {
                    this.quickEndView.dispose();
                    this.quickEndView = null;
                }
            }
            else if (data instanceof QuickEndView) {
                this.quickEndView = data;
            }
            else if (data instanceof QuickShareView) {
                this.quickShareView = data;
            }
        }
        addEvent() {
            super.addEvent();
            Signal.intance.on(GameEvent.EVENT_MODULE_ADDED, this, this.onAdded);
            Signal.intance.on(FindEvent.EVENT_AGAIN, this, this.onFindAgain);
            Signal.intance.on(GameEvent.EVENT_RECHARGED_TIP, this, this.onRecharged);
        }
        onFindAgain(datas) {
            console.log("FindScene.onFindAgain(datas)", FindModel.instance._sX, FindModel.instance._sY, FindModel.instance._sZ);
            if (this.findView) {
                this.findView.dispose();
                this.findView = null;
            }
            Signal.intance.event(GameEvent.EVENT_OPEN_MODULE, [ModuleName.TVStartView]);
        }
        removeEvent() {
            super.removeEvent();
            Signal.intance.off(GameEvent.EVENT_MODULE_ADDED, this, this.onAdded);
            Signal.intance.off(FindEvent.EVENT_AGAIN, this, this.onFindAgain);
            Signal.intance.off(GameEvent.EVENT_RECHARGED_TIP, this, this.onRecharged);
        }
        onRecharged() {
            NoticeMgr.instance.notice(GameLanguageMgr.instance.getConfigLan(10009));
        }
        dispose() {
            if (this.startView) {
                this.startView.dispose();
                this.startView = null;
            }
            if (this.travelCharpterDialog) {
                this.travelCharpterDialog.dispose();
                this.travelCharpterDialog = null;
            }
            if (this.findView) {
                this.findView.dispose();
                this.findView = null;
            }
            if (this.quickEndView) {
                this.quickEndView.dispose();
                this.quickEndView = null;
            }
            if (this.quickShareView) {
                this.quickShareView.dispose();
                this.quickShareView = null;
            }
            this.goodsId = 0;
            super.dispose();
        }
    }

    class PreLoadScene extends BaseScene {
        constructor(URL, isCanDrag = false) {
            super(URL, isCanDrag);
            this.isResDispose = false;
        }
        init() {
            this.m_SceneResource = "PreLoadScene";
            super.init();
        }
        onLoaded() {
            Signal.intance.on(GameEvent.EVENT_MODULE_ADDED, this, this.onAdded);
            Signal.intance.event(GameEvent.EVENT_OPEN_MODULE, [ModuleName.PreLoadingView]);
        }
        onAdded(data) {
            if (data instanceof PreLoadingView) {
                this.m_preLoadView = data;
            }
        }
        dispose() {
            if (this.m_preLoadView) {
                this.m_preLoadView.dispose();
                this.m_preLoadView = null;
            }
            super.dispose();
        }
    }

    class TransFerManager {
        constructor() {
        }
        static get instance() {
            if (TransFerManager._instance == null) {
                TransFerManager._instance = new TransFerManager();
            }
            return TransFerManager._instance;
        }
        transFerSence(functionId, data = null, type = 1) {
            functionId = parseInt(String(functionId));
            let systemOpenVO = GlobalDataManager.instance.systemOpenModel.m_dicSystemInfoCfg.get(functionId);
            let subSystemOpenVO;
            let subFunctionID = 1;
            if (systemOpenVO && systemOpenVO.openUI > 0) {
                functionId = parseInt(String(systemOpenVO.openUI));
                subFunctionID = parseInt(String(systemOpenVO.functionID));
                subSystemOpenVO = GlobalDataManager.instance.systemOpenModel.m_dicSystemInfoCfg.get(subFunctionID);
            }
            let unLockSystemOpenVO;
            if (subSystemOpenVO && subSystemOpenVO.open_type > 0) {
                unLockSystemOpenVO = subSystemOpenVO;
            }
            else if (systemOpenVO && systemOpenVO.open_type > 0) {
                unLockSystemOpenVO = systemOpenVO;
            }
            if (unLockSystemOpenVO) {
                let isOpen = GlobalDataManager.instance.systemOpenModel.isOpen(unLockSystemOpenVO.functionID);
                if (!isOpen && GameSetting.buildClickState == false) {
                    let lock_word = parseInt(unLockSystemOpenVO.lock_word);
                    if (lock_word) {
                        NoticeMgr.instance.notice(GameLanguageMgr.instance.getConfigLan(lock_word));
                    }
                    return;
                }
            }
            if ((systemOpenVO && systemOpenVO.click_effect != "") && systemOpenVO.click_effect != "0") {
                SoundMgr.instance.playSoundByName(systemOpenVO.click_effect);
            }
            switch (functionId) {
                case 6001:
                    {
                        if (data + "" == "monthCard") {
                            Signal.intance.event(GameEvent.EVENT_OPEN_MODULE, [ModuleName.RechargeDialog, "monthCard"]);
                        }
                        else {
                            let selectVip = true;
                            if (data && data == "2") {
                                selectVip = false;
                            }
                            Signal.intance.event(GameEvent.EVENT_OPEN_MODULE, [ModuleName.RechargeDialog, selectVip]);
                        }
                    }
                    break;
                case 2201:
                    {
                        Signal.intance.event(GameEvent.EVENT_OPEN_MODULE, [ModuleName.FirstRechargeDialog, true]);
                    }
                    break;
                case 2205:
                    {
                        Signal.intance.event(GameEvent.EVENT_OPEN_MODULE, [ModuleName.FirstWeekRechargeView, true]);
                    }
                    break;
                case 2105:
                    {
                        SceneManager.intance.setCurrentScene(SceneType.M_SCENE_SUIT, true);
                    }
                    break;
                case 600009:
                    {
                        this.clickPlutPower();
                    }
                    break;
                case 600011:
                    {
                        this.clickFlyBtn();
                    }
                    break;
                case 600012:
                    {
                        this.buyGoldBtn();
                    }
                    break;
                case 7003:
                    {
                        SceneManager.intance.setCurrentScene(SceneType.M_SCENE_HOME, false);
                    }
                    break;
                case 2003:
                    {
                        ModuleManager.intance.openModule(ModuleName.OnlineAward);
                    }
                    break;
                case 1017:
                    {
                        Signal.intance.event(GameEvent.EVENT_OPEN_MODULE, ModuleName.InvitationCenterDialog);
                    }
                    break;
                case 2204:
                    {
                        Signal.intance.event(GameEvent.EVENT_OPEN_MODULE, ModuleName.DailyTaskDialog);
                    }
                    break;
                case 2103:
                    {
                        ModuleManager.intance.openModule(ModuleName.AchievementDialog);
                    }
                    break;
                case 5008:
                    {
                        ModuleManager.intance.openModule(ModuleName.ActivityCheckinDialog);
                    }
                    break;
                case 9021:
                    {
                        ModuleManager.intance.openModule(ModuleName.ActiveCheckInDialog);
                    }
                    break;
                case 9003:
                    {
                        ModuleManager.intance.openModule(ModuleName.ActiveRechargeView);
                    }
                    break;
                case 9002:
                    {
                        ModuleManager.intance.openModule(ModuleName.SmallSaleView);
                    }
                    break;
                case 9009:
                    {
                        Signal.intance.event(GameEvent.EVENT_OPEN_MODULE, ModuleName.ActivityTaskDialog);
                    }
                    break;
                case 9011:
                    {
                        Signal.intance.event(GameEvent.EVENT_OPEN_MODULE, [ModuleName.SlotMachineView, data]);
                    }
                    break;
                case 7003:
                    {
                        SceneManager.intance.setCurrentScene(SceneType.M_SCENE_HOME, false);
                    }
                    break;
                case 9010:
                    {
                        ModuleManager.intance.openModule(ModuleName.FBLikeView);
                    }
                    break;
                case 9013:
                    {
                        ModuleManager.intance.openModule(ModuleName.AddRechargeView);
                    }
                    break;
                case 9020:
                    break;
                default:
                    break;
            }
        }
        onEnterAnswer() {
        }
        clickPlutPower() {
        }
        buyTiCallBack(callBack) {
            LoadingManager.instance.showLoading();
        }
        clickFlyBtn() {
        }
        buyFlycallBack(callBack) {
            LoadingManager.instance.showLoading();
        }
        buyGoldBtn() {
            Signal.intance.event(GameEvent.EVENT_OPEN_MODULE, [ModuleName.GetMoreDialog]);
        }
    }

    class BaseUI extends Laya.Box {
        constructor() {
            super();
            this.m_arrMapEvent = [];
            Laya.stage.on(Laya.Event.RESIZE, this, this.onStageResize);
        }
        onStageResize() {
            LayerManager.instence.setPosition(this, 0, 0, 0);
        }
        preinitialize() {
            Laya.stage.on(Laya.Event.RESIZE, this, this.onStageResize);
            super.preinitialize();
            this.init();
        }
        init() {
        }
        createChildren() {
            super.createChildren();
            this.createUI();
        }
        createUI() {
        }
        initialize() {
            super.initialize();
            this._addEvent();
            this.initData();
            this.onLoaded();
        }
        _addEvent() {
            this.addEvent();
        }
        addEvent() {
        }
        initData() {
        }
        onLoaded() {
        }
        removeEvent() {
        }
        addMapEvent(target, type, caller, listener, args = null) {
            target.on(type, caller, listener, args);
            this.m_arrMapEvent.push(target);
        }
        removeAllMapEvent() {
            if (!this.m_arrMapEvent) {
                return;
            }
            for (let i = 0; i < this.m_arrMapEvent.length; i++) {
                this.m_arrMapEvent[i].offAll();
            }
            this.m_arrMapEvent.splice(0, this.m_arrMapEvent.length);
        }
        setAnchor(anchorX = 0.5, anchorY = 0.5) {
            this.anchorX = anchorX;
            this.anchorY = anchorY;
        }
        destroy(destroyChild = true) {
            this.removeEvent();
            this.removeAllMapEvent();
            ModuleManager.intance.removeViewFromModuleManger(this);
            Laya.stage.off(Laya.Event.RESIZE, this, this.onStageResize);
            this.m_arrMapEvent = null;
            super.destroy(destroyChild);
            if (this._view) {
                this._view.destroy();
                this._view = null;
            }
        }
        sendData(commandID, data = null, _callBackHandler = null, _isShowLoding = true) {
            if (data == null) {
                data = [];
            }
        }
    }

    class PrayTimeView extends BaseUI {
        constructor() {
            super();
        }
        createUI() {
            this._view = new MornUI.MainView.PrayTimeViewUI();
            this.addChild(this._view);
            this.updateInfo();
        }
        get view() {
            return this._view;
        }
        updateInfo() {
        }
        destroy(destroyChild = true) {
            super.destroy(destroyChild);
        }
        onActTimer(e) {
            let v = e.values;
            for (let obj of v) {
                if (obj.id == 1005) {
                    this.showTime(obj.end);
                }
            }
        }
        showTime(t) {
            this.view.timeLeft.text = TimeUtil.format(t);
        }
        addEvent() {
            super.addEvent();
        }
        removeEvent() {
            super.removeEvent();
        }
    }

    class StoreTimeView extends BaseUI {
        constructor() {
            super();
        }
        createUI() {
            this._view = new MornUI.MainView.StoreTimeViewUI();
            this.addChild(this._view);
            this.updateInfo();
        }
        get view() {
            return this._view;
        }
        updateInfo() {
        }
        countTime() {
        }
        destroy(destroyChild = true) {
            Laya.timer.clear(this, this.countTime);
            super.destroy(destroyChild);
        }
        onFocus() {
            this.sendData(30, null);
        }
        addEvent() {
            Signal.intance.on(GameEvent.STAGE_ON_FOCUS, this, this.onFocus);
            super.addEvent();
        }
        removeEvent() {
            Signal.intance.off(GameEvent.STAGE_ON_FOCUS, this, this.onFocus);
            super.removeEvent();
        }
    }

    class BuildFunSp {
        constructor() {
            this.isInit = false;
            this.buildFunChild = { 1003: [1003, 1002, 9004] };
            this.isGuideTravel = false;
            this.isGuidePray = false;
        }
        initbuilding(data, _mainView) {
            this.mainView = _mainView;
            this._buildInfo = data;
            this.functionId = data.functionID;
            this.initData(data);
            if (!data.building_wh) {
                return;
            }
            let ary = data.building_wh;
            if (GameSetting.isPC && data.building_whweb) {
                ary = data.building_whweb;
            }
            this.view.on(Laya.Event.MOUSE_DOWN, this, this.mouseDownEvent);
            this.view.on(Laya.Event.CLICK, this, this.clickEvent);
            Laya.stage.on(Laya.Event.MOUSE_UP, this, this.mouseUpEvent);
            this.isInit = true;
            this.view.mouseThrough = true;
        }
        initData(value) {
            this._buildInfo = value;
            let className = "build" + value.functionID;
            this.view = this.mainView[className];
            this.view.alpha = 0;
            this.view.mouseThrough = (this.view["mcBuild"].mouseThrough = true);
            let hitArea = new Laya.HitArea();
            hitArea.hit = this.view["mcBuild"].graphics;
            this.view.hitArea = hitArea;
            if (this.functionId == "1002") {
                this.addStoreTimeView();
            }
            else if (this.functionId == "1005") {
                this.checkPrayState();
            }
            if ((this.functionId != "1005" && this._buildInfo) && parseInt(this._buildInfo.if_open + "") != 1) {
                this.updateWordFont();
            }
            this.updateState();
            this.changeRedPoint();
            Laya.timer.once(200, this, this.loadEffect);
        }
        onLoaded(tex) {
        }
        updateWordFont() {
            if (this.fontBox) {
                return;
            }
            let className = "word" + this.functionId;
            this.fontBox = this.mainView[className];
            this.redPoint = this.fontBox.mcRedPoint;
            this.worldDi = this.fontBox.worldDi;
            this.nameTF = this.fontBox.txtName;
            let nameStr = GameLanguageMgr.instance.getConfigLan(this.buildInfo.function_name);
            nameStr = nameStr.toLocaleUpperCase();
            this.nameTF.text = nameStr;
            let pos = this._buildInfo.building_name_coordnate;
            if (GameSetting.isPC) {
                pos = this._buildInfo.building_name_coordnateweb;
            }
            if (!pos) {
                return;
            }
            this.worldDi.width = this.nameTF.width + 40;
            this.redPoint.x = this.worldDi.width - this.redPoint.width;
            if (this.functionId == "1015" || this.functionId == "1016") {
                if (!this.actTips) {
                    this.actTips = new MornUI.DiamondAnswer.BuildingTipsUI();
                    if (this.functionId == "1015" || this.functionId == "1016") {
                        this.actTips.txt_name.visible = false;
                        this.actTips.txt_time.y -= 14;
                        this.actTips.txt_time.fontSize = 20;
                    }
                }
                this.actTips.x = this.fontBox.width / 2;
                this.actTips.y = 0;
                this.fontBox.addChild(this.actTips);
                this.actTips.visible = false;
                Laya.timer.loop(1000, this, this.onLoop);
            }
        }
        onLoop() {
            let open = GlobalDataManager.instance.systemOpenModel.isOpen(this.functionId);
            if (!open) {
                if (this.actTips) {
                    this.actTips.visible = false;
                }
                return;
            }
            let timeStr = "";
            switch (this.functionId) {
                case "1015":
                    {
                        this.actTips.visible = false;
                        break;
                        ;
                    }
                    break;
                case "1016":
                    {
                        break;
                        ;
                    }
                    break;
                default:
                    {
                        return;
                    }
                    break;
            }
        }
        changeRedPoint() {
            if (this._buildInfo) {
                let vis;
                let funID = this._buildInfo.functionID;
                if (this.buildFunChild.hasOwnProperty(parseInt(funID + ""))) {
                    let childFuns = this.buildFunChild[parseInt(funID + "")];
                    for (let childFunId of childFuns) {
                        vis = GlobalDataManager.instance.systemOpenModel.hasRedState(childFunId + "");
                        if (vis) {
                            break;
                        }
                    }
                }
                else {
                    vis = GlobalDataManager.instance.systemOpenModel.hasRedState(funID + "");
                }
                if (this.redPoint) {
                    this.redPoint.visible = vis;
                }
            }
        }
        loadEffect() {
            return;
            if (window["PlatformClass"] || GameSetting.m_bInstantGame) {
                return;
            }
            let jsons = GameResourceManager.instance.getResByURL("config/sceneEfc.json");
            let effects;
            if (jsons && jsons.hasOwnProperty(this.functionId)) {
                if (this.functionId == "1008") {
                    return;
                }
            }
        }
        removeEffect() {
            if (this.effectMc) {
                this.effectMc.destory();
                this.effectMc = null;
            }
        }
        clickEvent(e) {
            if (this.isOpen || GameSetting.buildClickState) {
                if (SceneManager.intance.dragging == false) {
                    if (this.isGuideTravel) {
                        Signal.intance.event(GameEvent.EVENT_OPEN_MODULE, [ModuleName.TravelCharpterDialog, this.isGuideTravel]);
                        this.isGuideTravel = false;
                    }
                    else if (this.isGuidePray) {
                        TransFerManager.instance.transFerSence(parseInt(this.functionId), 3);
                        this.isGuidePray = false;
                    }
                    else {
                        if (parseInt(this.functionId) == 1009) {
                            return;
                        }
                        TransFerManager.instance.transFerSence(parseInt(this.functionId));
                    }
                }
                else {
                    console.log("BuildFunSp.clickEvent(e) 当前状态是拖动");
                }
            }
        }
        imgHandler(data) {
        }
        mouseUpEvent() {
            if (this.isOpen) {
                this.view.alpha = 0;
            }
        }
        mouseDownEvent(e) {
            if (this.isOpen) {
                this.view.alpha = 0.5;
            }
        }
        destroy(destroyChild = true) {
            Laya.timer.clearAll(this);
            if (this.actTips) {
                this.actTips.destroy();
                this.actTips.removeSelf();
            }
            if (this.view) {
                this.view.destroy(true);
                this.view.removeSelf();
            }
            Laya.Tween.clearAll(this._storeTimeView);
            Laya.Tween.clearAll(this._prayTimeView);
            if (this._storeTimeView) {
                this._storeTimeView.destroy(destroyChild);
                this._storeTimeView.removeSelf();
                this._storeTimeView = null;
            }
            this._buildInfo = null;
            this.removePrayTimeView(destroyChild);
            this.removeEffect();
            if (this.fontBox) {
                this.fontBox.destroy(destroyChild);
                this.fontBox.removeSelf();
                this.fontBox = null;
            }
            if (this.worldDi) {
                this.worldDi.destroy(destroyChild);
            }
            if (this.nameTF) {
                this.nameTF.destroy(destroyChild);
            }
            if (this.openTF) {
                this.openTF.destroy(destroyChild);
            }
            if (this.openDi) {
                this.openDi.destroy(destroyChild);
            }
            if (this.redPoint) {
                this.redPoint.destroy(destroyChild);
            }
            this.view.off(Laya.Event.MOUSE_DOWN, this, this.mouseDownEvent);
            this.view.off(Laya.Event.CLICK, this, this.clickEvent);
            Laya.stage.off(Laya.Event.MOUSE_UP, this, this.mouseUpEvent);
            this.view.graphics.destroy();
            this.mainView = null;
        }
        get buildInfo() {
            return this._buildInfo;
        }
        addStoreTimeView() {
            if (this._storeTimeView == null) {
                this._storeTimeView = new StoreTimeView();
                this.changeXY();
                this.mainView.addChild(this._storeTimeView);
                this.tweenStore();
            }
        }
        changeXY() {
            if (this._storeTimeView) {
                this._storeTimeView.x = this.view.width / 2 - this._storeTimeView.width / 2 + 57 + this.view.x;
                this._storeTimeView.y = this.view.height / 2 - this._storeTimeView.height - 10 + this.view.y;
            }
            if (this._prayTimeView) {
                this._prayTimeView.x = this.view.width / 2 - this._prayTimeView.width / 2 + 0 + this.view.x;
                this._prayTimeView.y = this.view.height / 2 - this._prayTimeView.height / 2 + 0 + this.view.y;
            }
        }
        tweenStore() {
            Laya.Tween.clearAll(this._storeTimeView);
            Laya.Tween.to(this._storeTimeView, { y: this._storeTimeView.y + 10 }, 1000, null, new Laya.Handler(this, this.tweenStoreBack));
        }
        tweenStoreBack() {
            Laya.Tween.clearAll(this._storeTimeView);
            Laya.Tween.to(this._storeTimeView, { y: this._storeTimeView.y - 10 }, 1000, null, new Laya.Handler(this, this.tweenStore));
        }
        changeState(funId, state) {
            if (state) {
                if (funId == 1005) {
                    this.addPrayTimeView();
                }
            }
            else {
                if (funId == 1005) {
                    this.removePrayTimeView();
                }
            }
        }
        checkPrayState() {
        }
        addPrayTimeView() {
            if (this._prayTimeView == null) {
                this._prayTimeView = new PrayTimeView();
                this.changeXY();
                this.mainView.addChild(this._prayTimeView);
                this.tweenPray();
            }
        }
        removePrayTimeView(destroyChild = true) {
            if (this._prayTimeView) {
                Laya.Tween.clearAll(this._prayTimeView);
                if (this._prayTimeView) {
                    this._prayTimeView.destroy(destroyChild);
                    this._prayTimeView.removeSelf();
                    this._prayTimeView = null;
                }
            }
        }
        tweenPray() {
            Laya.Tween.clearAll(this._prayTimeView);
            Laya.Tween.to(this._prayTimeView, { y: this._prayTimeView.y + 10 }, 1000, null, new Laya.Handler(this, this.tweenPrayBack), 0, true);
        }
        tweenPrayBack() {
            Laya.Tween.clearAll(this._prayTimeView);
            Laya.Tween.to(this._prayTimeView, { y: this._prayTimeView.y - 10 }, 1000, null, new Laya.Handler(this, this.tweenPray), 0, true);
        }
        setOpenStateTip() {
            if (this.openDi) {
                return;
            }
            if ((this.fontBox && !this.isOpen) && parseInt(this.buildInfo.lock_word) > 0) {
                this.openDi = new Laya.Image();
                this.openDi.skin = "common/common_bg/img_0016.png";
                this.openDi.sizeGrid = "10,20,10,20";
                this.openDi.anchorX = 0.5;
                this.openDi.anchorY = 0.5;
                this.fontBox.addChild(this.openDi);
                this.openDi.pos(this.worldDi.x, this.worldDi.y + this.worldDi.height - 6);
                this.openTF = new Laya.Label();
                this.openTF.color = "#ffffff";
                this.openTF.font = "Microsoft YaHei";
                this.openTF.fontSize = 14;
                this.openTF.anchorX = (this.openTF.anchorY = 0.5);
                this.openTF.text = GameLanguageMgr.instance.getConfigLan(this.buildInfo.lock_word);
                this.openDi.width = this.openTF.width + 30;
                this.openDi.height = this.openTF.height + 14;
                this.openDi.addChild(this.openTF);
                this.openTF.mouseEnabled = false;
                this.openTF.pos(this.openDi.width / 2, this.openDi.height / 2 - 5);
            }
            else {
                if (this.buildInfo && parseInt(this.buildInfo.functionID + "") == 1015) {
                    if (!this.openTF) {
                        this.openTF = new Laya.Label();
                        this.openTF.color = "#ffffff";
                        this.openTF.font = "Microsoft YaHei";
                        this.openTF.fontSize = 14;
                        this.openTF.anchorX = (this.openTF.anchorY = 0.5);
                        this.openDi = new Laya.Image();
                        this.openDi.skin = "common/common_bg/img_0016.png";
                        this.openDi.sizeGrid = "10,20,10,20";
                        this.openTF.strokeColor = "#000000";
                        this.openTF.stroke = 2;
                        this.openDi.anchorX = 0.5;
                        this.openDi.anchorY = 0.5;
                        this.fontBox.addChild(this.openDi);
                        this.openDi.pos(this.worldDi.x, this.worldDi.y + this.worldDi.height - 6);
                        this.openDi.width = this.openTF.width + 30;
                        this.openDi.height = this.openTF.height + 14;
                        this.openDi.addChild(this.openTF);
                        this.openTF.mouseEnabled = false;
                        this.openTF.pos(this.openDi.width / 2, this.openDi.height / 2 - 5);
                    }
                    this.openTF.visible = true;
                    this.openTF.text = GameLanguageMgr.instance.getLanguage(5305);
                }
                else {
                    if (this.openTF) {
                        this.openTF.visible = false;
                    }
                }
            }
        }
        updateState() {
            if (!GlobalDataManager.instance.systemOpenModel.isOpen(parseInt(this.functionId))) {
                this.isOpen = false;
                if (this.functionId == "1005_1" && GlobalDataManager.instance.systemOpenModel.isOpen(1005)) {
                    this.view.mouseEnabled = true;
                    this.isOpen = true;
                }
            }
            else {
                this.isOpen = true;
                this.view.mouseEnabled = true;
                this.view.filters = null;
                if (this.worldDi) {
                    this.worldDi.visible = true;
                    this.nameTF.visible = true;
                }
            }
            if (!this.isOpen) {
                if (!this.view) {
                    console.log(this.functionId);
                }
                else {
                    this.view.alpha = 0.7;
                }
            }
            else {
                this.view.alpha = 0;
            }
            if (this.functionId != "1008") {
                this.setOpenStateTip();
            }
        }
        canGuide() {
            if (this.isInit) {
                return this;
            }
            return null;
        }
        canGuideTravel() {
            if (this.isInit) {
                this.isGuideTravel = true;
                return this;
            }
            return null;
        }
        canGuidePray() {
            if (this.isInit) {
                this.isGuidePray = true;
                return this;
            }
            return null;
        }
    }

    class FunctionRedStateVo {
        constructor() {
            this.redState = 0;
        }
    }

    class MainSceneNet {
        constructor() {
            this._inited = false;
        }
        static getInstance() {
            if (!MainSceneNet._instance) {
                MainSceneNet._instance = new MainSceneNet();
            }
            return MainSceneNet._instance;
        }
        init() {
            if (!this._inited) {
                this._inited = true;
                Signal.intance.on("msg_393", this, this.onReceiveRedHot);
            }
        }
        requestRedHot() {
        }
        onReceiveRedHot(value) {
            let map = GlobalDataManager.instance.systemOpenModel.redHotStateMap;
            for (let info of value[0]) {
                let vo = map.get(value[0]);
                if (!vo) {
                    vo = new FunctionRedStateVo();
                    vo.funId = info[0];
                    map.set(info[0] + "", vo);
                }
                vo.redState = info[1];
            }
            Signal.intance.event(GameEvent.UPDATE_RED_STATE_EVENT);
        }
    }

    class SystemOpenVO {
        constructor() {
            this.readState = 0;
            this.weight = 0;
        }
    }

    class AirShipView extends BaseUI {
        constructor() {
            super();
        }
        get view() {
            return this._view;
        }
        createUI() {
            this._view = new MornUI.MainView.AirshipViewUI();
            this.addChild(this._view);
            this.view.mouseEnabled = (this.view.sp_ship.mouseEnabled = true);
            this.view.sp_ship.on(Laya.Event.CLICK, this, this.onClick);
            this.view.img_icon.graphics.clear();
            this.view.img_icon.skin = "";
            this.view.sp_btn.pivotX = 79.5;
            this.refresh();
        }
        refresh() {
            return;
        }
        onClick() {
        }
        set scaleX(value) {
            super.scaleX = value;
            this.view.sp_btn.scaleX = value;
        }
        destroy(destroyChild = true) {
            super.destroy(destroyChild);
        }
    }

    class MainButtonUIView extends BaseView {
        constructor() {
            super(...arguments);
            this.isGuideGo = false;
        }
        get view() {
            return this._view;
        }
        destroy(destroyChild = true) {
            this.dispose();
            super.destroy(destroyChild);
        }
        dispose() {
            if (this.view == null) {
                return;
            }
            Signal.intance.off(GameEvent.REFRESH_MAIN_TASK, this, this.updateTaskItem);
            super.dispose();
        }
        createUI() {
            if (GameSetting.m_bIsIphoneX) {
                this.m_ioffsetY = -GameSetting.IPHONEX_BUTTOM;
            }
            this._view = new MornUI.MainView.MainButtomViewUI();
            this.addChild(this._view);
            this.mouseThrough = (this._view.mouseThrough = true);
            if (GameSetting.isPC) {
                this.m_iPositionType = LayerManager.RIGHTDOWN;
            }
            else {
                this.m_iPositionType = LayerManager.DOWN;
                this.view.mcBg.width = LayerManager.instence.m_iStageWidth;
            }
            this.onStageResize();
            this.initBtnBox();
            this.updateTaskItem();
            this.view.btn1.clickHandler = new Laya.Handler(this, this.onClickHandler, [this.view.btn1]);
            this.view.btn2.clickHandler = new Laya.Handler(this, this.onClickHandler, [this.view.btn2]);
            this.view.btn3.clickHandler = new Laya.Handler(this, this.onClickHandler, [this.view.btn3]);
            this.view.btn4.clickHandler = new Laya.Handler(this, this.onClickHandler, [this.view.btn4]);
            this.view.btn5.clickHandler = new Laya.Handler(this, this.onClickHandler, [this.view.btn5]);
            this.view.btn6.clickHandler = new Laya.Handler(this, this.onClickHandler, [this.view.btn6]);
            this.view.btn7.clickHandler = new Laya.Handler(this, this.onClickHandler, [this.view.btn7]);
            Signal.intance.on(GameEvent.REFRESH_MAIN_TASK, this, this.updateTaskItem);
        }
        onClickHandler(btn) {
            switch (btn) {
                case this.view.btn1:
                    {
                        NoticeMgr.instance.notice("暂未开放");
                    }
                    break;
                default:
                    {
                        NoticeMgr.instance.notice("暂未开放");
                    }
                    break;
            }
        }
        initBtnBox() {
        }
        get isLikeTask() {
            return (this.maintaskInfo.id.toString() == "20001" || this.maintaskInfo.id.toString() == "20002") || this.maintaskInfo.script == "like";
        }
        updateTaskItem() {
        }
        addRewardData(data) {
            let newData;
            if (!((data[0] == "" || parseInt(data[0] + "") == 0) || parseInt(data[0][1] + "") == 0)) {
                newData = data;
            }
            return newData;
        }
        goDoTask() {
        }
        initRewardList() {
            let rewards = [];
            let exps = this.addRewardData(this.maintaskInfo.exp);
            if (exps) {
                rewards = rewards.concat(exps);
            }
            let moneys = this.addRewardData(this.maintaskInfo.money);
            if (moneys) {
                rewards = rewards.concat(moneys);
            }
            let items = this.addRewardData(this.maintaskInfo.item);
            if (items) {
                rewards = rewards.concat(items);
            }
            let taminas = this.addRewardData(this.maintaskInfo.tamina);
            if (taminas) {
                rewards = rewards.concat(taminas);
            }
            let data = [];
            for (let i = 0; i < rewards.length; i++) {
                let obj = {};
                let itemVo = new ItemVo(rewards[i][0]);
                obj["mcIcon"] = itemVo.getIconURL;
                obj["txtNum"] = "+" + rewards[i][1];
                data.push(obj);
            }
        }
        Guide830() {
            return null;
        }
    }

    class MainIconView extends MornUI.MainView.MainIconViewUI {
        createView(uiView) {
            super.createView(uiView);
            this.mouseThrough = (uiView.mouseThrough = true);
            let str = this.txtName.text;
            this.mcIcon.on(Laya.Event.CLICK, this, this.clickEvent);
            this.mcIcon.on(Laya.Event.MOUSE_DOWN, this, this.onMouseEvent);
            Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onMouseUpEvent);
            Signal.intance.on(GameEvent.UPDATE_RED_STATE_EVENT, this, this.changeRedPoint);
        }
        get systemInfo() {
            return this._systemInfo;
        }
        set systemInfo(value) {
            this._systemInfo = value;
            this.changeRedPoint();
            this.mcIcon.skin = GameResourceManager.instance.getMianSysIcon(this.systemInfo.functionID);
            this.txtName.text = GameLanguageMgr.instance.getConfigLan(this.systemInfo.function_name);
        }
        changeRedPoint() {
            if (this._systemInfo) {
                this.mcRedPoint.visible = GlobalDataManager.instance.systemOpenModel.hasRedState(this._systemInfo.functionID + "");
            }
        }
        recieveTimeGift() {
        }
        addTimeLabel() {
            if (this.m_timeLabel == null) {
                this.m_timeLabel = new Laya.Label();
                this.addChild(this.m_timeLabel);
                this.m_timeLabel.fontSize = this.txtName.fontSize;
                if (this.txtName.text.length > 13) {
                    this.txtName.fontSize = this.txtName.fontSize - 1;
                }
                this.m_timeLabel.color = "#ffffff";
                this.m_timeLabel.y = this.txtName.y + this.txtName.height / 2 + 15;
                this.m_timeLabel.x = 0;
                this.m_timeLabel.width = this.width;
                this.m_timeLabel.align = "center";
            }
        }
        updateFriendRedPoint() {
        }
        onMouseUpEvent(e) {
            this.mcIcon.filters = null;
        }
        onMouseEvent(e) {
            let mat = [1, 0, 0, 0, -34, 0, 1, 0, 0, -34, 0, 0, 1, 0, -34, 0, 0, 0, 1, 0];
            if (e.type == Laya.Event.MOUSE_DOWN) {
                this.mcIcon.filters = [new Laya.ColorFilter(mat)];
            }
        }
        onActTimer(e) {
            if (this.systemInfo) {
                let v = e.values;
                for (let obj of v) {
                    if (obj.id == this._systemInfo.functionID) {
                        this.showTime(obj.end);
                    }
                }
            }
        }
        showTime(t) {
            this.addTimeLabel();
            this.m_timeLabel.text = TimeUtil.format(t);
        }
        sendRewards() {
            HttpNetService.instance.SendData(270, null);
        }
        clickEvent(e) {
            if (this.systemInfo == null) {
                return;
            }
            if (this.systemInfo.click_effect != "" && this.systemInfo.click_effect != "0") {
                SoundMgr.instance.playSoundByName(this.systemInfo.click_effect);
            }
            TransFerManager.instance.transFerSence(parseInt(this.systemInfo.functionID));
        }
        updateLaBg() {
            let nameStr = "";
        }
        dispose() {
            if (this.m_timeLabel) {
                this.m_timeLabel.destroy(true);
            }
            this.mcIcon.off(Laya.Event.CLICK, this, this.clickEvent);
            this.mcIcon.off(Laya.Event.MOUSE_DOWN, this, this.onMouseEvent);
            Laya.stage.off(Laya.Event.MOUSE_UP, this, this.onMouseUpEvent);
            Signal.intance.off(GameEvent.UPDATE_RED_STATE_EVENT, this, this.changeRedPoint);
            this.mcIcon.graphics.destroy();
            if (this.systemInfo) {
                Laya.loader.cancelLoadByUrl(GameResourceManager.instance.getMianSysIcon(this.systemInfo.functionID));
                this._systemInfo = null;
            }
        }
        destroy(destroyChild = true) {
            this.dispose();
            super.destroy(destroyChild);
        }
    }

    class MainRightView extends BaseUI {
        constructor() {
            super();
        }
        init() {
            super.init();
            this.mouseThrough = true;
            this.rightIcons = [];
        }
        get view() {
            return this._view;
        }
        createUI() {
        }
        addEvent() {
            super.addEvent();
        }
        clickSetBtn() {
        }
        removeEvent() {
            super.removeEvent();
        }
        changeRedPoint() {
            for (let icon of this.rightIcons) {
                if (icon) {
                    icon.changeRedPoint();
                }
            }
        }
        addTopIcon(systemInfo, index = 0) {
            if (systemInfo.functionID == 2201 && GlobalDataManager.instance.firstRechargeState == 3) {
                return;
            }
            let iconView;
            for (let i = 0; i < this.rightIcons.length; i++) {
                if (this.rightIcons[i].systemInfo && (this.rightIcons[i]).systemInfo.functionID == systemInfo.functionID) {
                    iconView = this.rightIcons[i];
                    break;
                    ;
                }
            }
            if (iconView != null) {
                return;
            }
            if (!systemInfo) {
                return;
            }
            iconView = new MainIconView();
            iconView.systemInfo = systemInfo;
            this.rightIcons.push(iconView);
            if (index != 0) {
                this.addChildAt(iconView, index);
            }
            else {
                this.addChild(iconView);
            }
            let sortOnPst = function (a, b) {
                let aState = a.systemInfo.positiontree;
                let bState = b.systemInfo.positiontree;
                if (aState <= bState) {
                    return -1;
                }
                else if (aState > bState) {
                    return 1;
                }
                else {
                    return 0;
                }
            };
            this.rightIcons.sort(sortOnPst);
            if (GameSetting.isPC) {
                this.resizePcIcon();
            }
            else if (GameSetting.isMobile) {
                this.resizeRightIcon();
            }
        }
        destroy(destroyChild = true) {
            for (let i = 0; i < this.rightIcons.length; i++) {
                this.rightIcons[i].dispose();
                this.rightIcons[i].removeSelf();
                this.rightIcons[i].destroy();
            }
            if (this.view && this.view.systmeIcon) {
                this.view.systmeIcon.dispose();
                this.view.systmeIcon.removeSelf();
                this.view.systmeIcon.destroy();
            }
            this.rightIcons = [];
            super.destroy(destroyChild);
        }
        addSetBtn() {
        }
        resizeRightIcon() {
            let numchildren = this.rightIcons.length;
            if (numchildren < 1) {
                return;
            }
            let rowHeight = LayerManager.instence.stageHeight;
            let rowNum = Math.floor(rowHeight / 78);
            let lineNum = Math.ceil(numchildren / rowNum);
            let preChild;
            for (let i = 1; i <= lineNum; i++) {
                for (let j = 0; j < rowNum; j++) {
                    let childNum = (i - 1) * rowNum + j;
                    if (childNum < numchildren) {
                        let child;
                        child = this.rightIcons[childNum];
                        if (preChild == null) {
                            child.y = child.height + 15;
                        }
                        else {
                            child.y = preChild.y + preChild.height;
                        }
                        preChild = this.rightIcons[childNum];
                        child.x = (i - 1) * child.width;
                    }
                    else {
                        this.onStageResize();
                        return;
                    }
                }
            }
        }
        resizePcIcon() {
            let numchildren = this.numChildren;
            if (numchildren < 1) {
                return;
            }
            let rowWidth = LayerManager.instence.stageWidth - 707;
            let rowNum = Math.floor(rowWidth / 78);
            let lineNum = Math.ceil(numchildren / rowNum);
            for (let i = 1; i <= lineNum; i++) {
                for (let j = 0; j < rowNum; j++) {
                    let childNum = (i - 1) * rowNum + j;
                    if (childNum < numchildren) {
                        let child = this.getChildAt(childNum);
                        child.x = -j * (child.getBounds().width + 10);
                        child.y = (i - 1) * (child.getBounds().height + 10);
                    }
                    else {
                        return;
                    }
                }
            }
        }
        onStageResize() {
            this.x = LayerManager.instence.stageWidth - this.width + 15;
            if (GameSetting.isMobile) {
                this.y = GameSetting.m_bIsIphoneX ? 165 : 90;
            }
            else {
                this.y = 20;
            }
            super.onStageResize();
        }
        initialize() {
            this.addSetBtn();
            super.initialize();
        }
    }

    class MainScene extends BaseScene {
        constructor(URL, isCanDrag = true) {
            super(URL, isCanDrag);
            this.mapWith = 640;
            this.mapHeight = 1386;
            this.mapPcWith = 640;
            this.mapPcHeight = 1386;
            this.loadedNum = 0;
            this.stageScaleX = 0.82;
            this.stageScaleY = 0.79;
            this.isNewGuide = false;
            this.isSet402 = false;
            this.isSet601 = false;
            this.isResDispose = false;
            MainSceneNet.getInstance().init();
        }
        loadMap() {
            this.m_sprMap.graphics.clear();
            let url = GameResourceManager.instance.setResURL("scene/mainbg.jpg");
            this.m_sprMap.loadImage(url, Laya.Handler.create(this, this.loadMapCallBack, [url]));
        }
        loadMapCallBack(url) {
            if (GameSetting.isPC) {
                this.m_sprMap.width = this.mapPcWith;
                this.m_sprMap.height = this.mapPcHeight;
            }
            else {
                this.m_sprMap.width = this.mapWith;
                this.m_sprMap.height = this.mapHeight;
            }
            this.onMapLoaded();
        }
        init() {
            this._loadSceneResCom = false;
            this.m_SceneResource = "MainScene";
            super.init();
        }
        onLoaded() {
            this.addBuilding();
            this.addEffect();
            this.addEvent();
            this.initMessage();
            if (GlobalDataManager.instance.systemOpenModel.isOpen(EnumFunctionId.FUN_ID_PHONE.toString())) {
                this.addActivity(EnumFunctionId.FUN_ID_PHONE);
            }
            if (MainScene.M_B_FIRST_Open) {
            }
            MainScene.M_B_FIRST_Open = false;
            Laya.timer.once(4000, this, this.setFirstActiveOpen);
            this.addOpenSystem();
        }
        setFirstActiveOpen() {
            if (MainScene.M_B_FIRST_Open2) {
            }
            MainScene.M_B_FIRST_Open2 = false;
        }
        addEvent() {
            super.addEvent();
            Signal.intance.on(GameEvent.SYSTEM_OPEN_TIME_INITED, this, this.addOpenSystem);
        }
        initMessage() {
            MainSceneNet.getInstance().requestRedHot();
        }
        onReceiveRedHot() {
            for (let build of this.buildings) {
                build.changeRedPoint();
            }
        }
        changeBuildState(functionId, state) {
            if (this.buildings) {
                for (let buildsp of this.buildings) {
                    if ((buildsp && buildsp.functionId == functionId) && buildsp.isInit == true) {
                        buildsp.changeState(functionId, state);
                        return;
                    }
                }
            }
        }
        addActivity(functionId) {
            let systemVo = GlobalDataManager.instance.systemOpenModel.m_dicSystemInfoCfg.get(functionId);
            if (systemVo == null) {
                if (!GameSetting.ignoreSheetNo) {
                    console.log("------------------system_open表中没有此ICON:   " + functionId);
                    return;
                }
            }
            if (GameSetting.ignoreSheetNo && !systemVo) {
                systemVo = new SystemOpenVO();
                systemVo.functionID = functionId + "";
                systemVo.function_name = "" + functionId;
                systemVo.positionID = 2;
                GlobalDataManager.instance.systemOpenModel.m_dicSystemInfoCfg.set(functionId + "", systemVo);
            }
            if (systemVo.positionID == 2) {
                this.addButtomView(systemVo);
            }
            else if (systemVo.positionID == 6) {
                this.addLeftSystemIcon(systemVo);
            }
            else if (systemVo.positionID == 4) {
                this.changeBuildState(systemVo.functionID, true);
            }
            else if (systemVo.positionID == 15) {
                this.addRightViw(systemVo);
                this.rightView.resizeRightIcon();
            }
        }
        addOpenSystem(openInit = false) {
            let opensystem = GlobalDataManager.instance.systemOpenModel.openSystem.keys;
            this.addButtomView(null);
            if (GameSetting.buildClickState) {
                opensystem = [1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010, 1011, 1012, 2001, 2002, 2003, 2101, 2102, 2103, 2104, 2105, 2106, 2107, 2108, 2109, 2201, 2204, 3001, 3002, 3003, 3004, 3006, 3016, 3017, 5004, 5007, 5008, 6001, 6002, 6003, 9001, 9003, 9009, 9011, 4005, 9012, 9013];
                let systemInfoMap = GlobalDataManager.instance.systemOpenModel.m_dicSystemInfoCfg;
                for (let funId of systemInfoMap.keys) {
                    opensystem.push(parseInt(funId + ""));
                }
            }
            for (let i = 0; i < opensystem.length; i++) {
                if (opensystem[i] == 1009) {
                    continue;
                }
                let sysInfo = GlobalDataManager.instance.systemOpenModel.m_dicSystemInfoCfg.get(opensystem[i]);
                if (!sysInfo) {
                    continue;
                }
                if (openInit && parseInt(sysInfo.display_type + "") != 0) {
                    continue;
                    ;
                }
                if (sysInfo) {
                    if (sysInfo.positionID == 2) {
                        this.addButtomView(sysInfo);
                    }
                    else if (sysInfo.positionID == 6) {
                        this.addLeftSystemIcon(sysInfo);
                    }
                }
            }
        }
        reciveOpenSystem(functionId) {
            let systemVo = GlobalDataManager.instance.systemOpenModel.m_dicSystemInfoCfg.get(functionId);
            if (systemVo == null) {
                console.log("------------------system_open表中没有此ICON:   " + functionId);
                return;
            }
            if (systemVo.positionID == 2) {
                this.addButtomView(systemVo);
            }
            else if (systemVo.positionID == 6) {
                this.addLeftSystemIcon(systemVo);
            }
            else {
                this.updateBuildingState();
            }
            if (this.m_buttomUIView == null) {
                this.m_buttomUIView = new MainButtonUIView();
                this.addChild(this.m_buttomUIView);
            }
        }
        addButtomView(sysInfo) {
            if (this.m_buttomUIView == null) {
                this.m_buttomUIView = new MainButtonUIView();
                this.addChild(this.m_buttomUIView);
            }
        }
        addRightViw(sysInfo) {
            if (this.rightView == null) {
                this.rightView = new MainRightView();
                this.addChild(this.rightView);
            }
            this.rightView.addTopIcon(sysInfo);
        }
        addLeftSystemIcon(sysInfo) {
        }
        removeActivity(functionId) {
            let systemVo = GlobalDataManager.instance.systemOpenModel.m_dicSystemInfoCfg.get(functionId);
            if (systemVo == null) {
                console.log("------------------system_open表中没有此ICON:   " + functionId);
                return;
            }
            if (systemVo && systemVo.positionID == 2) {
            }
            else if (systemVo && systemVo.positionID == 6) {
            }
            else if (systemVo && systemVo.positionID == 4) {
                this.changeBuildState(systemVo.functionID, false);
            }
        }
        updateBuildingState() {
            for (let i = 0; i < this.buildings.length; i++) {
                let build = this.buildings[i];
                build.updateState();
            }
        }
        flySysIcon(functionId) {
            let functionVo = GlobalDataManager.instance.systemOpenModel.m_dicSystemInfoCfg.get(functionId);
            let flyItem = new MainIconView();
            flyItem.systemInfo = functionVo;
            Laya.stage.addChild(flyItem);
            let targePoint;
            if (functionVo.positionID == 2) {
            }
            else if (functionVo.positionID == 6) {
            }
        }
        addBuilding() {
            if (this.mainView == null) {
                this.mainView = new MornUI.MainView.MainViewUI();
                this.m_sprMap.addChild(this.mainView);
            }
            if (this.buildings == null) {
                this.buildings = [];
            }
            if (!this.adverts) {
                this.adverts = [];
            }
            let buildObj = GlobalDataManager.instance.systemOpenModel.m_dicSystemInfoCfg;
            let buildsp;
            let ad;
            let buildArr = [];
            for (let i = 0; i < buildObj.values.length; i++) {
                let vo = buildObj.values[i];
                if (vo.building_layer == "") {
                    continue;
                }
                buildArr.push(vo);
            }
            let doCompare = function (ad1, ad2) {
                if (parseInt(ad1.building_layer) > parseInt(ad2.building_layer)) {
                    return 1;
                }
                else if (parseInt(ad1.building_layer) == parseInt(ad2.building_layer)) {
                    return 0;
                }
                else {
                    return -1;
                }
            };
            buildArr.sort(doCompare);
            for (let i = 0; i < buildArr.length; i++) {
                let vo = buildArr[i];
                if (vo.functionID + "" == EnumFunctionId.FUN_ID_PHONE) {
                    continue;
                }
                buildsp = new BuildFunSp();
                buildsp.initbuilding(vo, this.mainView);
                let posAry = vo.building_coordnate;
                if (GameSetting.isPC && vo.building_coordnateweb) {
                    posAry = vo.building_coordnateweb;
                }
                this.buildings.push(buildsp);
            }
            this.addAirShip();
        }
        removeEvent() {
            Laya.timer.clear(this, this.setFirstActiveOpen);
            Signal.intance.off(GameEvent.SYSTEM_OPEN_TIME_INITED, this, this.addOpenSystem);
            super.removeEvent();
        }
        addEffect() {
            return;
        }
        loadEffectCallBack() {
            let aniPlane = this._effectManager.getEffectByUrl(GameResourceManager.instance.getEffectUrl("aireffect"));
            aniPlane.play();
            aniPlane.x = this.m_sprMap.width - 200;
            aniPlane.y = 180;
            aniPlane.scaleX = -1;
            aniPlane.pivot(52, 52);
            this.tweenAir(aniPlane);
            this.m_sprMap.addChildAt(aniPlane, 0);
        }
        tweenAir(ani) {
            ani.scaleX *= -1;
            Laya.Tween.to(ani, { x: 156 }, 15000, null, Laya.Handler.create(this, this.airTween, [ani]));
        }
        airTween(ani) {
            ani.scaleX *= -1;
            Laya.Tween.to(ani, { x: this.m_sprMap.width - 200 }, 15000, null, Laya.Handler.create(this, this.tweenAir, [ani]));
        }
        loadImgAsset() {
            if (this.isDispose) {
                return;
            }
            this.light_1.rotation = -40;
            this.light_2.rotation = 40;
            this.light_1.y = 500 * this.stageScaleY;
            this.light_2.y = 540 * this.stageScaleY;
            this.light_1.x = 820 * this.stageScaleX;
            this.light_2.x = 1200 * this.stageScaleX;
            this.light_1.sizeGrid = "4,4,4,4";
            this.light_2.sizeGrid = "4,4,4,4";
            this.light_1.width = (this.light_2.width = 54);
            this.light_1.height = (this.light_2.height = 580);
            this.light_1.pivot(27, 580);
            this.light_2.pivot(27, 580);
            this.tweenLight1();
            this.tweenLight2();
        }
        tweenLight1() {
            Laya.Tween.to(this.light_1, { rotation: 40 }, 3500, null, Laya.Handler.create(this, this.lightOneTween));
        }
        tweenLight2() {
            Laya.Tween.to(this.light_2, { rotation: -40 }, 3500, null, Laya.Handler.create(this, this.lightTwoTween));
        }
        lightOneTween() {
            Laya.Tween.to(this.light_1, { rotation: -40 }, 3500, null, Laya.Handler.create(this, this.tweenLight1));
        }
        lightTwoTween() {
            Laya.Tween.to(this.light_2, { rotation: 40 }, 3500, null, Laya.Handler.create(this, this.tweenLight2));
        }
        addAirShip() {
            if (this.baffles == null) {
                this.baffles = [];
            }
            let bafflesInfos = GlobalDataManager.instance.systemOpenModel.bafflesInfo;
            let sp = new AirShipView();
            this.baffles.push(sp);
            this.m_sprMap.addChild(sp);
            sp.y = bafflesInfos[3][1];
            this.tweenFeiting(sp);
        }
        tweenFeiting(disObj) {
            if (!disObj) {
                return;
            }
            disObj.x = this.m_sprMap.width + 247;
            Laya.Tween.to(disObj, { x: -247 }, 50000 * 2.5, null, Laya.Handler.create(this, this.tweenFeiting, [disObj]));
        }
        onStartDrag(e = null) {
            if (!this.isNewGuide) {
                super.onStartDrag(e);
            }
        }
        clearTween() {
            if (this.light_1) {
                Laya.Tween.clearAll(this.light_1);
                this.light_1.destroy();
            }
            if (this.light_2) {
                Laya.Tween.clearAll(this.light_2);
                this.light_2.destroy();
            }
        }
        dispose() {
            for (let k = 0; k < this.m_sprMap.numChildren; k++) {
                Laya.Tween.clearAll(this.m_sprMap.getChildAt(k));
            }
            if (this.buildings) {
                for (let i = 0; i < this.buildings.length; i++) {
                    let build = this.buildings[i];
                    build.destroy();
                    build = null;
                }
                this.buildings = [];
            }
            this.clearTween();
            if (this.adverts) {
                for (let z = 0; z < this.adverts.length; z++) {
                    let adv = this.adverts[z];
                    adv.resetTime(false);
                    adv.destroy();
                    Laya.Pool.recover("MainAdvertItem", adv);
                }
                this.adverts = [];
            }
            if (this.baffles) {
                for (let j = 0; j < this.baffles.length; j++) {
                    let baffle = this.baffles[j];
                    Laya.Tween.clearAll(baffle);
                    baffle.destroy();
                    baffle.removeSelf();
                    baffle = null;
                }
                this.baffles = [];
            }
            if (this._effectManager) {
                this._effectManager.destory();
                this._effectManager = null;
            }
            if (this.m_sprMap) {
                this.m_sprMap.destroy(true);
            }
            if (this.rightView) {
                this.rightView.destroy();
                this.rightView.removeSelf();
                this.rightView = null;
            }
            super.dispose();
        }
        reSetBuildPosition(_buildFunSp) {
            let localPoint = _buildFunSp.view.parent.globalToLocal(new Laya.Point((Laya.stage.width - _buildFunSp.view.width) / 2, 0));
            this.m_sprMap.x += localPoint.x * this.m_iScare - _buildFunSp.view.x * this.m_iScare;
            if (this.m_sprMap.x * this.m_iScare < (Laya.stage.width - this.m_sprMap.width + this.m_sprMap.pivotX) * this.m_iScare) {
                if (GameSetting.m_bIsIphoneX) {
                    this.m_sprMap.x = (Laya.stage.width - this.m_sprMap.width + this.m_sprMap.pivotX) * this.m_iScare - 150;
                }
                else {
                    this.m_sprMap.x = (Laya.stage.width - this.m_sprMap.width + this.m_sprMap.pivotX) * this.m_iScare;
                }
            }
            else if (this.m_sprMap.x * this.m_iScare > this.m_sprMap.pivotX * this.m_iScare) {
                this.m_sprMap.x = this.m_sprMap.pivotX * this.m_iScare;
            }
            this.isNewGuide = true;
        }
        Guide350() {
            if (this.buildings) {
                Signal.intance.event(GameEvent.EVENT_OPEN_MODULE, [ModuleName.CreateNameDialog]);
                return true;
            }
            return false;
        }
        Guide400() {
            if (this.buildings) {
                GlobalService.instance.swithToNewFun(1001, true);
                return true;
            }
            return false;
        }
        Guide402() {
            if (this.buildings) {
                for (let buildsp of this.buildings) {
                    if ((buildsp && buildsp.functionId == "1001") && buildsp.isInit == true) {
                        let _buildFunSp = buildsp.canGuideTravel();
                        if (_buildFunSp && this.isSet402 == false) {
                            this.reSetBuildPosition(_buildFunSp);
                            this.isSet402 = true;
                        }
                        return _buildFunSp.view;
                    }
                }
            }
            return null;
        }
        Guide450() {
            if (this.buildings) {
                GlobalService.instance.swithToNewFun(1007, true);
                return true;
            }
            return false;
        }
        Guide550() {
            if (this.buildings) {
                GlobalService.instance.swithToNewFun(2001, true);
                return true;
            }
            return false;
        }
        Guide600() {
            if (this.buildings) {
                GlobalService.instance.swithToNewFun(1005, true);
                return true;
            }
            return false;
        }
        Guide601() {
            if (this.buildings) {
                for (let buildsp of this.buildings) {
                    if ((buildsp && buildsp.functionId == "1005") && buildsp.isInit == true) {
                        let _buildFunSp = buildsp.canGuidePray();
                        if (_buildFunSp && this.isSet601 == false) {
                            this.reSetBuildPosition(_buildFunSp);
                            this.isSet601 = true;
                        }
                        return _buildFunSp.view;
                    }
                }
            }
            return null;
        }
        Guide620() {
            if (this.buildings) {
                GlobalService.instance.swithToNewFun(1003, true);
                return true;
            }
            return false;
        }
        Guide621() {
            if (this.buildings) {
                GlobalService.instance.swithToNewFun(1007, true);
                return true;
            }
            return false;
        }
        Guide750() {
            if (this.buildings) {
                GlobalService.instance.swithToNewFun(1011, true);
                return true;
            }
            return false;
        }
        Guide830() {
            if (this.m_buttomUIView) {
                return this.m_buttomUIView.Guide830();
            }
            return null;
        }
    }
    MainScene.M_B_FIRST_Open = true;
    MainScene.M_B_FIRST_Open2 = true;
    MainScene.IS_OPENED_ACTIVITY = false;

    class BuyMoneyModel {
        constructor() {
        }
        static get instance() {
            if (BuyMoneyModel._instance == null) {
                BuyMoneyModel._instance = new BuyMoneyModel();
            }
            return BuyMoneyModel._instance;
        }
        initJson() {
            if (this.buyDic == null) {
                this.buyDic = new Dictionary();
                let json = GameResourceManager.instance.getResByURL("config/buy_money_proto.json");
                let buyInfo;
                for (let value of json) {
                    buyInfo = value;
                    this.buyDic.set(buyInfo.times, buyInfo);
                }
            }
        }
        getBuyVoByTime(time) {
            if (time > 50) {
                time = 50;
            }
            return this.buyDic.get(time);
        }
    }

    class SuitConst {
    }
    SuitConst.BOOK_WOMAN = 1;
    SuitConst.BOOK_MAN = 2;
    SuitConst.BOOK_PET_CHEST = 3;
    SuitConst.BOOK_BG = 4;
    SuitConst.BOOK_WOMAN_MODEL = 5;
    SuitConst.BOOK_WOMAN_HAIR = 6;
    SuitConst.BOOK_MAN_MODEL = 7;
    SuitConst.BOOK_MAN_HAIR = 8;
    SuitConst.BOOK_TAG = 9;
    SuitConst.SUIT_TYPE_Casual = 1;
    SuitConst.SUIT_TYPE_Business = 2;
    SuitConst.SUIT_TYPE_Active = 3;
    SuitConst.SUIT_TYPE_Elegant = 4;
    SuitConst.SUIT_TYPE_Preppy = 5;
    SuitConst.SUIT_TYPE_Vacation = 6;
    SuitConst.SUIT_TYPE_Urban = 7;
    SuitConst.SUIT_TYPE_Artsy = 8;
    SuitConst.SUIT_TYPE_Party = 9;
    SuitConst.SUIT_TYPE_Punk = 10;
    SuitConst.SUIT_TYPE_Festival = 11;

    class BaseAlert extends Laya.Dialog {
        constructor() {
            super();
            this.canClickMask = true;
            this.preinitialize();
        }
        _onClick(e) {
            let btn = e.target;
            if (btn) {
                switch (btn.name) {
                    case Laya.Dialog.CLOSE:
                        break;
                    case Laya.Dialog.CANCEL:
                        break;
                    case Laya.Dialog.SURE:
                        break;
                    case Laya.Dialog.NO:
                        break;
                    case Laya.Dialog.OK:
                        break;
                    case Laya.Dialog.YES:
                        {
                            this.destroy();
                        }
                        break;
                }
            }
        }
        preinitialize() {
            this.init();
        }
        init() {
        }
        createChildren() {
            super.createChildren();
            this.createUI();
            this.initialize();
        }
        createUI() {
        }
        initialize() {
            this.addEvent();
            this.initData();
        }
        addEvent() {
        }
        initData() {
        }
        removeEvent() {
        }
        disposeDialog() {
            Laya.Dialog.manager.close(this);
        }
        destroy(destroyChild = true) {
            this.removeEvent();
            if (this._view) {
                this._view.destroy();
                this._view = null;
            }
            super.destroy();
        }
        sendData(cmdId, data = null) {
            if (data == null) {
                data = [];
            }
        }
    }

    class BaseAlertView extends BaseAlert {
        constructor() {
            super();
            this.destroyDoCancel = false;
        }
        addEvent() {
            this.okBtn = this._alertView.getChildByName("okBtn");
            this.cancleBtn = this._alertView.getChildByName("cancleBtn");
            this.descTf = this._alertView.getChildByName("alertDesc");
            this._alertView.on(Laya.Event.CLICK, this, this.onClickEvent);
        }
        createUI() {
            this.createAlert();
        }
        createAlert() {
            if (!this._alertView) {
                this._alertView = new MornUI.BaseAlert.BaseAlertViewUI();
            }
            this.addChild(this._alertView);
        }
        onClickEvent(e) {
            let target = e.target;
            if (target.name == "okBtn") {
                this._okHandler && this._okHandler.runWith(null);
                this.close();
            }
            else if (target.name == "cancleBtn") {
                this.destroyDoCancel = false;
                this._cancelHandler && this._cancelHandler.runWith(null);
                this.close();
            }
        }
        alert(flag, okHandler, cancelHandler, data = null, destroyDoCancel = false, initHandler = null) {
            let offsetX = 66;
            this._okHandler = okHandler;
            this._cancelHandler = cancelHandler;
            this.destroyDoCancel = destroyDoCancel;
            if (flag & AlertType.YES && !(flag & AlertType.NO)) {
                this.okBtn.x = this._alertView.width - this.okBtn.width >> 1;
                this.cancleBtn.visible = false;
                this.okBtn.label = "Sure";
            }
            else if (flag & AlertType.NO && !(flag & AlertType.YES)) {
                this.okBtn.visible = false;
            }
            else if (flag & AlertType.YES && flag & AlertType.NO) {
            }
            if (data instanceof String && this.descTf) {
                this.descTf.text = data;
            }
            if (initHandler) {
                initHandler.runWith(this);
            }
        }
        removeSelf() {
            if (this.destroyDoCancel && this._cancelHandler) {
                this._cancelHandler.run();
            }
            return super.removeSelf();
        }
        removeEvent() {
            super.removeEvent();
            this._okHandler = null;
            this._cancelHandler = null;
        }
    }

    class BuyConfirmView extends BaseAlertView {
        constructor() {
            super();
            this.consumeType = 0;
            this.consumeValue = 0;
        }
        createAlert() {
            this._alertView = new MornUI.ShopView.BuyComfirmViewUI();
            this.addChild(this._alertView);
        }
        alert(flag, okHandler, cancelHandler, data = null, destroyDoCancel = false, txtHandler = null) {
            super.alert(flag, okHandler, cancelHandler, data, destroyDoCancel);
            this._data = data;
            this.initViewData();
        }
        buyHandle(callBack) {
            if (callBack == AlertType.RETURN_YES) {
                if (GlobalDataManager.instance.roleInfo.hasEnoughMoney(this.consumeType, this.consumeValue)) {
                    console.log("buyConfime判断" + this.consumeType + "value:" + this.consumeValue);
                    LoadingManager.instance.showLoading();
                    HttpNetService.instance.SendData(89, [8]);
                }
                else {
                    Signal.intance.event(GameEvent.EVENT_OPEN_MODULE, [ModuleName.RechargeDialog]);
                }
            }
        }
        initViewData() {
            let buyType = 0;
            if (this._data.hasOwnProperty("itemId")) {
                buyType = this._data["itemId"];
            }
            else {
                buyType = parseInt(this._data + "");
            }
            let confiremView = this._alertView;
            let item = SheetDataManager.intance.m_dicItems.get(buyType);
            confiremView.label_titile.text = GameLanguageMgr.instance.getConfigLan(item.item_name);
            if (EnumConsumeType.isConsumeType(item.itemID)) {
                confiremView.buyImg.skin = GameResourceManager.instance.getConsumeconUrl(item.itemID);
            }
            else {
                confiremView.buyImg.skin = GameResourceManager.instance.getIconUrl(String(item.itemID));
            }
            let money;
            let num;
            let buyInfo;
            let numBuy;
            this._alertView.txtInfoStamina.visible = false;
            this._alertView.txtInfoMile.visible = false;
            if (((item.itemID == 1 || item.itemID == 3) || item.itemID == 4) || item.itemID == 8) {
                if (item.itemID == 1) {
                    numBuy = GlobalDataManager.instance.roleInfo.buyTimes_gold + 1;
                    if (numBuy > 100) {
                        numBuy = 100;
                    }
                    buyInfo = BuyMoneyModel.instance.getBuyVoByTime(numBuy);
                    num = buyInfo.dollar;
                }
                else if (item.itemID == 3) {
                    numBuy = GlobalDataManager.instance.roleInfo.buyTimes_ps + 1;
                    if (numBuy > 100) {
                        numBuy = 100;
                    }
                    buyInfo = BuyMoneyModel.instance.getBuyVoByTime(numBuy);
                    num = buyInfo.tamina;
                    this._alertView.txtInfoStamina.visible = true;
                    this._alertView.txtInfoMile.visible = false;
                }
                else if (item.itemID == 4) {
                    numBuy = GlobalDataManager.instance.roleInfo.buyTimes_endurance + 1;
                    if (numBuy > 100) {
                        numBuy = 100;
                    }
                    buyInfo = BuyMoneyModel.instance.getBuyVoByTime(numBuy);
                    num = buyInfo.mile;
                    this._alertView.txtInfoStamina.visible = false;
                    this._alertView.txtInfoMile.visible = true;
                }
                money = buyInfo.cost;
                confiremView.costTF.text = String(buyInfo.cost);
                this.consumeValue = buyInfo.cost;
                confiremView.numTF.text = String(num);
                confiremView.cosImg.skin = GameResourceManager.instance.getIconUrl("general/diamond");
                this.consumeType = EnumConsumeType.TYPE_DIAMOND;
            }
            else {
                confiremView.costTF.text = this._data["money"];
                this.consumeValue = this._data["money"];
                confiremView.numTF.text = this._data["num"];
                confiremView.cosImg.skin = GameResourceManager.instance.getIconUrl("general/dollar");
                this.consumeType = EnumConsumeType.TYPE_GOLD;
            }
        }
    }
    BuyConfirmView.BUY_TYPE_PY = 3;
    BuyConfirmView.BUY_TYPE_ENDURANCE = 4;
    BuyConfirmView.BUY_TYPE_GOLD = 1;

    class MainTopView extends BaseView {
        constructor() {
            super();
            this.m_iLayerType = LayerManager.M_POP;
            this.m_iPositionType = LayerManager.LEFTUP;
            if (GameSetting.m_bIsIphoneX) {
                this.m_ioffsetY = GameSetting.IPHONEX_TOP;
            }
        }
        createUI() {
            this.topView = new MornUI.MainView.MainTopViewUI();
            this.addChild(this.topView);
            BuyMoneyModel.instance.initJson();
            this.mouseThrough = (this.topView.mouseThrough = true);
            this.topView.headBox.mouseThrough = true;
            let mcMain = this.topView.getChildByName("mcMain");
            if (mcMain) {
                mcMain.mouseThrough = true;
            }
            Laya.timer.loop(1000, this, this.loopTime);
            this.initPcBtn();
        }
        initData() {
            this.updateTopInfo();
            this.showChaopiao(false);
            this.showExchange(false);
        }
        changeMailFlag() {
        }
        updateTopInfo() {
            let roleInfo = GlobalDataManager.instance.roleInfo;
            this.topView.tf_1.text = NumberUtil.numStringFormat2(roleInfo.money1);
            this.topView.tf_2.text = NumberUtil.numStringFormat2(roleInfo.money2);
            this.topView.tf_3.text = NumberUtil.numStringFormat2(roleInfo.money3);
            this.topView.tf_4.text = NumberUtil.numStringFormat2(roleInfo.money4);
            this.topView.tf_5.text = NumberUtil.numStringFormat2(roleInfo.money5);
            this.topView.tf_6.text = NumberUtil.numStringFormat2(roleInfo.money6);
            this.topView.tf_name.text = roleInfo.roleName;
            this.topView.levelTF.text = roleInfo.level.toString();
            this.topView.vipTF.text = GlobalDataManager.instance.vipInfo.vipLv.toString();
            this.changeMailFlag();
            let date = new Date(GlobalDataManager.instance.m_iServerTimeStamp);
            console.log("服务器时间toLocaleString：" + date.toLocaleString());
            console.log("服务器时间相差时区date：" + GlobalDataManager.instance.timeZoneOff / 60 / 60);
            this.updateTile();
        }
        updateTile() {
        }
        loadComplete() {
            console.log("特效加载完成");
        }
        loopTime() {
            GlobalDataManager.instance.m_iServerTimeStamp += 1000;
            GlobalDataManager.instance.m_iServerTimeStamp += GameSetting.m_iTimeFrame;
        }
        set visible(value) {
            super.visible = value;
            if (value) {
            }
        }
        addMovieclip() {
        }
        addEvent() {
            super.addEvent();
            this.topView.btn_free.clickHandler = new Laya.Handler(this, this.onclickBtnHandler, [this.topView.btn_free]);
            this.topView.btn_shop.clickHandler = new Laya.Handler(this, this.onclickBtnHandler, [this.topView.btn_shop]);
            this.topView.btn_pack.clickHandler = new Laya.Handler(this, this.onclickBtnHandler, [this.topView.btn_pack]);
            Signal.intance.on(GameEvent.UPDATE_RED_STATE_EVENT, this, this.changeMailFlag);
            Signal.intance.on(GameEvent.UPDATE_CHAO_PIAO, this, this.showChaopiao);
            Signal.intance.on(GameEvent.UPDATE_EXCHANGE_INFO, this, this.showExchange);
            Signal.intance.on(GameEvent.ROLE_INFO_CHANGE, this, this.updateTopInfo);
            Signal.intance.on("CHANG_NAME", this, this.changeName);
            Signal.intance.on("open_buy", this, this.openBuyDialog);
            Signal.intance.on("msg_173", this, this.onFirstRecharge);
            Signal.intance.on(GameEvent.EVENT_REMOVE_ACTIVITY, this, this.onBindStateChange);
            this.initBtnBox();
        }
        onBindStateChange() {
        }
        onFirstRecharge(data) {
        }
        initBtnBox() {
            this.sortIconView();
        }
        sortIconView() {
        }
        onclickBtnHandler(btn) {
            switch (btn) {
                case this.topView.btn_free:
                    {
                        NoticeMgr.instance.notice("暂未开放");
                    }
                    break;
                case this.topView.btn_shop:
                    {
                        NoticeMgr.instance.notice("暂未开放");
                    }
                    break;
                case this.topView.btn_pack:
                    {
                        NoticeMgr.instance.notice("暂未开放");
                    }
                    break;
            }
        }
        openBuyDialog(type) {
            switch (parseInt(type)) {
                case 1:
                    {
                        this.clickPlutPower();
                    }
                    break;
                case 2:
                    {
                        this.clickFlyBtn();
                    }
                    break;
                case 3:
                    {
                        this.buyGoldBtn();
                    }
                    break;
                case 4:
                    {
                        this.clickRecharge();
                    }
                    break;
            }
        }
        clickPlutPower() {
            let buyInfo = BuyMoneyModel.instance.getBuyVoByTime(1);
            let data = { "itemId": BuyConfirmView.BUY_TYPE_PY, "times": 1, "money": buyInfo.cost, "num": buyInfo.tamina };
            AlertManager.instance().AlertByType(AlertType.BUYCONFIRMVIEW, data, 0, Laya.Handler.create(this, this.buyTiCallBack));
        }
        buyTiCallBack(callBack) {
            LoadingManager.instance.showLoading();
            this.sendData(89, [7]);
        }
        clickRecharge() {
            if (GameSetting.m_bInstantGame == true) {
                let str = GameLanguageMgr.instance.getConfigLan(500004);
                AlertManager.instance().AlertByType(AlertType.BASEALERTVIEW, str, AlertType.YES);
                return;
            }
            Signal.intance.event(GameEvent.EVENT_OPEN_MODULE, [ModuleName.RechargeDialog]);
        }
        changeName(data) {
            this.topView.tf_name.text = data;
        }
        buyGoldBtn() {
            Signal.intance.event(GameEvent.EVENT_OPEN_MODULE, [ModuleName.GetMoreDialog]);
        }
        clickFlyBtn() {
            let buyInfo = BuyMoneyModel.instance.getBuyVoByTime(1);
            let data = { "itemId": BuyConfirmView.BUY_TYPE_ENDURANCE, "times": 1, "money": buyInfo.cost, "num": buyInfo.mile };
            AlertManager.instance().AlertByType(AlertType.BUYCONFIRMVIEW, data, 0, Laya.Handler.create(this, this.buyFlycallBack));
        }
        buyFlycallBack(callBack) {
            LoadingManager.instance.showLoading();
            this.sendData(89, [8]);
        }
        showExchange(vis) {
            if (!this.topView) {
                return;
            }
        }
        relateToRight(obj) {
        }
        showChaopiao(vis) {
        }
        onStageResize() {
            super.onStageResize();
        }
        openRoleView() {
            Signal.intance.event(GameEvent.EVENT_OPEN_MODULE, [ModuleName.RoleDialog]);
        }
        openTitleView() {
            SceneManager.intance.setCurrentScene(SceneType.M_SCENE_SUIT, true, SuitConst.BOOK_WOMAN);
        }
        clearTitleRedPoint() {
        }
        initPcBtn() {
            if (!GameSetting.isPC || GameSetting.m_bIsMobWeb) {
                return;
            }
            let btnMail = this.topView.getChildByName("mcMain").getChildByName("mcBtnList").getChildByName("btnMail");
            let btnSound = this.topView.getChildByName("mcMain").getChildByName("mcBtnList").getChildByName("btnSound");
            let btnLanguage = this.topView.getChildByName("mcMain").getChildByName("mcBtnList").getChildByName("btnLanguage");
            let btnGift = this.topView.getChildByName("mcMain").getChildByName("mcBtnList").getChildByName("btnGift");
            let btnMothCard = this.topView.getChildByName("mcMain").getChildByName("mcBtnList").getChildByName("btnMothCard");
            let mcReadPoint = this.topView.getChildByName("mcMain").getChildByName("mcBtnList").getChildByName("mcReadPoint");
            mcReadPoint.visible = GlobalDataManager.instance.systemOpenModel.hasRedState(1);
            btnMail.clickHandler = new Laya.Handler(this, function () {
                ModuleManager.intance.openModule(ModuleName.MaillView);
            });
            btnSound.clickHandler = new Laya.Handler(this, function () {
                ModuleManager.intance.openModule(ModuleName.GamesettingSoundView);
            });
            btnLanguage.clickHandler = new Laya.Handler(this, function () {
            });
        }
        removeEvent() {
            this.topView.mcBg.off(Laya.Event.CLICK, this, this.openRoleView);
            Signal.intance.off(GameEvent.UPDATE_RED_STATE_EVENT, this, this.changeMailFlag);
            Signal.intance.off(GameEvent.UPDATE_CHAO_PIAO, this, this.showChaopiao);
            Signal.intance.off(GameEvent.UPDATE_EXCHANGE_INFO, this, this.showExchange);
            Signal.intance.off(GameEvent.ROLE_INFO_CHANGE, this, this.updateTopInfo);
            Signal.intance.off("CHANG_NAME", this, this.changeName);
            Signal.intance.off("open_buy", this, this.openBuyDialog);
            Signal.intance.off("msg_173", this, this.onFirstRecharge);
            Signal.intance.off(GameEvent.EVENT_REMOVE_ACTIVITY, this, this.onBindStateChange);
            super.removeEvent();
        }
    }

    class SceneManager {
        constructor() {
            this.mainSceneX = 10086;
            this.isCloseAll = true;
            this.enterMainSceneTimes = 0;
            this.isOpening = false;
            Signal.intance.on(GameEvent.EVENT_MODULE_ADDED, this, this.onAdded);
        }
        static get intance() {
            if (SceneManager._instance) {
                return SceneManager._instance;
            }
            SceneManager._instance = new SceneManager();
            return SceneManager._instance;
        }
        init() {
        }
        setup() {
        }
        onAdded(data) {
            if (data instanceof MainTopView) {
                this.topView = data;
                this.topView.visible = this._showTop;
            }
        }
        getPreSceneData() {
            if (this.m_arrFromScenes.length < 1) {
                return [SceneType.M_SCENE_MAIN, true, 1, null];
            }
            else {
                let secenData = this.m_arrFromScenes.pop();
                console.log("pop后-----------场景路由：" + this.m_arrFromScenes.join(" | "));
                return secenData;
            }
            return [SceneType.M_SCENE_MAIN, true, 1, null];
        }
        removePreSceneData() {
            this.m_arrFromScenes = [];
        }
        setBackScene() {
            let preSceneData = this.getPreSceneData();
            this.setCurrentScene(preSceneData[0], preSceneData[1], preSceneData[2], preSceneData[3], false);
        }
        setMainScene(type = 1, data = null) {
            this.setCurrentScene(SceneType.M_SCENE_MAIN, true, 1, data);
        }
        setCurrentScene(sceneType, showTop = true, type = 1, data = null, pushBack = false, needRemember = true) {
            this.showTopView(false);
            let isReOpen = false;
            if (sceneType == SceneType.M_SCENE_FIND) {
                if (this.currSceneName && this.currSceneName == sceneType) {
                    isReOpen = true;
                    if (this.m_sceneCurrent) {
                        this.m_sceneCurrent.source = data;
                        this.m_sceneCurrent.open();
                    }
                    return;
                }
            }
            else {
                if ((this.m_sceneCurrent && this.m_sceneCurrent.name == sceneType) && this.m_sceneCurrent.name != SceneType.M_SCENE_TRAVEL) {
                    console.log("当前场景：" + this.m_sceneCurrent.name + "  打开到场景：" + sceneType);
                    return;
                }
            }
            this._showTop = showTop;
            if (this.isCloseAll) {
                ModuleManager.intance.closeAll();
            }
            else {
                this.isCloseAll = true;
            }
            if (GameSetting.usePcUI && SceneManager.m_arrSceneToDialog.indexOf(this.currSceneName) != -1) {
            }
            else {
                if (GameSetting.usePcUI && SceneManager.m_arrSceneToDialog.indexOf(sceneType) != -1) {
                    LoadingManager.instance.showLoading(true);
                }
                else {
                    SceneLoadingManager.instance.showLoading(false);
                }
            }
            if (this.m_sceneCurrent) {
                if (!this.m_arrFromScenes) {
                    this.m_arrFromScenes = [];
                }
                if (pushBack) {
                    let lastNeedRemember = this.m_sceneCurrent.m_arrOpenSceneData[5];
                    if (lastNeedRemember) {
                        this.m_arrFromScenes.push(this.m_sceneCurrent.m_arrOpenSceneData);
                    }
                }
                console.log("打开-----------场景路由：" + this.m_arrFromScenes);
                this.fromScene = this.m_sceneCurrent.name;
                console.log("fromSceneName: " + this.fromScene);
                if (SceneManager.m_arrSceneToDialog.indexOf(sceneType) == -1 || !GameSetting.usePcUI) {
                    if (this.m_sceneCurrent == this.m_preScene) {
                        this.m_preScene = null;
                    }
                    this.m_sceneCurrent.toScene = sceneType;
                    this.m_sceneCurrent.dispose();
                    this.m_sceneCurrent.removeSelf();
                    this.m_sceneCurrent = null;
                    Laya.loader.clearUnLoaded();
                    SceneLoadMgr.instance.dispose();
                }
                else {
                    this.m_preScene = this.m_sceneCurrent;
                }
                if ((!pushBack && SceneManager.m_arrSceneToDialog.indexOf(sceneType) == -1) && this.m_preScene) {
                    this.m_sceneCurrent = this.m_preScene;
                    this.m_sceneCurrent.toScene = sceneType;
                    this.m_sceneCurrent.dispose();
                    this.m_sceneCurrent.removeSelf();
                    this.m_sceneCurrent = null;
                    Laya.loader.clearUnLoaded();
                    SceneLoadMgr.instance.dispose();
                }
            }
            let sceneItem = SheetDataManager.intance.m_dicScene.get(sceneType);
            if ((sceneItem && sceneItem.music != null) && (sceneItem && sceneItem.music != "0")) {
                console.log("SceneManager.setCurrentScene sceneItem.music: " + sceneItem.music);
                if (!(sceneType == SceneType.M_SCENE_HOME && type == EnumFun.FUN_TV)) {
                    SoundMgr.instance.playMusicByName(sceneItem.music);
                }
            }
            switch (sceneType) {
                case SceneType.M_SCENE_MAIN:
                    {
                        this.m_arrFromScenes = [];
                        GameResourceManager.instance.clearCache();
                        this.m_sceneCurrent = new MainScene("scene/mainbg.jpg");
                        this.enterMainSceneTimes++;
                    }
                    break;
                case SceneType.M_SCENE_FIND:
                    {
                        this.m_sceneCurrent = new FindScene("", true, data);
                    }
                    break;
                case SceneType.M_SCENE_PRE_LOAD:
                    break;
                default:
                    break;
            }
            if (this.m_sceneCurrent && this.m_sceneCurrent.showTopBySelf) {
                this._showTop = this.m_sceneCurrent.showTop;
            }
            this.showTopView(this._showTop);
            Quick.logs("======================  打开Scene: " + sceneType + "  ======================");
            this.m_sceneCurrent.name = sceneType;
            this.m_sceneCurrent.fromScene = this.fromScene;
            this.m_sceneCurrent.m_arrOpenSceneData = [sceneType, showTop, type, data, pushBack, needRemember];
            let layerType = LayerManager.M_SCENE;
            if (SceneManager.m_arrSceneToDialog.indexOf(sceneType) != -1 && GameSetting.usePcUI) {
                layerType = LayerManager.M_PANEL;
            }
            LayerManager.instence.addToLayerAndSet(this.m_sceneCurrent, layerType, LayerManager.LEFTUP);
            if (this.topView && this.topView.topView) {
                if (this.m_sceneCurrent.name == SceneType.M_SCENE_MAIN) {
                }
                else {
                }
            }
        }
        showTopView(showTop) {
            if (showTop) {
                if (this.topView) {
                    if (this.topView.visible == false)
                        this.topView.visible = true;
                    this.isOpening = false;
                    this.topView.topView.headBox.visible = true;
                }
                else {
                    if (this.isOpening == false) {
                        Signal.intance.event(GameEvent.EVENT_OPEN_MODULE, ModuleName.MainTopView);
                        this.isOpening = true;
                    }
                    Laya.timer.frameOnce(5, this, this.showTopView, [showTop]);
                }
            }
            else {
                Laya.timer.clear(this, this.showTopView);
                if (this.topView && this.topView.visible)
                    this.topView.visible = false;
            }
        }
        initPreload() {
            if (!GameSetting.m_bInstantGame) {
                let sceneItem = SheetDataManager.intance.m_dicScene.get(SceneType.M_SCENE_PRE_LOAD);
                if ((sceneItem && sceneItem.music != null) && (sceneItem && sceneItem.music != "0")) {
                    SoundMgr.instance.playMusicByName(sceneItem.music);
                }
            }
            this.m_sceneCurrent = new PreLoadScene(null);
            LayerManager.instence.addToLayerAndSet(this.m_sceneCurrent, LayerManager.M_SCENE, LayerManager.LEFTUP);
        }
        get currSceneName() {
            if (this.m_sceneCurrent) {
                return this.m_sceneCurrent.name;
            }
            return "";
        }
    }
    SceneManager.m_arrSceneToDialog = [];
    SceneManager.m_arrSceneToDialogBG = [SceneType.M_SCENE_SHOP_EXCHANGE, SceneType.M_SCENE_SUIT, SceneType.M_SCENE_BEAUTY_SALON];

    class BaseDialog extends Laya.Box {
        constructor() {
            super();
        }
        init() {
            this.m_iLayerType = LayerManager.M_POP;
            this.m_iPositionType = LayerManager.CENTER;
            this.m_canTouch_all = false;
            this.selfMaskAlpha = -1;
            this.m_arrMapEvent = [];
            this.canClickMask = true;
            this.maskLayer = new Laya.Sprite();
            this.useShowAnimation = true;
            this.useHideAnimation = true;
            this.isAutoRealseRes = true;
            this.m_strSound = SoundMgr.soundName3;
        }
        onClickMask(event) {
            if (this.canClickMask) {
                this.maskClose();
            }
        }
        maskClose() {
            this.close();
        }
        onStageResize() {
            if (this.m_canTouch_all && this._view) {
                this._view.size(Laya.stage.width, Laya.stage.height);
            }
            this.setUiPosition();
        }
        preinitialize() {
            super.preinitialize();
            this.init();
        }
        createChildren() {
            this.addChild(this.maskLayer);
            super.createChildren();
            this.createUI();
        }
        createUI() {
        }
        initialize() {
            super.initialize();
            this._addEvent();
            this.onStageResize();
            this.initData();
            if (this.useShowAnimation) {
                this._view.visible = false;
                this.showAnimationEnd = false;
                Laya.timer.frameOnce(5, this, this.popTimeOut, [this._view]);
            }
            else {
                this.showAnimationEnd = true;
            }
        }
        popTimeOut(_sprite) {
            Laya.timer.clear(this, this.popTimeOut);
            _sprite.scale(0.5, 0.5);
            _sprite.visible = true;
            Laya.Tween.to(_sprite, { scaleX: 1, scaleY: 1, ease: Laya.Ease.backOut }, 300, null, Laya.Handler.create(this, this.onShowAnimationEnd), 2);
            SoundMgr.instance.playSoundByName(this.m_strSound);
            this.event(Laya.Event.OPEN);
        }
        onShowAnimationEnd() {
            this.showAnimationEnd = true;
        }
        _addEvent() {
            this.maskLayer.on(Laya.Event.CLICK, this, this.onClickMask);
            Laya.stage.on(Laya.Event.RESIZE, this, this.onStageResize);
            if (this.btn_com_back) {
                this.btn_com_back.on(Laya.Event.CLICK, this, this.onBack);
            }
            if (this.btn_com_help) {
                this.btn_com_help.on(Laya.Event.CLICK, this, this.onHelp);
            }
            this.addEvent();
        }
        addEvent() {
        }
        initData() {
        }
        _removeEvent() {
            this.maskLayer.offAll();
            Laya.stage.off(Laya.Event.RESIZE, this, this.onStageResize);
            this.removeEvent();
        }
        removeEvent() {
        }
        addMapEvent(target, type, caller, listener, args = null) {
            target.on(type, caller, listener, args);
            this.m_arrMapEvent.push(target);
        }
        removeAllMapEvent() {
            if (!this.m_arrMapEvent) {
                return;
            }
            for (let i = 0; i < this.m_arrMapEvent.length; i++) {
                this.m_arrMapEvent[i].offAll();
            }
            this.m_arrMapEvent.splice(0, this.m_arrMapEvent.length);
        }
        setAnchor(anchorX = 0.5, anchorY = 0.5) {
            this.anchorX = anchorX;
            this.anchorY = anchorY;
        }
        dispose() {
            if (this.newRoleSpr) {
                while (this.newRoleSpr.numChildren > 0) {
                    this.newRoleSpr.removeChildAt(0);
                }
                this.newRoleSpr = null;
            }
            this.isDispose = true;
            ModuleManager.intance.removeViewFromModuleManger(this);
            this.m_strName = null;
            this.m_strSound = null;
            this._removeEvent();
            this.removeAllMapEvent();
            Laya.Tween.clearAll(this._view);
            this.m_arrMapEvent = null;
            if (this.btn_com_back) {
                this.btn_com_back.offAll();
            }
            if (this.btn_com_help) {
                this.btn_com_help.offAll();
            }
            if (this.maskLayer) {
                Laya.timer.clearAll(this.maskLayer);
                Laya.Tween.clearAll(this.maskLayer);
                this.maskLayer.offAll();
                this.maskLayer.graphics.destroy();
                this.maskLayer.removeSelf();
                this.maskLayer.destroy(true);
            }
            if (this.isAutoRealseRes) {
                GameResourceManager.instance.clearModuleUrl(this.m_strName);
            }
            if (this._view) {
                Laya.timer.clearAll(this._view);
                Laya.Tween.clearAll(this._view);
                this._view.offAll();
                this._view.graphics.destroy();
                this._view.removeSelf();
                this._view.destroy(true);
                this._view = null;
            }
            Laya.timer.clearAll(this);
            Laya.Tween.clearAll(this);
            this.offAll();
            this.graphics.destroy();
            this.removeSelf();
            this.destroy(true);
            Signal.intance.event(GameEvent.EVENT_CLOSE_MODULE);
        }
        sendData(cmdId, data = null) {
            if (data == null) {
                data = [];
            }
        }
        setUiPosition() {
            let _posWidth;
            let _posHeight;
            _posWidth = Laya.stage.width;
            _posHeight = Laya.stage.height;
            if (this.maskLayer) {
                this.maskLayer.width = _posWidth;
                this.maskLayer.height = _posHeight;
                this.maskLayer.graphics.clear();
                this.maskLayer.graphics.drawRect(0, 0, _posWidth, _posHeight, UIConfig.popupBgColor);
                this.maskLayer.alpha = this.selfMaskAlpha >= 0 ? this.selfMaskAlpha : UIConfig.popupBgAlpha;
            }
            switch (this.m_iPositionType) {
                case LayerManager.UP:
                    {
                        this._view.x = this.anchorX ? _posWidth / 2 : (_posWidth - this._view.width) / 2;
                        this._view.y = 0;
                    }
                    break;
                case LayerManager.DOWN:
                    {
                        this._view.x = this.anchorX ? _posWidth / 2 : (_posWidth - this._view.width) / 2;
                        this._view.y = _posHeight - this._view.height;
                    }
                    break;
                case LayerManager.LEFT:
                    {
                        this._view.x = 0;
                        this._view.y = this.anchorY ? _posHeight / 2 : (_posHeight - this._view.height) / 2;
                    }
                    break;
                case LayerManager.RIGHT:
                    {
                        this._view.x = _posWidth - this._view.width;
                        this._view.y = this.anchorY ? _posHeight / 2 : (_posHeight - this._view.height) / 2;
                    }
                    break;
                case LayerManager.LEFTUP:
                    {
                        this._view.x = 0;
                        this._view.y = 0;
                    }
                    break;
                case LayerManager.RIGHTUP:
                    {
                        this._view.x = _posWidth - this._view.width;
                        this._view.y = 0;
                    }
                    break;
                case LayerManager.LEFTDOWN:
                    {
                        this._view.x = 0;
                        this._view.y = _posHeight - this._view.height;
                    }
                    break;
                case LayerManager.RIGHTDOWN:
                    {
                        this._view.x = _posWidth - this._view.width;
                        this._view.y = _posHeight - this._view.height;
                    }
                    break;
                case LayerManager.CENTERLEFT:
                    {
                        this._view.x = _posWidth / 2 - this._view.width;
                        this._view.y = this.anchorY ? _posHeight / 2 : (_posHeight - this._view.height) / 2;
                    }
                    break;
                case LayerManager.CENTERRIGHT:
                    {
                        this._view.x = _posWidth / 2;
                        this._view.y = this.anchorY ? _posHeight / 2 : (_posHeight - this._view.height) / 2;
                    }
                    break;
                case LayerManager.CENTER:
                    {
                        this._view.pivotX = this._view.width / 2;
                        this._view.pivotY = this._view.height / 2;
                        this._view.x = this.anchorX ? _posWidth / 2 + this._view.pivotX : (_posWidth - this._view.width) / 2 + this._view.pivotX;
                        this._view.y = this.anchorY ? _posHeight / 2 + this._view.pivotY : (_posHeight - this._view.height) / 2 + this._view.pivotY;
                    }
                    break;
                default:
                    break;
            }
            this._view.x += this.m_ioffsetX;
            this._view.y += this.m_ioffsetY;
        }
        close(type = null) {
            if (this.useHideAnimation && this._view) {
                Laya.Tween.to(this._view, { scaleX: 0.5, scaleY: 0.5, ease: Laya.Ease.backIn }, 200, null, Laya.Handler.create(this, this.dispose, null), 2);
            }
            else {
                this.dispose();
            }
        }
        static closeAll() {
            ModuleManager.intance.closeAll();
        }
        backToPreScene() {
            let preSceneData = SceneManager.intance.getPreSceneData();
            SceneManager.intance.setCurrentScene(preSceneData[0], preSceneData[1], preSceneData[2], preSceneData[3], false);
        }
        get btn_com_back() {
            if (!this._view) {
                return null;
            }
            let backBtn = this._view.getChildByName("btn_com_back");
            return backBtn;
        }
        get btn_com_help() {
            if (!this._view) {
                return null;
            }
            return this._view.getChildByName("btn_com_help");
        }
        onHelp() {
            if (this.m_helpId) {
                ModuleManager.intance.openModule(ModuleName.HelpDialog, this.m_helpId);
            }
        }
        onBack() {
            this.close();
        }
    }

    class ModuleManager {
        constructor() {
            this.views = new Dictionary();
            this.m_arrLoadingArr = [];
            if (ModuleManager._instance) {
                throw new Error("LayerManager是单例,不可new.");
            }
            ModuleManager._instance = this;
        }
        static get intance() {
            if (ModuleManager._instance) {
                return ModuleManager._instance;
            }
            ModuleManager._instance = new ModuleManager();
            return ModuleManager._instance;
        }
        openModule(moduleName, data = null) {
            Signal.intance.event(GameEvent.EVENT_OPEN_MODULE, [moduleName, data]);
        }
        hasOpenView(moduleName) {
            return this.views.get(moduleName) != null;
        }
        getOpenView(moudleName) {
            return this.views.get(moudleName);
        }
        disposeView(moudleName) {
            if (this.getOpenView(moudleName)) {
                let temp = this.getOpenView(moudleName);
                if (temp instanceof Array) {
                    for (let i = 0; i < temp.length; i++) {
                        temp[i].dispose();
                    }
                }
                else {
                    temp.dispose();
                }
            }
        }
        init() {
            Signal.intance.on(GameEvent.EVENT_OPEN_MODULE, this, this.onModulePanel);
        }
        initMainView() {
        }
        onModulePanel(name, data = null) {
            console.log("ModuleManager.onModulePanel moudleName:" + name);
            if (this.m_arrLoadingArr.indexOf(name) != -1) {
                return;
            }
            if (this.getOpenView(name)) {
                return;
            }
            if (GameSetting.m_bInstantGame == true && name == ModuleName.RechargeDialog) {
                let str = GameLanguageMgr.instance.getLanguage(500004);
                AlertManager.instance().AlertByType(AlertType.BASEALERTVIEW, str, AlertType.YES);
                return;
            }
            LoadingManager.instance.showLoading(false);
            this.m_arrLoadingArr.push(name);
            GameResourceManager.instance.loadModuleUrl(name, Laya.Handler.create(this, this.onLoaded, [name, data]));
        }
        onLoaded(className, data = null) {
            let index = this.m_arrLoadingArr.indexOf(className);
            if (index != -1) {
                this.m_arrLoadingArr.splice(index, 1);
            }
            let baseView;
            let compClass = Laya.ClassUtils.getClass(className);
            if (compClass) {
                if (data) {
                    baseView = new compClass(data);
                }
                else {
                    baseView = new compClass();
                }
                baseView.m_strName = className;
            }
            if (baseView instanceof BaseView) {
                LayerManager.instence.addToLayer(baseView, baseView.m_iLayerType);
                LayerManager.instence.setPosition(baseView, baseView.m_iPositionType, baseView.m_ioffsetX, baseView.m_ioffsetY);
                this.addViewToModuleManger(baseView);
            }
            else if (baseView instanceof BaseDialog) {
                let baseDialog = baseView;
                LayerManager.instence.addToLayer(baseDialog, baseDialog.m_iLayerType);
                this.addViewToModuleManger(baseDialog);
            }
            if (baseView) {
                Signal.intance.event(GameEvent.EVENT_MODULE_ADDED, baseView);
            }
            if (!baseView.hideBySelf) {
                LoadingManager.instance.hideLoading();
            }
        }
        addViewToModuleManger(baseView) {
            let viewName = baseView.m_strName;
            if (!this.views.get(viewName)) {
                this.views.set(viewName, baseView);
            }
            else {
                if (this.views.get(viewName) instanceof Array) {
                    this.views.get(viewName).push(baseView);
                }
                else {
                    this.views.set(viewName, [this.views.get(viewName), baseView]);
                }
            }
            baseView.on(Laya.Event.CLOSE, this, this.removeViewFromModuleManger);
        }
        removeViewFromModuleManger(baseView) {
            let viewName = baseView.m_strName;
            if (!this.views || !this.views.get(viewName)) {
                return;
            }
            baseView.off(Laya.Event.CLOSE, this, this.removeViewFromModuleManger);
            let viewDetail = this.views.get(viewName);
            if (viewDetail instanceof Array) {
                let delectIndex = viewDetail.indexOf(baseView);
                if (delectIndex != -1) {
                    viewDetail.splice(delectIndex, 1);
                    if (viewDetail.length == 0) {
                        this.views.remove(viewName);
                    }
                }
            }
            else {
                this.views.remove(viewName);
            }
        }
        closeAll() {
            let temps = [];
            for (let viewDetail of this.views.values) {
                if (viewDetail instanceof Array) {
                    for (let i = 0; i < viewDetail.length; i++) {
                        let viewItemDetail = viewDetail[i];
                        if (viewItemDetail instanceof BaseDialog) {
                            temps.push(viewItemDetail);
                        }
                    }
                }
                else {
                    if (viewDetail instanceof BaseDialog) {
                        temps.push(viewDetail);
                    }
                }
            }
            for (let j = 0; j < temps.length; j++) {
                temps[j].dispose();
            }
            temps = [];
            Laya.Dialog.manager.closeAll();
        }
    }

    class SpotSheetDataManager {
        constructor() {
        }
        static get instance() {
            if (!SpotSheetDataManager._instance) {
                SpotSheetDataManager._instance = new SpotSheetDataManager();
            }
            return SpotSheetDataManager._instance;
        }
        initSpotCfgData() {
            if (this.spotDic == null) {
                this.spotDic = new Dictionary();
                let json = GameResourceManager.instance.getResByURL("config/spot.json");
                let spotInfo;
                for (let value of json) {
                    spotInfo = value;
                    this.spotDic.set(spotInfo.ID + "spot", spotInfo);
                }
            }
        }
        getSpotById(id) {
            this.initSpotCfgData();
            return this.spotDic.get(id + "spot");
        }
        get getSpotDic() {
            this.initSpotCfgData();
            return this.spotDic;
        }
    }

    class PlatFormManager {
        constructor() {
            this.m_bLoginSDKBack = false;
        }
        registerCommCallBack(_callBack = null) {
            AndroidPlatform.instance.FGM_GetLanguage();
            if (!Laya.Render.isConchApp) {
                return;
            }
            let callBackHandler = new Laya.Handler(this, function (_str) {
                if (_callBack) {
                    _callBack.runWith(_str);
                }
                let setLayerTouchEnabled = function (_touchEnabled) {
                    LayerManager.instence.touchEnabled = _touchEnabled;
                };
                if (_str) {
                    let o = JSON.parse(_str);
                    if (o && o.hasOwnProperty("type")) {
                        let type = parseInt(o.type);
                        if (type == 1) {
                            if (o && o.hasOwnProperty("refreshedToken")) {
                                let refreshedToken = o.refreshedToken;
                                if (refreshedToken && refreshedToken != "") {
                                    GameSetting.FCM_Token = refreshedToken;
                                }
                            }
                        }
                        else if (type == 2) {
                            if (o && o.hasOwnProperty("touchEnabled")) {
                                let touchEnabled = o.touchEnabled;
                                if (touchEnabled && touchEnabled == "0") {
                                    setLayerTouchEnabled(false);
                                }
                                else {
                                    Laya.timer.once(50, this, setLayerTouchEnabled, [true]);
                                }
                            }
                        }
                    }
                }
            });
            if (Laya.Browser.onIOS) {
                AndroidPlatform.instance.FGM_RegisterCommCallBack(callBackHandler);
            }
            else if (Laya.Browser.onAndroid) {
                AndroidPlatform.instance.FGM_RegisterCommCallBack(callBackHandler);
            }
            this.FGM_OfflineGuestLogin();
            this.getUDID();
            this.getAppVersion();
            this.getSDKVersion();
            this.getDeviceInfo();
        }
        static get instance() {
            if (!PlatFormManager._instance) {
                PlatFormManager._instance = new PlatFormManager();
            }
            return PlatFormManager._instance;
        }
        login(_callBack) {
            let isGoLogin = false;
            AndroidPlatform.instance.isMaintainace = false;
            if (!Laya.Render.isConchApp) {
                return;
            }
            let _currentLogin;
            _currentLogin = this.onLoginHandle(_callBack, 1);
            let checkCallBack = function () {
                Laya.timer.clear(this, checkCallBack);
                if (isGoLogin || AndroidPlatform.instance.isMaintainace) {
                    return;
                }
                isGoLogin = true;
                AndroidPlatform.instance.FGM_Login(_currentLogin);
            };
            if (Laya.Browser.onIOS) {
                AndroidPlatform.instance.FGM_GetSingleServer(Laya.Handler.create(this, checkCallBack));
            }
            else if (Laya.Browser.onAndroid) {
                if (parseInt(GameSetting.App_Version) >= 1000) {
                    console.log("initGame->--------------------------------登录Andriod平台111111");
                    AndroidPlatform.instance.FGM_GetSingleServer(Laya.Handler.create(this, checkCallBack));
                }
                else {
                    console.log("initGame->--------------------------------登录Andriod平台22222");
                    AndroidPlatform.instance.FGM_Login(_currentLogin);
                }
            }
        }
        getUDID(_callBack = null) {
            if (!Laya.Render.isConchApp) {
                return;
            }
            let _currentLogin = new Laya.Handler(this, function (_str) {
                let spotInfo = new SpotInfo();
                spotInfo.ID = 2;
                spotInfo.Event = "platforminfo";
                spotInfo.platform = 1;
                spotInfo.ad = 1;
                PlatFormManager.instance.sendCustumEvent(2, null, spotInfo);
                GameSetting.Login_UDID = _str;
                if (_callBack) {
                    _callBack.runWith(_str);
                }
            });
            if (Laya.Browser.onIOS) {
                AndroidPlatform.instance.FGM_GetUDID(_currentLogin);
            }
            else if (Laya.Browser.onAndroid) {
                AndroidPlatform.instance.FGM_GetUDID(_currentLogin);
            }
        }
        purchase(productId, price, isCard = false, _callBack = null) {
            if (!Laya.Render.isConchApp) {
                return;
            }
            let _currentLogin = new Laya.Handler(this, function (_str1) {
                let _obj = JSON.parse(_str1);
                if (Laya.Browser.onIOS) {
                    if (_obj && _obj.hasOwnProperty("errCode")) {
                        let errCode = parseInt(_obj.errCode);
                        if (errCode == 214) {
                            NoticeMgr.instance.notice(GameLanguageMgr.instance.getConfigLan(5176));
                            return;
                        }
                        else if (errCode == 215) {
                            NoticeMgr.instance.notice(GameLanguageMgr.instance.getConfigLan(5362) + "!");
                            return;
                        }
                    }
                    if (isCard) {
                        _callBack.runWith(_obj);
                        return;
                    }
                }
                _callBack.runWith(_obj);
            });
            if (Laya.Browser.onIOS) {
                let _obj = new Object();
                _obj["ProductID"] = productId;
                _obj["Para"] = productId + "&" + GameSetting.Login_UDID + "&" + GameSetting.UserAgent;
                _obj["price"] = price;
                _obj["isCard"] = isCard;
                let _str = JSON.stringify(_obj);
                if (isCard) {
                    if (AndroidPlatform.instance.isOldThan("1.0.0")) {
                        let ErrorTips = GameLanguageMgr.instance.getConfigLan(5106);
                        ModuleManager.intance.openModule(ModuleName.ClientErrView, [ErrorTips, 1]);
                    }
                    else {
                        AndroidPlatform.instance.FGM_Purchase(_str, _currentLogin);
                    }
                }
                else {
                    AndroidPlatform.instance.FGM_Purchase(_str, _currentLogin);
                }
            }
            else if (Laya.Browser.onAndroid) {
                if (isCard) {
                    if (parseInt(GameSetting.App_Version) >= 1000) {
                        let _obj = new Object();
                        _obj = { "productId": productId, "isCard": 1 };
                        let _str = JSON.stringify(_obj);
                        AndroidPlatform.instance.FGM_PurchaseByJson(_str, _currentLogin);
                    }
                    else {
                        let ErrorTips = GameLanguageMgr.instance.getConfigLan(5106);
                        ModuleManager.intance.openModule(ModuleName.ClientErrView, [ErrorTips, 1]);
                    }
                }
                else {
                    AndroidPlatform.instance.FGM_Purchase(productId, _currentLogin);
                }
            }
        }
        recharge() {
            let id = "com.marklong.rescuedrop.ios.no_ads";
            if (Laya.Browser.onAndroid) {
                id = "com.marklong.rescuedrop.android.no_ads";
            }
            PlatFormManager.instance.purchase(id, "4.99", false, Laya.Handler.create(this, this.callBack));
        }
        callBack(data) {
            let isFail = false;
            let errCode;
            if (Laya.Browser.onIOS) {
                isFail = data.hasOwnProperty("errCode");
                if (isFail) {
                    errCode = data.errCode;
                }
            }
            else if (Laya.Browser.onAndroid) {
                isFail = data["isSuc"] == false;
            }
            if (isFail) {
                if (Laya.Browser.onAndroid) {
                    NoticeMgr.instance.notice("Error：" + data["msg"]);
                }
            }
            else {
                GameUserInfo.instance.isRecharged = "1";
                Signal.intance.event(GameEvent.EVENT_RECHARGED_TIP);
                Signal.intance.event(GameEvent.EVENT_RECHARGED);
            }
        }
        FGM_OfflineGuestLogin() {
            if (!Laya.Render.isConchApp) {
                return;
            }
            let _callBack = new Laya.Handler(this, function (_str1) {
            });
            let _currentLogin = this.onLoginHandle(_callBack, 1);
            if (Laya.Browser.onIOS) {
                AndroidPlatform.instance.FGM_OfflineGuestLogin(_currentLogin);
            }
            else if (Laya.Browser.onAndroid) {
                AndroidPlatform.instance.FGM_OfflineGuestLogin(_currentLogin);
            }
        }
        bindingAccount(_type, _callBack) {
            if (!Laya.Render.isConchApp) {
                return;
            }
            let _currentLogin;
            _currentLogin = this.onLoginHandle(_callBack, 3);
            if (Laya.Browser.onIOS) {
                let _obj = new Object();
                _obj["type"] = _type;
                let str = JSON.stringify(_obj);
                AndroidPlatform.instance.FGM_BindingAccount(str, _currentLogin);
            }
            else if (Laya.Browser.onAndroid) {
                AndroidPlatform.instance.FGM_BindingAccount(_type, _currentLogin);
            }
        }
        sendCustumEvent(spotId, parameters = null, _spotInfo = null) {
            let spotInfo;
            if (_spotInfo) {
                spotInfo = _spotInfo;
            }
            else {
                spotInfo = SpotSheetDataManager.instance.getSpotById(spotId);
            }
            if (!spotInfo || !spotInfo.Event) {
                return;
            }
            this.sendWebEvent(spotInfo.Event);
            if (!Laya.Render.isConchApp) {
                return;
            }
            let parametersStr;
            if (Laya.Browser.onIOS) {
                let _obj = new Object();
                _obj["eventKey"] = spotInfo.Event;
                _obj["isPf"] = spotInfo.platform;
                _obj["isAd"] = spotInfo.ad;
                _obj["needUid"] = spotInfo.needUid;
                _obj["type"] = spotInfo.type;
                _obj["category"] = spotInfo.Event;
                if (spotInfo.adType) {
                    _obj["action"] = spotInfo.adType;
                }
                else {
                    _obj["action"] = spotInfo.Event;
                }
                _obj["adcode"] = spotInfo.adcode;
                if (spotInfo.to_name) {
                    _obj["to_name"] = spotInfo.to_name;
                }
                _obj["serverid"] = GameSetting.ServerId;
                if (parameters) {
                    parametersStr = JSON.stringify(parameters);
                }
                _obj["parameters"] = parametersStr;
                let str = JSON.stringify(_obj);
                AndroidPlatform.instance.FGM_CustumEvent(str);
            }
            else if (Laya.Browser.onAndroid) {
                let _obj = new Object();
                _obj["eventKey"] = spotInfo.Event;
                _obj["isPf"] = parseInt(spotInfo.platform + "") == 1 ? true : false;
                _obj["isAd"] = parseInt(spotInfo.ad + "") == 1 ? true : false;
                _obj["needUid"] = spotInfo.needUid;
                _obj["type"] = spotInfo.type;
                _obj["category"] = spotInfo.Event;
                if (spotInfo.adType) {
                    _obj["action"] = spotInfo.adType;
                }
                else {
                    _obj["action"] = spotInfo.Event;
                }
                _obj["adcode"] = spotInfo.adcode;
                if (spotInfo.to_name) {
                    _obj["to_name"] = spotInfo.to_name;
                }
                _obj["serverid"] = GameSetting.ServerId;
                if (parameters) {
                    parametersStr = JSON.stringify(parameters);
                }
                _obj["parameters"] = parametersStr;
                let str = JSON.stringify(_obj);
                AndroidPlatform.instance.FGM_CustumEvent(str);
            }
        }
        sendWebEvent(eventName) {
            return;
            if (GameSetting.isPC || GameSetting.m_bInstantGame) {
                let parm = "sep=" + eventName + "&open_id=" + GameUserInfo.GAME_TOKEN + "&platform=" + GameSetting.UserAgent + "&server_id=" + GameSetting.ServerId + "&game_id=" + GameSetting.Plantform_APPID + "&type=guide";
                let httpReq = new Laya.HttpRequest();
                httpReq.send("https://upload.mutantbox.com/SendMessage.php?" + parm);
                console.log("initgame-->发送web埋点事件" + eventName);
            }
        }
        onLoginHandle(_callBack, type = 1) {
            let _currentLogin = new Laya.Handler(this, function (_str) {
                let _obj = JSON.parse(_str);
                let isFail = false;
                let errCode;
                if (Laya.Browser.onIOS) {
                    isFail = _obj.hasOwnProperty("errCode");
                    if (isFail) {
                        errCode = _obj.errCode;
                    }
                }
                else if (Laya.Browser.onAndroid) {
                    isFail = _obj["isSuc"] == false;
                }
                if (isFail) {
                    console.log("FGM_OfflineGuestLogin +++++++ request again");
                    Laya.timer.once(1000, this, this.FGM_OfflineGuestLogin);
                    this.m_bLoginSDKBack = false;
                    if (PreLoadingView.m_iState == 1) {
                        _callBack.run();
                    }
                    else {
                        if (type == 1) {
                        }
                        else if (type == 2) {
                            if (Laya.Browser.onIOS) {
                                if (errCode == 7) {
                                    NoticeMgr.instance.notice(GameLanguageMgr.instance.getConfigLan(5053));
                                }
                            }
                        }
                        else if (type == 3) {
                            if (Laya.Browser.onIOS) {
                                if (errCode == 7) {
                                    NoticeMgr.instance.notice(GameLanguageMgr.instance.getConfigLan(5052));
                                }
                                else {
                                    NoticeMgr.instance.notice(GameLanguageMgr.instance.getConfigLan(5054));
                                }
                            }
                        }
                    }
                }
                else {
                    if (type == 1) {
                    }
                    else if (type == 2) {
                    }
                    this.m_bLoginSDKBack = true;
                    let strPlatform;
                    if (Laya.Browser.onIOS) {
                        GameSetting.LoginType = _obj["currentChannel"];
                        GameSetting.Login_Token = _obj["token"];
                        GameSetting.Login_UID = _obj["uid"];
                        GameSetting.Login_UserName = _obj["username"];
                        if (_obj.hasOwnProperty("channel")) {
                            strPlatform = _obj["channel"];
                        }
                        else if (_obj.hasOwnProperty("platform")) {
                            strPlatform = _obj["platform"];
                        }
                    }
                    else if (Laya.Browser.onAndroid) {
                        let typeProvider = "";
                        GameSetting.LoginType = typeProvider;
                        GameSetting.Login_Token = _obj["token"];
                        GameSetting.Login_UID = _obj["userId"];
                        GameSetting.Login_UserName = _obj["userName"];
                        strPlatform = _obj["platform"];
                    }
                    if (strPlatform instanceof Array) {
                        GameSetting.UserBanding = strPlatform;
                    }
                    else {
                        let arrPlatform;
                        GameSetting.UserBanding = arrPlatform;
                    }
                    if (Laya.Browser.onAndroid) {
                        for (let i = 0; i < GameSetting.UserBanding.length; i++) {
                            if (GameSetting.UserBanding[i] == "gw") {
                                GameSetting.UserBanding[i] = "mutantbox";
                            }
                        }
                    }
                    _callBack.run();
                }
            });
            return _currentLogin;
        }
        getAppVersion(_callBack = null) {
            if (!Laya.Render.isConchApp) {
                return;
            }
            let callBackHandler = new Laya.Handler(this, function (_str) {
                GameSetting.App_Version = _str;
                if (_callBack) {
                    _callBack.runWith(_str);
                }
                this.FGM_SetGameVersion();
                Laya.timer.once(10, this, this.FGM_GetFCMToken);
                AndroidPlatform.instance.FGM_GetIsRelease();
            });
            if (Laya.Browser.onIOS) {
                AndroidPlatform.instance.FGM_GetAppVersion(callBackHandler);
            }
            else if (Laya.Browser.onAndroid) {
                AndroidPlatform.instance.FGM_GetAppVersion(callBackHandler);
            }
        }
        FGM_SetGameVersion() {
            AndroidPlatform.instance.FGM_SetGameVersion();
        }
        FGM_GetFCMToken() {
            AndroidPlatform.instance.FGM_GetFCMToken();
        }
        getSDKVersion(_callBack = null) {
            if (!Laya.Render.isConchApp) {
                return;
            }
            let callBackHandler = new Laya.Handler(this, function (_str) {
                GameSetting.SDK_Version = _str;
                if (_callBack) {
                    _callBack.runWith(_str);
                }
            });
            AndroidPlatform.instance.FGM_GetSDKVersion(callBackHandler);
        }
        openAppStore(_callBack = null) {
            if (!Laya.Render.isConchApp) {
                return;
            }
            let callBackHandler = new Laya.Handler(this, function (_str) {
                if (_callBack) {
                    _callBack.runWith(_str);
                }
            });
            if (Laya.Browser.onIOS) {
                AndroidPlatform.instance.FGM_OpenAppStore(callBackHandler);
            }
            else if (Laya.Browser.onAndroid) {
                AndroidPlatform.instance.FGM_OpenAppStore(callBackHandler);
            }
        }
        getDeviceInfo(_callBack = null) {
            if (!Laya.Render.isConchApp) {
                return;
            }
            let callBackHandler = new Laya.Handler(this, function (_str) {
                GameSetting.Device_Info = _str;
                if (_callBack) {
                    _callBack.runWith(_str);
                }
            });
            if (Laya.Browser.onIOS) {
                AndroidPlatform.instance.FGM_GetDeviceInfo(callBackHandler);
            }
            else if (Laya.Browser.onAndroid) {
                AndroidPlatform.instance.FGM_GetDeviceInfo(callBackHandler);
            }
        }
        openSupport(_callBack = null) {
            if (!Laya.Render.isConchApp) {
                return;
            }
            let callBackHandler = new Laya.Handler(this, function (_str) {
                if (_callBack) {
                    _callBack.runWith(_str);
                }
            });
            if (Laya.Browser.onIOS) {
                AndroidPlatform.instance.FGM_OpenSupport(callBackHandler);
            }
            else if (Laya.Browser.onAndroid) {
                AndroidPlatform.instance.FGM_OpenSupport(callBackHandler);
            }
        }
        netTest(index = 1) {
            if (!Laya.Render.isConchApp || GameSetting.m_bInstantGame) {
                return;
            }
            let url;
            url = "https://cdn.clothesforever.com/cdntest.png";
            if (url.indexOf("https:") < 0) {
                return;
            }
            let _obj = new Object();
            _obj["url"] = url;
            _obj["type"] = index;
            let str = JSON.stringify(_obj);
            if (Laya.Browser.onIOS) {
                if (AndroidPlatform.instance.isOldThan("1.0.0")) {
                }
                else {
                    AndroidPlatform.instance.FGM_NetTest(str);
                }
            }
            else if (Laya.Browser.onAndroid) {
                if (parseInt(GameSetting.App_Version) >= 1000) {
                    AndroidPlatform.instance.FGM_NetTest(str);
                }
            }
        }
        dispose() {
        }
        testEvnt() {
            let arr = SpotSheetDataManager.instance.getSpotDic.values;
            for (let i = 0; i < arr.length; i++) {
                let spotInfo = arr[i];
                if (spotInfo.sendType == 2) {
                    this.sendCustumEvent(spotInfo.ID);
                }
            }
        }
    }

    class UnpackMgr {
        constructor() {
        }
        static get instance() {
            if (!UnpackMgr._instance) {
                UnpackMgr._instance = new UnpackMgr();
            }
            return UnpackMgr._instance;
        }
        initUnpackRes(obj) {
            this.unpackResDic = new Dictionary();
            for (let a of obj) {
                this.unpackResDic[a] = GameResourceManager.instance.resRoot(GameSetting.UNPACK_RES_ROOT + a);
            }
        }
    }

    class GameResourceManager {
        constructor() {
            this.mornUIXml = "res/ui.json";
            this.m_arrPreResource = [];
            this.m_arrInitResource = [];
            this.m_arrWomanResource = [];
            this.m_arrManResource = [];
            this.m_arrPetResource = [];
            this.m_objModuleReource = {};
            this.m_objConfigReource = {};
            this.m_commonResource = new Dictionary();
            this.differentUrlRootDic = new Dictionary();
            this.loadingView = Laya.Browser.window.loadingView;
            this.ii = 100;
            if (GameResourceManager._instance) {
                throw new Error("LayerManager是单例,不可new.");
            }
            GameResourceManager._instance = this;
            this.differentUrlRootDic.set("atlas", true);
            this.differentUrlRootDic.set("scene", true);
            this.differentUrlRootDic.set("unpackUI", true);
            this.differentUrlRootDic.set("ui.json", true);
        }
        resRoot(_url, useInstan = true) {
            let resRoot;
            resRoot = GameSetting.APP_RES;
            if (GameSetting.usePcUI && !GameSetting.m_bIsMobWeb) {
                let matchUrl = _url.split("/")[0];
                if (this.differentUrlRootDic.get(matchUrl)) {
                    resRoot = "pcRes/";
                }
            }
            if (GameSetting.m_bInstantGame && useInstan) {
                resRoot = GameResourceManager.M_INSTANT_URL + GameSetting.APP_RES;
            }
            if (_url) {
                resRoot += _url;
            }
            return resRoot;
        }
        static get instance() {
            if (GameResourceManager._instance == null) {
                GameResourceManager._instance = new GameResourceManager();
            }
            return GameResourceManager._instance;
        }
        init() {
            Laya.loader.on(Laya.Event.ERROR, this, this.onError);
            this.initGameLanguage();
        }
        initGameLanguage() {
            GameResourceManager.GameLanguage_URL = this.setResURLByRoot("config/language.json");
            Laya.loader.load(GameResourceManager.GameLanguage_URL, Laya.Handler.create(this, this.initGameResource));
        }
        initGameResource(data) {
            if (data == null) {
                return;
            }
            let obj = GameResourceManager.instance.getResBySetURL(GameResourceManager.GameLanguage_URL);
            GameLanguageMgr.instance.initLanTypes(obj);
            Laya.loader.clearRes(GameResourceManager.GameLanguage_URL);
            Laya.loader.load(GameSetting.GameResource_URL, Laya.Handler.create(this, this.onConfigLoaded));
        }
        onError(err) {
        }
        onConfigLoaded(data) {
            if (!data) {
                return;
            }
            if (GameSetting.IsRelease) {
                if (GameSetting.m_mobileSameWb) {
                    GameSetting.UseGuide = false;
                    GameSetting.buildClickState = true;
                }
                else {
                    if (!ComUtil.IsSetGuid) {
                        GameSetting.UseGuide = true;
                    }
                    if (!ComUtil.IsSetOpen) {
                        GameSetting.buildClickState = false;
                    }
                }
            }
            this.m_arrPreResource = data["initPreload"];
            this.m_arrInitResource = data["initGame"];
            this.m_arrWomanResource = data["womanSkin"];
            this.m_arrManResource = data["manSkin"];
            this.m_arrPetResource = data["petSkin"];
            this.m_objModuleReource = data["initModule"];
            this.m_objConfigReource = data["initConfig"];
            if (!GameSetting.ignoreLang) {
                GlobalDataManager.instance.m_strLanguage = GameLanguageMgr.instance.getLanIdByType(GameSetting.User_Lan);
            }
            this.m_UILang = "config/lang_english" + GlobalDataManager.instance.m_strLanguage + ".json";
            this.m_NomalLang = "config/english" + GlobalDataManager.instance.m_strLanguage + ".json";
            this.m_arrPreResource.push(this.m_UILang);
            this.m_arrPreResource.push(this.m_NomalLang);
            this.initResourceURL(this.m_arrPreResource, true);
            if (this.m_arrPetResource)
                for (let petSkins of (this.m_arrPetResource)) {
                    this.m_arrInitResource.push(petSkins[1]);
                }
            this.initResourceURL(this.m_arrInitResource, true);
            this.clearResUrlByRoot(GameSetting.GameResource_URL, true);
            this.addFont1();
        }
        addFont1() {
            let bitmapFont = new Laya.BitmapFont();
            let url = this.setResURLByRoot("bitmapFont/gothic.fnt");
            bitmapFont.loadFont(url, new Laya.Handler(this, this.onFontLoaded1, [bitmapFont]));
        }
        onFontLoaded1(bitmapFont) {
            bitmapFont.setSpaceWidth(10);
            Laya.Text.registerBitmapFont("gothic", bitmapFont);
            this.addFont2();
        }
        addFont2() {
            let bitmapFont = new Laya.BitmapFont();
            let url = this.setResURLByRoot("bitmapFont/ebrima.fnt");
            bitmapFont.loadFont(url, new Laya.Handler(this, this.onFontLoaded2, [bitmapFont]));
        }
        onFontLoaded2(bitmapFont) {
            bitmapFont.setSpaceWidth(10);
            Laya.Text.registerBitmapFont("ebrima", bitmapFont);
            this.onLoadThreeDimen();
        }
        onLoadThreeDimen() {
            Laya.loader.load(this.m_arrPreResource, Laya.Handler.create(this, this.onPreAssetLoaded), Laya.Handler.create(this, this.onPreAssetPress, null, false));
        }
        onPreAssetPress(value) {
            this.va = (value * 100).toFixed(0);
            if (this.loadingView && this.va < 100) {
                if (this.va > this.m_iPrecess) {
                    this.loadingView.loading(this.va);
                }
            }
        }
        startLoopPress() {
            Laya.timer.frameLoop(2, this, this.setPrePress);
        }
        setPrePress() {
            if (this.loadingView && this.va < 95) {
                if (this.va > this.m_iPrecess || this.m_iPrecess > 90) {
                    Laya.timer.clear(this, this.setPrePress);
                }
                this.m_iPrecess += 1;
                this.loadingView.loading(this.m_iPrecess);
            }
            else {
                Laya.timer.clear(this, this.setPrePress);
            }
        }
        onPreAssetLoaded(loaded) {
            if (!loaded) {
                return;
            }
            Laya.Scene.setUIMap("ui.json");
            let startTime = Laya.Browser.now();
            SpotSheetDataManager.instance.initSpotCfgData();
            PlatFormManager.instance.sendCustumEvent(73);
            let obj = GameResourceManager.instance.getResByURL("ui.json");
            Laya.View.uiMap = obj;
            obj = GameResourceManager.instance.getResByURL("unpack.json");
            UnpackMgr.instance.initUnpackRes(obj);
            this.initResourceURL(this.m_objModuleReource);
            this.initResourceURL(this.m_objConfigReource);
            SheetDataManager.intance.preInit();
            this.setGlobalLanguage();
            this.clearResUrlByRoot("ui.json", true);
            this.clearResUrlByRoot("unpack.json", true);
            SceneManager.intance.initPreload();
            if (this.loadingView) {
                this.loadingView.loading(100);
            }
            console.log("-----------------------preload-time:" + (Laya.Browser.now() - startTime));
        }
        setGlobalLanguage() {
            let obj = GameResourceManager.instance.getResByURL(this.m_NomalLang);
            GameLanguageMgr.instance.initConfigLan(obj);
            let uiArr = GameResourceManager.instance.getResByURL(this.m_UILang);
            GameLanguageMgr.instance.initUILan(uiArr);
            let _data = GameResourceManager.instance.getResByURL(this.m_ErrorLang);
            ErrorPopManager.instance.initErrData(_data);
            this.clearResUrlByRoot(this.m_UILang, true);
            this.clearResUrlByRoot(this.m_NomalLang, true);
            this.clearResUrlByRoot(this.m_ErrorLang, true);
        }
        loadLanguage(completeHandler, progress) {
            let m_arrLanguage = [];
            this.m_UILang = "config/lang_english" + GlobalDataManager.instance.m_strLanguage + ".json";
            this.m_NomalLang = "config/english" + GlobalDataManager.instance.m_strLanguage + ".json";
            m_arrLanguage.push({ url: this.setResURL(this.m_UILang), type: Laya.Loader.JSON });
            m_arrLanguage.push({ url: this.setResURL(this.m_NomalLang), type: Laya.Loader.JSON });
            Laya.loader.load(m_arrLanguage, completeHandler, progress);
        }
        initResourceURL(data, isCommon = false) {
            if (data instanceof Array) {
                this.setResURLArr(data, isCommon);
            }
            else if (data instanceof Object) {
                for (let key in data) {
                    this.setResURLArr(data[key], isCommon);
                }
            }
        }
        setResURLArr(data, isCommon) {
            let defaultType;
            let url;
            for (let i = 0; i < data.length; i++) {
                if (isCommon) {
                    this.m_commonResource.set(data[i], true);
                    url = this.setResURL(data[i]);
                    defaultType = this.getTypeFromUrl(url);
                    data[i] = { url: url, type: defaultType, size: 1, priority: 1 };
                }
                else if (this.m_commonResource.get(data[i])) {
                    data.splice(i, 1);
                    i--;
                }
                else {
                    url = this.setResURL(data[i]);
                    defaultType = this.getTypeFromUrl(url);
                    data[i] = { url: url, type: defaultType, size: 1, priority: 1 };
                }
            }
        }
        getTypeFromUrl(url) {
            GameResourceManager._extReg.lastIndex = url.lastIndexOf(".");
            let result = GameResourceManager._extReg.exec(url);
            if (result && result.length > 1) {
                let type = Laya.Loader.typeMap[result[1].toLowerCase()];
                if (url.indexOf("/atlas/") > -1 && type == Laya.Loader.JSON) {
                    type = Laya.Loader.ATLAS;
                }
                else if (url.indexOf("/effect/") > -1 && type == Laya.Loader.JSON) {
                    type = Laya.Loader.ATLAS;
                }
                return type;
            }
            return "text";
        }
        setResURL(url) {
            let useAni = "common/common_effect/common_useAni";
            if (UnpackMgr.instance.unpackResDic && UnpackMgr.instance.unpackResDic[url] != null) {
                return UnpackMgr.instance.unpackResDic[url];
            }
            if (url && url.indexOf(useAni) >= 0) {
                url = url.substr(url.indexOf(useAni) + useAni.length);
                return UnpackMgr.instance.unpackResDic["common/common_effect/common_useAni"] + url;
            }
            return this.setResURLByRoot(url);
        }
        setResURLByRoot(url) {
            let formatUrl = this.resRoot(url);
            if (GameSetting.m_bInstantGame) {
                let versionStr = Laya.URL.version[GameSetting.APP_RES + url];
                if (!Laya.Render.isConchApp && versionStr) {
                    formatUrl += "?v=" + versionStr + GameSetting.m_strVersionEX;
                }
            }
            return formatUrl;
        }
        clearResUrlByRoot(url, forceDispose = false) {
            let formatUrl = this.resRoot(url);
            if (GameSetting.m_bInstantGame) {
                let versionStr = Laya.URL.version[GameSetting.APP_RES + url];
                if (!Laya.Render.isConchApp && versionStr) {
                    formatUrl += "?v=" + versionStr + GameSetting.m_strVersionEX;
                }
            }
            Laya.loader.clearRes(formatUrl);
        }
        hasFormatEffectUrl(url) {
            if (url.indexOf("effect/") >= 0) {
                return true;
            }
            else {
                return false;
            }
        }
        setItemResURL(value) {
            if (value && value.hasOwnProperty("item_img")) {
                return this.setResURL("icon/" + value["item_img"] + ".png");
            }
            else {
                return "";
            }
        }
        setBigPetItemResURL(value) {
            if (value && value.hasOwnProperty("item_img")) {
                let str = value["item_img"];
                str = str.replace("pet/", "petBig/");
                return this.setResURL("icon/" + str + ".png");
            }
            else {
                return "";
            }
        }
        setChapterIconUrl(_item) {
            if (_item) {
                return this.setResURL("icon/chapterIcon/" + _item.img + ".jpg");
            }
            else {
                return "";
            }
        }
        setThreeDimenUrl(str) {
            if (str) {
                return this.setResURL("threeDimen/" + str);
            }
            else {
                return "";
            }
        }
        getThreeDimenUrl(str) {
            let targetURL = this.setResURL("threeDimen/" + str);
            let data = Laya.Loader.getRes(targetURL);
            return data;
        }
        getResByURL(url) {
            let targetURL = GameResourceManager.instance.setResURL(url);
            let data = Laya.Loader.getRes(targetURL);
            return data;
        }
        getResBySetURL(url) {
            let data = Laya.Loader.getRes(url);
            return data;
        }
        loadModuleUrl(name, complete = null, type = null, priority = 1, cache = true) {
            this.ii++;
            let urlArr = GameResourceManager.instance.m_objModuleReource[name];
            if (urlArr == null || urlArr.length < 1) {
                complete.run();
                return;
            }
            Laya.loader.load(urlArr, Laya.Handler.create(this, this.loadItemComplete, [complete, urlArr]), Laya.Handler.create(this, this.onLoadProgress, [name], false), type, priority, cache, this.ii.toString());
        }
        loadItemComplete(value, urlArr) {
            value.run();
            if (!this.usedUrlDic) {
                this.usedUrlDic = new Dictionary();
            }
            for (let a in urlArr) {
                let urlStrKey = urlArr[a].url;
                let urlStrValue = this.usedUrlDic.get(urlStrKey);
                if (urlStrValue) {
                    this.usedUrlDic.set(urlStrKey, ++urlStrValue);
                }
                else {
                    this.usedUrlDic.set(urlStrKey, 1);
                }
            }
        }
        clearModuleUrl(m_strName) {
            let urlArr = GameResourceManager.instance.m_objModuleReource[m_strName];
            for (let a in urlArr) {
                let urlStrKey = urlArr[a].url;
                if (this.usedUrlDic) {
                    let urlStrValue = this.usedUrlDic.get(urlStrKey);
                    urlStrValue -= 1;
                    if (urlStrValue < 1) {
                        this.usedUrlDic.remove(urlStrKey);
                        Laya.loader.clearRes(urlStrKey);
                    }
                    else {
                        this.usedUrlDic.set(urlStrKey, urlStrValue);
                    }
                }
            }
        }
        onLoadProgress(name, progress) {
        }
        loadResource(url, complete = null, progress = null, type = null, priority = 1, cache = true) {
            Laya.loader.load(url, complete, progress, type, priority, cache);
        }
        getIconUrlFromAtals(atlas, name) {
            let url = this.setResURL("icon/" + atlas + "/" + name + ".png");
            return url;
        }
        getConsumeconUrl(consumeType) {
            var item = SheetDataManager.intance.m_dicItems.get(consumeType);
            return item ? this.getIconUrl(item.item_img) : "";
        }
        getIconUrl(name) {
            let url = this.setResURL("icon/" + name + ".png");
            return url;
        }
        getIconByName(name) {
            let url = this.setResURL("icon/" + name);
            return url;
        }
        getYifuIconUrl(name) {
            let url = this.setResURL("icon/" + name + ".png");
            return url;
        }
        getSkinSetUrl(atlas, name, isNew) {
            let _skin = isNew ? "skin2" : "skin";
            let url = this.setResURL(_skin + "/" + atlas + "/" + name + ".png");
            return url;
        }
        getSkinByName(name, isNew) {
            let _skin = isNew ? "skin2" : "skin";
            let url = this.setResURL(_skin + "/" + name + ".png");
            return url;
        }
        getNpcHeadUrl(name) {
            let url = this.setResURL("icon/NPCpotrait/" + name + ".png");
            return url;
        }
        getMallUrl(name) {
            let url = this.setResURL("scene/mall/" + name + ".png");
            return url;
        }
        getClotTypeUrl(name) {
            let url = this.setResURL("icon/closet_type/" + name + ".png");
            return url;
        }
        getClotTypeMatchUrl(name) {
            let url = this.setResURL("icon/clothes_part/" + name + ".png");
            return url;
        }
        getPosterUrl(name) {
            let url = this.setResURL("icon/poster/" + name + ".png");
            return url;
        }
        getDrawColorUrl(name, isSmall = false) {
            let url;
            if (isSmall) {
                url = this.setResURL("icon/drawColorSmall/" + name + ".png");
            }
            else {
                url = this.setResURL("icon/drawColor/" + name + ".png");
            }
            return url;
        }
        getSceneBgUrl(sceneUrl) {
            let url = "scene/" + sceneUrl + ".jpg";
            return url;
        }
        clearSKinUrl(roleSkinUrlArr) {
            for (let a in roleSkinUrlArr) {
                if (roleSkinUrlArr[a] instanceof String && roleSkinUrlArr[a].indexOf("skincolor") == -1) {
                    Laya.loader.clearRes(roleSkinUrlArr[a]);
                }
            }
            roleSkinUrlArr = [];
        }
        getStyleIcon(icon) {
            let url = this.setResURL("icon/style_type/" + icon + ".png");
            return url;
        }
        getFunctionIcon(icon) {
            let url = this.setResURL("icon/functionIcon/" + icon + ".png");
            return url;
        }
        getNewFunIcon(icon) {
            return this.setResURL("icon/newFunIcon/" + icon + ".png");
        }
        getPotriatIcon(data) {
            if (data == 0) {
                data = 1;
            }
            let url = GameResourceManager.instance.setResURL("icon/roleIcon/potrait_" + data + ".png");
            return url;
        }
        getGradeIcon(data) {
            if (data == 0) {
                data = 7;
            }
            let url = GameResourceManager.instance.setResURL("icon/taylorSwift/icon_" + data + ".png");
            return url;
        }
        getStageIcon(data) {
            if (data == 0) {
                data = 1;
            }
            let url = GameResourceManager.instance.setResURL("icon/pvpMulti/icon_" + data + ".png");
            return url;
        }
        getSceneIcon(data) {
            let url = GameResourceManager.instance.setResURL("icon/sceneIcon/" + data + ".png");
            return url;
        }
        getPotriatDiIcon(data) {
            let urlDi = GameResourceManager.instance.setResURL("icon/roleIcon/potraitbg_" + data + ".png");
            return urlDi;
        }
        getAttributeIcon(bgId) {
            let url = GameResourceManager.instance.setResURL("icon/attrubute/" + bgId + ".png");
            return url;
        }
        getCustomerImg(icon) {
            let url = GameResourceManager.instance.setResURL("icon/customer_potrait/" + icon + ".png");
            return url;
        }
        getSoundURL(name, pix = ".ogg") {
            let url;
            if (GameSetting.m_bInstantGame) {
                url = GameSetting.APP_RES + "mp3/" + name + pix;
            }
            else {
                url = this.setResURL("mp3/" + name + pix);
            }
            return url;
        }
        getSoundURLogg(name) {
            let url;
            if (GameSetting.m_bInstantGame) {
                url = GameSetting.APP_RES + "mp3/" + name;
            }
            else {
                url = this.setResURL("mp3/" + name);
            }
            return url;
        }
        getSceneUrl(sceneId) {
            return "scene/sceneBg/" + sceneId + ".jpg";
        }
        getMianSysIcon(functionId) {
            let url = this.setResURL("icon/mainSysIcon/" + "btn_" + functionId + ".png");
            return url;
        }
        getEffectUrl(effectName) {
            let url = this.setResURL("effect/" + effectName + ".json");
            return url;
        }
        getGuangImg(img) {
            let url = this.setResURL("swf/" + img + ".png");
            return url;
        }
        getGuildIcon(icon) {
            let iconStr = icon.toString();
            while (iconStr.length < 4) {
                iconStr = "0" + iconStr;
            }
            return this.setResURL("icon/guildIcon/img_" + iconStr + "_logo" + (icon + 1) + ".png");
        }
        getGuildLevelIcon(level) {
            switch (level) {
                case 1:
                    {
                        return "Guild/img_0059_gongzuoshi.png";
                    }
                    break;
                case 2:
                    {
                        return "Guild/img_0059_xiaogongsi.png";
                    }
                    break;
                case 3:
                    {
                        return "Guild/img_xiaoqiye.png";
                    }
                    break;
                case 4:
                    {
                        return "Guild/img_0059_zhongxing.png";
                    }
                    break;
                case 5:
                    {
                        return "Guild/img_0059.png";
                    }
                    break;
                default:
                    {
                        return "";
                    }
                    break;
            }
        }
        getGuildProofBg(picId) {
            return this.setResURL("scene/guild/proof/" + picId + "/" + 1 + ".png");
        }
        getGuildProofHots(picId) {
            return this.setResURL("scene/guild/proof/" + picId + "/" + picId + "/" + picId + ".json");
        }
        getShareImgUrl(imgUrl, isInstantGame = false, isVideo = false) {
            let shareUrl;
            if (isVideo) {
                return imgUrl;
            }
            else {
                imgUrl = imgUrl + ".jpg";
            }
            if (isInstantGame) {
                shareUrl = "https://mutantbox.8686c.com/16/qa/common/share/" + imgUrl;
            }
            else {
                shareUrl = "https://cdn.clothesforever.com/16/qa/common/share/" + imgUrl;
            }
            return shareUrl;
        }
        getHeadUrl(_head) {
            return "common/common_icon/" + _head + ".png";
        }
        clearCache() {
        }
    }
    GameResourceManager.M_INSTANT_URL = "https://mutantbox.8686c.com/16/sn/h5/";
    GameResourceManager.M_WEB_URL = "https://image.movemama.com/meimei/web/qa/h5/";
    GameResourceManager._extReg = /\.(\w+)\??/g;

    class BuyItemConfirmView extends BaseDialog {
        constructor(...args) {
            super();
            this.destroyDoCancel = true;
            this._okHandler = args[0][1];
            this._cancelHandler = args[0][2];
            this._desc = args[0][0];
        }
        createUI() {
            this._view = new MornUI.BaseAlert.BaseAlertViewUI();
            this.addChild(this._view);
            this.view.cancleBtn.skin = "common/common_btn/btn_02.png";
            this.view.okBtn.label = "Buy";
            this.view.cancleBtn.label = "Cancle";
            let x = this.view.okBtn.x;
            this.view.okBtn.x = this.view.cancleBtn.x;
            this.view.cancleBtn.x = x;
            this.view.alertDesc.text = this._desc;
            this._view.on(Laya.Event.CLICK, this, this.onClickEvent);
        }
        get view() {
            return this._view;
        }
        onClickEvent(e) {
            let target = e.target;
            if (target.name == "okBtn") {
                this._okHandler && this._okHandler.runWith(null);
                this.close();
            }
            else if (target.name == "cancleBtn") {
                this.destroyDoCancel = false;
                this._cancelHandler && this._cancelHandler.runWith(null);
                this.close();
            }
        }
        removeSelf() {
            if (this.destroyDoCancel && this._cancelHandler) {
                this._cancelHandler.run();
            }
            return super.removeSelf();
        }
    }

    class ClientErrView extends BaseDialog {
        constructor(arr = null) {
            super();
            this.m_iType = 0;
            if (arr && arr.length > 0) {
                this.m_strTxt = arr[0];
                this.m_iType = parseInt(arr[1]);
            }
            if (this.m_iType != 1) {
            }
            this.m_iLayerType = LayerManager.M_TOP;
            this.canClickMask = false;
        }
        get view() {
            return this._view;
        }
        dispose() {
            super.dispose();
            if (this.m_iType != 1) {
                GameSetting.intance.reloadGame();
            }
        }
        createUI() {
            this._view = new MornUI.BaseAlert.ClientErrViewUI();
            this.addChild(this._view);
            this.view.alertDesc.text = this.m_strTxt;
            this.addMapEvent(this.view.okBtn, Laya.Event.CLICK, this, this.click_okHandler);
        }
        click_okHandler(evt) {
            switch (this.m_iType) {
                case 1:
                    {
                        this.close();
                    }
                    break;
                default:
                    {
                        GameSetting.intance.reloadGame();
                    }
                    break;
            }
        }
    }

    class QuickRechargeDialog extends BaseDialog {
        constructor(_callBack) {
            super();
            this.callBack = _callBack;
        }
        get view() {
            return this._view;
        }
        createUI() {
            this._view = new MornUI.tvstart.QuickRechargeDialogUI();
            this.addChild(this._view);
            this.initView();
        }
        initView() {
            if (!Laya.Browser.onIOS) {
                this.view.txt_1.text = "GBP 9.99";
                this.view.btn_recharge.label = "GBP 0.99";
            }
            else {
                this.view.txt_1.text = "$ 9.99";
                this.view.btn_recharge.label = "$ 0.99";
            }
            this.view.btn_recharge.clickHandler = new Laya.Handler(this, this.recharge);
        }
        recharge() {
            GameUserInfo.instance.recharge();
        }
        addEvent() {
            Signal.intance.on(GameEvent.EVENT_RECHARGED, this, this.update);
        }
        removeEvent() {
            Signal.intance.off(GameEvent.EVENT_RECHARGED, this, this.update);
        }
        update() {
            if (GameUserInfo.instance.isRecharged == "1") {
                this.close();
            }
        }
        dispose() {
            if (this.callBack) {
                this.callBack.runWith(1);
            }
            super.dispose();
        }
    }

    class QuickOperatorDialog extends BaseView {
        constructor() {
            super();
        }
        init() {
            super.init();
            this.totalTime = 3;
        }
        get view() {
            return this._view;
        }
        createUI() {
            this._view = new MornUI.tvstart.QuickOperatorDialogUI();
            this.addChild(this._view);
            super.initialize();
            this.view.label_reduce.text = this.totalTime + "S";
            Laya.timer.loop(1000, this, this.setTime);
        }
        setTime() {
            this.totalTime--;
            if (this.totalTime < 0) {
                Laya.timer.clear(this, this.setTime);
                this.onNext();
                return;
            }
            this.view.label_reduce.text = this.totalTime + "S";
        }
        destroy(destroyChild = true) {
            super.destroy(destroyChild);
        }
        addEvent() {
            super.addEvent();
            this.view.btn_next.on(Laya.Event.CLICK, this, this.onNext);
        }
        onNext() {
            Signal.intance.event(FindEvent.EVENT_START);
            this.dispose();
        }
        dispose() {
            super.dispose();
        }
        removeEvent() {
            super.removeEvent();
        }
    }

    class QuickTipDialog extends BaseView {
        constructor() {
            super();
        }
        init() {
            super.init();
        }
        get view() {
            return this._view;
        }
        createUI() {
            this._view = new MornUI.tvstart.QuickTipDialogUI();
            this.addChild(this._view);
            super.initialize();
            this.view.panel_reward.vScrollBar.visible = false;
        }
        destroy(destroyChild = true) {
            super.destroy(destroyChild);
        }
        addEvent() {
            super.addEvent();
            this.view.btn_next.on(Laya.Event.CLICK, this, this.onNext);
        }
        onNext() {
            SceneManager.intance.setCurrentScene(SceneType.M_SCENE_FIND);
            this.dispose();
        }
        dispose() {
            super.dispose();
        }
        removeEvent() {
            super.removeEvent();
        }
    }

    class GameSettingLanguageDialog extends BaseDialog {
        constructor(_data) {
            super();
        }
        get view() {
            return this._view;
        }
        dispose() {
            super.dispose();
        }
        createUI() {
            this._view = new MornUI.GameSetting.GameSettingLanguageDialogUI();
            this.addChild(this._view);
            this.view.mcLanList.vScrollBarSkin = "";
            this.initContainer();
        }
        onListEvent(e, index) {
            switch (e.type) {
                case Laya.Event.CLICK:
                    {
                        this.view.mcLanList.selectedIndex = index;
                        this.handleSelectLanguage(index);
                    }
                    break;
            }
        }
        initContainer() {
            this.view.mcLanList.vScrollBarSkin = "";
            this.view.mcLanList.mouseHandler = new Laya.Handler(this, this.onListEvent);
            this.view.mcLanList.visible = true;
            this.createLanguageList();
        }
        handleSelectLanguage(index) {
            let vo = this.view.mcLanList.selectedItem.vo;
            AndroidPlatform.instance.FGM_SetLanguage(vo.type);
            AndroidPlatform.instance.reload();
        }
        createLanguageList() {
            let arr = [];
            let m_dicLanguage = GameLanguageMgr.instance.getLanTypes();
            for (let i = 0; i < m_dicLanguage.values.length; i++) {
                let languageItem = m_dicLanguage.values[i];
                if (parseInt(languageItem.if_open) != 1) {
                    continue;
                    ;
                }
                let countryType = parseInt(GameSetting.M_strCountry);
                if (languageItem.Version.indexOf(countryType) == -1 && languageItem.Version.indexOf(countryType + "") == -1) {
                    continue;
                    ;
                }
                let obj = {};
                obj["btnLan"] = { label: languageItem.language };
                obj["mcTag"] = { visible: parseInt(languageItem.ID + "") == GlobalDataManager.instance.m_strLanguage };
                obj["vo"] = languageItem;
                arr.push(obj);
            }
            this.view.mcLanList.dataSource = arr;
            this.view.mcLanList.visible = true;
        }
        addEvent() {
        }
        removeEvent() {
        }
    }

    class GameSettingVersionDialog extends BaseDialog {
        constructor(_data) {
            super();
        }
        get view() {
            return this._view;
        }
        dispose() {
            super.dispose();
        }
        createUI() {
            this._view = new MornUI.GameSetting.GameSettingVersionDialogUI();
            this.addChild(this._view);
            this.view.label_app.text = "app: " + GameSetting.App_Version;
            this.view.label_sdk.text = " sdk: " + GameSetting.SDK_Version;
            this.view.label_game.text = " game: " + GameSetting.Game_Version;
            this.view.label_app.filters = [Quick.GRAY1];
            this.view.label_sdk.filters = [Quick.GRAY1];
            this.view.label_game.filters = [Quick.GRAY1];
        }
    }

    class CreateNameDialog extends BaseDialog {
        constructor() {
            super();
            this.m_ioffsetY = -150;
        }
        createUI() {
            this._view = new MornUI.createNameView.CreateNameViewUI();
            this.addChild(this._view);
            this.view.enterName.prompt = GameLanguageMgr.instance.getUILang("Please enter your nickname");
            this.view.enterName.text = "";
            this.view.enterName.maxChars = 12;
        }
        get view() {
            return this._view;
        }
        addEvent() {
            this.view.enterName.off(Laya.Event.FOCUS, this, this.onFocus);
            this.view.yesBtn.on(Laya.Event.CLICK, this, this.clickYesBtn);
            this.view.noBtn.on(Laya.Event.CLICK, this, this.clickNoBtn);
        }
        onFocus() {
            if (this.view.enterName.prompt == GameLanguageMgr.instance.getUILang("Please enter your nickname")) {
                this.view.enterName.prompt = "";
            }
        }
        removeEvent() {
            this.view.enterName.off(Laya.Event.FOCUS, this, this.onFocus);
            this.view.yesBtn.off(Laya.Event.CLICK, this, this.clickYesBtn);
            this.view.noBtn.off(Laya.Event.CLICK, this, this.clickNoBtn);
        }
        clickYesBtn() {
            let txt = this.view.enterName.text;
            let parameters = new Object();
            parameters["name"] = txt;
            PlatFormManager.instance.sendCustumEvent(5, parameters);
            let txt1;
            if (txt1 && txt1 != "") {
                GameUserInfo.instance.playerName = txt1;
                Signal.intance.event(GameEvent.CHANGE_NAME);
                this.close();
            }
            else {
                NoticeMgr.instance.notice(GameLanguageMgr.instance.getConfigLan(9057));
            }
        }
        clickNoBtn() {
            this.close();
        }
        dispose() {
            super.dispose();
        }
    }

    class RegistClass {
        constructor() {
            if (RegistClass._instance) {
                throw new Error("LayerManager是单例,不可new.");
            }
            RegistClass._instance = this;
        }
        static get intance() {
            if (RegistClass._instance) {
                return RegistClass._instance;
            }
            RegistClass._instance = new RegistClass();
            return RegistClass._instance;
        }
        init() {
            Laya.ClassUtils.regClass(ModuleName.FindView, FindView);
            Laya.ClassUtils.regClass(ModuleName.QuickTipDialog, QuickTipDialog);
            Laya.ClassUtils.regClass(ModuleName.QuickEndView, QuickEndView);
            Laya.ClassUtils.regClass(ModuleName.QuickShareView, QuickShareView);
            Laya.ClassUtils.regClass(ModuleName.QuickOperatorDialog, QuickOperatorDialog);
            Laya.ClassUtils.regClass(ModuleName.QuickRechargeDialog, QuickRechargeDialog);
            Laya.ClassUtils.regClass(AlertType.BASEALERTVIEW, BaseAlertView);
            Laya.ClassUtils.regClass(AlertType.BuyItemConfirmView, BuyItemConfirmView);
            Laya.ClassUtils.regClass(ModuleName.TravelCharpterDialog, TravelCharpterDialog);
            Laya.ClassUtils.regClass(ModuleName.CreateNameDialog, CreateNameDialog);
            Laya.ClassUtils.regClass(ModuleName.GameSettingLanguageDialog, GameSettingLanguageDialog);
            Laya.ClassUtils.regClass(ModuleName.GameSettingVersionDialog, GameSettingVersionDialog);
            Laya.ClassUtils.regClass(ModuleName.PreLoadingView, PreLoadingView);
            Laya.ClassUtils.regClass(ModuleName.ClientErrView, ClientErrView);
            Laya.ClassUtils.regClass(ModuleName.MainTopView, MainTopView);
        }
    }

    class BaseFunList extends Laya.List {
        constructor() {
            super();
            this.funId = "";
            this.tabIndex = 2;
            this.needShowTip = false;
        }
        onCellMouse(e) {
            this.needShowTip = true;
            if (e.type === Laya.Event.MOUSE_OVER || e.type === Laya.Event.MOUSE_OUT) {
                this.needShowTip = false;
            }
            super.onCellMouse(e);
        }
    }

    class Bullet extends Laya.Script {
        constructor() { super(); }
        onEnable() {
            var rig = this.owner.getComponent(Laya.RigidBody);
            rig.setVelocity({ x: 0, y: -10 });
        }
        onTriggerEnter(other, self, contact) {
            this.owner.removeSelf();
        }
        onUpdate() {
            if (this.owner.y < -10) {
                this.owner.removeSelf();
            }
        }
        onDisable() {
            Laya.Pool.recover("bullet", this.owner);
        }
    }

    class GameConfig {
        constructor() { }
        static init() {
            var reg = Laya.ClassUtils.regClass;
            reg("script/Car.ts", Car);
            reg("game/module/mainui/MainIconView.ts", MainIconView);
            reg("game/common/base/BaseFunList.ts", BaseFunList);
            reg("script/Bullet.ts", Bullet);
        }
    }
    GameConfig.width = 640;
    GameConfig.height = 1136;
    GameConfig.scaleMode = "fixedwidth";
    GameConfig.screenMode = "none";
    GameConfig.alignV = "top";
    GameConfig.alignH = "left";
    GameConfig.startScene = "MainView/MainView.scene";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = false;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;
    GameConfig.init();

    class Main {
        constructor() {
            if (window["Laya3D"])
                Laya3D.init(GameConfig.width, GameConfig.height);
            else
                Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
            Laya["Physics"] && Laya["Physics"].enable();
            Laya["DebugPanel"] && Laya["DebugPanel"].enable();
            Laya.stage.scaleMode = GameConfig.scaleMode;
            Laya.stage.screenMode = GameConfig.screenMode;
            Laya.stage.alignV = GameConfig.alignV;
            Laya.stage.alignH = GameConfig.alignH;
            Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;
            if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true")
                Laya.enableDebugPanel();
            if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"])
                Laya["PhysicsDebugDraw"].enable();
            if (GameConfig.stat)
                Laya.Stat.show();
            Laya.alertGlobalError(true);
            console.log("version: " + Laya.version);
            Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
        }
        onVersionLoaded() {
            Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
        }
        onConfigLoaded() {
            this.init();
        }
        init() {
            RegistClass.intance.init();
            LayerManager.instence.init();
            SceneManager.intance.init();
            LoadingManager.instance.init();
            SceneLoadingManager.instance.init();
            ModuleManager.intance.init();
            GlobalDataManager.instance.init();
            GameResourceManager.instance.init();
        }
    }
    new Main();

}());
