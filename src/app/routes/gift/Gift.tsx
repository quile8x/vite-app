import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { FC, useEffect, useState } from 'react';
import { YourCollectible } from '~~/generated/contract-types';
import { useAppContracts } from '~~/app/routes/main/hooks/useAppContracts';
import { useContractLoader, useContractReader } from 'eth-hooks';
import { useEthersContext } from 'eth-hooks/context';
import { BigNumber, ethers } from 'ethers';
import { create } from 'ipfs-http-client';
import { Button, Card, List} from 'antd';
import { Address, AddressInput } from 'eth-components/ant';
import { TTransactor } from 'eth-components/functions';

import React from "react";
//import { Route, Routes, useNavigate } from 'react-router-dom';
import { useHistory } from 'react-router-dom';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useRouteMatch,
  useParams
} from "react-router-dom";


import 'reactjs-popup/dist/index.css';
import "~~/styles/css/my-popup.css";
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css

import axios from 'axios';

import Popup from 'reactjs-popup';
import Modal from 'react-modal';
import ReactLoading from 'react-loading';
import LoadingOverlay from 'react-loading-overlay-ts';



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

const listConlections = [
  {
    name: 'First Collection',
    address: '0xA59cDed9962f6dfaB3200b4bA3a8fe1887F6Be48',
  },
  {
    name: 'Second Collection',
    address: '0x7BF881893C2199886b32Cfd76eF393E3c47c5B1B',
  },
  {
    name: 'Third Collection',
    address: '0x82D96e6C5aE33B430F100384A5C328194361Abe2',
  }
];

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

export const Gift: FC<IYourCollectibleProps> = (props: IYourCollectibleProps) => {

  const ethersContext = useEthersContext();
  const collectibleUpdate = [];

  const [cm, setCm] = useState(undefined);
  const [selectedAddress, setSelectedAddress] = useState(undefined);
  const [balance, setBalance] = useState(undefined);


  const [isActive, setIsActive] = useState(false)
  const [loading, setLoading] = useState(false);
  const [isRefesh, setIsRefesh] = useState(false);

  const URL_API = import.meta.env.VITE_REACT_APP_URL_API;
  let history = useHistory()
  // const navigate = useNavigate();

  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      border: null
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

  function closeModal() {
    setIsOpen(false);
  }


  const connectWallet = async () => {

    //setNetworkError(undefined);
    //setTransactionError(undefined);

    const [selectedAddress] = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    if (!selectedAddress) {
      return
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    setSelectedAddress(selectedAddress);
    const isBrand = await checkBrandUser(selectedAddress);

    if (!isBrand) {
  

      confirmAlert({
        customUI: ({ onClose }) => {
          return (
            <div className='custom-ui'>
            <h1>Only Brand for this page!</h1>
              {/* <p>You want to delete this file?</p> */}
              {/* <button onClick={onClose}>No</button> */}
              <button style={{border: '2px solid gray'}} 
                onClick={() => {
                  onClose()
                  window.location.replace('/');                
                }}
              >
                Redirect to Home page
              </button>
            </div>
          );
        }
      });
     
      return;
    }

   

    const cm = new ethers.Contract(
      contractAddress.CM,
      CMArtifact.abi,
      provider.getSigner(0)
    );

    //cm.clearCachedProvider();

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


  const checkBrandUser = async (selectedAddress) => {


    const res = await axios.get(`${URL_API}/brand/byWalleteAddress/${selectedAddress}`);
    if (res.data) {
      return true;
    } else {
      return false
    }


    // //alert("==========kookkk", selectedAddress);
    // axios.get(`${URL_API}/brand/byWalleteAddress/${selectedAddress}`)
    //   .then(res => {
    //     // indexList = 0;
    //     // const transactions = res.data;
    //     // transactions.forEach((transaction, index) => {
    //     //   console.log("transaction====================", transaction);
    //     //   collectibleUpdate.push({ ...transaction });
    //     // });
    //     // setYourCollectibles(collectibleUpdate);
    //     //console.log("res======================", res);
    //     //alert("khong alert");
    //     if(res) {
    //       return true;
    //     } else {
    //       return false;
    //     }
    //   })
    //   .catch(error => {
    //    // alert(error);
    //     console.log(error);
    //     return false;
    //   });
  }

  const loadTransaction = async () => {
    axios.get(`${URL_API}/gift`)
      .then(res => {
        indexList = 0;
        const transactions = res.data;
        transactions.forEach((transaction, index) => {
          console.log("transaction====================", transaction);
          collectibleUpdate.push({ ...transaction });
        });
        setYourCollectibles(collectibleUpdate);
      })
      .catch(error => console.log(error));
  }

  useEffect(() => {
    if (!isLoad) {
      loadTransaction();
    }
  }, [isRefesh]);


  const onSubmitHandler = async (event: React.FormEvent<HTMLFormElement>) => {

    event.preventDefault();

    const file = event.target.elements.file.files[0];
    const imageSource = await ipfs.add(file);
    const urlImage = `https://infura-ipfs.io/ipfs/${imageSource.path}`;
    //const indexContract = event.target.elements.contract.value;
    const form = {
      title: event.target.elements.title.value,
      des: event.target.elements.description.value,
      urlImage: urlImage,
      isClaim: false
    };


    setIsOpen(true);


    await axios.post(`${URL_API}/gift`, form)
      .then(function (response) {
        setIsOpen(false);
        setIsRefesh(!isRefesh);
        //alert("Submit succcessfully!");
      })
      .catch(function (error) {
        console.log(error);
      });

  };

  return (

    <>

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


      <div style={{ width: 720, margin: 'auto', marginTop: 32, float: "left", marginLeft: 50 }}>
        <h1 style={{ float: "left", fontWeight: "bold", fontSize: 30 }}>List of Gift</h1>
      </div >

      <div style={{ width: 720, margin: 'auto', marginTop: 32, paddingBottom: 32, float: "left", marginLeft: 50 }} className="ant-list ant-list-split ant-list-bordered">
        <br></br>

        <h1 style={{ float: "left", fontWeight: "bold", fontSize: 20, margin: 8 }}>Create Gift</h1>
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
            {/* <span style={{ margin: 8, float: "left" }}> Contract: </span> */}
            {/* <select className="ant-input ant-input-lg" name="contract">
              <option>Please contract</option>
              {listConlections.map((option, index) => {
                return <option key={option.address} value={index}>
                  {option.name}
                </option>
              })}
            </select> */}
          </div>

          <div style={{ margin: 8 }}>
            <span style={{ margin: 8, float: "left" }}> File:  </span>
            <input name="file" type="file" className="ant-input ant-input-lg" />
          </div>
          <br></br>
          <div>
            <span style={{ marginRight: 50, float: "right", width: 100 }}><button type="submit" className="ant-input ant-input-lg"> Create</button></span>
          </div>
        </form>
      </div >

      <div style={{ width: 720, margin: 'auto', marginTop: 32, paddingBottom: 32, float: "left", marginLeft: 50 }}>
        <h1 style={{ float: "left", fontWeight: "bold", fontSize: 20, margin: 8 }}>List Gift NFTs</h1>
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
                      <span style={{ fontWeight: "bold" }}>#{id}</span> {item.title}
                    </div>
                  }>
                  <div>
                    <img src={imgSrc} style={{ maxWidth: 100 }} />
                  </div>
                  <br></br>
                  <div style={{ float: "left", margin: 8 }}> <span style={{ fontWeight: "bold" }}>Des: </span>{item.des}</div>
                  <br></br>
                  <br></br>
                  {/* <div style={{ float: "left", margin: 8, textAlign: "left" }}> <span style={{ fontWeight: "bold" }}>Contract Name: </span> {item.contractName}</div>
                  <br></br>
                  <br></br>
                  <div style={{ float: "left", margin: 8, textAlign: "left" }}> <span style={{ fontWeight: "bold" }}>Contract Adress: </span> {item.contractAddress}</div> */}

                  <br></br>
                  <br></br>
                  <Link to={"/gift-detail/"+item._id}>Redirect To Detail</Link>
                </Card>
              </List.Item>
            );
          }}
        />
      </div>

    </>
  );
};
