var ct=Object.defineProperty,dt=Object.defineProperties;var ft=Object.getOwnPropertyDescriptors;var W=Object.getOwnPropertySymbols;var pt=Object.prototype.hasOwnProperty,ut=Object.prototype.propertyIsEnumerable;var B=(l,e,i)=>e in l?ct(l,e,{enumerable:!0,configurable:!0,writable:!0,value:i}):l[e]=i,I=(l,e)=>{for(var i in e||(e={}))pt.call(e,i)&&B(l,i,e[i]);if(W)for(var i of W(e))ut.call(e,i)&&B(l,i,e[i]);return l},_=(l,e)=>dt(l,ft(e));import{r as o,a as mt}from"./vendor.4e524bb7.js";import{c as ht,M as gt,L,C as yt,A as bt,a as xt,B as wt,b as St,d as vt,e as k}from"./Global.f8efdb66.js";import{X as Ct,W as It}from"./App.9e2d2e3f.js";import{j as s,F as kt,a as t}from"./main.a508a078.js";import{P as Tt}from"./reactjs-popup.esm.3948ab6e.js";import{c as P}from"./contract-address.13c27df0.js";import{C as Nt}from"./CM.f0743de6.js";import"./chunk-MTWSNRX5.13be4509.js";import"./index.a60be5ed.js";(function(){try{var l=typeof window!="undefined"?window:typeof global!="undefined"?global:typeof self!="undefined"?self:{},e=new Error().stack;e&&(l._sentryDebugIds=l._sentryDebugIds||{},l._sentryDebugIds[e]="8fe9bc2f-89e0-4b1f-17aa-4e14ce095405",l._sentryDebugIdIdentifier="sentry-dbid-8fe9bc2f-89e0-4b1f-17aa-4e14ce095405")}catch{}})();const At="2GajDLTC6y04qsYsoDRq9nGmWwK",Dt="48c62c6b3f82d2ecfa2cbe4c90f97037",Rt=`${At}:${Dt}`,Et="YourCollectible_2",Ft="Contract One",T=ht({host:"ipfs.infura.io",port:5001,protocol:"https",headers:{authorization:`Basic ${Buffer.from(Rt).toString("base64")}`}}),Mt=async l=>{const e=new TextDecoder;let i="";for await(const r of T.cat(l))i+=e.decode(r);return i},Kt=l=>{var R,E,F;const e=Ct(),i=[],[r,Wt]=o.exports.useState(void 0),[b,Bt]=o.exports.useState(void 0);let j=0;const x="https://stg-claimgiftapi.openlivenft.io",[c,O]=o.exports.useState(void 0),[_t,q]=o.exports.useState(void 0),[G,U]=o.exports.useState(void 0);o.exports.useState(void 0);const[Lt,$]=o.exports.useState(void 0),[Pt,z]=o.exports.useState(void 0);o.exports.useState(""),o.exports.useState(""),o.exports.useState(""),o.exports.useState(""),o.exports.useState(!1),o.exports.useState(!1);const[N,H]=o.exports.useState(!1),[A,Y]=o.exports.useState(!1),J={content:{top:"50%",left:"50%",right:"auto",bottom:"auto",marginRight:"-50%",border:null}},[X,D]=mt.useState(!1);function K(){}const Q=async()=>{z(void 0),$(void 0);const[n]=await window.ethereum.request({method:"eth_requestAccounts"});q(n);const a=new It(window.ethereum),u=new vt(P.CM,Nt.abi,a.getSigner(0));O(u)},V=async()=>{if(!c)return;let n=await c.balanceOf(e.account);if(!n)return;const a=n.toNumber();U(a)};o.exports.useEffect(()=>{Q()},[]),o.exports.useEffect(()=>{c&&V()},[c]);const{mainnetProvider:Z,blockExplorer:jt,tx:w}=l,[tt,et]=o.exports.useState([]);o.exports.useState(!1);const[S,nt]=o.exports.useState({}),[ot,v]=o.exports.useState(!1),C=()=>v(!1);o.exports.useEffect(()=>{(async()=>{if(!c)return;let a=await c.balanceOf(e.account);if(!a)return;var u=!0;const p=a.toNumber();for(let d=0;d<p;d++)try{console.log("Getting token index ========",d);const m=await c.tokenOfOwnerByIndex(e.account,d);console.log("tokenId==============",m);const f=await c.tokenURI(m);console.log("tokenURI============",f);const y=f.replace("https://ipfs.io/ipfs/","");console.log("ipfsHash",y);const g=await Mt(y);try{const h=JSON.parse(g);console.log("ipfsObject",h),i.push(I({id:m,uri:f,owner:e.account},h)),u=!1}catch(h){console.log(h),u=!1}}catch(m){console.log(m)}if(et(i),i.length>0){let d=await st();console.log("isClaim==========================",d),console.log("canClaim==========================",A),d!=A&&Y(d)}})()},[e.account,G,c,N]);const st=async n=>(console.log("ethersContext.account====================",e.account),(await k.get(`${x}/gift-request/checkCanClaimGift/${e.account}/${c.address}`)).data),at=async n=>{n.preventDefault(),D(!0),fetch().then(()=>setRequestSent(!1));const a=n.target.elements.file.files[0];console.log(a);const p=`https://infura-ipfs.io/ipfs/${(await T.add(a)).path}`,d={description:n.target.elements.description.value,external_url:"https://austingriffith.com/portfolio/paintings/",image:p,name:n.target.elements.title.value,contract:{address:c.address},attributes:[{trait_type:"BackgroundColor",value:"blue"},{trait_type:"Eyes",value:"googly"},{trait_type:"Stamina",value:15}]};console.log("image",d);const m=await T.add(JSON.stringify(d));console.log("Uploaded Hash:",m),await w(c.mintItem(e.account,m.path),f=>{console.log("mintItem===========",f),c.provider.getTransactionReceipt(f.hash).then(function(y){let g=y.logs;if(console.log("getTransactionReceipt===========",g),g[0].topics[3]){let h=parseInt(g[0].topics[3],16);console.log("tokenIndex===========",h);let rt=h-1;c.tokenByIndex(rt).then(function(M){console.log("tokenID===========",M),lt(M,f.hash,h)})}}),console.log("\u{1F4E1} Transaction Update:",f),f&&(f.status==="confirmed"||f.status===1)&&(console.log(" \u{1F37E} Transaction "+f.hash+" finished!"),console.log(" \u26FD\uFE0F "+f.gasUsed+"/"+(f.gasLimit||f.gas)+" @ "+parseFloat(f.gasPrice)/1e9+" gwei")),D(!1),H(!N)})},lt=async(n,a,u)=>{const p={walletAddress:e.account,contractAddress:c.address,contractName:Et,tokenID:n.toNumber(),tokenHash:a,tokenIndex:u,isOwner:!0};console.log("callAPIPostTransationMint========================",p),await k.post(`${x}/wallet-contract`,p)},it=async n=>{var u,p;n.preventDefault(),console.log("claimedTokenID ======================",j);const a={name:n.target.elements.name.value,phone:n.target.elements.phone.value,contractName:Ft,contractAddress:c.address,walletAddress:e.account,email:n.target.elements.email.value,giftName:(u=r==null?void 0:r.title)!=null?u:"",giftID:(p=r==null?void 0:r._id)!=null?p:"",tokenID:b};v(!1),await k.post(`${x}/gift-request`,a).then(function(d){console.log("response=======",d),alert("Submit succcessfully!")}).catch(function(d){console.log(d),alert(d)})};return o.exports.useEffect(()=>{b!=null&&v(!0)},[b]),s(kt,{children:[s("div",{children:[t(gt,{isOpen:X,onAfterOpen:K,onRequestClose:C,style:J,contentLabel:"Example Modal",children:t("div",{className:"loader-container",children:t("div",{className:"spinner"})})}),s(Tt,{open:ot,closeOnDocumentClick:!0,onClose:C,className:"popup-content",children:[s("div",{className:"modal-1",children:[t("a",{className:"close",onClick:C,style:{float:"right",fontWeight:"bold",fontSize:20},children:"\xD7"}),t("br",{}),s("div",{style:{width:420,margin:"auto",marginTop:10,paddingBottom:10,float:"left",marginLeft:30},className:"ant-list ant-list-split ant-list-bordered",children:[s("h1",{style:{float:"left",fontWeight:"bold",fontSize:15,margin:8},children:["Gift Name: ",(R=r==null?void 0:r.title)!=null?R:""]}),s("h3",{style:{float:"left",margin:8},children:["Contract: ",(E=r==null?void 0:r.contractName)!=null?E:""," - ",(F=r==null?void 0:r.contractAddress)!=null?F:""]}),t("hr",{style:{float:"left",width:420}}),t("h1",{style:{float:"left",fontWeight:"bold",margin:8},children:"Fill info to receive gift"}),t("p",{style:{float:"left",width:720,height:1}}),s("form",{onSubmit:it,children:[s("div",{style:{margin:8},children:[t("span",{style:{margin:8,float:"left"},children:" Full Name: "}),t("input",{name:"name",type:"text",className:"ant-input ant-input-lg"})]}),s("div",{style:{margin:8},children:[t("span",{style:{margin:8,float:"left"},children:" Phone"}),t("input",{name:"phone",type:"text",className:"ant-input ant-input-lg"})]}),s("div",{style:{margin:8},children:[t("span",{style:{margin:8,float:"left"},children:" Email: "}),t("input",{name:"email",type:"text",className:"ant-input ant-input-lg"})]}),t("div",{children:t("span",{style:{marginRight:50,float:"right",width:100},children:t("button",{type:"submit",class:"ant-input ant-input-lg",children:" Submit"})})})]})]})]}),t("p",{style:{float:"left",width:720,height:20}})]})]}),t("div",{style:{width:720,margin:"auto",marginTop:32,float:"left",marginLeft:50},children:t("h1",{style:{float:"left",fontWeight:"bold",fontSize:30},children:"My Collection"})}),s("div",{style:{width:720,margin:"auto",marginTop:32,paddingBottom:32,float:"left",marginLeft:50},className:"ant-list ant-list-split ant-list-bordered",children:[t("br",{}),t("h1",{style:{float:"left",fontWeight:"bold",fontSize:20,margin:8},children:"Mint NTF"}),t("br",{}),t("br",{}),s("form",{onSubmit:at,children:[s("div",{style:{margin:8},children:[t("span",{style:{margin:8,float:"left"},children:" Title: "}),t("input",{name:"title",type:"text",className:"ant-input ant-input-lg"})]}),s("div",{style:{margin:8},children:[t("span",{style:{margin:8,float:"left"},children:" Description: "}),t("input",{name:"description",type:"text",className:"ant-input ant-input-lg"})]}),s("div",{style:{margin:8},children:[t("span",{style:{margin:8,float:"left"},children:" File:  "}),t("input",{name:"file",type:"file",className:"ant-input ant-input-lg"})]}),t("br",{}),t("div",{children:t("span",{style:{marginRight:50,float:"right",width:100},children:t("button",{type:"submit",class:"ant-input ant-input-lg",children:" Mint"})})})]})]}),s("div",{style:{width:720,margin:"auto",marginTop:32,paddingBottom:32,float:"left",marginLeft:50},className:"ant-list ant-list-split ant-list-bordered",children:[t("h1",{style:{float:"left",fontWeight:"bold",fontSize:20,margin:8},children:"List NFTs"}),t("br",{}),t("br",{}),t("br",{}),t(L,{bordered:!0,dataSource:tt,renderItem:n=>{const a=n.id.toNumber(),u=n.image;return s(L.Item,{children:[s(yt,{title:s("div",{style:{float:"left",margin:8},children:[s("span",{style:{fontWeight:"bold"},children:["#",a]})," ",n.name]}),children:[t("div",{children:t("img",{src:u,style:{maxWidth:100}})}),s("div",{style:{float:"left",margin:8},children:[" ",t("span",{style:{fontWeight:"bold"},children:"Des: "}),n.description]}),s("div",{style:{float:"left",margin:8,textAlign:"left"},children:[" ",t("span",{style:{fontWeight:"bold"},children:"Contract Adress: "})," ",n.contract.address]})]}),s("div",{style:{float:"right",margin:8,textAlign:"left"},children:["Owner:",t(bt,{address:n.owner,fontSize:16}),t(xt,{ensProvider:Z,placeholder:"Transfer to address",address:S[a],onChange:p=>{nt(_(I({},S),{[a]:p}))}}),t("br",{}),t(wt,{style:{float:"right"},onClick:()=>{!e.account||!w||w(c.transferFrom(e.account,S[a],a),p=>{console.log("transfer==============",p)})},children:"Transfer"}),t("br",{}),t("br",{}),t(St,{to:"/nft-detail/"+P.CM+"/"+a,children:"Redirect To Detail"})]})]},a+"_"+n.uri+"_"+n.owner)}})]})]})};export{Kt as YourCollectibles};