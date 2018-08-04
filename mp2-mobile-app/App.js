import React from 'react';
import {ScrollView,StyleSheet,TouchableOpacity,Text,View} from 'react-native';
import sha256 from 'crypto-js/sha256'

export default class App extends React.Component {
  constructor() {
    super();
    this.httpDevice = new HTTPDevice();
    this.state = {
      component: "MusicSelectPage",
      path: ["music","Evolve"],
      items: [],
      nextComponent: "MusicSelectPage"
    }
  }
  render() {
    if ( this.state.component == "NavigationPage" ) {
      return (
        <ScrollView>
          <NavigationPage
            path={this.state.path}
            items={this.state.items}
            nextComponent={this.state.nextComponent}
            setParam={this._setParam.bind(this)}
            httpDevice={this.httpDevice}
          />
        </ScrollView>
      );
    } else if ( this.state.component == "MusicSelectPage" ) {
      return (
        <ScrollView>
          <MusicSelectPage
            path={this.state.path}
            items={this.state.items}
            nextComponent={this.state.nextComponent}
            setParam={this._setParam.bind(this)}
            httpDevice={this.httpDevice}
          />
        </ScrollView>
      );
    }
  }
  _setParam(param,value) {
    var obj = {};
    obj[param] = value;
    this.setState(obj);
  }
}

class Title extends React.Component {
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

class Button extends React.Component {
  render() {
    return (
      <TouchableOpacity onPress={this.props.onPress} style={styles.fullWidth}>
        <Text style={this.props.style}>{this.props.text}</Text>
      </TouchableOpacity>
    );
  }
}

class NavigationPage extends React.Component {
  constructor() {
    super();
  }
  componentWillMount() {
    this.props.httpDevice.transmit(`LIST /${this.props.path.join("/")}`,output => {
      this.props.setParam("items",output);
    });
  }
  render() {
    var path = this.props.path.join("/");
    path = path.charAt(0).toUpperCase() + path.slice(1);
    return (
      <View>
        <Title text={path} />
        {
          this.props.items.map((item,index) => (
            <Button
              text={item}
              onPress={_ => this._moveForward(item)} style={styles.blueText}
              key={sha256(item).toString()}
            />
          ))
        }
        <Text>{"\n"}</Text>
      </View>
    );
  }
  _moveForward(item) {
    this.props.httpDevice.transmit(`TYPE /${this.props.path.join("/")}`,output => {
      if ( output == "directory" ) {
        this.props.path.push(item);
        this.props.httpDevice.transmit(`LIST /${this.props.path.join("/")}`,output => {
          this.props.setParam("items",output);
          this.props.setParam("path",this.props.path);
        });
      } else {
        this.props.setParam("component",this.props.nextComponent);
      }
    });
  }
}

class MusicSelectPage extends React.Component {
  constructor() {
    super();
  }
  componentWillMount() {
    this.setState({
      selected: []
    });
    this.props.httpDevice.transmit(`LIST /${this.props.path.join("/")}`,output => {
      this.props.setParam("items",output);
    });
  }
  render() {
    var path = this.props.path.join("/");
    path = path.charAt(0).toUpperCase() + path.slice(1);
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
          text={this._getState().charAt(0).toUpperCase() + this._getState().slice(1) + " All"}
          onPress={_ => this._toggleAll()}
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
}

class HTTPDevice { // mock device ONLY
  transmit(message,callback) {
    console.log(message);
    message = message.split(" ");
    if ( message[0] == "LIST" ) callback(["foldera","folderb","folderc","folderd"]);
    else if ( message[0] == "TYPE" ) {
      callback("file");
    }
  }
}

var styles = StyleSheet.create({
  bigText: {
    fontSize: 50,
    textAlign: "center",
    paddingTop: "6%",
    paddingBottom: 0
  },
  normalText: {
    fontSize: 25
  },
  blueText: {
    fontSize: 25,
    color: "blue"
  },
  greenText: {
    fontSize: 25,
    color: "green"
  },
  titleText: {
    fontSize: 25,
    textAlign: "center",
  },
  normalButton: {
    fontSize: 25,
    textAlign: "left",
    color: "black"
  },
  hr: {
    borderBottomColor: "black",
    borderBottomWidth: 1,
    paddingBottom: "1%"
  },
  fullWidth: {
    width: "100%"
  }
});
