import { IonFab, IonItem, IonSelect, IonSelectOption } from "@ionic/react";
import { memo, useEffect, useState } from "react";
import { useContext } from "../../my-context";
import { classSelections } from "../../helpers/class-selections-config";

type classInfo = {
  schoolName: string;
  postClassName: string | undefined;
  postClassNumber: string | undefined;
  setPostClassNumber: any;
  setPostClassName: any;
}

/**
 * Component for selecting class and corresponding class number when making a post
 * 
 * @param {classInfo} props 
 * @returns IonSelection interface 
 */
export const ClassSelections = memo((props: classInfo) => {
  const [selectOptions, setSelectOptions] = useState<any>({});
  const [selectOptionsNumber, setSelectOptionsNumber] = useState<any>({});

  const context = useContext();

  const schoolName = props.schoolName;
  const postClassName = props.postClassName;
  const postClassNumber = props.postClassNumber;
  const setPostClassName = props.setPostClassName;
  const setPostClassNumber = props.setPostClassNumber;

  useEffect(() => {
    setSelectOptions({
      header: 'Class',
      subHeader: 'Select a class to post about',
      cssClass: 'custom-alert'
    });
    setSelectOptionsNumber({
      header: 'Class Number',
      subHeader: 'Select a class number',
      cssClass: 'custom-alert'
    });
  }, []);

  if (schoolName) {
    return (
      <IonFab horizontal="start" style={{ textAlign: "center", alignItems: "center", alignSelf: "center", display: "flex", paddingTop: "" }}>

        <IonItem className="class-name-selection" mode="ios" color={context.darkMode ? "light-item" : "light"}>
          <IonSelect aria-label="" interface="action-sheet" interfaceOptions={selectOptions} okText="Select" cancelText="Cancel" mode="ios" value={postClassName} placeholder="Class: "
            onIonChange={(e: any) => {
              setPostClassNumber("");
              setPostClassName(e.detail.value);
            }}
          >
            {Object.keys(classSelections[schoolName]).map((className: string, index: number) => {
              return (
                <IonSelectOption key={index} value={className}>{className}</IonSelectOption>
              );
            })}
          </IonSelect>
        </IonItem>

        {postClassName && postClassName.length > 0 &&
          <>
            <div style={{ width: "1%" }}></div>
            <IonItem className='class-number-selection' color={context.darkMode ? "light-item" : "light"}>
              <IonSelect interface="action-sheet" interfaceOptions={selectOptionsNumber} okText="Select" cancelText="Cancel" mode="ios" value={postClassNumber} placeholder="#:"
                onIonChange={(e: any) => {
                  setPostClassNumber(e.detail.value);
                }}
              >
                {classSelections[schoolName][postClassName].map((classNumber: string, index: number) => {
                  return (
                    <IonSelectOption key={index} value={classNumber}>{classNumber}</IonSelectOption>
                  );
                })}
              </IonSelect>
            </IonItem>
          </>
        }
      </IonFab>
    );
  }

  return null;
});