import * as React from "react" ;
import { isNull } from '../utils/index';
import { BaseHtmlComponent , BaseHtmlComponentProps , BaseHtmlComponentState } from './BaseHtmlComponent';
/**
 * tab container
 */
export interface TabContainerPanelProps extends BaseHtmlComponentProps {

    /**
     * flag visible atau tidak tab container
     */
    visible?: boolean; 

    /**
     * css untuk di tambahkan dalam tab ul
     */
    cssForTabUl?: string; 
}

export interface TabContainerPanelState extends BaseHtmlComponentState {
    selectedIndex: number ; 

    activatedTabIndexes: number [ ] ; 
}

/**
 * tab container
 */
export class TabContainerPanel  extends BaseHtmlComponent<TabContainerPanelProps , TabContainerPanelState > {

    /**
     * css untuk root tab
     */
    rootTabCssContent: string  = 'tabbable' ; 

    headLiPanels: TabContentPanelProps [] ; 
    contentPanels: any [] ; 
    customTabContentPanelCss: { [id: number]: string } = {}; 

    constructor(props: TabContainerPanelProps) {
        super(props) ; 
        this.state = {
            selectedIndex : -1  , 
            activatedTabIndexes : [] 
        }; 
        this.buildContents(this.state) ; 
    }

    buildContents ( targetState: TabContainerPanelState) {
        this.headLiPanels =  [] ; 
        this.contentPanels =  [];
        let swapChld: any  = this.props.children ; 
        let tabContentSelIdx: number = 0 ; 
        let idx: number = 0 ; 
        let idxActualTab: number = 0; 
        for ( let c of swapChld) {
            let jChld: JSX.Element = c ; 
            let jProp: TabContentPanelProps =  jChld.props ;
            if ( isNull(jProp.title)  || jProp.title.length === 0 ) {
                idx++ ;
                continue  ; 
            } 
            if (!isNull(  jProp.active) && jProp.active ) {
                tabContentSelIdx = idx ; 
            }
            
            if (!isNull(jProp.customCssForLi)) {
                this.customTabContentPanelCss[idxActualTab] = jProp.customCssForLi!; 
            }
            idxActualTab++; 
            this.contentPanels.push(c);
            this.headLiPanels.push(jProp);
            idx++ ; 
            targetState.selectedIndex = tabContentSelIdx ; 
        }
        if ( (isNull(this.state.selectedIndex) || this.state.selectedIndex < 0) && this.headLiPanels.length > 0 ) {
            targetState.selectedIndex = 0 ; 
        }

    }

    render (): JSX.Element  {
        let headLi: any [] = [] ; 
        let contentDiv: any [] =  [];
        let i: number = 0 ;  
        for (   let c of this.headLiPanels ) {
            headLi.push(this.rendererTaskGeneratTabHeaderPanel(c , i++));
        }
        i = 0;
        for ( let d of this.contentPanels) {
            if ( this.headLiPanels[i].lazyActivated && this.state.activatedTabIndexes.indexOf(i) < 0 ) {
                //
            } else {
                contentDiv.push( this.rendederTaskGenerateTabContent(  d.props.children , i));
            }
            i++  ; 
             
        }
        let disp: any = {} ; 
        if ( !isNull(this.props.visible) && !this.props.visible) {
            disp = {display : 'none'}; 
        }
        let tabUlCss: string = 'nav nav-tabs ';
        if (!isNull(this.props.cssForTabUl)) {
            tabUlCss = this.props.cssForTabUl!; 
        }
        return (
        <div className={this.rootTabCssContent} key='root_tab' style={disp}>
            <ul className={tabUlCss} key='header_css'>
                {headLi}
            </ul>
            <div className='tab-content' key='tab_container'>
            {contentDiv}
            </div>
        </div>
        );
    }

    /**
     * set active tab
     */
    activateTab ( tabIndex: number  ) {
        if ( tabIndex < 0 ) {
            tabIndex = 0 ; 
        }
        if ( tabIndex >= this.contentPanels.length) {
            tabIndex = this.contentPanels.length - 1 ; 
        }
        this.setStateHelper ( st => { st.selectedIndex = tabIndex ; });
    }
    /**
     * renderer tab content
     */
    rendederTaskGenerateTabContent (content: any , index: number) {
        let cssName: string = 'tab-pane fade'; 
         
        if ( this.state.selectedIndex === index) {
            cssName += ' active in';
        }
        return (
        <div className={cssName} key={'tab_content_' + index}>
            {content}
        </div>
        );
    }

    /**
     * generator tab header li
     */
    rendererTaskGeneratTabHeaderPanel ( tabContentProps: TabContentPanelProps , index: number ): JSX.Element {
        let cssName: string = '';
        let cssIdx: string = this.customTabContentPanelCss[index];
        if (!isNull(cssIdx)) {
            cssName = cssIdx; 
        } 
        if ( this.state.selectedIndex === index) {
            cssName = 'active';
        }
        return (
        <li 
            className={cssName} 
            key={'tab_header_' + index} 
        >
            <a 
                href='javascript:doNothing()' 
                onClick={() => {
                    this.setStateHelper ( st => {
                        if ( st.activatedTabIndexes.indexOf(index) < 0 ) {
                            st.activatedTabIndexes.push(index) ; 
                        }
                        st.selectedIndex = index ; 
                        if ( !isNull(tabContentProps.customClickHandler)) {
                            tabContentProps.customClickHandler!(); 
                        }
                    }); }}
            >{tabContentProps.title}
            </a>
        </li>
     ) ; 
    }
}

export interface TabContentPanelProps {
    title: string ;

    /**
     * initial active atau tidak. kalau misal active.akan di buka pada bagian awal
     */ 
    active ?: boolean ; 

    /**
     * click handler tambahan untuk tab panel
     */
    customClickHandler ?: () => any ; 

    /**
     * flag panel ini lazy activated atau tidak
     */
    lazyActivated?: boolean; 

    /**
     * css untuk li. 
     */
    customCssForLi?: string; 
}
export interface TabContentPanelState {}

/**
 * tab content
 */
export class    TabContentPanel extends BaseHtmlComponent<TabContentPanelProps , TabContentPanelState > {
    constructor(props: TabContentPanelProps) {
        super(props) ; 
        this.state = {};
    }
    render (): JSX.Element {
        return <div>{this.props.children}</div>;
    }
}