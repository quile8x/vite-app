import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { FC, useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useEthersContext } from 'eth-hooks/context';
import { BigNumber, ethers } from 'ethers';
import { create } from 'ipfs-http-client';
import { Button, Card, List } from 'antd';
import { Address, AddressInput } from 'eth-components/ant';
import { TTransactor } from 'eth-components/functions';

import React from "react";
import Popup from 'reactjs-popup';
import Modal from 'react-modal';
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
const contractNameTemp = "Contract One";


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

export const NftDetail: FC<IYourCollectibleProps> = (props: IYourCollectibleProps) => {
  const  URL_API = import.meta.env.VITE_REACT_APP_URL_API;
  const ethersContext = useEthersContext();
  const { tokenID } = useParams();
  const { addressContract } = useParams();

  const collectibleUpdate = [];
  const [giftObject, setGiftObject] = useState(undefined);
  const [giftObjects, setGiftObjects] = useState([]);
  const [claimedTokenID, setClaimedTokenID] = useState(undefined)
  let claimedTokenIDTemp = 0;

  const [cm, setCm] = useState(undefined);
  const [selectedAddress, setSelectedAddress] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [transactionError, setTransactionError] = useState(undefined);
  const [networkError, setNetworkError] = useState(undefined);

  const [isActive, setIsActive] = useState(false)
  const [loading, setLoading] = useState(false);
  const [isRefesh, setIsRefesh] = useState(false);
  const [canClaim, setCanClaim] = useState(false);

  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      border: null
      //padding: '0%',
      //transform: 'translate(-50%, -50%)',
    },
  };

  const [modalIsOpen, setIsOpen] = React.useState(false);
  function openModal() {
    setIsOpen(true);
  }

  function afterOpenModal() {
    // references are now sync'd and can be accessed.
    //subtitle.style.color = '#f00';
  }

  const connectWallet = async () => {
    setNetworkError(undefined);
    setTransactionError(undefined);
    const [selectedAddress] = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setSelectedAddress(selectedAddress);

    const provider = new ethers.providers.Web3Provider(window.ethereum);

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


  const { mainnetProvider, blockExplorer, tx } = props;

  const [yourCollectibles, setYourCollectibles] = useState<any>([]);
  const [transferToAddresses, setTransferToAddresses] = useState<{ [key: string]: string }>({});

  const [open, setOpen] = useState(false);
  const closeModal = () => setOpen(false);

  useEffect(() => {
    loadGift();
    const updateYourCollectibles = async () => {
      if (!cm) {
        return;
      }
      try {
        let tokenIndex = tokenID - 1;
        const tokenId = await cm.tokenByIndex(tokenIndex);
       // cm.tokenOfOwnerByIndex(ethersContext.account, tokenIndex);
        console.log('tokenId==============', tokenId);
        const tokenURI = await cm.tokenURI(tokenId);
        console.log('tokenURI============', tokenURI);
        const ipfsHash = tokenURI.replace('https://ipfs.io/ipfs/', '');
        console.log('ipfsHash', ipfsHash);
        const content = await getFromIPFS(ipfsHash);
        try {
          const ipfsObject = JSON.parse(content);
          console.log('ipfsObject', ipfsObject);
          collectibleUpdate.push({ id: tokenId, uri: tokenURI, owner: ethersContext.account, ...ipfsObject });
          flagTokenURL = false;
        } catch (e) {
          console.log(e);
          flagTokenURL = false;
        }
      } catch (e) {
        console.log(e);
      }
      // }
      setYourCollectibles(collectibleUpdate);

      if (collectibleUpdate.length > 0) {
        let isClaim = await checkCanClaimGift(tokenID);
        if (isClaim != canClaim) {
          setCanClaim(isClaim);
        }
      }
    };
    updateYourCollectibles();
  }, [ethersContext.account, balance, cm, isRefesh]);

  // check can claim gift from tokenID
  const checkCanClaimGift = async (tokenID) => {
    const rep = await axios.get(`${URL_API}/gift-request/checkCanClaimGift/${ethersContext.account}/${cm.address}/${tokenID}`);//.then(res => {
    console.log("rep.data===========================",rep.data);
    return rep.data;
  }
  //

  const onGiftRequestSubmitHandler = async (event: React.FormEvent<HTMLFormElement>) => {

    event.preventDefault();
    console.log("claimedTokenID ======================", claimedTokenIDTemp)
    const form = {
      name: event.target.elements.name.value,
      phone: event.target.elements.phone.value,
      contractName: contractNameTemp,
      contractAddress: cm.address,
      walletAddress: ethersContext.account,
      email: event.target.elements.email.value,
      giftName: giftObject?.title ?? "",
      giftID: giftObject?._id ?? "",
      tokenID: claimedTokenID
    };

    console.log("form ======================", form)

    setOpen(false);
    //setIsActive(true);
    await axios.post(`${URL_API}/gift-request`, form)
      .then(function (response) {
        console.log("response=======", response);
        //setIsActive(false)
        // alert("Submit succcessfully!");
        setIsRefesh(true);
      })
      .catch(function (error) {
        console.log(error);
        alert(error);
      });

  };

  useEffect(() => {
    if (claimedTokenID != undefined) {
      setOpen(true);
    }
  }, [claimedTokenID]);

  const onClaimGift = async (tokenId) => {
    setClaimedTokenID(tokenId);
  }

  const loadGift = async (uniqueArray) => {

    axios.get(`${URL_API}/gift/byContractAddress/${cm.address}`)

      .then(res => {
        const transactions = res.data;
        console.log("giftNfts===================", transactions);
        let isReceived = false;
        transactions.forEach((tx, index) => {
          console.log("tx ============= taolao", isReceived);
          if (isReceived == false) {
            console.log("transaction.contractName, transaction.tokenID =============", tx.tokenID);
            isReceived = true;
            setGiftObject(tx);
          }
        });
        setGiftObjects(transactions)
        console.log("setGiftObjects======================",giftObjects);
      })
      .catch(error => console.log(error));
  }


  return (
    <>
      <div>
        <Modal
          isOpen={modalIsOpen}
          onAfterOpen={afterOpenModal}
          onRequestClose={closeModal}
          style={customStyles}
          contentLabel="Example Modal"
        >
          <div className="loader-container">
            <div className="spinner"></div>
          </div>
        </Modal>

        <Popup open={open} closeOnDocumentClick onClose={closeModal} className="popup-content" >
          <div className="modal-1" >
            <a className="close" onClick={closeModal} style={{ float: "right", fontWeight: "bold", fontSize: 20 }}>
              &times;
            </a>
            <br></br>
            <div style={{ width: 420, margin: 'auto', marginTop: 10, paddingBottom: 10, float: "left", marginLeft: 30 }} className="ant-list ant-list-split ant-list-bordered">
   
             
              {giftObjects.map((giftObject, index) => {
                 return <div> <h1 style={{ float: "left", fontWeight: "bold", fontSize: 15, margin: 8 }}>Gift Name: {giftObject?.title ?? ""}</h1>
                <h3 style={{ float: "left", margin: 8, fontSize: 15 }}></h3> </div>
              })}


              <hr style={{ float: "left", width: 420 }}></hr>
              <h1 style={{ float: "left", fontWeight: "bold", margin: 8, fontSize: 20 }}>Fill info to receive gift</h1>
              <p style={{ float: "left", width: 720, height: 1 }}></p>
              <form onSubmit={onGiftRequestSubmitHandler}>
                <div style={{ margin: 8 }}>
                  <span style={{ margin: 8, float: "left" }}> Full Name: </span>
                  <input name="name" type="text" className="ant-input ant-input-lg" />
                </div>
                <div style={{ margin: 8 }}>
                  <span style={{ margin: 8, float: "left" }}> Phone</span>
                  <input name="phone" type="text" className="ant-input ant-input-lg" />
                </div>
                <div style={{ margin: 8 }}>
                  <span style={{ margin: 8, float: "left" }}> Email: </span>
                  <input name="email" type="text" className="ant-input ant-input-lg" />
                </div>
                <div>
                  <span style={{ marginRight: 50, float: "right", width: 100 }}><button type="submit" class="ant-input ant-input-lg"> Submit</button></span>
                </div>
              </form>

            </div >

          </div>
          <p style={{ float: "left", width: 720, height: 20 }}></p>
        </Popup >
      </div >
      <div style={{ width: 720, margin: 'auto', marginTop: 32, float: "left", marginLeft: 50 }}>
        <h1 style={{ float: "left", fontWeight: "bold", fontSize: 30 }}>Nft Detail</h1>
      </div >
      <div style={{ width: 720, margin: 'auto', marginTop: 32, paddingBottom: 32, float: "left", marginLeft: 50 }} className="ant-list ant-list-split ant-list-bordered">
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
                    {/* {canClaim} */}
                  </Button>
                  <br></br>
                  <br></br>
                  {canClaim ?
                    <Button style={{ float: "right" }}
                      onClick={() => {
                        if (!ethersContext.account || !tx) return;
                        console.log("onClaimGift===================", id);
                        onClaimGift(id);
                      }}>
                      Claim Gift
                    </Button>
                    : ""}
                </div>
              </List.Item>
            );
          }}
        />
      </div>
    </>
  );
};
