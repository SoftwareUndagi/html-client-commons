import * as React from "react" ;
import { isNull,  BaseComponent , BaseComponentProps , BaseComponentState  } from 'core-client-commons/index';
import { GridButtonProps } from './SimpleGridMetadata';
import { GridActionButtonLinkIcon } from './GridActionButtonLinkIcon'; 
/**
 * definisi column untuk action
 */
export interface GridActionColumnProps<DATA> extends BaseComponentProps {

    /**
     * buttons dari grid
     */
    buttons: GridButtonProps<DATA>[] ; 

    /**
     * default : center. ini css untuk td dari action column
     */
    cssName ?: string ; 

    /**
     * key suffix untuk key dari element
     */
    keySuffix: string ;

    /**
     * data untuk cell 
     */ 
    data: DATA ; 
    /**
     * lebar untuk column 
     */
    width ?: string ; 
} 
export interface GridActionColumnState extends BaseComponentState {

    /**
     * drop down expaned atau tidak. kalau di click pada 
     */
    dropdownExpanded: boolean ; 
}
/**
 * control untuk grid icon. ini merender sekalian bersama <strong>TD</strong>. 
 */
export class GridActionColumn<DATA> extends BaseComponent<GridActionColumnProps<DATA> , GridActionColumnState > {
    constructor(props: GridActionColumnProps<DATA>) {
        super(props) ; 
        this.state = {
            dropdownExpanded : false 
        } ; 
    }
    render () {
        if ( this.props.buttons.length > 0) {
            let links: any [] = [] ;
            let linksPopup: any [] = [] ; 
            let itr: number = 0 ; 
            for ( let cdef of this.props.buttons) {
                if ( !isNull(  cdef.doNotRenderIf) && cdef.doNotRenderIf ) {
                    continue ; 
                }
                if ( !isNull(cdef.doNotRenderIfCustomEvaluator) && cdef.doNotRenderIfCustomEvaluator!(this.props.data) ) {
                    continue;
                }
                let s: any = cdef.clickHandler ; 
                let sData: any = this.props.data;
                let sCssProvider: any = cdef.iconCssClassProvider; 
                links.push((
                <GridActionButtonLinkIcon
                    clickHandler={s}
                    data={sData}
                    keySuffix={this.props.keySuffix}
                    iconCssMouseEnter={cdef.iconCssMouseEnter}
                    iconCssClassProvider={sCssProvider}
                    iconCssClass={cdef.iconCssClass}
                    label={cdef.label}
                    key={'act_buttons_' + itr + this.props.keySuffix} 
                />));
                
                linksPopup.push(this.generateLinkNoIcon(cdef , 'popup_link_' + this.props.keySuffix + '_' + itr)); 
                itr++; 
            }

            let tdContent: any[] = [ (
            <div className='visible-md visible-lg hidden-sm hidden-xs'  key={'div_link_' + this.props.keySuffix}>
                {this.props.children}
                {links}
            </div>),
                (
                <div 
                    className='visible-xs visible-sm hidden-md hidden-lg' 
                    key={'div_drop_down_' + this.props.keySuffix} 
                >
                    <div 
                        className={'btn-group ' + (this.state.dropdownExpanded ? ' open'  : '')} 
                        data-dropdown=''
                    >
                        <button  
                            key={'button_toggle_' + this.props.keySuffix} 
                            type="button"
                            onClick={() => {
                                this.setStateHelper ( st => {
                                    st.dropdownExpanded = !st.dropdownExpanded ; 
                                }); 
                            }} 
                            className="btn btn-primary btn-o btn-sm dropdown-toggle" 
                            data-dropdown-toggle=""
                        >
                                <i className="fa fa-cog"/>&nbsp;<span className="caret"/>
                        </button>

                        <ul 
                            key={'ul_popup_' + this.props.keySuffix} 
                            className='dropdown-menu pull-right dropdown-light' 
                            role='menu'
                        >
                            {linksPopup}
                        </ul>
                    </div>
                </div>
            )]; 
            return !isNull(this.props.width) && this.props.width!.length > 0 ?  
            (
            <td
                style={{ width : this.props.width }} 
                key={'td_action_multiple' + this.props.keySuffix} 
                className={isNull(this.props.cssName) ? 'center' : this.props.cssName}
            >
                {tdContent}
            </td> )
            : 
            ( 
            <td 
                key={'td_action_multiple' + this.props.keySuffix} 
                className={isNull(this.props.cssName) ? 'center' : this.props.cssName}
            >{tdContent}
            </td>
            )
            
            ;
        } else {
            let cdef: GridButtonProps<DATA> = this.props.buttons[0]; 
            let s: any = cdef.clickHandler ; 
            let sData: any = this.props.data;
            let sCssProvider: any = cdef.iconCssClassProvider; 
            return (
            <td 
                key={'td_action_single' + 
                this.props.keySuffix} 
                className={isNull(this.props.cssName) ? 'center' : this.props.cssName}
            >
                <GridActionButtonLinkIcon
                    clickHandler={s}
                    data={sData}
                    keySuffix={this.props.keySuffix}
                    iconCssClass={cdef.iconCssClass}
                    label={cdef.label}
                    iconCssClassProvider={sCssProvider}
                    iconCssMouseEnter={cdef.iconCssMouseEnter}
                    key={'act_buttons_1' +   this.props.keySuffix}
                />
            </td>);
        }
    }
    
    generateLinkNoIcon ( colDef: GridButtonProps<DATA> , key: string ): JSX.Element {
        let style: React.CSSProperties = {} ; 
        if ( !isNull(colDef.hidden) && colDef.hidden) {
            style.display = 'none';
        }
        return (
        <a
            key={key}
            style={style}
            onClick={() => {
                if ( !isNull(colDef.clickHandler)) {
                    colDef.clickHandler(this.props.data); 
                }
            }}
            href='javascript:doNothing()'
        />);
    }

}