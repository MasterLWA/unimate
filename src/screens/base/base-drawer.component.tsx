import React from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import {
  Avatar,
  Button,
  Divider,
  Drawer,
  DrawerElement,
  DrawerHeaderElement,
  DrawerHeaderFooter,
  DrawerHeaderFooterElement,
  Layout,
  MenuItemType,
  Text,
  Card, 
  Modal
} from '@ui-kitten/components';
import { AboutIcon, GlobeIcon } from '../../components/icons';
import { SafeAreaLayout } from '../../components/safe-area-layout.component';
import { WebBrowserService } from '../../services/web-browser.service';
import { AppInfoService } from '../../services/app-info.service';
import { AppStorage } from '../../services/app-storage.service';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-community/async-storage';
import { GoogleSignin } from '@react-native-community/google-signin';

const DATA: MenuItemType[] = [
  { title: 'About Unimate', icon: AboutIcon },
  { title: 'Visit Unimate Website', icon: GlobeIcon },
  { title: 'Robert Gordon University Website', icon: GlobeIcon },
];

const version: string = AppInfoService.getVersion();

export const BaseDrawer = ({ navigation }): DrawerElement => {

  const onItemSelect = (index: number): void => {
    switch (index) {
      case 0: {
        navigation.toggleDrawer();
        navigation.navigate('About');
        return;
      }
      case 1: {
        WebBrowserService.openBrowserAsync('https://unimate.app/');
        navigation.toggleDrawer();
        return;
      }
      case 2: {
        WebBrowserService.openBrowserAsync('http://www.comp.rgu.ac.uk/');
        navigation.toggleDrawer();
        return;
      }
    }
  };

  const userSignOut = async () => {
    console.log("USER SIGN OUT") 
    console.log("ASYNC DATA START") 

    console.log("1 IS GOOGLE SIGNED IN START")
    console.log(await GoogleSignin.isSignedIn())
    console.log("1 IS GOOGLE SIGNED IN END")

    // AsyncStorage.getAllKeys((err, keys) => {
    //   AsyncStorage.multiGet(keys, (error, stores) => {
    //     stores.map((result, i, store) => {
    //       console.log({ [store[i][0]]: store[i][1] });
    //       return true;
    //     });
    //   });
    // });
    await GoogleSignin.signOut();
  console.log("2 IS GOOGLE SIGNED IN START")
  console.log(await GoogleSignin.isSignedIn())
  console.log("2 IS GOOGLE SIGNED IN END")

    AsyncStorage.getAllKeys().then((keyArray) => {
      AsyncStorage.multiGet(keyArray).then((keyValArray) => {
        let myStorage: any = {};
        for (let keyVal of keyValArray) {
          myStorage[keyVal[0]] = keyVal[1]
        }
  
        console.log('CURRENT STORAGE: ', myStorage);
      })
    });
  
    console.log("ASYNC DATA END") 

    // await auth().signOut();
    // AppStorage.setUser({});
    // AsyncStorage.clear();
  };

  const eraseDataLogout = async () => {

    await AsyncStorage.getAllKeys()
        .then(keys => {
          console.log("KEY AsyncStorage")
          console.log(keys)
          AsyncStorage.multiRemove(keys)})
        .then(() => console.log("All local data Removed"));

    await userSignOut();
    setVisible(false);
    // navigation.navigate('Login');
    // BackHandler.exitApp();
  }
  
  const keepDataLogout = async () => {
    await userSignOut();
    setVisible(false);
    // navigation.navigate('Login');
    // BackHandler.exitApp();
  }

  const [visible, setVisible] = React.useState(false);


  const renderHeader = (): DrawerHeaderElement => (
    <Layout
      style={styles.header}
      level='2'>
      <View style={styles.profileContainer}>
        <Avatar
          size='giant'
          source={{ uri: AppStorage.getUser().photoURL }}
          style={{borderRadius: 5}}
        />
        <Text
          style={styles.profileName}
          category='h6'>
          {AppStorage.getUser().displayName}
        </Text>
      </View>
    </Layout>
  );

  const renderFooter = (): DrawerHeaderFooterElement => (
    <React.Fragment>
      <Button
      appearance='ghost'
      onPress={() => setVisible(true)}>
        Sign Out
        </Button>
      <Divider/>
      <DrawerHeaderFooter
        disabled={true}
        description={'Copyright © 2021 Robert Gordon University'}
      />
    </React.Fragment>
  );

  return (
    <SafeAreaLayout
      style={styles.safeArea}
      insets='top'>
      <Modal
        visible={visible}
        backdropStyle={styles.backdrop}
        onBackdropPress={() => setVisible(false)}>
        <Card disabled={true}>
          <Text style={styles.signoutHeader}>Log out</Text>
          <Text style={{marginBottom:5}}>Are you sure you would you like to log out?</Text>
          <Button style={{margin:1}}
          appearance='outline'
          status='danger'
      onPress={eraseDataLogout}>
        Remove data and log out
        </Button>
        <Button
        appearance='outline'
        status='primary'
        style={{margin:1}}
      onPress={keepDataLogout}>
        Keep data and log out
        </Button>
        </Card>
      </Modal>


      <Drawer
        header={renderHeader}
        footer={renderFooter}
        data={DATA}
        onSelect={onItemSelect}
      />
    </SafeAreaLayout>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    height: 128,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileName: {
    marginHorizontal: 16,
  },
  container: {
    minHeight: 192,
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  signoutHeader: {
    fontWeight: 'bold'
  }
});
