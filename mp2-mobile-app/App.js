import React from 'react';
import {ScrollView,StyleSheet,TouchableOpacity,Text,View} from 'react-native';
import sha256 from 'crypto-js/sha256'

export default class App extends React.Component {
  constructor() {
    super();
    this.httpDevice = new HTTPDevice();
    this.state = {
      component: "NavigationPage",
      path: ["music","evolve"],
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
      <TouchableOpacity onPress={this.props.onPress} style={styles.fullwidth}>
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
    this.props.httpDevice.transmit("LIST /music",output => {
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
            <Button text={item} onPress={_ => this._moveForward(item)} style={styles.blueText} key={sha256(item).toString()} />
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

  }
  render() {
    var path = this.props.path.join("/");
    path = path.charAt(0).toUpperCase() + path.slice(1);
    return (
      <View>
        <Title text={path} />
      </View>
    );
  }
}

class HTTPDevice { // mock device ONLY
  transmit(message,callback) {
    message = message.split(" ");
    if ( message[0] == "LIST" ) callback(["foldera","folderb","folderc"]);
    else if ( message[0] == "TYPE" ) {
      if ( message[1].split("/").length <= 5 ) callback("directory");
      else callback("file");
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
  fullwidth: {
    width: "100%"
  }
});
