import * as React from "react";
import { CommonCommunicationData , ListOfValueManager } from 'core-client-commons';
import { isNull , i18n  } from '../utils/index';
import { BaseHtmlComponent  , BaseHtmlComponentProps , BaseHtmlComponentState } from './BaseHtmlComponent';
import { Select2RawWrapperPanel } from './Select2RawWrapperPanel';

export interface BaseSearchableRawSelect2ComboBoxProps extends BaseHtmlComponentProps {
    /**
     * style untuk component
     */
    style ?: React.CSSProperties ; 
    /**
     * parameter untuk lookup data. kalau select2 mengandalkan data dari select2
     */
    lookupParameter ?: {
        /**
         * id dari lookup. ini untuk di request kembali ke server
         */
        lovId: string; 
        /**
         * lookup containers
         */
        lookupContainers  ?:  { [id: string ]: CommonCommunicationData.CommonLookupValue[]};  
        /**
         * managaer lookup 
         */
        lookupManager ?: ListOfValueManager; 
    };
    /**
     * modificator data. kalau memerlukan modifikasi data dari lookup. misal : mengatur urutan dari data. mengatur level dari data(untuk presentasi tree)
     */
    lookupDataTransformator  ?: ( lookups: CommonCommunicationData.CommonLookupValue[] ) => CommonCommunicationData.CommonLookupValue[] ; 
    /**
     * prefix id dari element
     */
    selectId  ?: string ; 
    /**
     * formatter label combo box
     */
    labelFormatter ?: (lookup: CommonCommunicationData.CommonLookupValue) => string |JSX.Element ;
    /**
     * untuk render item yang selected . bagian atas pada saat ada item yang di pilih
     */
    selectedDataLabelFormatter   ?: (lookup: CommonCommunicationData.CommonLookupValue) => string |JSX.Element ;
    /**
     * data filter. untuk memproses data yang di tampilkan 
     */
    dataFilter  ?:   (lookup: CommonCommunicationData.CommonLookupValue) => boolean ;
    /**
     * change handler untuk textbox
     */
    changeHandler  ?: (value: string ) => any ;
    /**
     * state readonly atau tidak
     */
    readonlyState ?: boolean  ;
    /**
     * custom none selected label. default akan memakai : query.select2.simple.noneSelectedLabel
     */
    noneSelectedLabel  ?: string ; 

    /**
     * title untuk hint dalam textbox
     */
    title ?: string ;
    /**
     * index dari tab
     */
    tabIndex ?: number  ;
    /**
     * change handler dengan lookup data reciever
     */
    changeHandlerWithLookup  ?: ( value: CommonCommunicationData.CommonLookupValue ) => any ; 
    /**
     * lebar component. misal 100px , 100%. akan di default 100% kalau tidak di isikan
     */
    width  ?:   string ; 
    /**
     * initial value
     */
    initialValue  ?: string; 
    /**
     * kode lookup
     */
    initialData?: CommonCommunicationData.CommonLookupValue[];
    /**
     * filter dengan query. ini kalau perlu filter khusus
     */
    queryDataFilter?: (query: string, data: CommonCommunicationData.CommonLookupValue) => boolean;
} 

export interface BaseSearchableRawSelect2ComboBoxState extends BaseHtmlComponentState {
    /**
     * value dari current control
     */
    value: string ; 
    /**
     * value data as lookup
     */
    valueLookup: CommonCommunicationData.CommonLookupValue ; 
    /**
     * lookup containers. ini salinan dari props, atau di siapkan langsung dalam kasus lookup containers kosong , atau memakai internal 
     */
    internalLookupContainers  ?:  { [id: string ]: CommonCommunicationData.CommonLookupValue[]};  
    /**
     * ini kalau value di assign , namun dalam lookup value tidak tersedia
     */
    lookupValueNotFound: boolean  ; 

    /**
     * value untuk di render dalam selected
     */
    valueRendered: string |JSX.Element ; 
    /**
     * penanda value sudah pernah di set atau tidak
     */
    valueHaveSetted: boolean ; 
    
} 

export abstract class BaseSearchableRawSelect2ComboBox<PROPS extends BaseSearchableRawSelect2ComboBoxProps ,  STATE extends BaseSearchableRawSelect2ComboBoxState> extends BaseHtmlComponent<PROPS, STATE > {
    /**
     * dari dari lookup untuk ID dari lov
     */
    static DEFAULT_LOV_ID: string = 'DEFAULT'  ; 
    /**
     * id default kalau param id prefix tidak di sertakan
     */
    htmlElementIdPrefix: string = 'automated_id_' + new Date().getTime() + '_' + Math.ceil(Math.random() * 100);
    /**
     * flag kalau perlu mmepergunakan external lookup container
     */
    useExternalLookupContainer: boolean = false ; 
    /**
     * flag kalau component ini tidak mempergunakn lookup manager atau tidak
     */
    doesNotUseLookupManager: boolean = false;
    /**
     * component select 2 internal 
     */
    select2Component: Select2RawWrapperPanel ; 
   
    onHideDropDownCLick: () => any;
    /**
     * default formatter 
     */
    defaultLabelFormatter: (data: CommonCommunicationData.CommonLookupValue) => string|JSX.Element = (data: CommonCommunicationData.CommonLookupValue) => {
        let lbl: string = data.label! ; 
        if ( !isNull(data.i18nKey)) {
           lbl = i18n( data.i18nKey! , lbl); 
        }
        if ( data == null || typeof data === 'undefined') {
           return '' ; 
        }
        return data.detailCode + ' - ' + lbl ; 
   }
    /**
     * default query
     */
    queryWorker: ( filter: string, checkedData: CommonCommunicationData.CommonLookupValue) => boolean = ( filter: string, checkedData: CommonCommunicationData.CommonLookupValue) => {
        if ( isNull(filter ) || filter.trim().length === 0  ) {
            return true ;
        }
        let uper: string = filter  ; 
        let detailCode: string = checkedData.detailCode! ;
        let label: string = checkedData.label! ; 
        if ( !isNull(detailCode)) {
            detailCode = detailCode.toUpperCase() ; 
            if ( detailCode.indexOf(uper) >= 0) {
                return true ; 
            }
        }
        if ( !isNull(label)) {
            label = label.toUpperCase(); 
            if ( label.indexOf(uper) >= 0 ) {
                return true ; 
            }
        }
        return false ;
    }
    constructor(props: PROPS ) {
        super(props) ; 
        let swapState: any = this.generateDefaultState() ;
        swapState.internalLookupContainers = {} ;  
        swapState.valueRendered =  i18n('query.select2.simple.noneSelectedLabel' , '- silakan pilih - ') ; 
        this.state  = swapState ; 
    }

    focusToControl: () => any = () => {
        if ( !isNull(this.select2Component)) {
            try {
                this.select2Component.focusToControl(); 
            } catch ( exc ) {
                console.error('[BaseSearchableRawSelect2ComboBox] gagal focus ke element, error : ', exc ) ; 
            }
        }
    }
    /**
     * generate default state untuk combo box
     */
    abstract generateDefaultState(): STATE;
    /**
     * id dari lookup yang di pergunakan untuk data
     */
    get lovId (): string {
        if ( this.doesNotUseLookupManager) {
            return BaseSearchableRawSelect2ComboBox.DEFAULT_LOV_ID; 
        }
        return this.props.lookupParameter!.lovId ; 
    }
    /**
     * lookup containers. ini salinan dari props, atau di siapkan langsung dalam kasus lookup containers kosong , atau memakai internal
     */
    get lookupContainers ():  { [id: string ]: CommonCommunicationData.CommonLookupValue[]} {
        if ( this.doesNotUseLookupManager) {
            return  this.state.internalLookupContainers! ; 
        }
        if ( this.useExternalLookupContainer) {
            if ( !isNull(this.props.lookupParameter)) {
                return this.props.lookupParameter!.lookupContainers! ; 
            }
            return (null)! ; 
        }
        return  this.state.internalLookupContainers! ; 
    }
    /**
     * assign data utnuk data lookup. ini untuk kasus data berada pada internal
     * @param lookupData data lookup
     */
    assignLookupData (lookupData: CommonCommunicationData.CommonLookupValue[]) {
        let lovId: string = BaseSearchableRawSelect2ComboBox.DEFAULT_LOV_ID ; 
        if ( !isNull(this.props.lookupParameter)) {
            lovId = this.props.lookupParameter!.lovId ; 
        }
        this.setStateHelper( nState => {
            if ( !isNull(this.props.lookupDataTransformator)) {
                nState.internalLookupContainers![lovId] = this.props.lookupDataTransformator!(lookupData)  ; 
            } else {
                nState.internalLookupContainers![lovId] = lookupData  ; 
            }
            return nState ; 
        }); 
    }
    componentWillMount () {
        let swapState: BaseSearchableRawSelect2ComboBoxState = this.state ; 
        let lovId: string = BaseSearchableRawSelect2ComboBox.DEFAULT_LOV_ID ; 
        if ( !isNull(this.props.lookupParameter)) {
            lovId = this.props.lookupParameter!.lovId ; 
            if ( isNull(this.props.lookupParameter!.lookupManager ) && isNull(this.props.lookupParameter!.lookupContainers) ) {
                throw {message: 'Parameter : lookupParameter.lookupManager dan lookupParameter.lookupContainers tidak boleh kosong keduanya. anda perlu mengirimkan lookup manager, atau container lookup. silakan putuskan salah satu, cek lookup : ' + this.props.lookupParameter!.lovId};  
            }
            if ( !isNull(this.props.lookupParameter!.lookupContainers)) {
                this.useExternalLookupContainer = true ; 
            } else {
                this.useExternalLookupContainer = false ; 
                swapState.internalLookupContainers = {} ; 
            }
            if (!isNull(this.props.lookupParameter) && !isNull(this.props.lookupParameter!.lookupManager)) {
                this.props.lookupParameter!.lookupManager!.register( {
                    assignLookupData : this.assignLookupData.bind(this), 
                    lovId : lovId
                } ) ; 

                this.props.lookupParameter!.lookupManager!.loadFromCache([this.props.lookupParameter!.lovId])
                    .then( (rslt: {[id: string]: CommonCommunicationData.CommonLookupValue[]} ) => {
                        let targetToFill: {[id: string]: CommonCommunicationData.CommonLookupValue[]} = (this.useExternalLookupContainer ? this.props.lookupParameter!.lookupContainers : swapState.internalLookupContainers )!;
                        if  ( !isNull(rslt)) {
                            let keys: string[] = Object.keys(rslt) ;
                            for ( let k of keys)    {
                                targetToFill[k] = rslt[k];
                            }
                        }
                    })
                    .catch( exc => {
                        console.error('[BaseSearchableRawSelect2ComboBox]Gagal load data dari cache, error : ' , exc ) ; 
                    }); 
            }
        } else {
            this.doesNotUseLookupManager = true ; 
        }
        
        if ( !isNull(this.props.initialData)) {
            this.lookupContainers[this.lovId] = this.props.initialData! ; 
        }
        if ( !isNull(this.props.initialValue)) {
            swapState.value = this.props.initialValue! ; 
            let mthchLookup: CommonCommunicationData.CommonLookupValue = this.findByCode(this.props.initialValue!) ; 
            if ( !isNull(mthchLookup)) {
                swapState.lookupValueNotFound = false ; 
                swapState.valueLookup = mthchLookup ; 
                swapState.valueRendered = this.rendererSelectedElementLabel(mthchLookup) ; 
            } else {
                swapState.lookupValueNotFound = true ;
                swapState.valueLookup = (null)! ;  
                swapState.valueRendered = this.props.initialValue! ; 
            }
        }
    
    }
   
    /**
     * assign value ke dalam control
     * @param value value untuk di set ke dalam control
     */
    assignValue(value: string): void {
        let nValueLookup: CommonCommunicationData.CommonLookupValue = (null)! ; 
        let nLabel: string |JSX.Element =  (null)! ; 
        let noMatchLookup: boolean = false ; 
        if ( !isNull(value) ) {
            nValueLookup = this.findByCode(value) ; 
            if ( !isNull(nValueLookup)) {
                nLabel = this.rendererSelectedElementLabel(nValueLookup); 
                noMatchLookup = false ;
            } else {
                nLabel = value ; 
                noMatchLookup = true ;
            }
        }
        this.setStateHelper( cl => {
            cl.value = value ; 
            cl.valueRendered = nLabel ; 
            cl.lookupValueNotFound = noMatchLookup ; 
            cl.valueHaveSetted = true ; 
        });
    }

    /**
     * mencari dalam lookup dengan kode lookup
     * @param code kode untuk di cari
     */
    findByCode(code: string): CommonCommunicationData.CommonLookupValue {
        let lookupContainers: { [id: string ]: CommonCommunicationData.CommonLookupValue[]} = this.lookupContainers ; 
        let lovId: string = this.lovId ; 
        if ( isNull(lookupContainers) || isNull(lookupContainers[lovId])) {
            return (null)! ;
        }
        for ( let c of lookupContainers[ lovId ]) {
            if ( c.detailCode === code  ) {
                return c ; 
            }
        }
        return (null)! ;
    }
    /**
     * renderer label
     * @param data data lookup
     */
    rendererSelectedElementLabel(data: CommonCommunicationData.CommonLookupValue): JSX.Element | string {
        let nLabel: string |JSX.Element = (null)! ; 
        if ( !isNull(this.props.selectedDataLabelFormatter)) {
            nLabel = this.props.selectedDataLabelFormatter!(data) ; 
        } else if ( !isNull( this.props.labelFormatter)) {
            nLabel = this.props.labelFormatter!(data) ; 
        } else {
            nLabel = data.detailCode + ' - '  + data.label ; 
        }
        return nLabel ;
    }
    /**
     * handler on data selected
     */
    onDataSelected: (data: CommonCommunicationData.CommonLookupValue ) => any = (data: CommonCommunicationData.CommonLookupValue ) => {
        // let nValueLookup: CommonCommunicationData.CommonLookupValue = (null)! ; 
        let nLabel: string |JSX.Element =  i18n('query.select2.simple.noneSelectedLabel' , '- silakan pilih - '); 
        if ( !isNull(this.props.noneSelectedLabel)) {
            nLabel = this.props.noneSelectedLabel! ; 
        }
        let noMatchLookup: boolean = false ; 
        let oldValue: string  = this.state.value ; 
        let value: string = (null)! ; 
        if ( !isNull(data)) {
            value = data.detailCode! ; 
            nLabel = this.rendererSelectedElementLabel(data) ; 
        }
        this.setStateHelper( 
            cl => {
                cl.value = value ; 
                cl.valueRendered = nLabel ; 
                cl.lookupValueNotFound = noMatchLookup ; 
                return cl ; 
            } , 
            () => {
            if ( oldValue !== value  ) {
                this.builtinChangeHandler(value); 
                if (!isNull(this.props.changeHandler)) {
                    this.props.changeHandler!(value); 
                }
                if ( !isNull(this.props.changeHandlerWithLookup)) {
                    this.props.changeHandlerWithLookup!(data); 
                }
            }
        });
    }
    /**
     * built in method untuk change handler. di pakai untuk internal component. untuk propagasi change secara internal. misal untuk otomatic bind value ke state
     * @param value
     */
    builtinChangeHandler ( value: string  ) {
        //
    }
    render(): JSX.Element {
        if ( !isNull(this.props.readonlyState) && this.props.readonlyState ) {
            return <span>{this.state.valueRendered}</span>;
        } else {
            return this.renderUnPopupControl(); 
        }

    }
    
    /**
     * 
     * @param data data utnuk di render dalam label
     */
    formatLabel (data: CommonCommunicationData.CommonLookupValue ): JSX.Element|string {
        if ( !isNull(this.props.labelFormatter)) {
            return this.props.labelFormatter!(data); 
        }
        if ( isNull(data)) {
            return ''; 
        }
        return data.label!;
    }
    /**
     * ini control dalam posisi tidak di popup
     */
    renderUnPopupControl(): JSX.Element {
        let lks: CommonCommunicationData.CommonLookupValue[] = this.lookupContainers[this.lovId]; 
        if ( !isNull(this.props.dataFilter) && !isNull(lks)) {
            lks = lks.filter( lk => {
                return this.props.dataFilter!(lk); 
            });
        }
        let lblNone: string = isNull(this.props.noneSelectedLabel) ?  i18n('query.select2.simple.noneSelectedLabel' , '- silakan pilih - ')! : this.props.noneSelectedLabel! ; 
        let fmt: any = isNull(this.props.labelFormatter)  ? this.defaultLabelFormatter : this.props.labelFormatter ; 
        return ( 
        <Select2RawWrapperPanel 
            labelFormatter={fmt}
            lookups={lks}
            placeholder={lblNone}
            onValueChange={this.onValueChangeHandler}
            onValueChangeWithLookup={this.onValueChangeWithLookup}
            value={this.state.value}
            style={this.props.style}
        />
        ) ; 
    }
    private onValueChangeHandler: ( value: string  ) => any = ( value: string  )  => {
        if ( this.state.value === value) {
            return ; 
        }
        this.setStateHelper ( st => {
            st.value = value ; 
        }) ; 
        this.builtinChangeHandler(value) ; 
        if ( !isNull(this.props.changeHandler)) {
            this.props.changeHandler!( value); 
        }
    }
    private onValueChangeWithLookup: ( value: CommonCommunicationData.CommonLookupValue ) => any = ( value: CommonCommunicationData.CommonLookupValue ) => {
        if ( !isNull(this.props.changeHandlerWithLookup)) {
            this.props.changeHandlerWithLookup!(value); 
        }
    }
}