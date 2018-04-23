import * as React from "react" ;
import { CommonCommunicationData , isNull , ListOfValueManager } from 'core-client-commons/index';
import { ObjectUtils } from '../../../utils/ObjectUtils';
import { LOVEnabledComponent } from '../../ListOfValueComponent'; 
import { BaseHtmlComponent , BaseHtmlComponentProps , BaseHtmlComponentState  } from '../../BaseHtmlComponent';

/**
 * interface simple combo box
 */
export interface SimpleComboboxProps extends   BaseHtmlComponentProps {

    /**
     * style custom untuk combo box. untuk manipulasi langsung
     */
    style ?: React.CSSProperties ; 
    /**
     * css untuk combo box
     */
    className ?: string ; 
    /**
     * none selected. akan di default ( false)
     */
    appendNoneSelected ?: boolean ;
    /**
     * default akan di isi dengan - silakan pilih - 
     */
    noneSelectedLabel ?: string ;

    /**
     * change handler untuk textbox
     */
    changeHandler ?: (value: string ) => any ;
    /**
     * formatter label combo box
     */
    comboLabelFormatter?: (lookup: CommonCommunicationData.CommonLookupValue) => string ;
    /**
     * data filter. untuk memproses data yang di tampilkan 
     */
    dataFilter ?:   (lookup: CommonCommunicationData.CommonLookupValue) => boolean ;
    /**
     * id dari text box
     */
    id?: string ;
    /**
     * flag panel hidden atau tidak
     */
    hidden ?: boolean ; 
    /**
     * parameter untuk lookup data. kalau select2 mengandalkan data dari select2
     */
    lookupParameter?: {
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
     * flag apakah children perlu di render setelah lookup di terima. default = true 
     */
    doNotRenderChildrenAfterLookupAccepted ?: boolean ; 
}
export interface SimpleComboboxState extends BaseHtmlComponentState {
    /**
     * data lookups
     */
    lookups: CommonCommunicationData.CommonLookupValue[] ; 

    /**
     * flag children tidak perlu di render atau tidak
     */
    doNotRenderChildren: boolean ; 
}
/**
 * wrapper combo box sederhana
 */
export class SimpleCombobox extends BaseHtmlComponent<SimpleComboboxProps , SimpleComboboxState> implements LOVEnabledComponent {

    element: HTMLElement ; 

    constructor(props: SimpleComboboxProps) {
        super(props) ; 
        this.state = {
            lookups : null !, 
            doNotRenderChildren : false
        };
        if ( props.lookupParameter) {
            props.lookupParameter.lookupManager.register(this);
        }
    }

    /**
     * id dari lookup. ini untuk di request kembali ke server
     */
    get lovId(): string {
        if ( !this.props.lookupParameter) {
            return null! ;
        }
        return this.props.lookupParameter.lovId ; 
    }

    /**
     * underlying element. elemetn yang menjadi based dari LOV
     */
    getElement(): HTMLElement {
        return this.element ; 
    }
    /**
     * assign lookup header data
     */
    assignLookupData(lookupData: CommonCommunicationData.CommonLookupValue[]) {
        this.setStateHelper ( 
            st => {
            st.lookups = lookupData ;
            if ( isNull(this.props.doNotRenderChildrenAfterLookupAccepted) || this.props.doNotRenderChildrenAfterLookupAccepted) {
                st.doNotRenderChildren = true ; 
            }
        });
    }
    render (): JSX.Element {
        let cloneProps: any = {} ; 
        
        ObjectUtils.copyField(  this.props, cloneProps);
        if ( !isNull(this.props.hidden) && this.props.hidden) {
            let cssProp: React.CSSProperties =  cloneProps.style ; 
            if ( isNull(cssProp)) {
                cssProp = {};
            } else {
                cssProp = {} ; 
                ObjectUtils.copyField(  this.props.style, cssProp);
                cloneProps.style = cssProp;
            }
            cssProp.display = 'none' ;
        }
        if ( !isNull(this.props.changeHandler)) {
            cloneProps.onChange = (evt: React.FormEvent<any> ) => {
                let val: any =  evt.target['value'] ; 
                this.props.changeHandler!(val)  ; 
            };
        }
        let cloneStyle: React.CSSProperties = {} ; 
        if ( !isNull(this.props.style)) {
            ObjectUtils.copyField(  this.props.style, cloneStyle);
        }
        if  ( !isNull(this.props.hidden) && this.props.hidden) {
            cloneStyle.display = 'none' ; 
        }

        return (
        <select 
            className={this.props.className}
            style={this.props.style}
            id={this.props.id}
            onChange={this.onChange}
        >
            {this.renderComboValues()}
            {this.state.doNotRenderChildren ? null  : this.props.children}
        </select>);
    }

    private onChange: (evt: any ) => void = (evt: any ) => {
        let val: any = evt.target.value ; 
        if ( this.props.changeHandler) {
            this.props.changeHandler(val) ; 
        }
    }
    /**
     * renderer single item
     * @param lookup value untuk di render
     */
    private renderOption (lookup: CommonCommunicationData.CommonLookupValue): JSX.Element {
        let lbl: string = lookup.label! ; 
        if ( !isNull(this.props.comboLabelFormatter)) {
            lbl = this.props.comboLabelFormatter!(lookup);
        }
        return <option key={lookup.detailCode} value={lookup.detailCode} title={lookup.detailCode}>{lbl}</option>   ; 
    }

    /**
     * renderer option
     */
    private renderComboValues (): JSX.Element[] {
        let rtvl: any[] = [] ; 
        if ( !isNull(  this.props.appendNoneSelected) &&   this.props.appendNoneSelected) {
            let defLbl: string = '- Silakan pilih -' ;
            if ( !isNull(this.props.noneSelectedLabel)) {
                defLbl = this.props.noneSelectedLabel! ; 
            }
            rtvl.push(<option value='' key='none_value'>{defLbl}</option>);
        }
        if ( !isNull(this.state.lookups)) {
            if ( this.props.dataFilter) {
                for ( let lk of this.state.lookups) {
                    if ( this.props.dataFilter(lk)) {
                        rtvl.push(this.renderOption(lk));
                    }
                }
            } else {
                for ( let lk of this.state.lookups) {
                    rtvl.push(this.renderOption(lk));
                }
            }
        }
        return rtvl ; 
    }

}