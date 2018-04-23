import * as React from "react";
import { CommonCommunicationData , isNull, copyProperty  , ListOfValueManager } from 'core-client-commons/index';
import { LOVEnabledComponent } from '../component/lov/data';
import { BaseHtmlComponent , BaseHtmlComponentProps , BaseHtmlComponentState } from './BaseHtmlComponent';

export interface SelectFxPanelProps extends BaseHtmlComponentProps {
    /**
     * id select control
     */
    selectId?: string; 

    /**
     * tab index. ini agar elemen bisa di focus
     */
    tabIndex ?: number; 

    /**
     * label untuk versi readonly
     */
    noneSelectedLabel?: string; 
    /**
     * default = true. ini flag apakah perlu di tambahkan semacam 'silakan pilih' pada index 0 dari data
     */
    appendNoneSelected ?: boolean ; 

    /**
     * filter data
     */
    dataFilter?: (data: CommonCommunicationData.CommonLookupValue) => boolean; 
    /**
     * formatter label. unutk di render dalam select2
     */
    labelFormatter?: (data: CommonCommunicationData.CommonLookupValue ) => string; 

    /**
     * handler value change
     */
    changeHandler ?: ( val: string ) => any ;

    /**
     * change handler dengan data lookup
     */
    changeHandlerWithLookup ?: (val: CommonCommunicationData.CommonLookupValue) => any ;   
    /**
     * parameter untuk lookup data. kalau select2 mengandalkan data dari select2
     */
    lookupParameter ?: {
        /**
         * id dari lookup. ini untuk di request kembali ke server
         */
        lovId: string; 

        /**
         * managaer lookup 
         */
        lookupManager: ListOfValueManager ; 
    };

    /**
     * initial value
     */
    initialValue ?: string; 
    /**
     * kode lookup
     */
    initialData?: CommonCommunicationData.CommonLookupValue[];

    /**
     * title . hint pada saat di mouse hover
     */
    titleFormatter?: (data: CommonCommunicationData.CommonLookupValue) => string; 

    /**
     * modificator data. kalau memerlukan modifikasi data dari lookup. misal : mengatur urutan dari data. mengatur level dari data(untuk presentasi tree)
     */
    lookupDataTransformator ?: ( lookups: CommonCommunicationData.CommonLookupValue[] ) => CommonCommunicationData.CommonLookupValue[] ; 
}
export interface SelectFxPanelState extends BaseHtmlComponentState {
    /**
     * flag expand collapse flag
     */
    expanded?: boolean; 

    /**
     * data yang di pilih
     */
    selectedData?: CommonCommunicationData.CommonLookupValue; 

    /**
     * kode lookup
     */
    data?: CommonCommunicationData.CommonLookupValue[]; 
    
}

/**
 * base panel select2 
 */
export abstract class BaseSelectFxPanel<PROPS extends SelectFxPanelProps , STATE extends SelectFxPanelState> extends BaseHtmlComponent<PROPS , STATE> implements LOVEnabledComponent {

    rootId: string ; 

    /**
     * id dari lookup. ini untuk di request kembali ke server
     */
    lovId: string; 
    noneSelectedLabel: string = 'Silakan pilih'; 
    /**
     * formatter standard
     */
    labelFormatter: (data: CommonCommunicationData.CommonLookupValue) => string = BaseSelectFxPanel.DEFAULT_LABEL_FORMATTER ; 
    /**
     * default formatter. kalau tidak di sediakan oleh pemanggil
     */ 
    static DEFAULT_LABEL_FORMATTER: (data: CommonCommunicationData.CommonLookupValue) => string = (data: CommonCommunicationData.CommonLookupValue) => {
        if ( isNull(data)) {
            return '' ; 
        }
        return data.detailCode  + ' - ' +  data.label;
    }
    constructor(props: PROPS) {
        super(props); 
        let swapState: any =  this.generateDefaultState(); 
        this.state = swapState ; 
        swapState.data = null ; 
        swapState.expanded = false ; 
        swapState.selectedData = null ; 
        this.rootId = 'select_fx_' + new Date().getTime() + '_' + Math.ceil(Math.random() * 1000);

    }

    /**
     * set value ke dalam control
     */
    setValue ( val: string ) {
        let s: any = null ; 
        this.setStateHelper ( st => {
            if (isNull(val)) {
                st.selectedData = s;
                return;
            } else {
                let comboVal: CommonCommunicationData.CommonLookupValue = s;
                if ( !isNull(this.state.data)) {
                    for (let d of this.state.data!) {
                        if (d.detailCode === val) {
                            comboVal = d; 
                            break;
                        }
                    }
                }
                if (st.selectedData !== comboVal) {
                    st.selectedData = comboVal;
                }
            }
        }); 
        
    }

    setValueNoWorker ( val: string , targetState: SelectFxPanelState ) {
        let s: any = null ;
        let swapState: any = targetState ; 
        if (isNull(val)) {
            swapState.selectedData = null;
            return;
        } else {
            let comboVal: CommonCommunicationData.CommonLookupValue = s;
            for (let d of targetState.data!) {
                if (d.detailCode === val) {
                    comboVal = d; 
                    break;
                }
            }
            if (swapState.selectedData !== comboVal) {
                swapState.selectedData = comboVal;
            }
        }
    }

    /**
     * value dari current data
     */
    getValue (): string {
        let s: any = null ;
        if ( isNull(this.state.selectedData)) {
            return s ; 
        }
        return this.state!.selectedData!.detailCode! ; 
    }
    /**
     * set list data. untuk content dari select2
     */
    setListData ( data: CommonCommunicationData.CommonLookupValue[] ) {
        let s: any = null ;
        this.setStateHelper ( st => {
            st.data = data ;
            let oldData: any = st.selectedData ;  
            if ( !isNull(data) && !isNull(st.selectedData)) {
                for ( let l of st.data) {
                    if ( l.detailCode = st.selectedData!.detailCode) {
                        st.selectedData = l ; 
                        break ; 
                    }
                }
            } else {
                st.selectedData = s ; 
            }
            if ( oldData !== st.selectedData) {
                this.fireChangeHandler();
            }
        });
    }
    /**
     * trigger change handler. ke listener dari change event
     */
    fireChangeHandler () {
        if ( !isNull( this.props.changeHandler)) {
            let s2: any = isNull(this.state.selectedData) ? null :   this.state!.selectedData!.detailCode ; 
            this.props.changeHandler!( s2);
        }
        if ( !isNull( this.props.changeHandlerWithLookup)) {
            let s3: any = isNull(this.state.selectedData) ? null :   this.state!.selectedData ; 
            this.props.changeHandlerWithLookup!(s3);
        }
    }

    /**
     * assign lookup header data
     */
    assignLookupData(lookupData: CommonCommunicationData.CommonLookupValue[]): any {
        let clones: CommonCommunicationData.CommonLookupValue[] = [] ; 
        if ( !isNull(lookupData)) {
            for ( let l of lookupData) {
                let s: any = {} ; 
                copyProperty( l , s) ; 
                clones.push(s); 
            }
        }
        if ( !isNull(this.props.lookupDataTransformator)) {
            clones = this.props.lookupDataTransformator!(clones);    
        }
        this.setListData(clones);
    }

    get rootElementId(): string {
        return this.rootId + '_level0' ; 
    }

    getElement (): HTMLElement {
        return document.getElementById(this.rootElementId)! ; 
    }
    componentWillMount() {
        let swapState: any = this.state ; 
        if ( !isNull(this.props.initialData)) {
            swapState.data = this.props.initialData ; 
            if ( !isNull(this.props.initialValue)) {
                for ( let l of this.props.initialData!) {
                    if ( l.detailCode === this.props.initialValue) {
                        swapState.selectedData = l ; 
                        break ; 
                    }
                }
            }
        }
        if ( !isNull(this.props.labelFormatter)) {
            this.labelFormatter = this.props.labelFormatter !; 
        }
        if ( !isNull(this.props.lookupParameter)) {
            this.lovId = this.props.lookupParameter!.lovId ; 
            this.props.lookupParameter!.lookupManager.register(this);
        }
        if ( !isNull(this.props.noneSelectedLabel)) {
            this.noneSelectedLabel = this.props.noneSelectedLabel! ; 
        }
    }

    abstract generateDefaultState (): STATE  ; 

    rendererTaskItemGenerator (data: CommonCommunicationData.CommonLookupValue) {
        let clsName: string = this.state.selectedData === data ? 'cs-selected' : '';
        return (
            <li
                key={this.rootId + '_' + data.detailCode} 
                className={clsName}
                onClick={(evt: any ) => {
                    evt.stopPropagation();
                    this.onDataSelected(data) ; 
                    return false ; 
                }}
            >
                <span>{this.labelFormatter(data)}</span>
            </li>
        );
    } 

    /**
     * handler pada saat data selected
     */
    onDataSelected (data: CommonCommunicationData.CommonLookupValue ) {
        this.setStateHelper ( 
            st => {
                st.selectedData = data ; 
                st.expanded = false ; 
                
            } , 
            () => {
                if ( !isNull(this.props.changeHandler)) {
                    this.props.changeHandler!(this.getValue());
                }
                if ( !isNull(this.props.changeHandlerWithLookup)) {
                    this.props.changeHandlerWithLookup!(this.state.selectedData!);
                }
            });
        
    }

    rendererTaskCombo ( param: {
        /**
         * flag mandatory validation failed
         */
        mandatoryValidationFailed ?: boolean  ; 
        /**
         * message error
         */
        errorMessage ?: string
        }  ): JSX.Element {
        let sNull: any = null ; 
        let {errorMessage , mandatoryValidationFailed } = param ; 
        let lbl: string =  this.noneSelectedLabel; 
        if ( !isNull(this.state.selectedData) ) {
            lbl = this.labelFormatter(this.state.selectedData!) ; 
        }
        let opts: any [] = [] ;
        if ( !isNull(this.state.data)) {
            for ( let l of this.state.data!) {
                opts.push(this.rendererTaskItemGenerator(l));
            }
        } 
        let style: any = {} ;
        let ttl: string = '' ; 
        if (!isNull(mandatoryValidationFailed) &&  mandatoryValidationFailed) {
            if ( isNull(errorMessage)) {
                // TODO : ini harus i18n Ready 
                errorMessage = 'Isian tidak boleh kosong';
            }
            style = {
                border: '1px solid red'
            };
            ttl = errorMessage! ; 
        }
        let nonSelItem: any[] = [] ; 
        if ( isNull(this.props.appendNoneSelected) || this.props.appendNoneSelected) {
            nonSelItem.push( 
                (
                    <li 
                        key={this.rootId + '_none_selected'} 
                        onClick={() => {
                            this.onDataSelected(sNull);
                        }} 
                        data-option="" 
                        data-value=""
                    ><span>{this.noneSelectedLabel}</span>
                    </li>
                )
            );
        } 
        let id: string = this.rootElementId ; 
        return (
        <div
            style={style}
            title={ttl} 
            key={id} 
            id={id} 
            onBlur={() => {
                if  ( this.state.expanded) {
                    this.setStateHelper ( st => {
                        st.expanded = false ; 
                    });
                }
            }}
            className={"cs-select cs-skin-slide " + (this.state.expanded ? 'cs-active'  : '')} 
            tabIndex={isNull(this.props.tabIndex) ? 1000 : this.props.tabIndex} 
            onClick={() => {
                this.setStateHelper ( st => {
                    st.expanded = true ; 
                });
            }}
        >
            <span key={this.rootId + '_visible_label'} className="cs-placeholder">{lbl}</span>
            <div  key={this.rootId + '_opt_container'} className="cs-options">
                <ul  key={this.rootId + '_data_ul_container'} >
                    {nonSelItem}
                    {opts}
                </ul>
            </div>
            <select tabIndex={isNull(this.props.tabIndex) ? 1000 : this.props.tabIndex}  className="cs-select cs-skin-slide">{}</select>
        </div>
    );
    }

}

/**
 * panel select2 simple
 */
export class    SelectFxPanel extends BaseSelectFxPanel <SelectFxPanelProps , SelectFxPanelState> {
    generateDefaultState (): SelectFxPanelState {
        let s: any = null ; 
        return {
            data : s , 
            expanded : false , 
            selectedData : s 
        };
    }
    render () {
        return this.rendererTaskCombo({}) ; 
    }
}