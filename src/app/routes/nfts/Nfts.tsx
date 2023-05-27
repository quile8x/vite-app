import { useEffect, useState } from 'react';
import {
  Link,
  useParams
} from "react-router-dom";

import { useEthersContext } from 'eth-hooks/context';
import { BigNumber, ethers } from 'ethers';
import { create } from 'ipfs-http-client';
import { Button, Card, List } from 'antd';
import { Address, AddressInput } from 'eth-components/ant';
import { Buffer } from 'buffer';

import React from "react";
import Modal from 'react-modal';
import 'reactjs-popup/dist/index.css';
import '../../../styles/css/my-popup.css'
import ClipLoader from "react-spinners/ClipLoader";


import axios from 'axios';

import contractAddress from "../../../generated/contracts/contract-address.json";
import CMArtifact from '../../../generated/contracts/CM.json'

const projectId = "";
const projectSecret = "";;
const projectIdAndSecret = `${projectId}:${projectSecret}`;

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


export const Nfts = (props) => {

  const { addressContract } = useParams();

  let contractName = "YourCollectible_2";

  const ethersContext = useEthersContext();
  const collectibleUpdate = [];
  const URL_API = import.meta.env.VITE_REACT_APP_URL_API;

  const [cm, setCm] = useState(undefined);
  const [balance, setBalance] = useState(undefined);

  const [isRefesh, setIsRefesh] = useState(false);
  const { userWalletAddress } = props;

  const customStyles = {
    content: {
      top: '30%',
      left: '45%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      border: null
    },
  };


  let [loading, setLoading] = useState(true);
  let [color, setColor] = useState("#36d7b7");


  const [modalIsOpen, setIsOpen] = React.useState(false);
  function openModal() {
    setIsOpen(true);
  }
  
  const connectWallet = async () => {
    console.log("connectWallet ========================", connectWallet);
    if (!userWalletAddress) {
      return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const signer = provider.getSigner();

    const sig = await signer.signMessage(ethers.utils.arrayify("5bddebf5-69ad-4858-9501-7ecc5826e652"));
    
    console.log("sig ========================", sig);

    const cm = new ethers.Contract(
      addressContract,
      CMArtifact.abi,
      provider.getSigner(0)
    );
    setCm(cm);
  };

  const fetchTokenBalance = async () => {
    if (!cm) {
      return;
    }
    let balance = await cm.balanceOf(userWalletAddress);
    if (!balance) return;
    const yourBalance = balance.toNumber();
    setBalance(yourBalance);
  };


  useEffect(() => {
    if (userWalletAddress) {
      connectWallet();
    }
  }, [userWalletAddress]);

  useEffect(() => {
    if (cm) {
      fetchTokenBalance();
    }
  }, [cm]);

  // window.ethereum.on("accountsChanged", (accounts) => {
  //   if (accounts[0] && accounts[0] !== selectedAddress) {
  //     //alert( accounts[0]);
  //     // connectWallet();
  //   }
  // });


  const { mainnetProvider, blockExplorer, tx } = props;
  const [yourCollectibles, setYourCollectibles] = useState<any>([]);
  const [transferToAddresses, setTransferToAddresses] = useState<{ [key: string]: string }>({});

  useEffect(() => {

    connectWallet();
    const updateYourCollectibles = async () => {
      if (!cm) {
        return;
      }
      let balance = await cm.balanceOf(userWalletAddress);
      if (!balance) return;
      var flagTokenURL = true;
      const yourBalance = balance.toNumber();
      console.log('yourBalance============', yourBalance);

      for (let tokenIndex = 0; tokenIndex < yourBalance; tokenIndex++) {
        try {
          const tokenId = await cm.tokenOfOwnerByIndex(userWalletAddress, tokenIndex);
          const tokenURI = await cm.tokenURI(tokenId);
          const ipfsHash = tokenURI.replace('https://ipfs.io/ipfs/', '');
          console.log('ipfsHash', ipfsHash);
          const content = await getFromIPFS(ipfsHash);
          try {
            const ipfsObject = JSON.parse(content);
            console.log('ipfsObject', ipfsObject);
            collectibleUpdate.push({ id: tokenId, uri: tokenURI, owner: userWalletAddress, ...ipfsObject });
            flagTokenURL = false;
          } catch (e) {
            console.log(e);
            flagTokenURL = false;
          }
        } catch (e) {
          console.log(e);
        }
      }
      setYourCollectibles(collectibleUpdate);
    };
    updateYourCollectibles();
  }, [userWalletAddress, balance, cm, isRefesh]);


  const onSubmitHandler = async (event: React.FormEvent<HTMLFormElement>) => {

    event.preventDefault();
    setIsOpen(true);
    const file = event.target.elements.file.files[0];
    console.log(file);
    const imageSource = await ipfs.add(file);
    const urlImg = `https://infura-ipfs.io/ipfs/${imageSource.path}`;
    const dataImage = {
      description: event.target.elements.description.value,
      external_url: 'https://austingriffith.com/portfolio/paintings/', // <-- this can link to a page for the specific file too
      image: urlImg,//'https://austingriffith.com/images/paintings/fish.jpg',
      name: event.target.elements.title.value,
      contract: {
        address: cm.address
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


    //   walletAddress: ethersContext.account,
    //   contractAddress: cm.address,
    //   contractName: contractName,
    //   tokenID: 
    //   tokenHash:
    //   tokenIndex:
    //   isOwner:

    // };

    // const { data } = await axios.post("http://192.168.1.25:3002/wallet-contract", form);
    console.log("image", dataImage);
    // upload to ipfs
    const uploaded = await ipfs.add(JSON.stringify(dataImage));
    //const uploaded = await ipfs.add(file)

    console.log('Uploaded Hash:', uploaded);
    await cm.mintItem(userWalletAddress, uploaded.path).then(function (update) {
      cm.provider.getTransactionReceipt(update.hash).then(function (data) {
        let logs = data.logs;
        if (logs[0].topics[3]) {
          let tokenIndex = parseInt(logs[0].topics[3], 16);
          let newTokenIndex = tokenIndex - 1;
          cm.tokenByIndex(newTokenIndex).then(function (tokenID) {
            callAPIPostTransationMint(tokenID, update.hash, tokenIndex);
          });
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
      setIsOpen(false);
      setIsRefesh(!isRefesh);
    }).catch(function (error) {
      console.log("Error====================", error);
    });
  };


  const callAPIPostTransationMint = async (tokenID, hash, tokenIndex) => {

    const form = {
      walletAddress: userWalletAddress,
      contractAddress: cm.address,
      contractName: contractName,
      tokenID: tokenID.toNumber(),
      tokenHash: hash,
      tokenIndex: tokenIndex,
      isOwner: true
    };
    const { data } = await axios.post(`${URL_API}/wallet-contract`, form);

  }

  return (
    <>
      <div>
        <Modal
          isOpen={modalIsOpen}
          style={customStyles}
        >
          <ClipLoader
            color={color}
            loading={loading}
            size={50}
          />
        </Modal>
      </div >
      <div style={{ width: 720, margin: 'auto', marginTop: 32, float: "left", marginLeft: 50 }}>
        <h1 style={{ float: "left", fontWeight: "bold", fontSize: 30 }}>My Collection</h1>
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
        <h1 style={{ float: "left", fontWeight: "bold", fontSize: 20, margin: 8 }}>List NFTs</h1>
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
                  <div style={{ float: "left", margin: 8 }}> <span style={{ fontWeight: "bold" }}>Des: </span>{item.description}</div>
                  <div style={{ float: "left", margin: 8, textAlign: "left" }}> <span style={{ fontWeight: "bold" }}>Contract Adress: </span> {item.contract.address}</div>
                </Card>

                <div style={{ float: "right", margin: 8, textAlign: "left" }}>
                  Owner:
                  <Address
                    address={item.owner}
                    fontSize={16}
                  />
                  <AddressInput
                    ensProvider={mainnetProvider}
                    placeholder="Transfer to address"
                    address={transferToAddresses[id]}
                    onChange={(newValue) => {
                      setTransferToAddresses({ ...transferToAddresses, ...{ [id]: newValue } });
                    }}
                  />
                  <br></br>
                  <Button style={{ float: "right" }}
                    onClick={() => {
                      if (!ethersContext.account || !tx) return;
                      tx(cm.transferFrom(ethersContext.account, transferToAddresses[id], id), (update) => {
                        console.log("transfer==============", update);
                      });
                    }}>
                    Transfer
                  </Button>
                  <br></br>
                  <br></br>

                  <Link to={"/nft-detail/" + addressContract + "/" + id}>Redirect To Detail</Link>
                </div>
              </List.Item>
            );
          }}
        />
      </div>
    </>
  );
};
