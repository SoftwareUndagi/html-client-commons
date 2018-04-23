import * as React from "react" ;
import { isNull } from '../utils/index';
import { BaseHtmlComponent , BaseHtmlComponentProps , BaseHtmlComponentState } from './BaseHtmlComponent'; 

export interface DatePickerWrapperDropdownProps extends BaseHtmlComponentProps { 
    /**
     * tanggal minimal dari dari date picker
     */
    minMate ?: Date ; 
    /**
     * tanggal maksimal dalam date picker
     */
    maxDate ?: Date ; 
    /**
     * tanggal yang tidak boleh di pilih
     */
    disabledDates ?: Date[] ; 

    /**
     * date yang di pilih
     */
    onDateClick: (value: Date ) => any ;
    /**
     * date yang di tandai active
     */
    selectedDate: Date ; 
    /**
     * top dari panel drop down
     */
    top: number ; 
    /**
     * bagian kiri dari drop down
     */
    left: number ; 
    /**
     * posisi drop down. default akan berada di bawah
     */
    dropDownPosition: 'bottom' |'top' ; 
    /**
     * ini untuk keys
     */
    dropDownElementKey: string ; 
    /**
     * command untuk remove drop down
     */
    closeDropdown: () => any ; 
} 

export interface DatePickerWrapperDropdownState extends BaseHtmlComponentState {
    year: number ; 
    month: number ; 
    lookupState: 'select-day' |'select-month'|'select-year';
} 

export class DatePickerWrapperDropdown extends BaseHtmlComponent<DatePickerWrapperDropdownProps , DatePickerWrapperDropdownState> {

    /**
     * nama bulan panjang. 
     * ini bisa di timpa untuk keperluan i18n
     */
    static MONTH_NAME_LONG: {[id: number]: string} = {
        [1] : 'Januari' , 
        [2] : 'Februari' , 
        [3] : 'Maret' ,
        [4] : 'April' ,
        [5] : 'Mei' ,
        [6] : 'Juni' ,
        [7] : 'Juli' ,
        [8] : 'Agustus' ,
        [9] : 'September' ,
        [10] : 'Oktober' ,
        [11] : 'November' ,
        [12] : 'Desember' ,

    };
    constructor(props: DatePickerWrapperDropdownProps ) {
        super( props) ; 
        let d: Date = new Date() ; 
        
        this.state = {
            year : d.getFullYear() , 
            month: d.getMonth() + 1 , 
            lookupState : 'select-day'
        };
        if ( !isNull(props.selectedDate)) {
            let swapState: any = this.state ; 
            swapState.month = props.selectedDate.getMonth() + 1  ; 
            swapState.year = props.selectedDate.getFullYear();
        }
    }
    componentDidMount () {
        window.addEventListener('click' , this.windowClickHandler ); 
    }

    componentWillUnmount() {
        window.removeEventListener('click' , this.windowClickHandler); 
    }
    generateDateArray (month: number , year: number ): Date[][] {
        let tgl1: Date = new Date(year + '-' + month + '-1');
        let namaHariAwal: number = tgl1.getDay() ; 
        let arr0: Date[] =  [] ; 
        if ( namaHariAwal > 1) {
            for ( let i = namaHariAwal; i > 0; i-- ) {
                let strtDate: Date = new Date( year +  '-' + month + '-1') ; 
                strtDate.setDate(strtDate.getDate() - i);
                arr0.push(strtDate);
            }
        }
        let chgMonth: boolean = false ; 
        let tglAdder: number = 0 ; 
        do {
            let tglBaru: Date = new Date(year + '-' + month + '-1'); 
            tglBaru.setDate(tglBaru.getDate() + tglAdder);
            if ( tglBaru.getMonth() + 1 !== month) {
                break ; 
            }
            arr0.push(tglBaru) ; 
            tglAdder++;
        }while (!chgMonth);

        let len: number = arr0.length ; 
        if (len % 7 !== 0 ) {
            let nextMonthAdd: number = 7 - (len % 7) ; 
            for ( let j2 = 0 ; j2 < nextMonthAdd; j2++) {
                let tglBaru: Date = new Date(year + '-' + month + '-1'); 
                tglBaru.setDate(tglBaru.getDate() + tglAdder);
                arr0.push(tglBaru) ; 
                tglAdder++;
            }
        }
        let r: any [] = []; 
        let workingData: Date[] = arr0 ; 
        do {
            if ( workingData.length < 7) {
                r.push(workingData);
                break ; 
            }
            let tail: Date[] = workingData.splice(7 , workingData.length - 7);
            r.push(workingData); 
            workingData = tail ; 
        }while (workingData.length > 0); 
        return r ; 
    }
    render(): JSX.Element {
        let arr: any [] = [] ; 
        if ( this.state.lookupState === 'select-day') {
            arr.push(this.renderDaySelector());
        } else if ( this.state.lookupState === 'select-month') {
            arr.push(this.rendererMonthSelector());
        } else {
            arr.push(this.renderYearSelector());
        }
        let cssName: string =  this.props.dropDownPosition === 'bottom' ? "datepicker datepicker-dropdown dropdown-menu datepicker-orient-left datepicker-orient-top" : "datepicker datepicker-dropdown dropdown-menu datepicker-orient-left datepicker-orient-bottom";
        return (
        <div 
            key={this.props.dropDownElementKey} 
            className={cssName}
            style={{top:  this.props.top + 'px', left:  this.props.left +  'px', display: 'block'}}
        >{arr}
        </div>);
    }

    compareDateOnly (date: Date , d: Date ) {
        if ( d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth() && d.getDate() === date.getDate() ) {
            return true ; 
        }
        return false ; 
    }
    noAction: (evt: any ) => any = (evt: any ) => {
        evt.stopPropagation () ; 
    }
    /**
     * check next month masih boleh atau tidak
     * @param year tahun cek
     * @param month bulan
     */
    isMonthExceedMaxDate ( year: number , month: number ): boolean {
        let bln: number = month + 1 ; 
        let thn: number = year ;
        if ( bln > 12) {
            thn = thn + 1 ; 
            bln = 1; 
        } 
        let tgl1BulanDepan: Date = new Date(thn + '-' + bln + '-1'); 
        let allowedNext: boolean = true ;
        if ( !isNull(this.props.maxDate)) {
            if ( !this.compareDateOnly(tgl1BulanDepan , this.props.maxDate! )) {
                if ( tgl1BulanDepan > this.props.maxDate!) {
                    allowedNext = false ; 
                }
            }
        }
        return !allowedNext ; 
    }

    /**
     * check bulan melewati atau tidak pembatas bawah
     * @param year 
     * @param month 
     */
    isMonthBellowMinDate ( year: number , month: number ): boolean {
        let bln: number = month - 1 ; 
        let thn: number = year ; 
        if ( bln < 1 ) {
            bln = 1 ; 
            thn = thn - 1 ; 
        }
        let tglAkhirBulanLalu: Date = new Date(thn + '-' + bln + '-1'); 
        let allowedPrev: boolean = true ;
        if ( !isNull(this.props.minMate)) {
            if ( !this.compareDateOnly(tglAkhirBulanLalu , this.props.minMate! )) {
                if ( tglAkhirBulanLalu < this.props.minMate!) {
                    allowedPrev = false ; 
                }
            }
        }
        return !allowedPrev ; 
    }
    /**
     * generator date selector
     * @param date 
     */
    private dateCellGenerator (date: Date ): JSX.Element  {

        let disabled: boolean = this.checkIsOnDisabledDate(date) ; 
        if ( !disabled) {
            if ( !isNull(this.props.minMate) ) {
                if ( this.compareDateOnly(date , this.props.minMate!)) {
                    disabled = false ; 
                } else {
                    disabled = date < this.props.minMate! ; 
                }
            }
        }
        if ( !disabled) {
            if ( !isNull(this.props.maxDate) ) {
                if ( this.compareDateOnly(date , this.props.maxDate!)) {
                    disabled = false ; 
                } else {
                    disabled = date > this.props.maxDate! ; 
                }
            }
        }

        let clsName: string = 'day'; 
        let mName: number = date.getMonth() + 1 ; 
        if ( this.state.month !== mName   ) {
            if ( this.state.month === 12) {
                if ( mName === 1) {
                    clsName = 'new day';
                } else {
                    clsName = 'old day';
                }
            } else {
                if ( mName > this.state.month) {
                    clsName = 'new day' ;
                } else {
                    clsName = 'old day';
                }
            }
        }
        if ( !isNull( this.props.selectedDate)) {
            if ( date.getFullYear() === this.props.selectedDate.getFullYear() && date.getMonth() === this.props.selectedDate.getMonth() && date.getDate() === this.props.selectedDate.getDate()) {
                clsName += ' active';
            }
        }
        if ( disabled) {
            clsName += ' disabled'; 
        }
        let cssProp: React.CSSProperties = {} ;
        if  ( disabled) {
            cssProp.cursor = 'not-allowed';
            // cssProp.textDecoration ='line-through';
            cssProp.opacity = 0.5 ;
        }
        return ( 
        <td 
            key={'row_' + date.toJSON()} 
            className={clsName} 
            style={cssProp}
            onClick={ disabled ? this.noAction :   
            (evt: any ) => {
                evt.stopPropagation();
                this.props.onDateClick(date);
            }} 
        >{date.getDate()}
        </td> 
        ); 
    }
    /**
     * handler click . ini unutk menutup popup kalau di click di luar areal drop down
     */
    private windowClickHandler: (evt: any ) => any = (evt: any ) => {
        console.warn('[DatePickerWrapperDropdown]click pada window di trigger');
        this.props.closeDropdown(); 
        if ( !isNull(evt) && !isNull(evt.stopPropagation)) {
            evt.stopPropagation(); 
        }
    }
    /**
     * renderer next button
     */
    private rendererNextMonthButton (): JSX.Element {
        let allowedNext: boolean = !this.isMonthExceedMaxDate(this.state.year , this.state.month) ; 
        let cssProp: React.CSSProperties = allowedNext ? { visibility : 'visible' } : {display : 'none'};
        return (
        <th 
            className="next" 
            style={{ visibility : 'visible' }} 
            onClick={ allowedNext ? 
                (evt: any ) => {
                    evt.stopPropagation();
                    this.setStateHelper ( st => {
                    if ( st.month < 12) {
                        st.month = st.month + 1 ; 
                    } else {
                        st.month = 1 ; 
                        st.year = st.year + 1 ;
                    }
                });
            } : () => {
                //
            }}
        ><span style={cssProp}>»</span>
        </th>);
    }

    private rendererPrevMonthButton (): JSX.Element {
        let allowedPrev: boolean = !this.isMonthBellowMinDate(this.state.year , this.state.month) ; 
        let cssProp: React.CSSProperties = allowedPrev ? { visibility : 'visible' } : {display : 'none'};
        return (
        <th 
            className="prev" 
            style={{ visibility : 'visible' }} 
            onClick={allowedPrev ? 
                (evt: any) => {
                    evt.stopPropagation();
                    this.setStateHelper ( 
                        st => {
                        if ( st.month > 1) {
                            st.month = st.month - 1 ; 
                        } else {
                                st.month = 12 ; 
                                st.year = st.year - 1 ;
                        }
                    });
                        
                } : 
                () => {
                    //
                }}
        ><span style={cssProp}>«</span>
        </th>);
    }

    /**
     * renderer header + bawahnya
     */
    private renderDaySelector (): JSX.Element {
        let dates: Date[][] = this.generateDateArray(this.state.month , this.state.year); 
        let bodies: any[] = [] ; 
        let r: number = 0 ; 
        for ( let d of dates   ) {
            let dateCol: any[] = [] ; 
            for ( let d2 of d) {
                dateCol.push(this.dateCellGenerator(d2));
            }
            bodies.push(<tr key={'row_' + r}>{dateCol}</tr>);
            r++ ;
        }
        return (
        <div className="datepicker-days" key='day-selector' style={{display: 'block'}} >
                <table className=" table-condensed">
                    <thead>
                        <tr>
                            {this.rendererPrevMonthButton()}
                            <th 
                                colSpan={4} 
                                className="datepicker-switch" 
                                onClick={(evt: any) => {
                                    evt.stopPropagation();
                                    this.setStateHelper( st => {
                                        st.lookupState = 'select-month'; 
                                    });
                                }}
                            >{DatePickerWrapperDropdown.MONTH_NAME_LONG[this.state.month]} {this.state.year}
                            </th>
                            {this.rendererNextMonthButton()}
                            <th 
                                className="next"  
                                onClick={(evt: any) => {
                                    evt.stopPropagation();
                                    this.props.closeDropdown(); 
                                }}
                            >x
                            </th>
                        </tr>
                        <tr>
                            <th className="dow">Su</th>
                            <th className="dow">Mo</th>
                            <th className="dow">Tu</th>
                            <th className="dow">We</th>
                            <th className="dow">Th</th>
                            <th className="dow">Fr</th>
                            <th className="dow">Sa</th>
                        </tr>
                    </thead>
                <tbody>
                   {bodies}
                </tbody>
                <tfoot>
                <tr>
                    <th colSpan={7} className="today" style={{display: 'none'}}>Today</th>
                </tr>
                <tr>
                    <th colSpan={7} className="clear" style={{display: 'none'}}>Clear</th>
                </tr>
            </tfoot>
            </table>
            </div>
            );
    }
    private renderYearSelector (): JSX.Element {
        let selectYear: (n: number ) => any = ( n: number ) => {
            this.setStateHelper ( st => {
                st.year = n ; 
                st.lookupState = 'select-month';
            }); 
        };
        let start: number = Math.floor(this.state.year / 10) * 10 ; 
        let end: number = start + 9;
        return (
        <div className="datepicker-years"  key='year-selector'  style={{display: 'block'}}>
            <table className="table-condensed">
                <thead>
                    <tr>
                        <th className="prev" style={{visibility: 'visible'}}>«</th>
                        <th colSpan={5} className="datepicker-switch">{start}-{end}</th>
                        <th className="next" style={{visibility: 'visible'}}>»</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colSpan={7}>
                            <span 
                                className="year old" 
                                onClick={(evt: any) => {
                                    evt.stopPropagation();
                                    selectYear(start - 1);
                                }}
                            >{start - 1}
                            </span>
                            <span 
                                className="year" 
                                onClick={(evt: any) => {
                                    evt.stopPropagation();
                                    selectYear(start);
                                }}
                            >{start}
                            </span>
                            <span 
                                className="year" 
                                onClick={(evt: any) => {
                                    evt.stopPropagation();
                                    selectYear(start + 1);
                                }}
                            >{start + 1}
                            </span>
                            <span 
                                className="year" 
                                onClick={(evt: any) => {
                                    evt.stopPropagation();
                                    selectYear(start + 2);
                                }}
                            >{start + 2}
                            </span>
                            <span 
                                className="year" 
                                onClick={(evt: any) => {
                                    evt.stopPropagation();
                                    selectYear(start + 3);
                                }}
                            >{start + 3}
                            </span>
                            <span 
                                className="year" 
                                onClick={(evt: any) => {
                                    evt.stopPropagation();
                                    selectYear(start + 4);
                                }}
                            >{start + 4}
                            </span>
                            <span 
                                className="year" 
                                onClick={(evt: any) => {
                                    evt.stopPropagation();
                                    selectYear(start + 5);
                                }}
                            >{start + 5}
                            </span>
                            <span 
                                className="year" 
                                onClick={(evt: any) => {
                                    evt.stopPropagation();
                                    selectYear(start + 6);
                                }}
                            >{start + 6}
                            </span>
                            <span 
                                className="year" 
                                onClick={(evt: any) => {
                                    evt.stopPropagation();
                                    selectYear(start + 7);
                                }}
                            >{start + 7}
                            </span>
                            <span 
                                className="year" 
                                onClick={(evt: any) => {
                                    evt.stopPropagation();
                                    selectYear(start + 8);
                                }}
                            >{start + 8}
                            </span>
                            <span 
                                className="year" 
                                onClick={(evt: any) => {
                                    evt.stopPropagation();
                                    selectYear(start + 9);
                                }}
                            >{start + 9}
                            </span>
                            <span 
                                className="year new" 
                                onClick={(evt: any) => {
                                    evt.stopPropagation();
                                    selectYear(end + 1);
                                }}
                            >{end + 1}
                            </span>
                        </td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <th colSpan={7} className="today" style={{display: 'none'}}>Today</th>
                </tr>
                <tr>
                    <th colSpan={7} className="clear" style={{display: 'none'}}>Clear</th>
                </tr>
                </tfoot>
            </table>
        </div>
        );
    }
    /**
     * renderer month selector
     */
    private rendererMonthSelector (): JSX.Element {
        let selectMonth: (n: number ) => any  = (n: number ) => {
            this.setStateHelper ( st => {
                st.month = n ; 
                st.lookupState  = 'select-day' ;
            });
        }; 
        return (
        <div className="datepicker-months"  key='month-selector'  style={{display: 'block'}}>
                <table className="table-condensed">
                    <thead>
                        <tr>
                            <th 
                                className="prev" 
                                style={{visibility: 'visible'}} 
                                onClick={(evt: any ) => {
                                    evt.stopPropagation();
                                    let bln: number = this.state.month - 1 ; 
                                    let thn: number = this.state.year ; 
                                    if ( bln > 12) {
                                        thn = thn - 1 ;
                                        bln = 12 ; 
                                    }
                                    this.setStateHelper ( st => {
                                        st.month = bln ; 
                                        st.year = thn ; 
                                    }); 
                                }}
                            >«
                            </th>
                            <th 
                                colSpan={5} 
                                className="datepicker-switch" 
                                onClick={(evt: any ) => {
                                    evt.stopPropagation();
                                    this.setStateHelper ( st => st.lookupState = 'select-year'); 
                                }}
                            >{this.state.year}
                            </th>
                            <th 
                                className="next" 
                                style={{visibility: 'visible'}} 
                                onClick={(evt: any ) => {
                                    evt.stopPropagation();
                                    let bln: number = this.state.month + 1 ; 
                                    let thn: number = this.state.year ; 
                                    if ( bln > 12) {
                                        thn = thn + 1 ;
                                        bln = 1 ; 
                                    }
                                    this.setStateHelper ( 
                                        st => {
                                            st.month = bln; 
                                            st.year = thn; 
                                        });
                                    }}
                            >»
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan={7}>
                                <span 
                                    className="month" 
                                    onClick={(evt: any ) => {
                                        evt.stopPropagation();
                                        selectMonth(1);
                                    }}
                                >Jan
                                </span>
                                <span 
                                    className="month" 
                                    onClick={(evt: any ) => {
                                        evt.stopPropagation();
                                        selectMonth(2);
                                    }}
                                >Feb
                                </span>
                                <span 
                                    className="month" 
                                    onClick={(evt: any ) => {
                                        evt.stopPropagation();
                                        selectMonth(3);
                                    }}
                                >Mar
                                </span>
                                <span 
                                    className="month" 
                                    onClick={(evt: any ) => {
                                        evt.stopPropagation();
                                        selectMonth(4);
                                    }}
                                >Apr
                                </span>
                                <span 
                                    className="month" 
                                    onClick={(evt: any ) => {
                                        evt.stopPropagation();
                                        selectMonth(5);
                                    }}
                                >May
                                </span>
                                <span 
                                    className="month" 
                                    onClick={(evt: any ) => {
                                        evt.stopPropagation();
                                        selectMonth(6);
                                    }}
                                >Jun
                                </span>
                                <span 
                                    className="month" 
                                    onClick={(evt: any ) => {
                                        evt.stopPropagation();
                                        selectMonth(7);
                                    }}
                                >Jul
                                </span>
                                <span 
                                    className="month" 
                                    onClick={(evt: any ) => {
                                        evt.stopPropagation();
                                        selectMonth(8);
                                    }}
                                >Aug
                                </span>
                                <span 
                                    className="month" 
                                    onClick={(evt: any ) => {
                                        evt.stopPropagation();
                                        selectMonth(9);
                                    }}
                                >Sep
                                </span>
                                <span 
                                    className="month" 
                                    onClick={(evt: any ) => {
                                        evt.stopPropagation();
                                        selectMonth(10);
                                    }}
                                >Oct
                                </span>
                                <span 
                                    className="month" 
                                    onClick={(evt: any ) => {
                                        evt.stopPropagation();
                                        selectMonth(11);
                                    }}
                                >Nov
                                </span>
                                <span 
                                    className="month" 
                                    onClick={(evt: any ) => {
                                        evt.stopPropagation();
                                        selectMonth(12);
                                    }}
                                >Dec
                                </span>
                            </td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <th colSpan={7} className="today" style={{display: 'none'}}>Today</th>
                        </tr>
                        <tr>
                            <th colSpan={7} className="clear" style={{display: 'none'}}>Clear</th>
                        </tr>
                    </tfoot>
                </table>
            </div>
        );
    }
    /**
     * cek tanggal berada dalam interval atau tidak
     * @param date tanggal di cek
     */
    private checkIsOnDisabledDate (date: Date ): boolean {
        if ( isNull(this.props.disabledDates)) {
            return false ;
        }
        for ( let d of this.props.disabledDates!) {
            if ( this.compareDateOnly(date, d )) {
                return true ; 
            }
        }
        return false; 
    } 
}