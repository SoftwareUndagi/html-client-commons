
import * as React from 'react' ;
export { readNested , setValueHelper , isNull  , cloneObject , deepCloneObject , insertAtArray , __deepCloneWorkerRecursive , makeZeroLeadedString, makeIsoDate , makeIsoDateTime  , cloneObjectMakeDateObjectStringVariable } from 'core-client-commons'; 
import { CommonCommunicationData } from 'core-client-commons';
import { isNull , cloneObject  } from 'core-client-commons'; 
import { ApplicationTableMetadataReader } from './ApplicationTableMetadataReader';

export function stringIsStartsWith(str: string , searchedString: string ): boolean {
    if ( isNull(str) || isNull(searchedString)) {
        return false ; 
    }
    if ( searchedString.length > str.length) {
        return false ;
    }
    return  str.substr(0 , searchedString.length ) === searchedString; 
}

/**
 * generate tanggal dengan jam menit detik 00 semua
 * @param date 
 */
export function geneteDate00Hour( date: Date): Date {
    let dt: Date =  new Date(date) ; 
    dt.setHours(0 , 0 , 0 , 0 ) ; 
    return dt ; 
}

/**
 * generate date dengan jam menit ,second max
 * @param date 
 */
export function geneteDateMaxedHour( date: Date): Date {
    let dt: Date =  new Date(date) ; 
    dt.setHours(23 , 59 , 59 , 99 ) ; 
    return dt ; 
}

export class ClientCommonsConstant {
    /**
     * key untuk menaruh variable index db column dalam window
     */
    static KEY_DB_COLUMN_DEF_ON_WINDOW: string = 'columnDefintion' ; 

    /**
     * key pada local storage untuk menaruh data. data di taruh dengan prefix  project code
     */
    static KEY_DB_COLUMN_DEF_ON_LOCAL_STORAGE: string = '_columnDefintion';
}
declare var jQuery: any  ; 

/**
 * definisi offset dari element
 */
export interface ElementOffset {

    /**
     * sisi kiri dari lement
     */
    left: number ; 

    /**
     * bounding bagian atas dari element
     */
    top: number ; 
}

export function getHtmlElementBounding ( element: HTMLElement ): ElementOffset  {
    return jQuery(element).offset();
}   

/**
 * worker untuk membaca input value
 */
export function readFormInputValue ( inputElement: HTMLElement ): /*string |string[]|number*/any {
    let tgName: string = inputElement.tagName.toLowerCase() ; 
    let s: any = inputElement ; 
    if ( tgName  === 'input') {
        return s.value ; 
    } else if ( tgName === 'number' ) {
        let txt: HTMLInputElement = s ; 
        if  (  isNull(txt.value) || txt.value.length === 0 || isNaN(s.value)) {
            return null ; 
        }
        return parseFloat(s.value) ; 
    } else if ( tgName === 'select' ) {
        let selElem: HTMLSelectElement = s ; 
        let opts: HTMLOptionsCollection = selElem.options ; 
        if ( selElem.multiple) {
            let rtvl: string[] = [] ; 
            for ( let idx = 0 ; idx < opts.length ; idx++) {
                let opt: HTMLOptionElement = opts.item(idx); 
                if  ( opt.selected) {
                    rtvl.push(opt.value) ;
                }
            }
            return rtvl ; 
        } else {
            if ( opts.selectedIndex >= 0) {
                return opts[opts.selectedIndex]['value']   ; 
            }
            return null ; 
        }
    } else if ( tgName === 'checkbox') {
        
        return  s.value ; 
    }
    return null ; 
}

/**
 * wrapper posisi element. 
 */
export interface HtmlElementPosition {
    top: number ; 
    left: number ; 
}

/**
 * mencari posisi dari element dalam screen
 */
export function getElementPosition (htmlElement: HTMLElement ):  HtmlElementPosition {
    console.warn('fungsi : getElementPosition masih mengandalkan jquery, sebaiknya di carikan versi yang lebih ringan dalam kasus tidak ada jquery dalam project react');
    let k: any = 'jQuery' ; 
    return  window[k](htmlElement).offset () ; 
}

/**
 * mencari apakah sort sudah ada dalam array. sort dengan field sama tidak boleh, method ini untuk memeriksa ada atau tidak duplikasi
 * @param sortParam  parameter untuk di cek
 * @param arrayOfSorts data utnuk pembanding sort
 */
export function isSortExistOnArray ( sortParam: CommonCommunicationData.SortParam , arrayOfSorts:  CommonCommunicationData.SortParam[]  ): boolean  {
    if ( isNull(sortParam) ) {
        return false ; 
    }
    if ( isNull(arrayOfSorts) || arrayOfSorts.length === 0 ) {
        return false ; 
    }
    let keyModelName: string = 'modelName' ; 
    let keyAs: string = 'as' ; 
    let isExtended: boolean = !isNull(sortParam[keyModelName]) && sortParam[keyModelName].length ; 
    for ( let d of arrayOfSorts ) {
        if ( isExtended) {
            if ( isNull(d[keyModelName]) ) {
                continue ; 
            }
            if ( d.fieldName ===  sortParam.fieldName && d[keyModelName] === sortParam[keyModelName]) {// field name + model sudah sama
                if ( (isNull(sortParam[keyAs]) &&  !isNull(d[keyAs])) ||  sortParam[keyAs] !== d[keyAs]) {// as nya tidak sama
                    continue ; 
                }
                return true ; 
            }
        } else {
            if ( !isNull(d[keyModelName])   ) {
                continue ; 
            }
            if ( d.fieldName === sortParam.fieldName ) {
                return true ; 
            }
        }
    }
    return false ; 
}

/**
 * helper set state ke komponen. cuma yanga da nilai nya yang akan di salin ke dalam state dari component. ini bersiap untuk update react tsd yang me-readonly this.state dalam component.
 * @param component component untuk di set state
 * @param state state untuk di set
 */
export function setState ( component: React.Component<any , any > , state: any  ) {
    if ( isNull(state)) {
        return ; 
    }
    let s: any = cloneObject(component.state) ; 
    Object.assign( s, state) ; 
    component.setState(s);
} 

/**
 * function untuk checksum
 * @param s
 */
export function checksum(s: string): string {
    var chk = 0x5100100016;
    var len = s.length;
    for (var i = 0; i < len; i++) {
        chk += (s.charCodeAt(i) * (i + 1));
    }

    return (chk & 0xffffffff).toString(16);
}

/**
 * membaca lebar maksimal dari sat field. ini di cari dengan isian dari server
 */
export function getDbModelFieldMaxLength ( modelName: string , fieldName: string ): number {
    if ( isNull(ApplicationTableMetadataReader.getMetadata(modelName)) ) {
        console.warn("metadata untuk model : "  , modelName , ' return null, silakan di cek kembali' );
        return 1024 ; 
    } 
    let len: any =  ApplicationTableMetadataReader.getMetadata(modelName).indexedFieldLength[fieldName] ; 
    if ( isNull(len) ) {
        console.warn("metadata untuk model : "  , modelName, ',field : ' , fieldName , ' return null, silakan di cek kembali' );
        return 1024 ; 
    } 
    return len ; 
    /*let  projectCode : string = window['projectCode']; 
    if ( isNull(projectCode)){
        console.warn("variable :  window['projectCode'] tidak di set, silakan di cek kembali" );
        return 1024 ; 
    }
    let key : string = projectCode  + '_db_metadata_' + modelName ; 
    let idx : {[id:string] : {[id:string] : number}} = window[ClientCommonsConstant.KEY_DB_COLUMN_DEF_ON_WINDOW] ; 
    if ( isNull(idx) || isNull(idx[modelName])){
        console.warn('Column def untuk model : ' , modelName , ' tidak di temukan, return 1024');
        return 1024 ; 
    }
    let val : number = idx[modelName][fieldName] ; 
    if ( isNull(val)) {
        console.warn('Column def untuk model : ' , modelName ,',fieldname : ',fieldName , ' tidak di temukan, return 1024');
        return 1024 ;        
    }
    return val ; */
}
