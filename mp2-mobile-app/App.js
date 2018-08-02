import React from 'react';
import {ScrollView,StyleSheet,TouchableOpacity,Text,View} from 'react-native';
import sha256 from 'crypto-js/sha256'

export default class App extends React.Component {
  constructor() {
    super();
    this.httpDevice = new HTTPDevice();
    this.state = {
      path: [],
      items: [],
      mode: 0
    }
  }
  render() {
    return (
      <ScrollView>
        <MusicPage
          path={this.state.path}
          mode={this.state.mode}
          items={this.state.items}
          updateParam={this._updateParam.bind(this)}
          setParam={this._setParam.bind(this)}
        />
      </ScrollView>
    );
  }
  _updateParam(message,param) {
    this.httpDevice.transmit(message,output => {
      var obj = {}
      obj[param] = output;
      this.setState(obj);
    });
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

class MusicPage extends React.Component {
  constructor() {
    super();
  }
  componentWillMount() {
    this.props.updateParam("GET /music","items");
    this.props.setParam("firstLoad",false);
  }
  render() {
    return (
      <View>
        <Title text={"Music" + (this.props.path.length > 0 ? "/" : "") + this.props.path.join("/")} />
        {
          this.props.items.map((item,index) => (
            <Button text={item} onPress={_ => console.log(sha256(item).toString())} style={styles.blueText} key={sha256(item).toString()} />
          ))
        }
        <Text>{"\n"}</Text>
      </View>
    );
  }
}

class HTTPDevice { // mock device ONLY
  transmit(message,callback) {
    callback(["foldera","folderb","folderc"]);
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
