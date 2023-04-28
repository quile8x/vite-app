import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'antd';

export interface IMainPageMenuProps {
  route: string;
  setRoute: React.Dispatch<React.SetStateAction<string>>;
}

export const MainPageMenu: FC<IMainPageMenuProps> = (props) => (
  <Menu
    style={{
      textAlign: 'center',
    }}
    selectedKeys={[props.route]}
    mode="horizontal">
    {/* <Menu.Item key="/">
      <Link
        onClick={() => {
          props.setRoute('/');
        }}
        to="/">
        YourCollectible
      </Link>
    </Menu.Item>
    <Menu.Item key="/gift-nft">
      <Link
        onClick={() => {
          props.setRoute('/gift-nft');
        }}
        to="/">
        GiftNft
      </Link>
    </Menu.Item> */}

  </Menu>
);
