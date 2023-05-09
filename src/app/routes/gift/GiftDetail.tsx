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
import { Buffer } from 'buffer';

import React from "react";
//import { Route, Routes, useNavigate } from 'react-router-dom';
import { useHistory, useParams } from 'react-router-dom';


import 'reactjs-popup/dist/index.css';
import "~~/styles/css/my-popup.css";
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import Multiselect from 'multiselect-react-dropdown';

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

export const GiftDetail: FC<IYourCollectibleProps> = (props: IYourCollectibleProps) => {

  const ethersContext = useEthersContext();
  const collectibleUpdate = [];

  const [cm, setCm] = useState(undefined);
  const [selectedAddress, setSelectedAddress] = useState(undefined);
  const [balance, setBalance] = useState(undefined);


  const [isActive, setIsActive] = useState(false)
  const [loading, setLoading] = useState(false);
  const [isRefesh, setIsRefesh] = useState(false);
  const [selectedContractList, setSelectedContractList] = useState([]);

  const URL_API = import.meta.env.VITE_REACT_APP_URL_API;
  let history = useHistory()
  const { giftID } = useParams();
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
    //alert(isBrand);

    if (!isBrand) {


      confirmAlert({
        customUI: ({ onClose }) => {
          return (
            <div className='custom-ui'>
              <h1>Only Brand for this page!</h1>
              {/* <p>You want to delete this file?</p> */}
              {/* <button onClick={onClose}>No</button> */}
              <button style={{ border: '2px solid gray' }}
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
    console.log("res======================", res);
    if (res.data) {
      return true;
    } else {
      return false;
    }

  }

  let itemContractList = [];
  //var selectedContractList = [];

  const loadTransaction = async () => {
    axios.get(`${URL_API}/gift/${giftID}`)
      .then(res => {
        indexList = 0;
        const transactions = res.data;
        //transactions.forEach((transaction, index) => {
        console.log("transaction====================", transactions);
        collectibleUpdate.push({ ...transactions });
        transactions.contracts.forEach((transaction, index) => {
          itemContractList.push({ 'name': transaction.name, 'id': transaction.address });
        });
        setSelectedContractList(transactions.contracts);
        console.log("itemContractList====================", itemContractList);
        console.log("selectedContractList====================", selectedContractList);
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
    const indexContract = event.target.elements.contract.value;
    const form = {
      title: event.target.elements.title.value,
      des: event.target.elements.description.value,
      contractName: listConlections[indexContract].name,
      contractAddress: listConlections[indexContract].address,
      urlImage: urlImage,
      isClaim: false
    };


    setIsOpen(true);


    await axios.post(`${URL_API}/gift/${giftID}`, form)
      .then(function (response) {
        setIsOpen(false);
        setIsRefesh(!isRefesh);
        //alert("Submit succcessfully!");
      })
      .catch(function (error) {
        console.log(error);
      });

  };

 
  const updateContract = () => {
    //event.preventDefault();
    const contracts = [];

    

    console.log("selectedContractList =========================", selectedContractList);

    selectedContractList.forEach((transaction, index) => {
      console.log("transaction =========================", transaction);
      const address =  transaction.id ? transaction.id : transaction.address;
      contracts.push({ name: transaction.name, address: address })
    });

    const form = {
      contracts: contracts
    };

    console.log("form =========================", form);

    axios.put(`${URL_API}/gift/${giftID}`, form)
      .then(function (response) {
        setIsOpen(false);
        setIsRefesh(!isRefesh);
        alert("Save succcessfully!");
      })
      .catch(function (error) {
        console.log(error);
      });
  }


  const onSelect = (selectedList, selectedItem) => {
    console.log("========", selectedList);
    setSelectedContractList(selectedList);
  };

  const onRemove = (selectedList, removedItem) => {
    console.log("========", selectedList);
    setSelectedContractList(selectedList);
  };

  const options = [];
  listConlections.forEach((transaction, index) => {
    const option = {
      name: transaction.name,
      id: transaction.address
    }
    options.push({ ...option });
  });
  const state = {
    options: options
  };

  console.log("state ====================",state.options);
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



      <div style={{ width: 720, margin: 'auto', marginTop: 32, paddingBottom: 32, float: "left", marginLeft: 50 }}>
        <h1 style={{ float: "left", fontWeight: "bold", fontSize: 20, margin: 8 }}>Gift Detail</h1>
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

                  <div style={{ float: "left", margin: 8, textAlign: "left" }}>
                    <span style={{ fontWeight: "bold" }}>Contract: </span>
                    <Multiselect
                      options={state.options} // Options to display in the dropdown
                      selectedValues={item.contracts} // Preselected value to persist in dropdown
                      onSelect={onSelect} // Function will trigger on select event
                      onRemove={onRemove} // Function will trigger on remove event
                      displayValue="name" // Property name to display in the dropdown options
                    />
                  </div>
                  <br></br>
                  <br></br>
                  <Button

                    onClick={async () => {
                      updateContract();
                    }}>
                    Save
                  </Button>

                </Card>
              </List.Item>
            );
          }}
        />
      </div>

    </>
  );
};
