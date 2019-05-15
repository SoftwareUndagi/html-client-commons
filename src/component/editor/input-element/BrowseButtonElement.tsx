import * as React from "react" ;
import { getCssForColumnWithScreenType  } from '../../../utils/index';
import { EditorInputElement } from './CommonsInputElement'; 
import { BaseHtmlComponent , BaseHtmlComponentProps , BaseHtmlComponentState } from '../../BaseHtmlComponent';

export interface BrowseButtonElementState<VALUE> extends BaseHtmlComponentState {
    iconCss: string ; 
    dataLabel: string ; 
    latestData: VALUE ; 
}
export interface BrowseButtonElementProps<DATA, VALUE> extends BaseHtmlComponentProps {
    /**
     * label element
     */
    label: string ; 
    /**
     * task on data selected
     */
    onDataSelected ?: (data: DATA ) => any ;
    /**
     * nama field
     */
    fieldName: string ;  

    /**
     * nama field untuk value selection
     */
    valueFieldName: string ; 
    /**
     * register control ke dalam list of component pada perent
     */
    registrarMethod: (control: BrowseButtonElement<DATA, any> , unregFlag ?: boolean ) => any ;

    /**
     * comman untuk lookup data
     */
    showLookupCommand: (dataSelectedHandler: (data: DATA ) => any ) => any ; 
    /**
     * formatter data readonly. dari selected data
     */
    readonlyDataLabelFormatter: (data: DATA ) => string ;
    /**
     * generator label readonly dari value. kemungkinan ini memerlukan ajax. metodenya request ajax , set value dengan method assignLabelCommand
     * @param value value untuk di cari label nya. ini raw data. data yang di edit penuh 
     * @param assignLabelCommand kalau misal memerlukan ajax, maka ini akan di panggil untuk set label
     */
    generateLabelFromValue: (value: any , assignLabelCommand: (label: string ) => any ) => any  ;  

    /**
     * state readonly atau tidak
     */
    readonlyState: boolean  ;
    dummyValue ?: VALUE ; 
}
/**
 * component untuk browser button
 */
export class BrowseButtonElement<DATA, VALUE> extends BaseHtmlComponent<BrowseButtonElementProps<DATA, VALUE>  , BrowseButtonElementState<VALUE> > implements EditorInputElement {
    
    /**
     * midle class dari bootstrap
     */
    bootstrapColumnClass: string = getCssForColumnWithScreenType(); 
    constructor(props: BrowseButtonElementProps<DATA, VALUE>) {
        super(props); 
        this.state = {
            iconCss: '', 
            dataLabel : '', 
            latestData : null! 
        };
    }
    componentWillMount () {
        if ( this.props.registrarMethod != null && typeof this.props.registrarMethod !== 'undefined') {
            this.props.registrarMethod(this , false ) ; 
        }
    }

    /**
     * assign data ke control
     */
    assignDataToControl  (data: any , updateState ?: boolean ) {
        try {
            this.setStateHelper ( st => {
                let val: VALUE = data[this.props.fieldName];
                st.latestData = val ;
                st.dataLabel = val + '' ;   
                if ( val == null || typeof val === 'undefined') {
                    st.dataLabel = '';
                    st.latestData = null! ;
                    return ;  
                }
                this.props.generateLabelFromValue(val , (lbl: string ) => {
                    st.dataLabel = lbl ; 
                });
            });
        } catch ( exc ) {
            console.error('Gagal assign data to control, error : ' , exc.message  , '.raw : ' , exc  ) ; 
        }
    }

    onClickHandler: (evt: any ) => any =  (evt: any ) => {
        this.props.showLookupCommand((data: DATA ) => {
            this.setStateHelper ( 
                st => {
                let strData: string =  this.props.readonlyDataLabelFormatter(data) ;
                st.dataLabel = strData ;
                if ( data == null || typeof data === 'undefined') {
                    st.latestData = data[this.props.valueFieldName];
                    st.latestData = null!  ;
                } else {
                    st.latestData = data[this.props.valueFieldName]  ;
                }
                if ( this.props.onDataSelected != null && typeof this.props.onDataSelected !== 'undefined') {
                    this.props.onDataSelected(data); 
                }    
            });
        }); 
    }

    onMouseLeave: (evt: any ) => any = (evt: any ) => {
        this.setStateHelper ( st => {
            st.iconCss = '';
        }); 
    }
    onMouseEnter: (evt: any ) => any = ( evt: any ) => {
        this.setStateHelper ( st => {
            st.iconCss = 'green';
        }); 
    }
    /**
     * membaca data dari control
     */
    fetchDataFromControl (data: any ) {
        data[this.props.fieldName] = this.state.latestData ; 
    }
    rendererBrowseable () {
        let label: string = this.state.dataLabel !;
        return (
        <div className="input-group">
            <span className="form-control">{label}</span>
            <span 
                style={{cursor : 'pointer'}} 
                className="input-group-addon"
                onClick={this.onClickHandler} 
                onMouseLeave={this.onMouseLeave}
                onMouseEnter={this.onMouseEnter}
            ><i className={"ace-icon fa fa-search " + this.state.iconCss}/>
            </span>
        </div> );
    }

    render () {
        let label: string = this.state.dataLabel ;
        let lblbrowseContent: any[] = [] ; 
        if ( this.props.readonlyState) {
           lblbrowseContent.push(<span>{label}</span>) ;
        } else {
            lblbrowseContent.push(this.rendererBrowseable());
        }
        return (
        <div className="form-group">
            <label className={"col-" + this.bootstrapColumnClass + "-4 control-label"} ><strong>{this.props.label} :</strong></label>
            <div className={'col-' + this.bootstrapColumnClass + '-8'}>
                {lblbrowseContent}
            </div>
        </div>);
    }
}