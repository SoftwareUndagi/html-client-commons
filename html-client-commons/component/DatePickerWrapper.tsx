import * as React from "react" ;
import { isNull , FormatterUtils , HtmlElementPosition , getElementPosition } from '../utils/index';
import { DatePickerWrapperDropdown } from './DatePickerWrapperDropdown';
import { OffscreenPanelContainer , DetachPanel } from './OffscreenPanelContainer';
import { BaseHtmlComponent , BaseHtmlComponentProps , BaseHtmlComponentState } from './BaseHtmlComponent';
declare var jQuery: any  ; 
/**
 * props untuk date picker
 */
export interface DatePickerWrapperProps extends BaseHtmlComponentProps {
    /**
     * id untuk untuk texbox datepicker
     */
    id ?: string ; 
    /**
     * custom data formatter. kalau 
     */
    dateFormatter?: (value: Date) => string ; 

    /**
     * tanggal minimal dari dari date picker
     */
    minMate ?: Date ; 
    /**
     * tanggal maksimal dalam date picker
     */
    maxDate ?: Date ; 
    /**
     * css untuk textbox
     */
    className ?: string ; 
    readonlyState ?: boolean ; 
    /**
     * change handler 
     */
    changeHandler ?: (value: Date) => any  ; 
    /**
     * index dari tab
     */
    tabIndex: number  ;
    /**
     * nilai awal untuk data
     */
    initalValue ?: Date ; 
    /**
     * flag textbox requreid
     */
    required ?: boolean ; 

    /**
     * pas tekan enter di submit atau tidak. default = false 
     */
    invokeSubmitOnEnter?: boolean;
    /**
     * flag submit kalau date di pilih
     */
    invokeSubmitOnDateSelected?: boolean;
    /**
     * title untuk textbox
     */
    title ?: string ; 
    /**
     * array tanggal yang di disabled
     */
    datesDisabled ?: Date[] ; 

    /**
     * custom submit handler. kalau memerlukan custom submit. misal dalam case form less search
     */
    customSubmitCommand?: () => any;  

    /**
     * css properties untuk textbox date picker 
     */
    style ?: React.CSSProperties ; 

}
export interface DatePickerWrapperState extends BaseHtmlComponentState {
    /**
     * data yang di pilih
     */
    selectedDate: Date ;
}

/**
 * panel wrapper / tiruan datepicker 
 */
export class DatePickerWrapper extends BaseHtmlComponent<DatePickerWrapperProps , DatePickerWrapperState > {

    /**
     * css untuk icon clear value
     */
    static CSS_CLEAR_ICON = 'fa fa-eraser' ;

    /**
     * css default. ini bisa di set pada saat bootstrap applikasi untuk konsistensi css texbox
     */
    static CSS_DEFAULT: string = 'form-control date-picker'; 

    /**
     * panel yang mungkin sedang aktiv
     */
    static LATEST_PANEL: DetachPanel = (null)! ; 

    /**
     * formatter date
     */
    static DATE_FORMATTER: FormatterUtils = new FormatterUtils(); 
    /**
     * panel untuk detach component. ini kalau panel muncul
     */
    dropDownDetach: DetachPanel ; 
    /**
     * id dari panel , juga untuk drop down
     */
    panelId: string = 'auto_date_picker_' + new Date().getTime() + '_' + Math.ceil(Math.random() * 100);
    /**
     * textbox untuk date picker
     */
    textbox: HTMLInputElement; 

    /**
     * standard formatter untuk date picker
     */
    static DEFAULT_FORMATTER: (value: Date) => string = (value: Date) => {
        if ( isNull(value)) {
            return (null)! ; 
        }
        return DatePickerWrapper.DATE_FORMATTER.formatDate(value);
    }
    
    constructor(props: DatePickerWrapperProps) {
        super(props) ; 
        this.state = {
            selectedDate : props.initalValue! 
        };
    }

    clearSelection: ( ) => any = () => {
        this.setStateHelper(
            stTbaru => {
                stTbaru.selectedDate = (null)! ;
            } , 
            () => {
                this.removeDropDown();
                if ( !isNull(this.props.changeHandler)) {
                    this.props.changeHandler!((null)!) ; 
                }
            });
    }

    assignValue (value: Date ) {
        if ( this.state.selectedDate === value) {
            return ; 
        }
        this.setStateHelper ( st => {
            st.selectedDate = value ; 
        }); 
    }
    /**
     * handler kalau di click di luar drop down
     */
    onClickOutSideDropDown: () => any = () => {
        // this.removeDropDown();
    }
    show () {
        if ( !isNull(DatePickerWrapper.LATEST_PANEL)) {
            if ( !isNull(this.dropDownDetach) &&  this.dropDownDetach !== DatePickerWrapper.LATEST_PANEL) {
                this.dropDownDetach() ; 
                this.dropDownDetach = (null)! ; 
            }
            DatePickerWrapper.LATEST_PANEL();
            DatePickerWrapper.LATEST_PANEL = (null)! ; 
        } else {
            if ( !isNull(this.dropDownDetach) ) {
                this.dropDownDetach() ; 
                this.dropDownDetach = (null)! ; 
            }
        }
        let pnl: OffscreenPanelContainer =  OffscreenPanelContainer.getOffscreenPanelContainer();
        let txt: HTMLElement = document.getElementById(this.panelId )!;
        let rect: ClientRect =  txt.getBoundingClientRect();
        // let topPos: number = rect.top + rect.height + window.screenY ;
        let pos: HtmlElementPosition  = getElementPosition(txt); 
        let lRender: number = pos.left ; 
        let tRender: number = pos.top + rect.height !;
        console.warn('rect.top : ' , rect.top, '.rect.left : ' , rect.left , ',window.screenY' , window.screenY , ',lRender:' , lRender , '.tRender:' , tRender) ;
        setTimeout(
            () => {
                jQuery('html').click( this.onClickOutSideDropDown); 
            } , 
            100); 
        this.dropDownDetach = pnl.appendPanel( (
        <DatePickerWrapperDropdown 
            key={this.panelId + '_dropdown'}
            left={lRender}
            top={tRender}
            disabledDates={this.props.datesDisabled}
            dropDownPosition='bottom'
            selectedDate={this.state.selectedDate}
            maxDate={this.props.maxDate}
            minMate={this.props.minMate}
            closeDropdown={this.removeDropDown}
            onDateClick={(d: Date) => {
                // let stTbaru : DatePickerWrapperState = cloneObject(this.state) ; 
                this.setStateHelper( 
                    stTbaru => {
                        stTbaru.selectedDate = d ; 
                    } ,
                    () => {
                        this.removeDropDown();
                        if ( !isNull(this.props.changeHandler)) {
                            this.props.changeHandler!(d) ; 
                        }
                        if ( !isNull(this.props.invokeSubmitOnDateSelected) && this.props.invokeSubmitOnDateSelected) {
                            this.submitWorker(); 
                        }
                    }) ;
            }}
            dropDownElementKey={this.panelId + '_dropdown'}
        />
        ));
        DatePickerWrapper.LATEST_PANEL = this.dropDownDetach ; 
    }
    
    componentWillUnmount() {
        console.warn('[DatePickerWrapper]detach date picker');
        this.removeDropDown();
        
    }

    removeDropDown: () => any = () => {
        if ( this.dropDownDetach) {
            this.dropDownDetach() ; 
            if ( this.dropDownDetach === DatePickerWrapper.LATEST_PANEL ) {
                DatePickerWrapper.LATEST_PANEL = (null)! ; 
            }
        }
        this.dropDownDetach = (null)! ; 
        try {
            jQuery('html').unbind( "click", this.onClickOutSideDropDown  ) ; 
        } catch ( exc ) {
            //
        }
    }

    render (): JSX.Element {
        let inputType: string = 'text'; 
        let lbl: string = '' ; 
        if ( !isNull(this.state.selectedDate)) {
            lbl = !isNull(this.props.dateFormatter) ? this.props.dateFormatter!(this.state.selectedDate) : DatePickerWrapper.DEFAULT_FORMATTER(this.state.selectedDate);
            console.log('[DatePickerWrapper] render date : ' , this.state.selectedDate , '.formatted : ' , lbl );
        }
        let attr: any = {
            disabled : isNull(this.props.readonlyState) ? false : this.props.readonlyState , 
            value : lbl , 
            id : this.panelId  ,
            type : inputType
        };
        if ( isNull(this.props.readonlyState) || !this.props.readonlyState) {
            attr.onFocus = this.show.bind(this);
            attr.onClick = (evt: any ) => {
                if (!isNull(evt) && !isNull(evt.stopPropagation)) {
                    evt.stopPropagation (); 
                }
            };
            attr.onKeyPress = (event: any ) => {
                if (!isNull(event) && !isNull(event.stopPropagation)) {
                    event.stopPropagation (); 
                }
                let submit: boolean = false ;
                if ( !isNull(this.props.invokeSubmitOnEnter)) {
                    submit = this.props.invokeSubmitOnEnter! ; 
                } 
                if (event.keyCode === 13 && submit) {
                    this.submitWorker(event.target);
                }
                if ( event.keyCode === 27) {
                    if (!isNull( this.dropDownDetach) ) {
                        this.dropDownDetach();
                        if ( DatePickerWrapper.LATEST_PANEL === this.dropDownDetach ) {
                            DatePickerWrapper.LATEST_PANEL = (null)! ; 
                        }
                        this.dropDownDetach = (null)! ; 
                    }
                }
            };
        }
        if ( !isNull(this.props.tabIndex)) {
            attr.tabIndex = this.props.tabIndex ; 
        }
        if ( !isNull(this.props.className)) {
            attr.className = this.props.className ; 
        } else {
            if (!isNull( DatePickerWrapper.CSS_DEFAULT)) {
                attr.className = DatePickerWrapper.CSS_DEFAULT ;
            }
        }
        if ( !isNull(this.props.required) && this.props.required) {
            attr.required = true ; 
        }
        if ( !isNull(this.props.style)) {
            attr.style = this.props.style ; 
        }
        
        return ( 
            <span style={{display : 'block'  , position : 'relative'}}>
                <input 
                    key={this.panelId}
                    ref={(d) => {
                        this.textbox = d!;
                    }}
                    {...attr}
                />
                {this.renderClearIcon()}
            </span>
        );
    }

    /**
     * tombol clear
     */
    renderClearIcon (): JSX.Element {
        if ( isNull(this.state.selectedDate) ) {
            return <span style={{display : 'none'}}/> ; 
        }
        return ( 
            <i 
                className={DatePickerWrapper.CSS_CLEAR_ICON} 
                title='kosongkan tanggal' 
                style={{
                    bottom: 0 , 
                    color: '#007AFF',
                    display: 'inline-block',
                    left: 'auto',
                    right : '5px' , 
                    lineHeight: '35px',
                    padding: '0 3px',
                    position: 'absolute',
                    top: '-1px',
                    zIndex: 2 ,
                    cursor : 'pointer'
                }} 
                onClick={this.clearSelection}
            />
        ); 
    }

    /**
     * worker untuk submit element
     */
    private submitWorker (elemen?: HTMLInputElement ) {
        let s: any = !isNull(elemen) ? elemen :  document.getElementById(this.panelId);
        let elem: HTMLInputElement = s ;  
        if (!isNull(this.props.customSubmitCommand)) {
            this.props.customSubmitCommand!();
        } else {
            try {
                elem.form!.submit();
            } catch (exc) {
                console.error('Gagal memproses submit untuk datepicker, error : ', exc);
            }
        }
    }
}