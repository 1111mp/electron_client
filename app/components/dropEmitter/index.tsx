import React, { Component, ComponentClass, Fragment } from 'react';

const styles = require('./styles.scss');

interface Props {
  dropHandler: (content: any) => void;
}

export default class DropEmitter extends Component<Props, any> {
  target: any = null;

  componentDidMount() {
    console.log(this.target);
    // this.target.addEventListener('dragstart', this.handle_start);
    // this.target.addEventListener('drag', this.handle_drag);
    // this.target.addEventListener('dragend', this.handle_end);
    this.target.addEventListener('dragenter', this.handle_enter);
    this.target.addEventListener('dragover', this.handle_over);
    this.target.addEventListener('dragleave', this.handle_leave);
    this.target.addEventListener('drop', this.handle_drop);
  }

  componentWillUnmount() {
    this.target.removeEventListener('dragenter', this.handle_enter);
    this.target.removeEventListener('dragover', this.handle_over);
    this.target.removeEventListener('dragleave', this.handle_leave);
    this.target.removeEventListener('drop', this.handle_drop);
    this.target = null;
  }

  /** 拖拽开始 */
  handle_start = (event: any) => {
    console.log('dragstart-在元素开始被拖动时候触发');
  };

  handle_drag = (event: any) => {
    console.log('drag-在元素被拖动时候反复触发');
  };

  handle_end = (event: any) => {
    console.log('dragend-在拖动操作完成时触发');
  };

  handle_enter = (event: any) => {
    console.log('handle_enter-当元素进入目的地时触发');
    // 阻止浏览器默认行为
    event.preventDefault();
  };

  handle_over = (e: any) => {
    console.log('handle_over-当元素在目的地时触发');
    // 阻止浏览器默认行为
    e.preventDefault();
  };

  handle_leave = (e: any) => {
    console.log('handle_leave-当元素离开目的地时触发');
    // 阻止浏览器默认行为
    e.preventDefault();
  };

  handle_drop = (event: any) => {
    event.preventDefault();
    console.log(event.dataTransfer);
    for (let i = 0; i < event.dataTransfer.files.length; i++) {
      console.log(event.dataTransfer.files[i]);
    }
    for (let i = 0; i < event.dataTransfer.items.length; i++) {
      console.log(event.dataTransfer.items[i]);
    }
    const text = event.dataTransfer.getData('text');

    this.props.dropHandler && this.props.dropHandler(text);
  };

  render() {
    return (
      <div className={styles.container} ref={(ref) => (this.target = ref)}>
        {this.props.children}
      </div>
    );
  }
}

/** 如果要将组件类作为参数（相对于实例），请使用React.ComponentClass
 * https://stackoverflow.com/questions/31815633/what-does-the-error-jsx-element-type-does-not-have-any-construct-or-call
 */
// export default function dropEmitter(
//   WrappedComponent: ComponentClass<IAnyObject>
// ) {
//   return class extends Component {
//     target: any = null;

//     componentDidMount() {
//       console.log(this.target);
//       // this.target.addEventListener('dragstart', this.handle_start);
//       // this.target.addEventListener('drag', this.handle_drag);
//       // this.target.addEventListener('dragend', this.handle_end);
//       this.target.addEventListener('dragenter', this.handle_enter);
//       this.target.addEventListener('dragover', this.handle_over);
//       this.target.addEventListener('dragleave', this.handle_leave);
//       this.target.addEventListener('drop', this.handle_drop);
//     }

//     componentWillUnmount() {
//       this.target.removeEventListener('dragenter', this.handle_enter);
//       this.target.removeEventListener('dragover', this.handle_over);
//       this.target.removeEventListener('dragleave', this.handle_leave);
//       this.target.removeEventListener('drop', this.handle_drop);
//       this.target = null;
//     }

//     /** 拖拽开始 */
//     handle_start = (event: any) => {
//       console.log('dragstart-在元素开始被拖动时候触发');
//     };

//     handle_drag = (event: any) => {
//       console.log('drag-在元素被拖动时候反复触发');
//     };

//     handle_end = (event: any) => {
//       console.log('dragend-在拖动操作完成时触发');
//     };

//     handle_enter = (event: any) => {
//       console.log('handle_enter-当元素进入目的地时触发');
//       // 阻止浏览器默认行为
//       event.preventDefault();
//     };

//     handle_over = (e: any) => {
//       console.log('handle_over-当元素在目的地时触发');
//       // 阻止浏览器默认行为
//       e.preventDefault();
//     };

//     handle_leave = (e: any) => {
//       console.log('handle_leave-当元素离开目的地时触发');
//       // 阻止浏览器默认行为
//       e.preventDefault();
//     };

//     handle_drop = (event: any) => {
//       event.preventDefault();
//       console.log(event.dataTransfer);
//       for (let i = 0; i < event.dataTransfer.files.length; i++) {
//         console.log(event.dataTransfer.files[i]);
//       }
//       for (let i = 0; i < event.dataTransfer.items.length; i++) {
//         console.log(event.dataTransfer.items[i]);
//       }
//       console.log(event.dataTransfer.getData('id'));
//       console.log(event.dataTransfer.getData('text'));
//       console.log(event.dataTransfer.getData('NY'));
//     };

//     render() {
//       return (
//         <div ref={(ref) => (this.target = ref)}>
//           <WrappedComponent {...this.props} />
//         </div>
//       );
//     }
//   };
// }
