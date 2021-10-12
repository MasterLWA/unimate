import {RecyclerViewBackedScrollViewComponent, YellowBox} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {Mapping, Theme} from './theme.service';
import {DATE, EMOTIVITY} from './types';
import {UtilService} from './util.service';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import {AppStorage} from './app-storage.service';
import BackgroundFetch from 'react-native-background-fetch';
import {getSteps, getCals, getDists} from '../api/googleFitApi';
import TraxivityDataTab from '../components/traxivity-data.component';

export class PushNotifications {
  constructor() {
PushNotification.configure({
      // (optional) Called when Token is generated (iOS and Android)
      onRegister: function(token) {
        // console.log('TOKEN:', token);
      },
      onNotification: function(notification) {
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      },
      popInitialNotification: true,
      requestPermissions: true,
      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: false,
        sound: false,
      },
    });

    PushNotification.createChannel(
      {
        channelId: 'reminders', // (required)
        channelName: 'Task reminder notifications', // (required)
        channelDescription: 'Reminder for any tasks',
      },
      () => {},
    );

    PushNotification.getScheduledLocalNotifications(rn => {
      console.log('SN --- ', rn);
    });
  }

  schduleNotification = date => {
    PushNotification.localNotificationSchedule({
      channelId: 'reminders',
      title: '🕙 How is your day today?',
      message:
        "You haven't told us about your day yet. Log into the Unimate app to say about your day",
      date,
      allowWhileIdle: true,
    });
  };

  initBackgroundFetch = async () => {
    // BackgroundFetch event handler.
    const onEvent = async taskId => {
      console.log('[BackgroundFetch] task: ', taskId);
      // Do your background work...
      //await this.addEvent(taskId);
      console.log('THIS IS MY BACKGROUND TASK');
      // IMPORTANT:  You must signal to the OS that your task is complete.
      BackgroundFetch.finish(taskId);
    };

    // Timeout callback is executed when your Task has exceeded its allowed running-time.
    // You must stop what you're doing immediately BackgroundFetch.finish(taskId)
    const onTimeout = async taskId => {
      console.warn('[BackgroundFetch] TIMEOUT task: ', taskId);
      BackgroundFetch.finish(taskId);
    };

    // Initialize BackgroundFetch only once when component mounts.
    let status = await BackgroundFetch.configure(
      {
        minimumFetchInterval: 15,
        forceAlarmManager: true,
        stopOnTerminate: false,
        enableHeadless: true,
      },
      onEvent,
      onTimeout,
    );

    console.log('[BackgroundFetch] configure status: ', status);
  };

  //Emotivity related notifications
  //Every day @8PM checks whther the user completed the meotivity questions
  //If he doesnt send a notification
  emotivityCompletionNotification = async () => {
    console.log(new Date(Date.now()).getHours())
    if (new Date(Date.now()).getHours() == 20) {
      console.log("INSIDE EMOTIVITY")
      const temp = await AppStorage.checkEmotivityTodayCompleted();
      if (temp == null || !(temp.date == UtilService.getDateToday())) {
        PushNotification.localNotificationSchedule({
          channelId: 'reminders',
          title: '🕙 How is your day today? 😀',
          message:
            "You haven't told us about your day yet. Log into the Unimate app to say about your day",
          date: new Date(Date.now()),
          allowWhileIdle: true,
        });
      }
    }
  };

  //SayThanx related notifications
  //Every day @8PM checks whther the user completed the meotivity questions
  //If he doenst send a notification
  sayThanxCompletionNotification = async () => {
    console.log(new Date(Date.now()).getHours())
    if (new Date(Date.now()).getHours() == 20) {
      console.log("INSIDE SAY THANKX")
      const temp = await AppStorage.checkSayThanxTodayCompleted();
      if (temp == null || !(temp.date == UtilService.getDateToday())) {
        PushNotification.localNotificationSchedule({
          channelId: 'reminders',
          title: '🕙 Say thanks to someone 🙏',
          message: 'Log into the Unimate app to say thanks to someone',
          date: new Date(Date.now()),
          allowWhileIdle: true,
        });
      }
    }
  };

  //Traxivity related notifications
  //Weekly check whether the average
  traxivityCompletionNotification = () => {
    console.log(new Date(Date.now()).getHours())
    if (new Date(Date.now()).getHours() == 20) {
      console.log("INSIDE TRAXIVITY")
      var start = new Date();
      var end = new Date();
      var nbDays = start.getDay();
      if (nbDays == 0) nbDays = 7;
      start.setDate(start.getDate() - (nbDays - 1));
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      const options = {
        startDate: start,
        endDate: end,
      };

      getSteps(options, null, res => {
        const reducer = (accumulator, currentValue) =>
          accumulator + currentValue;

        var tabStep = res.map(x => x.value);

        var stepSum = 0;
        var StepAvg = 0;

        if (tabStep.length > 0) {
          stepSum = tabStep.reduce(reducer);
          StepAvg = stepSum / tabStep.length;
        }

        if (StepAvg < AppStorage.getTraxivityDetails().goal) {
          PushNotification.localNotificationSchedule({
            channelId: 'reminders',
            title: '🕙 Traxivity 🏃',
            message:
              'Seems like you were unable to reach the goal past week. You can change the goal to a lower value',
            date: new Date(Date.now()),
            allowWhileIdle: true,
          });
        } else {
          PushNotification.localNotificationSchedule({
            channelId: 'reminders',
            title: '🕙 Traxivity 🏃',
            message:
              'Seems like you were able to reach the goal past week. You can change the goal to a higher value',
            date: new Date(Date.now()),
            allowWhileIdle: true,
          });
        }
      });
    }
  };
}

/**
 * In a Bare React Native project you should use
 * https://github.com/react-native-community/async-storage
 *
 * However, Expo runs AsyncStorage exported from react-native.
 * Just to save application bundle size, we still using this one.
 */
YellowBox.ignoreWarnings(['AsyncStorage has been extracted']);
