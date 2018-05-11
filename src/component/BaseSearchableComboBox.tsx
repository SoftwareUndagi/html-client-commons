import * as React from "react";
import { CommonCommunicationData , ListOfValueManager, LOVEnabledComponent  } from 'core-client-commons';
import { isNull , i18n  , focusToDiv , readNested , getElementPosition } from '../utils/index';
import { SearchableComboBoxDropDown } from './SearchableComboBoxDropDown';
import { OffscreenPanelContainer , DetachPanel } from './OffscreenPanelContainer';
import { BaseHtmlComponent , BaseHtmlComponentProps , BaseHtmlComponentState } from './BaseHtmlComponent';

export interface BaseSearchableComboBoxProps extends BaseHtmlComponentProps {

    /**
     * parameter untuk lookup data. kalau select2 mengandalkan data dari select2
     */
    lookupParameter?: {
        /**
         * id dari lookup. ini untuk di request kembali ke server
         */
        lovId: string; 
        /**
         * lookup containers
         */
        lookupContainers ?:  { [id: string ]: CommonCommunicationData.CommonLookupValue[]};  

        /**
         * managaer lookup 
         */
        lookupManager?: ListOfValueManager ; 
    };

    /**
     * modificator data. kalau memerlukan modifikasi data dari lookup. misal : mengatur urutan dari data. mengatur level dari data(untuk presentasi tree)
     */
    lookupDataTransformator ?: ( lookups: CommonCommunicationData.CommonLookupValue[] ) => CommonCommunicationData.CommonLookupValue[] ; 
    /**
     * prefix id dari element
     */
    selectId ?: string ; 
    /**
     * formatter label combo box
     */
    labelFormatter ?: (lookup: CommonCommunicationData.CommonLookupValue) => string |JSX.Element ;
    /**
     * untuk render item yang selected . bagian atas pada saat ada item yang di pilih
     */
    selectedDataLabelFormatter  ?: (lookup: CommonCommunicationData.CommonLookupValue) => string |JSX.Element ;
    /**
     * data filter. untuk memproses data yang di tampilkan 
     */
    dataFilter ?:   (lookup: CommonCommunicationData.CommonLookupValue) => boolean ;
    /**
     * change handler untuk textbox
     */
    changeHandler ?: (value: string ) => any ;
    /**
     * state readonly atau tidak
     */
    readonlyState?: boolean  ;
    /**
     * custom none selected label. default akan memakai : query.select2.simple.noneSelectedLabel
     */
    noneSelectedLabel ?: string ; 
    /**
     * title untuk hint dalam textbox
     */
    title?: string ;
    /**
     * index dari tab
     */
    tabIndex ?: number  ;
    /**
     * change handler dengan lookup data reciever
     */
    changeHandlerWithLookup ?: ( value: CommonCommunicationData.CommonLookupValue ) => any ; 
    /**
     * lebar component. misal 100px , 100%. akan di default 100% kalau tidak di isikan
     */
    width ?:   string ; 

    /**
     * initial value
     */
    initialValue ?: string; 

    /**
     * kode lookup
     */
    initialData?: CommonCommunicationData.CommonLookupValue[];

    /**
     * filter dengan query. ini kalau perlu filter khusus
     */
    queryDataFilter?: (query: string, data: CommonCommunicationData.CommonLookupValue) => boolean;

    /**
     * field yang menjadi custom business field. normal nya seharusnya detailCode. null berarti akan di ambil 
     */
    businessCodeFieldName ?:  'id' |'value1' | 'value2'|'custom'; 

    /**
     * di pakaai kalau query benar-benar custom(di luar id , value1, value2 untuk business field code)
     */
    businessCodeFieldNameWithNoneStandard ?: string ; 
}
export interface BaseSearchableComboBoxState extends BaseHtmlComponentState {
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
    internalLookupContainers ?:  { [id: string ]: CommonCommunicationData.CommonLookupValue[]};  
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
    /**
     * flag drop down tampil atau tidak. none atas atau bawah
     */
    dropDownShowed: 'none' |'above' |'below' ; 
}
/**
 * tiruan select 2 
 */
export abstract class BaseSearchableComboBox<PROPS extends BaseSearchableComboBoxProps, STATE extends BaseSearchableComboBoxState> extends BaseHtmlComponent <PROPS , STATE> implements LOVEnabledComponent {
    /**
     * dari dari lookup untuk ID dari lov
     */
    static DEFAULT_LOV_ID: string = 'DEFAULT'  ; 
    /**
     * command untuk menutup drop down
     */
    detachDropDown: DetachPanel ; 
    /**
     * tinggi dari drop down
     */
    dropdownHeight: number  =  357 ;
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
     * default formatter 
     */
    defaultLabelFormatter: (data: CommonCommunicationData.CommonLookupValue) => string|JSX.Element = (data: CommonCommunicationData.CommonLookupValue) => {
        let lbl: string = data.label! ; 
        let code: string = data.detailCode! ; 
        if ( !isNull(this.props.businessCodeFieldName)) {
            if ( this.props.businessCodeFieldName === 'custom'  ) {
                if (!isNull(this.props.businessCodeFieldNameWithNoneStandard) && this.props.businessCodeFieldNameWithNoneStandard!.length > 0  ) {
                    code = readNested(data , this.props.businessCodeFieldNameWithNoneStandard! ) ;
                }
            } else {
                code = readNested(data , this.props.businessCodeFieldName!);
            }
        }
        if ( !isNull(data.i18nKey)) {
            lbl = i18n( data.i18nKey! , lbl); 
        }
        if ( data == null || typeof data === 'undefined') {
            return '' ; 
        }
        return code + ' - ' + lbl ; 
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
        if ( !isNull(this.props.businessCodeFieldName)) {
            if ( this.props.businessCodeFieldName === 'custom'  ) {
                if (!isNull(this.props.businessCodeFieldNameWithNoneStandard) && this.props.businessCodeFieldNameWithNoneStandard!.length > 0  ) {
                    detailCode = readNested(checkedData , this.props.businessCodeFieldNameWithNoneStandard! ) ;
                }
            } else {
                detailCode = readNested( checkedData , this.props.businessCodeFieldName!);
            }
        }
        let label: string = checkedData.label! ; 
        if ( !isNull(label)) {
            label = label.toUpperCase(); 
            if ( label.indexOf(uper) >= 0) {
                return true ; 
            }
        }
        if ( !isNull(detailCode)) {
            detailCode = detailCode.toUpperCase() ; 
            if ( detailCode.indexOf(uper) >= 0) {
                return true ; 
            }
        }
        return false ;
    }
     
    constructor(props: PROPS) {
        super(props) ;
        let stateBaru: STATE = this.generateDefaultState() ;
        this.state  = stateBaru ; 
        stateBaru.internalLookupContainers = {} ;  
        stateBaru.valueRendered =  i18n('query.select2.simple.noneSelectedLabel' , '- silakan pilih - ') ; 
    }
    /**
     * generate default state untuk combo box
     */
    abstract generateDefaultState (): STATE ; 
    /**
     * id dari lookup yang di pergunakan untuk data
     */
    get lovId (): string {
        if ( this.doesNotUseLookupManager) {
            return BaseSearchableComboBox.DEFAULT_LOV_ID; 
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
        let lovId: string = BaseSearchableComboBox.DEFAULT_LOV_ID ; 
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
        let swapState: any = this.state ; 
        // let lovId: string = BaseSearchableComboBox.DEFAULT_LOV_ID ; 
        if ( !isNull(this.props.lookupParameter)) {
            // lovId = this.props.lookupParameter!.lovId ; 
            if ( isNull(this.props.lookupParameter!.lookupManager ) && isNull(this.props.lookupParameter!.lookupContainers) ) {
                throw {message : 'Parameter : lookupParameter.lookupManager dan lookupParameter.lookupContainers tidak boleh kosong keduanya. anda perlu mengirimkan lookup manager, atau container lookup. silakan putuskan salah satu, cek lookup : ' + this.props.lookupParameter!.lovId};  
            }
            if ( !isNull(this.props.lookupParameter!.lookupContainers)) {
                this.useExternalLookupContainer = true ; 
            } else {
                this.useExternalLookupContainer = false ; 
                swapState.internalLookupContainers = {} ; 
            }
            if (!isNull(this.props.lookupParameter!.lookupManager)) {
                this.props.lookupParameter!.lookupManager!.register( /* {
                    assignLookupData : this.assignLookupData.bind(this), 
                    getElement : ()=>{
                        let htmlElementIdPrefix : string = isNull(this.props.selectId) || this.props.selectId.length ===0 ? this.htmlElementIdPrefix : this.props.selectId ; 
                        let rootElement : HTMLElement = document.getElementById(htmlElementIdPrefix + '_root') ; 
                        return rootElement ; 

                    } , 
                    lovId : lovId
                }*/ this ) ; 
            }
        } else {
            this.doesNotUseLookupManager = true ; 
        }
        if ( !isNull(this.props.initialData)) {
            this.lookupContainers[this.lovId] = this.props.initialData! ; 
        }
        if ( !isNull(this.props.initialValue)) {
            swapState.value = this.props.initialValue ; 
            let mthchLookup: CommonCommunicationData.CommonLookupValue = this.findByCode(this.props.initialValue!) ; 
            if ( !isNull(mthchLookup)) {
                swapState.lookupValueNotFound = false ; 
                swapState.valueLookup = mthchLookup ; 
                swapState.valueRendered = this.rendererSelectedElementLabel(mthchLookup) ; 
            } else {
                swapState.lookupValueNotFound = true ;
                swapState.valueLookup = null ;  
                swapState.valueRendered = this.props.initialValue ; 
            }
        }
    
    }

    /**
     * untuk menutup drop down
     */
    closeDropDown: () => any = () => {
        if ( !isNull(this.detachDropDown)) {
            this.detachDropDown(); 
            this.detachDropDown = (null)! ; 
        }
        this.setStateHelper(cl => {
            cl.dropDownShowed = 'none'; 
            return cl ; 
        });
    }
    /**
     * assign value ke dalam control
     * @param value value untuk di set ke dalam control
     */
    assignValue (value: string ) {
        let nValueLookup: CommonCommunicationData.CommonLookupValue = (null)! ; 
        let nLabel: string |JSX.Element = (null)! ; 
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
            return cl ; 
        });

    }

    /**
     * mencari dalam lookup dengan kode lookup
     * @param code kode untuk di cari
     */
    findByCode ( code: string ): CommonCommunicationData.CommonLookupValue {
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
     * handler on clear click
     */
    onClearButtonClick: (evt: any ) => any = (evt: any ) => {
        console.log('[BaseSearchableComboBox] clear button di click');
        if ( !isNull(this.state.value) ) {
                this.setStateHelper( 
                    cl => {
                            cl.value = (null)! ; 
                            let nLabel: string |JSX.Element =  i18n('query.select2.simple.noneSelectedLabel' , '- silakan pilih - '); 
                            if ( !isNull(this.props.noneSelectedLabel)) {
                                nLabel = this.props.noneSelectedLabel! ; 
                            }
                            cl.valueRendered = nLabel ; 
                            cl.dropDownShowed = 'none';
                            cl.lookupValueNotFound = null!; 
                            cl.valueHaveSetted = true ; 
                            return cl ; 
                    } , 
                    () => {
                        if ( !isNull(this.props.changeHandler)) {
                            this.props.changeHandler!(null!); 
                        }
                        if ( !isNull(this.props.changeHandlerWithLookup) ) {
                            this.props.changeHandlerWithLookup!(null! ) ; 
                        }
                    });
        }
        this.closeDropDown(); 
        if ( !isNull(evt.stopPropagation)) {
            evt.stopPropagation (); 
        }
        
    }

    /**
     * renderer label
     * @param data data lookup
     */
    rendererSelectedElementLabel  (data: CommonCommunicationData.CommonLookupValue ): JSX.Element |string {
        let nLabel: string |JSX.Element = null !; 
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
        // let nValueLookup: CommonCommunicationData.CommonLookupValue = null! ; 
        let nLabel: string |JSX.Element =  i18n('query.select2.simple.noneSelectedLabel' , '- silakan pilih - '); 
        if ( !isNull(this.props.noneSelectedLabel)) {
            nLabel = this.props.noneSelectedLabel !; 
        }
        let noMatchLookup: boolean = false ; 
        let oldValue: string  = this.state.value ; 
        let value: string = null! ; 
        if ( !isNull(data)) {
            value = data.detailCode! ; 
            // nValueLookup = data ;
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
                if ( oldValue !== value ) {
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
    /**
     * focus ke control
     */
    focusToControl: () => any = () => {
        focusToDiv( this.rootElementId); 
    }
    onHideDropDownCLick: (evt: any ) => any = (evt: any) => {
        if (!isNull(evt) && !isNull(evt.stopPropagation)) {
            evt.stopPropagation (); 
        }
        this.closeDropDown(); 
    }

    /**
     * calculator posisi drop down
     */
    calculateDropDownPosition: (dropDownHeight: number , position?: 'above'|'below' ) => any = (dropDownHeight: number, position?: 'above'|'below'  ) => {
        let htmlElementIdPrefix: string = isNull(this.props.selectId) || this.props.selectId!.length === 0 ? this.htmlElementIdPrefix : this.props.selectId! ; 
        let rootElement: HTMLElement = document.getElementById(htmlElementIdPrefix + '_root') !; 
        let pos: any =   getElementPosition(rootElement)!; 
        let rct: ClientRect = rootElement.getBoundingClientRect(); 

        let windowHeight: number = window.innerHeight ; 
        let scrollOffset: number = window.pageYOffset ; 
        let sisa: number = windowHeight - ( pos.top - scrollOffset)  - dropDownHeight ; 
        let dispFlag: 'above' |'below' = 'below'; 
        let dropTop: number = pos.top + 30  ; 
        if ( !isNull(position)) {
            if ( position === 'below') {
                //
            } else {
                dispFlag = 'above'; 
                dropTop = pos.top - dropDownHeight ; 
            }
        } else {
            if ( sisa >= 0 ) {
                // tampil ke bawah
            } else {
                // tampil ke atas
                dispFlag = 'above'; 
                dropTop = pos.top - dropDownHeight + 123; 
            }
        }
        
        console.log('[BaseSearchableComboBox] drop down variables > windowHeight : ' , windowHeight , '.pos:'  , pos , '.rct :' , rct , '.scrollOffset:' , scrollOffset  , '.dispFlag:' , dispFlag , '.dropDownHeight : '  , dropDownHeight );
        return {
            dispFlag : dispFlag , 
            top : dropTop , 
            left : pos.left , 
            width : rct.width 
        };
    }
    /**
     * handler kalau drop down di pilih 
     */
    onShowDropdownClick: (evt: any ) => any = (evt: any) => {
        if ( !isNull(evt) && !isNull(evt.stopPropagation)) {
            evt.stopPropagation (); 
        }
        this.showDropdownWorker()
            .then( d => {
                //
            })
            .catch( exc => {
                //
            }); 
        
    }

    /**
     * bridge ke : onShowDropdownClick. untuk memudahkan operasi async
     */
    protected showDropdownWorker (): Promise<any> {
        return new Promise<any> (  ( accept: (n: any ) => any , reject: (exc: any ) => any ) => {
            let s: any = this.calculateDropDownPosition(this.dropdownHeight); 
            this.setStateHelper( cl => {
                cl.dropDownShowed = s.dispFlag; 
            });
            let dropDownData: CommonCommunicationData.CommonLookupValue [] = [] ; 
            let rawData: CommonCommunicationData.CommonLookupValue[] = null!;
            if ( !isNull(this.props.lookupParameter!.lookupContainers)) {
                rawData = this.props.lookupParameter!.lookupContainers![this.lovId]; 
            } else {
                if ( !isNull(this.props.lookupParameter!.lookupManager)) {
                    this.props.lookupParameter!.lookupManager!.loadFromCacheSingle(this.props.lookupParameter!.lovId)
                        .then(d1 => {
                            rawData =  d1 ; 
                            this.showDropdownWorkerWithData(dropDownData, rawData , s);
                        }).catch(reject) ; 
                    return ; 
                }
            }
            this.showDropdownWorkerWithData(dropDownData, rawData, s);
        }); 
    }

    protected showDropdownWorkerWithData (  dropDownData: CommonCommunicationData.CommonLookupValue [] , rawData: CommonCommunicationData.CommonLookupValue[]  , s: any): Promise<any> {
        return new Promise<any> (  ( accept: (n: any ) => any , reject: (exc: any ) => any ) => {
            if ( isNull(this.props.dataFilter)) {
                dropDownData = rawData ; 
            } else {// filter data untuk dir ender
                if (!isNull(rawData)) {
                    for ( let d of rawData) {
                        if (this.props.dataFilter!(d)) {
                            dropDownData.push(d); 
                        }
                    }
                }
            }
            let htmlElementIdPrefix: string = isNull(this.props.selectId) || this.props.selectId!.length === 0 ? this.htmlElementIdPrefix : this.props.selectId! ;
            this.detachDropDown =  OffscreenPanelContainer.getOffscreenPanelContainer()
                .appendPanel( (
                <SearchableComboBoxDropDown 
                    labelFormatter={isNull(this.props.labelFormatter) ? this.defaultLabelFormatter : this.props.labelFormatter!}
                    left={s.left}
                    width={s.width}
                    top={s.top}
                    key={htmlElementIdPrefix}
                    htmlElementIdPrefix={htmlElementIdPrefix}
                    dropdownData={dropDownData}
                    queryDataFilter={!isNull(this.props.queryDataFilter) ? this.props.queryDataFilter! :    this.queryWorker}
                    closeCommand={this.closeDropDown}
                    onItemSelected={this.onDataSelected}
                    dropDownPosition={s.dispFlag}
                    calculateDropDownPosition={this.calculateDropDownPosition}
                    currentSelectedIds={isNull(this.state.value) ? null! : [this.state.value!]}
                />) );
            accept({}) ; 
        });
    }

    render () {
        if ( !isNull(this.props.readonlyState) && this.props.readonlyState ) {
            return <span id={this.rootElementId}>{this.state.valueRendered}</span>;
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
     * id html element untuk root element
     */
    get rootElementId (): string {
        let htmlElementIdPrefix: string = isNull(this.props.selectId) || this.props.selectId!.length === 0 ? this.htmlElementIdPrefix : this.props.selectId !; 
        return htmlElementIdPrefix + '_root' ; 
    }

    /**
     * ini control dalam posisi tidak di popup
     */
    renderUnPopupControl ( ): JSX.Element {
        // select2 select2-container select2-container--default select2-container--above
        let lebar: string = '100%'; 
        if ( !isNull(this.props.width)) {
            lebar = this.props.width! ; 
        }
        let styleRoot: React.CSSProperties = {width : lebar}; 
        let htmlElementIdPrefix: string = isNull(this.props.selectId) || this.props.selectId!.length === 0 ? this.htmlElementIdPrefix : this.props.selectId! ; 
        let propRoot: any = {
            className : 'select2 select2-container select2-container--default' , 
            style : styleRoot  , 
            dir : 'ltr'  
        };
        let arrowIconClick: ( evt: any ) => any = this.state.dropDownShowed === 'none' ? this.onShowDropdownClick : this.onHideDropDownCLick ; 
        if ( this.state.dropDownShowed === 'above') {
            propRoot.className = 'select2 select2-container select2-container--default select2-container--above select2-container--open' ; 
        } else if ( this.state.dropDownShowed === 'below') {
            propRoot.className = 'select2 select2-container select2-container--default select2-container--below select2-container--open';
        }
        // select2 select2-container select2-container--default select2-container--below select2-container--open
        if ( !isNull(this.props.tabIndex) ) {
            propRoot.tabIndex = this.props.tabIndex ; 
        }
        if ( !isNull(this.props.title)) {
            propRoot.title = this.props.title;
        }

        let rndrLbl: any = this.state.valueRendered ; 
        if ( isNull(this.state.value)) {
            if ( !isNull(this.props.noneSelectedLabel)) {
                rndrLbl = this.props.noneSelectedLabel ;
            } else {
                rndrLbl = i18n('query.select2.simple.noneSelectedLabel' , '- silakan pilih - ') ;
            }
        }
        let clearBtn: any [] = [] ; 
        if (!isNull(this.state.value)) {
            clearBtn = [(
                <span 
                    style={{ width : '20px' , height : '25px' , 
                    paddingLeft : '5px' , 
                    right : '15px' , 
                    position : 'absolute'  , 
                    top : '1px'}}   
                    id={htmlElementIdPrefix + '_clear_button'}
                >
                        <a onClick={this.onClearButtonClick}>×</a>
                </span>
            )];
        } 
        return (
        <span 
            key={'root_no_drop_down'}
            {...propRoot} 
            id={this.rootElementId}
        >
                <span className='selection' id={htmlElementIdPrefix + '_selection'}>
                    <span className='select2-selection select2-selection--single'>
                        <span className='select2-selection__rendered' id={htmlElementIdPrefix + '_label_and_button_container'}  onClick={arrowIconClick} >
                            <span style={{overflow : 'hidden' , whiteSpace : 'nowrap' , textOverflow : 'ellipsis'}}  id={htmlElementIdPrefix + '_selected_item_renderer'}>{rndrLbl}</span>
                        </span>
                        {clearBtn}
                        <span 
                            className='select2-selection__arrow' 
                            onClick={arrowIconClick}  
                            id={htmlElementIdPrefix + '_arrow_button'}
                        >
                            <b />
                        </span>
                    </span>
                </span>
        </span>
            );
    }

}
