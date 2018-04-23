import { CommonCommunicationData }    from "core-client-commons/index";
import { LOVEnabledComponent } from './data';
/**
 * component lookup dengan base : &gt;select&lt;
 */
export class SelectDrivenLookup implements LOVEnabledComponent {
    /**
     * template , silakan cek di constructor, default pattern : {{detailCode}} - {{label}}
     */
    labelTemplate: string;
    /**
     * id dari lookup. ini untuk di request kembali ke server
     */
    lovId: string;
    element: HTMLElement;
    /**
     * flag , di tambahkan none selected atau tidak
     */
    appendNoneSelected: boolean ;
    /**
     * label untuk none selected.pada index 0
     */
    nonSelectedLabel: string ;
    /**
     * lookup data. data yang di cache saat ini
     */
    lookupData: CommonCommunicationData.CommonLookupValue[];
    /**
     * handler kalau ada lookup di terima
     */
    additionalTaskOnLookupDataRecieved: (lookupData: CommonCommunicationData.CommonLookupValue[]) => any ;
    /**
     * filter data, kalau di perlukan untuk memfilter data. mana yang tampil, mana yang tidak. kalau boleh tampil, return true ;
     */
    private _dataFilter: (data: CommonCommunicationData.CommonLookupValue) => boolean ;

    /**
     * @param element reference ke select element
     * @param pattern , pattern dengan style angular, value yang di ijinkan : <ol>
     * <li>detailCode</li>
     *   <li>lovId</li>
     *   <li>label</li>
     *   <li>value1</li>
     *   <li>value2</li>
     *   <li>sequenceNo</li>
     * </ol>
     */
    constructor(element: HTMLElement, lovId: string, pattern?: string) {
        this.element = element;
        pattern = pattern || null!;
        if (pattern == null || pattern === "") {
            pattern = '{{detailCode}} - {{label}}';
        }
        this.labelTemplate = pattern ;
        this.lovId = lovId;
        this.additionalTaskOnLookupDataRecieved = () => {
            //
        };
        this._dataFilter = (data: CommonCommunicationData.CommonLookupValue): boolean => {
            return true ;
        };
    }  
    /**
     * akses ke element 
     */
    getElement (): HTMLElement {
        return this.element ; 
    }
    /**
     * assign lookup header data
     */
    assignLookupData(lookupData: CommonCommunicationData.CommonLookupValue[]) {
        console.log("[SelectDrivenLookup] assign data ke dalam control(lov id : " , this.lovId + ") . element id : " , this.element.id , ", data>" , lookupData);
        this.lookupData = lookupData ;
        this.renderData();
        this.additionalTaskOnLookupDataRecieved(lookupData);
    }
    /**
     * setter,untuk mengganti data filter
     */
    set DataFilter ( filter: (data: CommonCommunicationData.CommonLookupValue ) => boolean ) {
        this._dataFilter = filter ;
        this.renderData();
    }
    /**
     * clear dan reload data
     */
    renderData () {
        let selectbox: any = this.element ; 
        for (let i = selectbox.options.length - 1 ; i >= 0 ; i--) {
            selectbox.remove(i);
        }
        var docFrag: DocumentFragment = document.createDocumentFragment();
        if ( this.appendNoneSelected) {
            docFrag.appendChild(new Option(this.nonSelectedLabel, ""));
        }
        if ( this.lookupData == null || typeof this.lookupData === "undefined") {
            return ;
        }
        for (var e of this.lookupData) {
            if ( !this._dataFilter(e)) {// karena tidak lewat filter, tidak di render
                continue ;
            }
            let lbl: string = this.labelTemplate
                .split("{{detailCode}}").join(e.detailCode || "")
                .split("{{lovId}}").join(e.lovId || "")
                .split("{{label}}").join(e.label || "")
                .split("{{value1}}").join(e.value1 || "")
                .split("{{value2}}").join(e.value2 || "")
                .split("{{sequenceNo}}").join(e.sequenceNo + "");
            docFrag.appendChild(new Option(lbl, e.detailCode));
        }
        this.element.appendChild(docFrag);

    }
}