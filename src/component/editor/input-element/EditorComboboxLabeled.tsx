
import * as React from "react" ;
import { EditorInputElement } from './CommonsInputElement';
import { CommonLookupValue } from 'base-commons-module';
import {  isNull , readNested , setValueHelper ,  }from 'base-commons-module' ; 
import { getCssForColumnWithScreenType } from '../../../utils/index' ; 
import { EditorCombobox , EditorComboboxProps , EditorComboboxState } from './EditorCombobox';
import { EditorComboboxWrapper   } from './EditorComboboxWrapper';
import { BaseHtmlComponent   } from '../../BaseHtmlComponent';

export interface EditorComboboxLabeledProps extends EditorComboboxProps {
    /**
     * label untuk di sebelah textbox
     */
    label: string ;

    /**
     * css untuk label. di default:col-xx-4 control-label 
     */
    cssLabel?: string ; 

    /**
     * css untuk div textbox. kalau misal di perlukan item tertentu untuk bagian ini 
     */
    cssDivTextbox  ?: string ;
    /**
     * css name untuk label readonly
     */
    readonlyCssName?: string; 
   
}
export interface EditorComboboxLabeledState {
    value: string ; 
}

/**
 * combo box dengan label 
 */
export class EditorComboboxLabeled extends BaseHtmlComponent<EditorComboboxLabeledProps , EditorComboboxLabeledState>  implements EditorInputElement {
    
    /**
     * props untuk di check apakah membuat perubahhan ataut idak
     */
    static FIELD_COMPARED_PROPS: string[] = ['label' , 'cssLabel',  'className', 'cssDivTextbox', 'readonlyCssName',	'title',	'tabIndex',	'readonlyState',	'appendNoneSelected',	'noneSelectedLabel',	'readonlyCssName',	'id'] ; 
    
    static FIELD_COMPARED_STATE: string[] = [ 'value' , 'haveChange'] ;
    
    static ID_COUNTER: number = -1 ;  
    cssLabel: string   ; 
    cssDivTextbox: string ;
    /**
     * midle class dari bootstrap
     */
    bootstrapColumnClass: string ; 
    /**
     * css name untuk label readonly
     */
    readonlyCssName: string = 'labelOnView';

    elementId: string ; 
    actualComboBox: EditorComboboxWrapper ; 
    /**
     * method untuk force read data dari control
     */
    forceReadDataFromControlMethod:   (doNotUpdateState?: boolean) => any ; 

    constructor(props: EditorComboboxLabeledProps ) {
        super(props) ; 
        this.bootstrapColumnClass   = getCssForColumnWithScreenType() ;
        this.cssLabel = 'col-' + this.bootstrapColumnClass + '-4 control-label';
        this.cssDivTextbox = 'col-' + this.bootstrapColumnClass + '-8';
        this.state = {
            value : null !
        }; 
        this.elementId = this.props.id || null! ;
        if (this.elementId == null || typeof this.elementId === 'undefined' ) {
            if ( EditorComboboxLabeled.ID_COUNTER === -1) {
                EditorComboboxLabeled.ID_COUNTER = new Date().getTime() ;
            }
            this.elementId = 'core_framework_combo_' + EditorComboboxLabeled.ID_COUNTER ;
            EditorComboboxLabeled.ID_COUNTER += 1  ;
        }
        if ( props.cssLabel != null && typeof props.cssLabel !== 'undefined' && props.cssLabel !== '' ) {
            this.cssLabel = props.cssLabel ; 
        }
        if ( props.cssDivTextbox !== null && typeof props.cssDivTextbox !== 'undefined' && props.cssDivTextbox !== '' ) {
            this.cssDivTextbox = props.cssDivTextbox ; 
        }  
        if ( props.readonlyCssName !== null && typeof props.readonlyCssName !== 'undefined' && props.readonlyCssName.length > 0) {
            this.readonlyCssName = props.readonlyCssName ; 
        }
        if ( !isNull(props.registrarMethod)) {
            props.registrarMethod(this , false );
        }
    }
    shouldComponentUpdate(nextProps: EditorComboboxProps, nextState: EditorComboboxState): boolean {
        if (this.compareForShouldComponentUpdateStateOrProp(EditorComboboxLabeled.FIELD_COMPARED_PROPS, this.props, nextProps)) {
            return true;
        }
        if (this.compareForShouldComponentUpdateStateOrProp(EditorComboboxLabeled.FIELD_COMPARED_STATE, this.state, nextState)) {
            return true;
        }
        return false ;
    }
    /**
     * assign method untuk force control readfromControl on change
     */
    assignForceReadDataFromControlMethod  ( method: (doNotUpdateState?: boolean) => any ): any {
        this.forceReadDataFromControlMethod = method ; 
    }
    
    componentWillUnmount() {
         if ( !isNull(this.props.registrarMethod)) {
            this.props.registrarMethod(this , true );
        }
    }

    assignDataToControl  (data: any, updateState ?: boolean  ) {
        if ( this.props.customAssignValue != null && typeof this.props.customAssignValue !== 'undefined') {
            this.props.customAssignValue(data , this.actualComboBox) ; 
        } else {
            let val: string = null! ;
            if ( data != null && typeof  data !== 'undefined') {
                val = readNested( data , this.props.fieldName); 
            }
            if (!( !isNull(updateState) && !updateState) ) {
                this.setStateHelper ( st => st.value = val  );
            } else {
                let swapState: any = this.state ; 
                swapState.value = val ;
            }
        }
    }  

    /**
     * membaca data dari control
     */
    fetchDataFromControl (data: any   ) {
        let val: string = this.state.value ; 
        if ( isNull(this.props.appendNoneSelected) || !this.props.appendNoneSelected) {
            let rawData: CommonLookupValue[] = this.props.lookupContainers[this.props.lookupCode];
            if (!isNull (rawData) && rawData.length > 0 ) {
                val = rawData[0].detailCode! ;
            }
        }
        console.log('[EditorCombobox] read value : ' , val); 
        setValueHelper(data , this.props.fieldName , this.state.value); 
        if ( this.props.fieldNameForLOVLabel != null && typeof this.props.fieldNameForLOVLabel !== 'undefined') {
            // data[this.props.fieldNameForLOVLabel] = null ;
            setValueHelper(data , this.props.fieldNameForLOVLabel , null); 
            let lks: CommonLookupValue[] = this.props.lookupContainers[this.props.lookupCode] || null ;
            if ( lks == null ) {
                lks = [] ; 
            }
            for ( var v of lks) {
                if ( v.detailCode === this.state.value) {
                    setValueHelper(data , this.props.fieldNameForLOVLabel , v.label);
                    break ; 
                }
            }
            
        }
    }

    changeHandler: (val: string ) => void = (val: string ) => {
        this.setStateHelper ( 
            st => {
                st.value = val ; 
            } , 
            () => {
                if ( !isNull(this.props.changeHandler)) {
                    this.props.changeHandler!(val);
                }
                if ( !isNull(this.props.changeHandlerWithLookup)) {
                    let l2:  CommonLookupValue = null! ; 
                    let theLooks: CommonLookupValue[] = this.props.lookupContainers[this.props.lookupCode] ;
                    if ( !isNull(theLooks)) {
                        for ( let sc of theLooks) {
                            if ( sc.detailCode === val ) {
                                l2 = sc ; 
                                break ; 
                            }
                        }
                    } 
                    this.props.changeHandlerWithLookup!(l2);
                }
                if ( !isNull(this.props.bindValueToFormOnChange) && this.props.bindValueToFormOnChange && !isNull(this.forceReadDataFromControlMethod)) {
                    try {
                        this.forceReadDataFromControlMethod(); 
                    } catch ( exc ) {
                        console.error('[EditorTextbox] gagal update state data on change');
                    }
                }
            });
    }

    render () {
        let swapKey: any =   'auto_id_' +  new Date().getTime() ; 
        let divContent: any[] = [] ; 
        let readonly: boolean = false ; 
        if ( !isNull( this.props.readonlyState)  ) {
            readonly = this.props.readonlyState ; 
        } 
        if ( !readonly) {
            divContent.push((
            <EditorComboboxWrapper
                ref={(c: EditorComboboxWrapper) => {
                    this.actualComboBox = c! ; 
                }}
                key='c1'
                changeHandler={this.changeHandler}
                appendNoneSelected={this.props.appendNoneSelected}
                noneSelectedLabel={this.props.noneSelectedLabel}
                comboLabelFormatter={isNull(this.props.comboLabelFormatter) ? EditorCombobox.FORMATTER_COMBO_LABEL : this.props.comboLabelFormatter!}
                registrarMethod={this.props.registrarMethod}
                lookupCode={this.props.lookupCode}
                lookupContainers={this.props.lookupContainers}
                selectId={this.elementId}
                tabIndex={this.props.tabIndex}
                className={isNull(this.props.className) ? 'form-control' : this.props.className!}
                value={this.state.value}
                dataFilter={this.props.dataFilter}
            />));
        } else {
            let lbl: string = '';
            // EditorCombobox.FORMATTER_READONLY
            let x: (lookup: CommonLookupValue) => string = isNull( this.props.readonlyLabelFormatter) ? EditorCombobox.FORMATTER_READONLY : this.props.readonlyLabelFormatter!; 
            if (!isNull(this.state.value) && this.state.value.length > 0) {
                let lks: CommonLookupValue[] = this.props.lookupContainers[this.props.lookupCode] ; 
                if ( !isNull(lks)) {
                    for ( let l of lks ) {
                        if ( l.detailCode === this.state.value) {
                            lbl = x(l);
                            break ; 
                        }
                    }
                }
            } 
            divContent.push(<span key='readonly_label' className={this.props.readonlyCssName} dangerouslySetInnerHTML={{__html: lbl}}/>);
        }
        return (
            <div 
                className="form-group" 
                key={swapKey + '_outmost_div'} 
                style={{display : !isNull(this.props.hidden) && this.props.hidden ? 'none' : '' }}
            >
                    <label key={swapKey + '_label'} className={this.cssLabel} htmlFor={this.elementId}><strong>{this.props.label}</strong></label>
                    <div   
                        key={swapKey + '_combo_div'} 
                        className={this.cssDivTextbox}
                        style={{textAlign: 'left'}}
                    >
                       {divContent}{this.props.children}
                    </div>
            </div>
        );
    }

}