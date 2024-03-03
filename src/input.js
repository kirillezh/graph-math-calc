import React, { useEffect, useRef } from "react";
import { MdClose } from "react-icons/md";

import "mathlive";
import { ComputeEngine } from "@cortex-js/compute-engine";

const MagicInput = ({ data, l, changeData, deleteData, openkeyboard, index, changeVisible }) => {
  const mf = useRef();

  useEffect(() => {
    //KEYBOARD
    mf.current.value = data.text;
    mf.current.addEventListener("focusin", () => {
      window.mathVirtualKeyboard.layouts = {
        rows: [
          [
            "+",
            "-",
            "\\times",
            "\\frac{#@}{#?}",
            "=",
            ".",
            "(",
            ")",
            "\\sqrt{#0}",
            "#@^{#?}",
          ],
          ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
        ],
      };
      window.mathVirtualKeyboard.visible = true;
      openkeyboard(true);
    });
    mf.current.addEventListener("focusout", () => {
      window.mathVirtualKeyboard.visible = false;
      openkeyboard(false);
    });
  }, [data.text, openkeyboard]);

  //format and sent new value
  const dataFormation = (evt) => {
    const regex = /f\^\{\\prime\}\\left\(([^]*)\\right\)/;

    const match = regex.exec(evt.target.value);

    const ce = new ComputeEngine();
    let d = ce.parse(evt.target.value).json;

    if (match) {
      const transformedExpression = `\\left(f\\left(${match[1]}\\right)\\right)^{\\prime}`;
      d = ce.parse(evt.target.value.replace(regex, transformedExpression)).json;
    }
    
    changeData(d, evt.target.value);
  };

  //delete input
  const deleteFormation = () => {
    deleteData(data.id);
  };
  //change visible of function
  const changeVisibility = () =>{
    changeVisible(!data.visible);
  }
  
  return (
    <div className="input" id={index}>
      <div
        className={"colorPic" + (!data.visible ? " hidden" : "")}
        style={
          data.visible
            ? { backgroundColor: "#" + data.color }
            : { borderColor: "#" + data.color }
        }
        onClick={changeVisibility}
      ></div>
      <div
        hidden={!data.directive}
        className={"colorPic directive" + (!data.visible ? " hidden" : "")}
        style={{ backgroundColor: "#" + data.directiveColor }}
        onClick={changeVisibility}
      ></div>
      <button
        hidden={l === 1 ? true : false}
        className="closeInput"
        onClick={deleteFormation}
      >
        <MdClose />
      </button>
      <p className="itterator">{index}</p>
      <math-field
        ref={mf}
        onInput={dataFormation}
        id={"l" + data.id}
      ></math-field>
    </div>
  );
};

export default MagicInput