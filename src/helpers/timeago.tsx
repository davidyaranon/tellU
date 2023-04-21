/**
 * @fileoverview timeago.tsx
 * 
 * Contains TimeAgo library functions which deals with how long ago something happneed. 
 */

import TimeAgo from "javascript-time-ago";
import en from 'javascript-time-ago/locale/en'

TimeAgo.setDefaultLocale(en.locale);
TimeAgo.addLocale(en);
TimeAgo.addDefaultLocale(en);

const timeAgo = new TimeAgo("en-US");

export const getDate = (timestamp: any) : string => {
  if (!timestamp) {
    return '';
  }
  if ("seconds" in timestamp && "nanoseconds" in timestamp) {
    const time = new Date(
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000
    );
    return timeAgo.format(time);
  } else {
    return '';
  }
};

export const getTimeLeft = (timestamp: any) : string => {
  if (!timestamp) {
    return '';
  }
  if ("seconds" in timestamp && "nanoseconds" in timestamp) {
    const time = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
    const today = new Date();
    const ms = today.getTime() - time.getTime();
    return (4 - (Math.floor(ms / (1000 * 60 * 60 * 24)))) > 0 ? (4 - (Math.floor(ms / (1000 * 60 * 60 * 24)))).toString() : '0';
  }
  return "";
}