import React, { Component } from 'react';
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc'
const SortableItem = SortableElement(({value, items}) => {
    return (
      <div  className="SortableItem" >
        { value }
        <input type="file" />
      </div>
    )
})

const SortableList = SortableContainer(({items}) => {
  return (
    <ul className="SortableList">
      {items.map((value, index) =>
        <SortableItem key={`item-${index}`} index={index} value={value} items={items} />
      )}
    </ul>
  );
});
export default class SortableComponent extends Component{
  state = {
    items: Array.apply(null, Array(100)).map((val, index) => 'Item ' + index)
  }
  onSortEnd({oldIndex, newIndex}) {
    this.setState({
      items: arrayMove(this.state.items, oldIndex, newIndex)
    });
  }
  render() {
    return (
      <SortableList items={this.state.items} onSortEnd={this.onSortEnd.bind(this)} helperClass="SortableHelper" />
    )
  }
}
