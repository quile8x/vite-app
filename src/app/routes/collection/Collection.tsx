import React from "react";
import { useEffect, useState } from 'react';
import { create } from 'ipfs-http-client';
import { Button, Card, List, } from 'antd';
import axios from 'axios';
import Modal from 'react-modal';

import 'reactjs-popup/dist/index.css';
import "~~/styles/css/my-popup.css";

import 'reactjs-popup/dist/index.css';
import "~~/styles/css/my-popup.css";

import '~~/styles/main-page.css';
import '~~/styles/themes/light-theme.less'
import { Link } from "react-router-dom";

const projectId = "2GajDLTC6y04qsYsoDRq9nGmWwK";
const projectSecret = "48c62c6b3f82d2ecfa2cbe4c90f97037";;
const projectIdAndSecret = `${projectId}:${projectSecret}`;

const optionsNames = ['First Collection', 'Second Collection', 'Third Collection'];
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


export function Collection() {
  const URL_API = import.meta.env.VITE_REACT_APP_URL_API;
  const collectibleUpdate = [];
  const [yourCollectibles, setYourCollectibles] = useState<any>([]);
  const [isRefesh, setIsRefesh] = useState(false);

  const loadTransaction = async () => {
    // axios.get(`${URL_API}/gift`)
    //   .then(res => {
    //     indexList = 0;
    //     const transactions = res.data;
    //     transactions.forEach((transaction, index) => {
    //       console.log("transaction====================", transaction);
    //       collectibleUpdate.push({ ...transaction });
    //     });
    //     setYourCollectibles(collectibleUpdate);
    //   })
    //   .catch(error => console.log(error));
    listConlections.forEach((transaction, index) => {
      collectibleUpdate.push({ ...transaction });
    })
    setYourCollectibles(collectibleUpdate);
    setIsRefesh(true);

  };

  useEffect(() => {
    if (!isRefesh) {
      loadTransaction();
    }

  }, [isRefesh]);

  return (

    <div className="App">

      <div style={{ width: 720, margin: 'auto', marginTop: 32, float: "left", marginLeft: 50 }}>
        <h1 style={{ float: "left", fontWeight: "bold", fontSize: 30 }}>List of Collection</h1>
      </div >


      <div style={{ width: 720, margin: 'auto', marginTop: 32, paddingBottom: 32, float: "left", marginLeft: 50 }}>
        <h1 style={{ float: "left", fontWeight: "bold", fontSize: 20, margin: 8 }}></h1>
        <br></br>
        <br></br>
        <br></br>

        <List
          bordered
          dataSource={yourCollectibles}
          renderItem={(item: any, index) => {
            var id = index + 1;
            return (
              <List.Item key={id + '_'}>
                <Card
                  style={{ width: 720 }}
                >

                  <div style={{ float: "left", margin: 8 }}> <span style={{ fontWeight: "bold" }}># {item.name}</span></div>
                  <br></br>
                  <br></br>
                  <div style={{ float: "left", margin: 8 }}> <span style={{ fontWeight: "bold" }}>Address: </span>{item.address}</div>
                  <p>
                    <br></br>
                    <br></br>
                    <Link to={"/nfts/" + item.address}>Redirect To Detail</Link>
                  </p>
                </Card>

                <br></br>
                <br></br>

              </List.Item>
            );
          }}
        />
      </div>
    </div>
  );
};

export default Collection;