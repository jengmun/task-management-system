import Select from "react-select";
import makeAnimated from "react-select/animated";

const Dropdown = (props) => {
  return (
    <>
      <Select
        value={props.preselected}
        options={props.options}
        components={makeAnimated()}
        closeMenuOnSelect={false}
        isMulti
        onChange={(e) => {
          props.callback(e);
        }}
      />
    </>
  );
};

export default Dropdown;
