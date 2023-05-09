
import React from "react";
import { useEffect, useState } from 'react';
import { create } from 'ipfs-http-client';
import { Button, Card, List, } from 'antd';
import axios from 'axios';
import Modal from 'react-modal';
import { Buffer } from 'buffer';

import 'reactjs-popup/dist/index.css';
import "~~/styles/css/my-popup.css";

import 'reactjs-popup/dist/index.css';
import "~~/styles/css/my-popup.css";

import '~~/styles/main-page.css';
import '~~/styles/themes/light-theme.less'

const projectId = "2GajDLTC6y04qsYsoDRq9nGmWwK";
const projectSecret = "48c62c6b3f82d2ecfa2cbe4c90f97037";;
const projectIdAndSecret = `${projectId}:${projectSecret}`;

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


export function Brand() {
const  URL_API = import.meta.env.VITE_REACT_APP_URL_API;
const collectibleUpdate = [];
const [isRefesh, setIsRefesh] = useState(false);

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

  const [yourCollectibles, setYourCollectibles] = useState<any>([]);
  var indexList = 0;
  const [isLoad, setIsLoad] = useState(false);

  const loadTransaction = async () => {
    axios.get(`${URL_API}/brand`)
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

    // const file = event.target.elements.file.files[0];
    // const imageSource = await ipfs.add(file);
    // const urlImage = `https://infura-ipfs.io/ipfs/${imageSource.path}`;
    const indexContract = event.target.elements.contract.value;
    const form = {
      name: event.target.elements.name.value,
      walletAddress: event.target.elements.walletAddress.value,
      contractName: listConlections[indexContract].name,
      contractAddress: listConlections[indexContract].address,
    };

    setIsOpen(true);
    await axios.post(`${URL_API}/brand`, form)
      .then(function (response) {
        setIsOpen(false);
        setIsRefesh(!isRefesh);
        alert("Submit succcessfully!");
      })
      .catch(function (error) {
        console.log(error);
      });

  };

  return (

        <div className="App">

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
        <h1 style={{ float: "left", fontWeight: "bold", fontSize: 30 }}>List of Brand</h1>
      </div >

      <div style={{ width: 720, margin: 'auto', marginTop: 32, paddingBottom: 32, float: "left", marginLeft: 50 }} className="ant-list ant-list-split ant-list-bordered">
        <br></br>

        <h1 style={{ float: "left", fontWeight: "bold", fontSize: 20, margin: 8 }}>Create Brand</h1>
        <br></br>
        <br></br>

        <form onSubmit={onSubmitHandler}>
          <div style={{ margin: 8 }}>
            <span style={{ margin: 8, float: "left" }}> Name: </span>
            <input name="name" type="text" className="ant-input ant-input-lg" />
          </div>
          <div style={{ margin: 8 }}>
            <span style={{ margin: 8, float: "left" }}> Wallet Address: </span>
            <input name="walletAddress" type="text" className="ant-input ant-input-lg" />
          </div>

          <div style={{ margin: 8 }}>
            <span style={{ margin: 8, float: "left" }}> Contract: </span>
            <select className="ant-input ant-input-lg" name="contract">
              <option>Please contract</option>
              {listConlections.map((option, index) => {
                return <option key={option.address} value={index}>
                  {option.name}
                </option>
              })}
            </select>
          </div>

          <br></br>
          <div>
            <span style={{ marginRight: 50, float: "right", width: 100 }}><button type="submit" className="ant-input ant-input-lg"> Create</button></span>
          </div>
        </form>
      </div >

      <div style={{ width: 720, margin: 'auto', marginTop: 32, paddingBottom: 32, float: "left", marginLeft: 50 }}>
        <h1 style={{ float: "left", fontWeight: "bold", fontSize: 20, margin: 8 }}>List of Brand</h1>
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
                      <span style={{ fontWeight: "bold" }}>#{id}</span> {item.name}
                    </div>
                  }>
                  <div>
                    <img src={imgSrc} style={{ maxWidth: 100 }} />
                  </div>
                  <br></br>
                  <div style={{ float: "left", margin: 8 }}> <span style={{ fontWeight: "bold" }}>Wallet Address: </span>{item.walletAddress}</div>
                  <br></br>
                  <br></br>
                  <div style={{ float: "left", margin: 8, textAlign: "left" }}> <span style={{ fontWeight: "bold" }}>Contract Name: </span> {item.contractName}</div>
                  <br></br>
                  <br></br>
                  <div style={{ float: "left", margin: 8, textAlign: "left" }}> <span style={{ fontWeight: "bold" }}>Contract Adress: </span> {item.contractAddress}</div>
                </Card>
              </List.Item>
            );
          }}
        />
      </div>
      </div>
  );
};

export default Brand;