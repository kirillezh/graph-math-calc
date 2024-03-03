import React from "react";

function SelectBox({ data, event, ...props }) {
  return (
    <select name="samples" className="samples" defaultValue="none" onInput={e => event(e.target.value)}>
        <option value="none"></option>
    {data.map((exemplerData, index) => (
        <option key={"sample"+index} value={"sample"+index}>{exemplerData.name}</option>
    ))}
    </select>
  );
}

export default SelectBox;
