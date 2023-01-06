import React, { useEffect, useState } from "react";
import { RouteComponentProps, useHistory } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import auth, { getClassPostsDb, promiseTimeout } from '../fbConfig';
import { useToast } from "@agney/ir-toast";
import RoomIcon from '@mui/icons-material/Room';
import {
  IonAvatar, IonBackButton, IonButtons, IonCol, IonContent, IonFab,
  IonHeader, IonItem, IonLabel, IonList,
  IonNote, IonPage, IonRow, IonSelect, IonSelectOption,
  IonSpinner, IonText, IonTitle, IonToolbar,
} from "@ionic/react";
import FadeIn from "react-fade-in/lib/FadeIn";
import "../App.css";

import { chevronBackOutline } from "ionicons/icons";

import Linkify from 'linkify-react';
import { PhotoViewer as CapacitorPhotoViewer, Image as CapacitorImage } from '@capacitor-community/photoviewer';
import ProfilePhoto from "../components/Shared/ProfilePhoto";
import { Virtuoso } from "react-virtuoso";
import { useContext } from "../my-context";
import { getColor } from "../helpers/getColor";
import { getDate } from "../helpers/timeago";

interface MatchUserPostParams {
  className: string;
  schoolName: string;
}


const Class = ({ match }: RouteComponentProps<MatchUserPostParams>) => {
  const postClassName = match.params.className;
  const schoolName = match.params.schoolName;
  const history = useHistory();
  const context = useContext();
  const [user] = useAuthState(auth);
  const Toast = useToast();
  const [classPosts, setClassPosts] = useState<any[]>();
  const [classPostsCopy, setClassPostsCopy] = useState<any[]>();
  const [emoji, setEmoji] = useState<any>("");
  const [classNumberFilter, setClassNumberFilter] = useState<string>();
  const [selectOptions, setSelectOptions] = useState<any>({});
    
  const getClassPosts = async () => {
    if (postClassName) {
      if (postClassName === 'CS') {
        setEmoji('💻');
      } else if (postClassName === 'FOR') {
        setEmoji('🌳');
      } else if (postClassName === 'ANTH') {
        setEmoji('🦕');
      } else if (postClassName === 'ART') {
        setEmoji('🎨');
      } else if (postClassName === 'BIOL') {
        setEmoji('🧬');
      } else if (postClassName === 'BOT') {
        setEmoji('🌷');
      } else if (postClassName === 'CHEM') {
        setEmoji('🧪');
      } else if (postClassName === 'COMM') {
        setEmoji('📠');
      } else if (postClassName === 'CRIM') {
        setEmoji('🚔');
      } else if (postClassName === 'CRGS') {
        setEmoji('🏳️‍🌈');
      } else if (postClassName === 'DANC') {
        setEmoji('💃🏻');
      } else if (postClassName === 'ECON') {
        setEmoji('🤑');
      } else if (postClassName === 'EDUC') {
        setEmoji('📚');
      } else if (postClassName === 'ENGR') {
        setEmoji('📐');
      } else if (postClassName === 'ENGL') {
        setEmoji('📕');
      } else if (postClassName === 'FILM') {
        setEmoji('🎬');
      } else if (postClassName === 'FISH') {
        setEmoji('🐠');
      } else if (postClassName === 'FREN') {
        setEmoji('🇫🇷');
      } else if (postClassName === 'GEOG') {
        setEmoji('🌎');
      } else if (postClassName === 'GEOL') {
        setEmoji('🪨');
      } else if (postClassName === 'JMC') {
        setEmoji('📰');
      } else if (postClassName === 'MATH') {
        setEmoji('➗✖️');
      } else if (postClassName === 'HIST') {
        setEmoji('🌏');
      } else if (postClassName === 'KINS') {
        setEmoji('💪');
      } else if (postClassName === 'OCN') {
        setEmoji('🌊');
      } else if (postClassName === 'PYSC') {
        setEmoji('🧠');
      } else if (postClassName === 'PHIL') {
        setEmoji('🧐');
      } else if (postClassName === 'WLDF' || postClassName === 'ZOOL') {
        setEmoji('🦁');
      } else {
        setEmoji('📚');
      }
      const classPosts = promiseTimeout(15000, getClassPostsDb(postClassName, schoolName));
      classPosts.then((posts) => {
        if (posts) {
          setClassPosts(posts);
          setClassPostsCopy(posts);
        } else {
          const toast = Toast.create({ message: 'Something went wrong within this class', duration: 2000, color: 'toast-error' });
          toast.present();
        }
      });
      classPosts.catch((err) => {
        const toast = Toast.create({ message: err || "", duration: 2000, color: 'toast-error' });
        toast.present();
      });
    }
  }

  const filterPosts = (e: any) => {
    setClassNumberFilter(e.detail.value);
    if (e.detail.value === 'ALL') {
      setClassPosts(classPostsCopy);
      return;
    }
    if (classPostsCopy) {
      let newPosts: any[] = [];
      for (let i = 0; i < classPostsCopy?.length; ++i) {
        if ("classNumber" in classPostsCopy[i] && classPostsCopy[i].classNumber == e.detail.value) {
          newPosts.push(classPostsCopy[i]);
        }
      }
      console.log(newPosts);
      setClassPosts(newPosts);
    } else {
      const toast = Toast.create({ message: 'Unable to filter', duration: 2000, color: 'toast-error' });
      toast.present();
    }
  }

  useEffect(() => {
    if (context.schoolColorToggled) {
      setSelectOptions({
        cssClass: 'my-custom-interface',
        header: 'Class Number',
        subHeader: 'Select which class number to see posts for'
      })
    } else {
      setSelectOptions({
        header: 'Pin Filters',
        subHeader: 'Select which class number to see posts for'
      })
    }
  }, [context.schoolColorToggled])

  useEffect(() => {
    if (user && schoolName) {
      getClassPosts();
    } else {
      if (!user) {
        console.log("user not a thing");
      }
      if (!schoolName) {
        console.log("no school name");
      }
    }
  }, [match.params.className, schoolName, user]);

  const Footer = () => {
    return (
      <>
        <br></br> <br></br>
      </>
    )
  }

  return (
    <IonPage >
      <>
        <IonHeader>
          <IonToolbar >
            {postClassName &&
              <IonTitle>All {postClassName} Posts {emoji}</IonTitle>
            }
            <IonButtons style={{ marginLeft: "-2.5%" }}>
              <IonBackButton
                defaultHref="/home"
                className="back-button"
                icon={chevronBackOutline}
                text={"Back"}
                color={context.schoolColorToggled ? "tertiary" : "primary"}
              >
              </IonBackButton>
            </IonButtons>
            <IonButtons slot='end'>
              <IonSelect
                interface="action-sheet"
                interfaceOptions={selectOptions}
                okText="Filter"
                cancelText="Cancel"
                mode="ios"
                value={classNumberFilter}
                placeholder="Filter: ALL"
                onIonChange={(e: any) => {
                  filterPosts(e);
                }}
              >
                <>
                  <IonSelectOption value="ALL" class="all-option">ALL</IonSelectOption>
                  {postClassName === 'AIE' ?
                    <>
                      <IonSelectOption value="330" class="all-option">330</IonSelectOption>
                      <IonSelectOption value="340" class="all-option">340</IonSelectOption>
                    </>
                    : postClassName === 'ANTH' ?
                      <>
                        <IonSelectOption value="103" class="all-option">103</IonSelectOption>
                        <IonSelectOption value="104" class="all-option">104</IonSelectOption>
                        <IonSelectOption value="105" class="all-option">105</IonSelectOption>
                        <IonSelectOption value="210" class="all-option">210</IonSelectOption>
                        <IonSelectOption value="235" class="all-option">235</IonSelectOption>
                        <IonSelectOption value="302" class="all-option">302</IonSelectOption>
                        <IonSelectOption value="305" class="all-option">305</IonSelectOption>
                        <IonSelectOption value="307" class="all-option">307</IonSelectOption>
                        <IonSelectOption value="310" class="all-option">310</IonSelectOption>
                        <IonSelectOption value="316" class="all-option">316</IonSelectOption>
                        <IonSelectOption value="339" class="all-option">339</IonSelectOption>
                        <IonSelectOption value="350" class="all-option">350</IonSelectOption>
                        <IonSelectOption value="357" class="all-option">357</IonSelectOption>
                        <IonSelectOption value="358" class="all-option">358</IonSelectOption>
                        <IonSelectOption value="482" class="all-option">482</IonSelectOption>
                        <IonSelectOption value="499" class="all-option">499</IonSelectOption>
                      </>
                      : postClassName === 'ART' ?
                        <>
                          <IonSelectOption value="103A" class="all-option">103A</IonSelectOption>
                          <IonSelectOption value="103AB" class="all-option">103B</IonSelectOption>
                          <IonSelectOption value="104I" class="all-option">104I</IonSelectOption>
                          <IonSelectOption value="104J" class="all-option">104J</IonSelectOption>
                          <IonSelectOption value="105B" class="all-option">105B</IonSelectOption>
                          <IonSelectOption value="105C" class="all-option">105C</IonSelectOption>
                          <IonSelectOption value="105D" class="all-option">105D</IonSelectOption>
                          <IonSelectOption value="106" class="all-option">106</IonSelectOption>
                          <IonSelectOption value="107" class="all-option">107</IonSelectOption>
                          <IonSelectOption value="108" class="all-option">108</IonSelectOption>
                          <IonSelectOption value="109" class="all-option">109</IonSelectOption>
                          <IonSelectOption value="122" class="all-option">122</IonSelectOption>
                          <IonSelectOption value="250" class="all-option">250</IonSelectOption>
                          <IonSelectOption value="251" class="all-option">251</IonSelectOption>
                          <IonSelectOption value="273" class="all-option">273</IonSelectOption>
                          <IonSelectOption value="282" class="all-option">282</IonSelectOption>
                          <IonSelectOption value="290" class="all-option">290</IonSelectOption>
                          <IonSelectOption value="301" class="all-option">301</IonSelectOption>
                          <IonSelectOption value="303" class="all-option">303</IonSelectOption>
                          <IonSelectOption value="303M" class="all-option">303M</IonSelectOption>
                          <IonSelectOption value="304" class="all-option">304</IonSelectOption>
                          <IonSelectOption value="305" class="all-option">305</IonSelectOption>
                          <IonSelectOption value="307" class="all-option">307</IonSelectOption>
                          <IonSelectOption value="321" class="all-option">321</IonSelectOption>
                          <IonSelectOption value="324" class="all-option">324</IonSelectOption>
                          <IonSelectOption value="326" class="all-option">326</IonSelectOption>
                          <IonSelectOption value="329" class="all-option">329</IonSelectOption>
                          <IonSelectOption value="330" class="all-option">330</IonSelectOption>
                          <IonSelectOption value="337" class="all-option">337</IonSelectOption>
                          <IonSelectOption value="340" class="all-option">340</IonSelectOption>
                          <IonSelectOption value="346" class="all-option">346</IonSelectOption>
                          <IonSelectOption value="348" class="all-option">348</IonSelectOption>
                          <IonSelectOption value="350" class="all-option">350</IonSelectOption>
                          <IonSelectOption value="351" class="all-option">351</IonSelectOption>
                          <IonSelectOption value="356" class="all-option">356</IonSelectOption>
                          <IonSelectOption value="356M" class="all-option">356M</IonSelectOption>
                          <IonSelectOption value="357B" class="all-option">357B</IonSelectOption>
                          <IonSelectOption value="359" class="all-option">359</IonSelectOption>
                          <IonSelectOption value="367" class="all-option">367</IonSelectOption>
                          <IonSelectOption value="372" class="all-option">372</IonSelectOption>
                          <IonSelectOption value="395" class="all-option">395</IonSelectOption>
                          <IonSelectOption value="437" class="all-option">437</IonSelectOption>
                          <IonSelectOption value="491A" class="all-option">491A</IonSelectOption>
                          <IonSelectOption value="499" class="all-option">499</IonSelectOption>
                        </>
                        : postClassName === 'AHSS' ?
                          <>
                            <IonSelectOption value="100" class="all-option">100</IonSelectOption>
                            <IonSelectOption value="101" class="all-option">101</IonSelectOption>
                            <IonSelectOption value="102" class="all-option">102</IonSelectOption>
                            <IonSelectOption value="108" class="all-option">108</IonSelectOption>
                            <IonSelectOption value="109" class="all-option">109</IonSelectOption>
                            <IonSelectOption value="180" class="all-option">180</IonSelectOption>
                          </>
                          : postClassName === 'BIOL' ?
                            <>
                              <IonSelectOption value="102" class="all-option">102</IonSelectOption>
                              <IonSelectOption value="102L" class="all-option">102L</IonSelectOption>
                              <IonSelectOption value="104" class="all-option">104</IonSelectOption>
                              <IonSelectOption value="105" class="all-option">105</IonSelectOption>
                              <IonSelectOption value="198" class="all-option">198</IonSelectOption>
                              <IonSelectOption value="255" class="all-option">255</IonSelectOption>
                              <IonSelectOption value="304" class="all-option">304</IonSelectOption>
                              <IonSelectOption value="307" class="all-option">307</IonSelectOption>
                              <IonSelectOption value="330" class="all-option">330</IonSelectOption>
                              <IonSelectOption value="340" class="all-option">340</IonSelectOption>
                              <IonSelectOption value="350" class="all-option">350</IonSelectOption>
                              <IonSelectOption value="412" class="all-option">412</IonSelectOption>
                              <IonSelectOption value="433" class="all-option">433</IonSelectOption>
                              <IonSelectOption value="433D" class="all-option">433D</IonSelectOption>
                              <IonSelectOption value="434" class="all-option">434</IonSelectOption>
                              <IonSelectOption value="440" class="all-option">440</IonSelectOption>
                              <IonSelectOption value="450" class="all-option">450</IonSelectOption>
                              <IonSelectOption value="480" class="all-option">480</IonSelectOption>
                              <IonSelectOption value="480L" class="all-option">480L</IonSelectOption>
                              <IonSelectOption value="482" class="all-option">482</IonSelectOption>
                              <IonSelectOption value="499" class="all-option">499</IonSelectOption>
                              <IonSelectOption value="533" class="all-option">533</IonSelectOption>
                              <IonSelectOption value="533D" class="all-option">533D</IonSelectOption>
                              <IonSelectOption value="534" class="all-option">534</IonSelectOption>
                              <IonSelectOption value="580" class="all-option">580</IonSelectOption>
                              <IonSelectOption value="597" class="all-option">597</IonSelectOption>
                              <IonSelectOption value="683" class="all-option">683</IonSelectOption>
                              <IonSelectOption value="685" class="all-option">685</IonSelectOption>
                              <IonSelectOption value="690" class="all-option">690</IonSelectOption>
                              <IonSelectOption value="699" class="all-option">699</IonSelectOption>
                            </>
                            : postClassName === 'BOT' ?
                              <>
                                <IonSelectOption value="105" class="all-option">105</IonSelectOption>
                                <IonSelectOption value="198" class="all-option">198</IonSelectOption>
                                <IonSelectOption value="310" class="all-option">310</IonSelectOption>
                                <IonSelectOption value="330" class="all-option">330</IonSelectOption>
                                <IonSelectOption value="330L" class="all-option">330L</IonSelectOption>
                                <IonSelectOption value="350" class="all-option">350</IonSelectOption>
                                <IonSelectOption value="354" class="all-option">354</IonSelectOption>
                                <IonSelectOption value="354A" class="all-option">354A</IonSelectOption>
                                <IonSelectOption value="358" class="all-option">358</IonSelectOption>
                                <IonSelectOption value="360" class="all-option">360</IonSelectOption>
                                <IonSelectOption value="360L" class="all-option">360L</IonSelectOption>
                              </>
                              : postClassName === 'BA' ?
                                <>
                                  <IonSelectOption value="105" class="all-option">105</IonSelectOption>
                                  <IonSelectOption value="106" class="all-option">106</IonSelectOption>
                                  <IonSelectOption value="202" class="all-option">202</IonSelectOption>
                                  <IonSelectOption value="250" class="all-option">250</IonSelectOption>
                                  <IonSelectOption value="252" class="all-option">252</IonSelectOption>
                                  <IonSelectOption value="322" class="all-option">322</IonSelectOption>
                                  <IonSelectOption value="340" class="all-option">340</IonSelectOption>
                                  <IonSelectOption value="360" class="all-option">360</IonSelectOption>
                                  <IonSelectOption value="370" class="all-option">370</IonSelectOption>
                                  <IonSelectOption value="422" class="all-option">422</IonSelectOption>
                                  <IonSelectOption value="430" class="all-option">430</IonSelectOption>
                                  <IonSelectOption value="432" class="all-option">432</IonSelectOption>
                                  <IonSelectOption value="433" class="all-option">433</IonSelectOption>
                                  <IonSelectOption value="446" class="all-option">446</IonSelectOption>
                                  <IonSelectOption value="449" class="all-option">449</IonSelectOption>
                                  <IonSelectOption value="450" class="all-option">450</IonSelectOption>
                                  <IonSelectOption value="453" class="all-option">453</IonSelectOption>
                                  <IonSelectOption value="454" class="all-option">454</IonSelectOption>
                                  <IonSelectOption value="456" class="all-option">456</IonSelectOption>
                                  <IonSelectOption value="462" class="all-option">462</IonSelectOption>
                                  <IonSelectOption value="482" class="all-option">482</IonSelectOption>
                                  <IonSelectOption value="496" class="all-option">496</IonSelectOption>
                                </>
                                : postClassName === 'CHEM' ?
                                  <>
                                    <IonSelectOption value="107" class="all-option">107</IonSelectOption>
                                    <IonSelectOption value="109" class="all-option">109</IonSelectOption>
                                    <IonSelectOption value="110" class="all-option">110</IonSelectOption>
                                    <IonSelectOption value="198" class="all-option">198</IonSelectOption>
                                    <IonSelectOption value="228" class="all-option">228</IonSelectOption>
                                    <IonSelectOption value="324" class="all-option">324</IonSelectOption>
                                    <IonSelectOption value="324L" class="all-option">324L</IonSelectOption>
                                    <IonSelectOption value="330" class="all-option">330</IonSelectOption>
                                    <IonSelectOption value="341" class="all-option">341</IonSelectOption>
                                    <IonSelectOption value="361" class="all-option">361</IonSelectOption>
                                    <IonSelectOption value="370" class="all-option">370</IonSelectOption>
                                    <IonSelectOption value="434" class="all-option">434</IonSelectOption>
                                    <IonSelectOption value="434L" class="all-option">434L</IonSelectOption>
                                    <IonSelectOption value="438" class="all-option">438</IonSelectOption>
                                    <IonSelectOption value="485" class="all-option">485</IonSelectOption>
                                  </>
                                  : postClassName === 'CD' ?
                                    <>
                                      <IonSelectOption value="109Y" class="all-option">109Y</IonSelectOption>
                                      <IonSelectOption value="109Z" class="all-option">109Z</IonSelectOption>
                                      <IonSelectOption value="209" class="all-option">209</IonSelectOption>
                                      <IonSelectOption value="211" class="all-option">211</IonSelectOption>
                                      <IonSelectOption value="211S" class="all-option">211S</IonSelectOption>
                                      <IonSelectOption value="251" class="all-option">251</IonSelectOption>
                                      <IonSelectOption value="253" class="all-option">253</IonSelectOption>
                                      <IonSelectOption value="257" class="all-option">257</IonSelectOption>
                                      <IonSelectOption value="350" class="all-option">350</IonSelectOption>
                                      <IonSelectOption value="355" class="all-option">355</IonSelectOption>
                                      <IonSelectOption value="362" class="all-option">362</IonSelectOption>
                                      <IonSelectOption value="366" class="all-option">366</IonSelectOption>
                                      <IonSelectOption value="467" class="all-option">467</IonSelectOption>
                                      <IonSelectOption value="469" class="all-option">469</IonSelectOption>
                                      <IonSelectOption value="479" class="all-option">479</IonSelectOption>
                                      <IonSelectOption value="482" class="all-option">482</IonSelectOption>
                                    </>
                                    : postClassName === 'COMM' ?
                                      <>
                                        <IonSelectOption value="100" class="all-option">100</IonSelectOption>
                                        <IonSelectOption value="103" class="all-option">103</IonSelectOption>
                                        <IonSelectOption value="105" class="all-option">105</IonSelectOption>
                                        <IonSelectOption value="108" class="all-option">108</IonSelectOption>
                                        <IonSelectOption value="214" class="all-option">214</IonSelectOption>
                                        <IonSelectOption value="235" class="all-option">235</IonSelectOption>
                                        <IonSelectOption value="300" class="all-option">300</IonSelectOption>
                                        <IonSelectOption value="309B" class="all-option">309B</IonSelectOption>
                                        <IonSelectOption value="319" class="all-option">319</IonSelectOption>
                                        <IonSelectOption value="411" class="all-option">411</IonSelectOption>
                                        <IonSelectOption value="414" class="all-option">414</IonSelectOption>
                                        <IonSelectOption value="480" class="all-option">480</IonSelectOption>
                                        <IonSelectOption value="490" class="all-option">490</IonSelectOption>
                                      </>
                                      : postClassName === 'CS' ?
                                        <>
                                          <IonSelectOption value="100" class="all-option">100</IonSelectOption>
                                          <IonSelectOption value="111" class="all-option">111</IonSelectOption>
                                          <IonSelectOption value="112" class="all-option">112</IonSelectOption>
                                          <IonSelectOption value="211" class="all-option">211</IonSelectOption>
                                          <IonSelectOption value="243" class="all-option">243</IonSelectOption>
                                          <IonSelectOption value="279" class="all-option">279</IonSelectOption>
                                          <IonSelectOption value="309" class="all-option">309</IonSelectOption>
                                          <IonSelectOption value="312" class="all-option">312</IonSelectOption>
                                          <IonSelectOption value="325" class="all-option">325</IonSelectOption>
                                          <IonSelectOption value="346" class="all-option">346</IonSelectOption>
                                          <IonSelectOption value="374" class="all-option">374</IonSelectOption>
                                          <IonSelectOption value="458" class="all-option">458</IonSelectOption>
                                          <IonSelectOption value="480" class="all-option">480</IonSelectOption>
                                        </>
                                        : postClassName === 'CRIM' ?
                                          <>
                                            <IonSelectOption value="125" class="all-option">125</IonSelectOption>
                                            <IonSelectOption value="225" class="all-option">225</IonSelectOption>
                                            <IonSelectOption value="325" class="all-option">325</IonSelectOption>
                                            <IonSelectOption value="362" class="all-option">362</IonSelectOption>
                                            <IonSelectOption value="410" class="all-option">410</IonSelectOption>
                                            <IonSelectOption value="420" class="all-option">420</IonSelectOption>
                                          </>
                                          : postClassName === 'CRGS' ?
                                            <>
                                              <IonSelectOption value="108" class="all-option">108</IonSelectOption>
                                              <IonSelectOption value="118" class="all-option">118</IonSelectOption>
                                              <IonSelectOption value="235" class="all-option">235</IonSelectOption>
                                              <IonSelectOption value="313" class="all-option">313</IonSelectOption>
                                              <IonSelectOption value="331" class="all-option">331</IonSelectOption>
                                              <IonSelectOption value="360" class="all-option">360</IonSelectOption>
                                              <IonSelectOption value="390" class="all-option">390</IonSelectOption>
                                              <IonSelectOption value="482" class="all-option">482</IonSelectOption>
                                              <IonSelectOption value="491" class="all-option">491</IonSelectOption>
                                            </>
                                            : postClassName === 'DANC' ?
                                              <>
                                                <IonSelectOption value="103" class="all-option">103</IonSelectOption>
                                                <IonSelectOption value="104" class="all-option">104</IonSelectOption>
                                                <IonSelectOption value="110" class="all-option">110</IonSelectOption>
                                                <IonSelectOption value="243" class="all-option">243</IonSelectOption>
                                                <IonSelectOption value="245" class="all-option">245</IonSelectOption>
                                                <IonSelectOption value="247" class="all-option">247</IonSelectOption>
                                                <IonSelectOption value="248" class="all-option">248</IonSelectOption>
                                                <IonSelectOption value="303" class="all-option">303</IonSelectOption>
                                                <IonSelectOption value="320" class="all-option">320</IonSelectOption>
                                                <IonSelectOption value="352" class="all-option">352</IonSelectOption>
                                                <IonSelectOption value="354" class="all-option">354</IonSelectOption>
                                                <IonSelectOption value="389" class="all-option">389</IonSelectOption>
                                                <IonSelectOption value="488" class="all-option">488</IonSelectOption>
                                                <IonSelectOption value="499" class="all-option">499</IonSelectOption>
                                              </>
                                              : postClassName === 'ECON' ?
                                                <>
                                                  <IonSelectOption value="104" class="all-option">104</IonSelectOption>
                                                  <IonSelectOption value="210" class="all-option">210</IonSelectOption>
                                                  <IonSelectOption value="306" class="all-option">306</IonSelectOption>
                                                  <IonSelectOption value="311" class="all-option">311</IonSelectOption>
                                                  <IonSelectOption value="423" class="all-option">423</IonSelectOption>
                                                  <IonSelectOption value="435" class="all-option">435</IonSelectOption>
                                                  <IonSelectOption value="550" class="all-option">550</IonSelectOption>
                                                </>
                                                : postClassName === 'EDUC' ?
                                                  <>
                                                    <IonSelectOption value="101" class="all-option">101</IonSelectOption>
                                                    <IonSelectOption value="377" class="all-option">377</IonSelectOption>
                                                    <IonSelectOption value="610" class="all-option">610</IonSelectOption>
                                                    <IonSelectOption value="620" class="all-option">620</IonSelectOption>

                                                  </>
                                                  : postClassName === 'EDL' ?
                                                    <>
                                                      <IonSelectOption value="645" class="all-option">645</IonSelectOption>
                                                      <IonSelectOption value="646" class="all-option">646</IonSelectOption>
                                                      <IonSelectOption value="649" class="all-option">649</IonSelectOption>
                                                      <IonSelectOption value="660" class="all-option">660</IonSelectOption>
                                                      <IonSelectOption value="694" class="all-option">694</IonSelectOption>
                                                      <IonSelectOption value="695" class="all-option">695</IonSelectOption>
                                                    </>
                                                    : postClassName === 'ENGR' ?
                                                      <>
                                                        <IonSelectOption value="115" class="all-option">115</IonSelectOption>
                                                        <IonSelectOption value="210" class="all-option">210</IonSelectOption>
                                                        <IonSelectOption value="211" class="all-option">211</IonSelectOption>
                                                        <IonSelectOption value="215" class="all-option">215</IonSelectOption>
                                                        <IonSelectOption value="225" class="all-option">225</IonSelectOption>
                                                        <IonSelectOption value="280" class="all-option">280</IonSelectOption>
                                                        <IonSelectOption value="299" class="all-option">299</IonSelectOption>
                                                        <IonSelectOption value="308" class="all-option">308</IonSelectOption>
                                                        <IonSelectOption value="313" class="all-option">313</IonSelectOption>
                                                        <IonSelectOption value="322" class="all-option">322</IonSelectOption>
                                                        <IonSelectOption value="325" class="all-option">325</IonSelectOption>
                                                        <IonSelectOption value="326" class="all-option">326</IonSelectOption>
                                                        <IonSelectOption value="330" class="all-option">330</IonSelectOption>
                                                        <IonSelectOption value="331" class="all-option">331</IonSelectOption>
                                                        <IonSelectOption value="333" class="all-option">333</IonSelectOption>
                                                        <IonSelectOption value="351" class="all-option">351</IonSelectOption>
                                                        <IonSelectOption value="371" class="all-option">371</IonSelectOption>
                                                        <IonSelectOption value="399" class="all-option">399</IonSelectOption>
                                                        <IonSelectOption value="410" class="all-option">410</IonSelectOption>
                                                        <IonSelectOption value="416" class="all-option">416</IonSelectOption>
                                                        <IonSelectOption value="418" class="all-option">418</IonSelectOption>
                                                        <IonSelectOption value="440" class="all-option">440</IonSelectOption>
                                                        <IonSelectOption value="453" class="all-option">453</IonSelectOption>
                                                        <IonSelectOption value="471" class="all-option">471</IonSelectOption>
                                                        <IonSelectOption value="492" class="all-option">492</IonSelectOption>
                                                        <IonSelectOption value="496" class="all-option">496</IonSelectOption>
                                                        <IonSelectOption value="498" class="all-option">498</IonSelectOption>
                                                        <IonSelectOption value="518" class="all-option">518</IonSelectOption>
                                                        <IonSelectOption value="532" class="all-option">532</IonSelectOption>
                                                        <IonSelectOption value="571" class="all-option">571</IonSelectOption>
                                                        <IonSelectOption value="690" class="all-option">690</IonSelectOption>
                                                      </>
                                                      : postClassName === 'ENGL' ?
                                                        <>
                                                          <IonSelectOption value="102" class="all-option">102</IonSelectOption>
                                                          <IonSelectOption value="103" class="all-option">103</IonSelectOption>
                                                          <IonSelectOption value="104" class="all-option">104</IonSelectOption>
                                                          <IonSelectOption value="105" class="all-option">105</IonSelectOption>
                                                          <IonSelectOption value="110" class="all-option">110</IonSelectOption>
                                                          <IonSelectOption value="211" class="all-option">211</IonSelectOption>
                                                          <IonSelectOption value="218" class="all-option">218</IonSelectOption>
                                                          <IonSelectOption value="220" class="all-option">220</IonSelectOption>
                                                          <IonSelectOption value="240" class="all-option">240</IonSelectOption>
                                                          <IonSelectOption value="306" class="all-option">306</IonSelectOption>
                                                          <IonSelectOption value="315" class="all-option">315</IonSelectOption>
                                                          <IonSelectOption value="316" class="all-option">316</IonSelectOption>
                                                          <IonSelectOption value="328" class="all-option">328</IonSelectOption>
                                                          <IonSelectOption value="336" class="all-option">336</IonSelectOption>
                                                          <IonSelectOption value="350" class="all-option">350</IonSelectOption>
                                                          <IonSelectOption value="406" class="all-option">406</IonSelectOption>
                                                          <IonSelectOption value="420" class="all-option">420</IonSelectOption>
                                                          <IonSelectOption value="426" class="all-option">426</IonSelectOption>
                                                          <IonSelectOption value="435" class="all-option">435</IonSelectOption>
                                                          <IonSelectOption value="450" class="all-option">450</IonSelectOption>
                                                          <IonSelectOption value="460" class="all-option">460</IonSelectOption>
                                                          <IonSelectOption value="535" class="all-option">535</IonSelectOption>
                                                          <IonSelectOption value="600" class="all-option">600</IonSelectOption>
                                                        </>
                                                        : postClassName === 'ESM' ?
                                                          <>
                                                            <IonSelectOption value="105" class="all-option">105</IonSelectOption>
                                                            <IonSelectOption value="108" class="all-option">108</IonSelectOption>
                                                            <IonSelectOption value="210" class="all-option">210</IonSelectOption>
                                                            <IonSelectOption value="230" class="all-option">230</IonSelectOption>
                                                            <IonSelectOption value="253" class="all-option">253</IonSelectOption>
                                                            <IonSelectOption value="303" class="all-option">303</IonSelectOption>
                                                            <IonSelectOption value="305" class="all-option">305</IonSelectOption>
                                                            <IonSelectOption value="308" class="all-option">308</IonSelectOption>
                                                            <IonSelectOption value="309B" class="all-option">309B</IonSelectOption>
                                                            <IonSelectOption value="325" class="all-option">325</IonSelectOption>
                                                            <IonSelectOption value="350" class="all-option">350</IonSelectOption>
                                                            <IonSelectOption value="355" class="all-option">355</IonSelectOption>
                                                            <IonSelectOption value="360" class="all-option">360</IonSelectOption>
                                                            <IonSelectOption value="411" class="all-option">411</IonSelectOption>
                                                            <IonSelectOption value="425" class="all-option">425</IonSelectOption>
                                                            <IonSelectOption value="435" class="all-option">435</IonSelectOption>
                                                            <IonSelectOption value="450" class="all-option">450</IonSelectOption>
                                                            <IonSelectOption value="455" class="all-option">455</IonSelectOption>
                                                            <IonSelectOption value="462" class="all-option">462</IonSelectOption>
                                                          </>
                                                          : postClassName === 'ENST' ?
                                                            <>
                                                              <IonSelectOption value="120" class="all-option">120</IonSelectOption>
                                                              <IonSelectOption value="123" class="all-option">123</IonSelectOption>
                                                              <IonSelectOption value="395" class="all-option">395</IonSelectOption>
                                                              <IonSelectOption value="490S" class="all-option">490S</IonSelectOption>
                                                            </>
                                                            : postClassName === 'ES' ?
                                                              <>
                                                                <IonSelectOption value="105" class="all-option">105</IonSelectOption>
                                                                <IonSelectOption value="106" class="all-option">106</IonSelectOption>
                                                                <IonSelectOption value="107" class="all-option">107</IonSelectOption>
                                                                <IonSelectOption value="302" class="all-option">302</IonSelectOption>
                                                                <IonSelectOption value="305" class="all-option">305</IonSelectOption>
                                                                <IonSelectOption value="308" class="all-option">308</IonSelectOption>
                                                                <IonSelectOption value="317" class="all-option">317</IonSelectOption>
                                                                <IonSelectOption value="336" class="all-option">336</IonSelectOption>
                                                              </>
                                                              : postClassName === 'FILM' ?
                                                                <>
                                                                  <IonSelectOption value="109" class="all-option">109</IonSelectOption>
                                                                  <IonSelectOption value="260" class="all-option">260</IonSelectOption>
                                                                  <IonSelectOption value="305" class="all-option">305</IonSelectOption>
                                                                  <IonSelectOption value="315" class="all-option">315</IonSelectOption>
                                                                  <IonSelectOption value="317" class="all-option">317</IonSelectOption>
                                                                  <IonSelectOption value="350" class="all-option">350</IonSelectOption>
                                                                  <IonSelectOption value="378" class="all-option">378</IonSelectOption>
                                                                  <IonSelectOption value="415" class="all-option">415</IonSelectOption>
                                                                  <IonSelectOption value="465" class="all-option">465</IonSelectOption>
                                                                </>
                                                                : postClassName === 'FISH' ?
                                                                  <>
                                                                    <IonSelectOption value="260" class="all-option">260</IonSelectOption>
                                                                    <IonSelectOption value="300" class="all-option">300</IonSelectOption>
                                                                    <IonSelectOption value="310" class="all-option">310</IonSelectOption>
                                                                    <IonSelectOption value="314" class="all-option">314</IonSelectOption>
                                                                    <IonSelectOption value="375" class="all-option">375</IonSelectOption>
                                                                    <IonSelectOption value="380" class="all-option">380</IonSelectOption>
                                                                    <IonSelectOption value="435" class="all-option">435</IonSelectOption>
                                                                    <IonSelectOption value="476" class="all-option">476</IonSelectOption>
                                                                    <IonSelectOption value="480" class="all-option">480</IonSelectOption>
                                                                    <IonSelectOption value="576" class="all-option">576</IonSelectOption>
                                                                    <IonSelectOption value="580" class="all-option">580</IonSelectOption>
                                                                    <IonSelectOption value="690" class="all-option">690</IonSelectOption>
                                                                    <IonSelectOption value="695" class="all-option">695</IonSelectOption>
                                                                  </>
                                                                  : postClassName === 'FOR' ?
                                                                    <>
                                                                      <IonSelectOption value="170" class="all-option">170</IonSelectOption>
                                                                      <IonSelectOption value="210" class="all-option">210</IonSelectOption>
                                                                      <IonSelectOption value="223" class="all-option">223</IonSelectOption>
                                                                      <IonSelectOption value="250" class="all-option">250</IonSelectOption>
                                                                      <IonSelectOption value="315" class="all-option">315</IonSelectOption>
                                                                      <IonSelectOption value="321" class="all-option">321</IonSelectOption>
                                                                      <IonSelectOption value="323" class="all-option">323</IonSelectOption>
                                                                      <IonSelectOption value="353" class="all-option">353</IonSelectOption>
                                                                      <IonSelectOption value="359" class="all-option">359</IonSelectOption>
                                                                      <IonSelectOption value="374" class="all-option">374</IonSelectOption>
                                                                      <IonSelectOption value="424" class="all-option">424</IonSelectOption>
                                                                      <IonSelectOption value="430" class="all-option">430</IonSelectOption>
                                                                      <IonSelectOption value="432" class="all-option">432</IonSelectOption>
                                                                      <IonSelectOption value="471" class="all-option">471</IonSelectOption>
                                                                      <IonSelectOption value="475" class="all-option">475</IonSelectOption>
                                                                      <IonSelectOption value="479" class="all-option">479</IonSelectOption>
                                                                      <IonSelectOption value="480" class="all-option">480</IonSelectOption>
                                                                      <IonSelectOption value="490" class="all-option">490</IonSelectOption>
                                                                      <IonSelectOption value="499" class="all-option">499</IonSelectOption>
                                                                      <IonSelectOption value="530" class="all-option">530</IonSelectOption>
                                                                      <IonSelectOption value="532" class="all-option">532</IonSelectOption>
                                                                      <IonSelectOption value="680" class="all-option">680</IonSelectOption>
                                                                    </>
                                                                    : postClassName === 'FREN' ?
                                                                      <>
                                                                        <IonSelectOption value="100" class="all-option">100</IonSelectOption>
                                                                        <IonSelectOption value="105" class="all-option">105</IonSelectOption>
                                                                        <IonSelectOption value="106" class="all-option">106</IonSelectOption>
                                                                        <IonSelectOption value="107" class="all-option">107</IonSelectOption>
                                                                        <IonSelectOption value="207" class="all-option">207</IonSelectOption>
                                                                        <IonSelectOption value="311" class="all-option">311</IonSelectOption>
                                                                        <IonSelectOption value="370" class="all-option">370</IonSelectOption>
                                                                        <IonSelectOption value="390" class="all-option">390</IonSelectOption>
                                                                        <IonSelectOption value="420" class="all-option">420</IonSelectOption>
                                                                      </>
                                                                      : postClassName === 'GEOG' ?
                                                                        <>
                                                                          <IonSelectOption value="105" class="all-option">105</IonSelectOption>
                                                                          <IonSelectOption value="106" class="all-option">106</IonSelectOption>
                                                                          <IonSelectOption value="300" class="all-option">300</IonSelectOption>
                                                                          <IonSelectOption value="310" class="all-option">310</IonSelectOption>
                                                                          <IonSelectOption value="311" class="all-option">311</IonSelectOption>
                                                                          <IonSelectOption value="352" class="all-option">352</IonSelectOption>
                                                                        </>
                                                                        : postClassName === 'GEOL' ?
                                                                          <>
                                                                            <IonSelectOption value="103" class="all-option">105</IonSelectOption>
                                                                            <IonSelectOption value="106" class="all-option">106</IonSelectOption>
                                                                            <IonSelectOption value="109" class="all-option">300</IonSelectOption>
                                                                            <IonSelectOption value="303" class="all-option">310</IonSelectOption>
                                                                            <IonSelectOption value="306" class="all-option">311</IonSelectOption>
                                                                            <IonSelectOption value="312" class="all-option">352</IonSelectOption>
                                                                            <IonSelectOption value="332" class="all-option">352</IonSelectOption>
                                                                            <IonSelectOption value="335" class="all-option">352</IonSelectOption>
                                                                            <IonSelectOption value="399" class="all-option">352</IonSelectOption>
                                                                            <IonSelectOption value="452" class="all-option">352</IonSelectOption>
                                                                            <IonSelectOption value="455" class="all-option">352</IonSelectOption>
                                                                            <IonSelectOption value="474" class="all-option">352</IonSelectOption>
                                                                          </>
                                                                          : postClassName === 'GSP' ?
                                                                            <>
                                                                              <IonSelectOption value="101" class="all-option">101</IonSelectOption>
                                                                              <IonSelectOption value="216" class="all-option">216</IonSelectOption>
                                                                              <IonSelectOption value="270" class="all-option">270</IonSelectOption>
                                                                              <IonSelectOption value="316" class="all-option">316</IonSelectOption>
                                                                              <IonSelectOption value="326" class="all-option">326</IonSelectOption>
                                                                              <IonSelectOption value="370" class="all-option">370</IonSelectOption>
                                                                              <IonSelectOption value="416" class="all-option">416</IonSelectOption>
                                                                            </>
                                                                            : postClassName === 'GERM' ?
                                                                              <>
                                                                                <IonSelectOption value="105" class="all-option">105</IonSelectOption>
                                                                                <IonSelectOption value="107" class="all-option">107</IonSelectOption>
                                                                                <IonSelectOption value="306" class="all-option">306</IonSelectOption>
                                                                              </>
                                                                              : postClassName === 'HED' ?
                                                                                <>
                                                                                  <IonSelectOption value="100" class="all-option">100</IonSelectOption>
                                                                                  <IonSelectOption value="120" class="all-option">120</IonSelectOption>
                                                                                  <IonSelectOption value="231" class="all-option">231</IonSelectOption>
                                                                                  <IonSelectOption value="342" class="all-option">342</IonSelectOption>
                                                                                  <IonSelectOption value="345" class="all-option">345</IonSelectOption>
                                                                                  <IonSelectOption value="392" class="all-option">392</IonSelectOption>
                                                                                  <IonSelectOption value="446" class="all-option">446</IonSelectOption>
                                                                                  <IonSelectOption value="451" class="all-option">451</IonSelectOption>
                                                                                  <IonSelectOption value="495" class="all-option">495</IonSelectOption>
                                                                                </>
                                                                                : postClassName === 'HIST' ?
                                                                                  <>
                                                                                    <IonSelectOption value="104" class="all-option">104</IonSelectOption>
                                                                                    <IonSelectOption value="106B" class="all-option">16B5</IonSelectOption>
                                                                                    <IonSelectOption value="109" class="all-option">109</IonSelectOption>
                                                                                    <IonSelectOption value="110" class="all-option">110</IonSelectOption>
                                                                                    <IonSelectOption value="111" class="all-option">111</IonSelectOption>
                                                                                    <IonSelectOption value="200" class="all-option">200</IonSelectOption>
                                                                                    <IonSelectOption value="210" class="all-option">210</IonSelectOption>
                                                                                    <IonSelectOption value="305" class="all-option">305</IonSelectOption>
                                                                                    <IonSelectOption value="338" class="all-option">338</IonSelectOption>
                                                                                    <IonSelectOption value="342" class="all-option">342</IonSelectOption>
                                                                                    <IonSelectOption value="372" class="all-option">372</IonSelectOption>
                                                                                    <IonSelectOption value="397" class="all-option">397</IonSelectOption>
                                                                                    <IonSelectOption value="398" class="all-option">398</IonSelectOption>
                                                                                    <IonSelectOption value="420" class="all-option">420</IonSelectOption>
                                                                                    <IonSelectOption value="482" class="all-option">482</IonSelectOption>
                                                                                    <IonSelectOption value="491" class="all-option">491</IonSelectOption>
                                                                                  </>
                                                                                  : postClassName === 'JMC' ?
                                                                                    <>
                                                                                      <IonSelectOption value="105" class="all-option">105</IonSelectOption>
                                                                                      <IonSelectOption value="120" class="all-option">120</IonSelectOption>
                                                                                      <IonSelectOption value="134" class="all-option">134</IonSelectOption>
                                                                                      <IonSelectOption value="154" class="all-option">154</IonSelectOption>
                                                                                      <IonSelectOption value="155" class="all-option">155</IonSelectOption>
                                                                                      <IonSelectOption value="156" class="all-option">156</IonSelectOption>
                                                                                      <IonSelectOption value="160" class="all-option">160</IonSelectOption>
                                                                                      <IonSelectOption value="302" class="all-option">302</IonSelectOption>
                                                                                      <IonSelectOption value="306" class="all-option">306</IonSelectOption>
                                                                                      <IonSelectOption value="309" class="all-option">309</IonSelectOption>
                                                                                      <IonSelectOption value="318" class="all-option">318</IonSelectOption>
                                                                                      <IonSelectOption value="323" class="all-option">323</IonSelectOption>
                                                                                      <IonSelectOption value="325" class="all-option">325</IonSelectOption>
                                                                                      <IonSelectOption value="327" class="all-option">327</IonSelectOption>
                                                                                      <IonSelectOption value="355" class="all-option">355</IonSelectOption>
                                                                                      <IonSelectOption value="360" class="all-option">360</IonSelectOption>
                                                                                      <IonSelectOption value="427" class="all-option">427</IonSelectOption>
                                                                                      <IonSelectOption value="482" class="all-option">482</IonSelectOption>
                                                                                    </>
                                                                                    : postClassName === 'KINS' ?
                                                                                      <>
                                                                                        <IonSelectOption value="165" class="all-option">165</IonSelectOption>
                                                                                        <IonSelectOption value="244" class="all-option">244</IonSelectOption>
                                                                                        <IonSelectOption value="288" class="all-option">288</IonSelectOption>
                                                                                        <IonSelectOption value="315" class="all-option">315</IonSelectOption>
                                                                                        <IonSelectOption value="339" class="all-option">339</IonSelectOption>
                                                                                        <IonSelectOption value="379" class="all-option">379</IonSelectOption>
                                                                                        <IonSelectOption value="384" class="all-option">384</IonSelectOption>
                                                                                        <IonSelectOption value="385" class="all-option">385</IonSelectOption>
                                                                                        <IonSelectOption value="386" class="all-option">386</IonSelectOption>
                                                                                        <IonSelectOption value="425" class="all-option">425</IonSelectOption>
                                                                                        <IonSelectOption value="456A" class="all-option">456A</IonSelectOption>
                                                                                        <IonSelectOption value="460" class="all-option">460</IonSelectOption>
                                                                                        <IonSelectOption value="474" class="all-option">474</IonSelectOption>
                                                                                        <IonSelectOption value="482" class="all-option">482</IonSelectOption>
                                                                                      </>
                                                                                      : postClassName === 'MATH' ?
                                                                                        <>
                                                                                          <IonSelectOption value="101" class="all-option">101</IonSelectOption>
                                                                                          <IonSelectOption value="101I" class="all-option">101I</IonSelectOption>
                                                                                          <IonSelectOption value="101T" class="all-option">101T</IonSelectOption>
                                                                                          <IonSelectOption value="102" class="all-option">102</IonSelectOption>
                                                                                          <IonSelectOption value="103" class="all-option">103</IonSelectOption>
                                                                                          <IonSelectOption value="105" class="all-option">105</IonSelectOption>
                                                                                          <IonSelectOption value="107" class="all-option">107</IonSelectOption>
                                                                                          <IonSelectOption value="109" class="all-option">109</IonSelectOption>
                                                                                          <IonSelectOption value="110" class="all-option">110</IonSelectOption>
                                                                                          <IonSelectOption value="210" class="all-option">210</IonSelectOption>
                                                                                          <IonSelectOption value="245" class="all-option">245</IonSelectOption>
                                                                                          <IonSelectOption value="253" class="all-option">253</IonSelectOption>
                                                                                          <IonSelectOption value="311" class="all-option">311</IonSelectOption>
                                                                                          <IonSelectOption value="315" class="all-option">315</IonSelectOption>
                                                                                          <IonSelectOption value="381" class="all-option">381</IonSelectOption>
                                                                                          <IonSelectOption value="460" class="all-option">460</IonSelectOption>
                                                                                        </>
                                                                                        : postClassName === 'MUS' ?
                                                                                          <>
                                                                                            <IonSelectOption value="104" class="all-option">104</IonSelectOption>
                                                                                            <IonSelectOption value="106B" class="all-option">106B</IonSelectOption>
                                                                                            <IonSelectOption value="106E" class="all-option">106E</IonSelectOption>
                                                                                            <IonSelectOption value="106F" class="all-option">106F</IonSelectOption>
                                                                                            <IonSelectOption value="106H" class="all-option">106H</IonSelectOption>
                                                                                            <IonSelectOption value="106J" class="all-option">106J</IonSelectOption>
                                                                                            <IonSelectOption value="106K" class="all-option">106K</IonSelectOption>
                                                                                            <IonSelectOption value="106N" class="all-option">106N</IonSelectOption>
                                                                                            <IonSelectOption value="106O" class="all-option">106O</IonSelectOption>
                                                                                            <IonSelectOption value="107C" class="all-option">107C</IonSelectOption>
                                                                                            <IonSelectOption value="107F" class="all-option">107F</IonSelectOption>
                                                                                            <IonSelectOption value="107G" class="all-option">107G</IonSelectOption>
                                                                                            <IonSelectOption value="107I" class="all-option">107I</IonSelectOption>
                                                                                            <IonSelectOption value="107J" class="all-option">107J</IonSelectOption>
                                                                                            <IonSelectOption value="107P" class="all-option">107P</IonSelectOption>
                                                                                            <IonSelectOption value="107Q" class="all-option">107Q</IonSelectOption>
                                                                                            <IonSelectOption value="107T" class="all-option">107T</IonSelectOption>
                                                                                            <IonSelectOption value="108G" class="all-option">108G</IonSelectOption>
                                                                                            <IonSelectOption value="108K" class="all-option">108K</IonSelectOption>
                                                                                            <IonSelectOption value="108P" class="all-option">108P</IonSelectOption>
                                                                                            <IonSelectOption value="108T" class="all-option">108T</IonSelectOption>
                                                                                            <IonSelectOption value="108V" class="all-option">108V</IonSelectOption>
                                                                                            <IonSelectOption value="108G" class="all-option">108G</IonSelectOption>
                                                                                            <IonSelectOption value="109G" class="all-option">109G</IonSelectOption>
                                                                                            <IonSelectOption value="110" class="all-option">110</IonSelectOption>
                                                                                            <IonSelectOption value="112" class="all-option">112</IonSelectOption>
                                                                                            <IonSelectOption value="130" class="all-option">130</IonSelectOption>
                                                                                            <IonSelectOption value="180" class="all-option">180</IonSelectOption>
                                                                                            <IonSelectOption value="215" class="all-option">215</IonSelectOption>
                                                                                            <IonSelectOption value="217" class="all-option">217</IonSelectOption>
                                                                                            <IonSelectOption value="220" class="all-option">220</IonSelectOption>
                                                                                            <IonSelectOption value="221" class="all-option">221</IonSelectOption>
                                                                                            <IonSelectOption value="222" class="all-option">222</IonSelectOption>
                                                                                            <IonSelectOption value="223" class="all-option">223</IonSelectOption>
                                                                                            <IonSelectOption value="224" class="all-option">224</IonSelectOption>
                                                                                            <IonSelectOption value="225" class="all-option">225</IonSelectOption>
                                                                                            <IonSelectOption value="226" class="all-option">226</IonSelectOption>
                                                                                            <IonSelectOption value="227" class="all-option">227</IonSelectOption>
                                                                                            <IonSelectOption value="228" class="all-option">228</IonSelectOption>
                                                                                            <IonSelectOption value="229" class="all-option">229</IonSelectOption>
                                                                                            <IonSelectOption value="230" class="all-option">230</IonSelectOption>
                                                                                            <IonSelectOption value="231" class="all-option">231</IonSelectOption>
                                                                                            <IonSelectOption value="232" class="all-option">232</IonSelectOption>
                                                                                            <IonSelectOption value="233" class="all-option">233</IonSelectOption>
                                                                                            <IonSelectOption value="234" class="all-option">234</IonSelectOption>
                                                                                            <IonSelectOption value="235" class="all-option">235</IonSelectOption>
                                                                                            <IonSelectOption value="236" class="all-option">236</IonSelectOption>
                                                                                            <IonSelectOption value="237" class="all-option">237</IonSelectOption>
                                                                                            <IonSelectOption value="238" class="all-option">238</IonSelectOption>
                                                                                            <IonSelectOption value="301" class="all-option">301</IonSelectOption>
                                                                                            <IonSelectOption value="302" class="all-option">302</IonSelectOption>
                                                                                            <IonSelectOption value="305" class="all-option">305</IonSelectOption>
                                                                                            <IonSelectOption value="314" class="all-option">314</IonSelectOption>
                                                                                            <IonSelectOption value="316" class="all-option">316</IonSelectOption>
                                                                                            <IonSelectOption value="319" class="all-option">319</IonSelectOption>
                                                                                            <IonSelectOption value="324" class="all-option">324</IonSelectOption>
                                                                                            <IonSelectOption value="330" class="all-option">330</IonSelectOption>
                                                                                            <IonSelectOption value="334" class="all-option">334</IonSelectOption>
                                                                                            <IonSelectOption value="338" class="all-option">338</IonSelectOption>
                                                                                            <IonSelectOption value="340" class="all-option">340</IonSelectOption>
                                                                                            <IonSelectOption value="348" class="all-option">348</IonSelectOption>
                                                                                            <IonSelectOption value="353" class="all-option">353</IonSelectOption>
                                                                                            <IonSelectOption value="361" class="all-option">361</IonSelectOption>
                                                                                          </>
                                                                                          : postClassName === 'NAS' ?
                                                                                            <>
                                                                                              <IonSelectOption value="104" class="all-option">104</IonSelectOption>
                                                                                              <IonSelectOption value="107" class="all-option">107</IonSelectOption>
                                                                                              <IonSelectOption value="200" class="all-option">200</IonSelectOption>
                                                                                              <IonSelectOption value="302" class="all-option">302</IonSelectOption>
                                                                                              <IonSelectOption value="306" class="all-option">306</IonSelectOption>
                                                                                              <IonSelectOption value="307" class="all-option">307</IonSelectOption>
                                                                                              <IonSelectOption value="331" class="all-option">331</IonSelectOption>
                                                                                              <IonSelectOption value="332" class="all-option">332</IonSelectOption>
                                                                                              <IonSelectOption value="333" class="all-option">333</IonSelectOption>
                                                                                              <IonSelectOption value="340" class="all-option">340</IonSelectOption>
                                                                                              <IonSelectOption value="364" class="all-option">364</IonSelectOption>
                                                                                            </>
                                                                                            : postClassName === 'OCN' ?
                                                                                              <>
                                                                                                <IonSelectOption value="109" class="all-option">109</IonSelectOption>
                                                                                                <IonSelectOption value="260" class="all-option">260</IonSelectOption>
                                                                                                <IonSelectOption value="301" class="all-option">301</IonSelectOption>
                                                                                                <IonSelectOption value="310" class="all-option">310</IonSelectOption>
                                                                                                <IonSelectOption value="340" class="all-option">340</IonSelectOption>
                                                                                                <IonSelectOption value="370" class="all-option">370</IonSelectOption>
                                                                                                <IonSelectOption value="496" class="all-option">496</IonSelectOption>
                                                                                              </>
                                                                                              : postClassName === 'PHIL' ?
                                                                                                <>
                                                                                                  <IonSelectOption value="100" class="all-option">100</IonSelectOption>
                                                                                                  <IonSelectOption value="104" class="all-option">104</IonSelectOption>
                                                                                                  <IonSelectOption value="106" class="all-option">106</IonSelectOption>
                                                                                                  <IonSelectOption value="107" class="all-option">107</IonSelectOption>
                                                                                                  <IonSelectOption value="198" class="all-option">198</IonSelectOption>
                                                                                                  <IonSelectOption value="210" class="all-option">210</IonSelectOption>
                                                                                                  <IonSelectOption value="302" class="all-option">302</IonSelectOption>
                                                                                                  <IonSelectOption value="304" class="all-option">304</IonSelectOption>
                                                                                                  <IonSelectOption value="306" class="all-option">306</IonSelectOption>
                                                                                                  <IonSelectOption value="307" class="all-option">307</IonSelectOption>
                                                                                                  <IonSelectOption value="371" class="all-option">371</IonSelectOption>
                                                                                                  <IonSelectOption value="420" class="all-option">420</IonSelectOption>
                                                                                                  <IonSelectOption value="480" class="all-option">480</IonSelectOption>
                                                                                                </>
                                                                                                : postClassName === 'PSCI' ?
                                                                                                  <>
                                                                                                    <IonSelectOption value="110" class="all-option">110</IonSelectOption>
                                                                                                    <IonSelectOption value="159" class="all-option">159</IonSelectOption>
                                                                                                    <IonSelectOption value="220" class="all-option">220</IonSelectOption>
                                                                                                    <IonSelectOption value="235" class="all-option">235</IonSelectOption>
                                                                                                    <IonSelectOption value="240" class="all-option">240</IonSelectOption>
                                                                                                    <IonSelectOption value="280" class="all-option">280</IonSelectOption>
                                                                                                    <IonSelectOption value="295" class="all-option">295</IonSelectOption>
                                                                                                    <IonSelectOption value="303" class="all-option">303</IonSelectOption>
                                                                                                    <IonSelectOption value="305" class="all-option">305</IonSelectOption>
                                                                                                    <IonSelectOption value="306" class="all-option">306</IonSelectOption>
                                                                                                    <IonSelectOption value="317" class="all-option">317</IonSelectOption>
                                                                                                    <IonSelectOption value="354" class="all-option">354</IonSelectOption>
                                                                                                    <IonSelectOption value="360" class="all-option">360</IonSelectOption>
                                                                                                    <IonSelectOption value="373" class="all-option">373</IonSelectOption>
                                                                                                    <IonSelectOption value="381S" class="all-option">381S</IonSelectOption>
                                                                                                    <IonSelectOption value="412" class="all-option">413</IonSelectOption>
                                                                                                    <IonSelectOption value="485" class="all-option">485</IonSelectOption>
                                                                                                  </>
                                                                                                  : postClassName === 'PSYC' ?
                                                                                                    <>
                                                                                                      <IonSelectOption value="100" class="all-option">100</IonSelectOption>
                                                                                                      <IonSelectOption value="104" class="all-option">104</IonSelectOption>
                                                                                                      <IonSelectOption value="109" class="all-option">109</IonSelectOption>
                                                                                                      <IonSelectOption value="198" class="all-option">198</IonSelectOption>
                                                                                                      <IonSelectOption value="240" class="all-option">240</IonSelectOption>
                                                                                                      <IonSelectOption value="300" class="all-option">300</IonSelectOption>
                                                                                                      <IonSelectOption value="302" class="all-option">302</IonSelectOption>
                                                                                                      <IonSelectOption value="303" class="all-option">303</IonSelectOption>
                                                                                                      <IonSelectOption value="306" class="all-option">306</IonSelectOption>
                                                                                                      <IonSelectOption value="311" class="all-option">311</IonSelectOption>
                                                                                                      <IonSelectOption value="321" class="all-option">321</IonSelectOption>
                                                                                                      <IonSelectOption value="322" class="all-option">322</IonSelectOption>
                                                                                                      <IonSelectOption value="323" class="all-option">323</IonSelectOption>
                                                                                                      <IonSelectOption value="324" class="all-option">324</IonSelectOption>
                                                                                                      <IonSelectOption value="335" class="all-option">335</IonSelectOption>
                                                                                                      <IonSelectOption value="336" class="all-option">336</IonSelectOption>
                                                                                                      <IonSelectOption value="337" class="all-option">337</IonSelectOption>
                                                                                                      <IonSelectOption value="338" class="all-option">338</IonSelectOption>
                                                                                                      <IonSelectOption value="345" class="all-option">345</IonSelectOption>
                                                                                                      <IonSelectOption value="411" class="all-option">411</IonSelectOption>
                                                                                                      <IonSelectOption value="414" class="all-option">414</IonSelectOption>
                                                                                                      <IonSelectOption value="415" class="all-option">415</IonSelectOption>
                                                                                                      <IonSelectOption value="419" class="all-option">419</IonSelectOption>
                                                                                                      <IonSelectOption value="436" class="all-option">436</IonSelectOption>
                                                                                                      <IonSelectOption value="454" class="all-option">454</IonSelectOption>
                                                                                                      <IonSelectOption value="473" class="all-option">473</IonSelectOption>
                                                                                                      <IonSelectOption value="486" class="all-option">486</IonSelectOption>
                                                                                                      <IonSelectOption value="489S" class="all-option">489S</IonSelectOption>
                                                                                                      <IonSelectOption value="490" class="all-option">490</IonSelectOption>
                                                                                                      <IonSelectOption value="495" class="all-option">495</IonSelectOption>
                                                                                                      <IonSelectOption value="497" class="all-option">497</IonSelectOption>
                                                                                                      <IonSelectOption value="499" class="all-option">499</IonSelectOption>
                                                                                                      <IonSelectOption value="511" class="all-option">511</IonSelectOption>
                                                                                                      <IonSelectOption value="605" class="all-option">605</IonSelectOption>
                                                                                                      <IonSelectOption value="607" class="all-option">607</IonSelectOption>
                                                                                                      <IonSelectOption value="616" class="all-option">616</IonSelectOption>
                                                                                                      <IonSelectOption value="622" class="all-option">622</IonSelectOption>
                                                                                                      <IonSelectOption value="632" class="all-option">632</IonSelectOption>
                                                                                                      <IonSelectOption value="641" class="all-option">641</IonSelectOption>
                                                                                                      <IonSelectOption value="647" class="all-option">647</IonSelectOption>
                                                                                                      <IonSelectOption value="652" class="all-option">652</IonSelectOption>
                                                                                                      <IonSelectOption value="653" class="all-option">653</IonSelectOption>
                                                                                                      <IonSelectOption value="654" class="all-option">654</IonSelectOption>
                                                                                                      <IonSelectOption value="657" class="all-option">657</IonSelectOption>
                                                                                                      <IonSelectOption value="658" class="all-option">658</IonSelectOption>
                                                                                                      <IonSelectOption value="659" class="all-option">659</IonSelectOption>
                                                                                                      <IonSelectOption value="662" class="all-option">662</IonSelectOption>
                                                                                                      <IonSelectOption value="673" class="all-option">673</IonSelectOption>
                                                                                                      <IonSelectOption value="676" class="all-option">676</IonSelectOption>
                                                                                                      <IonSelectOption value="680" class="all-option">680</IonSelectOption>
                                                                                                      <IonSelectOption value="690" class="all-option">690</IonSelectOption>
                                                                                                    </>
                                                                                                    : postClassName === 'RS' ?
                                                                                                      <>
                                                                                                        <IonSelectOption value="105" class="all-option">105</IonSelectOption>
                                                                                                        <IonSelectOption value="120" class="all-option">120</IonSelectOption>
                                                                                                        <IonSelectOption value="300" class="all-option">300</IonSelectOption>
                                                                                                        <IonSelectOption value="332" class="all-option">332</IonSelectOption>
                                                                                                        <IonSelectOption value="393" class="all-option">393</IonSelectOption>
                                                                                                        <IonSelectOption value="394" class="all-option">394</IonSelectOption>
                                                                                                      </>
                                                                                                      : postClassName === 'SPAN' ?
                                                                                                        <>
                                                                                                          <IonSelectOption value="105" class="all-option">105</IonSelectOption>
                                                                                                          <IonSelectOption value="106" class="all-option">106</IonSelectOption>
                                                                                                          <IonSelectOption value="107" class="all-option">107</IonSelectOption>
                                                                                                          <IonSelectOption value="108" class="all-option">108</IonSelectOption>
                                                                                                          <IonSelectOption value="207" class="all-option">207</IonSelectOption>
                                                                                                          <IonSelectOption value="308" class="all-option">308</IonSelectOption>
                                                                                                          <IonSelectOption value="313" class="all-option">313</IonSelectOption>
                                                                                                          <IonSelectOption value="343" class="all-option">343</IonSelectOption>
                                                                                                          <IonSelectOption value="345" class="all-option">345</IonSelectOption>
                                                                                                          <IonSelectOption value="370" class="all-option">370</IonSelectOption>
                                                                                                        </>
                                                                                                        : postClassName === 'STAT' ?
                                                                                                          <>
                                                                                                            <IonSelectOption value="108" class="all-option">108</IonSelectOption>
                                                                                                            <IonSelectOption value="109" class="all-option">109</IonSelectOption>
                                                                                                            <IonSelectOption value="323" class="all-option">323</IonSelectOption>
                                                                                                            <IonSelectOption value="333" class="all-option">333</IonSelectOption>
                                                                                                            <IonSelectOption value="410" class="all-option">410</IonSelectOption>
                                                                                                            <IonSelectOption value="510" class="all-option">510</IonSelectOption>
                                                                                                          </>
                                                                                                          : postClassName === 'TA' ?
                                                                                                            <>
                                                                                                              <IonSelectOption value="104" class="all-option">104</IonSelectOption>
                                                                                                              <IonSelectOption value="105" class="all-option">105</IonSelectOption>
                                                                                                              <IonSelectOption value="106" class="all-option">106</IonSelectOption>
                                                                                                              <IonSelectOption value="107" class="all-option">107</IonSelectOption>
                                                                                                              <IonSelectOption value="231" class="all-option">231</IonSelectOption>
                                                                                                              <IonSelectOption value="237" class="all-option">237</IonSelectOption>
                                                                                                              <IonSelectOption value="328" class="all-option">328</IonSelectOption>
                                                                                                              <IonSelectOption value="336" class="all-option">336</IonSelectOption>
                                                                                                              <IonSelectOption value="340" class="all-option">340</IonSelectOption>
                                                                                                              <IonSelectOption value="494" class="all-option">494</IonSelectOption>
                                                                                                            </>
                                                                                                            : postClassName === 'WLDF' ?
                                                                                                              <>
                                                                                                                <IonSelectOption value="111" class="all-option">111</IonSelectOption>
                                                                                                                <IonSelectOption value="210" class="all-option">210</IonSelectOption>
                                                                                                                <IonSelectOption value="244" class="all-option">244</IonSelectOption>
                                                                                                                <IonSelectOption value="301" class="all-option">301</IonSelectOption>
                                                                                                                <IonSelectOption value="311" class="all-option">311</IonSelectOption>
                                                                                                                <IonSelectOption value="365" class="all-option">365</IonSelectOption>
                                                                                                                <IonSelectOption value="422" class="all-option">422</IonSelectOption>
                                                                                                                <IonSelectOption value="423" class="all-option">423</IonSelectOption>
                                                                                                                <IonSelectOption value="430" class="all-option">430</IonSelectOption>
                                                                                                                <IonSelectOption value="460" class="all-option">460</IonSelectOption>
                                                                                                                <IonSelectOption value="468" class="all-option">468</IonSelectOption>
                                                                                                                <IonSelectOption value="475" class="all-option">475</IonSelectOption>
                                                                                                                <IonSelectOption value="478" class="all-option">478</IonSelectOption>
                                                                                                              </>
                                                                                                              : postClassName === 'ZOOL' ?
                                                                                                                <>
                                                                                                                  <IonSelectOption value="110" class="all-option">110</IonSelectOption>
                                                                                                                  <IonSelectOption value="113" class="all-option">113</IonSelectOption>
                                                                                                                  <IonSelectOption value="198" class="all-option">198</IonSelectOption>
                                                                                                                  <IonSelectOption value="270" class="all-option">270</IonSelectOption>
                                                                                                                  <IonSelectOption value="310" class="all-option">310</IonSelectOption>
                                                                                                                  <IonSelectOption value="314" class="all-option">314</IonSelectOption>
                                                                                                                  <IonSelectOption value="356" class="all-option">356</IonSelectOption>
                                                                                                                  <IonSelectOption value="358" class="all-option">358</IonSelectOption>
                                                                                                                  <IonSelectOption value="370" class="all-option">370</IonSelectOption>
                                                                                                                </>
                                                                                                                : null

                  }
                </>
              </IonSelect>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
      </>

      <IonContent fullscreen scrollY={false}>

        {classPosts && classPosts.length == 0 &&
          <div className="ion-spinner">
            <p style={{ textAlign: "center", width : "75vw", fontSize : "0.85em" }}>No posts matching section number</p>
            <p style={{ textAlign: "center", fontWeight: "bold", fontSize : "0.9em"}}> Be the first to post about this class!</p>
          </div>
        }

        <Virtuoso
          className="ion-content-scroll-host"
          data={classPosts}
          style={{ height: "100%" }}
          itemContent={(item: number) => {
            if (classPosts && classPosts.length > 0) {
              let post = classPosts[item];
              return (
                <FadeIn key={post.key}>
                  <IonList inset={true} mode="ios">
                    <IonItem lines="none" mode="ios" onClick={() => { history.push("/post/" + schoolName + "/" + post.userName + "/" + post.key); }}>
                      <IonLabel class="ion-text-wrap">
                        <IonText color="medium">
                          <FadeIn>
                            <IonAvatar
                              onClick={(e) => {
                                e.stopPropagation();
                                history.push('/about/' + schoolName + "/" + post.uid);
                              }}
                              class="posts-avatar"
                            >
                              <ProfilePhoto uid={post.uid}></ProfilePhoto>
                            </IonAvatar>
                          </FadeIn>
                          <p>
                            {post.userName}
                          </p>
                        </IonText>
                        {post.postType ? (
                          <IonFab vertical="top" horizontal="end">
                            {post.postType !== "general" ?
                              <p
                                style={{
                                  fontWeight: "bold",
                                  color: getColor(post.postType),
                                }}
                              >
                                {post.postType.toUpperCase()}
                                &nbsp;
                                {post.marker ? (
                                  <RoomIcon
                                    style={{ fontSize: "1em" }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      localStorage.setItem("lat", (post.location[0].toString()));
                                      localStorage.setItem("long", (post.location[1].toString()));
                                      history.push("maps");
                                    }}
                                  />
                                ) : null}
                              </p>
                              :
                              <p
                                style={{
                                  fontWeight: "bold",
                                  color: getColor(post.postType),
                                  marginLeft: "75%"
                                }}
                              >
                                {post.marker ? (
                                  <RoomIcon onClick={(e) => {
                                    e.stopPropagation();
                                    localStorage.setItem("lat", (post.location[0].toString()));
                                    localStorage.setItem("long", (post.location[1].toString()));
                                    history.push("maps");
                                  }}
                                    style={{ fontSize: "1em" }} />) : null}
                              </p>
                            }
                            <IonNote style={{ fontSize: "0.85em" }}>
                              {getDate(post.timestamp)}
                            </IonNote>
                          </IonFab>
                        ) :
                          (
                            <IonFab vertical="top" horizontal="end">
                              <IonNote style={{ fontSize: "0.85em" }}>
                                {getDate(post.timestamp)}
                              </IonNote>
                            </IonFab>
                          )}
                        <div style={{ height: "0.75vh" }}>{" "}</div>
                        {"className" in post && "classNumber" in post ?
                          <Linkify tagName="h3" className="h2-message">
                            {post.message}
                            <IonNote
                              color="medium"
                              style={{ fontWeight: "400" }}
                            >
                              &nbsp; — {post.className} {post.classNumber}
                            </IonNote>
                          </Linkify>
                          :
                          <Linkify tagName="h3" className="h2-message">
                            {post.message}
                          </Linkify>
                        }

                        {"imgSrc" in post && post.imgSrc &&
                          post.imgSrc.length == 1 &&
                          <>
                            <div style={{ height: "0.75vh" }}>{" "}</div>
                            <div
                              className="ion-img-container"
                              style={{ backgroundImage: `url(${post.imgSrc[0]})`, borderRadius: '10px' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                const img: CapacitorImage = {
                                  url: post.imgSrc[0],
                                  title: `${post.userName}'s post`
                                };
                                CapacitorPhotoViewer.show({
                                  images: [img],
                                  mode: 'one',
                                  options: {
                                    title: true
                                  }
                                }).catch((err) => {
                                  const toast = Toast.create({ message: 'Unable to open image', duration: 2000, color: 'toast-error' });
                                  toast.present();
                                });
                              }}
                            >
                            </div>
                          </>
                        }
                        {"imgSrc" in post && post.imgSrc &&
                          post.imgSrc.length == 2 ? (
                          <>
                            <div style={{ height: "0.75vh" }}>{" "}</div>
                            <IonRow>
                              <IonCol>
                                <div
                                  className="ion-img-container"
                                  style={{ backgroundImage: `url(${post.imgSrc[0]})`, borderRadius: '10px' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const img: CapacitorImage[] = [
                                      {
                                        url: post.imgSrc[0],
                                        title: `${post.userName}'s post`
                                      },
                                      {
                                        url: post.imgSrc[1],
                                        title: `${post.userName}'s post`
                                      },
                                    ]
                                    CapacitorPhotoViewer.show({
                                      images: img,
                                      mode: 'slider',
                                      options: {
                                        title: true,
                                      },
                                      startFrom: 0,
                                    }).catch((err) => {
                                      const toast = Toast.create({ message: 'Unable to open image on wen version', duration: 2000, color: 'toast-error' });
                                      toast.present();
                                    });
                                  }}
                                >
                                </div>
                              </IonCol>
                              <IonCol>
                                <div
                                  className="ion-img-container"
                                  style={{ backgroundImage: `url(${post.imgSrc[1]})`, borderRadius: '10px' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const img: CapacitorImage[] = [
                                      {
                                        url: post.imgSrc[0],
                                        title: `${post.userName}'s post`
                                      },
                                      {
                                        url: post.imgSrc[1],
                                        title: `${post.userName}'s post`
                                      },
                                    ]
                                    CapacitorPhotoViewer.show({
                                      images: img,
                                      mode: 'slider',
                                      options: {
                                        title: true
                                      },
                                      startFrom: 1,
                                    }).catch((err) => {
                                      const toast = Toast.create({ message: 'Unable to open image on web version', duration: 2000, color: 'toast-error' });
                                      toast.present();
                                    });
                                  }}
                                >
                                </div>
                              </IonCol>
                            </IonRow>
                          </>
                        ) : null}
                        {"imgSrc" in post && post.imgSrc &&
                          post.imgSrc.length >= 3 ? (
                          <>
                            <div style={{ height: "0.75vh" }}>{" "}</div>
                            <IonRow>
                              <IonCol>
                                <div
                                  className="ion-img-container"
                                  style={{ backgroundImage: `url(${post.imgSrc[0]})`, borderRadius: '10px' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const img: CapacitorImage[] = [
                                      {
                                        url: post.imgSrc[0],
                                        title: `${post.userName}'s post`
                                      },
                                      {
                                        url: post.imgSrc[1],
                                        title: `${post.userName}'s post`
                                      },
                                      {
                                        url: post.imgSrc[2],
                                        title: `${post.userName}'s post`
                                      },
                                    ]
                                    CapacitorPhotoViewer.show({
                                      images: img,
                                      mode: 'slider',
                                      options: {
                                        title: true
                                      },
                                      startFrom: 0,
                                    }).catch((err) => {
                                      const toast = Toast.create({ message: 'Unable to open image', duration: 2000, color: 'toast-error' });
                                      toast.present();
                                    });
                                  }}
                                >
                                </div>
                              </IonCol>
                              <IonCol>
                                <div
                                  className="ion-img-container"
                                  style={{ backgroundImage: `url(${post.imgSrc[1]})`, borderRadius: '10px' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const img: CapacitorImage[] = [
                                      {
                                        url: post.imgSrc[0],
                                        title: `${post.userName}'s post`
                                      },
                                      {
                                        url: post.imgSrc[1],
                                        title: `${post.userName}'s post`
                                      },
                                      {
                                        url: post.imgSrc[2],
                                        title: `${post.userName}'s post`
                                      },
                                    ]
                                    CapacitorPhotoViewer.show({
                                      images: img,
                                      mode: 'slider',
                                      options: {
                                        title: true
                                      },
                                      startFrom: 1,
                                    }).catch((err) => {
                                      const toast = Toast.create({ message: 'Unable to open image', duration: 2000, color: 'toast-error' });
                                      toast.present();
                                    });
                                  }}
                                >
                                </div>
                              </IonCol>
                            </IonRow>
                            <>
                              <div style={{ height: "0.75vh" }}>{" "}</div>
                              <div
                                className="ion-img-container"
                                style={{ backgroundImage: `url(${post.imgSrc[2]})`, borderRadius: '20px' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const img: CapacitorImage[] = [
                                    {
                                      url: post.imgSrc[0],
                                      title: `${post.userName}'s post`
                                    },
                                    {
                                      url: post.imgSrc[1],
                                      title: `${post.userName}'s post`
                                    },
                                    {
                                      url: post.imgSrc[2],
                                      title: `${post.userName}'s post`
                                    },
                                  ]
                                  CapacitorPhotoViewer.show({
                                    images: img,
                                    mode: 'slider',
                                    options: {
                                      title: true
                                    },
                                    startFrom: 2,
                                  }).catch((err) => {
                                    const toast = Toast.create({ message: 'Unable to open image', duration: 2000, color: 'toast-error' });
                                    toast.present();
                                  });
                                }}
                              >
                              </div>
                            </>
                          </>
                        ) : null}
                      </IonLabel>
                    </IonItem>
                  </IonList>
                </FadeIn>
              )
            }
            return (
              <div className="ion-spinner">
                <IonSpinner
                  color={
                    schoolName === "Cal Poly Humboldt"
                      && context.schoolColorToggled
                      ? "tertiary"
                      : "primary"
                  }
                />
              </div>
            )
          }}
          components={{ Footer }}
        />
      </IonContent>
    </IonPage >
  )

};

export default Class;