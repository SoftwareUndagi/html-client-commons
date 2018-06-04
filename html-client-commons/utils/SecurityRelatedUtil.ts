import { CommonClientData, SecurityData, } from 'core-client-commons/index';
import { CommonCommunicationData } from 'core-client-commons/index';
import { ajaxhelper } from './ajaxhelper';
import { isNull } from './CommonUtils';

export class SecurityRelatedUtil {

    /**
     * kode locale default. kalau belum di set 
     */
    static DEFAULT_LOCALE_CODE: string = 'id';

    /**
     * data security. di mana data akan di keep dalam window
     */
    static USER_LOGIN_INFO_HOLDER_KEY = "application_security_login_info";

    /**
     * key untuk ip address dari current user
     */
    static CURRENT_LOGIN_IP_ADDRESSS_KEY: string = 'application_security_current_ip'

    /**
     * untuk menaruh locale yang ada dalam config
     */
    static LOCALE_INFO_HOLDER_KEY = "application_locale_info";

    /**
     * key utnuk current login unit of work
     */
    static KEY_FOR_UNIT_OF_WORK = 'application_current_unit_of_work';

    /**
     * kode locale yang sedang di pilih
     */
    static SELECTED_LOCALE_KEY = "application_current_locale_code";

    /**
     * flag data login sudah di proses atau belum
     */
    static LOGIN_PROCESSED: boolean = false;
    /**
     * handler custom untuk navigate login
     */
    static customNavigateLoginHandler: () => any;

    /**
     * current locale code yang di pilih ole user
     */
    static getLocaleCode(): string {
        let swap: any = window[SecurityRelatedUtil.SELECTED_LOCALE_KEY];
        if (isNull(swap)) {
            if (!isNull(window[SecurityRelatedUtil.SELECTED_LOCALE_KEY]) && !isNull(window[SecurityRelatedUtil.SELECTED_LOCALE_KEY].localeCode) && window[SecurityRelatedUtil.SELECTED_LOCALE_KEY].localeCode.length > 0) {
                swap = window[SecurityRelatedUtil.SELECTED_LOCALE_KEY].localeCode;
            } else {
                swap = SecurityRelatedUtil.DEFAULT_LOCALE_CODE;
            }
        }
        return swap;
    }
    /**
     * set locale untuk di pilih
     * @param code 
     */
    static setLocale(code: string) {
        window[SecurityRelatedUtil.SELECTED_LOCALE_KEY] = code;
    }
    /**
     * membaca data locale
     */
    static getLocales(): CommonCommunicationData.LocaleDefinition[] {
        let s: any = window[SecurityRelatedUtil.LOCALE_INFO_HOLDER_KEY];
        return s;
    }
    /**
     * membaca data security
     */
    static getLoginData(callback: (data: SecurityData.UserLoginData) => any, loginDataErrorHandler?: (errorCode: string, errorMessage: string, exc: any) => any) {
        let userInfoSwap: any = window[SecurityRelatedUtil.USER_LOGIN_INFO_HOLDER_KEY] || null;
        loginDataErrorHandler = loginDataErrorHandler || function (errorCode: string, errorMessage: string, exc: any) {
            //
        };
        if (userInfoSwap == null) {
            ajaxhelper.generateOrGetAjaxUtils().get('/dynamics/rest-api/system/current-login-info.svc')
                .then((d: any) => {
                    let serverData: SecurityData.UserLoginData = d.user;
                    if (serverData == null) {
                        if (loginDataErrorHandler) {
                            loginDataErrorHandler("LOGIN_NOT_FOUND", "Data login tidak di temukan ", null);
                        }
                        
                        return;
                    }
                    window[SecurityRelatedUtil.CURRENT_LOGIN_IP_ADDRESSS_KEY] = serverData.ipAddress ; 
                    window[SecurityRelatedUtil.SELECTED_LOCALE_KEY] = serverData.localeCode;
                    window[SecurityRelatedUtil.LOCALE_INFO_HOLDER_KEY] = d.locales;
                    window[SecurityRelatedUtil.KEY_FOR_UNIT_OF_WORK] = d.unitOfWork;
                    window[SecurityRelatedUtil.USER_LOGIN_INFO_HOLDER_KEY] = serverData;

                    callback(serverData);
                    SecurityRelatedUtil.processLoginData(serverData);
                }).catch(exc => {
                    let errorCode: string = exc.errorCode;
                    let errorMessage: string = exc.message;
                    console.error("[SecurityRelatedUtil]Gagal membaca data data menu,error :[" + errorCode + "], message :[" + errorMessage + "]");
                    if (loginDataErrorHandler) {loginDataErrorHandler(errorCode, errorMessage, exc); }

                });
        } else {
            callback(userInfoSwap);
        }
    }
    /**
     * membaca current user unit of work
     */
    static getCurrentUnitOfWork(): SecurityData.UnitOfWork {
        return window[SecurityRelatedUtil.KEY_FOR_UNIT_OF_WORK];
    }
    /**
     * membaca unit of work dengan promise
     */
    static getCurrentUnitOfWorkWithPromise(): Promise<SecurityData.UnitOfWork> {
        return new Promise<SecurityData.UnitOfWork>( (fullfill: (n: SecurityData.UnitOfWork) => any, reject: (exc: any) => any) => {
            // let code: string = 'DEFAULT_ERROR_CODE';
            // let errorMessage: string = 'Unknown error : :msg';
            try {
                let p: any = window[SecurityRelatedUtil.KEY_FOR_UNIT_OF_WORK]; 
                if ( !isNull(p)) {
                    fullfill(p) ; 
                    return ; 
                }
                SecurityRelatedUtil.getLoginData( 
                    d => {
                        p =  window[SecurityRelatedUtil.KEY_FOR_UNIT_OF_WORK] ; 
                        fullfill(p);
                    } , 
                    ( code: string , message: string , exc: any ) => {
                        reject( {errorCode : code , message : message}) ; 
                    } );
            } catch (exc) {
                console.error('[SecurityRelatedUtil#getCurrentUnitOfWorkWithPromise] error : ', exc);
                reject( exc) ; 
            }
        });
    }
    /**
     * hapus info login saat ini. dalam kasus user memmilih logout
     */
    static clearCurrentLoginData() {
        delete window[SecurityRelatedUtil.KEY_FOR_UNIT_OF_WORK];
        delete window[SecurityRelatedUtil.USER_LOGIN_INFO_HOLDER_KEY];
    }

    /**
     * membaca data logind ari cached paramter, kalau tidak di temukan , maka di panggil callbackOnNotLogIn.
     * method ini di pakai kalau data login di set dari halamanan init. ini dalam kasus page login terpisah dengan halaman utama
     * @param callbackOnNotLogIn callback kalau data login kosong, redirect ke login page
     */
    static procesLoginDataFromCachedVariable(callbackOnNotLogIn: () => any) {
        let loginInfo: SecurityData.UserLoginData = window[SecurityRelatedUtil.USER_LOGIN_INFO_HOLDER_KEY] || null;
        if (loginInfo == null) {
            callbackOnNotLogIn();
            return;
        }
        SecurityRelatedUtil.processLoginData(loginInfo);
    }

    /**
     * memproses data login
     */
    static processLoginData(loginData: SecurityData.UserLoginData) {
        SecurityRelatedUtil.LOGIN_PROCESSED = true;
        window[SecurityRelatedUtil.USER_LOGIN_INFO_HOLDER_KEY] = loginData;
        SecurityRelatedUtil.indexMenuData(loginData);
    }

    /**
     * data user yang sudah ada dalam cache
     */
    static getCachedLoginData(): SecurityData.UserLoginData {
        let userInfoSwap: any = window[SecurityRelatedUtil.USER_LOGIN_INFO_HOLDER_KEY] || null;
        if (userInfoSwap == null) {
            console.error("[SecurityRelatedUtil] Data user login kosong, anda bisa jadi belum memanggil getLoginData");
        }
        return userInfoSwap;
    }

    /**
     * index menu. untuk kemudahan bagi bagian app lain nya
     */
    static indexMenuData(data: SecurityData.UserLoginData) {
        let indexerBaru: { [id: string]: CommonClientData.UserPrivilage } = {};
        let indexerMenu: { [id: string]: SecurityData.MenuData } = {};
        let idxPrivByCode: { [id: string]: CommonClientData.UserPrivilage } = {};
        let idxMenuByCode: { [id: string]: SecurityData.MenuData } = {};
        window["indexedPrivilage"] = window["indexedPrivilage"] || indexerBaru;
        window["indexedMenu"] = window["indexedMenu"] || indexerMenu;
        window['indexedPrivilageByCode'] = window['indexedPrivilageByCode'] || idxPrivByCode;
        window["indexedMenuByCode"] = window["indexedMenuByCode"] || idxMenuByCode;
        indexerBaru = window["indexedPrivilage"];
        indexerMenu = window["indexedMenu"];
        idxPrivByCode = window['indexedPrivilageByCode'];
        idxMenuByCode = window["indexedMenuByCode"];

        if (data == null || typeof data === "undefined" || data.menu == null || typeof data.menu === "undefined") {
            console.log("[SecurityRelatedUtil] data menu null atau kosong");
            return;
        }
        for (var m of data.menu) {
            let privilage: CommonClientData.UserPrivilage = {
                allowCreate: m.allowCreate === "Y" || m.allowCreate === "y",
                allowDelete: m.allowDelete === "Y" || m.allowDelete === "y",
                allowEdit: m.allowEdit === "Y" || m.allowEdit === "y",
            };
            indexerMenu[m.id + ""] = m;
            indexerBaru[m.id + ""] = privilage;
            idxPrivByCode[m.code!] = privilage;
            idxMenuByCode[m.code!] = m;
        }
    }
    /**
     * membaca menu by id
     */
    static getMenuById(id: string | number) {
        id = id + "";
        let swapId: any = id;
        let indexerMenu: { [id: string]: SecurityData.MenuData } = window["indexedMenu"] || null;
        if (indexerMenu == null) {
            return null;
        }
        return indexerMenu[swapId];
    }
    /**
     * maksa panel bernavigasi ke login URL.
     */
    static navigateToLoginUrl() {
        if (SecurityRelatedUtil.customNavigateLoginHandler != null && typeof SecurityRelatedUtil.customNavigateLoginHandler !== "undefined") {
            SecurityRelatedUtil.customNavigateLoginHandler();
            return;
        }
        // let baseUrl: string = ajaxhelper.generateOrGetAjaxUtils().baseUrl;
        window.location.href = "login.html";
    }
    /**
     * membaca data security dari user current
     */
    static getCurrentPrivilage(menuId: number): CommonClientData.UserPrivilage {
        let indexerBaru: { [id: string]: CommonClientData.UserPrivilage } = window["indexedPrivilage"] || {};
        return indexerBaru[menuId];
    }
    /**
     * akses privilage by code
     * @param menuCode kode dari menu, untuk di akses
     */
    static getCurrentPrivilageByCode(menuCode: string): CommonClientData.UserPrivilage {
        let indexerBaru: { [id: string]: CommonClientData.UserPrivilage } = window["indexedPrivilageByCode"] || {};
        return indexerBaru[menuCode];
    }

    /**
     * akses data menu dalam cache. data di akses dengan code
     * @param menuCode kode dari menu
     */
    static getMenuByCode(menuCode: string): SecurityData.MenuData {
        let indexerBaru: { [id: string]: SecurityData.MenuData } = window["indexedMenuByCode"] || {};
        return indexerBaru[menuCode];
    }

    /**
     * append deta menu data
     * @param menu data 
     * @param privilage data privilage untuk data menu
     */
    static appendMenu(menu: SecurityData.MenuData) {
        let indexerBaru: { [id: string]: CommonClientData.UserPrivilage } = {};
        let indexerMenu: { [id: string]: SecurityData.MenuData } = {};
        let idxPrivByCode: { [id: string]: CommonClientData.UserPrivilage } = {};
        let idxMenuByCode: { [id: string]: SecurityData.MenuData } = {};
        window["indexedPrivilage"] = window["indexedPrivilage"] || indexerBaru;
        window["indexedMenu"] = window["indexedMenu"] || indexerMenu;
        window['indexedPrivilageByCode'] = window['indexedPrivilageByCode'] || idxPrivByCode;
        window["indexedMenuByCode"] = window["indexedMenuByCode"] || idxMenuByCode;
        indexerBaru = window["indexedPrivilage"];
        indexerMenu = window["indexedMenu"];
        idxPrivByCode = window['indexedPrivilageByCode'];
        idxMenuByCode = window["indexedMenuByCode"];
        let privilage: CommonClientData.UserPrivilage = {
            allowCreate: menu.allowCreate === 'Y',
            allowDelete: menu.allowDelete === 'Y',
            allowEdit: menu.allowEdit === 'Y'
        };
        if (!isNull(menu.id)) {
            indexerBaru[menu.id + ''] = privilage;
            indexerMenu[menu.id + ''] = menu;
        }
        if (!isNull(menu.code)) {
            idxPrivByCode[menu.code!] = privilage;
            idxMenuByCode[menu.code!] = menu;
        }

    }

}
