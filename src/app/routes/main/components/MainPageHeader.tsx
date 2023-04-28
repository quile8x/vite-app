import { Account } from 'eth-components/ant';
import { getNetwork } from '@ethersproject/networks';
import { Alert, PageHeader } from 'antd';
import React, { FC, ReactElement } from 'react';
import { FaucetHintButton } from '~~/app/common/FaucetHintButton';
import { IScaffoldAppProviders } from '~~/app/routes/main/hooks/useScaffoldAppProviders';
import { useEthersContext } from 'eth-hooks/context';
import { useGasPrice } from 'eth-hooks';
import { getNetworkInfo } from '~~/helpers';

// displays a page header
export interface IMainPageHeaderProps {
  scaffoldAppProviders: IScaffoldAppProviders;
  price: number;
}

/**
 * ✏ Header: Edit the header and change the title to your project name.  Your account is on the right *
 * @param props
 * @returns
 */
export const MainPageHeader: FC<IMainPageHeaderProps> = (props) => {
  const ethersContext = useEthersContext();
  const selectedChainId = ethersContext.chainId;

  // 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation
  const gasPrice = useGasPrice(ethersContext.chainId, 'fast', getNetworkInfo(ethersContext.chainId));

  /**
   * 👨‍💼 Your account is in the top right with a wallet at connect options
   */
  const right = (
    <div style={{ position: 'fixed', textAlign: 'right', right: 0, top: 0, padding: 10 }}>
      <Account
        createLoginConnector={props.scaffoldAppProviders.createLoginConnector}
        ensProvider={props.scaffoldAppProviders.mainnetProvider}
        price={props.price}
        blockExplorer={props.scaffoldAppProviders.targetNetwork.blockExplorer}
        hasContextConnect={true}
      />
      <FaucetHintButton scaffoldAppProviders={props.scaffoldAppProviders} gasPrice={gasPrice} />
      {props.children}
    </div>
  );

  return (
    <>
      {right}
    </>
  );
};
