import React, { useState, useEffect } from "react";
import "./Home.css";
import { Layout, Space, Button, AutoComplete, Modal, Row, Col } from "antd";
import WalletModal from "../Shared/Modal/Modal";
import { Banana } from "@rize-labs/banana-wallet-sdk/dist/BananaProvider";
import { Chains } from "@rize-labs/banana-wallet-sdk/dist/Constants";
import Loader from "../Shared/Loader/Loader";
import toast, { Toaster } from "react-hot-toast";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { FaRegCopy } from "react-icons/fa";
import { ethers } from "ethers";
import StakingArtifact from "../abi/Staking.json";
import BananaToken from "../abi/BananaToken.json"
import Axios from "axios";

const { Header, Footer, Sider, Content } = Layout;

const headerStyle = {
  textAlign: "center",
  color: "#fff",
  height: 64,
  paddingInline: 50,
  lineHeight: "64px",
  backgroundColor: "#f3f3f3",
  color: "#000000",
  fontSize: "18px",
};

const contentStyle = {
  textAlign: "center",
  minHeight: 865,
  lineHeight: "35px",
  color: "#fff",
  backgroundColor: "#F5C14B",
};

const footerStyle = {
  textAlign: "center",
  color: "#fff",
  backgroundColor: "#f3f3f3",
  color: "#000000",
};

const Home = () => {
  const [isShowWalletModal, setIsShowWalletModal] = useState(false);
  const [isWalletDeployed, setIsWalletDeployed] = useState(false);
  const [bananaWalletInstance, setBananaWalletInstance] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [loadingMessage, setLoadingMessage] = useState('');
  const stakeAddress = "0x1CA35dB18E7f594864b703107FeaE4a24974FCb5";
  const PRIVATE_KEY_EXPOSED = '6923720ab043d19f5975644c6312f0de7ffbe7bc446c871abde2c078eaeae53f'
  const PUBLIC_KEY_EXPOSED = '0x0565B4C5c5B01682B99006C48382269938773560'
  const bananaAddress = '0xbd48a789C4Dd746ce572Dc5fDfE20F8Fc638cf06';

  const prefundWallet = async (receiver) => {
    try {
      const fundTxn = {
        from: PUBLIC_KEY_EXPOSED,
        to: receiver,
        value: ethers.utils.parseEther("0.1"),
        gasLimit: 210000
      }
      toast.success('Wait we are prefunding your wallet');
      setLoadingMessage("Funding you wallet...");
      setIsLoading(true);
      const wallet = new ethers.Wallet(PRIVATE_KEY_EXPOSED, new ethers.providers.JsonRpcProvider('https://polygon-mumbai.g.alchemy.com/v2/pKQ3vzeRnBEpcTHkPS0da9Z1_EQawyd5'));
      const txn = await wallet.sendTransaction(fundTxn);
      await txn.wait()
      console.log(txn);
      toast.success('Prefunded wallet with 0.01 eth');
      setIsLoading(false);
    } catch (err) {
      toast.success('Something crashed');
      console.log(err);
    }
  }

  useEffect(() => {
    const bananaInstance = new Banana(
      Chains.mumbai,
      "https://polygon-mumbai.g.alchemy.com/v2/pKQ3vzeRnBEpcTHkPS0da9Z1_EQawyd5"
    );
    setBananaWalletInstance(bananaInstance);
  }, []);

  const buttonStyle = {
    textAlign: "center",
    minHeight: 100,
    height: "100%",
    minWidth: 100,
    width: "20%",
    paddingTop: "21%",
    color: "#fff",
    backgroundColor: "#F5C14B",
    display: isWalletDeployed ? "none" : "normal",
    marginLeft: "42%",
  };

  const initWallet = async () => {
    const walletName = bananaWalletInstance.getWalletName();
    console.log("Wallet Name: ", walletName);
    if (walletName) {
      setLoadingMessage("Connecting your wallet...");
      setIsLoading(true);
      const address = await bananaWalletInstance.connectWallet(walletName);
      console.log("SCW: ", address);
      setWalletAddress(address.address);
      setIsWalletDeployed(true);
      setIsLoading(false);
      toast.success("Successfully Connected Wallet!");
      return;
    }
    setIsShowWalletModal(true);
  };

  const createWallet = async (walletName) => {
    setLoadingMessage("Creating your wallet...");
    setIsLoading(true);
    const address = await bananaWalletInstance.createWallet(walletName);
    console.log("SCW: ", address);
    setWalletAddress(address.address);
    setIsShowWalletModal(false);
    setIsLoading(false);
    setIsWalletDeployed(true);
    toast.success("Successfully Created Wallet!");
    prefundWallet(address.address);
  };

  const setModalStatus = (status) => {
    setIsShowWalletModal(status);
  };

  const stakeAfterAuth = async () => {
    setLoadingMessage("Minting Banana NFT...");
    setIsLoading(true);
    const metaDataUri = {
        "name": "Banana Wallet Token",
        "image": "https://bafybeibo77zyzq5c5joyrer75j6pwbc2ux5yfll27r5ssclkgfj2f4ngi4.ipfs.w3s.link/banana-dozen.jpeg",
        "description": "Represents you had successfully made transactions using Banana Wallet"
    }
    let aaProvider = await bananaWalletInstance.getBananaProvider();
    console.log("AA Provider", aaProvider);
    let aaSigner = aaProvider.getSigner();
    let bananContract = new ethers.Contract(
        bananaAddress,
        BananaToken.abi,
        aaSigner
    );
    let dataUri = await Axios({
        method: "post",
        url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        data: JSON.stringify(metaDataUri),
        headers: {
            'pinata_api_key': '5dbd25d2575c28d30c75',
            'pinata_secret_api_key': '31e6245d30d45e928d0bdc05fec2b83914663311976825e465d1a57fa1af5c7c',
            "Content-Type": "Application/json"
        },
    });
    dataUri = 'https://gateway.pinata.cloud/ipfs/' + dataUri.data.IpfsHash;
    console.log(" This is data Uri: ", dataUri);
    const mintingCallData = bananContract.interface.encodeFunctionData(
        "safeMint",
        [walletAddress]
    );
    // let StakingContract = new ethers.Contract(
    //   stakeAddress,
    //   StakingArtifact.abi,
    //   aaSigner
    // );
    // const stakingCallData = StakingContract.interface.encodeFunctionData(
    //   "stake",
    //   []
    // );
    const txn = await bananaWalletInstance.execute(
      mintingCallData,
      bananaAddress,
      "0"
    );
    toast.success("Successfully Minted NFT to your wallet address !!");
    setIsLoading(false);
  };

  return (
    <div className="container">
      <Space direction="vertical" style={{ width: "100%" }}>
        <Layout>
          <Header style={headerStyle}>Welcome to Banana Wallet SDK! 🚀</Header>
          <Toaster />
          <Loader isLoading={isLoading} message={loadingMessage}>
            <Content style={contentStyle}>
              {isWalletDeployed && (
                <button className="wallet-address-btn">
                  SCW: {walletAddress}
                  <CopyToClipboard
                    text={walletAddress}
                    onCopy={() => toast.success("Address copied")}
                  >
                    <FaRegCopy style={{ marginLeft: "10px" }} />
                  </CopyToClipboard>
                </button>
              )}
              {isWalletDeployed && (
                <div className="staking">
                  <div className="staking-instructions">
                    <h1 className="staking-instructions-heading">
                      Hurry! Get your Banana collectible NFT!
                    </h1>
                    <img className="nft-image" src="images/banana-dozen.jpeg" alt="Banana NFT"/>
                  </div>
                  <div className="staking-inputs">
                    <p className="staking-input-disc">*We have prefunded your wallet to make txn</p>
                    {/* <input
                      placeholder="Enter amount to stake"
                      className="stake-input-field"
                      value={"0.0001"}
                      type="number"
                      readOnly
                    />
                    <br /> */}
                    <button className="stake-btn" onClick={() => stakeAfterAuth()} >Mint Banana NFT</button>
                  </div>
                </div>
              )}

              <Content style={buttonStyle}>
                {!isWalletDeployed && (
                  <>
                    <button className="wallet-btn" onClick={() => initWallet()}>
                      🍌 Get Started
                    </button>

                    <WalletModal
                      isModalOpen={isShowWalletModal}
                      setModalStatus={(status) => setModalStatus(status)}
                      createWallet={(walletName) => createWallet(walletName)}
                    />
                  </>
                )}
              </Content>
            </Content>
            <Footer style={footerStyle}>Made with ❤️ by rizelabs</Footer>
          </Loader>
        </Layout>
      </Space>
    </div>
  );
};

export default Home;
// myWalletDeployer : 0xF248E2ba728Dc6f8143bDC37226A2792e7c4bbc7
// Elliptic : 0x5051B73E8E24a740863f61B6ff1FfB23d26e7A87
// staking : 0x6863F12EA6A16b9ACBd7210ee2CA5C369A9629a0
// entryPoint : 0xb124f5DB610f2aBC9b3A1b4297f9037b6D84A29A