import "./App.css";
import Canvas from "./canvas";
import MagicInput from "./input";
import CheckBox from "./checkBox";
import SelectBox from "./selectBox";
import Variable from "./variable";

import { MdAdd, MdClose, MdArrowDropDown, MdArrowDropUp } from "react-icons/md";
import React, { useState } from "react";
import myMath from "./Math";

import sample from "./sample";

const App = () => {
  //find random color
  const newColor = () =>
    Math.floor(Math.random() * 8388607 + 6388607).toString(16);
  //constructor of new data
  const newData = function (
    idData,
    idDirective = false,
    idColor = "rand",
    idDirectiveColor = "rand",
    idVisible = true,
    idHidden = false
  ) {
    return {
      id: idData,
      data: [],
      text: "",
      color: idColor === "rand" ? newColor() : idColor,
      directiveColor:
        idDirectiveColor === "rand" ? newColor() : idDirectiveColor,
      directive: idDirective,
      angle: false,
      visible: idVisible,
      hidden: idHidden,
    };
  };
  //constructor of new variable
  const newVariable = function (
    id,
    name,
    value = 0,
    range = [-10, 10],
    step = 0.1,
    hidden = false,
    restricted = false
  ) {
    return {
      id: id,
      name: name,
      range: range,
      value: value,
      step: step,
      hidden: hidden,
      restricted: restricted,
    };
  };
  //self MAIN data
  const [data, setData] = useState([newData(1, false, "459BE6", "E64545")]);
  //self Variable
  const [variable, setVariable] = useState([]);
  //settings of view
  const [settingsGrid, setSettingsGrid] = useState({
    darkTheme:
      (localStorage.getItem("darkTheme") === "true" ? true : false) | false,
    pi: (localStorage.getItem("pi") === "true" ? true : false) | false,
    disableDirective: false,
    preview: false,
    //CHANGE TO TRUE
    hideSettings: true,
    hideCaption: false,
  });
  //is open keyboard
  const [isKeyboard, setStatusKeyboard] = useState(false);
  //name of Sample
  const [name, setName] = useState("");
  //caption of Sample
  const [caption, setCaption] = useState("");
  //input Function
  const inputFunction = function (i) {
    setSettingsGrid({
      ...settingsGrid,
      disableDirective: true,
    });
    setVariable(JSON.parse(JSON.stringify(sample[i].variable)));
    setData(JSON.parse(JSON.stringify(sample[i].data)));
    setName(sample[i].name);
    if(Array.isArray(sample[i].caption))
    setCaption(sample[i].caption[0] + sample[i].caption[1]);
    else
    setCaption(sample[i].caption);
  };
  //default Function
  const toDefault = function () {
    setSettingsGrid({
      ...settingsGrid,
      disableDirective: false,
    });
    //console.log(data[0].directive);
    setData([newData(1, false, "459BE6", "E64545")]);
    setVariable([]);
    setName("");
    setCaption("");
  };
  //check Variable(or create new)
  const checkerVariable = function (index, i) {
    for (let v of variable) {
      if (v.name === i) {
        v.index = index;
        return v;
      }
    }
    return newVariable(index, i);
  };
  //name component
  const nameComponent =
    name === "" ? (
      <></>
    ) : (
      <div className="nameSample">
        {name}
        {caption !== "" && (
          <button
            className="hideCaption"
            onClick={() => {
              setSettingsGrid({
                ...settingsGrid,
                hideCaption: !settingsGrid.hideCaption,
              });
            }}
          >
            {settingsGrid.hideCaption ? <MdArrowDropDown /> : <MdArrowDropUp />}
          </button>
        )}
      </div>
    );
  //caption component
  function createCaptionComponent() {
    return { __html: caption };
  }
  const captionComponent =
    caption === "" ? (
      <></>
    ) : (
      <div className="captionSample" hidden={settingsGrid.hideCaption}>
        <div dangerouslySetInnerHTML={createCaptionComponent()}></div>
      </div>
    );
  //animation function
  function Animation(id, alpha, duration){
    //vector to what side 
    let vector = myMath.sign(alpha);
    //delta of changing variable
    alpha = myMath.abs(alpha)
    //setting timer
    let timer = setInterval(function () {
      //check if you can move
      let stat = false;
      variable.map((x) => {
          if (x.id === id) {
            if(x.anim[2] === true){
              stat = true;
            }
          }
          return x;
        });
      //anim stop
      if (stat === false) {
        clearInterval(timer);
        return;
      }
      //change to new variable
      setVariable(
        variable.map((x) => {
          if (x.id === id) {
            if(Math.abs(x.range[1] - x.value) < alpha && vector === 1){
              vector = -1;
            }else if (Math.abs(x.range[0] - x.value) < alpha && vector === -1) {
              vector = 1;
            }
            
            x.value = myMath.round(x.value + alpha * vector, 2);
          }
          return x;
        })
      );

    }, duration*1000);

  }
  //Preview
  const closePreview = function() {
    setSettingsGrid({
      ...settingsGrid,
      preview: false,
    });
  }
  const openPreview = function () {
    setSettingsGrid({
      ...settingsGrid,
      preview: true,
    });
  };
  //Preview component
  const preview = settingsGrid.preview ? (
    <div className={"preview"}>
      <div className="ext" onClick={closePreview}>
        <MdClose />
      </div>
      <div className="lit">
        Дніпровський науковий ліцей інформаційних технологій Дніпровської
        <br />
        міської ради (ДНЛІТ ДМР)
      </div>
      <div className="topic">Математика графічного калькулятора</div>
      <div className="performer">
        <b>Роботу виконав:</b>
        <br />
        Єжолов Кирило Сергійович, 11-А
      </div>
      <div className="supervisor">
        <b>Куратор з математики:</b>Сотніченко Олена Віталіївна
        <br />
        <b>Куратор з програмування:</b>Боровик Людмила Іванівна
      </div>
    </div>
  ) : (
    <></>
  );
  //Main component
  return (
    <div
      className={
        "App" +
        (settingsGrid.darkTheme ? " dark" : " light") +
        (settingsGrid.preview ? " preview" : "")
      }
    >
      {preview}
      {nameComponent}
      {captionComponent}
      <Canvas
        className="canvas"
        data={data}
        settingsGrid={settingsGrid}
        variable={variable}
        handleVariable={(names) => {
          let d = names.map((name, i) => checkerVariable(i, name));
          if (JSON.stringify(d) !== JSON.stringify(variable)) setVariable(d);
        }}
      />

      <div className="Settings">
        <h1>Налаштування</h1>
        <button className="hideSettings" onClick={() => {
          setSettingsGrid({
            ...settingsGrid,
            hideSettings: !settingsGrid.hideSettings,
          });
        }}>
          {settingsGrid.hideSettings ? <MdArrowDropDown /> : <MdArrowDropUp/>}
        </button>
        <CheckBox
          label="π"
          id="piSettings"
          checked={settingsGrid.pi}
          hidden={settingsGrid.hideSettings}
          onChange={() => {
            //change to Pi
            setSettingsGrid({
              ...settingsGrid,
              pi: !settingsGrid.pi,
            });
            //change setting in localStorage
            localStorage.setItem("pi", !settingsGrid.pi);
          }}
        ></CheckBox>
        <CheckBox
          label="Темна тема"
          id="darktheme"
          checked={settingsGrid.darkTheme}
          hidden={settingsGrid.hideSettings}
          onChange={() => {
            //change theme of view
            setSettingsGrid({
              ...settingsGrid,
              darkTheme: !settingsGrid.darkTheme,
            });
            //change theme in localStorage
            localStorage.setItem("darkTheme", !settingsGrid.darkTheme);
          }}
        ></CheckBox>
        <CheckBox
          label="Похідна"
          id="deretive"
          checked={data[0].directive}
          disabled={settingsGrid.disableDirective}
          hidden={settingsGrid.hideSettings}
          onChange={() => {
            //change directive to all
            setData(
              data.map((set) => {
                set.directive = !set.directive;
                return set;
              })
            );
          }}
        ></CheckBox>
        <p className="sampleTitle">Приклади:</p>
        <SelectBox
          data={sample}
          event={(index) => {
            //set new Sample
            if (index === "none") return toDefault();
            inputFunction(index.slice(6));
          }}
        />
      </div>
      <div className="about" onClick={openPreview}>
        Про проект
      </div>
      <div className={isKeyboard ? "inputs openKeyboard" : "inputs"}>
        <div className="inputIn">
          <button
            className="addInput"
            onClick={() => {
              //add new input
              setData([
                ...data,
                newData(data.at(-1).id + 1, data.at(-1).directive),
              ]);
            }}
          >
            <MdAdd />
          </button>
          {data
            .filter((d) => d.hidden === false)
            .map((exemplerData, index) => (
              <MagicInput
                key={"input" + exemplerData.id}
                id={"input" + exemplerData.id}
                l={data.filter((d) => !d.hidden).length}
                index={index + 1}
                data={exemplerData}
                openkeyboard={(bool) => {
                  setStatusKeyboard(bool);
                }}
                changeVisible={(bool) => {
                  setData(
                    data.map((x) => {
                      if (x.id === exemplerData.id) {
                        x.visible = bool;
                      }
                      return x;
                    })
                  );
                }}
                changeData={(dataModel, text) => {
                  //console.log(dataModel, text)
                  //change data in input
                  setData(
                    data.map((x) => {
                      if (x.id === exemplerData.id) {
                        x.data = dataModel;
                        x.text = text;
                      }
                      return x;
                    })
                  );
                }}
                deleteData={(idData) => {
                  //filter and set object without remote object
                  setData(data.filter((x) => idData !== x.id));
                }}
              />
            ))}

          {
            //VARIABLE
            variable
              .filter((d) => d.hidden === false)
              .map((exemplerData) => (
                <Variable
                  key={"Variable" + exemplerData.id}
                  data={exemplerData}
                  onUpdate={(newData) => {
                    //set NEW data
                    setVariable(
                      variable.map((x) => {
                        if (x.id === exemplerData.id) {
                          return newData;
                        }
                        return x;
                      })
                    );
                  }}
                  onChange={(value) => {
                    //update value 
                    setVariable(
                      variable.map((x) => {
                        if (x.id === exemplerData.id) {
                          x.value = value;
                        }
                        return x;
                      })
                    );
                  }}
                  onAnimation={() => {
                    if (exemplerData.anim) {
                      if (exemplerData.anim[2] === false) {
                        //set animation status
                        setVariable(
                          variable.map((x) => {
                            if (x.id === exemplerData.id) {
                              x.anim[2] = true;
                            }
                            return x;
                          })
                        );
                        //Animation
                        Animation(
                          exemplerData.id,
                          exemplerData.anim[0],
                          exemplerData.anim[1]
                        );
                      } else {
                        setVariable(
                          variable.map((x) => {
                            if (x.id === exemplerData.id) {
                              x.anim[2] = false;
                            }
                            return x;
                          })
                        );
                      }
                    }
                  }}
                />
              ))
          }
        </div>
      </div>
    </div>
  );
};

export default App;
