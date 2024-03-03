import React, { useState } from "react";
import { MdOutlineSettings } from "react-icons/md";

const Variable = ({ data, onChange, onUpdate, onAnimation }) => {
  const [visibleSettings, setVisibleSettings] = useState(false);

  const dataFormation = (evt) =>
    onChange(evt.target.value / (data.step === Infinity ? 100 : 1));
  const changeVisibility = () => setVisibleSettings(!visibleSettings);
  const updateFromRange = (evt) => {
    data.range[0] = evt.target.value;
    onUpdate(data);
  };
  const updateToRange = (evt) => {
    data.range[1] = evt.target.value;
    onUpdate(data);
  };
  const updateStep = (evt) => {
    data.step = evt.target.value;
    onUpdate(data);
  };

  const Animation = () => onAnimation();
  const animButt = data.anim ? (
    <button className="Animation" title="Анімація" onClick={Animation}></button>
  ) : (
    <></>
  );
  let settings = !visibleSettings ? (
    <></>
  ) : (
    <div className="SettingsVariable">
      <div className="range">
        <input
          type="number"
          inputMode="numeric"
          name="fromRange"
          id="fromRange"
          defaultValue={data.range[0]}
          onInput={updateFromRange}
        />
        ≤{data.name}
        ≤
        <input
          type="number"
          inputMode="numeric"
          name="toRange"
          id="toRange"
          defaultValue={data.range[1]}
          onInput={updateToRange}
        />
      </div>
      <label htmlFor="step">Крок:</label>
      <input
        type="number"
        inputMode="numeric"
        name="step"
        id="step"
        defaultValue={data.step}
        onInput={updateStep}
      />
    </div>
  );

  let settingsButton = data.restricted ? (
    <></>
  ) : (
    <div className="SettingsButton" onClick={changeVisibility}>
      <MdOutlineSettings />
    </div>
  );
  let name = data.name.match(/^x_\d+$/) ? (
    <>
      x<sub>{data.name.slice(2)}</sub>
    </>
  ) : (
    <>{data.name}</>
  );
  return (
    <div className="input Variable" id={"variable" + data.id}>
      {settingsButton}
      {settings}
      {animButt}
      <p className="name">{name}</p>
      <input
        type="range"
        min={data.range[0] * (data.step === Infinity ? 100 : 1)}
        max={data.range[1] * (data.step === Infinity ? 100 : 1)}
        step={data.step}
        value={data.value * (data.step === Infinity ? 100 : 1)}
        onInput={dataFormation}
        key = {"inputVar"+data.id}
      />
      <div className="labels">
        <p className="fromRange">{data.range[0]}</p>
        <p
          className="value"
          style={{
            left:
              15 +
              ((data.value - data.range[0]) / (data.range[1] - data.range[0])) *
                375,
          }}
        >
          {data.value}
        </p>
        <p className="toRange">{data.range[1]}</p>
      </div>
    </div>
  );
};
export default Variable;
