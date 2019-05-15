import { CommonLookupHeader, CommonLookupValue , isNull } from 'base-commons-module';
import { BaseListOfValueManager, CachedLookupDefinition, CommonClientConstant, CoreAjaxHelper, ListOfValueManager, LOVEnabledComponent } from 'core-client-commons';
import { ajaxhelper, ClientStorageUtils} from "../utils/index";
export { BaseListOfValueManager, CommonClientConstant, CoreAjaxHelper, ListOfValueManager } from 'core-client-commons';
const STORAGE_UTILS: ClientStorageUtils = new ClientStorageUtils();
// export {   LoadLookupFromCacheDataWrapper , LookupWithToken , LookupWithTokenResponse , LOVEnabledComponent} from './lov/data';
export class ListOfValueComponent {


    /**
     * generate ajax lookup manager
     * @param ajaxUtils 
     */
    static generateLookupManager(ajaxUtils?: CoreAjaxHelper, lookupContainers?: { [id: string]: CommonLookupValue[] }): ListOfValueManager {
        let s: any = ajaxUtils;
        if (isNull(s)) {
            s = ajaxhelper.generateOrGetAjaxUtils();
        }
        return new ListOfValueManagerWebBased(s, lookupContainers);
    }
}




/**
 * lookup value manager
 */
export class ListOfValueManagerWebBased extends BaseListOfValueManager implements ListOfValueManager {

    /**
     * nama method yang non native, di pergunakan untuk reload component.
     * misal bootstrap multi select. element itdak normal /terisi setelah listbox di isi ulang
     */
    static RELOAD_NON_NATIVE_COMPONENT_METHOD: string = "reloadComponnent";
    /**
     * key prefix untuk lookup
     */
    static PREFIX_FOR_LOV_LOCAL_STORAGE: string = "gps_corp_lookup";
    /**
     * konstruksi lookup container
     * @param ajaxUtils ajax utils, untuk membaca data
     * @param lookupContainers container lookup. kalau di isikan, data request lookup akan di taruh di sini
     */
    constructor(ajaxUtils: CoreAjaxHelper, public lookupContainers?: { [id: string]: CommonLookupValue[] }) {
        super(ajaxUtils as any);
        let windowParam: string = window["PREFIX_FOR_LOV_LOCAL_STORAGE"] || null;
        if (windowParam != null && windowParam !== "") {
            ListOfValueManagerWebBased.PREFIX_FOR_LOV_LOCAL_STORAGE = windowParam;
        }
    }
    /**
     * assign lookup ke dalam control
     */
    assignLookupDataToControlWorker(id: string, lovs: CommonLookupValue[]) {
        this.lookupData[id] = lovs;
        let logger: (msg: string, ...parma: any[]) => any = (msg: string, ...parma: any[]) => {
            if (this.ownerNameForDebug !== null && typeof this.ownerNameForDebug !== 'undefined' && this.ownerNameForDebug.length > 0) {
                console.log('[' + this.ownerNameForDebug + ']' + msg, parma);
            }
        };
        if (lovs != null && typeof lovs !== 'undefined') {
            let lovComps: LOVEnabledComponent[] = this.indexedLovComponents[id] || null;
            if (lovComps != null) {
                for (var cLov of lovComps) {
                    logger("#assignLookupDataToControl memproses lookup :", id, '.ke componen : ', cLov);
                    cLov.assignLookupData(lovs);
                    let d: any = !isNull(cLov['getElement']) ? cLov['getElement']() : null;
                    if (d == null || typeof d === 'undefined') {
                        continue;
                    }
                    if (!isNull(d[ListOfValueManagerWebBased.RELOAD_NON_NATIVE_COMPONENT_METHOD])) {
                        try {
                            d[ListOfValueManagerWebBased.RELOAD_NON_NATIVE_COMPONENT_METHOD]();
                        } catch (exc) {
                            console.error('gagal memanggil reload method , error  : ' + exc.message);
                        }
                    }
                }
            } else {
                logger("#assignLookupDataToControl tidak ad alookup dengan dengan id : ", id);
            }
        }
    }

    /**
     * kirim data ke cache( localstorage - chrome storage)
     * @param lookupData
     */
    sendToCache(lookupData: CommonLookupHeader) {
        if (!isNull(this.lookupContainers)) {
            this.lookupContainers![lookupData.id] = lookupData.details!;
        }
        let idPrefix: string = this.generateStorageKey(lookupData.id);
        let idVersi: string = (idPrefix + "_version" || null)!;
        let idObject: string = idPrefix;
        let idObjTimestamp: string = idPrefix + '_timestamp';
        STORAGE_UTILS.setValue(idVersi, lookupData.version!, () => {
            //
        });
        STORAGE_UTILS.setValue(idObject, btoa(JSON.stringify(lookupData.details)), function () {
            //
        });
        STORAGE_UTILS.setValue(idObjTimestamp, new Date().toJSON(), function () {
            //
        });
    }

    /**
     * membaca dari local storage atau chrome storage
     */
    readFromCache(id: string, next: (cachedResult: CachedLookupDefinition) => any): any {
        let idPrefix: string = this.generateStorageKey(id);
        let idVersi: string = (idPrefix + "_version" || null)!;
        let idTimestamp = idPrefix + '_timestamp';
        STORAGE_UTILS.getValue(idVersi, (versi: string) => {
            if (versi == null) {
                next({
                    lookupData: null!,
                    version: null!,
                    id: id
                });
                return;
            }
            STORAGE_UTILS.getValue(idTimestamp, (timeStamp: string) => {
                STORAGE_UTILS.getValue(idPrefix, (lovDataRaw: string) => {
                    let parsedLov: string = atob(lovDataRaw);
                    next({
                        version: versi,
                        lookupData: JSON.parse(parsedLov),
                        id: id,
                        timestamp: (timeStamp == null || typeof timeStamp === 'undefined' ? null : new Date(timeStamp))!
                    });
                });
            });
        });
    }

    /**
     * membaca dari local storage atau chrome storage
     */
    readFromCacheWithPromise(id: string): Promise<CachedLookupDefinition> {
        let idPrefix: string = this.generateStorageKey(id);
        return new Promise<CachedLookupDefinition>((accept: (n: any) => any, reject: (exc: any) => any) => {
            let idVersi: string = (idPrefix + "_version" || null)!;
            let idTimestamp = idPrefix + '_timestamp';
            let versi: string = localStorage.getItem(idVersi)!;
            if (versi == null) {
                accept({
                    lookupData: null,
                    version: null,
                    id: id
                });
            }
            let timeStamp: string = localStorage.getItem(idTimestamp)!;
            let lookupData: string = localStorage.getItem(idPrefix)!;
            let lk: any = null;
            if (lookupData != null && typeof lookupData !== 'undefined') {
                lk = atob(lookupData);
                lk = JSON.parse(lk);
            }
            if (!isNull(this.lookupContainers)) {
                this.lookupContainers![id] = lk;
            }
            accept({ version: versi, lookupData: lk, id: id, timestamp: (timeStamp == null || typeof timeStamp === 'undefined' ? null : new Date(timeStamp)) });
        });
    }

    /**
     * generate id untuk di taruh dalam local storage
     * @param id id dair lookup
     */
    private generateStorageKey(id: string): string {
        let prfx: string = isNull(CommonClientConstant.PROJECT_IDENTIFICATION) || isNull(CommonClientConstant.PROJECT_IDENTIFICATION.code) ? '' : CommonClientConstant.PROJECT_IDENTIFICATION.code + '-';
        return prfx + ListOfValueManagerWebBased.PREFIX_FOR_LOV_LOCAL_STORAGE + id;
    }

}