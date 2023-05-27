import { Account } from 'eth-components/ant';
import { getNetwork } from '@ethersproject/networks';
import { Alert, PageHeader } from 'antd';
import React, { FC, ReactElement } from 'react';
import { FaucetHintButton } from '~~/app/common/FaucetHintButton';
import { IScaffoldAppProviders } from '~~/app/routes/main/hooks/useScaffoldAppProviders';
import { useEthersContext } from 'eth-hooks/context';
import { useGasPrice } from 'eth-hooks';
//import { getNetworkInfo } from '~~/helpers';

import Web3Modal from 'web3modal';
import { useEffect, useState } from "react";
import Web3 from "web3";
import { BigNumber, ethers } from 'ethers';


//
import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector'
//


// displays a page header
export interface IMainPageHeaderProps {
  scaffoldAppProviders: IScaffoldAppProviders;
  price: number;
}

/**
 * ✏ Header: Edit the header and change the title to your project name.  Your account is on the right *
 * @param props
 * @returns
 */
export const MainPageHeader = (props) => {
  const ethersContext = useEthersContext();
  const selectedChainId = ethersContext.chainId;
  const {userWalletAddress,  setUserWalletAddress } = props;

  // 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation
 // const gasPrice = useGasPrice(ethersContext.chainId, 'fast', getNetworkInfo(ethersContext.chainId));
//
//const { activate, library, connector, active, deactivate } = useWeb3React()

//

  // const connectWallet = async () => {
  //   // Check if MetaMask is installed on user's browser
  //   if (window.ethereum) {
  //     const accounts = await window.ethereum.request({ method: 'eth_accounts' });
  //     const chainId = await window.ethereum.request({ method: 'eth_chainId' });
  //     // Check if user is connected to Mainnet
  //     // if(chainId != '0x1') {
  //     //   alert("Please connect to Mainnet");
  //     // } else {
  //     let wallet = accounts[0];
  //     setWalletAddress(wallet);
  //     //}
  //   } else {
  //     alert("Please install Mask");
  //   }
  // }

  const [account, setAccount] = useState('');
  //const [userWalletAddress, setUserWalletAddress] = useState(undefined);

  useEffect(() => {
    (async () => {
      if (localStorage.getItem("WEB3_CONNECT_CACHED_PROVIDER")) await connectPrompt();
    })()
  }, [])

  async function connectPrompt() {
    // const provider = await web3Modal.connect();
    // console.log("provider============", provider);
    // const web3 = new Web3(provider);

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);

    const signer = provider.getSigner();

    //const sig = await signer.signMessage("36eed947-7730-4cd1-99ea-adf13ec5cc9c");
    
    console.log("sig ========================", sig);

// //
// const signer = provider.getSigner();
// console.log("signer ========================", signer);

// const sig = await signer.signMessage(ethers.utils.arrayify("36eed947-7730-4cd1-99ea-adf13ec5cc9c"));

// console.log("sig ========================", sig);
// //


    // const firstAccount = await web3.eth.getAccounts().then(data => data[0]);
    // console.log("setUserWalletAddress======================", firstAccount);
    // setAccount(firstAccount);
    // setUserWalletAddress(firstAccount);


    //const provider = new ethers.providers.Web3Provider(window.ethereum);

  

   // const injected = new InjectedConnector({ supportedChainIds: [1, 42, 1337] })
    //await activate(injected).then(() => {});

  }

  async function disconnect() {
    await web3Modal.clearCachedProvider();
    setUserWalletAddress('');
    //await deactivate();
    setAccount('')
  }

  const providerOptions = {};
  const web3Modal = new Web3Modal({
    network: "testnet",
    cacheProvider: true,
    providerOptions // required
  });


  const right = (
    <div style={{ position: 'fixed', textAlign: 'right', right: 0, top: 0, padding: 10 }}>

      {account == '' ? <button onClick={() => connectPrompt()}>Connect</button> :
        <button onClick={() => disconnect()}>Disconnect</button>}

      {account == '' ? '' :
        <div className="mt-2 mb-2">
          Connected Account: {account}
        </div>}


       {/* <Account
        createLoginConnector={props.scaffoldAppProviders.createLoginConnector}
        ensProvider={props.scaffoldAppProviders.mainnetProvider}
        price={props.price}
        blockExplorer={props.scaffoldAppProviders.targetNetwork.blockExplorer}
        hasContextConnect={true}
      /> */}
       
      {/* <FaucetHintButton scaffoldAppProviders={props.scaffoldAppProviders} gasPrice={gasPrice} />
      {props.children}  */}
    </div>
  );

  return (
    <>
      {right}
    </>
  );
};
