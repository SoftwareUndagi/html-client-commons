import { DateUtils , CommonCommunicationData , CoreComponentAjaxUtils } from 'core-client-commons';
import { isNull  } from './CommonUtils';
import { SecurityRelatedUtil } from './SecurityRelatedUtil'; 
import {  } from 'core-client-commons';
import {  } from 'core-client-commons';
import { ajaxhelper } from './ajaxhelper';

/**
 * tipe dari browser
 */
export enum BrowserTypeResult {
    desktop , 
    tablet , 
    phone
}

/**
 * tipe browser
 */
export function getBrowserType (): BrowserTypeResult {
    
    let ua = navigator.userAgent ; 
    // let browser = /Edge\/\d+/.test(ua) ? 'ed'  : /MSIE 9/.test(ua) ? 'ie9'  :  /MSIE 10/.test(ua) ? 'ie10'  : /MSIE 11/.test(ua) ? 'ie11' : /MSIE\s\d/.test(ua) ? 'ie?'  : /rv\:11/.test(ua) ? 'ie11'  : /Firefox\W\d/.test(ua) ? 'ff' : /Chrome\W\d/.test(ua) ? 'gc' : /Chromium\W\d/.test(ua) ? 'oc' : /\bSafari\W\d/.test(ua) ? 'sa' : /\bOpera\W\d/.test(ua) ? 'op' : /\bOPR\W\d/i.test(ua) ? 'op' : typeof MSPointerEvent !== 'undefined' ? 'ie?' : '',
    // os = /Windows NT 10/.test(ua) ? "win10"  : /Windows NT 6\.0/.test(ua) ? "winvista"  : /Windows NT 6\.1/.test(ua) ? "win7"  : /Windows NT 6\.\d/.test(ua) ? "win8"  : /Windows NT 5\.1/.test(ua) ? "winxp"  : /Windows NT [1-5]\./.test(ua) ? "winnt" : /Mac/.test(ua) ? "mac" : /Linux/.test(ua) ? "linux" : /X11/.test(ua) ? "nix" : "" ; 

    let mobile: boolean   =  (/IEMobile|Windows Phone|Lumia/i.test(ua) ? 'w'  : /iPhone|iP[oa]d/.test(ua) ? 'i'  : /Android/.test(ua) ? 'a'  : /BlackBerry|PlayBook|BB10/.test(ua) ? 'b' : /Mobile Safari/.test(ua) ? 's' : /webOS|Mobile|Tablet|Opera Mini|\bCrMo\/|Opera Mobi/i.test(ua) ? 1 : 0) === 1 ; 
    let tablet: boolean  = /Tablet|iPad/i.test(ua) ; 
    // let touch: boolean = 'ontouchstart' in document.documentElement;
    if ( tablet ) {
        return BrowserTypeResult.tablet ; 
    } else if ( mobile ) {
        return BrowserTypeResult.phone ;
    }
    return BrowserTypeResult.desktop ;
}
/**
 * doc bisa di baca di sini: http://www.w3schools.com/bootstrap/bootstrap_grid_system.asp 
 * <ol>
 * <li>xs (for phones)</li>
 * <li>sm (for tablets)</li>
 * <li>md (for desktops)</li>
 * <li>lg (for larger desktops)</li>
 * </ol>
 */
export function getCssForColumnWithScreenType (): string {
    let t: BrowserTypeResult = getBrowserType() ; 
    if ( BrowserTypeResult.desktop === t) {
        return 'md';
    } else if ( BrowserTypeResult.tablet === t) {
        return 'sm' ; 
    } else if ( BrowserTypeResult.phone === t) {
        return 'xs';
    }
    return 'md'; 
}

export interface I18nConfig {

    dotForThousandSeparator: boolean ; 
    languageCode: string ;
    dateFormatPattern: string ; 
    /**
     * format jam menit second
     */
    timePattern ?: string ;  
}
/**
 * worker untuk membaca konfigurasi i18n
 */
export function getI18nConfiguration (): I18nConfig {
    let locales: CommonCommunicationData.LocaleDefinition[] = SecurityRelatedUtil.getLocales() ; 
    let localeCode: string = SecurityRelatedUtil.getLocaleCode() ; 
    let c: I18nConfig = {
         dotForThousandSeparator: true , 
        languageCode: 'id' , 
        dateFormatPattern: 'dd/mm/yyyy'
    };
    let s: any = null ; 
    let selectedLocale: CommonCommunicationData.LocaleDefinition = s ; 
    if ( !isNull(locales)) {
        for ( let l of locales) {
            if ( l.code === localeCode)  {
                selectedLocale = l ; 
                break ; 
            }
        }
    }
    if ( !isNull(selectedLocale)) {
        let ptrnDate: any = selectedLocale.dateFormatPattern ; 
        let ptrnTime: any = selectedLocale.timePattern ; 
        c.dotForThousandSeparator = selectedLocale.dotForThousandSeparator === 'Y' ; 
        c.languageCode = selectedLocale.code! ; 
        c.dateFormatPattern = ptrnDate ; 
        c.timePattern = ptrnTime ; 
    }
    return c ;
}
/**
 * membaca label internalization untuk label
 * @param key key internalization. cek ke db 
 * @param defaultLabel label standard kalau defaultLabel tidak ada dalam database
 */
export function i18n( key: string , defaultLabel: string , replacements ?: string[] ): string  {
    if ( isNull(key) || key.length === 0 ) {
        return defaultLabel ; 
    }
    let value: string  = defaultLabel ;
    let localeCode: string = SecurityRelatedUtil.getLocaleCode() ; 
    try {      
        let val: string = window['localization'][localeCode][key] || null ; 
        if ( val == null ) {
            console.warn('[i18n]Key: ' , key , ',locale: ' , localeCode , ' tidak di temukan');
            val =  value ; 
        }
        if (replacements && replacements!.length > 0 ) {
            for ( let i = 0 ; i < replacements.length; i++) {
                val = val.split('{' + i + '}').join(replacements[i]);
            }
        }
        return val ; 
    } catch ( exc) {
        console.error('Gagal membaca i18.param: ' , key, '.val: ' , defaultLabel , '.locale code: ' , localeCode  , '.error:', exc);
        return value ; 
    }
}

/**
 * formatter utils. untuk format angka tgl dll
 */
export class FormatterUtils {

    /**
     * format date dengan pattern yang di berikan
     */
    formatDate ( value: Date , pattern?: string ): string {
        if ( isNull( pattern) ) {
            pattern = getI18nConfiguration().dateFormatPattern ;
        }
        if ( isNull(value)) {
            return '' ; 
        }
        return DateUtils.formatDate(value , pattern); 
    }

    /**
     * time formatter
     */
    formatTime ( value: Date , pattern: string ): string {
        return DateUtils.TIME_FORMATTER[pattern].format(value); 
    }
    /**
     * format duit
     * @param value number yang perlu di format
     * @param useComaDecimalSeparator true  berarti pemisah decimal = ,(versi Indonesia)
     * @param remainedDecimal berapa di sisikan di belakang koma
     */
    formatMoney (value: number, useComaDecimalSeparator ?: boolean , remainedDecimal ?: number ): string {
        if ( value === null || typeof value === "undefined") {
            return "" ; 
        }
        let blkKoma: number = isNull(remainedDecimal) ?  2 : remainedDecimal! ;
        let useKoma: boolean =  isNull( useComaDecimalSeparator) ?  true  : useComaDecimalSeparator! ;
        let arr: string[] = (value + '').split('.'); 
        let dpnKoma: number = parseFloat( arr[0]); 
        let blk: number = arr.length > 1 ? parseFloat(arr[1]) : 0 ; 

        let strDepanKoma: string = this.formatDepanKoma(dpnKoma , useKoma ? '.'  : ',') ; 
        let strBlk: string = this.formatBelakangKoma(blk  , blkKoma) ; 
        if ( strBlk.length === 0) {
            return strDepanKoma ; 
        }
        return strDepanKoma + ( useKoma ? ',' : '.') + strBlk ; 
    }

    private formatBelakangKoma ( blkKoma: number , keeped: number ): string {
            if ( blkKoma === 0 ) {
                return '' ;
            }
            let rtvl: string = blkKoma + '' ;
            if ( keeped > rtvl.length) {
                return rtvl ; 
            } 
            return rtvl.substr( 0, keeped );
        }

    private     formatDepanKoma(dpnKoma: number , separator: string ) {
           if ( dpnKoma === 0 ) {
               return "0" ; 
           }     
           let strN: string = dpnKoma + '' ; 
           let arr: string[] = [] ; 
           while ( strN.length > 3 ) {
                let pjg: number = strN.length ; 
                arr.push(strN.substr(pjg - 3));
                strN = strN.substr(0, pjg - 3);
           }
           arr.push(strN) ; 
           arr = arr.reverse() ; 
           return arr.join(separator);
        }

}

/**
 * reqeust locale hanya kalau data belum pernah di request
 */
export function requestI18nTextsOnlyIfNotRequested () {
    let localeCode: string = SecurityRelatedUtil.getLocaleCode() ; 
    if ( !isNull(window['localization'][localeCode])) {
        return ; 
    }
    requestI18nTexts(); 
}
/**
 * assign locale code + request locale
 * @param localeCode 
 */
export function assignLocaleCode ( localeCode: string ) {
    let oldLocaleCode: string = SecurityRelatedUtil.getLocaleCode() ; 
    if (oldLocaleCode !== localeCode ) {
        SecurityRelatedUtil.setLocale(localeCode) ; 
        requestI18nTexts();     
    }
}

/**
 * request data i18n dari server
 */
export function requestI18nTexts () {
    let coreAjaxUtils: CoreComponentAjaxUtils = new CoreComponentAjaxUtils( ajaxhelper.generateOrGetAjaxUtils()); 
    let localeCode: string = SecurityRelatedUtil.getLocaleCode() ; 
    let w: any = {} ; 
    if ( !isNull(localeCode) && localeCode.length > 0 ) {
        w.localeCode  = {$eq : localeCode } ; 
    }
    coreAjaxUtils.getAllDataBatched(
        {
            modelName: 'I18nText' , 
            page: 0 , 
            pageSize: 50, 
            where: w , 
            orders: [['localeCode' , 'asc']]
        } , 
        (data: CommonCommunicationData.I18nText[]) => {
        if ( !isNull(data)) {
            let localeCode2: string = SecurityRelatedUtil.getLocaleCode() ; 
            if ( isNull(window['localization'])) {
                window['localization'] = {} ; 
            }
            if ( !isNull(localeCode) && isNull(window['localization'][localeCode2])) {
                window['localization'][localeCode2] = {}; 
            }
            // let cntr: any = window['localization'][localeCode]; 
            for ( let d of data) {
                if ( isNull(d.localeCode)) {
                    continue ; 
                }
                window['localization'][d.localeCode!] = window['localization'][d.localeCode!] || {} ; 
                window['localization'][d.localeCode!][d.key!] = d.text ; 
                
            }
        }
    }).then(d => {
        //
    }).catch( exc => {
        console.error('Gagal request data i18n, error: ' , exc) ;
    });
}