import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { FC, useEffect, useState } from 'react';
import { YourCollectible } from '~~/generated/contract-types';
import { useAppContracts } from '~~/app/routes/main/hooks/useAppContracts';
import { useContractLoader, useContractReader } from 'eth-hooks';
import { useEthersContext } from 'eth-hooks/context';
import { BigNumber, ethers } from 'ethers';
import { create } from 'ipfs-http-client';
import { Button, Card, List } from 'antd';
import { Address, AddressInput } from 'eth-components/ant';
import { TTransactor } from 'eth-components/functions';
import { Buffer } from 'buffer';

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

const projectId = "";
const projectSecret = "";;
const projectIdAndSecret = `${projectId}:${projectSecret}`;
const contractName = "YourCollectible_2";

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

export const GiftNft: FC<IYourCollectibleProps> = (props: IYourCollectibleProps) => {
  const  URL_API = import.meta.env.VITE_REACT_APP_URL_API;
  const ethersContext = useEthersContext();
  const appContractConfig = useAppContracts();
  const collectibleUpdate = [];


  
  const [cm, setCm] = useState(undefined);
  const [selectedAddress, setSelectedAddress] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [txBeingSent, setTxBeingSent] = useState(undefined);

  const [transactionError, setTransactionError] = useState(undefined);
  const [networkError, setNetworkError] = useState(undefined);
  const [tokensToBuy, setTokensToBuy] = useState("");
  const [coffeeToBuy, setCoffeeToBuy] = useState("");
  const [giftAddress, setGiftAddress] = useState("");
  const [giftTokens, setGiftTokens] = useState("");

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

  // window.ethereum.on("accountsChanged", (accounts) => {
  //   if (accounts[0] && accounts[0] !== selectedAddress) {
  //     connectWallet();
  //   }
  // });



  const loadTransaction = async () => {
    axios.get(`${URL_API}02/gift-nft/false`)
      .then(res => {
        const transactions = res.data;
        transactions.forEach((transaction, index) => {
          if (transaction.contractName && transaction.tokenID) {
            loadNTFTs(transaction.contractName, transaction.tokenID);
          }
        });

      })
      .catch(error => console.log(error));
  }

  const loadNTFTs = async (contractName, tokenIndex) => {

    if (!cm) return;
    
    let YourCollectibleRead = cm

    try {
      // console.log('Getting token index', tokenIndex);
      // console.log('Getting token index', contractName);
      // console.log('Getting token index', YourCollectibleRead);
      // console.log('Getting token index', ethersContext.account);

      // YourCollectibleRead.totalSupply().then(function (data) {
      //   console.log("totalSupply====================", data?.toNumber());
      // });

      const tokenIndexNew = tokenIndex - 1;
     
      const tokenId = await YourCollectibleRead.tokenByIndex(tokenIndexNew);
      console.log('tokenId', tokenId);
      const tokenURI = await YourCollectibleRead.tokenURI(tokenId);
      console.log('tokenURI', tokenURI);

      const ipfsHash = tokenURI.replace('https://ipfs.io/ipfs/', '');
      console.log('ipfsHash', ipfsHash);
      const content = await getFromIPFS(ipfsHash);
      try {
        const ipfsObject = JSON.parse(content);
        console.log('ipfsObject', ipfsObject);
        collectibleUpdate.push({ id: tokenId, uri: tokenURI, owner: ethersContext.account, ...ipfsObject });
      } catch (e) {
        console.log(e);
      }
    } catch (e) {
      console.log(e);

    }

    setYourCollectibles(collectibleUpdate);
  }

  const { mainnetProvider, blockExplorer, tx } = props;
  const YourCollectibleRead = cm; 
  const YourCollectibleWrite = cm; 

  const [yourCollectibles, setYourCollectibles] = useState<any>([]);
  const [minting, setMinting] = useState<boolean>(false);
  const [transferToAddresses, setTransferToAddresses] = useState<{ [key: string]: string }>({});

  const [open, setOpen] = useState(false);
  const closeModal = () => setOpen(false);
  const [count, setCount] = useState(0);
  const [canClaim, setCanClaim] = useState(true);


  useEffect(() => {
    loadTransaction();
  }, [ethersContext.account, balance]);


  const [images, setImages] = React.useState<{ cid: CID; path: string }[]>([]);

  const onSubmitHandler = async (event: React.FormEvent<HTMLFormElement>) => {

    event.preventDefault();

    const file = event.target.elements.file.files[0];
    console.log(file);

    const imageSource = await ipfs.add(file);
    const urlImg = `https://infura-ipfs.io/ipfs/${imageSource.path}`;

    const dataImage = {
      description: event.target.elements.description.value,
      external_url: 'https://austingriffith.com/portfolio/paintings/',
      image: urlImg,
      name: event.target.elements.title.value,
      contract: {
        address: YourCollectibleRead.address
      },
      attributes: [
        {
          trait_type: 'BackgroundColor',
          value: 'blue',
        },
        {
          trait_type: 'Eyes',
          value: 'googly',
        },
        {
          trait_type: 'Stamina',
          value: 15,
        },
      ],
    };


    console.log("image", dataImage);
    // upload to ipfs
    const uploaded = await ipfs.add(JSON.stringify(dataImage));
    await tx(YourCollectibleWrite.mintItem(ethersContext.account, uploaded.path), (update) => {

      YourCollectibleRead.provider.getTransactionReceipt(update.hash).then(function (data) {
        let logs = data.logs;
        if (logs[0].topics[3]) {
          let tokenIndex = parseInt(logs[0].topics[3], 16);
          console.log("tokenIndex===============", tokenIndex);

          const form = {
            walletAddress: ethersContext.account,
            contractAddress: YourCollectibleRead.address,
            contractName: contractName,
            tokenID: tokenIndex,
            isClaim: false
          };
          axios.post(`${URL_API}/gift-nft`, form);
        }
      });

      console.log('📡 Transaction Update:', update);
      if (update && (update.status === 'confirmed' || update.status === 1)) {
        console.log(' 🍾 Transaction ' + update.hash + ' finished!');
        console.log(
          ' ⛽️ ' +
          update.gasUsed +
          '/' +
          (update.gasLimit || update.gas) +
          ' @ ' +
          parseFloat(update.gasPrice) / 1000000000 +
          ' gwei'
        );
      }
    });
  };

  return (

    <>

      <div style={{ width: 720, margin: 'auto', marginTop: 32, float: "left", marginLeft: 50 }}>
        <h1 style={{ float: "left", fontWeight: "bold", fontSize: 30 }}>Gift NFT</h1>
      </div >

      <div style={{ width: 720, margin: 'auto', marginTop: 32, paddingBottom: 32, float: "left", marginLeft: 50 }} className="ant-list ant-list-split ant-list-bordered">
        <br></br>

        <h1 style={{ float: "left", fontWeight: "bold", fontSize: 20, margin: 8 }}>Mint NTF</h1>
        <br></br>
        <br></br>

        <form onSubmit={onSubmitHandler}>
          <div style={{ margin: 8 }}>
            <span style={{ margin: 8, float: "left" }}> Title: </span>
            <input name="title" type="text" className="ant-input ant-input-lg" />
          </div>
          <div style={{ margin: 8 }}>
            <span style={{ margin: 8, float: "left" }}> Description: </span>
            <input name="description" type="text" className="ant-input ant-input-lg" />
          </div>
          <div style={{ margin: 8 }}>
            <span style={{ margin: 8, float: "left" }}> File:  </span>
            <input name="file" type="file" className="ant-input ant-input-lg" />
          </div>
          <br></br>
          <div>
            <span style={{ marginRight: 50, float: "right", width: 100 }}><button type="submit" className="ant-input ant-input-lg"> Mint</button></span>
          </div>
        </form>
      </div >

      <div style={{ width: 720, margin: 'auto', marginTop: 32, paddingBottom: 32, float: "left", marginLeft: 50 }} className="ant-list ant-list-split ant-list-bordered">
        <h1 style={{ float: "left", fontWeight: "bold", fontSize: 20, margin: 8 }}>List Gift NFTs</h1>
        <br></br>
        <br></br>
        <br></br>
        <List
          bordered
          dataSource={yourCollectibles}
          renderItem={(item: any) => {

            const id = item.id.toNumber();
            const imgSrc = item.image;

            return (
              <List.Item key={id + '_' + item.uri + '_' + item.owner}>

                <Card
                  title={
                    <div style={{ float: "left", margin: 8 }}>
                      <span style={{ fontWeight: "bold" }}>#{id}</span> {item.name}
                    </div>
                  }>
                  <div>
                    <img src={imgSrc} style={{ maxWidth: 100 }} />
                  </div>
                  <br></br>
                  <div style={{ float: "left", margin: 8 }}> <span style={{ fontWeight: "bold" }}>Des: </span>{item.description}</div>
                  <br></br>
                  <div style={{ float: "left", margin: 8, textAlign: "left" }}> <span style={{ fontWeight: "bold" }}>Contract Adress: </span> {item.contract.address}</div>
                </Card>
              </List.Item>
            );
          }}
        />
      </div>

    </>
  );
};
