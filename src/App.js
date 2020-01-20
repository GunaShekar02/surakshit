import React, { Component } from "react";

import "./App.css";
import bell from "./assets/images/bell.png";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      buffer: null,
      contract: null,
      recordHash: "",
      account: ""
    };
  }

  captureFile = event => {
    event.preventDefault();
    console.log("file captured");
    const file = event.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) });
      console.log("buffer", this.state.buffer);
    };
  };

  render() {
    return (
      <div>
        <nav>
          <div>SURAKSHIT</div>
          <div>
            <img src={bell} height="40px" width="40px" alt="bell" />
            <div className="notification-circle">
              <p className="notification-number">1</p>
            </div>
          </div>
        </nav>
        <div className="container">
          <div className="control-panel">CONTROL PANEL</div>
          <div className="form-container">
            <div>
              Upload Report
              <form>
                <label>
                  Place of Crime
                  <input type="text" placeholder="Enter Place of Crime" />
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
          <div className="report-container">
            <div className="report-card">
              <div>Document : </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
