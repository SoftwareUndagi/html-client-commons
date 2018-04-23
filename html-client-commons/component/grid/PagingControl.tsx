"use strict"; 
import * as React from "react" ;
import { isNull , BaseComponent } from 'core-client-commons/index';

export interface PagingControlProps extends React.Props<PagingControl> {

    /**
     * worker untuk navigate page
     */
    navigate: (page: number ) => any ; 
    /**
     * ukuran page per pembacaan
     */
    page: number ; 
    /**
     * total page dalam data
     */
    totalPage: number ; 

    /**
     * batasi paging atau tidak
     */
    limitDisplayedPage: boolean ; 
    /**
     * pager di tampilkan. sebaiknya ini ganjil
     */
    pagerDisplayed?: number; 
    /**
     * page size yang di pergunakan
     */
    pageSizes: number[]; 
    /**
     * page size yang di minta
     */
    pageSize: number; 
    /**
     * hanlder pada saat page size berubah
     */
    onPageSizeChange: ( pageSize: number ) => any  ; 

}

export interface PagingControlState {}

interface PagingData {
    pages: number[];
    hasPrev?: boolean;
    hasFirst?: boolean; 
    hasNext?: boolean; 
    hasLast?: boolean; 
}

export class PagingControl extends BaseComponent<PagingControlProps , PagingControlState > {
    txtJumptoId: string = 'txt_jump_to_' + new Date().getTime() + Math.ceil(Math.random() * 1000); 
    constructor(props: PagingControlProps) {
        super(props);
        this.state = {}; 
        window['doNothing'] = () => { 
            //
        };

    }
    render() {
        if (isNull(this.props.totalPage)) {
            return <input type='hidden' />;
        }
        let pageComps: any[] = [];
        let currentPage: number = this.props.page;
        let pgData: PagingData = this.generatePageToRender();
        let pages: number[] = pgData.pages; 
        if (isNull(currentPage)) {
            currentPage = 0;
        }
        if (!isNull(pages) && pages.length > 1) {
            for (var pg of pages) {
                pageComps.push(this.rendererPageButton(currentPage, pg));
            }
        } else {
            // tidak ada page sama sekali
            return <input type='hidden' /> ;
        }
        // let bfrNums: any[] = [];
        // let afterNums: any[] = []; 
        let nxt: any[] = [];
        let prevFirstBtn: any[] = [];
        let dots: any[] = []; 
        if (pgData.hasNext) {
            nxt.push(this.rendererGenerateButton('next_button', <span key='span_next'>&rsaquo;</span>, () => {
                this.props.navigate(currentPage + 1);
            }));
            nxt.push(this.rendererGenerateButton('last_button', <span key='span_last'>&raquo;</span>, () => {
                this.props.navigate(this.props.totalPage - 1);
            }));
        }
        
        if (pgData.hasFirst) {
            prevFirstBtn.push(this.rendererGenerateButton('first_button', <span key='span_last'>&laquo;</span>, () => {
                this.props.navigate(0);
            }));
        }
        if (pgData.hasPrev) {
            prevFirstBtn.push(this.rendererGenerateButton('prev_button', <span key='span_last'>&lsaquo;</span>, () => {
                this.props.navigate(this.props.page - 1); 
            }));
        }
        if (pgData.pages.length > 0) {
            if (pgData.pages[pgData.pages.length - 1] !== this.props.totalPage - 1) {
                dots.push(this.rendererGenerateButton('last_button_after_dot', <span key='span_last'>...</span>, () => {
                    //
                })); 
                this.rendererGenerateButton('last_button', <span key='span_last'>{this.props.totalPage}</span>, () => {
                    this.props.navigate(this.props.totalPage - 1);
                });
            }

        }

        return (
        <nav aria-label="...">
            <ul key='paging_control' className="pagination" style={{width: '100%'}}>{prevFirstBtn}{pageComps}{dots}
                {nxt}
                {this.renderJumpTo()}
                {this.rendererPagingSelector()}
            </ul></nav>
        );

    }

    private generatePageToRender(): PagingData  {
        let pagDisplayed: number = this.props.pagerDisplayed! ;
        if ( isNull(pagDisplayed)) {
                pagDisplayed = 5 ; 
            }
        if ( !this.props.limitDisplayedPage || pagDisplayed > this.props.totalPage) {
            let nMax: number = this.props.totalPage ; 
            if ( isNull(nMax)) {
                nMax = 0 ; 
            }
            let rtvl: number [] = [] ; 
            for ( let idx = 0 ; idx < nMax ; idx++) {
                rtvl.push(idx);
            }
            return { pages: rtvl }; 
        } else {
            console.warn('this.props.page : ', this.props.page, '.pagDisplayed :', pagDisplayed  );
            let pgs: number[] = []; 
            let rtvl: PagingData = {
                pages : pgs 
            };
            let pengurang: number = Math.floor(pagDisplayed / 2);
            let startIndex: number = this.props.page - pengurang;
            if (startIndex < 0) {
                startIndex = 0; 
            }
            for (let i = 0; i < pagDisplayed; i++) {
                pgs.push(i + startIndex);
            }
            if (this.props.page > 0) {
                rtvl.hasPrev = true;
                if (rtvl.pages[0] !== 0) {
                    rtvl.hasFirst = true   ;
                }
            }
            if (this.props.page < this.props.totalPage - 1) {
                rtvl.hasNext = true;
                rtvl.hasLast = rtvl.pages[rtvl.pages.length - 1] !== this.props.totalPage - 1; 

            } 
           
            return rtvl; 
        }
    }

    private renderJumpTo(): JSX.Element {
        return (
        <li  >&nbsp; 
            <span>
                <input 
                    type="number" 
                    id={this.txtJumptoId}
                    style={{
                        width: '60px',
                        float: 'left'
                    }} 
                /> 
            </span>
                <a 
                    href="javascript:doNothing()" 
                    onClick={() => {
                        let val: any = document.getElementById(this.txtJumptoId)!['value'];
                        if ( val === '' || isNaN(val)) {
                            return; 
                        }
                        let n: number = parseInt(val, 10) - 1; 
                        if (n < 0) {
                            n = 0; 
                        }
                        this.props.navigate(n);

                    } }
                >GO
                </a> </li>);
    }
    private rendererGenerateButton(key: string, label: any, clickHandler: () => any  ): JSX.Element {
        return (
            <li key={key + '_li'}>
                <a key={key + '_a'} onClick={clickHandler}>{label}
                </a>
            </li>);

    }

    private rendererPageButton(currentPage: number, pageNum: number ):  JSX.Element {
        let currentmarker: any[] = []; 
        let cssLi: string = '';
        if (currentPage === pageNum) {
            currentmarker = [<span className="sr-only" key={'marker_current_' + pageNum}>(current)</span>];
            cssLi = 'active';
        }
        return (
            <li className={cssLi} key={'li_pager_' + pageNum}>
                <a 
                    key={'pager_' + pageNum} 
                    onClick={() => {
                        if (currentPage === pageNum) {
                            return; 
                        }
                        this.props.navigate(pageNum);
                    } }
                >{pageNum + 1}{currentmarker}
                </a>
            </li>);
    }

    private rendererPagingSelector() {
        if (isNull(this.props.pageSizes) || this.props.pageSizes.length < 2 ) {
            return <input key='page_sizes_escape_input' type='hidden' />;
        }
        let opts: any[] = [];
        for (let p of this.props.pageSizes) {
            opts.push(<option value={p + ''} key={'page_size_selector' + p} selected={p === this.props.pageSize}>{p}</option>);
        }
        return (
        <li style={{ float: 'right' }} key='page_size_selector'>  Page Size
            <select 
                key='page_size_selector_combo' 
                onChange={(evt: any) => {
                    let pgSize: any = evt.target.value / 1;
                    if (!isNaN(pgSize)) {
                        this.props.onPageSizeChange(pgSize);
                    } 
                } }
            >{opts}
            </select> </li>
        );

    }

    /*
    render () {
        if ( isNull(this.props.totalPage) ){
            return <input type='hidden'/>
        }
         
        let pageComps : any [] = [] ; 
        let currentPage : number = this.props.page ; 
        let pages : number [] =   this.generatePageToRender() ; 
        if  ( isNull (currentPage)  ) {
            currentPage = 0 ; 
        }
        if ( !isNull(pages) && pages.length>1){
            for ( var pg of pages) {
                pageComps.push(this.rendererTaskRenderPageButton(currentPage , pg));
            }
        }else{
            // tidak ada page sama sekali
            return <input type='hidden'/>
        }
        let bfrNums : any [] = [] ; 
        let afterNums : any [] = [] ; 
        if ( currentPage >0 ) {
            bfrNums.push(<a  key='btn_first' className='btn btn-primary btn-o ' onClick={()=>{
                this.props.navigate(0)
            } }>&laquo;</a>);
            bfrNums.push(<a  key='btn_prev' className='btn btn-primary btn-o '  onClick={()=>{
                this.props.navigate(currentPage-1)
            } }>&lsaquo;</a>); 
        }

        if ( currentPage < this.props.totalPage-1){
            afterNums.push(<a  key='btn_next' className='btn btn-primary btn-o '   onClick={()=>{
                this.props.navigate(currentPage+1)
            } }>&rsaquo;</a>);
            afterNums.push(<a  key='btn_last' className='btn btn-primary btn-o '   onClick={()=>{
                this.props.navigate(this.props.totalPage-1);
            } }>&raquo;</a>);
        }
        return (
            <div className='btn-group' >
                {bfrNums}
                {pageComps}
                {afterNums}
            </div>)
    }

    private rendererTaskRenderPageButton (currentPage : number  ,pageNum : number ) {
        return <a key={'pager_' + pageNum} className={'btn btn-primary btn-o' +( currentPage== pageNum? ' active' :'')} onClick={()=>{
                    console.log('Navigate : ' , pageNum);
                    this.props.navigate(pageNum);
                }}>{pageNum+1}</a>;
    }*/
}