import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { FC, useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useRouteMatch,
  useParams
} from "react-router-dom";


import { YourCollectible } from '../../../generated/contract-types';
import { useAppContracts } from '../../../app/routes/main/hooks/useAppContracts';
import { useContractLoader, useContractReader } from 'eth-hooks';
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
import ReactLoading from 'react-loading';
//import LoadingOverlay from 'react-loading-overlay';
import LoadingOverlay from 'react-loading-overlay-ts';

import '../../../styles/css/my-popup.css'

//import "../../ styles/css/my-popup.css";
import axios from 'axios';

import contractAddress from "../../../generated/contracts/contract-address.json";
import CMArtifact from '../../../generated/contracts/CM.json'
//import CMArtifact from "~~/generated/contracts/CM.json";

export interface IYourCollectibleProps {
  mainnetProvider: StaticJsonRpcProvider;
  blockExplorer: string;
  tx?: TTransactor;
}

const projectId = "2GajDLTC6y04qsYsoDRq9nGmWwK";
const projectSecret = "48c62c6b3f82d2ecfa2cbe4c90f97037";;
const projectIdAndSecret = `${projectId}:${projectSecret}`;
// const contractName = "YourCollectible_2";
// const contractNameTemp = "Contract One";


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


const listConlections = [
  {
    name: 'First Collection',
    address: '0xA59cDed9962f6dfaB3200b4bA3a8fe1887F6Be48',
  },
  {
    name: 'Second Collection',
    address: '0x00F6Ec132910c36f331D303987043316cf280862',
  },
  {
    name: 'Third Collection',
    address: '0x82D96e6C5aE33B430F100384A5C328194361Abe2',
  }
];

export const Nfts: FC<IYourCollectibleProps> = (props: IYourCollectibleProps) => {
  
  const { addressContract } = useParams();


  let contractName = "YourCollectible_2";
  let contractNameTemp = "Contract One";


  const checkTypeContract = async () => {
    listConlections.forEach((transaction, index) => {
      collectibleUpdate.push({ ...transaction });
      if(transaction.address == addressContract) {
        //contractName = `YourCollectible_${index}`;
        contractNameTemp = transaction.name;
      }

    })
  };

 
  const ethersContext = useEthersContext();
  const collectibleUpdate = [];
  const [giftObject, setGiftObject] = useState(undefined);
  const [claimedTokenID, setClaimedTokenID] = useState(undefined)
  let claimedTokenIDTemp = 0;
  const  URL_API = import.meta.env.VITE_REACT_APP_URL_API;

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

  // function closeModal() {
  //   setIsOpen(false);
  // }
  //

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




  // const buyTokens = async () => {
  //   try {
  //     setNetworkError(undefined);
  //     setTransactionError(undefined);
  //     const tx = await cm.mintTokens({
  //       value: ethers.utils.parseEther((0.0005 * tokensToBuy).toString()),
  //     });
  //     setTxBeingSent(tx.hash);

  //     const receipt = await tx.wait();

  //     if (receipt.status === 0) {
  //       throw new Error("Transaction failed");
  //     }

  //     fetchTokenBalance();
  //   } catch (err) {
  //     if (err.code !== ERROR_CODE_TX_REJECTED_BY_USER) {
  //       console.error(err);
  //       setTransactionError(err);
  //     }
  //   } finally {
  //     setTxBeingSent(undefined);
  //   }
  // };

  // const buyCoffee = async () => {
  //   try {
  //     setNetworkError(undefined);
  //     setTransactionError(undefined);
  //     const tx = await cm.purchaseCoffee(coffeeToBuy);
  //     setTxBeingSent(tx.hash);

  //     const receipt = await tx.wait();

  //     if (receipt.status === 0) {
  //       throw new Error("Transaction failed");
  //     }

  //     fetchTokenBalance();
  //   } catch (err) {
  //     if (err.code !== ERROR_CODE_TX_REJECTED_BY_USER) {
  //       console.error(err);
  //       setTransactionError(err);
  //     }
  //   } finally {
  //     setTxBeingSent(undefined);
  //   }
  // };

  // const transferTokens = async () => {
  //   try {
  //     setNetworkError(undefined);
  //     setTransactionError(undefined);
  //     console.log(giftAddress, giftTokens);
  //     const tx = await cm.transferTokens(giftAddress, giftTokens);

  //     const receipt = await tx.wait();

  //     if (receipt.status === 0) {
  //       throw new Error("Transaction failed");
  //     }

  //     fetchTokenBalance();
  //   } catch (err) {
  //     if (err.code !== ERROR_CODE_TX_REJECTED_BY_USER) {
  //       console.error(err);
  //       setTransactionError(err);
  //     }
  //   } finally {
  //     setTxBeingSent(undefined);
  //   }
  // };

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
    axios.get(`${URL_API}/wallet-contract/${ethersContext.account}`)
      .then(res => {
        const transactions = res.data;
        console.log("transactionsX=======================", transactions);
        const uniqueArray = transactions.filter((value, index) => {
          return index === transactions.findIndex(obj => {
            console.log("obj=====", obj.contractName);
            return obj.contractAddress === value.contractAddress;
          });
        });

        console.log("transactionsX=======================xx", uniqueArray);
        uniqueArray.forEach((transaction, index) => {
          if (transaction.contractName != contractName) {
            loadNTFTs(transaction.contractName);
            console.log("contract Name =========", transaction.contractName);
          }
        });

        if (uniqueArray.length > 0) {
      
   
        }

      })
      .catch(error => console.log(error));
  }


  const loadNTFTs = async (contractName) => {
    let balance = await cm.balanceOf(ethersContext.account);
    const yourBalance = balance.toNumber() ?? 0;
    for (let tokenIndex = 0; tokenIndex < yourBalance; tokenIndex++) {
      try {
        console.log('Getting token index', tokenIndex);
        const tokenId = await cm.tokenOfOwnerByIndex(ethersContext.account, tokenIndex);
        console.log('tokenId', tokenId);
        const tokenURI = await cm.tokenURI(tokenId);
        console.log('tokenURI=============', tokenURI);
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
    }
    setYourCollectibles(collectibleUpdate);
  }


  const loadGiftNft = async (uniqueArray) => {

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
            setGiftObject(tx)
            //giftObject = tx;
            console.log("tx =============", tx);
            console.log("giftObject =============", giftObject);
            setOpen(true);
            console.log("tx ============= taolao", giftObject);
          }
          // if (tx.contractName) {
          //   uniqueArray.forEach((transaction, index) => {
          //     if (tx.tokenID && transaction.contractName == tx.contractName && isReceived == false) {
          //       console.log("transaction.contractName, transaction.tokenID =============", transaction.contractName, tx.tokenID);
          //       isReceived = true;
          //       setGiftObject(tx)
          //       //giftObject = tx;
          //       console.log("tx =============", tx);
          //       console.log("giftObject =============", giftObject);
          //       setOpen(true);
          //     }
          //   });
          // }
        });
      })
      .catch(error => console.log(error));
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
            setGiftObject(tx)
            //giftObject = tx;
            console.log("tx =============", tx);
            console.log("giftObject =============", giftObject);
            setOpen(true);
            console.log("tx ============= taolao", giftObject);
          }
          // if (tx.contractName) {
          //   uniqueArray.forEach((transaction, index) => {
          //     if (tx.tokenID && transaction.contractName == tx.contractName && isReceived == false) {
          //       console.log("transaction.contractName, transaction.tokenID =============", transaction.contractName, tx.tokenID);
          //       isReceived = true;
          //       setGiftObject(tx)
          //       //giftObject = tx;
          //       console.log("tx =============", tx);
          //       console.log("giftObject =============", giftObject);
          //       setOpen(true);
          //     }
          //   });
          // }
        });
      })
      .catch(error => console.log(error));
  }


  const { mainnetProvider, blockExplorer, tx } = props;

  const [yourCollectibles, setYourCollectibles] = useState<any>([]);
  const [minting, setMinting] = useState<boolean>(false);
  const [transferToAddresses, setTransferToAddresses] = useState<{ [key: string]: string }>({});

  const [open, setOpen] = useState(false);
  const closeModal = () => setOpen(false);

  useEffect(() => {

    //loadTransaction();
    const updateYourCollectibles = async () => {
      if (!cm) {
        return;
      }
      let balance = await cm.balanceOf(ethersContext.account);
      console.log('balance============', balance);
      if (!balance) return;
      var flagTokenURL = true;
      const yourBalance = balance.toNumber();
      console.log('yourBalance============', yourBalance);


      for (let tokenIndex = 0; tokenIndex < yourBalance; tokenIndex++) {
        try {
          console.log('Getting token index ========', tokenIndex);
          const tokenId = await cm.tokenOfOwnerByIndex(ethersContext.account, tokenIndex);
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
      }
      setYourCollectibles(collectibleUpdate);

      if (collectibleUpdate.length > 0) {
        let isClaim = await checkCanClaimGift('');
        console.log("isClaim==========================",isClaim);
        console.log("canClaim==========================",canClaim);
        if (isClaim != canClaim) {
          setCanClaim(isClaim);
        }
        

      }

    };
    updateYourCollectibles();
  }, [ethersContext.account, balance, cm, isRefesh]);

  // check can claim gift from tokenID
  const checkCanClaimGift = async (tokenID) => {
    // axios.get(`http://192.168.1.25:3002/gift/byContractAddress/${cm.address}`)

    console.log("ethersContext.account====================",ethersContext.account);

   const rep = await axios.get(`${URL_API}/gift-request/checkCanClaimGift/${ethersContext.account}/${cm.address}`);//.then(res => {
    //   console.log("checkCanClaimGift==============================", res);
    // });

    return rep.data;

 


  }
  //





  const onSubmitHandler = async (event: React.FormEvent<HTMLFormElement>) => {

    event.preventDefault();
    //setIsActive(true);
    setIsOpen(true);
    //setRequestSent(true);
    fetch().then(() => setRequestSent(false));
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

    // const form = {
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

    await tx(cm.mintItem(ethersContext.account, uploaded.path), (update) => {

      console.log("mintItem===========",update);

      cm.provider.getTransactionReceipt(update.hash).then(function (data) {
        let logs = data.logs;
        console.log("getTransactionReceipt===========",logs);
        if (logs[0].topics[3]) {
          let tokenIndex = parseInt(logs[0].topics[3], 16);
          console.log("tokenIndex===========",tokenIndex);
          // console.log('tokenIndex======xxxx======', tokenIndex);

          // cm.totalSupply().then(function (data) {
          // console.log('totalSupply======xxxx======', data.toNumber());
          //});
          let newTokenIndex = tokenIndex - 1;
          cm.tokenByIndex(newTokenIndex).then(function (tokenID) {
            console.log("tokenID===========",tokenID);
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
    });
  };


const callAPIPostTransationMint = async(tokenID, hash, tokenIndex) => {

  const form = {
    walletAddress: ethersContext.account,
    contractAddress: cm.address,
    contractName: contractName,
    tokenID: tokenID.toNumber(),
    tokenHash: hash,
    tokenIndex: tokenIndex,
    isOwner: true
  };

  console.log("callAPIPostTransationMint========================",form);

  const { data } = await axios.post(`${URL_API}/wallet-contract`, form);

}

  const onGiftRequestSubmitHandler = async (event: React.FormEvent<HTMLFormElement>) => {

    event.preventDefault();
    console.log("claimedTokenID ======================",claimedTokenIDTemp)
    const form = {
      name: event.target.elements.name.value,
      phone: event.target.elements.phone.value,
      contractName: contractNameTemp,
      contractAddress: cm.address,
      walletAddress:  ethersContext.account,
      email: event.target.elements.email.value,
      giftName: giftObject?.title ?? "",
      giftID: giftObject?._id ?? "",
      tokenID: claimedTokenID
    };
    setOpen(false);
    //setIsActive(true);
    await axios.post(`${URL_API}/gift-request`, form)
      .then(function (response) {
        console.log("response=======",response);
        //setIsActive(false)
        alert("Submit succcessfully!");
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


  const onClaimGift = async (id) => {
    console.log("claimedTokenID ======================",id);
    setClaimedTokenID(id);
   // claimedTokenIDTemp = id;
    //claimedTokenID = id;
    console.log("claimedTokenID ======================",claimedTokenIDTemp)
    //setOpen(true);

    // axios.get(`http://192.168.1.25:3002/gift/byContractAddress/${cm.address}`)

    //   .then(res => {
    //     const transactions = res.data;
    //     console.log("giftNfts===================", transactions);
    //     let isReceived = false;
    //     transactions.forEach((tx, index) => {
    //       console.log("tx ============= taolao", isReceived);
    //       if (isReceived == false) {
    //         console.log("transaction.contractName, transaction.tokenID =============", tx.tokenID);
    //         isReceived = true;
    //         setGiftObject(tx)
    //         //giftObject = tx;
    //         console.log("tx =============", tx);
    //         console.log("giftObject =============", giftObject);
    //         setOpen(true);
    //         console.log("tx ============= taolao", giftObject);
    //       }
    //       // if (tx.contractName) {
    //       //   uniqueArray.forEach((transaction, index) => {
    //       //     if (tx.tokenID && transaction.contractName == tx.contractName && isReceived == false) {
    //       //       console.log("transaction.contractName, transaction.tokenID =============", transaction.contractName, tx.tokenID);
    //       //       isReceived = true;
    //       //       setGiftObject(tx)
    //       //       //giftObject = tx;
    //       //       console.log("tx =============", tx);
    //       //       console.log("giftObject =============", giftObject);
    //       //       setOpen(true);
    //       //     }
    //       //   });
    //       // }
    //     });
    //   })
    //   .catch(error => console.log(error));
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
              <h1 style={{ float: "left", fontWeight: "bold", fontSize: 15, margin: 8 }}>Gift Name: {giftObject?.title ?? ""}</h1>
              <h3 style={{ float: "left", margin: 8 }}>Contract: {giftObject?.contractName ?? ""} - {giftObject?.contractAddress ?? ""}</h3>
              <hr style={{ float: "left", width: 420 }}></hr>
              <h1 style={{ float: "left", fontWeight: "bold", margin: 8 }}>Fill info to receive gift</h1>
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
            <span style={{ marginRight: 50, float: "right", width: 100 }}><button type="submit" class="ant-input ant-input-lg"> Mint</button></span>
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

                  <Link to={"/nft-detail/"+addressContract+"/"+id}>Redirect To Detail</Link>
                </div>
              </List.Item>
            );
          }}
        />
      </div>
    </>
  );
};
