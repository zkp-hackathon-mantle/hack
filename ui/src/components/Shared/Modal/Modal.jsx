import React, { useState } from "react";
import "./Modal.css";
import { Modal, Button } from "antd";

const WalletModal = (props) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [walletName, setWalletName] = useState('');

  const handleOk = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOpen(false);
    }, 3000);
  };
  const handleCancel = () => {
    props.setModalStatus(false)
  };

  return (
    <div>
      <Modal
        open={props.isModalOpen}
        title="Provide Unqiue Wallet Name"
        onOk={handleOk}
        footer={false}
        onCancel={handleCancel}
        style={{ textAlign:'center' }}
      >
        <input className="wallet-identifier-input" placeholder="Wallet unique identifier" onChange={(e) => setWalletName(e.target.value)} /> <br />
        <button className="init-wallet-modal-btn" onClick={() => props.createWallet(walletName)} >Create Wallet</button>
      </Modal>
    </div>
  );
};

export default WalletModal;
