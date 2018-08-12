import React from 'react';
import {StyleSheet,TouchableOpacity,Text,TextInput,View} from 'react-native';
import sha256 from 'crypto-js/sha256'
import styles from './stylesheet'

export class Title extends React.Component {
  render() {
    return (
      <View>
        <Text style={styles.bigText}>MediaPlayer2</Text>
        <Text style={styles.titleText}>{this.props.text}</Text>
        <View style={styles.hr} />
      </View>
    );
  }
}

export class Button extends React.Component {
  render() {
    return (
      <TouchableOpacity onPress={this.props.onPress} style={this.props.specialWidth || styles.fullWidth}>
        <Text style={this.props.style} numberOfLines={1}>{this.props.text}</Text>
      </TouchableOpacity>
    );
  }
}

export class NavigationPage extends React.Component {
  constructor() {
    super();
  }
  componentWillMount() {
    this.props.httpDevice.transmit(["LIST",`/${this.props.path.join("/")}`],output => {
      this.props.setParam("items",output);
    });
  }
  render() {
    var path = capitalizeFirstLetter(this.props.path.join("/"));
    return (
      <View>
        <Title text={path} />
        {
          this.props.items.map((item,index) => (
            <Button
              text={item}
              onPress={_ => this._moveForward(item)}
              style={styles.blueText}
              key={sha256(item).toString()}
            />
          ))
        }
        <Text>{"\n"}</Text>
        <Button
          text="Back"
          onPress={_ => this._moveBack()}
          style={styles.normalText}
        />
      </View>
    );
  }
  _moveForward(item) {
    this.props.path.push(item);
    this.props.httpDevice.transmit(["TYPE",`/${this.props.path.join("/")}`],output => {
      if ( output == "directory" ) {
        this.props.httpDevice.transmit(["LIST",`/${this.props.path.join("/")}`],output => {
          this.props.setParam("items",output);
          this.props.setParam("path",this.props.path);
        });
      } else {
        this.props.setParam("component",this.props.nextComponent);
      }
    });
  }
  _moveBack() {
    var path = this.props.path.slice(0,-1);
    if ( path.length > 0 ) {
      this.props.httpDevice.transmit(["LIST",`/${path.join("/")}`],output => {
        this.props.setParam("items",output);
        this.props.setParam("path",path);
      });
    } else {
      this.props.setParam("component","MainPage");
    }
  }
}

export class MusicSelectPage extends React.Component {
  constructor() {
    super();
    this.state = {
      selected: []
    }
    this.hasAddedToQueue = false;
  }
  componentWillMount() {
    this.props.httpDevice.transmit(["LIST",`/${this.props.path.join("/")}`],output => {
      this.props.setParam("items",output);
    });
  }
  render() {
    var path = capitalizeFirstLetter(this.props.path.join("/"));
    return (
      <View>
        <Title text={path} />
        {
          this.props.items.map((item,index) => (
            <Button
              text={item}
              onPress={_ => this._toggleItem(index)}
              style={this.state.selected.indexOf(index) > -1 ? styles.greenText : styles.blueText}
              key={sha256(item).toString()}
            />
          ))
        }
        <View style={styles.hr} />
        <Button
          text={capitalizeFirstLetter(this._getState()) + " All"}
          onPress={_ => this._toggleAll()}
          style={styles.normalText}
        />
        <Button
          text="Add To Queue"
          onPress={_ => this._addToQueue()}
          style={styles.normalText}
        />
        <Button
          text="Back"
          onPress={_ => this._moveBack()}
          style={styles.normalText}
        />
      </View>
    );
  }
  _toggleItem(index) {
    if ( this.state.selected.indexOf(index) > -1 ) {
      this.setState({
        selected: this.state.selected.filter(item => item != index)
      });
    } else {
      this.setState({
        selected: this.state.selected.concat([index])
      });
    }
  }
  _toggleAll() {
    if ( this._getState() == "select" ) {
      this.setState({
        selected: "x".repeat(this.props.items.length).split("").map((item,index) => index)
      });
    } else {
      this.setState({
        selected: []
      });
    }
  }
  _getState() {
    for ( var i = 0; i < this.props.items.length; i++ ) {
      if ( this.state.selected.indexOf(i) <= -1 ) return "select";
    }
    return "deselect";
  }
  _addToQueue() {
    if ( this.hasAddedToQueue ) return;
    this.hasAddedToQueue = true;
    this.props.httpDevice.transmit(["ADDTQ",`/${this.props.path.join("/")}`].concat(this.state.selected.sort((a,b) => a - b).map(item => this.props.items[item])),output => {
      this.props.setParam("component","MainPage");
    });
  }
  _moveBack() {
    this.props.setParam("path",this.props.path.slice(0,-1));
    this.props.setParam("component","NavigationPage");
  }
}

export class PhotoSelectPage extends React.Component {
  constructor() {
    super();
    this.state = {
      picName: null,
      warnMode: 0
    }
  }
  componentWillMount() {
    this.props.httpDevice.transmit(["OPENP",`/${this.props.path.join("/")}`],output => {
      this.setState({
        picName: output
      });
    });
  }
  render() {
    var path = capitalizeFirstLetter(this.props.path.join("/"));
    return (
      <View>
        <Title text={path} />
        <View>
          <Text>{"\n"}</Text>
          <Button
            text={"\u25c0"}
            onPress={_ => this._movePicture("left")}
            style={styles.largeText}
          />
          <Text style={styles.largeText}>{this.state.picName}</Text>
          <Button
            text={"\u25b6"}
            onPress={_ => this._movePicture("right")}
            style={styles.largeText}
          />
          <Text style={styles.smallWarning}>{`\n${["First Picture","","Last Picture"][this.state.warnMode + 1]}\n`}</Text>
          <Button
            text="Back"
            onPress={_ => this._moveBack()}
            style={styles.titleText}
          />
        </View>
      </View>
    );
  }
  _movePicture(direction) {
    if ( direction == "left" ) {
      this.props.httpDevice.transmit(["PREVP"],output => {
        var warnMode = 0;
        if ( output.endsWith("_first") ) {
          output = output.slice(0,-6);
          warnMode = -1;
        }
        this.setState({
          picName: output,
          warnMode: warnMode
        });
      });
    } else {
      this.props.httpDevice.transmit(["NEXTP"],output => {
        var warnMode = 0;
        if ( output.endsWith("_last") ) {
          output = output.slice(0,-5);
          warnMode = 1;
        }
        this.setState({
          picName: output,
          warnMode: warnMode
        });
      });
    }
  }
  _moveBack() {
    this.props.httpDevice.transmit(["HOME"],output => {
      this.props.setParam("path",this.props.path.slice(0,-1));
      this.props.setParam("component","NavigationPage");
    });
  }
}

export class WebPage extends React.Component {
  constructor() {
    super();
    this.state = {
      url: ""
    }
  }
  render() {
    return (
      <View>
        <Title text="Web" />
        <Text>{"\n"}</Text>
        <View style={styles.centerItems}>
          <TextInput
            keyboardType="url"
            autoCorrect={false}
            placeholder="Enter a URL..."
            onChangeText={text => this.setState({url: text})}
            style={styles.inputBox}
          />
          <View style={styles.buttonPanel}>
            <Button
              text="Go"
              onPress={_ => this.props.httpDevice.transmit(["WOPN",this.state.url],Function.prototype)}
              style={styles.blueCenterText}
              specialWidth={styles.halfButton}
            />
            <Button
              text="Back"
              onPress={_ => this._moveBack()}
              style={styles.blueCenterText}
              specialWidth={styles.halfButton}
            />
          </View>
        </View>
      </View>
    );
  }
  _moveBack() {
    this.props.httpDevice.transmit(["HOME"],output => {
      this.props.setParam("component","MainPage");
    });
  }
}

export class QueuePage extends React.Component {
  constructor() {
    super();
    this.state = {
      playing: null,
      queue: []
    }
  }
  componentWillMount() {
    this.props.httpDevice.transmit(["GETQ"],output => {
      this.setState({
        playing: output[0] == "playing",
        queue: output.slice(1)
      });
    });
  }
  render() {
    return (
      <View>
        <Text style={styles.bigText}>MediaPlayer2</Text>
        <Text style={styles.titleText}>Now Playing: {this.state.queue[0] || "Nothing!"}</Text>
        <View style={styles.buttonPanel}>
          <Button
            text={"\u23ea"}
            onPress={_ => this.props.httpDevice.transmit(["RWIND"],Function.prototype)}
            style={styles.titleText}
            specialWidth={styles.thirdButton}
          />
          <Button
            text={this.state.playing ? "||" : "\u25b6"}
            onPress={_ => this._togglePlay()}
            style={styles.boldCenterText}
            specialWidth={styles.thirdButton}
          />
          <Button
            text={"\u23e9"}
            onPress={_ => this._mapCommandToQueue(["PNSNG"])}
            style={styles.titleText}
            specialWidth={styles.thirdButton}
          />
        </View>
        <View style={styles.buttonPanel}>
          <Button
            text={"\ud83d\udd00"}
            onPress={_ => this._mapCommandToQueue(["SHFLQ"])}
            style={styles.titleText}
            specialWidth={styles.thirdButton}
          />
          <Button
            text="X"
            onPress={_ => this._mapCommandToQueue(["CLRQ"])}
            style={styles.redCenterText}
            specialWidth={styles.thirdButton}
          />
          <Button
            text="Back"
            onPress={_ => this.props.setParam("component","MainPage")}
            style={styles.titleText}
            specialWidth={styles.thirdButton}
          />
        </View>
        <View style={styles.hr} />
        <View>
          {
            this.state.queue.slice(1).map((item,index) => {
              return (
                <View key={sha256(item + Math.random())}> // im sorry
                  <Text style={styles.normalText}>{item}</Text>
                  <View style={styles.buttonPanel}>
                    <Button
                      text={"\u2912"}
                      onPress={_ => this._mapCommandToQueue(["UPSQ",index + 1,"true"])}
                      style={styles.titleText}
                      specialWidth={styles.quarterButton}
                    />
                    <Button
                      text={"\u2191"}
                      onPress={_ => this._mapCommandToQueue(["UPSQ","index + 1","false"])}
                      style={styles.titleText}
                      specialWidth={styles.quarterButton}
                    />
                    <Button
                      text={"\u2193"}
                      onPress={_ => this._mapCommandToQueue(["DWNSQ",index + 1])}
                      style={styles.titleText}
                      specialWidth={styles.quarterButton}
                    />
                    <Button
                      text="X"
                      onPress={_ => this._mapCommandToQueue(["CLRQ"])}
                      style={styles.redCenterText}
                      specialWidth={styles.quarterButton}
                    />
                  </View>
                </View>
              );
            })
          }
        </View>
      </View>
    );
  }
  _togglePlay() {
    this.props.httpDevice.transmit(["PLYPS"],output => {
      this.setState({
        playing: ! this.state.playing
      });
    });
  }
  _mapCommandToQueue(command) {
    this.props.httpDevice.transmit(command,output => {
      this.setState({
        queue: output.slice(1)
      });
    });
  }
}

function capitalizeFirstLetter(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
