import React, { Component } from "react";
import Web3 from "web3";

import "./App.css";
import Record from "./abis/Record.json";
import bell from "./assets/images/bell.png";

const ipfsClient = require("ipfs-http-client");
const ipfs = ipfsClient({
  host: "ipfs.infura.io",
  port: "5001",
  protocol: "https"
});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      buffer: null,
      contract: null,
      recordHash: "",
      account: "",
      records: [],
      place: "",
      danger: false
    };
  }

  async componentWillMount() {
    fetch("http://127.0.0.1:8000/Traffic/default/call/json/final", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    })
      .then(response => response.json())
      .then(response => {
        if (response < 5) this.setState({ danger: true });
        this.setState({ danger: true });
      })
      .catch(err => console.log(err));
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });
    const networkId = await web3.eth.net.getId();
    const networkData = Record.networks[networkId];
    if (networkData) {
      const abi = Record.abi;
      const address = networkData.address;
      const contract = new web3.eth.Contract(abi, address);
      this.setState({ contract });
      const records = await contract.methods.get("wardha").call();
      this.setState({
        records
      });
    } else {
      window.alert(
        "Smart contract not deployed to detected network, please change to a valid network"
      );
    }
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    }
    if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert("please use metamask");
    }
  }

  captureFile = event => {
    event.preventDefault();
    console.log("file captured");
    const file = event.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) });
    };
  };

  onSubmit = event => {
    event.preventDefault();
    console.log("submitting form");
    ipfs.add(this.state.buffer, async (error, result) => {
      console.log("ipfs result", result);
      const recordHash = result[0].hash;
      if (error) {
        console.log("error ipfs", error);
        return;
      }
      try {
        const receipt = await this.state.contract.methods
          .set(recordHash, this.state.place.toLowerCase())
          .send({ from: this.state.account });
        console.log("receipt", receipt);
        if (this.state.place === "Wardha")
          this.setState({
            records: [...this.state.records, recordHash]
          });
      } catch (err) {
        console.log(err);
      }
    });
  };

  openModal = () => {
    if (this.state.danger) {
      const modal = document.getElementById("modal");
      modal.style.display = "flex";
      modal.style.opacity = 1;
    }
  };

  closeModal = () => {
    const modal = document.getElementById("modal");
    modal.style.display = "none";
    modal.style.opacity = 0;
    this.setState({ danger: false });
  };

  render() {
    const recordCards = this.state.records.map((record, index) => (
      <div className="report-card" key={index}>
        <div>Case Code : {record}</div>
        <div>
          <a href={`https://ipfs.infura.io/ipfs/${record}`}>
            Click here to see the record
          </a>
        </div>
      </div>
    ));
    return (
      <div>
        <nav>
          <div>SURAKSHIT</div>
          <div onClick={this.openModal}>
            <img src={bell} height="40px" width="40px" alt="bell" id="bell" />
            {this.state.danger ? (
              <div className="notification-circle">
                <p className="notification-number">1</p>
              </div>
            ) : null}
          </div>
        </nav>
        <div className="container">
          <div className="control-panel">CONTROL PANEL</div>
          <div className="form-container">
            <div>
              Upload Report
              <form onSubmit={this.onSubmit}>
                <label>
                  Place of Crime
                  <input
                    type="text"
                    placeholder="Enter Place of Crime"
                    onChange={place =>
                      this.setState({ place: place.target.value })
                    }
                  />
                </label>
                <label>
                  Upload Record
                  <input
                    type="file"
                    placeholder="Upload File"
                    onChange={this.captureFile}
                  />
                </label>
                <button type="submit">Submit</button>
              </form>
            </div>
          </div>
          <div className="report-container">{recordCards}</div>
          <div id="modal">
            <h1>ALERT!</h1>
            <h2>Very less activity was detected at Sector 45, Morena.</h2>
            <button type="button" onClick={this.closeModal}>
              SURAKSHIT
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
