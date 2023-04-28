import React, { FC } from 'react';
import { Row, Col, Button } from 'antd';
import { Ramp, ThemeSwitcher } from '~~/app/common';
import { Faucet, GasGauge } from 'eth-components/ant';
import { NETWORKS } from '~~/models/constants/networks';
import { IScaffoldAppProviders } from '~~/app/routes/main/hooks/useScaffoldAppProviders';
import { getNetworkInfo } from '~~/helpers/getNetworkInfo';
import { useEthersContext } from 'eth-hooks/context';
import { getFaucetAvailable } from '~~/app/common/FaucetHintButton';

export interface IMainPageFooterProps {
  scaffoldAppProviders: IScaffoldAppProviders;
  price: number;
}

/**
 * 🗺 Footer: Extra UI like gas price, eth price, faucet, and support:
 * @param props
 * @returns
 */
export const MainPageFooter: FC<IMainPageFooterProps> = (props) => {
  const ethersContext = useEthersContext();
  return (
    <>
    </>
  );
};
