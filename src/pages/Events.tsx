import {
  IonContent, IonHeader, IonPage, IonSpinner,
  useIonViewWillEnter, IonCard, IonText, IonFab, IonItem, IonLabel
} from "@ionic/react";
import React from "react";
import { useContext } from "../my-context";
import { StatusBar, Style } from "@capacitor/status-bar";
import { Timestamp } from "firebase/firestore";
import ReactHtmlParser, { processNodes, convertNodeToElement } from 'react-html-parser';
import { getEvents } from "../fbConfig";
import { Preferences } from "@capacitor/preferences";
import { useToast } from "@agney/ir-toast";
import { Capacitor } from "@capacitor/core";

export const Events = () => {

  const context = useContext();
  const Toast = useToast();

  const [today, setToday] = React.useState<Date | null>(null);
  const [htmlArr, setHtmlArr] = React.useState<string[]>([]);
  const [dates, setDates] = React.useState<string[]>([]);
  const combinedArr = htmlArr.map((x, i) => [x, dates[i]]);

  /**
   * @description Get the day of the week from a day number.
   * 
   * @param {number} day day of the week from 0 - 6
   * @returns day of week Sun - Sat
   */
  const getDayOfWeek = (day: number): string => {
    switch (day) {
      case 0:
        return "Sunday";
      case 1:
        return "Monday";
      case 2:
        return "Tuesday";
      case 3:
        return "Wednesday";
      case 4:
        return "Thursday";
      case 5:
        return "Friday";
      case 6:
        return "Saturday";
      default:
        return "";
    }
  }

  /**
 * @description Compare two dates of varying formatting and return true 
 * if they are the same day.
 * 
 * @param {string} dateStr1 date string to be compared
 * @param {string} dateStr2 date string to be compared
 * 
 * @returns {boolean} true if the dates are the same day
 */
  const compareDates = (dateStr1: string, dateStr2: string): boolean => {
    let date1 = new Date(dateStr1);
    let date2 = new Date(dateStr2);
    if (date1.getTime() === date2.getTime()) {
      return true;
    }
    return false;
  }

  /**
   * @description Compare two dates of varying formatting and return true
   * if they are one day apart.
   * 
   * @param {string} dateStr1 date string to be compared
   * @param {string} dateStr2 date string to be compared
   * 
   * @returns {boolean} if the dates are one day apart
   */
  const seeIfTomorrow = (dateStr1: string, dateStr2: string): boolean => {
    let date1 = new Date(dateStr1);
    let date2 = new Date(dateStr2);
    if (Math.abs(date1.getDate() - date2.getDate()) === 1) {
      return true;
    }
    return false;
  }

  /**
   * 
   * @param {string} dateStr1 date string
   * 
   * @returns {"Today" | "Tomorrow" | ""} returns "Today" if the date is today, 
   * "Tomorrow" if the date is tomorrow, and "" otherwise.
   */
  const getMessage = (dateStr1: string): string => {
    if (compareDates(dateStr1, today?.toDateString() || "")) {
      return "Today";
    }
    if (seeIfTomorrow(dateStr1, today?.toDateString() || "")) {
      return "Tomorrow";
    }
    return "";
  }

  /**
   * @description Decodes HTML entities and parses the HTML string into React components.
   * 
   * @param {string} html the HTML string to be decoded
   * @returns React element(s) parsed from the HTML string
   */
  const decodeHtml = (html: string) => {
    let decodedHtml = html.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    decodedHtml = decodedHtml.replace(/&lt;\/b&gt;/g, '');
    decodedHtml = decodedHtml.replace(/&amp;/g, '&');
    decodedHtml = decodedHtml.replace(/<br\/>/g, '');
    return ReactHtmlParser(decodedHtml);
  };

  /**
   * @description Get events from local storage if they exist and are from the same day.
   * Otherwise, get events from Firestore. The events are parsed into an array of HTML strings.
   * The HTML strings are then parsed into React components.
   */
  const getEventInfo = React.useCallback(async () => {
    const serverTimestamp = Timestamp.now().toDate();
    // console.log(serverTimestamp.toDateString());
    setToday(serverTimestamp);
    const events = await Preferences.get({ key: "events" });
    const eventsLastUpdated = await Preferences.get({ key: "eventsLastUpdated" });
    if (events.value && serverTimestamp.toDateString() != eventsLastUpdated.value) {
      let myString = events.value;
      let substring = "img";
      let substring2 = "&lt;p";
      let appendStringImg = " class=\"event-img\"";
      let appendStringP = " class=\"event-p\"";
      let newString = myString.replace(new RegExp(substring, 'g'), function (match) {
        return match + appendStringImg;
      });
      let newString2 = newString.replace(new RegExp(substring2, 'g'), function (match) {
        return match + appendStringP;
      });
      console.log('getting events from local storage, same day');
      let htmlStrings: string[] = newString2.split("</a>");
      let dateArr: string[] = [];
      htmlStrings.forEach((htmlString: string, index: number) => {
        let match = htmlString.match(/(\w+), (\w+) (\d+), (\d+)/);
        if (match) {
          let day = match[3];
          let month = match[2];
          let d = new Date(month + ' ' + day + ', ' + serverTimestamp.getFullYear());
          let dayOfWeek = d.getDay();
          dateArr.push(getDayOfWeek(dayOfWeek) + ', ' + month + ' ' + day);
        }
        let newString: string = "";
        let newString2: string = "";
        newString = htmlString.replace("<div>", "<div><div class=\"event-div\">");
        newString2 = newString.replace("&lt;br/&gt;&lt;br/&gt;", "&lt;br/&gt;</div>");
        htmlStrings[index] = newString2;
      });
      setDates(dateArr);
      setHtmlArr(htmlStrings);
    } else {
      console.log('getting events, new day');
      getEvents()
        .then(async (data: string) => {
          if (data) {
            const replacedHtml = data.replace(/(\r\n|\n|\r|\t|\"|\'|\"\")/gm, "");
            await Preferences.set({ key: "events", value: replacedHtml });
            await Preferences.set({ key: "eventsLastUpdated", value: serverTimestamp.toDateString() });
            let myString = replacedHtml;
            let substring = "img";
            let substring2 = "&lt;p";
            let appendStringImg = " class=\"event-img\"";
            let appendStringP = " class=\"event-p\"";
            let newString = myString.replace(new RegExp(substring, 'g'), function (match) {
              return match + appendStringImg;
            });
            let newString2 = newString.replace(new RegExp(substring2, 'g'), function (match) {
              return match + appendStringP;
            });
            let htmlStrings: string[] = newString2.split("</a>");
            let dateArr: string[] = [];
            htmlStrings.forEach((htmlString: string, index: number) => {
              let match = htmlString.match(/(\w+), (\w+) (\d+), (\d+)/);
              if (match) {
                let day = match[3];
                let month = match[2];
                let d = new Date(month + ' ' + day + ', ' + serverTimestamp.getFullYear());
                let dayOfWeek = d.getDay();
                dateArr.push(getDayOfWeek(dayOfWeek) + ', ' + month + ' ' + day);
              }
              let newString: string = "";
              let newString2: string = "";
              newString = htmlString.replace("<div>", "<div><div class=\"event-div\">");
              newString2 = newString.replace("&lt;br/&gt;&lt;br/&gt;", "&lt;br/&gt;</div>");
              htmlStrings[index] = newString2;
            });
            setDates(dateArr);
            setHtmlArr(htmlStrings);
          } else {
            const toast = Toast.create({ message: 'Unable to load events, try again', duration: 2000, color: 'toast-error' });
            toast.present();
          }
        });
    }
  }, []);

  React.useEffect(() => {
    context.setShowTabs(true);
  }, []);

  React.useEffect(() => {
    getEventInfo();
  }, []);

  React.useEffect(() => {
    context.setShowTabs(true);
  }, [context]);

  useIonViewWillEnter(() => {
    if (Capacitor.getPlatform() === 'ios')
      StatusBar.setStyle({ style: Style.Dark });
  }, []);

  return (
    <IonPage className="ion-page-ios-notch">
      <IonContent>

        <IonHeader>
          <h1 style={{ padding: "10px", textAlign: 'center' }}><span style={{ fontWeight: 'bold' }}>Campus </span><span style={{ fontWeight: "lighter", color: "#61dbfb" }}>Events</span></h1>
        </IonHeader>

        {combinedArr.length > 0 ?
          combinedArr.map(([htmlString, date]) => (
            <IonCard key={htmlString} style={{ padding: "10px" }}>
              <IonItem style={{ width: "85vw", margin: "auto", transform: "translateX(-5%)" }}>
                <IonLabel>{date}</IonLabel>
                <span style={{ textAlign: 'right' }}><IonText color="toast-error">{getMessage(date)}</IonText></span>
              </IonItem>
              <div>{decodeHtml(htmlString)}</div>
            </IonCard>
          ))
          :
          <IonSpinner color='primary' className="ion-spinner"></IonSpinner>
        }
      </IonContent>
    </IonPage>
  );

};