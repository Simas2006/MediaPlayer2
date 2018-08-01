import React from 'react';
import {ScrollView,StyleSheet,TouchableOpacity,Text,View} from 'react-native';

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
        <MusicListPage
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
      <TouchableOpacity onPress={this.props.onPress}>
        <Text style={this.props.style}>{this.props.text}</Text>
      </TouchableOpacity>
    );
  }
}

class MusicListPage extends React.Component {
  constructor() {
    super();
  }
  render() {
    return (
      <View>
        <Title text={"Music" + (this.props.path.length > 0 ? "/" : "") + this.props.path.join("/")} />
        <Text style={styles.normalText}>{this.props.mode == 1 ? "DA" : "nyet"}</Text>
        <Button onPress={_ => this._setPath()} text={this.props.items.join(",") || "expand"} style={styles.redText} />
        <Text>{"\n"}</Text>
      </View>
    );
  }
  _setPath() {
    this.props.updateParam("GET","items");
    this.props.setParam("path",["EVOLVE"]);
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
  redText: {
    fontSize: 25,
    color: "red"
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
  }
});
