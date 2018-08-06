import React from 'react';
import {Text,ScrollView,View} from 'react-native';

import {HTTPDevice} from './httpDevice'
import {Title,Button,NavigationPage,MusicSelectPage,PhotoSelectPage,QueuePage} from './components'

export default class App extends React.Component {
  constructor() {
    super();
    this.httpDevice = new HTTPDevice();
    this.state = {
      component: "MainPage",
      path: [],
      items: [],
      nextComponent: ""
    }
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
}

class MainPage extends React.Component {
  constructor() {
    super();
  }
  render() {
    var blueTextStyle = {
      fontSize: 25,
      color: "blue"
    }
    return (
      <View>
        <Title text="Home" />
        <Text>{"\n"}</Text>
        <Button
          text="Music"
          onPress={_ => this._openPage("music","MusicSelectPage",true)}
          style={blueTextStyle}
        />
        <Button
          text="Photos"
          onPress={_ => this._openPage("photos","PhotoSelectPage",true)}
          style={blueTextStyle}
        />
        <Button
          text="Web"
          onPress={_ => this._openPage("web","WebSelectPage",false)}
          style={blueTextStyle}
        />
        <Button
          text="Queue"
          onPress={_ => this._openPage("queue","QueuePage",false)}
          style={blueTextStyle}
        />
        <Text>{`\nCurrently connected with ID ${this.props.httpDevice.connectionID}`}</Text>
      </View>
    );
  }
  _openPage(page,componentName,navPage) {
    this.props.setParam("nextComponent",componentName);
    this.props.setParam("path",[page]);
    this.props.setParam("component",navPage ? "NavigationPage" : componentName);
  }
}
