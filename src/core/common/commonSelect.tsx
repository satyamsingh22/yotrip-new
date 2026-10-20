import React from 'react';
import { Select } from 'antd';

export interface OptionType {
  label: string;
  value: string | number;
}

interface CustomDropdownProps {
  options: OptionType[];
  value?: any;
  onChange?: (value: any) => void;
  defaultValue?: OptionType; // Change to expect an object
  className?: string;
  placeholder?: string;
  modal?: boolean;
  searchable?: boolean;
}

const CustomSelect: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange, 
  defaultValue,
  className,
  placeholder,
  modal,
  searchable = false,
}) => {
  // Determine the popup container based on the `modal` prop
  const getPopupContainer = modal
    ? () =>
        (document.getElementsByClassName('modal')[0] as HTMLElement) ||
        document.body
    : undefined;

  return (
    <Select
      defaultValue={defaultValue} // Pass the object directly
      className={className}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{ width: '100%' }}
      getPopupContainer={getPopupContainer}
      labelInValue // Required for handling objects in `defaultValue` and `onChange`
      showSearch={searchable}
      optionFilterProp="label"
      filterOption={
        searchable
          ? (input, option) =>
              String(option?.label ?? "")
                .toLowerCase()
                .includes(input.toLowerCase())
          : undefined
      }
      options={options}
    />
  );
};

export default CustomSelect;
