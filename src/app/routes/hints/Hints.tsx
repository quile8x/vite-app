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
//import { text } from 'stream/consumers';

import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

import "~~/styles/css/my-popup.css";
import axios from 'axios';

export interface IYourCollectibleProps {
  mainnetProvider: StaticJsonRpcProvider;
  blockExplorer: string;
  tx?: TTransactor;
}

const projectId = "2GajDLTC6y04qsYsoDRq9nGmWwK";
const projectSecret = "48c62c6b3f82d2ecfa2cbe4c90f97037";;
const projectIdAndSecret = `${projectId}:${projectSecret}`;
const contractName = "YourCollectible";

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

export const YourCollectibles: FC<IYourCollectibleProps> = (props: IYourCollectibleProps) => {
  const  URL_API = import.meta.env.VITE_REACT_APP_URL_API;
  const ethersContext = useEthersContext();
  const appContractConfig = useAppContracts();
  const readContracts = useContractLoader(appContractConfig);
  const writeContracts = useContractLoader(appContractConfig, ethersContext?.signer);
  const collectibleUpdate = [];

  const loadTransaction = async () => {

    axios.get(`http://192.168.1.25:3002/wallet-contract/${ethersContext.account}`)
      .then(res => {
        const transactions = res.data;

        const uniqueArray = transactions.filter((value, index) => {
          const _value = JSON.stringify(value);
          return index === transactions.findIndex(obj => {
            console.log("obj=====", obj.contractName);
            return obj.contractName === value.contractName;
          });
        });

        console.log("transactionsX=======================", uniqueArray);
        uniqueArray.forEach((transaction, index) => {
          if (transaction.contractName != contractName) {
            loadNTFTs(transaction.contractName);
            console.log("contract Name =========", transaction.contractName);
          }
        });

      })
      .catch(error => console.log(error));
  }


  const loadNTFTs = async (contractName) => {
    let YourCollectibleRead = readContracts[contractName] as YourCollectible;
    let balance = await YourCollectibleRead.balanceOf(ethersContext.account);
    const yourBalance = balance.toNumber() ?? 0;

    for (let tokenIndex = 0; tokenIndex < yourBalance; tokenIndex++) {
      try {
        console.log('Getting token index', tokenIndex);
        const tokenId = await YourCollectibleRead.tokenOfOwnerByIndex(ethersContext.account ?? '', tokenIndex);
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
  }


  const { mainnetProvider, blockExplorer, tx } = props;

  const YourCollectibleRead = readContracts[contractName] as YourCollectible;
  const YourCollectibleWrite = writeContracts[contractName] as YourCollectible;
  const balance = useContractReader<BigNumber[]>(YourCollectibleRead, {
    contractName: contractName,
    functionName: 'balanceOf',
    functionArgs: [ethersContext.account],
  });

  //
  // 🧠 This effect will update yourCollectibles by polling when your balance changes
  //
  const [yourCollectibles, setYourCollectibles] = useState<any>([]);
  const [minting, setMinting] = useState<boolean>(false);
  const [transferToAddresses, setTransferToAddresses] = useState<{ [key: string]: string }>({});

  const [open, setOpen] = useState(false);
  const closeModal = () => setOpen(false);
  const [count, setCount] = useState(0);
  const [canClaim, setCanClaim] = useState(true);


  useEffect(() => {
    loadTransaction();

    const updateYourCollectibles = async () => {

      if (!balance) return;
      var flagTokenURL = true;
      const yourBalance = balance[0]?.toNumber() ?? 0;
      for (let tokenIndex = 0; tokenIndex < yourBalance; tokenIndex++) {
        try {
          console.log('Getting token index', tokenIndex);
          const tokenId = await YourCollectibleRead.tokenOfOwnerByIndex(ethersContext.account ?? '', tokenIndex);
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

      if (collectibleUpdate.length == 0 && ethersContext.account) {
        console.log("collectibleUpdate.length ============", collectibleUpdate.length);
        setCount((count) => count + 1);
        checkConditionClaim();
      } else {
        setCanClaim(false);
        setCount((count) => count + 1);
      };

    };
    updateYourCollectibles();
  }, [ethersContext.account, balance]);


  const checkConditionClaim = async () => {
    if (canClaim == true) {
      console.log('canClaim ==== 1111 ====', canClaim);
      setOpen(true);
      setCanClaim(false);
    }
  }

  setTimeout(() => {
    console.log('canClaim ==== final ====', canClaim);
  }, 5000);

  const [mintCount, setMintCount] = useState<number>(0);
  const mintItem = async () => {
    if (!tx || !ethersContext.account) return;

    // upload to ipfs
    // 0x288ccfaf1a234910e7a744732c8f255a033492dd
    // 0x288ccfaf1a234910e7a744732c8f255a033492dd

    const uploaded = await ipfs.add(JSON.stringify(mintJson[mintCount]));
    setMintCount(mintCount + 1);
    console.log('Uploaded Hash: ', uploaded);
    await tx(YourCollectibleWrite.mintItem(ethersContext.account, uploaded.path), (update) => {
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

  const [images, setImages] = React.useState<{ cid: CID; path: string }[]>([]);

  const onSubmitHandler = async (event: React.FormEvent<HTMLFormElement>) => {

    event.preventDefault();

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

    const form = {
      walletAddress: ethersContext.account,
      contractAddress: YourCollectibleRead.address,
      contractName: contractName,
    };


    const { data } = await axios.post(`${URL_API}/wallet-contract`, form);

    console.log("image", dataImage);
    // upload to ipfs
    const uploaded = await ipfs.add(JSON.stringify(dataImage));
    //const uploaded = await ipfs.add(file)
    // setMintCount(mintCount + 1);
    console.log('Uploaded Hash:', uploaded);
    console.log("YourCollectibleWrite=========", YourCollectibleWrite);
    await tx(YourCollectibleWrite.mintItem(ethersContext.account, uploaded.path), (update) => {
      //await tx(YourCollectibleWrite.mintItem('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', uploaded.path), (update) => {
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

  const claimGift = async () => {
    if (!tx || !ethersContext.account) return;
    tx(YourCollectibleWrite.claim("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", "0x288ccFAF1A234910e7A744732c8f255a033492DD", 1));
    //tx(YourCollectibleWrite.transferFrom(ethersContext.account, "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", 1));
    // tx(YourCollectibleWrite.transferFrom("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", "0x288ccFAF1A234910e7A744732c8f255a033492DD", 1));
    setOpen(false);
  };

  return (

    <>
      <div style={{ width: 200 }}>
        <Popup open={open} closeOnDocumentClick onClose={closeModal} className="popup-content" >
          <div className="modal" >
            <a className="close" onClick={closeModal} style={{ float: "right" }}>
              &times;
            </a>
            <br></br>
            <Button style={{ float: "center" }}
              disabled={minting || mintCount >= mintJson.length - 1}
              shape="round"
              size="large"
              onClick={async () => {
                await claimGift();
              }} >
              Claim a gift!
            </Button>
          </div>
        </Popup >
      </div >

      <div style={{ width: 640, margin: 'auto', marginTop: 32, paddingBottom: 32 }}>
        {/* <Button
          disabled={minting || mintCount >= mintJson.length - 1}
          shape="round"
          size="large"
          onClick={async () => {
            setMinting(true);
            await mintItem();
            setMinting(false);
          }}>
          MINT NFT
        </Button> */}

        <h1>Mint NTF</h1>
        <form onSubmit={onSubmitHandler}>
          <div style={{ fontSize: 16, marginLeft: 8 }}>
            <span style={{ fontSize: 16, marginLeft: 8, float: "left" }}> Title: </span>
            <input name="title" type="text" class="ant-input ant-input-lg" />
          </div>
          <div style={{ fontSize: 16, marginLeft: 8 }}>
            <span style={{ fontSize: 16, marginLeft: 8, float: "left" }}> Description: </span>
            <input name="description" type="text" class="ant-input ant-input-lg" />
          </div>
          <div style={{ fontSize: 16, marginLeft: 8 }}>
            <span style={{ fontSize: 16, marginLeft: 8, float: "left" }}> File:  </span>
            <input name="file" type="file" class="ant-input ant-input-lg" />
          </div>
          <br></br>
          <div>
            <span style={{ fontSize: 16, marginLeft: 8 }}><button type="submit" class="ant-input ant-input-lg"> MINT</button></span>
          </div>
        </form >
      </div >


      <div style={{ width: 640, margin: 'auto', marginTop: 32, paddingBottom: 32 }}>
        <hr />
        <br></br>
        <h1>List NFTs</h1>

        <br></br>
        <List

          bordered
          dataSource={yourCollectibles}
          renderItem={(item: any) => {

            const id = item.id.toNumber();
            const imgSrc = item.image;
            console.log("item===========", item);
            console.log("id=============", id);
            return (
              <List.Item key={id + '_' + item.uri + '_' + item.owner}>
                <Card
                  title={
                    <div>
                      <span style={{ fontSize: 16, marginRight: 8 }}>#{id}</span> {item.name}
                    </div>
                  }>
                  <div>
                    <img src={imgSrc} style={{ maxWidth: 150 }} />
                  </div>
                  <div>{item.description}</div>
                </Card>

                <div>
                  owner:{' '}
                  <Address
                    address={item.owner}
                    ensProvider={mainnetProvider}
                    blockExplorer={blockExplorer}
                    fontSize={16}
                  />
                  <AddressInput
                    ensProvider={mainnetProvider}
                    placeholder="transfer to address"
                    address={transferToAddresses[id]}
                    onChange={(newValue) => {
                      setTransferToAddresses({ ...transferToAddresses, ...{ [id]: newValue } });
                    }}
                  />
                  <Button
                    onClick={() => {

                      if (!ethersContext.account || !tx) return;
                      tx(YourCollectibleWrite.transferFrom(ethersContext.account, transferToAddresses[id], id));
                    }}>
                    Transfer
                  </Button>
                </div>
              </List.Item>
            );
          }}
        />
      </div>
    </>
  );
};
