import Select from "react-select";
import makeAnimated from "react-select/animated";

const Dropdown = (props) => {
  return (
    <>
      <Select
        value={props.preselected}
        options={props.options}
        components={makeAnimated()}
        closeMenuOnSelect={props.closeMenuOnSelect}
        isMulti={props.multi}
        onChange={(e) => {
          props.callback(e);
        }}
        MenuProps={{ sx: { ".MuiList-root": { backgroundColor: "white" } } }}
      />
    </>
  );
};

export default Dropdown;
