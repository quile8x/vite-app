import { FC, useEffect, useState } from 'react';
import { Button, Card, List, } from 'antd';
import axios from 'axios';

import 'reactjs-popup/dist/index.css';
import "~~/styles/css/my-popup.css";

import '~~/styles/main-page.css';
import '~~/styles/themes/light-theme.less'

export function RequestGift () {

  const  URL_API = import.meta.env.VITE_REACT_APP_URL_API;
  const collectibleUpdate = [];
  const [yourCollectibles, setYourCollectibles] = useState<any>([]);
  const [isLoad, setIsLoad] = useState(false)
  const loadTransaction = async () => {
    axios.get(`${URL_API}/gift-request`)
      .then(res => {
        const transactions = res.data;
        console.log("============", transactions);
        transactions.forEach((transaction, index) => {
          collectibleUpdate.push({ ...transaction });
        });
        setYourCollectibles(collectibleUpdate);
        setIsLoad(true);
      })
      .catch(error => console.log(error));
  }

  useEffect(() => {
    if(!isLoad) {
      loadTransaction();
    }
   
  },[isLoad]);
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
                </Card>
              </List.Item>
            );
          }}
        />
      </div>
    </>
  );
};

export default RequestGift;