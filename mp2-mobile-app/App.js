import React from 'react';
import {Alert,Text,TextInput,ScrollView,View} from 'react-native';

import HTTPDevice from './httpDevice'
import {
  Title,Button,
  NavigationPage,
  MusicSelectPage,
  PhotoSelectPage,
  WebPage,
  QueuePage
} from './components'
import styles from './stylesheet'

export default class App extends React.Component {
  constructor() {
    super();
    this.httpDevice = new HTTPDevice();
    this.state = {
      component: "LoginPage",
      path: [],
      items: [],
      nextComponent: ""
    }
    setInterval(this._sendPing.bind(this),2500);
  }
  render() {
    if ( this.state.component == "MainPage" ) {
      return (
        <View>
          <MainPage
            path={this.state.path}
            items={this.state.items}
            nextComponent={this.state.nextComponent}
            setParam={this._setParam.bind(this)}
            httpDevice={this.httpDevice}
          />
        </View>
      );
    } else if ( this.state.component == "LoginPage" ) {
      return (
        <View>
          <LoginPage
            path={this.state.path}
            items={this.state.items}
            nextComponent={this.state.nextComponent}
            setParam={this._setParam.bind(this)}
            httpDevice={this.httpDevice}
          />
        </View>
      );
    } else if ( this.state.component == "NavigationPage" ) {
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
    } else if ( this.state.component == "PhotoSelectPage" ) {
      return (
        <View>
          <PhotoSelectPage
            path={this.state.path}
            items={this.state.items}
            nextComponent={this.state.nextComponent}
            setParam={this._setParam.bind(this)}
            httpDevice={this.httpDevice}
          />
        </View>
      );
    } else if ( this.state.component == "WebPage" ) {
      return (
        <View>
          <WebPage
            path={this.state.path}
            items={this.state.items}
            nextComponent={this.state.nextComponent}
            setParam={this._setParam.bind(this)}
            httpDevice={this.httpDevice}
          />
        </View>
      );
    } else if ( this.state.component == "QueuePage" ) {
      return (
        <ScrollView>
          <QueuePage
            path={this.state.path}
            items={this.state.items}
            nextComponent={this.state.nextComponent}
            setParam={this._setParam.bind(this)}
            httpDevice={this.httpDevice}
          />
        </ScrollView>
      )
    }
  }
  _setParam(param,value) {
    var obj = {};
    obj[param] = value;
    this.setState(obj);
  }
  _sendPing() {
    if ( this.httpDevice.authKey ) {
      this.httpDevice.transmit(["PING"],output => {
        if ( output == "error" ) {
          this.httpDevice.connectionID = null;
          this.httpDevice.address = null;
          this.httpDevice.authKey = null;
          Alert.alert(
            "MediaPlayer2",
            "This session has been forcibly disconnected. Try re-logging in to reconnect.",
            [
              {text: "OK",onPress: _ => this._setParam("component","LoginPage"),style: "cancel"}
            ]
          );
        }
      });
    }
  }
}

class MainPage extends React.Component {
  constructor() {
    super();
  }
  render() {
    return (
      <View>
        <Title text="Home" />
        <Text>{"\n"}</Text>
        <Button
          text="Music"
          onPress={_ => this._openPage("music","MusicSelectPage",true)}
          style={styles.blueText}
        />
        <Button
          text="Photos"
          onPress={_ => this._openPage("photos","PhotoSelectPage",true)}
          style={styles.blueText}
        />
        <Button
          text="Web"
          onPress={_ => this._openPage("web","WebPage",false)}
          style={styles.blueText}
        />
        <Button
          text="Queue"
          onPress={_ => this._openPage("queue","QueuePage",false)}
          style={styles.blueText}
        />
        <Text>{`\n\nCurrently connected with ID ${this.props.httpDevice.connectionID}`}</Text>
        <Button
          text="Disconnect"
          onPress={_ => this._disconnect()}
          style={styles.redSmallText}
        />
      </View>
    );
  }
  _openPage(page,componentName,navPage) {
    this.props.setParam("nextComponent",componentName);
    this.props.setParam("path",[page]);
    this.props.setParam("items",[]);
    this.props.setParam("component",navPage ? "NavigationPage" : componentName);
  }
  _disconnect() {
    Alert.alert(
      "MediaPlayer2",
      "Are you sure you want to disconnect?",
      [
        {text: "Cancel",onPress: Function.prototype,style: "cancel"},
        {text: "OK",onPress: _ => {
          this.props.httpDevice.disconnect(_ => {
            this.props.setParam("component","LoginPage");
          });
        }},
      ],
      {cancelable: false}
    );
  }
}

class LoginPage extends React.Component {
  constructor() {
    super();
    this.state = {
      id: null,
      password: ""
    }
  }
  render() {
    return (
      <View>
        <Title text="Login" />
        <Text>{"\n"}</Text>
        <View style={styles.centerItems}>
          <TextInput
            keyboardType="number-pad"
            autoCorrect={false}
            placeholder="Server #"
            onChangeText={text => this.setState({id: parseInt(text)})}
            style={styles.inputBox}
          />
          <TextInput
            keyboardType="default"
            autoCorrect={false}
            secureTextEntry={true}
            placeholder="Password"
            onChangeText={text => this.setState({password: text})}
            style={styles.inputBox}
          />
        </View>
        <Button
          text="Go"
          onPress={_ => this._login()}
          style={styles.blueCenterText}
        />
      </View>
    );
  }
  _login() {
    this.props.httpDevice.connect(this.state.id,this.state.password,valid => {
      if ( valid ) {
        this.props.setParam("component","MainPage");
      } else {
        Alert.alert(
          "MediaPlayer2",
          "Invalid server ID or password or server is already connected to another device.",
          [
            {text: "OK",onPress: Function.prototype,style: "cancel"}
          ],
          {cancelable: false}
        );
      }
    })
  }
}
