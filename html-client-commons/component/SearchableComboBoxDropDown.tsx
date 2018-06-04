import * as React from "react";
import { CommonCommunicationData } from 'core-client-commons/index';
import { isNull  } from '../utils/index';
import { BaseHtmlComponent , BaseHtmlComponentProps , BaseHtmlComponentState } from './BaseHtmlComponent';
import { SearchableComboBoxDropDownLi } from './SearchableComboBoxDropDownLi'; 

export interface SearchableComboBoxDropDownProps extends BaseHtmlComponentProps {
    top: number ; 
    left: number ;
    /**
     * lebar lookup. in ngikut dengan lebar control
     */
    width: number ; 
    /**
     * selected data saat ini
     */
    currentSelectedIds: Array<string>  ; 
    /**
     * data untuk render pada drop down
     */
    dropdownData: CommonCommunicationData.CommonLookupValue[]; 
    /**
     * formatter label combo box
     */
    labelFormatter: (lookup: CommonCommunicationData.CommonLookupValue) => string |JSX.Element ;
     /**
      * prefix id dari element
      */
    htmlElementIdPrefix ?: string ; 
    /**
     * untuk data filter. kalau filter tidak kosong, maka proses ini akan menentukan data di tampilkan atau tidak
     */
    queryDataFilter: ( filter: string, checkedData: CommonCommunicationData.CommonLookupValue) => boolean ; 

    /**
     * command untuk menutup drop down
     */
    closeCommand: () => any ; 
    /**
     * handler pada saat item selected
     */
    onItemSelected: (data: CommonCommunicationData.CommonLookupValue ) => any ; 
    /**
     * posisi drop down, atas atau bawah dari data
     */
    dropDownPosition: 'above' |'below'; 
    /**
     * calculator posisi drop down seharusnya
     */
    calculateDropDownPosition: (dropDownHeight: number, position?: 'above'|'below' ) => any ; 
}

export interface SearchableComboBoxDropDownState extends BaseHtmlComponentState {
    
    actualLeft: number ; 
    actualTop: number ; 
    /**
     * kode dari item yang di high light
     */
    highlightedCode: string|null ;
}

export class SearchableComboBoxDropDown extends BaseHtmlComponent< SearchableComboBoxDropDownProps , SearchableComboBoxDropDownState> {

    /**
     * selected index saat ini. ini di bantu dengan panah atas atau bawah 
     */
    selectedIndex: number = -1 ; 
    /**
     * item yang visible
     */
    visibleItems: CommonCommunicationData.CommonLookupValue [] = []; 
    prevVisibleCount: number = 0 ; 
    constructor(props: SearchableComboBoxDropDownProps) {
        super(props) ; 
        this.state = {
            actualLeft : 0, 
            actualTop : 0 , 
            highlightedCode : null 
        };
    }

    componentWillMount () {
        let swapState: any = this.state ; 
        swapState.actualLeft = this.props.left ; 
        swapState.actualTop = this.props.top ; 
        this.visibleItems  = this.props.dropdownData ; 
    }
    componentDidMount () {
        if ( this.props.dropDownPosition === 'above') {
            this.recalcTop(); 
        }
        window.addEventListener('click' , this.windowClickHandler ); 
    }
    componentWillUnmount() {
        window.removeEventListener('click' , this.windowClickHandler); 
    }

    recalcTop () {
        if ( this.props.dropDownPosition !== 'above') {
            return ; 
        }
        let pnl: HTMLElement = document.getElementById(this.props.htmlElementIdPrefix  + '_root_drop_down_actual')!; 
        if ( isNull(pnl)) {
            setTimeout( this.recalcTop.bind(this) , 10) ;
            return ; 
        }
        let s: any =  this.props.calculateDropDownPosition( pnl.clientHeight , this.props.dropDownPosition); 
        this.setStateHelper ( cl => {
            if ( cl.actualTop === s.top  ) {
                return   ; 
            }
            cl.actualTop = s.top ; 
            return cl ; 
        }) ;

    }
    /**
     * handler saat search change
     */
    onSearchChange: (evt: React.FormEvent<any>) => any =  (evt: React.FormEvent<any>) => {
        let query: string =  evt.target['value']; 
        this.selectedIndex = -1 ; 
        this.visibleItems = [] ; 
        let visibleCount: number  = 0 ; 
        if ( !isNull(this.props.dropdownData)) {
            if ( isNull(query)) {
                query = '' ; 
            }
            query = query.toUpperCase(); 
            if ( query.length === 0 ) {
                this.visibleItems = this.props.dropdownData ; 
                for ( let d of this.props.dropdownData) {
                    this.showHideLi(d , true ) ;
                }
                visibleCount = this.props.dropdownData.length ; 
            } else {
                for ( let d of this.props.dropdownData) {
                    if ( this.props.queryDataFilter(query , d)) {
                        this.showHideLi(d , true ) ;
                        this.visibleItems.push(d); 
                        visibleCount++; 
                    } else {
                        this.showHideLi(d , false ) ;
                    }
                }
            }
        }
        if ( this.props.dropDownPosition === 'above' && (visibleCount < 4  ||   (this.prevVisibleCount < visibleCount && this.prevVisibleCount < 10   ) )  ) {
            this.recalcTop(); 
        }
        this.prevVisibleCount = visibleCount ; 
        if ( !isNull(this.state.highlightedCode) && this.state.highlightedCode!.length > 0 ) {
            this.setStateHelper( st => st.highlightedCode = null); 
        }
    }

    showHideLi ( lookup: CommonCommunicationData.CommonLookupValue  , display: boolean ) {
        let id: string = lookup.detailCode + '_' + this.props.htmlElementIdPrefix  ; 
        let liEl: HTMLElement = document.getElementById(id)! ; 
        if (isNull(liEl)) {
            return ; 
        }
        if ( display ) {
            liEl.style.display = ''; 
        } else {
            liEl.style.display = 'none'; 
        }
    }

    onQueryKeyDown: (evt: React.KeyboardEvent<any>) => any = (evt: React.KeyboardEvent<any>) => {
        // console.log('[SearchableComboBoxDropDown] keypress : ' ,evt ) ; 
        let s: any = null ; 
        if ( evt.keyCode === 13 || evt.keyCode === 10) {
            if (!( isNull( this.visibleItems) || this.visibleItems.length === 0 )) {
                let data: CommonCommunicationData.CommonLookupValue = s ; 
                if ( this.selectedIndex === -1 || this.selectedIndex >= this.visibleItems.length ) {
                    data  = this.visibleItems[0]; 
                } else {
                    data  = this.visibleItems[this.selectedIndex]; 
                }
                this.props.onItemSelected(data); 
                this.closeDropdown();
            }
        } else if ( evt.keyCode === 27 ) {
            this.closeDropdown();
        } else if (evt.keyCode === 38 ) {
            this.onNavigateUp(); 
        } else if ( evt.keyCode === 40 ) {
            this.onNavigateDown(); 
        }
        return false ; 
    }

    onNavigateUp () {
        let s: any = null ; 
        if ( isNull(this.visibleItems) || this.visibleItems.length === 0 || this.selectedIndex < 1 ) {
            if ( !isNull(this.state.highlightedCode)) {
                this.setStateHelper( st => st.highlightedCode = null ); 
            }
            return ; 
        }
        this.selectedIndex -= 1; 
        let highlightedCodeBaru: string = s ; 
        if ( this.visibleItems.length >  this.selectedIndex) {
            highlightedCodeBaru =  this.visibleItems[this.selectedIndex].detailCode!; 
        }
        this.setStateHelper( st => st.highlightedCode = highlightedCodeBaru ); 
    }

    onNavigateDown () {
        let s: any = null ; 
        if ( isNull(this.visibleItems) || this.visibleItems.length === 0 || this.selectedIndex >= this.visibleItems.length - 1) {
            if ( !isNull(this.state.highlightedCode)) {
                this.setStateHelper( st => st.highlightedCode = null ); 
            }
            return ; 
        }

        /*
        if ( this.visibleItems.length >  this.selectedIndex && this.selectedIndex>=0) {
            
            this.clearLiHiLight( this.visibleItems[this.selectedIndex].detailCode); 
        }
        this.selectedIndex +=1; 
        if ( this.visibleItems.length >  this.selectedIndex) {
            this.hiLightLi( this.visibleItems[this.selectedIndex].detailCode); 
        }*/
        this.selectedIndex += 1; 
        let highlightedCodeBaru: string = s ; 
        if ( this.visibleItems.length >  this.selectedIndex) {
            highlightedCodeBaru =  this.visibleItems[this.selectedIndex].detailCode!; 
        }
        this.setStateHelper( st => st.highlightedCode = highlightedCodeBaru ); 
    }

    render () {
        let dts: CommonCommunicationData.CommonLookupValue[] =    isNull( this.props.dropdownData ) ? [] :  this.props.dropdownData ; 
        return (
        <span 
            className="select2-container select2-container--default select2-container--open"   
            style={{position: 'absolute', left : this.state.actualLeft +   'px', top: this.state.actualTop +   'px'}} 
            id={this.props.htmlElementIdPrefix  + '_root_drop_down'}
        >
            <span 
                className={"select2-dropdown " + ( this.props.dropDownPosition === 'above' ? 'select2-dropdown--above' : 'select2-dropdown--below')} 
                id={this.props.htmlElementIdPrefix  + '_root_drop_down_actual'}
                dir="ltr" 
                style={{width: this.props.width + 'px'}}
            >
                <span className="select2-search select2-search--dropdown">
                    <input 
                        className="select2-search__field" 
                        type="search" 
                        tabIndex={0} 
                        autoFocus={true}   
                        autoComplete="off" 
                        autoCorrect="off" 
                        autoCapitalize="off" 
                        spellCheck={false} 
                        role="textbox"
                        onChange={this.onSearchChange}
                        onKeyDown={this.onQueryKeyDown}
                        onClick={(evt: any ) => {
                            if ( !isNull(evt) && !isNull(evt.stopPropagation)) {
                                evt.stopPropagation(); 
                            }
                        }}
                    />
                </span>
                <span className="select2-results">
                    <ul className="select2-results__options" role="tree"  aria-expanded="true" aria-hidden="false" id={this.props.htmlElementIdPrefix  + '_dropdown_ul'}>
                        {/*rows*/}
                        {dts.map( ( dt: CommonCommunicationData.CommonLookupValue , rowIndex: number ) => {
                            return (
                            <SearchableComboBoxDropDownLi 
                                data={dt}
                                key={'data_' + rowIndex}
                                labelFormatter={this.props.labelFormatter}
                                rowIndex={rowIndex}
                                closeDropdownCommand={this.closeDropdown}
                                onItemSelected={this.props.onItemSelected}
                                htmlElementIdPrefix={this.props.htmlElementIdPrefix!}
                                highlightedCode={this.state.highlightedCode!}
                                currentSelectedIds={this.props.currentSelectedIds}
                            /> 
                            ); 
                        })}
                    </ul>
                </span>
            </span>
        </span>
);
    }

    closeDropdown: () => any = () => {
        let rootPanel: HTMLElement = document.getElementById(this.props.htmlElementIdPrefix  + '_root_drop_down')! ; 
        if ( !isNull(rootPanel)) {
            rootPanel.style.display = 'none';
        }
        this.props.closeCommand();
    }

    /**
     * handler click . ini unutk menutup popup kalau di click di luar areal drop down
     */
    private windowClickHandler: (evt: any ) => any = (evt: any ) => {
        // console.warn('[SearchableComboBoxDropDown]click pada window di trigger')
        this.props.closeCommand(); 
        if ( !isNull(evt) && !isNull(evt.stopPropagation)) {
            evt.stopPropagation(); 
        }
    }

} 