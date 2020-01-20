import React, { Component } from "react";
import Web3 from "web3";
import ReactMapGL, { Marker } from "react-map-gl";

import "./App.css";
import bell from "./assets/images/bell.png";
import marker from "./assets/images/marker.png";

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
      danger: false,
      showMarker: false,
      viewport: {
        latitude: 26.2183,
        longitude: 78.1828,
        width: "43vw",
        height: "40vh",
        zoom: 14
      }
    };
  }

  async componentWillMount() {
    // fetch("http://127.0.0.1:8000/Traffic/default/call/json/final", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Access-Control-Allow-Origin": "*"
    //   }
    // })
    //   .then(response => response.json())
    //   .then(response => {
    //     if (response < 5) this.setState({ danger: true });
    //     this.setState({ danger: true });
    //   })
    //   .catch(err => console.log(err));
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });
    console.log(accounts);
    const abi = [
      {
        inputs: [
          {
            internalType: "string",
            name: "_area",
            type: "string"
          }
        ],
        name: "get",
        outputs: [
          {
            internalType: "string[]",
            name: "",
            type: "string[]"
          }
        ],
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [
          {
            internalType: "string",
            name: "_recordHash",
            type: "string"
          },
          {
            internalType: "string",
            name: "_area",
            type: "string"
          }
        ],
        name: "set",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        inputs: [],
        stateMutability: "nonpayable",
        type: "constructor"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            internalType: "string",
            name: "recordHash",
            type: "string"
          }
        ],
        name: "RecordAdded",
        type: "event"
      }
    ];
    const address = "0xc5b72212b675708df83ce438e4c35dde668f1c4b";
    const contract = new web3.eth.Contract(abi, address);
    this.setState({ contract });
    console.log(this.state.contract);
    const records = await contract.methods.get("morena").call();
    console.log(records);
    this.setState({
      records
    });
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
        if (this.state.place === "Morena")
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
    this.setState({ showMarker: true });
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
          <div className="map-parent">
            <div className="report-container">{recordCards}</div>
            <div className="map-container">
              <div>
                <ReactMapGL
                  {...this.state.viewport}
                  mapboxApiAccessToken="pk.eyJ1IjoiZ3VuYXNoZWthcjAyIiwiYSI6ImNrNW13b3RjajBzcnMzb3BjdnBsamxlN3QifQ.5oMM26gc-p2TAv93L2yuyA"
                  onViewportChange={viewport => {
                    this.setState({ viewport });
                  }}
                  mapStyle="mapbox://styles/gunashekar02/ck5mx3kc255nd1io9yea10mdo"
                >
                  {this.state.showMarker ? (
                    <Marker latitude={26.2183} longitude={78.1828}>
                      <div>
                        <p>MORENA</p>
                        <img
                          src={marker}
                          alt={"Marker"}
                          height="50px"
                          width="50px"
                        ></img>
                      </div>
                    </Marker>
                  ) : null}
                </ReactMapGL>
              </div>
            </div>
          </div>
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
