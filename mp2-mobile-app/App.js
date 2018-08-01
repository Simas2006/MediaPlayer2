import React from 'react';
import {StyleSheet,TouchableOpacity,Text,View} from 'react-native';

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      path: [],
      mode: 0
    }
  }
  render() {
    return (
      <MusicListPage path={this.state.path} mode={this.state.mode} update={this.updatePageState} />
    );
  }
  retrieveData(message,callback) {
    callback(message + "_sage");
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
    this.state = {}
  }
  render() {
    //this.props.retrieveData("havanese");
    return (
      <View>
        <Title text={"Music" + (this.props.path.length > 0 ? "/" : "") + this.props.path.join("/")} />
        <Text style={styles.normalText}>{this.props.mode == 1 ? "DA" : "nyet"}</Text>
        <Button onPress={_ => console.log("my button!")} text="my button" style={styles.redText} />
      </View>
    );
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
