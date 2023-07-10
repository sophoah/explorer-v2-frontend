import { Box, BoxProps, TextInput } from "grommet";
import { CaretDownFill, CaretUpFill, Search } from "grommet-icons";
import React, { Fragment } from "react";
import styled, { css } from "styled-components";

export interface IDropdownProps<T = {}> {
  defaultValue?: T;
  value?: T;
  className?: string;
  padDataList?: BoxProps["pad"];
  keyField: keyof T;
  renderValue: (dataItem: T) => JSX.Element;
  renderItem: (dataItem: T) => JSX.Element;
  items: T[];
  isOpen?: boolean;
  searchable?: boolean | ((dataItem: T, searchText: string) => boolean);
  group?: {
    groupBy: keyof T;
    renderGroupItem: () => JSX.Element;
  }[];
  onToggle?: (isOpen: boolean) => void;
  onClickItem?: (dataItem: T) => void;
  themeMode: "dark" | "light";
  itemHeight?: string;
  itemStyles: React.CSSProperties;
}

const DropdownWrapper = styled(Box)`
  width: 100%;
  height: 37px;
  padding: 5px;
  border-radius: 8px;
  margin: 5px;
  position: relative;
`;

const Value = styled(Box)`
  width: 100%;
`;

const DataList = styled(Box)`
  position: absolute;
  max-height: 300px;
  overflow: auto;
  width: 100%;
  top: 38px;
  border-radius: 8px;
  left: 0px;
  z-index: 1;
`;

const DataItem = styled(Box)<{
  itemHeight?: string;
}>`

  ${(props) => {
    return css`
      min-height: ${props.itemHeight || 'unset'};
    `;
  }}
`;

export class Dropdown<T = {}> extends React.Component<
  IDropdownProps<T>,
  { isOpen: boolean; searchText: string }
> {
  public element: React.RefObject<HTMLDivElement>;

  public initValue: T = this.props.defaultValue || this.props.items[0];

  private get selectedValue() {
    return this.props.value || this.initValue;
  }

  public state = {
    isOpen: this.props.isOpen || false,
    searchText: "",
  };

  constructor(props: any) {
    super(props);

    this.element = React.createRef();
  }

  componentDidMount() {
    document.body.addEventListener("click", this.handleClickBody as any);
  }

  componentWillUnmount() {
    document.body.removeEventListener("click", this.handleClickBody as any);
  }

  setOpened = (isOpen: boolean) => {
    this.setState({ ...this.state, isOpen });
    if (this.props.onToggle) {
      this.props.onToggle(isOpen)
    }
  }

  handleClickBody = (e: React.MouseEvent<HTMLElement>) => {
    if (!(this.element && this.element.current && this.element.current.contains(e.target as Node))) {
      this.setOpened(false)
    }
  };

  onClickItem = (item: T, evt: React.MouseEvent<HTMLDivElement>) => {
    this.initValue = item;

    if (this.props.onClickItem) {
      this.props.onClickItem(item);
    }

    // this.setOpened(false)
  };

  renderGroupItems() {
    const {
      group = [],
      searchable,
      // itemHeight = "47px",
      itemStyles = {},
    } = this.props;

    return group.map((groupItem) => {
      const items = this.props.items
        .filter((item) => item[groupItem.groupBy])
        .filter((item) =>
          searchable
            ? typeof searchable === "function"
              ? searchable(item, this.state.searchText)
              : true // TODO hardcode
            : true
        );

      return items.length ? (
        <Fragment key={String(groupItem.groupBy)}>
          <Fragment>{groupItem.renderGroupItem()}</Fragment>
          {items.map((item, index) => (
            <DataItem
              key={`${item[this.props.keyField] || index}`}
              background={"backgroundDropdownItem"}
              onClick={(evt) => this.onClickItem(item, evt)}
              itemHeight={this.props.itemHeight}
              style={{ ...itemStyles }}
            >
              {this.props.renderItem(item)}
            </DataItem>
          ))}
        </Fragment>
      ) : null;
    });
  }

  render() {
    const {
      group = [],
      searchable,
      themeMode,
      // itemHeight = "47px",
      itemStyles = {},
      padDataList = "small",
    } = this.props;

    return (
      <DropdownWrapper
        className={this.props.className}
        ref={this.element}
        border={{ size: "xsmall", color: "border" }}
      >
        <Value
          onClick={() => {
            this.setOpened(!this.state.isOpen)
          }}
          direction={"row"}
          flex
        >
          <Box flex>{this.props.renderValue(this.selectedValue)}</Box>
          {this.state.isOpen ? (
            <CaretUpFill
              onClick={(e) => {
                console.log("CLICK");
                e.stopPropagation();
                this.setOpened(false)
              }}
            />
          ) : (
            <CaretDownFill
              onClick={(e) => {
                e.stopPropagation();
                this.setOpened(true)
              }}
            />
          )}
        </Value>
        {this.state.isOpen ? (
          <DataList
            background="background"
            border={{ size: "xsmall", color: "border" }}
            pad={padDataList}
          >
            {searchable ? (
              <TextInput
                value={this.state.searchText}
                onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
                  this.setState({
                    ...this.state,
                    searchText: evt.currentTarget.value,
                  });
                }}
                color="red"
                icon={<Search color="brand" />}
                style={{
                  backgroundColor:
                    themeMode === "light" ? "white" : "transparent",
                  fontWeight: 500,
                }}
                placeholder="Search by symbol, token address"
              />
            ) : null}
            {group.length
              ? this.renderGroupItems()
              : this.props.items.map((item, index) => (
                  <DataItem
                    key={`${item[this.props.keyField] || index}`}
                    onClick={(evt) => this.onClickItem(item, evt)}
                    itemHeight={this.props.itemHeight}
                    style={{ ...itemStyles }}
                  >
                    {this.props.renderItem(item)}
                  </DataItem>
                ))}
          </DataList>
        ) : null}
      </DropdownWrapper>
    );
  }
}
