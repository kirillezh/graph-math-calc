import React from 'react';

function CheckBox({ label, id, checked,disabled, hidden, ...props }) {

  return (
    <div className={"checkBox" + (disabled | false ? " disabled" : "")} hidden={hidden}>
      <input id={id} type="checkbox" checked={(!disabled | true) && checked} disabled={disabled | false} {...props} />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}

export default CheckBox;

