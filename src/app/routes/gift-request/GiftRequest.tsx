import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { FC, useEffect, useState } from 'react';
import { YourCollectible } from '~~/generated/contract-types';
import { useAppContracts } from '~~/app/routes/main/hooks/useAppContracts';
import { useContractLoader, useContractReader } from 'eth-hooks';
import { useEthersContext } from 'eth-hooks/context';
import { BigNumber, ethers } from 'ethers';
import { create } from 'ipfs-http-client';
import { Button, Card, List, } from 'antd';
import { Address, AddressInput } from 'eth-components/ant';
import { TTransactor } from 'eth-components/functions';

import React from "react";

import 'reactjs-popup/dist/index.css';
import "~~/styles/css/my-popup.css";
import axios from 'axios';

import contractAddress from "~~/generated/contracts/contract-address.json";
import CMArtifact from "~~/generated/contracts/CM.json";

export interface IYourCollectibleProps {
  mainnetProvider: StaticJsonRpcProvider;
  blockExplorer: string;
  tx?: TTransactor;
}

const projectId = "2GajDLTC6y04qsYsoDRq9nGmWwK";
const projectSecret = "48c62c6b3f82d2ecfa2cbe4c90f97037";;
const projectIdAndSecret = `${projectId}:${projectSecret}`;
const contractName = "YourCollectible_2";


const optionsNames = ['Contract One', 'Contract Two', 'Contract Three'];
const optionsValues = ['0xA59cDed9962f6dfaB3200b4bA3a8fe1887F6Be48', '0x00F6Ec132910c36f331D303987043316cf280862', '0x82D96e6C5aE33B430F100384A5C328194361Abe2'];

const ipfs = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: { authorization: `Basic ${Buffer.from(projectIdAndSecret).toString("base64")}` },
});

const getFromIPFS = async (cid: string) => {
  const decoder = new TextDecoder();
  let content = '';
  for await (const chunk of ipfs.cat(cid)) {
    content += decoder.decode(chunk);
  }
  return content;
};

export const GiftRequest: FC<IYourCollectibleProps> = (props: IYourCollectibleProps) => {

  const ethersContext = useEthersContext();
  const collectibleUpdate = [];
  const  URL_API = import.meta.env.VITE_REACT_APP_URL_API;

  const [cm, setCm] = useState(undefined);
  const [selectedAddress, setSelectedAddress] = useState(undefined);
  const [balance, setBalance] = useState(undefined);

  const connectWallet = async () => {
    setNetworkError(undefined);
    setTransactionError(undefined);
    const [selectedAddress] = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setSelectedAddress(selectedAddress);

    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const cm = new ethers.Contract(
      contractAddress.CM,
      CMArtifact.abi,
      provider.getSigner(0)
    );
    setCm(cm);
  };

  const fetchTokenBalance = async () => {
    if (!cm) {
      return;
    }
    let balance = await cm.balanceOf(ethersContext.account);
    if (!balance) return;
    const yourBalance = balance.toNumber();
    setBalance(yourBalance);
  };


  useEffect(() => {
    connectWallet();
  }, []);

  useEffect(() => {
    if (cm) {
      fetchTokenBalance();
    }
  }, [cm]);


  const [yourCollectibles, setYourCollectibles] = useState<any>([]);
  var indexList = 0;
  const [isLoad, setIsLoad] = useState(false);

  const loadTransaction = async () => {
    console.log("URL================",URL_API);
    axios.get(`${URL_API}/gift-request`)
      .then(res => {
        indexList = 0;
        const transactions = res.data;
        transactions.forEach((transaction, index) => {
          collectibleUpdate.push({ ...transaction });
        });

        setYourCollectibles(collectibleUpdate);
      })
      .catch(error => console.log(error));
  }

  useEffect(() => {
   // if (!isLoad) {
      loadTransaction();
      setIsLoad(true);
    //}
  });

  return (

    <>

      <div style={{ width: 720, margin: 'auto', marginTop: 32, float: "left", marginLeft: 50 }}>
        <h1 style={{ float: "left", fontWeight: "bold", fontSize: 30 }}>Gift Request</h1>
      </div >

      <div style={{ width: 720, margin: 'auto', marginTop: 32, paddingBottom: 32, float: "left", marginLeft: 50 }}>
        <h1 style={{ float: "left", fontWeight: "bold", fontSize: 20, margin: 8 }}>List of Gift Request</h1>
        <br></br>
        <br></br>
        <br></br>
        <List
          bordered
          dataSource={yourCollectibles}
          renderItem={(item: any, index) => {

            const imgSrc = item.urlImage;
            var id = index + 1;
            return (
              <List.Item key={id + '_'}>

                <Card
                  style={{ width: 720 }}
                  title={
                    <div style={{ float: "left", margin: 8 }}>
                      <span style={{ fontWeight: "bold" }}>#{id} - {item.giftName}</span>
                    </div>
                  }>
                  <div style={{ float: "left", margin: 8 }}> <span style={{ fontWeight: "bold" }}>FullName: </span>{item.name}</div>
                  <br></br>
                  <br></br>
                  <div style={{ float: "left", margin: 8 }}> <span style={{ fontWeight: "bold" }}>Phone: </span>{item.phone}</div>
                  <br></br>
                  <br></br>
                  <div style={{ float: "left", margin: 8 }}> <span style={{ fontWeight: "bold" }}>Wallet Address: </span>{item.walletAddress}</div>
                  <br></br>
                  <br></br>
                  <div style={{ float: "left", margin: 8, textAlign: "left" }}> <span style={{ fontWeight: "bold" }}>Contract Name: </span> {item.contractName}</div>
                  <br></br>
                  <br></br>
                  <div style={{ float: "left", margin: 8, textAlign: "left" }}> <span style={{ fontWeight: "bold" }}>Contract Adress: </span> {item.contractAddress}</div>
                  <br></br>
                  <br></br>
                  <div style={{ float: "left", margin: 8, textAlign: "left" }}> <span style={{ fontWeight: "bold" }}>Token ID: </span> {item.tokenID ?? ""}</div>
                </Card>
              </List.Item>
            );
          }}
        />
      </div>
    </>
  );
};
